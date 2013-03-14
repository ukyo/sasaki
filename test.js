var Deferred = require('./deferred.min.js');

function asyncSuccess() {
  var dfd = new Deferred;
  setTimeout(function() {
    dfd.resolve('success');
  }, 0);
  return dfd.promise();
}

function asyncError() {
  var dfd = new Deferred;
  setTimeout(function() {
    dfd.reject('error');
  }, 0);
  return dfd.promise();
}

function asyncMulti() {
  var dfd = new Deferred;
  setTimeout(function() {
    dfd.resolve(1, 2, 3);
  }, 0);
  return dfd.promise();
}

function asyncSuccessWith(context) {
  var dfd = new Deferred;
  setTimeout(function() {
    dfd.resolveWith(context, 'success');
  }, 0);
  return dfd.promise();
}

exports.testExported = function(test) {
  test.ok(Deferred, 'Deferred is exported.');
  test.ok(Deferred.isPromise, 'Deferred.isPromise is exported.');
  test.ok(Deferred.when, 'Deferred.when is exported.');

  var dfd = new Deferred;
  test.ok(dfd.resolve, 'Deferred.prototype.resolve is exported.');
  test.ok(dfd.resolveWith, 'Deferred.prototype.resolveWith is exported.');
  test.ok(dfd.reject, 'Deferred.prototype.reject is exported.');
  test.ok(dfd.rejectWith, 'Deferred.prototype.rejectWith is exported.');
  test.ok(dfd.then, 'Deferred.prototype.then is exported.');
  test.ok(dfd.done, 'Deferred.prototype.done is exported.');
  test.ok(dfd.fail, 'Deferred.prototype.fail is exported.');
  test.ok(dfd.always, 'Deferred.prototype.always is exported.');
  test.ok(dfd.promise, 'Deferred.prototype.promise is exported.');

  var promise = dfd.promise();
  test.ok(promise.then, 'Promies.prototype.then is exported.');
  test.ok(promise.done, 'Promies.prototype.done is exported.');
  test.ok(promise.fail, 'Promies.prototype.fail is exported.');
  test.ok(promise.always, 'Promies.prototype.always is exported.');

  test.done();
};

exports.testSeries = function(test) {
  test.expect(8);

  asyncSuccess()
  .then(function(s) {
    test.equal(s, 'success');
    return 'success';
  })
  .then(function(s) {
    test.equal(s, 'success');
  })
  .then(asyncError)
  .fail(function(e) {
    test.equal(e, 'error');
    throw 'error';
  })
  .fail(function(e) {
    test.equal(e, 'error');
    return asyncSuccess();
  })
  .then(function(s) {
    test.equal(s, 'success');
  })
  .then(asyncMulti)
  .always(function(a, b, c) {
    test.equal(a, 1);
    test.equal(b, 2);
    test.equal(c, 3);
    test.done();
  });
};

exports.testSeriesWith = function(test) {
  var context1 = {}, context2 = {};

  // test.equal(context, context);
  // test.done();

  asyncSuccessWith(context1)
  .then(function() {
    test.equal(this, context1);
    return asyncSuccessWith(context2);
  })
  .then(function() {
    test.equal(this, context2);
    test.done();
  });
};

exports.testParallel = function(test) {
  test.expect(8);

  Deferred.when(asyncSuccess(), asyncSuccess())
  .then(function(a, b) {
    test.equal(a, 'success');
    test.equal(b, 'success');
    return Deferred.when(asyncMulti(), asyncSuccess());
  })
  .then(function(a, b) {
    test.equal(a.length, 3);
    test.equal(a[0], 1);
    test.equal(a[1], 2);
    test.equal(a[2], 3);
    test.equal(b, 'success');
    return Deferred.when(asyncSuccess(), asyncMulti(), asyncError());
  })
  .fail(function(e) {
    test.equal(e, 'error');
  })
  .always(function() {
    test.done();
  });
};