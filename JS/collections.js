const CollectionContainer = document.getElementById('c-p-c-c')
const ComicCollectionPanelContainer = document.getElementById('c-c-p-c-c')
const CollectionPagination = document.getElementById('o-c-p-p')
const CollectionRightClickMenu = document.getElementById('c-r-c-m')
let openedCollectionIndex = null, collection_menu_index

function CreateCollection(name) {
	name = name || null
	if (name == null) return
	collectionsDB.push([name,[],null])
	LoadCollections()
	jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB})
}

function openCollectionsPanel() {
	KeyManager.stop = true
	afterDLReload = false
	LoadCollections()
	document.getElementById('main').style.display = 'none'
	document.getElementById('collections-panel').style.display = 'block'
}

function closeCollectionsPanel() {
	KeyManager.stop = false
	afterDLReload = true
	PageManager.Reload()
	document.getElementById('main').style.display = 'flex'
	document.getElementById('collections-panel').style.display = 'none'
}

function LoadCollections() {
	let html = '', isChanged = false
	document.getElementById('c-p-s').value = null

	if (collectionsDB.length == 0) html = '<h6>There is no Collection.</h6>'
	else {
		const time = new Date().getTime()
		for (let i = 0; i < collectionsDB.length; i++) {
			let image = collectionsDB[i][2] || null
			if (image != null) {
				image = dirUL+'/thumbs/'+image
				if (!fs.existsSync(image)) {
					collectionsDB[i][2] = null
					isChanged = true
					image = 'Image/no-img-300x300.png'
				}
			} else image = 'Image/no-img-300x300.png'

			html += `<div onmousedown="OnCollectionMouseDown(${i})"><img src="${image}?${time}" loading="lazy"><span>${collectionsDB[i][1].length}</span><div></div>
			<p>${collectionsDB[i][0]}</p></div>`
		}
	}

	if (isChanged) jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB})

	CollectionContainer.innerHTML = html
}

function openAddCollection() {
	document.getElementById('c-p-a-c-p').style.display = 'flex'
	document.getElementById('c-p-a-c-p-n').focus()
}

function closeAddCollection() {
	document.getElementById('c-p-a-c-p').style.display = 'none'
	document.getElementById('c-p-a-c-p-n').value = null
}

function addCollection() {
	let val = document.getElementById('c-p-a-c-p-n').value || null
	if (val == null || val.replace(/ /g, '').length == 0) {
		error('Please Write a Name For Collection.')
		return
	}
	closeAddCollection()
	CreateCollection(val)
}

function collectionSearch(val) {
	if (collectionsDB.length == 0) return
	const children = CollectionContainer.children
	if (children.length == 0) return

	if (val.replace(/ /g, '').length == 0) {
		for (let i = 0; i < children.length; i++) {
			children[i].style.display = 'inline-block'
		}
		return
	}
	val = val.toLowerCase()
	
	for (let i = 0; i < children.length; i++) {
		if (children[i].children[3].innerText.toLowerCase().indexOf(val) > -1) children[i].style.display = 'inline-block'
		else children[i].style.display = 'none'
	}
}

function openAddComicToCollection(comic_id) {
	document.getElementById('comic-collection-panel').style.display = 'flex'
	let html = ''
	for (let i = 0; i < collectionsDB.length; i++) {
		if (collectionsDB[i][1].indexOf(comic_id) > -1) html += `<div><p>${collectionsDB[i][0]}</p><button type="button" class="btn btn-danger" onclick="RemoveComicToCollection(this, ${i}, ${comic_id})">Remove</button></div>`
		else html += `<div><p>${collectionsDB[i][0]}</p><button type="button" class="btn btn-success" onclick="AddComicToCollection(this, ${i}, ${comic_id})">Add</button></div>`
	}
	ComicCollectionPanelContainer.innerHTML = html
}

function closeAddComicToCollection() {
	document.getElementById('comic-collection-panel').style.display = 'none'
	document.getElementById('c-c-p-s-i').value = null
	ComicCollectionPanelContainer.innerHTML = null
}

function onComicCollectionPanelSearch(val) {
	const children = ComicCollectionPanelContainer.children
	if (children.length == 0) return

	if (val.replace(/ /g, '').length == 0) {
		for (let i = 0; i < children.length; i++) {
			children[i].style.display = 'flex'
		}
		return
	}
	val = val.toLowerCase()
	
	for (let i = 0; i < children.length; i++) {
		if (children[i].innerText.toLowerCase().indexOf(val) > -1) children[i].style.display = 'iflex'
		else children[i].style.display = 'none'
	}
}

function AddComicToCollection(who, collection_index, comic_id) {
	who.removeAttribute('onclick')
	if (collectionsDB[collection_index][1].indexOf(comic_id) == -1) {
		collectionsDB[collection_index][1].push(comic_id)

		if (collectionsDB[collection_index][2] != null && fs.existsSync(dirUL+'/thumbs/'+collectionsDB[collection_index][2])) try { jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB}) } catch(err) { console.error(err) }
		else {
			db.comics.findOne({_id:comic_id}, (err1,doc) => {
				if (err1 || doc == null) {
					collectionsDB[collection_index][2] = null
					try { jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB}) } catch(err) { console.error(err) }
					console.error(err1)
					return
				}

				const url = doc.i+'.jpg'
				if (fs.existsSync(dirUL+'/thumbs/'+url)) collectionsDB[collection_index][2] = url
				else collectionsDB[collection_index][2] = null
				try { jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB}) } catch(err) { console.error(err) }
			})
		}
	}
	who.innerText = 'Remove'
	who.setAttribute('class', 'btn btn-danger')
	who.setAttribute('onclick', `RemoveComicToCollection(this, ${collection_index}, ${comic_id})`)
}

function RemoveComicToCollection(who, collection_index, comic_id) {
	who.removeAttribute('onclick')
	const index = collectionsDB[collection_index][1].indexOf(comic_id)
	if (index > -1) {
		collectionsDB[collection_index][1].splice(index, 1)
		jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB})
		if (PageManager.loadIndex == 2) PageManager.Reload()
	}
	who.innerText = 'Add'
	who.setAttribute('class', 'btn btn-success')
	who.setAttribute('onclick', `AddComicToCollection(this, ${collection_index}, ${comic_id})`)
}

function OnCollectionMouseDown(index) {
	const e = window.event, key = e.which
	if (key == 2) {
		e.preventDefault()
		return
	}

	if (key == 1) {
		closeCollectionsPanel()
		PageManager.LoadCollection(index, 1)
	} else {
		collection_menu_index = index
		let x = e.clientX, y = e.clientY
		CollectionRightClickMenu.style.display = 'block'
		if (window.innerWidth <= x+170) x = window.innerWidth - 170
		if (window.innerHeight <= y+CollectionRightClickMenu.clientHeight) y = window.innerHeight - CollectionRightClickMenu.clientHeight
		CollectionRightClickMenu.style.top = y+'px'
		CollectionRightClickMenu.style.left = x+'px'
		setCollectionMenuEvents()
	}
}

function setCollectionMenuEvents() {
	window.addEventListener('click', closeCollectionMenu)
	document.getElementById('collections-panel').addEventListener('scroll', closeCollectionMenu)
	window.addEventListener('resize', closeCollectionMenu)
}

function removeCollectionMenuEvents() {
	window.removeEventListener('click', closeCollectionMenu)
	document.getElementById('collections-panel').removeEventListener('scroll', closeCollectionMenu)
	window.removeEventListener('resize', closeCollectionMenu)
}

function closeCollectionMenu() {
	CollectionRightClickMenu.style.display = 'none'
	removeCollectionMenuEvents()
}

// Delete Collection
function deleteCollection(index) {
	collectionsDB.splice(index, 1)
	try { jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB}) } catch(err) { console.error(err) }
	if (PageManager.loadIndex == 2 && PageManager.infoIndex == index) PageManager.Home()
	LoadCollections()
}

function askForRemovingCollection(index) {
	errorSelector('Are you sure you want To Delete This Collection ?', [
		[
			"Yes",
			"btn btn-danger m-2",
			`deleteCollection(${index});this.parentElement.parentElement.remove()`
		],
		[
			"No",
			"btn btn-primary m-2",
			'comicDeleting = false;this.parentElement.parentElement.remove()'
		]
	])
}

// Reset Collection Thumb
function resetCollectionThumb(index) {
	collectionsDB[index][2] = null
	jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB})
	LoadCollections()
}

function askForResetingCollectionThumb(index) {
	errorSelector('Are you sure you want To Reset (Remove) This Collection Thumb ?', [
		[
			"Yes",
			"btn btn-danger m-2",
			`resetCollectionThumb(${index});this.parentElement.parentElement.remove()`
		],
		[
			"No",
			"btn btn-primary m-2",
			'comicDeleting = false;this.parentElement.parentElement.remove()'
		]
	])
}

// Rename
function openCollectionRename() {
	const input = document.getElementById('c-p-a-c-r-p-n')
	input.value = collectionsDB[collection_menu_index][0]
	document.getElementById('c-p-a-c-r-p').style.display = 'flex'
	input.focus()
}

function renameCollection() {
	const val = document.getElementById('c-p-a-c-r-p-n').value
	if (val.replace(/ /g, '').length == 0) { error('Please Write a name for collection.'); return }
	document.getElementById('c-p-a-c-r-p').style.display = 'none'
	collectionsDB[collection_menu_index][0] = val
	jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB})
	LoadCollections()
}