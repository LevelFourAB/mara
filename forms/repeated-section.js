'use strict';

import { HTMLCustomElement, DOMReady, define } from '../ce';
import { FormSection } from './api';
import delegate from '../events/delegate';

export class RepeatedSection extends HTMLCustomElement.with(FormSection, DOMReady) {
	createdCallback() {
		super.createdCallback();

		this.templates = {};

		delegate(this, 'click', 'button[extended-type]', function(e, t) {
			e.preventDefault();
			e.stopImmediatePropagation();

			let btn = e.target.closest('[extended-type]');
			let type = btn.getAttribute('extended-type');
			switch(type) {
				case 'add-section':
					t.addSection(btn.getAttribute('use-template'));
					break;
				case 'remove-section':
					// TODO: How do we determine the section element?
					let section = e.target.closest('mara-form-section');
					t.removeSection(section);
					break;
			}
		});
	}

	domReadyCallback() {
		super.domReadyCallback();

		let child = this.firstElementChild;
		while(child) {
			let next = child.nextElementSibling;

			if(child.hasAttribute('template')) {
				let templateId = child.getAttribute('template');
				if(! templateId) {
					this.templates['default'] = child;
				} else {
					this.templates[templateId] = child;
				}
				this.template = child;
				this.firstAfterTemplate = child.nextElementSibling;
				child.remove();
			}

			child = next;
		}

		if(this.getAttribute('sortable') !== undefined) {
			Sortable.create(this, {
				draggable: 'mara-form-section',
				handle: '.drag-handle'
			});
		}
	};

	get name() {
		return this.getAttribute('name');
	}

	addInput(input) {
		for(var key in this.templates) {
			if(this.templates[key] == input) return;
		}

		super.addInput(input);
	}

	addSection(template='') {
		if(! template) {
			template = 'default';
		}

		const section = this.templates[template].cloneNode(true);
		this.insertBefore(section, this.firstAfterTemplate);

		const firstInput = ally.query.firstTabbable({
			context: section
		});

		if(firstInput) {
			firstInput.focus();
		}
		return section;
	}

	removeSection(section) {
		section.parentNode.removeChild(section);
	}

	toData() {
		let result = [];
		let target = this.firstElementChild;
		while(target) {
			if(target.toData) {
				result.push(target.toData());
			}

			target = target.nextElementSibling;
		}
		return result;
	}

	fromData(data) {
		// Update existing sections and add new ones
		let child = this.firstElementChild;
		for(let i=0; i<data.length; i++) {
			if(! child) {
				child = this.addSection();
			}

			child.fromData(data[i]);

			child = child.nextElementSibling;
		}

		// Remove left over sections
		while(child) {
			let e = child;
			child = child.nextElementSibling;
			e.parentNode.removeChild(e);
		}
	}
}

define('mara-form-repeated-section', RepeatedSection);
