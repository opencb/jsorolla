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

function ResultTable(jobId, filename, tags, args){
	var _this = this;
	this.id = "ResultTable"+ Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.jobId = jobId;
	this.fileName=filename;
	this.tags=tags;
	this.numRows=5;
	this.flex=null;
	this.collapsible=true;
	this.border=true;
	this.cls=null;
	
	if (args != null){
		if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
		if (args.numRows!= null){
        	this.numRows = args.numRows;       
        }
		if (args.flex!= null){
        	this.flex = args.flex;       
        }
		if (args.collapsible!= null){
        	this.collapsible = args.collapsible;      
        }
		if (args.border!= null){
        	this.border = args.border;      
        }
		if (args.cls!= null){
        	this.cls = args.cls;      
        }
    }
	
	this.adapter = new WumAdapter();
	
    this.table = null;
    
    this.onRendered = new Event();
	this.onRendered.addEventListener(function (sender, targetId){
		_this.draw();
	});
};



ResultTable.prototype.draw = function (){
	this.render();
};

ResultTable.prototype.render = function (){
	var _this = this;
	
	var rows=null;
	
	var filteredGridNames = new Array();
	var filteredColNames = new Array();
	for( var i =0; i < tables.length; i++){
		if (this.tags.indexOf(tables[i].name)!= -1){//me quedo con la primera que encuentro
			this.tableSkel = tables[i];
			this.colNames = tables[i].colNames; 
			this.colVisibilty = tables[i].colVisibility;
			this.colTypes = tables[i].colTypes;
			rows = tables[i].numRows;
			
			filteredGridNames = new Array();
			filteredColNames = new Array();
			for (var j=0;j<this.colNames.length; j++){
				if (this.colVisibilty[j]==1){
					filteredGridNames.push({header:this.colNames[j],dataIndex:this.colNames[j], flex:1});
					filteredColNames.push({name:this.colNames[j],type:this.colTypes[j]});
				}
			}
		break;
		}
	}
	if(this.tableSkel.type == "text"){
		
		var adapterPoll = new WumAdapter();
		adapterPoll.poll(this.jobId,this.fileName,false,$.cookie('bioinfo_sid'));
		adapterPoll.onPoll.addEventListener(function(sender,data){
			var altura = 75+22*2;
			
			var lines = _this.parse(data);
			var items = [];
			for ( var i = 0; i < lines.length; i++){
				var cont = Ext.create('Ext.container.Container', {
					data:lines[0],
					tpl:_this.getTemplate(_this.tableSkel.colNames)
				});
				items.push(cont);
			}
			
			this.table = Ext.create('Ext.container.Container', {
				items:items,
				margin:"0 0 0 50",
				renderTo: _this.targetId
			});
			
		});
		
	}else{
		var url = this.adapter.tableurl(this.jobId,this.fileName,this.colNames,this.colVisibilty,$.cookie('bioinfo_sid'));
//		console.log(url);
		
		/*
		http://ws.bioinfo.cipf.es/wum/rest/job/86232/table?
				sessionid=QtjXeeOwKsRdTcyCF1vOiM2xbIC57fhlNvXafCjZMXCAFH2M6iZPfEXETt1Lp7F4
				&filename=significant_your_annotation_0.1.txt
				&colNames=Term,Term%20size,Term%20size%20(in%20genome),List1%20annotateds,List1%20unannotateds,list1_per,List2%20annotateds,List2%20unannotateds,list2_per,List1%20annotated%20genes,List2%20annotated%20genes,Odds%20ratio%20(log%20e),pvalue,Adjusted%20pvalue,Term%20annotation%20%%20per%20list,Annotated%20ids
				&colVisibility=1,0,0,1,1,0,1,1,0,0,0,1,1,1,0,0
				&_dc=1326109874569
				&page=1
				&start=0
				&limit=10
				&sort=%5B%7B%22property%22%3A%22List1%20unannotateds%22%2C%22direction%22%3A%22DESC%22%7D%5D
				&callback=Ext.data.JsonP.callback5
		
		http://ws.bioinfo.cipf.es/wum-beta/rest/job/42/table?
				sessionid=6tpGsjjphxDMkCG74E89qMZTYTU26WGTXXoDLApUYoOJL07WyM2NGd0SbMhKe2Ll
				&filename=significant_your_annotation_0.1.txt
				&colNames=Term,Term%20size,Term%20size%20(in%20genome),List1%20annotateds,List1%20unannotateds,list1_per,List2%20annotateds,List2%20unannotateds,list2_per,List1%20annotated%20genes,List2%20annotated%20genes,Odds%20ratio%20(log%20e),pvalue,Adjusted%20pvalue,Term%20annotation%20%%20per%20list,Annotated%20ids
				&colVisibility=1,0,0,1,1,0,1,1,0,0,0,1,1,1,0,0
				&_dc=1326278871739
				&page=1
				&start=0
				&limit=5
				&filter=%5B%7B%22property%22%3A%22Term%22%2C%22value%22%3Aundefined%7D%2C%7B%22property%22%3A%22Term%22%2C%22value%22%3Aundefined%7D%5D
				&callback=Ext.data.JsonP.callback3
		http://ws.bioinfo.cipf.es/wum-beta/rest/job/42/table?sessionid=6tpGsjjphxDMkCG74E89qMZTYTU26WGTXXoDLApUYoOJL07WyM2NGd0SbMhKe2Ll&filename=significant_your_annotation_0.1.txt&colNames=Term,Term%20size,Term%20size%20(in%20genome),List1%20annotateds,List1%20unannotateds,list1_per,List2%20annotateds,List2%20unannotateds,list2_per,List1%20annotated%20genes,List2%20annotated%20genes,Odds%20ratio%20(log%20e),pvalue,Adjusted%20pvalue,Term%20annotation%20%%20per%20list,Annotated%20ids&colVisibility=1,0,0,1,1,0,1,1,0,0,0,1,1,1,0,0&_dc=1326279241960&page=1&start=0&limit=5
		&filter=%5B%7B%22property%22%3A%22Term%22%2C%22value%22%3Aundefined%7D%5D
		&callback=Ext.data.JsonP.callback7
		http://ws.bioinfo.cipf.es/wum-beta/rest/job/42/table?sessionid=6tpGsjjphxDMkCG74E89qMZTYTU26WGTXXoDLApUYoOJL07WyM2NGd0SbMhKe2Ll&filename=significant_your_annotation_0.1.txt&colNames=Term,Term%20size,Term%20size%20(in%20genome),List1%20annotateds,List1%20unannotateds,list1_per,List2%20annotateds,List2%20unannotateds,list2_per,List1%20annotated%20genes,List2%20annotated%20genes,Odds%20ratio%20(log%20e),pvalue,Adjusted%20pvalue,Term%20annotation%20%%20per%20list,Annotated%20ids&colVisibility=1,0,0,1,1,0,1,1,0,0,0,1,1,1,0,0&_dc=1326279394677&page=1&start=0&limit=5
		&filter=%5B%7B%22property%22%3A%22Term%22%2C%22value%22%3Aundefined%7D%5D&callback=Ext.data.JsonP.callback2
		*
		*/
		if(rows==null){
			rows = this.numRows;
		}
		var itemsPerPage = rows; 
		
		this.st = Ext.create('Ext.data.Store', {
			fields: filteredColNames,
	    	pageSize: itemsPerPage,
		    remoteSort:true,
//		    remoteFilter:true,//TODO o no
	    	proxy: {
		        type: 'jsonp',
		        url : url,
		        reader: {
		            type: 'json',
		            root: 'items',
	            	totalProperty: 'total'
		        }
	    	}
		});
		this.st.loadPage(1);
		
		var altura = 75+22*itemsPerPage;
		this.table = Ext.create('Ext.grid.Panel', {
			title: /*this.tableName+" - "+*/this.fileName,
			collapsible:this.collapsible,
			flex:this.flex,
		    store: this.st,
		    border:this.border,
		    cls:this.cls,
		    columns: filteredGridNames,
		    height: altura,
//			selType: 'cellmodel',
			dockedItems: [{
		        xtype: 'pagingtoolbar',
		        store: this.st,   // same store GridPanel is using
		        dock: 'top',
		        displayInfo: true
	    	}],
		    renderTo: this.targetId
		});	
		
	}
};

/***/
ResultTable.prototype.parse = function (data){
	var _this = this;
	var lines = data.split("\n");
	var objLines=[];
	for ( var i = 0; i < lines.length; i++) {
		if(lines[i].charAt(0)!="#" && lines[i]!=""){
			var fields = lines[i].split("\t");
			var obj = {};
			for ( var j = 0; j < fields.length; j++) {
				if(fields[j]!=""){
					obj[_this.tableSkel.colNames[j].replace(/ /g,"_")]=fields[j];
				}
			}
			objLines.push(obj); 
		}
	}
	return objLines;
};
ResultTable.prototype.getTemplate = function (keys){
	var str = "<p>";
	for ( var i = 0; i < keys.length; i++) {
		str+='<span class="dis s90">'+keys[i]+' </span> {'+keys[i].replace(/ /g,"_")+'} &nbsp; &nbsp; &nbsp;';
	}
	str +="</p>";
	return  new Ext.XTemplate(	str);
};
