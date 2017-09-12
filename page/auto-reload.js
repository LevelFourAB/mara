'use strict';

import { HTMLCustomElement, define } from '../ce';
import nav from './nav';

export class AutoReload extends HTMLCustomElement {
	createdCallback() {
		super.createdCallback();

		this.focusInListener = this.focusInListener.bind(this);
		this.focusOutListener = this.focusOutListener.bind(this);
		this.markForReload = this.markForReload.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();

		window.addEventListener('focus', this.focusInListener);
		window.addEventListener('blur', this.focusOutListener);

		let page = this.closest('mara-page');
		if(page) {
			this.url = page.getAttribute('url');
		} else {
			this.url = document.location.toString();
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		window.removeEventListener('focus', this.focusInListener);
		window.removeEventListener('blur', this.focusOutListener);
		clearTimeout(this.timeout);
	}

	markForReload() {
		this.shouldReloadNextFocus = true;
	}

	focusOutListener() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}

		var timeout = this.getAttribute('in');
		this.timeout = setTimeout(this.markForReload, (parseInt(timeout) || 10) * 60 * 1000);
	}

	focusInListener() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}

		if(this.shouldReloadNextFocus) {
			nav.reload(this.url);
		}
	}
}

define('mara-auto-reload', AutoReload);
