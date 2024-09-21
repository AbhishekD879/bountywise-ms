import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello World From Tags Services");
});

export default router;