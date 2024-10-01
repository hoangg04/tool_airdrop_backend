"use strict";

const mongoose = require("mongoose");

let uri = "mongodb://localhost:27018/airdrop";

console.log(uri);
class Database {
	constructor() {
		this.connect();
	}
	connect(type = "mongodb") {
		if (0 === 1) {
			mongoose.set("debug", true);
			mongoose.set("debug", { color: true });
		}

		mongoose
			.connect(uri)
			.then((_) => console.log("Database connected"))
			.catch((err) => console.error(err));
	}
	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database();

		}
		return Database.instance;
	}
}

const instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb;
