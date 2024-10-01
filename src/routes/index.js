"use strict";

const express = require("express");

const router = express.Router();
router.get("/test", async function (req, res) {
	let time = Date.now();
	await sendMessageToQueue({ msg: time.toString() });
	return res.status(200).json({ message: 'test' });
});
router.use("/tsubasa", require("./tsubasa"))
router.use("/auth", require("./access"))
module.exports = router;