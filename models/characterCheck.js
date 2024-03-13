function characterCheck(word) {
	const validChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-'];
	const pattern = new RegExp('^[' + validChars.join('') + ']+$');
	return pattern.test(str);
}

module.exports = { characterCheck };