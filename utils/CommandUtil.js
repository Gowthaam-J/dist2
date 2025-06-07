"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandUtil = void 0;
const logger_1 = require("../logger");
class CommandUtil {
    static detectDebugOption(cmd) {
        if (!cmd.getOptionValue('debug')) {
            return;
        }
        (0, logger_1.toggleDebugConsole)();
    }
}
exports.CommandUtil = CommandUtil;
//# sourceMappingURL=CommandUtil.js.map