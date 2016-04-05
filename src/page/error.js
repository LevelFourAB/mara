'use strict';

import nav from './nav';
import ce from '../ce';

ce.define('mara-page-load-error', function(def) {
	def.createdCallback = function() {
		this.navigateStarted = this.navigateStarted.bind(this);
		this.navigateError = this.navigateError.bind(this);

		this.delegateEventListener('click', 'button[extended-type]', function(e) {
			e.preventDefault();
			switch(this.getAttribute('extended-type')) {
				case 'reload':
					document.location.reload(true);
					break;
				case 'try-again':
					nav.reload();
					break;
			}
		});
	};

	def.attachedCallback = function() {
		document.addEventListener('navigateStarted', this.navigateStarted);
		document.addEventListener('navigateError', this.navigateError);
	};

	def.detachedCallback = function() {
		document.removeEventListener('navigateStarted', this.navigateStarted);
		document.removeEventListener('navigateError', this.navigateError);
	};

	def.navigateStarted = function() {
		this.classList.remove('active');
	};

	def.navigateError = function(e) {
		this.classList.add('active');
	};
});
