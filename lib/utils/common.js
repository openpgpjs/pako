


var TYPED_OK = typeof Uint8Array !== "undefined" &&
  typeof Uint16Array !== "undefined" &&
  typeof Int32Array !== "undefined";

function _has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function assign(obj /*...args obj, from1, from2, from3, ...*/) {
    var sources = Array.prototype.slice.call(arguments, 1);
    while (sources.length) {
        var source = sources.shift();
        if (!source) {
            continue; 
        }

        if (typeof source !== "object") {
            throw new TypeError(source + "must be non-object");
        }

        for (var p in source) {
            if (_has(source, p)) {
                obj[p] = source[p];
            }
        }
    }

    return obj;
    //return Object.assign(...args);
}


// reduce buffer size, avoiding mem copy
export function shrinkBuf(buf, size) {
    if (buf.length === size) {
        return buf; 
    }
    if (buf.subarray) {
        return buf.subarray(0, size); 
    }
    buf.length = size;
    return buf;
}


const fnTyped = {
    arraySet: function (dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
            dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
            return;
        }
        // Fallback to ordinary array
        for (let i = 0; i < len; i++) {
            dest[dest_offs + i] = src[src_offs + i];
        }
    },
    // Join array of chunks to single array.
    flattenChunks: function (chunks) {
        let i, l, len, pos, chunk;

        // calculate data length
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
            len += chunks[i].length;
        }

        // join chunks
        const result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
            chunk = chunks[i];
            result.set(chunk, pos);
            pos += chunk.length;
        }

        return result;
    }
};

const fnUntyped = {
    arraySet: function (dest, src, src_offs, len, dest_offs) {
        for (let i = 0; i < len; i++) {
            dest[dest_offs + i] = src[src_offs + i];
        }
    },
    // Join array of chunks to single array.
    flattenChunks: function (chunks) {
        return [].concat.apply([], chunks);
    }
};


// Enable/Disable typed arrays use, for testing
//

export let Buf8 = TYPED_OK ? Uint8Array : Array;
export let Buf16 = TYPED_OK ? Uint16Array : Array;
export let Buf32 = TYPED_OK ? Int32Array : Array;
export let flattenChunks = TYPED_OK ? fnTyped.flattenChunks : fnUntyped.flattenChunks;
export let arraySet = TYPED_OK ? fnTyped.arraySet : fnUntyped.arraySet;
export function setTyped(on) {
    if (on) {
        Buf8 = Uint8Array;
        Buf16 = Uint16Array;
        Buf32 = Int32Array;
        ({ flattenChunks, arraySet } = fnTyped);
    } else {
        Buf8 = Array;
        Buf16 = Array;
        Buf32 = Array;
        ({ flattenChunks, arraySet } = fnUntyped);
    }
}