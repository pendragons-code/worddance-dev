// transform.js has 1 purpose when the user creates a room, the purpose of this file is to change the looks of the html page
function transform() {
	clearAllElements()
}

function clearAllElements() {
	var allElements = document.querySelectorAll("*")
	console.log(allElements)
	for(let i = 0; i < allElements.length; ++i) {
		allElements[i].remove();
		console.log(`${allElements[i]} removed`);
	}
}

function gameStyle() {}