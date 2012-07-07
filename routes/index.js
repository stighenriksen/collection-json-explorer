var collection_json = require('collection_json')
  , http = require('http')
  , url = require('url')
  , util = require('util')
  , _ = require('underscore');

function split(str) {
  var u = url.parse(str);

  var segments = u.pathname.replace(/\/$/, '').split('/');

  var splits = _.map(_.range(segments.length), function(i) {
    var x = _.clone(u);
    x.pathname = _.first(segments, i + 1).join('/');
    x.search = '';
    if(i == 0) {
      return [u.protocol + '//' + u.host, url.format(x)];
    }
    else {
      return ['/' + segments[i], url.format(x)];
    }
  });

  if(u.search) {
    splits.push([(u.pathname.match(/\/$/) ? '/' : '') + u.search, url.format(u)]);
  }

  return splits;
}
exports.split = split;

function urlgenerator(req) {
  var host = req.headers.host;
  return {
    split: split,
    render: function(u) { return 'http://' + host + '/render?url=' + encodeURIComponent(u)},
    delete: function(referer, u) { return 'http://' + host + '/delete?referer=' + encodeURIComponent(referer) + '&url=' + encodeURIComponent(u)},
    isUrl: function(u) {
      try {
        var x = url.parse(u);
        return _.isString(x.protocol) && _.isString(x.host) && _.isString(path);
      }
      catch(e) {
        return false;
      }
    }
  };
}

function sendErr(req, res, err, httpResponse) {
  res.render('data', {
    urlgenerator: urlgenerator(req),
    url: req.query.url, referer: req.query.referer,
    err: err,
    httpResponse: httpResponse
  });
}

exports.index = function(req, res) {
  res.render('index', {
    host: req.headers.host
  });
};

exports.delete = function(req, res) {
  var options = url.parse(req.query.url, false);
  options.method = 'DELETE';
  function done(message, httpResponse) {
    res.render('data', {
      urlgenerator: urlgenerator(req),
      url: req.query.url, referer: req.query.referer,
      httpResponse: httpResponse
    });
  }
  http.request(options, function(httpResponse) {
    httpResponse.setEncoding('utf8');
    var body = '';
    httpResponse.on('data', function (chunk) {
      body += chunk;
    }).on('end', function (chunk) {
      done(undefined, {
        statusCode: httpResponse.statusCode,
        status: '',
        headers: httpResponse.headers,
        body: body
      });
    });
  }).on('error', function(e) {
      done(util.inspect(e));
  }).end();
}

exports.render = function(req, res) {
  var u = url.parse(req.query.url, true);
  var params = _.reduce(req.query, function(q, value, key) {
      if(!key.match(/^param-/)) {
        return q;
      }
      q[key.substr(6)] = value;
      return q;
  }, {});
  u.query = _.extend({}, u.query, params);
  fetchCollection(url.format(u), function(err, httpResponse) {
    if(err) {
      sendErr(req, res, err, httpResponse);
      return;
    }
    var parsedBody;
    try {
      parsedBody = JSON.parse(httpResponse.body);
    } catch(e) {
      sendErr(req, res, 'Unable to parse JSON: ' + e, httpResponse);
      return;
    }
    res.render('data', {
      urlgenerator: urlgenerator(req),
      url: req.query.url, referer: req.query.referer,
      params: params,
      root: collection_json.fromObject(parsedBody),
      httpResponse: httpResponse,
      formattedBody: JSON.stringify(parsedBody, null, '  ')
    });
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
      cb(undefined, {
        statusCode: res.statusCode,
        status: '',
        headers: res.headers,
        body: body
      });
    });
  }).on('error', function() {
    cb('Unable to fetch ' + u);
  });
}
