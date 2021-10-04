const { futimesSync, readSync } = require("original-fs")

const nhentai = new nHentaiAPI()
const nhentaiError = '<div class="alert alert-danger">{err}</div>'
const nhentaiSiteTopMenu = '<div class="nhentai-top-menu"><i><svg xmlns="http://www.w3.org/2000/svg" width="482.556" height="209.281" viewBox="45.002 196.466 482.556 209.281"><path fill="#EC2854" stroke="#EC2854" stroke-miterlimit="10" d="M217.198 232.5c-16.597 6.907-52.729 34.028-36.249 58.467 7.288 10.807 19.94 18.442 31.471 22.057 10.732 3.363 23.897-.761 33.709 3.721-2.09 5.103-9.479 23.689-15.812 22.319-11.827-2.544-23.787-.445-33.07 8.485-18.958-26.295-45.97-36.974-75.739-29.676 22.066-27.2 16.719-55.687-6.468-81.622-13.999-15.657-47.993-37.963-69.845-28.853 54.591-22.738 121.119-5.555 172.003 25.102-8.815 3.669-3.617-2.179 0 0zm138.167 0c16.595 6.908 52.729 34.028 36.249 58.467-7.288 10.807-19.939 18.443-31.473 22.059-10.731 3.365-23.896-.762-33.712 3.721 2.104 5.112 9.464 23.671 15.812 22.318 11.826-2.542 23.789-.448 33.068 8.484 18.959-26.294 45.974-36.975 75.738-29.676-22.056-27.206-16.726-55.682 6.471-81.622 13.997-15.654 47.995-37.967 69.847-28.854-54.586-22.733-121.116-5.562-172 25.103 8.817 3.669 3.616-2.18 0 0z"/><path fill="none" d="M723.057 240.921H824.18v56.18H723.057z"/><path fill="#FFF" d="M225.434 293.58h23.199v15.919c6.874-6.563 14.154-11.274 21.841-14.137 7.687-2.863 16.234-4.295 25.64-4.295 20.621 0 34.549 5.552 41.785 16.653 3.979 6.074 5.969 14.766 5.969 26.077v71.95h-24.826v-70.693c0-6.842-1.312-12.358-3.935-16.547-4.344-6.982-12.209-10.473-23.604-10.473-5.789 0-10.538.455-14.246 1.363-6.693 1.536-12.572 4.608-17.636 9.216-4.07 3.701-6.716 7.522-7.937 11.467-1.221 3.945-1.832 9.582-1.832 16.913v58.754h-24.419l.001-112.167z"/></svg></i><button type="button">Random</button><button type="button">Tags</button><button type="button">Artists</button><button type="button">Characters</button><button type="button">Parodies</button><button type="button">Groups</button></div>'

function nhentaiChangePage(page, makeNewPage, updateTabIndex) {
	page = page || 1
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	let pageId
	if (makeNewPage) {
		pageId = createNewTab(`nhentaiChangePage(${page}, false, false)`, true, 0)
		if (pageId == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
	} else {
		pageId = activeTabComicId
		const passImages = document.getElementById(pageId).getElementsByTagName('img')
		if (passImages != undefined) {
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].addHistory(`nhentaiChangePage(${page}, false, false)`)
	}

	const pageContent = document.getElementById(pageId)
	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const tab = tabsContainer.querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	checkBrowserTools(thisTabIndex)
	tabArea.innerHTML = `<img class="spin" src="Image/dual-ring-primary-${wt_fps}.gif">`
	pageContent.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`

	nhentai.getPage(page, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		pageContent.innerHTML = ''
		if (err) {
			pageContent.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		tabArea.textContent = `Page ${page}`
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

		// Popular
		if (page == 1 && result.popular.length != 0) {
			html += '<div class="nhentai-postrow"><div>Popular</div><div>'
			if (setting.lazy_loading) {
				for (let i = 0; i < result.popular.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.popular[i].id}, {tab}, true)')"><img src="${result.popular[i].thumb}" loading="lazy"><div ${result.popular[i].lang}>${result.popular[i].title}</div></div>`
			} else {
				for (let i = 0; i < result.popular.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.popular[i].id}, {tab}, true)')"><img src="${result.popular[i].thumb}"><div ${result.popular[i].lang}>${result.popular[i].title}</div></div>`
			}
			html += '</div></div>'
		}

		// Content
		html += `<div class="nhentai-postrow"><div>Content Page ${page}</div><div>`
		if (setting.lazy_loading) {
			for (let i = 0; i < result.content.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div></div>`
		} else {
			for (let i = 0; i < result.content.length; i++) html += `<div onmousedown="nhentaiLinkClick('nhentaiOpenPost(${result.content[i].id}, {tab}, true)')"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div></div>`
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

		pageContent.innerHTML = html
		clearDownloadedComics(pageContent, 1)
	})
}

function nhentaiOpenPost(id, makeNewTab, updateTabIndex) {
	id = id || null
	if (id == null) return
	makeNewTab = makeNewTab || false
	if (updateTabIndex == null) updateTabIndex = true
	let pageId
	if (makeNewTab) {
		pageId = createNewTab(`nhentaiOpenPost(${id}, false, false)`, true, 0)
		if (pageId == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
	} else {
		pageId = activeTabComicId
		const passImages = document.getElementById(pageId).getElementsByTagName('img')
		if (passImages != undefined) {
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))].addHistory(`nhentaiOpenPost(${id}, false, false)`)
	}

	const pageContent = document.getElementById(pageId)

	if (activeTabComicId == pageId) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const tab = tabsContainer.querySelector(`[pi="${pageId}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	checkBrowserTools(thisTabIndex)
	tabArea.innerHTML = `<img class="spin" src="Image/dual-ring-primary-${wt_fps}.gif">`
	pageContent.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`
	db.have.findOne({s:1, i:id}, (err, haveDoc) => {
		if (err) {
			if (document.getElementById(pageId) == undefined) return
			tabs[thisTabIndex].ir = false
			checkBrowserTools(thisTabIndex)
			pageContent.innerHTML = nhentaiError.replace('{err}', err)
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
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = nhentaiError.replace('{err}', err)
				return
			}
			tabArea.textContent = result.name
			let html
			html = '<div class="nhentai-container">'+nhentaiSiteTopMenu

			if (have_comic == true) html += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
			else if (have_in_have == true) html += `<div class="browser-comic-have" ccid="${result.id}"><button class="remove-from-have" onclick="RemoveFromHave(1, ${result.id}, this)">You Have This Comic.</button></div>`
			else if (IsDownloading(result.id)) html += `<div class="browser-comic-have" ccid="${result.id}"><p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p></div>`
			else html += `<div class="browser-comic-have" ccid="${result.id}"><button onclick="xlecxDownloader('${result.id}')">Download</button><button class="add-to-have" onclick="AddToHave(1, '${result.id}')">Add To Have</button></div>`

			console.log(result)

			// Info
			html += `<div class="nhentai-comic-info"><div><img src="${result.cover}" loading="lazy"></div><div><div class="nhentai-comic-title">${result.name}</div><div class="nhentai-comic-subtitle">${result.title}</div>`
		
			// Parodies 0
			if (result.parodies != undefined && result.parodies.length != 0) {
				html += '<div class="nhentai-info-row">Parodies: '
				for (let i = 0; i < result.parodies.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\'${result.parodies[i].url}\', 1, 0, {tab}, true)')"><span>${result.parodies[i].name}</span><span>${result.parodies[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Characters 1
			if (result.characters != undefined && result.characters.length != 0) {
				html += '<div class="nhentai-info-row">Characters: '
				for (let i = 0; i < result.characters.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\'${result.characters[i].url}\', 1, 1, {tab}, true)')"><span>${result.characters[i].name}</span><span>${result.characters[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Tags 2
			if (result.tags != undefined && result.tags.length != 0) {
				html += '<div class="nhentai-info-row">Tags: '
				for (let i = 0; i < result.tags.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\'${result.tags[i].url}\', 1, 2, {tab}, true)')"><span>${result.tags[i].name}</span><span>${result.tags[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Artists 3
			if (result.artists != undefined && result.artists.length != 0) {
				html += '<div class="nhentai-info-row">Artists: '
				for (let i = 0; i < result.artists.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\'${result.artists[i].url}\', 1, 3, {tab}, true)')"><span>${result.artists[i].name}</span><span>${result.artists[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Groups 4
			if (result.groups != undefined && result.groups.length != 0) {
				html += '<div class="nhentai-info-row">Groups: '
				for (let i = 0; i < result.groups.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\'${result.groups[i].url}\', 1, 4, {tab}, true)')"><span>${result.groups[i].name}</span><span>${result.groups[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Languages 5
			if (result.languages != undefined && result.languages.length != 0) {
				html += '<div class="nhentai-info-row">Languages: '
				for (let i = 0; i < result.languages.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\'${result.languages[i].url}\', 1, 5, {tab}, true)')"><span>${result.languages[i].name}</span><span>${result.languages[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Categories 6
			if (result.categories != undefined && result.categories.length != 0) {
				html += '<div class="nhentai-info-row">Categories: '
				for (let i = 0; i < result.categories.length; i++) {
					html += `<button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenInfo(\'${result.categories[i].url}\', 1, 6, {tab}, true)')"><span>${result.categories[i].name}</span><span>${result.categories[i].count}</span></button>`
				}
				html += '</div>'
			}

			// Pages
			if (result.pages != undefined) {
				html += `<div class="nhentai-info-row">Pages: <button type="button" onmousedown="nhentaiLinkClick('nhentaiOpenPages(${result.pages.from}, ${result.pages.to}, {tab}, true)')"><span>${result.pages.count}</span></button></div>`
			}

			// Upload Date
			if (result.date != undefined) {
				html += `<div class="nhentai-info-row">Uploaded: <time class="nobold" datetime="${result.date.dataTime}">${result.date.year}-${result.date.month}-${result.date.day} ${result.date.hours}:${result.date.minutes}:${result.date.secends}</time></div>`
			}
			html += '</div></div>'

			if (have_comic) {
				// Images
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
			}

			html += '</div></div>'
			pageContent.innerHTML = html
			const LoadingImages = pageContent.getElementsByClassName('nhentai-images')[0].getElementsByTagName('img')

			for (let i = 0; i < LoadingImages.length; i++) {
				imageLoadingObserver.observe(LoadingImages[i])
			}
			clearDownloadedComics(pageContent, 1)
		})
	})
}

function nhentaiOpenInfo(name, page, whitch, makeNewTab, updateTabIndex) {}

function nhentaiOpenPages(from, to, makeNewTab, updateTabIndex) {}

function nhentaiLinkClick(job) {
	const e = window.event, which = e.which
	if (which == 3) return
	e.preventDefault()
	if (which == 1) eval(job.replace('{tab}', 'false'))
	else eval(job.replace('{tab}', 'true'))
}

function nhentaiDownloader(id) {
	console.log('downloading')
}