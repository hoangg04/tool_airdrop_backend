"use strict";

const express = require("express");
const { asyncHandler } = require("../../middlewares/asyncHandler");
const TsubasaController = require("../../controllers/tsubasa.controller");
const router = express.Router();

router.get('/:userId/bots', asyncHandler(TsubasaController.getBots))
router.get('/:userId/bots/:botId', asyncHandler(TsubasaController.getBot))
router.post('/:userId/bots', asyncHandler(TsubasaController.setBot))
router.put('/:userId/bots', asyncHandler(TsubasaController.updateBot))
router.post('/:userId/bots/:botId/stop', asyncHandler(TsubasaController.stopBot))
router.post('/:userId/bots/:botId/start', asyncHandler(TsubasaController.startBot))
router.post('/:userId/bots/:botId/run', asyncHandler(TsubasaController.run))

module.exports = router;