const xlecx = new XlecxAPI();

function openBrowser() {
	console.log('Comming Sood!')
}

function closeBrowser() {
	console.log('Comming Sood!')
}

function openXlecxBrowser() {
	$('.browser').attr('style', 'display:grid');
}

function updateTabSize() {
	var windowWidth = window.innerWidth
	var tabs = document.getElementById('browser-tabs').getElementsByTagName('div')
	if ((windowWidth / 200) <= tabs.length) {
		var tabWidth = (windowWidth - 60) / tabs.length
		for (var i = 0; i < tabs.length; i++) {
			tabs[i].style.width = tabWidth+'px'
		}
	} else {
		for (var i = 0; i < tabs.length; i++) {
			tabs[i].style.width = '200px'
		}
	}
}

setInterval(() => {
	updateTabSize()
}, 2000)

$(document).ready(() => {
	// var h = xlecx.getPage(692, true);
	// var h = xlecx.getComic('9666-uchishikiri.html');
	// var h = xlecx.getAllTags();
	// var h = xlecx.getGroup('pucchu', 1);
	// var h = xlecx.getArtist('felsala', 1);
	// var h = xlecx.getParody('boruto', 1);
	// var h = xlecx.getTag('absorption', 2);
	// var h = xlecx.search('hello');
});
