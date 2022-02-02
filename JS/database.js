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

	if (index != null) CreateHaveInsert(site, id, index, downloaded)
	else {
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
	const haveIndex = GetHave(site,id)
	if (haveIndex != null) {
		haveDBSite.splice(haveIndex, 1)
		haveDBId.splice(haveIndex, 1)
		haveDBComic.splice(haveIndex, 1)
	}
	try { jsonfile.writeFileSync(dirDB+'/have.lowdb', {s:haveDBSite,i:haveDBId,c:haveDBComic}) } catch(err) { error('SavingHaveDB->'+err); console.log(err) }
	
	if (who != null) who.parentElement.innerHTML = `<button onclick="${id}">Download</button><button class="add-to-have" onclick="AddToHave(${site}, '${id}')">Add To Have</button>`
	changeButtonsToDownloaded(id, site, true, true)
	PopAlert('Comic Removed From Have List.')
}

function GetHave(site, id) {
	for (let i = 0, l = haveDBComic.length; i < l; i++) {
		if (haveDBId[i] == id && haveDBSite[i] == site) return i
	}
	return null
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

// Character
function RepairCharacter(result, comicId) {
	if (result == null || result.length == 0) {
		loading.hide()
		db.comics.update({_id:comicId}, { $set: {h:null} }, {}, err => {
			if (err) console.error(err)
			PopAlert('This Comic has no Character.', 'danger')
			openComicCharacters(comicId)
		})
		return
	}
	loading.text('Listing Characters...')

	const list = []
	for (let i = 0; i < result.length; i++) list.push(result[i].name)
	loading.text('Add Characters To Database...')
	const newInfo = CreateCharacter(list)

	db.comics.update({_id:comicId}, { $set: {h:newInfo} }, {}, err => {
		loading.hide()
		openComicCharacters(comicId)
		if (err) { error('CharactersListUpdate->'+err); return }
		PopAlert('Comic Characters Has Been Repaired!')
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

// Language
function RepairLanguage(result, comicId) {
	if (result == null || result.length == 0) {
		loading.hide()
		db.comics.update({_id:comicId}, { $set: {l:null} }, {}, err => {
			if (err) console.error(err)
			PopAlert('This Comic has no Language.', 'danger')
			openComicLanguages(comicId)
		})
		return
	}
	loading.text('Listing Languages...')

	const list = []
	for (let i = 0; i < result.length; i++) list.push(result[i].name)
	loading.text('Add Languages To Database...')
	const newInfo = CreateLanguage(list)

	db.comics.update({_id:comicId}, { $set: {l:newInfo} }, {}, err => {
		loading.hide()
		openComicLanguages(comicId)
		if (err) { error('LanguagesListUpdate->'+err); return }
		PopAlert('Comic Languages Has Been Repaired!')
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

// Category
function RepairCategory(result, comicId) {
	if (result == null || result.length == 0) {
		loading.hide()
		db.comics.update({_id:comicId}, { $set: {e:null} }, {}, err => {
			if (err) console.error(err)
			PopAlert('This Comic has no Category.', 'danger')
			openComicCategories(comicId)
		})
		return
	}
	loading.text('Listing Categories...')

	const list = []
	for (let i = 0; i < result.length; i++) list.push(result[i].name)
	loading.text('Add Categories To Database...')
	const newInfo = CreateCategory(list)

	db.comics.update({_id:comicId}, { $set: {e:newInfo} }, {}, err => {
		loading.hide()
		openComicCategories(comicId)
		if (err) { error('CategoriesListUpdate->'+err); return }
		PopAlert('Comic Categories Has Been Repaired!')
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

// Groups
function RepairGroup(result, comicId) {
	if (result == null || result.length == 0) {
		loading.hide()
		db.comics.update({_id:comicId}, { $set: {g:null} }, {}, err => {
			if (err) console.error(err)
			PopAlert('This Comic has no Group.', 'danger')
			openComicGroups(comicId)
		})
		return
	}
	loading.text('Listing Groups...')

	const list = []
	for (let i = 0; i < result.length; i++) list.push(result[i].name)
	loading.text('Add Groups To Database...')
	const newInfo = CreateGroup(list)

	db.comics.update({_id:comicId}, { $set: {g:newInfo} }, {}, err => {
		loading.hide()
		openComicGroups(comicId)
		if (err) { error('GroupsListUpdate->'+err); return }
		PopAlert('Comic Groups Has Been Repaired!')
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


// Artists
function RepairArtist(result, comicId) {
	if (result == null || result.length == 0) {
		loading.hide()
		db.comics.update({_id:comicId}, { $set: {a:null} }, {}, err => {
			if (err) console.error(err)
			PopAlert('This Comic has no Artist.', 'danger')
			openComicArtists(comicId)
		})
		return
	}
	loading.text('Listing Artists...')

	const list = []
	for (let i = 0; i < result.length; i++) list.push(result[i].name)
	loading.text('Add Artists To Database...')
	const newInfo = CreateArtist(list)

	db.comics.update({_id:comicId}, { $set: {a:newInfo} }, {}, err => {
		loading.hide()
		openComicArtists(comicId)
		if (err) { error('ArtistsListUpdate->'+err); return }
		PopAlert('Comic Artists Has Been Repaired!')
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

// Parody
function RepairParody(result, comicId) {
	if (result == null || result.length == 0) {
		loading.hide()
		db.comics.update({_id:comicId}, { $set: {d:null} }, {}, err => {
			if (err) console.error(err)
			PopAlert('This Comic has no Parody.', 'danger')
			openComicParodies(comicId)
		})
		return
	}
	loading.text('Listing Parodies...')

	const list = []
	for (let i = 0; i < result.length; i++) list.push(result[i].name)
	loading.text('Add Parodies To Database...')
	const newInfo = CreateParody(list)

	db.comics.update({_id:comicId}, { $set: {d:newInfo} }, {}, err => {
		loading.hide()
		openComicParodies(comicId)
		if (err) { error('ParodiesListUpdate->'+err); return }
		PopAlert('Comic Parodies Has Been Repaired!')
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

// Tag
function RepairTag(result, comicId) {
	if (result == null || result.length == 0) {
		loading.hide()
		db.comics.update({_id:comicId}, { $set: {t:null} }, {}, err => {
			if (err) console.error(err)
			PopAlert('This Comic has no Tag.', 'danger')
			openComicTags(comicId)
		})
		return
	}
	loading.text('Listing Tags...')

	const list = []
	for (let i = 0; i < result.length; i++) list.push(result[i].name)
	loading.text('Add Tags To Database...')
	const newInfo = CreateTag(list)

	db.comics.update({_id:comicId}, { $set: {t:newInfo} }, {}, err => {
		loading.hide()
		openComicTags(comicId)
		if (err) { error('TagsListUpdate->'+err); return }
		PopAlert('Comic Tags Has Been Repaired!')
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

// Comic
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