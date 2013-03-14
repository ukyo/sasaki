
if (typeof define === 'function' && (define.amd != null)) {
  define(function() {
    return Deferred;
  });
} else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Deferred;
} else {
  global.Deferred = Deferred;
}
