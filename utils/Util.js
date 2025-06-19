"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_constant_1 = require("../constants/app.constant");
const ConfigManager_1 = require("../modules/ConfigManager");
class Util {
    static getTwitterAuthorization() {
        return process.env.TWITTER_AUTHORIZATION;
    }
    static getTwitterAuthToken() {
        return process.env.TWITTER_AUTH_TOKEN;
    }
    static getDisplayTime(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / 1000 / 60) % 60);
        const hours = Math.floor((ms / 1000 / 3600));
        const s = [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
        return s;
    }
    static getDateTimeString(ms) {
        const date = ms
            ? new Date(ms)
            : new Date();
        const s = date.toISOString()
            .replace(/[^\d]/g, '')
            .substring(2, 12);
        return s;
    }
    static getUserRefreshInterval() {
        const interval = Number(ConfigManager_1.configManager.config.interval || app_constant_1.APP_USER_REFRESH_INTERVAL);
        return interval;
    }
    static getCacheDir(subDir = '') {
        return path_1.default.join(process.cwd(), app_constant_1.APP_CACHE_DIR, subDir || '');
    }
    static createCacheDir(subDir = '') {
        return fs_1.default.mkdirSync(this.getCacheDir(subDir), { recursive: true });
    }
    static getMediaDir(subDir = '') {
        return path_1.default.join(process.cwd(), app_constant_1.APP_DOWNLOAD_DIR, subDir || '');
    }
    static createMediaDir(subDir = '') {
        return fs_1.default.mkdirSync(this.getMediaDir(subDir), { recursive: true });
    }
    /**
      * @see https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
      */
    static getCleanFileName(name) {
        return name?.replace?.(/[/\\?*:|<>"]/g, '');
    }
    static splitArrayIntoChunk(arr, chunkSize) {
        return [...Array(Math.ceil(arr.length / chunkSize))]
            .map(() => arr.splice(0, chunkSize));
    }
}
exports.Util = Util;
//# sourceMappingURL=Util.js.map