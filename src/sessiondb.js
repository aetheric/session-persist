define([
	'angular',
	'angular-storage',
	'angular-websocket'
], function(angular) {

	angular.module('sessiondb', [
		'ngStorage'
	]);

	angular.module('sessiondb').provider('sessiondb', [
		function() {

			var config = {
				socket: 'http://localhost/socket'
			};

			var connection;

			return $provider = {

				$get: [
					'$rootScope', '$sessionStorage', '$ngSocket',
					function($rootScope, $sessionStorage, $ngSocket) {
					
						//

						return $service = {

							send: function(code) {
							},

							receive: function(code, callback) {
							}

						};
					}
				],

				inbound: function(code) {
				},

				outbound: function(code) {
				},

				config: function(newConfig) {
					config = _.defaults(newConfig, config);
				}

			};
		}
	]);

});
