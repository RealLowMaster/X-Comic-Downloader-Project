class Loading {
	#saveProcress = 0
	#loading
	#txt
	#procress

	constructor(times) {
		this.times = (100/times)
		this.id = `${new Date().getTime()}${Math.floor(Math.random() * 9)}`
		this.#loading = document.createElement('div')
		this.#loading.setAttribute('id', this.id)
		this.#txt = document.createElement('p')
		this.#txt.innerText = 'Loading...'
		this.#procress = document.createElement('div')
		this.#loading.setAttribute('class', 'waiting-loading')
		this.#loading.appendChild(this.#txt)
		const miniElement = document.createElement('div')
		miniElement.appendChild(this.#procress)
		this.#loading.appendChild(miniElement)
		document.body.appendChild(this.#loading)
	}

	forward(text) {
		if (text != undefined) this.#txt.innerText = text
		this.#saveProcress += this.times
		this.#procress.style.width = this.#saveProcress+'%'
	}

	changePercent(times) {
		this.times = (100/times)
	}

	reset(times) {
		this.hide()
		if (times != undefined) this.times = (100/times)
		this.#loading.style.backgroundColor = '#000d'
		this.#txt.style.color = '#fff'
		this.#txt.innerText = 'Loading...'
		this.#saveProcress = 0
		this.#procress.style.width = 0
	}

	hide() { this.#loading.style.display = 'none' }

	text(text) { this.#txt.innerHTML = text }

	show(text, bgColor, color) {
		if (text != undefined) this.#txt.innerText = text
		if (bgColor != undefined) this.#loading.style.backgroundColor = bgColor
		if (color != undefined) this.#txt.style.color = color
		this.#loading.style.display = 'flex'
	}

	remove() {
		this.#loading.remove()
	}
}

class ProcressPanel {
	#saveProcress = 0
	#constainer
	#closeBtn
	#secendSide
	#miniLogContainer
	#logContainer
	#txt
	#procress

	constructor(times = 0) {
		this.times = (100/times)
		this.id = `pp${new Date().getTime()}`
		this.#constainer = document.createElement('div')
		this.#constainer.setAttribute('id', this.id)
		this.#constainer.classList.add('procress-panel')
		let elementContainer = document.createElement('div')
		this.#constainer.appendChild(elementContainer)
		this.#closeBtn = document.createElement('button')
		this.#closeBtn.setAttribute('type', 'button')
		this.#closeBtn.setAttribute('onclick', "this.parentElement.style.display='none'")
		this.#closeBtn.innerText = 'X'
		this.#constainer.appendChild(this.#closeBtn)
		elementContainer = document.createElement('div')
		this.#miniLogContainer = document.createElement('div')
		elementContainer.appendChild(this.#miniLogContainer)
		this.#secendSide = document.createElement('div')
		this.#logContainer = document.createElement('div')
		this.#secendSide.appendChild(this.#logContainer)
		let element = document.createElement('div')
		this.#txt = document.createElement('p')
		this.#txt.innerText = 'Waiting...'
		element.appendChild(this.#txt)
		let miniElement = document.createElement('div')
		this.#procress = document.createElement('div')
		miniElement.appendChild(this.#procress)
		element.appendChild(miniElement)
		this.#secendSide.appendChild(element)
		elementContainer.appendChild(this.#secendSide)
		this.#constainer.appendChild(elementContainer)
		document.body.appendChild(this.#constainer)
	}

	forward(text) {
		if (text != undefined) this.#txt.innerText = text
		this.#saveProcress += this.times
		this.#procress.style.width = this.#saveProcress+'%'
	}

	changePercent(times = 0) {
		this.times = (100/times)
		this.#saveProcress = 0
		this.#procress.style.width = '0%'
	}

	add(text, color) {
		color = color || 'success'
		const element = document.createElement('div')

		element.innerHTML = text
		element.classList.add('pp-log')
		element.classList.add(`pp-${color}`)

		this.#logContainer.appendChild(element)
	}

	addMini(text, color) {
		color = color || 'success'
		const element = document.createElement('div')

		element.innerHTML = text
		element.classList.add('pp-log')
		element.classList.add(`pp-${color}`)

		this.#miniLogContainer.appendChild(element)
	}

	clear() {
		this.#logContainer.innerHTML = ''
	}

	clearMini() {
		this.#miniLogContainer.innerHTML = ''
	}

	reset(times = 0) {
		this.hide()
		this.clear()
		this.clearMini()
		if (times != undefined) this.times = (100/times)
		this.#txt.innerText = 'Waiting...'
		this.#saveProcress = 0
		this.#procress.style.width = 0
		this.#constainer.children[0].setAttribute('onclick', "this.parentElement.style.display='none'")
		this.#closeBtn.setAttribute('onclick', "this.parentElement.style.display='none'")
	}

	hide() { this.#constainer.style.display = 'none' }

	show(text) {
		if (text != undefined) this.#txt.innerHTML = text
		this.#constainer.style.display = 'flex'
	}

	text(text) {
		this.#txt.innerHTML = text
	}

	config(config = { miniLog:false, miniSize:30, bgClose:false, closeBtn:false, closeEvent:'e', closeBGEvent:'e' }) {
		if (config.miniLog != undefined) {
			if (config.miniLog) {
				this.#constainer.setAttribute('mini', true)
				if (config.miniSize != null && typeof(config.miniSize) == 'number') {
					this.#miniLogContainer.style.flex = `0 0 ${config.miniSize}%`
					this.#miniLogContainer.style.maxWidth = `${config.miniSize}%`
					this.#secendSide.style.flex = `0 0 ${100 - config.miniSize}%`
					this.#secendSide.style.maxWidth = `${100 - config.miniSize}%`
				} else {
					this.#miniLogContainer.style.flex = '0 0 30%'
					this.#miniLogContainer.style.maxWidth = '30%'
					this.#secendSide.style.flex = '0 0 70%'
					this.#secendSide.style.maxWidth = '70%'
				}
			} else {
				this.#constainer.removeAttribute('mini')
				this.#miniLogContainer.style.flex = '0 0 0'
				this.#miniLogContainer.style.maxWidth = '0'
				this.#secendSide.style.flex = '0 0 100%'
				this.#secendSide.style.maxWidth = '100%'
			}
		}

		if (config.bgClose != undefined) {
			if (config.bgClose) this.#constainer.children[0].setAttribute('onclick', "this.parentElement.style.display='none'")
			else this.#constainer.children[0].removeAttribute('onclick')
		}

		if (config.closeBtn != undefined) {
			if (config.closeBtn) this.#closeBtn.style.display = 'flex'
			else this.#closeBtn.style.display = 'none'
		}

		if (config.closeEvent != undefined) {
			this.#closeBtn.setAttribute('onclick', config.closeEvent)
		}

		if (config.closeBGEvent != undefined) {
			this.#constainer.children[0].setAttribute('onclick', config.closeBGEvent)
		}
	}

	remove() {
		this.#constainer.remove()
	}
}

class Tab {
	constructor(id, scroll, search, jumpPage, thisPage, maxPage, site, isReloading, element, pageElement) {
		this.id = id
		this.history = []
		this.activeHistory = 0
		this.sc = scroll
		this.s = search
		this.jp = jumpPage
		this.tp = thisPage
		this.mp = maxPage
		this.site = site
		this.ir = isReloading
		this.tab = element
		this.icon = element.children[0]
		this.span = element.children[1]
		this.page = pageElement
		this.options = null
	}

	addHistory(text) {
		if (this.activeHistory < this.history.length - 1) {
			let ind = this.activeHistory
			this.history = this.history.filter((value, index, arr) => { 
				return index <= ind
			})
		}

		this.activeHistory += 1
		this.history.push(text)
	}

	prev() {
		if (this.activeHistory != 0) {
			this.activeHistory -= 1
			eval(this.history[this.activeHistory])
		}
	}

	next() {
		if (this.activeHistory != this.history.length - 1) {
			this.activeHistory += 1
			eval(this.history[this.activeHistory])
		}
	}

	reload() {
		if (this.ir == false) {
			this.ir = true
			eval(this.history[this.activeHistory])
		}
	}

	rename(name) {
		this.span.innerText = name
		this.tab.setAttribute('title', name)
	}

	changeIcon(url) {
		this.icon.setAttribute('src', url)
	}
}

class Download {
	#url
	#savepath
	#file
	#stream
	#onerror
	#oncomplete
	#ondata
	#onresponse

	constructor(url, savepath) {
		this.#url = url
		this.#savepath = savepath
		this.#file = null
		this.#stream = null
		this.#onerror = null
		this.#oncomplete = null
		this.#ondata = null
		this.#onresponse = null
	}

	OnError(callback) {
		if (typeof callback != 'function') return
		this.#onerror = callback
	}

	OnComplete(callback) {
		if (typeof callback != 'function') return
		this.#oncomplete = callback
	}

	OnResponse(callback) {
		if (typeof callback != 'function') return
		this.#onresponse = callback
	}

	OnData(callback) {
		if (typeof callback != 'function') return
		this.#ondata = callback
	}

	Start() {
		this.#file = fs.createWriteStream(this.#savepath)
		this.#stream = request(this.#url, { followRedirect:true, followAllRedirects:true })
		this.#stream.pipe(this.#file)
		this.#stream.on('error', err => {
			this.#file.close()
			try { fs.unlinkSync(this.#savepath) } catch(e) {}
			if (this.#onerror != null) this.#onerror(err)
		})
		this.#stream.on('response', resp => {
			if (this.#onresponse != null) this.#onresponse(resp)
		})
		this.#stream.on('complete', () => {
			this.#file.close()
			if (this.#oncomplete != null) this.#oncomplete(this.#savepath)
		})
		this.#stream.on('data', data => {
			if (this.#ondata != null) this.#ondata(data.length)
		})
	}

	Pause() {
		this.#stream.pause()
	}

	Play() {
		this.#stream.resume()
	}

	Stop() {
		this.#stream.destroy()
		this.#file.close()
		try {
			fs.unlinkSync(this.#savepath)
		} catch(err) { console.error('StopingDownload->'+err) }
	}
}

class DownloadManager {
	#indexs
	#info
	#sort
	#passKeyIndex

	constructor() {
		this.#indexs = []
		this.#info = []
		this.#sort = []
	}

	HasDownload() {
		if (this.#indexs.length == 0) {
			document.getElementById('d-p-t').style.display = 'none'
			return false
		} else {
			document.getElementById('d-p-t').style.display = 'block'
			return true
		}
	}

	IsDownloading(site, id) {
		for (let i = 0; i < this.#info.length; i++) if (this.#info[i].site == site && this.#info[i].id == id) return true
		return false
	}

	AddToStarting(site, id) {
		const date = new Date().getTime()
		const index = `${date}-${Math.floor(Math.random() * 1000)}`
		const num = this.#indexs.length
		this.#indexs[num] = index
		this.#info[num] = {site:site,id:id,date:date,dl:null}
		changeButtonsToDownloading(id, site, false)
		return index
	}

	StopFromStarting(index) {
		const num = this.#indexs.indexOf(index)
		if (num < 0) return
		const site = this.#info[num].site
		const id = this.#info[num].id
		this.#indexs.splice(num,1)
		this.#info.splice(num,1)
		const sortnum = this.#sort.indexOf(index)
		if (sortnum > -1) this.#sort.splice(sortnum,1)
		changeButtonsToDownloading(id, site, true)
		this.HasDownload()
	}

	Add(index, url, thumb, list, result) {
		const num = this.#indexs.indexOf(index)
		if (num < 0) return
		this.#info[num].pause = false
		this.#info[num].result = result
		this.#info[num].url = url
		this.#info[num].dlList = list
		this.#info[num].dls = []
		this.#info[num].dlIndex = 0
		this.#info[num].max = list.length
		this.#info[num].totalSize = 0
		this.#info[num].dlSize = 0
		this.#info[num].percent = (100 / list.length)
		this.MakeFormatList(num)
		this.#info[num].comicId = lastComicId
		this.#info[num].haveId = lastHaveId
		lastComicId++
		lastHaveId++
		
		const container = document.createElement('div')
		const site = sites[this.#info[num].site]

		container.innerHTML = `<div><img src="${thumb}" loading="lazy"><img src="Image/sites/${site.name}-30x30.jpg" title="${site.url}"></div>`
		const second = document.createElement('div')
		second.setAttribute('detail', '')
		second.innerHTML = `<name title="${result.title.replace(/"/g, '')}">${result.title}</name><url title="Open in Browser" onclick="Downloader.OpenURL('${index}')">${url}</url>`
		const second_first = document.createElement('proc')
		const second_first_first = document.createElement('div')
		second_first_first.innerText = '0 / '+list.length
		second_first.appendChild(second_first_first)
		const second_first_second = document.createElement('pr')
		const second_first_second_first = document.createElement('div')
		second_first_second.appendChild(second_first_second_first)
		second_first.appendChild(second_first_second)
		second.appendChild(second_first)
		let temp = document.createElement('btns')
		const btn = document.createElement('btn')
		btn.setAttribute('onclick', `Downloader.TogglePause('${index}')`)
		btn.innerText = 'Pause'
		let temp2 = document.createElement('btn')
		temp2.setAttribute('onclick',`Downloader.Cancel('${index}',true)`)
		temp2.innerText = 'Cancel'
		temp.appendChild(btn)
		temp.appendChild(temp2)
		second.appendChild(temp)
		temp = document.createElement('showinfolder')
		temp.innerHTML = `<div title="Open Downloading Comic Folder" onclick="Downloader.OpenFolder('${index}')">Show in Folder</div>`
		second.appendChild(temp)
		container.appendChild(second)
		temp = document.createElement('div')
		container.appendChild(temp)

		try {
			if (num > 0) this.#info[num-1].container.parentElement.insertBefore(container, this.#info[num-1].container)
			else document.getElementById('d-p-c').appendChild(container)
		} catch(err) { document.getElementById('d-p-c').appendChild(container) }
		this.#info[num].container = container
		this.#info[num].text = second_first_first
		this.#info[num].proc = second_first_second_first
		this.#info[num].btn = btn
		this.#sort.push(index)
		PopAlert(`Download Started. '${result.title.length > 26 ? result.title : result.title.substr(0, 23)+'...'}'`, 'primary')
		document.getElementById('d-p-t').style.display = 'block'
		this.Download(index)
	}

	Download(index) {
		const num = this.#indexs.indexOf(index)
		if (num < 0) return
		const sortnum = this.#sort.indexOf(index)
		if (sortnum < 0 || sortnum >= setting.download_limit || this.#info[num].pause) {
			setTimeout(() => { this.Download(index) }, 1000);
			return
		}
		const date = this.#info[num].date
		const SubFolder = `${dirUL}/${this.#info[num].comicId}${date}`
		if (!fs.existsSync(SubFolder)) fs.mkdirSync(SubFolder)
		const url = this.#info[num].dlList[0]
		const SaveName = `${date}-${this.#info[num].dlIndex}.${fileExt(url)}`
		this.#info[num].dlIndex += 1
		const Percent = this.#info[num].percent * this.#info[num].dlIndex
		this.#info[num].dl = new Download(url, SubFolder+'/'+SaveName)

		this.#info[num].dl.OnError(err => {
			const num2 = this.#indexs.indexOf(index)
			if (num2 < 0) {
				try { fs.rmdirSync(SubFolder) } catch(err) {}
				return
			}
			this.#info[num2].dlList.shift()
			this.#info[num2].proc.style.width = Percent+'%'
			this.#info[num2].text.innerText = this.#info[num2].dlIndex+' / '+this.#info[num2].max

			if (this.#info[num2].dlList.length == 0) {
				CreateComic(this.#info[num2].comicId, this.#info[num2].haveId, this.#info[num2].result, this.#info[num2].date, this.#info[num2].site, this.#info[num2].id, this.#info[num2].max, this.#info[num2].formatList)
				this.#info[num2].container.remove()
				this.#indexs.splice(num2,1)
				this.#info.splice(num2,1)
				const sortnum2 = this.#sort.indexOf(index)
				if (sortnum2 > -1) this.#sort.splice(sortnum2,1)
				this.HasDownload()
			} else {
				this.#info[num2].totalSize = 0
				this.#info[num2].dlSize = 0
				this.Download(index)
			}
		})

		this.#info[num].dl.OnComplete(filename => {
			const num2 = this.#indexs.indexOf(index)
			if (num2 < 0) {
				try { fs.unlinkSync(filename) } catch(e) {}
				try { fs.rmdirSync(SubFolder) } catch(err) {}
				return
			}
			this.#info[num2].dlList.shift()
			this.#info[num2].dls.push(filename)
			this.#info[num2].proc.style.width = Percent+'%'
			this.#info[num2].text.innerText = this.#info[num2].dlIndex+' / '+this.#info[num2].max

			if (this.#info[num2].dlList.length == 0) {
				CreateComic(this.#info[num2].comicId, this.#info[num2].haveId, this.#info[num2].result, this.#info[num2].date, this.#info[num2].site, this.#info[num2].id, this.#info[num2].max, this.#info[num2].formatList)
				this.#info[num2].container.remove()
				this.#indexs.splice(num2,1)
				this.#info.splice(num2,1)
				const sortnum2 = this.#sort.indexOf(index)
				if (sortnum2 > -1) this.#sort.splice(sortnum2,1)
				this.HasDownload()
			} else {
				this.#info[num2].totalSize = 0
				this.#info[num2].dlSize = 0
				this.Download(index)
			}
		})

		this.#info[num].dl.OnResponse(resp => {
			const num2 = this.#indexs.indexOf(index)
			if (num2 < 0) return
			this.#info[num2].totalSize = formatBytes(parseInt(resp.headers['content-length']))
		})

		this.#info[num].dl.OnData(data => {
			const num2 = this.#indexs.indexOf(index)
			if (num2 < 0) return
			this.#info[num2].dlSize += data
			this.#info[num2].text.innerText = this.#info[num2].dlIndex+' / '+this.#info[num2].max+' - '+formatBytes(this.#info[num2].dlSize)+'/'+this.#info[num2].totalSize
		})

		this.#info[num].dl.Start()
	}

	MakeFormatList(num, list = null) {
		let formatList = [], firstIndex = 0
		let dlList
		if (list == null) dlList = this.#info[num].dlList
		else dlList = list
		let thisFormat = fileExt(dlList[0])
		if (dlList.length > 1) {
			for (let i = 0; i < dlList.length; i++) {
				if (fileExt(dlList[i]) == thisFormat) {
					if (i == dlList.length - 1) formatList.push([firstIndex, i, thisFormat])
				} else {
					formatList.push([firstIndex, i - 1, thisFormat])
					thisFormat = fileExt(dlList[i])
					firstIndex = i
					if (i == dlList.length - 1) formatList.push([firstIndex, i, thisFormat])
				}
			}
		} else formatList = [[0,0,fileExt(dlList[0])]]

		if (list == null) this.#info[num].formatList = formatList
		else return formatList
	}

	TogglePause(index) {
		const num = this.#indexs.indexOf(index)
		if (num < 0) return
		if (this.#info[num].pause) {
			this.#info[num].pause = false
			if (this.#info[num].dl != null) this.#info[num].dl.Play()
			this.#info[num].btn.removeAttribute('resume')
			this.#info[num].btn.innerText = 'Pause'
			const sortnum = this.#sort.indexOf(index)
			if (sortnum > -1) this.#sort.splice(sortnum,1)
			this.#sort.push(index)
		} else {
			this.#info[num].pause = true
			if (this.#info[num].dl != null) this.#info[num].dl.Pause()
			this.#info[num].btn.setAttribute('resume', '')
			this.#info[num].btn.innerText = 'Resume'
			const sortnum = this.#sort.indexOf(index)
			if (sortnum > -1) this.#sort.splice(sortnum,1)
		}
	}

	PauseAll() {
		for (let i = 0; i < this.#indexs.length; i++) if (!this.#info[i].pause) {
			this.#info[i].pause = true
			if (this.#info[i].dl != null) this.#info[i].dl.Pause()
			this.#info[i].btn.setAttribute('resume', '')
			this.#info[i].btn.innerText = 'Resume'
			const sortnum = this.#sort.indexOf(this.#indexs[i])
			if (sortnum > -1) this.#sort.splice(sortnum,1)
		}
	}

	ResumeAll() {
		for (let i = 0; i < this.#indexs.length; i++) if (this.#info[i].pause) {
			if (this.#info[i].pause) {
				this.#info[i].pause = false
				if (this.#info[i].dl != null) this.#info[i].dl.Play()
				this.#info[i].btn.removeAttribute('resume')
				this.#info[i].btn.innerText = 'Pause'
				const sortnum = this.#sort.indexOf(this.#indexs[i])
				if (sortnum > -1) this.#sort.splice(sortnum,1)
				this.#sort.push(this.#indexs[i])
			}
		}
	}

	Cancel(index, alert = false) {
		const num = this.#indexs.indexOf(index)
		if (num < 0) return
		const list = this.#info[num].dls
		const SubFolder = `${dirUL}/${this.#info[num].comicId}${this.#info[num].date}`
		const site = this.#info[num].site, id = this.#info[num].id
		if (this.#info[num].dl != null) this.#info[num].dl.Stop()
		this.#info[num].container.remove()
		this.#indexs.splice(num,1)
		this.#info.splice(num,1)
		const sortnum = this.#sort.indexOf(index)
		if (sortnum > -1) this.#sort.splice(sortnum,1)
		for (let i = 0; i < list.length; i++) if (fs.existsSync(list[i])) fs.unlinkSync(list[i])
		try { fs.rmdirSync(SubFolder) } catch(err) {}
		changeButtonsToDownloading(id, site, true)
		if (alert) {
			PopAlert('Download Canceled.', 'warning')
			this.HasDownload()
		}
	}

	CancelAll() {
		for (let i = this.#indexs.length - 1; i >= 0; i--) this.Cancel(this.#indexs[i], false)
		PopAlert('Downloads Canceled.', 'warning')
		this.HasDownload()
	}

	OpenURL(index) {
		const num = this.#indexs.indexOf(index)
		if (num < 0) return
		try {
			remote.shell.openExternal(this.#info[num].url)
		} catch(err) { error('OpenURL->'+err)}
	}

	OpenFolder(index) {
		const num = this.#indexs.indexOf(index)
		if (num < 0) return
		try {
			remote.shell.openPath(`${dirUL}/${this.#info[num].comicId}${this.#info[num].date}`)
		} catch(err) { PopAlert('OpenFolder->'+err) }
	}

	OpenPanel() {
		this.#passKeyIndex = keydownEventIndex
		keydownEventIndex = null
		document.getElementById('download-panel').setAttribute('active', '')
	}

	ClosePanel() {
		keydownEventIndex = this.#passKeyIndex
		document.getElementById('download-panel').removeAttribute('active')
	}
}

class OfflinePageManager {
	#byName
	#scroll
	#counter
	#title
	#titleDom
	#infoSearchs
	#infoNames

	constructor() {
		this.page = 1
		this.maxPage = 1
		this.search = null
		this.loadIndex = 0
		this.name = null
		this.infoIndex = null
		this.infoNameIndex = null
		this.container = document.getElementById('comic-container')
		this.sort = {_id:-1}
		this.#byName = false
		this.#scroll = 0
		this.#counter = document.getElementById('comics-counter')
		this.#title = null
		this.#titleDom = document.getElementById('off-page-title')
		this.#infoSearchs = [
			'groupsDB.indexOf({})',
			'artistsDB.indexOf({})',
			'parodiesDB.indexOf({})',
			'tagsDB.indexOf({})',
			'charactersDB.indexOf({})',
			'languagesDB.indexOf({})',
			'categoriesDB.indexOf({})',
		]
		this.#infoNames = [
			'Groups',
			'Artists',
			'Parodies',
			'Tags',
			'Characters',
			'Languages',
			'Categories'
		]
	}

	GetPagination(total_pages, page) {
		let min = 1, max = 1, bdot = false, fdot = false, bfirst = false, ffirst = false, pagination_width = 5
		if (total_pages > pagination_width - 1) {
			if (page == 1) {
				min = 1
				max = pagination_width
			} else {
				if (page < total_pages) {
					if (page == pagination_width || page == pagination_width - 1) min = page - Math.floor(pagination_width / 2) - 1
					else min = page - Math.floor(pagination_width / 2)
					
					if (page == (total_pages - pagination_width) + 1 || page == (total_pages - pagination_width) + 2) max = page + Math.floor(pagination_width / 2) + 1
					else max = page + Math.floor(pagination_width / 2)
				} else {
					min = page - pagination_width + 1
					max = page
				}
			}
		} else {
			min = 1
			max = total_pages
		}
		
		if (min < 1) min = 1
		if (max > total_pages) max = total_pages
		
		if (page > pagination_width - 1 && total_pages > pagination_width) bfirst = true
		if (page > pagination_width && total_pages > pagination_width + 1) bdot = true
		if (page < (total_pages - pagination_width) + 2 && total_pages > pagination_width) ffirst = true
		if (page < (total_pages - pagination_width) + 1 && total_pages > pagination_width + 1) fdot = true
		
		const arr = []
		if (page > 1) arr.push(['Prev', page - 1])
		if (bfirst) arr.push(['1', 1])
		if (bdot) arr.push(['...', null])
		for (let i=min; i <= max;i++) {
			if (i == page) arr.push([`${i}`, null])
			else arr.push([`${i}`, i])
		}
		if (fdot) arr.push(['...', null])
		if (ffirst) arr.push([`${total_pages}`, total_pages])
		if (page < total_pages) arr.push(['Next', page + 1])

		return arr
	}
	
	Load(page = 1) {
		this.page = page
		this.loadIndex = 0
		this.#scroll = document.getElementById('main-body').scrollTop
		this.container.innerHTML = null
		this.#titleDom.innerHTML = null

		let load = {}
		if (this.search != null) load.n = new RegExp(this.search.toLowerCase())

		db.comics.find(load).sort(this.sort).exec((err, doc) => {
			if (err) { error(err); return }
			const list = []
			let limit = this.#MaxAndMin(doc.length, page)
			if (page > limit[2]) {
				page = limit[2]
				limit = this.#MaxAndMin(doc.length, page)
			}
			this.maxPage = limit[2]
			this.#title = 'Page '
			
			for (let i = limit[0]; i < limit[1]; i++) list.push([doc[i]._id, doc[i].n, doc[i].i, doc[i].o, doc[i].c])

			this.#counter.textContent = 'Comics: '+doc.length
			this.#Content(limit[2], list, page, 'PageManager.Load({p})')
		})
	}

	SetInfo(name, index) {
		this.name = name
		this.infoIndex = index
		const result = eval(this.#infoSearchs[index].replace('{}', `'${name.replace(/'/g, "\\'")}'`))
		if (result < 0) { error('Info not Found! Maybe this is Bug! Please Report it with info name.'); return }
		this.infoNameIndex = result
		this.search = null
		document.getElementById('offline-search-form-input').value = null
		closeInfoPanel()
		closeComicPanel()
		this.#title = this.#infoNames[index]+' > <span class="nhentai-glow">'+name+'</span> > Page '
		this.LoadInfo(1)
	}

	LoadInfo(page = 1) {
		this.page = page
		this.loadIndex = 1
		this.#scroll = document.getElementById('main-body').scrollTop
		this.container.innerHTML = null
		this.#titleDom.innerHTML = null

		const load = {}
		if (this.search != null) load.n = new RegExp(this.search.toLowerCase())

		db.comics.find(load).sort(this.sort).exec((err, doc) => {
			if (err) { error(err); return }

			let check

			switch(this.infoIndex) {
				case 0:
					check = 'g'
					break
				case 1:
					check = 'a'
					break
				case 2:
					check = 'd'
					break
				case 3:
					check = 't'
					break
				case 4:
					check = 'h'
					break
				case 5:
					check = 'l'
					break
				case 6:
					check = 'e'
					break
			}

			const result = []
			for (let i = 0; i < doc.length; i++) {
				if (doc[i][check] == null || doc[i][check].length == 0) continue
				if (doc[i][check].indexOf(this.infoNameIndex) > -1) result.push(doc[i])
			}

			const list = []
			let limit = this.#MaxAndMin(result.length, page)
			if (page > limit[2]) {
				page = limit[2]
				limit = this.#MaxAndMin(result.length, page)
			}
			this.maxPage = limit[2]
			
			for (let i = limit[0]; i < limit[1]; i++) list.push([result[i]._id, result[i].n, result[i].i, result[i].o, result[i].c])

			this.#counter.textContent = 'Comics: '+doc.length
			this.#Content(limit[2], list, page, 'PageManager.LoadInfo({p})')
		})
	}

	#Content(allPages, list, page, paginationTemplate) {
		let html = ''
		this.#titleDom.innerHTML = this.#title+page
		const time = new Date().getTime()
		if (setting.show_unoptimize) {
			for (let i = 0; i < list.length; i++) {
				let image = `${dirUL}/thumbs/${list[i][2]}.jpg`, thumb = true, optimize = true , unoptimize = ''
				if (!fs.existsSync(image)) { image = 'Image/no-img-300x300.png'; thumb = false }
				if (typeof list[i][3] != 'number') { unoptimize = ' unoptimize'; optimize = false }
				html += `<div class="comic" onmousedown="onComicClicked(${list[i][0]}, ${thumb}, ${optimize})"${unoptimize}><img src="${image}?${time}"><span>${list[i][4]}</span><p>${list[i][1]}</p></div>`
			}
		} else {
			for (let i = 0; i < list.length; i++) {
				let image = `${dirUL}/thumbs/${list[i][2]}.jpg`, thumb = true, optimize = true
				if (!fs.existsSync(image)) { image = 'Image/no-img-300x300.png'; thumb = false }
				if (typeof(list[i][3]) != 'number') optimize = false
				html += `<div class="comic" onmousedown="onComicClicked(${list[i][0]}, ${thumb}, ${optimize})"><img src="${image}?${time}"><span>${list[i][4]}</span><p>${list[i][1]}</p></div>`
			}
		}
		this.container.innerHTML = html
		
		// Pagination
		document.getElementById('jp-m-p').textContent = allPages
		if (allPages > 1) {
			document.getElementById('offline-search-form').style.display = 'flex'
			document.getElementById('jump-page-container').style.display = 'inline-block'
			const jp_i = document.getElementById('jp-i')
			jp_i.setAttribute('oninput', `inputLimit(this, ${allPages});PageManager.JumpPage(Number(this.value))`)
			jp_i.value = page
			const thisPagination = this.GetPagination(allPages, page)
			html = '<div>'
			for (let i in thisPagination) {
				if (thisPagination[i][1] == null) html += `<button disabled>${thisPagination[i][0]}</button>`
				else html += `<button onclick="${paginationTemplate.replace('{p}', thisPagination[i][1])}">${thisPagination[i][0]}</button>`
			}
			html += '</div>'
			document.getElementById('pagination').innerHTML = html
			document.getElementById('pagination').style.display = 'block'
		} else {
			if (this.search == null) document.getElementById('offline-search-form').style.display = 'none'
			document.getElementById('pagination').style.display = 'none'
			document.getElementById('jump-page-container').style.display = 'none'
		}

		if (list.length == 0) {
			if (this.search != null) this.container.innerHTML = '<br><div class="alert alert-danger">No Comic has been Found.</div>'
			else this.container.innerHTML = '<br><div class="alert alert-danger">There is no Comic Downloaded.</div>'
			this.#titleDom.innerHTML = null
		}

		document.getElementById('main-body').scrollTop = this.#scroll
	}

	#MaxAndMin(length, page) {
		const max_per_page = setting.max_per_page
		let min = 0, max = 0
		const allPages = Math.ceil(length / max_per_page)
		if (length >= max_per_page) {
			min = (max_per_page * page) - max_per_page
			max = min + max_per_page
			if (max > length) max = length
		} else max = length

		return [min, max, allPages]
	}

	Reload() {
		switch(this.loadIndex) {
			case 0:
				this.Load(this.page)
				break
			case 1:
				this.LoadInfo(this.page)
				break
		}
	}

	Search(value) {
		if (value.replace(/ /g, '').length == 0) value = null
		this.search = value
		switch(this.loadIndex) {
			case 0:
				this.Load(1)
				break
			case 1:
				this.LoadInfo(1)
				break
		}
	}

	JumpPage(page) {
		if (page < 1) page = 1
		switch(this.loadIndex) {
			case 0:
				this.Load(page)
				break
			case 1:
				this.LoadInfo(page)
				break
		}
	}

	RandomJumpPage() {
		let page = Math.floor(Math.random() * this.maxPage)
		if (page < 1) page = 1
		switch(this.loadIndex) {
			case 0:
				this.Load(page)
				break
			case 1:
				this.LoadInfo(page)
				break
		}
	}

	Next() {
		if (this.page < this.maxPage) {
			switch(this.loadIndex) {
				case 0:
					this.Load(this.page + 1)
					break
				case 1:
					this.LoadInfo(this.page + 1)
					break
			}
		}
	}

	Prev() {
		if (this.page > 1) {
			switch(this.loadIndex) {
				case 0:
					this.Load(this.page - 1)
					break
				case 1:
					this.LoadInfo(this.page - 1)
					break
			}
		}
	}

	Sort(index) {
		switch(index) {
			case 0:
				this.sort = {_id:-1}
				break
			case 1:
				this.sort = {_id:1}
				break
			case 2:
				this.sort = {n:-1}
				break
			case 3:
				this.sort = {n:1}
				break
		}
		const children = document.getElementById('off-page-sort').children
		for (let i = 0; i < children.length; i++) children[i].removeAttribute('active')
		children[index].setAttribute('active','')
		this.Reload()
	}

	Home() {
		document.getElementById('offline-search-form-input').value = null
		this.search = null
		this.Load(1)
	}
}