'use strict';

import ce from '../ce';
import api from './api';

ce.define('mara-form-section', class Section extends ce.HTMLCustomElement.with(api.FormSection, api.FormInput) {
	get name() {
		return this.getAttribute('name');
	}
});
