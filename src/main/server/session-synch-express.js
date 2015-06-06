/* globals require, module */

var _ = require('underscore');
var swarm = require('swarm');
var Promise = require('promise');

module.exports = function(session) {
	var Store = session.Store;

	var registry = {
	};

	function getSession(sessionId) {
		return new Promise(function(resolve, reject) {

			var host = registry[sessionId];

			if (!host) {
				var storage = config.storage || new swarm.FileStorage('storage');
				host = registry[sessionId] = new swarm.Host(sessionId, 0, storage);
			}

			var session = new Session(sessionId, host);
			session.on('init', function() {
				resolve(callback(session));
			});

		});
	}

	/**
	 * Initialize SwarmStore with the given `options`
	 *
	 * @param {Object} options (optional)
	 *
	 * @api public
	 */
	function SwarmStore(options) {
		var self = this;

		options = options || {};
		Store.call(self, options);

		self.options = _.defaults(options, {
			//
		});

		// Create host?
	}

	/**
	 * Inherit from Store
	 */
	SwarmStore.prototype.__proto__ = Store.prototype;

	/**
	 * Attempts to fetch session from a session file by the given `sessionId`
	 *
	 * @param  {String}   sessionId
	 * @param  {Function} callback
	 *
	 * @api public
	 */
	SwarmStore.prototype.get = function (sessionId, callback) {
		return getSession(sessionId)
			.then(callback, callback);
	};

	/**
	 * Attempts to commit the given session associated with the given `sessionId` to a session file
	 *
	 * @param {String}   sessionId
	 * @param {Object}   session
	 * @param {Function} callback (optional)
	 *
	 * @api public
	 */
	SwarmStore.prototype.set = function (sessionId, session, callback) {
		return getSession(sessionId).then(function(swarm_session) {
			return new Promise(function(resolve, reject) {
				swarm_session.set(session, resolve);
			});
		}).then(callback, callback);
	};

	/**
	 * Attempts to unlink a given session by its id
	 *
	 * @param  {String}   sessionId   Files are serialized to disk by their
	 *                                sessionId
	 * @param  {Function} callback
	 *
	 * @api public
	 */
	SwarmStore.prototype.destroy = function (sessionId, callback) {
		return getSession(sessionId).then(function(swarm_session) {
			return new Promise(function(resolve, reject) {
				swarm_session.destroy(resolve);
			});
		}).then(function() {
			return new Promise(function(resolve, reject) {
				var host = registry[sessionId];
				delete registry[sessionId];
				host.stop(resolve);
			});
		}).then(callback, callback);
	};

	/**
	 * Attempts to fetch number of the session files
	 *
	 * @param  {Function} callback
	 *
	 * @api public
	 */
	SwarmStore.prototype.length = function (callback) {
		return Promise.resolve(_.keys(registry).length)
			.then(callback, callback);
	};

	/**
	 * Attempts to clear out all of the existing session files
	 *
	 * @param  {Function} callback
	 *
	 * @api public
	 */
	SwarmStore.prototype.clear = function (callback) {

		var promises = _.collect(registry, function(host, sessionId) {
			return new Promise(function(resolve, reject) {
				host.clear();
				delete registry[sessionId];
				resolve(sessionId);
			});
		});

		return Promise.all(promises)
			.then(callback, callback);

	};

	/**
	 * Attempts to find all of the session files
	 *
	 * @param  {Function} callback
	 *
	 * @api public
	 */
	SwarmStore.prototype.list = function (callback) {
		return Promise.resolve(_.values(registry))
			.then(callback, callback);
	};

	/**
	 * Attempts to detect whether a session file is already expired or not
	 *
	 * @param  {String}   sessionId
	 * @param  {Function} callback
	 *
	 * @api public
	 */
	SwarmStore.prototype.expired = function (sessionId, callback) {
		return getSession(sessionId).then(function(session) {
			return Promise.resolve(session.expired);
		}).then(callback, callback);
	};

	return SwarmStore;

};
