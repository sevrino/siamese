const Youtube = require('@/commands/search/youtube');
const { aquirePlayer } = require('@/music/helper');
const Song = require('@/music/song');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { PLAY } = require('@/constants/commands/music');
const { YOUTUBE } = require('@/constants/commands/search');
const { MUSIC_TYPE } = require('@/constants/type');


module.exports = {
	name: PLAY.CMD,
	description: PLAY.DESC,
	usage: PLAY.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.MANAGE_MESSAGES,
		PERMISSION.CONNECT,
		PERMISSION.SPEAK,
	],
	execute: async context => {
		const { author, content, msg, channel } = context;
		if (!content.length) {
			msg.error(ERROR.MUSIC.NOT_RESOLVABLE);
			return;
		}
		channel.startTyping();

		const ytVideoRegex = /(?:.+?)?(?:\/v\/|watch\/|\?v=|&v=|youtu\.be\/|\/v=|^youtu\.be\/)([a-zA-Z0-9_-]{11})+/i;
		const ytPlaylistRegex = /[&?]list=([^&]+)/i;


		// Playlist
		if (ytPlaylistRegex.test(content)) {
			const playlistId = content.match(ytPlaylistRegex)[1];
			const playlist = await Youtube.api.getPlaylistByID(playlistId)
				.then(data => data)
				.catch(() => undefined);

			if (!playlist) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(PLAY.PLAYLIST));
				return;
			}

			let videos = await playlist.getVideos();
			const getVideoDetail = async video => video.fetch();
			const getAllVideoDetails = videos.map(video => getVideoDetail(video));

			videos = await Promise.all(getAllVideoDetails);
			const songs = videos.map(video => new Song(
				YOUTUBE.VIDEO_URL(video.id),
				MUSIC_TYPE.YOUTUBE,
				video.title,
				video.duration,
				author
			));

			const player = await aquirePlayer(context);
			if (player) {
				await player.enqueueList({
					title: playlist.title,
					length: songs.length,
					songs: songs,
				}, channel);
			}
		}
		// Single video
		else if (ytVideoRegex.test(content)) {
			// Video check should be after playlist test
			// As playlist url typed https://www.youtube.com/watch?v=VIDEO_ID&list=LIST_ID
			// Which can be handled both in video/playlist
			const video = await Youtube.api.getVideo(content)
				.then(data => data)
				.catch(() => undefined);
			if (!video) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(YOUTUBE.TARGET));
				return;
			}

			if (isStream(video)) {
				msg.error(ERROR.MUSIC.CANNOT_PLAY_STREAMING);
				return;
			}

			const player = await aquirePlayer(context);
			if (player) {
				const song = new Song(
					YOUTUBE.VIDEO_URL(video.id),
					MUSIC_TYPE.YOUTUBE,
					video.title,
					video.duration,
					author
				);
				await player.enqueue(song, channel);
			}
		}
		// First video of youtube search
		else {
			const searchText = content;
			let video = (await Youtube.api.searchVideos(
				searchText,
				// We need only 1 video to play
				1,
			))[0];

			if (!video) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(YOUTUBE.TARGET));
				return;
			}

			// Fetch the full representation of this video.
			video = await video.fetch();
			if (isStream(video)) {
				msg.error(ERROR.MUSIC.CANNOT_PLAY_STREAMING);
				return;
			}

			const player = await aquirePlayer(context);
			if (player) {
				const song = new Song(
					YOUTUBE.VIDEO_URL(video.id),
					MUSIC_TYPE.YOUTUBE,
					video.title,
					video.duration,
					author
				);
				await player.enqueue(song, channel);
			}
			return;
		}
	},
};

const isStream = video => video.raw.snippet.liveBroadcastContent === 'live';
