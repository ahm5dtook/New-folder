require("dotenv").config();
const { Telegraf } = require("telegraf");
var axios = require("axios").default;
const bot = new Telegraf(process.env.BOT_TOKEN);

let RandomWordsOptions = {
  method: "GET",
  url: "https://random-words5.p.rapidapi.com/getMultipleRandom",
  params: { count: "5" },
  headers: {
    "x-rapidapi-host": `${process.env.RANDOMWORDS_X_RAPIDAPI_HOST}`,
    "x-rapidapi-key": `${process.env.X_RAPIDAPI_KEY}`,
  },
};

bot.on("channel_post", async (ctx) => {
  if (ctx.update.channel_post.text === "كلمات") {
    try {
      let RandomWordsRes = await axios.request(RandomWordsOptions);
      const wordsArr = RandomWordsRes.data;
      let wordsJoinedByComma = wordsArr.join(" - ");

      let profanityFilterOptions = {
        method: "GET",
        url: "https://community-purgomalum.p.rapidapi.com/containsprofanity",
        params: { text: `${wordsJoinedByComma}` },
        headers: {
          "x-rapidapi-host": `${process.env.PURGOMALUM_X_RAPIDAPI_HOST}`,
          "x-rapidapi-key": `${process.env.X_RAPIDAPI_KEY}`,
        },
      };
      let profanityCheckRes = await axios.request(profanityFilterOptions);
      if (await profanityCheckRes.data) {
        Main();
        return;
      } else {
        const word0 = wordsArr[0];
        const word1 = wordsArr[1];
        const word2 = wordsArr[2];
        const word3 = wordsArr[3];
        const word4 = wordsArr[4];
        let justTranslatedOptions = {
          method: "GET",
          url: "https://just-translated.p.rapidapi.com/",
          params: { lang: "ar", text: `${wordsJoinedByComma}` },
          headers: {
            "x-rapidapi-host": `${process.env.JUSTTRANSLATED_X_RAPIDAPI_HOST}`,
            "x-rapidapi-key": `${process.env.X_RAPIDAPI_KEY}`,
          },
        };
        try {
          const justTranslatedRes = await axios.request(justTranslatedOptions);
          const translateWords = justTranslatedRes.data.text[0];

          let translateWordsArr = translateWords.split("-");
          const translatedWord0 = translateWordsArr[0];
          const translatedWord1 = translateWordsArr[1];
          const translatedWord2 = translateWordsArr[2];
          const translatedWord3 = translateWordsArr[3];
          const translatedWord4 = translateWordsArr[4];
          const listMessage = `
            1- ${word0}
            ${translatedWord0}
            2- ${word1}
            ${translatedWord1}
            3- ${word2}
            ${translatedWord2}
            4- ${word3}
            ${translatedWord3}
            5- ${word4}
            ${translatedWord4}
            `;

          let voiceRSSOptions = {
            method: "GET",
            url: "https://voicerss-text-to-speech.p.rapidapi.com/",
            params: {
              hl: "en-us",
              src: wordsJoinedByComma,
              key: `${process.env.VOICERSS_MAIN_WEBSITE_KEY}`,
              f: "48khz_16bit_mono",
              c: "mp3",
              r: "-2",
              v: "John",
              b64: true,
            },
            headers: {
              "x-rapidapi-host": `${process.env.VOICERSS_X_RAPIDAPI_HOST}`,
              "x-rapidapi-key": `${process.env.X_RAPIDAPI_KEY}`,
            },
          };

          try {
            const voiceRSSRes = await axios.request(voiceRSSOptions);
            const voiceGibberish = voiceRSSRes.data;
            try {
              await ctx.reply(listMessage);
              await ctx.replyWithAudio({
                source: Buffer.from(
                  voiceGibberish.replace(`data:audio/mpeg;base64,`, ""),
                  "base64"
                ),
              });
            } catch (error) {
              console.log(error);
            }
          } catch (error) {
            console.log(error);
            return;
          }
        } catch (error) {
          console.log(error);
          return;
        }
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }
});

bot.launch();
