function pullFromArray(array, element) {
	const indexOfElement = array.indexOf(element)
	if(indexOfElement < 0) return "elementDoesNotExist" // element does not exist exist
	array.splice(indexOfElement, 1)
}

module.exports = { pullFromArray }