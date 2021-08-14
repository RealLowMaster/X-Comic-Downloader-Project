// Comics
function loadComics(page, search) {
	page = page || 1
	search = search || null
	if (search == 'null') search = null
	var RegSearch
	if (search != null) RegSearch = new RegExp(search.toLowerCase())
	const comic_container = document.getElementById('comic-container')
	comic_container.innerHTML = ''
	comic_container.setAttribute('page', page)
	let min = 0, max = 0, allPages = 0
	let html = ''
	var id, name, image, repair
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
			if (repair == null || repair.length == 0) image = `${dirUL}/thumbs/${image}.jpg`
			else if (repair.indexOf(0) > -1) image = 'Image/no-img-300x300.png'
			else image = `${dirUL}/thumbs/${image}.jpg`
				
			html += `<div class="comic" onclick="openComic(${id})"><img src="${image}"><span>${doc[i].c}</span><p>${name}</p></div>`
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
			const thisPagination = pagination(allPages, page)
			html = '<div>'
			for (let i in thisPagination) {
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

	if (search == null) findComics()
	else findComicsBySearch()
}

function pagination(total_pages, page) {
	let min = 1, max = 1, bdot = false, fdot = false, bfirst = false, ffirst = false, pagination_width = 5
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
	
	const arr = []
	if (page > 1) arr.push(['Prev', page - 1])
	if (bfirst) arr.push(['1', 1])
	if (bdot) arr.push(['...', null])
	for (let i=min; i <= max;i++) {
		if (i == page) arr.push([`${i}`, null])
		else arr.push([`${i}`, i])
	}
	if (fdot) arr.push(['...', null])
	if (ffirst) arr.push([`${total_pages}`, total_pages])
	if (page < total_pages) arr.push(['Next', page + 1])

	return arr
}

function searchComics(value, page) {
	let search_speed
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
		if (typeof(page) != 'number') page = 1
		if (search_speed == 0) {
			loadComics(page, value)
		} else {
			searchTimer = setTimeout(() => {
				loadComics(page, value)
			}, search_speed)
		}
	} else if (typeof(page) == 'number') {
		searchTimer = setTimeout(() => {
			loadComics(page, value)
		}, 330)
	} else loadComics(1, null)
}

function randomJumpPage(limit) {
	const value = document.getElementById('offline-search-form-input').value || null
	if (value == null || value.replace(/ /g, '').length == 0) loadComics(Math.floor(Math.random() * limit), null)
	else loadComics(Math.floor(Math.random() * limit), value)
}

function reloadLoadingComics() {
	const page = Number(document.getElementById('comic-container').getAttribute('page')) || null
	let search = document.getElementById('offline-search-form-input').value || null
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
			for (let i in groups) {
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
			for (let i in artists) {
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
			for (let i in parodies) {
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
			for (let i in tags) {
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
	const title_container = document.getElementById('c-p-t')
	const image_container = document.getElementById('c-p-i')
	let html = '', formatIndex = 0
	var name, image, ImagesCount, formats

	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	title_container.textContent = ''
	image_container.innerHTML = ''
	comicSliderOverview.setAttribute('aindex', '')

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

			let lastIndex = formats[0][1]
			let thisForamat = formats[0][2]
			let repair = doc.m || null
			let src = ''
			let slider_overview_html = ''
			if (repair == null || repair.length == 0) {
				for (let i = 0; i < ImagesCount; i++) {
					if (i <= lastIndex) {
						src = `${dirUL}/${image}-${i}.${thisForamat}`
						html += `<img data-src="${src}" onclick="openComicSlider(${i})">`
						slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="${src}" loading="lazy"><p>${i+1}</p></div>`
					} else {
						formatIndex++
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
						src = `${dirUL}/${image}-${i}.${thisForamat}`
						html += `<img data-src="${src}" onclick="openComicSlider(${i})">`
						slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="${src}" loading="lazy"><p>${i+1}</p></div>`
					}
				}
			} else {
				for (let i = 0; i < ImagesCount; i++) {
					if (repair.indexOf(i) > -1) {
						html += `<div class="repair-image" id="${i}"><p>Image hasn't Been Download Currectly.</p><button onclick="repairImage(${i}, ${repair.indexOf(i)}, ${image})">Repair</button></div>`
						slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="Image/no-img-300x300.png" loading="lazy"><p>${i+1}</p></div>`
					} else {
						if (i <= lastIndex) {
							src = `${dirUL}/${image}-${i}.${thisForamat}`
							html += `<img data-src="${src}" onclick="openComicSlider(${i})">`
							slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="${src}" loading="lazy"><p>${i+1}</p></div>`
						} else {
							formatIndex++
							lastIndex = formats[formatIndex][1]
							thisForamat = formats[formatIndex][2]
							src = `${dirUL}/${image}-${i}.${thisForamat}`
							html += `<img data-src="${src}" onclick="openComicSlider(${i})">`
							slider_overview_html += `<div i="${i}" onclick="changeSliderIndex(${i})"><img src="${src}" loading="lazy"><p>${i+1}</p></div>`
						}
					}
				}
			}
			image_container.innerHTML = html
			comicSliderOverview.innerHTML = slider_overview_html
			comicSliderOverview.setAttribute('count', ImagesCount - 1)
			comicSliderMaxPages.textContent = ImagesCount

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
	comicPanel.style.display = 'none'

	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	document.getElementById('c-p-t').textContent = ''
	document.getElementById('c-p-i').innerHTML = ''
	document.getElementById('c-s-o').innerHTML = ''

	comicPanel.setAttribute('cid', null)
	comicPanel.setAttribute('sid', null)
}

async function repairImageUpdateDatabase(comic_id, imageIndex, imageBaseName, imageFormat, repairIndex, passRepair, passRepairURLs) {
	var newRepair = [], newRepairURLs = []
	let rawRepair = 0, rawRepairURLs = 0

	for (let j in passRepair) {
		if (passRepair != null && j != repairIndex) rawRepair++
	}
	for (let j in passRepairURLs) {
		if (passRepairURLs != null && j != repairIndex) rawRepairURLs++
	}

	for (let i in passRepair) {
		if (i != repairIndex) newRepair.push(passRepair[i])
		else {
			if (rawRepair == 0) newRepair = null
			else if (i != passRepair.length - 1) newRepair.push(null)
		}
	}
	for (let i in passRepairURLs) {
		if (i != repairIndex) newRepairURLs.push(passRepairURLs[i])
		else {
			if (rawRepairURLs == 0) newRepairURLs = null
			else if (i != passRepairURLs.length - 1) newRepairURLs.push(null)
		}
	}

	await db.comics.update({_id:comic_id}, { $set: {m:newRepair, r:newRepairURLs} }, {}, err => {
		if (err) { error(err); return }
		const repairElement = document.getElementById(imageIndex) || null
		if (repairElement != null) {
			const newImage = document.createElement('img')
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
	const imageFormat = fileExt(imageUrl)
	const option = {
		url: imageUrl,
		dest: dirUL+`/${imageId}-${imageIndex}.${imageFormat}`
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
	document.getElementById(imageIndex).innerHTML = '<div class="browser-page-loading"><span class="spin spin-primary"></span><p>Loading...</p></div>'
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
	const id = Number(comicPanel.getAttribute('cid'))
	await db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc.s == undefined) return
		if (doc.s == undefined) return
		eval(sites[doc.s][1].replace('{id}', `'${doc.p}'`).replace('{whitch}', whitch))
	})
}