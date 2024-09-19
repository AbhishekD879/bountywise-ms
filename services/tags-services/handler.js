const serverless = require("serverless-http");
const express = require("express");
const app = express();
const tagsRoute = require("./tagsRoute");

app.get("/", (req, res) => {
    res.send("Hello World From Tags Services");
});
app.use(process.env.TAGS_SERVICE_URL, tagsRoute);
exports.handler = serverless(app);
