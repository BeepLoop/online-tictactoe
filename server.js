const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const app = express()
const server = http.createServer(app)
const crypto = require('crypto')
const io = new Server(server)
const db = require('./users')
const PORT = process.env.PORT || 3000

let firstPlayerTiles = []
let secondPlayerTiles = []
let playerToPick = 1
const BOARD = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

io.on('connection', (socket) => {
    console.log(`user connected, socket id ${socket.id}`)

    socket.emit('board', {
        board: BOARD,
        firstPlayerTiles,
        secondPlayerTiles,
        playerToPick,
    })

    socket.on('tileSelect', (data) => {
        console.log(data)
        if (data.player === 1) {
            firstPlayerTiles.push(data.tile)

            if (won(firstPlayerTiles)) {
                socket.emit('won', { winner: 'Green Team' })
            }

            playerToPick = 2
        } else {
            secondPlayerTiles.push(data.tile)
            if (won(secondPlayerTiles)) {
                socket.emit('won', { winner: 'Orange Team' })
            }
            playerToPick = 1
        }

        socket.emit('board', {
            board: BOARD,
            firstPlayerTiles,
            secondPlayerTiles,
            playerToPick,
        })
    })

    socket.on('restart', () => {
        firstPlayerTiles = []
        secondPlayerTiles = []
        playerToPick = 1

        socket.emit('board', {
            board: BOARD,
            firstPlayerTiles,
            secondPlayerTiles,
            playerToPick,
        })
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

server.listen(PORT, () => console.log(`listening to port ${PORT}`))

function won(array) {
    const win1 =
        array.includes('1') && array.includes('2') && array.includes('3')
    const win2 =
        array.includes('4') && array.includes('5') && array.includes('6')
    const win3 =
        array.includes('7') && array.includes('8') && array.includes('9')
    const win4 =
        array.includes('1') && array.includes('5') && array.includes('9')
    const win5 =
        array.includes('3') && array.includes('5') && array.includes('7')
    const win6 =
        array.includes('1') && array.includes('4') && array.includes('7')
    const win7 =
        array.includes('2') && array.includes('5') && array.includes('8')
    const win8 =
        array.includes('3') && array.includes('6') && array.includes('9')

    if (win1) return true
    if (win2) return true
    if (win3) return true
    if (win4) return true
    if (win5) return true
    if (win6) return true
    if (win7) return true
    if (win8) return true
    return false
}
