# sasaki

An implementation of promises/A+ has jQuery like APIs.

## Initialize

### Web

```html
<!-- [if IE 8]>
  <script src="path/to/es5-shim.js"></script>
</!--><![endif]-->
<script src="path/to/deferred.min.js"></script>
<script src="path/to/your-script.js"></script>
```

### Worker

```javascript
importScripts('path/to/deferred.min.js');
```

### CommonJS

```javascript
var Deferred = require('path/to/deferred.min.js');
```

## Usage

```javascript
function wait(ms) {
  var d = new Deferred;
  setTimeout(function() {
    console.log('hello!');
    d.resolve(ms);
  }, ms);
  return d.promise();
}

wait(ms)
.then(wait)
.then(wait)
.then(wait)
.then(wait);

Deferred.when(wait(10), wait(20), wait(30))
.then(function(a, b, c) {
  console.log(a, b, c);
});
```

## License

Released under the MIT License.