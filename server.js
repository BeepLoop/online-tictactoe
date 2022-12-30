const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const app = express()
const server = http.createServer(app)
const crypto = require('crypto')
const io = new Server(server)
const db = require('./users')
const PORT = process.env.PORT || 3000

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

app.post('/newGame', (req, res) => {
    const body = req.body
    const player = db.getPlayerByName(body.username)
    if (player) return res.redirect('/')
    const gameId = crypto.randomUUID()
    res.render('game', { gameId: gameId, player: body.username })
})

app.post('/joinGame', (req, res) => {
    const body = req.body
    const player = db.getPlayerByName(body.username)
    if (player) return res.redirect('/')
    res.render('game', { gameId: body.gameId, player: body.username })
})

io.on('connection', (socket) => {
    console.log(`user connected, socket id ${socket.id}`)

    socket.on('game', (data) => {
        let turn

        const playersInRoom = db.getRoomPlayers(data.gameId)
        console.log({ playersInRoom })

        if (playersInRoom.length === 1) {
            console.log('one player in game room')
            turn = 2
        } else {
            console.log('no player in game room')
            turn = 1
        }

        const user = db.joinGame(socket.id, data.playerName, data.gameId, turn)

        socket.join(user.gameId)

        console.log(`${user.playerName} joined in game ${user.gameId}`)
        console.log('users: ', db.getUsers())

        socket.emit('gameInit', {
            turnToPick: user.turnToPick,
        })

        const gameRoomPlayers = db.getRoomPlayers(data.gameId)
        console.log('players in game room after joining: ', gameRoomPlayers)

        if (gameRoomPlayers.length >= 2) {
            io.to(user.gameId).emit('board', {
                board: BOARD,
                firstPlayerTiles: gameRoomPlayers[0].playerTiles,
                secondPlayerTiles: gameRoomPlayers[1].playerTiles,
                playerToPick: playerToPick,
            })
        }
    })

    socket.on('tileSelect', (data) => {
        console.log(data)

        const roomPlayers = db.getRoomPlayers(data.gameId)
        let tileIsSelected = false
        for (const player of roomPlayers) {
            if (player.playerTiles.includes(data.tile)) tileIsSelected = true
        }
        console.log({ tileIsSelected })

        if (tileIsSelected) {
            socket.emit('tileError', {
                errorMessage: 'tile already selected',
            })
        } else {
            const playerTile = db.addPlayerTile(data.player, data.tile)
            console.log({ playerTile })

            if (playerTile.turnToPick === 1) {
                playerToPick = 2
            } else {
                playerToPick = 1
            }

            io.to(data.gameId).emit('board', {
                board: BOARD,
                firstPlayerTiles: roomPlayers[0].playerTiles,
                secondPlayerTiles: roomPlayers[1].playerTiles,
                playerToPick: playerToPick,
            })

            if (won(playerTile.playerTiles)) {
                io.to(data.gameId).emit('won', {
                    winner: playerTile.playerName,
                })
            }
        }
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
        const playerLeave = db.leaveGame(socket.id)
        if (playerLeave.success === true) {
            io.to(playerLeave.data[0].gameId).emit('playerLeave', {
                message: 'your opponent left the game',
            })
        }
        console.log('user disconnected')
        console.log(db.getUsers())
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
