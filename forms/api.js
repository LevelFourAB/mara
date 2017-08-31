'use strict';

import ce from '../ce';

let empty = function(value) { return value; };

let types = {};
let addType = function(name, toData, fromData) {
	types[name] = {
		toData: toData,
		fromData: fromData || empty
	};
};

let adapterFor = function(type) {
	return types[type];
};

addType('number', parseInt);
addType('range', parseInt);
addType('boolean', function(value) { return "true" == value; });

function traverse(root, onInput) {
	const children = root.children;
	for(let i=0, n=children.length; i<n; i++) {
		const child = children[i];
		if(child instanceof FormInput) {
			onInput(child);

			continue;
		} else if(child instanceof HTMLElement) {
			switch(child.nodeName) {
				case 'INPUT':
				case 'TEXTAREA':
				case 'SELECT':
					onInput(child);
					continue;
			}
		}

		if(child instanceof Element) {
			// Descend into all elements
			traverse(child, onInput);
		}
	}
}

const FormSection = ce.Mixin(superclass => class extends superclass {
	init() {
		super.init();
	}

	toData() {
		const result = {};
		traverse(this.sectionInputRoot || this, input => {
			if(input instanceof FormInput) {
				result[input.name] = input.toData();
			} else {
				const type = input.getAttribute('mara-type') || input.getAttribute('data-mara-type') || input.type;
				const adapter = adapterFor(type);
				let value = input.value;
				switch(input.type) {
					case 'checkbox':
						if(! input.checked) {
							value = null;
						}
						break;
					case 'file':
						let files = [];
						for(let i=0; i<input.files.length; i++) {
							let file = input.files[i];
							files.push({
								id: 'file-' + (fileId++),
								name: file.name,
								size: file.size,
								type: file.type,
								data: file
							});
						}

						if(input.multiple) {
							value = files;
						} else {
							value = files[0];
						}
						break;
				}

				if(adapter) {
					value = adapter.toData(value);
				}

				result[input.name] = value;
			}
		});
		return result;
	}

	fromData(data) {
		traverse(this.sectionInputRoot || this, input => {
			const name = input.name;
			if(input instanceof FormInput) {
				input.fromData(data[name]);
			} else {
				const type = input.getAttribute('mara-type') || input.getAttribute('data-mara-type') || input.type;
				const adapter = adapterFor(type);
				const value = adapter ? adapter.fromData(data) : data;
				switch(input.type) {
					case 'checkbox':
						if(value) {
							input.checked = true;
						}
						break;
					default:
						input.value = value;
				}
			}
		});
	}
});

let markAsChanged = function() {
	this.classList.add('mara-changed');
};

const FormInput = ce.Mixin(superclass => class extends superclass {
	init() {
		super.init();

		this.addEventListener('blur', markAsChanged);
		this.addEventListener('keypress', markAsChanged);
		this.addEventListener('change', markAsChanged);
	}
});

export default {
	FormInput,
	FormSection,
	adapterFor: adapterFor,
	addType: addType
};
