const { remote } = require('electron')
const fs = require('fs')
const nedb = require('nedb')
const sharp = require('sharp')
sharp.cache(false)
const jsonfile = require('jsonfile')
const request = require('request')
const defaultSettingLang = {
	tab_at_limit: "You Can't Make Any More Tab."
}
const defaultSetting = {
	"theme": 1,
	"pagination_theme": 0,
	"waiting_quality": 1,
	"show_comic_pages": false,
	"max_per_page": 18,
	"img_graphic": 1,
	"notification_download_finish": false,
	"notification_optimization_finish": true,
	"lazy_loading": true,
	"tabs_limit": 32,
	"download_limit": 5,
	"show_unoptimize": false,
	"check_update": true,
	"auto_close_optimize_panel": false,
	"file_location": null,
	"rdls": false,
	"full_screen": true,
	"open_br_startup": false,
	"rc": 0,
	"auto_backup": true,
	"developer_mode": false
}
const comicPanel = document.getElementById('comic-panel')
const pageContainer = document.getElementById('browser-pages')
const imageLazyLoadingOptions = {
	root: comicPanel,
	threshold: 0,
	rootMargin: "0px 0px 300px 0px"
}
const sites = [
	{
		name: 'xlecx',
		url: 'xlecx.org',
		home: 'xlecxChangePage(1, 0, true)',
		repair: 'xlecxRepairComicInfoGetInfo({id}, {whitch})',
		repairAll: 'xlecxRepairAllComicInfo({id}, {comic_id})',
		search: 'xlecxSearch({text}, 1, 0)',
		jump: 'xlecxJumpPage({index}, {page})',
		downloader: 'xlecxDownloader({id})'
	},
	{
		name: 'nhentai',
		url: 'nhentai.net',
		home: 'nhentaiChangePage(1, false, true)',
		repair: 'nhentaiRepairComicInfoGetInfo({id}, {whitch})',
		repairAll: 'nhentaiRepairAllComicInfo({id}, {comic_id})',
		search: 'nhentaiSearch({text}, 1, false, true)',
		jump: 'nhentaiJumpPage({index}, {page})',
		downloader: 'nhentaiDownloader({id})'
	}
]
const ThisWindow = remote.getCurrentWindow(), loading = new Loading(), KeyManager = new HotKeyManager(), Downloader = new DownloadManager(), PageManager = new OfflinePageManager(), db = {}, procressPanel = new ProcressPanel(0), SliderManager = new Slider(), update_number = 15
let comicDeleting = false, wt_fps = 20, dirDB, dirUL, dirBU, dirTmp, isOptimizing = false, browserLastTabs = [], tabsHistory = [], dirHistory = '', new_update, save_value = null, save_value2 = null, afterDLReload = true, setting, openedMenuTabIndex, copiedTab = null, tabs = [], lastComicId, searchTimer, activeTabComicId = null, activeTabIndex = null, tabsPos = [], tabsPosParent = [], isUpdating = false, collectionsDB = [], groupsDB = [], artistsDB = [], parodiesDB = [], tagsDB = [], charactersDB = [], languagesDB = [], categoriesDB = [], comicGroupsDB = [], comicArtistsDB = [], comicParodiesDB = [], comicTagsDB = [], comicCharactersDB = [], comicLanguagesDB = [], comicCategoriesDB = [], indexDB = [], haveDBSite = [], haveDBId = [], haveDBComic = []

// Set Windows Closing Event
function closeApp() {
	closingApp = true

	if (isUpdating) { PopAlert('You Cannot Close App When Updating.', 'danger'); closingApp = false; return }
	if (isOptimizing) { PopAlert("You can't Close App When you are Optimzating.", "danger"); closingApp = false; return }
	if (isRepairing) { PopAlert("You can't Close App When you are Repairing.", "danger"); closingApp = false; return }
	if (comicDeleting) { PopAlert("You can't Close App When you are Deleting a Comic.", "danger"); closingApp = false; return }

	if (Downloader.HasDownload()) {
		errorSelector('You are Downloading Comics, Are you sure you want To Close Software ?', [
			[
				"Yes",
				"btn btn-primary m-2",
				"Downloader.CancelAll();remote.app.quit()"
			],
			[
				"No",
				"btn btn-danger m-2",
				"closingApp = false;this.parentElement.parentElement.remove()"
			]
		])
		return
	}


	loading.Show(1, 'Shutting Down')
	const tabsElement = tabsContainer.children
	if (tabsElement.length > 0) {
		for (let i = 0; i < tabsElement.length; i++) addHistory(tabs[Number(tabsElement[i].getAttribute('ti'))], tabsElement[i].children[0].innerText)
		saveHistory()
	}

	if (setting.auto_backup) {
		try {
			if (fs.existsSync(dirBU+'/AutoBackup.zip')) fs.unlinkSync(dirBU+'/AutoBackup.zip')
			BackUp('AutoBackup.zip', () => {
				ThisWindow.removeAllListeners()
				remote.app.quit()
			})
		} catch(err) {
			error('AutoBackup->Err: '+err)
			setTimeout(() => {
				ThisWindow.removeAllListeners()
				remote.app.quit()
			}, 5000);
		}
	} else {
		ThisWindow.removeAllListeners()
		remote.app.quit()
	}
}

ThisWindow.addListener('close', e => {
	e.preventDefault()
	closeApp()
})

function maximizeApp() {
	if (ThisWindow.isMaximized()) ThisWindow.unmaximize()
	else ThisWindow.maximize()
}

function minimizeApp() {
	ThisWindow.minimize()
}

// Needable Functions
function fileExt(str) { return new String(str).substring(str.lastIndexOf('.') + 1) }

function lastSlash(str, backSlasg) {
	backSlasg = backSlasg || '/'
	const base = new String(str).substring(str.lastIndexOf(backSlasg) + 1)
	return base
}

function select(who, value) {
	const parent = who.parentElement.parentElement
	const overflow = parent.getElementsByTagName('div')[1]

	parent.getElementsByTagName('div')[0].textContent = who.textContent
	overflow.style.display = 'none'
	overflow.querySelector(`[onclick="select(this, ${parent.getAttribute('value')})"]`).removeAttribute('active')
	parent.setAttribute('value', value)
}

function openSelect(who) {
	const overflows = document.getElementsByClassName('input-row-selector-overflow')
	for (let i = 0; i < overflows.length; i++) {
		overflows[i].style.display = 'none'
	}
	const overflow = who.getElementsByTagName('div')[1]
	overflow.style.display = 'block'
	overflow.querySelector(`[onclick="select(this, ${who.getAttribute('value')})"]`).setAttribute('active', '')
}

function columnSelector(who, value) {
	const parent = who.parentElement
	const passValue = parent.getAttribute('value') || null
	if (passValue != null) parent.querySelector(`[cs="${passValue}"]`).removeAttribute('active')
	parent.setAttribute('value', value)
	who.setAttribute('active', '')
}

function inputLimit(who, max) {
	if (who == null || max == null) return
	const value = who.value

	if (value > max)
		who.value = max
	else if (value < 1)
		who.value = 1
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return parseFloat((bytes / Math.pow(1024, i)).toFixed(dm)) + ' ' + sizes[i];
}

function MemorySizeOf(obj) {
	let bytes = 0
	function sizeOf(obj) {
		if(obj !== null && obj !== undefined) {
			switch(typeof obj) {
			case 'number':
				bytes += 8
				break
			case 'string':
				bytes += obj.length * 2
				break
			case 'boolean':
				bytes += 4
				break
			case 'object':
				let objClass = Object.prototype.toString.call(obj).slice(8, -1)
				if(objClass === 'Object' || objClass === 'Array') {
					for (let key in obj) {
						if(!obj.hasOwnProperty(key)) continue
						sizeOf(obj[key])
					}
				} else bytes += obj.toString().length * 2
				break
			}
		}
		return bytes
	}
	return formatBytes(sizeOf(obj))
}

function PopAlertFrame(who) {
	setTimeout(() => {
		const bottom = Number(who.style.bottom.replace('px', ''))
		who.style.bottom = (bottom+45)+'px'
	}, 10)
}

function PopAlert(txt, style) {
	txt = txt || null
	if (txt == null) return
	style = style || 'success'
	const alertElement = document.createElement('div')
	alertElement.classList.add('pop-alert')
	alertElement.classList.add(`pop-alert-${style}`)
	alertElement.textContent = txt
	alertElement.setAttribute('onclick', 'this.remove()')
	document.body.appendChild(alertElement)

	const alerts = document.getElementsByClassName('pop-alert')
	for (let i = 0; i < alerts.length; i++) {
		PopAlertFrame(alerts[i])
	}

	setTimeout(() => {
		alertElement.remove()
	}, 4000)
}

function ChooseDirectory(title, callback) {
	title = title || 'Choose Directory'

	const choosedDirectory = remote.dialog.showOpenDialogSync({title:title, properties:['openDirectory']})
	if (choosedDirectory == undefined || choosedDirectory.length == 0 || choosedDirectory[0] == null) callback('Canceled', null)
	else callback(null, choosedDirectory[0])
}

function GetFileLocationCallback(err, result) {
	if (err) {
		ChooseDirectory('Choose Directory For Saving Downloaded Comics', GetFileLocationCallback)
		return
	}
	if (!fs.existsSync(result)) {
		ChooseDirectory(`No Such Directory Called '${lastSlash(result, '\\')}'. Choose Another One.`, GetFileLocationCallback)
		return
	}
	dirDB = result+'\\ComicsDB'
	dirBU = result+'\\Backups'
	dirUL = result+'\\DownloadedComics'
	dirTmp = result+'\\ComicsTemp'
	setting.file_location = result
	saveSetting(true)
}

function GetFileLocationForInput(who) {
	ChooseDirectory('Choose Directory For Saving Downloaded Comics', (err, result) => {
		if (err) { return }
		if (!fs.existsSync(result)) {
			PopAlert(`No Such Directory Called '${lastSlash(result, '\\')}'.`, 'danger')
			return
		}

		who.setAttribute('location', result)
		const s_file_location_label = who.parentElement.parentElement.children[0]
		if (result.match(/[\\]/g).length > 1)
			s_file_location_label.textContent = result.substr(0,2)+'\\...\\'+lastSlash(result, '\\')
		else
			s_file_location_label.textContent = result
		s_file_location_label.setAttribute('title', result)
	})
}

function CheckUpdate() {
	if (window.navigator.onLine) {
		fetch('https://api.npoint.io/1cc57afc1a05329fe920', { method: "GET" }).then(response => {
			if (!response.ok) {
				PopAlert('UPDATE->CHECKING->ERR->HTTP: '+response.status, 'danger')
				return
			}
			return response.json()
		}).then(json => {
			if (update_number < json.update_number) {
				new_update = json
				const releaser = document.getElementById('new-release')
				releaser.getElementsByTagName('p')[0].textContent = `New Release: v${json.version}`
				releaser.style.display = 'block'
			} else PopAlert("UpdateChecker: Your App is Up To Date.")
		}).catch(err => {
			if (err == 'TypeError: Failed to fetch') return
			PopAlert('UPDATE->CHECKING->ERR: '+err, 'danger')
		})
	} else if (alert) PopAlert('No Internet Connection.', 'danger')
}

function UpdateApp() {
	if (comicDeleting) { PopAlert("You can't Update App When you are Deleting a Comic.", "danger"); return }
	if (isOptimizing) { PopAlert("You can't Update App When you are Optimzating.", "danger"); return }
	if (Downloader.HasDownload()) { PopAlert("You can't Update App When you are Downloading Comic.", "danger"); return }
	if (window.navigator.onLine == false) { PopAlert('You are Offline.', 'danger'); return }
	if (isUpdating) return
	isUpdating = true
	procressPanel.reset(3)
	procressPanel.config({ miniLog: false, bgClose: false, closeBtn: false })
	procressPanel.show('Checking Connection...')

	let node_update = false
	if (new_update.node_modules_updates_number > update_number) {
		node_update = true
		procressPanel.changePercent(5)
	}

	procressPanel.add('Connected To Update Data.')
	procressPanel.forward('Downloading Update...')

	let totalSize = 0, totalBytes = 0, dlSize = 0
	const dl = new Download(new_update.zip, `${dirTmp}/update.zip`)
	dl.OnError(err => {
		error('DownloadUpdate->'+err)
		procressPanel.reset()
		isUpdating = false
	})

	dl.OnComplete(filename => {
		const StreamZip = require('node-stream-zip')
		const path = require('path')

		if (node_update) {
			procressPanel.add('Complete Downloading Update First Part.')
			procressPanel.forward('Downloading NodeUpdate...')
			totalSize = 0, totalBytes = 0, dlSize = 0
			const dl2 = new Download(new_update.latest_node_modules, `${dirTmp}/node_update.zip`)
			dl2.OnError(err => {
				error('DownloadNodeUpdate->'+err)
				isUpdating = false
			})

			dl2.OnComplete(filename2 => {

				const zip = new StreamZip.async({ file: filename })

				zip.on('error', err => {
					error('UnZippingUpdate->'+err)
					isUpdating = false
				})

				zip.entries().then(async entries => {
					for (const entry of Object.values(entries)) {
						if (entry.isDirectory) continue
						const pathname = path.resolve(__dirname, entry.name)
			
						try {
							fs.mkdirSync(
								path.dirname(pathname),
								{ recursive: true }
							)
							await zip.extract(entry.name, pathname)
						} catch(err) {
							procressPanel.add('UnZipFirstPart->:: '+err, 'danger')
						}
					}

					zip.close()
					try { fs.unlinkSync(filename) } catch(err) { procressPanel.add('DeletingUpdateFile->'+err, 'danger') }

					procressPanel.add('Extracte First Part Complete.')
					procressPanel.forward('Extracting NodeUpdate...')

					const secendZip = new StreamZip.async({ file: filename2 })

					secendZip.on('error', err => {
						error('UnZippingNodeUpdate->'+err)
						isUpdating = false
					})

					await secendZip.entries().then(async secendEntries => {
						for (const entry of Object.values(secendEntries)) {
							if (entry.isDirectory) continue
							const pathname = path.resolve(__dirname, entry.name)

							try {
								fs.mkdirSync(
									path.dirname(pathname),
									{ recursive: true }
								)
								await secendZip.extract(entry.name, pathname)
							} catch(err) {
								procressPanel.add('UnZipNode->'+err, 'danger')
							}
						}

						secendZip.close()
						try { fs.unlinkSync(filename2) } catch(err) { procressPanel.add('DeletingNodeUpdateFile->'+err, 'danger') }

						procressPanel.add('Update Complete.')
						procressPanel.forward('Closing App...')
						setTimeout(() => {
							ThisWindow.removeAllListeners()
							remote.app.quit()
						}, 250)
					}).catch(err => {
						error('UnZippingNodeUpdateEntries->'+err)
						isUpdating = false
					})
				}).catch(err => {
					error('UnZippingUpdateEntries->'+err)
					isUpdating = false
				})
			})

			dl2.OnResponse(resp => {
				totalBytes = parseInt(resp.headers['content-length'])
				totalSize = formatBytes(totalBytes)
				procressPanel.text(`Downloading NodeUpdate (0/${totalSize}) (0%/100%)`)
			})

			dl2.OnData(data => {
				dlSize += data
				procressPanel.text(`Downloading Update (${formatBytes(dlSize)}/${totalSize}) (${((dlSize * 100) / totalBytes).toFixed()}%/100%)`)
			})

			dl2.Start()
			
		} else {
			procressPanel.add('Complete Downloading Update.')
			procressPanel.forward('Updating...')
			const zip = new StreamZip.async({ file: filename })

			zip.on('error', err => {
				error('UnZippingUpdate->'+err)
				isUpdating = false
			})

			zip.entries().then(async entries => {
				for (const entry of Object.values(entries)) {
					if (entry.isDirectory) continue
					const pathname = path.resolve(__dirname, entry.name)
		
					try {
						fs.mkdirSync(
							path.dirname(pathname),
							{ recursive: true }
						)
						await zip.extract(entry.name, pathname)
					} catch(err) {
						procressPanel.add('UnZip-ExtractFile-ERR:: '+err, 'danger')
					}
				}

				zip.close()
				try { fs.unlinkSync(filename) } catch(err) { procressPanel.add('DeletingUpdateFile->'+err, 'danger') }

				procressPanel.add('Update Complete.')
				procressPanel.forward('Closing App...')
				isUpdating = false
				setTimeout(() => {
					ThisWindow.removeAllListeners()
					remote.app.quit()
				}, 250)
			}).catch(err => {
				error('UnZippingUpdateEntries->'+err)
				isUpdating = false
			})
		}
	})

	dl.OnResponse(resp => {
		totalBytes = parseInt(resp.headers['content-length'])
		totalSize = formatBytes(totalBytes)
		procressPanel.text(`Downloading Update (0/${totalSize}) (0%/100%)`)
	})

	dl.OnData(data => {
		dlSize += data
		procressPanel.text(`Downloading Update (${formatBytes(dlSize)}/${totalSize}) (${((dlSize * 100) / totalBytes).toFixed()}%/100%)`)
	})

	dl.Start()
}

function UpdateNotes() {
	document.getElementById('r-n-n-v').innerHTML = 'v'+new_update.version
	let html = '<h2>Important Changes</h2>'
	for (let i = 0; i < new_update.important_changes.length; i++) {
		html += `<p class="${new_update.c[i]}">${new_update.important_changes[i]}</p>`
	}
	document.getElementById('r-n-n-n').innerHTML = html
	document.getElementById('release-note').style.display = 'flex'
}

function closeReleaseNote() {
	document.getElementById('release-note').style.display = 'none'
	document.getElementById('r-n-n-v').innerHTML = ''
	document.getElementById('r-n-n-n').innerHTML = ''
}

function WhichMouseButton(event) {
	event = event || window.event
	return event.which
}

function toCapitalize(text) {
	const words = text.replace(/\s\s+/g, ' ').split(" ")
	for (let i = 0; i < words.length; i++) words[i] = words[i][0].toUpperCase() + words[i].substr(1)
	return words.join(" ")
}

function toFileName(text) {
	return text.replace(/</g, ' ').replace(/>/g, ' ').replace(/:/g, ' ').replace(/"/g, ' ').replace(/\//g, '').replace(/\\/g, '').replace(/\|/g, '').replace(/\?/g, '').replace(/\*/g, ' ')
}

function convertToURL(text = 'text', backward = false) {
	backward = backward || false
	if (backward) {
		return text.replace(/%26/g, '&')
			.replace(/%21/g, '!')
			.replace(/%22/g, '"')
			.replace(/%23/g, '#')
			.replace(/%24/g, '$')
			.replace(/%26/g, '&')
			.replace(/%27/g, "'")
			.replace(/%28/g, '(')
			.replace(/%29/g, ')')
			.replace(/%2A/g, '*')
			.replace(/%2B/g, '+')
			.replace(/%2C/g, ',')
			.replace(/%2F/g, '/')
			.replace(/%5C/g, '\\')
			.replace(/%3A/g, ':')
			.replace(/%3B/g, ';')
			.replace(/%3C/g, '<')
			.replace(/%3D/g, '=')
			.replace(/%3E/g, '>')
			.replace(/%3F/g, '?')
			.replace(/%40/g, '@')
			.replace(/%7E/g, '~')
			.replace(/%80/g, '`')
			.replace(/%25/g, '%')
	} else {
		return text.replace(/%/g, '%25')
			.replace(/&/g, '%26')
			.replace(/!/g, '%21')
			.replace(/"/g, '%22')
			.replace(/#/g, '%23')
			.replace(/\$/g, '%24')
			.replace(/&/g, '%26')
			.replace(/'/g, '%27')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29')
			.replace(/\*/g, '%2A')
			.replace(/\+/g, '%2B')
			.replace(/,/g, '%2C')
			.replace(/\//g, '%2F')
			.replace(/\\/g, '%5C')
			.replace(/:/g, '%3A')
			.replace(/;/g, '%3B')
			.replace(/</g, '%3C')
			.replace(/=/g, '%3D')
			.replace(/>/g, '%3E')
			.replace(/\?/g, '%3F')
			.replace(/@/g, '%40')
			.replace(/~/g, '%7E')
			.replace(/`/g, '%80')
	}
}

function ChangeScreenMode(fullscreen = null, save = true) {
	if (fullscreen == null) fullscreen = !ThisWindow.isFullScreen()

	const style = document.documentElement.style
	if (fullscreen) {
		if (save) setting.full_screen = true
		ThisWindow.setFullScreen(true)
		document.getElementById('window-menu').style.display = 'none'
		style.setProperty('--topMenuSize', '0.000001px')
	} else {
		if (save) setting.full_screen = false
		ThisWindow.setFullScreen(false)
		document.getElementById('window-menu').style.display = 'grid'
		style.setProperty('--topMenuSize', '25px')
	}

	document.getElementById('s_full_screen').checked = setting.full_screen

	if (save) jsonfile.writeFileSync(dirDocument+'/setting.json', setting)
}

// Main Loading Stuff
const dirDocument = remote.app.getPath('documents')+'\\X Comic Downloader'

function GetSettingFile() {
	if (!fs.existsSync(dirDocument)) {
		fs.mkdirSync(dirDocument)
		setting = defaultSetting
		jsonfile.writeFileSync(dirDocument+'/setting.json', setting)
	} else {
		if (!fs.existsSync(dirDocument+'/setting.json')) {
			setting = defaultSetting
			jsonfile.writeFileSync(dirDocument+'/setting.json', setting)
		} else setting = jsonfile.readFileSync(dirDocument+'/setting.json')
	}
}

function GetDirection() {
	if (setting.file_location == null) ChooseDirectory('Choose Directory For Saving Downloaded Comics', GetFileLocationCallback)
	else {
		if (!fs.existsSync(setting.file_location)) ChooseDirectory('Choose Directory For Saving Downloaded Comics', GetFileLocationCallback)
		else {
			dirDB = setting.file_location+'\\ComicsDB'
			dirBU = setting.file_location+'\\Backups'
			dirUL = setting.file_location+'\\DownloadedComics'
			dirTmp = setting.file_location+'\\ComicsTemp'
		}
	}

	if (!fs.existsSync(dirDB)) fs.mkdirSync(dirDB)
	if (!fs.existsSync(dirUL)) fs.mkdirSync(dirUL)
	if (!fs.existsSync(dirBU)) fs.mkdirSync(dirBU)
	if (!fs.existsSync(dirTmp)) fs.mkdirSync(dirTmp)
	if (!fs.existsSync(dirUL+'/thumbs')) fs.mkdirSync(dirUL+'/thumbs')
	if (!fs.existsSync(dirUL+'/cthumbs')) fs.mkdirSync(dirUL+'/cthumbs')

	dirHistory = dirDocument+'/history.array'
	if (fs.existsSync(dirHistory)) tabsHistory = jsonfile.readFileSync(dirHistory).h
	else jsonfile.writeFileSync(dirHistory, {h:[]})
}

function CreateDatabase() {
	db.comics = new nedb({ filename: dirDB+'/comics', autoload: true })

	// Index
	if (fs.existsSync(dirDB+'/index')) {
		let temp_index = new nedb({ filename: dirDB+'/index', autoload: true })
		indexDB = []
		temp_index.find({}, (err, doc) => {
			if (err) { error('OptimizingIndex->Err: '+err); return }
			let subFolder = false
			for (let i = 0; i < doc.length; i++) {
				if (doc[i]._id == 1) indexDB[0] = doc[i].i
				else if (doc[i]._id == 11) indexDB[1] = doc[i].i
				else if (doc[i]._id == 100) subFolder = true
			}
			indexDB[2] = subFolder
			temp_index = null
			jsonfile.writeFileSync(dirDB+'/index.lowdb',{a:indexDB})
			fs.unlinkSync(dirDB+'/index')
		})
	} else if (fs.existsSync(dirDB+'/index.lowdb')) indexDB = jsonfile.readFileSync(dirDB+'/index.lowdb').a
	else {
		indexDB = [1,1,true]
		jsonfile.writeFileSync(dirDB+'/index.lowdb',{a:indexDB})
	}

	// Groups DB
	if (fs.existsSync(dirDB+'/groups')) {
		let temp_comic_groups = new nedb({ filename: dirDB+'/groups', autoload: true })
		temp_comic_groups.find({}, (err, doc) => {
			if (err) { error('OptimizeGroups->Err: '+err); return }

			groupsDB = []
			for (let i = 0; i < doc.length; i++) groupsDB[doc[i]._id] = doc[i].n
			temp_comic_groups = null
			jsonfile.writeFileSync(dirDB+'/groups.lowdb',{a:groupsDB})
			fs.unlinkSync(dirDB+'/groups')
		})
	} else if (fs.existsSync(dirDB+'/groups.lowdb')) groupsDB = jsonfile.readFileSync(dirDB+'/groups.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/groups.lowdb',{a:[]})

	// Artists DB
	if (fs.existsSync(dirDB+'/artists')) {
		let temp_comic_artists = new nedb({ filename: dirDB+'/artists', autoload: true })
		temp_comic_artists.find({}, (err, doc) => {
			if (err) { error('OptimizeArtists->Err: '+err); return }

			artistsDB = []
			for (let i = 0; i < doc.length; i++) artistsDB[doc[i]._id] = doc[i].n
			temp_comic_artists = null
			jsonfile.writeFileSync(dirDB+'/artists.lowdb',{a:artistsDB})
			fs.unlinkSync(dirDB+'/artists')
		})
	} else if (fs.existsSync(dirDB+'/artists.lowdb')) artistsDB = jsonfile.readFileSync(dirDB+'/artists.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/artists.lowdb',{a:[]})

	// Parodies DB
	if (fs.existsSync(dirDB+'/parodies')) {
		let temp_comic_parodies = new nedb({ filename: dirDB+'/parodies', autoload: true })
		temp_comic_parodies.find({}, (err, doc) => {
			if (err) { error('OptimizeParodies->Err: '+err); return }

			parodiesDB = []
			for (let i = 0; i < doc.length; i++) parodiesDB[doc[i]._id] = doc[i].n
			temp_comic_parodies = null
			jsonfile.writeFileSync(dirDB+'/parodies.lowdb',{a:parodiesDB})
			fs.unlinkSync(dirDB+'/parodies')
		})
	} else if (fs.existsSync(dirDB+'/parodies.lowdb')) parodiesDB = jsonfile.readFileSync(dirDB+'/parodies.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/parodies.lowdb',{a:[]})

	// Tags DB
	if (fs.existsSync(dirDB+'/tags')) {
		let temp_comic_tags = new nedb({ filename: dirDB+'/tags', autoload: true })
		temp_comic_tags.find({}, (err, doc) => {
			if (err) { error('OptimizeTags->Err: '+err); return }

			tagsDB = []
			for (let i = 0; i < doc.length; i++) tagsDB[doc[i]._id] = doc[i].n
			temp_comic_tags = null
			jsonfile.writeFileSync(dirDB+'/tags.lowdb',{a:tagsDB})
			fs.unlinkSync(dirDB+'/tags')
		})
	} else if (fs.existsSync(dirDB+'/tags.lowdb')) tagsDB = jsonfile.readFileSync(dirDB+'/tags.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/tags.lowdb',{a:[]})

	// Characters DB
	if (fs.existsSync(dirDB+'/characters')) {
		let temp_comic_characters = new nedb({ filename: dirDB+'/characters', autoload: true })
		temp_comic_characters.find({}, (err, doc) => {
			if (err) { error('OptimizeCharacters->Err: '+err); return }

			charactersDB = []
			for (let i = 0; i < doc.length; i++) charactersDB[doc[i]._id] = doc[i].n
			temp_comic_characters = null
			jsonfile.writeFileSync(dirDB+'/characters.lowdb',{a:charactersDB})
			fs.unlinkSync(dirDB+'/characters')
		})
	} else if (fs.existsSync(dirDB+'/characters.lowdb')) charactersDB = jsonfile.readFileSync(dirDB+'/characters.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/characters.lowdb',{a:[]})

	// Languages DB
	if (fs.existsSync(dirDB+'/languages')) {
		let temp_comic_languages = new nedb({ filename: dirDB+'/languages', autoload: true })
		temp_comic_languages.find({}, (err, doc) => {
			if (err) { error('OptimizeLanguages->Err: '+err); return }

			languagesDB = []
			for (let i = 0; i < doc.length; i++) languagesDB[doc[i]._id] = doc[i].n
			temp_comic_languages = null
			jsonfile.writeFileSync(dirDB+'/languages.lowdb',{a:languagesDB})
			fs.unlinkSync(dirDB+'/languages')
		})
	} else if (fs.existsSync(dirDB+'/languages.lowdb')) languagesDB = jsonfile.readFileSync(dirDB+'/languages.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/languages.lowdb',{a:[]})

	// Categories DB
	if (fs.existsSync(dirDB+'/categories')) {
		let temp_comic_categories = new nedb({ filename: dirDB+'/categories', autoload: true })
		temp_comic_categories.find({}, (err, doc) => {
			if (err) { error('OptimizeCategories->Err: '+err); return }

			categoriesDB = []
			for (let i = 0; i < doc.length; i++) categoriesDB[doc[i]._id] = doc[i].n
			temp_comic_categories = null
			jsonfile.writeFileSync(dirDB+'/categories.lowdb',{a:categoriesDB})
			fs.unlinkSync(dirDB+'/categories')
		})
	} else if (fs.existsSync(dirDB+'/categories.lowdb')) categoriesDB = jsonfile.readFileSync(dirDB+'/categories.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/categories.lowdb',{a:[]})
	
	// Collections
	if (fs.existsSync(dirDB+'/collections.lowdb')) collectionsDB = jsonfile.readFileSync(dirDB+'/collections.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:[]})

	// Comic Groups
	if (fs.existsSync(dirDB+'/comic_groups')) {
		let tmp_comic_groups = new nedb({ filename: dirDB+'/comic_groups', autoload: true })
		tmp_comic_groups.find({},(err, doc) => {
			if (err) { error('ConvertComicGroupsDB->'+err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/comic_groups') } catch(err) { console.error(err) }
				return
			}
			for (let i = 0; i < doc.length; i++) db.comics.update({_id:doc[i]._id}, { $set: {g:doc[i].t} }, {}, err => { if (err) console.error(err) })
			tmp_comic_groups = null
			try { fs.unlinkSync(dirDB+'/comic_groups') } catch(err) { console.error(err) }
		})
	}

	// Comic Artists
	if (fs.existsSync(dirDB+'/comic_artists')) {
		let tmp_comic_artists = new nedb({ filename: dirDB+'/comic_artists', autoload: true })
		tmp_comic_artists.find({},(err, doc) => {
			if (err) { error('ConvertComicArtistsDB->'+err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/comic_artists') } catch(err) { console.error(err) }
				return
			}
			for (let i = 0; i < doc.length; i++) db.comics.update({_id:doc[i]._id}, { $set: {a:doc[i].t} }, {}, err => { if (err) console.error(err) })
			tmp_comic_artists = null
			try { fs.unlinkSync(dirDB+'/comic_artists') } catch(err) { console.error(err) }
		})
	}

	// Comic Parodies
	if (fs.existsSync(dirDB+'/comic_parodies')) {
		let tmp_comic_parodies = new nedb({ filename: dirDB+'/comic_parodies', autoload: true })
		tmp_comic_parodies.find({},(err, doc) => {
			if (err) { error('ConvertComicParodiesDB->'+err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/comic_parodies') } catch(err) { console.error(err) }
				return
			}
			for (let i = 0; i < doc.length; i++) db.comics.update({_id:doc[i]._id}, { $set: {d:doc[i].t} }, {}, err => { if (err) console.error(err) })
			tmp_comic_parodies = null
			try { fs.unlinkSync(dirDB+'/comic_parodies') } catch(err) { console.error(err) }
		})
	}

	// Comic Tags
	if (fs.existsSync(dirDB+'/comic_tags')) {
		let tmp_comic_tags = new nedb({ filename: dirDB+'/comic_tags', autoload: true })
		tmp_comic_tags.find({},(err, doc) => {
			if (err) { error('ConvertComicTagsDB->'+err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/comic_tags') } catch(err) { console.error(err) }
				return
			}
			for (let i = 0; i < doc.length; i++) db.comics.update({_id:doc[i]._id}, { $set: {t:doc[i].t} }, {}, err => { if (err) console.error(err) })
			tmp_comic_tags = null
			try { fs.unlinkSync(dirDB+'/comic_tags') } catch(err) { console.error(err) }
		})
	}

	// Comic Characters
	if (fs.existsSync(dirDB+'/comic_characters')) {
		let tmp_comic_characters = new nedb({ filename: dirDB+'/comic_characters', autoload: true })
		tmp_comic_characters.find({},(err, doc) => {
			if (err) { error('ConvertComicCharactersDB->'+err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/comic_characters') } catch(err) { console.error(err) }
				return
			}
			for (let i = 0; i < doc.length; i++) db.comics.update({_id:doc[i]._id}, { $set: {h:doc[i].t} }, {}, err => { if (err) console.error(err) })
			tmp_comic_characters = null
			try { fs.unlinkSync(dirDB+'/comic_characters') } catch(err) { console.error(err) }
		})
	}

	// Comic Languages
	if (fs.existsSync(dirDB+'/comic_languages')) {
		let tmp_comic_languages = new nedb({ filename: dirDB+'/comic_languages', autoload: true })
		tmp_comic_languages.find({},(err, doc) => {
			if (err) { error('ConvertComicLanguagesDB->'+err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/comic_languages') } catch(err) { console.error(err) }
				return
			}
			for (let i = 0; i < doc.length; i++) db.comics.update({_id:doc[i]._id}, { $set: {l:doc[i].t} }, {}, err => { if (err) console.error(err) })
			tmp_comic_languages = null
			try { fs.unlinkSync(dirDB+'/comic_languages') } catch(err) { console.error(err) }
		})
	}

	// Comic Categories
	if (fs.existsSync(dirDB+'/comic_categories')) {
		let tmp_comic_categories = new nedb({ filename: dirDB+'/comic_categories', autoload: true })
		tmp_comic_categories.find({},(err, doc) => {
			if (err) { error('ConvertComicCategoriesDB->'+err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/comic_categories') } catch(err) { console.error(err) }
				return
			}
			for (let i = 0; i < doc.length; i++) db.comics.update({_id:doc[i]._id}, { $set: {e:doc[i].t} }, {}, err => { if (err) console.error(err) })
			tmp_comic_categories = null
			try { fs.unlinkSync(dirDB+'/comic_categories') } catch(err) { console.error(err) }
		})
	}

	// Have
	if (fs.existsSync(dirDB+'/have')) {
		let tmp_have = new nedb({ filename: dirDB+'/have', autoload: true })
		tmp_have.find({}, (err,doc) => {
			if (err) { error('OptimizingHaveDB->'+err); console.error(err); return }
			if (doc == null || doc.length == 0) {
				try { fs.unlinkSync(dirDB+'/have') } catch(err) { console.error(err) }
				try {
					const data = jsonfile.readFileSync(dirDB+'/have.lowdb')
					haveDBSite = data.s
					haveDBId = data.i
					haveDBComic = data.c
					if (haveDBSite == null) haveDBSite = []
					if (haveDBId == null) haveDBId = []
					if (haveDBComic == null) haveDBComic = []
				} catch(err) { console.error(err) }
				return
			}

			for (let i = 0, l = doc.length; i < l; i++) {
				haveDBSite[i] = doc[i].s
				haveDBId[i] = doc[i].i
				if (doc[i].d == null) haveDBComic[i] = 0
				else haveDBComic[i] = 1
			}

			try { jsonfile.writeFileSync(dirDB+'/have.lowdb', {s:haveDBSite,i:haveDBId,c:haveDBComic}) } catch(err) { error('MakingHaveDB->'+err); console.log(err) }
			try { fs.unlinkSync(dirDB+'/have') } catch(err) { console.error(err) }
		})
	} else if (fs.existsSync(dirDB+'/have.lowdb')) {
		try {
			const data = jsonfile.readFileSync(dirDB+'/have.lowdb')
			haveDBSite = data.s
			haveDBId = data.i
			haveDBComic = data.c
			if (haveDBSite == null) haveDBSite = []
			if (haveDBId == null) haveDBId = []
			if (haveDBComic == null) haveDBComic = []
		} catch(err) {
			error('LoadingHaveDB->'+err)
			console.error(err)
		}
	} else try { jsonfile.writeFileSync(dirDB+'/have.lowdb', {s:[],i:[],c:[]}) } catch(err) { error('MakingHaveDB->'+err); console.log(err) }

	// Check DBs
	if (typeof groupsDB != 'object') groupsDB = []
	if (typeof artistsDB != 'object') artistsDB = []
	if (typeof parodiesDB != 'object') parodiesDB = []
	if (typeof tagsDB != 'object') tagsDB = []
	if (typeof charactersDB != 'object') charactersDB = []
	if (typeof categoriesDB != 'object') categoriesDB = []
	if (typeof collectionsDB != 'object') collectionsDB = []
}

function CheckSettings() {
	if (typeof setting.theme != 'number' || setting.theme < 0) setting.theme = defaultSetting.theme
	if (setting.theme > 1) setting.theme = 1
	if (typeof setting.pagination_theme != 'number' || setting.pagination_theme < 0) setting.pagination_theme = defaultSetting.pagination_theme
	if (setting.pagination_theme > 6) setting.pagination_theme = 6
	if (typeof setting.waiting_quality != 'number') setting.waiting_quality = defaultSetting.waiting_quality
	if (setting.waiting_quality > 2) setting.waiting_quality = 2
	else if (setting.waiting_quality < 0) setting.waiting_quality = 0
	if (typeof setting.max_per_page != 'number') setting.max_per_page = defaultSetting.max_per_page
	if (setting.max_per_page < 1) setting.max_per_page = 1
	if (typeof setting.img_graphic != 'number' || setting.img_graphic < 0) setting.img_graphic = defaultSetting.img_graphic
	if (setting.img_graphic > 1) setting.img_graphic = 1
	if (typeof setting.notification_download_finish != 'boolean') setting.notification_download_finish = defaultSetting.notification_download_finish
	if (typeof setting.notification_optimization_finish != 'boolean') setting.notification_optimization_finish = defaultSetting.notification_optimization_finish
	if (typeof setting.lazy_loading != 'boolean') setting.lazy_loading = defaultSetting.lazy_loading
	if (setting.lazy_loading == false) imageLazyLoadingOptions.rootMargin = "0px 0px 1200px 0px"
	if (typeof setting.tabs_limit != 'number') setting.tabs_limit = defaultSetting.tabs_limit
	if (setting.tabs_limit < 1) setting.tabs_limit = 1
	if (typeof setting.download_limit != 'number') setting.download_limit = defaultSetting.download_limit
	if (setting.download_limit < 1) setting.download_limit = 1
	if (typeof setting.rc !== 'number') setting.rc = defaultSetting.rc
	if (typeof setting.show_unoptimize != 'boolean') setting.show_unoptimize = defaultSetting.show_unoptimize
	if (typeof setting.check_update != 'boolean') setting.check_update = defaultSetting.check_update
	if (typeof setting.auto_close_optimize_panel != 'boolean') setting.auto_close_optimize_panel = defaultSetting.auto_close_optimize_panel
	if (typeof setting.open_br_startup != 'boolean') setting.open_br_startup = defaultSetting.open_br_startup
	if (typeof setting.rdls != 'boolean') setting.rdls = defaultSetting.rdls
	if (typeof setting.full_screen != 'boolean') setting.full_screen = defaultSetting.full_screen
	if (typeof setting.auto_backup != 'boolean') setting.auto_backup = defaultSetting.auto_backup
	if (typeof setting.developer_mode != 'boolean') setting.developer_mode = defaultSetting.developer_mode
	if (setting.developer_mode == true) {
		window.addEventListener('keydown', e => {
			if (e.ctrlKey && e.shiftKey && e.which == 73) remote.getCurrentWebContents().toggleDevTools()
		})
	}
}

function OpenReleaseNotes() {
	if (!fs.existsSync(__dirname+'/rn.json')) return
	let data
	try { data = jsonfile.readFileSync(__dirname+'/rn.json') || null } catch(err) { console.error(err) }
	if (data == null) return
	// data = {
	// 	version: '',
	// 	new: [],
	// 	bug: [],
	// 	impr: [],
	// 	plan: []
	// }

	const container = document.getElementById('nrelease-note')
	let html = ''

	if (data.version != null) html += '<h1>Release Notes v'+data.version+'</h1>'
	html += "<h2>🚀 What's New</h2>"

	if (data.new != null) {
		html += '<h3>🔥 New Features</h3><ul>'
		for (let i = 0, l = data.new.length; i < l; i++) html += '<li><span>'+data.new[i]+'</span></li>'
		html += '</ul>'
	}

	if (data.bug != null) {
		html += '<h3>🔧 Bug Fixes</h3><ul>'
		for (let i = 0, l = data.bug.length; i < l; i++) html += '<li><span>'+data.bug[i]+'</span></li>'
		html += '</ul>'
	}

	if (data.impr != null) {
		html += '<h3>🌟 Improvements</h3><ul>'
		for (let i = 0, l = data.impr.length; i < l; i++) html += '<li><span>'+data.impr[i]+'</span></li>'
		html += '</ul>'
	}

	if (data.plan != null) {
		html += '<h3>🚢 Plans</h3><ul>'
		for (let i = 0, l = data.plan.length; i < l; i++) html += '<li><span>'+data.plan[i]+'</span></li>'
		html += '</ul>'
	}

	if (setting.rc == update_number) html += '<div><div onclick="CloseReleaseNotes()">Close</div></div>'
	else html += '<div><div onclick="CloseReleaseNotes()">Show This Later</div><div onclick="CloseReleaseNotes(true)">I Undrestand</div></div>'

	container.innerHTML = html
	container.style.display = 'block'
	container.scrollTop = 0
}

function CloseReleaseNotes(save = false) {
	const container = document.getElementById('nrelease-note')
	container.style.display = 'none'
	container.innerHTML = null
	if (save) {
		setting.rc = update_number
		try { jsonfile.writeFileSync(dirDocument+'/setting.json', setting) } catch(err) { console.error(err) }
	}
}

// Make Tabs Draggable
const tabsContainer = document.getElementById('browser-tabs')
const tabsContainerTabs = tabsContainer.querySelectorAll('div')
tabsContainerTabs.forEach(dragable => {
	dragable.addEventListener('dragstart',() => {
		dragable.classList.add('dragging')
	})

	dragable.addEventListener('dragend', () => {
		dragable.classList.remove('dragging')
	})
})
tabsContainer.addEventListener('dragover', e => {
	e.preventDefault()
	const afterElement = getDragAfterElement(tabsContainer, e.clientX)
	const draggable = document.querySelector('.dragging')
	const tabPosId = draggable.getAttribute('pi')
	if (afterElement == null) {
		tabsContainer.append(draggable)
		if (tabsPos[tabsPos.length - 1] != tabPosId) {
			const tabPosIndex = tabsPos.indexOf(tabPosId)
			tabsPos.splice(tabPosIndex, 1)
			tabsPos.push(tabPosId)
			tabsPosParent.splice(tabPosIndex, 1)
			tabsPosParent.push(null)
		}
	} else {
		tabsContainer.insertBefore(draggable, afterElement)
		const afterTabIndex = tabsPos.indexOf(afterElement.getAttribute('pi'))
		if (tabsPos[afterTabIndex - 1] != tabPosId) {
			const tabPosIndex = tabsPos.indexOf(tabPosId)
			tabsPos.splice(tabPosIndex, 1)
			tabsPos.splice(afterTabIndex, 0, tabPosId)
			tabsPosParent.splice(tabPosIndex, 1)
			tabsPosParent.splice(afterTabIndex, 0, null)
		}
	}
})

function getDragAfterElement(container, x) {
	const draggableElemnets = [...container.querySelectorAll('div:not(.dragging)')]
	return draggableElemnets.reduce((closest, child) => {
		const box = child.getBoundingClientRect()
		const offset = x - box.left - box.width / 2
		if (offset < 0 && offset > closest.offset) {
			return { offset: offset, element: child }
		} else {
			return closest
		}
	}, { offset: Number.NEGATIVE_INFINITY }).element
}

// Database Main Stuff
function FixComicIndex(updateLast) {
	db.comics.find({}, (err, doc) => {
		if (err) { error(err); return }
		const len = doc.length
		if (len > 0) {
			const neededId = doc[len - 1]._id
			UpdateIndex(0, neededId + 1)
			if (updateLast == true && !Downloader.HasDownload()) lastComicId = neededId + 1
		} else {
			UpdateIndex(0, 1)
			if (updateLast == true && !Downloader.HasDownload()) lastComicId = 1
		}
	})
}

function UpdateIndex(index, value) {
	indexDB[index] = value
	jsonfile.writeFileSync(dirDB+'/index.lowdb',{a:indexDB})
}

// Image Loading
function preloadImage(img) {
	const src = img.getAttribute('data-src')
	img.removeAttribute('data-src')
	if (!src) return
	img.src = src
}

function ObserverFunction(entries, imageLoadingObserver) {
	entries.forEach(entry => {
		if (!entry.isIntersecting)
			return

		preloadImage(entry.target)
		imageLoadingObserver.unobserve(entry.target)
	})
}

let imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)

function SetHotKeys() {
	KeyManager.AddPublicHotKey(false, false, false, 122, ChangeScreenMode)
	KeyManager.use_public = true

	KeyManager.AddCategory('default') // 0
	KeyManager.AddHotKey('default', true, false, false, 66, openBrowser)
	KeyManager.AddHotKey('default', true, false, false, 72, 'PageManager.Home()')
	KeyManager.AddHotKey('default', true, false, false, 82, 'PageManager.Reload()')
	KeyManager.AddHotKey('default', true, false, false, 88, 'openCollectionsPanel()')
	KeyManager.AddHotKey('default', true, false, false, 92, 'PageManager.RandomJumpPage()')
	KeyManager.AddHotKey('default', false, false, false, 27, askForClosingApp)
	KeyManager.AddHotKey('default', false, false, false, 37, 'PageManager.Prev()')
	KeyManager.AddHotKey('default', false, false, false, 39, 'PageManager.Next()')
	KeyManager.AddHotKey('default', false, false, false, 49, 'openInfoPanel(0)')
	KeyManager.AddHotKey('default', false, false, false, 50, 'openInfoPanel(1)')
	KeyManager.AddHotKey('default', false, false, false, 51, 'openInfoPanel(2)')
	KeyManager.AddHotKey('default', false, false, false, 52, 'openInfoPanel(3)')
	KeyManager.AddHotKey('default', false, false, false, 53, 'openInfoPanel(4)')
	KeyManager.AddHotKey('default', false, false, false, 54, 'openInfoPanel(5)')
	KeyManager.AddHotKey('default', false, false, false, 55, 'openInfoPanel(6)')

	KeyManager.AddCategory('comic') // 1
	KeyManager.AddHotKey('comic', true, false, false, 69, "openComicExportPanel(Number(comicPanel.getAttribute('cid')), 1)")
	KeyManager.AddHotKey('comic', true, false, false, 81, "KeyManager.ChangeCategory(null);document.getElementById('comic-action-panel').style.display='flex'")
	KeyManager.AddHotKey('comic', true, false, false, 82, 'if (need_repair.length > 0) {KeyManager.ChangeCategory(null);repairComicImages()}')
	KeyManager.AddHotKey('comic', true, false, false, 83, 'SliderManager.Open()')
	KeyManager.AddHotKey('comic', false, false, false, 27, closeComicPanel)
	
	KeyManager.AddCategory('slider') // 2
	KeyManager.AddHotKey('slider', true, false, false, 37, 'SliderManager.Prev()')
	KeyManager.AddHotKey('slider', true, false, false, 39, 'SliderManager.Next()')
	KeyManager.AddHotKey('slider', false, false, false, 27, 'SliderManager.Close()')
	KeyManager.AddHotKey('slider', false, false, false, 65, 'SliderManager.Prev()')
	KeyManager.AddHotKey('slider', false, false, false, 68, 'SliderManager.Next()')
	KeyManager.AddHotKey('slider', false, false, false, 79, 'SliderManager.ToggleSize()')

	KeyManager.AddCategory('browser') // 3
	KeyManager.AddHotKey('browser', true, false, false, 37, browserPrev)
	KeyManager.AddHotKey('browser', true, false, false, 39, browserNext)
	KeyManager.AddHotKey('browser', true, false, false, 72, toggleBrowserHistory)
	KeyManager.AddHotKey('browser', true, false, false, 78, 'openSite(active_site)')
	KeyManager.AddHotKey('browser', true, false, false, 81, browserTabHome)
	KeyManager.AddHotKey('browser', true, false, false, 82, browserTabReload)
	KeyManager.AddHotKey('browser', true, false, false, 83, toggleSitePanel)
	KeyManager.AddHotKey('browser', true, false, false, 87, 'if (activeTabComicId != null) removeTab(activeTabComicId)')
	KeyManager.AddHotKey('browser', true, true, false, 84, openBrowserLastTabs)
	KeyManager.AddHotKey('browser', false, false, false, 27, closeBrowser)

	KeyManager.AddCategory('setting') // 4
	KeyManager.AddHotKey('setting', true, false, false, 83, 'saveSetting(false)')
	KeyManager.AddHotKey('setting', false, false, false, 27, closeSetting)

	KeyManager.AddCategory('info') // 5
	KeyManager.AddHotKey('info', false, false, false, 27, closeInfoPanel)
}