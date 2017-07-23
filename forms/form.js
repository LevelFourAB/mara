'use strict';

import chain from '../util/chain';
import ce from '../ce';
import api from './api';
import delegate from '../events/delegate';
import ally from 'ally.js';
import Sortable from 'sortablejs';

let fileId = 0;

ce.define('mara-form', function(el) {
	el.attachedCallback = function() {
		let p = this.parentNode;
		while(p) {
			if(p.hasPageState) {
				p.addPageState(this);
				break;
			}

			p = p.parentNode;
		}
	};

	el.domReadyCallback = function() {
		// Create the wrapping form
		this.wrapper = document.createElement('form');
		this.wrapper.addEventListener('submit', e => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.submit();
		});

		while(this.firstChild) {
			this.wrapper.appendChild(this.firstChild);
		}

		this.appendChild(this.wrapper);

		// Create the hidden form that will actually be submitted
		this.form = document.createElement('form');
		this.form.style.display = 'none';
		this.form.method = this.method || 'POST';
		this.form.action = this.action || document.location.toString();
		this.form.enctype = this.enctype || 'application/x-www-form-urlencoded';

		var i = document.createElement('input');
		i.setAttribute('type', 'hidden');
		i.setAttribute('name', 'data');
		this.form.appendChild(i);

		this.appendChild(this.form);
	};

	el.defineAttribute('method', function(oldValue, newValue) {
		this.form.method = newValue || 'POST';
	});

	el.defineAttribute('action', function(oldValue, newValue) {
		this.form.action = newValue || document.location.toString();
	});

	el.defineAttribute('enctype', function(oldValue, newValue) {
		this.form.enctype = newValue;
	});

	el.withAttributes('debug');

	api.section(el);

	// Setup page state
	el.getPageState = el.toData;
	el.setPageState = el.fromData;

	// Custom submit function
	el.submit = function() {
		var data = this.toData();
		let files = [];
		getFilesFromData(data, files);

		if(this.debug) {
			console.log('data=', data, 'files=', files);
		} else {
			// Look through the form for files
			this.form.elements[0].value = JSON.stringify(data);
			this.form.files = files;
			var event = new CustomEvent('submit', { bubbles: true, cancelable: true });
			if(this.form.dispatchEvent(event)) {
				this.form.submit();
			}
		}
	};
});

function getFilesFromData(data, result) {
	if(data && data.data instanceof window.File) {
		result.push({
			id: data.id,
			file: data.data
		});
		delete data.data;
	} else if(Array.isArray(data)) {
		data.forEach(sub => getFilesFromData(sub, result));
	} else if(data && typeof data === 'object') {
		Object.keys(data).forEach(key => getFilesFromData(data[key], result));
	}
}

ce.define('mara-form-repeated-section', function(def) {
	def.createdCallback = function() {
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
	};

	def.domReadyCallback = function() {
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

	def.withAttributes('name');

	api.section(def);
	api.input(def);

	def.addInput = function(input) {
		for(var key in this.templates) {
			if(this.templates[key] == input) return;
		}

		this.inputs.push(input);
	};

	def.addSection = function(template='') {
		if(! template) {
			template = 'default';
		}
		var section = this.templates[template].cloneNode(true);
		this.insertBefore(section, this.firstAfterTemplate);
		var firstInput = ally.query.firstTabbable({
			context: section
		});
		if(firstInput) {
			firstInput.focus();
		}
		return section;
	};

	def.removeSection = function(section) {
		section.parentNode.removeChild(section);
	};

	def.toData = function() {
		var result = [];
		let target = this.firstElementChild;
		while(target) {
			if(target.toData) {
				result.push(target.toData());
			}

			target = target.nextElementSibling;
		}
		return result;
	};

	def.fromData = function(data) {
		var i = 0;

		// Update existing sections and add new ones
		var child = this.firstElementChild;
		for(i=0; i<data.length; i++) {
			if(! child) {
				child = this.addSection();
			}

			child.fromData(data[i]);

			child = child.nextElementSibling;
		}

		// Remove left over sections
		while(child) {
			var e = child;
			child = child.nextElementSibling;
			e.parentNode.removeChild(e);
		}
	};
});

ce.define('mara-form-section', function(el) {
	api.section(el);
	api.input(el);

	el.withAttributes('name');
});

ce.define('mara-input', function(el) {
	el.extends('input', HTMLInputElement.prototype);

	api.input(el);

	el.withAttributes('mara-type');

	el.toData = function() {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		var value = this.value;
		switch(this.type) {
			case 'checkbox':
				if(! this.checked) {
					value = null;
				}
				break;
			case 'file':
				let files = [];
				for(let i=0; i<this.files.length; i++) {
					let file = this.files[i];
					files.push({
						id: 'file-' + (fileId++),
						name: file.name,
						size: file.size,
						type: file.type,
						data: file
					});
				}

				if(this.multiple) {
					value = files;
				} else {
					value = files[0];
				}
				break;
		}

		if(adapter) {
			return adapter.toData(value);
		}

		return value;
	};

	el.fromData = function(data) {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		var value = adapter ? adapter.fromData(data) : data;
		switch(this.type) {
			case 'checkbox':
				if(value) {
					this.checked = true;
				}
				break;
			default:
				this.value = value;
		}
	};
});

ce.define('mara-textarea', function(el) {
	el.extends('textarea', HTMLTextAreaElement.prototype);

	api.input(el);

	el.withAttributes('mara-type');

	el.toData = function() {
		var type = this.maraType || 'text';
		var adapter = api.adapterFor(type);
		if(adapter) {
			return adapter.toData(this.value);
		}

		return this.value;
	};

	el.fromData = function(data) {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		this.value = adapter ? adapter.fromData(data) : data;
	};
});

ce.define('mara-select', function(el) {
	el.extends('select', HTMLSelectElement.prototype);

	api.input(el);

	el.withAttributes('mara-type');

	el.toData = function() {
		var type = this.maraType || 'text';
		var adapter = api.adapterFor(type);
		if(adapter) {
			return adapter.toData(this.value);
		}

		return this.value;
	};

	el.fromData = function(data) {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		this.value = adapter ? adapter.fromData(data) : data;
		// TODO: Does this actually work?
	};
});

ce.define('mara-radio-group', function(el) {
	el.createdCallback = function() {

	};

	api.input(el);

	el.defineAttribute('value', function(oldValue, newValue) {
		// TODO: Do we need to update this as well?
	});

	el.defineProperty('value', {
		get: function() {
			var input = this.querySelector('input[type=radio]:checked');
			return input ? input.value : null;
		},

		set: function(v) {
			this.querySelectorAll('input[type=radio]').forEach(function(input) {
				input.checked = input.value === v;
			});
		}
	});

	el.withAttributes('mara-type', 'name');

	el.toData = function() {
		var type = this.maraType || 'text';
		var adapter = api.adapterFor(type);
		if(adapter) {
			return adapter.toData(this.value);
		}

		return this.value;
	};

	el.fromData = function(data) {
		var type = this.maraType || this.type;
		var adapter = api.adapterFor(type);
		this.value = adapter ? adapter.fromData(data) : data;
	};
});
