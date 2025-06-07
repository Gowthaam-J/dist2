"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterUtil = void 0;
class TwitterUtil {
    /**
     * Returns the URL of a Twitter user, provided their username
     * @param {string} username - Username
     * @returns {string} User URL
     */
    static getUserUrl(username) {
        return `https://twitter.com/${username}`;
    }
    /**
     * Returns the URL of a Twitter Space, provided its identifier
     * @param {string} spaceId - Space identifier
     * @returns {string} Space URL
     */
    static getSpaceUrl(spaceId) {
        return `https://twitter.com/i/spaces/${spaceId}`;
    }
    /**
     * Returns the identifier of a Twitter Space, provided its URL
     * @param {string} spaceUrl - Space URL
     * @returns {?string} Space identifier
     */
    static getSpaceId(spaceUrl) {
        const matches = /(?:spaces\/)?([A-Za-z0-9_]{13})/i.exec(spaceUrl) || [];
        return matches[1];
    }
}
exports.TwitterUtil = TwitterUtil;
//# sourceMappingURL=TwitterUtil.js.map