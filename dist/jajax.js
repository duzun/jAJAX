(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.jajax = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  /**
   *  jQuery-like AJAX for any environment
   *  (Browser, Firefox, Chrome and Safari Extensions).
   *
   *  @license MIT
   *  @version 1.5.2
   *  @git https://github.com/duzun/jAJAX
   *  @umd AMD, Browser, CommonJs
   *  @author Dumitru Uzun (https://DUzun.Me)
   */

  /* Usage:
   *
   *  Ex: jajax(options: object, ondone: function, onerror: function)
   *          function ondone(result, statusText, xhr[, response]);
   *          function onerror(xhr, type: "error"|"parsererror"|"abort"|"timeout", error[, response]);
   *
   *      jajax(options: object).then(onresolve, onreject)
   *
   *  Note: On Firefox there is response object instead of XHR, xhr is a plain object
   *  Note 2: The error object of onreject also has error.xhr and error.response properties.
   *
   */

  /*globals self, global, ActiveXObject, JSON, require*/
  var root = typeof globalThis == 'undefined' ? typeof global == 'undefined' ? self : global : globalThis;
  var undefined$1; //jshint ignore:line
  // -------------------------------------------------------------

  var NULL = null,
      noop = function noop() {},
      __ = Object.prototype,
      hop = __.hasOwnProperty,
      tos = __.toString,
      now = typeof Date.now == 'function' ? function () {
    return Date.now();
  } : function () {
    return new Date.getTime();
  },
      isArray = isFunction(Array.isArray) ? Array.isArray : Array.isArray = function isArray(obj) {
    return obj instanceof Array || type(obj) == 'Array';
  },
      LENGTH = 'length',
      version = '1.5.2'; // -------------------------------------------------------------
  // -------------------------------------------------------------


  var TIMERS = typeof self !== 'undefined' && isFunction(self.setTimeout) ? self : root;

  if (!isFunction(TIMERS.setTimeout)) {
    if (typeof require !== 'undefined') {
      // Firefox Addon
      TIMERS = require('sdk/timers');
    }
  }

  var _TIMERS = TIMERS,
      setTimeout = _TIMERS.setTimeout,
      clearTimeout = _TIMERS.clearTimeout; // -------------------------------------------------------------

  var emptyReg = /^\s*$/; // -------------------------------------------------------------

  var allTypes = "*/" + "*",
      accepts = {
    "*": allTypes,
    text: "text/plain",
    html: "text/html",
    xml: "application/xml, text/xml",
    json: "application/json, text/javascript"
  }; // -------------------------------------------------------------
  // AJAX method itself

  function jajax(o, done, fail, _u) {
    if (type(o) == 'String') {
      if (done && type(done) == 'Object') {
        done.url = o;
        o = done;
        done = fail;
        fail = _u;
      } else {
        o = {
          url: o
        };
      }
    }

    o = extend({
      url: '',
      // String
      type: 'GET',
      // String - alias of .method
      cache: false,
      // Bool
      timeout: NULL,
      // Number
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      // String
      dataType: '',
      // String
      mimeType: '',
      // String
      data: NULL,
      // Object
      headers: NULL,
      // Object
      error: NULL,
      // Function
      success: NULL // Function

    }, o);

    if (!done && o.success) {
      done = o.success;
      delete o.success;
    }

    if (!fail && o.error) {
      fail = o.error;
      delete o.error;
    }

    var xhr = jajax.createXHR(false);

    if (!xhr) {
      fail && fail(NULL, 'xhr', new Error("Couldn't create XHR object"));
      return xhr;
    }

    var headers = {},
        setHeader = function setHeader(name, value) {
      headers[name.toLowerCase()] = [name, value];
    },
        method = o.method || o.type,
        url = o.url,
        abort_to,
        responseType,
        resolve,
        reject,
        then,
        _catch,
        onerror = function onerror(error, type, xh, res) {
      if (!error) {
        error = xh && xh.statusText;

        if (!error) {
          error = "jajax error: ".concat(type || 'unknown');
        }
      }

      if (typeof error == 'string') {
        error = new Error(error);
      }

      if (error) {
        if (type) {
          error.type = type;
        }

        if (xh && xh.status) {
          error.status = xh.status;
        }
      }

      if (o.error) {
        o.error(xh || res, type, error, res);
      }

      if (fail) {
        fail(xh || res, type, error, res);
      }

      if (reject) {
        if (error) {
          error.xhr = xh || res;
          error.response = res;
        }

        reject(error);
      }
    },
        onsuccess = function onsuccess(xh, result, res) {
      var dataType = o.dataType || o.mimeType && jajax.mimeToDataType(o.mimeType) || responseType,
          error;

      try {
        switch (dataType) {
          case 'json':
            {
              result = 'responseJSON' in xh ? xh.responseJSON : emptyReg.test(result) ? NULL : jajax.parseJSON(result);
            }
            break;

          case 'xml':
            {
              result = xh.responseXML;
            }
            break;

          case 'script':
            {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              emptyReg.test(result) || (1, eval)(result); //jshint ignore:line
            }
            break;

          case 'text':
          /*falls through*/

          default:
            {// result = xh.responseText
            }
            break;
        }
      } catch (e) {
        error = e;
      }

      if (error) {
        onerror(error, 'parsererror', xh, res);
      } else {
        if (o.success) {
          o.success(result, xh.statusText, xh, res);
        }

        if (done) {
          done(result, xh.statusText, xh, res);
        }

        if (resolve) {
          resolve(result);
        }
      }
    },
        oncomplete = function oncomplete(xh, res) {
      abort_to && clearTimeout(abort_to);
      var response = xh.responseText || xh.response; // responseType from response headers

      responseType = jajax.mimeToDataType(xh.getResponseHeader('content-type')); // If responseType is 'json', make sure there is xh.responseJSON

      if (responseType == 'json' && !('responseJSON' in xh)) {
        if (/^\s*$/.test(response)) {
          xh.responseJSON = NULL;
        } else {
          try {
            xh.responseJSON = jajax.parseJSON(response);
          } catch (err) {}
        }
      }

      if (xh.status >= 200 && xh.status < 300 || xh.status == 304) {
        onsuccess(xh, response, res);
      } else {
        onerror(xh.statusText || NULL, xh.status ? 'error' : 'abort', xh, res);
      }
    }; // Return a Promise when there is no done nor fail callbacks


    if (!done && !fail && typeof Promise == 'function') {
      var prom = new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
      });
      then = prom.then.bind(prom);
      _catch = prom["catch"].bind(prom);
    }

    each({
      'X-Requested-With': 'XMLHttpRequest',
      Accept: (accepts[o.dataType] ? accepts[o.dataType] + ', ' : '') + allTypes + '; q=0.01'
    }, setHeader);

    if (o.contentType) {
      setHeader('Content-Type', o.contentType);
    }

    each(o.headers, setHeader);
    method = method.toLowerCase();

    if (o.data && (method == 'get' || method == 'head')) {
      url += (url.indexOf('?') < 0 ? '?' : '&') + jajax.param(o.data);
      o.data = NULL;
    }

    if (jajax.xhr_type == 'REQUEST') {
      each(o.data, function (n, v, d) {
        if (v == NULL) delete d[n];
      });
      var h = {
        url: url,
        content: o.data || {},
        headers: {},
        onComplete: function onComplete(res) {
          if (h.aborted) return;
          var _xhr = {
            getResponseHeader: function getResponseHeader(name) {
              return res.headers[name];
            },
            status: res.status,
            statusText: res.statusText,
            responseText: res.text,
            responseJSON: res.json
          };
          oncomplete(_xhr, res);
        }
      };
      each(headers, function (i, a) {
        if (a[0] && a[0] != NULL) h.headers[a[0]] = a[1];
      });
      if (o.contentType) h.contentType = o.contentType;
      if (o.timeout > 0) abort_to = setTimeout(function () {
        h.aborted = now(); // xhr.abort(); // @todo: abort request

        onerror(NULL, 'timeout', xhr);
      }, o.timeout);

      var _xhr;

      try {
        _xhr = xhr.Request(h);

        _xhr[method]();
      } catch (er) {
        // If method not supported. try to override it
        try {
          h.headers['X-HTTP-Method-Override'] = method.toUpperCase();
          _xhr = xhr.Request(h);

          _xhr.post();
        } catch (er) {
          // If override doesn't work, try XHR - synchronous in FF
          switch (method) {
            case 'delete':
              {
                // Firefox REQUEST object doesn't support DELETE,
                // need to create manual xhr object
                var XHR = require("sdk/net/xhr");

                _xhr = new XHR.XMLHttpRequest();

                _xhr.open(method, url);

                each(h.headers, function (n, v) {
                  _xhr.setRequestHeader(n, v);
                });

                _xhr.send();

                oncomplete(_xhr);
              }
              break;

            default:
              throw er;
          }
        }
      }

      if (_xhr) {
        xhr = _xhr;
      }
    } else {
      xhr.open(method, url, true);
      each(headers, function (i, a) {
        if (a[1] != NULL) xhr.setRequestHeader(a[0], a[1] + '');
      });
      if (o.timeout > 0) abort_to = setTimeout(function () {
        xhr.onreadystatechange = noop;
        xhr.abort();
        onerror(NULL, 'timeout', xhr);
      }, o.timeout);

      var callback = function callback() {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = noop;
          oncomplete(xhr);
        }
      };

      xhr.send(o.data ? typeof o.data == 'string' ? o.data : jajax.param(o.data) : NULL);

      if (xhr.readyState === 4) {
        // (IE6 & IE7) if it's in cache and has been
        // retrieved directly we need to fire the callback
        setTimeout(callback);
      } else {
        xhr.onreadystatechange = callback;
      }
    }

    if (then && !xhr.then) {
      xhr.then = then;
      if (_catch) xhr["catch"] = _catch;
    }

    return xhr;
  } // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------

  function type(obj) {
    // IE gives us some surprises
    if (obj === null) return 'Null';
    if (obj === undefined$1) return 'Undefined';
    return tos.call(obj).slice(8, -1);
  }

  function isFunction(obj) {
    return obj instanceof Function || type(obj) == 'Function';
  }

  function isArrayLike(obj) {
    return hop.call(obj, LENGTH) && typeof obj[LENGTH] === 'number' && !isFunction(obj);
  } // var isString = function isString(obj) {
  // return obj instanceof String || type(obj) == 'String';
  // } ;
  // -------------------------------------------------------------


  function each(o, f) {
    if (!o) return o;

    if (isArray(o) || isArrayLike(o)) {
      for (var i = 0, l = o[LENGTH] >>> 0; i < l; i++) {
        if (hop.call(o, i)) {
          var s = o[i];
          if (f.call(s, i, s, o) === false) return i;
        }
      }
    } else {
      for (var _i in o) {
        if (hop.call(o, _i)) {
          var _s = o[_i];
          if (f.call(_s, _i, _s, o) === false) return _i;
        }
      }
    }

    return o;
  } // -------------------------------------------------------------


  function extend(o) {
    var cpy = function cpy(i, s) {
      o[i] = s;
    };

    each(arguments, function (i, a) {
      i && each(a, cpy);
    });
    return o;
  } // -------------------------------------------------------------

  (function (escape, JSON, $) {
    function serialize(params, obj, traditional, scope) {
      var array = isArray(obj);

      var hash = obj && obj !== root && !array && Object.getPrototypeOf(obj) === __;

      each(obj, function (key, value) {
        var type = isArray(value) ? 'array' : _typeof(value);
        if (scope) key = traditional ? scope : scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'; // handle data in serializeArray() format

        if (!scope && array) {
          params.add(value.name, value.value);
        } // recurse into nested objects
        else if (type == "array" || !traditional && type == "object") {
          serialize(params, value, traditional, key);
        } else {
          params.add(key, value);
        }
      });
    }

    $.param = function (obj, traditional) {
      var params = [];

      params.add = function (k, v) {
        this.push(escape(k) + (v == NULL ? '' : '=' + escape(v)));
      };

      serialize(params, obj, traditional);
      return params.join('&').replace(/%20/g, '+');
    };

    var scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html';

    $.mimeToDataType = function (mime) {
      if (mime) mime = mime.split(';', 2)[0];
      return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
    };

    var json_decode = JSON && JSON.parse || root.json_decode;

    $.parseJSON = function (text) {
      try {
        return json_decode(text);
      } catch (err) {
        // Try to remove one line comments
        var txt = text.replace(/[\n\r]+\s*\/\/[^\n\r]*/g, '');

        if (txt != text) {
          return json_decode(txt);
        }

        throw err;
      }
    }; // Functions to create xhr


    $.createXHR = function (xhr) {
      var meths = {
        XMLHttpRequest: function XMLHttpRequest() {
          return new root.XMLHttpRequest();
        },
        MSXML2: function MSXML2() {
          return new ActiveXObject('Msxml2.XMLHTTP');
        },
        MSXML: function MSXML() {
          return new ActiveXObject('Microsoft.XMLHTTP');
        },
        MSXML24: function MSXML24() {
          return new ActiveXObject('Msxml2.XMLHTTP.4.0');
        } // @deprecated
        // Lacks DELETE method
        ,
        REQUEST: function REQUEST() {
          // synchronous only and experimental
          // var XHR = require("sdk/net/xhr");
          return require("sdk/request");
        },
        node_XMLHttpRequest: function node_XMLHttpRequest() {
          // https://github.com/driverdan/node-XMLHttpRequest
          var _require = require("xmlhttprequest"),
              XMLHttpRequest = _require.XMLHttpRequest;

          return new XMLHttpRequest();
        }
      };
      each(meths, function (type, _xhr) {
        try {
          xhr = _xhr();
          $.createXHR = _xhr;
          $.xhr_type = type;
          return false;
        } catch (e) {}
      });
      return xhr;
    }; // Check if XHR is supported


    $.xhr_supported = $.createXHR(false);
  })(encodeURIComponent, JSON, jajax); // Export some helpers


  extend(jajax, {
    version: version,
    accepts: accepts,
    each: each,
    extend: extend,
    type: type,
    isFunction: isFunction,
    isArray: isArray,
    isArrayLike: isArrayLike
  });

  return jajax;

}));
