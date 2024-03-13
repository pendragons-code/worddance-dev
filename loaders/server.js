const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { join } = require("path");

const Room = require("../models/room.js");
const { generateRoomID } = require("../models/generateRoomID.js");
const { pullFromArray } = require("../models/pullFromArray.js");

const routeManager = require("./routes.js");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const server = http.createServer(app);
global.io = socketio(server);
const port = process.env.port || 3000;

const rooms = {};
module.exports.rooms = rooms;


// while you can argue this is not really needed, you need to understand if someone has the ability to spoof requests the game would break
const playersInRooms = []; // ensures that players cannot join 2 times
const creatorsOfRoom = []; // ensures that creators cannot create again


app.use("/", routeManager);
app.set("view engine", "ejs");
app.set("views", join(__dirname, "../client/views"));
app.set(express.static(join(__dirname, "../client/public")));
app.set("trust proxy", 1);

app.use(function(req, res) {
	res.status(404);
	return res.render("notFound.ejs");
});


io.on("connection", (socket) => {
	let currentRoom;

	socket.on("joinRoom", (roomID) => {
		let playerID = socket.id;
		currentRoom = rooms[roomID];
		// if(currentRoom.gameState !== "waiting") return socket.emit("cannotJoinRoom")
		if(!currentRoom) return socket.emit("RoomDoesNotExist");
		if(playersInRooms.includes(playerID)) return socket.emit("alert", "You are already in this room")
		socket.join(roomID);
		currentRoom.addPlayer(playerID);
		console.log(rooms)
		return playersInRooms.push(playerID);
	});

	this.lastWord = "",


	socket.on("createRoom", () => {
		let creatorID = socket.id
		let genID = generateRoomID(creatorID.substring(0,5))
		let newRoom = new Room(creatorID, genID);
		rooms[newRoom.roomID] = newRoom;
		creatorsOfRoom.push(creatorID);
		rooms[newRoom.roomID].sendToPlayer(creatorID, "redirect", genID)
		console.log(rooms)
		return playersInRooms.push(creatorID);
	});



	socket.on("startGame", (roomID) => {
		currentRoom = rooms[roomID];
		if(currentRoom.players.length < 2) return currentRoom.broadcast("notEnoughPlayersToStart");
		startGameLoop(currentRoom);
		return console.log(`game started in ${roomID}`);
	});


	socket.on("endGame", (roomID) => {
		currentRoom = rooms[roomID];
		if(socket.id !== currentRoom.creatorID) return socket.emit("notCreator"); // anticheat
		return currentRoom.endGame();
	});


	socket.on("word", (word, roomID) => {
		currentRoom = rooms[roomID];
		let playerID = socket.id;
		if(currentRoom) {
			if(currentRoom.currentTurn !== playerID) return socket.emit("notYourTurn"); // technically this part is not needed, because i will have a part of the code that broadcasts to everyone in the room it is the next player's turn. However, this is basically an anticheat
			currentRoom.playRound(word.toLowerCase().trim(), playerID);
			return console.log(`${roomID} [gameplay]: submmited ${word}`);
		}
	});


// REDO THE DISCONNECT COMPONENT
// the disconnect needs to check the socket id not the room id
// using the socket id we can determine the room of origin, to do this we can search through all the rooms for this player
// and remove him from the room array
// also from the creator and in room array
// followed by the usual checks of is creator and if there is only 1 person left



});


server.listen(port, () => {
	console.log(`Server running at http://localhost:${port} and process pid is: ${process.pid}`);
});


function startGameLoop(room) {
	room.startGame();
	room.gameLoopInterval = setInterval(() => {
		let currentTime = new Date();
		if(currentTime >= room.expiryTime) {
			room.broadcast("roomExpired");
			delete rooms[room];
		}
	}, 1000);
}