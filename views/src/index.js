import Game from "./game.js"
import { drawLeaderboard } from "./drawer.js"
import { renderID } from "./game.js"

/**
 * Joins the websocket connection that the HTTP server has established.
 * More precisely, it connects the client to the default namespace `'/'`
 * - You can think of it as joining in on an on-going conference call
 */
let socket = io()
let username = ""

let music = document.getElementById("main-music")
music.play()

//menu screen HTML elements
const signinModal = document.getElementById("signin-modal")
const menuModal = document.getElementById("menuModal")
const joinGameBtn = document.getElementById("joinGameBtn")
const leaderBoardBtn = document.getElementById("leaderBoardBtn")
const logo = document.getElementById("logo")

//Login-Form screen HTML elements
const loginbtn = document.getElementById("loginbtn")
const loginUsernameInput = document.getElementById("login-username")
const loginPasswordInput = document.getElementById("login-password")
const Disclaimer = document.getElementById("Disclaimer")

//Register-Form screen HTML elements
const registerbtn = document.getElementById("registerbtn")
const registerUsernameInput = document.getElementById("register-username")
const registerPasswordInput = document.getElementById("register-password")

//LeaderBoard screen HTML elements
const leaderBoard = document.getElementById("Leaderboard")
const back2menuBtn = document.getElementById("back2menuBtn")
const signoutbtn = document.getElementById("sign-out-btn")

//game screen HTML elements
const gameMap = document.getElementById("game-map")
const scoreBoard = document.getElementById("scoreboard")
const waitingBox = document.getElementById("waiting-box")
const container = document.getElementById("container")
const back2leaderBoardBtn = document.getElementById("back2leaderBoardBtn")

//Event Listeners

//menu screen
joinGameBtn.addEventListener("click", tryJoiningGame)
leaderBoardBtn.addEventListener("click", getleaderboard)

//Login-Form screen
loginbtn.addEventListener("click", login)

//Register Form
registerbtn.addEventListener("click", register)

//Game Screen
back2leaderBoardBtn.addEventListener("click", back2leaderBoard)

//LeaderBoard Screen
back2menuBtn.addEventListener("click", goToMenu)
signoutbtn.addEventListener("click", signOut)

//This function is excuted as soon as someone presses on the login button.
function login() {
	//send out the info submitted by the user to the server.
	socket.emit("login", { username: loginUsernameInput.value, password: loginPasswordInput.value })
	//when recieveing the loginResponse it checks if his login was successful or not.
	socket.on("loginResponse", function (data) {
		if (data.reason == null && data.success) {
			username = loginUsernameInput.value
			/** If success, then log them in */
			Disclaimer.style.display = "none"
			logo.style.display = "none"
			signinModal.style.display = "none"
			menuModal.style.display = "inline-block"
		} else {
			/** If not success, give them feedback */
			alert(data.reason)
		}
	})
}

//This function is executed as soon as someone presses on the register button.
function register() {
	//send out the info submitted by the user to the server.
	socket.emit("register", { username: registerUsernameInput.value, password: registerPasswordInput.value })
	//when recieveing the registerResponse it checks if his regestration was successful or not.
	socket.on("registerResponse", function (data) {
		if (data.reason == null && data.success) {
			username = registerUsernameInput.value
			/** If success, then log them in */
			Disclaimer.style.display = "none"
			logo.style.display = "none"
			signinModal.style.display = "none"
			menuModal.style.display = "inline-block"
		} else {
			/** If not success, give them feedback */
			alert(data.reason)
		}
	})
}

//This function is executed as soon as someone presses on the MainMenu button while on the leaderboard screen
// It returns the user to the main menu
function goToMenu() {
	Disclaimer.style.display = "none"
	logo.style.display = "none"
	leaderBoard.style.display = "none"
	menuModal.style.display = "block"
	back2menuBtn.style.display = "none"
}

//This function is executed as soon as someone presses on the LeaderBoard button on the main menu screen
function getleaderboard() {
	requestLeaderboardData()
	Disclaimer.style.display = "none"
	menuModal.style.display = "none"
	leaderBoard.style.display = "block"
	back2menuBtn.style.display = "inline-block"
}

// Requests leaderboard data and waits for a response to display it on the leaderboard.
function requestLeaderboardData() {
	socket.emit("req_lb_data")
	socket.on("lb_data_req_ack", (data) => {
		if (data != null) {
			// populate the leaderboard with data.response
			drawLeaderboard(data)
		} else {
			// leaderboard currently unavailable
			console.log("No data:", data)
		}
	})
}

// returns the user to the leaderboard screen after a game has ended
function back2leaderBoard() {
	clearInterval(renderID)
	requestLeaderboardData()
	Disclaimer.style.display = "none"
	gameMap.style.display = "None"
	waitingBox.style.display = "None"
	container.style.display = "None"
	scoreBoard.style.display = "None"
	back2menuBtn.style.display = "none"
	leaderBoard.style.display = "block"
	signoutbtn.style.display = "inline-block"
	document.body.style.borderColor = "#892be28c"
}

// Signs the player out
function signOut() {
	location.reload()
}

// Requests the server to join a game and waits for a confirmation
function tryJoiningGame() {
	Disclaimer.style.display = "none"
	back2menuBtn.style.display = "none"
	container.style.display = "flex"
	menuModal.style.display = "none"
	waitingBox.style.display = "flex"
	scoreBoard.style.display = "block"
	socket.emit("joinGameRequest", { user: username })
	socket.on("request_ack", () => {
		new Game(socket)
	})
}
