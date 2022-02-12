const nhentai = new nHentaiAPI()
const nhentaiSiteTopMenu = `<div class="nhentai-top-menu"><i><svg xmlns="http://www.w3.org/2000/svg" width="482.556" height="209.281" viewBox="45.002 196.466 482.556 209.281"><path fill="#EC2854" stroke="#EC2854" stroke-miterlimit="10" d="M217.198 232.5c-16.597 6.907-52.729 34.028-36.249 58.467 7.288 10.807 19.94 18.442 31.471 22.057 10.732 3.363 23.897-.761 33.709 3.721-2.09 5.103-9.479 23.689-15.812 22.319-11.827-2.544-23.787-.445-33.07 8.485-18.958-26.295-45.97-36.974-75.739-29.676 22.066-27.2 16.719-55.687-6.468-81.622-13.999-15.657-47.993-37.963-69.845-28.853 54.591-22.738 121.119-5.555 172.003 25.102-8.815 3.669-3.617-2.179 0 0zm138.167 0c16.595 6.908 52.729 34.028 36.249 58.467-7.288 10.807-19.939 18.443-31.473 22.059-10.731 3.365-23.896-.762-33.712 3.721 2.104 5.112 9.464 23.671 15.812 22.318 11.826-2.542 23.789-.448 33.068 8.484 18.959-26.294 45.974-36.975 75.738-29.676-22.056-27.206-16.726-55.682 6.471-81.622 13.997-15.654 47.995-37.967 69.847-28.854-54.586-22.733-121.116-5.562-172 25.103 8.817 3.669 3.616-2.18 0 0z"/><path fill="none" d="M723.057 240.921H824.18v56.18H723.057z"/><path fill="#FFF" d="M225.434 293.58h23.199v15.919c6.874-6.563 14.154-11.274 21.841-14.137 7.687-2.863 16.234-4.295 25.64-4.295 20.621 0 34.549 5.552 41.785 16.653 3.979 6.074 5.969 14.766 5.969 26.077v71.95h-24.826v-70.693c0-6.842-1.312-12.358-3.935-16.547-4.344-6.982-12.209-10.473-23.604-10.473-5.789 0-10.538.455-14.246 1.363-6.693 1.536-12.572 4.608-17.636 9.216-4.07 3.701-6.716 7.522-7.937 11.467-1.221 3.945-1.832 9.582-1.832 16.913v58.754h-24.419l.001-112.167z"/></svg></i><div onmousedown="{r}">Random</div><div onmousedown="{t}">Tags</div><div onmousedown="{t1}">Artists</div><div onmousedown="{t2}">Characters</div><div onmousedown="{t3}">Parodies</div><div onmousedown="{t4}">Groups</div></div>`

function nhentaiMakeMenu(tabId) {
	return nhentaiSiteTopMenu.replace('{r}', `LinkClick(${tabId},${tabs[tabId].AddLink(5)})`).replace('{t}', `LinkClick(${tabId},${tabs[tabId].AddLink(4,[1,0])})`).replace('{t1}', `LinkClick(${tabId},${tabs[tabId].AddLink(4,[1,1])})`).replace('{t2}', `LinkClick(${tabId},${tabs[tabId].AddLink(4,[1,2])})`).replace('{t3}', `LinkClick(${tabId},${tabs[tabId].AddLink(4,[1,3])})`).replace('{t4}', `LinkClick(${tabId},${tabs[tabId].AddLink(4,[1,4])})`)
}

function nhentaiMakeErr(tabId,err) {
	tabs[tabId].rename(err)
	tabs[tabId].icon.style.display = 'none'
	tabs[tabId].page.innerHTML = '<div class="nhentai-container">'+nhentaiMakeMenu(tabId)+'<div class="nhentai-error">'+err+'</div></div>'
	console.error(err)
}

function nhentaiChangePage(page = 1, makeNewPage = false, updateTabIndex = true) {
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
			try {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
				passImages[i].remove()
			} catch(err) { console.error(err) }
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
			nhentaiMakeErr(thisTabIndex,err)
			return
		}
		tabs[thisTabIndex].rename(`Page ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html = '<div class="nhentai-container">'+nhentaiMakeMenu(thisTabIndex)

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
					if (Downloader.IsDownloading(1, result.popular[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.popular[i].id)},this)" cid="${result.popular[i].id}" h="0"><img src="${result.popular[i].thumb}" loading="lazy"><div ${result.popular[i].lang}>${result.popular[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
					else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.popular[i].id)},this)" cid="${result.popular[i].id}" h="0"><img src="${result.popular[i].thumb}" loading="lazy"><div ${result.popular[i].lang}>${result.popular[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
				}
			} else {
				for (let i = 0; i < result.popular.length; i++) {
					if (Downloader.IsDownloading(1, result.popular[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.popular[i].id)},this)" cid="${result.popular[i].id}" h="0"><img src="${result.popular[i].thumb}"><div ${result.popular[i].lang}>${result.popular[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
					else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.popular[i].id)},this)" cid="${result.popular[i].id}" h="0"><img src="${result.popular[i].thumb}"><div ${result.popular[i].lang}>${result.popular[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
				}
			}
			html += '</div></div>'
		}

		// Content
		html += `<div class="nhentai-postrow"><div>Content Page ${page}</div><div>`
		if (setting.lazy_loading) {
			for (let i = 0; i < result.content.length; i++) {
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(6,result.pagination[i][1])})">${result.pagination[i][0]}</div>`
				else html += `<div disabled>${result.pagination[i][0]}</div>`
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
			try {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
				passImages[i].remove()
			} catch(err) { console.error(err) }
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
	let have_in_have = false, have_comic = false
	const haveIndex = GetHave(1,id)
	if (haveIndex != null) {
		have_in_have = true
		have_comic = haveDBComic[haveIndex] == 1
	}
	nhentai.getComic(id, true, (err, result) => {
		if (document.getElementById(pageId) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		tabs[thisTabIndex].page.innerHTML = null
		if (err) {
			nhentaiMakeErr(thisTabIndex,err)
			return
		}
		tabs[thisTabIndex].rename(result.name)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let html
		html = '<div class="nhentai-container">'+nhentaiMakeMenu(thisTabIndex)
		if (have_comic == true) html += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
		else if (have_in_have == true) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button class="remove-from-have" onclick="RemoveFromHave(1, ${id}, this)">You Have This Comic.</button></div>`
		else if (Downloader.IsDownloading(1, id)) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p></div>`
		else html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button onclick="nhentaiDownloader(${id})">Download</button><button class="add-to-have" onclick="AddToHave(1, ${id})">Add To Have</button></div>`

		// Info
		html += `<div class="nhentai-comic-info"><div><img src="${result.cover}" loading="lazy"></div><div><div class="nhentai-comic-title">${result.name}</div><div class="nhentai-comic-subtitle">${result.title}</div>`
	
		// Parodies 0
		if (result.parodies != undefined && result.parodies.length != 0) {
			html += '<div class="nhentai-info-row">Parodies: '
			for (let i = 0; i < result.parodies.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.parodies[i].url,1,0])})"><span>${result.parodies[i].name}</span><span>${result.parodies[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Characters 1
		if (result.characters != undefined && result.characters.length != 0) {
			html += '<div class="nhentai-info-row">Characters: '
			for (let i = 0; i < result.characters.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.characters[i].url,1,1])})"><span>${result.characters[i].name}</span><span>${result.characters[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Tags 2
		if (result.tags != undefined && result.tags.length != 0) {
			html += '<div class="nhentai-info-row">Tags: '
			for (let i = 0; i < result.tags.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.tags[i].url,1,2])})"><span>${result.tags[i].name}</span><span>${result.tags[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Artists 3
		if (result.artists != undefined && result.artists.length != 0) {
			html += '<div class="nhentai-info-row">Artists: '
			for (let i = 0; i < result.artists.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.artists[i].url,1,3])})"><span>${result.artists[i].name}</span><span>${result.artists[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Groups 4
		if (result.groups != undefined && result.groups.length != 0) {
			html += '<div class="nhentai-info-row">Groups: '
			for (let i = 0; i < result.groups.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.groups[i].url,1,4])})"><span>${result.groups[i].name}</span><span>${result.groups[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Languages 5
		if (result.languages != undefined && result.languages.length != 0) {
			html += '<div class="nhentai-info-row">Languages: '
			for (let i = 0; i < result.languages.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.languages[i].url,1,5])})"><span>${result.languages[i].name}</span><span>${result.languages[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Categories 6
		if (result.categories != undefined && result.categories.length != 0) {
			html += '<div class="nhentai-info-row">Categories: '
			for (let i = 0; i < result.categories.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.categories[i].url,1,6])})"><span>${result.categories[i].name}</span><span>${result.categories[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Pages
		if (result.pages != undefined) {
			html += `<div class="nhentai-info-row">Pages: <div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(2,[result.pages.from,result.pages.to,1])})"><span>${result.pages.count}</span></div></div>`
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
						html += `<img data-src="${src}" loading="lazy">`
					} else {
						formatIndex++
						try {
							lastIndex = formats[formatIndex][1]
							thisForamat = formats[formatIndex][2]
						} catch(err) {
							for (let j = i; j < ImagesCount; j++) html += `<img data-src="Image/no-img-300x300.png" loading="lazy">`
							break
						}
						
						src = `${dirUL}/${comic_id}${image}/${image}-${i}.${thisForamat}`
						if (!fs.existsSync(src)) {
							need_repair.push([src, i])
							src = 'Image/no-img-300x300.png'
						}
						html += `<img data-src="${src}" loading="lazy">`
					}
				}
				html += '</div>'

				// Related
				if (result.related != undefined && result.related.length != 0) {
					html += '<div class="nhentai-postrow"><div>Related</div><div>'
					for (let i = 0; i < result.related.length; i++) {
						if (Downloader.IsDownloading(1, result.related[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
						else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
					}
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
			for (let i = 0; i < result.images.length; i++) html += `<img data-src="${result.images[i].url}" loading="lazy">`
			html += '</div>'

			// Related
			if (result.related != undefined && result.related.length != 0) {
				html += '<div class="nhentai-postrow"><div>Related</div><div>'
				for (let i = 0; i < result.related.length; i++) {
					if (Downloader.IsDownloading(1, result.related[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
					else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
				}
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
}

function nhentaiOpenInfo(name = null, page = 1, whitch = null, makeNewTab = false, updateTabIndex = true) {
	if (name == null) return
	if (whitch == null) return
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
			try {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
				passImages[i].remove()
			} catch(err) { console.error(err) }
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
			nhentaiMakeErr(thisTabIndex,err)
			return
		}
		tabs[thisTabIndex].rename(`${result.name} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiMakeMenu(thisTabIndex)

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
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[name,result.pagination[i][1],whitch])})">${result.pagination[i][0]}</div>`
				else html += `<div disabled>${result.pagination[i][0]}</div>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
		clearDownloadedComics(tabs[thisTabIndex].page, 1)
	})
}

function nhentaiOpenPages(from = null, to = null, page = 1, makeNewTab = false, updateTabIndex = true) {
	if (from == null || to == null) return
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
			try {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
				passImages[i].remove()
			} catch(err) { console.error(err) }
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
			nhentaiMakeErr(thisTabIndex,err)
			return
		}
		tabs[thisTabIndex].rename(`From ${from} To ${to} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiMakeMenu(thisTabIndex)

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
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(2,[from,to,result.pagination[i][1]])})">${result.pagination[i][0]}</div>`
				else html += `<div disabled>${result.pagination[i][0]}</div>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
		clearDownloadedComics(tabs[thisTabIndex].page, 1)
	})
}

function nhentaiSearch(text = null, page = 1, makeNewTab = false, updateTabIndex = true) {
	if (text == null) return
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
			try {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
				passImages[i].remove()
			} catch(err) { console.error(err) }
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
			nhentaiMakeErr(thisTabIndex,err)
			return
		}
		tabs[thisTabIndex].rename(`S: ${convertToURL(text, true)} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiMakeMenu(thisTabIndex)

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
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}" loading="lazy"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		} else {
			for (let i = 0; i < result.content.length; i++) {
				if (Downloader.IsDownloading(1, result.content[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
				else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.content[i].id)},this)" cid="${result.content[i].id}" h="0"><img src="${result.content[i].thumb}"><div ${result.content[i].lang}>${result.content[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
			}
		}
		html += '</div></div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(3,[text,result.pagination[i][1]])})">${result.pagination[i][0]}</div>`
				else html += `<div disabled>${result.pagination[i][0]}</div>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
		clearDownloadedComics(tabs[thisTabIndex].page, 1)
	})
}

function nhentaiInfoType(page = 1, whitch = null, makeNewTab = false, updateTabIndex = true) {
	if (whitch == null) return
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
			try {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
				passImages[i].remove()
			} catch(err) { console.error(err) }
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
			nhentaiMakeErr(thisTabIndex,err)
			return
		}
		tabs[thisTabIndex].rename(`${types[whitch]} - ${page}`)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let save, save2, html
		html = '<div class="nhentai-container">'+nhentaiMakeMenu(thisTabIndex)

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
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.content[i].info[j].url,1,whitchInfo])})"><span>${result.content[i].info[j].name}</span><span>${result.content[i].info[j].count}</span></div>`
			}
			html += '</section>'
		}
		html += '</div>'
		
		// Pagination
		html += '</div>'
		if (result.pagination != null && result.pagination.length != 0) {
			html += '<div class="nhentai-pagination">'
			for (let i = 0; i < result.pagination.length; i++) {
				if (result.pagination[i][1] != null) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.pagination[i][1],whitch])})">${result.pagination[i][0]}</div>`
				else html += `<div disabled>${result.pagination[i][0]}</div>`
			}
			html += '</div>'
		}

		tabs[thisTabIndex].page.innerHTML = html
	})
}

function nhentaiRandom(makeNewTab = false, updateTabIndex = true) {
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
			try {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
				passImages[i].remove()
			} catch(err) { console.error(err) }
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
			nhentaiMakeErr(thisTabIndex,err)
			return
		}
		const id = result.id
		tabs[thisTabIndex].history[tabs[thisTabIndex].activeHistory] = `nhentaiOpenPost(${id}, false, false)`
		let have_in_have = false, have_comic = false
		const haveIndex = GetHave(1,id)
		if (haveIndex != null) {
			have_in_have = true
			have_comic = haveDBComic[haveIndex] == 1
		}
		tabs[thisTabIndex].rename(result.name)
		tabs[thisTabIndex].icon.setAttribute('src', 'Image/sites/nhentai-30x30.jpg')
		let html
		html = '<div class="nhentai-container">'+nhentaiMakeMenu(thisTabIndex)
		if (have_comic == true) html += '<div class="browser-comic-have"><span>You Downloaded This Comic.<span></div>'
		else if (have_in_have == true) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button class="remove-from-have" onclick="RemoveFromHave(1, ${id}, this)">You Have This Comic.</button></div>`
		else if (Downloader.IsDownloading(1, id)) html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p></div>`
		else html += `<div class="browser-comic-have" sssite="1" ccid="${id}"><button onclick="nhentaiDownloader(${id})">Download</button><button class="add-to-have" onclick="AddToHave(1, ${id})">Add To Have</button></div>`

		// Info
		html += `<div class="nhentai-comic-info"><div><img src="${result.cover}" loading="lazy"></div><div><div class="nhentai-comic-title">${result.name}</div><div class="nhentai-comic-subtitle">${result.title}</div>`
	
		// Parodies 0
		if (result.parodies != undefined && result.parodies.length != 0) {
			html += '<div class="nhentai-info-row">Parodies: '
			for (let i = 0; i < result.parodies.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.parodies[i].url,1,0])})"><span>${result.parodies[i].name}</span><span>${result.parodies[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Characters 1
		if (result.characters != undefined && result.characters.length != 0) {
			html += '<div class="nhentai-info-row">Characters: '
			for (let i = 0; i < result.characters.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.characters[i].url,1,1])})"><span>${result.characters[i].name}</span><span>${result.characters[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Tags 2
		if (result.tags != undefined && result.tags.length != 0) {
			html += '<div class="nhentai-info-row">Tags: '
			for (let i = 0; i < result.tags.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.tags[i].url,1,2])})"><span>${result.tags[i].name}</span><span>${result.tags[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Artists 3
		if (result.artists != undefined && result.artists.length != 0) {
			html += '<div class="nhentai-info-row">Artists: '
			for (let i = 0; i < result.artists.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.artists[i].url,1,3])})"><span>${result.artists[i].name}</span><span>${result.artists[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Groups 4
		if (result.groups != undefined && result.groups.length != 0) {
			html += '<div class="nhentai-info-row">Groups: '
			for (let i = 0; i < result.groups.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.groups[i].url,1,4])})"><span>${result.groups[i].name}</span><span>${result.groups[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Languages 5
		if (result.languages != undefined && result.languages.length != 0) {
			html += '<div class="nhentai-info-row">Languages: '
			for (let i = 0; i < result.languages.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.languages[i].url,1,5])})"><span>${result.languages[i].name}</span><span>${result.languages[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Categories 6
		if (result.categories != undefined && result.categories.length != 0) {
			html += '<div class="nhentai-info-row">Categories: '
			for (let i = 0; i < result.categories.length; i++) {
				html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(1,[result.categories[i].url,1,6])})"><span>${result.categories[i].name}</span><span>${result.categories[i].count}</span></div>`
			}
			html += '</div>'
		}

		// Pages
		if (result.pages != undefined) html += `<div class="nhentai-info-row">Pages: <div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(2,[result.pages.from,result.pages.to,1])})"><span>${result.pages.count}</span></div></div>`

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
						html += `<img data-src="${src}" loading="lazy">`
					} else {
						formatIndex++
						try {
							lastIndex = formats[formatIndex][1]
							thisForamat = formats[formatIndex][2]
						} catch(err) {
							for (let j = i; j < ImagesCount; j++) html += `<img data-src="Image/no-img-300x300.png" loading="lazy">`
							break
						}
						src = `${dirUL}/${comic_id}${image}/${image}-${i}.${thisForamat}`
						if (!fs.existsSync(src)) {
							need_repair.push([src, i])
							src = 'Image/no-img-300x300.png'
						}
						html += `<img data-src="${src}" loading="lazy">`
					}
				}
				html += '</div>'

				// Related
			if (result.related != undefined && result.related.length != 0) {
				html += '<div class="nhentai-postrow"><div>Related</div><div>'
				for (let i = 0; i < result.related.length; i++) {
					if (Downloader.IsDownloading(1, result.related[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
					else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
				}
				html += '</div></div>'
			}

				html += '</div></div>'
				tabs[thisTabIndex].page.innerHTML = html
				const LoadingImages = tabs[thisTabIndex].page.getElementsByClassName('nhentai-images')[0].getElementsByTagName('img')

				for (let i = 0; i < LoadingImages.length; i++) imageLoadingObserver.observe(LoadingImages[i])
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
				for (let i = 0; i < result.related.length; i++) {
					if (Downloader.IsDownloading(1, result.related[i].id)) html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><cid><img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"></cid></div>`
					else html += `<div onmousedown="LinkClick(${thisTabIndex},${tabs[thisTabIndex].AddLink(0,result.related[i].id)},this)" cid="${result.related[i].id}" h="0"><img src="${result.related[i].thumb}" loading="lazy"><div ${result.related[i].lang}>${result.related[i].title}</div><button onclick="nhentaiDownloader(this.parentElement.getAttribute('cid'))">Download</button></div>`
				}
				html += '</div></div>'
			}

			html += '</div></div>'
			tabs[thisTabIndex].page.innerHTML = html
			const LoadingImages = tabs[thisTabIndex].page.getElementsByClassName('nhentai-images')[0].getElementsByTagName('img')

			for (let i = 0; i < LoadingImages.length; i++) imageLoadingObserver.observe(LoadingImages[i])
			clearDownloadedComics(tabs[thisTabIndex].page, 1)
		}
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

function nhentaiDownloader(id) {
	id = Number(id)
	if (Downloader.IsDownloading(1, id)) { PopAlert('You are Downloading This Comic.', 'danger'); return }
	const haveIndex = GetHave(1,id)
	if (haveIndex != null) { PopAlert('You Already Have This Comic.', 'danger'); return }
	const index = Downloader.AddToStarting(1, id)
	nhentai.getComic(id, false, (err, result) => {
		if (err) { Downloader.StopFromStarting(index); PopAlert(err, 'danger'); return }
		let downloadImageList = []
		for (let i = 0; i < result.images.length; i++) downloadImageList.push(result.images[i].url)

		const sendingResult = {}
		sendingResult.title = result.name
		if (result.characters != undefined)	{
			sendingResult.characters = []
			for (let i = 0; i < result.characters.length; i++) sendingResult.characters.push(result.characters[i].name)
		}
		if (result.languages != undefined)	{
			sendingResult.languages = []
			for (let i = 0; i < result.languages.length; i++) sendingResult.languages.push(result.languages[i].name)
		}
		if (result.categories != undefined)	{
			sendingResult.categories = []
			for (let i = 0; i < result.categories.length; i++) sendingResult.categories.push(result.categories[i].name)
		}
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
			for (let i = 0; i < result.parodies.length; i++) sendingResult.parody.push(result.parodies[i].name)
		}
		if (result.tags != undefined)	{
			sendingResult.tags = []
			for (let i = 0; i < result.tags.length; i++) sendingResult.tags.push(result.tags[i].name)
		}
		Downloader.Add(index, result.url, result.thumb, downloadImageList, sendingResult)
	})
}

function nhentaiRepairComicInfoGetInfo(id, whitch) {
	let comic_id = Number(comicPanel.getAttribute('cid'))
	loading.reset(0)
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
				RepairGroup(result.groups, comic_id)
				break
			case 2:
				RepairArtist(result.artists, comic_id)
				break
			case 3:
				RepairParody(result.parodies, comic_id)
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
					const thumb = neededResult[need_repair[i][1]].url
					newList.push(thumb)
					saveList.push(need_repair[i][0]+need_repair[i][2]+'-'+need_repair[i][1]+'.'+fileExt(thumb))
				}

				const urls = []
				for (let i = 0; i < neededResult.length; i++) urls.push(neededResult[i].url)
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
			case 6:
				RepairCharacter(result.characters, comic_id)
				break
			case 7:
				RepairLanguage(result.languages, comic_id)
				break
			case 8:
				RepairCategory(result.categories, comic_id)
				break
		}
	})
}

function nhentaiRepairAllComicInfo(id, comic_id) {
	nhentai.getComic(id, false, (err, result) => {
		if (err) {
			procressPanel.add(`"${repair_all_list[0][0]}" -> ${err}`, 'danger')
			if (err != "You don't have the permission to View this Page.") repair_all_error_list.push(repair_all_list[0])
			repair_all_list.shift()
			RepairAllComicLoop()
			return
		}

		const title = result.title.toLowerCase() || null
		let neededResult, groups = null, artists = null, parodies = null, tags = null, characters = null, languages = null, categories = null
		
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

		neededResult = result.parodies || null
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

		neededResult = result.characters || null
		if (neededResult != null) {
			const charactersList = []
			for (let i in neededResult) charactersList.push(neededResult[i].name)
			characters = CreateCharacter(charactersList)
		}

		neededResult = result.languages || null
		if (neededResult != null) {
			const languagesList = []
			for (let i in neededResult) languagesList.push(neededResult[i].name)
			languages = CreateLanguage(languagesList)
		}

		neededResult = result.categories || null
		if (neededResult != null) {
			const categoriesList = []
			for (let i in neededResult) categoriesList.push(neededResult[i].name)
			categories = CreateCategory(categoriesList)
		}

		db.comics.update({_id:comic_id}, { $set: {n:title,g:groups,a:artists,d:parodies,t:tags,h:characters,l:languages,e:categories} }, {}, (err) => {
			if (err) procressPanel.add(`UpdateComicName -> "${repair_all_list[0][0]}" -> ${err}`, 'danger')
			repair_all_list.shift()
			RepairAllComicLoop()
		})
	})
}