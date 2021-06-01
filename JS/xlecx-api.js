class XlecxAPI {
	constructor() {
		this.baseURL = 'https://xlecx.org';
		this.groupURL = '/xfsearch/group/';
		this.artistURL = '/xfsearch/artist/';
		this.parodyURL = '/xfsearch/parody/';
		this.tagURL = '/tags/';
		this.searchURL = '/index.php?do=search';
	}

	lastSlash(str) {
		var base = new String(str).substring(str.lastIndexOf('/') + 1);
		return base;
	}

	getPage(page, random, pagigation, category) {
		page = page || 1
		random = random || false
		pagigation = pagigation || false
		category = category || false
		var url = this.baseURL+'/page/'+page+'/';

		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');
		var gg = 0;
		var bb = 0;

		var arr = { "content": [] };
		var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in');
		if (li.length != 0 && xmlHttp.status != 404) {
			for (var i=0; i<li.length; i++) {
				gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href');
				bb = li[i].getElementsByClassName('th-time icon-l')[0];
				if (bb != undefined) {
					bb = bb.textContent;
					bb = bb.replace(' img', '');
					bb = bb.replace(' images', '');
					bb = bb.replace(' pages', '');
				} else {
					bb = 0;
				}
				
				arr.content.push({
					"id": this.lastSlash(gg),
					"title": li[i].getElementsByClassName('th-title')[0].textContent,
					"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
					"pages": Number(bb),
					"url": gg
				});
			}

			if (random == true) {
				arr.random = [];
				li = htmlDoc.getElementsByClassName('main')[0].children;
				for (var i=2; i<=13; i++) {
					gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href');
					bb = li[i].getElementsByClassName('th-time icon-l')[0];
					if (bb != undefined) {
						bb = bb.textContent;
						bb = bb.replace(' img', '').replace(' images', '').replace(' pages', '');
					} else {
						bb = 0;
					}

					arr.random.push({
						"id": this.lastSlash(gg),
						"title": li[i].getElementsByClassName('th-title')[0].textContent,
						"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src').replace('http://xlecx.com', ''),
						"pages": Number(bb),
						"url": gg
					});
				}
			}

			if (pagigation == true) {
				var value = null, page = null
				arr.pagigation = [];
				li = htmlDoc.getElementById('bottom-nav').querySelector('.navigation').children
				for (var i = 0; i < li.length; i++) {
					if (li[i].textContent == "")
						if (i == li.length - 1)
							value = ">"
						else
							value = "<"
					else
						value = li[i].textContent
					
					if (li[i].getAttribute('href') == null)
						page = null
					else
						page = Number(li[i].getAttribute('href').replace(this.baseURL+'/page/', '').replace('/', ''))
					
					
					arr.pagigation.push([value, page])
				}
			}

			if (category == true) {
				arr.categories = [];
				var li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a');
				var regexp = RegExp('/', 'g')
				for (var i=0; i<li.length; i++) {
					arr.categories.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL+'/', '').replace(regexp, '') })
				}
			}


		} else {
			arr = false;
		}
		

		return arr;
	}

	getCategories() {
		var url = this.baseURL+'/';
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');

		var arr = [];
		var li = htmlDoc.getElementsByClassName('side-bc')[0].getElementsByTagName('a');
		var regexp = RegExp('/', 'g')
		for (var i=0; i<li.length; i++) {
			arr.push({ "name": li[i].textContent, "url": li[i].getAttribute('href').replace(this.baseURL, '').replace(regexp, '') });
		}

		return arr;
	}

	getComic(id, cook) {
		var url = this.baseURL+'/'+id;
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');

		// Images
		var arr = {};
		var li = htmlDoc.getElementById('dle-content').getElementsByClassName('full-in');
		if (li.length != 0 && xmlHttp.status != 404) {
			var gg = 0;
			arr.title = li[0].getElementsByTagName('h1')[0].textContent;
			arr.images = [];
			var info = li[0].getElementsByClassName('full-tags');

			// Groups
			if (info[0].children.length > 0) {
				arr.groups = [];
				var t = info[0].getElementsByTagName('a')
				for (var i=0; i<t.length; i++) {
					gg = t[i].getAttribute('href');
					arr.groups.push({
						"name": t[i].textContent,
						"url": gg
					});
				}
			}

			// Artist
			if (info[1].children.length > 0) {
				arr.artists = [];
				var t = info[1].getElementsByTagName('a')
				for (var i=0; i<t.length; i++) {
					gg = t[i].getAttribute('href');
					arr.artists.push({
						"name": t[i].textContent,
						"url": gg
					});
				}
			}

			// Parody
			if (info[2].children.length > 0) {
				arr.parody = [];
				var t = info[2].getElementsByTagName('a')
				for (var i=0; i<t.length; i++) {
					gg = t[i].getAttribute('href');
					arr.parody.push({
						"name": t[i].textContent,
						"url": gg
					});
				}
			}

			// Tags
			if (info[3].children.length > 0) {
				arr.tags = [];
				var t = info[3].getElementsByTagName('a')
				for (var i=0; i<t.length; i++) {
					gg = t[i].getAttribute('href');
					arr.tags.push({
						"name": t[i].textContent,
						"url": gg
					});
				}
			}

			// Images
			var gg = li[0].getElementsByClassName('f-desc full-text clearfix')[0].getElementsByTagName('img');
			var bb = 0;
			if (cook == true) {
				for (var i=0; i<gg.length; i++) {
					bb = this.baseURL+gg[i].getAttribute('data-src');
					arr.images.push({
						"src": bb.replace("thumbs/", ""),
						"thumb": bb
					});
				}
			} else {
				for (var i=0; i<gg.length; i++) {
					bb = gg[i].getAttribute('data-src');
					arr.images.push({
						"src": bb.replace("thumbs/", ""),
						"thumb": bb
					});
				}
			}
		} else {
			arr = false;
		}
		

		return arr;
	}

	getAllTags() {
		var url = this.baseURL+'/tags/';
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');

		var arr = [];
		var gg = 0;
		var li = htmlDoc.getElementsByClassName('clouds_xsmall');
		for (var i=0; i<li.length; i++) {
			gg = li[i].children[0];
			arr.push({
				"name": gg.textContent,
				"url": gg.getAttribute('href')
			});
		}
		

		return arr;
	}

	getGroup(name, page) {
		if (page == null) {
			page = 1;
		}
		var url = this.baseURL+this.groupURL+'/'+name+'/page/'+page+'/';
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');
		var gg = 0;
		var bb = 0;

		var arr = { "content": [] };
		var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in');
		if (li.length != 0 && xmlHttp.status != 404) {
			for (var i=0; i<li.length; i++) {
				gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href');
				bb = li[i].getElementsByClassName('th-time icon-l')[0];
				if (bb != undefined) {
					bb = bb.textContent;
					bb = bb.replace(' img', '');
					bb = bb.replace(' images', '');
					bb = bb.replace(' pages', '');
				} else {
					bb = 0;
				}

				arr.content.push({
					"id": this.lastSlash(gg),
					"title": li[i].getElementsByClassName('th-title')[0].textContent,
					"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
					"pages": Number(bb),
					"url": gg
				});
			}
		} else {
			arr = false;
		}
		

		return arr;
	}

	getArtist(name, page) {
		if (page == null) {
			page = 1;
		}
		var url = this.baseURL+this.artistURL+'/'+name+'/page/'+page+'/';
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');
		var gg = 0;
		var bb = 0;

		var arr = { "content": [] };
		var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in');
		if (li.length != 0 && xmlHttp.status != 404) {
			for (var i=0; i<li.length; i++) {
				gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href');
				bb = li[i].getElementsByClassName('th-time icon-l')[0];
				if (bb != undefined) {
					bb = bb.textContent;
					bb = bb.replace(' img', '');
					bb = bb.replace(' images', '');
					bb = bb.replace(' pages', '');
				} else {
					bb = 0;
				}

				arr.content.push({
					"id": this.lastSlash(gg),
					"title": li[i].getElementsByClassName('th-title')[0].textContent,
					"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
					"pages": Number(bb),
					"url": gg
				});
			}
		} else {
			arr = false;
		}
		

		return arr;
	}

	getParody(name, page) {
		if (page == null) {
			page = 1;
		}
		var url = this.baseURL+this.parodyURL+'/'+name+'/page/'+page+'/';
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');
		var gg = 0;
		var bb = 0;

		var arr = { "content": [] };
		var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in');
		if (li.length != 0 && xmlHttp.status != 404) {
			for (var i=0; i<li.length; i++) {
				gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href');
				bb = li[i].getElementsByClassName('th-time icon-l')[0];
				if (bb != undefined) {
					bb = bb.textContent;
					bb = bb.replace(' img', '');
					bb = bb.replace(' images', '');
					bb = bb.replace(' pages', '');
				} else {
					bb = 0;
				}

				arr.content.push({
					"id": this.lastSlash(gg),
					"title": li[i].getElementsByClassName('th-title')[0].textContent,
					"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
					"pages": Number(bb),
					"url": gg
				});
			}
		} else {
			arr = false;
		}
		

		return arr;
	}

	getTag(name, page) {
		if (page == null) {
			page = 1;
		}
		var url = this.baseURL+this.tagURL+'/'+name+'/page/'+page+'/';
		var xmlHttp = null;

		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);
		xmlHttp.send(null);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(xmlHttp.responseText, 'text/html');
		var gg = 0;
		var bb = 0;

		var arr = { "content": [] };
		var li = htmlDoc.getElementById('dle-content').getElementsByClassName('th-in');
		if (li.length != 0 && xmlHttp.status != 404) {
			for (var i=0; i<li.length; i++) {
				gg = li[i].getElementsByClassName('th-img img-resp-h')[0].getAttribute('href');
				bb = li[i].getElementsByClassName('th-time icon-l')[0];
				if (bb != undefined) {
					bb = bb.textContent;
					bb = bb.replace(' img', '');
					bb = bb.replace(' images', '');
					bb = bb.replace(' pages', '');
				} else {
					bb = 0;
				}

				arr.content.push({
					"id": this.lastSlash(gg),
					"title": li[i].getElementsByClassName('th-title')[0].textContent,
					"thumb": li[i].getElementsByTagName('img')[0].getAttribute('src'),
					"pages": Number(bb),
					"url": gg
				});
			}
		} else {
			arr = false;
		}
		

		return arr;
	}
}