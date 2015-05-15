'use strict';

export default function(f1, f2) {
	if(! f1) return f2;

	return function() {
		f1.apply(this, arguments);
		f2.apply(this, arguments);
	};
}
