const CollectionContainer = document.getElementById('c-p-c-c')
let collectionPage = null, openedCollectionIndex = null, inCollection = false

function openCollectionsPanel() {
	keydownEventIndex = null
	afterDLReload = false
	document.getElementById('main').style.display = 'none'
	document.getElementById('collections-panel').style.display = 'block'
}

function closeCollectionsPanel() {
	keydownEventIndex = 0
	afterDLReload = true
	reloadLoadingComics()
	document.getElementById('main').style.display = 'grid'
	document.getElementById('collections-panel').style.display = 'none'
}

function LoadCollections() {
	let html = ''
	document.getElementById('c-p-s').value = null

	if (collectionsDB.length == 0) html = '<h6>There is no Collection.</h6>'
	else {
		for (let i = 0; i < collectionsDB.length; i++) {
			let image = collectionsDB[i][2] || null
			if (!fs.existsSync(dirUL+'/cthumbs/'+image)) image = 'Image/no-img-300x300.png'

			html += `<div onclick="openCollection(${i})"><img src="${image}" loading="lazy"><span>${collectionsDB[i][1].length}</span><div></div>
			<p>${collectionsDB[i][0]}</p></div>`
		}
	}

	CollectionContainer.innerHTML = html
}

function openCollection(index) {
	openedCollectionIndex = index
	if (collectionsDB[index][1].length == 0) { PopAlert('There is no Comic In this Collection.', 'danger'); return }
	collectionPage = 1
	CheckAllCollectionIds(index, 0, false, () => {
		if (collectionsDB[index][1].length == 0) { PopAlert('There is no Comic In this Collection.', 'danger'); return }
		inCollection = true
		document.getElementById('o-c-p-c-c').innerHTML = ''
		LoadCollection(0)
		document.getElementById('opened-collections-panel').style.display = 'block'
		document.getElementById('collections-panel').style.display = 'none'
	})
}

function CheckAllCollectionIds(collectionIndex, index, changed, callback) {
	if (collectionsDB[collectionIndex][1].length == index) {
		if (changed) jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:collectionsDB})
		LoadCollections()
		callback()
		return
	}

	db.comics.findOne({_id:collectionsDB[collectionIndex][1][index]}, (err, doc) => {
		if (err) { error('CheckCollectionComics->Err: '+err); return }
		if (doc == undefined || doc == null) {
			collectionsDB[collectionIndex][1].splice(index, 1)
			CheckAllCollectionIds(collectionIndex, index, true, callback)
		} else CheckAllCollectionIds(collectionIndex, index + 1, changed, callback)
	})
}

function closeCollection() {
	inCollection = false
	openedCollectionIndex = null
	collectionPage = null
	document.getElementById('collections-panel').style.display = 'block'
	document.getElementById('opened-collections-panel').style.display = 'none'
	document.getElementById('o-c-p-c-c').innerHTML = ''
}

function LoadCollection(index) {
	const ids = collectionsDB[openedCollectionIndex][1]

	if (ids.length == index) {
		return
	}

	db.comics.findOne({_id:ids[index]}, (err, doc) => {
		if (err) { error('LoadCollection->Err: '+err); return }
		if (doc == undefined || doc == null) {
			LoadCollection(index + 1)
			return
		}

		let html = ''
		if (setting.show_unoptimize) {
			let unoptimize = ''
			id = doc._id
			_name = doc.n
			image = `${dirUL}/thumbs/${doc.i}.jpg`
			thumb = true
			
			if (!fs.existsSync(image)) { image = 'Image/no-img-300x300.png'; thumb = false }
			if (typeof(doc.o) == 'number') { unoptimize = ''; optimize = true }
			else { unoptimize = ' unoptimize'; optimize = false }
			
			html += `<div class="comic" onmousedown="onComicClicked(${id}, ${thumb}, ${optimize})"${unoptimize}><img src="${image}"><span>${doc.c}</span><p>${_name}</p></div>`
		} else {
			id = doc._id
			_name = doc.n
			image = `${dirUL}/thumbs/${doc.i}.jpg`
			thumb = true

			if (!fs.existsSync(image)) { image = 'Image/no-img-300x300.png'; thumb = false }
			if (typeof(doc.o) == 'number') optimize = true
			else optimize = false

			html += `<div class="comic" onmousedown="onComicClicked(${id}, ${thumb}, ${optimize})"><img src="${image}"><span>${doc.c}</span><p>${_name}</p></div>`
		}
		document.getElementById('o-c-p-c-c').innerHTML += html
		LoadCollection(index + 1)
	})
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