const comicCharactersContainer = document.getElementById('c-p-c')
const comicLanguagesContainer = document.getElementById('c-p-l')
const comicCategoriesContainer = document.getElementById('c-p-ct')
const comicGroupsContainer = document.getElementById('c-p-g')
const comicArtistsContainer = document.getElementById('c-p-a')
const comicParodyContainer = document.getElementById('c-p-p')
const comicTagsContainer = document.getElementById('c-p-ts')
const comicImageContainer = document.getElementById('c-p-i')
let off_site = null, off_id = null, off_comic_id = null, need_repair = [], in_comic = false, comic_menu_id = null, passKeyEvent = null, export_comic_id = null, comic_panel_menu_info = null, isThumbing = false, isRepairing = false, isRepairingContiue = false, repair_all_list = null, repair_all_error_list = null, closingApp = false, pr_c_folder = null, comic_load_id = null

function onComicClicked(id, thumb, optimize) {
	const e = window.event, key = e.which
	if (key == 2) e.preventDefault()
	else if (key == 1) openComic(id)
	else if (key == 3) {
		comic_menu_id = id
		const menu = document.getElementById('c-c-r-c-p')
		const childs = menu.children
		
		if (thumb) {
			childs[1].removeAttribute('success-btn')
			childs[1].setAttribute('warning-btn', true)
			childs[1].innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path fill="currentColor" d="M448 384H64v-48l71.51-71.52a12 12 0 0 1 17 0L208 320l135.51-135.52a12 12 0 0 1 17 0L448 272z" style="opacity:.4"></path><path fill="currentColor" d="M464 64H48a48 48 0 0 0-48 48v288a48 48 0 0 0 48 48h416a48 48 0 0 0 48-48V112a48 48 0 0 0-48-48zm-352 56a56 56 0 1 1-56 56 56 56 0 0 1 56-56zm336 264H64v-48l71.51-71.52a12 12 0 0 1 17 0L208 320l135.51-135.52a12 12 0 0 1 17 0L448 272z"></path></g></svg> ReMake Thumb'
			childs[1].setAttribute('title', 'ReMake Thumb')
		} else {
			childs[1].removeAttribute('warning-btn')
			childs[1].setAttribute('success-btn', true)
			childs[1].innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path fill="currentColor" d="M448 384H64v-48l71.51-71.52a12 12 0 0 1 17 0L208 320l135.51-135.52a12 12 0 0 1 17 0L448 272z" style="opacity:.4"></path><path fill="currentColor" d="M464 64H48a48 48 0 0 0-48 48v288a48 48 0 0 0 48 48h416a48 48 0 0 0 48-48V112a48 48 0 0 0-48-48zm-352 56a56 56 0 1 1-56 56 56 56 0 0 1 56-56zm336 264H64v-48l71.51-71.52a12 12 0 0 1 17 0L208 320l135.51-135.52a12 12 0 0 1 17 0L448 272z"></path></g></svg> Make Thumb'
			childs[1].setAttribute('title', 'Make Thumb')
		}
		childs[1].setAttribute('onclick', 'makeThumbForAComic(comic_menu_id, 0)')

		if (optimize) {
			childs[2].removeAttribute('success-btn')
			childs[2].setAttribute('warning-btn', true)
			childs[2].innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M305.314,284.578H246.6V383.3h58.711q24.423,0,38.193-13.77t13.77-36.11q0-21.826-14.032-35.335T305.314,284.578ZM149.435,128.7H90.724v98.723h58.711q24.42,0,38.19-13.773t13.77-36.107q0-21.826-14.029-35.338T149.435,128.7ZM366.647,32H81.353A81.445,81.445,0,0,0,0,113.352V398.647A81.445,81.445,0,0,0,81.353,480H366.647A81.445,81.445,0,0,0,448,398.647V113.352A81.445,81.445,0,0,0,366.647,32Zm63.635,366.647a63.706,63.706,0,0,1-63.635,63.635H81.353a63.706,63.706,0,0,1-63.635-63.635V113.352A63.706,63.706,0,0,1,81.353,49.718H366.647a63.706,63.706,0,0,1,63.635,63.634ZM305.314,128.7H246.6v98.723h58.711q24.423,0,38.193-13.773t13.77-36.107q0-21.826-14.032-35.338T305.314,128.7Z"></path></svg> ReOptimize'
			childs[2].setAttribute('title', 'ReOptimize Comic Images')
		} else {
			childs[2].removeAttribute('warning-btn')
			childs[2].setAttribute('success-btn', true)
			childs[2].innerHTML = '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M305.314,284.578H246.6V383.3h58.711q24.423,0,38.193-13.77t13.77-36.11q0-21.826-14.032-35.335T305.314,284.578ZM149.435,128.7H90.724v98.723h58.711q24.42,0,38.19-13.773t13.77-36.107q0-21.826-14.029-35.338T149.435,128.7ZM366.647,32H81.353A81.445,81.445,0,0,0,0,113.352V398.647A81.445,81.445,0,0,0,81.353,480H366.647A81.445,81.445,0,0,0,448,398.647V113.352A81.445,81.445,0,0,0,366.647,32Zm63.635,366.647a63.706,63.706,0,0,1-63.635,63.635H81.353a63.706,63.706,0,0,1-63.635-63.635V113.352A63.706,63.706,0,0,1,81.353,49.718H366.647a63.706,63.706,0,0,1,63.635,63.634ZM305.314,128.7H246.6v98.723h58.711q24.423,0,38.193-13.773t13.77-36.107q0-21.826-14.032-35.338T305.314,128.7Z"></path></svg> Optimize'
			childs[2].setAttribute('title', 'Optimize Comic Images')
		}

		let x = e.clientX, y = e.clientY
		menu.style.display = 'block'
		if (window.innerWidth <= x+170) x = window.innerWidth - 170
		if (window.innerHeight <= y+menu.clientHeight) y = window.innerHeight - menu.clientHeight
		menu.style.top = y+'px'
		menu.style.left = x+'px'
		setComicMenuEvents()
	}
}

function setComicMenuEvents() {
	window.addEventListener('click', closeComicMenu)
	window.addEventListener('wheel', closeComicMenu)
	window.addEventListener('resize', closeComicMenu)
	window.addEventListener('keydown', closeComicMenu)
}

function closeComicMenu() {
	document.getElementById('c-c-r-c-p').style.display = 'none'
	window.removeEventListener('click', closeComicMenu)
	window.removeEventListener('wheel', closeComicMenu)
	window.removeEventListener('resize', closeComicMenu)
	window.removeEventListener('keydown', closeComicMenu)
}

function openComicCharacters(comicId) {
	db.comics.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicCharacter->'+err); return }
		let html = null
		if (doc != null) {
			const info = doc.h || null
			if (info == null) return
			html = 'Characters: '
			for (let i = 0; i < info.length; i++) html += `<div onclick="PageManager.SetInfo('${charactersDB[info[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',4)">${charactersDB[info[i]]}</div>`
		}
		comicCharactersContainer.innerHTML = html
	})
}

function openComicLanguages(comicId) {
	db.comics.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicLanguage->'+err); return }
		let html = null
		if (doc != null) {
			const info = doc.l || null
			if (info == null) return
			html = 'Languages: '
			for (let i = 0; i < info.length; i++) html += `<div onclick="PageManager.SetInfo('${languagesDB[info[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',5)">${languagesDB[info[i]]}</div>`
		}
		comicLanguagesContainer.innerHTML = html
	})
}

function openComicCategories(comicId) {
	db.comics.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicCategory->'+err); return }
		let html = null
		if (doc != null) {
			const info = doc.e || null
			if (info == null) return
			html = 'Categories: '
			for (let i = 0; i < info.length; i++) html += `<div onclick="PageManager.SetInfo('${categoriesDB[info[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',6)">${categoriesDB[info[i]]}</div>`
		}
		comicCategoriesContainer.innerHTML = html
	})
}

function openComicGroups(comicId) {
	db.comics.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicGroup->'+err); return }
		let html = null
		if (doc != null) {
			const info = doc.g || null
			if (info == null) return
			html = 'Groups: '
			for (let i = 0; i < info.length; i++) html += `<div onclick="PageManager.SetInfo('${groupsDB[info[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',0)">${groupsDB[info[i]]}</div>`
		}
		comicGroupsContainer.innerHTML = html
	})
}

function openComicArtists(comicId) {
	db.comics.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicArtist->'+err); return }
		let html = null
		if (doc != null) {
			const info = doc.a || null
			if (info == null) return
			html = 'Artists: '
			for (let i = 0; i < info.length; i++) html += `<div onclick="PageManager.SetInfo('${artistsDB[info[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',1)">${artistsDB[info[i]]}</div>`
		}
		comicArtistsContainer.innerHTML = html
	})
}

function openComicParodies(comicId) {
	db.comics.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicParody->'+err); return }
		let html = null
		if (doc != null) {
			const info = doc.d || null
			if (info == null) return
			html = 'Parody: '
			for (let i = 0; i < info.length; i++) html += `<div onclick="PageManager.SetInfo('${parodiesDB[info[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',2)">${parodiesDB[info[i]]}</div>`
		}
		comicParodyContainer.innerHTML = html
	})
}

function openComicTags(comicId) {
	db.comics.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicTag->'+err); return }
		let html = null
		if (doc != null) {
			const info = doc.t || null
			if (info == null) return
			html = 'Tags: '
			for (let i = 0; i < info.length; i++) html += `<div onclick="PageManager.SetInfo('${tagsDB[info[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',3)">${tagsDB[info[i]]}</div>`
		}
		comicTagsContainer.innerHTML = html
	})
}

function openComic(id) {
	need_repair = []
	in_comic = true
	id = id || null
	if (id == null) { error("Id Can't be Null."); return }
	KeyManager.ChangeCategory(null)
	const title_container = document.getElementById('c-p-t')
	let html = '', formatIndex = 0, name, image, ImagesCount, formats

	comicCharactersContainer.innerHTML = ''
	comicLanguagesContainer.innerText = ''
	comicCategoriesContainer.innerText = ''
	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	title_container.textContent = ''
	comicImageContainer.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`

	const findComic = async() => {
		await db.comics.findOne({_id:Number(id)}, (err, doc) => {
			if (err) { error(err); return }
			id = Number(id)
			name = doc.n || null
			if (name == null) return
			ImagesCount = doc.c || null
			if (ImagesCount == null) return
			formats = doc.f || null
			if (formats == null) return
			image = doc.i

			off_site = doc.s
			off_comic_id = doc._id
			off_id = doc.p

			title_container.textContent = name
			
			const comic_thumb_optimize_btn = document.getElementById('c-a-p-o-t')
			if (fs.existsSync(`${dirUL}/thumbs/${image}.jpg`)) {
				comic_thumb_optimize_btn.setAttribute('class', 'warning-action')
				comic_thumb_optimize_btn.innerText = 'ReMake Thumb'
			} else {
				comic_thumb_optimize_btn.setAttribute('class', 'success-action')
				comic_thumb_optimize_btn.innerText = 'Make Thumb'
			}

			const comic_optimize_btn = document.getElementById('c-a-p-o-b')
			if (typeof(doc.o) == 'number') {
				comic_optimize_btn.setAttribute('class', 'warning-action')
				comic_optimize_btn.textContent = 'ReOptimize Images'
			} else {
				comic_optimize_btn.setAttribute('class', 'success-action')
				comic_optimize_btn.textContent = 'Optimize Images'
			}

			let lastIndex = formats[0][1], thisForamat = formats[0][2], slider_overview = [], save, src = ''
			for (let i = 0; i < ImagesCount; i++) {
				if (i <= lastIndex) {
					src = `${dirUL}/${id}${image}/${image}-${i}.${thisForamat}`
					if (!fs.existsSync(src)) {
						need_repair.push([`${dirUL}/${id}${image}/`, i, image])
						src = 'Image/no-img-300x300.png'
						save = `onclick="SliderManager.Open(${i})"`
					} else save = `onmousedown="OnComicPanelImageClick(${i}, ${id})"`
					html += `<img data-src="${src}" ${save} loading="lazy">`
					slider_overview.push(src)
				} else {
					formatIndex++
					try {
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
					} catch(err) {
						for (let j = i; j < ImagesCount; j++) {
							need_repair.push([`${dirUL}/${id}${image}/`, j, image])
							html += `<img data-src="Image/no-img-300x300.png" onclick="SliderManager.Open(${i})" loading="lazy">`
							slider_overview.push('Image/no-img-300x300.png')
						}
						break
					}
					src = `${dirUL}/${id}${image}/${image}-${i}.${thisForamat}`
					if (!fs.existsSync(src)) {
						need_repair.push([`${dirUL}/${id}${image}/`, i, image])
						src = 'Image/no-img-300x300.png'
						save = `onclick="SliderManager.Open(${i})"`
					} else save = `onmousedown="OnComicPanelImageClick(${i}, ${id})"`
					html += `<img data-src="${src}" ${save} loading="lazy">`
					slider_overview.push(src)
				}
			}
			
			if (need_repair.length == 0) document.getElementById('c-p-r-btn').style.display = 'none'
			else document.getElementById('c-p-r-btn').style.display = 'flex'

			comicImageContainer.innerHTML = html
			SliderManager.Set(slider_overview)

			comic_load_id = new Date().getTime()
			loadImagesOneByOne([...comicImageContainer.getElementsByTagName('img')], comic_load_id)

			// Load Infos
			if (doc.g != null) {
				html = 'Groups: '
				for (let i = 0; i < doc.g.length; i++) html += `<div onclick="PageManager.SetInfo('${groupsDB[doc.g[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',0)">${groupsDB[doc.g[i]]}</div>`
				comicGroupsContainer.innerHTML = html
			}

			if (doc.a != null) {
				html = 'Artists: '
				for (let i = 0; i < doc.a.length; i++) html += `<div onclick="PageManager.SetInfo('${artistsDB[doc.a[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',1)">${artistsDB[doc.a[i]]}</div>`
				comicArtistsContainer.innerHTML = html
			}

			if (doc.d != null) {
				html = 'Parody: '
				for (let i = 0; i < doc.d.length; i++) html += `<div onclick="PageManager.SetInfo('${parodiesDB[doc.d[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',2)">${parodiesDB[doc.d[i]]}</div>`
				comicParodyContainer.innerHTML = html
			}

			if (doc.h != null) {
				html = 'Characters: '
				for (let i = 0; i < doc.h.length; i++) html += `<div onclick="PageManager.SetInfo('${charactersDB[doc.h[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',4)">${charactersDB[doc.h[i]]}</div>`
				comicCharactersContainer.innerHTML = html
			}

			if (doc.l != null) {
				html = 'Languages: '
				for (let i = 0; i < doc.l.length; i++) html += `<div onclick="PageManager.SetInfo('${languagesDB[doc.l[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',5)">${languagesDB[doc.l[i]]}</div>`
				comicLanguagesContainer.innerHTML = html
			}

			if (doc.e != null) {
				html = 'Categories: '
				for (let i = 0; i < doc.e.length; i++) html += `<div onclick="PageManager.SetInfo('${categoriesDB[doc.e[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',6)">${categoriesDB[doc.e[i]]}</div>`
				comicCategoriesContainer.innerHTML = html
			}

			if (doc.t != null) {
				html = 'Tags: '
				for (let i = 0; i < doc.t.length; i++) html += `<div onclick="PageManager.SetInfo('${tagsDB[doc.t[i]].replace(/'/g, "\\'").replace(/"/g, '\\"')}',3)">${tagsDB[doc.t[i]]}</div>`
				comicTagsContainer.innerHTML = html
			}

			comicPanel.scrollTop = 0
			KeyManager.ChangeCategory('comic')
		})
	}

	comicPanel.setAttribute('cid', id)
	comicPanel.style.display = 'block'
	document.getElementById('main').style.display = 'none'
	findComic()
}

function loadImagesOneByOne(images, id) {
	if (id != comic_load_id || images.length == 0) return
	const src = images[0].getAttribute('data-src')
	images[0].removeAttribute('data-src')
	if (!src) {
		if (images[0].complete) {
			images.shift()
			loadImagesOneByOne(images, id)
		} else setTimeout(() => { loadImagesOneByOne(images, id) }, 300)
	} else {
		images[0].src = src
		loadImagesOneByOne(images, id)
	}
}

function closeComicPanel() {
	comicPanel.style.display = 'none'
	KeyManager.ChangeCategory('default')
	need_repair = []
	in_comic = false
	off_site = null
	off_comic_id = null
	off_id = null
	comic_load_id = null
	document.getElementById('main').style.display = 'flex'

	comicCharactersContainer.innerHTML = ''
	comicLanguagesContainer.innerText = ''
	comicCategoriesContainer.innerText = ''
	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	const passImages = comicImageContainer.getElementsByTagName('img')
	for (let i = 0; i < passImages.length; i++) {
		try {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
			passImages[i].remove()
		} catch(err) { console.error(err) }
	}

	document.getElementById('c-p-t').textContent = ''
	comicImageContainer.innerHTML = ''
	document.getElementById('c-s-o').innerHTML = ''

	comicPanel.setAttribute('cid', null)
	comicPanel.setAttribute('sid', null)
}

function OnComicPanelImageClick(index, comic_id) {
	const e = window.event, key = e.which
	comic_panel_menu_info = null
	if (key == 2) e.preventDefault()
	else if (key == 1) SliderManager.Open(index)
	else if (key == 3) {
		comic_panel_menu_info = [comic_id, index]

		const menu = document.getElementById('c-p-i-r-p')
		let x = e.clientX, y = e.clientY
		menu.style.display = 'block'
		if (window.innerWidth <= x+170) x = window.innerWidth - 170
		if (window.innerHeight <= y+menu.clientHeight) y = window.innerHeight - menu.clientHeight
		menu.style.top = y+'px'
		menu.style.left = x+'px'
		setComicPanelImageMenuEvents()
	}
}

function setComicPanelImageMenuEvents() {
	window.addEventListener('click', closeComicPanelImageMenu)
	document.getElementById('comic-panel').addEventListener('scroll', closeComicPanelImageMenu)
	window.addEventListener('resize', closeComicPanelImageMenu)
}

function removeComicPanelImageMenuEvents() {
	window.removeEventListener('click', closeComicPanelImageMenu)
	document.getElementById('comic-panel').removeEventListener('scroll', closeComicPanelImageMenu)
	window.removeEventListener('resize', closeComicPanelImageMenu)
}

function closeComicPanelImageMenu() {
	document.getElementById('c-p-i-r-p').style.display = 'none'
	removeComicPanelImageMenuEvents()
}

// Delete Comic Image
function deleteComicImage(id, index) {
	loading.Show(1, 'Calculating...')

	document.getElementById('comic-action-panel').style.display = 'none'
	comicImageContainer.innerHTML = ''
	const errors = document.getElementsByClassName('action-error')
	for (let i = 0; i < errors.length; i++) {
		errors[i].remove()
	}
	closeComicPanel()

	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { comicDeleting = false; error(err); openComic(id); loading.Close(); return }
		if (doc == undefined) { comicDeleting = false; error('Comic Not Found.'); openComic(id); loading.Close(); return }

		const ImageFormats = doc.f
		let format = null

		for (let i = 0; i < ImageFormats.length; i++) if (index >= ImageFormats[i][0] && index <= ImageFormats[i][1]) { format = ImageFormats[i][2]; break }

		const src = `${dirUL}/${id}${doc.i}/${doc.i}-${index}.${format}`

		try {
			fs.unlinkSync(src)
		} catch(err) {
			error("DeletingImage->Err: "+err)
		}

		openComic(id)
		PopAlert('Image Has Been Deleted!')
		comicDeleting = false
		loading.Close()

		// console.log(ImageFormats, format, index, src)
	})
}

function askForDeletingComicImage(id, index) {
	if (comicDeleting == true) return
	comicDeleting = true
	errorSelector('Are you sure about Deleting This Image From Comic ?', [
		[
			"Yes",
			"btn btn-danger m-2",
			`this.parentElement.parentElement.remove();deleteComicImage(${id}, ${index})`
		],
		[
			"No",
			"btn btn-primary m-2",
			'comicDeleting = false;this.parentElement.parentElement.remove()'
		]
	])
}

// SetComicThumb 
function SetComicThumb(id, index) {
	if (isThumbing) return
	isThumbing = true
	KeyManager.stop = true
	loading.Show(3, 'Loading Comic')

	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); loading.Close(); isThumbing = false; KeyManager.stop = false; return }
		if (doc == undefined) { error('Comic not Found.'); loading.Close(); isThumbing = false; KeyManager.stop = false; return }
		loading.Forward('Checking Existed Thumb')
		const pass_thumb = `${dirUL}/thumbs/${doc.i}.jpg`
		if (fs.existsSync(pass_thumb)) {
			try {
				fs.unlinkSync(pass_thumb)
			} catch (dErr) {
				error('Could not Delete Existed Thumb -> '+dErr)
				loading.Close()
				isThumbing = false
				KeyManager.stop = false
				return
			}
		}
		loading.Forward('Get New Thumb Image URL')
		const ImageFormats = doc.f
		let format = null
		for (let i = 0; i < ImageFormats.length; i++) if (index >= ImageFormats[i][0] && index <= ImageFormats[i][1]) { format = ImageFormats[i][2]; break }
		const src = `${dirUL}/${id}${doc.i}/${doc.i}-${index}.${format}`
		if (!fs.existsSync(src)) {
			PageManager.Reload()
			error('Could not Find Image')
			loading.Close()
			isThumbing = false
			KeyManager.stop = false
			return
		}
		if (!fs.existsSync(dirUL+'/thumbs')) fs.mkdirSync(dirUL+'/thumbs')
		setTimeout(() => {
			sharp(src).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${doc.i}.jpg`).then(() => {
				PageManager.Reload()
				loading.Forward()
				loading.Close()
				isThumbing = false
				KeyManager.stop = false
			}).catch(tErr => {
				PageManager.Reload()
				error('MakingThumb->Err: '+tErr)
				loading.Close()
				isThumbing = false
				KeyManager.stop = false
				return
			})
		}, 1)
	})
	// if (fs.existsSync(dirUL+'/thumbs/'))
}

// Repair All Comic Infos
function RepairAllComicInfos() {
	if (isRepairing) return
	isRepairing = true
	isRepairingContiue = true
	procressPanel.reset(0)
	procressPanel.show('Collecting Comics...')
	procressPanel.config({bgClose:false, closeBtn:true, closeEvent:'isRepairingContiue=false'})
	KeyManager.ChangeCategory(null)
	repair_all_error_list = []
	repair_all_looped = false

	db.comics.find({}, (err, doc) => {
		if (err) { error('CollectingComics->Err: '+err); procressPanel.hide(); isRepairing = false; isRepairingContiue = false; KeyManager.BackwardCategory(); return }
		if (doc == undefined || doc.length == 0) { PopAlert('There is no Comic Downloaded'); procressPanel.hide(); isRepairing = false; isRepairingContiue = false; KeyManager.BackwardCategory(); return }
		repair_all_list = []
		for (let i = 0; i < doc.length; i++) repair_all_list.push([toCapitalize(doc[i].n), doc[i].s, doc[i].p, doc[i]._id])

		procressPanel.changePercent(repair_all_list.length)
		RepairAllComicLoop()
	})
}

function RepairAllComicLoop() {
	if (repair_all_list.length == 0) {
		if (repair_all_error_list.length > 0) {
			procressPanel.add('+=+=+=+=+=+=+=+=+=+=+', 'warning')
			procressPanel.forward('Re Repairing Un-Success Comic Repairing')
			repair_all_list = []
			for (let i = 0; i < repair_all_error_list.length; i++) repair_all_list.push(repair_all_error_list[i])
			repair_all_error_list = []
			repair_all_looped = true
			procressPanel.changePercent(repair_all_list.length)
			RepairAllComicLoop()
		} else {
			procressPanel.forward('Repair Has Been Finished')
			procressPanel.config({bgClose:true, closeBtn:true})
			isRepairing = false
			isRepairingContiue = false
			KeyManager.BackwardCategory()
			PageManager.Reload()
		}
		return
	}

	if (!isRepairingContiue) {
		isRepairing = false
		procressPanel.hide()
		procressPanel.reset(0)
		KeyManager.BackwardCategory()
		PageManager.Reload()
		return
	}

	procressPanel.forward(repair_all_list.length+' Repairing: '+repair_all_list[0][0])

	if (typeof repair_all_list[0][2] == 'string') eval(sites[repair_all_list[0][1]].repairAll.replace('{id}', `'${repair_all_list[0][2]}'`).replace('{comic_id}', repair_all_list[0][3]))
	else eval(sites[repair_all_list[0][1]].repairAll.replace('{id}', repair_all_list[0][2]).replace('{comic_id}', repair_all_list[0][3]))
}

// Repair Comic
function repairComicInfo(whitch) {
	if (window.navigator.onLine == false) { error('Your are Offline.'); return }
	whitch = whitch || 0
	const id = Number(comicPanel.getAttribute('cid'))
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc.p == undefined) return
		if (doc.s == undefined) return

		if (typeof doc.p == 'string') eval(sites[doc.s].repair.replace('{id}', `'${doc.p}'`).replace('{whitch}', whitch))
		else eval(sites[doc.s].repair.replace('{id}', doc.p).replace('{whitch}', whitch))
	})
}

function repairComicImages(repair_list) {
	if (window.navigator.onLine == false) { PopAlert('You are not Connected To Internet.', 'danger') }
	if (typeof(repair_list) == 'object' && repair_list.length != 0) need_repair = repair_list
	eval(sites[off_site].repair.replace('{id}', `'${off_id}'`).replace('{whitch}', 5))
}

// Export Comic
function openComicExportPanel(id) {
	KeyManager.ChangeCategory(null)
	document.getElementById('export-panel').style.display = 'flex'
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error('LoadingComicInfo->ERR: '+err); closeComicExportPanel(); return }
		export_comic_id = id
		document.getElementById('ex-p-l-fname').value = toFileName(toCapitalize(doc.n))
	})
}

function closeComicExportPanel() {
	document.getElementById('export-panel').style.display = 'none'
	KeyManager.BackwardCategory()
	export_comic_id = null
}

function exportComicBrowseLocation() {
	ChooseDirectory('Choose Location For Export', (err, result) => {
		if (err) { return }
		if (!fs.existsSync(result)) { error(`No Such Directory Called '${lastSlash(result, '\\')}'.`); return }

		document.getElementById('ex-p-l-input').value = result
	})
}

function exportComic(filepath, filelist) {
	const JSZip = require('jszip')
	const flen = filelist.length
	loading.Show(2, 'Compressing...')
	setTimeout(() => {
		const zip = new JSZip()
		for (let i = 0; i < filelist.length; i++) zip.file(i+'.'+fileExt(filelist[i]), fs.readFileSync(filelist[i]), { base64: true })

		loading.Forward(`Making File...`)
		setTimeout(async() => {
			const content = await zip.generateAsync({ type: "nodebuffer" })
			fs.writeFileSync(filepath, content)
			loading.Forward()
			loading.Close()
			PopAlert('Exporting Finished')
		}, 1)
	}, 1)
}

function exportComicCheckExist(filepath, filelist) {
	if (fs.existsSync(filepath)) {
		save_value = filelist
		errorSelector('The File is Exist, Do you want to override it ?', [
			[
				"Yes",
				"btn btn-danger m-2",
				`exportComic('${filepath.replace(/'/g, "\\'").replace(/\\/g, '/')}',save_value);this.parentElement.parentElement.remove()`
			],
			[
				"No",
				"btn btn-primary m-2",
				"this.parentElement.parentElement.remove();save_value=null"
			]
		])
	} else exportComic(filepath, filelist)
}

function checkExportComicInfo() {
	save_value = null
	const export_path = document.getElementById('ex-p-l-input').value || ''
	if (export_path.replace(/ /g, '').length == 0) { error('Please Insert Export Location.'); return }

	if (fs.existsSync(export_path)) {
		let export_filename = toFileName(document.getElementById('ex-p-l-fname').value)
		if (export_filename.replace(/ /g, '').length == 0) { error('Please Insert Export File Name.'); return }
		export_filename = export_path+'/'+export_filename+'.'+document.getElementById('ex-p-f').getAttribute('f')

		db.comics.findOne({_id:export_comic_id}, (err, doc) => {
			if (err) { error('LoadingComicInfo->ERR: '+err); return }
			if (doc == undefined) { error("LoadingComicInfo->ERR: Coundn't Find Comic."); return }
			const zipFiles = [], image = doc.i, id = doc._id, formats = doc.f
			let src = '', formatIndex = 0, lastIndex = formats[0][1], thisForamat = formats[0][2], undl = false
			for (let i = 0; i < doc.c; i++) {
				if (i <= lastIndex) {
					src = `${dirUL}/${id}${image}/${image}-${i}.${thisForamat}`
					if (!fs.existsSync(src)) {
						src = 'Image/no-img-300x300.png'
						undl = true
					}
					zipFiles.push(src)
				} else {
					formatIndex++
					try {
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
					} catch(err) {
						for (let j = i; j < ImagesCount; j++) zipFiles.push('Image/no-img-300x300.png')
						undl = true
						break
					}
					src = `${dirUL}/${id}${image}/${image}-${i}.${thisForamat}`
					if (!fs.existsSync(src)) {
						src = 'Image/no-img-300x300.png'
						undl = true
					}
					zipFiles.push(src)
				}
			}

			if (undl) {
				save_value = [export_filename, zipFiles]
				errorSelector('Some Comic Images Are not Downloaded, Do you want To Continue ?', [
					[
						"Yes",
						"btn btn-danger m-2",
						`exportComicCheckExist(save_value[0],save_value[1]);this.parentElement.parentElement.remove()`
					],
					[
						"No",
						"btn btn-primary m-2",
						"this.parentElement.parentElement.remove();save_value=null"
					]
				])
			} else exportComicCheckExist(export_filename, zipFiles)
		})
	} else {
		error('Export Location Not Found.')
		return
	}
}

// Delete a Comic
function deleteComic(id) {
	document.getElementById('comic-action-panel').style.display = 'none'
	comicImageContainer.innerHTML = ''
	const errors = document.getElementsByClassName('action-error')
	for (let i = 0; i < errors.length; i++) {
		errors[i].remove()
	}
	closeComicPanel()

	loading.Show(1, 'Calculating...')

	setTimeout(() => {
		db.comics.findOne({_id:id}, (err, doc) => {
			if (err) { comicDeleting = false; loading.Close(); error(err); KeyManager.ChangeCategory('default'); return }
			if (doc == undefined) { comicDeleting = false; loading.Close(); error('Comic Not Found.'); KeyManager.ChangeCategory('default'); return }
			const ImagesId = doc.i
			const ImagesFormats = doc.f
			const ImagesCount = doc.c
			const site = doc.s
			const post_id = doc.p
			
			loading.Close()
			loading.Show(4 + ImagesCount, 'Removing Comic From Database...')
	
			const fix_removed_index = () => {
				FixComicIndex(true)
				loading.Forward()
				loading.Close()
				PopAlert('Comic Deleted.', 'warning')
				comicDeleting = false
				PageManager.Reload()
				KeyManager.ChangeCategory('default')
				
			}

			const remove_have = () => {
				const haveIndex = GetHave(site, post_id)
				if (haveIndex != null) {
					haveDBSite.splice(haveIndex, 1)
					haveDBId.splice(haveIndex, 1)
					haveDBComic.splice(haveIndex, 1)
				}
				try { jsonfile.writeFileSync(dirDB+'/have.lowdb', {s:haveDBSite,i:haveDBId,c:haveDBComic}) } catch(err) { error('SavingHaveDB->'+err); console.log(err) }
				loading.Forward('Fix Indexs...')
				fix_removed_index()
			}
	
			const remove_comic = () => {
				db.comics.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.Close(); error(err); KeyManager.ChangeCategory('default'); return }
					loading.Forward('Deleting Comic Images...')
					remove_have()
				})
			}
	
			const delete_images = () => {
	
				if (fs.existsSync(`${dirUL}/thumbs/${ImagesId}.jpg`)) {
					try {
						fs.unlinkSync(`${dirUL}/thumbs/${ImagesId}.jpg`)
					} catch(err) {
						console.error("DELETE::COMIC::THUMB:: "+err)
					}
				}
	
				let formatIndex = 0, thisUrl
				if (ImagesFormats[0] != undefined) {
					let lastIndex = ImagesFormats[0][1]
					let thisForamat = ImagesFormats[0][2]
					for (let i = 0; i < ImagesCount; i++) {
						if (i <= lastIndex) thisUrl = `${dirUL}/${id}${ImagesId}/${ImagesId}-${i}.${thisForamat}`
						else {
							formatIndex++
							try {
								lastIndex = ImagesFormats[formatIndex][1]
								thisForamat = ImagesFormats[formatIndex][2]
							} catch(err) {
								break
							}
							
							thisUrl = `${dirUL}/${id}${ImagesId}/${ImagesId}-${i}.${thisForamat}`
						}
	
						if (fs.existsSync(thisUrl)) {
							try {
								fs.unlinkSync(thisUrl)
							} catch(err) {
								loading.Close()
								error(err)
								KeyManager.ChangeCategory('default')
								return
							}
						}
						
						loading.Forward(`Deleting Comic Images (${i+1}/${ImagesCount})...`)
					}
				}

				try {
					fs.rmdirSync(`${dirUL}/${id}${ImagesId}`)
				} catch(err) {
					console.error(`Couldn't Delete Folder: ${dirUL}/${id}${ImagesId}`)
				}

				loading.Forward('Removing Comic Groups From Database...')
				remove_comic()
			}
	
			delete_images()
		})
	}, 200)
}

function askForDeletingComic(id) {
	if (comicDeleting == true) return
	comicDeleting = true
	errorSelector('Are you sure you want To Delete This Comic ?', [
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

// Rename a Comic
function openRenameComic(id) {
	KeyManager.ChangeCategory(null)
	const panel = document.getElementById('comic-rename-panel')
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err || doc == null) {
			error('FindingComic->Err: '+err)
			console.error(err)
			KeyManager.BackwardCategory()
			passKeyEvent = null
			return
		}
		const name = doc.n || null
		if (name == null) { error('Comic Not Found!'); return }
		panel.children[1].children[0].value = toCapitalize(name);
		panel.setAttribute('cid', id)
		panel.style.display = 'flex'
	})
}

function closeRenamePanel() {
	const panel = document.getElementById('comic-rename-panel')
	panel.style.display = 'none'
	panel.removeAttribute('cid')
	panel.children[1].children[0].value = null
	KeyManager.BackwardCategory()
	passKeyEvent = null
}

function renameComic(id, newName) {
	if (newName == undefined || newName.replace(/ /g, '').length <= 0) { error('Please Fill name Input!'); return }
	db.comics.update({_id:id}, { $set: {n:newName.toLowerCase()} }, {}, (err) => {
		PageManager.Reload()
		if (comicPanel.getAttribute('cid') != 'null') openComic(id)
		closeRenamePanel()
		if (err) {
			PopAlert('UpdatingName->Err: '+err, 'danger')
			console.log(err)
			return
		}
	})
}

function askForClosingApp() {
	if (closingApp == true) return
	closingApp = true
	errorSelector('Do you want to Quit?', [
		[
			"Yes",
			"btn btn-danger m-2",
			"this.parentElement.parentElement.remove();remote.app.quit()"
		],
		[
			"No",
			"btn btn-primary m-2",
			'closingApp = false;this.parentElement.parentElement.remove()'
		]
	])
}

// Comic Properties
function OpenComicProperties(comic_id) {
	KeyManager.ChangeCategory(null)
	const container = document.getElementById('c-p-c')
	container.style.display = 'none'
	document.getElementById('comic-properties').style.display = 'flex'
	db.comics.findOne({_id:comic_id}, (err, doc) => {
		if (err || doc == null) {
			document.getElementById('comic-properties').style.display = 'none'
			KeyManager.BackwardCategory()
			passKeyEvent = null
			error(err)
			console.error(err)
			return
		}

		document.getElementById('c-p-c-n').innerText = doc.n
		document.getElementById('c-p-c-i-c').innerText = doc.c

		let lastIndex = doc.f[0][1], thisForamat = doc.f[0][2], formatIndex = 0, bytes = 0
		for (let i = 0; i < doc.c; i++) {
			if (i > lastIndex) {
				formatIndex++
				try {
					lastIndex = doc.f[formatIndex][1]
					thisForamat = doc.f[formatIndex][2]
				} catch(err) { console.error(err); break }
			}

			try { bytes += fs.statSync(`${dirUL}/${comic_id}${doc.i}/${doc.i}-${i}.${thisForamat}`).size } catch(err) { console.error(err) }
		}
		document.getElementById('c-p-c-s').innerText = formatBytes(bytes)
		document.getElementById('c-p-c-i-o').innerText = typeof(doc.o) != 'number' ? 'false' : 'true'

		pr_c_folder = `${dirUL}/${comic_id}${doc.i}`
		document.getElementById('c-p-c-o-f').setAttribute('onclick', 'OpenPath(pr_c_folder)')

		container.style.display = 'block'
	})
}

function OpenPath(path) {
	try { remote.shell.openPath(path) } catch(err) { PopAlert('OpenPath->'+err); console.error(err) }
}

function CloseComicProperties() {
	document.getElementById('comic-properties').style.display = 'none'
	KeyManager.BackwardCategory()
	passKeyEvent = null
}