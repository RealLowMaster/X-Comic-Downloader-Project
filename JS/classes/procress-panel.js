class ProcressPanel {
	#saveProcress = 0
	#constainer
	#closeBtn
	#miniLogContainer
	#logContainer
	#txt
	#procress

	constructor(times = 0) {
		this.times = (100/times)
		this.id = `pp${new Date().getTime()}`
		this.#constainer = document.createElement('div')
		this.#constainer.setAttribute('id', this.id)
		this.#constainer.classList.add('procress-panel')
		let elementContainer = document.createElement('div')
		this.#constainer.appendChild(elementContainer)
		this.#closeBtn = document.createElement('button')
		this.#closeBtn.setAttribute('type', 'button')
		this.#closeBtn.setAttribute('onclick', "this.parentElement.style.display='none'")
		this.#closeBtn.innerText = 'X'
		this.#constainer.appendChild(this.#closeBtn)
		elementContainer = document.createElement('div')
		this.#miniLogContainer = document.createElement('div')
		elementContainer.appendChild(this.#miniLogContainer)
		let bigElement = document.createElement('div')
		this.#logContainer = document.createElement('div')
		bigElement.appendChild(this.#logContainer)
		let element = document.createElement('div')
		this.#txt = document.createElement('p')
		this.#txt.innerText = 'Waiting...'
		element.appendChild(this.#txt)
		let miniElement = document.createElement('div')
		this.#procress = document.createElement('div')
		miniElement.appendChild(this.#procress)
		element.appendChild(miniElement)
		bigElement.appendChild(element)
		elementContainer.appendChild(bigElement)
		this.#constainer.appendChild(elementContainer)
		document.body.appendChild(this.#constainer)
	}

	forward(text) {
		if (text != undefined) this.#txt.innerText = text
		this.#saveProcress += this.times
		this.#procress.style.width = this.#saveProcress+'%'
	}

	changePercent(times = 0) {
		this.times = (100/times)
	}

	add(text, color) {
		color = color || 'success'
		const element = document.createElement('div')

		element.textContent = text
		element.classList.add('pp-log')
		element.classList.add(`pp-${color}`)

		this.#logContainer.appendChild(element)
	}

	addMini(text, color) {

	}

	clear() {

	}

	clearMini() {

	}

	reset(times = 0) {
		this.hide()
		this.clear()
		this.clearMini()
		if (times != undefined) this.times = (100/times)
		this.#txt.innerText = 'Waiting...'
		this.#saveProcress = 0
		this.#procress.style.width = 0
	}

	hide() { this.#constainer.style.display = 'none' }

	show(text) {
		if (text != undefined) this.#txt.textContent = text
		this.#constainer.style.display = 'flex'
	}

	config(config = { miniLog:false, bgClose:false, closeBtn:false }) {
		const closeBtn = config.closeBtn || false

		if (config.miniLog != undefined) {
			if (config.miniLog) this.#constainer.setAttribute('mini', true)
			else this.#constainer.removeAttribute('mini')
		}

		if (config.bgClose != undefined) {
			if (config.bgClose) this.#constainer.children[0].setAttribute('onclick', "this.parentElement.style.display='none'")
			else this.#constainer.children[0].removeAttribute('onclick')
		}

		if (config.closeBtn != undefined) {
			if (config.closeBtn) this.#closeBtn.style.display = 'flex'
			else this.#closeBtn.style.display = 'none'
		}
	}

	remove() {
		this.#constainer.remove()
	}
}