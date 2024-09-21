import serverless from "serverless-http";
import express from "express";
import tagsRoute from "./tagsRoute";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World From Tags Services");
});
app.use(process.env.TAGS_SERVICE_URL, tagsRoute);

export const handler = serverless(app);
