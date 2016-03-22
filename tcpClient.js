#!/usr/bin/node --harmony
"use strict"

const 
	net = require('net'),
	fs = require('fs'),
	parser = require('cheerio'),
	// events = require('events'),
	// util = require('util'),
	client = net.connect({
		host: '129.10.113.143',
		port: 80
		});

client.on('data', function(data) {
	'use strict';
	// message is the entire html response
	let message = data.toString(),
		/* expect
			HTTP/1.1 200 OK
 			Date: Tue, 22 Mar 2016 08:59:03 GMT
 			Server: Apache/2.2.22 (Ubuntu)
 			Vary: Accept-Language,Accept-Encoding
 			Content-Language: en-us
 			Content-Length: 528
 			Content-Type: text/html; charset=utf-8
		*/
		lines = message.split("\r\n"),

		// this is the response code
		response = lines[0];
		// split again to get the status 
		let codeStatus = response.split(" "),
		// code is one of : 200, 201, 202, 203 etc
		code = codeStatus[1],
		// status is one of : OK, 
		status = codeStatus[2];
		console.log(code +" <- code : status ->" + status);
});

//list for error
client.on('err', function(err) {
	'use strict';
	console.log("\n\n\terr");
});

//listen for close/end
client.on('end', function() {
	'use strict';
	clearTimeout(timer);
	console.log("\n\n\nend");
});



/*
 connection.write('GET / HTTP/1.1');
 connection.write('User-Agent: seanco');
 connection.write('Host: fring.ccs.neu.edu');
 connection.write('Accept: *');
*/

// GET /path/to/file/index.html HTTP/1.0
var home = "/";
 client.write('GET '+ home+' HTTP/1.1\r\n');
 client.write('UserAgent: seanco\r\n');
 client.write('Host: fring.ccs.neu.edu\r\n');
 client.write('Accept: */*\r\n\r\n');

// time out after a second
let timer = setTimeout (function () {
		client.end();
	}, 1000);

/* expect
 HTTP/1.1 200 OK
 Date: Tue, 22 Mar 2016 08:59:03 GMT
 Server: Apache/2.2.22 (Ubuntu)
 Vary: Accept-Language,Accept-Encoding
 Content-Language: en-us
 Content-Length: 528
 Content-Type: text/html; charset=utf-8
*/

/* message body, scan for a ref and token 
    <html><head><title>CS 4700 / 5700 Test Site Directory</title></head><body>
    <h1>CS 4700 / 5700 Test Site Directory</h1>
    <h2>List of available sites:</h2>
    <ul><li><a href="/fakebook/">Fakebook</a></li>
    </ul>
    <h6>All sites run by the <a href="http://www.ccs.neu.edu/home/choffnes/">David Choffnes</a> at
    <a href="http://www.northeastern.edu">NEU</a>. They are meant for education purposes only.
    For questions, contact <a href="mailto:choffnes@ccs.neu.edu">David Choffnes</a></h6>
*/


