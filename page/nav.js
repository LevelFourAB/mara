'use strict';

import chain from '../util/chain';
import events from '../events';
import ce from '../ce';

const api = {};

let rootUrl = document.location.protocol +  '//' + (document.location.hostname || document.location.host);
if(document.location.port > 0) {
	rootUrl += ':'+ document.location.port;
}
rootUrl += '/';

function go(url, source, isReload) {
	const page = document.querySelector('mara-page');
	if(page) {
		history.replaceState(page.pageState, "", window.location);
	}

	history.pushState(null, "", url);
	navigate(source, isReload );
}

function ajaxify(el) {
	el.delegateEventListener('click', 'a', function(e) {
		if((typeof e.which != 'undefined' && e.which != 1) || e.metaKey || e.ctrlKey || e.altKey) return;

		var href = typeof this.href.animVal !== 'undefined' ? this.href.animVal : this.href;
		if(href.indexOf(rootUrl) !== 0 || this.matches('.external')) return;

		e.preventDefault();
		e.stopImmediatePropagation();

		go(href, this, document.location == href);
	});

	el.delegateEventListener('submit', 'form', function(e) {
		const href = makeAbsolute(e.target.getAttribute('action') || document.location.toString());
		if(String(href).indexOf(rootUrl) !== 0) return;
		if(this.matches('.external')) return;

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

function navigateLoad() {
	if(this.status < 200 || this.status > 299) {
		navigateError.call(this);
		return;
	}

	const html = this.responseText;
	const now = Date.now();

	if(now - api.loadStart > api.minLoadTime) {
		loadHtml(html);
	} else {
		setTimeout(() => loadHtml(html), api.minLoadTime - (now - api.loadStart));
	}
}

function loadHtml(html) {
	const newDoc = document.implementation.createHTMLDocument();
	newDoc.documentElement.innerHTML = html;

	const newPage = newDoc.querySelector('mara-page');
	const dialog = newDoc.querySelector('mara-dialog');
	const notification = newDoc.querySelector('mara-notification');

	var url;
	if(newPage && ! dialog) {
		container.parentNode.replaceChild(newPage, container);
		container = newPage;

		url = newPage.getAttribute('url');
	}

	const oldDialogs = document.querySelectorAll('mara-dialog');
	for(const oldDialog of oldDialogs) {
		oldDialog.close();
	}

	const page = ! dialog && ! notification ? newPage : document.querySelector('mara-page');

	if(dialog) {
		url = dialog.getAttribute('url');
		page.after(dialog);
	} else if(notification) {
		notification.dialogs = oldDialogs;

		url = page.getAttribute('url');
		page.after(notification);
	} else {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;

		console.log('history state', history.state);
		if(history.state) {
			page.pageState = history.state;
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
}

function navigateProgress(e) {
	if(e.lengthComputable) {
		events.trigger(document, 'navigateProgress', {
			progress: e.loaded / e.total
		});
	}
}

function navigateError() {
	console.log('Navigation error');
	events.trigger(document, 'navigateError');
}

function makeAbsolute(url) {
	if(url.search(/^\/\//) != -1) {
		return window.location.protocol + url;
	}

	if(url.search(/:\/\//) != -1) return url;

	if(url.search(/^\//) != -1) {
		return window.location.origin + url;
	}

	const base = window.location.href.match(/(.*\/)/)[0];
	return base + url;
}

function navigate(from, isReload) {
	if(! container) return;

	const url = makeAbsolute(container.getAttribute('url') || '');

	const dialogs = document.querySelectorAll('mara-dialog');
	for(const dialog of dialogs) {
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

	const req = new XMLHttpRequest();
	req.onload = navigateLoad;
	req.onerror = navigateError;
	req.onprogress = navigateProgress;
	req.open('GET', newUrl, true);
	req.setRequestHeader('Accept', 'text/html,application/json,*/*');
	req.setRequestHeader('X-Partial', 'true');
	req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	req.send();
}

function reload(url) {
	if(url) {
		url = makeAbsolute(url);
		if(url !== document.location.toString()) return;
	}

	navigate(null, true);
}

function formSerialize(form) {
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
}

function performPost(target, method, data, form) {
	var url = makeAbsolute(target);
	events.trigger(document, 'navigateStarted', {
		url: url,
		from: form
	});

	api.loadStart = Date.now();

	const req = new XMLHttpRequest();
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
}

class MaraPage extends ce.HTMLCustomElement {
	init() {
		var w = this.hasAttribute('window');

		if(! w) ajaxify(this);

		this._stateElements = [];
		this._stateUniqueId = 0;

		if(container) return false;

		if(w) ajaxify(window.document.documentElement);
		api.url = this.getAttribute('url');
		container = this;
	}

	get pageTitle() {
		return this.getAttribute('page-title');
	}

	get url() {
		return this.getAttribute('url');
	}

	connectedCallback() {
		document.title = this.pageTitle;
		api.lastPage = this.url;
	}

	addPageState(stateObject) {
		if(! stateObject.id) {
			stateObject.id = 'mara-' + (++this._stateUniqueId);
		}

		this._stateElements.push(stateObject);
	}

	get pageState() {
		const result = {};
		this._stateElements.forEach(function(stateObject) {
			result[stateObject.id] = stateObject.pageState;
		});
		return result;
	}

	set pageState(state) {
		if(! state) return;

		this._stateElements.forEach(function(stateObject) {
			stateObject.pageState = state[stateObject.id];
		});
	}
}
ce.define('mara-page', MaraPage);

window.addEventListener('popstate', function() {
	var page = document.querySelector('mara-page');
	if(page) {
		const state = page.pageState;
		console.log("page state", state);
		history.replaceState(state, "", window.location);
	}
	navigate();
});

api.go = go;
api.reload = reload;
api.serializeForm = formSerialize;

export default api;
