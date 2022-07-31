const express = require('express')
const app = express()
const URL = require('url');
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const bodyParser = require('body-parser')

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render("landing")
})
app.post('/create',(req,res,next)=>{
  console.log("Hi")
  res.redirect(`/${uuidV4()}`)
})
app.post('/join',(req,res,next)=>{
  res.redirect(`/${req.body.meetingId}`)
})

// app.get('/', (req, res) => {
//   res.redirect(`/${uuidV4()}`)
// })

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)