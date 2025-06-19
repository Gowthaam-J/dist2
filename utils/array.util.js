"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtil = void 0;
class ArrayUtil {
    static splitIntoChunk(array, chunkSize) {
        const arr = Array.from(array);
        return [...Array(Math.ceil(arr.length / chunkSize))]
            .map(() => arr.splice(0, chunkSize));
    }
    static intersection(arr1, arr2) {
        return arr1.filter((v) => arr2.includes(v));
    }
    static union(arr1, arr2) {
        return [...new Set([...arr1, ...arr2])];
    }
    static difference(arr1, arr2) {
        return arr1.filter((v) => !arr2.includes(v));
    }
}
exports.ArrayUtil = ArrayUtil;
//# sourceMappingURL=array.util.js.map