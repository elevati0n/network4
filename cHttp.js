var net = require('net');

var sessionToken;
var csrfToken;
var visited = [];
var toVisit = [];

function request(ip, message, callback) {
  var client = new net.Socket();
  client.connect(80, ip, function() {
    client.write(message);
  });

  client.on('data', function(data) {
    callback(data.toString());
    client.end();
  })
}

function getCSRF() {
  request('129.10.113.143', 'GET http://fring.ccs.neu.edu/accounts/login/ HTTP/1.0\r\nConnection:keep-alive\r\nHost:fring.ccs.neu.edu\r\nUser-Agent: Mozilla 5.0\r\n\r\n', function(data) {
    login(data.split('\r\n\r\n')[1].match(/<input type='hidden' name='csrfmiddlewaretoken' value='(.+)'/)[1]);
  })
}

function login(csrf) {
  csrfToken = csrf;
  request('129.10.113.143', 'POST http://fring.ccs.neu.edu/accounts/login/ HTTP/1.0\r\nUser-Agent: Mozilla 5.0\r\nhost: fring.ccs.neu.edu\r\nContent-Length: 109\r\nCookie: csrftoken=' + csrf +  '\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\nusername=001933678&password=UGEWRSIS&csrfmiddlewaretoken=' + csrf + '&next=%2Ffakebook%2F', function(data) {
    homepage(data.match(/Set-Cookie: sessionid=(.+)\; expires/)[1], csrf);
  })
}

function homepage(session, csrf) {
  sessionToken = session;
  request('129.10.113.143', 'GET http://fring.ccs.neu.edu/fakebook/ HTTP/1.0\r\nConnection:keep-alive\r\nHost:fring.ccs.neu.edu\r\nUser-Agent: Mozilla 5.0\r\nCookie: csrftoken=' + csrf + '; sessionid=' + session + '\r\n\r\n', function(data) {
    extractUrls(data);
    visitNext();
  })
}

function extractUrls(html, link) {
  var links = html.match(/<a href=\"([^\"]*?)\">/gi);
  if (!links) return;
  for (var i = 0; i < links.length; i++) {
    var match = links[i].match(/<a href="\/fakebook\/(.+)\/">/);
    if (match && match[1])  {
      var link = match[1];
      // console.log(link);
      toVisit.push(link);
    }
  }

  var keyMatch = html.match(/<h2 class='secret_flag' style="color:red">FLAG: ([^<]*)/);
  if (keyMatch && keyMatch[1]) console.log(keyMatch[1] + ' - ' + link);
}


function visitNext() {
  if (toVisit.length === 0) return;
  var link = toVisit.shift();
  if (visited.indexOf(link) > -1) return;
  visit(link);
}

function visit(link) {
  // console.log(toVisit.length);
  request('129.10.113.143', 'GET http://fring.ccs.neu.edu/fakebook/' + link + '/ HTTP/1.0\r\nConnection:keep-alive\r\nHost:fring.ccs.neu.edu\r\nUser-Agent: Mozilla 5.0\r\nCookie: csrftoken=' + csrfToken + '; sessionid=' + sessionToken + '\r\n\r\n', function(data) {
    //console.log(data.toString());
    extractUrls(data, link);
    // console.log('http://fring.ccs.neu.edu/fakebook/' + link);
    // console.log(data);
    visitNext();
  })
}

getCSRF();
