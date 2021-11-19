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
}

function AfterDatabaseDoneOnStartup() {
	try {
		loading.forward('Set Settings...')
		setLuanchTimeSettings(false)
	} catch(err) {
		error("Startup->SetLuanchSetting->Err: "+err);
	}

	try {
		loading.forward('Set Sites...')
		SetSite()
	} catch(err) {
		error("Startup->SetSites->Err: "+err);
	}

	try {
		loading.forward('Load Comics...')
		loadComics()
	} catch(err) {
		error("Startup->LoadComics->Err: "+err);
	}

	try {
		loading.forward('Load Collections...')
		LoadCollections()
	} catch(err) {
		error("Startup->LoadCollections->Err: "+err);
	}

	try {
		loading.forward()
		document.getElementById('main').style.display = 'grid'
		loading.hide()
	} catch(err) {
		error("Startup->HideLoading->Err: "+err);
	}

	try {
		CheckReleaseNote()
	} catch(err) {
		error("Startup->CheckReleaseNote->Err: "+err);
	}

	try {
		document.getElementById('ex-p-l-input').value = remote.app.getPath('downloads')
	} catch(err) {
		error("Startup->SetExportPath->Err: "+err);
	}

	try {
		if (setting.check_update) CheckUpdate()
	} catch(err) {
		error("Startup->CheckUpdate->Err: "+err);
	}

	try {
		if (setting.open_br_startup) openBrowser()
	} catch(err) {
		error("Startup->OpenBrowser->Err: "+err);
	}
}

function makeSubFolder(sfComicsDoc, sfLength, index) {
	const image = sfComicsDoc[index].i, imageCount = sfComicsDoc[index].c, formats = sfComicsDoc[index].f
	const subFolder = `${dirUL}/${sfComicsDoc[index]._id}${image}`
	if (!fs.existsSync(subFolder)) fs.mkdirSync(subFolder)

	if(typeof formats[0] === "undefined") {
		loading.forward(`Making SubFolders (${index + 1}/${sfLength})`)
		setTimeout(() => {
			makeSubFolder(sfComicsDoc, sfLength, index + 1)
		}, 1)
		return
	}

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
		UpdateIndex(2, true)
		AfterDatabaseDoneOnStartup()
	} else {
		setTimeout(() => {
			makeSubFolder(sfComicsDoc, sfLength, index + 1)
		}, 1)
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loading.show('Getting Setting...', '#fff', '#222')

	try {
		ChangeSizes()
	} catch(err) {
		error("Startup->ChangingSizes->Err: "+err);
	}

	try {
		GetSettingFile()
	} catch(err) {
		error("Startup->GettingSettingFile->Err: "+err);
	}

	try {
		loading.forward('Getting Directories...')
		GetDirection()
	} catch(err) {
		error("Startup->GetDirections->Err: "+err);
	}

	try {
		loading.forward('Creating Databases...')
		CreateDatabase()
	} catch(err) {
		error("Startup->CreateDatabase->Err: "+err);
	}

	try {
		loading.forward('Checking Settings...')
		CheckSettings()
	} catch(err) {
		error("Startup->CheckSettings->Err: "+err);
	}

	try {
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
	} catch(err) {
		error("Startup->SetWindowEvents->Err: "+err);
	}

	try {
		window.addEventListener('click', () => {
			browserTabMenu.style.display = 'none'
			browserPasteMenu.style.display = 'none'
		})
		window.addEventListener('keydown', e => {
			if (keydownEventIndex != null) eval(keydownEvents[keydownEventIndex].replace('{ctrl}', e.ctrlKey).replace('{shift}', e.shiftKey).replace('{key}', e.which))
		})
	} catch(err) {
		error("Startup->SetClickEvents->Err: "+err);
	}

	const IndexLoadCheck = () => {
		if (indexDB.length < 3) { setTimeout(IndexLoadCheck, 250); return }
		for (let i = 0; i < indexDB.length; i++) {
			if (indexDB[i] == undefined) { setTimeout(IndexLoadCheck, 250); return }
		}
		lastComicId = indexDB[0]
		lastHaveId = indexDB[1]

		loading.forward('Checking SubFolder...')
		if (indexDB[2]) AfterDatabaseDoneOnStartup()
		else {
			db.comics.find({}, (err, doc) => {
				if (err) { error('SubFolder->ComicLoading->ERR: '+err); return }
				if (doc == null) {
					UpdateIndex(2, true)
					AfterDatabaseDoneOnStartup()
				} else if (doc.length == 0) {
					UpdateIndex(2, true)
					AfterDatabaseDoneOnStartup()
				} else {
					const sfLength = doc.length
					loading.reset(sfLength)
					loading.show(`Making SubFolders (0/${sfLength})`)
					setTimeout(() => { makeSubFolder(doc, sfLength, 0) }, 100)
				}
			})
		}
	}

	IndexLoadCheck()
})