import serverless from "serverless-http";
import express from "express";
import bountyRoute from "./bountyRoute.js"
const app = express();


app.get("/", (req, res) => {
  return res.json({
    "message": "Hello World From Bounty Services"
  });
});
app.use(process.env.BOUNTY_SERVICE_URL, bountyRoute);
export const handler = serverless(app);
