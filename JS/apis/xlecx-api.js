class XlecxAPI {
	#status = [403, 404, 500, 503]
	#statusMessage = [
		"You don't have the permission to View this Page.",
		"Page Not Found.",
		"Internal Server Error.",
		"Server is unavailable at this Time."
	]

	constructor() {
		this.baseURL = 'https://xlecx.org'
		this.groupURL = '/xfsearch/group/'
		this.artistURL = '/xfsearch/artist/'
		this.parodyURL = '/xfsearch/parody/'
		this.tagURL = '/tags/'
		this.searchURL = '/index.php?do=search'
	}

	#lastSlash(str) {
		const base = new String(str).substring(str.lastIndexOf('/') + 1)
		return base
	}

	#getOverviewPages(text) {
		return Number(text.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace('шьп', '').replace(/ /g, ''))
	}

	getPage(options = {page:1, random:false, pagination:true, category:false}, callback) {
		const page = options.page || 1
		const random = options.random || false
		const pagination = options.pagination || true
		const category = options.category || false
		callback = callback || null
		const url = this.baseURL+'/page/'+page+'/'

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			container = htmlDoc.getElementsByClassName('main')[0].children
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
			}

			// Random
			if (random == true) {
				arr.random = []
				for (let i=2; i <= 13; i++) {
					gg = container[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = container[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null

					arr.random.push({
						"id": this.#lastSlash(gg),
						"title": container[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": container[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}
			}

			li = container[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 0; i < li.length; i++) {
					if (li[i].className != 'thumb') continue
					save = li[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null
					
					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": save2[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					let value, pPage
					arr.pagination = [];
					li = htmlDoc.getElementById('bottom-nav').querySelector('.navigation').children
					for (let i = 0; i < li.length; i++) {
						if (li[i].textContent == "")
							if (i == li.length - 1) value = ">"
							else value = "<"
						else value = li[i].textContent
						
						if (li[i].getAttribute('href') == null) pPage = null
						else pPage = Number(li[i].getAttribute('href').replace(this.baseURL+'/page/', '').replace(slashReg, ''))
						
						arr.pagination.push([value, pPage])
					}
				}
			}

			if (hasPost == false && category == false && random == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getCategories(callback) {
		const url = this.baseURL+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html'), slashReg = new RegExp('/', 'g'), arr = []
			let li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			for (let i=0; i<li.length; i++) arr.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL, '').replace(slashReg, '') })
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getCategory(name, options = {page:1, random:false, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const random = options.random || false
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+'/'+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			container = htmlDoc.getElementsByClassName('main')[0].children
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
			}

			// Random
			if (random == true) {
				arr.random = []
				for (let i=2; i<=13; i++) {
					gg = container[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = container[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null

					arr.random.push({
						"id": this.#lastSlash(gg),
						"title": container[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": container[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}
			}

			li = container[0].children
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (let i = 0; i < li.length; i++) {
					if (li[i].className != 'thumb') continue
					save = li[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null
	
					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": save2[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					let value, pPage
					arr.pagination = []
					li = htmlDoc.getElementById('bottom-nav').querySelector('.navigation').children
					for (let i = 0; i < li.length; i++) {
						if (li[i].textContent == "")
							if (i == li.length - 1) value = ">"
							else value = "<"
						else value = li[i].textContent
						
						if (li[i].getAttribute('href') == null) pPage = null
						else pPage = Number(li[i].getAttribute('href').replace((this.baseURL+'/'+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
						
						arr.pagination.push([value, pPage])
					}
				}
			}

			if (hasPost == false && category == false && random == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getComic(id, options = {raw:false, related:true}, callback) {
		const raw = options.raw || false
		const related = options.related || true
		const url = this.baseURL+'/'+id
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, arr = {}

			let li = htmlDoc.getElementsByClassName('main')[0].getElementsByClassName('full-in')
			if (li.length != 0) {
				li = li[0]
				arr.url = url
				arr.title = li.getElementsByTagName('h1')[0].textContent
				arr.images = []
				let info = li.getElementsByClassName('full-tags')

				// Groups
				if (info.length >= 1 && info[0].children.length > 0) {
					arr.groups = []
					let t = info[0].getElementsByTagName('a')
					for (let i=0; i<t.length; i++) {
						arr.groups.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Artist
				if (info.length >= 2 && info[1].children.length > 0) {
					arr.artists = []
					let t = info[1].getElementsByTagName('a')
					for (let i=0; i<t.length; i++) {
						arr.artists.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Parody
				if (info.length >= 3 && info[2].children.length > 0) {
					arr.parody = []
					let t = info[2].getElementsByTagName('a')
					for (let i=0; i<t.length; i++) {
						arr.parody.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Tags
				if (info.length >= 4 && info[3].children.length > 0) {
					arr.tags = []
					let t = info[3].getElementsByTagName('a')
					for (let i=0; i<t.length; i++) {
						arr.tags.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Images
				gg = li.getElementsByClassName('f-desc full-text clearfix')[0].getElementsByTagName('img')
				if (raw == true) {
					for (let i=0; i<gg.length; i++) {
						bb = this.baseURL+gg[i].getAttribute('data-src')
						bb = bb.replace('http://xlecx.com', '')
						arr.images.push({
							"src": bb.replace("/thumbs/", "/"),
							"thumb": bb
						})
					}
				} else {
					for (let i=0; i<gg.length; i++) {
						bb = gg[i].getAttribute('data-src')
						bb = bb.replace('http://xlecx.com', '')
						arr.images.push({
							"src": bb.replace("/thumbs/", "/"),
							"thumb": bb
						})
					}
				}

				// Related
				if (related == true) {
					gg = htmlDoc.getElementsByClassName('main')[0].getElementsByClassName('floats clearfix')
					if (gg.length > 0) {
						li = gg[0].getElementsByClassName('thumb')
						if (li.length > 0) {
							arr.related = []
							for (let i = 0; i < li.length; i++) {
								gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
								bb = li[i].getElementsByClassName('th-time icon-l')[0]
								if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
								else bb = null
	
								arr.related.push({
									"id": this.#lastSlash(gg),
									"title": li[i].getElementsByClassName('th-title')[0].textContent,
									"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
									"pages": bb,
									"url": gg
								})
							}
						}
					}
				}
			} else arr = null

			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getComicRelated(id, callback) {
		const url = this.baseURL+'/'+id
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, arr = [], li

			li = htmlDoc.getElementsByClassName('main')[0].getElementsByClassName('full-in')
			if (li.length != 0) {
				gg = htmlDoc.getElementsByClassName('main')[0].getElementsByClassName('floats clearfix')
				if (gg.length > 0) {
					li = gg[0].getElementsByClassName('thumb')
					if (li.length > 0) {
						for (let i = 0; i < li.length; i++) {
							gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
							bb = li[i].getElementsByClassName('th-time icon-l')[0]
							if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
							else bb = null

							arr.push({
								"id": this.#lastSlash(gg),
								"title": li[i].getElementsByClassName('th-title')[0].textContent,
								"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
								"pages": bb,
								"url": gg
							})
						}
					} else arr = null
				} else arr = null
			} else arr = null

			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getAllTags(category = false, callback = (error = '', result = {}) => {}) {
		category = category || false
		const url = this.baseURL+'/tags/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, li

			li = htmlDoc.getElementsByClassName('clouds_xsmall')
			arr.tags = []
			for (let i=0; i<li.length; i++) {
				gg = li[i].children[0]
				arr.tags.push({
					"name": gg.textContent,
					"url": gg.getAttribute('href')
				})
			}

			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getGroup(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.groupURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback to Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			container = htmlDoc.getElementsByClassName('main')[0].children
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
			}

			container = htmlDoc.getElementsByClassName('main')[0].children[0].children
			if (container.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (let i = 0; i < container.length; i++) {
					if (container[i].className != 'thumb') continue
					save = container[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null
	
					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": save2[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					li = htmlDoc.getElementById('bottom-nav') || null
					if (li != null) {
						li = li.querySelector('.navigation').children || null
						var value, pPage
						arr.pagination = []
						for (var i = 0; i < li.length; i++) {
							if (li[i].textContent == "")
								if (i == li.length - 1) value = ">"
								else value = "<"
							else value = li[i].textContent
							
							if (li[i].getAttribute('href') == null) pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.groupURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) pPage = 1
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getArtist(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.artistURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
			}

			container = htmlDoc.getElementsByClassName('main')[0].children[0].children
			if (container.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (let i = 0; i < container.length; i++) {
					if (container[i].className != 'thumb') continue
					save = container[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null
	
					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": save2[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					li = htmlDoc.getElementById('bottom-nav') || null
					if (li != null) {
						li = li.querySelector('.navigation').children || null
						let value, pPage
						arr.pagination = []
						for (let i = 0; i < li.length; i++) {
							if (li[i].textContent == "")
								if (i == li.length - 1) value = ">"
								else value = "<"
							else value = li[i].textContent
							
							if (li[i].getAttribute('href') == null) pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.artistURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) pPage = 1
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getParody(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.parodyURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
			}

			container = htmlDoc.getElementsByClassName('main')[0].children[0].children
			if (container.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (let i = 0; i < container.length; i++) {
					if (container[i].className != 'thumb') continue
					save = container[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null
	
					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": save2[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					li = htmlDoc.getElementById('bottom-nav') || null
					if (li != null) {
						li = li.querySelector('.navigation').children || null
						let value, pPage
						arr.pagination = []
						for (let i = 0; i < li.length; i++) {
							if (li[i].textContent == "")
								if (i == li.length - 1) value = ">"
								else value = "<"
							else value = li[i].textContent
							
							if (li[i].getAttribute('href') == null) pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.parodyURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) pPage = 1
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	getTag(name, options = {page:1, pagination:true, category:false}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		const url = this.baseURL+this.tagURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
			}

			container = htmlDoc.getElementsByClassName('main')[0].children[0].children
			if (container.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (let i = 0; i < container.length; i++) {
					if (container[i].className != 'thumb') continue
					save = container[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null
	
					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": save2[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					li = htmlDoc.getElementById('bottom-nav') || null
					if (li != null) {
						li = li.querySelector('.navigation').children || null
						let value, pPage
						arr.pagination = []
						for (let i = 0; i < li.length; i++) {
							if (li[i].textContent == "")
								if (i == li.length - 1) value = ">"
								else value = "<"
							else value = li[i].textContent
							
							if (li[i].getAttribute('href') == null) pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.tagURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) pPage = 1
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}
			
			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}

	search(text, options = {page:1, pagination:true, category:false}, callback) {
		text = text || null
		if (text == null) throw "Text value can't Be Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const category = options.category || false
		callback = callback || null
		const url = this.baseURL+this.searchURL

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: `do=search&subaction=search&search_start=${page}&full_search=0&result_from=${(page - 1) * 15 + 1}&story=${text}`
		}).then(response => {
			if (response.status != 200) {
				const index = this.#status.indexOf(response.status)
				if (index > -1) throw this.#statusMessage[index]
				else throw "Error::Code::"+response.status
			}
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const arr = {}, slashReg = new RegExp('/', 'g'), htmlDoc = parser.parseFromString(html, 'text/html')
			let gg = 0, bb = 0, li, hasPost = false, container, save, save2

			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (let i=0; i<li.length; i++) arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
			}

			container = htmlDoc.getElementsByClassName('main')[0].children[0].children
			if (container.length > 1) {
				arr.content = []
				hasPost = true
				// Content
				for (let i = 1; i < container.length; i++) {
					if (container[i].className != 'thumb') continue
					save = container[i].children[0].children
					save2 = save[0].children
					gg = save[0].getAttribute('href')
					bb = save2[2]
					if (bb != undefined) bb = this.#getOverviewPages(bb.textContent)
					else bb = null
	
					arr.content.push({
						"id": this.#lastSlash(gg),
						"title": save[1].textContent,
						"thumb": save2[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					let value, pPage
					li = htmlDoc.getElementById('bottom-nav') || null
					if (li != null) {
						arr.pagination = []
						li = li.querySelector('.navigation').children
						for (let i = 0; i < li.length; i++) {
							if (li[i].textContent == "")
								if (i == li.length - 1) value = ">"
								else value = "<"
							else value = li[i].textContent
							
							if (li[i].getAttribute('href') == null) pPage = null
							else {
								pPage = Number(li[i].getAttribute('onclick').replace('javascript:list_submit(', '').replace('); return(false)', ''))
								if (Number.isNaN(pPage)) pPage = 1
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false) arr = null
			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}
}