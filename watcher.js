'use strict'

const
  fs = require('fs'),
  spawn = require('child_process').spawn,
  filename = 'target.txt';

// if (!process.argv) {
// 	filename = 'target.txt'

// 	//throw Error("A file to watch must be specified!");
// } else {
// 	filename = process.argv[2];
// }

fs.watch('target.txt', function () { 

	let 
		ls = spawn('ls', ['-lh', filename]),
		output = '';
	//ls.stdout.pipe(process.stdout);
	
	ls.stdout.on('data', function(chunk) {
		output += chunk.toString();
		
	});

	ls.on('close', function () {
		let parts = output.split(/\s+/);
		console.dir([parts[0], parts[4], parts[8]]);
	});






});


console.log("now watching for changes");


fs.readFile('target.txt', function (err, data) {
	if (err) {
		throw err;
	}
	console.log(data.toString());
	console.log(data);

});

fs.writeFile('target.txt', 'a witty message', function (err) {
	if (err) {
		throw err;
	}
	console.log("File saved!");
});



