module.exports = {
  config: {
    name: "tagall",
    version: "1.5",
    role: 0,
    author: "Ayanfe",
    description: "Tag all members in a Facebook group chat and attach an image.",
    category: "group",
    guide: "{pn} - Tags all members in the group",
  },

  onStart: async function ({ message, event, api }) {
    try {
      const threadID = event.threadID;

      // Fetch participant data directly using Facebook API
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo?.participantIDs;

      // Validate participants list
      if (!participants || participants.length === 0) {
        return message.reply("❌ No members found in this group.");
      }

      // Build the tagging message
      let tagMessage = `
🎉 *Tagging All Members in the Group!* 🎉

Here are all the amazing people in this group: 👇👇👇
`;

      const mentions = [];
      for (const userID of participants) {
        tagMessage += `🎯 @[${userID}]\n`; // Facebook-specific tagging with userID
        mentions.push({ tag: `@${userID}`, id: userID });
      }

      // Add a closing note
      tagMessage += `
🔥 *Enjoy the group chat and have fun!* 🔥
`;

      // Attach an image
      const imageUrl = "https://i.ibb.co/LX4cwwSX/image.jpg"; // Replace with your image URL
      const imageAttachment = await global.utils.getStreamFromURL(imageUrl);

      // Send the tagging message with the image
      await message.reply({
        body: tagMessage,
        mentions: mentions,
        attachment: imageAttachment, // Sends the image along with the message
      });

    } catch (error) {
      // Handle and log errors
      console.error("Error tagging members:", error.message);
      message.reply("❌ An error occurred while tagging all members. Please try again later.");
    }
  },
};
