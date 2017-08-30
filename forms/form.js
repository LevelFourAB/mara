'use strict';

import ce from '../ce';
import api from './api';

let fileId = 0;

class MaraForm extends ce.HTMLCustomElement.with(api.FormSection, ce.DOMReady) {
	connectedCallback() {
		super.connectedCallback();

		let p = this.parentNode;
		while(p) {
			if(p.hasPageState) {
				p.addPageState(this);
				break;
			}

			p = p.parentNode;
		}
	}

	domReadyCallback() {
		// Create the wrapping form
		this.wrapper = document.createElement('form');
		this.wrapper.addEventListener('submit', e => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.submit();
		});

		while(this.firstChild) {
			this.wrapper.appendChild(this.firstChild);
		}

		this.appendChild(this.wrapper);

		// Create the hidden form that will actually be submitted
		this.form = document.createElement('form');
		this.form.style.display = 'none';
		this.form.method = this.method || 'POST';
		this.form.action = this.action || document.location.toString();
		this.form.enctype = this.enctype || 'application/x-www-form-urlencoded';

		var i = document.createElement('input');
		i.setAttribute('type', 'hidden');
		i.setAttribute('name', 'data');
		this.form.appendChild(i);

		this.appendChild(this.form);
	};

	get method() {
		return this.getAttribute('method') || 'POST';
	}

	get action() {
		return this.getAttribute('action') || document.location.toString();
	}

	get enctype() {
		return this.getAttribute('enctype');
	}

	get debug() {
		return this.hasAttribute('debug');
	}

	get pageState() {
		return this.toData();
	}

	set pageState(state) {
		this.fromData(state);
	}

	// Custom submit function
	submit() {
		const data = this.toData();
		let files = [];
		getFilesFromData(data, files);

		if(this.debug) {
			console.log('data=', data, 'files=', files);
		} else {
			// Look through the form for files
			this.form.elements[0].value = JSON.stringify(data);
			this.form.files = files;
			var event = new CustomEvent('submit', { bubbles: true, cancelable: true });
			if(this.form.dispatchEvent(event)) {
				this.form.submit();
			}
		}
	}
}

ce.define('mara-form', MaraForm);

function getFilesFromData(data, result) {
	if(data && data.data instanceof window.File) {
		result.push({
			id: data.id,
			file: data.data
		});
		delete data.data;
	} else if(Array.isArray(data)) {
		data.forEach(sub => getFilesFromData(sub, result));
	} else if(data && typeof data === 'object') {
		Object.keys(data).forEach(key => getFilesFromData(data[key], result));
	}
}
