'use strict';

import ally from 'ally.js';

let overlay;
let overlayClick;

let hidden;
let disabled;

let active = [];

function recreate() {
	if(hidden) hidden.disengage();
	if(disabled) disabled.disengage();

	if(active.length === 0) return;

	hidden = ally.maintain.hidden({
		filter: active
	});

	disabled = ally.maintain.disabled({
		filter: active
	});
}

export default {
	show: function(self, onOverlayClick) {
		if(! overlay) {
			overlay = document.createElement('div');
			overlay.setAttribute('class', 'ml-page-overlay');
			overlay.addEventListener('click', e => {
				if(overlayClick) {
					overlayClick();
				}
			});
			document.body.appendChild(overlay);
		}

		active.push(self);
		recreate();

		overlayClick = onOverlayClick;
		overlay.classList.add('active');
		document.documentElement.classList.add('ml-no-scroll');
	},

	hide: function(self) {
		overlay.classList.remove('active');
		document.documentElement.classList.remove('ml-no-scroll');

		let idx = active.indexOf(self);
		if(idx >= 0) {
			active.splice(idx);
			recreate();
		}
	}
};
