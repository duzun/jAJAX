/**
 *  jQuery-like AJAX for any environment
 *  (Browser, Firefox, Chrome and Safari Extensions).
 *
 *  Ex: jajax(options: object, ondone: function, onerror: function)
 *          function ondone(result, statusText, xhr[, response]);
 *          function onerror(statusText, type: [error|parsererror|abort|timeout], xhr[, response]);
 *
 *          On Firefox there is response object instead of XHR, xhr is a plain object
 *
 *  @author DUzun.Me
 *  @license ☺
 *  @version 1.0.0
 *  @git https://github.com/duzun/jAJAX
 */
;(function (win, String, Function, Object, Array, Date) {

    // -------------------------------------------------------------
    ;(Date.now instanceof Function) || (Date.now = function now() { return +(new Date) });
    // -------------------------------------------------------------
    var undefined
    ,   NIL   = ''
    ,   TRUE  = true
    ,   FALSE = false
    ,   NULL  = null
    ,   UNDEF = undefined + NIL
    ,   noop  = Object.noop || function () {}
    ,   hop   = Object.prototype.hasOwnProperty
    // ,   _startup_time_ = Date.now()
    // ,   _unqidc_ = 0
    // ,   uniq = function uniq() { return ++_unqidc_ }
    // ,   tick = function tick() { return Date.now() - _startup_time_ }
    ;
    // -------------------------------------------------------------
    // Helpers
    var each = function each(o, f) {
        if(!o) return o;
        var i, s, l = 'length';
        if(o instanceof Array || hop.call(o, l) && typeof o[l] === 'number' && !(o instanceof Function)) {
            for(i=0,l=o[l]>>>0; i<l; i++) if(hop.call(o, i)) {
                s = o[i];
                if(f.call(s, i, s, o) === false) return i;
            }
        }
        else {
            for(i in o) if(hop.call(o, i)) {
                s = o[i];
                if(f.call(s, i, s, o) === false) return i;
            }
        }
        return o
    } ;
    // -------------------------------------------------------------
    var extend = function extend(o) {
        function cpy(i,s) { o[i] = s };
        each(arguments, function (i,a) { i && each(a, cpy) });
        return o
    } ;
    // -------------------------------------------------------------
    var TIMERS = typeof self !== UNDEF && self.setTimeout instanceof Function ? self : win;
    if(!(TIMERS.setTimeout instanceof Function)) {
        if(typeof require !== UNDEF) {
            TIMERS = require('sdk/timers');
        }
    }

    var setTimeout    = TIMERS.setTimeout
    ,   clearTimeout  = TIMERS.clearTimeout
    // ,   setInterval   = TIMERS.setInterval
    // ,   clearInterval = TIMERS.clearInterval
    ;
    // -------------------------------------------------------------
    var allTypes = "*/" + "*"
    ,   accepts = {
            "*" : allTypes,
            text: "text/plain",
            html: "text/html",
            xml : "application/xml, text/xml",
            json: "application/json, text/javascript"
        }
    ;
    // -------------------------------------------------------------
    // AJAX method itself
    var jajax = function jajax(o,done,fail) {
        var xhr = jajax.createXHR(FALSE);
        if(!xhr) {
            fail && fail('Couldn\'t create XHR object');
            return xhr
        }

        if(typeof o == 'string') o = {url:o};

        o = extend({
            url        : '',    // String
            type       : 'GET', // String
            cache      : FALSE, // Bool
            timeout    : NULL,  // Number
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // String
            dataType   : '',    // String
            mimeType   : '',    // String
            data       : NULL,  // Object
            headers    : NULL,  // Object
            error      : NULL,  // Function
            success    : NULL   // Function
        }, o);

        var headers = {}
        ,   setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] }
        ,   type = o.type
        ,   abort_to
        ,   onerror = function (error, type, xh, res) {
                if(o.error) {
                    o.error(xh || res, type, error, res);
                }
                if(fail) {
                    fail(xh || res, type, error, res);
                }
            }
        ,   onsuccecc = function (xh, res) {
                var result = xh.responseText
                ,   dataType = o.dataType || jajax.mimeToDataType(o.mimeType || xh.getResponseHeader('content-type'))
                ,   error
                ;
                try {
                    switch(dataType) {
                        case 'json': {
                            result = 'responseJSON' in xh ? xh.responseJSON : (/^\s*$/.test(result) ? NULL : jajax.parseJSON(result));
                        } break;

                        case 'xml': {
                            result = xh.responseXML;
                        } break;

                        case 'script': {
                            // http://perfectionkills.com/global-eval-what-are-the-options/
                            (1,eval)(result);
                        } break;

                        case 'text':
                        default: {
                            // result = xh.responseText
                        } break;
                    }
                } catch (e) { error = e }

                if (error) onerror(error, 'parsererror', xh, res)
                else {
                    if (o.success) {
                        o.success(result, xh.statusText, xh, res);
                    }
                    if(done) {
                        done(result, xh.statusText, xh, res);
                    }
                }
            }
        ,   oncomplete = function (xh, res) {
                abort_to && clearTimeout(abort_to);
                if( (xh.status >= 200 && xh.status < 300) || xh.status == 304 ) {
                    onsuccecc(xh, res);
                }
                else {
                    onerror(xh.statusText || NULL, xh.status ? 'error' : 'abort', xh, res);
                }
            }
        ;

        each({'X-Requested-With': 'XMLHttpRequest'}, setHeader);

        if(o.contentType) {
            setHeader('Content-Type', o.contentType);
        }
        setHeader('Accept', (accepts[o.dataType] ? accepts[o.dataType] + ', ': '') + allTypes + '; q=0.01');

        each(o.headers, setHeader);

        if(jajax.xhr_type == 'REQUEST') {
            each(o.data, function (n,v,d) { if(v == NULL) delete d[n]; });
            var h = {
                    url: o.url,
                    content: o.data ? o.data : {},
                    headers: {},
                    onComplete: function(res) {
                        if(h.aborted) return;
                        var _xhr = {
                            'getResponseHeader': function(name) {
                                return res.headers[name];
                            },
                            'status': res.status,
                            'statusText': res.statusText,
                            'responseText': res.text,
                            'responseJSON': res.json
                        };
                        oncomplete(_xhr, res);
                    }
                }
            ;
            each(headers, function (i,a) { if(a[0] && a[0] != NULL) h.headers[a[0]] = a[1] });
            if(o.contentType) h.contentType = o.contentType

            if (o.timeout > 0) abort_to = setTimeout(function() {
                h.aborted = Date.now();
                // xhr.abort(); // @todo: abort request
                onerror(NULL, 'timeout', xhr);
            }, o.timeout);

            type = type.toLowerCase();
            try {
                xhr.Request(h)[type]();
            }
            catch(er) {
                // If method type not supported. try to override it
                try {
                    h.headers['X-HTTP-Method-Override'] = type.toUpperCase();
                    xhr.Request(h)['post']();
                }
                catch(er) {
                    // If override doesn't work, try XHR - synchronous in FF
                    switch (type) {
                        case 'delete': {
                            // Firefox REQUEST object doesn't support DELETE,
                            // need to create manual xhr object
                            var XHR = require("sdk/net/xhr");
                            var req = new XHR.XMLHttpRequest();
                            req.open(type, o.url);
                            each(h.headers, function (n,v) { req.setRequestHeader(n, v) });
                            req.send();
                            oncomplete(req);
                        } break;
                        default: throw er;
                    }
                }
            }
        }
        else {
            type = type.toUpperCase();
            xhr.open(type, o.url, TRUE);

            each(headers, function (i,a) { if(a[1] != NULL) xhr.setRequestHeader( a[0], a[1] + NIL ) });

            if (o.timeout > 0) abort_to = setTimeout(function() {
                xhr.onreadystatechange = noop;
                xhr.abort();
                onerror(NULL, 'timeout', xhr);
            }, o.timeout);

            var callback = function() {
                if (xhr.readyState == 4) {
                    xhr.onreadystatechange = noop;
                    oncomplete(xhr);
                }
            };

            xhr.send(o.data ? jajax.param(o.data) : NULL);

            if(xhr.readyState === 4) {
                // (IE6 & IE7) if it's in cache and has been
                // retrieved directly we need to fire the callback
                setTimeout( callback );
            }
            else {
                xhr.onreadystatechange = callback;
            }
        }

        return xhr;
    };

    ;(function (escape, JSON, $) {
        function serialize(params, obj, traditional, scope) {
            var type
            ,   array = obj instanceof Array
            ,   hash = obj && obj !== win && !array && Object.getPrototypeOf(obj) == Object.prototype
            ;
            each(obj, function(key, value) {
                type = value instanceof Array ? 'array' : typeof(value);
                if (scope) key = traditional ? scope :
                    scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
                // handle data in serializeArray() format
                if (!scope && array) params.add(value.name, value.value)
                // recurse into nested objects
                else if (type == "array" || (!traditional && type == "object"))
                    serialize(params, value, traditional, key)
                else params.add(key, value)
            })
        };

        $.param = function(obj, traditional) {
            var params = [];
            params.add = function(k, v) { this.push( escape(k) + ( v == NULL ? '' : '=' + escape(v) ) ) };
            serialize(params, obj, traditional);
            return params.join('&').replace(/%20/g, '+');
        };

        var scriptTypeRE = /^(?:text|application)\/javascript/i
        ,   xmlTypeRE = /^(?:text|application)\/xml/i
        ,   jsonType = 'application/json'
        ,   htmlType = 'text/html'
        ;
        $.mimeToDataType = function (mime) {
            if (mime) mime = mime.split(';', 2)[0]
            return  mime && (
                        mime == htmlType ? 'html' :
                        mime == jsonType ? 'json' :
                        scriptTypeRE.test(mime) ? 'script' :
                        xmlTypeRE.test(mime) && 'xml'
                    ) || 'text'
        };

        var _jdec = JSON && JSON.parse || win.json_decode;
        $.parseJSON = function (text) {
            try { return _jdec(text) }
            catch(err) {
                // Try to remove one line comments
                var txt = text.replace(/[\n\r]+\s*\/\/[^\n\r]*/g, '');
                if(txt != text) {
                    return _jdec(txt);
                }
                throw err
            }
        }

        // Functions to create xhrs
        $.createXHR = function (xhr) {
            var meths = {
                XMLHttpRequest: function _XMLHttpRequest() { return new win.XMLHttpRequest() }
              , XMLHTTP: function _XMLHTTP() { return new win.ActiveXObject( 'Microsoft.XMLHTTP' ) }
                // Lacks DELETE method
              , REQUEST: function _REQUEST() {
                    // synchronous only and experimental
                    // var XHR = require("sdk/net/xhr");

                    var xhr = _REQUEST.xhr || (_REQUEST.xhr = require("sdk/request"));
                    return xhr
                }
            }
            each(meths, function (type, _xhr) {
                try {
                    xhr = _xhr();
                    $.createXHR = _xhr;
                    $.xhr_type = type;
                    return false;
                }
                catch( e ) { }
            })
            return xhr
        };

        // Check if XHR is supported
        $.xhr_supported = $.createXHR(FALSE);

    })(encodeURIComponent, win.JSON, jajax);

    // Export:
    win.jajax = jajax;

    if(typeof module != UNDEF && module.exports) module.exports = jajax; // CommonJs export
    if(typeof define == 'function' && define.amd) define([], function() { return jajax; }); // AMD

})(this, String, Function, Object, Array, Date);

