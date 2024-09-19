const serverless = require("serverless-http");
const express = require("express");
const app = express();
const bountyRoute = require("./bountyRoute");

app.get("/", (req, res) => {
    res.send("Hello World From Bounty Services");
});
app.use(process.env.BOUNTY_SERVICE_URL, bountyRoute);
exports.handler = serverless(app);
