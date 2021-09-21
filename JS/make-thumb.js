let thumbErrLog = []

function makeThumb(reCreate) {
	keydownEventIndex = 100
	thumbErrLog = []
	db.comics.find({}, (err, doc) => {
		if (err) { error(err); keydownEventIndex = 0; return }
		loading.reset(0)
		loading.show(`Checking Thumbs...`)
		document.getElementById('main').style.display = 'none'

		const scrollTop = document.getElementById('main-body').scrollTop
		document.getElementById('comic-container').innerHTML = ''
		setTimeout(() => {
			checkThumbs(doc, reCreate, scrollTop)
		}, 100)
	})
}

function checkThumbs(doc, reCreate, scrollTop) {
	const list = [], len = doc.length
	let url = '' 
	for (let i = 0; i < len; i++) {
		url = `${dirUL}/${doc[i].i}-0.${doc[i].f[0][2]}`

		if (!fs.existsSync(url)) {
			thumbErrLog.push(`Undownloaded Image, Comic: ${doc[i].n}`)
			continue
		}
		
		if (reCreate) {
			if (fs.existsSync(`${dirUL}/thumbs/${doc[i].i}.jpg`)) {
				try {
					fs.unlinkSync(`${dirUL}/thumbs/${doc[i].i}.jpg`)
				} catch(err) {
					thumbErrLog.push(`Failed To Delete Thumb, Comic: ${doc[i].n}`)
				}
				if (fs.existsSync(url)) list.push([url, doc[i].i])
				else thumbErrLog.push(`Image Not Found, Comic: ${doc[i].n}`)
			} else {
				if (fs.existsSync(url)) list.push([url, doc[i].i])
				else thumbErrLog.push(`Image Not Found, Comic: ${doc[i].n}`)
			}
		} else {
			if (!fs.existsSync(`${dirUL}/thumbs/${doc[i].i}.jpg`)) {
				if (fs.existsSync(url)) list.push([url, doc[i].i])
				else thumbErrLog.push(`Image Not Found, Comic: ${doc[i].n}`)
			}
		}
	}
	
	if (list.length > 0) {
		loading.changePercent(list.length)
		loading.forward(`Making Thumbs (0/${list.length})...`)
		createThumb(list, 0)
	} else if (thumbErrLog.length == 0) {
		loading.hide()
		document.getElementById('main').style.display = 'grid'
		keydownEventIndex = 0
		PopAlert('All Thumbs Made Successfuly.')
		reloadLoadingComics(scrollTop)
	} else {
		loading.hide()
		document.getElementById('main').style.display = 'grid'
		keydownEventIndex = 0
		errorList(thumbErrLog)
		reloadLoadingComics(scrollTop)
	}
}

function createThumb(list, index, scrollTop) {
	sharp(list[index][0]).resize(225, 315).jpeg({ mozjpeg: true }).toFile(`${dirUL}/thumbs/${list[index][1]}.jpg`).then(() => {
		loading.forward(`Making Thumbs (${index+1}/${list.length})...`)
		if (index != list.length - 1) {
			setTimeout(() => {
				createThumb(list, index + 1, scrollTop)
			}, 100)
		} else {
			loading.hide()
			document.getElementById('main').style.display = 'grid'
			keydownEventIndex = 0
			reloadLoadingComics(scrollTop)
			if (thumbErrLog.length == 0) PopAlert('All Thumbs Made Successfuly.')
			else errorList(thumbErrLog)
		}
	}).catch(err => {
		loading.forward(`Making Thumbs (${index+1}/${list.length})...`)
		thumbErrLog.push(err)
		if (index != list.length - 1) {
			setTimeout(() => {
				createThumb(list, index + 1, scrollTop)
			}, 100)
		} else {
			loading.hide()
			document.getElementById('main').style.display = 'grid'
			keydownEventIndex = 0
			reloadLoadingComics(scrollTop)
			if (thumbErrLog.length == 0) PopAlert('All Thumbs Made Successfuly.')
			else errorList(thumbErrLog)
		}
	})
}

function makeThumbForAComic(id) {
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc == undefined) { error('Comic Not Found'); return }
		const scrollTop = document.getElementById('main-body').scrollTop
		document.getElementById('comic-container').innerHTML = ''
		loading.reset(3)
		loading.show(`Checking Thumbs...`)

		setTimeout(() => {
			const url = `${dirUL}/${doc.i}-0.${doc.f[0][2]}`

			if (!fs.existsSync(url)) { error('This Comic First Image Is not Downloaded, we cannot make Thumb From It.'); return }
			
			if (fs.existsSync(`${dirUL}/thumbs/${doc.i}.jpg`)) {
				try {
					fs.unlinkSync(`${dirUL}/thumbs/${doc.i}.jpg`)
				} catch(err) {
					console.error(err)
				}
			}

			if (fs.existsSync(url)) {
				loading.forward('Making Thumbs...')
				setTimeout(() => {
					sharp(url).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${doc.i}.jpg`).then(() => {
						loading.forward()
						loading.hide()
						PopAlert('Thumbs Made Successfuly.')
						const comic_thumb_optimize_btn = document.getElementById('c-a-p-o-t')
						comic_thumb_optimize_btn.setAttribute('class', 'warning-action')
						comic_thumb_optimize_btn.innerText = 'ReMake Thumb'
						reloadLoadingComics(scrollTop)
					}).catch(err => {
						loading.forward()
						loading.hide()
						error('MakeThumb: '+err)
						reloadLoadingComics(scrollTop)
					})
				}, 100)
			} else {
				loading.hide()
				error("Image Not Found, Comic: "+doc.n)
				reloadLoadingComics(scrollTop)
			}
		}, 100)
	})
}

function makeThumbForDownloadingComic(image, format, callback) {
	setTimeout(() => {
		let url = `${dirUL}/${image}-0.${format}`
		if (!fs.existsSync(url)) { callback(); return }
		
		if (fs.existsSync(url)) {
			setTimeout(() => {
				sharp(url).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${image}.jpg`).then(() => {
					callback()
				}).catch(err => {
					callback()
				})
			}, 100)
		} else callback()
	}, 100)
}