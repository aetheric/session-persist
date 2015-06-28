/* globals require, describe, beforeEach, it, window */

var expect = require('chai').expect;
var WebSocket = require('ws');
var sinon = require('sinon');

var Client = require('../../main/client/session-synch-client');
var Update = require('../../main/proto/update.proto.js');

describe('The session sync client', function() {

	var client;
	var server;
	var browser;

	beforeEach(function() {

		var server;
		for (var port = 8000; port < 10000; port++) {
			try {
				server = new WebSocket.Server({
					port: port
				});
				break;
			} catch(error) {
				console.log(error);
			}
		}

		if (!server) {
			throw new Error('Unable to start server.');
		}

		browser = {

			location: 'http://localhost:' + port + '/',

			sessionStorage: {
				blah: 'argh'
			},

			on: sinon.spy()

		};

		client = new Client(browser);

	});

	it('should connect as soon as initialised', function(done) {
		client.socket.on('open', done);
	});

	it('should alter the session on receipt of websocket messages.', function(done) {

		expect(browser.sessionStorage.blah).to.equal('argh');

		function monitor() {
			if (browser.sessionStorage.blah === 'flargle') {
				done();
			} else {
				process.nextTick(monitor);
			}
		}

		process.nextTick(monitor);

		var changes = [
			{
				type: 'A',
				path: [ 'blah' ],
				value: 'flargle'
			}
		];

		server.on('open', function(socket) {
			socket.emit(new Update(changes).encode().toBase64());
		});

	});

	it('should send a websocket message on change of the session.', function(done) {

		server.on('message', function(message) {
			expect(message).to.be.ok;
			var changes = new Update().decode64(message).toRaw();
			expect(changes).to.be.ok;
			expect(changes).to.not.be.empty;
			done();
		});

		window.sessionStorage.blah = 'flargle';

	});

});
