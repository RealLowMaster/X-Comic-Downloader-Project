
function openCollectionsPanel() {
	afterDLReload = false
	document.getElementById('main').style.display = 'none'
	document.getElementById('collections-panel').style.display = 'block'
}

function closeCollectionsPanel() {
	afterDLReload = true
	reloadLoadingComics()
	document.getElementById('main').style.display = 'grid'
	document.getElementById('collections-panel').style.display = 'none'
}