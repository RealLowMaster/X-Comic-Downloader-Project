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

function CreateCharacterList(comicId, newList) {
	db.comic_characters.insert({t:newList, _id:comicId}, err => {
		if (err) { error('CharacterList: '+err); return }
	})
}

function AddCharacterToList(comicId, newList, repairing, changed) {
	repairing = repairing || false
	if (changed) jsonfile.writeFileSync(dirDB+'/characters.lowdb',{a:charactersDB})
	if (repairing == false) CreateCharacterList(comicId, newList)
	else UpdateCharacterList(comicId, newList)
}

function CreateCharacter(tagList, comicId, tagListIndex, repairing, newList, changed) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	changed = changed || false
	const index = charactersDB.indexOf(tagList[tagListIndex].toLowerCase())
	if (index > -1) {
		newList.push(index)
		if (tagListIndex == tagList.length - 1) AddCharacterToList(comicId, newList, repairing, changed)
		else CreateCharacter(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	} else {
		const newIndex = charactersDB.length
		charactersDB[newIndex] = tagList[tagListIndex].toLowerCase()
		newList.push(newIndex)
		changed = true
		if (tagListIndex == tagList.length - 1) AddCharacterToList(comicId, newList, repairing, changed)
		else CreateCharacter(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	}
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

function CreateLanguageList(comicId, newList) {
	db.comic_languages.insert({t:newList, _id:comicId}, err => {
		if (err) { error('LanguageList: '+err); return }
	})
}

function AddLanguageToList(comicId, newList, repairing, changed) {
	repairing = repairing || false
	if (changed) jsonfile.writeFileSync(dirDB+'/languages.lowdb',{a:languagesDB})
	if (repairing == false) CreateLanguageList(comicId, newList)
	else UpdateLanguageList(comicId, newList)
}

function CreateLanguage(tagList, comicId, tagListIndex, repairing, newList, changed) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	changed = changed || false
	const index = languagesDB.indexOf(tagList[tagListIndex].toLowerCase())
	if (index > -1) {
		newList.push(index)
		if (tagListIndex == tagList.length - 1) AddLanguageToList(comicId, newList, repairing, changed)
		else CreateLanguage(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	} else {
		const newIndex = languagesDB.length
		languagesDB[newIndex] = tagList[tagListIndex].toLowerCase()
		newList.push(newIndex)
		changed = true
		if (tagListIndex == tagList.length - 1) AddLanguageToList(comicId, newList, repairing, changed)
		else CreateLanguage(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	}
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

function CreateCategoryList(comicId, newList) {
	db.comic_categories.insert({t:newList, _id:comicId}, err => {
		if (err) { error('CategoryList: '+err); return }
	})
}

function AddCategoryToList(comicId, newList, repairing, changed) {
	repairing = repairing || false
	if (changed) jsonfile.writeFileSync(dirDB+'/categories.lowdb',{a:categoriesDB})
	if (repairing == false) CreateCategoryList(comicId, newList)
	else UpdateCategoryList(comicId, newList)
}

function CreateCategory(tagList, comicId, tagListIndex, repairing, newList, changed) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	changed = changed || false
	const index = categoriesDB.indexOf(tagList[tagListIndex].toLowerCase())
	if (index > -1) {
		newList.push(index)
		if (tagListIndex == tagList.length - 1) AddCategoryToList(comicId, newList, repairing, changed)
		else CreateCategory(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	} else {
		const newIndex = categoriesDB.length
		categoriesDB[newIndex] = tagList[tagListIndex].toLowerCase()
		newList.push(newIndex)
		changed = true
		if (tagListIndex == tagList.length - 1) AddCategoryToList(comicId, newList, repairing, changed)
		else CreateCategory(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	}
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

function CreatGroupList(comicId, newList) {
	db.comic_groups.insert({t:newList, _id:comicId}, err => {
		if (err) { error('GroupList: '+err); return }
	})
}

function AddGroupToList(comicId, newList, repairing, changed) {
	repairing = repairing || false
	if (changed) jsonfile.writeFileSync(dirDB+'/groups.lowdb',{a:groupsDB})
	if (repairing == false) CreatGroupList(comicId, newList)
	else UpdateGroupList(comicId, newList)
}

function CreateGroup(tagList, comicId, tagListIndex, repairing, newList, changed) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	changed = changed || false
	const index = groupsDB.indexOf(tagList[tagListIndex].toLowerCase())
	if (index > -1) {
		newList.push(index)
		if (tagListIndex == tagList.length - 1) AddGroupToList(comicId, newList, repairing, changed)
		else CreateGroup(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	} else {
		const newIndex = groupsDB.length
		groupsDB[newIndex] = tagList[tagListIndex].toLowerCase()
		newList.push(newIndex)
		changed = true
		if (tagListIndex == tagList.length - 1) AddGroupToList(comicId, newList, repairing, changed)
		else CreateGroup(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	}
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

function CreatArtistList(comicId, newList) {
	db.comic_artists.insert({t:newList, _id:comicId}, err => {
		if (err) { error('ArtistList: '+err); return }
	})
}

function AddArtistToList(comicId, newList, repairing, changed) {
	repairing = repairing || false
	if (changed) jsonfile.writeFileSync(dirDB+'/artists.lowdb',{a:artistsDB})
	if (repairing == false) CreatArtistList(comicId, newList)
	else UpdateArtistList(comicId, newList)
}

function CreateArtist(tagList, comicId, tagListIndex, repairing, newList, changed) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	changed = changed || false
	const index = artistsDB.indexOf(tagList[tagListIndex].toLowerCase())
	if (index > -1) {
		newList.push(index)
		if (tagListIndex == tagList.length - 1) AddArtistToList(comicId, newList, repairing, changed)
		else CreateArtist(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	} else {
		const newIndex = artistsDB.length
		artistsDB[newIndex] = tagList[tagListIndex].toLowerCase()
		newList.push(newIndex)
		changed = true
		if (tagListIndex == tagList.length - 1) AddArtistToList(comicId, newList, repairing, changed)
		else CreateArtist(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	}
			
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

function CreatParodyList(comicId, newList) {
	db.comic_parodies.insert({t:newList, _id:comicId}, err => {
		if (err) { error('ParodyList: '+err); return }
	})
}

function AddParodyToList(comicId, newList, repairing, changed) {
	repairing = repairing || false
	if (changed) jsonfile.writeFileSync(dirDB+'/parodies.lowdb',{a:parodiesDB})
	if (repairing == false) CreatParodyList(comicId, newList)
	else UpdateParodyList(comicId, newList)
}

function CreateParody(tagList, comicId, tagListIndex, repairing, newList, changed) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	changed = changed || false
	const index = parodiesDB.indexOf(tagList[tagListIndex].toLowerCase())
	if (index > -1) {
		newList.push(index)
		if (tagListIndex == tagList.length - 1) AddParodyToList(comicId, newList, repairing, changed)
		else CreateParody(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	} else {
		const newIndex = parodiesDB.length
		parodiesDB[newIndex] = tagList[tagListIndex].toLowerCase()
		newList.push(newIndex)
		changed = true
		if (tagListIndex == tagList.length - 1) AddParodyToList(comicId, newList, repairing, changed)
		else CreateParody(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	}
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

function CreatTagList(comicId, newList) {
	db.comic_tags.insert({t:newList, _id:comicId}, err => {
		if (err) { error('TagList: '+err); return }
	})
}

function AddTagToList(comicId, newList, repairing, changed) {
	repairing = repairing || false
	if (changed) jsonfile.writeFileSync(dirDB+'/tags.lowdb',{a:tagsDB})
	if (repairing == false) CreatTagList(comicId, newList)
	else UpdateTagList(comicId, newList)
}

function CreateTag(tagList, comicId, tagListIndex, repairing, newList, changed) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	changed = changed || false
	const index = tagsDB.indexOf(tagList[tagListIndex].toLowerCase())
	if (index > -1) {
		newList.push(index)
		if (tagListIndex == tagList.length - 1) AddTagToList(comicId, newList, repairing, changed)
		else CreateTag(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	} else {
		const newIndex = tagsDB.length
		tagsDB[newIndex] = tagList[tagListIndex].toLowerCase()
		newList.push(newIndex)
		changed = true
		if (tagListIndex == tagList.length - 1) AddTagToList(comicId, newList, repairing, changed)
		else CreateTag(tagList, comicId, tagListIndex + 1, repairing, newList, changed)
	}
}

// Add New Comic
function CreateComic(comicIndex, haveIndex, gottenResult, image, siteIndex, comic_id, imagesCount, formats) {
	const insertInfo = {}

	insertInfo.n = gottenResult.title.toLowerCase()
	insertInfo.i = image
	insertInfo.c = imagesCount
	insertInfo.f = formats
	insertInfo.s = siteIndex
	insertInfo.p = comic_id
	insertInfo._id = comicIndex
	db.comics.insert(insertInfo, (err, doc) => {
		if (err) { error(err); return }
		FixIndex(0, false)
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
			let shortName = gottenResult.title
			if (shortName.length > 26) shortName = shortName.substr(0, 23)+'...'
			PopAlert(`Comic (${shortName}) Downloaded.`)
			if (setting.notification_download_finish && remote.Notification.isSupported()) new remote.Notification({title: 'Comic Download Finished.', body: gottenResult.title}).show()
			changeButtonsToDownloaded(doc.p, doc.s, false, false)
			if (afterDLReload == true) reloadLoadingComics()
		})
	})
}