const fs = require("fs");

function checkWord(word, callback) {
	fs.readFile("../assets/enable.txt", "utf8", (err, data) => {
		if(err) return callback(err);
		const wordArray = data.split("\n").map(word => word.trim());
		const found = wordArray.includes(word);
		callback(null, found);
	})
}

module.exports = { checkWord };