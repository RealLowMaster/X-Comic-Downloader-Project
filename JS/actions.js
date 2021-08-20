function error(txt, onclick, t1) {
	let err = txt.toString()
	if (t1 != null) err = err.replace(/{var1}/gi, t1)
	err = err.replace(/\n/gi, '<br>')
	const element = document.createElement('div')
	element.classList.add('action-error')

	let html = `<div></div><div><p>${err}</p>`
	if (onclick == null) html += `<button class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">OK</button></div></div>`
	else html += `<button onclick="${onclick}">OK</button></div>`
	element.innerHTML = html

	document.getElementsByTagName('body')[0].appendChild(element)
}

function errorSelector(txt, t1, bgClose, buttons) {
	let err = txt || null
	if (t1 != null && err != null) err = err.replace(/{var1}/gi, t1)
	if (err != null) err = err.replace(/\n/gi, '<br>')
	const element = document.createElement('div')
	element.classList.add('action-error')

	bgClose = bgClose || false
	let bgCloseValue = ''
	if (bgClose == true) bgCloseValue = `this.parentElement.remove()`
	let html = `<div onclick="${bgCloseValue}"></div><div style="text-align:center">`
	if (err != null) html += `<p>${err}</p>`
	
	buttons = buttons || null
	if (buttons != null && typeof(buttons) == 'object') for (let i=0; i<buttons.length; i++) {
		let name = buttons[i][0] || 'Ok'
		let classes = buttons[i][0] || 'btn btn-danger m-2'
		let onclick = buttons[i][2] || 'this.parentElement.parentElement.remove()'
		let style = buttons[i][3] || ''
		html += `<button class="${classes}" style="${style}" onclick="${onclick}">${name}</button>`
	}
	html += '</div>'
	element.innerHTML = html

	document.getElementsByTagName('body')[0].appendChild(element)
}

function errorList(list, style) {
	const element = document.createElement('div')
	element.classList.add('action-error-list')
	if (style) element.classList.add(style)

	let html = `<div onclick="this.parentElement.remove()"></div><div>`
	for (let i = 0; i < list.length; i++) {
		html += `<div>${list[i]}</div>`
	}
	html += '</div>'
	element.innerHTML = html

	document.getElementsByTagName('body')[0].appendChild(element)
}