let temp_theme_names = null, temp_theme_values = null, isAddingThemeAttr = false, temp_theme_info = null, temp_active_theme_index = null

function OpenThemeManager() {
	temp_theme_names = themes_names
	temp_theme_values = themes_values
	if (temp_theme_values.length == 0) temp_theme_values[0] = []
	let html = ''
	for (let i = 0; i < temp_theme_values.length; i++) html += `<option value="${i}">${i}</option>`
	document.getElementById('theme-index-selector').innerHTML = html
	ThemeIndexSelector(0)
	document.getElementById('theme-manager').style.display = 'block'
}

function CloseThemeManager() {
	temp_theme_names = null
	temp_theme_values = null
	isAddingThemeAttr = null
	temp_theme_info = null
	temp_active_theme_index = null
	document.getElementById('theme-manager').style.display = 'none'
	document.getElementById('theme-container').innerHTML = null
	document.getElementById('theme-index-selector').innerHTML = null
}

function SaveThemeManager() {
	if (temp_theme_names == null) return
	document.getElementById('theme-container').innerHTML = null
	document.getElementById('theme-index-selector').innerHTML = null
	loading.reset(0)
	loading.show('Saving...')
	let content = 'const themes_names=['
	for (let i = 0; i < temp_theme_names.length; i++) content += `'${temp_theme_names[i]}',`
	content += '],themes_values=['

	for (let i = 0; i < temp_theme_values.length; i++) {
		content += '['
		for (let j = 0; j < temp_theme_names.length; j++) {
			if (temp_theme_values[i][j] == null) {
				for (let x = 0; x < temp_theme_values.length; x++) {
					if (temp_theme_values[x][j] != null) temp_theme_values[i][j] = temp_theme_values[x][j]
					break
				}
				if (temp_theme_values[i][j] == null) temp_theme_values[i][j] = '0'
			}
			content += `'${temp_theme_values[i][j]}',`
		}
		content += '],'
	}

	content += ']'
	try {
		fs.writeFileSync('js/theme-database.js', content)
		CloseThemeManager()
		loading.hide()
		// remote.getCurrentWebContents().reload()
	} catch(err) {
		error('SavingThemeData->Err: '+err)
		console.error(err)
	}
}

function ThemeIndexSelector(index) {
	document.getElementById('theme-index-selector').value = index
	temp_active_theme_index = index
	const container = document.getElementById('theme-container')
	const add_btn = document.getElementById('theme-add-btn')
	add_btn.setAttribute('disabled', true)
	container.innerHTML = 'Loading...'
	setTimeout(() => {
		let html = ''
		const id = `${new Date().getTime()}-${Math.floor(Math.random() * 999)}`
		for (let i = 0; i < temp_theme_names.length; i++) {
			let value = temp_theme_values[index][i]
			if (value == null) value = ''
			html += `<div id="${id}"><p title="${temp_theme_names[i]}">${temp_theme_names[i]}</p><input type="text" placeholder="Value..." oninput="ChangeThemeAttributeValue(${temp_active_theme_index}, ${i}, this.value)" value="${value}"><button type="button" onclick="AskForRemovingThemeAttribute(${i}, '${id}')" title="Remove Attribute">X</button><button type="button" onclick="OpenRenameThemeAttribute(${i}, '${id}')" title="Rename Attribute">=</button></div>`
		}
		container.innerHTML = html
		add_btn.removeAttribute('disabled')
	}, 1)
}

function AddNewTheme() {
	const index = temp_theme_values.length
	temp_theme_values[index] = []
	for (let i = 0; i < temp_theme_names.length; i++) temp_theme_values[index][i] = null
	document.getElementById('theme-index-selector').innerHTML += `<option value="${index}">${index}</option>`
	ThemeIndexSelector(index)
}

function ChangeThemeAttributeValue(index, in_index, value) {
	if (value.replace(/ /g, '').length == 0) value = null
	temp_theme_values[index][in_index] = value
}

function AddThemeAttribute() {
	const input = document.getElementById('theme-attribute-input')
	input.value = null
	isAddingThemeAttr = true
	document.getElementById('theme-rename').style.display = 'flex'
	input.focus()
}

function RemoveThemeAttribute(index, id) {
	temp_theme_names.splice(index, 1)
	for (let i = 0; i < temp_theme_values.length; i++) temp_theme_values[i].splice(index, 1)
	document.getElementById(id).remove()
}

function AskForRemovingThemeAttribute(index, id) {
	Confirm('Are you sure about deleting this Attribute ?', [
		{
			text: 'Yes',
			class: 'btn btn-danger',
			onclick: `this.parentElement.parentElement.remove();RemoveThemeAttribute(${index}, '${id}')`
		},
		{
			text: 'No'
		}
	])
}

function OpenRenameThemeAttribute(index, id) {
	const input = document.getElementById('theme-attribute-input')
	input.value = temp_theme_names[index]
	isAddingThemeAttr = false
	temp_theme_info = [index, id]
	document.getElementById('theme-rename').style.display = 'flex'
	input.focus()
}

function RenameThemeAttribute() {
	const value = document.getElementById('theme-attribute-input').value

	if (value.replace(/ /g, '').length == 0) {
		PopAlert('Fill The Attribute Name Input.', 'danger')
		return
	}

	if (isAddingThemeAttr) {
		const id = `${new Date().getTime()}-${Math.floor(Math.random() * 99)}`
		const index = temp_theme_names.length
		temp_theme_names[index] = value
		if (temp_theme_values.length == 0) temp_theme_values[0] = [null]
		else for (let i = 0; i < temp_theme_values.length; i++) temp_theme_values[i][index] = null

		const element = document.createElement('div')
		element.id = id
		element.innerHTML = `<p title="${value}">${value}</p><input type="text" placeholder="Value..." oninput="ChangeThemeAttributeValue(${temp_active_theme_index}, ${index}, this.value)"><button type="button" onclick="AskForRemovingThemeAttribute(${index}, '${id}')" title="Remove Attribute">X</button><button type="button" onclick="OpenRenameThemeAttribute(${index}, '${id}')" title="Rename Attribute">=</button>`

		document.getElementById('theme-container').appendChild(element)
	} else {
		const text = document.getElementById(temp_theme_info[1]).children[0]
		text.innerText = value
		text.setAttribute('title', value)
		temp_theme_names[temp_theme_info[0]] = value
	}
	temp_theme_info = null
	isAddingThemeAttr = null
	document.getElementById('theme-rename').style.display = 'none'
}

function ApplyTheme(index) {
	const style = document.documentElement.style
	for (let i = 0; i < themes_names.length; i++) style.setProperty('--'+themes_names[i], themes_values[index][i])
}