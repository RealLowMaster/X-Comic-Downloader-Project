const nhentai = new nHentaiAPI()
const nhentaiError = '<div class="alert alert-danger">{err}</div>'
const nhentaiSiteTopMenu = document.createElement('div')
nhentaiSiteTopMenu.classList.add('nhentai-top-menu')
nhentaiSiteTopMenu.innerHTML = '<i><svg xmlns="http://www.w3.org/2000/svg" width="482.556" height="209.281" viewBox="45.002 196.466 482.556 209.281"><path fill="#EC2854" stroke="#EC2854" stroke-miterlimit="10" d="M217.198 232.5c-16.597 6.907-52.729 34.028-36.249 58.467 7.288 10.807 19.94 18.442 31.471 22.057 10.732 3.363 23.897-.761 33.709 3.721-2.09 5.103-9.479 23.689-15.812 22.319-11.827-2.544-23.787-.445-33.07 8.485-18.958-26.295-45.97-36.974-75.739-29.676 22.066-27.2 16.719-55.687-6.468-81.622-13.999-15.657-47.993-37.963-69.845-28.853 54.591-22.738 121.119-5.555 172.003 25.102-8.815 3.669-3.617-2.179 0 0zm138.167 0c16.595 6.908 52.729 34.028 36.249 58.467-7.288 10.807-19.939 18.443-31.473 22.059-10.731 3.365-23.896-.762-33.712 3.721 2.104 5.112 9.464 23.671 15.812 22.318 11.826-2.542 23.789-.448 33.068 8.484 18.959-26.294 45.974-36.975 75.738-29.676-22.056-27.206-16.726-55.682 6.471-81.622 13.997-15.654 47.995-37.967 69.847-28.854-54.586-22.733-121.116-5.562-172 25.103 8.817 3.669 3.616-2.18 0 0z"/><path fill="none" d="M723.057 240.921H824.18v56.18H723.057z"/><path fill="#FFF" d="M225.434 293.58h23.199v15.919c6.874-6.563 14.154-11.274 21.841-14.137 7.687-2.863 16.234-4.295 25.64-4.295 20.621 0 34.549 5.552 41.785 16.653 3.979 6.074 5.969 14.766 5.969 26.077v71.95h-24.826v-70.693c0-6.842-1.312-12.358-3.935-16.547-4.344-6.982-12.209-10.473-23.604-10.473-5.789 0-10.538.455-14.246 1.363-6.693 1.536-12.572 4.608-17.636 9.216-4.07 3.701-6.716 7.522-7.937 11.467-1.221 3.945-1.832 9.582-1.832 16.913v58.754h-24.419l.001-112.167z"/></svg><i>'
save_value2 = document.createElement('button')
save_value2.type = 'button'
save_value2.innerText = 'Random'
nhentaiSiteTopMenu.appendChild(save_value2)
save_value2 = document.createElement('button')
save_value2.type = 'button'
save_value2.innerText = 'Tags'
nhentaiSiteTopMenu.appendChild(save_value2)
save_value2 = document.createElement('button')
save_value2.type = 'button'
save_value2.innerText = 'Artists'
nhentaiSiteTopMenu.appendChild(save_value2)
save_value2 = document.createElement('button')
save_value2.type = 'button'
save_value2.innerText = 'Characters'
nhentaiSiteTopMenu.appendChild(save_value2)
save_value2 = document.createElement('button')
save_value2.type = 'button'
save_value2.innerText = 'Parodies'
nhentaiSiteTopMenu.appendChild(save_value2)
save_value2 = document.createElement('button')
save_value2.type = 'button'
save_value2.innerText = 'Groups'
nhentaiSiteTopMenu.appendChild(save_value2)
save_value2 = null


function nhentaiChangePage(page, whitchbutton, updateTabIndex) {
	if (whitchbutton == 3) return
	let makeNewPage = false
	if (whitchbutton == 2) makeNewPage = true
	page = page || 1
	if (updateTabIndex == null) updateTabIndex = true
	let id
	if (makeNewPage) {
		id = createNewTab(`nhentaiChangePage(${page}, 0, false)`, true, 0)
		if (id == null) { PopAlert(defaultSettingLang.tab_at_limit, 'danger'); return }
	} else {
		id = activeTabComicId
		const passImageCon = document.getElementById(id).querySelector('[img-con="true"]')
		if (passImageCon != undefined) {
			const passImages = passImageCon.children
			for (let i = 0; i < passImages.length; i++) {
				passImages[i].removeAttribute('data-src')
				passImages[i].removeAttribute('src')
			}
		}

		if (updateTabIndex == true) tabs[Number(tabsContainer.querySelector(`[pi="${id}"]`).getAttribute('ti'))].addHistory(`nhentaiChangePage(${page}, 0, false)`)
	}

	const pageContent = document.getElementById(id)
	if (activeTabComicId == id) {
		bjp.style.display = 'none'
		bjp_i.setAttribute('oninput', '')
	}

	const tab = tabsContainer.querySelector(`[pi="${id}"]`)
	const tabArea = tab.getElementsByTagName('span')[0]
	const thisTabIndex = Number(tab.getAttribute('ti'))
	tabs[thisTabIndex].ir = true
	tabs[thisTabIndex].mp = 0
	checkBrowserTools(thisTabIndex)
	tabArea.innerHTML = `<img class="spin" src="Image/dual-ring-primary-${wt_fps}.gif">`
	pageContent.innerHTML = `<div class="browser-page-loading"><img class="spin" style="width:60px;height:60px" src="Image/dual-ring-primary-${wt_fps}.gif"><p>Loading...</p></div>`

	nhentai.getPage(page, (err, result) => {
		if (document.getElementById(id) == undefined) return
		tabs[thisTabIndex].ir = false
		checkBrowserTools(thisTabIndex)
		pageContent.innerHTML = ''
		if (err) {
			pageContent.innerHTML = nhentaiError.replace('{err}', err)
			return
		}
		tabArea.textContent = `Page ${page}`
		const main_container = document.createElement('div')
		let save, save2
		main_container.classList.add("nhentai-container")
		main_container.appendChild(nhentaiSiteTopMenu)

		if (result.pagination != undefined) {
			save2 = result.pagination[result.pagination.length - 1][1]
			if (save2 == null) save = page
			else save = save2
		} else save = 1

		tabs[thisTabIndex].jp = 1
		tabs[thisTabIndex].tp = page
		tabs[thisTabIndex].mp = save
		if (activeTabComicId == id) {
			bjp.style.display = 'inline-block'
			bjp_i.value = page
			bjp_i.setAttribute('oninput', `inputLimit(this, ${save});browserJumpPage(1, Number(this.value))`)
			bjp_m_p.textContent = save
		}

		let big_container, container

		// Popular
		if (page == 1 && result.popular.length != 0) {
			big_container = document.createElement('div')
			big_container.classList.add('nhentai-postrow')
			big_container.innerHTML = '<div>Popular</div>'
			container = document.createElement('div')
			if (setting.lazy_loading) {
				for (let i = 0; i < result.popular.length; i++) {
					container.innerHTML += `<div onclick=""><img src="${result.popular[i].thumb}" loading="lazy"><div ${result.popular[i].lang}>${result.popular[i].title}</div></div>`
				}
			} else {

			}
			big_container.appendChild(container)
			main_container.appendChild(big_container)
		}


		// Content
		

		// Pagination

		pageContent.appendChild(main_container)
		clearDownloadedComics(pageContent, 1)
	})
}