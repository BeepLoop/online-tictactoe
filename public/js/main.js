const boardContainer = document.getElementById('board')
const gameOverDisplay = document.getElementById('text')
const restart = document.getElementById('restart')
const copyButton = document.getElementById('copy')
const gameId = document.getElementById('gameId').innerHTML.split(':')[1].trim()
const playerName = document
    .getElementById('player')
    .innerHTML.split(':')[1]
    .trim()
const socket = io()

let firstPlayerTiles = []
let secondPlayerTiles = []
let playerToPick
let turnToPick

socket.emit('game', { playerName: playerName, gameId: gameId })

socket.on('nameExists', (error) => {
    alert(error.errorMessage)
})

socket.on('tileError', (error) => {
    alert(error.errorMessage)
})

socket.on('won', (data) => {
    gameOverDisplay.innerHTML = `${data.winner} won!`
})

socket.on('gameInit', (gameData) => {
    turnToPick = gameData.turnToPick
    boardContainer.innerHTML = 'waiting for other player'
})

socket.on('board', (gameData) => {
    playerToPick = gameData.playerToPick
    firstPlayerTiles = gameData.firstPlayerTiles
    secondPlayerTiles = gameData.secondPlayerTiles
    makeBoard(gameData.board)
    console.log({ playerToPick })
    console.table({ firstPlayerTiles, secondPlayerTiles })
})

document.addEventListener('click', (event) => {
    if (playerToPick !== turnToPick) return
    if (!event.target.classList.contains('cell')) return

    console.log(event.target.dataset.id)

    socket.emit('tileSelect', {
        gameId: gameId,
        player: playerName,
        tile: event.target.dataset.id,
    })

    // if (firstPlayer.length + secondPlayer.length + 1 >= 9) {
    //     gameOverDisplay.innerHTML = 'Game Over'
    // }

    // clearBoard(boardContainer)
})

restart.addEventListener('click', () => {
    socket.emit('restart')
    clearBoard(boardContainer)
    gameOverDisplay.innerHTML = ''
})

copy.addEventListener('click', () => {
    navigator.clipboard.writeText(gameId)
    alert('copied game ID')
})

function makeBoard(board) {
    clearBoard(boardContainer)
    board.forEach((row) => {
        const wrapper = document.createElement('div')
        wrapper.classList.add('wrapper')

        row.forEach((item) => {
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cell.dataset.id = item

            // if (firstPlayer.includes(item.toString())) {
            //     cell.classList.add('green')
            // }

            // if (secondPlayer.includes(item.toString())) {
            //     cell.classList.add('orange')
            // }

            wrapper.appendChild(cell)
        })
        boardContainer.appendChild(wrapper)
    })
}

function clearBoard(board) {
    while (board.firstChild) {
        board.removeChild(board.firstChild)
    }
}
