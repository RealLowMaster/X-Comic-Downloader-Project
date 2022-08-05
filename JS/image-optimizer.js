const optimizingValidFormats = ['jpg','jpeg','png','webp']
let optimizeLog = [], optimizeFullSize = 0, optimizeConvertSize = 0, isOptimzingContiue = false, optimizeAllFullSize = 0, optimizeAllConvertSize = 0

// Optimize Single Comic
function OptimizeComicImages(comic_id, opened_comic, keyEvent) {
	if (opened_comic && Downloader.HasDownload()) { error("You Can't Optimze Image When you are Downloading Something and Opening Offline Comic, Close and Optimize with Right Click!"); return }
	KeyManager.ChangeCategory(null)
	isOptimizing = true
	optimizeLog = []
	optimizeFullSize = 0
	optimizeConvertSize = 0

	procressPanel.reset(0)
	procressPanel.config({ miniLog: true, miniSize:42, bgClose: false, closeBtn: true, closeEvent:'isOptimizing=false' })
	procressPanel.show('Calculating...')
	
	if (opened_comic) {
		window.stop()
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
	}

	setTimeout(() => {
		if (!isOptimizing) {
			procressPanel.hide()
			if (opened_comic) openComic(comic_id)
			isOptimizing = false
			KeyManager.BackwardCategory()
			return
		}
		db.comics.findOne({ _id:comic_id }, (err, doc) => {
			if (err) {
				procressPanel.hide()
				error(err)
				if (opened_comic) openComic(comic_id)
				isOptimizing = false
				KeyManager.BackwardCategory()
				return
			}
	
			if (opened_comic) document.getElementById('comic-action-panel').style.display='none'
			let ImagesCount = doc.c, formats = doc.f, image = doc.i, lastIndex = formats[0][1], thisForamat = formats[0][2], urls = [], formatIndex = 0, size

			for (let i = 0; i < ImagesCount; i++) {
				if (i > lastIndex) {
					formatIndex++
					try {
						lastIndex = formats[formatIndex][1]
						thisForamat = formats[formatIndex][2]
					} catch(err) {
						for (let j = i; j < ImagesCount; j++) procressPanel.add(`Image ${j+1}: Undownloaded Image.`, 'danger')
						break
					}
				}

				if (!fs.existsSync(`${dirUL}/${comic_id}${image}/${image}-${i}.${thisForamat}`)) procressPanel.add(`Image ${i+1}: Undownloaded Image.`, 'danger')
				else urls.push([`${image}-${i}.${thisForamat}`, thisForamat])
			}
	
			procressPanel.changePercent(urls.length + 2)
			procressPanel.forward('Making Temp...')
			setTimeout(() => {
				size = 0
				for (let i = 0; i < urls.length; i++) {
					try {
						size = fs.statSync(`${dirUL}/${comic_id}${image}/${urls[i][0]}`).size
						optimizeFullSize += size
						optimizeLog.push(size)
						if (urls[i][1] != 'gif') fs.renameSync(`${dirUL}/${comic_id}${image}/${urls[i][0]}`, `${dirTmp}/${urls[i][0]}`)
					} catch(err) {
						for (let j = 0; j < i; j++) {
							if (urls[j][1] != 'gif') fs.renameSync(`${dirTmp}/${urls[j][0]}`, `${dirUL}/${comic_id}${image}/${urls[j][0]}`)
						}
						procressPanel.hide()
						error("MovingTemp: "+err)
						if (opened_comic) openComic(comic_id)
						isOptimizing = false
						KeyManager.BackwardCategory()
						return
					}
				}
				procressPanel.forward(`Optimizing Image (0/${urls.length})...`)
				convertImagesToOptimize(urls, 0, comic_id, image, () => {
					if (opened_comic) openComic(comic_id)
					KeyManager.BackwardCategory()
				})
			}, 10)
		})
	}, 250)
}

function convertImagesToOptimize(list, index, comic_id, image, callback) {
	if (index == list.length) {
		db.comics.update({_id:comic_id}, { $set: {o:0} }, {}, (err, doc) => {
			if (err) procressPanel.add('ConvertImageToOptimize: '+err, 'danger')
			if (setting.auto_close_optimize_panel) {
				procressPanel.reset(1)
				callback()
			} else {
				procressPanel.config({ bgClose:true, closeBtn:true, closeEvent:"this.parentElement.style.display='none'" })
				procressPanel.text(`___Complete___>>> <span class="tx-danger">${formatBytes(optimizeFullSize)}</span> To <span class="tx-danger">${formatBytes(optimizeConvertSize)}</span>`)
				callback()
			}
			PopAlert('Comic Images Has Been Optimize')
			isOptimizing = false
			if (setting.notification_optimization_finish && remote.Notification.isSupported()) new remote.Notification({title: 'Comic Optimization Finished.', body: doc.n}).show()
			if (setting.show_unoptimize) PageManager.Reload()
		})
		isOptimizing = false
		return
	} else if (!isOptimizing) {
		const error_list = []
		for (let i = index; i < list.length; i++) {
			try {
				fs.renameSync(`${dirTmp}/${list[i][0]}`, `${dirUL}/${comic_id}${image}/${list[i][0]}`)
			} catch(err) {
				error_list.push('MovingBackImages->Err: '+err)
			}
		}
		if (error_list.length > 0) console.error(error_list)
		procressPanel.hide()
		callback()
		return
	} else if (list[index][1] == 'gif') {
		try {
			optimizeConvertSize += fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
			procressPanel.add(`Warning: Img ${index+1} -> Cannot Optimize .gif Files`, 'warning')
		} catch(err) {
			procressPanel.add('CheckingFileSize->Err: '+err, 'danger')
		}

		procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
		setTimeout(() => {
			convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
		}, 1)
	} else if (list[index][1] == 'jpg' || list[index][1] == 'jpeg') {
		sharp(`${dirTmp}/${list[index][0]}`).jpeg({ mozjpeg: true }).toFile(`${dirUL}/${comic_id}${image}/${list[index][0]}`).then(() => {
			try {
				const size = fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
				if (size <= optimizeLog[index]) {
					optimizeConvertSize += size
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
					fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
				} else {
					optimizeConvertSize += optimizeLog[index]
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span>`)
					fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${comic_id}${image}/${list[index][0]}`)
				}
			} catch(err) {
				procressPanel.add('SavingFileSize: '+err, 'danger')
			}

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		}).catch(err => {
			try {
				fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${comic_id}${image}/${list[index][0]}`)
				optimizeConvertSize += fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
			} catch(err2) {}

			procressPanel.add(`Error: Img ${index+1} -> `+err, 'danger')
			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		})
	} else if (list[index][1] == 'png') {
		sharp(`${dirTmp}/${list[index][0]}`).png({ quality: 100, compressionLevel: 9 }).toFile(`${dirUL}/${comic_id}${image}/${list[index][0]}`).then(() => {

			try {
				const size = fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
				if (size <= optimizeLog[index]) {
					optimizeConvertSize += size
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
					fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
				} else {
					optimizeConvertSize += optimizeLog[index]
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span>`)
					fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${comic_id}${image}/${list[index][0]}`)
				}
			} catch(err) {
				procressPanel.add('SavingFileSize: '+err, 'danger')
			}

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		}).catch(err => {
			try {
				fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${comic_id}${image}/${list[index][0]}`)
				optimizeConvertSize += fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
			} catch(err2) {}

			procressPanel.add(`Error: Img ${index+1} -> `+err, 'danger')
			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		})
	} else if (list[index][1] == 'webp') {
		sharp(`${dirTmp}/${list[index][0]}`, { limitInputPixels: false }).webp({ quality: 100 }).toFile(`${dirUL}/${comic_id}${image}/${list[index][0]}`).then(() => {
			try {
				const size = fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
				optimizeConvertSize += size
				procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
			} catch(err) {
				procressPanel.add('SavingFileSize: '+err, 'danger')
			}

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		}).catch(err => {
			try {
				fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${comic_id}${image}/${list[index][0]}`)
				optimizeConvertSize += fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
			} catch(err2) {}
			
			procressPanel.add(`Error: Img ${index+1} -> `+err, 'danger')
			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		})
	} else {
		try {
			fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${comic_id}${image}/${list[index][0]}`)

			const size = fs.statSync(`${dirUL}/${comic_id}${image}/${list[index][0]}`).size
			optimizeConvertSize += size
			procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)

			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		} catch(err) {
			procressPanel.add(`Error: Img ${index+1} -> `+err, 'danger')
			procressPanel.forward(`Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				convertImagesToOptimize(list, index + 1, comic_id, image, callback) 
			}, 1)
		}
	}
}

// Optimize All Comics
function startOptimizingAll() {
	if (isOptimizing) return
	isOptimizing = true
	isOptimzingContiue = true
	KeyManager.ChangeCategory(null)
	optimizeAllFullSize = 0
	optimizeAllConvertSize = 0

	procressPanel.reset(0)
	procressPanel.config({ miniLog: true, miniSize:42, bgClose: false, closeBtn: true, closeEvent:'isOptimzingContiue=false' })
	procressPanel.show('Calculating...')

	db.comics.find({}, (err, doc) => {
		if (err) { error('CollectingComics->Err: '+err); procressPanel.reset(0); isOptimizing = false; isOptimzingContiue = false; KeyManager.BackwardCategory(); return }
		if (doc == undefined || doc.length == 0) { PopAlert('There is no Comic Downloaded.', 'warning'); procressPanel.reset(0); isOptimizing = false; isOptimzingContiue = false; KeyManager.BackwardCategory(); return }
		const collected_comics = []
		for (let i = 0; i < doc.length; i++) {
			if (typeof doc[i].o != 'number') collected_comics.push([toCapitalize(doc[i].n), doc[i].i, doc[i].c, doc[i].f, doc[i]._id])
		}

		if (collected_comics.length == 0) { PopAlert('All Comics are Optimized!'); procressPanel.reset(0); isOptimizing = false; isOptimzingContiue = false; KeyManager.BackwardCategory(); return }

		OptimizeAll(collected_comics, 0, collected_comics.length)
	})
}

function ConvertDocToOptimzationList(docList) {
	const optimization_list = []
	let formats = docList[3], lastIndex = formats[0][1], thisForamat = formats[0][2], urls = [], formatIndex = 0, found = false

	for (let i = 0; i < docList[2]; i++) {
		if (i > lastIndex) {
			formatIndex++
			try {
				lastIndex = formats[formatIndex][1]
				thisForamat = formats[formatIndex][2]
			} catch(err) {
				for (let j = i; j < ImagesCount; j++) urls.push([null, null])
				break
			}
		}

		if (!fs.existsSync(`${dirUL}/${docList[4]}${docList[1]}/${docList[1]}-${i}.${thisForamat}`)) urls.push([null, null])
		else {
			urls.push([`${docList[1]}-${i}.${thisForamat}`, thisForamat])
			found = true
		}
	}

	optimizeFullSize = 0
	optimizeLog = []
	optimizeFullSize = 0
	optimizeConvertSize = 0
	let size = 0

	for (let i = 0; i < urls.length; i++) {
		try {
			if (urls[i][1] != null) {
				size = fs.statSync(`${dirUL}/${docList[4]}${docList[1]}/${urls[i][0]}`).size
				optimizeFullSize += size
				optimizeLog.push(size)
				if (urls[i][1] != 'gif' && optimizingValidFormats.indexOf(urls[i][1]) > -1) fs.renameSync(`${dirUL}/${docList[4]}${docList[1]}/${urls[i][0]}`, `${dirTmp}/${urls[i][0]}`)
			}
		} catch(err) {
			for (let j = 0; j < i; j++) {
				if (urls[j][1] != 'gif' && urls[i][1] != null && optimizingValidFormats.indexOf(urls[i][1]) > -1) fs.renameSync(`${dirTmp}/${urls[j][0]}`, `${dirUL}/${docList[4]}${docList[1]}/${urls[j][0]}`)
			}
			procressPanel.add(`Comic "${docList[0]}"->Err: `+err, 'danger')
			return null
		}
	}

	optimizeAllFullSize += optimizeFullSize

	if (found == false) {
		procressPanel.add(`Comic "${docList[0]}", Doesn't have any Image Downloaded`, 'danger')
		return null
	}
	else return urls
}

function OptimizeAll(docList, index, maxLength, list) {

	if (docList.length == 0) {
		procressPanel.clearMini()
		procressPanel.config({closeBtn:true, bgClose:true, closeEvent:"this.parentElement.style.display='none'"})
		procressPanel.text(`___Complete___>>> <span class="tx-danger">${formatBytes(optimizeAllFullSize)}</span> To <span class="tx-danger">${formatBytes(optimizeAllConvertSize)}</span>`)
		if (setting.show_unoptimize) PageManager.Reload()
		if (setting.notification_optimization_finish && remote.Notification.isSupported()) new remote.Notification({title: 'Comics Optimization Finished.', body: doc.n}).show()
		isOptimizing = false
		isOptimzingContiue = false
		KeyManager.ChangeCategory('default')
		PopAlert('Comic Images Has Been Optimize')
		return
	}

	if (index == 0) list = ConvertDocToOptimzationList(docList[0])
	if (list == null) {
		docList.shift()
		OptimizeAll(docList, 0, maxLength)
		return
	}

	if (index == list.length) {
		procressPanel.clearMini()
		db.comics.update({_id:docList[0][4]}, { $set: {o:0} }, {}, (err, doc) => {
			if (err) procressPanel.add(`Comic "${docList[0][0]}" -> SaveComicOptimizedInDatabase: ${err}`, 'danger')
			else procressPanel.add(`Comic "${docList[0][0]}" -> <span class="tx-danger">${formatBytes(optimizeFullSize)}</span> To <span class="tx-danger">${formatBytes(optimizeConvertSize)}</span>`)
			if (optimizeConvertSize > 0 && !Number.isNaN(optimizeConvertSize)) optimizeAllConvertSize += optimizeConvertSize
			docList.shift()
			OptimizeAll(docList, 0, maxLength)
		})
		return
	}

	if (!isOptimzingContiue) {
		const error_list = []
		for (let i = index; i < list.length; i++) {
			try {
				fs.renameSync(`${dirTmp}/${list[i][0]}`, `${dirUL}/${docList[0][4]}${docList[0][1]}/${list[i][0]}`)
			} catch(err) {
				error_list.push('MovingBackImages->Err: '+err)
			}
		}
		if (error_list.length > 0) console.error(error_list)
		procressPanel.hide()
		procressPanel.reset()
		isOptimizing = false
		if (setting.show_unoptimize) PageManager.Reload()
		return
	} else if (list[index][1] == null) {
		procressPanel.addMini(`Img ${index+1} -> Undownloaded Image`, 'danger')
		procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
		setTimeout(() => {
			OptimizeAll(docList, index + 1, maxLength, list) 
		}, 1)
	} else if (list[index][1] == 'gif') {
		try {
			optimizeConvertSize += fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
			procressPanel.addMini(`Img ${index+1} -> Cannot Optimize .gif Files`, 'warning')
		} catch(err) {
			procressPanel.addMini(`Img ${index+1} -> CheckingFileSize->Err: `+err, 'danger')
		}

		procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
		setTimeout(() => {
			OptimizeAll(docList, index + 1, maxLength, list)
		}, 1)
	} else if (list[index][1] == 'jpg' || list[index][1] == 'jpeg') {
		sharp(`${dirTmp}/${list[index][0]}`).jpeg({ mozjpeg: true }).toFile(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).then(() => {
			try {
				const size = fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
				if (size <= optimizeLog[index]) {
					optimizeConvertSize += size
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
					fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
				} else {
					optimizeConvertSize += optimizeLog[index]
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span>`)
					fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`)
				}
			} catch(err) {
				procressPanel.addMini(`Img ${index+1} -> SavingFileSize: ${err}`, 'danger')
			}

			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		}).catch(err => {
			try {
				fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`)
				optimizeConvertSize += fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
			} catch(err2) {}

			procressPanel.addMini(`Img ${index+1} -> ${err}`, 'danger')
			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		})
	} else if (list[index][1] == 'png') {
		sharp(`${dirTmp}/${list[index][0]}`).png({ quality: 100, compressionLevel: 9 }).toFile(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).then(() => {

			try {
				const size = fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
				if (size <= optimizeLog[index]) {
					optimizeConvertSize += size
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
					fs.unlinkSync(`${dirTmp}/${list[index][0]}`)
				} else {
					optimizeConvertSize += optimizeLog[index]
					procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span>`)
					fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`)
				}
			} catch(err) {
				procressPanel.addMini(`Img ${index+1} -> SavingFileSize: ${err}`, 'danger')
			}

			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		}).catch(err => {
			try {
				fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`)
				optimizeConvertSize += fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
			} catch(err2) {}

			procressPanel.addMini(`Img ${index+1} -> ${err}`, 'danger')
			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		})
	} else if (list[index][1] == 'webp') {
		sharp(`${dirTmp}/${list[index][0]}`, { limitInputPixels: false }).webp({ quality: 100 }).toFile(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).then(() => {
			try {
				const size = fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
				optimizeConvertSize += size
				procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)
			} catch(err) {
				procressPanel.addMini(`Img ${index+1} -> SavingFileSize: ${err}`, 'danger')
			}

			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		}).catch(err => {
			procressPanel.addMini(`Img ${index+1} -> ${err}`, 'danger')
			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		})
	} else {
		try {
			const size = fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
			optimizeConvertSize += size
			procressPanel.addMini(`Img ${index+1} - From: <span class="tx-secendery tx-underline">${formatBytes(optimizeLog[index])}</span> To: <span class="tx-secendery tx-underline">${formatBytes(size)}</span>`)

			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		} catch(err) {
			try {
				fs.renameSync(`${dirTmp}/${list[index][0]}`, `${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`)
				optimizeConvertSize += fs.statSync(`${dirUL}/${docList[0][4]}${docList[0][1]}/${list[index][0]}`).size
			} catch(err2) {}

			procressPanel.addMini(`Img ${index+1} -> ${err}`, 'danger')
			procressPanel.forward(`(${maxLength - docList.length + 1}/${maxLength}) Optimizing Image (${index+1}/${list.length})...`)
			setTimeout(() => {
				OptimizeAll(docList, index + 1, maxLength, list)
			}, 1)
		}
	}
}