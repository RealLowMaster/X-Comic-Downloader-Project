let thumbErrLog = []

function makeThumb() {
	thumbErrLog = []
	db.comics.find({}, (err, doc) => {
		if (err) { error(err); return }
		loading.reset(doc.length + 2)
		loading.show(`Checking Thumbs...`)

		setTimeout(() => {
			checkThumbs(doc)
		}, 100)
	})
}

function checkThumbs(doc) {
	const list = [], len = doc.length
	let url = ''
	for (let i = 0; i < len; i++) {
		if (doc[i].m == undefined || doc[i].m.length == 0) url = `${dirUL}/${doc[i].i}-0.${doc[i].f[0][2]}`
		else if (doc[i].m.indexOf(0) > -1) {
			thumbErrLog.push('Undownloaded Image, Comic: '+doc[i].n)
			continue
		} else url = `${dirUL}/${doc[i].i}-0.${doc[i].f[0][2]}`
		
		if (!fs.existsSync(`${dirUL}/thumbs/${doc[i].i}.jpg`)) {
			if (fs.existsSync(url)) list.push([url, doc[i].i])
			else thumbErrLog.push("Image Not Found, Comic: "+doc[i].n)
		}
	}
	
	if (list.length > 0) {
		loading.forward('Making Thumbs...')
		createThumb(list, 0)
	} else if (thumbErrLog.length == 0) {
		loading.hide()
		PopAlert('All Thumbs Made Successfuly.')
	} else {
		loading.hide()
		errorList(thumbErrLog)
	}
}

function createThumb(list, index) {
	sharp(list[index][0]).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${list[index][1]}.jpg`).then(() => {
		loading.forward()
		if (index != list.length - 1) {
			setTimeout(() => {
				createThumb(list, index + 1)
			}, 100)
		} else {
			loading.hide()
			reloadLoadingComics()
			if (thumbErrLog.length == 0) PopAlert('All Thumbs Made Successfuly.')
			else errorList(thumbErrLog)
		}
	}).catch(err => {
		loading.forward()
		thumbErrLog.push(err)
		if (index != list.length - 1) {
			setTimeout(() => {
				createThumb(list, index + 1)
			}, 100)
		} else {
			loading.hide()
			reloadLoadingComics()
			if (thumbErrLog.length == 0) PopAlert('All Thumbs Made Successfuly.')
			else errorList(thumbErrLog)
		}
	})
}

function makeThumbForAComic(id) {
	db.comics.findOne({_id:id}, (err, doc) => {
		if (err) { error(err); return }
		if (doc == undefined) { error('Comic Not Found'); return }
		loading.reset(3)
		loading.show(`Checking Thumbs...`)

		setTimeout(() => {
			if (doc.m == undefined || doc.m.length == 0) url = `${dirUL}/${doc.i}-0.${doc.f[0][2]}`
			else if (doc.m.indexOf(0) > -1) {
				loading.hide()
				error('Undownloaded Image, Comic: '+doc.n)
				return
			} else url = `${dirUL}/${doc.i}-0.${doc.f[0][2]}`
			
			if (!fs.existsSync(`${dirUL}/thumbs/${doc.i}.jpg`)) {
				if (fs.existsSync(url)) {
					loading.forward('Making Thumbs...')
					setTimeout(() => {
						sharp(url).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${doc.i}.jpg`).then(() => {
							loading.forward()
							loading.hide()
							PopAlert('Thumbs Made Successfuly.')
						}).catch(err => {
							loading.forward()
							loading.hide()
							error(err)
						})
					}, 100)
				} else {
					loading.hide()
					error("Image Not Found, Comic: "+doc.n)
				}
			} else {
				loading.hide()
				PopAlert('Comic Already Have Thumb.', 'danger')
			}
		}, 100)
	})
}

function makeThumbForDownloadingComic(repair, image, format, callback) {
	setTimeout(() => {
		let url = ''
		if (repair == undefined || repair.length == 0) url = `${dirUL}/${image}-0.${format}`
		else if (repair.indexOf(0) > -1) {
			callback()
			return
		} else url = `${dirUL}/${image}-0.${format}`
		
		if (!fs.existsSync(`${dirUL}/thumbs/${image}.jpg`)) {
			if (fs.existsSync(url)) {
				setTimeout(() => {
					sharp(url).resize(225, 315).jpeg().toFile(`${dirUL}/thumbs/${image}.jpg`).then(() => {
						callback()
					}).catch(err => {
						callback()
					})
				}, 100)
			}
		}
	}, 100)
}