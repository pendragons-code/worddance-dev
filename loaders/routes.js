const express = require("express");
const rooms = require("./server.js");
const router = express.Router();

// root -> landing page, has a form to enter a roomID or create a room
router.get("/", (req, res) => {
	res.render("landingPage.ejs");
})

// /roomID -> renders the game page (if the game has already started, they will be redirected to the main landingpage and an alert would pop up)
let validRooms = Object.keys(rooms);
for(let i = 0; i < validRooms.length; ++i ) {
	router.get(`/${validRooms[i]}`, async (req, res) => { // might not need async
		return res.render("gamePage.ejs", { roomID: validRooms[i] });
	})
}

module.exports = router