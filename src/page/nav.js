'use strict';

import chain from '../util/chain';
import events from '../events';
import ce from '../ce';

let api = {};
let rootUrl = document.location.protocol +  '//' + (document.location.hostname || document.location.host);
if(document.location.port > 0) {
	rootUrl += ':'+ document.location.port;
}
rootUrl += '/';

function go(url, source, isReload) {
	var page = document.querySelector('mara-page');
	if(page) {
		history.replaceState(page.getPageState(), "", window.location);
	}

	history.pushState(null, "", url);
	navigate(source, isReload );
}

function ajaxify(el) {
	el.delegateEventListener('click', 'a', function(e) {
		if((typeof e.which != 'undefined' && e.which != 1) || e.metaKey || e.ctrlKey || e.altKey) return;

		var href = this.href;
		if(href.indexOf(rootUrl) !== 0 || this.matches('.external')) return;

		e.preventDefault();
		e.stopImmediatePropagation();

		go(href, this, document.location == href);
	});

	el.delegateEventListener('submit', 'form', function(e) {
		var href= e.target.action || document.location.toString();
		if(String(href).indexOf(rootUrl) !== 0) return;

		e.preventDefault();
		e.stopImmediatePropagation();

		var method = e.target.method ? e.target.method.toUpperCase() : 'GET';
		if(method == 'GET') {
			go(href + '?' + formSerialize(e.target), e.target);
		} else {
			let data;
			if(e.target.enctype === 'multipart/form-data') {
				data = new FormData(e.target);
				if(e.target.files) {
					e.target.files.forEach(file => data.append(file.id, file.file));
				}
			} else {
				data = formSerialize(e.target);
			}

			performPost(href, 'POST', data, e.target);
		}
	});
}

var container;

var navigateLoad = function() {
	if(this.status < 200 || this.status > 299) {
		navigateError.call(this);
		return;
	}

	var html = this.responseText
		.replace(/<\!DOCTYPE[^>]*>/i, '')
		.replace(/<(html|head|body|title|script)([\s\>])/gi,'<div class="document-$1"$2')
		.replace(/<(meta)([\s\>])/gi,'<div class="document-$1"$2</div>')
		.replace(/<\/(html|head|body|title|script)\>/gi,'</div>');

	let now = Date.now();

	if(now - api.loadStart > api.minLoadTime) {
		loadHtml(html);
	} else {
		setTimeout(() => loadHtml(html), api.minLoadTime - (now - api.loadStart));
	}
};

var loadHtml = function(html) {
	var newDoc = document.createElement('div');
	newDoc.innerHTML = html;

	var newPage = newDoc.querySelector('mara-page');
	var dialog = newDoc.querySelector('mara-dialog');
	let notification = newDoc.query('mara-notification');

	var url;
	if(newPage && ! dialog) {
		container.parentNode.replaceChild(newPage, container);
		container = newPage;

		url = newPage.getAttribute('url');
	}

	var oldDialog = document.querySelector('mara-dialog');
	if(oldDialog) {
		oldDialog.close();
	}

	var page = ! dialog && ! notification ? newPage : document.querySelector('mara-page');

	if(dialog) {
		url = dialog.getAttribute('url');
		page.after(dialog);
	} else if(notification) {
		if(oldDialog) {
			notification.dialog = oldDialog;
		}
		url = page.getAttribute('url');
		page.after(notification);
	} else {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;

		console.log('history state', history.state);
		if(history.state) {
			page.setPageState(history.state);
		}
	}

	if(url && document.location != url) {
		history.replaceState(history.state, "", url.replace(/[\?&]_=[0-9]+$/, ''));
	}

	api.url = url;

	setTimeout(() => {
		if(! dialog && ! notification) {
			let focus = page.query('[autofocus]');
			if(focus) focus.focus();
		}

		events.trigger(document, 'navigateDone', {
			page: page,
			dialog: dialog
		});
	}, 0);
};

var navigateProgress = function(e) {
	if(e.lengthComputable) {
		events.trigger(document, 'navigateProgress', {
			progress: e.loaded / e.total
		});
	}
};

var navigateError = function() {
	console.log('Navigation error');
	events.trigger(document, 'navigateError');
};

var makeAbsolute = function(url) {
	if(url.search(/^\/\//) != -1) {
		return window.location.protocol + url;
	}

	if(url.search(/:\/\//) != -1) return url;

	if(url.search(/^\//) != -1) {
		return window.location.origin + url;
	}

	var base = window.location.href.match(/(.*\/)/)[0];
	return base + url;
};

var navigate = function(from, isReload) {
	if(! container) return;

	var url = makeAbsolute(container.getAttribute('url') || '');

	var dialog = document.querySelector('mara-dialog');
	if(dialog) {
		// TODO: Do we always want to do this?
		dialog.removeIfVisible();
	}

	let newUrl = document.location.toString();
	events.trigger(document, 'navigateStarted', {
		url: newUrl,
		from: from,
		reload: isReload || false
	});

	if(newUrl.indexOf('?') > 0) {
		newUrl += '&_=' + Date.now();
	} else {
		newUrl += '?_=' + Date.now();
	}

	api.loadStart = Date.now();

	var req = new XMLHttpRequest();
	req.onload = navigateLoad;
	req.onerror = navigateError;
	req.onprogress = navigateProgress;
	req.open('GET', newUrl, true);
	req.setRequestHeader('Accept', 'text/html,application/json,*/*');
	req.setRequestHeader('X-Partial', 'true');
	req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	req.send();
};

var reload = function(url) {
	if(url) {
		url = makeAbsolute(url);
		if(url !== document.location.toString()) return;
	}

	navigate(null, true);
};

var formSerialize = function(form) {
	if(! form || form.nodeName !== 'FORM') return;

	let result = [];
	let push = function(el, value) {
		result.push(el.name + '=' + encodeURIComponent(value || el.value));
	};

	for(let i=0, n=form.elements.length; i<n; i++) {
		let el = form.elements[i];
		if(el.name === '') continue;

		switch(el.nodeName) {
			case 'INPUT':
				switch(el.type) {
					case 'checkbox':
					case 'radio':
						if(el.checked) push(el);
						break;
					default:
						push(el);
				}
				break;
			case 'TEXTAREA':
				push(el);
				break;
			case 'SELECT':
				switch(el.type) {
					case 'select-one':
						push(el);
						break;
					case 'select-multiple':
						for(var j=0, m=el.options.length; j<m; j++) {
							push(el, el.options[j].value);
						}
						break;
				}
				break;
			case 'BUTTON':
				switch(el.type) {
					case 'reset':
					case 'submit':
					case 'button':
						push(el.val);
				}
				break;
		}
	}

	return result.join('&');
};

var performPost = function(target, method, data, form) {
	var url = makeAbsolute(target);
	events.trigger(document, 'navigateStarted', {
		url: url,
		from: form
	});

	api.loadStart = Date.now();

	var req = new XMLHttpRequest();
	req.onload = chain(function() {
		history.pushState(null, "", target);
	}, navigateLoad);
	req.onerror = navigateError;
	req.onprogress = navigateProgress;
	req.open(method, target, true);
	if(! (data instanceof window.FormData)) {
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	}
	req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	req.setRequestHeader('X-Partial', 'true');
	req.send(data);
};

ce.define('mara-page', function(el) {

	el.createdCallback = function() {
		var w = this.hasAttribute('window');

		if(! w) ajaxify(this);

		this._stateElements = [];
		this._stateUniqueId = 0;

		if(container) return false;

		if(w) ajaxify(window.document.documentElement);
		api.url = this.getAttribute('url');
		container = this;
	};

	el.attachedCallback = function() {
		document.title = this.pageTitle;
		api.lastPage = this.getAttribute('url');
	};

	el.withAttributes('page-title', 'url');

	window.addEventListener('popstate', function() {
		var page = document.querySelector('mara-page');
		if(page) {
			console.log("page state", page.getPageState());
			history.replaceState(page.getPageState(), "", window.location);
		}
		navigate();
	});

	el.hasPageState = true;
	el.addPageState = function(stateObject) {
		if(! stateObject.id) {
			stateObject.id = 'mara-' + (++this._stateUniqueId);
		}

		this._stateElements.push(stateObject);
	};
	el.getPageState = function() {
		var result = {};
		this._stateElements.forEach(function(stateObject) {
			result[stateObject.id] = stateObject.getPageState();
		});
	};
	el.setPageState = function(state) {
		if(! state) return;

		this._stateElements.forEach(function(stateObject) {
			stateObject.setPageState(state[stateObject.id]);
		});
	};
});

api.go = go;
api.reload = reload;

export default api;
