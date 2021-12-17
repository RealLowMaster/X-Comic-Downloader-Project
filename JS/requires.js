const { remote } = require('electron')
const fs = require('fs')
const nedb = require('nedb')
const sharp = require('sharp')
const jsonfile = require('jsonfile')
const ImageDownloader = require('image-downloader')
const defaultSettingLang = {
	tab_at_limit: "You Can't Make Any More Tab."
}
const defaultSetting = {
	"comic_panel_theme": 1,
	"pagination_theme": 0,
	"offline_theme": 1,
	"browser_theme": 1,
	"waiting_quality": 1,
	"hover_downloader": false,
	"show_comic_pages": false,
	"max_per_page": 18,
	"img_graphic": 1,
	"notification_download_finish": false,
	"notification_optimization_finish": true,
	"lazy_loading": true,
	"tabs_limit": 32,
	"search_speed": 1,
	"download_limit": 5,
	"show_unoptimize": false,
	"check_update": true,
	"auto_close_optimize_panel": false,
	"file_location": null,
	"full_screen": true,
	"open_br_startup": false,
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
const keydownEvents = [
	'OfflineKeyEvents({ctrl},{shift},{key})',
	'OfflineComicKeyEvents({ctrl},{shift},{key})',
	'SliderKeyEvents({ctrl},{shift},{key})',
	'BrowserKeyEvents({ctrl},{shift},{key})',
	'SettingKeyEvents({ctrl},{shift},{key})'
]
const ThisWindow = remote.getCurrentWindow(), loading = new Loading(10), db = {}, procressPanel = new ProcressPanel(0), update_number = 10
let comicDeleting = false, downloadCounter = 0, wt_fps = 20, dirDB, dirUL, dirBU, dirTmp, isOptimizing = false, browserLastTabs = [], tabsHistory = [], dirHistory = '', keydownEventIndex = 0, new_update, save_value = null, save_value2 = null, afterDLReload = true, setting, openedMenuTabIndex, copiedTab = null, tabs = [], downloadingList = [], lastComicId, lastHaveId, searchTimer, activeTabComicId = null, activeTabIndex = null, tabsPos = [], tabsPosParent = [], isUpdating = false
let collectionsDB = [], groupsDB = [], artistsDB = [], parodiesDB = [], tagsDB = [], charactersDB = [], languagesDB = [], categoriesDB = [], comicGroupsDB = [], comicArtistsDB = [], comicParodiesDB = [], comicTagsDB = [], comicCharactersDB = [], comicLanguagesDB = [], comicCategoriesDB = [], indexDB = []

/*
	37 // Left Arrow
	39 // Right Arrow
	38 // Up Arrow
	40 // Down Arrow
	84 // T = Open Recent Tab
	78 // N = Create New Tab
	72 // H = Open History
	70 // F = Search Tab
	87 // W = Close Current Tab
	36 // Home = Go To Home Site
	107 // + = Zoom In
	109 // - = Zoom Out
	83 // S = Open Slider
	82 // R = Reload
*/

// Set Windows Closing Event
function closeApp() {
	closingApp = true
	loading.reset(0)
	loading.show('Shutting Down')
	const tabsElement = tabsContainer.children
	if (tabsElement.length > 0) {
		for (let i = 0; i < tabsElement.length; i++) {
			const thisTabIndex = Number(tabsElement[i].getAttribute('ti'))
			addHistory(tabs[thisTabIndex], tabsElement[i].children[0].innerText)
		}
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
			closingApp = false
		}
	} else {
		ThisWindow.removeAllListeners()
		remote.app.quit()
	}
}

ThisWindow.addListener('close', e => {
	e.preventDefault()
	if (isUpdating) { PopAlert('You Cannot Close App When Updating.', 'danger'); closingApp = false; return }
	if (isOptimizing) { PopAlert("You can't Close App When you are Optimzating.", "danger"); closingApp = false; return }
	if (isRepairing) { PopAlert("You can't Close App When you are Repairing.", "danger"); closingApp = false; return }
	if (comicDeleting) { PopAlert("You can't Close App When you are Deleting a Comic.", "danger"); closingApp = false; return }
	if (downloadingList.length > 0) {
		errorSelector('You are Downloading Comics, Are you sure you want To Close Software ?', [
			[
				"Yes",
				"btn btn-primary m-2",
				"cancelAllDownloads(true)"
			],
			[
				"No",
				"btn btn-danger m-2",
				"closingApp = false;this.parentElement.parentElement.remove()"
			]
		])
	} else closeApp()
})

function maximizeApp() {
	if (ThisWindow.isMaximized()) ThisWindow.unmaximize()
	else ThisWindow.maximize()
}

function minimizeApp() {
	ThisWindow.minimize()
}

// Needable Functions
function fileExt(str) {
	return new String(str).substring(str.lastIndexOf('.') + 1)
}

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
	callback = callback || null

	if (callback == null) throw "Callback function Can't Be Null."
	if (typeof(callback) != 'function') throw 'Callback Should Be Function.'

	const choosedDirectory = remote.dialog.showOpenDialogSync({title:title, properties:['openDirectory']})

	if (choosedDirectory == undefined) callback('Canceled', null)
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

function CheckUpdate(alert) {
	alert = alert || false
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
	if (downloadingList.length > 0) { PopAlert("You can't Update App When you are Downloading Comic.", "danger"); return }
	if (window.navigator.onLine == false) { PopAlert('You are Offline.', 'danger'); return }
	if (isUpdating) return
	isUpdating = true
	procressPanel.config({ miniLog: false, bgClose: false, closeBtn: false })
	procressPanel.reset(3)
	procressPanel.show('Checking Connection...')

	let node_update = false
	if (new_update.node_modules_updates_number > update_number) {
		node_update = true
		procressPanel.changePercent(5)
	}

	procressPanel.add('Connected To Update Data.')
	procressPanel.forward('Downloading Update...')
	const request = require('request')
	const file = fs.createWriteStream(`${dirTmp}/update.zip`)

	setTimeout(async () => {
		await new Promise((resolve, reject) => {
			let total_bytes = 0, total_size = '', received_bytes = 0

			const stream = request({
				method: 'GET',
				followAllRedirects: true,
				url: new_update.zip
			})

			stream.on('error', err => {
				file.close()
				fs.unlinkSync(`${dirTmp}/update.zip`)
				isUpdating = false
				reject(err)
			})

			stream.on('response', response => {
				total_bytes = parseInt(response.headers['content-length'])
				total_size = formatBytes(total_bytes)
			})

			stream.on('data', chunk => {
				received_bytes += chunk.length
				procressPanel.text(`Downloading Update (${formatBytes(received_bytes)}/${total_size}) (${((received_bytes * 100) / total_bytes).toFixed()}%/100%)`)
			})

			stream.pipe(file).on('finish', async () => {
				file.close()

				const StreamZip = require('node-stream-zip')
				const path = require('path')

				if (node_update) {
					procressPanel.add('Complete Downloading Update First Part.')
					procressPanel.forward('Extracting First Part...')
				} else {
					procressPanel.add('Complete Downloading Update.')
					procressPanel.forward('Updating...')
				}

				const zip = new StreamZip.async({ file: `${dirTmp}/update.zip` })

				zip.on('error', err => {
					isUpdating = false
					error('UPDATE::UNZIPING::ERR::'+err)
				})

				await zip.entries().then(async entries => {
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
					fs.unlinkSync(`${dirTmp}/update.zip`)

					if (node_update) {
						procressPanel.add('Extracte First Part Complete.')
						procressPanel.forward('Downloading Update Secend Part...')

						const secendFile = fs.createWriteStream(`${dirTmp}/node_update.zip`)

						total_bytes = 0
						total_size = ''
						received_bytes = 0

						const secendStream = request({
							method: 'GET',
							followAllRedirects: true,
							url: new_update.latest_node_modules
						})

						secendStream.on('error', err => {
							secendFile.close()
							fs.unlinkSync(`${dirTmp}/node_update.zip`)
							isUpdating = false
							reject(err)
						})

						secendStream.on('response', response => {
							total_bytes = parseInt(response.headers['content-length'])
							total_size = formatBytes(total_bytes)
						})

						secendStream.on('data', chunk => {
							received_bytes += chunk.length
							procressPanel.text(`Downloading Update (${formatBytes(received_bytes)}/${total_size}) (${((received_bytes * 100) / total_bytes).toFixed()}%/100%)`)
						})

						secendStream.pipe(secendFile).on('finish', async () => {
							secendFile.close()

							const secendZip = new StreamZip.async({ file: `${dirTmp}/node_update.zip` })

							secendZip.on('error', err => {
								isUpdating = false
								error('UPDATE-2::UNZIPING::ERR::'+err)
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
										procressPanel.add('UnZip-2-ExtractFile-ERR:: '+err, 'danger')
									}
								}
		
								secendZip.close()
								fs.unlinkSync(`${dirTmp}/node_update.zip`)

								procressPanel.add('Update Complete.')
								procressPanel.forward('Closing App...')
								resolve()
								setTimeout(() => {
									ThisWindow.removeAllListeners()
									remote.app.quit()
								}, 250)
							})
						})

					} else {
						procressPanel.add('Update Complete.')
						procressPanel.forward('Closing App...')
						isUpdating = false
						resolve()
						setTimeout(() => {
							ThisWindow.removeAllListeners()
							remote.app.quit()
						}, 250)
					}
				}).catch(err => {
					procressPanel.add('UnZip-GettingEntries-ERR:: '+err, 'danger')
				})
			})
		}).catch(err => {
			isUpdating = false
			error('UPDATE::DOWNLOAD::ERR::'+err)
		})
	}, 100)
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
			.replace(/%2D/g, '-')
			.replace(/%2E/g, '.')
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
			.replace(/-/g, '%2D')
			.replace(/\./g, '%2E')
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

function loadImagesOneByOne(images) {
	if (comicImageContainer.children.length <= 0 || images.length <= 0) return
	let src = images[0].getAttribute('data-src')
	images[0].removeAttribute('data-src')
	if (!src) {
		if (images[0].complete) {
			images.shift()
			setTimeout(() => {
				loadImagesOneByOne(images)
			}, 1)
		} else {
			setTimeout(() => {
				loadImagesOneByOne(images)
			}, 250)
		}
	} else {
		images[0].src = src
		setTimeout(() => {
			loadImagesOneByOne(images)
		}, 1)
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
	db.have = new nedb({ filename: dirDB+'/have', autoload: true })
	db.comic_groups = new nedb({ filename: dirDB+'/comic_groups', autoload: true })
	db.comic_artists = new nedb({ filename: dirDB+'/comic_artists', autoload: true })
	db.comic_parodies = new nedb({ filename: dirDB+'/comic_parodies', autoload: true })
	db.comic_tags = new nedb({ filename: dirDB+'/comic_tags', autoload: true })
	db.comic_characters = new nedb({ filename: dirDB+'/comic_characters', autoload: true })
	db.comic_languages = new nedb({ filename: dirDB+'/comic_languages', autoload: true })
	db.comic_categories = new nedb({ filename: dirDB+'/comic_categories', autoload: true })

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
	
	if (fs.existsSync(dirDB+'/collections.lowdb')) collectionsDB = jsonfile.readFileSync(dirDB+'/collections.lowdb').a
	else jsonfile.writeFileSync(dirDB+'/collections.lowdb',{a:[]})
}

function CheckSettings() {
	if (typeof(setting.comic_panel_theme) != 'number' || setting.comic_panel_theme < 0) setting.comic_panel_theme = defaultSetting.comic_panel_theme
	if (setting.comic_panel_theme > 1) setting.comic_panel_theme = 1
	if (typeof(setting.pagination_theme) != 'number' || setting.pagination_theme < 0) setting.pagination_theme = defaultSetting.pagination_theme
	if (setting.pagination_theme > 6) setting.pagination_theme = 6
	if (typeof(setting.offline_theme) != 'number') setting.offline_theme = defaultSetting.offline_theme
	if (setting.offline_theme < 0) setting.offline_theme = 0
	if (setting.offline_theme > 1) setting.offline_theme = 1
	if (typeof(setting.browser_theme) != 'number') setting.browser_theme = defaultSetting.browser_theme
	if (setting.browser_theme < 0) setting.browser_theme = 0
	if (setting.browser_theme > 1) setting.browser_theme = 1
	if (typeof(setting.waiting_quality) != 'number') setting.waiting_quality = defaultSetting.waiting_quality
	if (setting.waiting_quality > 2) setting.waiting_quality = 2
	else if (setting.waiting_quality < 0) setting.waiting_quality = 0
	if (typeof(setting.max_per_page) != 'number') setting.max_per_page = defaultSetting.max_per_page
	if (setting.max_per_page < 1) setting.max_per_page = 1
	if (typeof(setting.img_graphic) != 'number' || setting.img_graphic < 0) setting.img_graphic = defaultSetting.img_graphic
	if (setting.img_graphic > 1) setting.img_graphic = 1
	if (typeof(setting.notification_download_finish) != 'boolean') setting.notification_download_finish = defaultSetting.notification_download_finish
	if (typeof(setting.notification_optimization_finish) != 'boolean') setting.notification_optimization_finish = defaultSetting.notification_optimization_finish
	if (typeof(setting.hover_downloader) != 'boolean') setting.hover_downloader = defaultSetting.hover_downloader
	if (typeof(setting.lazy_loading) != 'boolean') setting.lazy_loading = defaultSetting.lazy_loading
	if (setting.lazy_loading == false) imageLazyLoadingOptions.rootMargin = "0px 0px 1200px 0px"
	if (typeof(setting.tabs_limit) != 'number') setting.tabs_limit = defaultSetting.tabs_limit
	if (setting.tabs_limit < 1) setting.tabs_limit = 1
	if (typeof(setting.search_speed) != 'number') setting.search_speed = defaultSetting.search_speed
	if (setting.search_speed > 3) setting.search_speed = 3
	else if (setting.search_speed < 0) setting.search_speed = 0
	if (typeof(setting.download_limit) != 'number') setting.download_limit = defaultSetting.download_limit
	if (setting.download_limit < 1) setting.download_limit = 1
	if (typeof(setting.show_unoptimize) != 'boolean') setting.show_unoptimize = defaultSetting.show_unoptimize
	if (typeof(setting.check_update) != 'boolean') setting.check_update = defaultSetting.check_update
	if (typeof(setting.auto_close_optimize_panel) != 'boolean') setting.auto_close_optimize_panel = defaultSetting.auto_close_optimize_panel
	if (typeof(setting.open_br_startup) != 'boolean') setting.open_br_startup = defaultSetting.open_br_startup
	if (typeof(setting.full_screen) != 'boolean') setting.full_screen = defaultSetting.full_screen
	if (typeof(setting.auto_backup) != 'boolean') setting.auto_backup = defaultSetting.auto_backup
	if (typeof(setting.developer_mode) != 'boolean') setting.developer_mode = defaultSetting.developer_mode
	if (setting.developer_mode == true) {
		window.addEventListener('keydown', e => {
			if (e.ctrlKey && e.shiftKey && e.which == 73) remote.getCurrentWebContents().toggleDevTools()
		})
	}
}

function CheckReleaseNote() {
	if (fs.existsSync(__dirname+'/release-note.json')) {
		new_update = jsonfile.readFileSync(__dirname+'/release-note.json')
		fs.unlinkSync(__dirname+'/release-note.json')


		document.getElementById('r-n-n-v').innerHTML = "What's new in v"+new_update.v
		let html = '<h2>Important Changes</h2>'
		for (let i = 0; i < new_update.s.length; i++) {
			html += `<p class="${new_update.c[i]}">${new_update.s[i]}</p>`
		}
		document.getElementById('r-n-n-n').innerHTML = html
		document.getElementById('release-note').style.display = 'flex'

		new_update = null
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
const FixIndex = async(id, updateLast) => {
	switch (id) {
		case 0:
			db.comics.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					UpdateIndex(0, neededId + 1)
					if (updateLast == true && downloadCounter == 0) lastComicId = neededId + 1
				} else {
					UpdateIndex(0, 1)
					if (updateLast == true && downloadCounter == 0) lastComicId = 1
				}
			})
			break
		case 1:
			db.have.find({}, (err, doc) => {
				if (err) { error(err); return }
				const len = doc.length
				if (len > 0) {
					const neededId = doc[len - 1]._id
					UpdateIndex(1, neededId + 1)
					if (updateLast == true && downloadCounter == 0) lastHaveId = neededId + 1
				} else {
					UpdateIndex(1, 1)
					if (updateLast == true && downloadCounter == 0) lastHaveId = 1
				}
			})
			break
	}
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