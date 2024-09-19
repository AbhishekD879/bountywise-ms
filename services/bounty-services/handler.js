const serverless = require("serverless-http");
const express = require("express");
const app = express();



exports.handler = serverless(app);
