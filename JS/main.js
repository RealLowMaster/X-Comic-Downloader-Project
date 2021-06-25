const fs = require('fs')
const path = require('path')
const nedb = require('nedb')
const ImageDownloader = require('image-downloader')
const { type } = require('os')
require('v8-compile-cache')
const xlecx = new XlecxAPI()
const defaultSetting = {
	"comic_panel_theme": 0,
	"post_img_container_theme": 0,
	"hover_downloader": true,
	"max_per_page": 18,
	"img_graphic": 1,
	"notification_download_finish": true,
	"lazy_loading": true,
	"developer_mode": false
}
const imageLazyLoadingOptions = {
	root: document.getElementById('browser-pages'),
	threshold: 0,
	rootMargin: "0px 0px 350px 0px"
}
const sites = [['xlecx', 'xlecxRepairComicInfoGetInfo({id}, {whitch})', 'xlecxSearch({text}, 1)', 'xlecxChangePage(1, false, true)']]
var setting, tabs = [], db = {}, downloadingList = [], repairingComics = [], thisSite

// Directions
var dirRoot = path.join(__dirname)
var dirDB = path.join(__dirname+'/db')
var dirUL = path.join(__dirname+'/Download')

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

const fix_index = async(id) => {
	if (id == undefined) return
	switch (id) {
		case 1:
			db.comics.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 1)
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
		case 3:
			db.comic_artists.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 3)
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
		case 5:
			db.comic_tags.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 5)
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
		case 7:
			db.comic_groups.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 7)
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
		case 9:
			db.comic_parodies.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					update_index(neededId, 9)
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

function inputLimit(who, max) {
	if (who == null || max == null) return
	var value = who.value

	if (value > max)
		who.value = max
	else if (value < 1)
		who.value = 1
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
if (typeof(setting.comic_panel_theme) != 'number' || setting.comic_panel_theme < 0) setting.comic_panel_theme = 0
if (setting.comic_panel_theme > 1) setting.comic_panel_theme = 1
if (typeof(setting.img_graphic) != 'number' || setting.img_graphic < 0) setting.img_graphic = 0
if (setting.img_graphic > 1) setting.img_graphic = 1
if (setting.max_per_page < 1) setting.max_per_page = 1
if (typeof(setting.max_per_page) != 'number') setting.max_per_page = 18
if (setting.img_graphic > 1) setting.img_graphic = 1
if (setting.img_graphic < 0) setting.img_graphic = 0
if (typeof(setting.notification_download_finish) != 'boolean') setting.notification_download_finish = true
if (typeof(setting.hover_downloader) != 'boolean') setting.hover_downloader = true
if (typeof(setting.lazy_loading) != 'boolean') setting.lazy_loading = true
if (setting.lazy_loading == false) imageLazyLoadingOptions.rootMargin = "0px 0px 1200px 0px"

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

// Image Loading
function preloadImage(img) {
	const src = img.getAttribute('data-src')
	if (!src)
		return
	
	img.src = src
}

const imageLoadingObserver = new IntersectionObserver((entries, imageLoadingObserver) => {
	entries.forEach(entry => {
		if (!entry.isIntersecting)
			return

		preloadImage(entry.target)
		imageLoadingObserver.unobserve(entry.target)
	})
}, imageLazyLoadingOptions)

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
	comic_container.setAttribute('page', page)
	var min = 0, max, allPages, id, name, image, pages, repair, html = ''
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
		var thisPagination = pagination(allPages, page)
		if (thisPagination.length > 0) {
			html = '<div>'
			for (var i in thisPagination) {
				if (thisPagination[i][1] == null)
					html += `<button disabled>${thisPagination[i][0]}</button>`
				else
					html += `<button onclick="loadComics(${thisPagination[i][1]}, ${search})">${thisPagination[i][0]}</button>`
			}
			html += '</div>'
			document.getElementById('pagination').innerHTML = html
			document.getElementById('pagination').style.display = 'block'
		} else {
			comic_container.innerHTML = '<br><div class="alert alert-danger">There is no Comic Downloaded.</div>'
			document.getElementById('pagination').style.display = 'none'
		}
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

function reloadLoadingComics() {
	var page = Number(document.getElementById('comic-container').getAttribute('page')) || null
	var search = ''
	loadComics(page)
}

function openComic(id) {
	id = id || null
	if (id == null) { error('Id Can\'t be Null.'); return }
	var comic_panel = document.getElementById('comic-panel')
	var title_container = document.getElementById('c-p-t')
	var groups_container = document.getElementById('c-p-g')
	var artists_container = document.getElementById('c-p-a')
	var parodies_container = document.getElementById('c-p-p')
	var tags_container = document.getElementById('c-p-ts')
	var image_container = document.getElementById('c-p-i')
	var name, image, ImagesCount, formats, formatIndex = 0, html = ''

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
						html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
					else {
						formatIndex++
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
						html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
					}
				}
			} else {
				for (var i = 0; i < ImagesCount; i++) {
					if (repair.indexOf(i) > -1) {
						html += `<div class="repair-image" id="${i}"><p>Image hasn't Been Download Currectly.</p><button onclick="repairImage(${i}, ${repair.indexOf(i)}, ${image})">Repair</button></div>`
					} else {
						if (i <= lastIndex)
							html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
						else {
							formatIndex++
							lastIndex = formats[formatIndex][1]
							thisForamat = formats[formatIndex][2]
							html += `<img src="${dirUL}/${image}-${i}.${thisForamat}" loading="lazy">`
						}
					}
				}
			}
			image_container.innerHTML = html

			findGroupRow()
			findArtistRow()
			findParodyRow()
			findTagRow()
			comic_panel.style.display = 'block'
			comic_panel.scrollTop = 0
		})
	}

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
	var comic_id = Number(document.getElementById('comic-panel').getAttribute('cid'))
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
	var id = Number(document.getElementById('comic-panel').getAttribute('cid'))
	await db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc.s == undefined) return
		if (doc.s == undefined) return
		eval(sites[doc.s][1].replace('{id}', `'${doc.p}'`).replace('{whitch}', whitch))
	})
}

// Browser
function closeBrowser() {
	document.getElementById('browser').style.display = 'none'
	thisSite = null
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

	document.getElementById('browser-tool-search-input').value = who.getAttribute('search')
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
	element.setAttribute('search', '')
	element.setAttribute('isReloading', true)
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

	document.getElementById('browser-home-btn').style.display = 'inline-block'
	document.getElementById('browser-prev-btn').style.display = 'inline-block'
	document.getElementById('browser-next-btn').style.display = 'inline-block'
	document.getElementById('browser-reload-btn').style.display = 'inline-block'
	document.getElementById('browser-tool-search-form').style.display = 'inline-block'

	updateTabSize()
	return newTabId
}

function removeTab(id) {
	var browser_tabs = document.getElementById('browser-tabs')
	var removingTab = browser_tabs.querySelector(`[pi="${id}"]`)
	tabs[Number(removingTab.getAttribute('ti'))] = null
	var btabs = browser_tabs.children
	var index = Array.prototype.slice.call(btabs).indexOf(removingTab)
	
	if (browser_tabs.getAttribute('pid') == id) {
		if (index == 0) {
			if (1 <= btabs.length - 1) {
				activateTab(btabs[1])
			}
		} else {
			activateTab(btabs[index - 1])
		}
	}

	if (btabs.length == 1) {
		document.getElementById('browser-home-btn').style.display = 'none'
		document.getElementById('browser-prev-btn').style.display = 'none'
		document.getElementById('browser-next-btn').style.display = 'none'
		document.getElementById('browser-reload-btn').style.display = 'none'
		document.getElementById('browser-tool-search-form').style.display = 'none'
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

function browserHome() {
	var browser_tabs = document.getElementById('browser-tabs')
	var tabIndex = Number(browser_tabs.querySelector(`[pi="${browser_tabs.getAttribute('pid')}"]`).getAttribute('ti'))
	if (tabs[tabIndex].history[tabs[tabIndex].history.length - 1].replace(', false)', ', true)') != sites[thisSite][3]) eval(sites[thisSite][3])
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
	var tab = browser_tabs.querySelector(`[pi="${pageId}"]`)
	if (tab.getAttribute('isReloading') == 'false') {
		tab.setAttribute('isReloading', true)
		tabs[Number(tab.getAttribute('ti'))].reload()
	}
}

function MakeDownloadList(name, id, list) {
	id = id || null
	name = name || null
	list = list || null
	if (name == null || id == null || list == null) return
	var downloader = document.getElementById('downloader')
	downloader.style.display = 'block'
	var element = document.createElement('div')
	if (name.length > 19) name = name.substr(0, 16)+'...'
	var index = downloadingList.length

	downloadingList[index] = [0, [], new Date().getTime(), [], id]
	element.setAttribute('id', downloadingList[index][2])
	element.setAttribute('i', index)
	element.innerHTML = `<span class="spin spin-sm spin-fast spin-success"></span><p>${name} <span>(0/${list.length})</span></p><div><div></div></div>`
	downloader.appendChild(element)
	downloadingList[index][1] = list

	return index
}

async function comicDownloader(index, result, quality, siteIndex) {
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
	await ImageDownloader.image(option).then(({ filename }) => {
		downloadingList[index][3][downloadingList[index][0]] = saveName
		downloaderRow.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.width = percentage+'%'
		downloaderRow.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent = `(${downloadingList[index][0]}/${max})`
		if (downloadingList[index][0] == max) {
			CreateComic(index, result, quality, downloadingList[index][3], siteIndex, downloadingList[index][4], true)
		} else {
			comicDownloader(index, result, quality, siteIndex)
		}
	}).catch(err => {
		downloadingList[index][3][downloadingList[index][0]] = [url]
		downloaderRow.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.width = percentage+'%'
		downloaderRow.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent = `(${downloadingList[index][0]}/${max})`
		if (downloadingList[index][0] == max) {
			CreateComic(index, result, quality, downloadingList[index][3], siteIndex, downloadingList[index][4], true)
		} else {
			comicDownloader(index, result, quality, siteIndex)
		}
	})
}

function checkIsDownloading(id) {
	var arr = []
	for (var i in downloadingList) {
		if (downloadingList[i] != null)
			arr.push(downloadingList[i][4])
	}

	if (arr.indexOf(id) > -1)
		return true
	else
		return false
}

function browserError(err, id) {
	var page = document.getElementById(id)
	var tabArea = document.getElementById('browser-tabs').querySelector(`[pi="${id}"]`).getElementsByTagName('span')[0]

	page.innerHTML = `<br><div class="alert alert-danger">${err}</div><button class="btn btn-primary" style="display:block;margin:3px auto" onclick="reloadTab()">Reload</button>`
	tabArea.innerHTML = '*Error*'
}

document.getElementById('browser-tool-search-form').addEventListener('submit', e => {
	e.preventDefault()
	var input = document.getElementById('browser-tool-search-input')
	var browser_tabs = document.getElementById('browser-tabs')
	var tabId = browser_tabs.getAttribute('pid')
	var checkText = input.value.replace(/ /g, '')
	if (checkText.length > 0) {
		browser_tabs.querySelector(`[pi="${tabId}"]`).setAttribute('search', input.value)
		eval(sites[thisSite][2].replace('{text}', `'${input.value}'`))
	}
})

// Add Comic To Have
async function CreateHaveInsert(site, id, index) {
	await db.have.insert({s:site, i:id, _id:index}, err => {
		if (err) { error(err); return }
		update_index(index, 11)
	})
}

async function CreateHave(site, id) {
	await db.index.findOne({_id:11}, (err, doc) => {
		if (err) { error(err); return }
		var index = doc.i
		CreateHaveInsert(site, id, index)
	})
}

function AddToHave(site, id) {
	CreateHave(site, id)
	var page = document.getElementById(document.getElementById('browser-tabs').getAttribute('pid'))
	page.getElementsByClassName('browser-comic-have')[0].innerHTML = '<span>You Have This Comic.<span>'
	PopAlert('Comic Added To Have List.')
}

// Add New Groups
async function AddGroupUpdateList(comicId, groupsList, repairing) {
	repairing = repairing || false
	if (repairing == true) {
		var newGroupList = []
		for (var i in groupsList) {
			newGroupList.push(groupsList[i][0])
		}
		await db.comic_groups.update({c:comicId}, { $set: {t:newGroupList} }, {}, (err) => {
			if (err) { error(err); return }
			PopAlert('Comic Groups Has Been Repaired!')
			var html = 'Groups: '
			for (var i in groupsList) {
				html += `<button>${groupsList[i][1]}</button>`
			}
			document.getElementById('c-p-g').innerHTML = html
		})
	} else {
		await db.comic_groups.update({c:comicId}, { $set: {t:groupsList} }, {}, (err) => {
			if (err) error(err)
		})
	}
}

async function AddGroupCreateGroupIdList(comicId, groupsList, groupsListIndex, groupstNewList, repairing) {
	groupsListIndex = groupsListIndex || 0
	groupstNewList = groupstNewList || []
	repairing = repairing || false
	await db.groups.findOne({n:groupsList[groupsListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		if (repairing == true)
			groupstNewList.push([doc._id, doc.n])
		else
			groupstNewList.push(doc._id)
		if (groupsListIndex == groupsList.length - 1)
			AddGroupUpdateList(comicId, groupstNewList, repairing)
		else
			AddGroupCreateGroupIdList(comicId, groupsList, groupsListIndex + 1, groupstNewList, repairing)
	})
}

async function AddGroupAddGroupRow(comicId, index, groupsList, repairing) {
	repairing = repairing || false
	await db.comic_groups.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		AddGroupCreateGroupIdList(comicId, groupsList, 0, [], repairing)
		fix_index(7)
	})
}

async function AddGroup(comicId, groupsList, repairing) {
	repairing = repairing || false
	await db.comic_groups.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:7}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				AddGroupAddGroupRow(comicId, index, groupsList, repairing)
			})
		} else {
			AddGroupCreateGroupIdList(comicId, groupsList, 0, [], repairing)
		}
	})
}

async function CreateGroupInsert(groupName, index) {
	await db.groups.insert({n:groupName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function CreateGroup(groupsList, index, groupsAddToList, comicId, groupsListIndex, repairing) {
	groupsListIndex = groupsListIndex || 0
	groupsAddToList = groupsAddToList || false
	repairing = repairing || false
	await db.groups.count({n:groupsList[groupsListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			CreateGroupInsert(groupsList[groupsListIndex], index).then(() => {
				if (groupsListIndex == groupsList.length - 1) {
					fix_index(6)
					if (groupsAddToList == true) {
						AddGroup(comicId, groupsList, repairing)
					}
				} else {
					CreateGroup(groupsList, index + 1, groupsAddToList, comicId, groupsListIndex + 1, repairing)
				}
			})
		} else {
			if (groupsListIndex == groupsList.length - 1) {
				fix_index(6)
				if (groupsAddToList == true) {
					AddGroup(comicId, groupsList, repairing)
				}
			} else
				CreateGroup(groupsList, index, groupsAddToList, comicId, groupsListIndex + 1, repairing)
		}
	})
}

// Add New Artist
async function AddArtistUpdateList(comicId, artistsList, repairing) {
	repairing = repairing || false
	if (repairing == true) {
		var newArtistList = []
		for (var i in artistsList) {
			newArtistList.push(artistsList[i][0])
		}
		await db.comic_artists.update({c:comicId}, { $set: {t:newArtistList} }, {}, (err) => {
			if (err) { error(err); return }
			PopAlert('Comic Artists Has Been Repaired!')
			var html = 'Artists: '
			for (var i in artistsList) {
				html += `<button>${artistsList[i][1]}</button>`
			}
			document.getElementById('c-p-a').innerHTML = html
		})
	} else {
		await db.comic_artists.update({c:comicId}, { $set: {t:artistsList} }, {}, (err) => {
			if (err) error(err)
		})
	}
}

async function AddArtistCreateArtistIdList(comicId, artistsList, artistsListIndex, artistsNewList, repairing) {
	artistsListIndex = artistsListIndex || 0
	artistsNewList = artistsNewList || []
	repairing = repairing || false
	await db.artists.findOne({n:artistsList[artistsListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		if (repairing == true)
			artistsNewList.push([doc._id, doc.n])
		else
			artistsNewList.push(doc._id)
		if (artistsListIndex == artistsList.length - 1)
			AddArtistUpdateList(comicId, artistsNewList, repairing)
		else
			AddArtistCreateArtistIdList(comicId, artistsList, artistsListIndex + 1, artistsNewList, repairing)
	})
}

async function AddArtistAddArtistRow(comicId, index, artistsList, repairing) {
	repairing = repairing || false
	await db.comic_artists.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		AddArtistCreateArtistIdList(comicId, artistsList, 0, [], repairing)
		fix_index(3)
	})
}

async function AddArtist(comicId, artistsList, repairing) {
	repairing = repairing || false
	await db.comic_artists.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:3}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				AddArtistAddArtistRow(comicId, index, artistsList, repairing)
			})
		} else {
			AddArtistCreateArtistIdList(comicId, artistsList, 0, [], repairing)
		}
	})
}

async function CreateArtistInsert(artistName, index) {
	await db.artists.insert({n:artistName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function CreateArtist(artistsList, index, artistsAddToList, comicId, artistsListIndex, repairing) {
	artistsListIndex = artistsListIndex || 0
	artistsAddToList = artistsAddToList || false
	repairing = repairing || false
	await db.artists.count({n:artistsList[artistsListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			CreateArtistInsert(artistsList[artistsListIndex], index).then(() => {
				if (artistsListIndex == artistsList.length - 1) {
					fix_index(2)
					if (artistsAddToList == true) {
						AddArtist(comicId, artistsList, repairing)
					}
				} else {
					CreateArtist(artistsList, index + 1, artistsAddToList, comicId, artistsListIndex + 1, repairing)
				}
			})
		} else {
			if (artistsListIndex == artistsList.length - 1) {
				fix_index(2)
				if (artistsAddToList == true) {
					AddArtist(comicId, artistsList, repairing)
				}
			} else
				CreateArtist(artistsList, index, artistsAddToList, comicId, artistsListIndex + 1, repairing)
		}
	})
}

// Add New Parody
async function AddParodyUpdateList(comicId, parodyList, repairing) {
	repairing = repairing || false
	if (repairing == true) {
		var newParodyList = []
		for (var i in parodyList) {
			newParodyList.push(parodyList[i][0])
		}
		await db.comic_parodies.update({c:comicId}, { $set: {t:newParodyList} }, {}, (err) => {
			if (err) { error(err); return }
			PopAlert('Comic Parodies Has Been Repaired!')
			var html = 'Parody: '
			for (var i in parodyList) {
				html += `<button>${parodyList[i][1]}</button>`
			}
			document.getElementById('c-p-p').innerHTML = html
		})
	} else {
		await db.comic_parodies.update({c:comicId}, { $set: {t:parodyList} }, {}, (err) => {
			if (err) error(err)
		})
	}
}

async function AddParodyCreateParodyIdList(comicId, parodyList, parodyListIndex, parodyNewList, repairing) {
	parodyListIndex = parodyListIndex || 0
	parodyNewList = parodyNewList || []
	repairing = repairing || false
	await db.parodies.findOne({n:parodyList[parodyListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		if (repairing == true)
			parodyNewList.push([doc._id, doc.n])
		else
			parodyNewList.push(doc._id)
		if (parodyListIndex == parodyList.length - 1) {
			AddParodyUpdateList(comicId, parodyNewList, repairing)
		} else
			AddParodyCreateParodyIdList(comicId, parodyList, parodyListIndex + 1, parodyNewList, repairing)
	})
}

async function AddParodyAddParodyRow(comicId, index, parodyList, repairing) {
	repairing = repairing || false
	await db.comic_parodies.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		AddParodyCreateParodyIdList(comicId, parodyList, 0, [], repairing)
		fix_index(9)
	})
}

async function AddParody(comicId, parodyList, repairing) {
	repairing = repairing || false
	await db.comic_parodies.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:9}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				AddParodyAddParodyRow(comicId, index, parodyList, repairing)
			})
		} else {
			AddParodyCreateParodyIdList(comicId, parodyList, 0, [], repairing)
		}
	})
}

async function CreateParodyInsert(parodyName, index) {
	await db.parodies.insert({n:parodyName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function CreateParody(parodyList, index, parodyAddToList, comicId, parodyListIndex, repairing) {
	parodyListIndex = parodyListIndex || 0
	parodyAddToList = parodyAddToList || false
	repairing = repairing || false
	await db.parodies.count({n:parodyList[parodyListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			CreateParodyInsert(parodyList[parodyListIndex], index).then(() => {
				if (parodyListIndex == parodyList.length - 1) {
					fix_index(8)
					if (parodyAddToList == true) {
						AddParody(comicId, parodyList, repairing)
					}
				} else {
					CreateParody(parodyList, index + 1, parodyAddToList, comicId, parodyListIndex + 1, repairing)
				}
			})
		} else {
			if (parodyListIndex == parodyList.length - 1) {
				fix_index(8)
				if (parodyAddToList == true) {
					AddParody(comicId, parodyList, repairing)
				}
			} else
				CreateParody(parodyList, index, parodyAddToList, comicId, parodyListIndex + 1, repairing)
		}
	})
}

// Add New Tag
async function AddTagUpdateList(comicId, tagList, repairing) {
	repairing = repairing || false
	if (repairing == true) {
		var newTagList = []
		for (var i in tagList) {
			newTagList.push(tagList[i][0])
		}
		await db.comic_tags.update({c:comicId}, { $set: {t:newTagList} }, {}, (err) => {
			if (err) { error(err); return }
			PopAlert('Comic Tags Has Been Repaired!')
			var html = 'Tags: '
			for (var i in tagList) {
				html += `<button>${tagList[i][1]}</button>`
			}
			document.getElementById('c-p-ts').innerHTML = html
		})
	} else {
		await db.comic_tags.update({c:comicId}, { $set: {t:tagList} }, {}, (err) => {
			if (err) error(err)
		})
	}
}

async function AddTagCreateTagIdList(comicId, tagList, tagListIndex, newList, repairing) {
	tagListIndex = tagListIndex || 0
	newList = newList || []
	repairing = repairing || false
	await db.tags.findOne({n:tagList[tagListIndex].toLowerCase()}, (err, doc) => {
		if (err) { error(err); return }
		if (repairing == true)
			newList.push([doc._id, doc.n])
		else
			newList.push(doc._id)
		if (tagListIndex == tagList.length - 1)
			AddTagUpdateList(comicId, newList, repairing)
		else
			AddTagCreateTagIdList(comicId, tagList, tagListIndex + 1, newList, repairing)
	})
}

async function AddTagAddTagRow(comicId, index, tagList, repairing) {
	repairing = repairing || false
	await db.comic_tags.insert({c:comicId, t:[], _id:index}, err => {
		if (err) { error(err); return }
		AddTagCreateTagIdList(comicId, tagList, 0, [], repairing)
		fix_index(5)
	})
}

async function AddTag(comicId, tagList, repairing) {
	repairing = repairing || false
	await db.comic_tags.count({c:comicId}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			db.index.findOne({_id:5}, (err, doc) => {
				if (err) { error(err); return }
				var index = doc.i
				AddTagAddTagRow(comicId, index, tagList, repairing)
			})
		} else {
			AddTagCreateTagIdList(comicId, tagList, 0, [], repairing)
		}
	})
}

async function CreateTagInsert(tagName, index) {
	await db.tags.insert({n:tagName.toLowerCase(), _id:index}, (err) => {
		if (err) { error(err); return }
	})
}

async function CreateTag(tagList, index, addToList, comicId, tagListIndex, repairing) {
	tagListIndex = tagListIndex || 0
	addToList = addToList || false
	repairing = repairing || false
	await db.tags.count({n:tagList[tagListIndex].toLowerCase()}, (err, num) => {
		if (err) { error(err); return }
		if (num == 0) {
			CreateTagInsert(tagList[tagListIndex], index).then(() => {
				if (tagListIndex == tagList.length - 1) {
					fix_index(4)
					if (addToList == true) {
						AddTag(comicId, tagList, repairing)
					}
				} else {
					CreateTag(tagList, index + 1, addToList, comicId, tagListIndex + 1, repairing)
				}
			})
		} else {
			if (tagListIndex == tagList.length - 1) {
				fix_index(4)
				if (addToList == true) {
					AddTag(comicId, tagList, repairing)
				}
			} else
				CreateTag(tagList, index, addToList, comicId, tagListIndex + 1, repairing)
		}
	})
}

// Add New Comic
async function CreateComic(index, gottenResult, gottenQuality, images, siteIndex, comic_id, isDownloading) {
	isDownloading = isDownloading || false
	await db.index.findOne({_id:1}, (err, cIndex) => {
		if (err) { error(err); return }
		db.comics.insert({n:gottenResult.title.toLowerCase(), i:images, q:gottenQuality, s:siteIndex, p:comic_id, _id:cIndex.i}, (err, doc) => {
			if (err) { error(err); return }
			update_index(cIndex.i, 1)
			var id = doc._id
			var groups = gottenResult.groups || null
			var artists = gottenResult.artists || null
			var parody = gottenResult.parody || null
			var tags = gottenResult.tags || null

			// Add Comic To Have
			CreateHave(doc.s, doc.p)

			// Groups
			if (groups != null) {
				var groupsList = []
				for (var i in groups) {
					groupsList.push(groups[i].name)
				}
				db.index.findOne({_id:6}, (err, doc) => {
					if (err) { error(err); return }
					var groupsIndex = doc.i
					CreateGroup(groupsList, groupsIndex, true, id)
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
					CreateArtist(artistsList, artistsIndex, true, id)
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
					CreateParody(parodyList, parodyIndex, true, id)
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
					CreateTag(tagsList, tagIndex, true, id)
				})
			}

			if (isDownloading == true) {
				var shortName = gottenResult.title
				if (shortName.length > 26) shortName = shortName.substr(0, 23)+'...'
				if (setting.notification_download_finish == true)
					PopAlert(`Comic (${shortName}) Downloaded.`)
				document.getElementById(`${downloadingList[index][2]}`).remove()
				downloadingList[index] = null
				var downloader = document.getElementById('downloader')
				if (downloader.children.length == 0) {
					downloader.style.display = 'none'
					downloadingList = []
				}
			}
			reloadLoadingComics()
		})
	})
}

// Setting
function setLuanchTimeSettings(reloadSettingPanel) {
	reloadSettingPanel = reloadSettingPanel || false
	var s_comic_panel_theme = document.getElementById('s_comic_panel_theme')
	var s_img_graphic = document.getElementById('s_img_graphic')

	s_comic_panel_theme.setAttribute('value', setting.comic_panel_theme)
	s_img_graphic.setAttribute('value', setting.img_graphic)

	s_comic_panel_theme.getElementsByTagName('div')[0].textContent = s_comic_panel_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.comic_panel_theme})"]`).textContent
	s_img_graphic.getElementsByTagName('div')[0].textContent = s_img_graphic.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.img_graphic})"]`).textContent

	document.getElementById('s_max_per_page').value = setting.max_per_page

	if (setting.hover_downloader == true) document.getElementById('s_hover_downloader').checked = true
	
	if (setting.notification_download_finish == true) document.getElementById('s_notification_download_finish').checked = true

	if (setting.lazy_loading == true) document.getElementById('s_lazy_loading').checked = true


	if (reloadSettingPanel == false) {
		if (setting.hover_downloader == false)
			document.getElementById('downloader').classList.add('downloader-fixed')

		if (setting.comic_panel_theme == 1)
			document.getElementById('comic-panel').classList.add('comic-panel-darkmode')
	}
}

function saveSetting() {
	const newMaxPerPage = Number(document.getElementById('s_max_per_page').value)

	if (setting.max_per_page != newMaxPerPage) reloadLoadingComics()

	setting.comic_panel_theme = Number(document.getElementById('s_comic_panel_theme').getAttribute('value'))
	setting.img_graphic = Number(document.getElementById('s_img_graphic').getAttribute('value'))
	setting.max_per_page = newMaxPerPage
	setting.hover_downloader = document.getElementById('s_hover_downloader').checked
	setting.notification_download_finish = document.getElementById('s_notification_download_finish').checked
	setting.lazy_loading = document.getElementById('s_lazy_loading').checked

	if (setting.hover_downloader == false)
		document.getElementById('downloader').classList.add('downloader-fixed')
	else
		document.getElementById('downloader').classList.remove('downloader-fixed')

	switch (setting.comic_panel_theme) {
		case 0:
			document.getElementById('comic-panel').classList.remove('comic-panel-darkmode')
			break
		case 1:
			document.getElementById('comic-panel').classList.add('comic-panel-darkmode')
			break
	}

	fs.writeFile('./setting.cfg', JSON.stringify(setting), (err) => {
		if (err) {
			PopAlert(err, 'danger')
			return
		}
		document.getElementById('setting-panel').style.display = 'none'
	})
}

function closeSetting() {
	document.getElementById('setting-panel').style.display = 'none'
	setLuanchTimeSettings(true)
}

function test() {
	console.log(tabs)
}

function mybeNeedable() {
	db.comics.find({}, (err, doc) => {
		if (err) { error(err); return }
		for (var i = 0; i < doc.length; i++) {
			var formatList = [], firstIndex = 0, lastIndex = 0, thisFormat
			thisFormat = fileExt(doc[i].i[0])
			for (var j = 1; j < doc[i].i.length; j++) {
				lastIndex++
				if (fileExt(doc[i].i[j]) == thisFormat) {
					if (j == doc[i].i.length - 1)
						formatList.push([firstIndex, lastIndex, thisFormat])
				} else {
					formatList.push([firstIndex, lastIndex - 1, thisFormat])

					thisFormat = fileExt(doc[i].i[j])
					firstIndex = lastIndex

					if (j == doc[i].i.length - 1)
						formatList.push([firstIndex, lastIndex, thisFormat])
				}
			}
			
			db.test.insert({n:doc[i].n, i:doc[i].i[0].replace('-0.jpg', '').replace('-0.jpeg', '').replace('-0.png', '').replace('-0.gif', '').replace('-0.webp', ''), c:doc[i].i.length, f:formatList, q:doc[i].q, s:doc[i].s, p:doc[i].p, _id:doc[i]._id}, err => {
				if (err) { error(err); return}
			})
		}
	})
}

document.addEventListener('readystatechange', e => {
	makeDatabaseIndexs()
	setLuanchTimeSettings(false)
	loadComics()
})
