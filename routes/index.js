var http = require('http')
  , url = require('url')
  , collection_json = require('collection_json');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.render = function(req, res){
  var options = url.parse(req.query.url);
  options.method = 'GET';
  options.headers = {
    accept: 'application/vnd.collection+json'
  };
  var clientReq = http.request(options, function(clientRes) {
    clientRes.setEncoding('utf8');
    var body = '';
    clientRes.on('data', function (chunk) {
      body += chunk;
    });
    clientRes.on('end', function (chunk) {
      var parsedBody = JSON.parse(body);
      var doc = collection_json.fromObject(parsedBody);
      res.render('data', {
        url: req.query.url,
        doc: doc,
        headers: clientRes.headers,
        raw: body,
        formattedRaw: JSON.stringify(parsedBody, null, '  ') });
    });
  });
  clientReq.on('error', function() {
    res.render('index', { title: 'Failed to render ' + req.query.url });
  });
  clientReq.end();
};
