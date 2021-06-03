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

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)
		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')
			var gg = 0
			var bb = 0

			var arr = { "content": [] }
			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0 && xhr.status != 404) {
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined) {
						bb = bb.textContent
						bb = bb.replace(' img', '')
						bb = bb.replace(' images', '')
						bb = bb.replace(' pages', '')
					} else {
						bb = 0
					}
					
					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
						"pages": Number(bb),
						"url": gg
					})
				}

				if (random == true) {
					arr.random = []
					li = htmlDoc.getElementsByClassName('main')[0].children
					for (var i=2; i<=13; i++) {
						gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
						bb = li[i].getElementsByClassName('th-time icon-l')[0]
						if (bb != undefined) {
							bb = bb.textContent
							bb = bb.replace(' img', '').replace(' images', '').replace(' pages', '')
						} else {
							bb = 0
						}

						arr.random.push({
							"id": this.lastSlash(gg),
							"title": li[i].getElementsByClassName('th-title')[0].textContent,
							"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
							"pages": Number(bb),
							"url": gg
						})
					}
				}

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
							pPage = Number(li[i].getAttribute('href').replace(this.baseURL+'/page/', '').replace('/', ''))
						
						
						arr.pagination.push([value, pPage])
					}
				}

				if (category == true) {
					arr.categories = []
					var li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
					var regexp = RegExp('/', 'g')
					for (var i=0; i<li.length; i++) {
						arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(regexp, '') })
					}
				}
			} else
				arr = null

			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}

	getCategories(callback) {
		const url = this.baseURL+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)

		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')

			var arr = []
			var li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a')
			var regexp = RegExp('/', 'g')
			for (var i=0; i<li.length; i++) {
				arr.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL, '').replace(regexp, '') })
			}

			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}

	getComic(id, raw, callback) {
		raw = raw || false
		const url = this.baseURL+'/'+id
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)

		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')

			var arr = {}
			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('full-in')
			if (li.length != 0 && xhr.status != 404) {
				var gg = 0
				arr.title = li[0].getElementsByTagName('h1')[0].textContent
				arr.images = []
				var info = li[0].getElementsByClassName('full-tags')

				// Groups
				if (info[0].children.length > 0) {
					arr.groups = []
					var t = info[0].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						gg = t[i].getAttribute('href')
						arr.groups.push({
							"name": t[i].textContent,
							"url": gg
						})
					}
				}

				// Artist
				if (info[1].children.length > 0) {
					arr.artists = []
					var t = info[1].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						gg = t[i].getAttribute('href')
						arr.artists.push({
							"name": t[i].textContent,
							"url": gg
						})
					}
				}

				// Parody
				if (info[2].children.length > 0) {
					arr.parody = []
					var t = info[2].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						gg = t[i].getAttribute('href')
						arr.parody.push({
							"name": t[i].textContent,
							"url": gg
						})
					}
				}

				// Tags
				if (info[3].children.length > 0) {
					arr.tags = []
					var t = info[3].getElementsByTagName('a')
					for (var i=0; i<t.length; i++) {
						gg = t[i].getAttribute('href')
						arr.tags.push({
							"name": t[i].textContent,
							"url": gg
						})
					}
				}

				// Images
				var gg = li[0].getElementsByClassName('f-desc full-text clearfix')[0].getElementsByTagName('img')
				var bb = 0
				if (raw == true) {
					for (var i=0; i<gg.length; i++) {
						bb = this.baseURL+gg[i].getAttribute('data-src');
						arr.images.push({
							"src": bb.replace("/thumbs/", "/"),
							"thumb": bb
						})
					}
				} else {
					for (var i=0; i<gg.length; i++) {
						bb = gg[i].getAttribute('data-src')
						arr.images.push({
							"src": bb.replace("/thumbs/", "/"),
							"thumb": bb
						})
					}
				}
			} else
				arr = null
			
			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}

	getAllTags(callback) {
		const url = this.baseURL+'/tags/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)

		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')

			var arr = []
			var gg = 0
			var li = htmlDoc.getElementsByClassName('clouds_xsmall')
			for (var i=0; i<li.length; i++) {
				gg = li[i].children[0]
				arr.push({
					"name": gg.textContent,
					"url": gg.getAttribute('href')
				})
			}

			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}

	getGroup(name, options = {page:1, pagination:true}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const url = this.baseURL+this.groupURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback to Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)

		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')
			var gg = 0
			var bb = 0
	
			var arr = { "content": [] }
			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0 && xhr.status != 404) {

				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined) {
						bb = bb.textContent;
						bb = bb.replace(' img', '')
						bb = bb.replace(' images', '')
						bb = bb.replace(' pages', '')
					} else
						bb = 0
	
					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
						"pages": Number(bb),
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
							else
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.groupURL+name+'/page/').replace(' ', '%20'), '').replace('/', ''))
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			} else
				arr = null
			
			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}

	getArtist(name, options = {page:1, pagination:true}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const url = this.baseURL+this.artistURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)

		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')
			var gg = 0
			var bb = 0

			var arr = { "content": [] }
			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0 && xhr.status != 404) {

				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined) {
						bb = bb.textContent
						bb = bb.replace(' img', '')
						bb = bb.replace(' images', '')
						bb = bb.replace(' pages', '')
					} else
						bb = 0

					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
						"pages": Number(bb),
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
							else
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.artistURL+name+'/page/').replace(' ', '%20'), '').replace('/', ''))
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			} else
				arr = null

			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}

	getParody(name, options = {page:1, pagination:true}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const url = this.baseURL+this.parodyURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)

		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')
			var gg = 0
			var bb = 0

			var arr = { "content": [] }
			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0 && xhr.status != 404) {

				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined) {
						bb = bb.textContent;
						bb = bb.replace(' img', '')
						bb = bb.replace(' images', '')
						bb = bb.replace(' pages', '')
					} else
						bb = 0

					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
						"pages": Number(bb),
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
							else
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.parodyURL+name+'/page/').replace(' ', '%20'), '').replace('/', ''))
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			} else
				arr = null

			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}

	getTag(name, options = {page:1, pagination:true}, callback) {
		name = name || null
		if (name == null) throw "You can't Set name to Null."
		const page = options.page || 1
		const pagination = options.pagination || true
		const url = this.baseURL+this.tagURL+name+'/page/'+page+'/'
		callback = callback || null

		if (callback == null) throw "You can't Set Callback as Null."
		if (typeof callback != 'function') throw "The Type of Callback Should Be a Function."

		var xhr = new XMLHttpRequest()
		xhr.open("GET", url, true)

		xhr.timeout = 4000

		xhr.onload = () => {
			var parser = new DOMParser()
			var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html')
			var gg = 0
			var bb = 0

			var arr = { "content": [] }
			var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in')
			if (li.length != 0 && xhr.status != 404) {

				// Contents
				for (var i=0; i<li.length; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href')
					bb = li[i].getElementsByClassName('th-time icon-l')[0]
					if (bb != undefined) {
						bb = bb.textContent
						bb = bb.replace(' img', '')
						bb = bb.replace(' images', '')
						bb = bb.replace(' pages', '')
					} else
						bb = 0

					arr.content.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
						"pages": Number(bb),
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
							else
								pPage = Number(li[i].getAttribute('href').replace((this.baseURL+this.tagURL+name+'/page/').replace(' ', '%20'), '').replace('/', ''))
							
							arr.pagination.push([value, pPage])
						}
					}
				}
			} else
				arr = null

			callback(null, arr)
		}

		xhr.ontimeout = (e) => {
			callback("Connection Timeout", null)
		}

		xhr.onerror = () => {
			callback("An error occurred during the proceres", null)
		}

		xhr.send()
	}
}