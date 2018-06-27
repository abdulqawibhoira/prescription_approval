const logData = (ctx) => {
    const logData = {
        host: ctx.request.host,
        url: ctx.request.url,
        request_body: ctx.request.body,
        headers: ctx.request.headers,
        query_string_parameter: ctx.request.query,
        method: ctx.request["method"],
        log_extra: ctx.logExtra,
        http_status: ctx.status
    };
    //**  Here record logs to logging service such as "papertrail" or "loggly" to  monitor debug logs of the platform **/
    // logRequest(logData);
};

module.exports = { logData };