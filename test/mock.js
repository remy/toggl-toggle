const proxyquire = require('proxyquire');
const sinon = require('sinon');
const toggle = proxyquire('../', {
  request: (opts, callback) => {
    return mock.stub(opts, callback);
  },
});

var mock = module.exports = {
  toggle,
  stub: newStub(),
  reset: () => {
    mock.stub = newStub();
  },
};

function newStub() {
  return sinon.stub().yields(null, { statusCode: 200 }, {
    data: [{
      id: 0,
    }, ],
  });
}
