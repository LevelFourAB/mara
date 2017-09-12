'use strict';

import { HTMLCustomElement, define } from '../ce';
import { FormSection } from './api';

export class Section extends HTMLCustomElement.with(FormSection) {
	get name() {
		return this.getAttribute('name');
	}
}

define('mara-form-section', Section);
