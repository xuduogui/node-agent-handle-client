/*
 * @Author: xuziyong
 * @Date: 2021-09-25 23:20:08
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-09-25 23:55:00
 * @Description: TODO
 */
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import {
  babel
} from '@rollup/plugin-babel';
import {
  terser
} from "rollup-plugin-terser";


export default {
  input: 'index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [resolve(), commonjs(), json(), babel({
    babelHelpers: 'bundled'
  }), 
  terser({
    compress: {
      drop_console: true
    }
  })
]
};