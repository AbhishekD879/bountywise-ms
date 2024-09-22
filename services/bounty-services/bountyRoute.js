import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    "message": "Hello World From Bounty Services"
  });
});

export default router;
