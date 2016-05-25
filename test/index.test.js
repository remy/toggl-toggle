'use strict';
const tap = require('tap');
const test = require('tap-only');
const mock = require('./mock');
const sinon = require('sinon');
const toggle = mock.toggle;
const defaultResponse = { statusCode: 200 };

tap.beforeEach(done => {
  mock.reset();
  done();
});

test('toggle loads', t => {
  t.type(toggle('12345'), Promise);
  t.end();
});

test('toggle throws', t => {
  return toggle().catch(e => {
    t.matches(e.message, /requires an API token/);
  });
});

test('toggle calls (error)', t => {
  mock.stub = sinon.stub().yields(new Error('request'), {}, '');
  return toggle('12345').then(() => {
    t.fail('should not have succeeded');
  }).catch(e => {
    t.equal(e.message, 'request');
  });
});

test('toggle calls (non 200 OK)', t => {
  mock.stub = sinon.stub().yields(null, {
    statusCode: 404,
  }, '');
  return toggle('12345').then(() => {
    t.fail('should not have succeeded');
  }).catch(e => {
    t.match(e.message, /404/);
  });
});

test('toggle stops', t => {
  let current = require('./fixtures/current.json');
  let stop = require('./fixtures/stop.json');
  mock.stub
    .onCall(0).yields(null, defaultResponse, current)
    .onCall(1).yields(null, defaultResponse, stop);

  return toggle('12345').then(() => {
    let args = mock.stub.args[1][0];
    t.equal(mock.stub.callCount, 2, 'call count');
    t.equal(args.method, 'put', 'stop method');
    t.notEqual(args.url, `/${current.data.id}/`, 'contains id');
  });
});

test('toggle starts', t => {
  let recent = require('./fixtures/recent.json');
  let copy = Array.from(recent);
  let start = require('./fixtures/start.json');
  mock.stub
    .onCall(0).yields(null, defaultResponse, { data: null })
    .onCall(1).yields(null, defaultResponse, recent)
    .onCall(2).yields(null, defaultResponse, start);

  return toggle('12345').then(() => {
    t.equal(mock.stub.callCount, 3, 'call count');
    let args = mock.stub.args[2][0];
    t.equal(args.method, 'post', 'start method');
    t.equal(args.body.time_entry.description, copy.slice(-1).pop().description);
  });
});
