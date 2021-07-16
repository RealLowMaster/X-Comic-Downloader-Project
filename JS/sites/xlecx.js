// Xlecx
function openXlecxBrowser() {
	thisSite = 0
	needReload = false
	document.getElementById('add-new-tab').setAttribute('onclick', "createNewXlecxTab(createNewTab('xlecxChangePage(1, false, false)'))")
	const id = createNewTab('xlecxChangePage(1, false, false)')
	if (id == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
	createNewXlecxTab(id)
	document.getElementById('browser').style.display = 'grid'
}

function createNewXlecxTab(id, pageNumber) {
	if (id == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
	const pageContent = document.getElementById(id)
	pageNumber = pageNumber || 1

	if (activeTabComicId == id) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const tab = tabsContainer.querySelector(`[pi="${id}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	xlecx.getPage({page:pageNumber, random:true, category:true}, (err, result) => {
		if (document.getElementById(id) == undefined) return
		tabs[thisTabIndex].ir = false
		pageContent.innerHTML = ''
		if (err) {
			browserError(err, id)
			return
		}
		tabArea.textContent = `Page ${pageNumber}`
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

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
			xlecxOpenAllTags(checkMiddleMouseClick(e))
		}
		elementContainer.appendChild(element)
		for (var i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, checkMiddleMouseClick(e))
			}
			elementContainer.appendChild(element)
		}
		container.appendChild(elementContainer)

		// Content
		elementContainerContainer = document.createElement('div')
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (var i = 0; i < result.content.length; i++) {
			element = document.createElement('div')
			valueStorage = ''

			if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'

			html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

			if (result.content[i].pages == null)
				valueStorage = ''
			else
				valueStorage = `<span>${result.content[i].pages}</span>`

			html += `${valueStorage}<p>${result.content[i].title}</p>`
			if (IsDownloading(result.content[i].id))
				html += `<cid cid="${result.content[i].id}"><span class="spin spin-success"></span></cid>`
			else
				html += `<button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.content[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		// Pagination
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-pagination")
		for (var i = 0; i < result.pagination.length; i++) {
			element = document.createElement('button')
			if (result.pagination[i][1] == null) {
				element.setAttribute('disable', true)
				element.textContent = result.pagination[i][0]
			} else {
				element.textContent = result.pagination[i][0]
				element.setAttribute('p', result.pagination[i][1])
				element.onmousedown = e => {
					e.preventDefault()
					xlecxChangePage(Number(e.target.getAttribute('p')), checkMiddleMouseClick(e))
				}
			}
			
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		// Random
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (var i = 0; i < result.random.length; i++) {
			element = document.createElement('div')
			valueStorage = ''

			if (setting.lazy_loading == true)
				valueStorage = ' loading="lazy"'

			html = `<img src="${xlecx.baseURL+result.random[i].thumb}"${valueStorage}>`

			if (result.random[i].pages == null)
				valueStorage = ''
			else
				valueStorage = `<span>${result.random[i].pages}</span>`

			html += `${valueStorage}<p>${result.random[i].title}</p>`
			if (IsDownloading(result.random[i].id))
				html += `<cid cid="${result.random[i].id}"><span class="spin spin-success"></span></cid>`
			else
				html += `<button cid="${result.random[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.random[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		container.appendChild(elementContainerContainer)

		pageContent.appendChild(container)
		clearDownloadedComics(pageContent, 0)
	})
}

function xlecxOpenPost(makeNewPage, id, updateTabIndex) {
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	
	var page, pageId
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenPost(false, '${id}', false)`)
		if (pageId == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
		page = document.getElementById(pageId)
	} else {
		pageId = activeTabComicId
		const passImageCon = document.getElementById(pageId).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		page = document.getElementById(pageId)
		page.innerHTML = ''
		page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].addHistory(`xlecxOpenPost(false, '${id}', false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const tab = tabsContainer.querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	db.have.findOne({s:0, i:id}, (err, haveDoc) => {
		if (err) { error(err); return }
		var have_in_have, have_comic = false
		if (haveDoc == undefined)
			have_in_have = false
		else {
			have_in_have = true
			if (haveDoc.d != undefined) have_comic = true
		}

		xlecx.getComic(id, {}, (err, result) => {
			if (document.getElementById(pageId) == undefined) return
			tabs[thisTabIndex].ir = false
			page.innerHTML = ''
			if (err) {
				browserError(err, pageId)
				return
			}
			tabArea.textContent = result.title
			var image_container = document.createElement('div')
			image_container.classList.add('xlecx-image-container-1x1')
			var containerContainer = document.createElement('div')
			containerContainer.classList.add('xlecx-container-one-row')
			var container = document.createElement('div')
			var element, miniElement
			container.innerHTML = `<p class="xlecx-post-title">${result.title}</p>`
			if (have_comic == true)
				container.innerHTML += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
			else if (have_in_have == true)
				container.innerHTML += `<div class="browser-comic-have" ccid="${id}"><button class="remove-from-have" onclick="RemoveFromHave(0, '${id}', this)">You Have This Comic.</button></div>`
			else if (IsDownloading(id))
				container.innerHTML += `<div class="browser-comic-have" ccid="${id}"><p>Downloading... <span class="spin spin-success"></span><p></div>`
			else
				container.innerHTML += `<div class="browser-comic-have" ccid="${id}"><button onclick="xlecxDownloader('${id}')">Download</button><button class="add-to-have" onclick="AddToHave(0, '${id}')">Add To Have</button><div>`

			// Groups
			if (result.groups != undefined) {
				element = document.createElement('div')
				element.classList.add('xlecx-post-tags')
				element.innerHTML = "Group: "
				for(var i = 0; i < result.groups.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.groups[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 1, checkMiddleMouseClick(e))
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
				for(var i = 0; i < result.artists.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.artists[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 2, checkMiddleMouseClick(e))
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
				for(var i = 0; i < result.parody.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.parody[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 3, checkMiddleMouseClick(e))
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
				for(var i = 0; i < result.tags.length; i++) {
					miniElement = document.createElement('button')
					miniElement.innerHTML = result.tags[i].name
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenTag(e.target.textContent, 1, 4, checkMiddleMouseClick(e))
					}
					element.appendChild(miniElement)
				}
				container.append(element)
			}

			// Images
			if (have_comic == true) {
				db.comics.findOne({s:0, p:id}, (err, doc) => {
					if (err) { error(err); return }
					id = doc._id
					var image, html = '', formatIndex = 0
					
					if (err) { error(err); return }
					ImagesCount = doc.c || null
					if (ImagesCount == null) return
					formats = doc.f || null
					if (formats == null) return
					image = doc.i

					var lastIndex = formats[0][1]
					var thisForamat = formats[0][2]
					var repair = doc.m || null
					if (repair == null || repair.length == 0) {
						for (var i = 0; i < ImagesCount; i++) {
							if (i <= lastIndex)
								html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
							else {
								formatIndex++
								lastIndex = formats[formatIndex][1]
								thisForamat = formats[formatIndex][2]
								html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
							}
						}
					} else {
						for (var i = 0; i < ImagesCount; i++) {
							if (repair.indexOf(i) > -1) {
								html += `<div class="repair-image" id="${i}"><p>Image hasn't Been Download Currectly.</p><button onclick="repairImage(${i}, ${repair.indexOf(i)}, ${image})">Repair</button></div>`
							} else {
								if (i <= lastIndex)
									html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
								else {
									formatIndex++
									lastIndex = formats[formatIndex][1]
									thisForamat = formats[formatIndex][2]
									html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
								}
							}
						}
					}
					image_container.innerHTML = html
				})
			} else {
				image_container.setAttribute('img-con', true)
				for (var i = 0; i < result.images.length; i++) {
					image_container.innerHTML += `<img data-src="${xlecx.baseURL}/${result.images[i].thumb}">`
				}
				var images = image_container.querySelectorAll('[data-src]')

				images.forEach(image => {
					imageLoadingObserver.observe(image)
				})
			}

			container.appendChild(image_container)
			containerContainer.appendChild(container)

			if (result.related != undefined) {
				var bigContainer = document.createElement('div')
				element = document.createElement('p')
				element.classList.add('xlecx-post-title')
				element.textContent = 'Related:'
				bigContainer.appendChild(element)

				container = document.createElement('div')
				container.classList.add('xlecx-post-container')
				for (var i = 0; i < result.related.length; i++) {
					element = document.createElement('div')
					valueStorage = ''

					if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
					
					html = `<img src="${xlecx.baseURL+result.related[i].thumb}"${valueStorage}>`

					if (result.related[i].pages == null)
						valueStorage = ''
					else
						valueStorage = `<span>${result.related[i].pages}</span>`

					html += `${valueStorage}<p>${result.related[i].title}</p>`
					if (IsDownloading(result.related[i].id))
						html += `<cid cid="${result.related[i].id}"><span class="spin spin-success"></span></cid>`
					else
						html += `<button cid="${result.related[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
					element.innerHTML = html
					miniElement = document.createElement('div')
					miniElement.setAttribute('id', result.related[i].id)
					miniElement.onmousedown = e => {
						e.preventDefault()
						xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
					}
					element.appendChild(miniElement)
					container.appendChild(element)
				}
				bigContainer.appendChild(container)


				containerContainer.appendChild(bigContainer)
			}

			page.appendChild(containerContainer)
			clearDownloadedComics(page, 0)
		})
	})
}

function xlecxChangePage(page, makeNewPage, updateTabIndex) {
	page = page || 1
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var id, pageContent
	if (makeNewPage) {
		id = createNewTab(`xlecxChangePage(${page}, false, false)`)
		if (id == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
		pageContent = document.getElementById(id)
	} else {
		id = activeTabComicId
		const passImageCon = document.getElementById(id).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		pageContent = document.getElementById(id)
		pageContent.innerHTML = ''

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${id}"]`).getAttribute('ti'))].addHistory(`xlecxChangePage(${page}, false, false)`)
	}

	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	createNewXlecxTab(id, page)
}

function xlecxOpenCategory(name, page, shortName, makeNewPage, updateTabIndex) {
	name = name || null
	page = page || 1
	shortName = shortName || null
	if (name == null || shortName == null) return
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var pageId = activeTabComicId
	const passImageCon = document.getElementById(pageId).querySelector('[img-con="true"]')
	if (passImageCon != undefined) {
		const passImages = passImageCon.children
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
	}
	
	var pageContent
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenCategory('${name}', ${page}, '${shortName}', false, false)`)
		if (pageId == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
		pageContent = document.getElementById(pageId)
	} else {
		pageContent = document.getElementById(pageId)
		pageContent.innerHTML = ''

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].addHistory(`xlecxOpenCategory('${name}', ${page}, '${shortName}', false, false)`)
	}

	tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].options = [name, shortName]

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const tab = tabsContainer.querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	xlecx.getCategory(name, {page:page, random:true, category:true}, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		pageContent.innerHTML = ''
		if (err) {
			browserError(err, pageId)
			return
		}
		tabArea.textContent = `${shortName} - ${page}`
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

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
		for (var i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, checkMiddleMouseClick(e))
			}
			elementContainer.appendChild(element)
		}
		container.appendChild(elementContainer)

		// Content
		elementContainerContainer = document.createElement('div')
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (var i = 0; i < result.content.length; i++) {
			element = document.createElement('div')
			valueStorage = ''

			if (setting.lazy_loading == true)
				valueStorage = ' loading="lazy"'

			html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

			if (result.content[i].pages == null)
				valueStorage = ''
			else
				valueStorage = `<span>${result.content[i].pages}</span>`

			html += `${valueStorage}<p>${result.content[i].title}</p>`
			if (IsDownloading(result.content[i].id))
				html += `<cid cid="${result.content[i].id}"><span class="spin spin-success"></span></cid>`
			else
				html += `<button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.content[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		// Pagination
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-pagination")
		for (var i = 0; i < result.pagination.length; i++) {
			element = document.createElement('button')
			if (result.pagination[i][1] == null) {
				element.setAttribute('disable', true)
				element.textContent = result.pagination[i][0]
			} else {
				element.textContent = result.pagination[i][0]
				element.setAttribute('p', result.pagination[i][1])
				element.onmousedown = e => {
					e.preventDefault()
					xlecxOpenCategory(name, Number(e.target.getAttribute('p')), shortName, checkMiddleMouseClick(e))
				}
			}
			
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		
		// Random
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-post-container")
		for (var i = 0; i < result.random.length; i++) {
			element = document.createElement('div')
			valueStorage = ''

			if (setting.lazy_loading == true)
				valueStorage = ' loading="lazy"'

			html = `<img src="${xlecx.baseURL+result.random[i].thumb}"${valueStorage}>`

			if (result.random[i].pages == null)
				valueStorage = ''
			else
				valueStorage = `<span>${result.random[i].pages}</span>`

			html += `${valueStorage}<p>${result.random[i].title}</p>`
			if (IsDownloading(result.random[i].id))
				html += `<cid cid="${result.random[i].id}"><span class="spin spin-success"></span></cid>`
			else
				html += `<button cid="${result.random[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
			element.innerHTML = html
			miniElement = document.createElement('div')
			miniElement.setAttribute('id', result.random[i].id)
			miniElement.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
			element.appendChild(miniElement)
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		container.appendChild(elementContainerContainer)

		pageContent.appendChild(container)
		clearDownloadedComics(pageContent, 0)
	})
}

function xlecxOpenTagContentMaker(result, pageContent, name, whitch) {
	var container = document.createElement('div')
	container.classList.add("xlecx-container")
	var elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

	// Categories
	elementContainer = document.createElement('div')
	for (var i = 0; i < result.categories.length; i++) {
		element = document.createElement('button')
		element.setAttribute('c', result.categories[i].url)
		element.textContent = result.categories[i].name
		element.onmousedown = e => {
			e.preventDefault()
			xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, checkMiddleMouseClick(e))
		}
		elementContainer.appendChild(element)
	}
	container.appendChild(elementContainer)

	// Content
	elementContainerContainer = document.createElement('div')
	elementContainer = document.createElement('div')
	elementContainer.classList.add("xlecx-post-container")
	for (var i = 0; i < result.content.length; i++) {
		element = document.createElement('div')
		valueStorage = ''

		if (setting.lazy_loading == true)
			valueStorage = ' loading="lazy"'

		html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

		if (result.content[i].pages == null)
			valueStorage = ''
		else
			valueStorage = `<span>${result.content[i].pages}</span>`

		html += `${valueStorage}<p>${result.content[i].title}</p>`
		if (IsDownloading(result.content[i].id))
			html += `<cid cid="${result.content[i].id}"><span class="spin spin-success"></span></cid>`
		else
			html += `<button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
		element.innerHTML = html
		miniElement = document.createElement('div')
		miniElement.setAttribute('id', result.content[i].id)
		miniElement.onmousedown = e => {
			e.preventDefault()
			xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
		}
		element.appendChild(miniElement)
		elementContainer.appendChild(element)
	}
	elementContainerContainer.appendChild(elementContainer)

	// Pagination
	if (result.pagination != undefined) {
		elementContainer = document.createElement('div')
		elementContainer.classList.add("xlecx-pagination")
		for (var i = 0; i < result.pagination.length; i++) {
			element = document.createElement('button')
			if (result.pagination[i][1] == null) {
				element.setAttribute('disable', true)
				element.textContent = result.pagination[i][0]
			} else {
				element.textContent = result.pagination[i][0]
				element.setAttribute('p', result.pagination[i][1])
				element.onmousedown = e => {
					e.preventDefault()
					xlecxOpenTag(name, Number(e.target.getAttribute('p')), whitch, checkMiddleMouseClick(e))
				}
			}
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
	}

	container.appendChild(elementContainerContainer)
	pageContent.appendChild(container)
	clearDownloadedComics(pageContent, 0)
}

function xlecxOpenTag(name, page, whitch, makeNewPage, updateTabIndex) {
	name = name || null
	page = page || 1
	whitch = whitch || 1
	if (name == null) return
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var pageContent, pageId
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenTag('${name}', ${page}, ${whitch}, false, false)`)
		if (pageId == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
		pageContent = document.getElementById(pageId)
	} else {
		pageId = activeTabComicId
		const passImageCon = document.getElementById(pageId).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		pageContent = document.getElementById(pageId)
		pageContent.innerHTML = ''

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].addHistory(`xlecxOpenTag('${name}', ${page}, ${whitch}, false, false)`)
	}

	tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].options = [name, whitch]

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const tab = tabsContainer.querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'

	switch (whitch) {
		case 1:
			xlecx.getGroup(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				pageContent.innerHTML = ''
				if (err) {
					browserError(err, pageId)
					return
				}
				tabArea.textContent = `${name} - ${page}`
				var valueStorage
	
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
				xlecxOpenTagContentMaker(result, pageContent, name, whitch)
			})
			break
		case 2:
			xlecx.getArtist(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				pageContent.innerHTML = ''
				if (err) {
					browserError(err, pageId)
					return
				}
				tabArea.textContent = `${name} - ${page}`
				var valueStorage
	
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
				xlecxOpenTagContentMaker(result, pageContent, name, whitch)
			})
			break
		case 3:
			xlecx.getParody(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				pageContent.innerHTML = ''
				if (err) {
					browserError(err, pageId)
					return
				}
				tabArea.textContent = `${name} - ${page}`
				var valueStorage
	
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
				xlecxOpenTagContentMaker(result, pageContent, name, whitch)
			})
			break
		case 4:
			xlecx.getTag(name, {page:page, category:true}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				pageContent.innerHTML = ''
				if (err) {
					browserError(err, pageId)
					return
				}
				tabArea.textContent = `${name} - ${page}`
				var valueStorage
	
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
				xlecxOpenTagContentMaker(result, pageContent, name, whitch)
			})
			break
	}
}

function xlecxSearch(text, page, makeNewPage, updateTabIndex) {
	text = text || null
	if (text == null) return
	text = text.replace("\\'", "'")
	page = page || 1
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true

	var pageContent, pageId
	if (makeNewPage) {
		pageId = createNewTab(`xlecxSearch('${text}', ${page}, false, false)`)
		if (pageId == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
		pageContent = document.getElementById(pageId)
	} else {
		pageId = activeTabComicId
		const passImageCon = document.getElementById(pageId).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		pageContent = document.getElementById(pageId)
		pageContent.innerHTML = ''

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].addHistory(`xlecxSearch('${text}', ${page}, false, false)`)
	}

	pageContent = document.getElementById(pageId)
	pageContent.innerHTML = ''

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}
	
	const tab = tabsContainer.querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	xlecx.search(text, {page:page, category:true}, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		pageContent.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		tabArea.textContent = `S: ${text} - ${page}`
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer = document.createElement('div')
		var elementContainer, element, miniElement, html, valueStorage

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
		for (var i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, checkMiddleMouseClick(e))
			}
			elementContainer.appendChild(element)
		}
		container.appendChild(elementContainer)

		// Content
		if (result.content != undefined) {
			elementContainer = document.createElement('div')
			elementContainer.classList.add("xlecx-post-container")
			for (var i = 0; i < result.content.length; i++) {
				element = document.createElement('div')
				valueStorage = ''

				if (setting.lazy_loading == true)
					valueStorage = ' loading="lazy"'

				html = `<img src="${xlecx.baseURL+result.content[i].thumb}"${valueStorage}>`

				if (result.content[i].pages == null)
					valueStorage = ''
				else
					valueStorage = `<span>${result.content[i].pages}</span>`

				html += `${valueStorage}<p>${result.content[i].title}</p>`
				if (IsDownloading(result.content[i].id))
					html += `<cid cid="${result.content[i].id}"><span class="spin spin-success"></span></cid>`
				else
					html += `<button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
				element.innerHTML = html
				miniElement = document.createElement('div')
				miniElement.setAttribute('id', result.content[i].id)
				miniElement.onmousedown = e => {
					e.preventDefault()
					xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
				}
				element.appendChild(miniElement)
				elementContainer.appendChild(element)
			}
			elementContainerContainer.appendChild(elementContainer)

			// Pagination
			if (result.pagination != undefined) {
				elementContainer = document.createElement('div')
				elementContainer.classList.add("xlecx-pagination")
				for (var i = 0; i < result.pagination.length; i++) {
					element = document.createElement('button')
					if (result.pagination[i][1] == null) {
						element.setAttribute('disable', true)
						element.textContent = result.pagination[i][0]
					} else {
						element.textContent = result.pagination[i][0]
						element.setAttribute('p', result.pagination[i][1])
						element.onmousedown = e => {
							e.preventDefault()
							xlecxSearch(text, Number(e.target.getAttribute('p')), checkMiddleMouseClick(e))
						}
					}
					
					elementContainer.appendChild(element)
				}
				elementContainerContainer.appendChild(elementContainer)
			}
		}

		container.appendChild(elementContainerContainer)
		pageContent.appendChild(container)
		clearDownloadedComics(pageContent, 0)
	})
}

function xlecxOpenAllTags(makeNewPage, updateTabIndex) {
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var page, pageId
	if (makeNewPage) {
		pageId = createNewTab('xlecxOpenAllTags(false, false)')
		if (pageId == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
		page = document.getElementById(pageId)
	} else {
		pageId = activeTabComicId
		const passImageCon = document.getElementById(pageId).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		page = document.getElementById(pageId)
		page.innerHTML = ''
		page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].addHistory('xlecxOpenAllTags(false, false)')
	}

	const tab = tabsContainer.querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	xlecx.getAllTags(true, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		page.innerHTML = ''
		if (err) {
			browserError(err, pageId)
			return
		}
		tabArea.textContent = 'All Tags'
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

		// Categories
		elementContainer = document.createElement('div')
		for (var i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, e.target.textContent, checkMiddleMouseClick(e))
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
				xlecxOpenTag(e.target.textContent, 1, 4, checkMiddleMouseClick(e))
			}
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)

		container.appendChild(elementContainerContainer)

		page.appendChild(container)
	})
}

function xlecxJumpPage(index, page) {
	switch (index) {
		case 0:
			searchTimer = setTimeout(() => {
				xlecxSearch(tabs[activeTabIndex].s.replace("'", "\\'"), page, false)
			}, 185)
			break
		case 1:
			searchTimer = setTimeout(() => {
				xlecxChangePage(page, false)
			}, 185)
			break
		case 2:
			searchTimer = setTimeout(() => {
				xlecxOpenCategory(tabs[activeTabIndex].options[0], page, tabs[activeTabIndex].options[1], false)
			}, 185)
			break
		case 3:
			searchTimer = setTimeout(() => {
				xlecxOpenTag(tabs[activeTabIndex].options[0], page, tabs[activeTabIndex].options[1], false)
			}, 185)
			break
	}
}

function xlecxDownloader(id) {
	if (IsDownloading(id)) { PopAlert('You are Downloading This Comic.', 'danger'); return }
	IsHavingComic(0, id, (have, downloaded) => {
		if (have == true) { PopAlert('You Already Have This Comic.', 'danger'); return }
		const downloaderIndex = AddDownloaderList()
		changeButtonsToDownloading(id)
		xlecx.getComic(id, {related:false}, (err, result) => {
			if (err) { RemoveDownloaderList(downloaderIndex); PopAlert(err, 'danger'); changeButtonsToDownloading(id, true); return }
			
			var name = result.title, quality = 0, downloadImageList = []
			if (result.images[0].src == result.images[0].thumb)
				quality = 1
			else
				quality = setting.img_graphic
	
			for (var i = 0; i < result.images.length; i++) {
				if (quality == 0)
					downloadImageList.push(xlecx.baseURL+result.images[i].thumb)
				else
					downloadImageList.push(xlecx.baseURL+result.images[i].src)
			}
	
			MakeDownloadList(downloaderIndex, name, id, downloadImageList)
	
			var sendingResult = {}
			sendingResult.title = result.title
			if (result.groups != undefined)	sendingResult.groups = result.groups
			if (result.artists != undefined) sendingResult.artists = result.artists
			if (result.parody != undefined)	sendingResult.parody = result.parody
			if (result.tags != undefined)	sendingResult.tags = result.tags
			PopAlert(`Download Started. '${name}'`, 'primary')
			comicDownloader(downloaderIndex, sendingResult, quality, 0)
		})
	})
}

async function xlecxRepairComicInfoGetInfo(id, whitch) {
	var comic_id = Number(document.getElementById('comic-panel').getAttribute('cid'))
	await xlecx.getComic(id, {related:false}, (err, result) => {
		if (err) { error(err); return }
		switch (whitch) {
			case 0:
				db.comics.update({_id:comic_id}, { $set: {n:result.title.toLowerCase()} }, {}, (err) => {
					if (err) { error(err); return }
					document.getElementById('c-p-t').textContent = result.title
					PopAlert('Comic Name has been Repaired!')
				})
				break
			case 1:
				var neededResult = result.groups || null
				if (neededResult == null) {
					PopAlert('This Comic has no Group.', 'danger')
					return
				}
				var groupsList = []
				for (var i in neededResult) {
					groupsList.push(neededResult[i].name)
				}
				db.index.findOne({_id:6}, (err, doc) => {
					if (err) { error(err); return }
					var groupsIndex = doc.i
					CreateGroup(groupsList, groupsIndex, true, comic_id, 0, true)
				})
				break
			case 2:
				var neededResult = result.artists || null
				if (neededResult == null) {
					PopAlert('This Comic has no Artist.', 'danger')
					return
				}
				var artistsList = []
				for (var i in neededResult) {
					artistsList.push(neededResult[i].name)
				}
				db.index.findOne({_id:2}, (err, doc) => {
					if (err) { error(err); return }
					var artistsIndex = doc.i
					CreateArtist(artistsList, artistsIndex, true, comic_id, 0, true)
				})
				break
			case 3:
				var neededResult = result.parody || null
				if (neededResult == null) {
					PopAlert('This Comic has no Parody.', 'danger')
					return
				}
				var parodyList = []
				for (var i in neededResult) {
					parodyList.push(neededResult[i].name)
				}
				db.index.findOne({_id:8}, (err, doc) => {
					if (err) { error(err); return }
					var parodyIndex = doc.i
					CreateParody(parodyList, parodyIndex, true, comic_id, 0, true)
				})
				break
			case 4:
				var neededResult = result.tags || null
				if (neededResult == null) {
					PopAlert('This Comic has no Tag.', 'danger')
					return
				}
				var tagsList = []
				for (var i in neededResult) {
					tagsList.push(neededResult[i].name)
				}
				db.index.findOne({_id:4}, (err, doc) => {
					if (err) { error(err); return }
					var tagIndex = doc.i
					CreateTag(tagsList, tagIndex, true, comic_id, 0, true)
				})
				break
			case 5:
				var neededResult = result.images || null
				if (neededResult == null) {
					PopAlert('This Comic has no Image.', 'danger')
					return
				}
				db.comics.findOne({_id:comic_id}, (err, doc) => {
					if (err) { error(err); return }
					if (doc.i == undefined) return
					var newImageList = []
					for (var i in doc.i) {
						if (typeof(doc.i[i]) == 'object')
							newImageList.push([doc.i[i][0], i])
					}
					if (newImageList.length == 0) {
						PopAlert('All Images are Good, no Need To Repair.', 'danger')
						return
					}
					console.log(newImageList)
				})
				break
		}
	})
}