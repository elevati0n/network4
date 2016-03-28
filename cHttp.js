var net = require('net');

var Crawler = function() {
  this.visited = [];
  this.toVisit = [];
  this.keys = [];
  this.sessionToken;
  this.csrfToken;

  this.getCSRF();
}

Crawler.prototype.getCSRF = function() {
  request('129.10.113.143', 'GET http://fring.ccs.neu.edu/accounts/login/ HTTP/1.0\r\nConnection:keep-alive\r\nHost:fring.ccs.neu.edu\r\nUser-Agent: Mozilla 5.0\r\n\r\n', function(data) {
    key = data.split('\r\n\r\n')[1].match(/<input type='hidden' name='csrfmiddlewaretoken' value='(.+)'/);
    if (key[1]) {
      console.log('Got key');
      this.login(key[1]);
    } else {
      this.getCSRF();
    }
  }.bind(this));
}

Crawler.prototype.login = function(csrf) {
  this.csrfToken = csrf;
  request('129.10.113.143', 'POST http://fring.ccs.neu.edu/accounts/login/ HTTP/1.0\r\nUser-Agent: Mozilla 5.0\r\nhost: fring.ccs.neu.edu\r\nContent-Length: 109\r\nCookie: csrftoken=' + csrf +  '\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\nusername=001933678&password=UGEWRSIS&csrfmiddlewaretoken=' + csrf + '&next=%2Ffakebook%2F', function(data) {
    console.log('logged in');
    this.homepage(data.match(/Set-Cookie: sessionid=(.+)\; expires/)[1], csrf);
  }.bind(this));
}

Crawler.prototype.homepage = function(session, csrf) {
  this.sessionToken = session;
  request('129.10.113.143', 'GET http://fring.ccs.neu.edu/fakebook/ HTTP/1.0\r\nConnection:keep-alive\r\nHost:fring.ccs.neu.edu\r\nUser-Agent: Mozilla 5.0\r\nCookie: csrftoken=' + csrf + '; sessionid=' + session + '\r\n\r\n', function(data) {
    this.extractUrls(data);
  }.bind(this));
}


function request(ip, message, callback) {
  var client = new net.Socket();
  client.connect(80, ip, function() {
    client.write(message);
  });

  var totalData = '';
  var done = false;

  client.on('data', function(data) {
    if (done) return;
    var contentLength = data.toString().match(/Content-Length: (\d+)/);
    var status = data.toString().match(/^HTTP\/1\.1 (\d\d\d) .+/);
    if (status) { 
      // console.log('status: ' + status[1]);
    }

    if (status && status[1] === '500') { 
      callback(data.toString, status[1]);
      client.end();
      return;
    }

    if (data.toString().endsWith('</html>\n') || (contentLength && contentLength[1] === '0')) {
        totalData += data.toString();
        callback(totalData, '200');
        done = true;
        client.end();
        }
    else {
        totalData += data.toString();
    }
  })

  client.on('error', function(err) {
    console.log(err);
  })

  client.on('close', function(tError) {
    if (tError) console.log('transmission error')
    if (tError) console.log(message);
  });
}

Crawler.prototype.extractUrls = function(html, source) {
  var links = html.match(/<a href=\"([^\"]*?)\">/gi);
  if (links) {
    for (var i = 0; i < links.length; i++) {
      var match = links[i].match(/<a href="\/fakebook\/(.+)\/">/);
      if (match && match[1])  {
        var link = match[1];
        if (this.visited.indexOf(link) === -1) this.toVisit.push(link);
      }
    }
  }

  var keyMatch = html.match(/<h2 class='secret_flag' style="color:red">FLAG: ([^<]*)/);
  if (keyMatch && keyMatch[1])  {
    var key = keyMatch[1];
    console.log(key + ' - ' + source + ' ' + this.visited.indexOf(source));
    this.keys.push(key);
    console.log(this.keys.length + ' keys found');
  }
  if (this.keys.length === 5) return;
  this.visitNext();
}

Crawler.prototype.visitNext = function() {
  if (this.toVisit.length === 0) return;
  var link = this.toVisit.shift();
  if (this.visited.indexOf(link) > -1) {
    this.visitNext();
  } else {
    // console.log(this.visited.length);
    this.visit(link);
  }
}

Crawler.prototype.visit = function(link) {
  // console.log(link + '|' + toVisit.length);
  request('129.10.113.143', 'GET http://fring.ccs.neu.edu/fakebook/' + link + '/ HTTP/1.0\r\nConnection:keep-alive\r\nHost:fring.ccs.neu.edu\r\nUser-Agent: Mozilla 5.0\r\nCookie: csrftoken=' + this.csrfToken + '; sessionid=' + this.sessionToken + '\r\n\r\n', function(data, status) {
    if (status === '500') {
      // console.log('got a 500');
      this.toVisit.push(link);
      this.visitNext();
      return;
    }

    this.visited.push(link);
    this.extractUrls(data, link);
    // console.log('visiting next');
  }.bind(this));
}

new Crawler();
