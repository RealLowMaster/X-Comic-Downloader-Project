class Tab {
	constructor(id, scroll, search, jumpPage, thisPage, maxPage, site, isReloading, element, pageElement) {
		this.id = id
		this.history = []
		this.activeHistory = 0
		this.sc = scroll
		this.s = search
		this.jp = jumpPage
		this.tp = thisPage
		this.mp = maxPage
		this.site = site
		this.ir = isReloading
		this.tab = element
		this.span = element.children[0]
		this.page = pageElement
		this.options = null
	}

	addHistory(text) {
		if (this.activeHistory < this.history.length - 1) {
			var ind = this.activeHistory
			this.history = this.history.filter((value, index, arr) => { 
				return index <= ind
			})
		}

		this.activeHistory += 1
		this.history.push(text)
	}

	prev() {
		if (this.activeHistory != 0) {
			this.activeHistory -= 1
			eval(this.history[this.activeHistory])
		}
	}

	next() {
		if (this.activeHistory != this.history.length - 1) {
			this.activeHistory += 1
			eval(this.history[this.activeHistory])
		}
	}

	reload() {
		if (this.ir == false) {
			this.ir = true
			eval(this.history[this.activeHistory])
		}
	}

	rename(name, isText) {
		if (isText) {
			this.span.innerText = name
			this.tab.setAttribute('title', name)
		} else {
			this.span.innerHTML = name
			this.tab.removeAttribute('title')
		}
	}
}