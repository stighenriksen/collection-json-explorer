var assert = require('assert')
  , util = require('util')
  , routes = require('../routes/index.js');

function assertSplit(url, expected) {
  var actual = routes.split(url);
  // console.log('expected', util.inspect(expected));
  // console.log('actual  ', util.inspect(actual));
  assert.equal(util.inspect(expected), util.inspect(actual));
}

describe('routes.split', function() {
  it('http://localhost:123', function() {
    assertSplit('http://localhost:123', [
      ['http://localhost:123','http://localhost:123']
    ]);
  });
  it('http://localhost:123/', function() {
    assertSplit('http://localhost:123/', [
      ['http://localhost:123/','http://localhost:123/']
    ]);
  });
  it('http://localhost:123/?a=b', function() {
    assertSplit('http://localhost:123/?a=b', [
      ['http://localhost:123','http://localhost:123'],
      ['/?a=b','http://localhost:123/?a=b']
    ]);
  });
  it('http://localhost:123/foo', function() {
    assertSplit('http://localhost:123/foo', [
      ['http://localhost:123','http://localhost:123'],
      ['/foo','http://localhost:123/foo'],
    ]);
  });
  it('http://localhost:123/foo/', function() {
    assertSplit('http://localhost:123/foo/', [
      ['http://localhost:123','http://localhost:123'],
      ['/foo/','http://localhost:123/foo/'],
    ]);
  });
  it('http://localhost:123/a?x=1&y=2', function() {
    assertSplit('http://localhost:123/a?x=1&y=2', [
      ['http://localhost:123','http://localhost:123'],
      ['/a','http://localhost:123/a'],
      ['?x=1&y=2','http://localhost:123/a?x=1&y=2']
    ]);
  });
  it('http://localhost:123/a/?x=1&y=2', function() {
    assertSplit('http://localhost:123/a/?x=1&y=2', [
      ['http://localhost:123','http://localhost:123'],
      ['/a','http://localhost:123/a'],
      ['/?x=1&y=2','http://localhost:123/a/?x=1&y=2']
    ]);
  });
});
