'use strict';

/**
 * Call the given function with the this argument as the first argument.
 */
export default function(func) {
	return function() {
		Array.prototype.unshift.call(arguments, this);
		func.apply(this, arguments);
	};
}
