/* globals module, define, sessionStorage */

var sync = require('../proto/update.proto.js');

var Update = sync.build('Update');

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
