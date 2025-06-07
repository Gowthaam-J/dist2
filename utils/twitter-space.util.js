"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterSpaceUtil = void 0;
const builders_1 = require("@discordjs/builders");
const Twitter_enum_1 = require("../enums/Twitter.enum");
const TwitterUtil_1 = require("./TwitterUtil");
class TwitterSpaceUtil {
    static parseId(s) {
        const pattern = /(?<=spaces\/)\w+/;
        const value = pattern.exec(s)?.[0] || s;
        return value;
    }
    static parseState(state) {
        switch (state) {
            case Twitter_enum_1.AudioSpaceMetadataState.NOT_STARTED:
                return Twitter_enum_1.SpaceState.SCHEDULED;
            case Twitter_enum_1.AudioSpaceMetadataState.CANCELED:
                return Twitter_enum_1.SpaceState.CANCELED;
            case Twitter_enum_1.AudioSpaceMetadataState.RUNNING:
                return Twitter_enum_1.SpaceState.LIVE;
            case Twitter_enum_1.AudioSpaceMetadataState.ENDED:
            case Twitter_enum_1.AudioSpaceMetadataState.TIMED_OUT:
                return Twitter_enum_1.SpaceState.ENDED;
            default:
                return null;
        }
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
    static toDynamicPlaylistUrl(url) {
        return url.replace('master_playlist', 'dynamic_playlist');
    }
    static getUserIds(space) {
        if (!space) {
            return [];
        }
        const set = new Set();
        set.add(space.creatorId);
        space.hostIds?.forEach?.((id) => set.add(id));
        space.speakerIds?.forEach?.((id) => set.add(id));
        return [...set];
    }
    static getEmbed(space, trackItem) {
        const creator = space?.creator;
        const embed = {
            title: TwitterSpaceUtil.getEmbedTitle(space, trackItem),
            description: TwitterSpaceUtil.getEmbedDescription(space),
            color: 0x1d9bf0,
            author: {
                name: `${creator?.name} (@${creator?.username})`,
                url: TwitterUtil_1.TwitterUtil.getUserUrl(creator?.username),
                icon_url: creator?.profileImageUrl,
            },
            fields: TwitterSpaceUtil.getEmbedFields(space),
            footer: {
                text: 'Twitter',
                icon_url: 'https://abs.twimg.com/favicons/twitter.2.ico',
            },
        };
        return embed;
    }
    static getEmbedTitle(space, track) {
        const trackUser = [space.creator, space.hosts || [], space.speakers || []]
            .flat()
            .find((user) => user.id === track.userId);
        const displayCreator = (0, builders_1.inlineCode)(space.creator?.username || space.creatorId);
        const displayGuest = (0, builders_1.inlineCode)(trackUser?.username || track.userId);
        if (space.state === Twitter_enum_1.SpaceState.SCHEDULED) {
            return `${displayCreator} scheduled a Space`;
        }
        if (space.state === Twitter_enum_1.SpaceState.ENDED) {
            if (space.creatorId !== track.userId) {
                return `${displayCreator} ended a Space | Guest: ${displayGuest}`;
            }
            return `${displayCreator} ended a Space`;
        }
        // SpaceState.LIVE
        if (space.creatorId !== track.userId) {
            if (space.hostIds?.includes?.(track.userId)) {
                return `${displayGuest} is co-hosting ${displayCreator}'s Space`;
            }
            if (space.speakerIds?.includes?.(track.userId)) {
                return `${displayGuest} is speaking in ${displayCreator}'s Space`;
            }
        }
        return `${displayCreator} is hosting a Space`;
    }
    static getEmbedDescription(space) {
        const emojis = [];
        if (space.isAvailableForReplay) {
            emojis.push('⏺️');
        }
        if (space.isAvailableForClipping) {
            emojis.push('✂️');
        }
        return [
            TwitterUtil_1.TwitterUtil.getSpaceUrl(space.id),
            emojis.join(''),
        ].join(' ');
    }
    static getEmbedFields(space) {
        const fields = [
            {
                name: '📄 Title',
                value: (0, builders_1.codeBlock)(space.title),
            },
        ];
        if (space.state === Twitter_enum_1.SpaceState.SCHEDULED) {
            fields.push({
                name: '⏰ Scheduled start',
                value: TwitterSpaceUtil.getEmbedLocalTime(space.scheduledStart),
                inline: true,
            });
        }
        if ([Twitter_enum_1.SpaceState.LIVE, Twitter_enum_1.SpaceState.ENDED].includes(space.state)) {
            fields.push({
                name: '▶️ Started at',
                value: TwitterSpaceUtil.getEmbedLocalTime(space.startedAt),
                inline: true,
            });
        }
        if ([Twitter_enum_1.SpaceState.ENDED].includes(space.state)) {
            fields.push({
                name: '⏹️ Ended at',
                value: TwitterSpaceUtil.getEmbedLocalTime(space.endedAt),
                inline: true,
            });
        }
        if ([Twitter_enum_1.SpaceState.LIVE, Twitter_enum_1.SpaceState.ENDED].includes(space.state) && space.playlistUrl) {
            fields.push({
                name: '🔗 Playlist url',
                value: (0, builders_1.codeBlock)(space.playlistUrl),
            });
        }
        // if ([SpaceState.LIVE].includes(space.state) && space.playlistUrl) {
        //   fields.push(
        //     {
        //       name: 'Open with...',
        //       value: `Copy [this link](${TwitterSpaceUtil.toDynamicPlaylistUrl(space.playlistUrl)}) & open with MPV / IINA / VLC...`,
        //     },
        //   )
        // }
        return fields;
    }
    static getEmbedTimestamp(ms) {
        return (0, builders_1.codeBlock)(String(ms));
    }
    static getEmbedLocalTime(ms) {
        if (!ms) {
            return null;
        }
        return [
            (0, builders_1.time)(Math.floor(ms / 1000)),
            (0, builders_1.time)(Math.floor(ms / 1000), 'R'),
        ].join('\n');
    }
}
exports.TwitterSpaceUtil = TwitterSpaceUtil;
//# sourceMappingURL=twitter-space.util.js.map