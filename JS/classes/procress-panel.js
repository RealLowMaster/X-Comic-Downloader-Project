class ProcressPanel {
	#saveProcress = 0
	#constainer
	#closeBtn
	#secendSide
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
		this.#secendSide = document.createElement('div')
		this.#logContainer = document.createElement('div')
		this.#secendSide.appendChild(this.#logContainer)
		let element = document.createElement('div')
		this.#txt = document.createElement('p')
		this.#txt.innerText = 'Waiting...'
		element.appendChild(this.#txt)
		let miniElement = document.createElement('div')
		this.#procress = document.createElement('div')
		miniElement.appendChild(this.#procress)
		element.appendChild(miniElement)
		this.#secendSide.appendChild(element)
		elementContainer.appendChild(this.#secendSide)
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

		element.innerHTML = text
		element.classList.add('pp-log')
		element.classList.add(`pp-${color}`)

		this.#logContainer.appendChild(element)
	}

	addMini(text, color) {
		color = color || 'success'
		const element = document.createElement('div')

		element.innerHTML = text
		element.classList.add('pp-log')
		element.classList.add(`pp-${color}`)

		this.#miniLogContainer.appendChild(element)
	}

	clear() {
		this.#logContainer.innerHTML = ''
	}

	clearMini() {
		this.#miniLogContainer.innerHTML = ''
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
		if (text != undefined) this.#txt.innerHTML = text
		this.#constainer.style.display = 'flex'
	}

	text(text) {
		this.#txt.innerHTML = text
	}

	config(config = { miniLog:false, miniSize:30, bgClose:false, closeBtn:false }) {
		if (config.miniLog != undefined) {
			if (config.miniLog) {
				this.#constainer.setAttribute('mini', true)
				if (config.miniSize != null && typeof(config.miniSize) == 'number') {
					this.#miniLogContainer.style.flex = `0 0 ${config.miniSize}%`
					this.#miniLogContainer.style.maxWidth = `${config.miniSize}%`
					this.#secendSide.style.flex = `0 0 ${100 - config.miniSize}%`
					this.#secendSide.style.maxWidth = `${100 - config.miniSize}%`
				} else {
					this.#miniLogContainer.style.flex = '0 0 30%'
					this.#miniLogContainer.style.maxWidth = '30%'
					this.#secendSide.style.flex = '0 0 70%'
					this.#secendSide.style.maxWidth = '70%'
				}
			} else {
				this.#constainer.removeAttribute('mini')
				this.#miniLogContainer.style.flex = '0 0 0'
				this.#miniLogContainer.style.maxWidth = '0'
				this.#secendSide.style.flex = '0 0 100%'
				this.#secendSide.style.maxWidth = '100%'
			}
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