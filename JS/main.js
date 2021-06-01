const fs = require('fs')
const path = require('path')
require('v8-compile-cache')
const xlecx = new XlecxAPI()
const defaultSetting = {
	"max_per_page": 18
}
var setting
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

	var html = `<div class="error"><div></div><div><p>${err}</p>`
	if (onclick == null) {
		html += '<button class="btn btn-danger" onclick="$(this).parent(\'div\').parent(\'.error\').remove()">OK</button></div></div>'
	} else {
		html += `<button class="btn btn-danger" onclick="${onclick}">OK</button></div></div>`
	}

	$('#main').append(html)
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

// CheckConnection
const checkOnlineStatus = async(url) => {
	url = url || "https://www.google.com/"
	try {
		const online = await fetch(url)
		return online.status >= 200 && online.status < 300;
	} catch (err) {
		return false;
	}
};

// Browser
function openBrowser() {
	console.log('Comming Sood!')
}

function closeBrowser() {
	console.log('Comming Sood!')
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

function activeTab(who) {
	var pageId = who.getAttribute('pi')
	page = document.getElementById(pageId) || null
	if (page == null) return

	var tabsContainer = document.getElementById('browser-tabs')
	var passId = tabsContainer.getAttribute('pid') || null
	if (passId != null) {
		document.getElementById('browser-tabs').querySelector(`[pi="${passId}"]`).setAttribute('active', null)
		document.getElementById(passId).setAttribute('style', null)
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
	document.getElementById('browser-tabs').innerHTML += `<div class="browser-tab" onclick="activeTab(this)" pi="${newTabId}"><span>${newTabId}</span> <button onclick="removeTab('${newTabId}')">X</button></div>`
	document.getElementById('browser-pages').appendChild(page)

	updateTabSize()
	return newTabId
}

function removeTab(id) {
	document.getElementById(id).remove()
	document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`).remove()
}


// Xlecx
function openXlecxBrowser() {
	document.getElementById('add-new-tab').setAttribute('onclick', 'createNewXlecxTab(createNewTab())')
	var firstTabId = createNewTab()
	createNewXlecxTab(firstTabId)
	activeTab(document.getElementById('browser-tabs').querySelector(`[pi="${firstTabId}"]`))
	document.getElementById('browser').setAttribute('style', 'display:grid')
}

function createNewXlecxTab(id) {
	var page = document.getElementById(id)
	var result = xlecx.getPage(1, true, true, true)
	console.log(result)
	var html = '<div class="xlecx-container"><div>'
	for (var i = 0; i < result.categories.length; i++) {
		html += `<button>${result.categories[i].name}</button>`
	}
	html += '</div><div><div class="xlecx-post-container">'

	for (var i = 0; i < result.content.length; i++) {
		html += `<div><img src="${xlecx.baseURL+result.content[i].thumb}" alt=""><span>${result.content[i].pages}</span><p>${result.content[i].title}</p></div>`
	}
	html += '</div><div class="xlecx-pagigation">'

	for (var i = 0; i < result.pagigation.length; i++) {
		if (result.pagigation[i][1] == null)
			html += `<button disable="true">${result.pagigation[i][0]}</span>`
		else
			html += `<button>${result.pagigation[i][0]}</button>`
	}
	html += '</div><div class="xlecx-post-container">'

	for (var i = 0; i < result.random.length; i++) {
		html += `<div><img src="${xlecx.baseURL+result.random[i].thumb}" alt=""><span>${result.random[i].pages}</span><p>${result.random[i].title}</p></div>`
	}
	html += '</div></div></div>'

	page.innerHTML = html
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
