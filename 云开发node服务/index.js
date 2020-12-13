let WebSocket = require("ws");

/*实例化WebSocket 服务器*/
let wss = new WebSocket.Server({
    port:8181
})
/*playerMap 玩家集合：存储服务端的WebSocket对象和玩家信息
*   ws webSocket 对象
*   openid 微信用户唯一识别标准
*   nickName 昵称
*   avatarUrl 玩家头像
*   diff 准确度
*   rank 排名
* */
let playerMap = new Map();

/*room 房间：存储在房间中的玩家*/
let room = new Map();

/*connection：当小程序端的webSocket 连接到WebSocket 服务器时，就新建一个webSocket 对象与其对接*/
wss.on("connection",ws=>{
    let openid=null;
    console.log('connection');
    /*message：当小程序端的webSocket向服务端的webSocket发来信息时
    *   pushUserInfo：向playerMap 集合添加玩家信息
    *   updateInroom：更新玩家在房间中的状态
    *   updatePlayer：更新玩家列表
    *   play：收到房主的开始游戏命令时，将此命令传递给所有玩家
    * */
    ws.on("message",res=>{
        const {method,data}=JSON.parse(res);
        switch (method) {
            case 'pushUserInfo':
                openid=data.openid;
                pushUserInfo(data,ws);
                break
            case 'updateInroom':
                updateInroom(data,openid);
                break
            case 'updatePlayer':
                updatePlayer(data,openid,ws);
                break
            case 'play':
                sendPlayInfo();
                break
        }
    })
    /*close 当小程序端的webSocket与服务端的webSocket断开连接时
    *   将与当前玩家从playerMap和room 中删除
    * */
    ws.on("close",()=>{
        playerMap.delete(openid);
        room.delete(openid);
    })
})

/*向playerMap 集合添加玩家信息
*   若playerMap 中没有此玩家，就添加此玩家
*   sendPlayersToAll() 将更新过的玩家列表发送给所有玩家
* */
function pushUserInfo(data,ws){
    const {openid,nickName,avatarUrl}=data;
    if(!playerMap.has(openid)){
        playerMap.set(openid,{
            nickName:nickName,
            avatarUrl:avatarUrl,
            inroom:false,
            diff:Infinity,
            role:2,
            ws,
        });
        sendPlayersToAll();
    }
}

/*更新玩家在房间中的状态*/
function updateInroom(data,openid){
    const player=playerMap.get(openid);
    Object.assign(player,data);
    if(room.size){
        if(player.inroom){
            player.role=2;
            room.set(openid,player);
        }else{
            room.delete(openid);
            if(room.size&&player.role===1){
                [...room][0][1].role=1;
            }
            player.role=2;
        }
    }else{
        if(player.inroom){
            player.role=1;
            room.set(openid,player);
        }else{
            room.delete(openid);
        }
    }
    sendPlayersToAll();
}

/*更新玩家列表*/
function updatePlayer(data,openid,ws){
    const player=playerMap.get(openid);
    Object.assign(player,data);
    sendPlayersToAll();
}

/*发送数据给每个玩家*/
function sendPlayersToAll(){
    const players=parsePlayerMap();
    const data=JSON.stringify({
        method:'update',
        data:players
    });
    playerMap.forEach(({ws})=>{
        ws.send(data);
    })
}

/*解析玩家集合
*   从中提取特定信息，构成新的数组
*   对新的数组排序
* */
function parsePlayerMap(){
    const arr=[];
    playerMap.forEach(({role,nickName,avatarUrl,diff,inroom})=>{
        arr.push({role,nickName,avatarUrl,diff,inroom})
    })
    arr.sort((a,b)=>{
        return a.diff-b.diff;
    })
    return arr;
}

/*发送开始游戏信息*/
function sendPlayInfo(){
    const data=JSON.stringify({
        method:'play',
        data:null
    })
    playerMap.forEach(({ws})=>{
        ws.send(data);
    })
}