import { Mixin } from './ce';

import { ShadowDOM } from './shadow-dom';

const templates = new Map();
function resolveTemplate(self) {
	const name = self.localName;
	let template = templates.get(name);
	if(template) return template;

	template = document.createElement('template');
	template.innerHTML = self.constructor.templateHTML;
	templates.set(name, template);
	return template;
}

export const Template = Mixin(SuperClass => class extends SuperClass.with(ShadowDOM) {
	static get templateHTML() {
		return '';
	}

	createdCallback() {
		super.createdCallback();

		const template = resolveTemplate(this);
		const instance = template.content.cloneNode(true);
		this.shadowRoot.appendChild(instance);
	}
});
