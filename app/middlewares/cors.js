module.exports = async (ctx, next) => {
    ctx.set({
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, shared-secret',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Credentials': true
    });
    await next()
}