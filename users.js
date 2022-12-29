const users = []

let user = {}

user.joinGame = (username, gameId) => {
    const user = { username, gameId }
    users.push(user)
    return user
}

module.exports = user
