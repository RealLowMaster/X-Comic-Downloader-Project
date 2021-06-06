const fs = require('fs')
const path = require('path')
const ImageDownloader = require('image-downloader')
require('v8-compile-cache')
const xlecx = new XlecxAPI()
const defaultSetting = {
	"max_per_page": 18,
	"spin_color": 0,
	"post_img_num_in_row": 0,
	"img_graphic": 0,
	"pagination_width": 5,
	"connection_timeout": 6000
}
var setting, tabs = []

// Directions
var dirRoot = path.join(__dirname)
var dirDB = path.join(__dirname+'/db')
var dirUL = path.join(__dirname+'/Download')

// Error
function error(txt, onclick, t1) {
	var err = txt.toString()
	if (t1 != null) err = err.replace(/{var1}/gi, t1)
	err = err.replace(/\n/gi, '<br>')
	var element = document.createElement('div')
	element.classList.add('error')

	var html = `<div></div><div><p>${err}</p>`
	if (onclick == null) {
		html += '<button class="btn btn-danger" onclick="$(this).parent(\'div\').parent(\'.error\').remove()">OK</button></div></div>'
	} else {
		html += `<button onclick="${onclick}">OK</button></div>`
	}
	element.innerHTML = html

	document.getElementsByTagName('body')[0].appendChild(element)
}

function errorSelector(txt, t1, bgClose, buttons) {
	var err = txt || null
	if (t1 != null && err != null) err = err.replace(/{var1}/gi, t1)
	if (err != null) err = err.replace(/\n/gi, '<br>')

	bgClose = bgClose || false
	var bgCloseValue = ''
	if (bgClose == true) bgCloseValue = `$(this).parent('.error').remove()`
	var html = `<div class="error"><div onclick="${bgCloseValue}"></div><div style="text-align:center">`
	if (err != null) html += `<p>${err}</p>`
	
	buttons = buttons || null
	if (buttons != null && typeof(buttons) == 'object') for (let i=0; i<buttons.length; i++) {
		let name = buttons[i][0] || "Ok"
		let style = buttons[i][1] || ""
		let onclick = buttons[i][2] || "$(this).parent('div').parent('.error').remove()"
		html += `<button class="btn btn-danger m-2" style="${style}" onclick="${onclick}">${name}</button>`
	}
	html += '</div></div>'

	$('#main').append(html);
}

// Get Json
function getJSON(src) {
	var xmlHttp = null

	xmlHttp = new XMLHttpRequest()
	xmlHttp.open("GET", src, false)
	xmlHttp.send(null)
	var obj = JSON.parse(xmlHttp.responseText)
	return obj
}

// Create Main Roots
if (!fs.existsSync(dirDB)) fs.mkdirSync(dirDB)
if (!fs.existsSync(dirUL)) fs.mkdirSync(dirUL)
if (!fs.existsSync(dirRoot+'/setting.cfg')) {
	setting = defaultSetting
	fs.writeFile(dirRoot+'/setting.cfg', JSON.stringify(defaultSetting), (err) => { if (err) error(err) })
} else {
	setting = getJSON(dirRoot+'./setting.cfg')
}
if (setting.max_per_page < 1) setting.max_per_page = 18

// Apply Setting
xlecx.timeout = setting.connection_timeout

// Comics
function loadComics(page, search) {
	page = page || 1
	search = search || null
	/*
	var mc = $('#movies-container')
	mc.children().remove()
	var min = 0, max, allPages, id, name, image
	var max_per_page = setting.max_per_page

	max = doc.length
	allPages = Math.ceil(doc.length / max_per_page)
	if (doc.length >= max_per_page) {
		min = (max_per_page * page) - max_per_page
		max = min + max_per_page
		if (max > doc.length) max = doc.length
	}


	pagination(allPages, page, 'loadMovies({page})')
	$('#movies-container').attr('page', page)
	*/

	var comic_container = document.getElementById('comic-container')
	var html = ''
	for (var i = 0; i < 15; i++) {
		html += '<div class="comic"><img src=""><span>12</span><p>Title</p></div>'
	}
	comic_container.innerHTML = html

	// Pagination
	var thisPagination = pagination(10, 1)
	html = '<div>'
	for (var i in thisPagination) {
		if (thisPagination[i][1] == null)
			html += `<button disabled>${thisPagination[i][0]}</button>`
		else
			html += `<button onclick="loadComics(${thisPagination[i][1]}, ${search})">${thisPagination[i][0]}</button>`
	}
	html += '</div>'
	document.getElementById('pagination').innerHTML = html
}

function pagination(total_pages, page) {
	var arr = [], min = 1, max = 1, bdot = false, fdot = false, bfirst = false, ffirst = false, pagination_width = setting.pagination_width
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
	
	if (page > 1) arr.push(['Prev', page - 1])
	if (bfirst) arr.push(['1', 1])
	if (bdot) arr.push(['...', null])
	for (var i=min; i <= max;i++) {
		if (i == page)
			arr.push([`${i}`, null])
		else 
			arr.push([`${i}`, i])
	}
	if (fdot) arr.push(['...', null])
	if (ffirst) arr.push([`${total_pages}`, total_pages])
	if (page < total_pages) arr.push(['Next', page + 1])

	return arr
}

// Browser
function closeBrowser() {
	document.getElementById('browser').setAttribute('style', null)
	tabs = []
	document.getElementById('browser-pages').innerHTML = ''
	var browser_tabs = document.getElementById('browser-tabs')
	browser_tabs.innerHTML = ''
	browser_tabs.setAttribute('pid', '')
	document.getElementById('add-new-tab').setAttribute('onclick', null)
}

function updateTabSize() {
	var windowWidth = window.innerWidth
	var tabs = document.getElementById('browser-tabs').getElementsByTagName('div')
	if ((windowWidth / 200) <= tabs.length) {
		var tabWidth = (windowWidth - 60) / tabs.length
		for (var i = 0; i < tabs.length; i++) {
			tabs[i].style.width = tabWidth+'px'
		}
	} else {
		for (var i = 0; i < tabs.length; i++) {
			tabs[i].style.width = '200px'
		}
	}
}

window.onresize = () => {
	updateTabSize()
}

function activateTab(who) {
	var pageId = who.getAttribute('pi')
	page = document.getElementById(pageId) || null
	if (page == null) return

	var tabsContainer = document.getElementById('browser-tabs')
	var passId = tabsContainer.getAttribute('pid') || null
	if (passId != null) {
		var passTab = document.getElementById('browser-tabs').querySelector(`[pi="${passId}"]`) || null
		if (passTab != null) {
			passTab.setAttribute('active', null)
			document.getElementById(passId).setAttribute('style', null)
		}
	}
	tabsContainer.setAttribute('pid', pageId)
	who.setAttribute('active', true)
	var tpage = document.getElementById(pageId)
	tpage.scrollTop = 1
	tpage.setAttribute('style', 'display:block')
}

function checkTabLimit() {
	var limit = 35
	var tabs = document.getElementById('browser-tabs').getElementsByTagName('div').length

	if (tabs >= limit)
		return true
	else
		return false
}

function createNewTab(history) {
	if (checkTabLimit()) return null

	history = history || null
	var tabIndex = tabs.length
	var date = new Date()
	var randomNumber = Math.floor(Math.random() * 500)
	var newTabId = `${date.getTime()}-${randomNumber}`
	var page = document.createElement('div')

	tabs[tabIndex] = new Tab(newTabId)
	tabs[tabIndex].history.push(history)

	page.setAttribute('class', 'browser-page')
	page.setAttribute('id', newTabId)
	document.getElementById('browser-tabs').innerHTML += `<div class="browser-tab" onclick="activateTab(this)" pi="${newTabId}" ti="${tabIndex}"><span>${newTabId}</span> <button onclick="removeTab('${newTabId}')">X</button></div>`
	page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	document.getElementById('browser-pages').appendChild(page)

	document.getElementById('browser-prev-btn').setAttribute('style', null)
	document.getElementById('browser-next-btn').setAttribute('style', null)

	updateTabSize()
	return newTabId
}

function removeTab(id) {
	var removingTab = document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`)
	tabs[Number(removingTab.getAttribute('ti'))] = null
	var btabs = document.getElementById('browser-tabs').children
	var index = Array.prototype.slice.call(btabs).indexOf(removingTab)
	
	if (index == 0) {
		if (1 <= btabs.length - 1) {
			activateTab(btabs[1])
		}
	} else {
		activateTab(btabs[index - 1])
	}

	if (btabs.length == 1) {
		document.getElementById('browser-prev-btn').setAttribute('style', 'display:none')
		document.getElementById('browser-next-btn').setAttribute('style', 'display:none')
	}

	removingTab.remove()
	document.getElementById(id).remove()
}

function checkMiddleMouseClick(event) {
	var isRightMB
	event = event || window.event

	if ("which" in event)
		isRightMB = event.which == 2
	else if ("button" in e)
		isRightMB = event.button == 3

	return isRightMB
}

function changeHistory(next) {
	next = next || false
	var browser_tabs = document.getElementById('browser-tabs')
	var pageId = browser_tabs.getAttribute('pid')
	var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))

	if (next == true) {
		if (tabs[tabIndexId].activeHistory != tabs[tabIndexId].history.length - 1) {
			document.getElementById(pageId).innerHTML = ''
			document.getElementById(pageId).innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
			tabs[tabIndexId].next()
		}
	} else {
		if (tabs[tabIndexId].activeHistory != 0) {
			document.getElementById(pageId).innerHTML = ''
			document.getElementById(pageId).innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
			tabs[tabIndexId].prev()
		}
	}
}

function reloadTab() {
	var browser_tabs = document.getElementById('browser-tabs')
	var pageId = browser_tabs.getAttribute('pid')
	var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
	tabs[tabIndexId].reload()
}

// Xlecx
function openXlecxBrowser() {
	document.getElementById('add-new-tab').setAttribute('onclick', 'createNewXlecxTab(createNewTab())')
	createNewXlecxTab(createNewTab('xlecxChangePage(1, false, false)'))
	document.getElementById('browser').setAttribute('style', 'display:grid')
}

function createNewXlecxTab(id, pageNumber) {
	activateTab(document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`))
	var page = document.getElementById(id)
	pageNumber = pageNumber || 1

	xlecx.getPage({page:pageNumber, random:true, category:true}, (err, result) => {
		page.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer = null
		var elementContainer = null
		var element = null

		// Categories
		elementContainer = document.createElement('div')
		for (var i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenCategory(e.target.getAttribute('c'), 1, checkMiddleMouseClick(e))
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
			element.innerHTML = `<img src="${xlecx.baseURL+result.content[i].thumb}"><span>${result.content[i].pages}</span><p>${result.content[i].title}</p><div id="${result.content[i].id}"></div>`
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
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
				element.setAttribute('p', result.pagination[i][0])
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
			element.innerHTML = `<img src="${xlecx.baseURL+result.random[i].thumb}"><span>${result.random[i].pages}</span><p>${result.random[i].title}</p><div id="${result.random[i].id}"></div>`
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		container.appendChild(elementContainerContainer)

		page.appendChild(container)
	})
}

function xlecxOpenPost(makeNewPage, id, updateTabIndex) {
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var browser_tabs = document.getElementById('browser-tabs')
	var pageId = browser_tabs.getAttribute('pid')
	var page
	if (makeNewPage)
		page = document.getElementById(createNewTab(`xlecxOpenPost(false, "${id}", false)`))
	else {
		var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
		page = document.getElementById(pageId)
		page.innerHTML = ''
		page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'

		if (updateTabIndex == true)
			tabs[tabIndexId].addHistory(`xlecxOpenPost(false, "${id}", false)`)
	}
	
	xlecx.getComic(id, false, (err, result) => {
		page.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		var containerContainer = document.createElement('div')
		containerContainer.classList.add('xlecx-container-one-row')
		var container = document.createElement('div')
		var element, miniElement
		container.innerHTML = `<p class="xlecx-post-title">${result.title}</p>`

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
		for (var i = 0; i < result.images.length; i++) {
			element.innerHTML += `<img src="${xlecx.baseURL}/${result.images[i].thumb}">`
		}
		container.appendChild(element)
		containerContainer.appendChild(container)

		page.appendChild(containerContainer)
	})
}

function xlecxChangePage(page, makeNewPage, updateTabIndex) {
	page = page || 1
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var id, pageContent
	if (makeNewPage) {
		id = createNewTab(`xlecxChangePage(${page}, false, false)`)
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

function xlecxOpenCategory(name, page, makeNewPage, updateTabIndex) {
	name = name || null
	page = page || 1
	if (name == null) return
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var pageContent
	if (makeNewPage) {
		var id = createNewTab(`xlecxOpenCategory('${name}', ${page}, false, false)`)
		pageContent = document.getElementById(id)
	} else {
		var browser_tabs = document.getElementById('browser-tabs')
		var pageId = browser_tabs.getAttribute('pid')
		var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))

		pageContent = document.getElementById(document.getElementById('browser-tabs').getAttribute('pid'))
		pageContent.innerHTML = ''

		if (updateTabIndex == true)
			tabs[tabIndexId].addHistory(`xlecxOpenCategory('${name}', ${page}, false, false)`)
	}

	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	xlecx.getCategory(name, {page:page, random:true, category:true}, (err, result) => {
		pageContent.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer = null
		var elementContainer = null
		var element = null

		// Categories
		elementContainer = document.createElement('div')
		for (var i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.setAttribute('c', result.categories[i].url)
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				xlecxOpenCategory(e.target.getAttribute('c'), 1, checkMiddleMouseClick(e))
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
			element.innerHTML = `<img src="${xlecx.baseURL+result.content[i].thumb}"><span>${result.content[i].pages}</span><p>${result.content[i].title}</p><div id="${result.content[i].id}"></div>`
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
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
				element.setAttribute('p', result.pagination[i][0])
				element.onmousedown = e => {
					e.preventDefault()
					xlecxOpenCategory(name, Number(e.target.getAttribute('p')), checkMiddleMouseClick(e))
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
			element.innerHTML = `<img src="${xlecx.baseURL+result.random[i].thumb}"><span>${result.random[i].pages}</span><p>${result.random[i].title}</p><div id="${result.random[i].id}"></div>`
			element.onmousedown = e => {
				e.preventDefault()
				xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		container.appendChild(elementContainerContainer)

		pageContent.appendChild(container)
	})
}

function xlecxOpenTagContentMaker(result, pageContent, name, whitch) {
	var container = document.createElement('div')
	container.classList.add("xlecx-container")
	var elementContainerContainer, elementContainer, element

	// Categories
	elementContainer = document.createElement('div')
	for (var i = 0; i < result.categories.length; i++) {
		element = document.createElement('button')
		element.setAttribute('c', result.categories[i].url)
		element.textContent = result.categories[i].name
		element.onmousedown = e => {
			e.preventDefault()
			xlecxOpenCategory(e.target.getAttribute('c'), 1, checkMiddleMouseClick(e))
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
		element.innerHTML = `<img src="${xlecx.baseURL+result.content[i].thumb}"><span>${result.content[i].pages}</span><p>${result.content[i].title}</p><div id="${result.content[i].id}"></div>`
		element.onmousedown = e => {
			e.preventDefault()
			xlecxOpenPost(checkMiddleMouseClick(e), e.target.getAttribute('id'))
		}
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
				element.setAttribute('p', result.pagination[i][0])
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
}

function xlecxOpenTag(name, page, whitch, makeNewPage, updateTabIndex) {
	name = name || null
	page = page || 1
	whitch = whitch || 1
	if (name == null) return
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var pageContent
	if (makeNewPage) {
		var id = createNewTab(`xlecxOpenTag('${name}', ${page}, ${whitch}, false, false)`)
		pageContent = document.getElementById(id)
	} else {
		var browser_tabs = document.getElementById('browser-tabs')
		var pageId = browser_tabs.getAttribute('pid')

		pageContent = document.getElementById(pageId)
		pageContent.innerHTML = ''

		if (updateTabIndex == true) {
			var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
			tabs[tabIndexId].addHistory(`xlecxOpenTag('${name}', ${page}, ${whitch}, false, false)`)
		}
	}

	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	if (whitch == 1) {
		xlecx.getGroup(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else if (whitch == 2) {
		xlecx.getArtist(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else if (whitch == 3) {
		xlecx.getParody(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else {
		xlecx.getTag(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	}
}

function dl() {
	console.log(tabs)
	/*
	var option = {
		url: "https://xlecx.org/uploads/posts/2021-06/1622716645_01_tumblr_p3uuymo4kk1r97p6co1_1280.jpg",
		dest: dirUL+"/"
	}
	ImageDownloader.image(option).then(({ filename }) => {
		console.log('Saved to', filename)
	}).catch((err) => {
		console.error(err)
	})
	*/
}

$(document).ready(() => {
	loadComics()
});
