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

function UploadWidget (args){
	var _this=this;
	this.id = "uploadWidget_"+ Math.round(Math.random()*10000000);
	this.targetId = null;
	this.suiteId=null;
	
	if (args != null){
		if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
		if (args.suiteId!= null){
        	this.suiteId = args.suiteId;       
        }
    }
	
	this.adapter = new GcsaManager();
	this.adapter.onUploadDataToProject.addEventListener(function(sender,res){
		if(res.status == 'done'){
			_this.uploadComplete(res.data);
		}else if (res.status == 'fail'){
			_this.uploadFailed(res.data);
		}
	});
	
	this.uploadButtonId = this.id+'_uploadButton';
	this.uploadFieldId = this.id+'_uploadField';
	
	this.selectedDataType = null;
};

//UploadWidget.prototype.getsdf = function(){
//	return this.id+'_uploadButton';
//};

UploadWidget.prototype.draw = function(gcsaLocation){
	this.gcsaLocation = gcsaLocation;
	var dataTypes = {};
	dataTypes["9"]=[
		            { text: "ID List", children: [
		                { text: "SNP", tag:"idlist:snp"},//el tag es para introducirlo en la base de datos al subir los datos
		                { text: "Gene/Transcript",tag:"idlist:gene:transcript"}//si son varios van separados por ->  :
		            ] },
		            { text: "Feature", children: [
		                { text: "VCF 4.0", tag:"vcf"},
		                { text: "GFF2", tag:"gff2"},
		                { text: "GFF3", tag:"gff3"},
		                { text: "GTF", tag:"gtf"},
		                { text: "BED", tag:"bed"},
		                { text: "BAM", tag:"bam"},
		                { text: "BAI", tag:"bai"},
		                { text: "Expression", tag:"expression"}
		            ] }
		        ];
	dataTypes["6"]=[
		            { text: "Feature", children: [
		                { text: "VCF 4.0", tag:"vcf"},
		                { text: "GFF2", tag:"gff2"},
		                { text: "GFF3", tag:"gff3"},
		                { text: "GTF", tag:"gtf"},
		                { text: "BED", tag:"bed"}
		            ] }
		        ];
	dataTypes["11"]=[
	             {text : "Annotation", tag:"annotation"},
	             {text : "ID List", children : [ 
		         { text : "Gene",tag : "idlist:gene"	}, 
		         { text : "Ranked", tag : "ranked"	} 
		         ]
	} ];
	dataTypes["12"]=[
		             {text : "Abundances", tag:"abundances"}
		        ];
	dataTypes["100"]=[
		             {text : "Sequence", tag:"sequence"}
		        ];
	dataTypes["22"]=[
		             {text : "Tabbed text file", tag:"txt"}
		        ];
	switch (this.suiteId){
		case 9: this.checkDataTypes(dataTypes["9"]); this.render(dataTypes["9"]); break;
		case 6: this.checkDataTypes(dataTypes["6"]); this.render(dataTypes["6"]); break;
		case 11: this.checkDataTypes(dataTypes["11"]); this.render(dataTypes["11"]); break;
		case 12: this.checkDataTypes(dataTypes["12"]); this.render(dataTypes["12"]); break;
		case 22: this.checkDataTypes(dataTypes["22"]); this.render(dataTypes["22"]); break;
		case 100: this.checkDataTypes(dataTypes["100"]); this.render(dataTypes["100"]); break;
		case -1: break;
		default: this.render([{text: "No data types defined"}]);		
	}
};

UploadWidget.prototype.clean = function (){
	if (this.panel != null){
		this.panel.destroy();
		delete this.panel;
		console.log(this.id+' PANEL DELETED');
	}
};

UploadWidget.prototype.checkDataTypes = function (dataTypes){
	for (var i = 0; i<dataTypes.length; i++){
		if(dataTypes[i]["children"]!=null){
			dataTypes[i]["iconCls"] ='icon-box';
			dataTypes[i]["expanded"] =true;
			this.checkDataTypes(dataTypes[i]["children"]);
		}else{
			dataTypes[i]["iconCls"] ='icon-blue-box';
			dataTypes[i]["leaf"]=true;
		}
	}
	
};

UploadWidget.prototype.render = function(dataTypes){
	var _this=this;
	if (this.panel == null){
		var store = Ext.create('Ext.data.TreeStore', {
		    root: {
		        expanded: true,
		        text: "Data type",
		        children: dataTypes
		    }
		});
		var height = Object.keys(store.tree.nodeHash).length*23;
		if (height<250){
				height=250;
		} 
		
		
		var pan1Width = 250;		
		var pan1 = Ext.create('Ext.tree.Panel', {
		    title: 'Select your data type',
		    bodyPadding:10,
		   	height : height,
		   	border:false,
		   	cls:'panel-border-right',
		   	width: pan1Width,
		    store: store,
		    useArrows: true,
		    rootVisible: false,
		    listeners : {
			    	scope: this,
			    	itemclick : function (este,record){
			    		if(record.data.leaf){
			    			this.selectedDataType = record.raw.tag;
			    			this.dataTypeLabel.setText('<span class="info">Type:</span><span class="ok"> OK </span>',false);
			    		}else{
			    			this.selectedDataType = null;
			    			this.dataTypeLabel.setText('<span class="info">Select a data type</span><span class="err"> !!!</span>',false);
			    		}
			    		this.validate();
		    		}
			}
		});
		
		this.nameField = Ext.create('Ext.form.field.Text', {
	        name: 'datalabel',
	        fieldLabel: 'Data name',
	        labelWidth: 110,
	        msgTarget: 'side',
	        //allowBlank: false,
	        enableKeyEvents: true,
	        listeners: {
		        scope: this,
		        change: function(el) {
		        		if(el.getValue()!=""){
			        		this.dataNameLabel.setText('<span class="info">Name:</span><span class="ok"> OK </span>',false);			        			
		        		}else{
		        			this.dataNameLabel.setText('<span class="info">Enter the data name</span><span class="err"> !!!</span>',false);
		        		}
						this.validate();
		       	}
	        }
		});
		this.textArea = Ext.create('Ext.form.field.TextArea', {
			   name: 'datadescription',
			   fieldLabel: 'Data description',
			   labelWidth: 110,
			   msgTarget: 'side'
		});
		this.organizationField = Ext.create('Ext.form.field.Text', {
	        name: 'organization',
	        fieldLabel: 'Organization',
	        labelWidth: 110,
	        msgTarget: 'side'
		});
		this.responsableField = Ext.create('Ext.form.field.Text', {
	        name: 'responsable',
	        fieldLabel: 'Responsible',
	        labelWidth: 110,
	        msgTarget: 'side'
		});
		this.acquisitiondate = Ext.create('Ext.form.field.Text', {
	        name: 'acquisitiondate',
	        fieldLabel: 'Acquisition date',
	        labelWidth: 110,
	        msgTarget: 'side'
		});
		
		var pan2Width = 350;
		var pan2 = Ext.create('Ext.panel.Panel', {
			title: 'Some aditional data',
		    width: pan2Width,
		    border:false,
		    height : height,
		    bodyPadding: 15,
		    items: [this.nameField,this.textArea,this.organizationField,this.responsableField,this.acquisitiondate]
	
		});
				  
		this.dataTypeLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="info">Select a data type</span>'
		});
		this.dataNameLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="info">Enter the data name</span>'
		});
		this.dataFieldLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="info">Select a data file</span>'
		});		
		this.originCheck = Ext.create('Ext.form.field.Checkbox', {
			xtype:'checkbox',
			margin:'0 0 5 5',
			boxLabel : 'Text mode',
			listeners: {
			      scope: this,
			      change: function(){
			      		if(this.originCheck.getValue()){
			      			this.dataFieldLabel.setText('<span class="ok">'+this.editor.getValue().length+'</span><span class="info"> chars</span>',false);
							this.uploadBar.hide();
			      			this.editor.show();
			      			this.uploadField.destroy();
			      			this.uploadField.setRawValue(null);
			       		}else{
			       			this.dataFieldLabel.setText('<span class="info">Select a data file</span>',false);
			       			this.editor.hide();
							this.uploadBar.show();
			       			this.editor.setRawValue(null);
			       			this.createUploadField();
			       		}
			       		this.validate();
			       }
			}
		});		
		var uploadButton = Ext.create('Ext.button.Button', {
			 id:this.uploadButtonId,
			 text: 'Upload',
			 disabled:true,
			 handler: function() {
//				_this.uploadMsg =  Ext.Msg.show({
//					 closable:false,
//				     title:'Uploading file',
//				     msg: 'Please wait...'
//				});
				_this.uploadFile();
	        }
		});
		
		
        
		this.editor = Ext.create('Ext.form.field.TextArea', {
       	 	xtype: 'textarea',
        	width: 602,
        	flex:1,
        	height: 100,
        	emptyText:'Paste or write your file directly',
        	hidden:true,
        	name: 'file',
        	margin:"-1",
        	enableKeyEvents:true,
        	listeners: {
			       scope: this,
			       change: function(){
			       			this.dataFieldLabel.setText('<span class="ok">'+this.editor.getValue().length+'</span> <span class="info"> chars</span>',false);
			       			this.validate();
			       }
			       
	        }
		});
		
		this.uploadBar = Ext.create('Ext.toolbar.Toolbar',{cls:"bio-border-false"});
		this.createUploadField();
		
		this.modebar = Ext.create('Ext.toolbar.Toolbar',{
			dock:'top',
			height:28,
			border:false,
			items:[this.originCheck,'->',this.dataTypeLabel,'-',/*this.dataNameLabel,'-',*/this.dataFieldLabel]
		});
		
		var pan3 = Ext.create('Ext.panel.Panel', {
			title: 'File origin',
		    colspan:2,
		    border:false,
		    width: pan1Width+pan2Width,
		    cls:'panel-border-top',
//		    bodyStyle:{"background-color":"#d3e1f1"}, 
		    items:[this.uploadBar,this.editor],
		    bbar:this.modebar
		});

		this.panel = Ext.create('Ext.window.Window', {
		    title: 'Upload a data file'+' -  <span class="err">ZIP files will be allowed shortly</span>',
		    iconCls:'icon-upload',
		    resizable: false,
//		    minimizable :true,
			constrain:true,
		    closable:false,
		    modal:true,
			layout: {
       			 		type: 'table',
       			 		columns: 2,
       			 		rows:2
    				},
		    items: [pan1,pan2,pan3],
		    buttonAlign:'right',
		    buttons : [{text:"Close",handler:function(){_this.panel.destroy();}}, uploadButton],
		    listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.destroy();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	        }
		});
		
	}
	this.panel.show();
};


UploadWidget.prototype.createUploadField = function()  {
	this.uploadField = Ext.create('Ext.form.field.File', {
			id:this.uploadFieldId,
			xtype: 'filefield',
			name: 'file',
	        flex:1,
	        padding:1,
	        msgTarget: 'side',
	        emptyText: 'Choose a file',
	        allowBlank: false,
	        anchor: '100%',
	        buttonText: 'Open file...',
	        listeners: {
			       scope: this,
			       change:  function() {
		             		this.fileSelected();
							this.validate();
			       }
	        }
        });
    this.uploadBar.add(this.uploadField);
};

UploadWidget.prototype.validate = function (){
//	console.log(this.selectedDataType != null);
//	console.log(this.nameField.getValue() !="");
//	console.log((this.uploadField.getRawValue()!="" || this.editor.getValue()!=""));
	
	if (this.selectedDataType != null /*&& this.nameField.getValue() !=""*/ && (this.uploadField.getRawValue()!="" || this.editor.getValue()!="") ){
		Ext.getCmp(this.uploadButtonId).enable();
	}else{
		Ext.getCmp(this.uploadButtonId).disable();
	}
};


UploadWidget.prototype.fileSelected = function (){
		var inputId=this.uploadField.fileInputEl.id;
        var file = document.getElementById(inputId).files[0];
        if (file) {
          var fileSize = 0;
          if (file.size > 1024 * 1024)
        	  fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
          else
        	  fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

           
          this.dataFieldLabel.setText('<span class="info">Size: </span><span class="ok">'+fileSize+'</span>',false);
//          document.getElementById('fileName').innerHTML = '<b>Name</b>: ' + file.name;
//          document.getElementById('fileSize').innerHTML = '<b>Size</b>: ' + fileSize;
//          document.getElementById('fileType').innerHTML = '<b>Type</b>: ' + file.type;
        }
};

UploadWidget.prototype.uploadFile = function()  {
	var _this=this;
	Ext.getBody().mask('Uploading file...');
	this.panel.disable();
	
    var fd = new FormData();
    var inputFileName = null;
    if(this.originCheck.getValue()){
    	inputFileName = this.nameField.getValue();
    	fd.append("file", this.editor.getValue());
    }else{
		var inputFile = document.getElementById(Ext.getCmp(this.uploadFieldId).fileInputEl.id).files[0];
		inputFileName = inputFile.name;
	    fd.append("file", inputFile);
    }
    var sessionId = $.cookie('bioinfo_sid');
    
   	fd.append("name", this.nameField.getValue()); 
   	fd.append("tags", this.selectedDataType);//TODO mirar bien los tags
   	fd.append("responsible", this.responsableField.getValue());
   	fd.append("organization", this.organizationField.getValue());
   	fd.append("date", this.acquisitiondate.getValue());
   	fd.append("description", this.textArea.getValue());
   	fd.append("sessionid", sessionId);

   	var objectname = this.gcsaLocation.directory+inputFileName;
	//accountid, sessionId, projectname, formData
	this.adapter.uploadDataToProject($.cookie("bioinfo_account"), sessionId, this.gcsaLocation.bucketId , objectname, fd);
	
};

UploadWidget.prototype.uploadProgress = function(evt)  {
	console.log("Progress...");
    if (evt.lengthComputable) {
      var percentComplete = Math.round(evt.loaded * 100 / evt.total);
  		console.log(percentComplete);
//      document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
    	console.log('unable to compute');
//      document.getElementById('progressNumber').innerHTML = 'unable to compute';
    }
};

UploadWidget.prototype.uploadComplete = function(response)  {
	/* This event is raised when the server send back a response */
//	this.dataFieldLabel.setText('<span class="info">Upload </span><span class="ok">finished successfully</span> '+response,false);
	var msg = "Uploaded sucessfully";
	if (response.indexOf("ERROR")!=-1){//el createErrorResponse devuelte la palabra error siempre o deberia
		msg = response;
	}
	Ext.Msg.show({
		title:'Upload status',
		msg: msg
	});
	this.panel.enable();
	Ext.getBody().unmask();
	if (msg == "Uploaded sucessfully"){
		this.panel.close();
	}
};

UploadWidget.prototype.uploadFailed = function(response)  {
	console.log(response);
	Ext.Msg.show({
		title:'Upload status',
		msg: 'There was an error attempting to upload the file.'
	});
//	alert("There was an error attempting to upload the file.");
	this.panel.enable();
	Ext.getBody().unmask();
};

UploadWidget.prototype.uploadCanceled = function(response)  {
	console.log(response);
	Ext.Msg.show({
		title:'Upload status',
		msg: 'The upload has been canceled by the user or the browser dropped the connection.'
	});
//	alert("The upload has been canceled by the user or the browser dropped the connection.");
	this.panel.enable();
	Ext.getBody().unmask();
};
