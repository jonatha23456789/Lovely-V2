const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "video",
    version: "1.0.1",
    author: "Ayanfe",
    description: "Download YouTube videos from keyword search and link",
    category: "Media",
    guide: {
      en: "Usage: {pn} [videoName]"
    },
    usages: "[videoName]",
    cooldowns: 5,
    dependencies: {
      "node-fetch": "",
      "yt-search": "",
    },
  },

  onStart: async function ({ message, api, args, event }) {
    let videoName = args.join(" ");
    const type = "video";

    const processingMessage = await api.sendMessage(
      "✅ Processing your request. Please wait...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      const searchResults = await ytSearch(videoName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No results found for your search query.");
      }

      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;

      const apiKey = "priyansh-here";
      const apiUrl = `https://priyansh-ai.onrender.com/youtube?id=${videoId}&type=${type}&apikey=${apiKey}`;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.downloadUrl;

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://cnvmp3.com/',
        'Cookie': '_ga=GA1.1.1062081074.1735238555; _ga_MF283RRQCW=GS1.1.1735238554.1.1.1735239728.0.0.0',
      };

      const response = await fetch(downloadUrl, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch video. Status code: ${response.status}`);
      }

      const filename = `${topResult.title}.mp4`;
      const downloadPath = path.join(__dirname, filename);

      const videoBuffer = await response.buffer();

      fs.writeFileSync(downloadPath, videoBuffer);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🖤 Title: ${topResult.title}\n\n Here is your video 🎥:`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath);
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Failed to download and send video: ${error.message}`);
      api.sendMessage(
        `Failed to download video: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
}
