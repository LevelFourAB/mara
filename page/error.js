'use strict';

import nav from './nav';
import { HTMLCustomElement, define } from '../ce';

class PageLoadError extends HTMLCustomElement {
	createdCallback() {
		super.createdCallback();

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
	}

	connectedCallback() {
		document.addEventListener('navigateStarted', this.navigateStarted);
		document.addEventListener('navigateError', this.navigateError);
	}

	disconnectedCallback() {
		document.removeEventListener('navigateStarted', this.navigateStarted);
		document.removeEventListener('navigateError', this.navigateError);
	}

	navigateStarted() {
		this.classList.remove('active');
	}

	navigateError() {
		this.classList.add('active');
	}
}

define('mara-page-load-error', PageLoadError);
