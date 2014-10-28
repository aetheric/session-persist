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
			return $provider = {

				$get: [
					'$sessionStorage', '$rootScope',
					function($sessionStorage, $rootScope) {
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
				}

			};
		}
	]);

});
