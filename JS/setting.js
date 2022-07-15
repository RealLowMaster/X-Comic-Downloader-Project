function changeWaitingPreview(fps) {
	const imgs = document.getElementById('waiting-preview').getElementsByTagName('img')
	imgs[0].setAttribute('src', `Image/dual-ring-success-${fps}.gif`)
}

function setLuanchTimeSettings(reloadSettingPanel) {
	const s_theme = document.getElementById('s_theme')
	const s_pagination_theme = document.getElementById('s_pagination_theme')
	const s_waiting_quality = document.getElementById('s_waiting_quality')
	const s_img_graphic = document.getElementById('s_img_graphic')
	const s_file_location = document.getElementById('s_file_location')

	s_theme.setAttribute('value', setting.theme)
	s_pagination_theme.setAttribute('value', setting.pagination_theme)
	s_img_graphic.setAttribute('value', setting.img_graphic)

	s_theme.getElementsByTagName('div')[0].textContent = s_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.theme})"]`).textContent
	s_pagination_theme.getElementsByTagName('div')[0].textContent = s_pagination_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.pagination_theme})"]`).textContent
	s_img_graphic.getElementsByTagName('div')[0].textContent = s_img_graphic.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.img_graphic})"]`).textContent

	const wt_passValue = s_waiting_quality.getAttribute('value') || null
	if (wt_passValue != null) s_waiting_quality.querySelector(`[cs="${wt_passValue}"]`).removeAttribute('active')
	s_waiting_quality.querySelector(`[cs="${setting.waiting_quality}"]`).setAttribute('active', '')
	wt_fps = setting.waiting_quality + 10 - setting.waiting_quality + (10 * setting.waiting_quality)
	changeWaitingPreview(wt_fps)

	s_waiting_quality.setAttribute('value', setting.waiting_quality)

	document.getElementById('s_max_per_page').value = setting.max_per_page
	document.getElementById('s_download_limit').value = setting.download_limit
	document.getElementById('s_notification_download_finish').checked = setting.notification_download_finish
	document.getElementById('s_notification_optimization_finish').checked = setting.notification_optimization_finish
	document.getElementById('s_lazy_loading').checked = setting.lazy_loading
	document.getElementById('s_show_unoptimize').checked = setting.show_unoptimize
	document.getElementById('s_check_update').checked = setting.check_update
	document.getElementById('s_auto_close_optimize_panel').checked = setting.auto_close_optimize_panel
	document.getElementById('s_full_screen').checked = setting.full_screen
	document.getElementById('s_open_br_startup').checked = setting.open_br_startup
	document.getElementById('s_rdls').checked = setting.rdls
	document.getElementById('s_show_comic_pages').checked = setting.show_comic_pages
	document.getElementById('s_auto_backup').checked = setting.auto_backup

	s_file_location.setAttribute('location', setting.file_location)
	const s_file_location_label = s_file_location.parentElement.parentElement.children[0]

	if (setting.show_comic_pages) PageManager.container.setAttribute('show-pages', true)
	else PageManager.container.removeAttribute('show-pages')

	if (setting.file_location.match(/[\\]/g).length > 1) s_file_location_label.textContent = setting.file_location.substr(0,2)+'\\...\\'+lastSlash(setting.file_location, '\\')
	else s_file_location_label.textContent = setting.file_location
	s_file_location_label.setAttribute('title', setting.file_location)

	ChangeScreenMode(setting.full_screen, false)

	if (reloadSettingPanel != true) {
		const style = document.documentElement.style
		for (let i = 0; i < themes_var.length; i++) style.setProperty('--'+themes_var[i], themes[setting.theme][i])
		for (let i = 0; i < pagination_theme_var.length; i++) style.setProperty(pagination_theme_var[i], pagination_theme_themes[setting.pagination_theme][i])
	}
}

function saveSetting(justSave) {
	let reload = false
	if (justSave == false) {
		KeyManager.ChangeCategory(null)
		const style = document.documentElement.style
		const waiting_quality = Number(document.getElementById('s_waiting_quality').getAttribute('value'))
		const lazy_loading = document.getElementById('s_lazy_loading').checked
		const show_unoptimize = document.getElementById('s_show_unoptimize').checked
		const max_per_page = Number(document.getElementById('s_max_per_page').value)
		const file_location = document.getElementById('s_file_location').getAttribute('location')

		if (setting.waiting_quality != waiting_quality) {
			setting.waiting_quality = waiting_quality
			wt_fps = waiting_quality + 10 - waiting_quality + (10 * waiting_quality)
		}

		if (setting.max_per_page != max_per_page) {
			setting.max_per_page = max_per_page
			PageManager.Reload()
		}

		setting.theme = Number(document.getElementById('s_theme').getAttribute('value'))
		setting.pagination_theme = Number(document.getElementById('s_pagination_theme').getAttribute('value'))
		setting.img_graphic = Number(document.getElementById('s_img_graphic').getAttribute('value'))
		setting.notification_download_finish = document.getElementById('s_notification_download_finish').checked
		setting.notification_optimization_finish = document.getElementById('s_notification_optimization_finish').checked
		setting.download_limit = Number(document.getElementById('s_download_limit').value)
		setting.check_update = document.getElementById('s_check_update').checked
		setting.auto_close_optimize_panel = document.getElementById('s_auto_close_optimize_panel').checked
		setting.open_br_startup = document.getElementById('s_open_br_startup').checked
		setting.show_comic_pages = document.getElementById('s_show_comic_pages').checked
		setting.rdls = document.getElementById('s_rdls').checked
		setting.full_screen = document.getElementById('s_full_screen').checked
		setting.auto_backup = document.getElementById('s_auto_backup').checked

		if (setting.show_comic_pages) PageManager.container.setAttribute('show-pages', true)
		else PageManager.container.removeAttribute('show-pages')

		if (show_unoptimize != setting.show_unoptimize) {
			PageManager.Reload()
			setting.show_unoptimize = show_unoptimize
		}

		if (lazy_loading != setting.lazy_loading) {
			setting.lazy_loading = lazy_loading
			if (lazy_loading == true) imageLazyLoadingOptions.rootMargin = "0px 0px 300px 0px"
			else imageLazyLoadingOptions.rootMargin = "0px 0px 1200px 0px"
			imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)
		}

		if (file_location != setting.file_location) {
			reload = true
			setting.file_location = file_location
		}

		for (let i = 0; i < themes_var.length; i++) style.setProperty('--'+themes_var[i], themes[setting.theme][i])
		for (let i = 0; i < pagination_theme_var.length; i++) style.setProperty(pagination_theme_var[i], pagination_theme_themes[setting.pagination_theme][i])

		PopAlert('Setting Saved.')
	}

	ChangeScreenMode(setting.full_screen)
	if (reload == true) {
		if (!Downloader.HasDownload()) ThisWindow.reload()
		else PopAlert('You cannot Change Saving Location when downloading.', 'danger')
	} else {
		KeyManager.ChangeCategory('default')
		document.getElementById('setting-panel').style.display = 'none'
		document.getElementById('main').style.display = 'flex'
	}
}

function openSetting() {
	KeyManager.ChangeCategory('setting')
	const panel = document.getElementById('setting-panel')
	panel.style.display = 'block'
	panel.scrollTop = 0
	document.getElementById('main').style.display = 'none'
}

function closeSetting() {
	document.getElementById('setting-panel').style.display = 'none'
	setLuanchTimeSettings(true)
	KeyManager.ChangeCategory('default')
	document.getElementById('main').style.display = 'flex'
}

function BackUp(filename = null, callback = null) {
	const backup_files = [
		'artists.lowdb',
		'categories.lowdb',
		'characters.lowdb',
		'collections.lowdb',
		'comics',
		'groups.lowdb',
		'index.lowdb',
		'languages.lowdb',
		'parodies.lowdb',
		'tags.lowdb',
		'have.lowdb'
	]

	const zip = new require('jszip')()

	for (let i = 0; i < backup_files.length; i++) {
		let src = `${dirDB}/${backup_files[i]}`
		if (fs.existsSync(src)) zip.file(backup_files[i], fs.readFileSync(src), { base64: true })
	}

	setTimeout(async() => {
		const content = await zip.generateAsync({ type: "nodebuffer" })
		const date = new Date()
		if (filename == null) filename = `${date.getFullYear()}-${date.getMonth() < 12 ? date.getMonth() + 1 : 1}-${date.getDate()} - ${date.getHours() < 10 ? '0'+date.getHours() : date.getHours()}-${date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()}-${date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds()} Backup.zip`
		if (!fs.existsSync(dirBU)) fs.mkdirSync(dirBU)
		fs.writeFileSync(`${dirBU}/${filename}`, content)
		if (callback != null) callback()
		else PopAlert('Backup Finished')
	}, 1)
}