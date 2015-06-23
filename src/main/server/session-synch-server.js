/* globals require, module, process */

var _ = require('underscore');
var events = require('events');
var diff = require('deep-diff');

var update = require('../proto/update.proto.js');

var EventEmitter = events.EventEmitter;
var performDiff = diff.diff;
var applyChange = diff.applyChange;

var Update = update.build('Update');

module.exports = function SessionSynch(websocket, model) {
	var self = this;

	var emitter = new EventEmitter();

	self.model = model || {};
	self.prev = {};
	self.update = {};
	self.scan = true;
	self.$on = emitter.on;

	function update(changes) {
		self.prev = _.clone(self.model);
		_.each(changes, function(change) {
			var path = change.path.join('.');
			emitter.emit(path, change);
		});
	}

	websocket.on('message', function(message) {

		// parse protocol buffer message
		var changes = new Update().decode64(message).toRaw();

		// apply the received changes and avoid broadcast.
		applyChange(self.model, self.prev, changes);

		// publish the updates.
		update(changes);

	});

	/** self-rescheduling function */
	function scan() {

		var changes = performDiff(self.prev, self.model);
		if (changes && changes.length) {

			// Create the encoded payload from the changes.
			var payload = new Update(changes).encode().toBase64();

			// Send the encoded payload across the wire.
			websocket.emit(payload);

			// Publish the updates.
			update(changes);

		}

		// Reschedule for next tick.
		process.nextTick(scan);

	}

	// Start scanning.
	process.nextTick(scan);

	return self;
};
