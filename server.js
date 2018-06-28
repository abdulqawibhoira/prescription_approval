const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const koa = require('koa');
const koaBody = require('koa-body');
const config = require('./app/configs');
const router = require('./app/routes');
const logMiddleWare = require('./app/misc/logData.js');
const { connectMongo } = require('./app/mongoHelper/connect.js');


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    const app = new koa();

    // Body Parser Middleware
    app.use(koaBody({
        strict: false,
        multipart: true
    }));

    // Allow CORS 
    app.use(require('./app/middlewares/cors.js'));

    // This Middleware will catch ALL Errors on all routes
    app.use(async (ctx, next) => {
        try {
            // new object created to add debug log specific data/message throughout request
            ctx.logExtra = {};
            await next();
        } catch (e) {
            //handle API error Response
            require('./app/misc/errorHandling.js')(e, ctx);
        }
        logMiddleWare.logData(ctx);
    });

    //Fetch All App routes  
    app.use(router.routes());
    app.use(router.allowedMethods());

    //connect to mongo
    connectMongo();

    const port = config.get('port');

    app.listen(port, function () {
        console.log("Server running on ", port);
    });

    console.log(`Worker ${process.pid} started`);
}