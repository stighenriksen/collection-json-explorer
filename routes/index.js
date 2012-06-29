var http = require('http')
  , url = require('url')
  , collection_json = require('collection_json');

exports.index = function(req, res){
  res.render('index', {
    title: 'Collection+JSON Explorer',
    host: req.headers.host,
    examples: [
      "minimal",
      "collection",
      "item",
      "queries",
      "template",
      "error"
    ]
  });
};

exports.render = function(req, res){
  fetchCollection(req.query.url, function(err, headers, body) {
    if(err) {
      res.render('index', { title: 'Failed to render ' + req.query.url });
    }
    else {
      var parsedBody = JSON.parse(body);
      var doc = collection_json.fromObject(parsedBody);
      res.render('data', {
        url: req.query.url,
        doc: doc,
        headers: headers,
        raw: body,
        formattedRaw: JSON.stringify(parsedBody, null, '  ') });
    }
  });
};

function fetchCollection(u, cb) {
  var options = url.parse(u);
  options.headers = {
    accept: 'application/vnd.collection+json'
  };
  var req = http.get(options, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function (chunk) {
      cb(undefined, res.headers, body);
    });
  }).on('error', function() {
    cb('Unable to fetch ' + u);
  });
}
