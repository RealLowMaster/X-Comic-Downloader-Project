function ChangeSizes() {
	const size = window.innerWidth
	comicSlider.style.width = size+'px'
	document.getElementById('c-s-o').style.width = size+'px'
	if (comicSliderCanvas.hasAttribute('o-size')) {
		comicSliderCanvasScrollPanel.style.width = comicSliderCanvas.clientWidth+'px'
		comicSliderCanvasScrollPanel.style.height = comicSliderCanvas.clientHeight+'px'
		sliderImageBorderHighlighter()
	}
}

function test() {
	//sharp('Image/sites/nhentai.png').png({ quality: 100 }).resize(30,30).toFile('Image/sites/nhentai-30x30.png')

	nhentai.getInfoType('tag', 1, (err, result) => {
		console.log(err)
		console.log(result)
	})
}

function AfterDatabaseDoneOnStartup() {
	loading.forward('Set Settings...')
	setLuanchTimeSettings(false)
	loading.forward('Set Sites...')
	SetSite()
	loading.forward('Load Comics...')
	loadComics()
	loading.forward()
	document.getElementById('main').style.display = 'grid'
	loading.hide()
	CheckReleaseNote()
	document.getElementById('ex-p-l-input').value = remote.app.getPath('downloads')
	if (setting.check_update) CheckUpdate()
	if (setting.open_br_startup) openBrowser()
}

function makeSubFolder(sfComicsDoc, sfLength, index) {
	const image = sfComicsDoc[index].i, imageCount = sfComicsDoc[index].c, formats = sfComicsDoc[index].f
	const subFolder = `${dirUL}/${sfComicsDoc[index]._id}${image}`
	if (!fs.existsSync(subFolder)) fs.mkdirSync(subFolder)

	let lastIndex = formats[0][1], thisForamat = formats[0][2], src = '', formatIndex = 0
	for (let i = 0; i < imageCount; i++) {
		if (i <= lastIndex) {
			src = `/${image}-${i}.${thisForamat}`
			if (fs.existsSync(dirUL+src)) {
				fs.renameSync(dirUL+src, subFolder+src)
			}
		} else {
			formatIndex++
			lastIndex = formats[formatIndex][1]
			thisForamat = formats[formatIndex][2]
			src = `/${image}-${i}.${thisForamat}`
			if (fs.existsSync(dirUL+src)) {
				fs.renameSync(dirUL+src, subFolder+src)
			}
		}
	}

	loading.forward(`Making SubFolders (${index + 1}/${sfLength})`)

	if (index + 1 == sfLength) {
		db.index.insert({_id:100}, err => {
			if (err) { error('SaveSubFolderInDatabase->ERR: '+err); return }
			AfterDatabaseDoneOnStartup()
		})
	} else {
		setTimeout(() => {
			makeSubFolder(sfComicsDoc, sfLength, index + 1)
		}, 1)
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loading.show('Getting Setting...', '#fff', '#222')

	ChangeSizes()
	
	GetSettingFile()
	loading.forward('Getting Directories...')
	GetDirection()
	loading.forward('Creating Databases...')
	CreateDatabase()
	loading.forward('Checking Settings...')
	CheckSettings()
	loading.forward('Set Window Event...')

	window.onresize = () => { updateTabSize(); ChangeSizes() }
	tabsContainer.addEventListener('contextmenu', e => {
		e.preventDefault()
		if (copiedTab != null && browserTabMenu.style.display == 'none') {
			browserPasteMenu.style.top = e.clientY+'px'
			browserPasteMenu.style.right = -(e.clientX - window.innerWidth)+'px'
			browserPasteMenu.style.display = 'block'
		}
	})
	window.addEventListener('click', () => {
		browserTabMenu.style.display = 'none'
		browserPasteMenu.style.display = 'none'
	})
	window.addEventListener('keydown', e => {
		if (keydownEventIndex != null) eval(keydownEvents[keydownEventIndex].replace('{ctrl}', e.ctrlKey).replace('{shift}', e.shiftKey).replace('{key}', e.which))
	})

	loading.forward('Indexing...')
	makeDatabaseIndexs()
	loading.forward('Comic Indexing...')

	setTimeout(() => {
		db.index.findOne({_id:1}, (err, doc) => {
			if (err) { error('ComicIndexing: '+err); return }
			if (doc == undefined) lastComicId = 1
			else lastComicId = doc.i || null
			if (lastComicId == null) { error('Comic Indexing Problem.'); return }
			loading.forward('Have Indexing...')
	
			db.index.findOne({_id:11}, (err, haveDoc) => {
				if (err) { error('HaveIndexing: '+err); return }
				if (haveDoc == undefined) lastHaveId = 1
				else lastHaveId = haveDoc.i || null
				if (lastHaveId == null) { error('Have Indexing Problem.'); return }
				loading.forward('Groups Indexing...')
	
				db.index.findOne({_id:6}, (err, groupDoc) => {
					if (err) { error('GroupIndexing: '+err); return }
					if (groupDoc == undefined) lastGroupId = 1
					else lastGroupId = groupDoc.i || null
					if (lastGroupId == null) { error('Group Indexing Problem.'); return }
					loading.forward('Artists Indexing...')
	
					db.index.findOne({_id:2}, (err, artistDoc) => {
						if (err) { error('ArtistIndexing: '+err); return }
						if (artistDoc == undefined) lastArtistId = 1
						else lastArtistId = artistDoc.i || null
						if (lastArtistId == null) { error('Artist Indexing Problem.'); return }
						loading.forward('Parodies Indexing...')
	
						db.index.findOne({_id:8}, (err, parodyDoc) => {
							if (err) { error('ParodyIndexing: '+err); return }
							if (parodyDoc == undefined) lastParodyId = 1
							else lastParodyId = parodyDoc.i || null
							if (lastParodyId == null) { error('Parody Indexing Problem.'); return }
							loading.forward('Tags Indexing...')
	
							db.index.findOne({_id:4}, (err, tagDoc) => {
								if (err) { error('TagIndexing: '+err); return }
								if (tagDoc == undefined) lastTagId = 1
								else lastTagId = tagDoc.i || null
								if (lastTagId == null) { error('Tag Indexing Problem.'); return }
								loading.forward('Character Indexing...')

								db.index.findOne({_id:12}, (err, characterDoc) => {
									if (err) { error('CharacterIndexing: '+err); return }
									if (characterDoc == undefined) lastCharacterId = 1
									else lastCharacterId = characterDoc.i || null
									if (lastCharacterId == null) { error('Character Indexing Problem.'); return }
									loading.forward('Language Indexing...')

									db.index.findOne({_id:13}, (err, languageDoc) => {
										if (err) { error('LanguageIndexing: '+err); return }
										if (languageDoc == undefined) lastLanguageId = 1
										else lastLanguageId = languageDoc.i || null
										if (lastLanguageId == null) { error('Language Indexing Problem.'); return }
										loading.forward('Category Indexing...')

										db.index.findOne({_id:14}, (err, categoryDoc) => {
											if (err) { error('CategoryIndexing: '+err); return }
											if (categoryDoc == undefined) lastCategoryId = 1
											else lastCategoryId = categoryDoc.i || null
											if (lastCategoryId == null) { error('Category Indexing Problem.'); return }
											loading.forward('Check subFolders...')
											
											db.index.findOne({_id:100}, (err, subFolderDoc) => {
												if (err) { error('SubFolderCheckingERR: '+err); return }
												if (subFolderDoc == null) {
													db.comics.find({}, (err, sfComicsDoc) => {
														if (err) { error('SubFolder->ComicLoading->ERR: '+err); return }
														if (sfComicsDoc != null && sfComicsDoc.length != 0) {
															const sfLength = sfComicsDoc.length
															loading.reset(sfLength)
															loading.show(`Making SubFolders (0/${sfLength})`)
															setTimeout(() => { makeSubFolder(sfComicsDoc, sfLength, 0) }, 100)
														} else AfterDatabaseDoneOnStartup()
													})
												} else AfterDatabaseDoneOnStartup()
											})
										})
									})
								})
							})
						})
					})
				})
			})
		})
	}, 200)
})