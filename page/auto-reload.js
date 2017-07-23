'use strict';

import ce from '../ce';
import nav from './nav';

ce.define('mara-auto-reload', function(def) {
	def.attachedCallback = function() {
		this.focusInListener = this.focusInListener.bind(this);
		window.addEventListener('focus', this.focusInListener);

		this.focusOutListener = this.focusOutListener.bind(this);
		window.addEventListener('blur', this.focusOutListener);

		let page = this.closest('ml-page');
		if(page) {
			this.url = page.getAttribute('url');
		}
	};

	def.detachedCallback = function() {
		window.removeEventListener('focus', this.focusInListener);
		window.removeEventListener('blur', this.focusOutListener);
		clearTimeout(this.timeout);
	};

	def.markForReload = function() {
		this.shouldReloadNextFocus = true;
		console.log('should reload');
	};

	def.focusOutListener = function() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}

		var timeout = this.getAttribute('in');
		this.timeout = setTimeout(this.markForReload.bind(this), (parseInt(timeout) || 10) * 60 * 1000);
	};

	def.focusInListener = function() {
		if(this.timeout) {
			clearTimeout(this.timeout);
		}

		if(this.shouldReloadNextFocus) {
			console.log('reloading');
			nav.reload(this.url);
		}
	};
});
