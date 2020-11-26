let gameMap = document.getElementById("game-map")
const x = 0
const y = 1

/**
 * Draws a snake on the map
 * @param {[number[]]} snake_body The body of the snake that will be drawn
 * @param {String} color the color assigned to the client snake
 */
function snakeDraw(snake_body, color) {
	snake_body.forEach((part) => {
		const currentSnake = document.createElement("div") // makes a div for our snake
		currentSnake.style.gridRowStart = part[y] // creates snake at part[1]
		currentSnake.style.gridColumnStart = part[x] // creates snake at part[0]
		currentSnake.classList.add("snake") // this adds the stylings to our snake div
		currentSnake.style.backgroundColor = color // specify the snake color.
		gameMap.appendChild(currentSnake) // this adds a snake div as a child node
	})
}

/**
 * Draws all of the snakes on the map.
 * @param {Object Literal} snakes all the players in the game.
 */
export function drawEverySnake(snakes) {
	for (const socketid in snakes) {
		let snake_body = snakes[socketid].body
		snakeDraw(snake_body, snakes[socketid].snakeColor)
	}
}

/**
 * Draws the state of the food on the map.
 * @param {Array} foodList list of all the food locations that will be drawn
 */
export function foodDraw(foodList) {
	if (foodList) {
		foodList.forEach((food) => {
			const currentFood = document.createElement("div") // makes a div for our food
			currentFood.style.gridRowStart = food.foodLocation[y] // creates food at getFoodLocation()[1]
			currentFood.style.gridColumnStart = food.foodLocation[x] // creates food at getFoodLocation()[0]
			currentFood.classList.add("food") // this adds the stylings to our food div
			gameMap.appendChild(currentFood) // this adds a food div as a child node
		})
	}
}

/**
 * Gets the data from the server and draws it for the client.
 * @param {Array} data list of every player's leaderboard information
 */
export function drawLeaderboard(data) {
	let rank = 1
	const leaderBoard = document.getElementById("Leaderboard").querySelector("table")
	leaderBoard.innerHTML = ""
	let leaderBoardHeader = leaderBoard.createTHead()
	let headerRow = leaderBoardHeader.insertRow(0)
	for (let column = 0; column < 3; column++) {
		let headerCell = headerRow.insertCell(column)
		if (column == 0) {
			headerCell.innerHTML = "Rank"
		} else if (column == 1) {
			headerCell.innerHTML = "Username"
		} else if (column == 2) {
			headerCell.innerHTML = "Wins"
		}
	}

	//leaderboard only shows top 9 players.
	for (var row = 0; row < 9; row++) {
		// create a new row
		var newRow = leaderBoard.insertRow(leaderBoard.length)
		for (var column = 0; column < 3; column++) {
			// create a new cell
			var cell = newRow.insertCell(column)
			if (column == 0) {
				cell.innerHTML = rank++
			} else if (column == 1) {
				cell.innerHTML = data[row].username
			} else if (column == 2) {
				cell.innerHTML = data[row].wins
			}
		}
	}
}

/**
 * Draws the scoreboard to showcase the scores of each player and their colors.
 * @param {Object Literal} snakes all the players in the game.
 */
export function drawScoreBoard(snakes) {
	let rows = []
	let scoreboard = document.getElementById("scoreboard").querySelector("table")
	// Add each row to the array
	scoreboard.innerHTML = ""
	let header = scoreboard.insertRow()
	let hRank = header.insertCell(0)
	hRank.innerHTML = "Rank"
	let hUser = header.insertCell(1)
	hUser.innerHTML = "Username"
	let hLength = header.insertCell(2)
	hLength.innerHTML = "Length"
	for (const socketid in snakes) {
		let snake = snakes[socketid]
		rows.push({
			username: snake.username,
			score: snake.tailIndex,
			color: snake.snakeColor,
		})
	}

	//Scoreboard over flow when there is more than 12 players.
	let sortedPlayers = rows.sort((a, b) => b.score - a.score)
	sortedPlayers.forEach((player) => {
		let row = scoreboard.insertRow()
		let rank = row.insertCell(0)
		rank.style.color = player.color
		let username = row.insertCell(1)
		username.style.color = player.color
		username.innerHTML = player.username
		let length = row.insertCell(2)
		length.innerHTML = player.score
		length.style.color = player.color
		getScore(sortedPlayers, player.score, rank)
	})
}

/**
 * Adds the rank beside each players name on the scoreboard.
 * @param {Array} playerlist the list of players in the game.
 * @param {number} score the score of the players.
 * @param {number} rank the rank beside the players name.
 */
function getScore(playerlist, score, rank) {
	for (let index = 0; index < playerlist.length; index++) {
		if (score == playerlist[index].score) {
			rank.innerHTML = index + 1
			return
		}
	}
}
