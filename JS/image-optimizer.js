let optimizeErrLog = [], optimizeLog = [], optimizeFullSize = 0, optimizeConvertSize = 0

function OptimizeComicImages(comic_id) {
	optimizeErrLog = []
	optimizeLog = []
	optimizeFullSize = 0
	optimizeConvertSize = 0
	window.stop()
	loading.reset(0)
	loading.show('Calculating...')
	
	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	document.getElementById('c-p-t').textContent = ''
	document.getElementById('c-s-o').innerHTML = ''
	document.getElementById('c-p-i').innerHTML = ''

	db.comics.findOne({_id:comic_id}, (err, doc) => {
		if (err) { loading.hide(); error(err); openComic(comic_id); return }

		document.getElementById('comic-action-panel').style.display='none'
		let ImagesCount = doc.c, formats = doc.f, image = doc.i, lastIndex = formats[0][1], thisForamat = formats[0][2], repair = doc.m || null, urls = [], formatIndex = 0

		if (repair == null || repair.length == 0) {
			for (let i = 0; i < ImagesCount; i++) {
				if (i <= lastIndex) {
					if (thisForamat != 'gif') urls.push([`${image}-${i}.${thisForamat}`, thisForamat])
				} else {
					formatIndex++
					lastIndex = formats[formatIndex][1]
					thisForamat = formats[formatIndex][2]
					if (thisForamat != 'gif') urls.push([`${image}-${i}.${thisForamat}`, thisForamat])
				}
			}
		} else {
			for (let i = 0; i < ImagesCount; i++) {
				if (repair.indexOf(i) == -1) {
					if (i <= lastIndex) {
						if (thisForamat != 'gif') urls.push([`${image}-${i}.${thisForamat}`, thisForamat])
					} else {
						formatIndex++
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
						if (thisForamat != 'gif') urls.push([`${image}-${i}.${thisForamat}`, thisForamat])
					}
				}
			}
		}

		loading.changePercent(urls.length + 2)
		loading.forward('Making Temp...')
		setTimeout(() => {
			let size = 0
			for (let i = 0; i < urls.length; i++) {
				try {
					size = fs.statSync(`${dirUL}/${urls[i][0]}`).size
					optimizeFullSize += size
					optimizeLog.push([size, null])
					fs.renameSync(`${dirUL}/${urls[i][0]}`, `${dirTmp}/${urls[i][0]}`)
				} catch(err) {
					console.log("MovingTemp: "+err)
					optimizeErrLog.push("MovingTemp: "+err)
				}
			}
			loading.forward(`Optimized Image (0/${urls.length})...`)
			convertImagesToOptimize(urls, 0, comic_id)
		}, 100)
	})
}

function convertImagesToOptimize(list, index, comic_id) {
	if (index == list.length) {
		db.comics.update({_id:comic_id}, { $set: {o:0} }, {}, (err) => {
			if (err) optimizeErrLog.push(err)
			loading.hide()

			errorSelector(`Size From: ${formatBytes(optimizeFullSize)} To: ${formatBytes(optimizeConvertSize)}`, null, false, [
				[
					"More Info",
					"btn btn-primary m-2",
					"this.parentElement.parentElement.remove();openOptimizeLog()"
				],
				[
					"Ok",
					"btn btn-success m-2"
				]
			])

			if (optimizeErrLog.length == 0) {
				PopAlert('Comic Images Has Been Optimize')
			} else errorList(optimizeErrLog)

			openComic(comic_id)

		})

		return
	} else if (list[index][1] == 'jpg' || list[index][1] == 'webp' || list[index][1] == 'jpeg') {
		sharp(`${dirTmp}/${list[index][0]}`).jpeg({ mozjpeg: true }).toFile(`${dirUL}/${list[index][0]}`).then(() => {

			if (list[index][1] == 'jpg' || list[index][1] == 'jpeg') {
				try {
					fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
				} catch(err) {
					optimizeErrLog.push("DeletingTemp: "+err)
				}
			}

			try {
				const size = fs.statSync(`${dirUL}/${list[index][0]}`).size
				optimizeConvertSize += size
				optimizeLog[index][1] = size
			} catch(err) {
				optimizeErrLog.push('SavingFileSize: '+err)
			}

			loading.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id) 
			}, 100)
		}).catch(err => {
			optimizeErrLog.push("Optimizing: "+err)
		})
	} else if (list[index][1] == 'png') {
		sharp(`${dirTmp}/${list[index][0]}`).png({ quality: 100 }).toFile(`${dirUL}/${list[index][0]}`).then(() => {

			try {
				fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
			} catch(err) {
				optimizeErrLog.push("DeletingTemp: "+err)
			}

			try {
				const size = fs.statSync(`${dirUL}/${list[index][0]}`).size
				optimizeConvertSize += size
				optimizeLog[index][1] = size
			} catch(err) {
				optimizeErrLog.push('SavingFileSize: '+err)
			}

			loading.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id) 
			}, 100)
		}).catch(err => {
			optimizeErrLog.push("Optimizing: "+err)
		})
	} else {
		try {
			fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${list[index][0]}`)

			const size = fs.statSync(`${dirUL}/${list[index][0]}`).size
			optimizeConvertSize += size
			optimizeLog[index][1] = size

			loading.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id) 
			}, 100)
		} catch(err) {
			optimizeErrLog.push("Optimize: "+err)
		}
	}
}

function openOptimizeLog() {
	if (optimizeLog.length == 0) { PopAlert('There is no Log!', 'danger'); return }

	const newList = []
	for (let i = 0; i < optimizeLog.length; i++) {
		newList.push(`Image ${i+1} - From: ${formatBytes(optimizeLog[i][0])} To: ${formatBytes(optimizeLog[i][1])}`)
	}

	errorList(newList, 'action-error-success')
}