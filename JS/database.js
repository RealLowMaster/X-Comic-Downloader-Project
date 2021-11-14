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
	let saveId
	if (typeof(id) == 'number') saveId = id
	else saveId = `'${id}'`
	const page = document.getElementById(activeTabComicId)
	page.getElementsByClassName('browser-comic-have')[0].innerHTML = `<button class="remove-from-have" onclick="RemoveFromHave(${site}, ${saveId}, this)">You Have This Comic.</button>`
	changeButtonsToDownloaded(id, site, true, false)
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
			changeButtonsToDownloaded(id, site, true, true)
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

// Add New Character
function UpdateCharacterList(comicId, newList) {
	db.comic_characters.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('CharacterListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_characters.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('CharacterListUpdate: '+err); return }
			})
		} else CreateCharacterList(comicId, newList)
		openComicCharacters(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Characters Has Been Repaired!')
	})
}

function CreateCharacterList(comicId, newList) {
	db.comic_characters.insert({t:newList, _id:comicId}, err => {
		if (err) { error('CharacterList: '+err); return }
	})
}

function AddCharacterToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreateCharacterList(comicId, newList)
	else UpdateCharacterList(comicId, newList)
}

function CreateCharacterInsert(tagName, index, callback) {
	db.characters.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateCharacter(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.characters.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(12)
				AddCharacterToList(comicId, newList, repairing)
			} else CreateCharacter(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastCharacterId++
			CreateCharacterInsert(tagList[tagListIndex], lastCharacterId - 1, (err, newDoc) => {
				if (err) { error('Character: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(12)
					AddCharacterToList(comicId, newList, repairing)
				} else CreateCharacter(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Language
function UpdateLanguageList(comicId, newList) {
	db.comic_languages.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('LanguageListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_languages.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('LanguageListUpdate: '+err); return }
			})
		} else CreateLanguageList(comicId, newList)
		openComicLanguages(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Languages Has Been Repaired!')
	})
}

function CreateLanguageList(comicId, newList) {
	db.comic_languages.insert({t:newList, _id:comicId}, err => {
		if (err) { error('LanguageList: '+err); return }
	})
}

function AddLanguageToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreateLanguageList(comicId, newList)
	else UpdateLanguageList(comicId, newList)
}

function CreateLanguageInsert(tagName, index, callback) {
	db.languages.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateLanguage(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.languages.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(13)
				AddLanguageToList(comicId, newList, repairing)
			} else CreateLanguage(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastLanguageId++
			CreateLanguageInsert(tagList[tagListIndex], lastLanguageId - 1, (err, newDoc) => {
				if (err) { error('Language: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(13)
					AddLanguageToList(comicId, newList, repairing)
				} else CreateLanguage(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Category
function UpdateCategoryList(comicId, newList) {
	db.comic_categories.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('CategoryListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_categories.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('CategoryListUpdate: '+err); return }
			})
		} else CreateCategoryList(comicId, newList)
		openComicCategories(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Categories Has Been Repaired!')
	})
}

function CreateCategoryList(comicId, newList) {
	db.comic_categories.insert({t:newList, _id:comicId}, err => {
		if (err) { error('CategoryList: '+err); return }
	})
}

function AddCategoryToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreateCategoryList(comicId, newList)
	else UpdateCategoryList(comicId, newList)
}

function CreateCategoryInsert(tagName, index, callback) {
	db.categories.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateCategory(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.categories.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(14)
				AddCategoryToList(comicId, newList, repairing)
			} else CreateCategory(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastCategoryId++
			CreateCategoryInsert(tagList[tagListIndex], lastCategoryId - 1, (err, newDoc) => {
				if (err) { error('Category: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(14)
					AddCategoryToList(comicId, newList, repairing)
				} else CreateCategory(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
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
async function CreateComic(comicIndex, haveIndex, gottenResult, image, siteIndex, comic_id, imagesCount, formats, index, isDownloading) {
	if (typeof(index) != 'number') index = null
	isDownloading = isDownloading || false
	const insertInfo = {}

	insertInfo.n = gottenResult.title.toLowerCase()
	insertInfo.i = image
	insertInfo.c = imagesCount
	insertInfo.f = formats
	insertInfo.s = siteIndex
	insertInfo.p = comic_id
	insertInfo._id = comicIndex
	await db.comics.insert(insertInfo, (err, doc) => {
		if (err) { error(err); return }
		fix_index(1)
		const id = doc._id
		const characters = gottenResult.characters || null
		const languages = gottenResult.languages || null
		const categories = gottenResult.categories || null
		const groups = gottenResult.groups || null
		const artists = gottenResult.artists || null
		const parody = gottenResult.parody || null
		const tags = gottenResult.tags || null

		// Add Comic To Have
		CreateHave(doc.s, doc.p, haveIndex, true)

		// Creating Infos
		if (characters != null) CreateCharacter(characters, id)
		if (languages != null) CreateLanguage(languages, id)
		if (categories != null) CreateCategory(categories, id)
		if (groups != null) CreateGroup(groups, id)
		if (artists != null) CreateArtist(artists, id)
		if (parody != null) CreateParody(parody, id)
		if (tags != null) CreateTag(tags, id)

		makeThumbForDownloadingComic(doc.i, doc.f[0][2], doc._id, () => {
			if (isDownloading == true && index != null) {
				var shortName = gottenResult.title
				if (shortName.length > 26) shortName = shortName.substr(0, 23)+'...'
				PopAlert(`Comic (${shortName}) Downloaded.`)
				if (setting.notification_download_finish && remote.Notification.isSupported()) new remote.Notification({title: 'Comic Download Finished.', body: gottenResult.title}).show()
				document.getElementById(downloadingList[index][2]).remove()
				downloadingList[index] = null
				changeButtonsToDownloaded(doc.p, doc.s, false, false)
				downloadCounter--
				SetDownloadListNumbers()
				if (downloadCounter == 0) {
					downloadingList = []
					document.getElementById('downloader').style.display = 'none'
				}
			}
			if (afterDLReload == true) reloadLoadingComics()
		})
	})
}

// Collections
function CreateCollection() {}

function DeleteCollection() {}