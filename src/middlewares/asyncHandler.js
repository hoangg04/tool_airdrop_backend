"use strict";
const asyncHandler = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch((e) => {
			return next(e);
		});
	};
};
module.exports = { asyncHandler };
