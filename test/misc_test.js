/*global describe, it*/


'use strict';

import pako from "../mod.js";
import * as assert from "https://deno.land/std@v0.50.0/testing/asserts.ts";
import * as path from "https://deno.land/std@v0.50.0/path/mod.ts";

import { dirname } from "./helpers.js";
const { __dirname } = dirname(import.meta);

const it = (name, fn) => Deno.test({
  name,
  fn
}),
describe = (_, func) => func();

describe('ArrayBuffer', function () {

  var file   = path.join(__dirname, 'fixtures/samples/lorem_utf_100k.txt');
  var sample = Deno.readFileSync(file);
  var deflated = pako.deflate(sample);
  const buffer = sample.buffer.slice(sample.byteOffset, sample.byteLength);

  it('Deflate ArrayBuffer', function () {
    assert.assertEquals(deflated, pako.deflate(buffer));
  });

  it('Inflate ArrayBuffer', function () {
    assert.assertEquals(sample, pako.inflate(deflated.buffer));
  });

  // no minified version available
  /*it('Simplified minified version test', function () {
    // At some point minifier started to corrupt str2buf function
    // https://github.com/nodeca/pako/issues/161#issuecomment-468420555
    var minified = require('../dist/pako.min.js');

    assert.assert(cmp(minified.deflate('→'), pako.deflate('→')));
  });*/
});
