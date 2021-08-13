function ChangeSizes() {
	const size = window.innerWidth
	comicSlider.style.width = size+'px'
	document.getElementById('c-s-o').style.width = size+'px'
	comicSliderCanvasScrollPanel.style.width = comicSliderCanvas.clientWidth+'px'
	comicSliderCanvasScrollPanel.style.height = comicSliderCanvas.clientHeight+'px'
}

function test() {
	let formatList = []
	console.log(formatList)
	formatList.push(['Hello', 'adasd', 'adasd'])
	console.log(formatList)
}

document.addEventListener("DOMContentLoaded", () => {
	loading.show('Geting Setting...', '#fff', '#222')

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

	ThisWindow.addListener('close', e => {
		e.preventDefault()
		if (comicDeleting) return
		if (downloadingList.length > 0) {
			errorSelector('You are Downloading Comics, Are you sure you want To Close Software?', null, false, [
				[
					"Yes",
					"btn btn-primary m-2",
					"cancelAllDownloads(true)"
				],
				[
					"No",
					"btn btn-danger m-2"
				]
			])
		} else {
			ThisWindow.removeAllListeners()
			remote.app.quit()
		}
	})
	loading.forward('Indexing...')
	makeDatabaseIndexs()
	loading.forward('Comic Indexing...')
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
							loading.forward('Set Settings...')

							setLuanchTimeSettings(false)
							loading.forward('Load Comics...')
							loadComics()
							loading.forward()
							document.getElementById('main').style.display = 'grid'
							loading.hide()
							CheckUpdate()
						})
					})
				})
			})
		})
	})
})