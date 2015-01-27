// -----------------------------------------------------
/**
 *  Specs for jAJAX.
 *
 *  @TODO: Write tests
 *
 *  @author Dumitru Uzun (contact@DUzun.Me)
 *
 */
// -----------------------------------------------------
;(function (name, root) {
  'use strict';

  (typeof define == 'function' && define.amd
      ? define
      : (function (require) {
          return typeof module != 'undefined' && module.exports
              ? function (deps, factory) { module.exports = factory(require, module, require('../jajax')); }
              : function (deps, factory) { root[name] = factory(require, undefined, root.jajax); }
      }
      (typeof require == 'function' ? require : function (id){return root[id]}))
  )
  /*define*/(
  ['require', 'module'
      , '../jajax'
  ]
  , function (require, module, jajax) {

    var cons = jajax
    ,   log = function () {
          console.log.apply(console, arguments);
        }
    ;
    if ( typeof dump == 'function' ) cons.debug = dump;


    describe("jajax", function () {
        it('should have version property', function () {
            expect(cons.version).toBeDefined();
        });
    });

    // @TODO: write tests

  });

}('jajaxSpec', typeof global == 'undefined' ? this : global));
