const fs = require('fs')
const path = require('path')
const nedb = require('nedb')
const ImageDownloader = require('image-downloader')
require('v8-compile-cache')
const xlecx = new XlecxAPI()
const defaultSetting = {
	"max_per_page": 18,
	"spin_color": 0,
	"post_img_num_in_row": 0,
	"img_graphic": 1,
	"pagination_width": 5,
	"connection_timeout": 10000,
	"show_not_when_dl_finish": true,
	"comic_panel_theme": 0
}
const sites = [['xlecx', 'xlecxRepairComicInfoGetInfo({id}, {whitch})']]
var setting, tabs = [], db = {}, downloadingList = []

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

// Create Database
db.index = new nedb({ filename: dirDB+'/index', autoload: true })
db.comics = new nedb({ filename: dirDB+'/comics', autoload: true })
db.artists = new nedb({ filename: dirDB+'/artists', autoload: true })
db.comic_artists = new nedb({ filename: dirDB+'/comic_artists', autoload: true })
db.tags = new nedb({ filename: dirDB+'/tags', autoload: true })
db.comic_tags = new nedb({ filename: dirDB+'/comic_tags', autoload: true })
db.groups = new nedb({ filename: dirDB+'/groups', autoload: true })
db.comic_groups = new nedb({ filename: dirDB+'/comic_groups', autoload: true })
db.parodies = new nedb({ filename: dirDB+'/parodies', autoload: true })
db.comic_parodies = new nedb({ filename: dirDB+'/comic_parodies', autoload: true })
db.playlist = new nedb({ filename: dirDB+'/playlist', autoload: true })
db.have = new nedb({ filename: dirDB+'/have', autoload: true })

const insert_index = async(id) => {
	await db.index.insert({ i:1, _id:id }, (err) => { if (err) error(err) })
}

const update_index = async(index, id) => {
	await db.index.update({_id:id}, { $set: {i:(index+1)} }, {}, (err) => {
		if (err) error(err)
	})
}

const delete_index = async(id) => {
	await db.index.delete({ _id:1 }, { multi:true })
}

const count_index = async(id) => {
	await db.index.count({_id:id}, (err, num) => {
		if (err) throw err
		if (num == 0) {
			insert_index(id)
		} else if (num > 1) {
			delete_index(id)
			insert_index(id)
		}
	})
}

async function makeDatabaseIndexs() {
	// comics
	await count_index(1)
	// artists
	await count_index(2)
	// comic_artists
	await count_index(3)
	// tags
	await count_index(4)
	// comic_tags
	await count_index(5)
	// groups
	await count_index(6)
	// comic_groups
	await count_index(7)
	// parodies
	await count_index(8)
	// comic_parodies
	await count_index(9)
	// playlist
	await count_index(10)
	// have
	await count_index(11)
}

// Needable Functions
function fileExt(str) {
	var base = new String(str).substring(str.lastIndexOf('.') + 1)
	return base
}

// Alerts
function PopAlert(txt, style) {
	txt = txt || null
	if (txt == null) return
	style = style || 'success'
	var id = new Date().getTime()
	var alertElement = document.createElement('div')
	alertElement.classList.add('pop-alert')
	alertElement.classList.add(`pop-alert-${style}`)
	alertElement.textContent = txt
	document.getElementsByTagName('body')[0].appendChild(alertElement)
	setTimeout(() => {
		var bottom, alerts = document.getElementsByClassName('pop-alert')
		for (var i = 0; i < alerts.length; i++) {
			bottom = Number(alerts[i].style.bottom.replace('px', '')) || 0
			alerts[i].style.bottom = (bottom+45)+'px'
		}
	}, 300)
	setTimeout(() => {
		alertElement.remove()
	}, 4000)
}

// Apply Setting
if (setting.img_graphic > 1) setting.img_graphic = 1
xlecx.timeout = setting.connection_timeout

// Make Tabs Draggable
const tabsContainer = document.getElementById('browser-tabs')
const tabsContainerTabs = tabsContainer.querySelectorAll('div')
tabsContainerTabs.forEach(dragable => {
	dragable.addEventListener('dragstart',() => {
		dragable.classList.add('dragging')
	})

	dragable.addEventListener('dragend', () => {
		dragable.classList.remove('dragging')
	})
})
tabsContainer.addEventListener('dragover', e => {
	e.preventDefault()
	const afterElement = getDragAfterElement(tabsContainer, e.clientX)
	const draggable = document.querySelector('.dragging')
	if (afterElement == null) {
		tabsContainer.append(draggable)
	} else {
		tabsContainer.insertBefore(draggable, afterElement)
	}
})

function getDragAfterElement(container, x) {
	const draggableElemnets = [...container.querySelectorAll('div:not(.dragging)')]
	return draggableElemnets.reduce((closest, child) => {
		const box = child.getBoundingClientRect()
		const offset = x - box.left - box.width / 2
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: child }
		} else {
			return closest
		}
	}, { offset: Number.NEGATIVE_INFINITY }).element
}

// Comics
function loadComics(page, search) {
	page = page || 1
	search = search || null
	var RegSearch
	if (search != null) {
		search = search.toLowerCase()
		RegSearch = new RegExp(search)
	}
	var comic_container = document.getElementById('comic-container')
	comic_container.innerHTML = ''
	var min = 0, max, allPages, id, name, image, pages, html = ''
	var max_per_page = setting.max_per_page

	const working = (doc) => {
		max = doc.length
		allPages = Math.ceil(doc.length / max_per_page)
		if (doc.length >= max_per_page) {
			min = (max_per_page * page) - max_per_page
			max = min + max_per_page
			if (max > doc.length) max = doc.length
		}

		for (let i=min; i < max; i++) {
			id = doc[i]._id || null
			if (id == null) return
			name = doc[i].n || null
			if (name == null) return
			image = doc[i].i[0] || null
			if (typeof(image) == 'object')
				image = 'Image/no-img-300x300.png'
			else
				image = `${dirUL}/${image}`
			pages = doc[i].i.length || null
			if (pages == null) { PopAlert(`PostID: ${id} Has No Image.`, 'danger') }
			html += `<div class="comic" onclick="openComic(${id})"><img src="${image}"><span>${pages}</span><p>${name}</p></div>`
		}
		comic_container.innerHTML = html
		
		// Pagination
		var thisPagination = pagination(allPages, page)
		pagination(allPages, page, 'loadMovies({page})')
		html = '<div>'
		for (var i in thisPagination) {
			if (thisPagination[i][1] == null)
				html += `<button disabled>${thisPagination[i][0]}</button>`
			else
				html += `<button onclick="loadComics(${thisPagination[i][1]}, ${search})">${thisPagination[i][0]}</button>`
		}
		html += '</div>'
		document.getElementById('pagination').innerHTML = html

		comic_container.setAttribute('page', page)
	}

	const findComicsBySearch = async() => {
		await db.comics.find({n:RegSearch}).sort({_id:-1}).exec((err, doc) => {
			if (err) { error(err); return }
			working(doc)
		})
	}

	const findComics = async() => {
		await db.comics.find({}).sort({_id:-1}).exec((err, doc) => {
			if (err) { error(err); return }
			working(doc)
		})
	}

	if (search == null)
		findComics()
	else
		findComicsBySearch()
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

function openComic(id) {
	id = id || null
	if (id == null) { error('Comic not Found.'); return }
	var comic_panel = document.getElementById('comic-panel')
	var title_container = document.getElementById('c-p-t')
	var groups_container = document.getElementById('c-p-g')
	var artists_container = document.getElementById('c-p-a')
	var parodies_container = document.getElementById('c-p-p')
	var tags_container = document.getElementById('c-p-ts')
	var image_container = document.getElementById('c-p-i')
	var name, images, html = ''

	title_container.textContent = ''
	groups_container.innerHTML = ''
	artists_container.innerHTML = ''
	parodies_container.innerHTML = ''
	tags_container.innerHTML = ''
	image_container.innerHTML = ''

	const findGroupName = async(id) => {
		await db.groups.findOne({_id:id}, (err, doc) => {
			if (err) { error(err); return }
			groups_container.innerHTML += `<button>${doc.n}</button>`
		})
	}

	const findGroupRow = async() => {
		await db.comic_groups.findOne({c:Number(id)}, (err, doc) => {
			if (err) { error(err); return }
			var checkDoc = doc || null
			if (checkDoc != null) {
				var groups = doc.t || null
				if (groups == null) return
				groups_container.innerHTML = 'Groups: '
				for (var i in groups) {
					findGroupName(groups[i])
				}
			}
		})
	}

	const findArtistName = async(id) => {
		await db.artists.findOne({_id:id}, (err, doc) => {
			if (err) { error(err); return }
			artists_container.innerHTML += `<button>${doc.n}</button>`
		})
	}

	const findArtistRow = async() => {
		await db.comic_artists.findOne({c:Number(id)}, (err, doc) => {
			if (err) { error(err); return }
			var checkDoc = doc || null
			if (checkDoc != null) {
				var artists = doc.t || null
				if (artists == null) return
				artists_container.innerHTML = 'Artists: '
				for (var i in artists) {
					findArtistName(artists[i])
				}
			}
		})
	}

	const findParodyName = async(id) => {
		await db.parodies.findOne({_id:id}, (err, doc) => {
			if (err) { error(err); return }
			parodies_container.innerHTML += `<button>${doc.n}</button>`
		})
	}

	const findParodyRow = async() => {
		await db.comic_parodies.findOne({c:Number(id)}, (err, doc) => {
			if (err) { error(err); return }
			var checkDoc = doc || null
			if (checkDoc != null) {
				var parodies = doc.t || null
				if (parodies == null) return
				parodies_container.innerHTML = 'Parody: '
				for (var i in parodies) {
					findParodyName(parodies[i])
				}
			}
		})
	}

	const findTagName = async(id) => {
		await db.tags.findOne({_id:id}, (err, doc) => {
			if (err) { error(err); return }
			tags_container.innerHTML += `<button>${doc.n}</button>`
		})
	}

	const findTagRow = async() => {
		await db.comic_tags.findOne({c:Number(id)}, (err, doc) => {
			if (err) { error(err); return }
			var checkDoc = doc || null
			if (checkDoc != null) {
				var tags = doc.t || null
				if (tags == null) return
				tags_container.innerHTML = 'Tags: '
				for (var i in tags) {
					findTagName(tags[i])
				}
			}
		})
	}

	const findComic = async() => {
		await db.comics.findOne({_id:Number(id)}, (err, doc) => {
			if (err) { error(err); return }
			name = doc.n || null
			if (name == null) return
			images = doc.i

			title_container.textContent = name

			for (var i in images) {
				if (typeof(images[i]) == 'object') {
					html += `<div class="repair-image" id="${i}"><p>Image hasn't Been Download Currectly.</p><button onclick="repairImage(${i})">Repair</button></div>`
				} else {
					html += `<img src="${dirUL}/${images[i]}">`
				}
			}
			image_container.innerHTML = html

			findGroupRow()
			findArtistRow()
			findParodyRow()
			findTagRow()
			comic_panel.style.display = 'block'
		})
	}

	if (setting.comic_panel_theme == 1)
		comic_panel.classList.add('comic-panel-darkmode')
	else
		comic_panel.classList.remove('comic-panel-darkmode')
	comic_panel.setAttribute('cid', id)
	findComic()
}

function closeComicPanel() {
	var comic_panel = document.getElementById('comic-panel')
	var title_container = document.getElementById('c-p-t')
	var groups_container = document.getElementById('c-p-g')
	var artists_container = document.getElementById('c-p-a')
	var parodies_container = document.getElementById('c-p-p')
	var tags_container = document.getElementById('c-p-ts')
	var image_container = document.getElementById('c-p-i')

	comic_panel.style.display = 'none'

	title_container.textContent = ''
	groups_container.innerHTML = ''
	artists_container.innerHTML = ''
	parodies_container.innerHTML = ''
	tags_container.innerHTML = ''
	image_container.innerHTML = ''

	comic_panel.setAttribute('cid', null)
}

async function repairImageUpdateDatabase(comic_id, imageIndex, imageName, passImageList) {
	passImageList[imageIndex] = imageName
	await db.comics.update({_id:comic_id}, { $set: {i:passImageList} }, {}, (err) => {
		if (err) error(err)
		var image_container = document.getElementById('c-p-i')
		var element = document.createElement('img')
		element.setAttribute('src', `${dirUL}/${imageName}`)
		var repairElement = document.getElementById(imageIndex)
		image_container.insertBefore(element, repairElement)
		repairElement.remove()
	})
}

async function repairImageFindDatabase(comic_id, imageIndex, imageName) {
	await db.comics.findOne({_id:comic_id}, (err, doc) => {
		if (err) { error(err); return }
		repairImageUpdateDatabase(comic_id, imageIndex, imageName, doc.i)
	})
}

async function repairImageDownloadImage(comic_id, imageIndex, imageUrl) {
	const time = new Date().getTime()
	var saveName = `r${time}-${imageIndex}.${fileExt(imageUrl)}`
	var option = {
		url: imageUrl,
		dest: dirUL+`/${saveName}`
	}

	await ImageDownloader.image(option).then(({ filename }) => {
		repairImageFindDatabase(comic_id, imageIndex, saveName)
	}).catch((err) => {
		error('Sorry There is a Problem in Repairing Image, Please check Internet Connection.<br>'+err)
		document.getElementById(imageIndex).innerHTML = `<p>Image hasn't Been Download Currectly.</p><button onclick="${imageIndex}">Repair</button>`
	})
}

async function repairImage(imageIndex) {
	var comic_id = Number(document.getElementById('comic-panel').getAttribute('cid'))
	var repairElement = document.getElementById(imageIndex)
	repairElement.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	await db.comics.findOne({_id:comic_id}, (err, doc) => {
		if (err) { error(err); return }
		var imageUrl = doc.i[imageIndex][0] || null
		if (imageUrl == null) { error('Image Url Is Missed!'); return }
		repairImageDownloadImage(comic_id, imageIndex, imageUrl)
	})
}

async function repairComicInfo() {
	var id = Number(document.getElementById('comic-panel').getAttribute('cid'))
	await db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc.s == undefined) return
		if (doc.s == undefined) return
		eval(sites[doc.s][1].replace('{id}', `'${doc.p}'`).replace('{whitch}', 4))
	})
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
	var pageContainer = document.getElementById('browser-pages')
	var passScoll = pageContainer.scrollTop
	var scrollValue = Number(who.getAttribute('sv')) || 0
	page = document.getElementById(pageId) || null
	if (page == null) return

	var tabsContainer = document.getElementById('browser-tabs')
	var passId = tabsContainer.getAttribute('pid') || null
	if (passId != null) {
		var passTab = document.getElementById('browser-tabs').querySelector(`[pi="${passId}"]`) || null
		if (passTab != null) {
			passTab.setAttribute('active', null)
			passTab.setAttribute('sv', passScoll)
			document.getElementById(passId).setAttribute('style', null)
		}
	}
	tabsContainer.setAttribute('pid', pageId)
	who.setAttribute('active', true)
	var tpage = document.getElementById(pageId)
	tpage.setAttribute('style', 'display:block')
	pageContainer.scrollTop = scrollValue
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
	var element = document.createElement('div')
	element.classList.add('browser-tab')
	element.setAttribute('onclick', 'activateTab(this)')
	element.setAttribute('pi', newTabId)
	element.setAttribute('ti', tabIndex)
	element.setAttribute('draggable', true)
	element.innerHTML = `<span><span class="spin spin-primary" style="width:22px;height:22px"></span></span> <button onclick="removeTab('${newTabId}')">X</button>`
	element.addEventListener('dragstart',() => { element.classList.add('dragging') })
	element.addEventListener('dragend', () => { element.classList.remove('dragging') })

	tabs[tabIndex] = new Tab(newTabId)
	tabs[tabIndex].history.push(history)
	page.setAttribute('class', 'browser-page')
	page.setAttribute('id', newTabId)
	tabsContainer.appendChild(element)
	page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	document.getElementById('browser-pages').appendChild(page)

	document.getElementById('browser-prev-btn').setAttribute('style', null)
	document.getElementById('browser-next-btn').setAttribute('style', null)
	document.getElementById('browser-reload-btn').setAttribute('style', null)

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
		document.getElementById('browser-reload-btn').setAttribute('style', 'display:none')
	}

	removingTab.remove()
	document.getElementById(id).remove()

	updateTabSize()
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

async function comicDownloader(time, index, result, quality, shortName, callback) {
	const url = downloadingList[index][1][downloadingList[index][0]]
	const saveName = `${time}-${downloadingList[index][0]}.${fileExt(url)}`
	var option = {
		url: url,
		dest: dirUL+`/${saveName}`
	}
	
	downloadingList[index][0] += 1
	var max = downloadingList[index][1].length
	var percentage = (100 / max) * downloadingList[index][0]
	var downloaderRow = document.getElementById(`${downloadingList[index][2]}`)
	await ImageDownloader.image(option).then(({ filename }) => {
		downloadingList[index][3][downloadingList[index][0]] = saveName
		downloaderRow.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.width = percentage+'%'
		downloaderRow.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent = `(${downloadingList[index][0]}/${max})`
		if (downloadingList[index][0] == max) {
			callback(index, result, quality, shortName)
		} else {
			comicDownloader(time, index, result, quality, shortName, callback)
		}
	}).catch((err) => {
		downloadingList[index][3][downloadingList[index][0]] = [url]
		downloaderRow.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.width = percentage+'%'
		downloaderRow.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent = `(${downloadingList[index][0]}/${max})`
		if (downloadingList[index][0] == max) {
			callback(index, result, quality, shortName)
		} else {
			comicDownloader(time, index, result, quality, shortName, callback)
		}
	})
}

function checkIsDownloading(id) {
	var arr = []
	for (var i in downloadingList) {
		arr.push(downloadingList[i][4])
	}

	if (arr.indexOf(id) > -1)
		return true
	else
		return false
}

// Xlecx
function openXlecxBrowser() {
	document.getElementById('add-new-tab').setAttribute('onclick', "createNewXlecxTab(createNewTab('xlecxChangePage(1, false, false)'))")
	createNewXlecxTab(createNewTab('xlecxChangePage(1, false, false)'))
	document.getElementById('browser').setAttribute('style', 'display:grid')
}

function createNewXlecxTab(id, pageNumber) {
	activateTab(document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`))
	var page = document.getElementById(id)
	pageNumber = pageNumber || 1

	var tabArea = document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`).getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-primary" style="width:22px;height:22px"></span>'
	xlecx.getPage({page:pageNumber, random:true, category:true}, (err, result) => {
		page.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		tabArea.innerHTML = `Page ${pageNumber}`
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
	if (makeNewPage) {
		pageId = createNewTab(`xlecxOpenPost(false, "${id}", false)`)
		page = document.getElementById(pageId)
	} else {
		var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))
		page = document.getElementById(pageId)
		page.innerHTML = ''
		page.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'

		if (updateTabIndex == true)
			tabs[tabIndexId].addHistory(`xlecxOpenPost(false, "${id}", false)`)
	}

	var tabArea = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`).getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-primary" style="width:22px;height:22px"></span>'
	xlecx.getComic(id, false, (err, result) => {
		page.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		tabArea.innerHTML = result.title
		var containerContainer = document.createElement('div')
		containerContainer.classList.add('xlecx-container-one-row')
		containerContainer.innerHTML = `<button class="xlecx-download-btn" onclick="xlecxDownloader('${id}')">Download</button>`
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

function xlecxOpenCategory(name, page, shortName, makeNewPage, updateTabIndex) {
	name = name || null
	page = page || 1
	shortName = shortName || null
	if (name == null || shortName == null) return
	makeNewPage = makeNewPage || false
	if (updateTabIndex == null) updateTabIndex = true
	var pageContent
	if (makeNewPage) {
		var id = createNewTab(`xlecxOpenCategory('${name}', ${page}, '${shortName}', false, false)`)
		pageContent = document.getElementById(id)
	} else {
		var browser_tabs = document.getElementById('browser-tabs')
		var pageId = browser_tabs.getAttribute('pid')
		var tabIndexId = Number(browser_tabs.querySelector(`[pi="${pageId}"]`).getAttribute('ti'))

		pageContent = document.getElementById(document.getElementById('browser-tabs').getAttribute('pid'))
		pageContent.innerHTML = ''

		if (updateTabIndex == true)
			tabs[tabIndexId].addHistory(`xlecxOpenCategory('${name}', ${page}, '${shortName}', false, false)`)
	}

	var tabArea = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`).getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	xlecx.getCategory(name, {page:page, random:true, category:true}, (err, result) => {
		pageContent.innerHTML = ''
		if (err) {
			page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
			return
		}
		tabArea.innerHTML = `${shortName} - ${page}`
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
		pageContent = document.getElementById(pageId)
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

	var tabArea = document.getElementById('browser-tabs').querySelector(`[pi="${pageId}"]`).getElementsByTagName('span')[0]
	tabArea.innerHTML = '<span class="spin spin-primary" style="width:22px;height:22px"></span>'
	pageContent.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	if (whitch == 1) {
		xlecx.getGroup(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else if (whitch == 2) {
		xlecx.getArtist(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else if (whitch == 3) {
		xlecx.getParody(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	} else {
		xlecx.getTag(name, {page:page, category:true}, (err, result) => {
			pageContent.innerHTML = ''
			if (err) {
				pageContent.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
				return
			}
			tabArea.textContent = `${name} - ${page}`
			xlecxOpenTagContentMaker(result, pageContent, name, whitch)
		})
	}
}

// Add New Xlecx Groups
async function xlecxAddGroupUpdateList(comicId, groupsList) {
	await db.comic_groups.update({c:comicId}, { $set: {t:groupsList} }, {}, (err) => {
		if (err) error(err)
	})
}

async function xlecxAddGroupCreateGroupIdList(comicId, groupsList, groupsListIndex, groupstNewList) {
	groupsListIndex = groupsListIndex || 0
	groupstNewList = groupstNewList || []
	await db.groups.findOne({n:groupsList[groupsListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		groupstNewList.push(doc._id)
		if (groupsListIndex == groupsList.length - 1)
			xlecxAddGroupUpdateList(comicId, groupstNewList)
		else
			xlecxAddGroupCreateGroupIdList(comicId, groupsList, groupsListIndex + 1, groupstNewList)
	})
}

async function xlecxAddGroupAddGroupRow(comicId, index, groupsList) {
	await db.comic_groups.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		xlecxAddGroupCreateGroupIdList(comicId, groupsList)
		update_index(index, 7)
	})
}

async function xlecxAddGroup(comicId, groupsList) {
	await db.comic_groups.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:7}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				xlecxAddGroupAddGroupRow(comicId, index, groupsList)
			})
		} else {
			xlecxAddGroupCreateGroupIdList(comicId, groupsList)
		}
	})
}

async function xlecxCreateGroupInsert(groupName, index) {
	await db.groups.insert({n:groupName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function xlecxCreateGroup(groupsList, index, groupsAddToList, comicId, groupsListIndex) {
	groupsListIndex = groupsListIndex || 0
	groupsAddToList = groupsAddToList || false
	await db.groups.count({n:groupsList[groupsListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			xlecxCreateGroupInsert(groupsList[groupsListIndex], index).then(() => {
				if (groupsListIndex == groupsList.length - 1) {
					update_index(index, 6)
					if (groupsAddToList == true) {
						xlecxAddGroup(comicId, groupsList)
					}
				} else {
					xlecxCreateGroup(groupsList, index + 1, groupsAddToList, comicId, groupsListIndex + 1)
				}
			})
		} else {
			if (groupsListIndex == groupsList.length - 1) {
				update_index(index , 6)
				if (groupsAddToList == true) {
					xlecxAddGroup(comicId, groupsList)
				}
			} else
				xlecxCreateGroup(groupsList, index, groupsAddToList, comicId, groupsListIndex + 1)
		}
	})
}

// Add New Xlecx Artist
async function xlecxAddArtistUpdateList(comicId, artistsList) {
	await db.comic_artists.update({c:comicId}, { $set: {t:artistsList} }, {}, (err) => {
		if (err) error(err)
	})
}

async function xlecxAddArtistCreateArtistIdList(comicId, artistsList, artistsListIndex, artistsNewList) {
	artistsListIndex = artistsListIndex || 0
	artistsNewList = artistsNewList || []
	await db.artists.findOne({n:artistsList[artistsListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		artistsNewList.push(doc._id)
		if (artistsListIndex == artistsList.length - 1)
			xlecxAddArtistUpdateList(comicId, artistsNewList)
		else
			xlecxAddArtistCreateArtistIdList(comicId, artistsList, artistsListIndex + 1, artistsNewList)
	})
}

async function xlecxAddArtistAddArtistRow(comicId, index, artistsList) {
	await db.comic_artists.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		xlecxAddArtistCreateArtistIdList(comicId, artistsList)
		update_index(index, 3)
	})
}

async function xlecxAddArtist(comicId, artistsList) {
	await db.comic_artists.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:3}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				xlecxAddArtistAddArtistRow(comicId, index, artistsList)
			})
		} else {
			xlecxAddArtistCreateArtistIdList(comicId, artistsList)
		}
	})
}

async function xlecxCreateArtistInsert(artistName, index) {
	await db.artists.insert({n:artistName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function xlecxCreateArtist(artistsList, index, artistsAddToList, comicId, artistsListIndex) {
	artistsListIndex = artistsListIndex || 0
	artistsAddToList = artistsAddToList || false
	await db.artists.count({n:artistsList[artistsListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			xlecxCreateArtistInsert(artistsList[artistsListIndex], index).then(() => {
				if (artistsListIndex == artistsList.length - 1) {
					update_index(index, 2)
					if (artistsAddToList == true) {
						xlecxAddArtist(comicId, artistsList)
					}
				} else {
					xlecxCreateArtist(artistsList, index + 1, artistsAddToList, comicId, artistsListIndex + 1)
				}
			})
		} else {
			if (artistsListIndex == artistsList.length - 1) {
				update_index(index , 2)
				if (artistsAddToList == true) {
					xlecxAddArtist(comicId, artistsList)
				}
			} else
				xlecxCreateArtist(artistsList, index, artistsAddToList, comicId, artistsListIndex + 1)
		}
	})
}

// Add New Xlecx Parody
async function xlecxAddParodyUpdateList(comicId, parodyList) {
	await db.comic_parodies.update({c:comicId}, { $set: {t:parodyList} }, {}, (err) => {
		if (err) error(err)
	})
}

async function xlecxAddParodyCreateParodyIdList(comicId, parodyList, parodyListIndex, parodyNewList) {
	parodyListIndex = parodyListIndex || 0
	parodyNewList = parodyNewList || []
	await db.parodies.findOne({n:parodyList[parodyListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		parodyNewList.push(doc._id)
		if (parodyListIndex == parodyList.length - 1) {
			xlecxAddParodyUpdateList(comicId, parodyNewList)
		} else
			xlecxAddParodyCreateParodyIdList(comicId, parodyList, parodyListIndex + 1, parodyNewList)
	})
}

async function xlecxAddParodyAddParodyRow(comicId, index, parodyList) {
	await db.comic_parodies.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		xlecxAddParodyCreateParodyIdList(comicId, parodyList)
		update_index(index, 9)
	})
}

async function xlecxAddParody(comicId, parodyList) {
	await db.comic_parodies.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:9}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				xlecxAddParodyAddParodyRow(comicId, index, parodyList)
			})
		} else {
			xlecxAddParodyCreateParodyIdList(comicId, parodyList)
		}
	})
}

async function xlecxCreateParodyInsert(parodyName, index) {
	await db.parodies.insert({n:parodyName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function xlecxCreateParody(parodyList, index, parodyAddToList, comicId, parodyListIndex) {
	parodyListIndex = parodyListIndex || 0
	parodyAddToList = parodyAddToList || false
	await db.parodies.count({n:parodyList[parodyListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			xlecxCreateParodyInsert(parodyList[parodyListIndex], index).then(() => {
				if (parodyListIndex == parodyList.length - 1) {
					update_index(index, 8)
					if (parodyAddToList == true) {
						xlecxAddParody(comicId, parodyList)
					}
				} else {
					xlecxCreateParody(parodyList, index + 1, parodyAddToList, comicId, parodyListIndex + 1)
				}
			})
		} else {
			if (parodyListIndex == parodyList.length - 1) {
				update_index(index , 8)
				if (parodyAddToList == true) {
					xlecxAddParody(comicId, parodyList)
				}
			} else
				xlecxCreateParody(parodyList, index, parodyAddToList, comicId, parodyListIndex + 1)
		}
	})
}

// Add New Xlecx Tag
async function xlecxAddTagUpdateList(comicId, tagList) {
	await db.comic_tags.update({c:comicId}, { $set: {t:tagList} }, {}, (err) => {
		if (err) error(err)
	})
}

async function xlecxAddTagCreateTagIdList(comicId, tagList, tagListIndex, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	await db.tags.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		newList.push(doc._id)
		if (tagListIndex == tagList.length - 1)
			xlecxAddTagUpdateList(comicId, newList)
		else
			xlecxAddTagCreateTagIdList(comicId, tagList, tagListIndex + 1, newList)
	})
}

async function xlecxAddTagAddTagRow(comicId, index, tagList) {
	await db.comic_tags.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		xlecxAddTagCreateTagIdList(comicId, tagList)
		update_index(index, 5)
	})
}

async function xlecxAddTag(comicId, tagList) {
	await db.comic_tags.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:5}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				xlecxAddTagAddTagRow(comicId, index, tagList)
			})
		} else {
			xlecxAddTagCreateTagIdList(comicId, tagList)
		}
	})
}

async function xlecxCreateTagInsert(tagName, index) {
	await db.tags.insert({n:tagName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function xlecxCreateTag(tagList, index, addToList, comicId, tagListIndex) {
	tagListIndex = tagListIndex || 0
	addToList = addToList || false
	await db.tags.count({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			xlecxCreateTagInsert(tagList[tagListIndex], index).then(() => {
				if (tagListIndex == tagList.length - 1) {
					update_index(index, 4)
					if (addToList == true) {
						xlecxAddTag(comicId, tagList)
					}
				} else {
					xlecxCreateTag(tagList, index + 1, addToList, comicId, tagListIndex + 1)
				}
			})
		} else {
			if (tagListIndex == tagList.length - 1) {
				update_index(index , 4)
				if (addToList == true) {
					xlecxAddTag(comicId, tagList)
				}
			} else
				xlecxCreateTag(tagList, index, addToList, comicId, tagListIndex + 1)
		}
	})
}

function xlecxDownloader(id) {
	if (checkIsDownloading(id)) { error('You are Downloading This Comic.'); return }
	db.comics.count({s:0, p:id}, (err, num) => {
		if (err) { error(err); return}
		if (num > 0) { error('You Already Have This Comic.'); return }
		xlecx.getComic(id, false, (err, result) => {
			if (err) { error(err); return }
			
			var downloader = document.getElementById('downloader')
			downloader.setAttribute('style', 'display:block')
			var element = document.createElement('div')
			var name = result.title, number = result.images.length, quality = 0
			if (name.length > 19) name = name.substr(0, 16)+'...'
			if (result.images[0].src == result.images[0].thumb)
				quality = 1
			else
				quality = setting.img_graphic
	
			var downloadIndex = downloadingList.length
			downloadingList[downloadIndex] = [0, [], new Date().getTime(), [], id]
			element.setAttribute('id', downloadingList[downloadIndex][2])
			element.setAttribute('i', downloadIndex)
			element.innerHTML = `<span class="spin spin-fast spin-success"></span><p>${name} <span>(0/${number})</span></p><div><div></div></div>`
			downloader.appendChild(element)
	
			for (var i = 0; i < number; i++) {
				if (quality == 0)
					downloadingList[downloadIndex][1].push(xlecx.baseURL+result.images[i].thumb)
				else
					downloadingList[downloadIndex][1].push(xlecx.baseURL+result.images[i].src)
			}
	
			var sendingResult = {}
			sendingResult.title = result.title
			if (result.groups != undefined)	sendingResult.groups = result.groups
			if (result.artists != undefined) sendingResult.artists = result.artists
			if (result.parody != undefined)	sendingResult.parody = result.parody
			if (result.tags != undefined)	sendingResult.tags = result.tags
			const date = new Date().getTime()
			comicDownloader(date, downloadIndex, sendingResult, quality, name, async(index, gottenResult, gottenQuality, shortName) => {
				await db.index.findOne({_id:1}, (err, cIndex) => {
					if (err) { error(err); return }
					db.comics.insert({n:gottenResult.title.toLowerCase(), i:downloadingList[index][3], q:gottenQuality, s:0, p:downloadingList[index][4], _id:cIndex.i}, (err, doc) => {
						if (err) { error(err); return }
						update_index(cIndex.i, 1)
						var id = doc._id
						var groups = gottenResult.groups || null
						var artists = gottenResult.artists || null
						var parody = gottenResult.parody || null
						var tags = gottenResult.tags || null

						// Groups
						if (groups != null) {
							var groupsList = []
							for (var i in groups) {
								groupsList.push(groups[i].name)
							}
							db.index.findOne({_id:6}, (err, doc) => {
								if (err) { error(err); return }
								var groupsIndex = doc.i
								xlecxCreateGroup(groupsList, groupsIndex, true, id)
							})
						}

						// Artists
						if (artists != null) {
							var artistsList = []
							for (var i in artists) {
								artistsList.push(artists[i].name)
							}
							db.index.findOne({_id:2}, (err, doc) => {
								if (err) { error(err); return }
								var artistsIndex = doc.i
								xlecxCreateArtist(artistsList, artistsIndex, true, id)
							})
						}

						// Parody
						if (parody != null) {
							var parodyList = []
							for (var i in parody) {
								parodyList.push(parody[i].name)
							}
							db.index.findOne({_id:8}, (err, doc) => {
								if (err) { error(err); return }
								var parodyIndex = doc.i
								xlecxCreateParody(parodyList, parodyIndex, true, id)
							})
						}
	
						// Tags
						if (tags != null) {
							var tagsList = []
							for (var i in tags) {
								tagsList.push(tags[i].name)
							}
							db.index.findOne({_id:4}, (err, doc) => {
								if (err) { error(err); return }
								var tagIndex = doc.i
								xlecxCreateTag(tagsList, tagIndex, true, id)
							})
						}
	
						document.getElementById(`${downloadingList[index][2]}`).remove()
						downloadingList[index] = null
						if (setting.show_not_when_dl_finish == true)
							PopAlert(`Comic (${shortName}) Downloaded.`)
						var downloader = document.getElementById('downloader')
						if (downloader.children.length == 0) {
							downloader.setAttribute('style', null)
							downloadingList = []
						}
					})
				})
			})
		})
	})
}

async function xlecxRepairComicInfoGetInfo(id, whitch) {
	var comic_id = Number(document.getElementById('comic-panel').getAttribute('cid'))
	switch (whitch) {
		case 0:
			break
		case 1:
			break
		case 2:
			break
		case 3:
			break
		case 4:
			await xlecx.getComic(id, false, (err, result) => {
				if (err) { error(err); return }
				const neededResult = result.tags || null
				if (neededResult == null) return
				var tagsList = []
				for (var i in neededResult) {
					tagsList.push(neededResult[i].name)
				}
				db.index.findOne({_id:4}, (err, doc) => {
					if (err) { error(err); return }
					var tagIndex = doc.i
					xlecxCreateTag(tagsList, tagIndex, true, comic_id)
				})
			})
			break
		case 5:
			break
	}
}

function dl() {
	xlecx.getComic('479-transformers-sex-comics-free.html', false, (err, result) => {
		if (err) { error(err); return }
		console.log(result.tags)
	})
}

$(document).ready(() => {
	makeDatabaseIndexs()
	loadComics()
});
