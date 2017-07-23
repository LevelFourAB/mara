'use strict';

import chain from './util/chain';

function makeExtendable(parent) {
	return class extends parent {
		constructor(self) {
			self = super(self);
			self.init();
			return self;
		}

		init() {
		}
	}
};

const define = window.customElements.define.bind(window.customElements);
const HTMLCustomElement = makeExtendable(HTMLElement);
export default {
	HTMLCustomElement,
	makeExtendable,
	define
};
