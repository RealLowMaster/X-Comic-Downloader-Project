class HotKeyManager {
	#backwardIndex
	#index
	#categories
	#categoriesName
	#public
	#watching

	constructor() {
		this.#backwardIndex = null
		this.#index = null
		this.#categories = []
		this.#categoriesName = []
		this.#public = []
		this.#watching = false
		this.use_public = false
		this.stop = false
		this.saved_category = []
		window.addEventListener('keydown', e => {
			this.CheckKeys(e)
			if (this.use_public) this.CheckPublic(e)
		})
	}

	AddPublicHotKey(ctrl, shift, alt, key, job) {
		if (typeof ctrl !== 'boolean') throw "ctrl Type Should Be Boolean"
		if (typeof shift !== 'boolean') throw "shift Type Should Be Boolean"
		if (typeof alt !== 'boolean') throw "alt Type Should Be Boolean"
		if (typeof key !== 'number') throw "key Type Should Be Number (int)"
		if (typeof job !== 'string' && typeof job !== 'function') throw "Job Type Should Be String/Function"
		this.#public.push([ctrl, shift, alt, key, job])
	}

	CheckPublic(event) {
		if (this.stop) return
		const l = this.#public.length
		if (l == 0) return
		for (let i = 0; i < l; i++) {
			if (event.ctrlKey != this.#public[i][0]) continue
			if (event.shiftKey != this.#public[i][1]) continue
			if (event.altKey != this.#public[i][2]) continue
			if (event.keyCode != this.#public[i][3]) continue
			event.preventDefault()
			if (typeof this.#public[i][4] === 'function') this.#public[i][4]()
			else try { eval(this.#public[i][4]) } catch(err) { console.error(err) }
 			break
		}
	}

	AddCategory(name) {
		if (name.replace(/ /g, '').length == 0) throw "Name is Required"
		if (this.#categoriesName.indexOf(name.toLowerCase()) > -1) throw "Category Already Exists"
		const index = this.#categoriesName.length
		this.#categoriesName[index] = name.toLowerCase()
		this.#categories[index] = [[],[],[],[],[]]
	}

	AddHotKey(category, ctrl, shift, alt, key, job) {
		if (typeof ctrl !== 'boolean') throw "ctrl Type Should Be Boolean"
		if (typeof shift !== 'boolean') throw "shift Type Should Be Boolean"
		if (typeof alt !== 'boolean') throw "alt Type Should Be Boolean"
		if (typeof key !== 'number') throw "key Type Should Be Number (int)"
		if (typeof job !== 'string' && typeof job !== 'function') throw "Job Type Should Be String/Function"
		if (typeof category === 'number') {
			if (this.#categories[category] == undefined || this.#categories[category] == null) throw "Category Not Found."
		} else if (typeof category === 'string') {
			const cat_index = this.#categoriesName.indexOf(category.toLowerCase())
			if (cat_index < 0) throw "Category Not Found"
			category = cat_index
		} else throw "Category Type Should Be Number (int) Or String"
		const index = this.#categories[category][0].length
		this.#categories[category][0][index] = ctrl
		this.#categories[category][1][index] = shift
		this.#categories[category][2][index] = alt
		this.#categories[category][3][index] = key
		this.#categories[category][4][index] = job
	}

	ChangeCategory(NameOrNumber) {
		let index
		
		if (NameOrNumber == null) index = null
		else if (typeof NameOrNumber === 'number') {
			if (this.#categories[NameOrNumber] == undefined || this.#categories[NameOrNumber] == null) throw "Category Not Found."
		} else {
			index = this.#categoriesName.indexOf(NameOrNumber.toLowerCase())
			if (index < 0) throw "Couldn't Find Category"
		}
		this.#backwardIndex = this.#index
		this.#index = index
	}

	BackwardCategory() {
		const saveIndex = this.#backwardIndex
		this.#backwardIndex = this.#index
		this.#index = saveIndex
	}

	CheckKeys(event) {
		if (this.#watching) {
			console.log({KeyName:event.key,KeyCode:event.keyCode,isCtrl:event.ctrlKey,isShift:event.shiftKey,isAlt:event.altKey})
			return
		}
		if (this.stop) return
		if (this.#index == null) return
		const key = event.keyCode, ctrl = event.ctrlKey, shift = event.shiftKey, alt = event.altKey
		const index = this.#categories[this.#index][3].indexOf(key)

		if (index < 0) return
		if (ctrl != this.#categories[this.#index][0][index]) return
		if (shift != this.#categories[this.#index][1][index]) return
		if (alt != this.#categories[this.#index][2][index]) return

		event.preventDefault()
		
		if (typeof this.#categories[this.#index][4][index] === 'function') this.#categories[this.#index][4][index]()
		else eval(this.#categories[this.#index][4][index])
	}

	SaveCategory(index = 0, value = null) { this.saved_category[index] = value == null ? this.#index : value }
	LoadCategory(index = 0) { this.#index = this.saved_category[index] }

	Watching() {
		this.#watching = !this.#watching
		console.log("Watching Mode "+(this.#watching ? "on" : "off"))
	}
}

class Loading {
	#element
	#text
	#slider
	#max
	#percent
	#times

	constructor() {
		this.#element = null
		this.#text = null
		this.#slider = null
		this.#max = 0
		this.#percent = 0
		this.#times = 0
	}

	Show(per, txt = 'Loading...') {
		if (typeof per !== 'number') throw "Percent Should Be Number (int)."
		if (this.#element != null) this.Close()
		KeyManager.stop = true
		this.#max = per
		this.#times = 100 / per
		this.#percent = 0
		const element = document.createElement('div')
		element.classList.add('loading')
		this.#text = document.createElement('p')
		this.#text.innerText = txt
		element.appendChild(this.#text)
		const procress = document.createElement('div')
		this.#slider = document.createElement('div')
		procress.appendChild(this.#slider)
		element.appendChild(procress)
		this.#element = element
		document.body.appendChild(element)
	}

	Close() {
		if (this.#element == null) return
		try { this.#element.remove() } catch(err) { console.error(err) }
		this.#element = null
		this.#text = null
		this.#slider = null
		this.#max = 0
		this.#times = 0
		this.#percent = 0
		KeyManager.stop = false
	}

	Backward(txt) {
		this.#percent--
		if (this.#percent < 0) this.#percent = 0
		this.#slider.style.width = (this.#percent * this.#times)+'%'
		if (txt != null) this.#text.innerText = txt
	}

	Forward(txt) {
		this.#percent++
		if (this.#percent > this.#max) this.#percent = this.#max
		this.#slider.style.width = (this.#percent * this.#times)+'%'
		if (txt != null) this.#text.innerText = txt
	}

	ChangePercent(per) {
		if (this.#element == null) return
		if (typeof per !== 'number') throw "Percent Should Be Number (int)."
		this.#max = per
		this.#times = 100 / per
		if (this.#percent > per) this.#percent = per
		this.#slider.style.width = (this.#percent * this.#times)+'%'
	}

	Change(index, txt) {
		if (index != null) {
			if (index < 0) index = 0
			if (index > this.#max) index = this.#max
			this.#percent = index
			this.#slider.style.width = (index * this.#times)+'%'
		}
		if (txt != null) this.#text.innerText = txt
	}

	Text(txt) {
		this.#text.innerText = txt;
	}
}

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
		this.#constainer.children[0].setAttribute('onclick', "this.parentElement.style.display='none'")
		this.#closeBtn.setAttribute('onclick', "this.parentElement.style.display='none'")
	}

	hide() { this.#constainer.style.display = 'none' }

	show(text) {
		if (text != undefined) this.#txt.innerHTML = text
		this.#constainer.style.display = 'flex'
	}

	text(text) {
		this.#txt.innerHTML = text
	}

	config(config = { miniLog:false, miniSize:30, bgClose:false, closeBtn:false, closeEvent:'event' }) {
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

		if (config.closeEvent != undefined) {
			this.#constainer.children[0].setAttribute('onclick', config.closeEvent)
			this.#closeBtn.setAttribute('onclick', config.closeEvent)
		}
	}

	remove() {
		this.#constainer.remove()
	}
}

class ContextMenuManager {
	#menu
	#menuNames
	#menuOptions
	#element

	constructor() {
		this.#menu = []
		this.#menuNames = []
		this.#menuOptions = []
		this.#element = null
		this.save = null
		window.addEventListener('mouseup', e => { if (this.#element != null && e.which == 1) this.CloseMenu() })
		window.addEventListener('click', () => { if (this.#element != null) this.CloseMenu() })
		window.addEventListener('wheel', () => { if (this.#element != null) this.CloseMenu() })
		window.addEventListener('resize', () => { if (this.#element != null) this.CloseMenu() })
		window.addEventListener('keydown', () => { if (this.#element != null) this.CloseMenu() })
	}

	AddEvent(menu, element, save = null) {
		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"

		if (typeof element === 'string') {
			const ele = document.getElementById(element) || null
			if (ele == null) throw "Element Not Found!"
			ele.addEventListener('contextmenu', () => {this.ShowMenu(menu, save)})
		} else if (typeof element === 'object') {
			try {
				element.addEventListener('contextmenu', () => { this.ShowMenu(menu, save) })
			} catch(err) {
				throw err
			}
		} else throw "Element Not Found!"
	}

	AddMenu(name, useLanguageAlign = false, rtl = false) {
		if (name == null || name.replace(/ /g, '').length == 0) throw "Name is Required."
		if (this.#menuNames.indexOf(name.toLowerCase()) > -1) throw "Menu Already Exists."
		if (typeof useLanguageAlign !== 'boolean') throw "Use Language Align Should Be Boolean."
		if (!useLanguageAlign) {
			if (typeof rtl !== 'boolean') throw "rtl Should Be Boolean."
		} else rtl = null



		const index = this.#menuNames.length
		this.#menuNames[index] = name.toLowerCase()
		this.#menuOptions[index] = [useLanguageAlign, rtl]
		this.#menu[index] = []
		return index
	}

	ConfigMenu(menu, useLanguageAlign = false, rtl = false) {
		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"

		if (typeof useLanguageAlign !== 'boolean') throw "Use Language Align Should Be Boolean."
		if (!useLanguageAlign) {
			if (typeof rtl !== 'boolean') throw "rtl Should Be Boolean."
		} else rtl = null

		this.#menuOptions[menu] = [useLanguageAlign, rtl]
	}

	AddItem(menu, config) {
		if (typeof config !== 'object') throw "Config Type Should Be Object"

		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"

		const obj = {}
		if (typeof config.text === 'string' && config.text.replace(/ /g, '').length > 0) {
			obj.text = config.text
			if (typeof config.active === 'boolean') obj.active = config.active
			else obj.active = true
			if (config.click != null) {
				if (typeof config.click === 'string' || typeof config.click === 'function') obj.click = config.click
				else throw "Click Should Be String or Function!"
			}
			if (typeof config.icon === 'string') obj.icon = config.icon
			else obj.icon = null
		}
		this.#menu[menu].push(obj)
	}

	SetActiveItem(menu, index, state) {
		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"
		if (typeof index !== 'number') throw "Index should be Number (int)"
		if (typeof state !== 'boolean') throw "State should be boolean"
		if (this.#menu[menu][index] != null) {
			this.#menu[menu][index].active = state
		}
	}

	RemoveMenu(menu) {
		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"
		this.#menu.splice(menu, 1)
		this.#menuNames.splice(menu, 1)
		this.#menuOptions.splice(menu, 1)
	}

	RemoveItem(menu, index) {
		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"
		if (index >= this.menu[menu].length) return
		this.menu[menu].splice(index, 1)
	}

	ConfigItem(menu, index, config) {
		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"
		if (index >= this.menu[menu].length) return

		const obj = {}
		if (typeof config.text === 'string' || config.text.replace(/ /g, '').length > 0) {
			obj.text = config.text
			if (typeof config.active === 'boolean') obj.active = config.active
			else obj.active = true
			if (config.click != null) {
				if (typeof config.click === 'string' || typeof config.click === 'function') obj.click = config.click
				else throw "Click Should Be String or Function!"
			}
			if (typeof config.icon === 'string') obj.icon = config.icon
			else obj.icon = null
		}
		this.#menu[menu][index] = obj
	}

	ShowMenu(menu, saver = null) {
		if (typeof menu === 'number') {
			if (this.#menu[menu] == undefined || this.#menu[menu] == null) throw "Menu Not Found."
		} else if (typeof menu === 'string') {
			const cat_index = this.#menuNames.indexOf(menu.toLowerCase())
			if (cat_index < 0) throw "Menu Not Found"
			menu = cat_index
		} else throw "Menu Type Should Be Number (int) Or String"
		this.CloseMenu()
		const e = window.event

		const container = document.createElement('div')
		container.classList.add('context-menu')
		let save

		for (let i = 0, l = this.#menu[menu].length; i < l; i++) {
			if (this.#menu[menu][i].active) {
				if (this.#menu[menu][i].text != undefined) {
					if (this.#menu[menu][i].click != undefined) {
						save = document.createElement('div')
						if (this.#menu[menu][i].icon !== null) {
							const icon = Icon(this.#menu[menu][i].icon, true)
							if (icon != null) save.appendChild(icon)
							const save2 = document.createElement('span')
							save2.innerText = Language(this.#menu[menu][i].text)
							save.appendChild(save2)
						} else save.innerText = Language(this.#menu[menu][i].text)
						
						
						if (typeof this.#menu[menu][i].click === 'string') save.onmousedown = e => { if (e.which != 2) eval(this.#menu[menu][i].click); this.CloseMenu() }
						else if (typeof this.#menu[menu][i].click === 'function') save.onmousedown = e => { if (e.which != 2) this.#menu[menu][i].click(); this.CloseMenu() }
						container.appendChild(save)
					} else {
						save = document.createElement('p')
						save.innerText = Language(this.#menu[menu][i].text)
						container.appendChild(save)
					}
				} else {
					save = document.createElement('span')
					container.appendChild(save)
				}
			}
		}
		if (saver != null) this.save = saver
		document.body.appendChild(container)
		this.#element = container
		let x = e.clientX, y = e.clientY
		if (window.innerWidth <= x+container.clientWidth) x = window.innerWidth - container.clientWidth
		if (window.innerHeight <= y+container.clientHeight) y = window.innerHeight - container.clientHeight
		container.style.top = y+'px'
		container.style.left = x+'px'
	}

	CloseMenu() {
		if (this.#element == null) return
		try { this.#element.remove() } catch(err) { console.error(err) }
		this.#element = null
	}
}