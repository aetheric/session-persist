/* globals require, module, process */

var _ = require('underscore');
var events = require('events');
var diff = require('deep-diff');
var path = require('path');
var proto = require('protobufjs');

var Update_json = require(path.join(__dirname, '../proto/update.proto.json'));
var Update = proto.loadJson(Update_json).build('Update');

var EventEmitter = events.EventEmitter;

module.exports = function SessionSynch(websocket, model, listeners) {
	var self = this;

	var emitter = new EventEmitter();

	self.model = model || {};
	self.prev = {};
	self.update = {};
	self.on = emitter.on;

	_.each(listeners, function(listener, eventKey) {
		self.on(eventKey, listener);
	});

	function update(change) {
		var path = change.path.join('.');
		emitter.emit(path, change);
	}

	websocket.on('message', function(message) {

		// parse protocol buffer message
		var change = new Update().decode64(message).toRaw();

		// apply the received changes and avoid broadcast.
		diff.applyChange(self.model, self.prev, [ change ]);

		// publish the updates.
		update(change);

		// Reset the 'previous' item to avoid cyclical updates.
		self.prev = _.clone(self.model);

	});

	/** self-rescheduling function */
	function scan() {

		// Get the difference between this and the previous item.
		var changes = diff.performDiff(self.prev, self.model);
		if (_.isEmpty(changes)) {
			process.nextTick(scan);
			return;
		}

		// For each change detected
		_.each(changes, function (change) {

			// Create the encoded payload from the changes.
			var payload = new Update(change).encode().toBase64();

			// Send the encoded payload across the wire.
			websocket.emit(payload);

			// Emit the change locally as well.
			update(change)

		});

		// Reset the 'previous' item.
		self.prev = _.clone(self.model);

		// Reschedule for next tick.
		process.nextTick(scan);

	}

	// Start scanning.
	process.nextTick(scan);

	return self;
};
