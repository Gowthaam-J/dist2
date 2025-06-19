"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceDownloader = void 0;
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const timers_1 = require("timers");
const PeriscopeApi_1 = require("../apis/PeriscopeApi");
const logger_1 = require("../logger");
const PeriscopeUtil_1 = require("../utils/PeriscopeUtil");
const Util_1 = require("../utils/Util");
const ConfigManager_1 = require("./ConfigManager");
const StorageManager_1 = require("./StorageManager");
class SpaceDownloader {
    constructor(originUrl, filename, subDir = '', metadata) {
        this.originUrl = originUrl;
        this.filename = filename;
        this.subDir = subDir;
        this.metadata = metadata;
        this.logger = logger_1.logger.child({ label: '[SpaceDownloader]' });
        this.logger.debug('constructor', {
            originUrl, filename, subDir, metadata,
        });
        this.playlistFile = path_1.default.join(Util_1.Util.getMediaDir(subDir), `${filename}.m3u8`);
        this.audioFile = path_1.default.join(Util_1.Util.getMediaDir(subDir), `${filename}.m4a`);
        this.logger.verbose(`Playlist path: "${this.playlistFile}"`);
        this.logger.verbose(`Audio path: "${this.audioFile}"`);
    }
    async download() {
        this.logger.debug('download', { playlistUrl: this.playlistUrl, originUrl: this.originUrl });
        if (!this.playlistUrl) {
            this.playlistUrl = await PeriscopeApi_1.PeriscopeApi.getFinalPlaylistUrl(this.originUrl);
            this.logger.info(`Final playlist url: ${this.playlistUrl}`);
        }
        Util_1.Util.createMediaDir(this.subDir);
        await this.saveFinalPlaylist();
        await this.spawnFfmpeg(); // Await ffmpeg process
    }
    async saveFinalPlaylist() {
        try {
            this.logger.debug(`--> saveFinalPlaylist: ${this.playlistUrl}`);
            const { data } = await axios_1.default.get(this.playlistUrl);
            this.logger.debug(`<-- saveFinalPlaylist: ${this.playlistUrl}`);
            const prefix = PeriscopeUtil_1.PeriscopeUtil.getChunkPrefix(this.playlistUrl);
            this.logger.debug(`Chunk prefix: ${prefix}`);
            const newData = data.replace(/^chunk/gm, `${prefix}chunk`);
            (0, fs_1.writeFileSync)(this.playlistFile, newData);
            this.logger.verbose(`Playlist saved to "${this.playlistFile}"`);
        }
        catch (error) {
            this.logger.debug(`saveFinalPlaylist: ${error.message}`);
            const status = error.response?.status;
            if (status === 404 && this.originUrl !== this.playlistUrl) {
                this.playlistUrl = null;
            }
            throw error;
        }
    }
    async spawnFfmpeg() {
        const cmd = 'ffmpeg';
        const args = [
            '-protocol_whitelist',
            'file,https,tls,tcp',
            '-i',
            this.playlistUrl,
            '-c',
            'copy',
        ];
        if (this.metadata) {
            this.logger.debug('Audio metadata', this.metadata);
            Object.keys(this.metadata).forEach((key) => {
                const value = this.metadata[key];
                if (!value)
                    return;
                args.push('-metadata', `${key}=${value}`);
            });
        }
        const { config } = ConfigManager_1.configManager;
        if (config?.ffmpegArgs?.length) {
            args.push(...config.ffmpegArgs);
        }
        args.push(this.audioFile);
        this.logger.verbose(`Audio is saving to "${this.audioFile}"`);
        this.logger.verbose(`${cmd} ${args.join(' ')}`);
        return new Promise((resolve, reject) => {
            const cp = process.platform === 'win32'
                ? (0, child_process_1.spawn)(process.env.comspec, ['/c', cmd, ...args])
                : (0, child_process_1.spawn)(cmd, args);
            cp.stderr?.on('data', (data) => {
                // Suppress verbose ffmpeg stderr logs to reduce verbosity
                // this.logger.verbose(`[ffmpeg] ${data.toString()}`)
            });
            cp.on('error', (err) => {
                this.logger.error(`ffmpeg error: ${err.message}`);
                reject(err);
            });
            cp.on('close', async (code) => {
                this.logger.info(`ffmpeg exited with code ${code}`);
                if (code !== 0) {
                    return reject(new Error(`ffmpeg exited with code ${code}`));
                }
                // Wait until file appears (max 10 seconds)
                const maxWait = 10000;
                const interval = 500;
                let waited = 0;
                while (!(0, fs_1.existsSync)(this.audioFile)) {
                    if (waited >= maxWait) {
                        return reject(new Error(`Output file not found after ffmpeg exit: ${this.audioFile}`));
                    }
                    await new Promise(resolve => (0, timers_1.setTimeout)(resolve, interval));
                    waited += interval;
                }
                this.logger.info(`Audio file saved: ${this.audioFile}`);
                // Upload to S3 and save metadata to DB
                try {
                    const s3Key = path_1.default.join(this.subDir, path_1.default.basename(this.audioFile)).replace(/\\/g, '/');
                    const s3Url = await (0, StorageManager_1.uploadFileToS3)(this.audioFile, s3Key);
                    const metadata = {
                        title: this.metadata?.title,
                        author: this.metadata?.author,
                        artist: this.metadata?.artist,
                        episode_id: this.metadata?.episode_id,
                        s3_url: s3Url,
                        local_path: this.audioFile,
                        uploaded_at: new Date(),
                    };
                    await (0, StorageManager_1.saveFileLinkToDB)(metadata);
                    this.logger.info(`Uploaded file to S3 and saved metadata to DB: ${s3Url}`);
                }
                catch (error) {
                    this.logger.error(`Failed to upload to S3 or save metadata: ${error}`);
                }
                resolve();
            });
        });
    }
}
exports.SpaceDownloader = SpaceDownloader;
//# sourceMappingURL=SpaceDownloader.js.map