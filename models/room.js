const rooms = require("../loaders/server.js");
const config = require("../assets/config.json");
const { characterCheck } = require("./characterCheck.js");
const { checkWord } = require("./wordValidator.js");
const { logError } = require("./errorManager.js");
const { pullFromArray } = require("./pullFromArray.js");

class Room {
	constructor(creatorID, roomID) {
		let currentTime = new Date();
		let endCreationTime = new Date(currentTime.getTime());
		endCreationTime.setHours(currentTime.getHours() + 2);
		let friendlyEndTime = currentDateTime("convert", endCreationTime)
		this.creatorID = creatorID,
			this.roomID = roomID,
			this.gameState = "waiting",
			this.players = [creatorID],
			this.playerNumber = [creatorID], // player 1 2 3, players added will not be removed even ifthe player leaves for consistency
			this.wordsUsed = [],
			this.playerPoints = {},
			this.currentTurn = "", // creator of the room has first turn
			this.createdTime = currentTime,
			this.expiryTime = friendlyEndTime,
			this.startGameTime = ""
	}

	idToIndex(playerID) {
		let number = this.playerNumber.indexOf(playerID) + 1;
		return number;
	}

	broadcast(eventName, details) {
		if(details) return io.to(this.roomID).emit(eventName, details);
		return io.to(this.roomID).emit(eventName);
	}

	sendToPlayer(playerID, event, message) {
		setTimeout(function () {
			if(!message) return io.to(playerID).emit(event);
			return io.to(`${playerID}`).emit(event, message);
		}, 200);
	}

	addPlayer(playerID) {
		this.players.push(playerID);
		this.playerNumber.push(playerID);
		this.broadcast("newPlayerJoined", { playerNumber: this.idToIndex(playerID) });
	}

	removePlayer(playerID) {
		pullFromArray(this.players, playerID)
		if(this.players.length < 2) {
			this.broadcast("playerCountLow");
			console.log(`closed ${this.roomID}`);
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
		if(playerArray.length - 1 < newPosition) newPlayer = playerArray[0];
		this.currentTurn = newPlayer;
		let playerNumber = this.idToIndex(newPlayer);
		this.broadcast("nextTurn", { newPlayer: newPlayer, playerNumber: playerNumber });
		this.sendToPlayer(newPlayer, "yourTurn", { playerNumber: playerNumber });
	}

	startGame() {
		this.broadcast("gameStart", { gameExpiry: this.expiryTime, playerNumber: this.idToIndex(this.creatorID) }); // at the start of the game the array to help determine the player number is sent, on the client side the player's name will be determined from the array with index of
		this.gameState = "running";
		this.currentTurn = this.creatorID;
		this.broadcast("nextTurn", { creatorID: this.creatorID, playerNumber: this.idToIndex(this.creatorID) });
		this.sendToPlayer(this.creatorID, "yourTurn", { playerNumber: this.idToIndex(this.creatorID) });
	}

	endGame() {
		this.broadcast("endGame");
		this.gameState = "ended";
		delete rooms[this.roomID];
	}

	addPoints(playerID) {
		let playerNumber = this.idToIndex(playerID);
		let currentScore = this.playerPoints[`<br>Player ${playerNumber}`];
		if(!currentScore) this.playerPoints[`<br>Player ${playerNumber}`] = 0;
		this.playerPoints[`<br>Player ${playerNumber}`] += 1;
		console.log(this.playerPoints)
		// this was done because i want to make sure the value is taken from the backend and this ensures synchronised accuracy
		this.broadcast("addedPoint", { playerNumber: playerNumber, score: this.playerPoints });
	}

	playRound(word, playerID) {
		// check ifthe word begins with the end of the last word
		let wordArray = this.wordsUsed;
		if(wordArray.length !== 0) {
			let latestWord = wordArray[wordArray.length - 1];
			if(latestWord.slice(-1) !== word.charAt(0)) {
				this.broadcast("wordDoesNotBeginWithLastLetter", { playerNumber: this.idToIndex(playerID) });
				return this.nextTurn(this.currentTurn);
			}
		}// check ifthe word has already been used before
		if(wordArray.includes(word)) {
			this.broadcast("thisWordWasUsedBefore", { playerNumber: this.idToIndex(playerID) });
			return this.nextTurn(this.currentTurn);
		}
		// check ifthe characters used are valid
		if(!characterCheck(word)) {
			this.broadcast("invalidCharacters", { playerNumber: this.idToIndex(playerID) });
			return this.nextTurn(this.currentTurn);
		}
		if(!config.acceptedWords.includes(word)) {
			checkWord(word, (err, found) => {
				if(err) {
					this.broadcast("error", { err: err });
					logError(err, `player: ${playerID}, word: ${word}`);
					return this.nextTurn(this.currentTurn);
				}
				if(!found) {
					this.broadcast("notInEnableDictionary", { playerNumber: this.idToIndex(playerID) });
					return this.nextTurn(this.currentTurn);
				}
			});
		}
		//add points
		this.addPoints(playerID);
		// pushes word
		this.usedWord(word);
		this.broadcast("newWord", { wordList: this.wordsUsed, lastWord: word });
		// next turn
		this.nextTurn(this.currentTurn);
	}

}

module.exports = Room;
// You might ask so ifyou are already keeping track of the player Number why do you need an ID
// 1) while this is true and in theory the number will not be changed iffor any reason the id is spoofed we can get messed with
// 2) reliability, i could be wrong tho because now i have more steps to do.