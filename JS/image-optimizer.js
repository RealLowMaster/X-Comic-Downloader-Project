let optimizeLog = [], optimizeFullSize = 0, optimizeConvertSize = 0

function OptimizeComicImages(comic_id) {
	if (downloadCounter > 0) { error("You Can't Optimze Image When you are Downloading Something!"); return }
	isOptimizing = true
	window.stop()
	optimizeLog = []
	optimizeFullSize = 0
	optimizeConvertSize = 0

	procressPanel.config({ miniLog: true, miniSize:42, bgClose: false, closeBtn: false })
	procressPanel.reset(0)
	procressPanel.show('Calculating...')
	
	comicGroupsContainer.innerHTML = ''
	comicArtistsContainer.innerHTML = ''
	comicParodyContainer.innerHTML = ''
	comicTagsContainer.innerHTML = ''

	document.getElementById('c-p-t').textContent = ''
	document.getElementById('c-s-o').innerHTML = ''
	window.stop()
	const image_container = document.getElementById('c-p-i')
	image_container.innerHTML = ''
	window.stop()

	setTimeout(() => {
		db.comics.findOne({ _id:comic_id }, (err, doc) => {
			if (err) { procressPanel.hide(); error(err); openComic(comic_id); isOptimizing = false; return }
	
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
					if (repair.indexOf(i) > -1) procressPanel.add(`Image ${i+1}: Undownloaded Image.`, 'danger')
					else {
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
	
			procressPanel.changePercent(urls.length + 2)
			procressPanel.forward('Making Temp...')
			setTimeout(() => {
				let size = 0
				for (let i = 0; i < urls.length; i++) {
					try {
						size = fs.statSync(`${dirUL}/${urls[i][0]}`).size
						optimizeFullSize += size
						optimizeLog.push(size)
						fs.renameSync(`${dirUL}/${urls[i][0]}`, `${dirTmp}/${urls[i][0]}`)
					} catch(err) {
						for (let j = 0; j < i; j++) {
							fs.renameSync(`${dirTmp}/${urls[j][0]}`, `${dirUL}/${urls[j][0]}`)
						}
						procressPanel.hide()
						error("MovingTemp: "+err2)
						openComic(comic_id)
						isOptimizing = false
						keydownEventIndex = 1
						return
					}
				}
				procressPanel.forward(`Optimizing Image (0/${urls.length})...`)
				convertImagesToOptimize(urls, 0, comic_id)
			}, 100)
		})
	}, 200)
}

function convertImagesToOptimize(list, index, comic_id) {
	if (index == list.length) {
		db.comics.update({_id:comic_id}, { $set: {o:0} }, {}, (err, doc) => {
			if (err) procressPanel.add('ConvertImageToOptimize: '+err, 'danger')
			if (setting.auto_close_optimize_panel) {
				procressPanel.clear()
				procressPanel.clearMini()
				procressPanel.hide()
			} else {
				procressPanel.config({ bgClose:true, closeBtn:true })
				procressPanel.text(`___Complete___>>> <span class="tx-danger">${formatBytes(optimizeFullSize)}</span> To <span class="tx-danger">${formatBytes(optimizeConvertSize)}</span>`)
			}
			PopAlert('Comic Images Has Been Optimize')
			isOptimizing = false
			if (setting.notification_optimization_finish && remote.Notification.isSupported()) new remote.Notification({title: 'Comic Optimization Finished.', body: doc.n}).show()
			openComic(comic_id)
			keydownEventIndex = 1
			if (setting.show_unoptimize) reloadLoadingComics()
		})
		isOptimizing = false
		keydownEventIndex = 1
		return
	} else if (list[index][1] == 'jpg' || list[index][1] == 'jpeg') {
		sharp(`${dirTmp}/${list[index][0]}`).jpeg({ mozjpeg: true }).toFile(`${dirUL}/${list[index][0]}`).then(() => {
			try {
				const size = fs.statSync(`${dirUL}/${list[index][0]}`).size
				if (size <= optimizeLog[index]) {
					optimizeConvertSize += size
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
					fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
				} else {
					optimizeConvertSize += optimizeLog[index]
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span>`)
					fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${list[index][0]}`)
				}
			} catch(err) {
				procressPanel.add('SavingFileSize: '+err, 'danger')
			}

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id) 
			}, 100)
		}).catch(err => {
			procressPanel.add('Optimizing: '+err, 'danger')
		})
	} else if (list[index][1] == 'png') {
		sharp(`${dirTmp}/${list[index][0]}`).png({ quality: 100 }).toFile(`${dirUL}/${list[index][0]}`).then(() => {

			try {
				const size = fs.statSync(`${dirUL}/${list[index][0]}`).size
				if (size <= optimizeLog[index]) {
					optimizeConvertSize += size
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
					fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
				} else {
					optimizeConvertSize += optimizeLog[index]
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span>`)
					fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${list[index][0]}`)
				}
			} catch(err) {
				procressPanel.add('SavingFileSize: '+err, 'danger')
			}

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id) 
			}, 100)
		}).catch(err => {
			procressPanel.add('Optimizing: '+err, 'danger')
		})
	} else if (list[index][1] == 'webp') {
		sharp(`${dirTmp}/${list[index][0]}`).webp().toFile(`${dirUL}/${list[index][0]}`).then(() => {
			try {
				const size = fs.statSync(`${dirUL}/${list[index][0]}`).size
				optimizeConvertSize += size
				procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
			} catch(err) {
				procressPanel.add('SavingFileSize: '+err, 'danger')
			}

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id) 
			}, 100)
		}).catch(err => {
			procressPanel.add('Optimizing: '+err, 'danger')
		})
	} else {
		try {
			fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${list[index][0]}`)

			const size = fs.statSync(`${dirUL}/${list[index][0]}`).size
			optimizeConvertSize += size
			procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id) 
			}, 100)
		} catch(err) {
			procressPanel.add('Optimize: '+err, 'danger')
		}
	}
}

function showOptimatizationList() {
	
}