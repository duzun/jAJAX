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
              ? function (deps, factory) {
                    var req = require;
                    var mod = '..';
                    // try {
                    //     const esm = require('esm')(module);
                    //     req = (id) => {
                    //         let mod = esm(id);
                    //         return mod.default || mod;
                    //     };
                    //     mod = '../jajax';
                    // } catch(err) {};

                    module.exports = factory(require, module, req(mod));
                }
              : function (deps, factory) { root[name] = factory(require, undefined, root.jajax); }
              ;
      }
      (typeof require == 'function' ? require : function (id){return root[id]}))
  )
  /*define*/(
  ['require', 'module'
      , '../dist/jajax'
  ]
  , function (require, module, jajax) {

    var log = console.log.bind(console);

    if ( typeof dump == 'function' ) jajax.debug = dump;

    describe("jajax", function () {
        it('should be a function', function () {
            expect(typeof jajax).toBe('function');
        });

        it('should have version property', function () {
            expect(jajax.version).toBeDefined();
        });

        describe('.createXHR()', function () {
            it('should return an object', function () {
                var xhr = jajax.createXHR();
                expect(xhr).toBeTruthy();
                expect(typeof xhr.open).toBe('function');
                expect(typeof xhr.send).toBe('function');
            });
        });
    });

    // @TODO: write tests

  });

}('jajaxSpec', typeof global == 'undefined' ? this : global));
