const xlecx = new XlecxAPI()

function xlecxChangePage(page, whitchbutton, updateTabIndex) {
	if (whitchbutton == 3) return
	let makeNewPage = false
	if (whitchbutton == 2) makeNewPage = true
	page = page || 1
	if (updateTabIndex == null) updateTabIndex = true
	let id
	if (makeNewPage) {
		id = createNewTab(`xlecxChangePage(${page}, 0, false)`, true, 0)
		if (id == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
	} else {
		id = activeTabComicId
		const thisTagIndex = GetTabIndexById(id)
		const passImages = tabs[thisTagIndex].page.getElementsByTagName('img')
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}

		if (updateTabIndex == true) tabs[thisTagIndex].addHistory(`xlecxChangePage(${page}, 0, false)`)
	}
	createNewXlecxTab(id, page)
}

function createNewXlecxTab(id, pageNumber) {
	if (id == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
	pageNumber = pageNumber || 1

	if (activeTabComicId == id) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const thisTabIndex = GetTabIndexById(id)
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`
	xlecx.getPage({page:pageNumber, random:true, category:true}, (err, result) => {
		if (document.getElementById(id) == undefined) return
		tabs[thisTabIndex].ir = false
		tabs[thisTabIndex].page.innerHTML = null
		checkBrowserTools(thisTabIndex)
		if (err) {
			browserError(err, thisTabIndex)
			return
		}
		tabs[thisTabIndex].rename(`Page ${pageNumber}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
		let container = document.createElement('div')
		container.classList.add("xlecx-container")
		let elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

		if (result.pagination[result.pagination.length - 1][1] > result.pagination[result.pagination.length - 2][1]) valueStorage = result.pagination[result.pagination.length - 1][1]
		else valueStorage = result.pagination[result.pagination.length - 2][1]

		if (valueStorage == null) valueStorage = pageNumber

		tabs[thisTabIndex].jp = 1
		tabs[thisTabIndex].tp = pageNumber
		tabs[thisTabIndex].mp = valueStorage
		if (activeTabComicId == id) {
			bjp.style.display = 'inline-block'
			bjp_i.value = pageNumber
			bjp_i.setAttribute('oninput', `inputLimit(this, ${valueStorage});browserJumpPage(1, Number(this.value))`)
			bjp_m_p.textContent = valueStorage
		}

		// Categories
		elementContainer = document.createElement('div')
		element = document.createElement('button')
		element.textContent = 'All Tags'
		element.onmousedown = e => {
			e.preventDefault()
			xlecxOpenAllTags(WhichMouseButton(e))
		}
		elementContainer.appendChild(element)
		for (let i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, WhichMouseButton(e))
			}
			elementContainer.appendChild(element)
		}
		container.appendChild(elementContainer)

		// Content
		elementContainerContainer = document.createElement('div')
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (let i = 0; i < result.content.length; i++) {
			element = document.createElement('div')
			valueStorage = ''
			if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
			html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

			if (result.content[i].pages == null) valueStorage = ''
			else valueStorage = `<span>${result.content[i].pages}</span>`

			html += `${valueStorage}<p>${result.content[i].title}</p>`
			if (Downloader.IsDownloading(0, result.content[i].id)) html += `<cid ssite="0" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid>`
			else html += `<button ssite="0" cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.content[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(WhichMouseButton(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		// Pagination
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-pagination")
		for (let i = 0; i < result.pagination.length; i++) {
			element = document.createElement('button')
			if (result.pagination[i][1] == null) {
				element.setAttribute('disable', true)
				element.textContent = result.pagination[i][0]
			} else {
				element.textContent = result.pagination[i][0]
				element.setAttribute('p', result.pagination[i][1])
				element.onmousedown = e => {
					e.preventDefault()
					xlecxChangePage(Number(e.target.getAttribute('p')), WhichMouseButton(e))
				}
			}
			
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		// Random
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (let i = 0; i < result.random.length; i++) {
			element = document.createElement('div')
			valueStorage = ''
			if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
			html = `<img src="${xlecx.baseURL+result.random[i].thumb}"${valueStorage}>`

			if (result.random[i].pages == null) valueStorage = ''
			else valueStorage = `<span>${result.random[i].pages}</span>`

			html += `${valueStorage}<p>${result.random[i].title}</p>`
			if (Downloader.IsDownloading(0, result.random[i].id)) html += `<cid ssite="0" cid="${result.random[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid>`
			else html += `<button ssite="0" cid="${result.random[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.random[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(WhichMouseButton(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		container.appendChild(elementContainerContainer)

		tabs[thisTabIndex].page.appendChild(container)
		clearDownloadedComics(tabs[thisTabIndex].page, 0)
	})
}

function xlecxOpenPost(whitchbutton, id, updateTabIndex) {
	if (whitchbutton == 3) return
	let makeNewPage = false, pageId, thisTabIndex
	if (whitchbutton == 2) makeNewPage = true
	if (updateTabIndex == null) updateTabIndex = true
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenPost(0, '${id}', false)`, true, 0)
		if (pageId == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
		thisTabIndex = GetTabIndexById(pageId)
	} else {
		pageId = activeTabComicId
		thisTabIndex = GetTabIndexById(pageId)
		const passImages = tabs[thisTabIndex].page.getElementsByTagName('img')
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`xlecxOpenPost(0, '${id}', false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`
	db.have.findOne({s:0, i:id}, (err, haveDoc) => {
		if (err) { error(err); return }
		let have_in_have, have_comic = false
		if (haveDoc == undefined) have_in_have = false
		else {
			have_in_have = true
			if (haveDoc.d != undefined) have_comic = true
		}

		xlecx.getComic(id, {}, (err, result) => {
			if (document.getElementById(pageId) == undefined) return
			tabs[thisTabIndex].ir = false
			tabs[thisTabIndex].page.innerHTML = null
			checkBrowserTools(thisTabIndex)
			if (err) {
				browserError(err, thisTabIndex)
				return
			}
			tabs[thisTabIndex].rename(result.title)
			tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
			let image_container = document.createElement('div')
			image_container.classList.add('xlecx-image-container-1x1')
			let containerContainer = document.createElement('div')
			containerContainer.classList.add('xlecx-container-one-row')
			let container = document.createElement('div')
			let element, miniElement
			container.innerHTML = `<p class="xlecx-post-title">${result.title}</p>`
			if (have_comic == true) container.innerHTML += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
			else if (have_in_have == true) container.innerHTML += `<div class="browser-comic-have" sssite="0" ccid="${id}"><button class="remove-from-have" onclick="RemoveFromHave(0, '${id}', this)">You Have This Comic.</button></div>`
			else if (Downloader.IsDownloading(0, id)) container.innerHTML += `<div class="browser-comic-have" sssite="0" ccid="${id}"><p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p></div>`
			else container.innerHTML += `<div class="browser-comic-have" sssite="0" ccid="${id}"><button onclick="xlecxDownloader('${id}')">Download</button><button class="add-to-have" onclick="AddToHave(0, '${id}')">Add To Have</button></div>`

			// Groups
			if (result.groups != undefined) {
				element = document.createElement('div')
				element.classList.add('xlecx-post-tags')
				element.innerHTML = "Group: "
				for(let i = 0; i < result.groups.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.groups[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 1, WhichMouseButton(e))
					}
					element.appendChild(miniElement)
				}
				container.append(element)
			}

			// Artists
			if (result.artists != undefined) {
				element = document.createElement('div')
				element.classList.add('xlecx-post-tags')
				element.innerHTML = "Artist: "
				for(let i = 0; i < result.artists.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.artists[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 2, WhichMouseButton(e))
					}
					element.appendChild(miniElement)
				}
				container.append(element)
			}

			// Parody
			if (result.parody != undefined) {
				element = document.createElement('div')
				element.classList.add('xlecx-post-tags')
				element.innerHTML = "Parody: "
				for(let i = 0; i < result.parody.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.parody[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 3, WhichMouseButton(e))
					}
					element.appendChild(miniElement)
				}
				container.append(element)
			}

			// Tags
			if (result.tags != undefined) {
				element = document.createElement('div')
				element.classList.add('xlecx-post-tags')
				element.innerHTML = "Tag: "
				for(let i = 0; i < result.tags.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.tags[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 4, WhichMouseButton(e))
					}
					element.appendChild(miniElement)
				}
				container.append(element)
			}

			// Images
			if (have_comic == true) {
				db.comics.findOne({s:0, p:id}, (err, doc) => {
					if (err) { error(err); return }
					let comic_id = doc._id
					let image, html = ''
					
					if (err) { error(err); return }
					ImagesCount = doc.c || null
					if (ImagesCount == null) return
					formats = doc.f || null
					if (formats == null) return
					image = doc.i
					

					let lastIndex = formats[0][1]
					let thisForamat = formats[0][2]
					let src = ''
					let formatIndex = 0
					for (let i = 0; i < ImagesCount; i++) {
						if (i <= lastIndex) {
							src = `${dirUL}/${comic_id}${image}/${image}-${i}.${thisForamat}`
							if (!fs.existsSync(src)) {
								need_repair.push([src, i])
								src = 'Image/no-img-300x300.png'
							}
							html += `<img data-src="${src}">`
						} else {
							formatIndex++
							try {
								lastIndex = formats[formatIndex][1]
								thisForamat = formats[formatIndex][2]
							} catch(err) {
								for (let j = i; j < ImagesCount; j++) html += `<img data-src="Image/no-img-300x300.png">`
								break
							}
							
							src = `${dirUL}/${comic_id}${image}/${image}-${i}.${thisForamat}`
							if (!fs.existsSync(src)) {
								need_repair.push([src, i])
								src = 'Image/no-img-300x300.png'
							}
							html += `<img data-src="${src}">`
						}
					}
					image_container.innerHTML = html

					const LoadingImages = image_container.getElementsByTagName('img')

					for (let i = 0; i < LoadingImages.length; i++) {
						imageLoadingObserver.observe(LoadingImages[i])
					}
				})
			} else {
				image_container.setAttribute('img-con', true)
				for (let i = 0; i < result.images.length; i++) {
					image_container.innerHTML += `<img data-src="${xlecx.baseURL}/${result.images[i].thumb}">`
				}
				const LoadingImages = image_container.getElementsByTagName('img')

				for (let i = 0; i < LoadingImages.length; i++) {
					imageLoadingObserver.observe(LoadingImages[i])
				}
			}

			container.appendChild(image_container)
			containerContainer.appendChild(container)

			if (result.related != undefined) {
				let bigContainer = document.createElement('div')
				element = document.createElement('p')
				element.classList.add('xlecx-post-title')
				element.textContent = 'Related:'
				bigContainer.appendChild(element)

				container = document.createElement('div')
				container.classList.add('xlecx-post-container')
				for (let i = 0; i < result.related.length; i++) {
					element = document.createElement('div')
					valueStorage = ''
					if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
					html = `<img src="${xlecx.baseURL+result.related[i].thumb}"${valueStorage}>`

					if (result.related[i].pages == null) valueStorage = ''
					else valueStorage = `<span>${result.related[i].pages}</span>`

					html += `${valueStorage}<p>${result.related[i].title}</p>`
					if (Downloader.IsDownloading(0, result.related[i].id)) html += `<cid ssite="0" cid="${result.related[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid>`
					else html += `<button ssite="0" cid="${result.related[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
					element.innerHTML = html
					miniElement = document.createElement('div')
					miniElement.setAttribute('id', result.related[i].id)
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenPost(WhichMouseButton(e), e.target.getAttribute('id'))
					}
					element.appendChild(miniElement)
					container.appendChild(element)
				}
				bigContainer.appendChild(container)


				containerContainer.appendChild(bigContainer)
			}

			tabs[thisTabIndex].page.appendChild(containerContainer)
			clearDownloadedComics(tabs[thisTabIndex].page, 0)
		})
	})
}

function xlecxOpenCategory(name, page, shortName, whitchbutton, updateTabIndex) {
	if (whitchbutton == 3) return
	let makeNewPage = false
	if (whitchbutton == 2) makeNewPage = true
	name = name || null
	page = page || 1
	shortName = shortName || null
	if (name == null || shortName == null) return
	if (updateTabIndex == null) updateTabIndex = true
	let pageId = activeTabComicId, thisTabIndex
	
	
	
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenCategory('${name}', ${page}, '${shortName}', 0, false)`, true, 0)
		if (pageId == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
		thisTabIndex = GetTabIndexById(pageId)
	} else {
		thisTabIndex = GetTabIndexById(pageId)
		const passImages = tabs[thisTabIndex].page.getElementsByTagName('img')
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`xlecxOpenCategory('${name}', ${page}, '${shortName}', 0, false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabs[thisTabIndex].options = [name, shortName]
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`
	xlecx.getCategory(name, {page:page, random:true, category:true}, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			browserError(err, thisTabIndex)
			return
		}
		tabs[thisTabIndex].rename(`${shortName} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
		let container = document.createElement('div')
		container.classList.add("xlecx-container")
		let elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

		if (result.pagination == undefined) valueStorage = 0
		else if (result.pagination[result.pagination.length - 1][1] > result.pagination[result.pagination.length - 2][1]) valueStorage = result.pagination[result.pagination.length - 1][1]
		else valueStorage = result.pagination[result.pagination.length - 2][1]

		if (valueStorage == null) valueStorage = page

		tabs[thisTabIndex].jp = 2
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = valueStorage
		if (activeTabComicId == pageId && valueStorage != 0) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${valueStorage});browserJumpPage(2, Number(this.value))`)
			bjp_m_p.textContent = valueStorage
		}

		// Categories
		elementContainer = document.createElement('div')
		for (let i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, WhichMouseButton(e))
			}
			elementContainer.appendChild(element)
		}
		container.appendChild(elementContainer)

		// Content
		elementContainerContainer = document.createElement('div')
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (let i = 0; i < result.content.length; i++) {
			element = document.createElement('div')
			valueStorage = ''
			if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
			html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

			if (result.content[i].pages == null) valueStorage = ''
			else valueStorage = `<span>${result.content[i].pages}</span>`

			html += `${valueStorage}<p>${result.content[i].title}</p>`
			if (Downloader.IsDownloading(0, result.content[i].id)) html += `<cid ssite="0" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid>`
			else html += `<button ssite="0" cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.content[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(WhichMouseButton(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		// Pagination
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-pagination")
		for (let i = 0; i < result.pagination.length; i++) {
			element = document.createElement('button')
			if (result.pagination[i][1] == null) {
				element.setAttribute('disable', true)
				element.textContent = result.pagination[i][0]
			} else {
				element.textContent = result.pagination[i][0]
				element.setAttribute('p', result.pagination[i][1])
				element.onmousedown = e => {
					e.preventDefault()
					xlecxOpenCategory(name, Number(e.target.getAttribute('p')), shortName, WhichMouseButton(e))
				}
			}
			
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		
		// Random
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (let i = 0; i < result.random.length; i++) {
			element = document.createElement('div')
			valueStorage = ''
			if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
			html = `<img src="${xlecx.baseURL+result.random[i].thumb}"${valueStorage}>`

			if (result.random[i].pages == null) valueStorage = ''
			else valueStorage = `<span>${result.random[i].pages}</span>`

			html += `${valueStorage}<p>${result.random[i].title}</p>`
			if (Downloader.IsDownloading(0, result.random[i].id)) html += `<cid ssite="0" cid="${result.random[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid>`
			else html += `<button ssite="0" cid="${result.random[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.random[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(WhichMouseButton(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		container.appendChild(elementContainerContainer)

		tabs[thisTabIndex].page.appendChild(container)
		clearDownloadedComics(tabs[thisTabIndex].page, 0)
	})
}

function xlecxOpenTagContentMaker(result, thisTabIndex, name, whitch) {
	let container = document.createElement('div')
	container.classList.add("xlecx-container")
	let elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

	// Categories
	elementContainer = document.createElement('div')
	element = document.createElement('button')
	element.textContent = 'All Tags'
	element.onmousedown = e => {
		e.preventDefault()
		xlecxOpenAllTags(WhichMouseButton(e))
	}
	elementContainer.appendChild(element)
	for (let i = 0; i < result.categories.length; i++) {
		element = document.createElement('button')
		element.setAttribute('c', result.categories[i].url)
		element.textContent = result.categories[i].name
		element.onmousedown = e => {
			e.preventDefault()
			xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, WhichMouseButton(e))
		}
		elementContainer.appendChild(element)
	}
	container.appendChild(elementContainer)

	// Content
	elementContainerContainer = document.createElement('div')
	elementContainer = document.createElement('div')
	elementContainer.classList.add("xlecx-post-container")
	for (let i = 0; i < result.content.length; i++) {
		element = document.createElement('div')
		valueStorage = ''
		if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
		html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

		if (result.content[i].pages == null) valueStorage = ''
		else valueStorage = `<span>${result.content[i].pages}</span>`

		html += `${valueStorage}<p>${result.content[i].title}</p>`
		if (Downloader.IsDownloading(0, result.content[i].id)) html += `<cid ssite="0" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid>`
		else html += `<button ssite="0" cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
		element.innerHTML = html
		miniElement = document.createElement('div')
		miniElement.setAttribute('id', result.content[i].id)
		miniElement.onmousedown = e => {
			e.preventDefault()
			xlecxOpenPost(WhichMouseButton(e), e.target.getAttribute('id'))
		}
		element.appendChild(miniElement)
		elementContainer.appendChild(element)
	}
	elementContainerContainer.appendChild(elementContainer)

	// Pagination
	if (result.pagination != undefined) {
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-pagination")
		for (let i = 0; i < result.pagination.length; i++) {
			element = document.createElement('button')
			if (result.pagination[i][1] == null) {
				element.setAttribute('disable', true)
				element.textContent = result.pagination[i][0]
			} else {
				element.textContent = result.pagination[i][0]
				element.setAttribute('p', result.pagination[i][1])
				element.onmousedown = e => {
					e.preventDefault()
					xlecxOpenTag(name, Number(e.target.getAttribute('p')), whitch, WhichMouseButton(e))
				}
			}
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
	}

	container.appendChild(elementContainerContainer)
	tabs[thisTabIndex].page.appendChild(container)
	clearDownloadedComics(tabs[thisTabIndex].page, 0)
}

function xlecxOpenTag(name, page, whitch, whitchbutton, updateTabIndex) {
	if (whitchbutton == 3) return
	let makeNewPage = false, pageId, thisTabIndex
	if (whitchbutton == 2) makeNewPage = true
	name = name || null
	page = page || 1
	whitch = whitch || 1
	if (name == null) return
	if (updateTabIndex == null) updateTabIndex = true
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenTag('${name}', ${page}, ${whitch}, 0, false)`, true, 0)
		if (pageId == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
		thisTabIndex = GetTabIndexById(pageId)
	} else {
		pageId = activeTabComicId
		thisTabIndex = GetTabIndexById(pageId)
		const passImages = tabs[thisTabIndex].page.getElementsByTagName('img')
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`xlecxOpenTag('${name}', ${page}, ${whitch}, 0, false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabs[thisTabIndex].options = [name, whitch]
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`
	switch (whitch) {
		case 1:
			xlecx.getGroup(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				checkBrowserTools(thisTabIndex)
				tabs[thisTabIndex].page.innerHTML = null
				if (err) {
					browserError(err, thisTabIndex)
					return
				}
				tabs[thisTabIndex].rename(`${name} - ${page}`)
				tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
				let valueStorage
	
				if (result.pagination == undefined) valueStorage = 0
				else if (result.pagination[result.pagination.length - 1][1] > result.pagination[result.pagination.length - 2][1]) valueStorage = result.pagination[result.pagination.length - 1][1]
				else valueStorage = result.pagination[result.pagination.length - 2][1]
	
				if (valueStorage == null) valueStorage = page
	
				tabs[thisTabIndex].jp = 3
				tabs[thisTabIndex].tp = page
				tabs[thisTabIndex].mp = valueStorage
				if (activeTabComicId == pageId && valueStorage != 0) {
					bjp.style.display = 'inline-block'
					bjp_i.value = page
					bjp_i.setAttribute('oninput', `inputLimit(this, ${valueStorage});browserJumpPage(3, Number(this.value))`)
					bjp_m_p.textContent = valueStorage
				}
				xlecxOpenTagContentMaker(result, thisTabIndex, name, whitch)
			})
			break
		case 2:
			xlecx.getArtist(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				checkBrowserTools(thisTabIndex)
				tabs[thisTabIndex].page.innerHTML = null
				if (err) {
					browserError(err, thisTabIndex)
					return
				}
				tabs[thisTabIndex].rename(`${name} - ${page}`)
				tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
				let valueStorage
	
				if (result.pagination == undefined) valueStorage = 0
				else if (result.pagination[result.pagination.length - 1][1] > result.pagination[result.pagination.length - 2][1]) valueStorage = result.pagination[result.pagination.length - 1][1]
				else valueStorage = result.pagination[result.pagination.length - 2][1]
	
				if (valueStorage == null) valueStorage = page
	
				tabs[thisTabIndex].jp = 3
				tabs[thisTabIndex].tp = page
				tabs[thisTabIndex].mp = valueStorage
				if (activeTabComicId == pageId && valueStorage != 0) {
					bjp.style.display = 'inline-block'
					bjp_i.value = page
					bjp_i.setAttribute('oninput', `inputLimit(this, ${valueStorage});browserJumpPage(3, Number(this.value))`)
					bjp_m_p.textContent = valueStorage
				}
				xlecxOpenTagContentMaker(result, thisTabIndex, name, whitch)
			})
			break
		case 3:
			xlecx.getParody(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				checkBrowserTools(thisTabIndex)
				tabs[thisTabIndex].page.innerHTML = null
				if (err) {
					browserError(err, thisTabIndex)
					return
				}
				tabs[thisTabIndex].rename(`${name} - ${page}`)
				tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
				let valueStorage
	
				if (result.pagination == undefined) valueStorage = 0
				else if (result.pagination[result.pagination.length - 1][1] > result.pagination[result.pagination.length - 2][1]) valueStorage = result.pagination[result.pagination.length - 1][1]
				else valueStorage = result.pagination[result.pagination.length - 2][1]
	
				if (valueStorage == null) valueStorage = page
	
				tabs[thisTabIndex].jp = 3
				tabs[thisTabIndex].tp = page
				tabs[thisTabIndex].mp = valueStorage
				if (activeTabComicId == pageId && valueStorage != 0) {
					bjp.style.display = 'inline-block'
					bjp_i.value = page
					bjp_i.setAttribute('oninput', `inputLimit(this, ${valueStorage});browserJumpPage(3, Number(this.value))`)
					bjp_m_p.textContent = valueStorage
				}
				xlecxOpenTagContentMaker(result, thisTabIndex, name, whitch)
			})
			break
		case 4:
			xlecx.getTag(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				checkBrowserTools(thisTabIndex)
				tabs[thisTabIndex].page.innerHTML = null
				if (err) {
					browserError(err, thisTabIndex)
					return
				}
				tabs[thisTabIndex].rename(`${name} - ${page}`)
				tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
				let valueStorage
	
				if (result.pagination == undefined) valueStorage = 0
				else if (result.pagination[result.pagination.length - 1][1] > result.pagination[result.pagination.length - 2][1]) valueStorage = result.pagination[result.pagination.length - 1][1]
				else valueStorage = result.pagination[result.pagination.length - 2][1]
	
				if (valueStorage == null) valueStorage = page
	
				tabs[thisTabIndex].jp = 3
				tabs[thisTabIndex].tp = page
				tabs[thisTabIndex].mp = valueStorage
				if (activeTabComicId == pageId && valueStorage != 0) {
					bjp.style.display = 'inline-block'
					bjp_i.value = page
					bjp_i.setAttribute('oninput', `inputLimit(this, ${valueStorage});browserJumpPage(3, Number(this.value))`)
					bjp_m_p.textContent = valueStorage
				}
				xlecxOpenTagContentMaker(result, thisTabIndex, name, whitch)
			})
			break
	}
}

function xlecxSearch(text, page, whitchbutton, updateTabIndex) {
	if (whitchbutton == 3) return
	let makeNewPage = false, pageId, thisTabIndex
	if (whitchbutton == 2) makeNewPage = true
	text = text || null
	if (text == null) return
	page = page || 1
	if (updateTabIndex == null) updateTabIndex = true

	if (makeNewPage) {
		pageId = createNewTab(`xlecxSearch('${text}', ${page}, 0, false)`, true, 0)
		if (pageId == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
		thisTabIndex = GetTabIndexById(pageId)
	} else {
		pageId = activeTabComicId
		thisTabIndex = GetTabIndexById(pageId)
		const passImages = tabs[thisTabIndex].page.getElementsByTagName('img')
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`xlecxSearch('${text}', ${page}, 0, false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}
	
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`
	xlecx.search(text, {page:page, category:true}, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			browserError(err, thisTabIndex)
			return
		}
		tabs[thisTabIndex].rename(`S: ${convertToURL(text, true)} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
		let container = document.createElement('div')
		container.classList.add("xlecx-container")
		let elementContainerContainer = document.createElement('div')
		let elementContainer, element, miniElement, html, valueStorage

		if (result.pagination == undefined) valueStorage = 0
		else if (result.pagination[result.pagination.length - 1][1] > result.pagination[result.pagination.length - 2][1]) valueStorage = result.pagination[result.pagination.length - 1][1]
		else valueStorage = result.pagination[result.pagination.length - 2][1]

		if (valueStorage == null) valueStorage = page

		tabs[thisTabIndex].jp = 0
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = valueStorage
		if (activeTabComicId == pageId && valueStorage != 0) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${valueStorage});browserJumpPage(0, Number(this.value))`)
			bjp_m_p.textContent = valueStorage
		}

		// Categories
		elementContainer = document.createElement('div')
		element = document.createElement('button')
		element.textContent = 'All Tags'
		element.onmousedown = e => {
			e.preventDefault()
			xlecxOpenAllTags(WhichMouseButton(e))
		}
		elementContainer.appendChild(element)
		for (let i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, WhichMouseButton(e))
			}
			elementContainer.appendChild(element)
		}
		container.appendChild(elementContainer)

		// Content
		if (result.content != undefined) {
			elementContainer = document.createElement('div')
			elementContainer.classList.add("xlecx-post-container")
			for (let i = 0; i < result.content.length; i++) {
				element = document.createElement('div')
				valueStorage = ''
				if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
				html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

				if (result.content[i].pages == null) valueStorage = ''
				else valueStorage = `<span>${result.content[i].pages}</span>`

				html += `${valueStorage}<p>${result.content[i].title}</p>`
				if (Downloader.IsDownloading(0, result.content[i].id)) html += `<cid ssite="0" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></span></cid>`
				else html += `<button ssite="0" cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
				element.innerHTML = html
				miniElement = document.createElement('div')
				miniElement.setAttribute('id', result.content[i].id)
				miniElement.onmousedown = e => {
					e.preventDefault()
					xlecxOpenPost(WhichMouseButton(e), e.target.getAttribute('id'))
				}
				element.appendChild(miniElement)
				elementContainer.appendChild(element)
			}
			elementContainerContainer.appendChild(elementContainer)

			// Pagination
			if (result.pagination != undefined) {
				elementContainer = document.createElement('div')
				elementContainer.classList.add("xlecx-pagination")
				for (let i = 0; i < result.pagination.length; i++) {
					element = document.createElement('button')
					if (result.pagination[i][1] == null) {
						element.setAttribute('disable', true)
						element.textContent = result.pagination[i][0]
					} else {
						element.textContent = result.pagination[i][0]
						element.setAttribute('p', result.pagination[i][1])
						element.onmousedown = e => {
							e.preventDefault()
							xlecxSearch(text, Number(e.target.getAttribute('p')), WhichMouseButton(e))
						}
					}
					
					elementContainer.appendChild(element)
				}
				elementContainerContainer.appendChild(elementContainer)
			}
		}

		container.appendChild(elementContainerContainer)
		tabs[thisTabIndex].page.appendChild(container)
		clearDownloadedComics(tabs[thisTabIndex].page, 0)
	})
}

function xlecxOpenAllTags(whitchbutton, updateTabIndex) {
	if (whitchbutton == 3) return
	let makeNewPage = false, pageId, thisTabIndex
	if (whitchbutton == 2) makeNewPage = true
	if (updateTabIndex == null) updateTabIndex = true
	if (makeNewPage) {
		pageId = createNewTab('xlecxOpenAllTags(0, false)', true, 0)
		if (pageId == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
		thisTabIndex = GetTabIndexById(pageId)
	} else {
		pageId = activeTabComicId
		thisTabIndex = GetTabIndexById(pageId)
		const passImages = tabs[thisTabIndex].page.getElementsByTagName('img')
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory('xlecxOpenAllTags(0, false)')
	}

	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`
	xlecx.getAllTags(true, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			browserError(err, pageId)
			return
		}
		tabs[thisTabIndex].rename('All Tags')
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/xlecx-30x30.jpg')
		let container = document.createElement('div')
		container.classList.add("xlecx-container")
		let elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

		// Categories
		elementContainer = document.createElement('div')
		for (let i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, WhichMouseButton(e))
			}
			elementContainer.appendChild(element)
		}
		container.appendChild(elementContainer)

		// Tags
		elementContainerContainer = document.createElement('div')
		elementContainerContainer.style.backgroundColor = '#333'
		element = document.createElement('div')
		element.classList.add('xlecx-tags-search')
		element.innerHTML = '<input type="text" oninput="searchFilter(this.value, this.parentElement.parentElement.getElementsByClassName(\'xlecx-post-tags\')[0], this.parentElement.parentElement.getElementsByClassName(\'alert alert-danger\')[0])" placeholder="Search in Tags...">'
		elementContainerContainer.appendChild(element)
		element = document.createElement('div')
		element.classList.add('alert')
		element.classList.add('alert-danger')
		element.style.display = 'none'
		element.textContent = 'No Tag has been Found.'
		elementContainerContainer.appendChild(element)
		elementContainer = document.createElement('div')
		elementContainer.classList.add('xlecx-post-tags')
		for (let i = 0; i < result.tags.length; i++) {
			element = document.createElement('button')
			element.innerHTML = result.tags[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenTag(e.target.textContent, 1, 4, WhichMouseButton(e))
			}
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		container.appendChild(elementContainerContainer)

		tabs[thisTabIndex].page.appendChild(container)
	})
}

function xlecxJumpPage(index, page) {
	switch (index) {
		case 0:
			searchTimer = setTimeout(() => {
				xlecxSearch(tabs[activeTabIndex].s.replace("'", "\\'"), page, 0)
			}, 185)
			break
		case 1:
			searchTimer = setTimeout(() => {
				xlecxChangePage(page, 0)
			}, 185)
			break
		case 2:
			searchTimer = setTimeout(() => {
				xlecxOpenCategory(tabs[activeTabIndex].options[0], page, tabs[activeTabIndex].options[1], 0)
			}, 185)
			break
		case 3:
			searchTimer = setTimeout(() => {
				xlecxOpenTag(tabs[activeTabIndex].options[0], page, tabs[activeTabIndex].options[1], 0)
			}, 185)
			break
	}
}

function xlecxDownloader(id) {
	if (Downloader.IsDownloading(0, id)) { PopAlert('You are Downloading This Comic.', 'danger'); return }
	IsHavingComic(0, id, (have, downloaded) => {
		if (have == true) { PopAlert('You Already Have This Comic.', 'danger'); return }
		const index = Downloader.AddToStarting(0, id)
		xlecx.getComic(id, {related:false}, (err, result) => {
			if (err) { Downloader.StopFromStarting(index); PopAlert(err, 'danger'); return }
			
			let quality = 0, downloadImageList = []
			if (result.images[0].src == result.images[0].thumb) quality = 1
			else quality = setting.img_graphic
	
			if (quality == 0) {
				for (let i = 0; i < result.images.length; i++) downloadImageList.push(xlecx.baseURL+result.images[i].thumb)
			} else {
				for (let i = 0; i < result.images.length; i++) downloadImageList.push(xlecx.baseURL+result.images[i].src)
			}
	
			const sendingResult = {}
			sendingResult.title = result.title
			if (result.groups != undefined)	{
				sendingResult.groups = []
				for (let i = 0; i < result.groups.length; i++) sendingResult.groups.push(result.groups[i].name)
			}
			if (result.artists != undefined)	{
				sendingResult.artists = []
				for (let i = 0; i < result.artists.length; i++) sendingResult.artists.push(result.artists[i].name)
			}
			if (result.parody != undefined)	{
				sendingResult.parody = []
				for (let i = 0; i < result.parody.length; i++) sendingResult.parody.push(result.parody[i].name)
			}
			if (result.tags != undefined)	{
				sendingResult.tags = []
				for (let i = 0; i < result.tags.length; i++) sendingResult.tags.push(result.tags[i].name)
			}
			Downloader.Add(index, result.url, xlecx.baseURL+'/'+result.images[0].thumb, downloadImageList, sendingResult)
		})
	})
}

function xlecxRepairComicInfoGetInfo(id, whitch) {
	if (whitch > 5) { PopAlert("This Comic Does not have This Info."); return }
	let comic_id = Number(comicPanel.getAttribute('cid'))
	loading.reset(0)
	loading.show('Connecting To Web...')
	xlecx.getComic(id, {related:false}, (err, result) => {
		if (err) { loading.hide(); error(err); return }
		let neededResult
		switch (whitch) {
			case 0:
				db.comics.update({_id:comic_id}, { $set: {n:result.title.toLowerCase()} }, {}, (err) => {
					if (err) { loading.hide(); error(err); return }
					loading.forward('Repairing Name...')
					document.getElementById('c-p-t').textContent = result.title
					loading.forward()
					loading.hide()
					PopAlert('Comic Name has been Repaired!')
				})
				break
			case 1:
				RepairGroup(result.groups, comic_id)
				break
			case 2:
				RepairArtist(result.artists, comic_id)
				break
			case 3:
				RepairParody(result.parody, comic_id)
				break
			case 4:
				RepairTag(result.tags, comic_id)
				break
			case 5:
				loading.hide()
				neededResult = result.images || null
				if (neededResult == null) {
					PopAlert('This Comic has no Image.', 'danger')
					openComic(comic_id)
					return
				}

				procressPanel.reset(need_repair.length)
				procressPanel.config({ bgClose:false, closeBtn:false, miniLog:true })
				procressPanel.show(`Downloading Images (0/${need_repair.length})`)

				const newList = [], saveList = []
				for (let i = 0; i < need_repair.length; i++) {
					const thumb = xlecx.baseURL+neededResult[need_repair[i][1]].thumb
					newList.push(thumb)
					saveList.push(need_repair[i][0]+need_repair[i][2]+'-'+need_repair[i][1]+'.'+fileExt(thumb))
				}

				const urls = []
				for (let i = 0; i < neededResult.length; i++) urls.push(neededResult[i].thumb)
				let formatList = Downloader.MakeFormatList(null, urls)
				db.comics.update({_id:off_comic_id}, { $set: {f:formatList} }, {}, err => {})

				ImageListDownloader(newList, 0, saveList, false, err => {
					if (err) {
						procressPanel.config({ bgClose:true, closeBtn:true })
						PopAlert('There was an Error.', 'danger')
					} else {
						procressPanel.reset(1)
						PopAlert('Comic Undownloaded Images Has Beed Downloaded.')
					}
					openComic(comic_id)
				})
				break
		}
	})
}

function xlecxRepairAllComicInfo(id, comic_id) {
	xlecx.getComic(id, {related:false}, (err, result) => {
		if (err) {
			procressPanel.add(`"${repair_all_list[0][0]}" -> ${err}`, 'danger')
			if (err != "You don't have the permission to View this Page.") repair_all_error_list.push(repair_all_list[0])
			repair_all_list.shift()
			RepairAllComicLoop()
			return
		}

		const title = result.title.toLowerCase() || null
		let neededResult, groups = null, artists = null, parodies = null, tags = null
		
		neededResult = result.groups || null
		if (neededResult != null) {
			const groupsList = []
			for (let i in neededResult) groupsList.push(neededResult[i].name)
			groups = CreateGroup(groupsList)
		}

		neededResult = result.artists || null
		if (neededResult != null) {
			const artistsList = []
			for (let i in neededResult) artistsList.push(neededResult[i].name)
			artists = CreateArtist(artistsList)
		}

		neededResult = result.parody || null
		if (neededResult != null) {
			const parodyList = []
			for (let i in neededResult) parodyList.push(neededResult[i].name)
			parodies = CreateParody(parodyList)
		}

		neededResult = result.tags || null
		if (neededResult != null) {
			const tagsList = []
			for (let i in neededResult) tagsList.push(neededResult[i].name)
			tags = CreateTag(tagsList)
		}

		db.comics.update({_id:comic_id}, { $set: {n:title,g:groups,a:artists,d:parodies,t:tags} }, {}, (err) => {
			if (err) procressPanel.add(`UpdateComicName -> "${repair_all_list[0][0]}" -> ${err}`, 'danger')
			repair_all_list.shift()
			RepairAllComicLoop()
		})
	})
}