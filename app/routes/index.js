"use strict"
const fs = require("fs");
const path = require("path");
const router = new require('koa-router')();

const getAllRouters = dir => {
    let routers = {};
    fs
        .readdirSync(dir)
        .filter(file => {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(file => {
            let file_name = file.replace(".js", "");
            routers[file_name] = require(path.join(dir, file));
        });
    return routers;
}

let allRouters = getAllRouters(__dirname);

router.use('/v1', allRouters.v1.routes(), allRouters.v1.allowedMethods());


module.exports = router;
