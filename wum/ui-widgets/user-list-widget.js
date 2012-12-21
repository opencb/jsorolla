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

function UserListWidget (args){
	var _this = this;
	this.id = "UserListWidget_"+ Math.round(Math.random()*10000000);
	this.data = new Array();
	
	this.args = new Object();
	this.timeout = 4000;
	this.pagedViewList = args.pagedViewList;
	this.suiteId=-1;
	this.tools = [];
	
	if (args != null){
        if (args.timeout != null && args.timeout > 4000){
        	this.timeout = args.timeout;
        }
        if (args.suiteId != null){
        	this.suiteId = args.suiteId;
        }
        if (args.tools != null){
        	this.tools = args.tools;
        }
    }
//	console.warn(this.id+' Minimum period is 4000 milliseconds, smaller values will be ignored');
};

UserListWidget.prototype.draw =  function (){
	var _this = this;
	
	this.getResponse();
	this.interval = setInterval(function () {_this.getResponse(); }, this.timeout);
};


UserListWidget.prototype.getData =  function (){
	return this.data;
};

UserListWidget.prototype.getCount = function() {
	return this.data.length;
};

UserListWidget.prototype.getResponse = function(){
	/**Que cada clase hija llame a la funcion de WumDataAdapter que necesite**/
	throw "abstract method must be implemented in child classes";
};

UserListWidget.prototype.render =  function (data){
	/**Que cada clase hija renderize como quiera los datos, ya sea con sencha o con sencho**/
	throw "abstract method must be implemented in child classes";
};
