

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

export default class ZStream {
    /* next input byte */
    input = null; // JS specific, because we have no pointers
    next_in = 0;
    /* number of bytes available at input */
    avail_in = 0;
    /* total number of input bytes read so far */
    total_in = 0;
    /* next output byte should be put there */
    output = null; // JS specific, because we have no pointers
    next_out = 0;
    /* remaining free space at output */
    avail_out = 0;
    /* total number of bytes output so far */
    total_out = 0;
    /* last error message, NULL if no error */
    msg = ""/*Z_NULL*/;
    /* not visible by applications */
    state = null;
    /* best guess about the data type: binary or text */
    data_type = 2/*Z_UNKNOWN*/;
    /* adler32 value of the uncompressed data */
    adler = 0;
}