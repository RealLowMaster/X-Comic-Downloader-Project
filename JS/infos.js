let info_panel_index = null

function openInfoPanel(index) {
	info_panel_index = index
	switch(index) {
		case 0:
			MakeInfoContent(groupsDB)
			break
		case 1:
			MakeInfoContent(artistsDB)
			break
		case 2:
			MakeInfoContent(parodiesDB)
			break
		case 3:
			MakeInfoContent(tagsDB)
			break
		case 4:
			MakeInfoContent(charactersDB)
			break
		case 5:
			MakeInfoContent(languagesDB)
			break
		case 6:
			MakeInfoContent(categoriesDB)
			break
	}
	document.getElementById('info-panel').style.display = 'block'
}

function MakeInfoContent(list) {
	let html = '', have = false
	for (let i = 0; i < list.length; i++) {
		if (list[i] == null) continue
		have = true
		html += `<div onclick="OpenInfo('${list[i].replace(/'/g,"\\'").replace(/"/g, '\\"')}')">${list[i]}</div>`
	}

	if (have) document.getElementById('i-p-i-c').innerHTML = html
	else document.getElementById('i-p-i-c').innerHTML = '<div class="alert alert-danger">There is no Info.</div>'
}

function closeInfoPanel() {
	document.getElementById('info-panel').style.display = 'none'
	document.getElementById('i-p-s-i').value = null
	document.getElementById('i-p-i-c').innerHTML = null
}

function OpenInfo(name) {
	console.log(name, artistsDB.indexOf(name))
}