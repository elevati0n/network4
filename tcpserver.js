#!/usr/bin/node
'use strict';

const 
	net = require('net'),
	fs = require('fs'),
	spawn = require('child_process').spawn,
	filename = 'target.txt',
	server = net.createServer (
		function (connection) {
		// use connection object for data transfer
		console.log('subscriber connected');
		let echo = spawn('cat', ["homepage"]),
			echooutput;

		echo.stdout.on('data', function(chunk) { 
			echooutput += chunk.toString();
		});

		echo.stdout.on('close', function () {
			//let parts = output.split(/\s+/);
			connection.write(echooutput);
		});
	});

server.listen(54322, function() {
	console.log('web crawler test harness listening on 54322');
});