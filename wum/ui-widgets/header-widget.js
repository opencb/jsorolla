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

function HeaderWidget(args){
	var _this=this;
	this.id = "HeaderWidget"+ Math.round(Math.random()*10000000);
	this.targetId = null;
//	this.height = 94;
	this.height = 67;
//	this.menubar=null;
	
	this.args = new Object();
	this.args.appname="My new App";
	this.args.description="My app description";
	this.args.suiteId=-1;

	this.accountData = null;
	
	if (args != null){
        if (args.appname != null){
        	this.args.appname = args.appname;       
        }
        if (args.description != null){
        	this.args.description = args.description;       
        }
        if (args.suiteId != null){
        	this.args.suiteId = args.suiteId;       
        }
    }
    
	//this.adapter = new WumAdapter();
	this.adapter = new GcsaManager();
	
	/** Events **/
	this.onLogin = new Event();
	this.onLogout = new Event();
	
	
	/** create widgets **/
	this.loginWidget= new LoginWidget(this.args.suiteId);
	this.userBarWidget = new UserBarWidget();
	this.editUserWidget = new EditUserWidget();
	this.uploadWidget = new UploadWidget({suiteId:this.args.suiteId});
	this.projectManager = new ManageProjectsWidget({width:800,height:500,suiteId:this.args.suiteId});
	this.gcsaBrowserWidget = new GcsaBrowserWidget(this.args);
	
	/**Atach events i listen**/
	this.loginWidget.onSessionInitiated.addEventListener(function (sender){
		_this.btnLogout.disable();
		_this.sessionInitiated();
		_this.onLogin.notify();
	});
	this.userBarWidget.onItemsReady.addEventListener(function(sender){
		_this.responseItemsReady();
	});
	this.projectManager.onRefreshProjectList.addEventListener(function(sender,data){
		_this.userBarWidget.createProjectMenuItems(data);
	});
	
	this.adapter.onLogout.addEventListener(function (sender, data){
		console.log(data);
		//Se borran todas las cookies por si acaso
		$.cookie('bioinfo_sid', null);
		$.cookie('bioinfo_sid', null, {path: '/'});
		$.cookie('bioinfo_account', null);
		$.cookie('bioinfo_account', null, {path: '/'});
		_this.sessionFinished();
		_this.onLogout.notify();
	});	
	
};

HeaderWidget.prototype.setAccountData = function (data){
	this.accountData = data;
	this.gcsaBrowserWidget.setAccountData(data);
	this.userBarWidget.setAccountData(data);
}


HeaderWidget.prototype.responseItemsReady = function(){
	for (var i = 0; i < this.userBarWidget.items.length; i++) {
		this.userbar.insert(this.userbarInsertPos+i,this.userBarWidget.items[i]);
	}
//	this.userbar.add(this.userBarWidget.items);
	this.btnLogout.enable();
};

HeaderWidget.prototype.sessionInitiated = function(){
	/**HIDE**/
	this.loginWidget.clean();
	this.btnSignin.hide();
	/**SHOW**/
	this._enableMenubarItems();
	this.userBarWidget.draw(this.userbar);
	this.btnLogout.show();
	this.btnEdit.show();
};

HeaderWidget.prototype.sessionFinished = function(){
	/**HIDE**/
	this._disableMenubarItems();
	this.userBarWidget.clean(this.userbar);
	this.btnLogout.hide();
	this.btnEdit.hide();
	/**SHOW**/
	this.btnSignin.show();
};

HeaderWidget.prototype.draw = function(){
	this.render();
	if($.cookie('bioinfo_sid') != null){
		this.sessionInitiated();
	}else{
		this.sessionFinished();
	}
};

HeaderWidget.prototype.render = function (){
	var _this=this;
	if (this.panel==null){
		
		this.species = Ext.create('Ext.toolbar.TextItem', {
			id:this.id+"speciesTextItem",
			text:''
		});
		this.assembly = Ext.create('Ext.toolbar.TextItem', {
			id:this.id+"assemblyTextItem",
			text:''
		});
		
//		console.log(this.args.suiteId);
		switch(this.args.suiteId){
			case 11://Renato
				this.homeLink="http://renato.bioinfo.cipf.es";
				this.helpLink="http://bioinfo.cipf.es/docs/renato/";
				this.tutorialLink="http://bioinfo.cipf.es/docs/renato/tutorial";
				this.aboutText = '';
				break;
			case 6://Variant
				this.homeLink="http://variant.bioinfo.cipf.es";
				this.helpLink="http://docs.bioinfo.cipf.es/projects/variant";
				this.tutorialLink="http://docs.bioinfo.cipf.es/projects/variant/wiki/Tutorial";
				this.aboutText = '';
				break;
			case 9://GenomeMaps
				this.homeLink="http://www.genomemaps.org";
				this.helpLink="http://docs.bioinfo.cipf.es/projects/genomemaps";
				this.tutorialLink="http://docs.bioinfo.cipf.es/projects/genomemaps/wiki/Tutorial";
				this.aboutText = 'Genome Maps is built with open and free technologies like HTML5 and SVG inline, ' +
				'so no plug-in is needed in modern internet browsers. We’ve focused on providing the ' +
				'best user experience possible with a modern drag navigation and many features included.<br><br>' +
				'Genome Maps project has been developed in the <b>Computational Biology Unit</b> led by <b>Ignacio Medina</b>, at <b>Computational Genomic'+
				' Institute</b> led by <b>Joaquin Dopazo</b> at CIPF. Two people from my lab deserve special mention for their fantastic job done: '+
				'<br><b>Franscisco Salavert</b> and <b>Alejandro de Maria</b>.<br><br>'+
				'Genome Maps has been designed to be easily be embedded in any project with a couple of lines of code,' +
				' and it has been implemented as a plugin framework to extend the standard features.<br><br>' +
				'Supported browsers include: Google Chrome 14+, Apple Safari 5+, Opera 12+ and Mozilla Firefox 14+ ' +
				'(works slower than in the other browsers). Internet Explorer 10 is under RC and seems to work properly.<br><br>' +
				'For more information or suggestions about Genome Maps please contact <br><b>Ignacio Medina</b>:  <span class="info">imedina@cipf.es</span>'
				break;
			case 10://CellBrowser
				this.homeLink="http://www.cellbrowser.org";
				this.helpLink="http://docs.bioinfo.cipf.es";
				this.tutorialLink="http://docs.bioinfo.cipf.es";
				this.aboutText = '';
				break;
			case 12://UNTBgen
				this.homeLink="http://bioinfo.cipf.es/apps/untbgen";
				this.helpLink="http://bioinfo.cipf.es/ecolopy/";
				this.tutorialLink="http://bioinfo.cipf.es/ecolopy/";
				this.aboutText = '';
				break;
			case 22://Pathiways
				this.homeLink="http://pathiways.bioinfo.cipf.es";
				this.helpLink="http://bioinfo.cipf.es/pathiways";
				this.tutorialLink="http://bioinfo.cipf.es/pathiways/tutorial";
				this.aboutText = 'Pathiways!!!!!!!!!!!!!!!!!!!!!!!!!!';
				break;
			default:
				this.homeLink="http://docs.bioinfo.cipf.es";
				this.helpLink="http://docs.bioinfo.cipf.es";
				this.tutorialLink="http://docs.bioinfo.cipf.es";
				this.aboutText = '';
		}
		
		
		this.linkbar = new Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+"linkbarToolbar",
		dock: 'top',
		cls:'bio-linkbar',
		height:40,
		minHeight:40,
		maxHeight:40,
		items: [
		        {
		        	id:this.id+"appTextItem",
		        	xtype:'tbtext',
//		        	html: '<span class="appName">Vitis vinifera&nbsp; '+this.args.appname +'</span> <span class="appDesc">'+this.args.description+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span><img height="30" src="http://www.demeter.es/imagenes/l_demeter.gif"></span>',
		        	text: '<span class="appName">'+this.args.appname +'</span> <span id="'+this.id+'description" class="appDesc">'+this.args.description+'</span>',
		        	padding: '0 0 0 10'
		        	
		        },
		        this.species,
		        this.assembly,
		        '->',
		        {
		        	id:this.id+"homeButton",
		        	text: 'home', 
		        	handler:function(){window.location.href=_this.homeLink;}
		        },
		        {
		        	id:this.id+"helpButton",
		        	text: 'help',
		        	handler:function(){window.open(_this.helpLink);}
		        },
		        {
		        	id:this.id+"tutorialButton",
		        	text: 'tutorial',
		        	handler:function(){window.open(_this.tutorialLink);}
		        },
		        {
		        	id:this.id+"aboutButton",
		        	text: 'about',
		        	handler:function(){
		        		Ext.create('Ext.window.Window', {
		        			id:_this.id+"aboutWindow",
		        			bodyStyle: 'background:#fff; color:#333;',
		        			bodyPadding:10,
		        			title: 'About',
		        			height: 340,
		        			width: 500,
		        			modal:true,
		        			layout: 'fit',
		        			html:_this.aboutText
		        		}).show();
		        	}
		        }
		        ]
		});
		
		this.userbar = new Ext.create('Ext.toolbar.Toolbar', {
			id : this.userBarId,
			dock: 'top',
			border:true,
			cls:'bio-userbar',
			height:27,
			minHeight:27,
			maxHeight:27
//			items:[
//					{
//						text: 'Genome Maps',
//        				handler:function(){window.location.href='../genomemap';}
//					},
//					{
//						text: 'Network',
//        				handler:function(){window.location.href='../network';}
//					},
//					{
//						text: 'Pupasuite 4',
//        				handler:function(){window.location.href='../pupasuite4';}
//					}
//				]
		});
//		var appItems=this.userbar.items.items;
//		for(var i=0;i<appItems.length;i++){
//			if(this.args.appname==appItems[i].getText()){
//				appItems[i].setText('<span class="ssel border-bot">'+this.args.appname+'</span>');
//			}
//		}
		this.userbar.add('->');
		this.userbarInsertPos = this.userbar.items.items.length;
		
		this.btnSignin = Ext.create('Ext.Button', {
			id :this.id+"btnSignin",
	        text: '<span class="emph">sign in</span>',
	        scope:this,
	        listeners: {
			       scope: this,
			       click: function (){
			    	   this.loginWidget.draw();
			       		}
	        }
		});

		this.btnEdit = Ext.create('Ext.Button', {
			id :this.id+"btnEdit",
	        text: '<span class="emph">edit</span>',
	        scope:this,
	        listeners: {
			       scope: this,
			       click: function (){
			    	   		this.editUserWidget.draw();
			       		}
	        }
		});
		this.btnLogout = Ext.create('Ext.Button', {
			id :this.id+"btnLogout",
	        text: '<span class="emph">logout</span>',
	        scope:this,
	        listeners: {
			       scope: this,
			       click: function (){
			    	   this.adapter.logout($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'));
			       	}
	        }
		});
		
		this.userbar.add(this.btnEdit);
		this.userbar.add(this.btnLogout);
		this.userbar.add(this.btnSignin);
		
		this.linkbar.add(this._getMenubarItems());
		
		this.panel = Ext.create('Ext.panel.Panel', {
			id:this.id+"panel",
	        region: 'north',
	        border:false,
	        renderTo:this.targetId,
	        height : this.height,
	        minHeight: this.height,
	        maxHeigth: this.height
	    });
		
		this.panel.add(this.userbar);
		this.panel.add(this.linkbar);
//		this.setMenubar();
	}
};

HeaderWidget.prototype.getPanel = function (){
	this.draw();
	return this.panel;
};	

HeaderWidget.prototype._getMenubarItems = function (){
	var _this = this;
	this.btnUpload = Ext.create('Ext.Button', {
		id:this.id+"btnUpload",
        text: 'Upload data',
        iconCls: 'icon-upload',
        disabled: true,
        listeners: {
		       scope: this,
		       click: function (){
		    	   		this.uploadWidget.draw();
		       		}
        }
	});
//	return ['->',this.btnUpload];
	
	this.manageProjectsButton = Ext.create('Ext.Button', {
			id:this.id+"manageProjectsButton",
			text: 'Projects',
			iconCls: 'icon-project-manager',
			disabled: true,
			handler: function() {
				_this.projectManager.draw();
//				projectManager.parseData(_this.projectNames);
			}
	});
	
	this.manageProjects = Ext.create('Ext.Button', {
			id:this.id+"manageProjects",
			text: 'My WebDrive',
			iconCls: 'icon-project-manager',
			disabled: true,
			handler: function() {
				_this.gcsaBrowserWidget.draw("full");
			}
	});
	
	/* uncomment to DEBUG gcsaBrowserWidget
	 */	
		//setTimeout(function(){_this.gcsaBrowserWidget.draw("full");},100);
	 /*
	 * */
	
	return [this.manageProjects/*this.manageProjectsButton,this.btnUpload*/];
};

HeaderWidget.prototype._enableMenubarItems = function (){
	this.btnUpload.enable();
	this.manageProjectsButton.enable();
	this.manageProjects.enable();
};
HeaderWidget.prototype._disableMenubarItems = function (){
	this.btnUpload.disable();
	this.manageProjectsButton.disable();
	this.manageProjects.disable();
};


HeaderWidget.prototype.setDescription = function (text){
	$("#"+this.id+"description").text(text);
};

HeaderWidget.prototype.setWidth = function (width){
//	if(width<500){width=500;}
//	if(width>2400){width=2400;}//if bigger does not work TODO why?
	this.width=width;
	this.getPanel().setWidth(width);
	this.getPanel().updateLayout();//sencha 4.1.0 : items are not allocated in the correct position after setWidth
};


//HeaderWidget.prototype.setMenubar = function (){
//	this.menubar.add(this._getMenubarItems());
//	this.menubar.xtype='toolbar';
//    this.menubar.dock= 'top';
//	this.menubar.height=27;
//	this.menubar.padding= '0 0 0 10';
//	this.menubar.cls='bio-menubar',
//	this.menubar.minHeight=27;
//	this.menubar.maxHeight=27;
//	this.panel.add(this.menubar);
//};
