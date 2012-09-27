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

function TextWindowWidget(args){
	this.windows = new Array();
};

TextWindowWidget.prototype.draw = function(text){
//	this.windows.push( window.open(''+self.location,"Bioinformatics",config="height="+500+",width="+800+" ,font-size=8, resizable=yes, toolbar=1, menubar=1"));
//	this.windows[this.windows.length-1].document.write("<title>"+ "asdasda" +"</title>");
//	this.windows[this.windows.length-1].document.write(text);
//	this.windows[this.windows.length-1].document.close();
	
	
	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin',
	'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};

function ClienSideDownloaderWindowWidget(args){
	this.windows = new Array();
};

ClienSideDownloaderWindowWidget.prototype.draw = function(text, content){
//	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin', 'left=20,top=20,width=500,height=200');
	
	myRef = window.open('data:text/csv,' + content,'mywin', 'left=20,top=20,width=500,height=200');
//	myRef = window.open('data:image/svg+xml,' + content,'mywin', 'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};