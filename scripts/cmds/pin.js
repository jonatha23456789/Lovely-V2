const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "pinterest", 
 aliases: ["pin"], 
 version: "1.0.2", 
 author: "Team Calyx", 
 role: 0,
 countDown: 0,
 description:"Search for images on Pinterest",
 category: "𝗠𝗘𝗗𝗜𝗔", 
 guide: {
 en: "{prefix}pinterest <search query> -<number of images>"
 }
 }, 

 onStart: async function({ api, event, args }) {

 try {
 const keySearch = args.join(" ");
 if (!keySearch) {
 return api.sendMessage(`Please enter the search query and number of images to return in the format: ${config.guide.en}`, event.threadID, event.messageID);
 }
 const keySearchs = keySearch.substr(0, keySearch.indexOf('-')).trim() || keySearch;
 var numberSearch = parseInt(keySearch.split("-").pop().trim()) || 4;
 

 const res = await axios.get(`https://pinterest-ashen.vercel.app/api?search=${encodeURIComponent(keySearchs)}`);
 const data = res.data.data;
 const imgData = [];

 for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
 const imgResponse = await axios.get(data[i], { responseType: 'arraybuffer' });
 const imgPath = path.join(__dirname, 'tmp', `${i + 1}.jpg`);
 await fs.outputFile(imgPath, imgResponse.data);
 imgData.push(fs.createReadStream(imgPath));
 }

 await api.sendMessage({
 attachment: imgData,
 body: `Here are the top ${imgData.length} image results for "${keySearchs}":`
 }, event.threadID, event.messageID);

 await fs.remove(path.join(__dirname, 'tmp'));
 } catch (error) {
 console.error(error);
 return api.sendMessage(`please add to your keysearch - 10 \n ex: -pin cat -10`, event.threadID, event.messageID);
 }
 }
};
