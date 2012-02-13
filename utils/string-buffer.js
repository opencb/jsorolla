

/*
 * String buffer
 */
// Constructor
function StringBuffer() {
	this.buffer = [];
}
// append
StringBuffer.prototype.append = function(string){
	this.buffer.push(string);
	return this;
}
// appendln
StringBuffer.prototype.appendln = function(string){
	this.buffer.push(string + "\n");
	return this;
}
// toString
StringBuffer.prototype.toString = function() {
	return this.buffer.join("");
}