const rooms = require("../loaders/server.js")
const config = require("../assets/config.json")
const { characterCheck } = require("./characterCheck.js")

class Room {
	constructor(creatorID, roomID) {
		let currentTime = new Date()
		let endCreationTime = currentDate.setHours(currentDate.getHours() + 2)
		this.creatorID = creatorID,
		this.roomID = roomID,
		this.gameState = "waiting",
		this.players = [creatorID],
		this.playerNumber = [], // player 1 2 3, players added will not be removed even if the player leaves for consistency
		this.wordsUsed = [],
		this.playerPoints = {},
		this.lastWord = "",
		this.currentTurn = creatorID, // creator of the room has first turn
		this.createdTime = currentTime,
		this.expiryTime = endCreationTime,
		this.startGameTime = ""
	}

	broadcast(eventName, message) {
		io.to(this.roomID).emit(eventName, message);
	}

	sendToPlayer(playerID, event, message) {
		if(!message) return io.to(playerID).emit(event);
		return io.to(playerID).emit(event, message);
	}

	addPlayer(playerID) {
		this.players.push(playerID);
		this.playerNumber.push(playerID);
		this.broadcast("newPlayerJoined", playerID);
	}

	removePlayer(playerID){
		this.players = this.players.filter(player => player.id !== playerID);
		if(this.players.length < 1) {
			delete rooms[this.roomID];
		}
	}

// game mechanics

	usedWord(word) {
		this.wordsUsed.push(word);
	}

	setTurn(playerID) {
		this.currentTurn = playerID;
	}

	nextTurn(playerID) {
		let playerArray = this.players;
		let oldPlayerIndex = playerArray.indexOf(playerID);
		let newPosition = oldPlayerIndex + 1;
		let newPlayer = playerArray[`${newPosition}`];
		if(playerArray.length < newPosition) newPlayer = playerArray[0];
		this.currentTurn = newPlayer;
		this.broadcast("nextTurn", newPlayer);
	}

	startGame() {
		this.broadcast("gameStart", { playerNumber: this.playerNumber }); // at the start of the game the array to help determine the player number is sent, on the client side the player's name will be determined from the array with index of
		this.gameState = "running";
		this.broadcast("nextTurn", this.creatorID);
	}

	endGame() {
		this.broadcast("endGame", {});
		this.gameState = "ended";
		delete rooms[this.roomID];
	}

	addPoints(playerID) {
		let currentScore = this.playerPoints[`${playerID}`]
		if(!currentScore) this.playerPoints[`${playerID}`] = 0
		this.playerPoints[`${playerID}`] + 1
		this.broadcast("addedPoint", {playerID: playerID})
	}

	playRound(word, playerID) {
		// check if the word begins with the end of the last word
		let wordArray = this.wordsUsed
		let latestWord = wordArray[wordArray.length - 1]
		if(latestWord.slice(-1) !== word.charAt(0)) return "wordDoesNotBeginWithLastLetter"
			//this.broadcast("wordDoesNotBeginWithLastLetter", { player: playerID })
			//this.sendToPlayer(playerID, "wordDoesNotBeginWithLastLetter")
			//return this.nextTurn(playerID)
			//return "wordDoesNotBeginWithLastLetter"

		// check if the word has already been used before
		if(wordArray.includes(word)) return "thisWordWasUsedBefore"

		// check if the characters used are valid
		if(!characterCheck(word)) return "invalidCharacters"

		if(!config.acceptedWords.includes(word)) {
			// check if the word actually exists (against a dictionary) (enable)
		}

		//add points
		this.addPoints(playerID)
		// pushes word
		this.usedWord(word)
		this.broadcast("newWord", this.wordsUsed)
		// next turn
		this.nextTurn(playerID)
	}

}

module.exports = Room;