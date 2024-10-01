require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const TsubasaService = require("./service/tsubasa.service");
const app = express();
app.use(cors("*"));
app.use(morgan("dev"));
app.use(helmet());
app.use(
	compression({
		level: 6,
		threshold: 100 * 1000, 
	}),
);
app.use(
	express.urlencoded({
		extended: true,
	}),
);

app.use(express.json());
app.use(cookieParser());

require("./dbs/init.mongodb");

app.use("/api/", require("./routes"));
app.use((req, res, next) => {
	const error = new Error("Not found");
	error.status = 404;
	next(error);
});
app.use((error, req, res, next) => {
	const statusCode = error.status || 500;
	const errorResponse = {
		message: error.status == 500 ? "Internal Server Error" : error.message,
		code: statusCode,
		status: "error",
	};
	console.log(error.stack)
	if (process.env.NODE_ENV === "dev") errorResponse.stack = error.stack;
	return res.status(statusCode).json(errorResponse);
});
module.exports = app;
