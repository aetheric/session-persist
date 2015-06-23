/* globals module, define, sessionStorage */

var sync = require('../proto/sync.proto.js');

var Sync = sync.build('sync');

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
