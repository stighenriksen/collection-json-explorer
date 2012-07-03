var collection_json = require('collection_json')
  , http = require('http')
  , url = require('url')
  , _ = require('underscore');

function urlgenerator(req) {
  var host = req.headers.host;
  return {
    render: function(u) {
      return 'http://' + host + '/render?url=' + encodeURIComponent(u)}
  };
}

exports.index = function(req, res){
  res.render('index', {
    host: req.headers.host
  });
};

exports.render = function(req, res) {
  function sendErr(err, rawBody) {
    res.render('data', {
      url: req.query.url,
      err: err,
      rawBody: rawBody
    });
  }
  var u = url.parse(req.query.url, true);
  var params = _.reduce(req.query, function(q, value, key) {
      if(!key.match(/^param-/)) {
        return q;
      }
      q[key.substr(6)] = value;
      return q;
  }, {});
  u.query = _.extend({}, u.query, params);
  fetchCollection(url.format(u), function(err, headers, body) {
    if(err) {
      sendErr(err, body);
    }
    else {
      var parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch(e) {
        sendErr('Unable to parse JSON: ' + e, body);
        return;
      }
      var collection = collection_json.fromObject(parsedBody).collection;
      console.log(collection);
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
        params: params,
        collection: collection,
        headers: headers,
        rawBody: body,
        formattedBody: JSON.stringify(parsedBody, null, '  ') });
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
