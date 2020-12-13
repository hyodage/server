const Koa = require('koa')
const koaBody = require('koa-body')
const KoaRouter = require('koa-router')
const cors = require('koa2-cors')
const path=require('path')
const url=require('url')
const users=[]
let busId=0


/*实例化路由
* router方法：https://www.expressjs.com.cn/4x/api.html#router
* */
const router=new KoaRouter();

/*实例化Koa*/
const app = new Koa();
app.use(koaBody({multipart:true}))
app.use(router.routes());
// 监听端口
app.listen(9000);

/*根据id获取新闻信息*/
router.get('/getNews',async function(ctx) {
    const {query:{id}}=url.parse(ctx.url,true)
    ctx.body = {
        id,
        detail:'新闻内容'
    };
})
/*根据id获取用户名*/
router.post('/getUserName',async function(ctx) {
    const {id}=ctx.request.body
    // const id
    ctx.body = {
        id,
        name:'刘德华'
    }
})
/*将前端传递的openId 和业务id 想绑定
    *   如果后端数据中有openId，直接返回相关用户信息
    *   如果后端数据中没有有openId，基于openId和用户的其它信息创建新用户
    * */
router.post('/putOpenId',async function(ctx) {
    const {body}=ctx.request
    console.log('body',body)
    let type='老用户'
    let user=getUserByOpenId(body.openId)
    if(!user){
        type='新用户'
        user=putUser(body);
    }
    ctx.body ={
        type,
        user
    }
})
/*基于openId 查找用户*/
function getUserByOpenId(openId){
    for(let user of users){
        if(user.openId===openId){
            return user
        }
    }
    return null
}
/*添加新用户*/
function putUser(user){
    user.busId=busId
    busId++
    users.push(user)
    return user
}


