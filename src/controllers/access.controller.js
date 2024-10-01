const { OK, CREATED } = require("../core/success.response");

const AccessService = require("../service/access.service");

class AccessController {
	static async login(req, res, next) {
		return new OK({
			message: "Login",
			metadata: await AccessService.login({
				email: req.body.email,
				password: req.body.password
			})
		}).send(res);
	}
	static async logout(req, res, next) {
		return new OK({
			message: "Logout",
			metadata: await AccessService.logout({
				token: req.body.token
			})
		}).send(res);
	}
	static async register(req, res, next) {
		return new CREATED({
			message: "Register",
			metadata: await AccessService.register({
				email: req.body.email,
				name: req.body.name,
				password: req.body.password
			})
		}).send(res);
	}
	static async validToken(req, res, next) {
		return new OK({
			message: "Valid token",
			metadata: await AccessService.validToken(req.body.token
			)
		}).send(res);
	}
}
module.exports = AccessController;