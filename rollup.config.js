// rollup.config.js
import babel from 'rollup-plugin-babel';
// import { terser } from 'rollup-plugin-terser'; // Use gccs for better results
import {
    module
  , main
//   , unpkg
} from './package.json';

export default {
    input: module,
    plugins: [
        babel() // convert to ES5
    ],
    output: [
        {
            file: main,
            name: 'jajax',
            format: 'umd',
            exports: 'default',
            // sourcemap: true,
        },
        // {
        //     file: unpkg,
        //     name: 'jajax',
        //     format: 'umd',
        //     exports: 'default',
        //     // sourcemap: true,
        //     plugins: [
        //         terser(), // minify JS/ES
        //     ],
        // },
    ]
};
