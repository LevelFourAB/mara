import { Mixin } from './api';
import { ShadowDOM } from './shadow-dom';

/*
 * Cache and resolution of templates based on the element name.
 */
const templates = new Map();
function resolveTemplate(self) {
	const name = self.localName;
	let template = templates.get(name);
	if(template) return template;

	template = document.createElement('template');
	template.innerHTML = self.constructor.templateHTML;
	templates.set(name, template);

	if(window.ShadyCSS) {
		window.ShadyCSS.prepareTemplate(template, name);
	}
	return template;
}

/**
 * Mixin that create a template by calling the static function `templateHTML`.
 * The template is applied to the shadow root whenever an element is created.
 */
export const Template = Mixin(SuperClass => class extends SuperClass.with(ShadowDOM) {
	static get templateHTML() {
		return '';
	}

	createdCallback() {
		super.createdCallback();

		const template = resolveTemplate(this);
		const instance = template.content.cloneNode(true);
		this.shadowRoot.appendChild(instance);

		if(window.ShadyCSS) {
			window.ShadyCSS.styleElement(this);
		}
	}
});
