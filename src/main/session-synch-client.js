/* globals module, define */

(function(){

	if (typeof(module) !== 'undefined') {
		module.exports = client;
	} else if (typeof(define) !== 'undefined') {
		define('session-synch', [], function() {
			return client;
		});
	}

})();
