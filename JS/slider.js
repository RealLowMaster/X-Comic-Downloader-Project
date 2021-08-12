const comicSlider = document.getElementById('comic-slider')
const comicSliderImg = document.getElementById('c-s-i')
const comicSliderCanvas = comicSliderImg.parentElement
const comicSliderOverview = document.getElementById('c-s-o')
let comicSliderCanvasPos = { top: 0, left: 0, x: 0, y: 0 }
let comicSliderOverviewPos = { left: 0, x: 0 }

function toggleComicSliderOverview(firstTime, who) {
	if (comicSlider.hasAttribute('opened-overview')) {
		comicSlider.removeAttribute('opened-overview')
		comicSliderOverview.removeEventListener('mousedown', mouseSliderOverviewDownHandler)
		sliderOverviewHandelRemover()
	} else {
		comicSlider.setAttribute('opened-overview', true)
		comicSliderOverview.addEventListener('mousedown', mouseSliderOverviewDownHandler)
	}

	if (firstTime) {
		comicSliderOverview.parentElement.children[1].setAttribute('onclick', 'toggleComicSliderOverview()')
		comicSliderOverview.scrollLeft = (Number(comicSliderOverview.getAttribute('aindex')) * 138) - 3
	}
}

function mouseSliderOverviewDownHandler(e) {
	if (e.target.hasAttribute('id') == false) return
	comicSliderOverview.setAttribute('grabbing', true)
	comicSliderOverviewPos = {
		left: comicSliderOverview.scrollLeft,
		x: e.clientX,
	}

	comicSliderOverview.addEventListener('mousemove', mouseSliderOverviewMoveHandler)
	comicSliderOverview.addEventListener('mouseup', sliderOverviewHandelRemover)
	comicSliderOverview.addEventListener('mouseout', sliderOverviewHandelRemover)
}

function mouseSliderOverviewMoveHandler(e) {
	comicSliderOverview.scrollLeft = comicSliderOverviewPos.left - (e.clientX - comicSliderOverviewPos.x)
}

function sliderOverviewHandelRemover() {
	comicSliderOverview.removeAttribute('grabbing')
	comicSliderOverview.removeEventListener('mousemove', mouseSliderOverviewMoveHandler)
	comicSliderOverview.removeEventListener('mouseup', sliderOverviewHandelRemover)
	comicSliderOverview.removeEventListener('mouseout', sliderOverviewHandelRemover)
}

function toggleComicSliderSize(open) {
	if (typeof(open) != 'boolean') {
		if (comicSliderCanvas.hasAttribute('o-size')) open = false
		else open = true
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
	}
}

function mouseSliderDownHandler(e) {
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
	const toggle = comicSliderCanvas.getAttribute('o-size') || null
	const prev = document.getElementById('c-s-p')
	const next = document.getElementById('c-s-n')
	const count = Number(comicSliderOverview.getAttribute('count'))
	const passIndex = comicSliderOverview.getAttribute('aindex') || null
	if (passIndex != null) comicSliderOverview.querySelector(`[i="${passIndex}"]`).removeAttribute('active')
	comicSliderOverview.setAttribute('aindex', index)
	const overview = comicSliderOverview.querySelector(`[i="${index}"]`)
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
	comicSliderOverview.parentElement.children[1].setAttribute('onclick', 'toggleComicSliderOverview(true, this)')
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