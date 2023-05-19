const axios = require("axios");
const qs = require("qs");
const https = require("https");
const agent = new https.Agent({
	rejectUnauthorized: false
});
const { getStreamFromURL, downloadFile, convertTime } = global.utils;

module.exports = {
	config: {
		name: "ytb",
		version: "1.6",
		author: "NTKhang | Nayan",
		countDown: 5,
		role: 0,
		shortDescription: "YouTube",
		longDescription: {
			en: "Download video, audio or view video information on YouTube"
		},
		category: "media",
		guide: {
			en: "   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube."
				+ "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube"
				+ "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from youtube"
				+ "\n   Example:"
				+ "\n    {pn} -v Fallen Kingdom"
				+ "\n    {pn} -a Fallen Kingdom"
				+ "\n    {pn} -i Fallen Kingdom"
		}
	},

	langs: {
		en: {
			error: "❌ An error occurred: %1",
			noResult: "⭕ No search results match the keyword %1",
			choose: "%1Reply to the message with a number to choose or any content to cancel",
			downloading: "⬇️𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨\n\n\"%1\"",
			noVideo: "⭕ Sorry, no video was found with a size less than 83MB",
			downloadingAudio: "⬇️𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐚𝐮𝐝𝐢𝐨\n\n\"%1\"",
			noAudio: "⭕ Sorry, no audio was found with a size less than 26MB",
			info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Video time: %4\n👀 View: %5\n👍 Like: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9",
			listChapter: "\n📖 List chapter: %1\n"
		}
	},

	onStart: async function ({ args, message, event, commandName, getLang }) {
		let type;
		switch (args[0]) {
			case "-v":
			case "video":
				type = "video";
				break;
			case "-a":
			case "-s":
			case "audio":
			case "sing":
				type = "audio";
				break;
			case "-i":
			case "info":
				type = "info";
				break;
			default:
				return message.SyntaxError();
		}

		const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
		const urlYtb = checkurl.test(args[1]);

		if (urlYtb) {
			const infoVideo = await getVideoInfo(args[1]);
			handle({ type, infoVideo, message, downloadFile, getLang });
			return;
		}

		const keyWord = args.slice(1).join(" ");
		const maxResults = 10;

		let result;
		try {
			result = (await search(keyWord)).slice(0, maxResults);
		}
		catch (err) {
			return message.reply(getLang("error", err.message));
		}
		if (result.length == 0)
			return message.reply(getLang("noResult", keyWord));
		let msg = "";
		let i = 1;
		const thumbnails = [];
		const arrayID = [];

		for (const info of result) {
			thumbnails.push(getStreamFromURL(info.thumbnail));
			msg += `✅${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
		}

		message.reply({
			body: getLang("choose", msg),
			attachment: await Promise.all(thumbnails)
		}, (err, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				author: event.senderID,
				arrayID,
				result,
				type
			});
		});
	},

	onReply: async ({ event, api, Reply, message, getLang }) => {
		const { result, type } = Reply;
		const choice = event.body;
		if (!isNaN(choice) && choice <= 10) {
			const infoChoice = result[choice - 1];
			const idvideo = infoChoice.id;
			const infoVideo = await getVideoInfo(idvideo);
			api.unsendMessage(Reply.messageID);
			await handle({ type, infoVideo, message, getLang });
		}
		else
			api.unsendMessage(Reply.messageID);
	}
};

async function handle({ type, infoVideo, message, getLang }) {
	const { video_url, title } = infoVideo;

	if (type == "video") {
		const MAX_SIZE = 87031808; // 83MB (max size of video that can be sent on fb)
		const msgSend = message.reply(getLang("downloading", title));
		const formats = await getFormatsUrl(video_url);
		const getFormat = (formats.find(f => f.type === "mp4").qualitys.filter(f => f.size < MAX_SIZE) || [])[0];
		if (!getFormat)
			return message.reply(getLang("noVideo"));
		const stream = await getStreamFromURL(getFormat.dlink, `${title}.mp4`, { httpsAgent: agent });
		message.reply({
			body: title,
			attachment: stream
		}, async () => message.unsend((await msgSend).messageID));
	}
	else if (type == "audio") {
		const MAX_SIZE = 27262976; // 26MB (max size of audio that can be sent on fb)
		const msgSend = message.reply(getLang("downloadingAudio", title));
		const formats = await getFormatsUrl(video_url);
		const getFormat = (formats.find(f => f.type === "mp3").qualitys.filter(f => f.size < MAX_SIZE) || [])[0];
		if (!getFormat)
			return message.reply(getLang("noAudio"));
		const stream = await getStreamFromURL(getFormat.dlink, `${title}.mp3`, { httpsAgent: agent });
		message.reply({
			body: title,
			attachment: stream
		}, async () => message.unsend((await msgSend).messageID));
	}
	else if (type == "info") {
		const { title, lengthSeconds, viewCount, videoId, uploadDate, likes, channel, chapters } = infoVideo;

		const hours = Math.floor(lengthSeconds / 3600);
		const minutes = Math.floor(lengthSeconds % 3600 / 60);
		const seconds = Math.floor(lengthSeconds % 3600 % 60);
		let msg = getLang("info", title, channel.name, (channel.subscriberCount || 0), `${hours}:${minutes}:${seconds}`, viewCount, likes, uploadDate, videoId, `https://youtu.be/${videoId}`);
		// if (chapters.length > 0) {
		// 	msg += getLang("listChapter")
		// 		+ chapters.reduce((acc, cur) => {
		// 			const time = convertTime(cur.start_time * 1000, ':', ':', ':').slice(0, -1);
		// 			return acc + ` ${time} => ${cur.title}\n`;
		// 		}, '');
		// }

		message.reply({
			body: msg,
			attachment: await Promise.all([
				getStreamFromURL(infoVideo.thumbnails[infoVideo.thumbnails.length - 1].url),
				getStreamFromURL(infoVideo.channel.thumbnails[infoVideo.channel.thumbnails.length - 1].url)
			])
		});
	}
}


async function getFormatsUrl(url) {
	const response = await axios.post("https://9convert.com/api/ajaxSearch/index", qs.stringify({
		query: url,
		vt: "home"
	}));

	const videoId = response.data.vid;
	const { data } = response;
	for (const key in data.links) {
		for (const key2 in data.links[key]) {
			data.links[key][key2] = {
				...data.links[key][key2],
				dataConvert: convert(videoId, data.links[key][key2].k)
			};
		}
	}

	for (const key in data.links) {
		for (const key2 in data.links[key]) {
			data.links[key][key2] = { ...data.links[key][key2], ...(await data.links[key][key2].dataConvert) };
			delete data.links[key][key2].dataConvert;
		}
	}

	// format data to array
	const linksFormat = [];
	for (const key in data.links) {
		const qualitys = [];
		for (const key2 in data.links[key]) {
			const format = data.links[key][key2];

			let size;
			if (format.size.includes("KB"))
				size = parseInt(format.size.replace("KB", "")) * 1024;
			if (format.size.includes("MB"))
				size = parseInt((format.size.match(/\d+/) || ['0'])[0]) * 1024 * 1024;
			if (format.size.includes("GB"))
				size = parseInt((format.size.match(/\d+/) || ['0'])[0]) * 1024 * 1024 * 1024;

			qualitys.push({
				size,
				dlink: format.dlink,
				f: format.f,
				q: format.d,
				ftype: format.ftype
			});
		}

		qualitys.sort((a, b) => a.size + b.size);

		linksFormat.push({
			type: key,
			qualitys
		});
	}

	data.links = linksFormat.sort((a, b) => b.size - a.size);
	return data.links;
}

function convert(videoId, k) {
	return new Promise((resolve, reject) => {
		axios.post("https://9convert.com/api/ajaxConvert/convert", qs.stringify({
			vid: videoId,
			k
		}))
			.then(res => resolve(res.data))
			.catch(err => reject(err));
	});
}

async function search(keyWord) {
	try {
		const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`;
		const res = await axios.get(url);
		const getJson = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
		const videos = getJson.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
		const results = [];
		for (const video of videos)
			if (video.videoRenderer?.lengthText?.simpleText) // check is video, not playlist or channel or live
				results.push({
					id: video.videoRenderer.videoId,
					title: video.videoRenderer.title.runs[0].text,
					thumbnail: video.videoRenderer.thumbnail.thumbnails.pop().url,
					time: video.videoRenderer.lengthText.simpleText,
					channel: {
						id: video.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
						name: video.videoRenderer.ownerText.runs[0].text,
						thumbnail: video.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails.pop().url.replace(/s[0-9]+\-c/g, '-c')
					}
				});
		return results;
	}
	catch (e) {
		const error = new Error("Cannot search video");
		error.code = "SEARCH_VIDEO_ERROR";
		throw error;
	}
}

async function getVideoInfo(id) {
	// get id from url if url
	id = id.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	id = id[2] !== undefined ? id[2].split(/[^0-9a-z_\-]/i)[0] : id[0];

	const { data: html } = await axios.get(`https://youtu.be/${id}?hl=en`, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36'
		}
	});
	const json = JSON.parse(html.match(/var ytInitialPlayerResponse = (.*?});/)[1]);
	const json2 = JSON.parse(html.match(/var ytInitialData = (.*?});/)[1]);
	const { title, lengthSeconds, viewCount, videoId, thumbnail, author } = json.videoDetails;
	let getChapters;
	try {
		getChapters = json2.playerOverlays.playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer.playerBar.multiMarkersPlayerBarRenderer.markersMap.find(x => x.key == "DESCRIPTION_CHAPTERS" && x.value.chapters).value.chapters;
	}
	catch (e) {
		getChapters = [];
	}
	const owner = json2.contents.twoColumnWatchNextResults.results.results.contents.find(x => x.videoSecondaryInfoRenderer).videoSecondaryInfoRenderer.owner;
	const result = {
		videoId,
		title,
		video_url: `https://youtu.be/${videoId}`,
		lengthSeconds: lengthSeconds.match(/\d+/)[0],
		viewCount: viewCount.match(/\d+/)[0],
		uploadDate: json.microformat.playerMicroformatRenderer.uploadDate,
		likes: json2.contents.twoColumnWatchNextResults.results.results.contents.find(x => x.videoPrimaryInfoRenderer).videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons.find(x => x.segmentedLikeDislikeButtonRenderer).segmentedLikeDislikeButtonRenderer.likeButton.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(/\.|,/g, '').match(/\d+/)[0],
		chapters: getChapters.map((x, i) => {
			const start_time = x.chapterRenderer.timeRangeStartMillis;
			const end_time = getChapters[i + 1]?.chapterRenderer?.timeRangeStartMillis || lengthSeconds.match(/\d+/)[0] * 1000;

			return {
				title: x.chapterRenderer.title.simpleText,
				start_time_ms: start_time,
				start_time: start_time / 1000,
				end_time_ms: end_time - start_time + start_time,
				end_time: (end_time - start_time + start_time) / 1000
			};
		}),
		thumbnails: thumbnail.thumbnails,
		author: author,
		channel: {
			id: owner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId,
			username: owner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
			name: owner.videoOwnerRenderer.title.runs[0].text,
			thumbnails: owner.videoOwnerRenderer.thumbnail.thumbnails,
			subscriberCount: parseAbbreviatedNumber(owner.videoOwnerRenderer.subscriberCountText.simpleText)
		}
	};

	return result;
}

function parseAbbreviatedNumber(string) {
	const match = string
		.replace(',', '.')
		.replace(' ', '')
		.match(/([\d,.]+)([MK]?)/);
	if (match) {
		let [, num, multi] = match;
		num = parseFloat(num);
		return Math.round(multi === 'M' ? num * 1000000 :
			multi === 'K' ? num * 1000 : num);
	}
	return null;
}