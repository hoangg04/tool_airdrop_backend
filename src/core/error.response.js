"use strict";
const { ReasonPhrases, StatusCodes } = require("../utils/httpStatusCode");

class ErrorResponse extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
	
}

class ConflictRequestError extends ErrorResponse {
	constructor(message = ReasonPhrases.CONFLICT, status = StatusCodes.CONFLICT) {
		super(message, status);
	}
}

class BadRequestError extends ErrorResponse {
	constructor(message = ReasonPhrases.FORBIDDEN, status = StatusCodes.FORBIDDEN) {
		super(message, status);
	}
}

class AuthorizedError extends ErrorResponse {
	constructor(message = ReasonPhrases.UNAUTHORIZED, status = StatusCodes.UNAUTHORIZED) {
		super(message, status);
	}
}
class NotFoundError extends ErrorResponse {
	constructor(message = ReasonPhrases.NOT_FOUND, status = StatusCodes.NOT_FOUND) {
		super(message, status);
	}
}
class ForbiddenError extends ErrorResponse {
	constructor(message = ReasonPhrases.FORBIDDEN, status = StatusCodes.FORBIDDEN) {
		super(message, status);
	}

}
class RedisErrorResponse extends ErrorResponse {
	constructor(message = "Connection redis error", status = -99) {
		super(message, status);
	}

}
class PermissionError extends ErrorResponse {
	constructor(message = "Permission denied", status = StatusCodes.FORBIDDEN) {
		super(message, status);
	}
}
class MethodNotAllowedError extends ErrorResponse {
	constructor(message = ReasonPhrases.METHOD_NOT_ALLOWED, status = StatusCodes.METHOD_NOT_ALLOWED) {
		super(message, status);
	}
}

module.exports = {
	ConflictRequestError,
	BadRequestError,
	AuthorizedError,
	NotFoundError,
	ForbiddenError,
	RedisErrorResponse,
	MethodNotAllowedError,
	PermissionError
};
