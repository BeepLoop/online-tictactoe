const boardContainer = document.getElementById('board')
const gameOverDisplay = document.getElementById('text')
const restart = document.getElementById('restart')
const socket = io()

let playerToPick
let firstPlayer = []
let secondPlayer = []

socket.on('won', (data) => {
    gameOverDisplay.innerHTML = `${data.winner} won!`
})

socket.on('board', (gameData) => {
    playerToPick = gameData.playerToPick
    firstPlayer = gameData.firstPlayerTiles
    secondPlayer = gameData.secondPlayerTiles
    makeBoard(gameData.board)
    console.table({ firstPlayer, secondPlayer })
})

document.addEventListener('click', (event) => {
    if (!event.target.classList.contains('cell')) return

    console.log(event.target.dataset.id)

    socket.emit('tileSelect', {
        player: playerToPick,
        tile: event.target.dataset.id,
    })

    if (firstPlayer.length + secondPlayer.length + 1 >= 9) {
        gameOverDisplay.innerHTML = 'Game Over'
    }

    clearBoard(boardContainer)
})

restart.addEventListener('click', () => {
    socket.emit('restart')
    clearBoard(boardContainer)
    gameOverDisplay.innerHTML = ''
})

function makeBoard(board) {
    board.forEach((row) => {
        const wrapper = document.createElement('div')
        wrapper.classList.add('wrapper')

        row.forEach((item) => {
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cell.dataset.id = item

            if (firstPlayer.includes(item.toString())) {
                cell.classList.add('green')
            }

            if (secondPlayer.includes(item.toString())) {
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
