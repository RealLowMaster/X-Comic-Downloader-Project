function changeWaitingPreview(fps) {
	const imgs = document.getElementById('waiting-preview').getElementsByTagName('img')
	imgs[0].setAttribute('src', `Image/dual-ring-success-${fps}.gif`)
}

function setLuanchTimeSettings(reloadSettingPanel) {
	const s_comic_panel_theme = document.getElementById('s_comic_panel_theme')
	const s_offline_theme = document.getElementById('s_offline_theme')
	const s_browser_theme = document.getElementById('s_browser_theme')
	const s_waiting_quality = document.getElementById('s_waiting_quality')
	const s_pagination_theme = document.getElementById('s_pagination_theme')
	const s_img_graphic = document.getElementById('s_img_graphic')
	const s_search_speed = document.getElementById('s_search_speed')
	const s_file_location = document.getElementById('s_file_location')

	s_comic_panel_theme.setAttribute('value', setting.comic_panel_theme)
	s_offline_theme.setAttribute('value', setting.offline_theme)	
	s_browser_theme.setAttribute('value', setting.browser_theme)	
	s_pagination_theme.setAttribute('value', setting.pagination_theme)
	s_img_graphic.setAttribute('value', setting.img_graphic)
	s_search_speed.setAttribute('value', setting.search_speed)

	s_comic_panel_theme.getElementsByTagName('div')[0].textContent = s_comic_panel_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.comic_panel_theme})"]`).textContent
	s_offline_theme.getElementsByTagName('div')[0].textContent = s_offline_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.offline_theme})"]`).textContent
	s_browser_theme.getElementsByTagName('div')[0].textContent = s_browser_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.browser_theme})"]`).textContent
	s_pagination_theme.getElementsByTagName('div')[0].textContent = s_pagination_theme.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.pagination_theme})"]`).textContent
	s_img_graphic.getElementsByTagName('div')[0].textContent = s_img_graphic.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.img_graphic})"]`).textContent
	s_search_speed.getElementsByTagName('div')[0].textContent = s_search_speed.getElementsByTagName('div')[1].querySelector(`[onclick="select(this, ${setting.search_speed})"]`).textContent

	const wt_passValue = s_waiting_quality.getAttribute('value') || null
	if (wt_passValue != null) s_waiting_quality.querySelector(`[cs="${wt_passValue}"]`).removeAttribute('active')
	s_waiting_quality.querySelector(`[cs="${setting.waiting_quality}"]`).setAttribute('active', '')
	wt_fps = setting.waiting_quality + 10 - setting.waiting_quality + (10 * setting.waiting_quality)
	changeWaitingPreview(wt_fps)

	s_waiting_quality.setAttribute('value', setting.waiting_quality)

	document.getElementById('s_max_per_page').value = setting.max_per_page
	document.getElementById('s_download_limit').value = setting.download_limit
	document.getElementById('s_hover_downloader').checked = setting.hover_downloader
	document.getElementById('s_notification_download_finish').checked = setting.notification_download_finish
	document.getElementById('s_notification_optimization_finish').checked = setting.notification_optimization_finish
	document.getElementById('s_lazy_loading').checked = setting.lazy_loading
	document.getElementById('s_show_unoptimize').checked = setting.show_unoptimize
	document.getElementById('s_check_update').checked = setting.check_update
	document.getElementById('s_auto_close_optimize_panel').checked = setting.auto_close_optimize_panel
	document.getElementById('s_open_br_startup').checked = setting.open_br_startup
	document.getElementById('s_show_comic_pages').checked = setting.show_comic_pages

	s_file_location.setAttribute('location', setting.file_location)
	const s_file_location_label = s_file_location.parentElement.parentElement.children[0]

	if (setting.show_comic_pages) {
		document.getElementById('comic-container').setAttribute('show-pages', true)
		document.getElementById('o-c-p-c-c').setAttribute('show-pages', true)
	} else {
		document.getElementById('comic-container').removeAttribute('show-pages')
		document.getElementById('o-c-p-c-c').removeAttribute('show-pages')
	}

	if (setting.file_location.match(/[\\]/g).length > 1) s_file_location_label.textContent = setting.file_location.substr(0,2)+'\\...\\'+lastSlash(setting.file_location, '\\')
	else s_file_location_label.textContent = setting.file_location
	s_file_location_label.setAttribute('title', setting.file_location)

	if (reloadSettingPanel != true) {
		const style = document.documentElement.style
		if (setting.hover_downloader == false) document.getElementById('downloader').setAttribute('fixed', true)

		for (let i = 0; i < offline_theme_var.length; i++) {
			style.setProperty(offline_theme_var[i], offline_theme_themes[setting.offline_theme][i])
		}

		for (let i = 0; i < comic_panel_theme_var.length; i++) {
			style.setProperty(comic_panel_theme_var[i], comic_panel_theme_themes[setting.comic_panel_theme][i])
		}

		for (let i = 0; i < browser_theme_var.length; i++) {
			style.setProperty(browser_theme_var[i], browser_theme_themes[setting.browser_theme][i])
		}

		for (let i = 0; i < pagination_theme_var.length; i++) {
			style.setProperty(pagination_theme_var[i], pagination_theme_themes[setting.pagination_theme][i])
		}
	}
}

function saveSetting(justSave) {
	let reload = false
	if (justSave == false) {
		keydownEventIndex = null
		const style = document.documentElement.style
		const waiting_quality = Number(document.getElementById('s_waiting_quality').getAttribute('value'))
		const lazy_loading = document.getElementById('s_lazy_loading').checked
		const show_unoptimize = document.getElementById('s_show_unoptimize').checked
		const max_per_page = Number(document.getElementById('s_max_per_page').value)
		const file_location = document.getElementById('s_file_location').getAttribute('location')

		if (setting.waiting_quality != waiting_quality) {
			setting.waiting_quality = waiting_quality
			wt_fps = waiting_quality + 10 - waiting_quality + (10 * waiting_quality)
			const dl_imgs = document.getElementById('downloader').getElementsByTagName('img')
			for (let i = 0; i < dl_imgs.length; i++) {
				dl_imgs[i].setAttribute('src', `Image/dual-ring-success-${wt_fps}.gif`)
			}
		}

		if (setting.max_per_page != max_per_page) {
			setting.max_per_page = max_per_page
			reloadLoadingComics()
		}

		setting.comic_panel_theme = Number(document.getElementById('s_comic_panel_theme').getAttribute('value'))
		setting.offline_theme = Number(document.getElementById('s_offline_theme').getAttribute('value'))
		setting.browser_theme = Number(document.getElementById('s_browser_theme').getAttribute('value'))
		setting.pagination_theme = Number(document.getElementById('s_pagination_theme').getAttribute('value'))
		setting.img_graphic = Number(document.getElementById('s_img_graphic').getAttribute('value'))
		setting.search_speed = Number(document.getElementById('s_search_speed').getAttribute('value'))
		setting.hover_downloader = document.getElementById('s_hover_downloader').checked
		setting.notification_download_finish = document.getElementById('s_notification_download_finish').checked
		setting.notification_optimization_finish = document.getElementById('s_notification_optimization_finish').checked
		setting.download_limit = Number(document.getElementById('s_download_limit').value)
		setting.check_update = document.getElementById('s_check_update').checked
		setting.auto_close_optimize_panel = document.getElementById('s_auto_close_optimize_panel').checked
		setting.open_br_startup = document.getElementById('s_open_br_startup').checked
		setting.show_comic_pages = document.getElementById('s_show_comic_pages').checked

		if (setting.show_comic_pages) {
			document.getElementById('comic-container').setAttribute('show-pages', true)
			document.getElementById('o-c-p-c-c').setAttribute('show-pages', true)
		} else {
			document.getElementById('comic-container').removeAttribute('show-pages')
			document.getElementById('o-c-p-c-c').removeAttribute('show-pages')
		}

		if (show_unoptimize != setting.show_unoptimize) {
			reloadLoadingComics()
			setting.show_unoptimize = show_unoptimize
		}

		if (lazy_loading != setting.lazy_loading) {
			setting.lazy_loading = lazy_loading
			if (lazy_loading == true)
				imageLazyLoadingOptions.rootMargin = "0px 0px 300px 0px"
			else
				imageLazyLoadingOptions.rootMargin = "0px 0px 1200px 0px"

			imageLoadingObserver = new IntersectionObserver(ObserverFunction, imageLazyLoadingOptions)
		}

		if (file_location != setting.file_location) {
			reload = true
			setting.file_location = file_location
		}

		if (setting.hover_downloader == false) document.getElementById('downloader').setAttribute('fixed', true)
		else document.getElementById('downloader').removeAttribute('fixed')

		for (let i = 0; i < offline_theme_var.length; i++) {
			style.setProperty(offline_theme_var[i], offline_theme_themes[setting.offline_theme][i])
		}

		for (let i = 0; i < comic_panel_theme_var.length; i++) {
			style.setProperty(comic_panel_theme_var[i], comic_panel_theme_themes[setting.comic_panel_theme][i])
		}

		for (let i = 0; i < browser_theme_var.length; i++) {
			style.setProperty(browser_theme_var[i], browser_theme_themes[setting.browser_theme][i])
		}

		for (let i = 0; i < pagination_theme_var.length; i++) {
			style.setProperty(pagination_theme_var[i], pagination_theme_themes[setting.pagination_theme][i])
		}

		PopAlert('Setting Saved.')
	}

	require('jsonfile').writeFileSync(dirDocument+'/setting.json', setting)
	if (reload == true) {
		if (downloadingList.length == 0) ThisWindow.reload()
		else PopAlert('You cannot Change Saving Location when downloading.', 'danger')
	} else {
		keydownEventIndex = 0
		document.getElementById('setting-panel').style.display = 'none'
		document.getElementById('main').style.display = 'flex'
	}
}

function openSetting() {
	keydownEventIndex = 4
	const panel = document.getElementById('setting-panel')
	panel.style.display = 'block'
	panel.scrollTop = 0
	document.getElementById('main').style.display = 'none'
}

function closeSetting() {
	document.getElementById('setting-panel').style.display = 'none'
	setLuanchTimeSettings(true)
	keydownEventIndex = 0
	document.getElementById('main').style.display = 'flex'
}

function SettingKeyEvents(ctrl,shift,key) {
	if (ctrl) {
		if (!shift) {
			switch (key) {
				case 83:
					saveSetting(false)
					break
				case 87:
					closeSetting()
					break
			}
		}
	}
}