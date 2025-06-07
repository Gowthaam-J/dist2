"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanUtil = void 0;
class BooleanUtil {
    static fromString(s) {
        if (!s)
            return false;
        return /^1|(?:true)$/i.test(s);
    }
}
exports.BooleanUtil = BooleanUtil;
//# sourceMappingURL=boolean.util.js.map