function JobFormPanel(args){
	var _this=this;
	this.id = "JobFormPanel"+Math.round(Math.random()*10000);
	this.targetId = null;
	
	this.title = null;
	this.width = 800;
	this.height = 400;
	
	this.wum = true;
	this.tags = [];
	this.suiteId = null;
	
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
		if (args.wum!= null){
			this.wum = args.wum;    
		}
        if (args.suiteId!= null){
        	this.suiteId = args.suiteId;       
        }
    }
	
	this.uploadWidget = new UploadWidget({suiteId:this.suiteId});

	this.panelId = this.title+"_JobFormPanel";
	
	this.onRun = new Event();
	
	this.runButtonId=this.id+"_runButton";
	
	//info notes
	this.note1 = Ext.create('Ext.container.Container', {
		html:'<p class="">This form allows you to configure a job, also an auto-configured example can be loaded for test purposes.</p><p>After selecting an example, you can launch the job using the <span class="emph">Run</span> button located at the end of the form.</p>'
	});
};

JobFormPanel.prototype.draw = function (){
	this.render();
};
JobFormPanel.prototype.render = function (){
	var _this = this;
	
	if (this.panel == null){
		/**MAIN PANEL**/
		/** Bar for the file browser **/
		
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="emph">Select a <span class="info">server</span> file from your account.</span>'
		});
		
		this.panel = Ext.create('Ext.panel.Panel', {
			id:this.panelId,
			title: this.title,
		    closable:true,
		    defaults:{margin:30},
		    autoScroll:true,
		    items: this.getForms(),
			listeners: {
		      	destroy: function(){
		       		delete _this.panel;
		      	}
			}
		});
	}//if null
};


JobFormPanel.prototype.validateRunButton= function (){
	//abstract
};

JobFormPanel.prototype.getRunButtonPanel= function (){
	var _this = this;
	var jobNameField = Ext.create('Ext.form.field.Text', {
		id:"jobNameField_"+this.id,
		fieldLabel:'Job name',
		emptyText:"Job name",
		allowBlank: false,
		value:"",
		listeners:{
			change:function(){
				_this.validateRunButton();
			}
		}
	});
	var jobDescriptionField = Ext.create('Ext.form.field.TextArea', {
		id:"jobDescription_"+this.id,
		fieldLabel:'Description',
		emptyText:"Description"
	});
	this.runButton = new Ext.create('Ext.button.Button', {
		id:this.runButtonId,
		text:'Run',
		disabled:true,
		handler: function (){
			_this.runJob();
			_this.onRun.notify();
			Ext.example.msg('Job Launched', 'It will be listed soon');
		}
	});
	var runButtonPanel = Ext.create('Ext.panel.Panel', {
		title:"Job",
		border:false,
		//flex:1,
		cls:'panel-border-top',
		bodyPadding:10,
		items: [jobNameField,jobDescriptionField,this.runButton]
	});
	
	return runButtonPanel;
};


//***//
//JobFormPanel.prototype.getTreePanel = function (){
//	var treeItems = this.getTreeItems();
//   	this.checkDataTypes(treeItems);
//        
//	var treeStore = Ext.create('Ext.data.TreeStore', {
//	    root: {
//	        expanded: true,
//	        text: "Options",
//	        children: treeItems
//	    }
//	});
//	
//	var treePan = Ext.create('Ext.tree.Panel', {
//	    title: 'Options',
//	    bodyPadding:10,
//	    flex:2,
//	   	border:false,
//	    store: treeStore,
//	    useArrows: true,
//	    rootVisible: false,
//	    listeners : {
//		    	scope: this,
//		    	itemclick : function (este,record){
//		    		this.optionClick(record.data);
//	    		}
//		}
//	});	
//	return treePan;
//};
//
//JobFormPanel.prototype.checkDataTypes = function (dataTypes){
//	for (var i = 0; i<dataTypes.length; i++){
//		if(dataTypes[i]["children"]!=null){
//			dataTypes[i]["iconCls"] ='icon-box';
//			dataTypes[i]["expanded"] =true;
//			this.checkDataTypes(dataTypes[i]["children"]);
//		}else{
//			dataTypes[i]["iconCls"] ='icon-blue-box';
//			dataTypes[i]["leaf"]=true;
//		}
//	}
//};
//
//JobFormPanel.prototype.getTreeItems = function (){
//	//Abstract method
//	return options=[{text: "This"},{text: "Method"},{text: "Is"},{text: "Abstract"}];
//};
//JobFormPanel.prototype.optionClick = function (){
//	//Abstract method
//};

