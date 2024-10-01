"use strict";
const express = require("express");

const { asyncHandler } = require("../../middlewares/asyncHandler");
const AccessController = require("../../controllers/access.controller");
const router = express.Router();

router.post("/login", asyncHandler(AccessController.login));
router.post("/logout", asyncHandler(AccessController.logout));
router.post("/register", asyncHandler(AccessController.register));
router.post("/validToken", asyncHandler(AccessController.validToken));

module.exports = router;