import serverless from "serverless-http";
import express from "express";
const app = express();
const bountyRoute = require("./bountyRoute");

app.get("/", (req, res) => {
  res.send("Hello World From Bounty Services");
});
app.use(process.env.BOUNTY_SERVICE_URL, bountyRoute);
export const handler = serverless(app);
