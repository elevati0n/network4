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
		connection.write("now watching target.txt for changes");


		let watcher = fs.watch(filename, function() { 
			connection.write("\n \n File 'target.txt changed at time : " + Date.now()); 
		});

		connection.on('close', function() {
			console.log('subscriber disconnected');
			watcher.close();
		});

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
	console.log('listening for subscribers ... ');
});