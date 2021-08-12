// Add Comic To Have
async function CreateHaveInsert(site, id, index, downloaded) {
	downloaded = downloaded || false
	const insertInfo = {}
	insertInfo.s = site
	insertInfo.i = id
	if (downloaded == true) insertInfo.d = 0
	insertInfo._id = index
	await db.have.insert(insertInfo, err => {
		if (err) { error(err); return }
		fix_index(11)
	})
}

async function CreateHave(site, id, index, downloaded) {
	index = index || null
	downloaded = downloaded || false

	if (index != null) {
		CreateHaveInsert(site, id, index, downloaded)
	} else {
		await db.index.findOne({_id:11}, (err, doc) => {
			if (err) { error(err); return }
			const haveIndex = doc.i
			CreateHaveInsert(site, id, haveIndex, downloaded)
		})
	}
}

function AddToHave(site, id) {
	CreateHave(site, id, lastHaveId, false)
	lastHaveId++
	const page = document.getElementById(activeTabComicId)
	page.getElementsByClassName('browser-comic-have')[0].innerHTML = `<button class="remove-from-have" onclick="RemoveFromHave(0, '${id}', this)">You Have This Comic.</button>`
	changeButtonsToDownloaded(id, true, false)
	PopAlert('Comic Added To Have List.')
}

function RemoveFromHave(site, id, who) {
	who = who || null
	db.have.remove({s:site, i:id}, {}, (err, num) => {
		if (err) { error(err); return }
		if (num == 1) {
			if (who != null) {
				const parent = who.parentElement
				parent.innerHTML = `<button onclick="xlecxDownloader('${id}')">Download</button><button class="add-to-have" onclick="AddToHave(${site}, '${id}')">Add To Have</button>`
			}
			changeButtonsToDownloaded(id, true, true)
			PopAlert('Comic Removed From Have List.')
		}
	})
}

// Check That We Have Comic Or Not
function IsHavingComic(site, id, callback) {
	db.have.findOne({s:site, i:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc == null)
			callback(false, false)
		else {
			if (doc.d != null && doc.d == 0)
				callback(true, true)
			else
				callback(true, false)
		}
	})
}

// Add New Groups
function UpdateGroupList(comicId, newList) {
	db.comic_groups.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('GroupListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_groups.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('GroupListUpdate: '+err); return }
			})
		} else CreatGroupList(comicId, newList)
		openComicGroups(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Groups Has Been Repaired!')
	})
}

function CreatGroupList(comicId, newList) {
	db.comic_groups.insert({t:newList, _id:comicId}, err => {
		if (err) { error('GroupList: '+err); return }
	})
}

function AddGroupToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatGroupList(comicId, newList)
	else UpdateGroupList(comicId, newList)
}

function CreateGroupInsert(tagName, index, callback) {
	db.groups.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateGroup(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.groups.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(6)
				AddGroupToList(comicId, newList, repairing)
			} else CreateGroup(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastGroupId++
			CreateGroupInsert(tagList[tagListIndex], lastGroupId - 1, (err, newDoc) => {
				if (err) { error('Group: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(6)
					AddGroupToList(comicId, newList, repairing)
				} else CreateGroup(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Artist
function UpdateArtistList(comicId, newList) {
	db.comic_artists.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('ArtistListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_artists.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('ArtistListUpdate: '+err); return }
			})
		} else CreatArtistList(comicId, newList)
		openComicArtists(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Artists Has Been Repaired!')
	})
}

function CreatArtistList(comicId, newList) {
	db.comic_artists.insert({t:newList, _id:comicId}, err => {
		if (err) { error('ArtistList: '+err); return }
	})
}

function AddArtistToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatArtistList(comicId, newList)
	else UpdateArtistList(comicId, newList)
}

function CreateArtistInsert(tagName, index, callback) {
	db.artists.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateArtist(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.artists.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(2)
				AddArtistToList(comicId, newList, repairing)
			} else CreateArtist(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastArtistId++
			CreateArtistInsert(tagList[tagListIndex], lastArtistId - 1, (err, newDoc) => {
				if (err) { error('Artist: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(2)
					AddArtistToList(comicId, newList, repairing)
				} else CreateArtist(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Parody
function UpdateParodyList(comicId, newList) {
	db.comic_parodies.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('ParodyListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_parodies.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('ParodyListUpdate: '+err); return }
			})
		} else CreatParodyList(comicId, newList)
		openComicParodies(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Parodies Has Been Repaired!')
	})
}

function CreatParodyList(comicId, newList) {
	db.comic_parodies.insert({t:newList, _id:comicId}, err => {
		if (err) { error('ParodyList: '+err); return }
	})
}

function AddParodyToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatParodyList(comicId, newList)
	else UpdateParodyList(comicId, newList)
}

function CreateParodyInsert(tagName, index, callback) {
	db.parodies.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateParody(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.parodies.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(8)
				AddParodyToList(comicId, newList, repairing)
			} else CreateParody(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastParodyId++
			CreateParodyInsert(tagList[tagListIndex], lastParodyId - 1, (err, newDoc) => {
				if (err) { error('Parody: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(8)
					AddParodyToList(comicId, newList, repairing)
				} else CreateParody(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Tag
function UpdateTagList(comicId, newList) {
	db.comic_tags.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('TagListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_tags.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('TagListUpdate: '+err); return }
			})
		} else CreatTagList(comicId, newList)
		openComicTags(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Tags Has Been Repaired!')
	})
}

function CreatTagList(comicId, newList) {
	db.comic_tags.insert({t:newList, _id:comicId}, err => {
		if (err) { error('TagList: '+err); return }
	})
}

function AddTagToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatTagList(comicId, newList)
	else UpdateTagList(comicId, newList)
}

function CreateTagInsert(tagName, index, callback) {
	db.tags.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateTag(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.tags.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(4)
				AddTagToList(comicId, newList, repairing)
			} else CreateTag(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastTagId++
			CreateTagInsert(tagList[tagListIndex], lastTagId - 1, (err, newDoc) => {
				if (err) { error('Tag: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(4)
					AddTagToList(comicId, newList, repairing)
				} else CreateTag(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Comic
async function CreateComic(comicIndex, haveIndex, gottenResult, quality, image, siteIndex, comic_id, imagesCount, formats, repair, repairURLs, index, isDownloading) {
	if (typeof(index) != 'number') index = null
	isDownloading = isDownloading || false
	const insertInfo = {}

	insertInfo.n = gottenResult.title.toLowerCase()
	insertInfo.i = image
	insertInfo.c = imagesCount
	insertInfo.f = formats
	if (repair != null && repair.length > 0) insertInfo.m = repair
	if (repairURLs != null && repairURLs.length > 0) insertInfo.r = repairURLs
	insertInfo.q = quality
	insertInfo.s = siteIndex
	insertInfo.p = comic_id
	insertInfo._id = comicIndex
	await db.comics.insert(insertInfo, (err, doc) => {
		if (err) { error(err); return }
		fix_index(1)
		const id = doc._id
		const groups = gottenResult.groups || null
		const artists = gottenResult.artists || null
		const parody = gottenResult.parody || null
		const tags = gottenResult.tags || null

		// Add Comic To Have
		CreateHave(doc.s, doc.p, haveIndex, true)

		// Groups
		if (groups != null) {
			const groupsList = []
			for (var i in groups) {
				groupsList.push(groups[i].name)
			}
			CreateGroup(groupsList, id)
		}

		// Artists
		if (artists != null) {
			const artistsList = []
			for (var i in artists) {
				artistsList.push(artists[i].name)
			}
			CreateArtist(artistsList, id)
		}

		// Parody
		if (parody != null) {
			const parodyList = []
			for (var i in parody) {
				parodyList.push(parody[i].name)
			}
			CreateParody(parodyList, id)
		}

		// Tags
		if (tags != null) {
			const tagsList = []
			for (var i in tags) {
				tagsList.push(tags[i].name)
			}
			CreateTag(tagsList, id)
		}

		if (isDownloading == true && index != null) {
			var shortName = gottenResult.title
			if (shortName.length > 26) shortName = shortName.substr(0, 23)+'...'
			PopAlert(`Comic (${shortName}) Downloaded.`)
			if (setting.notification_download_finish == true && remote.Notification.isSupported()) new remote.Notification({title: 'Comic Download Finished.', body: gottenResult.title}).show()
			document.getElementById(downloadingList[index][2]).remove()
			downloadingList[index] = null
			changeButtonsToDownloaded(doc.p, false, false)
			downloadCounter--
			SetDownloadListNumbers()
			if (downloadCounter == 0) {
				downloadingList = []
				document.getElementById('downloader').style.display = 'none'
			}
		}
		if (needReload == true) reloadLoadingComics()
	})
}

// Delete a Comic
function deleteComic(id) {
	comicDeleting = true
	const errors = document.getElementsByClassName('error')
	for (let i = 0; i < errors.length; i++) {
		errors[i].remove()
	}
	document.getElementById('comic-action-panel').style.display='none'
	closeComicPanel()

	loading.reset(0)
	loading.show('Calculating...')

	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { loading.hide(); error(err); return }
		if (doc == undefined) { loading.hide(); error('Comic Not Found.'); return }
		const ImagesId = doc.i
		const ImagesFormats = doc.f
		const ImagesCount = doc.c
		const repair = doc.m || null
		var repairImagesURLs = null
		const site = doc.s
		const post_id = doc.p
		
		loading.reset(8 + ImagesCount)
		loading.show('Removing Comic From Database...')

		if (repair != null && repair.length > 0) repairImagesURLs = doc.r

		const fix_removed_index = () => {
			fix_index(1, true)
			fix_index(11, true)
			loading.forward()
			loading.hide()
			comicDeleting = false
			PopAlert('Comic Deleted.', 'warning')
			reloadLoadingComics()
		}

		const remove_have = () => {
			db.have.remove({s:site, i:post_id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Fix Indexs...')
				fix_removed_index()
			})
		}

		const remove_tags = () => {
			db.comic_tags.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Have From Database...')
				remove_have()
			})
		}

		const remove_parodies = () => {
			db.comic_parodies.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Tags From Database...')
				remove_tags()
			})
		}

		const remove_artists = () => {
			db.comic_artists.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Parodies From Database...')
				remove_parodies()
			})
		}

		const remove_groups = () => {
			db.comic_groups.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Artists From Database...')
				remove_artists()
			})
		}

		const delete_images = () => {
			let formatIndex = 0, thisUrl
			let lastIndex = ImagesFormats[0][1]
			let thisForamat = ImagesFormats[0][2]
			if (repair == null || repair.length == 0) {
				for (let i = 0; i < ImagesCount; i++) {
					if (i <= lastIndex)
						thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
					else {
						formatIndex++
						lastIndex = ImagesFormats[formatIndex][1]
						thisForamat = ImagesFormats[formatIndex][2]
						thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
					}

					fs.unlinkSync(thisUrl)
					loading.forward(`Deleting Comic Images (${i+1}/${ImagesCount})...`)
				}
			} else {
				for (let i = 0; i < ImagesCount; i++) {
					if (repair.indexOf(i) == -1) {
						if (i <= lastIndex)
							thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
						else {
							formatIndex++
							lastIndex = ImagesFormats[formatIndex][1]
							thisForamat = ImagesFormats[formatIndex][2]
							thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
						}

						fs.unlinkSync(thisUrl)
						loading.forward(`Deleting Comic Images (${i+1}/${ImagesCount})...`)
					}
				}
			}
			loading.forward('Removing Comic Groups From Database...')
			remove_groups()
		}

		const remove_comic = () => {
			db.comics.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Deleting Comic Images...')
				delete_images()
			})
		}

		remove_comic()
	})
}

function askForDeletingComic(id) {
	if (comicDeleting) return
	comicDeleting = true
	errorSelector('Are you sure you want To Delete This Comic ?', null, false, [
		[
			"Yes",
			"btn btn-danger m-2",
			`deleteComic(${id})`
		],
		[
			"No",
			"btn btn-primary m-2",
			'comicDeleting = false;this.parentElement.parentElement.remove()'
		]
	])
}