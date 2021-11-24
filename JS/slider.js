const comicSlider = document.getElementById('comic-slider')
const comicSliderContent = document.getElementById('c-s-ct')
const comicSliderCanvas = document.getElementById('c-s-c')
const comicSliderImg = document.getElementById('c-s-i')
const comicSliderCanvasScrollPanel = document.getElementById('c-s-s-p')
const comicSliderOverview = document.getElementById('c-s-o')
const comicSliderBackground = document.getElementById('c-s-bg')
const comicSliderActivePage = document.getElementById('c-s-a-pg')
const comicSliderMaxPages = document.getElementById('c-s-m-pg')
let comicSliderCanvasPos = { top: 0, left: 0, x: 0, y: 0 }
let comicSliderOverviewPos = { left: 0, x: 0 }

function toggleComicSliderOverview(firstTime, who) {
	if (comicSlider.hasAttribute('opened-overview')) {
		comicSlider.removeAttribute('opened-overview')
		comicSliderOverview.removeEventListener('mousedown', mouseSliderOverviewDownHandler)
		sliderOverviewHandelRemover()
		comicSliderOverview.removeEventListener('wheel', sliderOverviewScrollHandler)
	} else {
		comicSlider.setAttribute('opened-overview', true)
		comicSliderOverview.addEventListener('mousedown', mouseSliderOverviewDownHandler)
		comicSliderOverview.addEventListener('wheel', sliderOverviewScrollHandler)
	}

	if (firstTime) {
		who.setAttribute('onclick', 'toggleComicSliderOverview()')
		comicSliderOverview.scrollLeft = (Number(comicSliderOverview.getAttribute('aindex')) * 138) - 3
	}

	comicSliderCanvasScrollPanel.style.width = comicSliderCanvas.clientWidth+'px'
	comicSliderCanvasScrollPanel.style.height = comicSliderCanvas.clientHeight+'px'
}

function sliderOverviewScrollHandler(e) {
	e.preventDefault()
	comicSliderOverview.scrollLeft += e.deltaY
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
		document.getElementById('c-s-s').setAttribute('title', 'Cover Size | Ctrl+O')
		comicSliderImg.removeAttribute('onclick')
		comicSliderCanvas.style.borderColor = '#000'
		comicSliderCanvasScrollPanel.style.display = 'block'
		comicSliderCanvasScrollPanel.style.width = comicSliderCanvas.clientWidth+'px'
		comicSliderCanvasScrollPanel.style.height = comicSliderCanvas.clientHeight+'px'
		comicSliderCanvasScrollPanel.addEventListener('wheel', sliderImgScrollHandler)
		comicSliderCanvasScrollPanel.addEventListener('mousedown', mouseSliderDownHandler)
		sliderImageBorderHighlighter()
		comicSliderContent.removeEventListener('wheel', sliderScrollHandler)
		comicSliderBackground.addEventListener('wheel', sliderScrollHandler)
	} else {
		comicSliderCanvas.scrollTop = 0
		comicSliderCanvas.scrollLeft = 0
		document.getElementById('c-s-s').setAttribute('title', 'Orginal Size | Ctrl+O')
		comicSliderCanvas.removeAttribute('o-size')
		comicSliderCanvas.style.borderColor = 'transparent'
		comicSliderImg.setAttribute('onclick', 'toggleComicSliderSize()')
		comicSliderCanvasScrollPanel.style.display = 'none'
		comicSliderCanvasScrollPanel.removeEventListener('mousedown', mouseSliderDownHandler)
		sliderHandelRemover()
		comicSliderCanvasScrollPanel.removeEventListener('wheel', sliderImgScrollHandler)
		comicSliderContent.addEventListener('wheel', sliderScrollHandler)
		comicSliderBackground.removeEventListener('wheel', sliderScrollHandler)
	}
}

function sliderImgScrollHandler(e) {
	e.preventDefault()
	comicSliderCanvas.scrollTop += e.deltaY
}

function mouseSliderDownHandler(e) {
	comicSliderCanvasPos = {
		left: comicSliderCanvas.scrollLeft,
		top: comicSliderCanvas.scrollTop,
		x: e.clientX,
		y: e.clientY,
	}

	comicSliderCanvasScrollPanel.setAttribute('sliding', true)
	comicSliderCanvasScrollPanel.removeEventListener('wheel', sliderImgScrollHandler)
	comicSliderCanvasScrollPanel.addEventListener('mousemove', mouseSliderMoveHandler)
	comicSliderCanvasScrollPanel.addEventListener('mouseup', sliderHandelRemover)
	comicSliderCanvasScrollPanel.addEventListener('mouseout', sliderHandelRemover)
}

function mouseSliderMoveHandler(e) {
	comicSliderCanvas.scrollTop = comicSliderCanvasPos.top - (e.clientY - comicSliderCanvasPos.y)
	comicSliderCanvas.scrollLeft = comicSliderCanvasPos.left - (e.clientX - comicSliderCanvasPos.x)
	sliderImageBorderHighlighter()
}

function sliderHandelRemover() {
	comicSliderCanvasScrollPanel.addEventListener('wheel', sliderImgScrollHandler)
	comicSliderCanvasScrollPanel.removeEventListener('mousemove', mouseSliderMoveHandler)
	comicSliderCanvasScrollPanel.removeEventListener('mouseup', sliderHandelRemover)
	comicSliderCanvasScrollPanel.removeEventListener('mouseout', sliderHandelRemover)
	comicSliderCanvasScrollPanel.removeAttribute('sliding')
}

function sliderImageBorderHighlighter() {
	if (comicSliderCanvas.scrollTop == 0) comicSliderCanvas.style.borderTopColor = '#5dade2'
	else comicSliderCanvas.style.borderTopColor = '#000'

	if (comicSliderCanvas.scrollLeft == 0) comicSliderCanvas.style.borderLeftColor = '#5dade2'
	else comicSliderCanvas.style.borderLeftColor = '#000'

	if (comicSliderCanvas.scrollLeft == comicSliderImg.clientWidth - comicSliderCanvas.clientWidth) comicSliderCanvas.style.borderRightColor = '#5dade2'
	else comicSliderCanvas.style.borderRightColor = '#000'

	if (comicSliderCanvas.scrollTop == comicSliderImg.clientHeight - comicSliderCanvas.clientHeight) comicSliderCanvas.style.borderBottomColor = '#5dade2'
	else comicSliderCanvas.style.borderBottomColor = '#000'
}

function toggleComicSliderScreen() {
	const comic_slider = document.getElementById('comic-slider')
	const parent = comic_slider.children[1]
	if (ThisWindow.isFullScreen()) {
		ThisWindow.setFullScreen(false)
		parent.style.backgroundColor = '#000000f3'
		comic_slider.removeAttribute('fullscreen')
		document.getElementById('window-menu').style.display = 'grid'
	} else {
		ThisWindow.setFullScreen(true)
		parent.style.backgroundColor = '#000'
		comic_slider.setAttribute('fullscreen', true)
		document.getElementById('window-menu').style.display = 'none'
	}
}

function changeSliderIndex(index) {
	const prev = document.getElementById('c-s-p')
	const next = document.getElementById('c-s-n')
	const count = Number(comicSliderOverview.getAttribute('count'))
	const passIndex = comicSliderOverview.getAttribute('aindex') || null
	if (passIndex != null) comicSliderOverview.querySelector(`[i="${passIndex}"]`).removeAttribute('active')
	comicSliderOverview.setAttribute('aindex', index)
	const overview = comicSliderOverview.querySelector(`[i="${index}"]`)
	overview.setAttribute('active', true)
	comicSliderImg.setAttribute('src', overview.getElementsByTagName('img')[0].getAttribute('src'))

	if (comicSliderCanvas.hasAttribute('o-size')) {
		comicSliderCanvas.scrollTop = 0
		comicSliderCanvas.scrollLeft = (comicSliderImg.clientWidth / 2) / 2
		sliderImageBorderHighlighter()
		comicSliderCanvasScrollPanel.style.width = comicSliderCanvas.clientWidth+'px'
		comicSliderCanvasScrollPanel.style.height = comicSliderCanvas.clientHeight+'px'
	}

	if (index == 0) prev.setAttribute('disabled', true)
	else {
		prev.removeAttribute('disabled')
		prev.setAttribute('onclick', `changeSliderIndex(${index - 1})`)
		comicSliderActivePage.textContent = index + 1
	}

	if (index == count) next.setAttribute('disabled', true)
	else {
		next.removeAttribute('disabled')
		next.setAttribute('onclick', `changeSliderIndex(${index + 1})`)
		comicSliderActivePage.textContent = index + 1
	}
}

function openComicSlider(index) {
	keydownEventIndex = 2
	comicSlider.style.display = 'grid'
	comicSliderOverview.parentElement.children[1].setAttribute('onclick', 'toggleComicSliderOverview(true, this)')
	changeSliderIndex(index)
	comicSliderContent.addEventListener('wheel', sliderScrollHandler)
	document.getElementById('downloader').removeAttribute('fixed')
}

function reOpenLastSlider() {
	keydownEventIndex = 2
	comicSlider.style.display = 'grid'
	if (comicSliderOverview.parentElement.children[1].getAttribute('onclick').indexOf('toggleComicSliderOverview') == -1) comicSliderOverview.parentElement.children[1].setAttribute('onclick', 'toggleComicSliderOverview(true, this)')
	if (comicSliderOverview.hasAttribute('aindex')) changeSliderIndex(Number(comicSliderOverview.getAttribute('aindex')))
	else changeSliderIndex(0)
	comicSliderContent.addEventListener('wheel', sliderScrollHandler)
	document.getElementById('downloader').removeAttribute('fixed')
}

function closeComicSlider() {
	keydownEventIndex = 1
	comicSlider.style.display = 'none'
	ThisWindow.setFullScreen(false)
	document.getElementById('comic-slider').children[1].style.backgroundColor = '#000000f3'
	comicSlider.setAttribute('src', '')
	comicSlider.removeAttribute('opened-overview')
	toggleComicSliderSize(false)
	comicSliderContent.removeEventListener('wheel', sliderScrollHandler)
	comicSliderBackground.removeEventListener('wheel', sliderScrollHandler)
	if (setting.hover_downloader == false) document.getElementById('downloader').setAttribute('fixed', true)
}

function sliderScrollHandler(e) {
	e.preventDefault()
	const index = Number(comicSliderOverview.getAttribute('aindex'))
	if (e.deltaY < 0) {
		if (index != 0) changeSliderIndex(index - 1)
	} else {
		const count = Number(comicSliderOverview.getAttribute('count'))
		if (index != count) changeSliderIndex(index + 1)
	}
}

// Key Event
function SliderKeyEvents(ctrl, shift, key) {
	if (ctrl) {
		if (!shift) {
			switch (key) {
				case 37:
					const index1 = Number(comicSliderOverview.getAttribute('aindex'))
					if (index1 != 0) changeSliderIndex(index1 - 1)
					break
				case 39:
					const index2 = Number(comicSliderOverview.getAttribute('aindex'))
					const count = Number(comicSliderOverview.getAttribute('count'))
					if (index2 != count) changeSliderIndex(index2 + 1)
					break
			}
		}
	} else {
		if (!shift) {
			switch (key) {
				case 65:
					const index3 = Number(comicSliderOverview.getAttribute('aindex'))
					if (index3 != 0) changeSliderIndex(index3 - 1)
					break
				case 68:
					const index4 = Number(comicSliderOverview.getAttribute('aindex'))
					const count = Number(comicSliderOverview.getAttribute('count'))
					if (index4 != count) changeSliderIndex(index4 + 1)
					break
				case 79:
					toggleComicSliderSize()
					break
				case 87:
					closeComicSlider()
					break
				case 122:
					toggleComicSliderScreen()
					break
			}
		}
	}
}