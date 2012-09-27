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

DataListWidget.prototype.draw = UserListWidget.prototype.draw;
DataListWidget.prototype.getData = UserListWidget.prototype.getData;
DataListWidget.prototype.getCount = UserListWidget.prototype.getCount;

function DataListWidget (args){
	UserListWidget.prototype.constructor.call(this, args);
	
	var _this = this;
	
	var datatpl = [
					'<tpl for=".">',
					'<div class="joblist-item">',
						'<p><span>{name}</span><i style="color:green"> ({status}) </i></p>',
						'<tpl for="dataFiles">',     // interrogate the kids property within the data
				        	'<p><i style="color:grey">{filename}</i><span style="color:blue"> {diskUsage}kB</span></p>',
				        '</tpl>',
				        	'<tpl for="tags">',     // interrogate the kids property within the data
				        	'<span style="color:limegreen"> {.},</span>',
				        '</tpl>',
				        '<p><i>{creationTime}</i></p>',
					'</div>',
					'</tpl>'
				];

	var datafields = ['commandLine','creationTime','dataFiles','dataId','date','description','diskUsage','enabled','finishTime','jobId','message','multiple','name','organization','ownerId','percentage','projectId','responsible','status','statusMessage','suiteId','tags','toolName','visites','write'];
	
	this.pagedViewList.storeFields = datafields;
	this.pagedViewList.template = datatpl;
	
	if (args.pagedViewList != null){
        if (args.pagedViewList.storeFields != null){
        	this.pagedViewList.storeFields = args.pagedViewList.storeFields;       
        }
        if (args.pagedViewList.template != null){
        	this.pagedViewList.template = args.pagedViewList.template;       
        }
    }
	
	this.pagedListViewWidget = new PagedViewListWidget(this.pagedViewList);
	
	this.adapter = new WumAdapter();
	this.adapter.onGetData.addEventListener(function (sender, data){
		var pdata=null;
		try{
			pdata = JSON.parse(data);
		}
		catch(err){
			console.log("Data received is not a JSON valid.");
			pdata = new Array();
		}
		_this.render(pdata);
	});	
};

DataListWidget.prototype.clean =  function (){
	clearInterval(this.interval);
	this.pagedListViewWidget.clean();
};


DataListWidget.prototype.getResponse = function (){
	this.adapter.getData($.cookie("bioinfo_sid"), this.suiteId);
};

DataListWidget.prototype.render =  function (data){
	this.data = data;
	this.pagedListViewWidget.draw(data);
};
