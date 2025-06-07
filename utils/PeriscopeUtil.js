"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriscopeUtil = void 0;
class PeriscopeUtil {
    static isFinalPlaylistUrl(url) {
        return /playlist_\d+\.m3u8/g.test(url);
    }
    static getFinalPlaylistName(data) {
        return /playlist_\d+/g.exec(data)[0];
    }
    static getMasterPlaylistUrl(url) {
        return url
            // Handle live playlist
            .replace('?type=live', '')
            .replace('dynamic_playlist', 'master_playlist')
            // Handle replay playlist
            .replace('?type=replay', '')
            .replace(/playlist_\d+/g, 'master_playlist');
    }
    static getChunks(data) {
        const chunkIndexPattern = /(?<=chunk_\d+_)\d+(?=_a\.)/gm;
        return data.match(chunkIndexPattern)?.map((v) => Number(v)) || [];
    }
    static getChunkPrefix(playlistUrl) {
        const url = new URL(playlistUrl);
        const chunks = url.pathname.split('/');
        const audioSpaceIndex = chunks.findIndex((v) => v === 'audio-space');
        const filteredChunks = chunks.filter((v, i) => {
            if (i === audioSpaceIndex - 1) {
                // Check audio JWT & ignore if exist
                // with 86 is hls key length
                return v.length <= 86;
            }
            return i <= audioSpaceIndex;
        });
        const pathname = filteredChunks
            .join('/')
            .replace('/transcode/', '/non_transcode/');
        const prefix = `${url.origin + pathname}/`;
        return prefix;
    }
}
exports.PeriscopeUtil = PeriscopeUtil;
//# sourceMappingURL=PeriscopeUtil.js.map