/* globals module, define, sessionStorage */

(function(){

	function init() {
		return function(uri) {

			//

		}
	}

	if (typeof(module) !== 'undefined') {
		module.exports = init();
	} else if (typeof(define) !== 'undefined') {
		define('session-synch', [
		], init);
	}

})();
