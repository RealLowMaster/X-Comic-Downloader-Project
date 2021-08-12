function closeBrowser() {
	imageLazyLoadingOptions.root = comicPanel
	imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)
	needReload = true
	reloadLoadingComics()
	document.getElementById('browser').style.display = 'none'
	thisSite = null
	activeTabIndex = null
	activeTabComicId = null
	tabsPos = []
	tabsPosParent = []
	tabs = []
	const browser_pages = pageContainer.children
	for (let i = 0; i < browser_pages.length; i++) {
		const passImageCon = browser_pages[i].querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let j = 0; j < passImages.length; j++) {
				passImages[j].removeAttribute('data-src')
				passImages[j].removeAttribute('src')
			}
		}
	}
	pageContainer.innerHTML = ''
	tabsContainer.innerHTML = ''
	document.getElementById('add-new-tab').setAttribute('onclick', '')
}

function updateTabSize() {
	if (activeTabIndex != null) {
		const windowWidth = window.innerWidth
		const tabs = tabsContainer.getElementsByTagName('div')
		if (((windowWidth - 60) / 200) <= tabs.length) {
			const tabWidth = (windowWidth - 60) / tabs.length
			for (let i = 0; i < tabs.length; i++) {
				tabs[i].style.width = tabWidth+'px'
			}
		} else {
			for (let i = 0; i < tabs.length; i++) {
				tabs[i].style.width = '200px'
			}
		}
	}
}

function checkBrowserTools(tabIndex) {
	if (activeTabIndex == tabIndex) {
		if (tabs[tabIndex].history[tabs[tabIndex].history.length - 1].replace(', false)', ', true)') == sites[thisSite][3]) document.getElementById('browser-home-btn').setAttribute('disabled', true)
		else document.getElementById('browser-home-btn').removeAttribute('disabled')

		if (tabs[tabIndex].activeHistory != tabs[tabIndex].history.length - 1) document.getElementById('browser-next-btn').removeAttribute('disabled')
		else document.getElementById('browser-next-btn').setAttribute('disabled', true)

		if (tabs[tabIndex].activeHistory != 0) document.getElementById('browser-prev-btn').removeAttribute('disabled')
		else document.getElementById('browser-prev-btn').setAttribute('disabled', true)

		if (tabs[tabIndex].ir == false) document.getElementById('browser-reload-btn').removeAttribute('disabled')
		else document.getElementById('browser-reload-btn').setAttribute('disabled', true)
	}
}

function activateTab(who) {
	if (document.getElementById(who.getAttribute('pi')) == undefined) return

	if (activeTabIndex != null) {
		const passTab = tabsContainer.querySelector(`[pi="${activeTabComicId}"]`) || null
		if (passTab != null) {
			passTab.setAttribute('active', '')
			tabs[activeTabIndex].sc = pageContainer.scrollTop
			document.getElementById(activeTabComicId).style.display = 'none'
		}
	}
	activeTabIndex = Number(who.getAttribute('ti'))
	activeTabComicId = tabs[activeTabIndex].pageId
	checkBrowserTools(activeTabIndex)
	who.setAttribute('active', true)
	document.getElementById(activeTabComicId).style.display = 'block'
	pageContainer.scrollTop = tabs[activeTabIndex].sc

	document.getElementById('browser-tool-search-input').value = tabs[activeTabIndex].s
	if (tabs[activeTabIndex].mp != 0) {
		bjp.style.display = 'inline-block'
		bjp_i.value = Number(tabs[activeTabIndex].tp)
		bjp_i.setAttribute('oninput', `inputLimit(this, ${tabs[activeTabIndex].mp});browserJumpPage(${tabs[activeTabIndex].jp}, Number(this.value))`)
		bjp_m_p.textContent = tabs[activeTabIndex].mp
	} else bjp.style.display = 'none'
}

function IsTabsAtLimit() {
	const tabsCount = tabsContainer.getElementsByTagName('div').length
	if (tabsCount >= setting.tabs_limit)
		return true
	else
		return false
}

function createNewTab(history, addFront) {
	if (IsTabsAtLimit()) return null
	
	history = history || null
	if (addFront == undefined) addFront = true
	const tabIndex = tabs.length
	const newTabId = `${new Date().getTime()}${Math.floor(Math.random() * 9)}`
	const page = document.createElement('div')
	const element = document.createElement('div')
	element.classList.add('browser-tab')
	element.setAttribute('onclick', 'activateTab(this)')
	element.setAttribute('pi', newTabId)
	element.setAttribute('ti', tabIndex)
	element.setAttribute('draggable', true)
	element.innerHTML = `<span><img class="spin" src="Image/dual-ring-primary-${wt_fps}.gif"></span> <button onclick="removeTab('${newTabId}')">X</button>`
	element.addEventListener('dragstart',() => { element.classList.add('dragging') })
	element.addEventListener('dragend', () => { element.classList.remove('dragging') })
	element.addEventListener('contextmenu', e => {
		e.preventDefault()
		const target = e.target
		if (target.getAttribute('draggable') == null) openedMenuTabIndex = Number(target.parentElement.getAttribute('ti'))
		else openedMenuTabIndex = Number(target.getAttribute('ti'))
		browserPasteMenu.style.display = 'none'
		browserTabMenu.style.top = e.clientY+'px'
		browserTabMenu.style.left = e.clientX+'px'
		browserTabMenu.style.display = 'block'
	})

	tabs[tabIndex] = new Tab(newTabId, 0, '', 0, 1, 0, true)
	tabs[tabIndex].history.push(history)
	page.setAttribute('class', 'browser-page')
	page.setAttribute('id', newTabId)
	const tabPosIndex = tabsPos.indexOf(activeTabComicId)
	if (addFront) {
		if (tabPosIndex < (tabsPos.length - 1)) {
			let newPosIndex = tabPosIndex + 1
			let index_counter = 1
			while (tabsPosParent[newPosIndex] == activeTabComicId) {
				index_counter++
				newPosIndex = tabPosIndex + index_counter
			}
			tabsContainer.insertBefore(element, tabsContainer.querySelector(`[pi="${tabsPos[newPosIndex]}"]`))

			if (newPosIndex != tabsPos.length) {
				let isNewTabPosAdded = false
				const newTabsPos = []
				const newTabsPosParents = []
				for (let i = 0; i < tabsPos.length; i++) {
					if (i < newPosIndex) {
						newTabsPos[i] = tabsPos[i]
						newTabsPosParents[i] = tabsPosParent[i]
					} else if (isNewTabPosAdded == false) {
						newTabsPos[i] = newTabId
						newTabsPosParents[i] = activeTabComicId
						newTabsPos[i + 1] = tabsPos[i]
						newTabsPosParents[i + 1] = tabsPosParent[i]
						isNewTabPosAdded = true
					} else {
						newTabsPos[i + 1] = tabsPos[i]
						newTabsPosParents[i + 1] = tabsPosParent[i]
					}
				}
				tabsPos = newTabsPos
				tabsPosParent = newTabsPosParents
			} else {
				tabsPos.push(newTabId)
				tabsPosParent.push(activeTabComicId)
			}
		} else {
			tabsContainer.appendChild(element)
			tabsPos.push(newTabId)
			tabsPosParent.push(activeTabComicId)
		}
	} else {
		tabsContainer.appendChild(element)
		tabsPos.push(newTabId)
		tabsPosParent.push(null)
	}
	pageContainer.appendChild(page)

	document.getElementById('browser-home-btn').style.display = 'inline-block'
	document.getElementById('browser-prev-btn').style.display = 'inline-block'
	document.getElementById('browser-next-btn').style.display = 'inline-block'
	document.getElementById('browser-reload-btn').style.display = 'inline-block'
	document.getElementById('browser-tool-search-form').style.display = 'flex'

	if (tabsContainer.children.length == 1) activateTab(element)

	updateTabSize()
	return newTabId
}

function pasteTab(newTab) {
	if (IsTabsAtLimit()) {
		PopAlert('You Can\'t Make Any More Tab.', 'danger')
		return
	}
	
	const tabIndex = tabs.length
	const newTabId = `${new Date().getTime()}${Math.floor(Math.random() * 9)}`
	const page = document.createElement('div')
	const element = document.createElement('div')
	element.classList.add('browser-tab')
	element.setAttribute('onclick', 'activateTab(this)')
	element.setAttribute('pi', newTabId)
	element.setAttribute('ti', tabIndex)
	element.setAttribute('draggable', true)
	element.innerHTML = `<span><img class="spin" src="Image/dual-ring-primary-${wt_fps}.gif"></span> <button onclick="removeTab('${newTabId}')">X</button>`
	element.addEventListener('dragstart',() => { element.classList.add('dragging') })
	element.addEventListener('dragend', () => { element.classList.remove('dragging') })
	element.addEventListener('contextmenu', e => {
		e.preventDefault()
		const target = e.target
		if (target.getAttribute('draggable') == null) openedMenuTabIndex = Number(target.parentElement.getAttribute('ti'))
		else openedMenuTabIndex = Number(target.getAttribute('ti'))
		browserPasteMenu.style.display = 'none'
		browserTabMenu.style.top = e.clientY+'px'
		browserTabMenu.style.left = e.clientX+'px'
		browserTabMenu.style.display = 'block'
	})
	tabs[tabIndex] = new Tab(newTabId, 0, newTab[0], 0, 1, 0, true)
	tabs[tabIndex].history = newTab[1]
	tabs[tabIndex].activeHistory = newTab[2]
	page.setAttribute('class', 'browser-page')
	page.setAttribute('id', newTabId)
	tabsContainer.appendChild(element)
	tabsPos.push(newTabId)
	tabsPosParent.push(null)
	pageContainer.appendChild(page)

	document.getElementById('browser-home-btn').style.display = 'inline-block'
	document.getElementById('browser-prev-btn').style.display = 'inline-block'
	document.getElementById('browser-next-btn').style.display = 'inline-block'
	document.getElementById('browser-reload-btn').style.display = 'inline-block'
	document.getElementById('browser-tool-search-form').style.display = 'flex'

	activateTab(element)
	tabs[activeTabIndex].reload()
	updateTabSize()
}

function removeTab(id) {
	const removingTab = tabsContainer.querySelector(`[pi="${id}"]`)
	tabs[Number(removingTab.getAttribute('ti'))] = null
	const btabs = tabsContainer.children
	const tabPosIndex = tabsPos.indexOf(id)

	const passImageCon = document.getElementById(id).querySelector('[img-con="true"]')
	if (passImageCon != undefined) {
		const passImages = passImageCon.children
		for (let i = 0; i < passImages.length; i++) {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
		}
	}

	if (activeTabComicId == id && btabs.length != 1) {
		activeTabIndex = null
		activeTabComicId = null
		if (tabPosIndex > 0) {
			if (tabPosIndex < btabs.length - 1) {
				if (tabsPosParent[tabPosIndex] == null) activateTab(btabs[tabPosIndex + 1])
				else if (tabsPos[tabPosIndex - 1] == tabsPosParent[tabPosIndex]) activateTab(btabs[tabPosIndex - 1])
				else activateTab(btabs[tabPosIndex + 1])
			} else activateTab(btabs[tabPosIndex - 1])
		} else {
			if (btabs.length > 1) activateTab(btabs[tabPosIndex + 1])
		}
	}

	tabsPos.splice(tabPosIndex, 1)
	tabsPosParent.splice(tabPosIndex, 1)

	if (btabs.length == 1) {
		tabs = []
		activeTabIndex = null
		activeTabComicId = null
		document.getElementById('browser-home-btn').style.display = 'none'
		document.getElementById('browser-prev-btn').style.display = 'none'
		document.getElementById('browser-next-btn').style.display = 'none'
		document.getElementById('browser-reload-btn').style.display = 'none'
		document.getElementById('browser-tool-search-form').style.display = 'none'
		bjp.style.display = 'none'
	}

	removingTab.remove()
	document.getElementById(id).remove()

	updateTabSize()
}

function WhichMouseButton(event) {
	event = event || window.event
	return event.which
}

function browserPrev() {
	document.getElementById(activeTabComicId).innerHTML = ''
	document.getElementById(activeTabComicId).innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	tabs[activeTabIndex].prev()
}

function browserNext() {
	document.getElementById(activeTabComicId).innerHTML = ''
	document.getElementById(activeTabComicId).innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	tabs[activeTabIndex].next()
}

function browserJumpPage(index, page) {
	const exec = sites[thisSite][4].replace('{index}', index).replace('{page}', page)
	clearTimeout(searchTimer)
	eval(exec)
}

function AddDownloaderList() {
	const index = downloadingList.length
	downloadingList[index] = [0, [], new Date().getTime(), null, [], [], [], [null, null], null]
	return index
}

function SetDownloaderList(index, id) {
	downloadingList[index][3] = id
	downloadingList[index][7][0] = lastComicId
	downloadingList[index][7][1] = lastHaveId
	downloadCounter++
	downloadingList[index][8] = downloadCounter
	lastComicId++
	lastHaveId++
}

function RemoveDownloaderList(index) {
	if (downloadingList[index][2] != undefined) {
		const dl_element = document.getElementById(downloadingList[index][2])
		downloadingList[index] = null
		if (downloadCounter != 0) downloadCounter--
		if (dl_element != undefined) dl_element.remove()
	}
	if (downloadCounter == 0) {
		downloadingList = []
		document.getElementById('downloader').style.display = 'none'
	} else SetDownloadListNumbers()
}

function SetDownloadListNumbers() {
	let counter = 1
	for (let i in downloadingList) {
		if (downloadingList[i] != null) {
			downloadingList[i][8] = counter
			counter++
		}
	}
}

function MakeDownloadList(index, name, id, list) {
	id = id || null
	name = name || null
	list = list || null
	if (name == null || id == null || list == null) return
	const downloader = document.getElementById('downloader')
	downloader.style.display = 'block'
	const element = document.createElement('div')
	if (name.length > 19) name = name.substr(0, 16)+'...'

	SetDownloaderList(index, id)
	element.setAttribute('id', downloadingList[index][2])
	element.setAttribute('i', index)
	element.innerHTML = `<img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p>${name} <span>(0/${list.length})</span></p><div><div></div></div><button onclick="cancelDownload(${index})">x</button>`
	downloader.appendChild(element)
	downloadingList[index][1] = list

	return index
}

function comicDownloader(index, result, quality, siteIndex) {
	if (downloadingList[index] == undefined || downloadingList[index][0] == null) return
	if (downloadingList[index][8] > setting.download_limit) {
		setTimeout(() => {
			comicDownloader(index, result, quality, siteIndex)
		}, 1000)
		return
	}
	const url = downloadingList[index][1][downloadingList[index][0]]
	const saveName = `${downloadingList[index][2]}-${downloadingList[index][0]}.${fileExt(url)}`
	const option = {
		url: url,
		dest: dirUL+`/${saveName}`
	}
	
	downloadingList[index][0] += 1
	const max = downloadingList[index][1].length
	const percentage = (100 / max) * downloadingList[index][0]
	const downloaderRow = document.getElementById(`${downloadingList[index][2]}`)

	ImageDownloader.image(option).then(({ filename }) => {
		if (downloadingList[index] == undefined) {
			fs.unlinkSync(filename)
			return
		}
		downloadingList[index][6].push(filename)
		downloaderRow.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.width = percentage+'%'
		downloaderRow.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent = `(${downloadingList[index][0]}/${max})`
		if (downloadingList[index][0] == max) {
			var formatList = [], firstIndex = 0, lastIndex = 0
			var thisFormat = fileExt(downloadingList[index][1][0])
			for (let j = 1; j < downloadingList[index][1].length; j++) {
				lastIndex++
				if (fileExt(downloadingList[index][1][j]) == thisFormat) {
					if (j == downloadingList[index][1].length - 1) formatList.push([firstIndex, lastIndex, thisFormat])
				} else {
					formatList.push([firstIndex, lastIndex - 1, thisFormat])
		
					thisFormat = fileExt(downloadingList[index][1][j])
					firstIndex = lastIndex
		
					if (j == downloadingList[index][1].length - 1) formatList.push([firstIndex, lastIndex, thisFormat])
				}
			}
			CreateComic(downloadingList[index][7][0], downloadingList[index][7][1], result, quality, downloadingList[index][2], siteIndex, downloadingList[index][3], downloadingList[index][1].length, formatList, downloadingList[index][4], downloadingList[index][5], index, true)
		} else comicDownloader(index, result, quality, siteIndex)
	}).catch(err => {
		if (downloadingList[index] == undefined) return
		downloaderRow.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.width = percentage+'%'
		downloaderRow.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent = `(${downloadingList[index][0]}/${max})`
		downloadingList[index][4].push(downloadingList[index][0] - 1)
		downloadingList[index][5].push(downloadingList[index][1][downloadingList[index][0] - 1])
		if (downloadingList[index][0] == max) {
			var formatList = [], firstIndex = 0, lastIndex = 0
			var thisFormat = fileExt(downloadingList[index][1][0])
			for (let j = 1; j < downloadingList[index][1].length; j++) {
				lastIndex++
				if (fileExt(downloadingList[index][1][j]) == thisFormat) {
					if (j == downloadingList[index][1].length - 1) formatList.push([firstIndex, lastIndex, thisFormat])
				} else {
					formatList.push([firstIndex, lastIndex - 1, thisFormat])
		
					thisFormat = fileExt(downloadingList[index][1][j])
					firstIndex = lastIndex
		
					if (j == downloadingList[index][1].length - 1) formatList.push([firstIndex, lastIndex, thisFormat])
				}
			}
			CreateComic(downloadingList[index][7][0], downloadingList[index][7][1], result, quality, downloadingList[index][2], siteIndex, downloadingList[index][3], downloadingList[index][1].length, formatList, downloadingList[index][4], downloadingList[index][5], index, true)
		} else comicDownloader(index, result, quality, siteIndex)
	})
}

function cancelDownload(index) {
	downloadingList[index][0] = null
	for (let i = 0; i < downloadingList[index][6].length; i++) {
		fs.unlinkSync(downloadingList[index][6][i])
	}
	changeButtonsToDownloading(downloadingList[index][3], true)
	RemoveDownloaderList(index)
	PopAlert('Download Canceled.', 'warning')
}

function cancelAllDownloads(closeApp) {
	closeApp = closeApp || false

	if (closeApp == true) setting.download_limit = 0

	for (let i = 0; i < downloadingList.length; i++) {
		if (downloadingList[i] != null) cancelDownload(i)
	}

	if (closeApp == true) {
		ThisWindow.removeAllListeners()
		remote.app.quit()
	}
}

function IsDownloading(id) {
	const arr = []
	for (let i in downloadingList) {
		if (downloadingList[i] != null) arr.push(downloadingList[i][3])
	}

	if (arr.indexOf(id) > -1) return true
	else return false
}

function browserError(err, id) {
	const page = document.getElementById(id)
	const tabArea = tabsContainer.querySelector(`[pi="${id}"]`).getElementsByTagName('span')[0]

	page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="tabs[activeTabIndex].reload()">Reload</button>`
	tabArea.innerHTML = '*Error*'
}

function searchFilter(txt, database, alert) {
	txt = txt.toLowerCase()
	let counter = 0
	const datas = database.children
	if (txt.length > 0) {
		for (let i = 0; i < datas.length; i++) {
			if (datas[i].textContent.toLowerCase().indexOf(txt) > -1) {
				datas[i].style.display = 'inline-block'
				counter++
			} else datas[i].style.display = 'none'
		}
		if (counter > 0) alert.style.display = 'none'
		else alert.style.display = 'block'
	} else {
		for (let i = 0; i < datas.length; i++) {
			datas[i].style.display = 'inline-block'
		}
		alert.style.display = 'none'
	}
}

function removeDownloadedComicsDownloadButton(site, id, parent, btn, haveCallback, downloadedCallback) {
	IsHavingComic(site, id, (have, downloaded) => {
		if (have == true) {
			if (downloaded == true) downloadedCallback(parent, btn)
			else haveCallback(parent, btn, id)
		}
	})
}

function clearDownloadedComics(content, site) {
	switch (site) {
		case 0:
			const postContainers = content.getElementsByClassName('xlecx-post-container')
			for (let i = 0; i < postContainers.length; i++) {
				const mainComics = postContainers[i].children
				for (let j = 0; j < mainComics.length; j++) {
					var id = mainComics[j].getElementsByTagName('button')[0]
					if (id != undefined) {
						id = id.getAttribute('cid')
						removeDownloadedComicsDownloadButton(0, id, mainComics[j], mainComics[j].getElementsByTagName('button')[0], (parent, btn, lastId) => {
							btn.remove()
							const element = document.createElement('button')
							element.setAttribute('cid', lastId)
							element.classList.add('comic-had')
							element.textContent = 'Had'
							parent.appendChild(element)
						}, (parent, btn) => {
							btn.remove()
							const element = document.createElement('button')
							element.classList.add('comic-downloaded')
							element.textContent = 'Downloaded'
							parent.appendChild(element)
						})
					}
				}
			}
			break
	}
}

function changeButtonsToDownloading(id, backward) {
	backward = backward || false
	const comic_page_btns = document.querySelectorAll(`[ccid="${id}"]`)
	const comic_overview_btns = document.querySelectorAll(`[cid="${id}"]`)
	var element, parent

	if (backward == false) {
		for (let i = 0; i < comic_page_btns.length; i++) {
			comic_page_btns[i].innerHTML = `<p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p>`
		}
	
		for (let i = 0; i < comic_overview_btns.length; i++) {
			parent = comic_overview_btns[i].parentElement
			comic_overview_btns[i].remove()
			element = document.createElement('cid')
			element.setAttribute('cid', id)
			element.innerHTML = `<img class="spin" src="Image/dual-ring-success-${wt_fps}.gif">`
			parent.appendChild(element)
		}
	} else {
		for (let i = 0; i < comic_page_btns.length; i++) {
			comic_page_btns[i].innerHTML = `<button onclick="xlecxDownloader('${id}')">Download</button><button class="add-to-have" onclick="AddToHave(0, '${id}')">Add To Have</button>`
		}
	
		for (let i = 0; i < comic_overview_btns.length; i++) {
			parent = comic_overview_btns[i].parentElement
			comic_overview_btns[i].remove()
			element = document.createElement('button')
			element.setAttribute('cid', id)
			element.setAttribute('onclick', "xlecxDownloader(this.getAttribute('cid'))")
			element.textContent = 'Download'
			parent.appendChild(element)
		}
	}
}

function changeButtonsToDownloaded(id, have, haveBackward) {
	have = have || false
	const comic_page_btns = document.querySelectorAll(`[ccid="${id}"]`)
	const comic_overview_btns = document.querySelectorAll(`[cid="${id}"]`)
	var element, parent

	if (have == false) {
		for (let i = 0; i < comic_page_btns.length; i++) {
			comic_page_btns[i].innerHTML = '<span>You Downloaded This Comic.<span></span></span>'
		}
	
		for (let i = 0; i < comic_overview_btns.length; i++) {
			parent = comic_overview_btns[i].parentElement
			comic_overview_btns[i].remove()
			element = document.createElement('button')
			element.classList.add('comic-downloaded')
			element.textContent = 'Downloaded'
			parent.appendChild(element)
		}
	} else {
		haveBackward = haveBackward || false

		if (haveBackward == false) {
			for (let i = 0; i < comic_page_btns.length; i++) {
				comic_page_btns[i].innerHTML = `<button class="remove-from-have" onclick="RemoveFromHave(0, '${id}', this)">You Have This Comic.</button>`
			}
		
			for (let i = 0; i < comic_overview_btns.length; i++) {
				parent = comic_overview_btns[i].parentElement
				comic_overview_btns[i].remove()
				element = document.createElement('button')
				element.setAttribute('cid', id)
				element.classList.add('comic-had')
				element.textContent = 'Had'
				parent.appendChild(element)
			}
		} else {
			for (let i = 0; i < comic_page_btns.length; i++) {
				comic_page_btns[i].innerHTML = `<button onclick="xlecxDownloader('${id}')">Download</button><button class="add-to-have" onclick="AddToHave(0, '${id}')">Add To Have</button>`
			}
		
			for (let i = 0; i < comic_overview_btns.length; i++) {
				parent = comic_overview_btns[i].parentElement
				comic_overview_btns[i].remove()
				element = document.createElement('button')
				element.setAttribute('cid', id)
				element.setAttribute('onclick', "xlecxDownloader(this.getAttribute('cid'))")
				element.textContent = 'Download'
				parent.appendChild(element)
			}
		}
	}
}

document.getElementById('browser-tool-search-form').addEventListener('submit', e => {
	e.preventDefault()
	const input = document.getElementById('browser-tool-search-input')
	const checkText = input.value.replace(/ /g, '')
	if (checkText.length > 0) {
		tabs[activeTabIndex].s = input.value
		eval(sites[thisSite][2].replace('{text}', `'${input.value.replace("'", "\\'")}'`))
	} else tabs[activeTabIndex].s = ''
})