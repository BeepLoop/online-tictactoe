const boardContainer = document.getElementById('board')
const copyButton = document.getElementById('copy')
const prompt = document.getElementById('prompt')
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
let won = false

socket.emit('game', { playerName: playerName, gameId: gameId })

socket.on('nameExists', (error) => {
    alert(error.errorMessage)
})

socket.on('tileError', (error) => {
    alert(error.errorMessage)
})

socket.on('playerLeave', (data) => {
    console.log('player left')
    alert(data.message)
})

socket.on('won', (data) => {
    won = true
    prompt.innerHTML = `${data.winner} Won!`
})

socket.on('gameInit', (gameData) => {
    turnToPick = gameData.turnToPick
    prompt.innerHTML = 'Waiting for other player...'
})

socket.on('board', (gameData) => {
    playerToPick = gameData.playerToPick
    firstPlayerTiles = gameData.firstPlayerTiles
    secondPlayerTiles = gameData.secondPlayerTiles
    prompt.innerHTML = `Turn: Player ${playerToPick}`
    makeBoard(gameData.board)
})

document.addEventListener('click', (event) => {
    if (won) return
    if (playerToPick !== turnToPick) return
    if (!event.target.classList.contains('cell')) return

    socket.emit('tileSelect', {
        gameId: gameId,
        player: playerName,
        tile: event.target.dataset.id,
    })
})

copy.addEventListener('click', () => {
    navigator.clipboard.writeText(gameId)
    copy.innerHTML = 'Copied'
    setTimeout(() => {
        copy.innerHTML = 'Copy Game ID'
    }, 2000)
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

            if (firstPlayerTiles.includes(item.toString())) {
                cell.classList.add('green')
            }

            if (secondPlayerTiles.includes(item.toString())) {
                cell.classList.add('orange')
            }

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
