const infoContainer = document.getElementById('i-p-i-c')
let info_panel_index = null

function openInfoPanel(index) {
	KeyManager.ChangeCategory(null)
	info_panel_index = index
	const title = document.getElementById('i-p-t')
	switch(index) {
		case 0:
			title.innerText = 'Groups'
			MakeInfoContent(groupsDB)
			break
		case 1:
			title.innerText = 'Artists'
			MakeInfoContent(artistsDB)
			break
		case 2:
			title.innerText = 'Parodies'
			MakeInfoContent(parodiesDB)
			break
		case 3:
			title.innerText = 'Tags'
			MakeInfoContent(tagsDB)
			break
		case 4:
			title.innerText = 'Characters'
			MakeInfoContent(charactersDB)
			break
		case 5:
			title.innerText = 'Languages'
			MakeInfoContent(languagesDB)
			break
		case 6:
			title.innerText = 'Categories'
			MakeInfoContent(categoriesDB)
			break
	}
	document.getElementById('info-panel').style.display = 'block'
	KeyManager.ChangeCategory('info')
}

function MakeInfoContent(list) {
	let html = '', have = false
	for (let i = 0; i < list.length; i++) {
		if (list[i] == null) continue
		have = true
		html += `<div onclick="OpenInfo('${list[i].replace(/'/g,"\\'").replace(/"/g, '\\"')}')">${list[i]}</div>`
	}

	if (have) infoContainer.innerHTML = html
	else infoContainer.innerHTML = '<div class="alert alert-danger">There is no Info.</div>'

	document.getElementById('info-panel').scrollTop = 0
}

function closeInfoPanel() {
	KeyManager.ChangeCategory('default')
	document.getElementById('info-panel').style.display = 'none'
	info_panel_index = null
	document.getElementById('i-p-s-i').value = null
	infoContainer.innerHTML = null
	PageManager.addInfo = false
}

function OpenInfo(name, index = null) {
	if (index == null) index = info_panel_index
	name = name.replace(/\\"/g, '"')
	PageManager.SetInfo(name, index)
}

function InfoKeyEvents(ctrl, shift, key) {
	if (!ctrl && !shift && key == 27) closeInfoPanel()
}

function InfoSearch(name) {
	const children = infoContainer.children
	if (name.replace(/ /g,'').length == 0) {
		for (let i = 0; i < children.length; i++) children[i].style.display = 'inline-block'
		return
	}

	for (let i = 0; i < children.length; i++) {
		if (children[i].innerText.toLowerCase().indexOf(name.toLowerCase()) > -1) children[i].style.display = 'inline-block'
		else children[i].style.display = 'none'
	}
}