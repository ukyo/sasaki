if (typeof define === 'function' && (define.amd != null)) {
  define(function() {
    return sasaki;
  });
} else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = sasaki;
} else {
  global.sasaki = sasaki;
}
