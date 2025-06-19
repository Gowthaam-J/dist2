"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterEntityUtil = void 0;
const twitter_space_util_1 = require("./twitter-space.util");
class TwitterEntityUtil {
    static buildUserByParticipant(participant) {
        try {
            const { result } = participant.user_results;
            const obj = {
                id: result.rest_id || participant.user_results.rest_id,
                username: result.legacy.screen_name || participant.twitter_screen_name,
                name: result.legacy.name || participant.display_name,
                profileImageUrl: (result.legacy.profile_image_url_https || participant.avatar_url)?.replace?.('_normal', ''),
            };
            return obj;
        }
        catch (error) {
            return null;
        }
    }
    static buildSpaceByAudioSpace(audioSpace) {
        const { metadata, participants } = audioSpace;
        const creator = participants.admins[0];
        const obj = {
            id: audioSpace.rest_id || metadata.rest_id,
            createdAt: metadata.created_at,
            updatedAt: metadata.updated_at,
            creatorId: creator?.user_results?.result?.rest_id || creator?.user_results?.rest_id,
            state: twitter_space_util_1.TwitterSpaceUtil.parseState(metadata.state),
            scheduledStart: metadata.scheduled_start,
            startedAt: metadata.start || metadata.started_at,
            endedAt: Number(metadata.ended_at) || undefined,
            lang: metadata.language,
            title: metadata.title,
            hostIds: participants.admins
                .map((v) => v.user_results.result.rest_id || v.user_results.rest_id)
                .filter((v) => v),
            speakerIds: participants.speakers
                .map((v) => v.user_results.result.rest_id || v.user_results.rest_id)
                .filter((v) => v),
            listenerIds: participants.listeners
                .map((v) => v.user_results.result.rest_id || v.user_results.rest_id)
                .filter((v) => v),
            isAvailableForReplay: metadata.is_space_available_for_replay,
            isAvailableForClipping: metadata.is_space_available_for_clipping,
            narrowCastSpaceType: metadata.narrow_cast_space_type,
        };
        obj.creator = TwitterEntityUtil.buildUserByParticipant(participants.admins[0]);
        obj.hosts = participants.admins.map((v) => TwitterEntityUtil.buildUserByParticipant(v)).filter((v) => v);
        obj.speakers = participants.speakers.map((v) => TwitterEntityUtil.buildUserByParticipant(v)).filter((v) => v);
        obj.listeners = participants.listeners.map((v) => TwitterEntityUtil.buildUserByParticipant(v)).filter((v) => v);
        return obj;
    }
}
exports.TwitterEntityUtil = TwitterEntityUtil;
//# sourceMappingURL=twitter-entity.util.js.map