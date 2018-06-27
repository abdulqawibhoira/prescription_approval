const controllers = require('../controllers');
const router = new require('koa-router')();


router.post('/user/login', controllers.users.userLogin);

module.exports = router;
