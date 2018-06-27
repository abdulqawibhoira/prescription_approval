class APIError extends Error {
  constructor(htttpStatusCode = 500, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);
    // Maintains proper stack trace for where our error was thrown.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
    this.htttpStatusCode = htttpStatusCode;
  }
}

module.exports = APIError;