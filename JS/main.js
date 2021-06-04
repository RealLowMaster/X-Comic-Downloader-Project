const fs = require('fs')
const path = require('path')
const ImageDownloader = require('image-downloader')
require('v8-compile-cache')
const xlecx = new XlecxAPI()
const defaultSetting = {
	"max_per_page": 18
}
var setting, tabs = []
// eval() Convert String To Code

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

// Browser
function closeBrowser() {
	document.getElementById('browser').setAttribute('style', null)
	document.getElementById('browser-pages').innerHTML = ''
	var browser_tabs = document.getElementById('browser-tabs')
	browser_tabs.innerHTML = ''
	browser_tabs.setAttribute('pid', '')
	tabs = []
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

function createNewTab() {
	if (checkTabLimit()) return null

	var date = new Date()
	var randomNumber = Math.floor(Math.random() * 500)
	var newTabId = `${date.getTime()}-${randomNumber}`
	var page = document.createElement('div')
	page.setAttribute('class', 'browser-page')
	page.setAttribute('id', newTabId)
	document.getElementById('browser-tabs').innerHTML += `<div class="browser-tab" onclick="activateTab(this)" pi="${newTabId}"><span>${newTabId}</span> <button onclick="removeTab('${newTabId}')">X</button></div>`
	document.getElementById('browser-pages').appendChild(page)

	updateTabSize()
	return newTabId
}

function removeTab(id) {
	var removingTab = document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`)
	var tabs = document.getElementById('browser-tabs').children
	var index = Array.prototype.slice.call(tabs).indexOf(removingTab)

	if (index == 0) {
		if (1 <= tabs.length - 1) {
			activateTab(tabs[1])
		}
	} else {
		activateTab(tabs[index - 1])
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

// Xlecx
function openXlecxBrowser() {
	document.getElementById('add-new-tab').setAttribute('onclick', 'createNewXlecxTab(createNewTab())')
	createNewXlecxTab(createNewTab())
	document.getElementById('browser').setAttribute('style', 'display:grid')
}

function createNewXlecxTab(id) {
	activateTab(document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`))
	var page = document.getElementById(id)

	xlecx.getPage({page:1, random:true, category:true}, (err, result) => {
		if (err) { error(err); return }
		var container = document.createElement('div')
		container.classList.add("xlecx-container")
		var elementContainerContainer = null
		var elementContainer = null
		var element = null

		// Categories
		elementContainer = document.createElement('div')
		for (var i = 0; i < result.categories.length; i++) {
			element = document.createElement('button')
			element.textContent = result.categories[i].name
			element.onmousedown = e => {
				xlecxOpenCategory(checkMouseButton(e))
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
				xlecxOpenPage(checkMiddleMouseClick(e), e.target.getAttribute('id'))
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
				element.onmousedown = e => {
					xlecxOpenPage(checkMouseButton(e))
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
				xlecxOpenPage(checkMiddleMouseClick(e), e.target.getAttribute('id'))
			}
			elementContainer.appendChild(element)
		}
		elementContainerContainer.appendChild(elementContainer)
		container.appendChild(elementContainerContainer)

		page.appendChild(container)
	})
}

function xlecxOpenPage(makeNewPage, id) {
	makeNewPage = makeNewPage || false
	var page
	if (makeNewPage)
		page = document.getElementById(createNewTab())
	else {
		page = document.getElementById(document.getElementById('browser-tabs').getAttribute('pid'))
		page.innerHTML = ''
	}
	
	xlecx.getComic(id, false, (err, result) => {
		if (err) { error(err); return }
		var containerContainer = document.createElement('div')
		containerContainer.classList.add('xlecx-container-one-row')
		var container = document.createElement('div')
		var element
		container.innerHTML = `<p class="xlecx-post-title">${result.title}</p>`

		// Groups
		if (result.groups != undefined) {
			element = document.createElement('div')
			element.classList.add('xlecx-post-tags')
			element.innerHTML = "Group: "
			for(var i = 0; i < result.groups.length; i++) {
				element.innerHTML += `<button>${result.groups[i].name}</button> `
			}
			container.append(element)
		}

		// Artists
		if (result.artists != undefined) {
			element = document.createElement('div')
			element.classList.add('xlecx-post-tags')
			element.innerHTML = "Artist: "
			for(var i = 0; i < result.artists.length; i++) {
				element.innerHTML += `<button>${result.artists[i].name}</button> `
			}
			container.append(element)
		}

		// Parody
		if (result.parody != undefined) {
			element = document.createElement('div')
			element.classList.add('xlecx-post-tags')
			element.innerHTML = "Parody: "
			for(var i = 0; i < result.parody.length; i++) {
				element.innerHTML += `<button>${result.parody[i].name}</button> `
			}
			container.append(element)
		}

		// Tags
		if (result.tags != undefined) {
			element = document.createElement('div')
			element.classList.add('xlecx-post-tags')
			element.innerHTML = "Tag: "
			for(var i = 0; i < result.tags.length; i++) {
				element.innerHTML += `<button>${result.tags[i].name}</button> `
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

function xlecxOpenCategory(makeNewPage) {
	makeNewPage = makeNewPage || false
	console.log(makeNewPage)
}

function dl() {
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
	// var h = xlecx.getPage(692, true)
	// var h = xlecx.getComic('9666-uchishikiri.html')
	// var h = xlecx.getAllTags()
	// var h = xlecx.getGroup('pucchu', 1)
	// var h = xlecx.getArtist('felsala', 1)
	// var h = xlecx.getParody('boruto', 1)
	// var h = xlecx.getTag('absorption', 2)
	// var h = xlecx.search('hello')
});
