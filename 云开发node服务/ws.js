let WebSocket = require("ws");
/*实例化WebSocket 服务器*/
let wss = new WebSocket.Server({
    port:8182
})
/*用户集合*/
let userSet = new Set([]);
/*connection：当小程序端的webSocket 连接到WebSocket 服务器时，就新建一个webSocket 对象与其对接*/
wss.on("connection",ws=>{
    userSet.add(ws);
    /*message：当小程序端的webSocket向服务端的webSocket发来信息时*/
    ws.on("message",res=>{
        console.log('message',res);
        userSet.forEach(ws=>{
            ws.send(res)
        })
    })
    /*close：当小程序端的webSocket与服务端的webSocket断开连接时*/
    ws.on("close",()=>{
        userSet.delete(ws);
    })
})
