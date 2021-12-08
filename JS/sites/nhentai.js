const nhentai = new nHentaiAPI()
const nhentaiSiteTopMenu = `<div class="nhentai-top-menu"><i><svg xmlns="http://www.w3.org/2000/svg" width="482.556" height="209.281" viewBox="45.002 196.466 482.556 209.281"><path fill="#EC2854" stroke="#EC2854" stroke-miterlimit="10" d="M217.198 232.5c-16.597 6.907-52.729 34.028-36.249 58.467 7.288 10.807 19.94 18.442 31.471 22.057 10.732 3.363 23.897-.761 33.709 3.721-2.09 5.103-9.479 23.689-15.812 22.319-11.827-2.544-23.787-.445-33.07 8.485-18.958-26.295-45.97-36.974-75.739-29.676 22.066-27.2 16.719-55.687-6.468-81.622-13.999-15.657-47.993-37.963-69.845-28.853 54.591-22.738 121.119-5.555 172.003 25.102-8.815 3.669-3.617-2.179 0 0zm138.167 0c16.595 6.908 52.729 34.028 36.249 58.467-7.288 10.807-19.939 18.443-31.473 22.059-10.731 3.365-23.896-.762-33.712 3.721 2.104 5.112 9.464 23.671 15.812 22.318 11.826-2.542 23.789-.448 33.068 8.484 18.959-26.294 45.974-36.975 75.738-29.676-22.056-27.206-16.726-55.682 6.471-81.622 13.997-15.654 47.995-37.967 69.847-28.854-54.586-22.733-121.116-5.562-172 25.103 8.817 3.669 3.616-2.18 0 0z"/><path fill="none" d="M723.057 240.921H824.18v56.18H723.057z"/><path fill="#FFF" d="M225.434 293.58h23.199v15.919c6.874-6.563 14.154-11.274 21.841-14.137 7.687-2.863 16.234-4.295 25.64-4.295 20.621 0 34.549 5.552 41.785 16.653 3.979 6.074 5.969 14.766 5.969 26.077v71.95h-24.826v-70.693c0-6.842-1.312-12.358-3.935-16.547-4.344-6.982-12.209-10.473-23.604-10.473-5.789 0-10.538.455-14.246 1.363-6.693 1.536-12.572 4.608-17.636 9.216-4.07 3.701-6.716 7.522-7.937 11.467-1.221 3.945-1.832 9.582-1.832 16.913v58.754h-24.419l.001-112.167z"/></svg></i><button type="button" onmousedown="nhentaiLinkClick('nhentaiRandom({tab}, true)')">Random</button><button type="button" onmousedown="nhentaiLinkClick('nhentaiInfoType(1, 0, {tab}, true)')">Tags</button><button type="button" onmousedown="nhentaiLinkClick('nhentaiInfoType(1, 1, {tab}, true)')">Artists</button><button type="button" onmousedown="nhentaiLinkClick('nhentaiInfoType(1, 2, {tab}, true)')">Characters</button><button type="button" onmousedown="nhentaiLinkClick('nhentaiInfoType(1, 3, {tab}, true)')">Parodies</button><button type="button" onmousedown="nhentaiLinkClick('nhentaiInfoType(1, 4, {tab}, true)')">Groups</button></div>`
const nhentaiError = '<div class="nhentai-container">'+nhentaiSiteTopMenu+'<div class="nhentai-error">{err}</div></div>'

function nhentaiChangePage(page, makeNewPage, updateTabIndex) {
	page = page || 1
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	let pageId, thisTabIndex
	if (makeNewPage) {
		pageId = createNewTab(`nhentaiChangePage(${page}, false, false)`, true, 1)
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
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`nhentaiChangePage(${page}, false, false)`)
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

	nhentai.getPage(page, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			tabs[thisTabIndex].rename(err)
			tabs[thisTabIndex].icon.style.display = 'none'
			tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		tabs[thisTabIndex].rename(`Page ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiSiteTopMenu

		if (result.pagination != undefined) {
			save2 = result.pagination[result.pagination.length - 1][1]
			if (save2 == null) save = page
			else save = save2
		} else save = 1

		tabs[thisTabIndex].jp = 0
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = save
		if (activeTabComicId == pageId) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${save});browserJumpPage(0, Number(this.value))`)
			bjp_m_p.textContent = save
		}

		// Popular
		if (page == 1 && result.popular.length != 0) {
			html += '<div class="nhentai-postrow"><div>Popular</div><div>'
			if (setting.lazy_loading) {
				for (let i = 0; i < result.popular.length; i++) {
					if (IsDownloading(result.popular[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.popular[i].id}, {tab}, true)')"><img src="${result.popular[i].thumb}" loading="lazy"><div ${result.popular[i].lang}>${result.popular[i].title}</div><cid ssite="1" cid="${result.popular[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
					else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.popular[i].id}, {tab}, true)')"><img src="${result.popular[i].thumb}" loading="lazy"><div ${result.popular[i].lang}>${result.popular[i].title}</div><button ssite="1" cid="${result.popular[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
				}
			} else {
				for (let i = 0; i < result.popular.length; i++) {
					if (IsDownloading(result.popular[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.popular[i].id}, {tab}, true)')"><img src="${result.popular[i].thumb}"><div ${result.popular[i].lang}>${result.popular[i].title}</div><cid ssite="1" cid="${result.popular[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
					else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.popular[i].id}, {tab}, true)')"><img src="${result.popular[i].thumb}"><div ${result.popular[i].lang}>${result.popular[i].title}</div><button ssite="1" cid="${result.popular[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
				}
			}
			html += '</div></div>'
		}

		// Content
		html += `<div class="nhentai-postrow"><div>Content Page ${page}</div><div>`
		if (setting.lazy_loading) {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiChangePage(${result.pagination[i][1]}, {tab}, true)')">${result.pagination[i][0]}</button>`
				else html += `<button type="button" disabled="true">${result.pagination[i][0]}</button>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
		clearDownloadedComics(tabs[thisTabIndex].page, 1)
	})
}

function nhentaiOpenPost(id, makeNewTab, updateTabIndex) {
	id = id || null
	if (id == null) return
	makeNewTab = makeNewTab || false
	if (updateTabIndex == null) updateTabIndex = true
	let pageId, thisTabIndex
	if (makeNewTab) {
		pageId = createNewTab(`nhentaiOpenPost(${id}, false, false)`, true, 1)
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
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`nhentaiOpenPost(${id}, false, false)`)
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
	db.have.findOne({s:1, i:id}, (err, haveDoc) => {
		if (err) {
			if (document.getElementById(pageId) == undefined) return
			tabs[thisTabIndex].ir = false
			checkBrowserTools(thisTabIndex)
			tabs[thisTabIndex].rename(err)
			tabs[thisTabIndex].icon.style.display = 'none'
			tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		let have_in_have = false, have_comic = false
		if (haveDoc != undefined) {
			have_in_have = true
			if (haveDoc.d != undefined) have_comic = true
		}

		nhentai.getComic(id, true, (err, result) => {
			if (document.getElementById(pageId) == undefined) return
			tabs[thisTabIndex].ir = false
			checkBrowserTools(thisTabIndex)
			tabs[thisTabIndex].page.innerHTML = null
			if (err) {
				tabs[thisTabIndex].rename(err)
				tabs[thisTabIndex].icon.style.display = 'none'
				tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
				return
			}
			tabs[thisTabIndex].rename(result.name)
			tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
			let html
			html = '<div class="nhentai-container">'+nhentaiSiteTopMenu
			if (have_comic == true) html += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
			else if (have_in_have == true) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button class="remove-from-have" onclick="RemoveFromHave(1, ${id}, this)">You Have This Comic.</button></div>`
			else if (IsDownloading(id, 1)) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p></div>`
			else html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button onclick="nhentaiDownloader(${id})">Download</button><button class="add-to-have" onclick="AddToHave(1, ${id})">Add To Have</button></div>`

			// Info
			html += `<div class="nhentai-comic-info"><div><img src="${result.cover}" loading="lazy"></div><div><div class="nhentai-comic-title">${result.name}</div><div class="nhentai-comic-subtitle">${result.title}</div>`
		
			// Parodies 0
			if (result.parodies != undefined && result.parodies.length != 0) {
				html += '<div class="nhentai-info-row">Parodies: '
				for (let i = 0; i < result.parodies.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.parodies[i].url}\\', 1, 0, {tab}, true)')"><span>${result.parodies[i].name}</span><span>${result.parodies[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Characters 1
			if (result.characters != undefined && result.characters.length != 0) {
				html += '<div class="nhentai-info-row">Characters: '
				for (let i = 0; i < result.characters.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.characters[i].url}\\', 1, 1, {tab}, true)')"><span>${result.characters[i].name}</span><span>${result.characters[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Tags 2
			if (result.tags != undefined && result.tags.length != 0) {
				html += '<div class="nhentai-info-row">Tags: '
				for (let i = 0; i < result.tags.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.tags[i].url}\\', 1, 2, {tab}, true)')"><span>${result.tags[i].name}</span><span>${result.tags[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Artists 3
			if (result.artists != undefined && result.artists.length != 0) {
				html += '<div class="nhentai-info-row">Artists: '
				for (let i = 0; i < result.artists.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.artists[i].url}\\', 1, 3, {tab}, true)')"><span>${result.artists[i].name}</span><span>${result.artists[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Groups 4
			if (result.groups != undefined && result.groups.length != 0) {
				html += '<div class="nhentai-info-row">Groups: '
				for (let i = 0; i < result.groups.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.groups[i].url}\\', 1, 4, {tab}, true)')"><span>${result.groups[i].name}</span><span>${result.groups[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Languages 5
			if (result.languages != undefined && result.languages.length != 0) {
				html += '<div class="nhentai-info-row">Languages: '
				for (let i = 0; i < result.languages.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.languages[i].url}\\', 1, 5, {tab}, true)')"><span>${result.languages[i].name}</span><span>${result.languages[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Categories 6
			if (result.categories != undefined && result.categories.length != 0) {
				html += '<div class="nhentai-info-row">Categories: '
				for (let i = 0; i < result.categories.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.categories[i].url}\\', 1, 6, {tab}, true)')"><span>${result.categories[i].name}</span><span>${result.categories[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Pages
			if (result.pages != undefined) {
				html += `<div class="nhentai-info-row">Pages: <button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenPages(${result.pages.from}, ${result.pages.to}, 1, {tab}, true)')"><span>${result.pages.count}</span></button></div>`
			}

			// Upload Date
			if (result.date != undefined) {
				html += `<div class="nhentai-info-row">Uploaded: <time class="nobold" datetime="${result.date.dataTime}">${result.date.year}-${result.date.month}-${result.date.day} ${result.date.hours}:${result.date.minutes}:${result.date.secends}</time></div>`
			}
			html += '</div></div>'

			if (have_comic) {
				// Images
				db.comics.findOne({s:1, p:id}, (err, doc) => {
					if (err) { error(err); return }
					let comic_id = doc._id
					
					if (err) { error(err); return }
					let ImagesCount = doc.c || null
					if (ImagesCount == null) return
					let formats = doc.f || null
					if (formats == null) return
					let image = doc.i

					let lastIndex = formats[0][1]
					let thisForamat = formats[0][2]
					let src = ''
					let formatIndex = 0
					html += '<div class="nhentai-images">'
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
							lastIndex = formats[formatIndex][1]
							thisForamat = formats[formatIndex][2]
							src = `${dirUL}/${comic_id}${image}/${image}-${i}.${thisForamat}`
							if (!fs.existsSync(src)) {
								need_repair.push([src, i])
								src = 'Image/no-img-300x300.png'
							}
							html += `<img data-src="${src}">`
						}
					}
					html += '</div>'

					// Related
					if (result.related != undefined && result.related.length != 0) {
						html += '<div class="nhentai-postrow"><div>Related</div><div>'
						for (let i = 0; i < result.related.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.related[i].id}, {tab}, true)')"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div></div>`
						html += '</div></div>'
					}

					html += '</div></div>'
					tabs[thisTabIndex].page.innerHTML = html
					const LoadingImages = tabs[thisTabIndex].page.getElementsByClassName('nhentai-images')[0].getElementsByTagName('img')

					for (let i = 0; i < LoadingImages.length; i++) {
						imageLoadingObserver.observe(LoadingImages[i])
					}
					clearDownloadedComics(tabs[thisTabIndex].page, 1)
				})
			} else {
				// Images
				html += '<div class="nhentai-images">'
				for (let i = 0; i < result.images.length; i++) html += `<img data-src="${result.images[i].url}">`
				html += '</div>'

				// Related
				if (result.related != undefined && result.related.length != 0) {
					html += '<div class="nhentai-postrow"><div>Related</div><div>'
					for (let i = 0; i < result.related.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.related[i].id}, {tab}, true)')"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div></div>`
					html += '</div></div>'
				}

				html += '</div></div>'
				tabs[thisTabIndex].page.innerHTML = html
				const LoadingImages = tabs[thisTabIndex].page.getElementsByClassName('nhentai-images')[0].getElementsByTagName('img')

				for (let i = 0; i < LoadingImages.length; i++) {
					imageLoadingObserver.observe(LoadingImages[i])
				}
				clearDownloadedComics(tabs[thisTabIndex].page, 1)
			}
		})
	})
}

function nhentaiOpenInfo(name, page, whitch, makeNewTab, updateTabIndex) {
	name = name || null
	if (name == null) return
	page = page || 1
	if (whitch == null) return
	makeNewTab = makeNewTab || false
	if (updateTabIndex == null) updateTabIndex = true
	const types = ['parody','character','tag','artist','group','language','category']
	let pageId, thisTabIndex
	if (makeNewTab) {
		pageId = createNewTab(`nhentaiOpenInfo('${name}', ${page}, ${whitch}, false, false)`, true, 1)
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
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`nhentaiOpenInfo('${name}', ${page}, ${whitch}, false, false)`)
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

	nhentai.getTypePage(types[whitch], name, page, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			tabs[thisTabIndex].rename(err)
			tabs[thisTabIndex].icon.style.display = 'none'
			tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		tabs[thisTabIndex].rename(`${result.name} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiSiteTopMenu

		if (result.pagination != undefined) {
			save2 = result.pagination[result.pagination.length - 1][1]
			if (save2 == null) save = page
			else save = save2
		} else save = 1

		tabs[thisTabIndex].jp = 1
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = save
		if (activeTabComicId == pageId) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${save});browserJumpPage(1, Number(this.value))`)
			bjp_m_p.textContent = save
		}

		// Content
		html += `<div class="nhentai-postrow"><div>${types[whitch]} > <span class="nhentai-glow">${result.name}</span> > Page ${page}</div><div>`
		if (setting.lazy_loading) {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${name}\\', ${result.pagination[i][1]}, ${whitch}, {tab}, true)')">${result.pagination[i][0]}</button>`
				else html += `<button type="button" disabled="true">${result.pagination[i][0]}</button>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
		clearDownloadedComics(tabs[thisTabIndex].page, 1)
	})
}

function nhentaiOpenPages(from, to, page, makeNewTab, updateTabIndex) {
	from = from || null
	to = to || null
	if (from == null || to == null) return
	page = page || 1
	makeNewTab = makeNewTab || false
	if (updateTabIndex == null) updateTabIndex = true
	let pageId, thisTabIndex
	if (makeNewTab) {
		pageId = createNewTab(`nhentaiOpenPages(${from}, ${to}, ${page}, false, false)`, true, 1)
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
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`nhentaiOpenPages(${from}, ${to}, ${page}, false, false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabs[thisTabIndex].options = [from, to]
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`

	nhentai.searchPages(from, to, page, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			tabs[thisTabIndex].rename(err)
			tabs[thisTabIndex].icon.style.display = 'none'
			tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		tabs[thisTabIndex].rename(`From ${from} To ${to} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiSiteTopMenu

		if (result.pagination != undefined) {
			save2 = result.pagination[result.pagination.length - 1][1]
			if (save2 == null) save = page
			else save = save2
		} else save = 1

		tabs[thisTabIndex].jp = 2
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = save
		if (activeTabComicId == pageId) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${save});browserJumpPage(2, Number(this.value))`)
			bjp_m_p.textContent = save
		}

		// Content
		html += `<div class="nhentai-postrow"><div>${result.title} -> Page ${page} | Results: ${result.result}</div><div>`
		if (setting.lazy_loading) {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenPages(${from}, ${to}, ${result.pagination[i][1]}, {tab}, true)')"">${result.pagination[i][0]}</button>`
				else html += `<button type="button" disabled="true">${result.pagination[i][0]}</button>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
		clearDownloadedComics(tabs[thisTabIndex].page, 1)
	})
}

function nhentaiSearch(text, page, makeNewTab, updateTabIndex) {
	text = text || null
	if (text == null) return
	page = page || 1
	makeNewTab = makeNewTab || false
	if (updateTabIndex == null) updateTabIndex = true
	let pageId, thisTabIndex
	if (makeNewTab) {
		pageId = createNewTab(`nhentaiSearch('${text}', ${page}, false, false)`, true, 1)
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
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`nhentaiSearch('${text}', ${page}, false, false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabs[thisTabIndex].options = text
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`

	nhentai.search(text, page, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			tabs[thisTabIndex].rename(err)
			tabs[thisTabIndex].icon.style.display = 'none'
			tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		tabs[thisTabIndex].rename(`S: ${convertToURL(text, true)} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiSiteTopMenu

		if (result.pagination != undefined) {
			save2 = result.pagination[result.pagination.length - 1][1]
			if (save2 == null) save = page
			else save = save2
		} else save = 1

		tabs[thisTabIndex].jp = 3
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = save
		if (activeTabComicId == pageId) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${save});browserJumpPage(3, Number(this.value))`)
			bjp_m_p.textContent = save
		}

		// Content
		html += `<div class="nhentai-postrow"><div>Search -> Page ${page} | Results: ${result.result}</div><div>`
		if (setting.lazy_loading) {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (IsDownloading(result.content[i].id, 1)) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid ssite="1" cid="${result.content[i].id}"><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button ssite="1" cid="${result.content[i].id}" onclick="nhentaiDownloader(this.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiSearch(\\'${text}\\', ${result.pagination[i][1]}, {tab}, true)')">${result.pagination[i][0]}</button>`
				else html += `<button type="button" disabled="true">${result.pagination[i][0]}</button>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
		clearDownloadedComics(tabs[thisTabIndex].page, 1)
	})
}

function nhentaiInfoType(page, whitch, makeNewTab, updateTabIndex) {
	page = page || 1
	if (whitch == null) return
	makeNewTab = makeNewTab || false
	if (updateTabIndex == null) updateTabIndex = true
	const types = ['tag','artist','character','parody','group']
	const typesIndex = [2,3,1,0,4]
	let pageId, thisTabIndex
	if (makeNewTab) {
		pageId = createNewTab(`nhentaiInfoType(${page}, ${whitch}, false, false)`, true, 1)
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
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`nhentaiInfoType(${page}, ${whitch}, false, false)`)
	}

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	tabs[thisTabIndex].options = whitch
	checkBrowserTools(thisTabIndex)
	tabs[thisTabIndex].rename('')
	tabs[thisTabIndex].icon.style.display = 'inline-block'
	tabs[thisTabIndex].icon.setAttribute('src', `Image/dual-ring-primary-${wt_fps}.gif`)
	tabs[thisTabIndex].page.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`

	nhentai.getInfoType(types[whitch], page, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			tabs[thisTabIndex].rename(err)
			tabs[thisTabIndex].icon.style.display = 'none'
			tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		tabs[thisTabIndex].rename(`${types[whitch]} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiSiteTopMenu

		if (result.pagination != undefined) {
			save2 = result.pagination[result.pagination.length - 1][1]
			if (save2 == null) save = page
			else save = save2
		} else save = 1

		tabs[thisTabIndex].jp = 4
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = save
		if (activeTabComicId == pageId) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${save});browserJumpPage(4, Number(this.value))`)
			bjp_m_p.textContent = save
		}

		// Content
		html += '<div class="nhentai-info-type">'
		const whitchInfo = typesIndex[whitch]
		for (let i = 0; i < result.content.length; i++) {
			html += `<section><h2>${result.content[i].name}</h2>`
			for (let j = 0; j < result.content[i].info.length; j++) {
				html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.content[i].info[j].url}\\', 1, ${whitchInfo}, {tab}, true)')"><span>${result.content[i].info[j].name}</span><span>${result.content[i].info[j].count}</span></button>`
			}
			html += '</section>'
		}
		html += '</div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiInfoType(${result.pagination[i][1]}, ${whitch}, {tab}, true)')">${result.pagination[i][0]}</button>`
				else html += `<button type="button" disabled="true">${result.pagination[i][0]}</button>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
	})
}

function nhentaiRandom(makeNewTab, updateTabIndex) {
	makeNewTab = makeNewTab || false
	if (updateTabIndex == null) updateTabIndex = true
	let pageId, thisTabIndex
	if (makeNewTab) {
		pageId = createNewTab(`nhentaiRandom(false, false)`, true, 1)
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
		if (updateTabIndex == true) tabs[thisTabIndex].addHistory(`nhentaiRandom(false, false)`)
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

	nhentai.getRandom((err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			tabs[thisTabIndex].rename(err)
			tabs[thisTabIndex].icon.style.display = 'none'
			tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		const id = result.id
		tabs[thisTabIndex].history[tabs[thisTabIndex].activeHistory] = `nhentaiOpenPost(${id}, false, false)`

		db.have.findOne({s:1, i:id}, (err, haveDoc) => {
			if (err) {
				if (document.getElementById(pageId) == undefined) return
				tabs[thisTabIndex].ir = false
				checkBrowserTools(thisTabIndex)
				tabs[thisTabIndex].page.innerHTML = nhentaiError.replace('{err}', err)
				return
			}
			let have_in_have = false, have_comic = false
			if (haveDoc != undefined) {
				have_in_have = true
				if (haveDoc.d != undefined) have_comic = true
			}
	
			tabs[thisTabIndex].rename(result.name)
			tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
			let html
			html = '<div class="nhentai-container">'+nhentaiSiteTopMenu
			if (have_comic == true) html += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
			else if (have_in_have == true) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button class="remove-from-have" onclick="RemoveFromHave(1, ${id}, this)">You Have This Comic.</button></div>`
			else if (IsDownloading(id, 1)) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p></div>`
			else html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button onclick="nhentaiDownloader(${id})">Download</button><button class="add-to-have" onclick="AddToHave(1, ${id})">Add To Have</button></div>`

			// Info
			html += `<div class="nhentai-comic-info"><div><img src="${result.cover}" loading="lazy"></div><div><div class="nhentai-comic-title">${result.name}</div><div class="nhentai-comic-subtitle">${result.title}</div>`
		
			// Parodies 0
			if (result.parodies != undefined && result.parodies.length != 0) {
				html += '<div class="nhentai-info-row">Parodies: '
				for (let i = 0; i < result.parodies.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.parodies[i].url}\\', 1, 0, {tab}, true)')"><span>${result.parodies[i].name}</span><span>${result.parodies[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Characters 1
			if (result.characters != undefined && result.characters.length != 0) {
				html += '<div class="nhentai-info-row">Characters: '
				for (let i = 0; i < result.characters.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.characters[i].url}\\', 1, 1, {tab}, true)')"><span>${result.characters[i].name}</span><span>${result.characters[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Tags 2
			if (result.tags != undefined && result.tags.length != 0) {
				html += '<div class="nhentai-info-row">Tags: '
				for (let i = 0; i < result.tags.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.tags[i].url}\\', 1, 2, {tab}, true)')"><span>${result.tags[i].name}</span><span>${result.tags[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Artists 3
			if (result.artists != undefined && result.artists.length != 0) {
				html += '<div class="nhentai-info-row">Artists: '
				for (let i = 0; i < result.artists.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.artists[i].url}\\', 1, 3, {tab}, true)')"><span>${result.artists[i].name}</span><span>${result.artists[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Groups 4
			if (result.groups != undefined && result.groups.length != 0) {
				html += '<div class="nhentai-info-row">Groups: '
				for (let i = 0; i < result.groups.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.groups[i].url}\\', 1, 4, {tab}, true)')"><span>${result.groups[i].name}</span><span>${result.groups[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Languages 5
			if (result.languages != undefined && result.languages.length != 0) {
				html += '<div class="nhentai-info-row">Languages: '
				for (let i = 0; i < result.languages.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.languages[i].url}\\', 1, 5, {tab}, true)')"><span>${result.languages[i].name}</span><span>${result.languages[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Categories 6
			if (result.categories != undefined && result.categories.length != 0) {
				html += '<div class="nhentai-info-row">Categories: '
				for (let i = 0; i < result.categories.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\\'${result.categories[i].url}\\', 1, 6, {tab}, true)')"><span>${result.categories[i].name}</span><span>${result.categories[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Pages
			if (result.pages != undefined) {
				html += `<div class="nhentai-info-row">Pages: <button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenPages(${result.pages.from}, ${result.pages.to}, 1, {tab}, true)')"><span>${result.pages.count}</span></button></div>`
			}

			// Upload Date
			if (result.date != undefined) {
				html += `<div class="nhentai-info-row">Uploaded: <time class="nobold" datetime="${result.date.dataTime}">${result.date.year}-${result.date.month}-${result.date.day} ${result.date.hours}:${result.date.minutes}:${result.date.secends}</time></div>`
			}
			html += '</div></div>'

			if (have_comic) {
				// Images
				db.comics.findOne({s:1, p:id}, (err, doc) => {
					if (err) { error(err); return }
					let comic_id = doc._id
					
					if (err) { error(err); return }
					let ImagesCount = doc.c || null
					if (ImagesCount == null) return
					let formats = doc.f || null
					if (formats == null) return
					let image = doc.i

					let lastIndex = formats[0][1]
					let thisForamat = formats[0][2]
					let src = ''
					let formatIndex = 0
					html += '<div class="nhentai-images">'
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
							lastIndex = formats[formatIndex][1]
							thisForamat = formats[formatIndex][2]
							src = `${dirUL}/${comic_id}${image}/${image}-${i}.${thisForamat}`
							if (!fs.existsSync(src)) {
								need_repair.push([src, i])
								src = 'Image/no-img-300x300.png'
							}
							html += `<img data-src="${src}">`
						}
					}
					html += '</div>'

					// Related
					if (result.related != undefined && result.related.length != 0) {
						html += '<div class="nhentai-postrow"><div>Related</div><div>'
						for (let i = 0; i < result.related.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.related[i].id}, {tab}, true)')"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div></div>`
						html += '</div></div>'
					}

					html += '</div></div>'
					tabs[thisTabIndex].page.innerHTML = html
					const LoadingImages = tabs[thisTabIndex].page.getElementsByClassName('nhentai-images')[0].getElementsByTagName('img')

					for (let i = 0; i < LoadingImages.length; i++) {
						imageLoadingObserver.observe(LoadingImages[i])
					}
					clearDownloadedComics(tabs[thisTabIndex].page, 1)
				})
			} else {
				// Images
				html += '<div class="nhentai-images">'
				for (let i = 0; i < result.images.length; i++) html += `<img data-src="${result.images[i].url}">`
				html += '</div>'

				// Related
				if (result.related != undefined && result.related.length != 0) {
					html += '<div class="nhentai-postrow"><div>Related</div><div>'
					for (let i = 0; i < result.related.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.related[i].id}, {tab}, true)')"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div></div>`
					html += '</div></div>'
				}

				html += '</div></div>'
				tabs[thisTabIndex].page.innerHTML = html
				const LoadingImages = tabs[thisTabIndex].page.getElementsByClassName('nhentai-images')[0].getElementsByTagName('img')

				for (let i = 0; i < LoadingImages.length; i++) {
					imageLoadingObserver.observe(LoadingImages[i])
				}
				clearDownloadedComics(tabs[thisTabIndex].page, 1)
			}
		})
	})
}

function nhentaiJumpPage(index, page) {
	switch (index) {
		case 0:
			searchTimer = setTimeout(() => {
				nhentaiChangePage(page, false, true)
			}, 185)
			break
		case 1:
			searchTimer = setTimeout(() => {
				nhentaiOpenInfo(tabs[activeTabIndex].options[0], page, tabs[activeTabIndex].options[1], false, true)
			}, 185)
			break
		case 2:
			searchTimer = setTimeout(() => {
				nhentaiOpenPages(tabs[activeTabIndex].options[0], tabs[activeTabIndex].options[1], page, false, true)
			}, 185)
			break
		case 3:
			searchTimer = setTimeout(() => {
				nhentaiSearch(tabs[activeTabIndex].options, page, false, true)
			}, 185)
			break
		case 4:
			searchTimer = setTimeout(() => {
				nhentaiInfoType(page, tabs[activeTabIndex].options, false, true)
			}, 185)
			break
	}
}

function nhentaiLinkClick(job) {
	const e = window.event, which = e.which
	if (which == 3) return
	e.preventDefault()
	const target = e.target
	if (target.tagName == 'BUTTON' && target.hasAttribute('ssite')) return
	if (which == 1) eval(job.replace('{tab}', 'false'))
	else eval(job.replace('{tab}', 'true'))
}

function nhentaiDownloader(id) {
	id = Number(id)
	if (IsDownloading(id, 1)) { PopAlert('You are Downloading This Comic.', 'danger'); return }
	IsHavingComic(0, id, (have, downloaded) => {
		if (have == true) { PopAlert('You Already Have This Comic.', 'danger'); return }
		const downloaderIndex = AddDownloaderList(1)
		changeButtonsToDownloading(id, 1, false)
		nhentai.getComic(id, false, (err, result) => {
			if (err) { RemoveDownloaderList(downloaderIndex); PopAlert(err, 'danger'); changeButtonsToDownloading(id, 1, true); return }
			
			let name = result.name, downloadImageList = []
	
			for (let i = 0; i < result.images.length; i++) {
				downloadImageList.push(result.images[i].url)
			}
			MakeDownloadList(downloaderIndex, name, id, downloadImageList)
	
			const sendingResult = {}
			sendingResult.title = result.name
			if (result.characters != undefined)	{
				sendingResult.characters = []
				for (let i = 0; i < result.characters.length; i++) {
					sendingResult.characters.push(result.characters[i].name)
				}
			}
			if (result.languages != undefined)	{
				sendingResult.languages = []
				for (let i = 0; i < result.languages.length; i++) {
					sendingResult.languages.push(result.languages[i].name)
				}
			}
			if (result.categories != undefined)	{
				sendingResult.categories = []
				for (let i = 0; i < result.categories.length; i++) {
					sendingResult.categories.push(result.categories[i].name)
				}
			}
			if (result.groups != undefined)	{
				sendingResult.groups = []
				for (let i = 0; i < result.groups.length; i++) {
					sendingResult.groups.push(result.groups[i].name)
				}
			}
			if (result.artists != undefined)	{
				sendingResult.artists = []
				for (let i = 0; i < result.artists.length; i++) {
					sendingResult.artists.push(result.artists[i].name)
				}
			}
			if (result.parody != undefined)	{
				sendingResult.parody = []
				for (let i = 0; i < result.parodies.length; i++) {
					sendingResult.parody.push(result.parodies[i].name)
				}
			}
			if (result.tags != undefined)	{
				sendingResult.tags = []
				for (let i = 0; i < result.tags.length; i++) {
					sendingResult.tags.push(result.tags[i].name)
				}
			}
			PopAlert(`Download Started. '${name}'`, 'primary')
			comicDownloader(downloaderIndex, sendingResult)
		})
	})
}

function nhentaiRepairComicInfoGetInfo(id, whitch) {
	let comic_id = Number(comicPanel.getAttribute('cid'))
	let reset = 4
	if (whitch == 0) reset = 2
	loading.reset(reset)
	loading.show('Connecting To Web...')
	nhentai.getComic(id, false, (err, result) => {
		if (err) { loading.hide(); error(err); return }
		let neededResult
		switch (whitch) {
			case 0:
				db.comics.update({_id:comic_id}, { $set: {n:result.name.toLowerCase()} }, {}, (err) => {
					if (err) { loading.hide(); error(err); return }
					loading.forward('Repairing Name...')
					document.getElementById('c-p-t').textContent = result.name
					loading.forward()
					loading.hide()
					PopAlert('Comic Name has been Repaired!')
				})
				break
			case 1:
				neededResult = result.groups || null
				if (neededResult == null) {
					loading.hide()
					PopAlert('This Comic has no Group.', 'danger')
					return
				}
				loading.forward('Listing Groups...')
				const groupsList = []
				for (let i in neededResult) groupsList.push(neededResult[i].name)
				loading.forward('Add Groups To Database...')
				CreateGroup(groupsList, comic_id, 0, true)
				break
			case 2:
				neededResult = result.artists || null
				if (neededResult == null) {
					loading.hide()
					PopAlert('This Comic has no Artist.', 'danger')
					return
				}
				loading.forward('Listing Artists...')
				const artistsList = []
				for (let i in neededResult) artistsList.push(neededResult[i].name)
				loading.forward('Add Artists To Database...')
				CreateArtist(artistsList, comic_id, 0, true)
				break
			case 3:
				neededResult = result.parodies || null
				if (neededResult == null) {
					loading.hide()
					PopAlert('This Comic has no Parody.', 'danger')
					return
				}
				loading.forward('Listing Parodies...')
				const parodyList = []
				for (let i in neededResult) parodyList.push(neededResult[i].name)
				loading.forward('Add Parodies To Database...')
				CreateParody(parodyList, comic_id, 0, true)
				break
			case 4:
				neededResult = result.tags || null
				if (neededResult == null) {
					loading.hide()
					PopAlert('This Comic has no Tag.', 'danger')
					return
				}
				loading.forward('Listing Tags...')
				const tagsList = []
				for (let i in neededResult) tagsList.push(neededResult[i].name)
				loading.forward('Add Tags To Database...')
				CreateTag(tagsList, comic_id, 0, true)
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
					newList.push(neededResult[need_repair[i][1]].url)
					saveList.push(need_repair[i][0])
				}

				ImageListDownloader(newList, 0, saveList, false, err => {
					if (err) {
						procressPanel.config({ bgClose:true, closeBtn:true })
					} else {
						procressPanel.reset(1)
					}
					PopAlert('Comic Undownloaded Images Has Beed Downloaded.')
					openComic(comic_id)
				})
				break
			case 6:
				neededResult = result.characters || null
				if (neededResult == null) {
					loading.hide()
					PopAlert('This Comic has no Characters.', 'danger')
					return
				}
				loading.forward('Listing Characters...')
				const charactersList = []
				for (let i in neededResult) charactersList.push(neededResult[i].name)
				loading.forward('Add Characters To Database...')
				CreateCharacter(charactersList, comic_id, 0, true)
				break
			case 7:
				neededResult = result.languages || null
				if (neededResult == null) {
					loading.hide()
					PopAlert('This Comic has no Languages.', 'danger')
					return
				}
				loading.forward('Listing Languages...')
				const languagesList = []
				for (let i in neededResult) languagesList.push(neededResult[i].name)
				loading.forward('Add Languages To Database...')
				CreateLanguage(languagesList, comic_id, 0, true)
				break
			case 8:
				neededResult = result.categories || null
				if (neededResult == null) {
					loading.hide()
					PopAlert('This Comic has no Categories.', 'danger')
					return
				}
				loading.forward('Listing Categories...')
				const categoriesList = []
				for (let i in neededResult) categoriesList.push(neededResult[i].name)
				loading.forward('Add Categories To Database...')
				CreateCategory(categoriesList, comic_id, 0, true)
				break
		}
	})
}

function nhentaiRepairAllComicInfo(id, comic_id) {
	nhentai.getComic(id, false, (err, result) => {
		if (err) {
			procressPanel.add(`"${repair_all_list[0][0]}" -> ${err}`, 'danger')
			repair_all_error_list.push(repair_all_list[0])
			repair_all_list.shift()
			RepairAllComicLoop()
			return
		}

		const title = result.title.toLowerCase() || null
		let neededResult
		
		neededResult = result.groups || null
		if (neededResult != null) {
			const groupsList = []
			for (let i in neededResult) groupsList.push(neededResult[i].name)
			CreateGroup(groupsList, comic_id, 0, true)
		}

		neededResult = result.artists || null
		if (neededResult != null) {
			const artistsList = []
			for (let i in neededResult) artistsList.push(neededResult[i].name)
			CreateArtist(artistsList, comic_id, 0, true)
		}

		neededResult = result.parodies || null
		if (neededResult != null) {
			const parodyList = []
			for (let i in neededResult) parodyList.push(neededResult[i].name)
			CreateParody(parodyList, comic_id, 0, true)
		}

		neededResult = result.tags || null
		if (neededResult != null) {
			const tagsList = []
			for (let i in neededResult) tagsList.push(neededResult[i].name)
			CreateTag(tagsList, comic_id, 0, true)
		}

		neededResult = result.characters || null
		if (neededResult != null) {
			const charactersList = []
			for (let i in neededResult) charactersList.push(neededResult[i].name)
			CreateCharacter(charactersList, comic_id, 0, true)
		}

		neededResult = result.languages || null
		if (neededResult != null) {
			const languagesList = []
			for (let i in neededResult) languagesList.push(neededResult[i].name)
			CreateLanguage(languagesList, comic_id, 0, true)
		}

		neededResult = result.categories || null
		if (neededResult != null) {
			const categoriesList = []
			for (let i in neededResult) categoriesList.push(neededResult[i].name)
			CreateCategory(categoriesList, comic_id, 0, true)
		}

		db.comics.update({_id:comic_id}, { $set: {n:title} }, {}, (err) => {
			if (err) procressPanel.add(`UpdateComicName -> "${repair_all_list[0][0]}" -> ${err}`, 'danger')
			else procressPanel.add(`Comic "${repair_all_list[0][0]}" Has Been Repair`)
			repair_all_list.shift()
			RepairAllComicLoop()
		})
	})
}