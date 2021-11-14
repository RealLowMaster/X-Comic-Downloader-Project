
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

function LoadCollections() {
	const container = document.getElementById('c-p-c-c')
	let html = ''

	if (collectionsDB.length == 0) html = '<h6>There is no Collection.</h6>'
	else {
		for (let i = 0; i < collectionsDB.length; i++) {
			html += `<div onclick="openCollection(${i})"><img src="${collectionsDB[i][2]}" loading="lazy"><span>${collectionsDB[i][1].length}</span><div></div>
			<p>${collectionsDB[i][0]}</p></div>`
		}
	}

	
	container.innerHTML = html
}

function openCollection(index) {}

function openAddCollectionMenu() {}
function closeAddCollectionMenu() {}