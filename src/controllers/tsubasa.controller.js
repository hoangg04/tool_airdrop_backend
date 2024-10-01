const { OK } = require("../core/success.response");
const TsubasaService = require("../service/tsubasa.service");

class TsubasaController {
	static async getBot(req, res, next) {
		return new OK({
			message: "Get bot",
			metadata: await TsubasaService.getBot({
				userId: req.params.userId,
				botId: req.params.botId
			})
		}).send(res);
	}
	static async setBot(req, res, next) {
		return new OK({
			message: "Set bot",
			metadata: await TsubasaService.setBot({
				bot_of_user: req.params.userId,
				bot_type: req.body.bot_type,
				bot_init_data: req.body.bot_init_data,
				bot_proxy: req.body.bot_proxy
			})
		}).send(res);
	}
	static async stopBot(req, res, next) {
		return new OK({
			message: "Stop bot",
			metadata: TsubasaService.stopBot({
				userId: req.params.userId,
				botId: req.params.botId
			})
		}).send(res);
	}
	static async startBot(req, res, next) {
		return new OK({
			message: "Start bot",
			metadata: TsubasaService.startBot({
				userId: req.params.userId,
				botId: req.params.botId
			})
		}).send(res);
	}
	static async updateBot(req, res, next) {
		return new OK({
			message: "Update bot",
			metadata: await TsubasaService.updateBot({
				bot_of_user: req.params.userId,
				bot_type: req.body.bot_type,
				bot_init_data: req.body.bot_init_data,
				bot_proxy: req.body.bot_proxy
			})
		}).send(res);
	}
	static async getBots(req, res, next) {
		return new OK({
			message: "Get bots",
			metadata: await TsubasaService.getBots({
				userId: req.params.userId
			})
		}).send(res);
	}
	static async run(req, res, next) {
		return new OK({
			message: "Run",
			metadata: await TsubasaService.run({
				userId: req.params.userId,
				botId: req.params.botId
			})
		}).send(res);
	}

}
module.exports = TsubasaController