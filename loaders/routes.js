const express = require("express");
const rooms = require("./server.js");
const router = express.Router();
const { logError } = require("../models/errorManager.js");

try{
	router.get("/", (req, res) => {
		res.render("landingPage.ejs");
	})
} catch(e) {
	logError(e);
}

// flow
// user has a normal / request = landing page
	// on the landing page they create a room
	// the room is created and they join it by transformation
	// this also results in them having a start game and an end game button
	// we are gonna die in DOM

// user has a join request /?roomID=blahblah
	// render the gamePage.ejs to help the user instead

module.exports = router;