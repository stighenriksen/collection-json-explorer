var assert = require('assert')
  , util = require('util')
  , routes = require('../routes/index.js');

function assertSplit(url, expected) {
  var actual = routes.split(url);
  // console.log('actual  ', util.inspect(actual));
  // console.log('expected', util.inspect(expected));
  assert.deepEqual(actual, expected);
}

describe('routes.split', function() {
  it('http://localhost:123/', function() {
    assertSplit('http://localhost:123/', [
      ['http://localhost:123','http://localhost:123']
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
      ['/foo','http://localhost:123/foo'],
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
