/* globals require, describe, beforeEach, afterEach, it, window */

var expect = require('chai').expect;
var WebSocket = require('ws');
var sinon = require('sinon');
var async = require('async');
var proto = require('protobufjs');

var Update_json = require('../../main/proto/update.proto.json');
var Client = require('../../main/client/session-synch-client');

var Update = proto.loadJson(Update_json).build('Update');

describe('The session sync client', function() {

	var client;
	var server;
	var browser;

	beforeEach(function() {

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

		server.on('connect', function(socket) {
			console.log('Server receieved socket connection');
		});

		server.on('message', function(message, flags) {
			console.log('Server received messsge: ' + message);
		});

		browser = {

			location: 'http://localhost:' + port + '/',

			sessionStorage: {
				blah: 'argh'
			},

			on: sinon.spy()

		};

		client = new Client(browser);

		client.socket.on('open', function() {
			console.log('Client opened socket.');
		});

		client.socket.on('message', function(message, flags) {
			console.log('Client received message: ' + message);
		});

	});

	afterEach(function() {

		server && server.close();

	});

	it('should connect as soon as initialised', function(done) {
		client.socket.on('open', done);
	});

	it('should alter the session on receipt of websocket messages.', function(done) {

		expect(browser.sessionStorage.blah).to.equal('argh');

		var scanning = true;

		async.whilst(function() {
			return scanning;
		}, function monitor() {
			if (browser.sessionStorage.blah === 'flargle') {
				console.log('blah = flargle');
				done();
			}
		});

		var changes = new Update({
			kind: 'A',
			path: [ 'blah' ],
			item: 'flargle'
		}).encode().toBase64();

		server.on('connection', function(socket) {
			console.log('Sending update down websocket');
			socket.send(changes);
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

		browser.sessionStorage.blah = 'flargle';

	});

});
