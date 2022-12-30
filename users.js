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

user.getCurrentPlayer = (playerId) => {
    const player = users.find((user) => user.playerId === playerId)
    return player
}

user.leaveGame = (playerId) => {
    const playerIndex = users.findIndex((user) => user.playerId === playerId)
    console.log({ playerIndex })

    if (playerIndex !== -1) {
        users.splice(playerIndex, 1)
        return { success: true, data: users }
    } else {
        return { success: false, error: 'cannot find the user' }
    }
}

user.getUsers = () => {
    return users
}

module.exports = user
