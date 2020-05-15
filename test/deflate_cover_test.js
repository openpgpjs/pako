// Deflate coverage tests
'use strict';



import c from "../lib/zlib/constants.js";
import msg from "../lib/zlib/messages.js";
import pako from "../mod.js";
import * as zlib_deflate from "../lib/zlib/deflate.js";
import ZStream from "../lib/zlib/zstream.js";
import * as assert from "https://deno.land/std@v0.50.0/testing/asserts.ts";
import * as path from "https://deno.land/std@v0.50.0/path/mod.ts";

import { dirname } from "./helpers.js";
const { __dirname } = dirname(import.meta);


var short_sample = 'hello world';
var long_sample = Deno.readFileSync(path.join(__dirname, 'fixtures/samples/lorem_en_100k.txt'));

function testDeflate(data, opts, flush) {
  var deflator = new pako.Deflate(opts);
  deflator.push(data, flush);
  deflator.push(data, true);

  assert.equal(deflator.err, false, msg[deflator.err]);
}
const it = (name, fn) => Deno.test({
  name,
  fn
}),
describe = (_, func) => func();

describe('Deflate support', function () {
  it('stored', function () {
    testDeflate(short_sample, { level: 0, chunkSize: 200 }, 0);
    testDeflate(short_sample, { level: 0, chunkSize: 10 }, 5);
  });
  it('fast', function () {
    testDeflate(short_sample, { level: 1, chunkSize: 10 }, 5);
    testDeflate(long_sample, { level: 1, memLevel: 1, chunkSize: 10 }, 0);
  });
  it('slow', function () {
    testDeflate(short_sample, { level: 4, chunkSize: 10 }, 5);
    testDeflate(long_sample, { level: 9, memLevel: 1, chunkSize: 10 }, 0);
  });
  it('rle', function () {
    testDeflate(short_sample, { strategy: 3 }, 0);
    testDeflate(short_sample, { strategy: 3, chunkSize: 10 }, 5);
    testDeflate(long_sample, { strategy: 3, chunkSize: 10 }, 0);
  });
  it('huffman', function () {
    testDeflate(short_sample, { strategy: 2 }, 0);
    testDeflate(short_sample, { strategy: 2, chunkSize: 10 }, 5);
    testDeflate(long_sample, { strategy: 2, chunkSize: 10 }, 0);

  });
});

describe('Deflate states', function () {
  //in port checking input parameters was removed
  it('inflate bad parameters', function () {
    var ret, strm;

    ret = zlib_deflate.deflate(null, 0);
    assert.assert(ret === c.Z_STREAM_ERROR);

    strm = new ZStream();

    ret = zlib_deflate.deflateInit(null);
    assert.assert(ret === c.Z_STREAM_ERROR);

    ret = zlib_deflate.deflateInit(strm, 6);
    assert.assert(ret === c.Z_OK);

    ret = zlib_deflate.deflateSetHeader(null);
    assert.assert(ret === c.Z_STREAM_ERROR);

    strm.state.wrap = 1;
    ret = zlib_deflate.deflateSetHeader(strm, null);
    assert.assert(ret === c.Z_STREAM_ERROR);

    strm.state.wrap = 2;
    ret = zlib_deflate.deflateSetHeader(strm, null);
    assert.assert(ret === c.Z_OK);

    ret = zlib_deflate.deflate(strm, c.Z_FINISH);
    assert.assert(ret === c.Z_BUF_ERROR);

    ret = zlib_deflate.deflateEnd(null);
    assert.assert(ret === c.Z_STREAM_ERROR);

    //BS_NEED_MORE
    strm.state.status = 5;
    ret = zlib_deflate.deflateEnd(strm);
    assert.assert(ret === c.Z_STREAM_ERROR);
  });
});
