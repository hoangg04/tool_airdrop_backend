"use strict";

const { model, Schema } = require("mongoose");

var userSchema = new Schema(
	{
		bot_of_user: { type: Schema.Types.ObjectId, required: true },
		bot_type: { type: String, required: true },// [tsubasa, blum,....]
		bot_init_data: { type: Schema.Types.String, required: true },
		bot_proxy: { type: String, required: true ,},/// host:port:username_password
		bot_data: {
			type: Object,
			default: {}
		}
	},
	{
		timestamps: true,
		collection: "bots",
	},
);


module.exports = model("Bots", userSchema);
