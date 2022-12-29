const users = []

let user = {}

user.joinGame = (playerId, playerName, gameId, turnToPick) => {
    const user = { playerId, playerName, gameId, turnToPick, playerTiles: [] }
    users.push(user)
    return user
}

user.getRoomPlayers = (gameId) => {
    const players = []
    users.forEach((user) => {
        if (user.gameId === gameId) players.push(user)
    })
    return players
}

user.getPlayerTiles = (playerId) => {
    const player = users.find((user) => user.playerId === playerId)
    return player
}

user.addPlayerTile = (playerName, tile) => {
    const player = users.find((user) => {
        if (user.playerName === playerName) {
            user.playerTiles.push(tile)
            return user
        }
    })
    return player
}

user.getPlayerByName = (playerName) => {
    const player = users.find((user) => user.playerName === playerName)
    return player
}

user.getUsers = () => {
    return users
}

module.exports = user
