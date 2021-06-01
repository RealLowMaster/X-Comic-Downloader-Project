const xlecx = new XlecxAPI();


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

function activeTab(who, id) {
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
	document.getElementById(pageId).setAttribute('style', 'display:block')
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
	document.getElementById('browser').setAttribute('style', 'display:grid')
}

$(document).ready(() => {
	// var h = xlecx.getPage(692, true);
	// var h = xlecx.getComic('9666-uchishikiri.html');
	// var h = xlecx.getAllTags();
	// var h = xlecx.getGroup('pucchu', 1);
	// var h = xlecx.getArtist('felsala', 1);
	// var h = xlecx.getParody('boruto', 1);
	// var h = xlecx.getTag('absorption', 2);
	// var h = xlecx.search('hello');
});
