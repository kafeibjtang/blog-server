var app = require('./app');
var http = require('http');
let webSocketServer = http.Server(app)
let socketIo = require('socket.io')
let io = socketIo(webSocketServer, { transports: ['websocket'] })
let { formatDate } = require('./core/util/util')

const users = {}



io.on('connection', (socket) => {

  console.log('连接已经建立', `id:${socket.id}`)

  socket.on('online', ({ uid, nickname }) => {
    if (users[uid]) {
      //如果id存在说明已经登录，关闭前一个的链接让其下线
      users[uid].socket.disconnect()
    }
    //给新登录的用户建立链接并存储信息
    users[uid] = {
      uid,
      nickname,
      //会话对象
      socket: socket,
    }
    socket.uid = uid
    socket.ghost = false
  })


  socket.on('enterChat', ({ uid, nickname }) => {
    io.sockets.emit('logged', nickname)
    if (users[uid]) {
      return
    }

    users[uid] = {
      uid,
      nickname,
      socket: socket,
    }
    socket.uid = uid
    socket.ghost = true
  })
  //离开聊天室
  socket.on('leaveChat', () => {
    let uid = socket.uid

    io.sockets.emit('logout', users[uid]?.nickname)
  })
  //客户端断开连接
  socket.on('disconnect', () => {
    let uid = socket.uid
    delete users[uid]
  })

  socket.on('send', (msg) => {

    let nickname = users[socket['uid']]['nickname']
    console.log(socket.uid, Object.keys(users))
    socket.broadcast.emit('chat', {
      nickname,
      msg: msg,
      time: formatDate()
    })
  })

})


webSocketServer.listen(8888, () => {
  console.log('websocket聊天室开启 端口8888')
})

module.exports = webSocketServer
