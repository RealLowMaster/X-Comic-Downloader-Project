// Add Comic To Have
function CreateHaveInsert(site, id, index, downloaded) {
	downloaded = downloaded || false
	const insertInfo = {}
	insertInfo.s = site
	insertInfo.i = id
	if (downloaded == true) insertInfo.d = 0
	insertInfo._id = index
	db.have.insert(insertInfo, err => {
		if (err) { error(err); return }
		FixIndex(1, false)
	})
}

function CreateHave(site, id, index, downloaded) {
	index = index || null
	downloaded = downloaded || false

	if (index != null) {
		CreateHaveInsert(site, id, index, downloaded)
	} else {
		db.index.findOne({_id:11}, (err, doc) => {
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
				parent.innerHTML = `<button onclick="${id}">Download</button><button class="add-to-have" onclick="AddToHave(${site}, '${id}')">Add To Have</button>`
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
		if (err) {
			if (!isRepairing) {
				openComicCharacters(comicId)
				loading.hide()
				error('CharacterListUpdateCheck: '+err)
			}
			return
		}
		if (doc != undefined) {
			db.comic_characters.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) {
					if (!isRepairing) {
						openComicCharacters(comicId)
						loading.hide()
						error('CharacterListUpdate: '+err)
					}
					return
				}
			})
		} else CreateCharacterList(comicId, newList)
		if (!isRepairing) {
			openComicCharacters(comicId)
			loading.forward()
			loading.hide()
			PopAlert('Comic Characters Has Been Repaired!')
		}
	})
}

function CreateCharacter(list) {
	let result = [], save = false
	for (let i = 0; i < list.length; i++) {
		let index = charactersDB.indexOf(list[i].toLowerCase())
		if (index < 0) {
			index = charactersDB.length
			charactersDB[index] = list[i].toLowerCase()
			save = true
		}
		result.push(index)
	}

	if (save) try { jsonfile.writeFileSync(dirDB+'/characters.lowdb',{a:charactersDB}) } catch(err) { console.error(err) }
	return result
}

// Add New Language
function UpdateLanguageList(comicId, newList) {
	db.comic_languages.findOne({_id:comicId}, (err, doc) => {
		if (err) {
			if (!isRepairing) {
				openComicLanguages(comicId)
				loading.hide()
				error('LanguageListUpdateCheck: '+err)
			}
			return
		}
		if (doc != undefined) {
			db.comic_languages.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) {
					if (!isRepairing) {
						openComicLanguages(comicId)
						loading.hide()
						error('LanguageListUpdate: '+err)
					}
					return
				}
			})
		} else CreateLanguageList(comicId, newList)
		if (!isRepairing) {
			openComicLanguages(comicId)
			loading.forward()
			loading.hide()
			PopAlert('Comic Languages Has Been Repaired!')
		}
	})
}

function CreateLanguage(list) {
	let result = [], save = false
	for (let i = 0; i < list.length; i++) {
		let index = languagesDB.indexOf(list[i].toLowerCase())
		if (index < 0) {
			index = languagesDB.length
			languagesDB[index] = list[i].toLowerCase()
			save = true
		}
		result.push(index)
	}

	if (save) try { jsonfile.writeFileSync(dirDB+'/languages.lowdb',{a:languagesDB}) } catch(err) { console.error(err) }
	return result
}

// Add New Category
function UpdateCategoryList(comicId, newList) {
	db.comic_categories.findOne({_id:comicId}, (err, doc) => {
		if (err) {
			if (!isRepairing) {
				openComicCategories(comicId)
				loading.hide()
				error('CategoryListUpdateCheck: '+err)
			}
			return
		}
		if (doc != undefined) {
			db.comic_categories.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) {
					if (!isRepairing) {
						openComicCategories(comicId)
						loading.hide()
						error('CategoryListUpdate: '+err)
					}
					return
				}
			})
		} else CreateCategoryList(comicId, newList)
		if (!isRepairing) {
			openComicCategories(comicId)
			loading.forward()
			loading.hide()
			PopAlert('Comic Categories Has Been Repaired!')
		}
	})
}

function CreateCategory(list) {
	let result = [], save = false
	for (let i = 0; i < list.length; i++) {
		let index = categoriesDB.indexOf(list[i].toLowerCase())
		if (index < 0) {
			index = categoriesDB.length
			categoriesDB[index] = list[i].toLowerCase()
			save = true
		}
		result.push(index)
	}

	if (save) try { jsonfile.writeFileSync(dirDB+'/categories.lowdb',{a:categoriesDB}) } catch(err) { console.error(err) }
	return result
}

// Add New Groups
function UpdateGroupList(comicId, newList) {
	db.comic_groups.findOne({_id:comicId}, (err, doc) => {
		if (err) {
			if (!isRepairing) {
				openComicGroups(comicId)
				loading.hide()
				error('GroupListUpdateCheck: '+err)
			}
			return
		}
		if (doc != undefined) {
			db.comic_groups.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) {
					if (!isRepairing) {
						openComicGroups(comicId)
						loading.hide()
						error('GroupListUpdate: '+err)
					}
					return
				}
			})
		} else CreatGroupList(comicId, newList)
		if (!isRepairing) {
			openComicGroups(comicId)
			loading.forward()
			loading.hide()
			PopAlert('Comic Groups Has Been Repaired!')
		}
	})
}

function CreateGroup(list) {
	let result = [], save = false
	for (let i = 0; i < list.length; i++) {
		let index = groupsDB.indexOf(list[i].toLowerCase())
		if (index < 0) {
			index = groupsDB.length
			groupsDB[index] = list[i].toLowerCase()
			save = true
		}
		result.push(index)
	}

	if (save) try { jsonfile.writeFileSync(dirDB+'/groups.lowdb',{a:groupsDB}) } catch(err) { console.error(err) }
	return result
}

// Add New Artist
function UpdateArtistList(comicId, newList) {
	db.comic_artists.findOne({_id:comicId}, (err, doc) => {
		if (err) {
			if (!isRepairing) {
				openComicArtists(comicId)
				loading.hide()
				error('ArtistListUpdateCheck: '+err)
			}
			return
		}
		if (doc != undefined) {
			db.comic_artists.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) {
					if (!isRepairing) {
						openComicArtists(comicId)
						loading.hide()
						error('ArtistListUpdate: '+err)
					}
					return
				}
			})
		} else CreatArtistList(comicId, newList)
		if (!isRepairing) {
			openComicArtists(comicId)
			loading.forward()
			loading.hide()
			PopAlert('Comic Artists Has Been Repaired!')
		}
	})
}

function CreateArtist(list) {
	let result = [], save = false
	for (let i = 0; i < list.length; i++) {
		let index = artistsDB.indexOf(list[i].toLowerCase())
		if (index < 0) {
			index = artistsDB.length
			artistsDB[index] = list[i].toLowerCase()
			save = true
		}
		result.push(index)
	}

	if (save) try { jsonfile.writeFileSync(dirDB+'/artists.lowdb',{a:artistsDB}) } catch(err) { console.error(err) }
	return result
}

// Add New Parody
function UpdateParodyList(comicId, newList) {
	db.comic_parodies.findOne({_id:comicId}, (err, doc) => {
		if (err) {
			if (!isRepairing) {
				openComicParodies(comicId)
				loading.hide()
				error('ParodyListUpdateCheck: '+err)
			}
			return
		}
		if (doc != undefined) {
			db.comic_parodies.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) {
					if (!isRepairing) {
						openComicParodies(comicId)
						loading.hide()
						error('ParodyListUpdate: '+err)
					}
					return
				}
			})
		} else CreatParodyList(comicId, newList)
		if (!isRepairing) {
			openComicParodies(comicId)
			loading.forward()
			loading.hide()
			PopAlert('Comic Parodies Has Been Repaired!')
		}
	})
}

function CreateParody(list) {
	let result = [], save = false
	for (let i = 0; i < list.length; i++) {
		let index = parodiesDB.indexOf(list[i].toLowerCase())
		if (index < 0) {
			index = parodiesDB.length
			parodiesDB[index] = list[i].toLowerCase()
			save = true
		}
		result.push(index)
	}

	if (save) try { jsonfile.writeFileSync(dirDB+'/parodies.lowdb',{a:parodiesDB}) } catch(err) { console.error(err) }
	return result
}

// Add New Tag
function UpdateTagList(comicId, newList) {
	db.comic_tags.findOne({_id:comicId}, (err, doc) => {
		if (err) {
			if (!isRepairing) {
				openComicTags(comicId)
				loading.hide()
				error('TagListUpdateCheck: '+err)
			}
			return
		}
		if (doc != undefined) {
			db.comic_tags.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) {
					if (!isRepairing) {
						openComicTags(comicId)
						loading.hide()
						error('TagListUpdate: '+err)
					}
					return
				}
			})
		} else CreatTagList(comicId, newList)
		if (!isRepairing) {
			openComicTags(comicId)
			loading.forward()
			loading.hide()
			PopAlert('Comic Tags Has Been Repaired!')
		}
	})
}

function CreateTag(list) {
	let result = [], save = false
	for (let i = 0; i < list.length; i++) {
		let index = tagsDB.indexOf(list[i].toLowerCase())
		if (index < 0) {
			index = tagsDB.length
			tagsDB[index] = list[i].toLowerCase()
			save = true
		}
		result.push(index)
	}

	if (save) try { jsonfile.writeFileSync(dirDB+'/tags.lowdb',{a:tagsDB}) } catch(err) { console.error(err) }
	return result
}

// Add New Comic
function CreateComic(comicIndex, haveIndex, gottenResult, image, siteIndex, comic_id, imagesCount, formats) {
	const groups = gottenResult.groups || null
	const artists = gottenResult.artists || null
	const parody = gottenResult.parody || null
	const tags = gottenResult.tags || null
	const characters = gottenResult.characters || null
	const languages = gottenResult.languages || null
	const categories = gottenResult.categories || null

	const insertInfo = {}
	insertInfo.n = gottenResult.title.toLowerCase()
	insertInfo.i = image
	insertInfo.c = imagesCount
	insertInfo.f = formats
	insertInfo.s = siteIndex
	insertInfo.p = comic_id
	if (groups != null) insertInfo.g = CreateGroup(groups)
	else insertInfo.g = null
	if (artists != null) insertInfo.a = CreateArtist(artists)
	else insertInfo.a = null
	if (parody != null) insertInfo.d = CreateParody(parody)
	else insertInfo.d = null
	if (tags != null) insertInfo.t = CreateTag(tags)
	else insertInfo.t = null
	if (characters != null) insertInfo.h = CreateCharacter(characters)
	else insertInfo.h = null
	if (languages != null) insertInfo.l = CreateLanguage(languages)
	else insertInfo.l = null
	if (categories != null) insertInfo.e = CreateCategory(categories)
	else insertInfo.e = null
	insertInfo._id = comicIndex

	db.comics.insert(insertInfo, (err, doc) => {
		if (err) { error(err); return }
		FixIndex(0, false)

		// Add Comic To Have
		CreateHave(doc.s, doc.p, haveIndex, true)

		makeThumbForDownloadingComic(doc.i, doc.f[0][2], doc._id, () => {
			let shortName = gottenResult.title
			if (shortName.length > 26) shortName = shortName.substr(0, 23)+'...'
			PopAlert(`Comic (${shortName}) Downloaded.`)
			if (setting.notification_download_finish && remote.Notification.isSupported()) new remote.Notification({title: 'Comic Download Finished.', body: gottenResult.title}).show()
			changeButtonsToDownloaded(doc.p, doc.s, false, false)
			if (afterDLReload == true) PageManager.Reload()
		})
	})
}