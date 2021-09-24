class nHentaiAPI {
	#status = [403, 404, 500, 503]
	#statusMessage = [
		"You don't have the permission to View this Page.",
		"Page Not Found.",
		"Internal Server Error.",
		"Server is unavailable at this Time."
	]

	constructor() {
		this.baseURL = 'https://nhentai.net'
		this.groupURL = ''
		this.artistURL = ''
		this.parodyURL = ''
		this.tagURL = ''
		this.searchURL = ''
	}

	getPage(page = 1, callback = function(){}) {
		page = page || 1
		callback = callback || null
		const url = this.baseURL+'/?page='+page

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
			const htmlDoc = new DOMParser().parseFromString(html, 'text/html').body
			const arr = {}
			const slashReg = new RegExp('/', 'g')
			let container, child, save, save2, save3

			container = htmlDoc.getElementsByClassName('index-container')
			// Popular
			if (page == 1) {
				arr.popular = []
				child = container[0].children
				for (let i = 1; i < child.length; i++) {
					save = child[i].dataset.tags
					if (save.indexOf('12227') != -1) save = 'English'
					else if (save.indexOf('29963') != -1) save = 'Chinese'
					else if (save.indexOf('6346') != -1) save = 'Japanese'
					else save = null

					save2 = child[i].children[0]
					save3 = save2.children
					arr.popular.push({
						id: Number(save2.getAttribute('href').replace('/g/', '').replace('/', '')),
						thumb: save3[0].getAttribute('data-src'),
						title: save3[2].innerText,
						lang: save
					})
				}
				child = container[1].children
			} else  child = container[0].children

			// Content
			arr.content = []
			for (let i = 1; i < child.length; i++) {
				save = child[i].dataset.tags
				if (save.indexOf('12227') != -1) save = 'English'
				else if (save.indexOf('29963') != -1) save = 'Chinese'
				else if (save.indexOf('6346') != -1) save = 'Japanese'
				else save = null

				save2 = child[i].children[0]
				save3 = save2.children
				arr.content.push({
					id: Number(save2.getAttribute('href').replace('/g/', '').replace('/', '')),
					thumb: save3[0].getAttribute('data-src'),
					title: save3[2].innerText,
					lang: save
				})
			}

			// Pagination
			arr.pagination = null
			child = htmlDoc.getElementsByClassName('pagination')
			if (child.length > 0) {
				arr.pagination = []
				child = child[0].children
				for (let i = 0; i < child.length; i++) {

					save3 = child[i].classList
					if (save3.contains('page')) {
						if (save3.contains('current')) { arr.pagination.push([child[i].innerText, null]); continue }
						else save = child[i].innerText
					} else {
						if (save3[0] == 'first') save = '<<'
						else if (save3[0] == 'previous') save = '<'
						else if (save3[0] == 'next') save = '>'
						else if (save3[0] == 'last') save = '>>'
						else continue
					}

					save2 = Number(child[i].getAttribute('href').replace('/?page=', ''))
					arr.pagination.push([save, save2])
				}
			}

			callback(null, arr)
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') err = 'Connection Timeout, Check Internet Connection.'
			callback(err, null)
		})
	}
}