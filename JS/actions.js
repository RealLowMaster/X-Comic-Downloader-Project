function error(txt, onclick, t1) {
	var err = txt.toString()
	if (t1 != null) err = err.replace(/{var1}/gi, t1)
	err = err.replace(/\n/gi, '<br>')
	var element = document.createElement('div')
	element.classList.add('error')

	var html = `<div></div><div><p>${err}</p>`
	if (onclick == null) {
		html += `<button class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">OK</button></div></div>`
	} else {
		html += `<button onclick="${onclick}">OK</button></div>`
	}
	element.innerHTML = html

	document.getElementsByTagName('body')[0].appendChild(element)
}

function errorSelector(txt, t1, bgClose, buttons) {
	var err = txt || null
	if (t1 != null && err != null) err = err.replace(/{var1}/gi, t1)
	if (err != null) err = err.replace(/\n/gi, '<br>')
	const element = document.createElement('div')
	element.classList.add('error')

	bgClose = bgClose || false
	var bgCloseValue = ''
	if (bgClose == true) bgCloseValue = `this.parentElement.remove()`
	var html = `<div onclick="${bgCloseValue}"></div><div style="text-align:center">`
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