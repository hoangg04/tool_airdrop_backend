"use strict";

const { model, Schema } = require("mongoose");
var userSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		token: { type: [String], default: [] },
		role: { type: String, default: "user" },
	},
	{
		timestamps: true,
		collection: "users",
	},
);


module.exports = model("Users", userSchema);
