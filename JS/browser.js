const browserTabMenu = document.getElementById('browser-tab-menu')
const browserPasteMenu = document.getElementById('browser-paste-menu')
const bjp = document.getElementById('browser-jump-page-container')
const bjp_i = document.getElementById('bjp-i')
const bjp_m_p = document.getElementById('bjp-m-p')
let browserHistoryIndex = 0, browserHistoryRowOpElement, br_history_selected_inputs = [], br_history_selected_indexs = [], resizeTabTimer, active_site = null, historyObserver, historyLaodCounter = 0, br_cmenu_info = null, brh_cb_save = null

function openBrowser() {
	KeyManager.ChangeCategory('browser')
	afterDLReload = false
	imageLazyLoadingOptions.root = pageContainer
	imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)
	document.getElementById('main').style.display = 'none'
	if (active_site == null) {
		document.getElementById('browser-home-btn').setAttribute('disabled', true)
		document.getElementById('browser-prev-btn').setAttribute('disabled', true)
		document.getElementById('browser-next-btn').setAttribute('disabled', true)
		document.getElementById('browser-reload-btn').setAttribute('disabled', true)
		document.getElementById('browser-tool-search-form').style.display = 'none'
		bjp.style.display = 'none'
		openSitePanel()
	} else openSite(active_site)
	checkTabHistoryButtons()
	document.getElementById('browser').style.display = 'grid'
}

function closeBrowser() {
	imageLazyLoadingOptions.root = comicPanel
	imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)
	PageManager.Reload()
	document.getElementById('browser').style.display = 'none'
	document.getElementById('main').style.display = 'flex'
	closeSitePanel()
	closeBrowserHistory()
	KeyManager.ChangeCategory('default')
	activeTabIndex = null
	activeTabComicId = null
	tabsPos = []
	tabsPosParent = []
	browserLastTabs = []
	afterDLReload = true

	const tabsElement = tabsContainer.children
	if (tabsElement.length > 0) {
		for (let i = 0; i < tabsElement.length; i++) {
			const thisTabIndex = Number(tabsElement[i].getAttribute('ti'))
			addHistory(tabs[thisTabIndex], tabsElement[i].children[0].innerText)
			browserLastTabs.push([tabs[thisTabIndex].s, tabs[thisTabIndex].history, tabs[thisTabIndex].activeHistory, tabs[thisTabIndex].site])
		}
		saveHistory()
	}

	tabs = []

	const browser_pages = pageContainer.children
	for (let i = 0; i < browser_pages.length; i++) {
		const passImageCon = browser_pages[i].querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let j = 0; j < passImages.length; j++) {
				try {
					passImages[i].removeAttribute('data-src')
					passImages[i].removeAttribute('src')
					passImages[i].remove()
				} catch(err) { console.error(err) }
			}
		}
	}
	pageContainer.innerHTML = ''
	tabsContainer.innerHTML = ''
}

function checkTabHistoryButtons() {
	if (tabsHistory.length == 0) document.getElementById('browser-recent-tabs-btn').setAttribute('disabled', true)
	else document.getElementById('browser-recent-tabs-btn').removeAttribute('disabled')
}

function updateTabSize() {
	if (activeTabIndex != null) {
		const windowWidth = window.innerWidth
		const tabs = tabsContainer.getElementsByTagName('div')
		if (((windowWidth - 60) / 200) <= tabs.length) {
			const tabWidth = (windowWidth - 60) / tabs.length
			for (let i = 0; i < tabs.length; i++) tabs[i].style.width = tabWidth+'px'
		} else for (let i = 0; i < tabs.length; i++) tabs[i].style.width = '200px'
	}
}

function checkBrowserTools(tabIndex) {
	if (activeTabIndex == tabIndex) {
		if (tabs[tabIndex].history[tabs[tabIndex].history.length - 1].replace(', false)', ', true)') == sites[tabs[tabIndex].site].home) document.getElementById('browser-home-btn').setAttribute('disabled', true)
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
	closeSitePanel()
	closeBrowserHistory()
	if (document.getElementById(who.getAttribute('pi')) == undefined) return

	if (activeTabIndex != null) {
		const passTab = tabsContainer.querySelector(`[pi="${activeTabComicId}"]`) || null
		if (passTab != null) {
			passTab.removeAttribute('active')
			tabs[activeTabIndex].sc = pageContainer.scrollTop
			document.getElementById(activeTabComicId).style.display = 'none'
		}
	}
	activeTabIndex = Number(who.getAttribute('ti'))
	activeTabComicId = tabs[activeTabIndex].id
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
	if (tabsCount >= setting.tabs_limit) return true
	else return false
}

function createNewTab(history, addFront, site) {
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
	element.innerHTML = `<img src="Image/dual-ring-primary-${wt_fps}.gif"><span></span> <button onclick="removeTab('${newTabId}')">X</button>`
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

	tabs[tabIndex] = new Tab(newTabId, 0, '', 0, 1, 0, site, true, element, page)
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
		PopAlert("You Can't Make Any More Tab.", 'danger')
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
	
	element.innerHTML = `<img src="Image/dual-ring-primary-${wt_fps}.gif"><span></span> <button onclick="removeTab('${newTabId}')">X</button>`
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

	tabs[tabIndex] = new Tab(newTabId, 0, newTab[0], 0, 1, 0, newTab[3], false, element, page)
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
	updateTabSize()
	tabs[activeTabIndex].reload()
}

function removeTab(id) {
	clearTimeout(resizeTabTimer)
	const thisTabIndex = GetTabIndexById(id)
	browserLastTabs = []
	addHistory(tabs[thisTabIndex], tabs[thisTabIndex].span.innerText)
	saveHistory()
	const btabs = tabsContainer.children
	const tabPosIndex = tabsPos.indexOf(id)

	const passImages = tabs[thisTabIndex].page.getElementsByTagName('img')
	for (let i = 0; i < passImages.length; i++) {
		try {
			passImages[i].removeAttribute('data-src')
			passImages[i].removeAttribute('src')
			passImages[i].remove()
		} catch(err) { console.error(err) }
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

	tabs[thisTabIndex].tab.remove()
	tabs[thisTabIndex].page.remove()
	tabs[thisTabIndex] = null

	tabsPos.splice(tabPosIndex, 1)
	tabsPosParent.splice(tabPosIndex, 1)
	if (btabs.length == 0) {
		tabs = []
		activeTabIndex = null
		activeTabComicId = null
		document.getElementById('browser-home-btn').setAttribute('disabled', true)
		document.getElementById('browser-prev-btn').setAttribute('disabled', true)
		document.getElementById('browser-next-btn').setAttribute('disabled', true)
		document.getElementById('browser-reload-btn').setAttribute('disabled', true)
		document.getElementById('browser-tool-search-form').style.display = 'none'
		bjp.style.display = 'none'
		setTimeout(() => {
			openSitePanel()
		}, 1)
	}

	checkTabHistoryButtons()
	resizeTabTimer = setTimeout(() => {
		updateTabSize()
	}, 390)
}

function browserTabHome() {
	if (activeTabIndex == null) return
	if (!document.getElementById('browser-home-btn').hasAttribute('disabled')) {
		closeSitePanel()
		closeBrowserHistory()
		eval(sites[tabs[activeTabIndex].site].home)
	}
}

function browserPrev() {
	if (activeTabIndex == null) return
	closeSitePanel()
	closeBrowserHistory()
	tabs[activeTabIndex].prev()
}

function browserNext() {
	if (activeTabIndex == null) return
	closeSitePanel()
	closeBrowserHistory()
	tabs[activeTabIndex].next()
}

function browserTabReload() {
	if (activeTabIndex == null) return
	closeSitePanel()
	closeBrowserHistory()
	tabs[activeTabIndex].reload()
}

function browserJumpPage(index, page) {
	closeBrowserHistory()
	const exec = sites[tabs[activeTabIndex].site].jump.replace('{index}', index).replace('{page}', page)
	clearTimeout(searchTimer)
	eval(exec)
}

function browserError(err, tabIndex) {
	tabs[tabIndex].page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="browserTabReload()">Reload</button>`
	tabs[tabIndex].rename('*Error*')
	tabs[tabIndex].icon.style.display = 'none'
	console.error(err)
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

function clearDownloadedComics(content, site) {
	const posts = content.querySelectorAll(`[cid]`)
	for (let i = 0, l = posts.length; i < l; i++) {
		let id
		// Get Id
		if (site == 0) id = posts[i].getAttribute('cid')
		else if (site == 1) id = Number(posts[i].getAttribute('cid'))

		if (id != null) {
			const haveIndex = GetHave(site,id)
			if (haveIndex != null) {
				const child = posts[i].children
				child[child.length - 1].remove()
				if (haveDBComic[haveIndex] == 1) {
					const element = document.createElement('button')
					element.classList.add('comic-downloaded')
					element.textContent = 'Downloaded'
					posts[i].appendChild(element)
					posts[i].setAttribute('h',2)
				} else {
					const element = document.createElement('button')
					element.classList.add('comic-had')
					element.textContent = 'Had'
					posts[i].appendChild(element)
					posts[i].setAttribute('h',1)
				}
			}
		}
	}
}

function changeButtonsToDownloading(id, site, backward) {
	for (let i = 0, l = tabs.length; i < l; i++) {
		if (tabs[i] != null && tabs[i].site == site) {
			const comic_page_btns = tabs[i].page.querySelectorAll(`[ccid="${id}"]`)
			const comic_overview = tabs[i].page.querySelectorAll(`[cid="${id}"]`)

			let element
			if (!backward) {
				for (let j = 0, n = comic_page_btns.length; j < n; j++) comic_page_btns[j].innerHTML = `<p>Downloading... <img class="spin" src="Image/dual-ring-success-${wt_fps}.gif"><p>`

				for (let j = 0, n = comic_overview.length; j < n; j++) {
					const child = comic_overview[j].children
					child[child.length - 1].remove()
					element = document.createElement('cid')
					element.innerHTML = `<img class="spin" src="Image/dual-ring-success-${wt_fps}.gif">`
					comic_overview[j].appendChild(element)
					comic_overview[j].setAttribute('h',3)
				}
			} else {
				let saveId
				if (typeof(id) == 'number') saveId = id
				else saveId = `'${id}'`
				for (let j = 0, n = comic_page_btns.length; j < n; j++) {
					comic_page_btns[j].innerHTML = `<button onclick="${sites[site].downloader.replace('{id}', "this.getAttribute('cid')")}">Download</button><button class="add-to-have" onclick="AddToHave(${site}, ${saveId})">Add To Have</button>`
				}

				for (let j = 0, n = comic_overview.length; j < n; j++) {
					const child = comic_overview[j].children
					child[child.length - 1].remove()
					element = document.createElement('button')
					element.setAttribute('onclick', sites[site].downloader.replace('{id}', "this.parentElement.getAttribute('cid')"))
					element.textContent = 'Download'
					comic_overview[j].appendChild(element)
					comic_overview[j].setAttribute('h',0)
				}
			}
		}
	}
}

function changeButtonsToDownloaded(id, site, have = false, haveBackward = false) {
	for (let i = 0, l = tabs.length; i < l; i++) {
		if (tabs[i] != null && tabs[i].site == site) {
			const comic_page_btns = tabs[i].page.querySelectorAll(`[ccid="${id}"]`)
			const comic_overview = tabs[i].page.querySelectorAll(`[cid="${id}"]`)

			let element
			if (!have) {
				for (let j = 0, n = comic_page_btns.length; j < n; j++) comic_page_btns[j].innerHTML = '<span>You Downloaded This Comic.<span></span></span>'
				for (let j = 0, n = comic_overview.length; j < n; j++) {
					const child = comic_overview[j].children
					child[child.length - 1].remove()
					element = document.createElement('button')
					element.classList.add('comic-downloaded')
					element.textContent = 'Downloaded'
					comic_overview[j].appendChild(element)
					comic_overview[j].setAttribute('h',2)
				}
			} else {
				let saveId
				if (typeof(id) == 'number') saveId = id
				else saveId = `'${id}'`

				if (!haveBackward) {
					for (let j = 0, n = comic_page_btns.length; j < n; j++) comic_page_btns[j].innerHTML = `<button class="remove-from-have" onclick="RemoveFromHave(${site}, ${saveId}, this)">You Have This Comic.</button>`

					for (let j = 0, n = comic_overview.length; j < n; j++) {
						const child = comic_overview[j].children
						child[child.length - 1].remove()
						element = document.createElement('button')
						element.classList.add('comic-had')
						element.textContent = 'Had'
						comic_overview[j].appendChild(element)
						comic_overview[j].setAttribute('h',1)
					}
				} else {
					for (let j = 0, n = comic_page_btns.length; j < n; j++) comic_page_btns[j].innerHTML = `<button onclick="${sites[site].downloader.replace('{id}', saveId)}">Download</button><button class="add-to-have" onclick="AddToHave(${site}, ${saveId})">Add To Have</button>`
			
					for (let j = 0, n = comic_overview.length; j < n; j++) {
						const child = comic_overview[j].children
						child[child.length - 1].remove()
						element = document.createElement('button')
						element.setAttribute('onclick', sites[site].downloader.replace('{id}', "this.parentElement.getAttribute('cid')"))
						element.textContent = 'Download'
						comic_overview[j].appendChild(element)
						comic_overview[j].setAttribute('h',0)
					}
				}
			}
		}
	}
}

function ImageListDownloader(list, index, saveList, error, callback) {
	if (index == list.length) callback(error)
	else {
		const dl = new Download(list[index], saveList[index])
		let totalSize = 0, dlSize = 0
		dl.OnError(err => {
			error = true
			procressPanel.add('DL->ERR: '+err, 'danger')
			procressPanel.forward(`Downloading Images (${index + 1}/${list.length})`)

			ImageListDownloader(list, index + 1, saveList, error, callback)
		})

		dl.OnComplete(() => {
			procressPanel.addMini(`Img ${index + 1} Downloaded.`)
			procressPanel.forward(`Downloading Images (${index + 1}/${list.length})`)

			ImageListDownloader(list, index + 1, saveList, error, callback)
		})

		dl.OnResponse(resp => {
			totalSize = formatBytes(parseInt(resp.headers['content-length']))
			procressPanel.text(`Downloading Images (${index + 1}/${list.length}) (0/${totalSize})`)
		})

		dl.OnData(data => {
			dlSize += data
			procressPanel.text(`Downloading Images (${index + 1}/${list.length}) (${formatBytes(dlSize)}/${totalSize})`)
		})

		dl.Start()
	}
}

function GetTabIndexById(id) {
	let index = null
	for (let i = 0; i < tabs.length; i++) {
		if (tabs[i] == null) continue
		if (tabs[i].id == id) {
			index = i
			break
		}
	}
	return index
}

document.getElementById('browser-tool-search-form').addEventListener('submit', e => {
	e.preventDefault()
	closeSitePanel()
	closeBrowserHistory()
	KeyManager.ChangeCategory('browser')
	const input = document.getElementById('browser-tool-search-input')
	const checkText = input.value.replace(/ /g, '')
	if (checkText.length > 0) {
		tabs[activeTabIndex].s = input.value
		eval(sites[tabs[activeTabIndex].site].search.replace('{text}', `'${convertToURL(input.value)}'`))
	} else tabs[activeTabIndex].s = ''
})

// Sites
function SetSite() {
	let html = ''
	for (let i = 0; i < sites.length; i++) html += `<div onclick="openSite(${i})" title="${sites[i].url}"><img src="Image/sites/${sites[i].name}-60x60.jpg"><p>${sites[i].name}</p></div>`
	document.getElementById('b-s-p-c').innerHTML = html
}

function openSite(index) {
	if (index == null) openSitePanel()
	else {
		active_site = index
		closeSitePanel()
		closeBrowserHistory()
		checkTabHistoryButtons()
		const new_tab = createNewTab(sites[active_site].home.replace(', true)', ', false)'), false, active_site)
		if (new_tab == null) { PopAlert("You Can't Make Any More Tab.", 'danger'); return }
		const tab_element = tabsContainer.querySelector(`[pi="${new_tab}"]`)
		activateTab(tab_element)
		tabs[activeTabIndex].ir = false
		tabs[activeTabIndex].reload()
	}
}

function toggleSitePanel() {
	closeBrowserHistory()
	if (tabsContainer.children.length == 0) {
		openSitePanel()
		return
	}
	
	if (document.getElementById('browser-sites-panel').style.display == 'block') closeSitePanel()
	else openSitePanel()
}

function openSitePanel() {
	document.getElementById('browser-sites-panel').style.display = 'block'
}

function closeSitePanel() {
	document.getElementById('browser-sites-panel').style.display = 'none'
	document.getElementById('b-s-p-s').value = ''
	const child = document.getElementById('b-s-p-c').children
	for (let i = 0; i < child.length; i++) child[i].style.display = 'inline-block'
}

function BrowserSearchSite(txt) {
	const child = document.getElementById('b-s-p-c').children
	txt = txt.replace(/https:\/\//g, '').replace(/http:\/\//g, '')
	if (txt.replace(/ /g, '').length == 0) {
		for (let i = 0; i < child.length; i++) child[i].style.display = 'inline-block'
	} else {
		for (let i = 0; i < child.length; i++) {
			if (child[i].getAttribute('title').indexOf(txt.toLowerCase()) == -1) child[i].style.display = 'none'
			else child[i].style.display = 'inline-block'
		}
	}
}

// Browser History
function openBrowserLastTabs() {
	if (browserLastTabs.length == 0) {
		if (tabsHistory.length != 0) {
			const thisHistory = tabsHistory[tabsHistory.length - 1][1]
			pasteTab(thisHistory)
			if (active_site == null) active_site = thisHistory[3]
			tabsHistory.pop()
			saveHistory()
		}
	} else {
		for (let i = 0; i < browserLastTabs.length; i++) {
			pasteTab(browserLastTabs[i])
			tabsHistory.pop()
		}
		
		if (active_site == null) active_site = browserLastTabs[browserLastTabs.length - 1][3]
		browserLastTabs = []
		saveHistory()
	}

	checkTabHistoryButtons()
}

function toggleBrowserHistory() {
	if (document.getElementById('browser-history-panel').hasAttribute('active')) closeBrowserHistory()
	else openBrowserHistoryPanel()
}

function openBrowserHistoryPanel(scoll=false) {
	closeSitePanel()
	const panel = document.getElementById('browser-history-panel')
	document.getElementById('b-h-p-m-c').style.display = 'none'
	document.getElementById('b-h-p-h-c').innerHTML = ''

	panel.setAttribute('active', true)
	if (tabsHistory.length > 0) {
		historyObserver = new IntersectionObserver(historyObserverFunc, {
			root: document.getElementById('browser-history-panel'),
			threshold: 0,
			rootMargin: "0px 0px 400px 0px"
		})
		historyObserver.observe(document.getElementById('b-h-o-d'))
		panel.style.display = 'block'
	} else {
		document.getElementById('b-h-p-h-c').innerHTML = '<div class="alert alert-danger">There is no History.</div>'
		panel.style.display = 'block'
		if (!scoll) panel.scrollTop = 0
	}
}

function historyObserverFunc(entries, observer) {
	if (!document.getElementById('browser-history-panel').hasAttribute('active')) {
		historyObserver = null
		return
	}
	if (entries[0].isIntersecting) {
		loadMoreHistory()
		observer.unobserve(entries[0].target)
		historyObserver = null
	}
}

function loadMoreHistory() {
	historyObserver = null
	if (tabsHistory.length == 0) {
		document.getElementById('b-h-p-h-c').innerHTML = '<div class="alert alert-danger">There is no History.</div>'
		return
	}
	let passYear, passMonth, passDay, passHistory = [], saveCheck = false, count = 0

	const check_new_date = function(checkhistoey) {
		if (checkhistoey[2] == passYear) {
			if (checkhistoey[3] == passMonth) {
				if (checkhistoey[4] == passDay) return false
				else return true
			} else return true
		} else return true
	}

	const update_date = function(checkhistoey) {
		passYear = checkhistoey[2]
		passMonth = checkhistoey[3]
		passDay = checkhistoey[4]
	}

	const history_container = document.getElementById('b-h-p-h-c')
	let bigBigContainer, bigContainer, container, element
	for (let i = tabsHistory.length - 1; i >= 0; i--) {
		saveCheck = check_new_date(tabsHistory[i])
		if (saveCheck || i == 0) {
			
			if (i == 0 && !saveCheck) passHistory.push([tabsHistory[i], i])
			
			if (passHistory.length > 0) {
				count++
				if (count <= historyLaodCounter) {
					passHistory = []
					passHistory.push([tabsHistory[i], i])
					update_date(tabsHistory[i])
					continue
				}
				if (count > historyLaodCounter + 3) {
					historyLaodCounter += 3
					setTimeout(() => {
						historyObserver = new IntersectionObserver(historyObserverFunc, {
							root: document.getElementById('browser-history-panel'),
							threshold: 0,
							rootMargin: "0px 0px 400px 0px"
						})
						historyObserver.observe(document.getElementById('b-h-o-d'))
					}, 300)
					break
				}
				bigBigContainer = document.createElement('div')
				bigBigContainer.innerHTML = `<div>${passYear}-${passMonth}-${passDay}</div>`
				bigContainer = document.createElement('div')
				for (let j = 0; j < passHistory.length; j++) {
					container = document.createElement('div')
					element = document.createElement('input')
					element.type = 'checkbox'
					element.setAttribute('h', passHistory[j][1])
					element.setAttribute('onclick', 'browserHistorySelect(this)')
					container.appendChild(element)
					element = document.createElement('div')
					element.setAttribute('onclick', 'this.parentElement.children[0].click()')
					container.appendChild(element)
					element = document.createElement('img')
					element.src = 'Image/sites/'+sites[passHistory[j][0][1][3]].name+'-30x30.jpg'
					container.appendChild(element)
					element = document.createElement('p')
					element.setAttribute('onclick', 'openBrowserHistory('+passHistory[j][1]+')')
					element.innerText = passHistory[j][0][0]
					container.appendChild(element)
					element = document.createElement('button')
					element.type = 'button'
					element.setAttribute('onclick', 'openHistoryRowOption('+passHistory[j][1]+',this)')
					element.innerText = '...'
					container.appendChild(element)
					bigContainer.appendChild(container)
				}
				bigBigContainer.appendChild(bigContainer)
				history_container.appendChild(bigBigContainer)
			}

			passHistory = []
			passHistory.push([tabsHistory[i], i])
			update_date(tabsHistory[i])
			
			if (i == 0 && saveCheck) {
				count++
				if (count <= historyLaodCounter) continue
				if (count > historyLaodCounter + 3) {
					historyLaodCounter += 3
					setTimeout(() => {
						historyObserver = new IntersectionObserver(historyObserverFunc, {
							root: document.getElementById('browser-history-panel'),
							threshold: 0,
							rootMargin: "0px 0px 400px 0px"
						})
						historyObserver.observe(document.getElementById('b-h-o-d'))
					}, 300)
					break
				}
				bigBigContainer = document.createElement('div')
				bigBigContainer.innerHTML = `<div>${passYear}-${passMonth}-${passDay}</div>`
				bigContainer = document.createElement('div')
				for (let j = 0; j < passHistory.length; j++) {
					container = document.createElement('div')
					element = document.createElement('input')
					element.type = 'checkbox'
					element.setAttribute('h', passHistory[j][1])
					element.setAttribute('onclick', 'browserHistorySelect(this)')
					container.appendChild(element)
					element = document.createElement('div')
					element.setAttribute('onclick', 'this.parentElement.children[0].click()')
					container.appendChild(element)
					element = document.createElement('img')
					element.src = 'Image/sites/'+sites[passHistory[j][0][1][3]].name+'-30x30.jpg'
					container.appendChild(element)
					element = document.createElement('p')
					element.setAttribute('onclick', 'openBrowserHistory('+passHistory[j][1]+')')
					element.innerText = passHistory[j][0][0]
					container.appendChild(element)
					element = document.createElement('button')
					element.type = 'button'
					element.setAttribute('onclick', 'openHistoryRowOption('+passHistory[j][1]+',this)')
					element.innerText = '...'
					container.appendChild(element)
					bigContainer.appendChild(container)
				}
				bigBigContainer.appendChild(bigContainer)
				history_container.appendChild(bigBigContainer)
			}
		} else passHistory.push([tabsHistory[i], i])
	}
}

function closeBrowserHistory() {
	br_history_selected_inputs = []
	br_history_selected_indexs = []
	const panel = document.getElementById('browser-history-panel')
	panel.style.display = 'none'
	document.getElementById('b-h-p-h-c').innerHTML = ''
	panel.removeAttribute('active')
	document.getElementById('b-h-p-m-c').style.display = 'none'
	document.getElementById('browser-history-panel').removeAttribute('selection')
	historyLaodCounter = 0
	historyObserver = null
	if (tabsContainer.children.length == 0) openSitePanel()
}

function browserHistorySelect(who) {
	const index = Number(who.getAttribute('h'))
	if (who.checked) {
		if (br_history_selected_indexs.length == 0) document.getElementById('browser-history-panel').setAttribute('selection', true)
		br_history_selected_inputs.push(who)
		br_history_selected_indexs.push(index)
	} else {
		const rowIndex = br_history_selected_indexs.indexOf(index)
		br_history_selected_inputs.splice(rowIndex, 1)
		br_history_selected_indexs.splice(rowIndex, 1)
		if (br_history_selected_indexs.length == 0) document.getElementById('browser-history-panel').removeAttribute('selection')
	}
}

function unSelectAllBrowserHistory() {
	for (let i = 0; i < br_history_selected_inputs.length; i++) {
		br_history_selected_inputs[i].checked = false
	}
	br_history_selected_inputs = []
	br_history_selected_indexs = []
	document.getElementById('browser-history-panel').removeAttribute('selection')
}

function removeSelectedBrowserHistories() {
	br_history_selected_indexs.sort(function(a, b){return b - a})
	for (let i = 0; i < br_history_selected_indexs.length; i++) {
		tabsHistory.splice(br_history_selected_indexs[i], 1)
		const con = br_history_selected_inputs[i].parentElement.parentElement
		if (con.children.length == 1) {
			con.parentElement.remove()
		} else br_history_selected_inputs[i].parentElement.remove()
	}
	br_history_selected_inputs = []
	br_history_selected_indexs = []
	document.getElementById('browser-history-panel').removeAttribute('selection')
	setTimeout(() => {
		saveHistory()
	}, 100)
}

function askForRemovingSelectedBrHistories() {
	errorSelector('Are you sure about it ?', [
		[
			"Yes",
			"btn btn-primary m-2",
			"removeSelectedBrowserHistories();this.parentElement.parentElement.remove()"
		],
		[
			"No",
			"btn btn-danger m-2"
		]
	])
}

function openBrowserHistory(index) {
	browserLastTabs = []
	const thisHistory = tabsHistory[index][1]
	pasteTab(thisHistory)
	if (active_site == null) active_site = thisHistory[3]
	tabsHistory.splice(index, 1)
	checkTabHistoryButtons()

	setTimeout(() => {
		saveHistory()
	}, 100)
}

function openHistoryRowOption(index, element) {
	const e = window.event
	if (e.target.tagName == 'BUTTON') {
		browserHistoryIndex = index
		browserHistoryRowOpElement = element.parentElement
		const menu = document.getElementById('b-h-p-m')
		menu.style.top = e.clientY+'px'
		menu.style.left = (e.clientX - 168)+'px'
		document.getElementById('b-h-p-m-c').style.display = 'block'
	}
}

function removeBrowserHistoryRow() {
	document.getElementById('b-h-p-m-c').style.display = 'none'
	tabsHistory.splice(browserHistoryIndex, 1)
	if (browserHistoryRowOpElement.parentElement.children.length == 1) {
		browserHistoryRowOpElement.parentElement.parentElement.remove()
	} else browserHistoryRowOpElement.remove()
	browserHistoryRowOpElement = null
	if (br_history_selected_indexs.length > 0) {
		document.getElementById('browser-history-panel').removeAttribute('selection')
		br_history_selected_inputs = []
		br_history_selected_indexs = []
	}
	setTimeout(() => {
		saveHistory()
	}, 100)
}

function addHistory(historyTab, text) {
	const d = new Date()
	if (text == "") text = '*UnLoaded*'
	tabsHistory.push([text, [historyTab.s, historyTab.history, historyTab.activeHistory, historyTab.site], d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()])
}

function saveHistory() {
	fs.writeFileSync(dirHistory, JSON.stringify({h:tabsHistory}), {encoding:"utf8"})
}

function clearBrowserHistory() {
	tabsHistory = []
	fs.writeFileSync(dirHistory, JSON.stringify({h:[]}), {encoding:"utf8"})
	document.getElementById('b-h-p-h-c').innerHTML = '<div class="alert alert-danger">There is no History.</div>'
	historyLaodCounter = 0
}

function askClearBrowserHistory() {
	errorSelector('Are you sure about it ?', [
		[
			"Yes",
			"btn btn-primary m-2",
			"clearBrowserHistory();this.parentElement.parentElement.remove()"
		],
		[
			"No",
			"btn btn-danger m-2"
		]
	])
}

// Right Click On Comic
function LinkClick(tindex, lindex, who = null) {
	const e = window.event, key = e.which
	closeBRCMenu()
	e.preventDefault()
	if (tabs[tindex] == null || e.target.tagName == 'BUTTON') return
	if (key == 1) tabs[tindex].Clicked(lindex)
	else if (key == 2) tabs[tindex].Clicked(lindex, true)
	else if (key == 3) {
		const menu = document.getElementById('br-crmenu')
		const children = menu.children

		children[0].setAttribute('onclick', `tabs[${tindex}].Clicked(${lindex},false)`)
		children[1].setAttribute('onclick', `tabs[${tindex}].Clicked(${lindex},true)`)

		if (who != null) {
			br_cmenu_info = [
				who.getAttribute('cid') || null,
				tabs[tindex].site,
				Number(who.getAttribute('h'))
			]

			if (!Number.isNaN(br_cmenu_info[2])) {
				if (br_cmenu_info[2] == 0) {
					children[3].style.display = 'flex'
					children[3].setAttribute('onclick', `AddToHave(${br_cmenu_info[1]},br_cmenu_info[0])`)
					children[4].style.display = 'none'
				} else if (br_cmenu_info[2] == 1) {
					children[3].style.display = 'none'
					children[4].style.display = 'flex'
					children[4].setAttribute('onclick', `RemoveFromHave(${br_cmenu_info[1]},br_cmenu_info[0])`)
				} else {
					children[3].style.display = 'none'
					children[4].style.display = 'none'
				}
			} else {
				children[3].style.display = 'none'
				children[4].style.display = 'none'
			}


			if (br_cmenu_info[0] != null && br_cmenu_info[2] == 0) {
				children[5].setAttribute('onclick',sites[tabs[tindex].site].downloader.replace('{id}','br_cmenu_info[0]'))
				children[5].style.display = 'flex'
			} else children[5].style.display = 'none'
		} else {
			children[3].style.display = 'none'
			children[4].style.display = 'none'
			children[5].style.display = 'none'
		}

		let x = e.clientX, y = e.clientY
		menu.style.display = 'block'
		if (window.innerWidth <= x+170) x = window.innerWidth - 170
		if (window.innerHeight <= y+menu.clientHeight) y = window.innerHeight - menu.clientHeight
		menu.style.top = y+'px'
		menu.style.left = x+'px'
		window.addEventListener('click', closeBRCMenu)
		window.addEventListener('wheel', closeBRCMenu)
		window.addEventListener('resize', closeBRCMenu)
		window.addEventListener('keydown', closeBRCMenu)
	}
}

function closeBRCMenu() {
	document.getElementById('br-crmenu').style.display = 'none'
	window.removeEventListener('click', closeBRCMenu)
	window.removeEventListener('wheel', closeBRCMenu)
	window.removeEventListener('resize', closeBRCMenu)
	window.removeEventListener('keydown', closeBRCMenu)
}