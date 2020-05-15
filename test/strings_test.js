/*global describe, it*/


'use strict';

import pako from "../mod.js";
import { cmpBuf as cmp } from "./helpers.js";
import * as assert from "https://deno.land/std@v0.50.0/testing/asserts.ts";
import * as path from "https://deno.land/std@v0.50.0/path/mod.ts";
import * as strings from "../lib/utils/strings.js";
import b from "./buffer_from.js";

import { dirname } from "./helpers.js";
const { __dirname } = dirname(import.meta);

const _td = new TextDecoder();
const bufToString = d => _td.decode(d);

const it = (name, fn) => Deno.test({
  name,
  fn
}),
describe = (_, func) => func();

// fromCharCode, but understands right > 0xffff values
function fixedFromCharCode(code) {
  /*jshint bitwise: false*/
  if (code > 0xffff) {
    code -= 0x10000;

    var surrogate1 = 0xd800 + (code >> 10),
        surrogate2 = 0xdc00 + (code & 0x3ff);

    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(code);
}

// Converts array of codes / chars / strings to utf16 string
function a2utf16(arr) {
  var result = '';
  arr.forEach(function (item) {
    if (typeof item === 'string') { result += item; return; }
    result += fixedFromCharCode(item);
  });
  return result;
}




describe('Encode/Decode', function () {

  // Create sample, that contains all types of utf8 (1-4byte) after conversion
  var utf16sample = a2utf16([ 0x1f3b5, 'a', 0x266a, 0x35, 0xe800, 0x10ffff, 0x0fffff ]);
  // use node Buffer internal conversion as "done right"
  var utf8sample = b(utf16sample);

  it('utf-8 border detect', function () {
    var ub = strings.utf8border;
    assert.assertEquals(ub(utf8sample, 1), 1);
    assert.assertEquals(ub(utf8sample, 2), 2);
    assert.assertEquals(ub(utf8sample, 3), 3);
    assert.assertEquals(ub(utf8sample, 4), 4);

    assert.assertEquals(ub(utf8sample, 5), 5);

    assert.assertEquals(ub(utf8sample, 6), 5);
    assert.assertEquals(ub(utf8sample, 7), 5);
    assert.assertEquals(ub(utf8sample, 8), 8);

    assert.assertEquals(ub(utf8sample, 9), 9);

    assert.assertEquals(ub(utf8sample, 10), 9);
    assert.assertEquals(ub(utf8sample, 11), 9);
    assert.assertEquals(ub(utf8sample, 12), 12);

    assert.assertEquals(ub(utf8sample, 13), 12);
    assert.assertEquals(ub(utf8sample, 14), 12);
    assert.assertEquals(ub(utf8sample, 15), 12);
    assert.assertEquals(ub(utf8sample, 16), 16);

    assert.assertEquals(ub(utf8sample, 17), 16);
    assert.assertEquals(ub(utf8sample, 18), 16);
    assert.assertEquals(ub(utf8sample, 19), 16);
    assert.assertEquals(ub(utf8sample, 20), 20);
  });

});


describe('Deflate/Inflate strings', function () {

  var file = path.join(__dirname, 'fixtures/samples/lorem_utf_100k.txt');
  var sampleString = bufToString(Deno.readFileSync(file));
  var sampleArray  = Deno.readFileSync(file);
  

  it('Deflate javascript string (utf16) on input', function () {
    assert.assert(cmp(
      pako.deflate(sampleString),
      pako.deflate(sampleArray)
    ));
  });

  it('Inflate binary string input', function () {
    var deflatedString = pako.deflate(sampleArray);
    var deflatedArray  = pako.deflate(sampleArray);
    assert.assert(cmp(pako.inflate(deflatedString), pako.inflate(deflatedArray)));
  });
});
