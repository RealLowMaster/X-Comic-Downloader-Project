const { remote } = require('electron')
const fs = require('fs')
path = require('path')
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
const loading = new Loading(14)
const comicGroupsContainer = document.getElementById('c-p-g')
const comicArtistsContainer = document.getElementById('c-p-a')
const comicParodyContainer = document.getElementById('c-p-p')
const comicTagsContainer = document.getElementById('c-p-ts')
const bjp = document.getElementById('browser-jump-page-container')
const bjp_i = document.getElementById('bjp-i')
const bjp_m_p = document.getElementById('bjp-m-p')
var setting, dirDB, dirUL, tabs = [], db = {}, downloadingList = [], downloadCounter = 0, thisSite, lastComicId, lastHaveId, lastGroupId, lastArtistId, lastParodyId, lastTagId, searchTimer, needReload = true, activeTabComicId = null, activeTabIndex = null, wt_fps

// Needable Functions
function fileExt(str) {
	var base = new String(str).substring(str.lastIndexOf('.') + 1)
	return base
}

function lastSlash(str, backSlasg) {
	backSlasg = backSlasg || '/'
	const base = new String(str).substring(str.lastIndexOf(backSlasg) + 1)
	return base
}

function select(who, value) {
	var parent = who.parentElement.parentElement
	var overflow = parent.getElementsByTagName('div')[1]
	var text = who.textContent

	parent.getElementsByTagName('div')[0].textContent = text
	overflow.style.display = 'none'
	overflow.querySelector(`[onclick="select(this, ${parent.getAttribute('value')})"]`).removeAttribute('active')
	parent.setAttribute('value', value)
}

function openSelect(who) {
	var overflows = document.getElementsByClassName('input-row-selector-overflow')
	for (var i = 0; i < overflows.length; i++) {
		overflows[i].style.display = 'none'
	}
	var overflow = who.getElementsByTagName('div')[1]
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
	var value = who.value

	if (value > max)
		who.value = max
	else if (value < 1)
		who.value = 1
}

function getJSON(src) {
	var xmlHttp = null

	xmlHttp = new XMLHttpRequest()
	xmlHttp.open("GET", src, false)
	xmlHttp.send(null)
	var obj = JSON.parse(xmlHttp.responseText)
	return obj
}

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

function MakeJsonString(json) {
	return JSON.stringify(json).replace(/,/g, ',\n\t').replace(/{/g, '{\n\t').replace(/}/g, '\n}').replace(/":/g, '": ')
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

// Main Loading Stuff
const dirRoot = path.join(__dirname).replace('\\app.asar', '')
delete path

function GetSettingFile() {
	if (!fs.existsSync(dirRoot+'/setting.json')) {
		setting = defaultSetting
		fs.writeFileSync(dirRoot+'/setting.json', MakeJsonString(setting), {encoding:"utf8"})
	} else {
		setting = getJSON(dirRoot+'/setting.json')
	}	
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
	db.playlist = new nedb({ filename: dirDB+'/playlist', autoload: true })
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
			if (e.ctrlKey && e.shiftKey && e.which == 73)
				remote.getCurrentWebContents().toggleDevTools()
			else if (e.ctrlKey && e.which == 82)
				remote.getCurrentWebContents().reload()
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
			db.playlist.find({}, (err, doc) => {
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
	// playlist
	await count_index(10)
	// have
	await count_index(11)
}

// Image Loading
function preloadImage(img) {
	const src = img.getAttribute('data-src')
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

// Comics
function loadComics(page, search) {
	page = page || 1
	search = search || null
	if (search == 'null') search = null
	var RegSearch
	if (search != null) {
		search = search.toLowerCase()
		RegSearch = new RegExp(search)
	}
	const comic_container = document.getElementById('comic-container')
	comic_container.innerHTML = ''
	comic_container.setAttribute('page', page)
	var min = 0, max, allPages, id, name, image, repair, html = ''
	const max_per_page = setting.max_per_page

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
			repair = doc[i].m || null
			image = doc[i].i || null
			if (repair == null || repair.length == 0)
				image = `${dirUL}/${image}-0.${doc[i].f[0][2]}`
			else {
				if (repair.indexOf(0) > -1)
					image = 'Image/no-img-300x300.png'
				else
					image = `${dirUL}/${image}-0.${doc[i].f[0][2]}`
			}
				
			html += `<div class="comic" onclick="openComic(${id})"><img src="${image}" loading="lazy"><span>${doc[i].c}</span><p>${name}</p></div>`
		}
		comic_container.innerHTML = html
		
		// Pagination
		if (allPages > 1) {
			document.getElementById('offline-search-form').style.display = 'flex'
			document.getElementById('jump-page-container').style.display = 'inline-block'
			const jp_i = document.getElementById('jp-i')
			jp_i.setAttribute('oninput', `inputLimit(this, ${allPages});searchComics(document.getElementById('offline-search-form-input').value, Number(this.value))`)
			jp_i.value = page
			document.getElementById('jp-m-p').textContent = allPages
			var thisPagination = pagination(allPages, page)
				html = '<div>'
				for (var i in thisPagination) {
					if (thisPagination[i][1] == null)
						html += `<button disabled>${thisPagination[i][0]}</button>`
					else
						html += `<button onclick="loadComics(${thisPagination[i][1]}, '${search}')">${thisPagination[i][0]}</button>`
				}
				html += '</div>'
				document.getElementById('pagination').innerHTML = html
				document.getElementById('pagination').style.display = 'block'
		} else {
			if (search == null) document.getElementById('offline-search-form').style.display = 'none'
			document.getElementById('pagination').style.display = 'none'
			document.getElementById('jump-page-container').style.display = 'none'
		}
		
		if (doc.length == 0 && search != null)
			comic_container.innerHTML = '<br><div class="alert alert-danger">No Comic has been Found.</div>'
		else if (doc.length == 0 && search == null)
			comic_container.innerHTML = '<br><div class="alert alert-danger">There is no Comic Downloaded.</div>'
	}

	const findComicsBySearch = async() => {
		await db.comics.find({n:RegSearch}).sort({_id:-1}).exec((err, doc) => {
			if (err) { error(err); return }
			working(doc)
			document.getElementById('comics-counter').textContent = 'Comics: '+doc.length
		})
	}

	const findComics = async() => {
		await db.comics.find({}).sort({_id:-1}).exec((err, doc) => {
			if (err) { error(err); return }
			working(doc)
			document.getElementById('comics-counter').textContent = 'Comics: '+doc.length
		})
	}

	if (search == null)
		findComics()
	else
		findComicsBySearch()
}

function pagination(total_pages, page) {
	var arr = [], min = 1, max = 1, bdot = false, fdot = false, bfirst = false, ffirst = false, pagination_width = 5
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

function searchComics(value, page) {
	var search_speed
	if (page == undefined) {
		switch (setting.search_speed) {
			case 0:
				search_speed = 0
				break
			case 1:
				search_speed = 300
				break
			case 2:
				search_speed = 700
				break
			case 3:
				search_speed = 1000
				break
		}
	}

	clearTimeout(searchTimer)
	if (value.length > 0) {
		if (search_speed == 0) {
			loadComics(1, value)
		} else {
			searchTimer = setTimeout(() => {
				loadComics(1, value)
			}, search_speed)
		}
	} else if (page != undefined) {
		page = page || 1
		searchTimer = setTimeout(() => {
			loadComics(page, value)
		}, 330)
	} else loadComics(1, null)
}

function reloadLoadingComics() {
	var page = Number(document.getElementById('comic-container').getAttribute('page')) || null
	var search = document.getElementById('offline-search-form-input').value || null
	if (search == null || search.length == 0) search = null
	loadComics(page, search)
}

function openComicGroups(comicId) {
	db.comic_groups.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicGroup: '+err); return }
		if (doc != undefined) {
			const groups = doc.t || null
			if (groups == null) return
			comicGroupsContainer.innerHTML = 'Groups: '
			for (var i in groups) {
				db.groups.findOne({_id:groups[i]}, (err, doc) => {
					if (err) { error(err); return }
					comicGroupsContainer.innerHTML += `<button>${doc.n}</button>`
				})
			}
		}
	})
}

function openComicArtists(comicId) {
	db.comic_artists.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicArtist: '+err); return }
		if (doc != undefined) {
			const artists = doc.t || null
			if (artists == null) return
			comicArtistsContainer.innerHTML = 'Artists: '
			for (var i in artists) {
				db.artists.findOne({_id:artists[i]}, (err, doc) => {
					if (err) { error(err); return }
					comicArtistsContainer.innerHTML += `<button>${doc.n}</button>`
				})
			}
		}
	})
}

function openComicParodies(comicId) {
	db.comic_parodies.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicParody: '+err); return }
		if (doc != undefined) {
			const parodies = doc.t || null
			if (parodies == null) return
			comicParodyContainer.innerHTML = 'Parody: '
			for (var i in parodies) {
				db.parodies.findOne({_id:parodies[i]}, (err, doc) => {
					if (err) { error(err); return }
					comicParodyContainer.innerHTML += `<button>${doc.n}</button>`
				})
			}
		}
	})
}

function openComicTags(comicId) {
	db.comic_tags.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('OpenComicTag: '+err); return }
		if (doc != undefined) {
			const tags = doc.t || null
			if (tags == null) return
			comicTagsContainer.innerHTML = 'Tags: '
			for (var i in tags) {
				db.tags.findOne({_id:tags[i]}, (err, doc) => {
					if (err) { error(err); return }
					comicTagsContainer.innerHTML += `<button>${doc.n}</button>`
				})
			}
		}
	})
}

function openComic(id) {
	id = id || null
	if (id == null) { error('Id Can\'t be Null.'); return }
	var title_container = document.getElementById('c-p-t')
	
	var image_container = document.getElementById('c-p-i')
	var name, image, ImagesCount, formats, formatIndex = 0, html = ''

	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	title_container.textContent = ''
	image_container.innerHTML = ''

	const findComic = async() => {
		await db.comics.findOne({_id:Number(id)}, (err, doc) => {
			if (err) { error(err); return }
			name = doc.n || null
			if (name == null) return
			ImagesCount = doc.c || null
			if (ImagesCount == null) return
			formats = doc.f || null
			if (formats == null) return
			image = doc.i

			title_container.textContent = name

			var lastIndex = formats[0][1]
			var thisForamat = formats[0][2]
			var repair = doc.m || null
			if (repair == null || repair.length == 0) {
				for (var i = 0; i < ImagesCount; i++) {
					if (i <= lastIndex)
						html += `<img data-src="${dirUL}/${image}-${i}.${thisForamat}">`
					else {
						formatIndex++
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
						html += `<img data-src="${dirUL}/${image}-${i}.${thisForamat}">`
					}
				}
			} else {
				for (var i = 0; i < ImagesCount; i++) {
					if (repair.indexOf(i) > -1) {
						html += `<div class="repair-image" id="${i}"><p>Image hasn't Been Download Currectly.</p><button onclick="repairImage(${i}, ${repair.indexOf(i)}, ${image})">Repair</button></div>`
					} else {
						if (i <= lastIndex)
							html += `<img data-src="${dirUL}/${image}-${i}.${thisForamat}">`
						else {
							formatIndex++
							lastIndex = formats[formatIndex][1]
							thisForamat = formats[formatIndex][2]
							html += `<img data-src="${dirUL}/${image}-${i}.${thisForamat}">`
						}
					}
				}
			}
			image_container.innerHTML = html

			const LoadingImages = image_container.getElementsByTagName('img')

			for (let i = 0; i < LoadingImages.length; i++) {
				imageLoadingObserver.observe(LoadingImages[i])
			}

			openComicGroups(Number(id))
			openComicArtists(Number(id))
			openComicParodies(Number(id))
			openComicTags(Number(id))
			comicPanel.style.display = 'block'
			comicPanel.scrollTop = 0
		})
	}

	comicPanel.setAttribute('cid', id)
	findComic()
}

function closeComicPanel() {
	var title_container = document.getElementById('c-p-t')
	var image_container = document.getElementById('c-p-i')

	comicPanel.style.display = 'none'

	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	title_container.textContent = ''
	image_container.innerHTML = ''

	comicPanel.setAttribute('cid', null)
	comicPanel.setAttribute('sid', null)
}

async function repairImageUpdateDatabase(comic_id, imageIndex, imageBaseName, imageFormat, repairIndex, passRepair, passRepairURLs) {
	var newRepair = [], newRepairURLs = [], rawRepair = 0, rawRepairURLs = 0

	for (var j in passRepair) {
		if (passRepair != null && j != repairIndex) rawRepair++
	}
	for (var j in passRepairURLs) {
		if (passRepairURLs != null && j != repairIndex) rawRepairURLs++
	}

	for (var i in passRepair) {
		if (i != repairIndex)
			newRepair.push(passRepair[i])
		else {
			if (rawRepair == 0)
				newRepair = null
			else {
				if (i != passRepair.length - 1) newRepair.push(null)
			}
		}
	}
	for (var i in passRepairURLs) {
		if (i != repairIndex)
			newRepairURLs.push(passRepairURLs[i])
		else {
			if (rawRepairURLs == 0)
				newRepairURLs = null
			else {
				if (i != passRepairURLs.length - 1) newRepairURLs.push(null)
			}
		}
	}

	await db.comics.update({_id:comic_id}, { $set: {m:newRepair, r:newRepairURLs} }, {}, err => {
		if (err) { error(err); return }
		var repairElement = document.getElementById(imageIndex) || null
		if (repairElement != null) {
			var newImage = document.createElement('img')
			newImage.setAttribute('src', `${dirUL}/${imageBaseName}-${imageIndex}.${imageFormat}`)
			document.getElementById('c-p-i').insertBefore(newImage, repairElement)
			repairElement.remove()
		}
	})
}

async function repairImageFindDatabase(comic_id, repairIndex, imageFormat, imageIndex) {
	await db.comics.findOne({_id:comic_id}, (err, doc) => {
		if (err) { error(err); return }
		repairImageUpdateDatabase(comic_id, imageIndex, doc.i, imageFormat, repairIndex, doc.m, doc.r)
	})
}

async function repairImageDownloadImage(comic_id, imageIndex, imageUrl, repairIndex, imageId) {
	var imageFormat = fileExt(imageUrl)
	var saveName = `${imageId}-${imageIndex}.${imageFormat}`
	var option = {
		url: imageUrl,
		dest: dirUL+`/${saveName}`
	}

	await ImageDownloader.image(option).then(({ filename }) => {
		repairImageFindDatabase(comic_id, repairIndex, imageFormat, imageIndex)
	}).catch((err) => {
		PopAlert('Sorry There is a Problem in Repairing Image, Please check Internet Connection.<br>'+err, 'danger')
		document.getElementById(imageIndex).innerHTML = `<p>Image hasn't Been Download Currectly.</p><button onclick="repairImage(${imageIndex}, ${repairIndex}, ${imageId})">Repair</button>`
	})
}

async function repairImage(imageIndex, repairIndex, imageId) {
	const comic_id = Number(comicPanel.getAttribute('cid'))
	var repairElement = document.getElementById(imageIndex)
	repairElement.innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
	await db.comics.findOne({_id:comic_id}, (err, doc) => {
		if (err) { error(err); return }
		var imageUrl = doc.r || null
		if (imageUrl == null) { error('Image Url Is Missed!'); return }
		imageUrl = imageUrl[repairIndex]
		if (imageUrl == null) { error('Image Url Is Missed!'); return }
		repairImageDownloadImage(comic_id, imageIndex, imageUrl, repairIndex, imageId)
	})
}

async function repairComicInfo(whitch) {
	whitch = whitch || 0
	var id = Number(comicPanel.getAttribute('cid'))
	await db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc.s == undefined) return
		if (doc.s == undefined) return
		eval(sites[doc.s][1].replace('{id}', `'${doc.p}'`).replace('{whitch}', whitch))
	})
}

// Browser
function closeBrowser() {
	imageLazyLoadingOptions.root = comicPanel
	imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)
	needReload = true
	reloadLoadingComics()
	document.getElementById('browser').style.display = 'none'
	thisSite = null
	activeTabIndex = null
	activeTabComicId = null
	tabs = []
	const browser_pages = pageContainer.children
	for (let i = 0; i < browser_pages.length; i++) {
		var passImageCon = browser_pages[i].querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			var passImages = passImageCon.children
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
			for (var i = 0; i < tabs.length; i++) {
				tabs[i].style.width = tabWidth+'px'
			}
		} else {
			for (var i = 0; i < tabs.length; i++) {
				tabs[i].style.width = '200px'
			}
		}
	}
}

window.onresize = () => { updateTabSize() }

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

	document.getElementById('browser-tool-search-input').value = who.getAttribute('s')
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

function createNewTab(history) {
	if (IsTabsAtLimit()) return null

	history = history || null
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

	tabs[tabIndex] = new Tab(newTabId, 0, '', 0, 1, 0, true)
	tabs[tabIndex].history.push(history)
	page.setAttribute('class', 'browser-page')
	page.setAttribute('id', newTabId)
	tabsContainer.appendChild(element)
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

function removeTab(id) {
	const removingTab = tabsContainer.querySelector(`[pi="${id}"]`)
	tabs[Number(removingTab.getAttribute('ti'))] = null
	const btabs = tabsContainer.children
	const index = Array.prototype.slice.call(btabs).indexOf(removingTab)

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
		if (index == 0) {
			if (1 <= btabs.length - 1) activateTab(btabs[1])
		} else if (btabs[index + 1] != undefined) activateTab(btabs[index + 1])
		else activateTab(btabs[index - 1])
	}

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
	var counter = 1
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
	var downloader = document.getElementById('downloader')
	downloader.style.display = 'block'
	var element = document.createElement('div')
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
	var option = {
		url: url,
		dest: dirUL+`/${saveName}`
	}
	
	downloadingList[index][0] += 1
	var max = downloadingList[index][1].length
	var percentage = (100 / max) * downloadingList[index][0]
	var downloaderRow = document.getElementById(`${downloadingList[index][2]}`)

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
			for (var j = 1; j < downloadingList[index][1].length; j++) {
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
		} else
			comicDownloader(index, result, quality, siteIndex)
	}).catch(err => {
		if (downloadingList[index] == undefined) return
		downloaderRow.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.width = percentage+'%'
		downloaderRow.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent = `(${downloadingList[index][0]}/${max})`
		downloadingList[index][4].push(downloadingList[index][0] - 1)
		downloadingList[index][5].push(downloadingList[index][1][downloadingList[index][0] - 1])
		if (downloadingList[index][0] == max) {
			var formatList = [], firstIndex = 0, lastIndex = 0
			var thisFormat = fileExt(downloadingList[index][1][0])
			for (var j = 1; j < downloadingList[index][1].length; j++) {
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
		} else
			comicDownloader(index, result, quality, siteIndex)
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
		remote.getCurrentWindow().removeAllListeners()
		remote.app.quit()
	}
}

function IsDownloading(id) {
	var arr = []
	for (var i in downloadingList) {
		if (downloadingList[i] != null) arr.push(downloadingList[i][3])
	}

	if (arr.indexOf(id) > -1)
		return true
	else
		return false
}

function browserError(err, id) {
	const page = document.getElementById(id)
	const tabArea = tabsContainer.querySelector(`[pi="${id}"]`).getElementsByTagName('span')[0]

	page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="tabs[activeTabIndex].reload()">Reload</button>`
	tabArea.innerHTML = '*Error*'
}

function searchFilter(txt, database, alert) {
	txt = txt.toLowerCase()
	var counter = 0
	const datas = database.children
	if (txt.length > 0) {
		for (let i = 0; i < datas.length; i++) {
			if (datas[i].textContent.toLowerCase().indexOf(txt) > -1) {
				datas[i].style.display = 'inline-block'
				counter++
			} else
				datas[i].style.display = 'none'
		}
		if (counter > 0)
			alert.style.display = 'none'
		else
			alert.style.display = 'block'
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
			if (downloaded == true)
				downloadedCallback(parent, btn)
			else
				haveCallback(parent, btn, id)
		}
	})
}

function clearDownloadedComics(content, site) {
	switch (site) {
		case 0:
			const postContainers = content.getElementsByClassName('xlecx-post-container')
			for (let i = 0; i < postContainers.length; i++) {
				var mainComics = postContainers[i].children
				for (let j = 0; j < mainComics.length; j++) {
					var id = mainComics[j].getElementsByTagName('button')[0]
					if (id != undefined) {
						id = id.getAttribute('cid')
						removeDownloadedComicsDownloadButton(0, id, mainComics[j], mainComics[j].getElementsByTagName('button')[0], (parent, btn, lastId) => {
							btn.remove()
							var element = document.createElement('button')
							element.setAttribute('cid', lastId)
							element.classList.add('comic-had')
							element.textContent = 'Had'
							parent.appendChild(element)
						}, (parent, btn) => {
							btn.remove()
							var element = document.createElement('button')
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
	} else
		tabs[activeTabIndex].s = ''
})

// Add Comic To Have
async function CreateHaveInsert(site, id, index, downloaded) {
	downloaded = downloaded || false
	const insertInfo = {}
	insertInfo.s = site
	insertInfo.i = id
	if (downloaded == true) insertInfo.d = 0
	insertInfo._id = index
	await db.have.insert(insertInfo, err => {
		if (err) { error(err); return }
		fix_index(11)
	})
}

async function CreateHave(site, id, index, downloaded) {
	index = index || null
	downloaded = downloaded || false

	if (index != null) {
		CreateHaveInsert(site, id, index, downloaded)
	} else {
		await db.index.findOne({_id:11}, (err, doc) => {
			if (err) { error(err); return }
			const haveIndex = doc.i
			CreateHaveInsert(site, id, haveIndex, downloaded)
		})
	}
}

function AddToHave(site, id) {
	CreateHave(site, id, lastHaveId, false)
	lastHaveId++
	const page = document.getElementById(activeTabComicId)
	page.getElementsByClassName('browser-comic-have')[0].innerHTML = `<button class="remove-from-have" onclick="RemoveFromHave(0, '${id}', this)">You Have This Comic.</button>`
	changeButtonsToDownloaded(id, true, false)
	PopAlert('Comic Added To Have List.')
}

function RemoveFromHave(site, id, who) {
	who = who || null
	db.have.remove({s:site, i:id}, {}, (err, num) => {
		if (err) { error(err); return }
		if (num == 1) {
			if (who != null) {
				const parent = who.parentElement
				parent.innerHTML = `<button onclick="xlecxDownloader('${id}')">Download</button><button class="add-to-have" onclick="AddToHave(${site}, '${id}')">Add To Have</button>`
			}
			changeButtonsToDownloaded(id, true, true)
			PopAlert('Comic Removed From Have List.')
		}
	})
}

// Check That We Have Comic Or Not
function IsHavingComic(site, id, callback) {
	db.have.findOne({s:site, i:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc == null)
			callback(false, false)
		else {
			if (doc.d != null && doc.d == 0)
				callback(true, true)
			else
				callback(true, false)
		}
	})
}

// Add New Groups
function UpdateGroupList(comicId, newList) {
	db.comic_groups.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('GroupListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_groups.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('GroupListUpdate: '+err); return }
			})
		} else CreatGroupList(comicId, newList)
		openComicGroups(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Groups Has Been Repaired!')
	})
}

function CreatGroupList(comicId, newList) {
	db.comic_groups.insert({t:newList, _id:comicId}, err => {
		if (err) { error('GroupList: '+err); return }
	})
}

function AddGroupToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatGroupList(comicId, newList)
	else UpdateGroupList(comicId, newList)
}

function CreateGroupInsert(tagName, index, callback) {
	db.groups.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateGroup(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.groups.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(6)
				AddGroupToList(comicId, newList, repairing)
			} else CreateGroup(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastGroupId++
			CreateGroupInsert(tagList[tagListIndex], lastGroupId - 1, (err, newDoc) => {
				if (err) { error('Group: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(6)
					AddGroupToList(comicId, newList, repairing)
				} else CreateGroup(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Artist
function UpdateArtistList(comicId, newList) {
	db.comic_artists.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('ArtistListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_artists.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('ArtistListUpdate: '+err); return }
			})
		} else CreatArtistList(comicId, newList)
		openComicArtists(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Artists Has Been Repaired!')
	})
}

function CreatArtistList(comicId, newList) {
	db.comic_artists.insert({t:newList, _id:comicId}, err => {
		if (err) { error('ArtistList: '+err); return }
	})
}

function AddArtistToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatArtistList(comicId, newList)
	else UpdateArtistList(comicId, newList)
}

function CreateArtistInsert(tagName, index, callback) {
	db.artists.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateArtist(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.artists.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(2)
				AddArtistToList(comicId, newList, repairing)
			} else CreateArtist(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastArtistId++
			CreateArtistInsert(tagList[tagListIndex], lastArtistId - 1, (err, newDoc) => {
				if (err) { error('Artist: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(2)
					AddArtistToList(comicId, newList, repairing)
				} else CreateArtist(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Parody
function UpdateParodyList(comicId, newList) {
	db.comic_parodies.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('ParodyListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_parodies.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('ParodyListUpdate: '+err); return }
			})
		} else CreatParodyList(comicId, newList)
		openComicParodies(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Parodies Has Been Repaired!')
	})
}

function CreatParodyList(comicId, newList) {
	db.comic_parodies.insert({t:newList, _id:comicId}, err => {
		if (err) { error('ParodyList: '+err); return }
	})
}

function AddParodyToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatParodyList(comicId, newList)
	else UpdateParodyList(comicId, newList)
}

function CreateParodyInsert(tagName, index, callback) {
	db.parodies.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateParody(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.parodies.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(8)
				AddParodyToList(comicId, newList, repairing)
			} else CreateParody(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastParodyId++
			CreateParodyInsert(tagList[tagListIndex], lastParodyId - 1, (err, newDoc) => {
				if (err) { error('Parody: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(8)
					AddParodyToList(comicId, newList, repairing)
				} else CreateParody(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Tag
function UpdateTagList(comicId, newList) {
	db.comic_tags.findOne({_id:comicId}, (err, doc) => {
		if (err) { error('TagListUpdateCheck: '+err); return }
		if (doc != undefined) {
			db.comic_tags.update({_id:comicId}, { $set: {t:newList} }, {}, (err) => {
				if (err) { error('TagListUpdate: '+err); return }
			})
		} else CreatTagList(comicId, newList)
		openComicTags(comicId)
		loading.forward()
		loading.hide()
		PopAlert('Comic Tags Has Been Repaired!')
	})
}

function CreatTagList(comicId, newList) {
	db.comic_tags.insert({t:newList, _id:comicId}, err => {
		if (err) { error('TagList: '+err); return }
	})
}

function AddTagToList(comicId, newList, repairing) {
	repairing = repairing || false
	if (repairing == false) CreatTagList(comicId, newList)
	else UpdateTagList(comicId, newList)
}

function CreateTagInsert(tagName, index, callback) {
	db.tags.insert({n:tagName.toLowerCase(), _id:index}, callback)
}

function CreateTag(tagList, comicId, tagListIndex, repairing, newList) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	db.tags.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num != undefined) {
			newList.push(num._id)
			if (tagListIndex == tagList.length - 1) {
				fix_index(4)
				AddTagToList(comicId, newList, repairing)
			} else CreateTag(tagList, comicId, tagListIndex + 1, repairing, newList)
		} else {
			lastTagId++
			CreateTagInsert(tagList[tagListIndex], lastTagId - 1, (err, newDoc) => {
				if (err) { error('Tag: '+err); return }
				newList.push(newDoc._id)
				if (tagListIndex == tagList.length - 1) {
					fix_index(4)
					AddTagToList(comicId, newList, repairing)
				} else CreateTag(tagList, comicId, tagListIndex + 1, repairing, newList)
			})
		}
	})
}

// Add New Comic
async function CreateComic(comicIndex, haveIndex, gottenResult, quality, image, siteIndex, comic_id, imagesCount, formats, repair, repairURLs, index, isDownloading) {
	if (typeof(index) != 'number') index = null
	isDownloading = isDownloading || false
	const insertInfo = {}

	insertInfo.n = gottenResult.title.toLowerCase()
	insertInfo.i = image
	insertInfo.c = imagesCount
	insertInfo.f = formats
	if (repair != null && repair.length > 0) insertInfo.m = repair
	if (repairURLs != null && repairURLs.length > 0) insertInfo.r = repairURLs
	insertInfo.q = quality
	insertInfo.s = siteIndex
	insertInfo.p = comic_id
	insertInfo._id = comicIndex
	await db.comics.insert(insertInfo, (err, doc) => {
		if (err) { error(err); return }
		fix_index(1)
		const id = doc._id
		const groups = gottenResult.groups || null
		const artists = gottenResult.artists || null
		const parody = gottenResult.parody || null
		const tags = gottenResult.tags || null

		// Add Comic To Have
		CreateHave(doc.s, doc.p, haveIndex, true)

		// Groups
		if (groups != null) {
			const groupsList = []
			for (var i in groups) {
				groupsList.push(groups[i].name)
			}
			CreateGroup(groupsList, id)
		}

		// Artists
		if (artists != null) {
			const artistsList = []
			for (var i in artists) {
				artistsList.push(artists[i].name)
			}
			CreateArtist(artistsList, id)
		}

		// Parody
		if (parody != null) {
			const parodyList = []
			for (var i in parody) {
				parodyList.push(parody[i].name)
			}
			CreateParody(parodyList, id)
		}

		// Tags
		if (tags != null) {
			const tagsList = []
			for (var i in tags) {
				tagsList.push(tags[i].name)
			}
			CreateTag(tagsList, id)
		}

		if (isDownloading == true && index != null) {
			var shortName = gottenResult.title
			if (shortName.length > 26) shortName = shortName.substr(0, 23)+'...'
			PopAlert(`Comic (${shortName}) Downloaded.`)
			if (setting.notification_download_finish == true && remote.Notification.isSupported()) new remote.Notification({title: 'Comic Download Finished.', body: gottenResult.title}).show()
			document.getElementById(downloadingList[index][2]).remove()
			downloadingList[index] = null
			changeButtonsToDownloaded(doc.p, false, false)
			downloadCounter--
			SetDownloadListNumbers()
			if (downloadCounter == 0) {
				downloadingList = []
				document.getElementById('downloader').style.display = 'none'
			}
		}
		if (needReload == true) reloadLoadingComics()
	})
}

// Delete a Comic
function deleteComic(id) {
	const errors = document.getElementsByClassName('error')
	for (let i = 0; i < errors.length; i++) {
		errors[i].remove()
	}
	document.getElementById('comic-action-panel').style.display='none'
	closeComicPanel()

	loading.reset(8)
	loading.show('Removing Comic From Database...')

	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { loading.hide(); error(err); return }
		if (doc == undefined) { loading.hide(); error('Comic Not Found.'); return }
		const ImagesId = doc.i
		const ImagesFormats = doc.f
		const ImagesCount = doc.c
		const repair = doc.m || null
		var repairImagesURLs = null
		const site = doc.s
		const post_id = doc.p

		if (repair != null && repair.length > 0) repairImagesURLs = doc.r

		const fix_removed_index = () => {
			fix_index(1, true)
			fix_index(11, true)
			loading.forward()
			loading.hide()
			PopAlert('Comic Deleted.', 'warning')
			reloadLoadingComics()
		}

		const remove_have = () => {
			db.have.remove({s:site, i:post_id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Fix Indexs...')
				fix_removed_index()
			})
		}

		const remove_tags = () => {
			db.comic_tags.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Have From Database...')
				remove_have()
			})
		}

		const remove_parodies = () => {
			db.comic_parodies.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Tags From Database...')
				remove_tags()
			})
		}

		const remove_artists = () => {
			db.comic_artists.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Parodies From Database...')
				remove_parodies()
			})
		}

		const remove_groups = () => {
			db.comic_groups.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Removing Comic Artists From Database...')
				remove_artists()
			})
		}

		const delete_images = () => {
			var formatIndex = 0, thisUrl
			var lastIndex = ImagesFormats[0][1]
			var thisForamat = ImagesFormats[0][2]
			if (repair == null || repair.length == 0) {
				for (var i = 0; i < ImagesCount; i++) {
					if (i <= lastIndex)
						thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
					else {
						formatIndex++
						lastIndex = ImagesFormats[formatIndex][1]
						thisForamat = ImagesFormats[formatIndex][2]
						thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
					}

					fs.unlinkSync(thisUrl)
				}
			} else {
				for (var i = 0; i < ImagesCount; i++) {
					if (repair.indexOf(i) == -1) {
						if (i <= lastIndex)
							thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
						else {
							formatIndex++
							lastIndex = ImagesFormats[formatIndex][1]
							thisForamat = ImagesFormats[formatIndex][2]
							thisUrl = `${dirUL}/${ImagesId}-${i}.${thisForamat}`
						}

						fs.unlinkSync(thisUrl)
					}
				}
			}
			loading.forward('Removing Comic Groups From Database...')
			remove_groups()
		}

		const remove_comic = () => {
			db.comics.remove({_id:id}, {}, err => {
				if (err) { loading.hide(); error(err); return }
				loading.forward('Deleting Comic Images...')
				delete_images()
			})
		}

		remove_comic()
	})
}

function askForDeletingComic(id) {
	errorSelector('Are you sure you want To Delete This Comic ?', null, false, [
		[
			"Yes",
			"btn btn-danger m-2",
			`deleteComic(${id})`
		],
		[
			"No",
			"btn btn-primary m-2"
		]
	])
}

// Setting
function changeWaitingPreview(fps) {
	const imgs = document.getElementById('waiting-preview').getElementsByTagName('img')
	imgs[0].setAttribute('src', `Image/dual-ring-success-${fps}.gif`)
}

function setLuanchTimeSettings(reloadSettingPanel) {
	reloadSettingPanel = reloadSettingPanel || false
	const s_comic_panel_theme = document.getElementById('s_comic_panel_theme')
	const s_offline_theme = document.getElementById('s_offline_theme')
	const s_waiting_quality = document.getElementById('s_waiting_quality')
	const s_pagination_theme = document.getElementById('s_pagination_theme')
	const s_img_graphic = document.getElementById('s_img_graphic')
	const s_search_speed = document.getElementById('s_search_speed')
	const s_file_location = document.getElementById('s_file_location')

	s_comic_panel_theme.setAttribute('value', setting.comic_panel_theme)
	s_offline_theme.setAttribute('value', setting.offline_theme)	
	s_pagination_theme.setAttribute('value', setting.pagination_theme)
	s_img_graphic.setAttribute('value', setting.img_graphic)
	s_search_speed.setAttribute('value', setting.search_speed)

	s_comic_panel_theme.getElementsByTagName('div')[0].textContent = s_comic_panel_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.comic_panel_theme})"]`).textContent
	s_offline_theme.getElementsByTagName('div')[0].textContent = s_offline_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.offline_theme})"]`).textContent
	s_pagination_theme.getElementsByTagName('div')[0].textContent = s_pagination_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.pagination_theme})"]`).textContent
	s_img_graphic.getElementsByTagName('div')[0].textContent = s_img_graphic.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.img_graphic})"]`).textContent
	s_search_speed.getElementsByTagName('div')[0].textContent = s_search_speed.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.search_speed})"]`).textContent

	const wt_passValue = s_waiting_quality.getAttribute('value') || null
	if (wt_passValue != null) s_waiting_quality.querySelector(`[cs="${wt_passValue}"]`).removeAttribute('active')
	s_waiting_quality.querySelector(`[cs="${setting.waiting_quality}"]`).setAttribute('active', '')
	wt_fps = setting.waiting_quality + 10 - setting.waiting_quality + (10 * setting.waiting_quality)
	changeWaitingPreview(wt_fps)

	s_waiting_quality.setAttribute('value', setting.waiting_quality)

	document.getElementById('s_max_per_page').value = setting.max_per_page
	document.getElementById('s_download_limit').value = setting.download_limit

	if (setting.hover_downloader == true) document.getElementById('s_hover_downloader').checked = true
	
	if (setting.notification_download_finish == true) document.getElementById('s_notification_download_finish').checked = true

	if (setting.lazy_loading == true) document.getElementById('s_lazy_loading').checked = true

	s_file_location.setAttribute('location', setting.file_location)
	const s_file_location_label = s_file_location.parentElement.parentElement.children[0]

	if (setting.file_location.match(/[\\]/g).length > 1)
		s_file_location_label.textContent = setting.file_location.substr(0,2)+'\\...\\'+lastSlash(setting.file_location, '\\')
	else
		s_file_location_label.textContent = setting.file_location
	s_file_location_label.setAttribute('title', setting.file_location)

	if (reloadSettingPanel == false) {
		if (setting.hover_downloader == false) document.getElementById('downloader').classList.add('downloader-fixed')

		if (setting.offline_theme == 1) {
			document.getElementById('setting-panel').classList.add('setting-darkmode')
			document.getElementById('site-menu').classList.add('action-menu-darkmode')
			document.getElementById('top-menu').classList.add('top-menu-darkmode')
			document.getElementById('main-body').classList.add('main-body-darkmode')
		}

		if (setting.comic_panel_theme == 1) comicPanel.classList.add('comic-panel-darkmode')

		if (setting.pagination_theme == 1) document.getElementById('pagination').classList.add('pagination-green-mode')
	}
}

function saveSetting(justSave) {
	justSave = justSave || false
	var reload = false
	if (justSave == false) {
		const waiting_quality = Number(document.getElementById('s_waiting_quality').getAttribute('value'))
		const lazy_loading = document.getElementById('s_lazy_loading').checked
		const max_per_page = Number(document.getElementById('s_max_per_page').value)
		const file_location = document.getElementById('s_file_location').getAttribute('location')

		if (setting.waiting_quality != waiting_quality) {
			setting.waiting_quality = waiting_quality
			wt_fps = waiting_quality + 10 - waiting_quality + (10 * waiting_quality)
			const dl_imgs = document.getElementById('downloader').getElementsByTagName('img')
			for (let i = 0; i < dl_imgs.length; i++) {
				dl_imgs[i].setAttribute('src', `Image/dual-ring-success-${wt_fps}.gif`)
			}
		}

		if (setting.max_per_page != max_per_page) {
			setting.max_per_page = max_per_page
			reloadLoadingComics()
		}

		setting.comic_panel_theme = Number(document.getElementById('s_comic_panel_theme').getAttribute('value'))
		setting.offline_theme = Number(document.getElementById('s_offline_theme').getAttribute('value'))
		setting.pagination_theme = Number(document.getElementById('s_pagination_theme').getAttribute('value'))
		setting.img_graphic = Number(document.getElementById('s_img_graphic').getAttribute('value'))
		setting.search_speed = Number(document.getElementById('s_search_speed').getAttribute('value'))
		setting.hover_downloader = document.getElementById('s_hover_downloader').checked
		setting.notification_download_finish = document.getElementById('s_notification_download_finish').checked
		setting.download_limit = Number(document.getElementById('s_download_limit').value)

		if (lazy_loading != setting.lazy_loading) {
			setting.lazy_loading = lazy_loading
			if (lazy_loading == true)
				imageLazyLoadingOptions.rootMargin = "0px 0px 300px 0px"
			else
				imageLazyLoadingOptions.rootMargin = "0px 0px 1200px 0px"

			imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)
		}

		if (file_location != setting.file_location) {
			reload = true
			setting.file_location = file_location
		}

		if (setting.hover_downloader == false) document.getElementById('downloader').classList.add('downloader-fixed')
		else document.getElementById('downloader').classList.remove('downloader-fixed')

		switch (setting.offline_theme) {
			case 0:
				document.getElementById('setting-panel').classList.remove('setting-darkmode')
				document.getElementById('site-menu').classList.remove('action-menu-darkmode')
				document.getElementById('top-menu').classList.remove('top-menu-darkmode')
				document.getElementById('main-body').classList.remove('main-body-darkmode')
				break
			case 1:
				document.getElementById('setting-panel').classList.add('setting-darkmode')
				document.getElementById('site-menu').classList.add('action-menu-darkmode')
				document.getElementById('top-menu').classList.add('top-menu-darkmode')
				document.getElementById('main-body').classList.add('main-body-darkmode')
				break
		}

		switch (setting.comic_panel_theme) {
			case 0:
				comicPanel.classList.remove('comic-panel-darkmode')
				break
			case 1:
				comicPanel.classList.add('comic-panel-darkmode')
				break
		}

		switch (setting.pagination_theme) {
			case 0:
				document.getElementById('pagination').classList.remove('pagination-green-mode')
				break
			case 1:
				document.getElementById('pagination').classList.add('pagination-green-mode')
				break
		}

		PopAlert('Setting Saved.')
	}

	fs.writeFileSync(dirRoot+'/setting.json', MakeJsonString(setting), {encoding:"utf8"})
	if (reload == true)
		remote.getCurrentWindow().reload()
	else
		document.getElementById('setting-panel').style.display = 'none'
}

function closeSetting() {
	document.getElementById('setting-panel').style.display = 'none'
	setLuanchTimeSettings(true)
}

function test() {
	console.log(lastGroupId, lastArtistId, lastParodyId, lastTagId)
}

document.addEventListener("DOMContentLoaded", () => {
	loading.show('Geting Setting...', '#fff', '#222')

	GetSettingFile()
	loading.forward('Getting Directories...')
	GetDirection()
	loading.forward('Creating Databases...')
	CreateDatabase()
	loading.forward('Checking Settings...')
	CheckSettings()
	loading.forward('Set Window Event...')

	remote.getCurrentWindow().addListener('close', e => {
		e.preventDefault()
		if (downloadingList.length > 0) {
			errorSelector('You are Downloading Comics, Are you sure you want To Close Software?', null, false, [
				[
					"Yes",
					"btn btn-primary m-2",
					"cancelAllDownloads(true)"
				],
				[
					"No",
					"btn btn-danger m-2"
				]
			])
		} else {
			remote.getCurrentWindow().removeAllListeners()
			remote.app.quit()
		}
	})
	loading.forward('Indexing...')
	makeDatabaseIndexs()
	loading.forward('Comic Indexing...')
	db.index.findOne({_id:1}, (err, doc) => {
		if (err) { error('ComicIndexing: '+err); return }
		if (doc == undefined) lastComicId = 1
		else lastComicId = doc.i || null
		if (lastComicId == null) { error('Comic Indexing Problem.'); return }
		loading.forward('Have Indexing...')

		db.index.findOne({_id:11}, (err, haveDoc) => {
			if (err) { error('HaveIndexing: '+err); return }
			if (haveDoc == undefined) lastHaveId = 1
			else lastHaveId = haveDoc.i || null
			if (lastHaveId == null) { error('Have Indexing Problem.'); return }
			loading.forward('Groups Indexing...')

			db.index.findOne({_id:6}, (err, groupDoc) => {
				if (err) { error('GroupIndexing: '+err); return }
				if (groupDoc == undefined) lastGroupId = 1
				else lastGroupId = groupDoc.i || null
				if (lastGroupId == null) { error('Group Indexing Problem.'); return }
				loading.forward('Artists Indexing...')

				db.index.findOne({_id:2}, (err, artistDoc) => {
					if (err) { error('ArtistIndexing: '+err); return }
					if (artistDoc == undefined) lastArtistId = 1
					else lastArtistId = artistDoc.i || null
					if (lastArtistId == null) { error('Artist Indexing Problem.'); return }
					loading.forward('Parodies Indexing...')

					db.index.findOne({_id:8}, (err, parodyDoc) => {
						if (err) { error('ParodyIndexing: '+err); return }
						if (parodyDoc == undefined) lastParodyId = 1
						else lastParodyId = parodyDoc.i || null
						if (lastParodyId == null) { error('Parody Indexing Problem.'); return }
						loading.forward('Tags Indexing...')

						db.index.findOne({_id:4}, (err, tagDoc) => {
							if (err) { error('TagIndexing: '+err); return }
							if (tagDoc == undefined) lastTagId = 1
							else lastTagId = tagDoc.i || null
							if (lastTagId == null) { error('Tag Indexing Problem.'); return }
							loading.forward('Set Settings...')

							setLuanchTimeSettings(false)
							loading.forward('Load Comics...')
							loadComics()
							loading.forward()
							document.getElementById('main').style.display = 'grid'
							loading.hide()
						})
					})
				})
			})
		})
	})
})