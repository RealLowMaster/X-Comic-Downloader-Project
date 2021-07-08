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
	activateTab(document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`))
	const pageContent = document.getElementById(id)
	pageNumber = pageNumber || 1

	const tab = document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	xlecx.getPage({page:pageNumber, random:true, category:true}, (err, result) => {
		if (document.getElementById(id) == undefined) return
		tab.setAttribute('isReloading', false)
		pageContent.innerHTML = ''
		if (err) {
			browserError(err, id)
			return
		}
		tabArea.textContent = `Page ${pageNumber}`
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer, elementContainer, element, miniElement, html, valueStorage

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

			html += `${valueStorage}<p>${result.content[i].title}</p><button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
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

			html += `${valueStorage}<p>${result.random[i].title}</p><button cid="${result.random[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
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
		const browser_tabs = document.getElementById('browser-tabs')
		const passPageId = browser_tabs.getAttribute('pid')
		const passImageCon = document.getElementById(passPageId).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		pageId = passPageId
		const tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
		page = document.getElementById(pageId)
		page.innerHTML = ''
		page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'

		if (updateTabIndex == true) tabs[tabIndexId].addHistory(`xlecxOpenPost(false, '${id}', false)`)
	}

	const tab = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
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
		
		if (have_comic == true) {
			db.comics.findOne({s:0, p:id}, (err, doc) => {
				if (err) { error(err); return }
				page.innerHTML = ''
				const passId = id
				id = doc._id
				var comic_container = document.createElement('div')
				comic_container.classList.add('xlecx-container-one-row')
				var container = document.createElement('div')
	
				var title_container = document.createElement('p')
				title_container.classList.add('xlecx-post-title')
				var groups_container = document.createElement('div')
				groups_container.classList.add('xlecx-post-tags')
				var artists_container = document.createElement('div')
				artists_container.classList.add('xlecx-post-tags')
				var parodies_container = document.createElement('div')
				parodies_container.classList.add('xlecx-post-tags')
				var tags_container = document.createElement('div')
				tags_container.classList.add('xlecx-post-tags')
				var image_container = document.createElement('div')
				image_container.classList.add('xlecx-image-container-1x1')
				var name, images, html = '', formatIndex = 0
				
				const findGroupName = async(id) => {
					await db.groups.findOne({_id:id}, (err, doc) => {
						if (err) { error(err); return }
						group_element = document.createElement('button')
						group_element.textContent = doc.n
						group_element.onmousedown = e => {
							e.preventDefault()
							xlecxOpenTag(e.target.textContent, 1, 1, checkMiddleMouseClick(e))
						}
						groups_container.appendChild(group_element)
					})
				}
	
				const findGroupRow = async() => {
					await db.comic_groups.findOne({c:Number(id)}, (err, doc) => {
						if (err) { error(err); return }
						var checkDoc = doc || null
						if (checkDoc != null) {
							var groups = doc.t || null
							if (groups == null) return
							groups_container.textContent = 'Groups: '
							for (var i in groups) {
								findGroupName(groups[i])
							}
						}
					})
				}
	
				const findArtistName = async(id) => {
					await db.artists.findOne({_id:id}, (err, doc) => {
						if (err) { error(err); return }
						artists_element = document.createElement('button')
						artists_element.textContent = doc.n
						artists_element.onmousedown = e => {
							e.preventDefault()
							xlecxOpenTag(e.target.textContent, 1, 2, checkMiddleMouseClick(e))
						}
						artists_container.appendChild(artists_element)
					})
				}
	
				const findArtistRow = async() => {
					await db.comic_artists.findOne({c:Number(id)}, (err, doc) => {
						if (err) { error(err); return }
						var checkDoc = doc || null
						if (checkDoc != null) {
							var artists = doc.t || null
							if (artists == null) return
							artists_container.textContent = 'Artists: '
							for (var i in artists) {
								findArtistName(artists[i])
							}
						}
					})
				}
	
				const findParodyName = async(id) => {
					await db.parodies.findOne({_id:id}, (err, doc) => {
						if (err) { error(err); return }
						var parody_element = document.createElement('button')
						parody_element.textContent = doc.n
						parody_element.onmousedown = e => {
							e.preventDefault()
							xlecxOpenTag(e.target.textContent, 1, 3, checkMiddleMouseClick(e))
						}
						parodies_container.appendChild(parody_element)
					})
				}
	
				const findParodyRow = async() => {
					await db.comic_parodies.findOne({c:Number(id)}, (err, doc) => {
						if (err) { error(err); return }
						var checkDoc = doc || null
						if (checkDoc != null) {
							var parodies = doc.t || null
							if (parodies == null) return
							parodies_container.textContent = 'Parody: '
							for (var i in parodies) {
								findParodyName(parodies[i])
							}
						}
					})
				}
	
				const findTagName = async(id) => {
					await db.tags.findOne({_id:id}, (err, doc) => {
						if (err) { error(err); return }
						var tag_element = document.createElement('button')
						tag_element.textContent = doc.n
						tag_element.onmousedown = e => {
							e.preventDefault()
							xlecxOpenTag(e.target.textContent, 1, 4, checkMiddleMouseClick(e))
						}
						tags_container.appendChild(tag_element)
					})
				}
	
				const findTagRow = async() => {
					await db.comic_tags.findOne({c:Number(id)}, (err, doc) => {
						if (err) { error(err); return }
						var checkDoc = doc || null
						if (checkDoc != null) {
							var tags = doc.t || null
							if (tags == null) return
							tags_container.textContent = 'Tag: '
							for (var i in tags) {
								findTagName(tags[i])
							}
						}
					})
				}
	
				const findComic = async() => {
					await db.comics.findOne({_id:Number(id)}, (err, doc) => {
						if (document.getElementById(pageId) == undefined) return
						if (err) { error(err); return }
						name = doc.n || null
						if (name == null) return
						ImagesCount = doc.c || null
						if (ImagesCount == null) return
						formats = doc.f || null
						if (formats == null) return
						image = doc.i

						tab.setAttribute('isReloading', false)
						tabArea.textContent = name
						title_container.textContent = name

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
	
						findGroupRow()
						findArtistRow()
						findParodyRow()
						findTagRow()
	
						container.appendChild(title_container)
						container.innerHTML += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
						container.appendChild(groups_container)
						container.appendChild(artists_container)
						container.appendChild(parodies_container)
						container.appendChild(tags_container)
						container.appendChild(image_container)
						comic_container.appendChild(container)
						xlecx.getComicRelated(passId, (err, result) => {
							if (err) return
							if (result != null) {
								var bigContainer = document.createElement('div')
								element = document.createElement('p')
								element.classList.add('xlecx-post-title')
								element.textContent = 'Related:'
								bigContainer.appendChild(element)
			
								container = document.createElement('div')
								container.classList.add('xlecx-post-container')
								for (var i = 0; i < result.length; i++) {
									element = document.createElement('div')
									valueStorage = ''
			
									if (setting.lazy_loading == true) valueStorage = ' loading="lazy"'
									
									html = `<img src="${xlecx.baseURL+result[i].thumb}"${valueStorage}>`
			
									if (result[i].pages == null)
										valueStorage = ''
									else
										valueStorage = `<span>${result[i].pages}</span>`
			
									html += `${valueStorage}<p>${result[i].title}</p><button cid="${result[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
									element.innerHTML = html
									miniElement = document.createElement('div')
									miniElement.setAttribute('id', result[i].id)
									miniElement.onmousedown = e => {
										e.preventDefault()
										xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
									}
									element.appendChild(miniElement)
									container.appendChild(element)
								}
								bigContainer.appendChild(container)
			
			
								comic_container.appendChild(bigContainer)
								clearDownloadedComics(page, 0)
							}
						})
						page.appendChild(comic_container)
						
					})
				}
	
				findComic()
			})
		} else {
			xlecx.getComic(id, {}, (err, result) => {
				if (document.getElementById(pageId) == undefined) return
				tab.setAttribute('isReloading', false)
				page.innerHTML = ''
				if (err) {
					browserError(err, pageId)
					return
				}
				tabArea.textContent = result.title
				var containerContainer = document.createElement('div')
				containerContainer.classList.add('xlecx-container-one-row')
				var container = document.createElement('div')
				var element, miniElement
				container.innerHTML = `<p class="xlecx-post-title">${result.title}</p>`
				if (have_in_have == false)
					container.innerHTML += `<div class="browser-comic-have"><button onclick="xlecxDownloader('${id}')">Download</button><button class="add-to-have" onclick="AddToHave(0, '${id}')">Add To Have</button><div>`
				else
					container.innerHTML += `<div class="browser-comic-have"><button class="remove-from-have" onclick="RemoveFromHave(0, '${id}', this)">You Have This Comic.</button></div>`

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
				element = document.createElement('div')
				element.classList.add('xlecx-image-container-1x1')
				element.setAttribute('img-con', true)
				for (var i = 0; i < result.images.length; i++) {
					element.innerHTML += `<img data-src="${xlecx.baseURL}/${result.images[i].thumb}">`
				}
				var images = element.querySelectorAll('[data-src]')
				container.appendChild(element)
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

						html += `${valueStorage}<p>${result.related[i].title}</p><button cid="${result.related[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
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

				images.forEach(image => {
					imageLoadingObserver.observe(image)
				})

				page.appendChild(containerContainer)
				clearDownloadedComics(page, 0)
			})
		}
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
		var browser_tabs = document.getElementById('browser-tabs')
		var pageId = browser_tabs.getAttribute('pid')
		var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))

		id = document.getElementById('browser-tabs').getAttribute('pid')
		pageContent = document.getElementById(id)
		pageContent.innerHTML = ''

		if (updateTabIndex == true)
			tabs[tabIndexId].addHistory(`xlecxChangePage(${page}, false, false)`)
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
	const browser_tabs = document.getElementById('browser-tabs')
	const passPageId = browser_tabs.getAttribute('pid')
	const passImageCon = document.getElementById(passPageId).querySelector('[img-con="true"]')
	if (passImageCon != undefined) {
		const passImages = passImageCon.children
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
	}
	
	var pageContent, pageId
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenCategory('${name}', ${page}, '${shortName}', false, false)`)
		if (pageId == null) { PopAlert('You Can\'t Make Any More Tab.', 'danger'); return }
		pageContent = document.getElementById(pageId)
	} else {
		pageId = passPageId
		const tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))

		pageContent = document.getElementById(document.getElementById('browser-tabs').getAttribute('pid'))
		pageContent.innerHTML = ''

		if (updateTabIndex == true) tabs[tabIndexId].addHistory(`xlecxOpenCategory('${name}', ${page}, '${shortName}', false, false)`)
	}

	const tab = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	xlecx.getCategory(name, {page:page, random:true, category:true}, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tab.setAttribute('isReloading', false)
		pageContent.innerHTML = ''
		if (err) {
			browserError(err, pageId)
			return
		}
		tabArea.textContent = `${shortName} - ${page}`
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

			html += `${valueStorage}<p>${result.content[i].title}</p><button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
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

			html += `${valueStorage}<p>${result.random[i].title}</p><button cid="${result.random[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
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

		html += `${valueStorage}<p>${result.content[i].title}</p><button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
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
		const browser_tabs = document.getElementById('browser-tabs')
		const passPageId = browser_tabs.getAttribute('pid')
		const passImageCon = document.getElementById(passPageId).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		pageId = passPageId
		pageContent = document.getElementById(pageId)
		pageContent.innerHTML = ''

		if (updateTabIndex == true) {
			var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
			tabs[tabIndexId].addHistory(`xlecxOpenTag('${name}', ${page}, ${whitch}, false, false)`)
		}
	}

	var tab = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`)
	var tabArea = tab.getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	if (whitch == 1) {
		xlecx.getGroup(name, {page:page, category:true}, (err, result) => {
			if (document.getElementById(pageId) == undefined) return
			tab.setAttribute('isReloading', false)
			pageContent.innerHTML = ''
			if (err) {
				browserError(err, pageId)
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else if (whitch == 2) {
		xlecx.getArtist(name, {page:page, category:true}, (err, result) => {
			if (document.getElementById(pageId) == undefined) return
			tab.setAttribute('isReloading', false)
			pageContent.innerHTML = ''
			if (err) {
				browserError(err, pageId)
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else if (whitch == 3) {
		xlecx.getParody(name, {page:page, category:true}, (err, result) => {
			if (document.getElementById(pageId) == undefined) return
			tab.setAttribute('isReloading', false)
			pageContent.innerHTML = ''
			if (err) {
				browserError(err, pageId)
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else {
		xlecx.getTag(name, {page:page, category:true}, (err, result) => {
			if (document.getElementById(pageId) == undefined) return
			tab.setAttribute('isReloading', false)
			pageContent.innerHTML = ''
			if (err) {
				browserError(err, pageId)
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	}
}

function xlecxSearch(text, page, updateTabIndex) {
	text = text || null
	if (text == null) return
	page = page || 1
	if (updateTabIndex == null) updateTabIndex = true
	var pageContent
	const browser_tabs = document.getElementById('browser-tabs')
	const pageId = browser_tabs.getAttribute('pid')
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

	if (updateTabIndex == true) {
		const tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
		tabs[tabIndexId].addHistory(`xlecxSearch('${text}', ${page}, false)`)
	}

	const tab = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	xlecx.search(text, {page:page, category:true}, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tab.setAttribute('isReloading', false)
		pageContent.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		tabArea.textContent = `${text} - ${page}`
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer = document.createElement('div')
		var elementContainer, element, miniElement, html, valueStorage

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

				html += `${valueStorage}<p>${result.content[i].title}</p><button cid="${result.content[i].id}" onclick="xlecxDownloader(this.getAttribute('cid'))">Download</button>`
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
		const browser_tabs = document.getElementById('browser-tabs')
		const passPageId = browser_tabs.getAttribute('pid')
		const passImageCon = document.getElementById(passPageId).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}
		pageId = passPageId
		const tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
		page = document.getElementById(pageId)
		page.innerHTML = ''
		page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'

		if (updateTabIndex == true) tabs[tabIndexId].addHistory('xlecxOpenAllTags(false, false)')
	}

	const tab = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-sm spin-primary" style="width:22px;height:22px"></span>'
	xlecx.getAllTags(true, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tab.setAttribute('isReloading', false)
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

function xlecxDownloader(id) {
	if (IsDownloading(id)) { PopAlert('You are Downloading This Comic.', 'danger'); return }
	IsHavingComic(0, id, (have, downloaded) => {
		if (have == true) { PopAlert('You Already Have This Comic.', 'danger'); return }
		xlecx.getComic(id, {related:false}, (err, result) => {
			if (err) { error(err); return }
			
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
	
			var downloadIndex = MakeDownloadList(name, id, downloadImageList)
	
			var sendingResult = {}
			sendingResult.title = result.title
			if (result.groups != undefined)	sendingResult.groups = result.groups
			if (result.artists != undefined) sendingResult.artists = result.artists
			if (result.parody != undefined)	sendingResult.parody = result.parody
			if (result.tags != undefined)	sendingResult.tags = result.tags
			PopAlert(`Download Started. '${name}'`)
			comicDownloader(downloadIndex, sendingResult, quality, 0)
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