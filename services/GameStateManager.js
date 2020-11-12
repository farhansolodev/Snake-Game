const Snake = require("../models/snake.js")
const AllFood = require("../models/food.js")
const Collision = require("./GameCollision.js")

class GameStateManager {
	constructor(server) {
		/**
		 * @type {"Socket.id : Socket"}
		 */
		GameStateManager.socket_list = {}

		/**
		 * @type {Socket.id : Snake}
		 */
		Snake.player_list = {}

		GameStateManager.game_speed = 30

		GameStateManager.sendingUpdateID = 0
		GameStateManager.gameUpdateID = 0

		GameStateManager.initpack = { snakes: [] }
		GameStateManager.removepack = { IDs: [] }

		// Event listener for every time someone joins the websocket connection
		server.sockets.on("connection", function (clientSocket) {
			if (Object.keys(GameStateManager.socket_list).length == 0) {
				console.log("\nNew game starting up")
				GameStateManager.allFood = new AllFood(75, 75, 0.75)
				GameStateManager.startUpdatingGame()
				GameStateManager.startSendingUpdates()
			}

			Snake.onConnect(clientSocket)

			clientSocket.on("disconnect", function () {
				Snake.disconnect(clientSocket)

				if (Object.keys(GameStateManager.socket_list).length == 0) {
					// GameStateManager.terminateConnection(server)
				}
			})
		})
	}
}

GameStateManager.startSendingUpdates = function () {
	const tickrate = 30
	const delayBetweenTicksInMs = 1000 / tickrate
	GameStateManager.sendingUpdateID = setInterval(function () {
		let snakepack = {
			snakes: Snake.getUpdatedSnakes(),
		}

		let foodpack = {
			food: GameStateManager.allFood.getAllFood(),
		}

		for (let socket_id in GameStateManager.socket_list) {
			let socket = GameStateManager.socket_list[socket_id]
			socket.emit("init", GameStateManager.initpack) // if nobody new joins, then this just sends an empty object
			socket.emit("update", snakepack)
			socket.emit("food", foodpack)
			socket.emit("remove", GameStateManager.removepack) // if nobody leaves, then this just sends an empty object
		}
		GameStateManager.initpack.snakes = []
		GameStateManager.removepack.IDs = []
	}, delayBetweenTicksInMs)
}

GameStateManager.startUpdatingGame = function () {
	const delayBetweenTicksInMs = 1000 / GameStateManager.game_speed
	gameUpdateID = setInterval(function () {
		for (let socket_id in Snake.player_list) {
			let snake = Snake.player_list[socket_id]
			snake.update()
		}
		Collision.updateFood(Snake.player_list, GameStateManager.allFood)
		Collision.collision_with_enemies(Snake.player_list)
	}, delayBetweenTicksInMs)
}

/**
 * Carries out tasks related to terminating a websocket server connection
 * @param {SocketIO.Server} server
 */
GameStateManager.terminateConnection = function (server) {
	let terminateGamePromise = new Promise((log) => {
		/**
		 * * When both setIntervals are closed, the Express server shuts down,
		 * * but I can choose to only terminate only one of them
		 * TODO: Keep Express server running
		 * * Possible fix: have multiple rooms
		 */
		clearInterval(GameStateManager.gameUpdateID)
		clearInterval(GameStateManager.sendingUpdateID)
		log()
	})

	let terminateConnectionPromise = new Promise((log) => {
		server.close()
		log()
	})

	terminateGamePromise.then((_) => {
		console.log("\nGame terminated")
	})

	terminateConnectionPromise.then((_) => {
		console.log("\nWebsocket server closed")
	})
}

/**
 * Carries out tasks related to terminating a player from a game
 * @param {SocketIO.Socket} clientSocket the websocket connection that the player is communicating on
 */
Snake.disconnect = function (clientSocket) {
	// Print to the server's terminal that a user disconnected
	console.log("Player with ID:", clientSocket.id, "disconnected")
	delete GameStateManager.socket_list[clientSocket.id]
	delete Snake.player_list[clientSocket.id]
	GameStateManager.removepack.IDs.push(clientSocket.id)
}

/**
 * Carrying out tasks related to initialising a player into the game
 * @param {SocketIO.Socket} clientSocket the websocket connection that the player is communicating on
 */
Snake.onConnect = function (clientSocket) {
	// Print to the server's terminal that a player connected
	console.log("Player with ID:", clientSocket.id, "connected")

	clientSocket.emit("CONN_ACK", "You succesfully connected")

	let snake = new Snake(
		clientSocket.id,
		Math.floor(Math.random() * 74),
		Math.floor(Math.random() * 74)
	)

	GameStateManager.initpack.snakes.push(snake)
	// snake.addToBody(19, 74)
	// snake.addToBody(18, 74)
	// snake.addToBody(17, 74)
	// snake.addToBody(16, 74)
	// snake.addToBody(15, 74)

	clientSocket.on("keyDown", (data) => {
		snake.setdirectionHeading(data.dir) // move this inside update
		// snake.move()
		console.log(data)
	})

	clientSocket.emit("init", { snakes: Snake.getInitSnakes() })

	GameStateManager.socket_list[clientSocket.id] = clientSocket // adding each socket connection to an associative array
}

Snake.getInitSnakes = function () {
	let snakepack = []
	for (const socketid in Snake.player_list) {
		const snake = Snake.player_list[socketid]
		snakepack.push(snake)
	}
	return snakepack
}

Snake.getUpdatedSnakes = function () {
	let snakes = []
	for (let socket_id in Snake.player_list) {
		let snake = Snake.player_list[socket_id]
		// let snake = socket.snake
		snakes.push(snake)
	}
	return snakes
}

module.exports = GameStateManager

//Our snake should move continuously so it should be inside a setinterval which will make it move continuously. Which will make the speed of the snake the speed of the setInterval.