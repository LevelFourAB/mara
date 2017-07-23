'use strict';

import maintainHidden from 'ally.js/maintain/hidden';
import maintainDisabled from 'ally.js/maintain/disabled';

let overlay;
let overlayClick;

let hidden;
let disabled;

let active = [];

let highestZ = 0;

function recreate() {
	if(hidden) hidden.disengage();
	if(disabled) disabled.disengage();

	const top = active[active.length - 1];

	if(top) {
		document.documentElement.classList.add('mara-no-scroll');

		const elements = active.map(item => item.element);
		hidden = maintainHidden({
			filter: top.element
		});

		disabled = maintainDisabled({
			filter: top.element
		});

		highestZ = 0;
		active.forEach((item, idx) => {
			highestZ = Math.max(highestZ, item.zIndex + 1);
		});
	} else {
		document.documentElement.classList.remove('mara-no-scroll');
	}
}

function hideActive() {
	const item = active[active.length - 1];
	if(! item) return;

	if(item.options.onOverlayClick) {
		item.options.onOverlayClick();
	}
}

export default {
	show: function(self, options) {
		if(typeof options === 'function') {
			options = {
				onOverlayClick: options
			};
		}

		if(! options) {
			options = {};
		}

		const overlay = document.createElement('div');
		overlay.className = 'mara-page-overlay ' + (options.className || '');
		overlay.addEventListener('click', hideActive);

		let closest = self.closest('[data-mara-stack]') || document.body;
		closest.append(overlay);

		if(highestZ === 0) {
			// Figure out the Z that the main overlay has
			const style = getComputedStyle(overlay);
			const z = style.zIndex;
			if(z !== 'auto') {
				highestZ = Number(z);
			}
		}

		const localZ = highestZ + 1;
		overlay.style.zIndex = localZ;
		self.style.zIndex = localZ + 1;
		self.setAttribute('data-mara-stack', 'true');

		active.push({
			element: self,
			options: options,
			overlay: overlay,
			zIndex: localZ
		});
		recreate();
	},

	hide: function(self) {
		for(let i=0; i<active.length; i++) {
			const item = active[i];
			if(item.element == self) {
				active.splice(i, 1);
				item.overlay.remove();
				item.element.removeAttribute('data-mara-stack');
				break;
			}
		}

		recreate();
	}
};
