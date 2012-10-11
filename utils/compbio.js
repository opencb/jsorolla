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

var Compbio = {
	parseRegion : function(str){
		var splitDots = str.split(":");
		if(splitDots.length == 2){
			var splitDash = splitDots[1].split("-");
			var chromosome = splitDots[0];
			var start = parseInt(splitDash[0]);
			if(splitDash.length == 2){
				var end = parseInt(splitDash[1]);
				return {chromosome:chromosome,start:start,end:end};
			}
			return {chromosome:chromosome,start:start,end:start};
		}
		throw "Chromosome must be separated by :";
	},
	stringifyRegion : function(arg1,arg2,arg3,arg4){
		var str;
		if (this.isString(arg1)){//arguments mean : chr, start, end, formated
			if(arg4 == true){
				str = arg1 + ":" + this.formatPosition(arg2) + "-" + this.formatPosition(arg3);
			}else{
				str = arg1 + ":" + arg2 + "-" + arg3;
			}
			return str;
		}else{//arguments mean : object, formated, nothing, nothing
			if(arg2 == true){
				str = arg1.chromosome + ":" + this.formatPosition(arg1.start) + "-" + this.formatPosition(arg1.end);
			}else{
				str = arg1.chromosome + ":" + arg1.start + "-" + arg1.end;
			}
			return str;
		}
		return str;
	},
	formatPosition : function(position){
		return position.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	},
	centerPosition : function (arg1, arg2) {
		if(isNaN(arg1) == false){//arguments mean : start, end
			return Math.ceil((arg1+arg2)/2);
		}else{//arguments mean : object, nothing
			return Math.ceil((arg1.start+arg1.end)/2);
		}
	},
	isString : function (s) {
		return typeof(s) === 'string' || s instanceof String;
	},
	test : function(){
		return this;
	}
};
