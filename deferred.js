var Deferred,
  _this = this,
  __slice = [].slice;

Deferred = (function() {
  var Promise;

  Promise = (function() {

    function Promise(_deferred) {
      this._deferred = _deferred;
    }

    Promise.prototype.then = function(onResolved, onRejected) {
      this._deferred._queue.push({
        onResolved: onResolved,
        onRejected: onRejected
      });
      return this;
    };

    Promise.prototype.done = function(onResolved) {
      return this.then(onResolved);
    };

    Promise.prototype.fail = function(onRejected) {
      return this.then(null, onRejected);
    };

    Promise.prototype.always = function(callback) {
      return this.then(callback, callback);
    };

    return Promise;

  })();

  function Deferred() {
    var _this = this;
    this.rejectWith = function() {
      var args, _context;
      _context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _this._context = _context;
      return Deferred.prototype.rejectWith.apply(_this, arguments);
    };
    this.reject = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Deferred.prototype.reject.apply(_this, arguments);
    };
    this.resolveWith = function() {
      var args, _context;
      _context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _this._context = _context;
      return Deferred.prototype.resolveWith.apply(_this, arguments);
    };
    this.resolve = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Deferred.prototype.resolve.apply(_this, arguments);
    };
    this._transition = function(isResolve, args) {
      return Deferred.prototype._transition.apply(_this, arguments);
    };
    this._queue = [];
    this._context = null;
  }

  Deferred.prototype._transition = function(isResolve, args) {
    var current, handler, onRejected, onResolved, result, setContext,
      _this = this;
    if (!this._queue.length) {
      return;
    }
    current = this._queue.shift();
    handler = isResolve ? current.onResolved : current.onRejected;
    if (typeof handler !== 'function') {
      return this.resolve.apply(this, args);
    }
    try {
      result = handler.apply(this._context, args);
      if (Deferred.isPromise(result)) {
        setContext = function() {
          var _ref;
          if (((_ref = result._deferred) != null ? _ref._context : void 0) != null) {
            return _this._context = result._deferred._context;
          }
        };
        onResolved = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          setContext();
          return _this.resolve.apply(_this, args);
        };
        onRejected = function(e) {
          setContext();
          return _this.reject(e);
        };
        return result.then(onResolved, onRejected);
      }
      return this.resolve(result);
    } catch (e) {
      return this.reject(e);
    }
  };

  Deferred.prototype.resolve = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this._transition(true, args);
  };

  Deferred.prototype.resolveWith = function() {
    var args, _context;
    _context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    this._context = _context;
    return this._transition(true, args);
  };

  Deferred.prototype.reject = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this._transition(false, args);
  };

  Deferred.prototype.rejectWith = function() {
    var args, _context;
    _context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    this._context = _context;
    return this._transition(false, args);
  };

  Deferred.prototype.then = function(onResolved, onRejected) {
    this._queue.push({
      onResolved: onResolved,
      onRejected: onRejected
    });
    return this;
  };

  Deferred.prototype.done = function(onResolved) {
    return this.then(onResolved);
  };

  Deferred.prototype.fail = function(onRejected) {
    return this.then(null, onRejected);
  };

  Deferred.prototype.always = function(callback) {
    return this.then(callback, callback);
  };

  Deferred.prototype.promise = function() {
    return new Promise(this);
  };

  return Deferred;

})();

Deferred.isPromise = function(x) {
  return x && typeof x.then === 'function';
};

Deferred.when = function() {
  var args, count, dfd, isError, onRejected, onResolved, results;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  dfd = new Deferred;
  results = [];
  count = args.length;
  isError = false;
  onResolved = function(i, args) {
    if (isError) {
      return;
    }
    results[i] = args.length === 1 ? args[0] : args;
    if (!--count) {
      return dfd.resolve.apply(dfd, results);
    }
  };
  onRejected = function(e) {
    if (isError) {
      return;
    }
    isError = true;
    return dfd.reject(e);
  };
  args.forEach(function(arg, i) {
    if (Deferred.isPromise(arg)) {
      return arg.then((function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return onResolved(i, args);
      }), onRejected);
    } else {
      return onResolved(i, arg);
    }
  });
  return dfd.promise();
};
