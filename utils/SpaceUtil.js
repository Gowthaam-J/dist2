"use strict";
/* eslint-disable max-len */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceUtil = void 0;
class SpaceUtil {
    static getId(audioSpace) {
        return audioSpace?.metadata?.rest_id;
    }
    static getCreatedAt(audioSpace) {
        return audioSpace?.metadata?.created_at;
    }
    static getStartedAt(audioSpace) {
        return audioSpace?.metadata?.started_at;
    }
    static getTitle(audioSpace) {
        return audioSpace?.metadata?.title;
    }
    static getHostUsername(audioSpace) {
        return audioSpace?.metadata?.creator_results?.result?.legacy?.screen_name;
    }
    static getHostName(audioSpace) {
        return audioSpace?.metadata?.creator_results?.result?.legacy?.name;
    }
    static getHostProfileImgUrl(audioSpace) {
        return audioSpace?.metadata?.creator_results?.result?.legacy?.profile_image_url_https?.replace?.('_normal', '');
    }
    static getHostProfileBannerUrl(audioSpace) {
        return audioSpace?.metadata?.creator_results?.result?.legacy?.profile_banner_url;
    }
    static getParticipant(participants, username) {
        const result = participants?.find?.((v) => v?.user_results?.result?.legacy?.screen_name?.toLowerCase?.() === username?.toLowerCase?.())
            || participants?.find?.((v) => v?.twitter_screen_name?.toLowerCase?.() === username?.toLowerCase?.());
        return result;
    }
    static isUserInParticipants(participants, username) {
        return !!SpaceUtil.getParticipant(participants, username);
    }
    static isAdmin(audioSpace, username) {
        return SpaceUtil.isUserInParticipants(audioSpace?.participants?.admins, username);
    }
    static isSpeaker(audioSpace, username) {
        return SpaceUtil.isUserInParticipants(audioSpace?.participants?.speakers, username);
    }
    static isListener(audioSpace, username) {
        return SpaceUtil.isUserInParticipants(audioSpace?.participants?.listeners, username);
    }
    static isParticipant(audioSpace, username) {
        return this.isAdmin(audioSpace, username) || this.isSpeaker(audioSpace, username) || this.isListener(audioSpace, username);
    }
}
exports.SpaceUtil = SpaceUtil;
//# sourceMappingURL=SpaceUtil.js.map