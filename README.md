jAJAX
=====

jQuery-like AJAX method for multiple environments:
browser, chrome-extension, safari-extension, firefox-extension.

You can use it even in Node.js with [node-XMLHttpRequest](https://github.com/driverdan/node-XMLHttpRequest).

## Usage
```typescript
jajax(options: object, ondone: function, onerror: function)
/*  where
 *    options is "url" or {url:"url", dataType:"type", method: "GET", ...}, similar to jQuery.ajax(options)
 *
 *    function ondone(result, statusText, xhr[, response]);
 *    function onerror(xhr, type: "error"|"parsererror"|"abort"|"timeout"|"xhr", error[, response]);
 *    In Firefox there is response object instead of XHR, xhr is a plain object substitute
 */
```

The following expression could easilly replace `jAJAX` when `jQuery` is present:

```javascript
var jajax = function (options, ondone, onerror) {
    return jQuery.ajax(options).done(ondone).fail(onerror)
};
```

For more options see [jQuery.ajax()](http://api.jquery.com/jquery.ajax/).

## Features

- **No external dependencies** (no jQeury required)
- **Small footprint** (~ 2Kb minified and gziped)
- Easy to use (see **[jQuery.ajax()](http://api.jquery.com/jquery.ajax/)**)
- Works in **Browser Extensions** as well
  (tested in chrome-extension, safari-extension, firefox-extension)
- Can be used as a **drop in replacement for jQuery.ajax()**


## License
MIT

#### Happy coding!
