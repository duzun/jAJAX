/*
 MIT
  @version 1.3.1
  @git https://github.com/duzun/jAJAX
  @umd AMD, Browser, CommonJs
  @author DUzun.Me
*/
(function(name, root, Object, Array, Function, Date) {
  var undefined, NIL = "", UNDEFINED = undefined + NIL, FUNCTION = "function";
  (typeof define != FUNCTION || !define.amd ? typeof module != UNDEFINED && module.exports ? function(deps, factory) {
    module.exports = factory();
  } : function(deps, factory) {
    root[name] = factory();
  } : define)([], function factory() {
    var TRUE = true;
    var FALSE = false;
    var NULL = null;
    var noop = Object.noop || function() {
    };
    var __ = Object.prototype;
    var hop = __.hasOwnProperty;
    var tos = __.toString;
    var now = typeof Date.now == FUNCTION ? function() {
      return Date.now();
    } : function() {
      return new Date.getTime;
    };
    var isArray = isFunction(Array.isArray) ? Array.isArray : Array.isArray = function isArray(obj) {
      return obj instanceof Array || type(obj) == "Array";
    };
    var LENGTH = "length";
    var version = "1.3.1";
    var TIMERS = typeof self !== UNDEFINED && isFunction(self.setTimeout) ? self : root;
    if (!isFunction(TIMERS.setTimeout)) {
      if (typeof require !== UNDEFINED) {
        TIMERS = require("sdk/timers");
      }
    }
    var $jscomp$destructuring$var0 = TIMERS;
    var setTimeout = $jscomp$destructuring$var0.setTimeout;
    var clearTimeout = $jscomp$destructuring$var0.clearTimeout;
    var allTypes = "*/" + "*";
    var accepts = {"*":allTypes, text:"text/plain", html:"text/html", xml:"application/xml, text/xml", json:"application/json, text/javascript"};
    var jajax = function jajax(o, done, fail, _u) {
      var xhr = jajax.createXHR(FALSE);
      if (!xhr) {
        fail && fail(NULL, "xhr", "Couldn't create XHR object");
        return xhr;
      }
      if (type(o) == "String") {
        if (done && type(done) == "Object") {
          done.url = o;
          o = done;
          done = fail;
          fail = _u;
        } else {
          o = {url:o};
        }
      }
      o = extend({url:"", type:"GET", cache:FALSE, timeout:NULL, contentType:"application/x-www-form-urlencoded; charset=UTF-8", dataType:"", mimeType:"", data:NULL, headers:NULL, error:NULL, success:NULL}, o);
      var headers = {}, setHeader = function(name, value) {
        headers[name.toLowerCase()] = [name, value];
      }, method = o.method || o.type, url = o.url, abort_to, responseType, onerror = function(error, type, xh, res) {
        if (o.error) {
          o.error(xh || res, type, error, res);
        }
        if (fail) {
          fail(xh || res, type, error, res);
        }
      }, onsuccecc = function(xh, result, res) {
        var dataType = o.dataType || o.mimeType && jajax.mimeToDataType(o.mimeType) || responseType, error;
        try {
          switch(dataType) {
            case "json":
              {
                result = "responseJSON" in xh ? xh.responseJSON : /^\s*$/.test(result) ? NULL : jajax.parseJSON(result);
              }
              break;
            case "xml":
              {
                result = xh.responseXML;
              }
              break;
            case "script":
              {
                (1, eval)(result);
              }
              break;
            case "text":
            default:
              {
              }
              break;
          }
        } catch (e) {
          error = e;
        }
        if (error) {
          onerror(error, "parsererror", xh, res);
        } else {
          if (o.success) {
            o.success(result, xh.statusText, xh, res);
          }
          if (done) {
            done(result, xh.statusText, xh, res);
          }
        }
      }, oncomplete = function(xh, res) {
        abort_to && clearTimeout(abort_to);
        var response = xh.responseText || xh.response;
        responseType = jajax.mimeToDataType(xh.getResponseHeader("content-type"));
        if (responseType == "json" && !("responseJSON" in xh)) {
          if (/^\s*$/.test(response)) {
            xh.responseJSON = NULL;
          } else {
            try {
              xh.responseJSON = jajax.parseJSON(response);
            } catch (err) {
            }
          }
        }
        if (xh.status >= 200 && xh.status < 300 || xh.status == 304) {
          onsuccecc(xh, response, res);
        } else {
          onerror(xh.statusText || NULL, xh.status ? "error" : "abort", xh, res);
        }
      };
      each({"X-Requested-With":"XMLHttpRequest"}, setHeader);
      if (o.contentType) {
        setHeader("Content-Type", o.contentType);
      }
      setHeader("Accept", (accepts[o.dataType] ? accepts[o.dataType] + ", " : "") + allTypes + "; q=0.01");
      each(o.headers, setHeader);
      method = method.toLowerCase();
      if (o.data && (method == "get" || method == "head")) {
        url += (url.indexOf("?") < 0 ? "?" : "&") + jajax.param(o.data);
        o.data = NULL;
      }
      if (jajax.xhr_type == "REQUEST") {
        each(o.data, function(n, v, d) {
          if (v == NULL) {
            delete d[n];
          }
        });
        var h = {url:url, content:o.data || {}, headers:{}, onComplete:function(res) {
          if (h.aborted) {
            return;
          }
          var _xhr = {getResponseHeader:function(name) {
            return res.headers[name];
          }, status:res.status, statusText:res.statusText, responseText:res.text, responseJSON:res.json};
          oncomplete(_xhr, res);
        }};
        each(headers, function(i, a) {
          if (a[0] && a[0] != NULL) {
            h.headers[a[0]] = a[1];
          }
        });
        if (o.contentType) {
          h.contentType = o.contentType;
        }
        if (o.timeout > 0) {
          abort_to = setTimeout(function() {
            h.aborted = now();
            onerror(NULL, "timeout", xhr);
          }, o.timeout);
        }
        try {
          xhr.Request(h)[method]();
        } catch (er$0) {
          try {
            h.headers["X-HTTP-Method-Override"] = method.toUpperCase();
            xhr.Request(h)["post"]();
          } catch (er) {
            switch(method) {
              case "delete":
                {
                  var XHR = require("sdk/net/xhr");
                  var req = new XHR.XMLHttpRequest;
                  req.open(method, url);
                  each(h.headers, function(n, v) {
                    req.setRequestHeader(n, v);
                  });
                  req.send();
                  oncomplete(req);
                }
                break;
              default:
                throw er;
            }
          }
        }
      } else {
        xhr.open(method, url, TRUE);
        each(headers, function(i, a) {
          if (a[1] != NULL) {
            xhr.setRequestHeader(a[0], a[1] + NIL);
          }
        });
        if (o.timeout > 0) {
          abort_to = setTimeout(function() {
            xhr.onreadystatechange = noop;
            xhr.abort();
            onerror(NULL, "timeout", xhr);
          }, o.timeout);
        }
        var callback = function() {
          if (xhr.readyState == 4) {
            xhr.onreadystatechange = noop;
            oncomplete(xhr);
          }
        };
        xhr.send(o.data ? typeof o.data == "string" ? o.data : jajax.param(o.data) : NULL);
        if (xhr.readyState === 4) {
          setTimeout(callback);
        } else {
          xhr.onreadystatechange = callback;
        }
      }
      return xhr;
    };
    function type(obj) {
      if (obj === null) {
        return "Null";
      }
      if (obj === undefined) {
        return "Undefined";
      }
      return tos.call(obj).slice(8, -1);
    }
    function isFunction(obj) {
      return obj instanceof Function || type(obj) == "Function";
    }
    function isArrayLike(obj) {
      return hop.call(obj, LENGTH) && typeof obj[LENGTH] === "number" && !isFunction(obj);
    }
    function each(o, f) {
      if (!o) {
        return o;
      }
      if (isArray(o) || isArrayLike(o)) {
        for (var i = 0, l = o[LENGTH] >>> 0; i < l; i++) {
          if (hop.call(o, i)) {
            var s = o[i];
            if (f.call(s, i, s, o) === FALSE) {
              return i;
            }
          }
        }
      } else {
        for (var i$1 in o) {
          if (hop.call(o, i$1)) {
            var s$2 = o[i$1];
            if (f.call(s$2, i$1, s$2, o) === FALSE) {
              return i$1;
            }
          }
        }
      }
      return o;
    }
    function extend(o) {
      var cpy = function(i, s) {
        o[i] = s;
      };
      each(arguments, function(i, a) {
        i && each(a, cpy);
      });
      return o;
    }
    (function(escape, JSON, $) {
      function serialize(params, obj, traditional, scope) {
        var array = isArray(obj);
        var hash = obj && obj !== root && !array && Object.getPrototypeOf(obj) === __;
        each(obj, function(key, value) {
          var type = isArray(value) ? "array" : typeof value;
          if (scope) {
            key = traditional ? scope : scope + "[" + (hash || type == "object" || type == "array" ? key : "") + "]";
          }
          if (!scope && array) {
            params.add(value.name, value.value);
          } else {
            if (type == "array" || !traditional && type == "object") {
              serialize(params, value, traditional, key);
            } else {
              params.add(key, value);
            }
          }
        });
      }
      $.param = function(obj, traditional) {
        var params = [];
        params.add = function(k, v) {
          this.push(escape(k) + (v == NULL ? "" : "=" + escape(v)));
        };
        serialize(params, obj, traditional);
        return params.join("&").replace(/%20/g, "+");
      };
      var scriptTypeRE = /^(?:text|application)\/javascript/i;
      var xmlTypeRE = /^(?:text|application)\/xml/i;
      var jsonType = "application/json";
      var htmlType = "text/html";
      $.mimeToDataType = function(mime) {
        if (mime) {
          mime = mime.split(";", 2)[0];
        }
        return mime && (mime == htmlType ? "html" : mime == jsonType ? "json" : scriptTypeRE.test(mime) ? "script" : xmlTypeRE.test(mime) && "xml") || "text";
      };
      var _jdec = JSON && JSON.parse || root.json_decode;
      $.parseJSON = function(text) {
        try {
          return _jdec(text);
        } catch (err) {
          var txt = text.replace(/[\n\r]+\s*\/\/[^\n\r]*/g, "");
          if (txt != text) {
            return _jdec(txt);
          }
          throw err;
        }
      };
      $.createXHR = function(xhr) {
        var meths = {XMLHttpRequest:function() {
          return new root.XMLHttpRequest;
        }, MSXML2:function() {
          return new ActiveXObject("Msxml2.XMLHTTP");
        }, MSXML:function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }, MSXML24:function() {
          return new ActiveXObject("Msxml2.XMLHTTP.4.0");
        }, REQUEST:function() {
          return require("sdk/request");
        }, node_XMLHttpRequest:function() {
          var $jscomp$destructuring$var1 = require("xmlhttprequest");
          var XMLHttpRequest = $jscomp$destructuring$var1.XMLHttpRequest;
          return new XMLHttpRequest;
        }};
        each(meths, function(type, _xhr) {
          try {
            xhr = _xhr();
            $.createXHR = _xhr;
            $.xhr_type = type;
            return FALSE;
          } catch (e) {
          }
        });
        return xhr;
      };
      $.xhr_supported = $.createXHR(FALSE);
    })(encodeURIComponent, JSON, jajax);
    jajax.name = name;
    jajax.version = version;
    return jajax;
  });
})("jajax", typeof global == "undefined" ? this : global, Object, Array, Function, Date);

