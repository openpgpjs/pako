// Top level file is just a mixin of submodules & constants
'use strict';

import * as deflate from "./lib/deflate.js";
import * as inflate from "./lib/inflate.js";
import constants from "./lib/zlib/constants.js";

const pako = {
    ...deflate,
    ...inflate,
    constants
};

export default pako;
export * from "./lib/deflate.js";
export * from "./lib/inflate.js";
export { default as constants } from "./lib/zlib/constants.js";