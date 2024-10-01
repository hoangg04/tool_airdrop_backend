const { apiResponse } = require('../utils/response');
const { BadRequestError } = require('../core/error.response');
const { v4: uuidv4 } = require("uuid");
const userModel = require('../models/user.model');
class AccessService {
	static async login({ email, password }) {
		if (!email || !password) {
			throw new BadRequestError('Email and password are required');
		}
		const holderUser = await userModel.findOne({ email });
		if (!holderUser) {
			throw new BadRequestError('Invalid email or password');
		}
		const passwordMatch = (password == holderUser.password);
		if (!passwordMatch) {
			throw new BadRequestError('Invalid email or password');
		}
		const token = uuidv4()
		holderUser.token.push(token)
		await holderUser.save()
		return apiResponse({
			code: "x0002",
			message: 'Login successfully',
			data: {
				user: {
					id: holderUser.id,
					email: holderUser.email,
					name: holderUser.name,
				},
				token
			}

		})
	}
	static async logout({ token }) {
		const holderUser = await userModel.findOne({
			token: token
		})
		if (!holderUser) {
			throw new BadRequestError('Invalid token');
		}
		holderUser.token = holderUser.token.filter(item => item !== token)
		await holderUser.save()
		return apiResponse({
			code: "x0003",
			message: 'Logout successfully'
		})
	}
	static async register({ email, name, password }) {
		if (!email || !name || !password) {
			throw new BadRequestError('Email, name and password are required');
		}
		const holderUser = await userModel.findOne({ email });
		if (holderUser) {
			throw new BadRequestError('Email already exists');
		}
		const token = uuidv4();
		const newUser = await userModel.create({
			email,
			name,
			password,
			token
		})

		return apiResponse({
			code: "x0001",
			message: 'Register successfully',
			data: {
				user: {
					id: newUser.id,
					email: newUser.email,
					name: newUser.name,
				},
				token
			}
		})
	}
	static async validToken(token) {
		const holderUser = await userModel.findOne({
			token: token
		})
		if (!holderUser) {
			throw new BadRequestError('Invalid token');
		}
		return apiResponse({
			code: "x0004",
			message: 'Valid token'
		})
	}
}
module.exports = AccessService;