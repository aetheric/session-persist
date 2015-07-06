/* globals module, define, sessionStorage */

var _ = require('underscore');
var WebSocket = require('ws');
var diff = require('deep-diff');
var proto = require('protobufjs');

var json = require('../proto/update.proto.json');

var Update = proto.loadJson(json).build('Update');

(function(root){

	function init() {
		return function(window) {
			var self = this;

			var root = window || root;

			self.session = root.sessionStorage;
			self.previous = {};

			self.socket = new WebSocket(root.location.replace('^http', 'ws'));

			self.socket.on('message', function(message) {

				// Decode the incoming message.
				var change = Update.decode64(message).toRaw();

				// Apply the received changes to the session storage.
				diff.applyChange(self.session, true, change);

				// Reset previous to avoid cyclical updates.
				self.previous = _.clone(self.session);

			});

			self.session.on('storage', function() {

				// Calculate changes.
				var changes = diff.diff(self.previous, self.session, function(path, key) {

					var chain = [].concat(path, key);

					function reducer(memo, item) {
						return memo && memo[item];
					}

					var value = _.reduce(chain, reducer, self.session)
							|| _.reduce(chain, reducer, self.previous);

					return _.isFunction(value);

				});

				if (_.isEmpty(changes)) {
					return;
				}

				_.each(changes, function(change) {

					// Encode the change into a protocol buffer.
					var payload = new Update(change).encode().toBase64();

					// Send it down the socket.
					self.socket.send(payload);

				});

				self.previous = _.clone(self.session);

			});

		}
	}

	if (typeof(module) !== 'undefined') {
		module.exports = init();
	} else if (typeof(define) !== 'undefined') {
		define('session-synch', [
		], init);
	}

})(this);
