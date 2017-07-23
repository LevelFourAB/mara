'use strict';

export default function(func) {
	if(/complete|loaded|interactive/.test(document.readyState) && document.body) {
		func();
	} else {
		document.addEventListener('DOMContentLoaded', func, false);
	}
}
