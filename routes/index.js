var collection_json = require('collection_json')
  , explorer = require('../lib/explorer.js')
  , http = require('http')
  , url = require('url')
  , util = require('util')
  , _ = require('underscore');

function split(str) {
  var u = url.parse(str);

  if(typeof u.pathname != 'string') {
    return [str];
  }

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

  // Append the query as a single segment
  // If not query, append the slash slash if it's missing.
  if(u.search) {
    splits.push([(u.pathname.match(/\/$/) ? '/' : '') + u.search, url.format(u)]);
  } else if(str.match(/\/$/)) {
    var last = splits[splits.length - 1];
    last[0] = last[0] + '/';
    last[1] = last[1] + '/';
  }

  return splits;
}
exports.split = split;

function extractParams(o) {
  return _.reduce(o, function(q, value, key) {
    if(!key.match(/^param-/)) {
      return q;
    }
    q[key.substr(6)] = value;
    return q;
  }, {});
}

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
    }).on('end', function () {
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

exports.write = function(req, res) {
  var options = url.parse(req.body.url, false);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/vnd.collection+json'
  };
  // console.log('options', options);

  var data = _.map(extractParams(req.body), function(value, key) {
    return {name: key, value: value};
  });
  var body = {template: { data: data }};
  // console.log('body', JSON.stringify(body, null, '  '));
  function done(message, httpResponse) {
    // console.log('done', arguments);
    var parsedBody;
    try {
      parsedBody = JSON.parse(httpResponse.body);
    } catch(e) {}
    res.render('data', {
      urlgenerator: urlgenerator(req),
      url: req.body.url,
      root: collection_json.fromObject(parsedBody),
      httpResponse: httpResponse,
      parsedBody: parsedBody,
      rawBody: typeof httpResponse == 'object' ? httpResponse.body : undefined,
    });
  }
  var httpRequest = http.request(options, function(httpResponse) {
    httpResponse.setEncoding('utf8');
    var body = '';
    httpResponse.on('data', function (chunk) {
      body += chunk;
    }).on('end', function () {
      done(undefined, {
        statusCode: httpResponse.statusCode,
        status: '',
        headers: httpResponse.headers,
        body: body
      });
    });
  }).on('error', function(e) {
    done(util.inspect(e));
  });
  httpRequest.write(JSON.stringify(body));
  httpRequest.end();
}

exports.render = function(req, res) {
  var u = url.parse(req.query.url, true);
  var params = extractParams(req.query);
  u.query = _.extend({}, u.query, params);
  explorer.fetchCollection(url.format(u), function(err, result) {
    if(err) {
      sendErr(req, res, err, result);
      return;
    }
    var parsedBody;
    try {
      parsedBody = JSON.parse(result.body);
    } catch(e) {
      sendErr(req, res, 'Unable to parse JSON: ' + e, result);
      return;
    }
    res.render('data', {
      urlgenerator: urlgenerator(req),
      url: req.query.url, referer: req.query.referer,
      params: params,
      root: collection_json.fromObject(parsedBody),
      httpResponse: result.res,
      parsedBody: parsedBody,
      rawBody: result.body
    });
  });
};

