var http = require('http')
  , url = require('url')
  , collection_json = require('collection_json');

function urlgenerator(req) {
  var host = req.headers.host;
  return {
    render: function(u) {
      return 'http://' + host + '/render?url=' + encodeURIComponent(u)}
  };
}

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

exports.render = function(req, res) {
  function sendErr(err) {
    res.render('data', {
      url: req.query.url,
      err: err
    });
  }
  fetchCollection(req.query.url, function(err, headers, body) {
    if(err) {
      sendErr(err);
    }
    else {
      var parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch(e) { sendErr('Unable to parse JSON: ' + e); }
      var doc = collection_json.fromObject(parsedBody).collection;
      var isUrl = function(u) {
        try {
          var x = url.parse(u);
          return _.isString(x.protocol) && _.isString(x.host) && _.isString(path);
        }
        catch(e) {
          return false;
        }
      };
      res.render('data', {
        isUrl: isUrl,
        urlgenerator: urlgenerator(req),
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
