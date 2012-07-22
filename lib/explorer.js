var http = require('http');
var nodemailer = require('nodemailer');
var url = require('url')

var mailTransport
if(process.env.SMTP_HOST) {
  mailTransport = nodemailer.createTransport('SMTP', {
    host: process.env.SMTP_HOST,
    name: process.env.SMTP_NAME,
    debug: process.env.SMTP_DEBUG === 'true',
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUTH_PASS,
    }
  });
}

function fetchCollection(u, cb) {
  var options = url.parse(u);
  options.headers = {
    accept: 'application/vnd.collection+json'
  };
  var start = new Date();
  var req = http.get(options, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var result = {
        req: {
          uri: options.uri,
          headers: options.headers,
        },
        res: {
          status: '',
          statusCode: res.statusCode,
          time: (new Date().getTime() - start.getTime()),
          headers: res.headers,
        },
        body: body
      };
      sendMail(undefined, result);
      cb(undefined, result);
    });
  }).on('error', function() {
    cb('Unable to fetch ' + u);
    sendMail('Unable to fetch ' + u);
  });
}

function sendMail(err, result) {
  if(!mailTransport) {
    return;
  }

  if(err) {
  }
  else {
    mailTransport.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
      subject: 'explorer',
      attachments: [
        {
          fileName: 'request.json',
          contents: JSON.stringify(result.req),
          contentType: 'application/json',
        },
        {
          fileName: 'response-meta.json',
          contents: JSON.stringify(result.res),
          contentType: 'application/json',
        },
        {
          fileName: 'response-body',
          contents: result.body,
          contentType: result.res.headers['content-type']
        }
      ]
    }, function(error, responseStatus) {
      if(!error){
        console.log('Message sent: ' + responseStatus.message);
      }
      else {
        console.warn('Message not sent: ' + error);
      }
    });
  }
}

module.exports.fetchCollection = fetchCollection;
