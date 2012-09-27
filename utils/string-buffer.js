/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */



/*
 * String buffer
 */
// Constructor
function StringBuffer() {
	this.buffer = [];
};
// append
StringBuffer.prototype.append = function(string){
	this.buffer.push(string);
	return this;
};
// appendln
StringBuffer.prototype.appendln = function(string){
	this.buffer.push(string + "\n");
	return this;
};
// toString
StringBuffer.prototype.toString = function() {
	return this.buffer.join("");
};