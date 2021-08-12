class XlecxAPI {
	constructor() {
		this.baseURL = 'https://xlecx.org'
		this.groupURL = '/xfsearch/group/'
		this.artistURL = '/xfsearch/artist/'
		this.parodyURL = '/xfsearch/parody/'
		this.tagURL = '/tags/'
		this.searchURL = '/index.php?do=search'
	}

	lastSlash(str) {
		const base = new String(str).substring(str.lastIndexOf('/') + 1)
		return base
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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const arr = {}
			var gg = 0, bb = 0, li, hasPost = false
			const slashReg = new RegExp('/', 'g')
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			// Random
			if (random == true) {
				arr.random = []
				li = htmlDoc.getElementsByClassName('main')[0].children
				for (var i=2; i<=13; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null

					arr.random.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}
			}

			li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null
					
					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					var value, pPage
					arr.pagination = [];
					li = htmlDoc.getElementById('bottom-nav').querySelector('.navigation').children
					for (var i = 0; i < li.length; i++) {
						if (li[i].textContent == "")
							if (i == li.length - 1)
								value = ">"
							else
								value = "<"
						else
							value = li[i].textContent
						
						if (li[i].getAttribute('href') == null)
							pPage = null
						else
							pPage = Number(li[i].getAttribute('href').replace(this.baseURL+'/page/', '').replace(slashReg, ''))
						
						
						arr.pagination.push([value, pPage])
					}
				}
			}

			if (hasPost == false && category == false && random == false)
				arr = null

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const slashReg = new RegExp('/', 'g')

			var arr = []
			var li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			for (var i=0; i<li.length; i++) {
				arr.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL, '').replace(slashReg, '') })
			}

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const arr = {}
			var gg = 0, bb = 0, li, hasPost = false
			const slashReg = new RegExp('/', 'g')
			
			// Category
			if (category == true) {
				arr.categories = []
				var li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			// Random
			if (random == true) {
				arr.random = []
				li = htmlDoc.getElementsByClassName('main')[0].children
				for (var i=2; i<=13; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null

					arr.random.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}
			}

			li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null
	
					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					var value, pPage
					arr.pagination = []
					li = htmlDoc.getElementById('bottom-nav').querySelector('.navigation').children
					for (var i = 0; i < li.length; i++) {
						if (li[i].textContent == "")
							if (i == li.length - 1)
								value = ">"
							else
								value = "<"
						else
							value = li[i].textContent
						
						if (li[i].getAttribute('href') == null)
							pPage = null
						else
							pPage = Number(li[i].getAttribute('href').replace((this.baseURL+'/'+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
						
						
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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const arr = {}
			var gg = 0, bb = 0

			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('full-in')
			if (li.length != 0) {
				arr.title = li[0].getElementsByTagName('h1')[0].textContent
				arr.images = []
				var info = li[0].getElementsByClassName('full-tags')

				// Groups
				if (info.length >= 1 && info[0].children.length > 0) {
					arr.groups = []
					var t = info[0].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						arr.groups.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Artist
				if (info.length >= 2 && info[1].children.length > 0) {
					arr.artists = []
					var t = info[1].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						arr.artists.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Parody
				if (info.length >= 3 && info[2].children.length > 0) {
					arr.parody = []
					var t = info[2].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						arr.parody.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Tags
				if (info.length >= 4 && info[3].children.length > 0) {
					arr.tags = []
					var t = info[3].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						arr.tags.push({
							"name": t[i].textContent,
							"url": t[i].getAttribute('href')
						})
					}
				}

				// Images
				var gg = li[0].getElementsByClassName('f-desc full-text clearfix')[0].getElementsByTagName('img')
				if (raw == true) {
					for (var i=0; i<gg.length; i++) {
						bb = this.baseURL+gg[i].getAttribute('data-src')
						bb = bb.replace('http://xlecx.com', '')
						arr.images.push({
							"src": bb.replace("/thumbs/", "/"),
							"thumb": bb
						})
					}
				} else {
					for (var i=0; i<gg.length; i++) {
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
					gg = htmlDoc.getElementById('dle-content').getElementsByClassName('floats clearfix')
					if (gg.length > 0) {
						li = gg[0].getElementsByClassName('thumb')
						if (li.length > 0) {
							arr.related = []
							for (var i = 0; i < li.length; i++) {
								gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
								bb = li[i].getElementsByClassName('th-time icon-l')[0]
								if (bb != undefined)
									bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
								else
									bb = null
	
								arr.related.push({
									"id": this.lastSlash(gg),
									"title": li[i].getElementsByClassName('th-title')[0].textContent,
									"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
									"pages": bb,
									"url": gg
								})
							}
						}
					}
				}
			} else
				arr = null

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			var gg = 0, bb = 0, arr = []

			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('full-in')
			if (li.length != 0) {
				gg = htmlDoc.getElementById('dle-content').getElementsByClassName('floats clearfix')
				if (gg.length > 0) {
					li = gg[0].getElementsByClassName('thumb')
					if (li.length > 0) {
						for (var i = 0; i < li.length; i++) {
							gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
							bb = li[i].getElementsByClassName('th-time icon-l')[0]
							if (bb != undefined)
								bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
							else
								bb = null

							arr.push({
								"id": this.lastSlash(gg),
								"title": li[i].getElementsByClassName('th-title')[0].textContent,
								"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
								"pages": bb,
								"url": gg
							})
						}
					} else
						arr = null
				} else
					arr = null
			} else
				arr = null

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const slashReg = new RegExp('/', 'g')
			const arr = {}
			var gg = 0

			var li = htmlDoc.getElementsByClassName('clouds_xsmall')
			arr.tags = []
			for (var i=0; i<li.length; i++) {
				gg = li[i].children[0]
				arr.tags.push({
					"name": gg.textContent,
					"url": gg.getAttribute('href')
				})
			}

			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const arr = {}
			var gg = 0, bb = 0, li, hasPost = false
			const slashReg = new RegExp('/', 'g')
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null
	
					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
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
								if (i == li.length - 1)
									value = ">"
								else
									value = "<"
							else
								value = li[i].textContent
							
							if (li[i].getAttribute('href') == null)
								pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.groupURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) {
									pPage = 1
								}
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false)
				arr = null

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const arr = {}
			var gg = 0, bb = 0, li, hasPost = false
			const slashReg = new RegExp('/', 'g')
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null

					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
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
								if (i == li.length - 1)
									value = ">"
								else
									value = "<"
							else
								value = li[i].textContent
							
							if (li[i].getAttribute('href') == null)
								pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.artistURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) {
									pPage = 1
								}
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false)
				arr = null

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const arr = {}
			var gg = 0, bb = 0, li, hasPost = false
			const slashReg = new RegExp('/', 'g')
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null

					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
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
								if (i == li.length - 1)
									value = ">"
								else
									value = "<"
							else
								value = li[i].textContent
							
							if (li[i].getAttribute('href') == null)
								pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.parodyURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) {
									pPage = 1
								}
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false)
				arr = null

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const arr = {}
			var gg = 0, bb = 0, li, hasPost = false
			const slashReg = new RegExp('/', 'g')
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null

					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
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
								if (i == li.length - 1)
									value = ">"
								else
									value = "<"
							else
								value = li[i].textContent
							
							if (li[i].getAttribute('href') == null)
								pPage = null
							else {
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.tagURL+name+'/page/').replace(/ /g, '%20'), '').replace(slashReg, ''))
								if (Number.isNaN(pPage)) {
									pPage = 1
								}
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}
			
			if (hasPost == false && category == false)
				arr = null

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
			return response.text()
		}).then(html => {
			const parser = new DOMParser()
			const htmlDoc = parser.parseFromString(html, 'text/html')
			const slashReg = new RegExp('/', 'g')
			const arr = {}
			var gg = 0, bb = 0, li, hasPost = false
			
			// Category
			if (category == true) {
				arr.categories = []
				li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(slashReg, '') })
				}
			}

			li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0) {
				arr.content = []
				hasPost = true
				// Content
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined)
						bb = Number(bb.textContent.replace('img', '').replace('images', '').replace('pages', '').replace('page', '').replace('стр.', '').replace(/ /g, ''))
					else
						bb = null
					
					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": bb,
						"url": gg
					})
				}

				// Pagination
				if (pagination == true) {
					var value, pPage
					li = htmlDoc.getElementById('bottom-nav') || null
					if (li != null) {
						arr.pagination = []
						li = li.querySelector('.navigation').children
						for (var i = 0; i < li.length; i++) {
							if (li[i].textContent == "")
								if (i == li.length - 1)
									value = ">"
								else
									value = "<"
							else
								value = li[i].textContent
							
							if (li[i].getAttribute('href') == null)
								pPage = null
							else {
								pPage = Number(li[i].getAttribute('onclick').replace('javascript:list_submit(', '').replace('); return(false)', ''))
								if (Number.isNaN(pPage)) {
									pPage = 1
								}
							}
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			}

			if (hasPost == false && category == false)
				arr = null

			callback(null, arr)

		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}
}