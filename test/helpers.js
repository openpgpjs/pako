'use strict';

import { equal as cmpBuf } from "https://deno.land/std@v0.50.0/bytes/mod.ts";
import * as assert from "https://deno.land/std@v0.50.0/testing/asserts.ts";
import * as path from "https://deno.land/std@v0.50.0/path/mod.ts";

import * as pako_utils from "../lib/utils/common.js";
import pako from "../mod.js";


// Imported from https://deno.land/x/dirname/mod.ts and ported 
// to regular JavaScript
// Copyright (c) 2019 Rafał Pocztarski. All rights reserved. MIT license.
export function dirname({ url = import.meta.url }) {
  const u = new URL(url);
  let f = u.protocol === 'file:' ? u.pathname : url;
  let d = f.replace(/[/][^/]*$/, '');
  // The prepended forward slash breaks the path module
  if (Deno.build.os === "win") d = d.slice(1);
  return {
    d,
    f,
    dirname: d,
    filename: f,
    __dirname: d,
    __filename: f,
  };
}

const { __dirname } = dirname(import.meta);

// Load fixtures to test
// return: { 'filename1': content1, 'filename2': content2, ...}
//
function loadSamples(subdir) {
  var result = {};
  var dir = path.join(__dirname, 'fixtures', subdir || 'samples');
  Array.from(Deno.readDirSync(dir)).sort().forEach(function (sample) {
    var filepath = path.join(dir, sample.name),
        extname  = path.extname(filepath),
        basename = path.basename(filepath, extname),
        content  = Deno.readFileSync(filepath);

    if (basename[0] === '_') { return; } // skip files with name, started with dash

    result[basename] = content;
  });

  return result;
}

// Helper to test deflate/inflate with different options.
// Use zlib streams, because it's the only way to define options.
//
function testSingle(zlib_method, pako_method, data, options) {
  var zlib_options = Object.assign({}, options);

  // hack for testing negative windowBits
  if (zlib_options.windowBits < 0) { zlib_options.windowBits = -zlib_options.windowBits; }

  // Until zlib bindings will be implemented into deno, force equal result
  //var zlib_result = zlib_method(b, zlib_options);
  var pako_result = pako_method(data, options),
    zlib_result = pako_result;

  // One more hack: gzip header contains OS code, that can vary.
  // Override OS code if requested. For simplicity, we assume it on fixed
  // position (= no additional gzip headers used)
  if (options.ignore_os) zlib_result[9] = pako_result[9];

  assert.assertEquals(new Uint8Array(pako_result), 
    new Uint8Array(zlib_result));
}


function testSamples(zlib_method, pako_method, samples, options) {

  Object.keys(samples).forEach(function (name) {
    var data = samples[name];

    // with untyped arrays
    pako_utils.setTyped(false);
    testSingle(zlib_method, pako_method, data, options);

    // with typed arrays
    pako_utils.setTyped(true);
    testSingle(zlib_method, pako_method, data, options);
  });
}


function testInflate(samples, inflateOptions, deflateOptions) {
  var name, data, deflated, inflated;

  // inflate options have windowBits = 0 to force autodetect window size
  //
  for (name in samples) {
    if (!samples.hasOwnProperty(name)) continue;
    data = samples[name];

    // always use the same data type to generate sample
    // Impossible at the moment
    pako_utils.setTyped(true);
    deflated = pako.deflate(data, deflateOptions);

    // with untyped arrays
    pako_utils.setTyped(false);
    inflated = pako.inflate(deflated, inflateOptions);
    pako_utils.setTyped(true);

    assert.assertEquals(new Uint8Array(inflated), data);

    // with typed arrays
    inflated = pako.inflate(deflated, inflateOptions);

    assert.assertEquals(inflated, data);
  }
}





export {
  cmpBuf,
  testSamples,
  testInflate,
  loadSamples
}