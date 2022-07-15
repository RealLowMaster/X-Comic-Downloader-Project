let thumbErrLog = []

function makeThumb(reCreate) {
	KeyManager.ChangeCategory(null)
	thumbErrLog = []
	if (!fs.existsSync(dirUL+'/thumbs')) fs.mkdirSync(dirUL+'/thumbs')
	db.comics.find({}, (err, doc) => {
		if (err) { error(err); KeyManager.ChangeCategory('default'); return }
		loading.Show(1, 'Checking Thumbs...')
		document.getElementById('main').style.display = 'none'

		const scrollTop = document.getElementById('main-body').scrollTop
		PageManager.container.innerHTML = ''
		setTimeout(() => {
			checkThumbs(doc, reCreate, scrollTop)
		}, 1)
	})
}

function checkThumbs(doc, reCreate, scrollTop) {
	const list = [], len = doc.length
	let url, image
	for (let i = 0; i < len; i++) {
		image = doc[i].i
		url = `${dirUL}/${doc[i]._id}${image}/${image}-0.${doc[i].f[0][2]}`

		if (!fs.existsSync(url)) {
			thumbErrLog.push(`Undownloaded Image, Comic: ${doc[i].n}`)
			continue
		}
		
		if (reCreate) {
			if (fs.existsSync(`${dirUL}/thumbs/${image}.jpg`)) {
				try {
					fs.unlinkSync(`${dirUL}/thumbs/${image}.jpg`)
				} catch(err) {
					thumbErrLog.push(`Failed To Delete Thumb, Comic: ${doc[i].n}`)
				}
				if (fs.existsSync(url)) list.push([url, image])
				else thumbErrLog.push(`Image Not Found, Comic: ${doc[i].n}`)
			} else {
				if (fs.existsSync(url)) list.push([url, image])
				else thumbErrLog.push(`Image Not Found, Comic: ${doc[i].n}`)
			}
		} else {
			if (!fs.existsSync(`${dirUL}/thumbs/${image}.jpg`)) {
				if (fs.existsSync(url)) list.push([url, image])
				else thumbErrLog.push(`Image Not Found, Comic: ${doc[i].n}`)
			}
		}
	}
	
	if (list.length > 0) {
		loading.ChangePercent(list.length)
		loading.Forward(`Making Thumbs (0/${list.length})...`)
		createThumb(list, 0)
	} else if (thumbErrLog.length == 0) {
		loading.Close()
		document.getElementById('main').style.display = 'flex'
		KeyManager.ChangeCategory('default')
		PopAlert('All Thumbs Made Successfuly.')
		PageManager.Reload()
	} else {
		loading.Close()
		document.getElementById('main').style.display = 'flex'
		KeyManager.ChangeCategory('default')
		errorList(thumbErrLog)
		PageManager.Reload()
	}
}

function createThumb(list, index, scrollTop) {
	sharp(list[index][0]).resize(225, 315).jpeg({ mozjpeg: true }).toFile(`${dirUL}/thumbs/${list[index][1]}.jpg`).then(() => {
		loading.Forward(`Making Thumbs (${index+1}/${list.length})...`)
		if (index != list.length - 1) {
			setTimeout(() => {
				createThumb(list, index + 1, scrollTop)
			}, 1)
		} else {
			loading.Close()
			document.getElementById('main').style.display = 'flex'
			KeyManager.ChangeCategory('default')
			PageManager.Reload()
			if (thumbErrLog.length == 0) PopAlert('All Thumbs Made Successfuly.')
			else errorList(thumbErrLog)
		}
	}).catch(err => {
		loading.Forward(`Making Thumbs (${index+1}/${list.length})...`)
		thumbErrLog.push(err)
		if (index != list.length - 1) {
			setTimeout(() => {
				createThumb(list, index + 1, scrollTop)
			}, 1)
		} else {
			loading.Close()
			document.getElementById('main').style.display = 'flex'
			KeyManager.ChangeCategory('default')
			PageManager.Reload()
			if (thumbErrLog.length == 0) PopAlert('All Thumbs Made Successfuly.')
			else errorList(thumbErrLog)
		}
	})
}

function makeThumbForAComic(id, keyEvents) {
	KeyManager.ChangeCategory(null)
	if (!fs.existsSync(dirUL+'/thumbs')) fs.mkdirSync(dirUL+'/thumbs')
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); KeyManager.BackwardCategory(); return }
		if (doc == undefined) { error('Comic Not Found'); return }
		const scrollTop = document.getElementById('main-body').scrollTop
		PageManager.container.innerHTML = ''
		loading.Show(3, 'Checking Thumbs...')

		setTimeout(() => {
			const image = doc.i
			const url = `${dirUL}/${doc._id}${image}/${image}-0.${doc.f[0][2]}`

			if (!fs.existsSync(url)) {
				error('This Comic First Image Is not Downloaded, we cannot make Thumb From It.')
				loading.Close()
				PageManager.Reload()
				KeyManager.BackwardCategory()
				return
			}
			
			if (fs.existsSync(`${dirUL}/thumbs/${image}.jpg`)) {
				try {
					fs.unlinkSync(`${dirUL}/thumbs/${image}.jpg`)
				} catch(err) {
					console.error(err)
				}
			}

			if (fs.existsSync(url)) {
				loading.Forward('Making Thumbs...')
				setTimeout(() => {
					sharp(url).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${image}.jpg`).then(() => {
						loading.Forward()
						loading.Close()
						PopAlert('Thumbs Made Successfuly.')
						const comic_thumb_optimize_btn = document.getElementById('c-a-p-o-t')
						comic_thumb_optimize_btn.setAttribute('class', 'warning-action')
						comic_thumb_optimize_btn.innerText = 'ReMake Thumb'
						PageManager.Reload()
						KeyManager.BackwardCategory()
					}).catch(err => {
						loading.Forward()
						loading.Close()
						error('MakeThumb: '+err)
						PageManager.Reload()
						KeyManager.BackwardCategory()
					})
				}, 10)
			} else {
				loading.Close()
				error("Image Not Found, Comic: "+doc.n)
				PageManager.Reload()
				KeyManager.BackwardCategory()
			}
		}, 10)
	})
}

function makeThumbForDownloadingComic(image, format, id, callback) {
	setTimeout(() => {
		let url = `${dirUL}/${id}${image}/${image}-0.${format}`
		if (!fs.existsSync(url)) { callback(null); return }
		if (!fs.existsSync(dirUL+'/thumbs')) fs.mkdirSync(dirUL+'/thumbs')

		if (fs.existsSync(url)) {
			setTimeout(() => {
				sharp(url).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${image}.jpg`).then(() => {
					callback()
				}).catch(err => {
					callback()
				})
			}, 10)
		} else callback()
	}, 10)
}