function toggleComicSliderOverview() {
	if (comicSlider.hasAttribute('opened-overview')) comicSlider.removeAttribute('opened-overview')
	else comicSlider.setAttribute('opened-overview', true)
}

function toggleComicSliderSize(open) {
	if (typeof(open) != 'boolean') {
		const toggle = comicSliderCanvas.getAttribute('o-size') || null
		if (toggle == null) open = true
		else open = false
	}
	
	if (open) {
		comicSliderCanvas.setAttribute('o-size', true)
		comicSliderCanvas.scrollTop = 0
		comicSliderCanvas.scrollLeft = (comicSliderImg.clientWidth / 2) / 2
		document.getElementById('c-s-s').setAttribute('title', 'Cover Size')
		comicSliderImg.removeAttribute('onclick')
		comicSliderCanvas.addEventListener('mousedown', mouseSliderDownHandler)
	} else {
		comicSliderCanvas.scrollTop = 0
		comicSliderCanvas.scrollLeft = 0
		document.getElementById('c-s-s').setAttribute('title', 'Orginal Size')
		comicSliderCanvas.removeAttribute('o-size')
		comicSliderImg.setAttribute('onclick', 'toggleComicSliderSize()')
		comicSliderCanvas.removeEventListener('mousedown', mouseSliderDownHandler)
		sliderHandelRemover()
		comicSliderCanvas.style.cursor = 'default'
	}
}

function mouseSliderDownHandler(e) {
	comicSliderCanvas.style.cursor = 'grabbing'
	comicSliderCanvasPos = {
		left: comicSliderCanvas.scrollLeft,
		top: comicSliderCanvas.scrollTop,
		x: e.clientX,
		y: e.clientY,
	}

	comicSliderCanvas.addEventListener('mousemove', mouseSliderMoveHandler)
	comicSliderCanvas.addEventListener('mouseup', sliderHandelRemover)
	comicSliderCanvas.addEventListener('mouseout', sliderHandelRemover)
}

function mouseSliderMoveHandler(e) {
	const dx = e.clientX - comicSliderCanvasPos.x
	const dy = e.clientY - comicSliderCanvasPos.y

	comicSliderCanvas.scrollTop = comicSliderCanvasPos.top - dy
	comicSliderCanvas.scrollLeft = comicSliderCanvasPos.left - dx
}

function sliderHandelRemover() {
	comicSliderCanvas.style.cursor = 'grab'
	comicSliderCanvas.removeEventListener('mousemove', mouseSliderMoveHandler)
	comicSliderCanvas.removeEventListener('mouseup', sliderHandelRemover)
	comicSliderCanvas.removeEventListener('mouseout', sliderHandelRemover)
}

function toggleComicSliderScreen() {
	const parent = document.getElementById('comic-slider').children[1]
	if (ThisWindow.isFullScreen()) {
		ThisWindow.setFullScreen(false)
		parent.style.backgroundColor = '#000000f3'
	} else {
		ThisWindow.setFullScreen(true)
		parent.style.backgroundColor = '#000'
	}
}

function changeSliderIndex(index) {
	const overview_parent = document.getElementById('c-s-o')
	const toggle = comicSliderCanvas.getAttribute('o-size') || null
	const prev = document.getElementById('c-s-p')
	const next = document.getElementById('c-s-n')
	const count = Number(overview_parent.getAttribute('count'))
	const passIndex = overview_parent.getAttribute('aindex') || null
	if (passIndex != null) overview_parent.querySelector(`[i="${passIndex}"]`).removeAttribute('active')
	overview_parent.setAttribute('aindex', index)
	const overview = overview_parent.querySelector(`[i="${index}"]`)
	overview.setAttribute('active', true)
	comicSliderImg.setAttribute('src', overview.getElementsByTagName('img')[0].getAttribute('src'))

	if (toggle != null) {
		comicSliderCanvas.scrollTop = 0
		comicSliderCanvas.scrollLeft = (comicSliderImg.clientWidth / 2) / 2
	}

	if (index == 0) prev.setAttribute('disabled', true)
	else {
		prev.removeAttribute('disabled')
		prev.setAttribute('onclick', `changeSliderIndex(${index-1})`)
	}

	if (index == count) next.setAttribute('disabled', true)
	else {
		next.removeAttribute('disabled')
		next.setAttribute('onclick', `changeSliderIndex(${index+1})`)
	}
}

function openComicSlider(index) {
	comicSlider.style.display = 'grid'
	changeSliderIndex(index)
}

function closeComicSlider() {
	comicSlider.style.display = 'none'
	ThisWindow.setFullScreen(false)
	document.getElementById('comic-slider').children[1].style.backgroundColor = '#000000f3'
	comicSlider.setAttribute('src', '')
	comicSlider.removeAttribute('opened-overview')
	toggleComicSliderSize(false)
}