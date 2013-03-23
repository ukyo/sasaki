var sasaki,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

sasaki = {};

(function() {
  var Deferred, Promise;

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
  Deferred = (function() {
    function Deferred() {
      this.rejectWith = __bind(this.rejectWith, this);
      this.reject = __bind(this.reject, this);
      this.resolveWith = __bind(this.resolveWith, this);
      this.resolve = __bind(this.resolve, this);      this._queue = [];
      this._context = null;
    }

    Deferred.prototype._transition = function(isResolve, args) {
      var current, e, handler, onRejected, onResolved, result, setContext,
        _this = this;

      if (!this._queue.length) {
        return;
      }
      current = this._queue.shift();
      handler = isResolve ? current.onResolved : current.onRejected;
      if (typeof handler !== 'function') {
        return this._transition(isResolve, args);
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
        } else {
          return this.resolve(result);
        }
      } catch (_error) {
        e = _error;
        return this.reject(e);
      }
    };

    Deferred.prototype.resolve = function() {
      return this._transition(true, arguments);
    };

    Deferred.prototype.resolveWith = function() {
      var args, _context;

      _context = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this._context = _context;
      return this._transition(true, args);
    };

    Deferred.prototype.reject = function() {
      return this._transition(false, arguments);
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
  sasaki.defer = function() {
    return new Deferred;
  };
  sasaki.Deferred = Deferred;
  sasaki.Promise = Promise;
  return sasaki.when = function() {
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
})();
