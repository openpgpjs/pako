export default function bufferFrom(value, offset, len) {
    if (value instanceof ArrayBuffer) {
        offset >>>= 0;
        const maxLength = value.byteLength - offset;
        if (maxLength < 0) throw new RangeError("out of bounds");
        if (len == null) {
            len = maxLength;
        } else {
            len >>>= 0;
            if (len > maxLength) throw new RangeError("out of bounds");
        }

        return new Uint8Array(value.slice(offset, offset + len));
    } else if (typeof value === "string") {
        // binEncode
        if (offset) {
            const buf = new Uint8Array(value.length);
            buf.set([...value].map(s => s.charCodeAt(0)),0);
            return buf;
        }

        const te = new TextEncoder();
        return te.encode(value);
    }
}