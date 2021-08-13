const { remote, shell } = require('electron')
const fs = require('fs')
const nedb = require('nedb')
const ImageDownloader = require('image-downloader')
const xlecx = new XlecxAPI()
const defaultSetting = {
	"comic_panel_theme": 0,
	"pagination_theme": 0,
	"offline_theme": 0,
	"waiting_quality": 1,
	"hover_downloader": false,
	"max_per_page": 18,
	"img_graphic": 1,
	"notification_download_finish": true,
	"lazy_loading": true,
	"tabs_limit": 32,
	"search_speed": 1,
	"download_limit": 5,
	"file_location": null,
	"developer_mode": false
}
const comicPanel = document.getElementById('comic-panel')
const pageContainer = document.getElementById('browser-pages')
const imageLazyLoadingOptions = {
	root: comicPanel,
	threshold: 0,
	rootMargin: "0px 0px 300px 0px"
}
const sites = [
	[
		'xlecx',
		'xlecxRepairComicInfoGetInfo({id}, {whitch})',
		'xlecxSearch({text}, 1, 0)',
		'xlecxChangePage(1, 0, true)',
		'xlecxJumpPage({index}, {page})'
	]
]
const ThisWindow = remote.getCurrentWindow(), loading = new Loading(14), db = {}, version = [1, 3, 7]
const comicGroupsContainer = document.getElementById('c-p-g')
const comicArtistsContainer = document.getElementById('c-p-a')
const comicParodyContainer = document.getElementById('c-p-p')
const comicTagsContainer = document.getElementById('c-p-ts')
const browserTabMenu = document.getElementById('browser-tab-menu')
const browserPasteMenu = document.getElementById('browser-paste-menu')
const bjp = document.getElementById('browser-jump-page-container')
const bjp_i = document.getElementById('bjp-i')
const bjp_m_p = document.getElementById('bjp-m-p')
let comicDeleting = false, downloadCounter = 0, needReload = true, wt_fps = 20
var setting, dirDB, dirUL, tabs = [], downloadingList = [], thisSite, lastComicId, lastHaveId, lastGroupId, lastArtistId, lastParodyId, lastTagId, searchTimer, activeTabComicId = null, activeTabIndex = null, tabsPos = [], tabsPosParent = [], openedMenuTabIndex, copiedTab = null

// Needable Functions
function fileExt(str) {
	return new String(str).substring(str.lastIndexOf('.') + 1)
}

function lastSlash(str, backSlasg) {
	backSlasg = backSlasg || '/'
	const base = new String(str).substring(str.lastIndexOf(backSlasg) + 1)
	return base
}

function select(who, value) {
	const parent = who.parentElement.parentElement
	const overflow = parent.getElementsByTagName('div')[1]

	parent.getElementsByTagName('div')[0].textContent = who.textContent
	overflow.style.display = 'none'
	overflow.querySelector(`[onclick="select(this, ${parent.getAttribute('value')})"]`).removeAttribute('active')
	parent.setAttribute('value', value)
}

function openSelect(who) {
	const overflows = document.getElementsByClassName('input-row-selector-overflow')
	for (let i = 0; i < overflows.length; i++) {
		overflows[i].style.display = 'none'
	}
	const overflow = who.getElementsByTagName('div')[1]
	overflow.style.display = 'block'
	overflow.querySelector(`[onclick="select(this, ${who.getAttribute('value')})"]`).setAttribute('active', '')
}

function columnSelector(who, value) {
	const parent = who.parentElement
	const passValue = parent.getAttribute('value') || null
	if (passValue != null) parent.querySelector(`[cs="${passValue}"]`).removeAttribute('active')
	parent.setAttribute('value', value)
	who.setAttribute('active', '')
}

function inputLimit(who, max) {
	if (who == null || max == null) return
	const value = who.value

	if (value > max)
		who.value = max
	else if (value < 1)
		who.value = 1
}

function getJSON(src) {
	const xmlHttp = new XMLHttpRequest()
	xmlHttp.open("GET", src, false)
	xmlHttp.send(null)
	return JSON.parse(xmlHttp.responseText)
}

function MakeJsonString(json) {
	return JSON.stringify(json).replace(/,/g, ',\n\t').replace(/{/g, '{\n\t').replace(/}/g, '\n}').replace(/":/g, '": ')
}

function PopAlertFrame(who) {
	setTimeout(() => {
		const bottom = Number(who.style.bottom.replace('px', ''))
		who.style.bottom = (bottom+45)+'px'
	}, 10)
}

function PopAlert(txt, style) {
	txt = txt || null
	if (txt == null) return
	style = style || 'success'
	const alertElement = document.createElement('div')
	alertElement.classList.add('pop-alert')
	alertElement.classList.add(`pop-alert-${style}`)
	alertElement.textContent = txt
	document.getElementsByTagName('body')[0].appendChild(alertElement)

	const alerts = document.getElementsByClassName('pop-alert')
	for (let i = 0; i < alerts.length; i++) {
		PopAlertFrame(alerts[i])
	}

	setTimeout(() => {
		alertElement.remove()
	}, 4000)
}

function ChooseDirectory(title, callback) {
	title = title || 'Choose Directory'
	callback = callback || null

	if (callback == null) throw 'Callback function Can\'t Be Null.'
	if (typeof(callback) != 'function') throw 'Callback Should Be Function.'

	const choosedDirectory = remote.dialog.showOpenDialogSync({title:title, properties:['openDirectory']})

	if (choosedDirectory == undefined)
		callback('Canceled', null)
	else
		callback(null, choosedDirectory[0])
}

function GetFileLocationCallback(err, result) {
	if (err) {
		ChooseDirectory('Choose Directory For Saving Downloaded Comics', GetFileLocationCallback)
		return
	}
	if (!fs.existsSync(result)) {
		ChooseDirectory(`No Such Directory Called '${lastSlash(result, '\\')}'. Choose Another One.`, GetFileLocationCallback)
		return
	}
	dirDB = result+'\\ComicsDB'
	dirUL = result+'\\DownloadedComics'
	setting.file_location = result
	saveSetting(true)
}

function GetFileLocationForInput(who) {
	ChooseDirectory('Choose Directory For Saving Downloaded Comics', (err, result) => {
		if (err) { return }
		if (!fs.existsSync(result)) {
			PopAlert(`No Such Directory Called '${lastSlash(result, '\\')}'.`, 'danger')
			return
		}

		who.setAttribute('location', result)
		const s_file_location_label = who.parentElement.parentElement.children[0]
		if (result.match(/[\\]/g).length > 1)
			s_file_location_label.textContent = result.substr(0,2)+'\\...\\'+lastSlash(result, '\\')
		else
			s_file_location_label.textContent = result
		s_file_location_label.setAttribute('title', result)
	})
}

function OpenLinkInBrowser(url) { shell.openExternal(url) }

function CheckUpdate() {
	if (window.navigator.onLine) {
		fetch('https://raw.githubusercontent.com/RealLowMaster/X-Comic-Downloader/main/version-release.html').then(response => {
			if (!response.ok) {
				PopAlert('HTTP error '+response.status)
				return
			}
			return response.json()
		}).then(json => {
			let newRelease = false
			for (let i = 0; i < version.length; i++) {
				if (json.latest[0][i] > version[i]) {
					newRelease = true
					break
				}
			}

			if (newRelease) {
				const releaser = document.getElementById('new-release')
				releaser.getElementsByTagName('p')[0].textContent = `New Release: v${json.latest[0][0]}.${json.latest[0][1]}.${json.latest[0][2]}`
				releaser.getElementsByTagName('a')[0].setAttribute('onclick', `OpenLinkInBrowser('${json.latest[1]}')`)
				releaser.getElementsByTagName('a')[1].setAttribute('onclick', `OpenLinkInBrowser('${json.latest[2]}')`)
				releaser.style.display = 'block'
			} else PopAlert('Your App is Up To Date.')

		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			PopAlert(err, 'danger')
		})
	} else PopAlert('You are Offline.', 'danger')
}

function reCreateNode(element, withChildren) {
	if (withChildren) element.parentNode.replaceChild(element.cloneNode(true), element)
	else {
		const newEl = element.cloneNode(false)
		while (element.hasChildNodes()) newEl.appendChild(element.firstChild)
		element.parentNode.replaceChild(newEl, element)
	}
}

// Main Loading Stuff
const dirRoot = __dirname.replace('\\app.asar', '')

function GetSettingFile() {
	if (!fs.existsSync(dirRoot+'/setting.json')) {
		setting = defaultSetting
		fs.writeFileSync(dirRoot+'/setting.json', MakeJsonString(setting), {encoding:"utf8"})
	} else setting = getJSON(dirRoot+'/setting.json')
}

function GetDirection() {
	if (setting.file_location == null)
		ChooseDirectory('Choose Directory For Saving Downloaded Comics', GetFileLocationCallback)
	else {
		if (!fs.existsSync(setting.file_location))
			ChooseDirectory('Choose Directory For Saving Downloaded Comics', GetFileLocationCallback)
		else {
			dirDB = setting.file_location+'\\ComicsDB'
			dirUL = setting.file_location+'\\DownloadedComics'
		}
		
	}

	if (!fs.existsSync(dirDB)) fs.mkdirSync(dirDB)
	if (!fs.existsSync(dirUL)) fs.mkdirSync(dirUL)
}

function CreateDatabase() {
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
	db.collections = new nedb({ filename: dirDB+'/collections', autoload: true })
	db.have = new nedb({ filename: dirDB+'/have', autoload: true })
}

function CheckSettings() {
	if (typeof(setting.comic_panel_theme) != 'number' || setting.comic_panel_theme < 0) setting.comic_panel_theme = 0
	if (setting.comic_panel_theme > 1) setting.comic_panel_theme = 1
	if (typeof(setting.pagination_theme) != 'number' || setting.pagination_theme < 0) setting.pagination_theme = 0
	if (setting.pagination_theme > 1) setting.pagination_theme = 1
	if (typeof(setting.offline_theme) != 'number') setting.offline_theme = 0
	if (typeof(setting.waiting_quality) != 'number') setting.waiting_quality = 1
	if (setting.waiting_quality > 2) setting.waiting_quality = 2
	else if (setting.waiting_quality < 0) setting.waiting_quality = 0
	if (typeof(setting.max_per_page) != 'number') setting.max_per_page = 18
	if (setting.max_per_page < 1) setting.max_per_page = 1
	if (typeof(setting.img_graphic) != 'number' || setting.img_graphic < 0) setting.img_graphic = 0
	if (setting.img_graphic > 1) setting.img_graphic = 1
	if (typeof(setting.notification_download_finish) != 'boolean') setting.notification_download_finish = true
	if (typeof(setting.hover_downloader) != 'boolean') setting.hover_downloader = true
	if (typeof(setting.lazy_loading) != 'boolean') setting.lazy_loading = true
	if (setting.lazy_loading == false) imageLazyLoadingOptions.rootMargin = "0px 0px 1200px 0px"
	if (typeof(setting.tabs_limit) != 'number') setting.tabs_limit = 32
	if (setting.tabs_limit < 1) setting.tabs_limit = 1
	if (typeof(setting.search_speed) != 'number') setting.search_speed = 2
	if (setting.search_speed > 3) setting.search_speed = 3
	else if (setting.search_speed < 0) setting.search_speed = 0
	if (typeof(setting.download_limit) != 'number') setting.download_limit = 5
	if (setting.download_limit < 1) setting.download_limit = 1
	if (typeof(setting.developer_mode) != 'boolean') setting.developer_mode = false
	if (setting.developer_mode == true) {
		window.addEventListener('keydown', e => {
			if (e.ctrlKey && e.shiftKey && e.which == 73) remote.getCurrentWebContents().toggleDevTools()
			else if (e.ctrlKey && e.which == 82) remote.getCurrentWebContents().reload()
		})
	}
}

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
	const tabPosId = draggable.getAttribute('pi')
	if (afterElement == null) {
		tabsContainer.append(draggable)
		if (tabsPos[tabsPos.length - 1] != tabPosId) {
			const tabPosIndex = tabsPos.indexOf(tabPosId)
			tabsPos.splice(tabPosIndex, 1)
			tabsPos.push(tabPosId)
			tabsPosParent.splice(tabPosIndex, 1)
			tabsPosParent.push(null)
		}
	} else {
		tabsContainer.insertBefore(draggable, afterElement)
		const afterTabIndex = tabsPos.indexOf(afterElement.getAttribute('pi'))
		if (tabsPos[afterTabIndex - 1] != tabPosId) {
			const tabPosIndex = tabsPos.indexOf(tabPosId)
			tabsPos.splice(tabPosIndex, 1)
			tabsPos.splice(afterTabIndex, 0, tabPosId)
			tabsPosParent.splice(tabPosIndex, 1)
			tabsPosParent.splice(afterTabIndex, 0, null)
		}
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

// Database Main Stuff
const insert_index = async(id) => {
	await db.index.insert({ i:1, _id:id }, (err) => { if (err) error(err) })
}

const update_index = async(index, id) => {
	await db.index.update({_id:id}, { $set: {i:(index+1)} }, {}, (err) => {
		if (err) error(err)
	})
}

const fix_index = async(id, updateLast) => {
	if (id == undefined) return
	updateLast = updateLast || false
	switch (id) {
		case 1:
			db.comics.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 1)
					if (updateLast == true) lastComicId = neededId + 1
				} else {
					update_index(0, 1)
					if (updateLast == true) lastComicId = 1
				}
			})
			break
		case 2:
			db.artists.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 2)
				}
			})
			break
		case 4:
			db.tags.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 4)
				}
			})
			break
		case 6:
			db.groups.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 6)
				}
			})
			break
		case 8:
			db.parodies.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 8)
				}
			})
			break
		case 10:
			db.collections.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 10)
				}
			})
			break
		case 11:
			db.have.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 11)
					if (updateLast == true) lastHaveId = neededId + 1
				} else {
					update_index(0, 11)
					if (updateLast == true) lastHaveId = 1
				}
			})
			break
	}
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
	// tags
	await count_index(4)
	// groups
	await count_index(6)
	// parodies
	await count_index(8)
	// collections
	await count_index(10)
	// have
	await count_index(11)
}

// Image Loading
function preloadImage(img) {
	const src = img.getAttribute('data-src')
	img.removeAttribute('data-src')
	if (!src) return
	img.src = src
}

function ObserverFunction(entries, imageLoadingObserver) {
	entries.forEach(entry => {
		if (!entry.isIntersecting)
			return

		preloadImage(entry.target)
		imageLoadingObserver.unobserve(entry.target)
	})
}

var imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)