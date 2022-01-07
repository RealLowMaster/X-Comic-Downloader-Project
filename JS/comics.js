const comicCharactersContainer = document.getElementById('c-p-c')
const comicLanguagesContainer = document.getElementById('c-p-l')
const comicCategoriesContainer = document.getElementById('c-p-ct')
const comicGroupsContainer = document.getElementById('c-p-g')
const comicArtistsContainer = document.getElementById('c-p-a')
const comicParodyContainer = document.getElementById('c-p-p')
const comicTagsContainer = document.getElementById('c-p-ts')
const comicImageContainer = document.getElementById('c-p-i')
let off_site = null, off_id = null, off_comic_id = null, need_repair = [], in_comic = false, comic_menu_id = null, passKeyEvent = null, export_comic_id = null, comic_panel_menu_info = null, isThumbing = false, isRepairing = false, isRepairingContiue = false, repair_all_list = null, repair_all_error_list = null, closingApp = false

function loadComics(page, search, safeScroll) {
	page = page || 1
	search = search || null
	if (search == 'null') search = null
	let RegSearch
	if (search != null) RegSearch = new RegExp(search.toLowerCase())
	const comic_container = document.getElementById('comic-container')
	let min = 0, max = 0, allPages = 0, html = '', main_body, scrollTop, id, name, image, thumb, optimize
	const max_per_page = setting.max_per_page, safeScrollType = typeof(safeScroll)
	if (safeScrollType == 'boolean' && safeScroll == true) {
		main_body = document.getElementById('main-body')
		scrollTop = main_body.scrollTop
	} else if (safeScrollType == 'number') {
		main_body = document.getElementById('main-body')
		scrollTop = safeScroll
	}
	comic_container.innerHTML = ''
	comic_container.setAttribute('page', page)

	const working = (doc) => {
		max = doc.length
		allPages = Math.ceil(doc.length / max_per_page)
		if (page > 1 && page > allPages) { loadComics(page - 1, search, safeScroll); return }
		if (doc.length >= max_per_page) {
			min = (max_per_page * page) - max_per_page
			max = min + max_per_page
			if (max > doc.length) max = doc.length
		}
		
		const time = new Date().getTime()
		if (setting.show_unoptimize) {
			let unoptimize = ''
			for (let i = min; i < max; i++) {
				id = doc[i]._id
				name = doc[i].n
				image = `${dirUL}/thumbs/${doc[i].i}.jpg`
				thumb = true
				
				if (!fs.existsSync(image)) { image = 'Image/no-img-300x300.png'; thumb = false }
				if (typeof doc[i].o == 'number') { unoptimize = ''; optimize = true }
				else { unoptimize = ' unoptimize'; optimize = false }
				
				html += `<div class="comic" onmousedown="onComicClicked(${id}, ${thumb}, ${optimize})"${unoptimize}><img src="${image}?${time}"><span>${doc[i].c}</span><p>${name}</p></div>`
			}
		} else {
			for (let i = min; i < max; i++) {
				id = doc[i]._id
				name = doc[i].n
				image = `${dirUL}/thumbs/${doc[i].i}.jpg`
				thumb = true

				if (!fs.existsSync(image)) { image = 'Image/no-img-300x300.png'; thumb = false }
				if (typeof(doc[i].o) == 'number') optimize = true
				else optimize = false

				html += `<div class="comic" onmousedown="onComicClicked(${id}, ${thumb}, ${optimize})"><img src="${image}?${time}"><span>${doc[i].c}</span><p>${name}</p></div>`
			}
		}
		comic_container.innerHTML = html
		
		// Pagination
		document.getElementById('jp-m-p').textContent = allPages
		if (allPages > 1) {
			document.getElementById('offline-search-form').style.display = 'flex'
			document.getElementById('jump-page-container').style.display = 'inline-block'
			const jp_i = document.getElementById('jp-i')
			jp_i.setAttribute('oninput', `inputLimit(this, ${allPages});searchComics(document.getElementById('offline-search-form-input').value, Number(this.value))`)
			jp_i.value = page
			const thisPagination = pagination(allPages, page)
			html = '<div>'
			for (let i in thisPagination) {
				if (thisPagination[i][1] == null) html += `<button disabled>${thisPagination[i][0]}</button>`
				else html += `<button onclick="loadComics(${thisPagination[i][1]}, '${search}')">${thisPagination[i][0]}</button>`
			}
			html += '</div>'
			document.getElementById('pagination').innerHTML = html
			document.getElementById('pagination').style.display = 'block'
		} else {
			if (search == null) document.getElementById('offline-search-form').style.display = 'none'
			document.getElementById('pagination').style.display = 'none'
			document.getElementById('jump-page-container').style.display = 'none'
		}
		
		if (doc.length == 0 && search != null) comic_container.innerHTML = '<br><div class="alert alert-danger">No Comic has been Found.</div>'
		else if (doc.length == 0 && search == null) comic_container.innerHTML = '<br><div class="alert alert-danger">There is no Comic Downloaded.</div>'

		if (safeScrollType == 'boolean' || safeScrollType == 'number') main_body.scrollTop = scrollTop
	}

	const findComicsBySearch = async() => {
		await db.comics.find({n:RegSearch}).sort({_id:-1}).exec((err, doc) => {
			if (err) { error(err); return }
			working(doc)
			document.getElementById('comics-counter').textContent = 'Comics: '+doc.length
		})
	}

	const findComics = async() => {
		await db.comics.find({}).sort({_id:-1}).exec((err, doc) => {
			if (err) { error(err); return }
			working(doc)
			document.getElementById('comics-counter').textContent = 'Comics: '+doc.length
		})
	}

	if (search == null) findComics()
	else findComicsBySearch()
}

function pagination(total_pages, page) {
	let min = 1, max = 1, bdot = false, fdot = false, bfirst = false, ffirst = false, pagination_width = 5
	if (total_pages > pagination_width - 1) {
		if (page == 1) {
			min = 1
			max = pagination_width
		} else {
			if (page < total_pages) {
				if (page == pagination_width || page == pagination_width - 1)
					min = page - Math.floor(pagination_width / 2) - 1
				else
					min = page - Math.floor(pagination_width / 2)
				
				if (page == (total_pages - pagination_width) + 1 || page == (total_pages - pagination_width) + 2) {
					max = page + Math.floor(pagination_width / 2) + 1
				} else
					max = page + Math.floor(pagination_width / 2)
			} else {
				min = page - pagination_width + 1
				max = page
			}
		}
	} else {
		min = 1
		max = total_pages
	}
	
	if (min < 1) min = 1
	if (max > total_pages) max = total_pages
	
	if (page > pagination_width - 1 && total_pages > pagination_width) bfirst = true
	if (page > pagination_width && total_pages > pagination_width + 1) bdot = true
	if (page < (total_pages - pagination_width) + 2 && total_pages > pagination_width) ffirst = true
	if (page < (total_pages - pagination_width) + 1 && total_pages > pagination_width + 1) fdot = true
	
	const arr = []
	if (page > 1) arr.push(['Prev', page - 1])
	if (bfirst) arr.push(['1', 1])
	if (bdot) arr.push(['...', null])
	for (let i=min; i <= max;i++) {
		if (i == page) arr.push([`${i}`, null])
		else arr.push([`${i}`, i])
	}
	if (fdot) arr.push(['...', null])
	if (ffirst) arr.push([`${total_pages}`, total_pages])
	if (page < total_pages) arr.push(['Next', page + 1])

	return arr
}

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
		if (inCollection) childs[1].setAttribute('onclick', 'makeThumbForAComic(comic_menu_id, null)')
		else childs[1].setAttribute('onclick', 'makeThumbForAComic(comic_menu_id, 0)')

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
	document.getElementById('main-body').addEventListener('scroll', closeComicMenu)
	window.addEventListener('resize', closeComicMenu)
}

function removeComicMenuEvents() {
	window.removeEventListener('click', closeComicMenu)
	document.getElementById('main-body').removeEventListener('scroll', closeComicMenu)
	window.removeEventListener('resize', closeComicMenu)
}

function closeComicMenu() {
	document.getElementById('c-c-r-c-p').style.display = 'none'
	removeComicMenuEvents()
}

function offlineChangePage(forward=true) {
	const page = Number(document.getElementById('comic-container').getAttribute('page')) || null
	let search = document.getElementById('offline-search-form-input').value || null
	if (search == null || search.length == 0) search = null
	if (forward) {
		if (Number(document.getElementById('jp-m-p').innerText) > page) loadComics(page + 1, search)
	} else if (page > 1) loadComics(page - 1, search)
}

function searchComics(value, page) {
	clearTimeout(searchTimer)
	let search_speed
	if (page == undefined) {
		switch (setting.search_speed) {
			case 0:
				search_speed = 0
				break
			case 1:
				search_speed = 300
				break
			case 2:
				search_speed = 700
				break
			case 3:
				search_speed = 1000
				break
		}
	}

	if (value.replace(/ /g, '').length > 0) {
		if (typeof(page) != 'number') page = 1
		if (search_speed == 0) {
			loadComics(page, value)
		} else {
			searchTimer = setTimeout(() => {
				loadComics(page, value)
			}, search_speed)
		}
	} else if (typeof(page) == 'number') {
		searchTimer = setTimeout(() => {
			loadComics(page, value)
		}, 330)
	} else loadComics(1, null)
}

function randomJumpPage(limit) {
	const value = document.getElementById('offline-search-form-input').value || null
	if (value == null || value.replace(/ /g, '').length == 0) loadComics(Math.floor(Math.random() * limit), null)
	else loadComics(Math.floor(Math.random() * limit), value)
}

function reloadLoadingComics(scroll) {
	scroll = scroll || true
	const page = Number(document.getElementById('comic-container').getAttribute('page')) || null
	let search = document.getElementById('offline-search-form-input').value || null
	if (search == null || search.length == 0) search = null
	loadComics(page, search, scroll)
}

function openComicCharacters(comicId) {
	db.comic_characters.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicCharacter: '+err); return }
		if (doc != undefined) {
			const character = doc.t || null
			if (character == null) return
			let html = 'Characters: '
			for (let i = 0; i < character.length; i++) html += `<button>${charactersDB[character[i]]}</button>`
			comicCharactersContainer.innerHTML = html
		}
	})
}

function openComicLanguages(comicId) {
	db.comic_languages.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicLanguage: '+err); return }
		if (doc != undefined) {
			const language = doc.t || null
			if (language == null) return
			let html = 'Languages: '
			for (let i = 0; i < language.length; i++) html += `<button>${languagesDB[language[i]]}</button>`
			comicLanguagesContainer.innerHTML = html
		}
	})
}

function openComicCategories(comicId) {
	db.comic_categories.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicCategory: '+err); return }
		if (doc != undefined) {
			const category = doc.t || null
			if (category == null) return
			let html = 'Categories: '
			for (let i = 0; i < category.length; i++) html += `<button>${categoriesDB[category[i]]}</button>`
			comicCategoriesContainer.innerHTML = html
		}
	})
}

function openComicGroups(comicId) {
	db.comic_groups.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicGroup: '+err); return }
		if (doc != undefined) {
			const groups = doc.t || null
			if (groups == null) return
			let html = 'Groups: '
			for (let i = 0; i < groups.length; i++) html += `<button>${groupsDB[groups[i]]}</button>`
			comicGroupsContainer.innerHTML = html
		}
	})
}

function openComicArtists(comicId) {
	db.comic_artists.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicArtist: '+err); return }
		if (doc != undefined) {
			const artists = doc.t || null
			if (artists == null) return
			let html = 'Artists: '
			for (let i = 0; i < artists.length; i++) html += `<button>${artistsDB[artists[i]]}</button>`
			comicArtistsContainer.innerHTML = html
		}
	})
}

function openComicParodies(comicId) {
	db.comic_parodies.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicParody: '+err); return }
		if (doc != undefined) {
			const parodies = doc.t || null
			if (parodies == null) return
			let html = 'Parody: '
			for (let i = 0; i < parodies.length; i++) html += `<button>${parodiesDB[parodies[i]]}</button>`
			comicParodyContainer.innerHTML = html
		}
	})
}

function openComicTags(comicId) {
	db.comic_tags.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicTag: '+err); return }
		if (doc != undefined) {
			const tags = doc.t || null
			if (tags == null) return
			let html = 'Tags: '
			for (let i = 0; i < tags.length; i++) html += `<button>${tagsDB[tags[i]]}</button>`
			comicTagsContainer.innerHTML = html
		}
	})
}

function openComic(id) {
	need_repair = []
	in_comic = true
	id = id || null
	if (id == null) { error('Id Can\'t be Null.'); return }
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
	comicImageContainer.innerHTML = ''
	comicSliderOverview.setAttribute('aindex', '')

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

			let lastIndex = formats[0][1], thisForamat = formats[0][2], slider_overview_html = '', save, src = ''
			for (let i = 0; i < ImagesCount; i++) {
				if (i <= lastIndex) {
					src = `${dirUL}/${id}${image}/${image}-${i}.${thisForamat}`
					if (!fs.existsSync(src)) {
						need_repair.push([`${dirUL}/${id}${image}/`, i, image])
						src = 'Image/no-img-300x300.png'
						save = `onclick="openComicSlider(${i})"`
					} else save = `onmousedown="OnComicPanelImageClick(${i}, ${id})"`
					html += `<img data-src="${src}" ${save}>`
					slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="${src}" loading="lazy"><p>${i+1}</p></div>`
				} else {
					formatIndex++
					try {
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
					} catch(err) {
						for (let j = i; j < ImagesCount; j++) {
							need_repair.push([`${dirUL}/${id}${image}/`, j, image])
							html += `<img data-src="Image/no-img-300x300.png" onclick="openComicSlider(${i})">`
							slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="Image/no-img-300x300.png" loading="lazy"><p>${i+1}</p></div>`
						}
						break
					}
					src = `${dirUL}/${id}${image}/${image}-${i}.${thisForamat}`
					if (!fs.existsSync(src)) {
						need_repair.push([`${dirUL}/${id}${image}/`, i, image])
						src = 'Image/no-img-300x300.png'
						save = `onclick="openComicSlider(${i})"`
					} else save = `onmousedown="OnComicPanelImageClick(${i}, ${id})"`
					html += `<img data-src="${src}" ${save}>`
					slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="${src}" loading="lazy"><p>${i+1}</p></div>`
				}
			}
			

			if (need_repair.length == 0) document.getElementById('c-p-r-btn').style.display = 'none'
			else document.getElementById('c-p-r-btn').style.display = 'flex'

			comicImageContainer.innerHTML = html
			comicSliderOverview.innerHTML = slider_overview_html
			comicSliderOverview.setAttribute('count', ImagesCount - 1)
			comicSliderMaxPages.textContent = ImagesCount

			loadImagesOneByOne([...comicImageContainer.getElementsByTagName('img')])

			openComicCharacters(id)
			openComicLanguages(id)
			openComicCategories(id)
			openComicGroups(id)
			openComicArtists(id)
			openComicParodies(id)
			openComicTags(id)
			comicPanel.style.display = 'block'
			comicPanel.scrollTop = 0
			keydownEventIndex = 1
			document.getElementById('main').style.display = 'none'
		})
	}

	comicPanel.setAttribute('cid', id)
	findComic()
}

function closeComicPanel() {
	comicPanel.style.display = 'none'
	if (inCollection) keydownEventIndex = null
	else keydownEventIndex = 0
	need_repair = []
	in_comic = false
	off_site = null
	off_comic_id = null
	off_id = null
	document.getElementById('main').style.display = 'flex'

	comicCharactersContainer.innerHTML = ''
	comicLanguagesContainer.innerText = ''
	comicCategoriesContainer.innerText = ''
	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	document.getElementById('c-p-t').textContent = ''
	document.getElementById('c-p-i').innerHTML = ''
	document.getElementById('c-s-o').innerHTML = ''

	comicPanel.setAttribute('cid', null)
	comicPanel.setAttribute('sid', null)
}

function OnComicPanelImageClick(index, comic_id) {
	const e = window.event, key = e.which
	comic_panel_menu_info = null
	if (key == 2) e.preventDefault()
	else if (key == 1) openComicSlider(index)
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
	loading.reset(0)
	loading.show('Calculating...')

	document.getElementById('comic-action-panel').style.display = 'none'
	document.getElementById('c-p-i').innerHTML = ''
	const errors = document.getElementsByClassName('action-error')
	for (let i = 0; i < errors.length; i++) {
		errors[i].remove()
	}
	closeComicPanel()

	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { comicDeleting = false; error(err); openComic(id); loading.hide(); return }
		if (doc == undefined) { comicDeleting = false; error('Comic Not Found.'); openComic(id); loading.hide(); return }

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
		loading.hide()

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
	const passKeyEvent = keydownEventIndex
	keydownEventIndex = null
	loading.reset(3)
	loading.show('Loading Comic')

	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); loading.hide(); isThumbing = false; keydownEventIndex = passKeyEvent; return }
		if (doc == undefined) { error('Comic not Found.'); loading.hide(); isThumbing = false; keydownEventIndex = passKeyEvent; return }
		loading.forward('Checking Existed Thumb')
		const pass_thumb = `${dirUL}/thumbs/${doc.i}.jpg`
		if (fs.existsSync(pass_thumb)) {
			try {
				fs.unlinkSync(pass_thumb)
			} catch (dErr) {
				error('Could not Delete Existed Thumb -> '+dErr)
				loading.hide()
				isThumbing = false
				keydownEventIndex = passKeyEvent
				return
			}
		}
		loading.forward('Get New Thumb Image URL')
		const ImageFormats = doc.f
		let format = null
		for (let i = 0; i < ImageFormats.length; i++) if (index >= ImageFormats[i][0] && index <= ImageFormats[i][1]) { format = ImageFormats[i][2]; break }
		const src = `${dirUL}/${id}${doc.i}/${doc.i}-${index}.${format}`
		if (!fs.existsSync(src)) {
			if (inCollection) LoadCollection()
			else reloadLoadingComics()
			error('Could not Find Image')
			loading.hide()
			isThumbing = false
			keydownEventIndex = passKeyEvent
			return
		}
		if (!fs.existsSync(dirUL+'/thumbs')) fs.mkdirSync(dirUL+'/thumbs')
		setTimeout(() => {
			sharp(src).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${doc.i}.jpg`).then(() => {
				reloadLoadingComics(true)
				if (inCollection) LoadCollection()
				else reloadLoadingComics()
				loading.forward()
				loading.hide()
				isThumbing = false
				keydownEventIndex = passKeyEvent
			}).catch(tErr => {
				if (inCollection) LoadCollection()
				else reloadLoadingComics()
				error('MakingThumb->Err: '+tErr)
				loading.hide()
				isThumbing = false
				keydownEventIndex = passKeyEvent
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
	const passKeyEvent = keydownEventIndex
	keydownEventIndex = null
	repair_all_error_list = []
	repair_all_looped = false

	db.comics.find({}, (err, doc) => {
		if (err) { error('CollectingComics->Err: '+err); procressPanel.hide(); isRepairing = false; isRepairingContiue = false; keydownEventIndex = passKeyEvent; return }
		if (doc == undefined || doc.length == 0) { PopAlert('There is no Comic Downloaded'); procressPanel.hide(); isRepairing = false; isRepairingContiue = false; keydownEventIndex = passKeyEvent; return }
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
			keydownEventIndex = 0
			reloadLoadingComics(true)
		}
		return
	}

	if (!isRepairingContiue) {
		isRepairing = false
		procressPanel.hide()
		procressPanel.reset(0)
		keydownEventIndex = 0
		reloadLoadingComics(true)
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
	passKeyEvent = keydownEventIndex
	keydownEventIndex = null
	document.getElementById('export-panel').style.display = 'flex'
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error('LoadingComicInfo->ERR: '+err); closeComicExportPanel(); return }
		export_comic_id = id
		document.getElementById('ex-p-l-fname').value = toFileName(toCapitalize(doc.n))
	})
}

function closeComicExportPanel() {
	document.getElementById('export-panel').style.display = 'none'
	keydownEventIndex = passKeyEvent
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
	loading.reset(2)
	loading.show(`Compressing...`)
	setTimeout(() => {
		const zip = new JSZip()
		for (let i = 0; i < filelist.length; i++) zip.file(i+'.'+fileExt(filelist[i]), fs.readFileSync(filelist[i]), { base64: true })

		loading.forward(`Making File...`)
		setTimeout(async() => {
			const content = await zip.generateAsync({ type: "nodebuffer" })
			fs.writeFileSync(filepath, content)
			loading.forward()
			loading.hide()
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
	document.getElementById('c-p-i').innerHTML = ''
	const errors = document.getElementsByClassName('action-error')
	for (let i = 0; i < errors.length; i++) {
		errors[i].remove()
	}
	closeComicPanel()

	loading.reset(0)
	loading.show('Calculating...')

	setTimeout(() => {
		db.comics.findOne({_id:id}, (err, doc) => {
			if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
			if (doc == undefined) { comicDeleting = false; loading.hide(); error('Comic Not Found.'); keydownEventIndex = 0; return }
			const ImagesId = doc.i
			const ImagesFormats = doc.f
			const ImagesCount = doc.c
			const site = doc.s
			const post_id = doc.p
			
			loading.reset(11 + ImagesCount)
			loading.show('Removing Comic From Database...')
	
			const fix_removed_index = () => {
				FixIndex(0, true)
				FixIndex(1, true)
				loading.forward()
				loading.hide()
				PopAlert('Comic Deleted.', 'warning')
				comicDeleting = false
				reloadLoadingComics()
				if (inCollection) {
					keydownEventIndex = null
					document.getElementById('o-c-p-c-c').innerHTML = ''
					CheckAllCollectionIds(openedCollectionIndex, 0, false, () => {
						if (collectionsDB[openedCollectionIndex][1].length == 0) {
							document.getElementById('o-c-p-c-c').innerHTML = '<div class="alert alert-danger">This Collection Have no Comic.</div>'
							return
						}
						LoadCollection()
						document.getElementById('opened-collections-panel').style.display = 'block'
						document.getElementById('collections-panel').style.display = 'none'
					})
				} else keydownEventIndex = 0
				
			}

			const remove_characters = () => {
				db.comic_characters.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Removing Comic Have From Database...')
					fix_removed_index()
				})
			}

			const remove_languages = () => {
				db.comic_languages.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Removing Comic Have From Database...')
					remove_characters()
				})
			}

			const remove_categories = () => {
				db.comic_categories.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Removing Comic Have From Database...')
					remove_languages()
				})
			}
	
			const remove_tags = () => {
				db.comic_tags.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Removing Comic Have From Database...')
					remove_categories()
				})
			}
	
			const remove_parodies = () => {
				db.comic_parodies.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Removing Comic Tags From Database...')
					remove_tags()
				})
			}
	
			const remove_artists = () => {
				db.comic_artists.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Removing Comic Parodies From Database...')
					remove_parodies()
				})
			}
	
			const remove_groups = () => {
				db.comic_groups.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Removing Comic Artists From Database...')
					remove_artists()
				})
			}
	
			const remove_have = () => {
				db.have.remove({s:site, i:post_id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Fix Indexs...')
					remove_groups()
				})
			}
	
			const remove_comic = () => {
				db.comics.remove({_id:id}, {}, err => {
					if (err) { comicDeleting = false; loading.hide(); error(err); keydownEventIndex = 0; return }
					loading.forward('Deleting Comic Images...')
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
								loading.hide()
								error(err)
								keydownEventIndex = 0
								return
							}
						}
						
						loading.forward(`Deleting Comic Images (${i+1}/${ImagesCount})...`)
					}
				}

				try {
					fs.rmdirSync(`${dirUL}/${id}${ImagesId}`)
				} catch(err) {
					console.error(`Couldn't Delete Folder: ${dirUL}/${id}${ImagesId}`)
				}

				loading.forward('Removing Comic Groups From Database...')
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
	const panel = document.getElementById('comic-rename-panel')
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error('FindingComic->Err: '+err); return }
		if (doc == null) { error('Comic Not Found!'); return }
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
	panel.children[1].children[0].value = null;
}

function renameComic(id, newName) {
	if (newName == undefined || newName.replace(/ /g, '').length <= 0) { error('Please Fill name Input!'); return }
	db.comics.update({_id:id}, { $set: {n:newName.toLowerCase()} }, {}, (err) => {
		if (inCollection) {
			LoadCollection()
			keydownEventIndex = null
		} else reloadLoadingComics()
		if (comicPanel.getAttribute('cid') != 'null') openComic(id)
		if (err) { error('UpdatingName->Err: '+err); return }
		closeRenamePanel()
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

// Key Event
function OfflineKeyEvents(ctrl, shift, key) {
	if (ctrl) {
		if (!shift) {
			switch (key) {
				case 82:
					reloadLoadingComics()
					break
			}
		}
	} else {
		if (!shift) {
			switch (key) {
				case 27:
					askForClosingApp()
					break
				case 39:
					offlineChangePage()
					break
				case 37:
					offlineChangePage(false)
					break
			}
		}
	}
}

function OfflineComicKeyEvents(ctrl, shift, key) {
	if (ctrl) {
		if (!shift) {
			switch (key) {
				case 69:
					openComicExportPanel(Number(comicPanel.getAttribute('cid')), 1)
					break
				case 81:
					keydownEventIndex = null
					document.getElementById('comic-action-panel').style.display='flex'
					break
				case 82:
					if (need_repair.length > 0) {
						keydownEventIndex = null
						repairComicImages()
					}
					break
				case 83:
					reOpenLastSlider()
					break
			}
		}
	} else {
		if (!shift) {
			switch (key) {
				case 27:
					closeComicPanel()
					break
			}
		}
	}
}