const { App } = require("@slack/bolt");
require("dotenv").config();

const { scan } = require("./db");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // port: process.env.PORT || 3000 // Not for socket mode...
});

const syndDb = async function () {
  console.log("app: ", app);
};
syndDb();

module.exports = app;
