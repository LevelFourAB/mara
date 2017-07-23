'use strict';

import ce from '../ce';
import nav from './nav';

class AutoReload extends ce.HTMLCustomElement {
	connectedCallback() {
		this.focusInListener = this.focusInListener.bind(this);
		window.addEventListener('focus', this.focusInListener);

		this.focusOutListener = this.focusOutListener.bind(this);
		window.addEventListener('blur', this.focusOutListener);

		let page = this.closest('ml-page');
		if(page) {
			this.url = page.getAttribute('url');
		}
	}

	detachedCallback() {
		window.removeEventListener('focus', this.focusInListener);
		window.removeEventListener('blur', this.focusOutListener);
		clearTimeout(this.timeout);
	}

	markForReload() {
		this.shouldReloadNextFocus = true;
		console.log('should reload');
	}

	focusOutListener() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}

		var timeout = this.getAttribute('in');
		this.timeout = setTimeout(this.markForReload.bind(this), (parseInt(timeout) || 10) * 60 * 1000);
	}

	focusInListener() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}

		if(this.shouldReloadNextFocus) {
			console.log('reloading');
			nav.reload(this.url);
		}
	}
}

ce.define('mara-auto-reload', AutoReload);
