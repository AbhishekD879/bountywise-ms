import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello World From Bounty Services");
});

export default router;