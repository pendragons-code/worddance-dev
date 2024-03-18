const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { join } = require("path");

const Room = require("../models/room.js");
const { generateRoomID } = require("../models/generateRoomID.js");
const { pullFromArray } = require("../models/pullFromArray.js");
const { logError } = require("../models/errorManager.js");

const routeManager = require("./routes.js");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
require("../models/currentDateTime.js");

const app = express();
const server = http.createServer(app);
global.io = socketio(server);
const port = process.env.port || 3000;

const rooms = {};
module.exports.rooms = rooms;


// while you can argue this is not really needed, you need to understand ifsomeone has the ability to spoof requests the game would break
const playersInRooms = {}; // ensures that players cannot join 2 times
const creatorsOfRoom = []; // ensures that creators cannot create again


app.use("/", routeManager);
app.set("view engine", "ejs");
app.set("views", join(__dirname, "../client/views"));
app.use(express.static(join(__dirname, "../client/public")));
app.set("trust proxy", 1);

app.use(function (req, res) {
	res.send("🍌 Error 404.");
});

try {
	io.on("connection", (socket) => {
		let currentRoom;
		//console.log(socket); // just for logs

		socket.on("joinRoom", (roomID) => {
			let playerID = socket.id;
			currentRoom = rooms[roomID];
			if(!currentRoom) return socket.emit("RoomDoesNotExist");
			if(currentRoom.gameState !== "waiting") return socket.emit("alert", "This room already started the game!")
			if(playersInRooms[`${playerID}`]) return socket.emit("alert", "You are already in this room"); // update
			socket.join(roomID);
			currentRoom.addPlayer(playerID);
			return playersInRooms[`${playerID}`] = roomID;
		});

		socket.on("createRoom", () => {
			let creatorID = socket.id;
			let genID = generateRoomID(creatorID.substring(0, 5));
			let newRoom = new Room(creatorID, genID);
			rooms[newRoom.roomID] = newRoom;
			creatorsOfRoom.push(creatorID);
			socket.emit("roomID", genID);
			socket.join(genID);
			return playersInRooms[`${creatorID}`] = genID; // playerID: roomID
		});

		socket.on("startGame", (roomID) => {
			currentRoom = rooms[roomID];
			if(currentRoom.players.length < 2) return socket.emit("notEnoughPlayersToStart");
			startGameLoop(currentRoom);
			return console.log(`game started in ${roomID}`);
		});

		socket.on("endGame", (roomID) => {
			currentRoom = rooms[roomID];
			if(socket.id !== currentRoom.creatorID) return socket.emit("alert", "You are not the creator and cannot perform this action!"); // anticheat
			return currentRoom.endGame();
		});

		socket.on("submitWord", (word, roomID) => {
			console.log(word)
			currentRoom = rooms[roomID];
			let playerID = socket.id;
			if(currentRoom) {
				if(currentRoom.currentTurn !== playerID) return socket.emit("alert", "notYourTurn"); // technically this part is not needed, because i will have a part of the code that broadcasts to everyone in the room it is the next player's turn. However, this is basically an anticheat
				currentRoom.playRound(word.toLowerCase().trim(), playerID);
				return console.log(`${roomID} [gameplay]: submmited ${word}`);
			}
		});

		socket.on("disconnect", () => {
			let playerID = socket.id;
			if(playersInRooms[`${playerID}`]) {
				let roomOfPlayerID = playersInRooms[`${playerID}`];
				let roomOfPlayer = rooms[`${roomOfPlayerID}`];
				roomOfPlayer.removePlayer(playerID);
				socket.leave(roomOfPlayerID);
				io.to(roomOfPlayerID).emit("message", `Player ${roomOfPlayer.idToIndex(playerID)} left the room!`);
				if(creatorsOfRoom.includes(playerID)) {
					pullFromArray(creatorsOfRoom, playerID);
					roomOfPlayer.broadcast("redirect", "Creator left the game, closing room!");
					return delete rooms[`${roomOfPlayer}`];
				}
				delete playersInRooms[`${playerID}`];
				//console.log(rooms[`${roomOfPlayerID}`].players.length)
				//if(rooms[`${roomOfPlayerID}`].players.length < 2) {
				//	roomOfPlayer.players.broadcast("playerCountLow");
				//	return delete rooms[`${roomOfPlayerID}`];
				//}
			}
		});

	});
} catch (e) {
	logError(e);
}

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port} and process pid is: ${process.pid}`);
});


function startGameLoop(room) {
	room.startGame()
	room.gameLoopInterval = setInterval(() => {
		let currentTime = new Date();
		if(currentTime >= room.expiryTime) {
			room.broadcast("roomExpired");
			delete rooms[room];
		}
	}, 1000)
}