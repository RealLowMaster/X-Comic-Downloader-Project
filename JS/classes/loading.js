class Loading {
	#saveProcress = 0
	#loading
	#txt
	#procress

	constructor(times) {
		this.times = (100/times)
		this.id = `${new Date().getTime()}${Math.floor(Math.random() * 9)}`
		this.#loading = document.createElement('div')
		this.#loading.setAttribute('id', this.id)
		this.#txt = document.createElement('p')
		this.#txt.innerText = 'Loading...'
		this.#procress = document.createElement('div')
		this.#loading.setAttribute('class', 'waiting-loading')
		this.#loading.appendChild(this.#txt)
		const miniElement = document.createElement('div')
		miniElement.appendChild(this.#procress)
		this.#loading.appendChild(miniElement)
		document.body.appendChild(this.#loading)
	}

	forward(text) {
		if (text != undefined) this.#txt.innerText = text
		this.#saveProcress += this.times
		this.#procress.style.width = this.#saveProcress+'%'
	}

	changePercent(times) {
		this.times = (100/times)
	}

	reset(times) {
		this.hide()
		if (times != undefined) this.times = (100/times)
		this.#loading.style.backgroundColor = '#000d'
		this.#txt.style.color = '#fff'
		this.#txt.innerText = 'Loading...'
		this.#saveProcress = 0
		this.#procress.style.width = 0
	}

	hide() { this.#loading.style.display = 'none' }

	show(text, bgColor, color) {
		if (text != undefined) this.#txt.innerText = text
		if (bgColor != undefined) this.#loading.style.backgroundColor = bgColor
		if (color != undefined) this.#txt.style.color = color
		this.#loading.style.display = 'flex'
	}

	remove() {
		this.#loading.remove()
	}
}