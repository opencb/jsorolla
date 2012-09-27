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

function TEMPLATEWIDGET(args){
	var _this=this;
	this.id = "TEMPLATEWIDGET_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = null;
	this.width = 800;
	this.height = 400;
	
	if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.adapter=new WumRestAdapter();
	this.adapter.onGetJobs.addEventListener(function(sender,data){
		_this._render(JSON.parse(data));
	});
};

TEMPLATEWIDGET.prototype.draw = function (){
	
	this.adapter.getJobs($.cookie('bioinfo_sid'));
	
};

TEMPLATEWIDGET.prototype._render = function (data){
	var _this=this;
	if(this._panel==null){
		
		this._panel = Ext.create('Ext.panel.Panel', {
			
		});
	}
};



//var widget = new TEMPLATEWIDGET(args);
//
//widget.draw();


