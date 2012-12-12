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

FileDataSource.prototype.fetch = DataSource.prototype.fetch;

function FileDataSource(file) {
	DataSource.prototype.constructor.call(this);
	
	this.file = file;
	this.success = new Event();
	this.error = new Event();
};

FileDataSource.prototype.error = function(){
	alert("File is too big. Max file size is 100 Mbytes.");
};

FileDataSource.prototype.fetch = function(async){
	var _this = this;
	if(this.file.size <= 314572800){
		if(async){
			var  reader = new FileReader();
			reader.onload = function(evt) {
				_this.success.notify(evt.target.result);
			};
			reader.readAsText(this.file, "UTF-8");
		}else{
			// FileReaderSync no funciona
			var reader = new FileReaderSync();
			return reader.readAsText(this.file, "UTF-8");
		}
	}else{
		_this.error();
		_this.error.notify();
	}
};
