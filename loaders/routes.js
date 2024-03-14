const express = require("express");
const rooms = require("./server.js");
const router = express.Router();

// root -> landing page, has a form to enter a roomID or create a room
router.get("/", (req, res) => {
	let roomID = req.query.roomID;
	let validRooms = Object.keys(rooms);
	if(!roomID) return res.render("landingPage.ejs");
	// http://localhost:3000/?roomID=
	if(!validRooms.includes(roomID)) return res.render("notFound.ejs");
	return res.render("gamePage.ejs", { roomID });
	// if not available the frontEnd js file would create a form and ask the user
})

// flow
// user has a normal / request = landing page
	// on the landing page they create a room
	// the room is created and they join it by transformation
	// this also results in them having a start game and an end game button
	// we are gonna die in DOM

// user has a join request /?roomID=blahblah
	// render the gamePage.ejs to help the user instead

module.exports = router