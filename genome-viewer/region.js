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

function Region(args) {
	
	this.start = null;
	this.end = null;
	this.chromosome = null;
	
	if (args != null){
		if(args.start != null){
			this.start = args.start;
		}
		if (args.end != null) {
			this.end = args.end;
		}
		if (args.chromosome != null) {
			this.chromosome = args.chromosome;
		}
		if (args.str != null) {
			this.parse(args.str);
		}
	}
};

Region.prototype.parse = function(str){
	var splitDots = str.split(":");
	if(splitDots.length == 2){
		var splitDash = splitDots[1].split("-");
		this.chromosome = splitDots[0];
		this.start = parseInt(splitDash[0]);
		if(splitDash.length == 2){
			this.end = parseInt(splitDash[1]);
		}else{
			this.end = this.start;
		}
	}
};

Region.prototype.load = function(obj){
	this.start = obj.start;
	this.end = obj.end;
	this.chromosome = obj.chromosome;
};

Region.prototype.center = function(){
	return this.start+Math.floor((this.length())/2);
};

Region.prototype.length = function(){
	return this.end-this.start+1;
};

Region.prototype.toString = function(formated){
	var str;
	if(formated == true){
		str = this.chromosome + ":" + Compbio.formatNumber(this.start) + "-" + Compbio.formatNumber(this.end);
	}else{
		str = this.chromosome + ":" + this.start + "-" + this.end;
	}
	return str;
};

