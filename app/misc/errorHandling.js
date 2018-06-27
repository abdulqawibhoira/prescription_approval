const constants = require('../constants.js');
const config = require('../configs');

module.exports = (e, ctx) => {
    //** Here we can send errors to error tracking tools such as rollbar or airbrake etc to monitor errors on production **/
    console.log(e);
    let message = e.message;
    //In Production Hide Actual Message
    if (!e.htttpStatusCode && config.get('env') == "production") {
        message = constants.INTERNAL_SERVER_ERROR_MESSAGE;
    }
    ctx.status = e.htttpStatusCode || 500;
    ctx.body = { status: "FAIL", "message": message };
}