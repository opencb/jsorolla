/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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
	this.id = "HeaderWidget"+ Math.round(Math.random()*10000);
	this.targetId = null;
	this.height = 67;
	this.accountData = null;

	this.appname="My new App";
	this.description='';
	this.suiteId=-1;
	this.news='';

    if(typeof args != 'undefined'){
        this.appname = args.appname || this.appname;
        this.description = args.description || this.description;
        this.suiteId = args.suiteId || this.suiteId;
        this.news = args.news || this.news;
    }

	this.adapter = new GcsaManager();
	
	/** Events **/
	this.onLogin = new Event();
	this.onLogout = new Event();
	this.onGetAccountInfo = new Event();

	/** create widgets **/
	this.loginWidget= new LoginWidget(this.suiteId);
	this.editUserWidget = new ProfileWidget();
	this.uploadWidget = new UploadWidget({suiteId:this.suiteId});//used now from gcsa-browser
	this.projectManager = new ManageProjectsWidget({width:800,height:500,suiteId:this.suiteId});
	this.gcsaBrowserWidget = new GcsaBrowserWidget({suiteId:this.suiteId});
	
	/**Atach events i listen**/
	this.loginWidget.onSessionInitiated.addEventListener(function(){
		_this.sessionInitiated();
		_this.onLogin.notify();
	});
	this.projectManager.onRefreshProjectList.addEventListener(function(sender,data){
		_this.userBarWidget.createProjectMenuItems(data);
	});
	this.adapter.onLogout.addEventListener(function(sender, data){
		console.log(data);
		//Se borran todas las cookies por si acaso
		$.cookie('bioinfo_sid', null);
		$.cookie('bioinfo_sid', null, {path: '/'});
		$.cookie('bioinfo_account', null);
		$.cookie('bioinfo_account', null, {path: '/'});
		_this.sessionFinished();
		_this.onLogout.notify();
	});
    this.gcsaBrowserWidget.onNeedRefresh.addEventListener(function(){
        _this.getAccountInfo();
    });
    this.adapter.onGetAccountInfo.addEventListener(function (evt, response){
        if(response.accountId != null){
            _this.setAccountData(response);
            _this.onGetAccountInfo.notify(response);
            console.log("accountData has been modified since last call");
        }
    });
}

HeaderWidget.prototype = {
    setAccountData : function (data){
        this.accountData = data;
        this.gcsaBrowserWidget.setAccountData(data);
        Ext.getCmp(this.id+'textUser').setText(this._getAccountText());
    },
    getAccountInfo : function() {
        var lastActivity = null;
        if(this.accountData != null){
            lastActivity =  this.accountData.lastActivity;
        }
        this.adapter.getAccountInfo($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), lastActivity);
    },
    _getAccountText : function(){
        var nameToShow = this.accountData.accountId;
        if(nameToShow.indexOf('anonymous_')!=-1){
            nameToShow='anonymous';
        }
        return 'logged in as <span style="color:darkred">'+nameToShow+'</span>'
    },
    sessionInitiated : function(){
        var _this = this;
        /**HIDE**/
        this.loginWidget.clean();
        Ext.getCmp(this.id+'btnSignin').hide();
        /**SHOW**/
        Ext.getCmp(this.id+'btnLogout').show();
        Ext.getCmp(this.id+'btnEdit').show();
        Ext.getCmp(this.id+'btnGcsa').enable();

        /**START GCSA CHECK**/
        this.getAccountInfo();//first call
        this.accountInfoInterval = setInterval(function(){_this.getAccountInfo();}, 4000);
    },
    sessionFinished : function(){
        /**HIDE**/
        Ext.getCmp(this.id+'btnGcsa').disable();
        Ext.getCmp(this.id+'btnLogout').hide();
        Ext.getCmp(this.id+'btnEdit').hide();
        /**SHOW**/
        Ext.getCmp(this.id+'btnSignin').show();

        Ext.getCmp(this.id+'textUser').setText('');
        /**CLEAR GCSA**/
        clearInterval(this.accountInfoInterval);
    },
    setDescription : function (text){
        $("#"+this.id+'description').text(text);
    },
    draw : function(){
        this.render();
        if($.cookie('bioinfo_sid') != null){
            this.sessionInitiated();
        }else{
            this.sessionFinished();
        }
    },
    getPanel : function (){
        this.draw();
        return this.panel;
    },
    setWidth : function (width){
        this.width=width;
        this.getPanel().setWidth(width);
        this.getPanel().updateLayout();//sencha 4.1.0 : items are not allocated in the correct position after setWidth
    },
    render : function (){
        var _this=this;
        if (this.panel==null){
//		console.log(this.args.suiteId);
            switch(this.suiteId){
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
                    this.helpLink="http://docs.bioinfo.cipf.es/projects/cellbrowser";
                    this.tutorialLink="http://docs.bioinfo.cipf.es/projects/cellbrowser/wiki/Tutorial";
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
                    this.aboutText = 'PATHiWAYS is built with open and free technologies like HTML5 and SVG inline, ' +
                        'so no plug-in is needed in modern internet browsers<br><br>'+
                        'PATHiWAYS project has been developed in the <b>Computational Biology Unit</b>, at <b>Computational Medicine'+
                        ' Institute</b> at CIPF in Valencia, Spain.<br><br>'+
                        'For more information please visit our web page  <span class="info"><a target="_blank" href="http://bioinfo.cipf.es">bioinfo.cipf.es</a></span>';
                    break;
                default:
                    this.homeLink="http://docs.bioinfo.cipf.es";
                    this.helpLink="http://docs.bioinfo.cipf.es";
                    this.tutorialLink="http://docs.bioinfo.cipf.es";
                    this.aboutText = '';
            }

            var linkbar = new Ext.create('Ext.toolbar.Toolbar', {
                id:this.id+'linkbar',
                dock: 'top',
                cls:'bio-linkbar',
                height:40,
                minHeight:40,
                maxHeight:40,
                items: [{
                    xtype: 'tbtext',
                    id: this.id + "appTextItem",
                    //		        	html: '<span class="appName">Vitis vinifera&nbsp; '+this.args.appname +'</span> <span class="appDesc">'+this.args.description+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span><img height="30" src="http://www.demeter.es/imagenes/l_demeter.gif"></span>',
                    text: '<span class="appName">' + this.appname + '</span> <span id="' + this.id + 'description" class="appDesc">' + this.description + '</span>',
                    padding: '0 0 0 10'
                },{
                    xtype:'tbtext',
                    id:this.id+"speciesTextItem",
                    text:''
                },{
                    xtype:'tbtext',
                    id:this.id+"assemblyTextItem",
                    text:''
                },'->',{
                    id: this.id + "homeButton",
                    text: 'home',
                    handler: function () {
                        window.location.href = _this.homeLink;
                    }
                },{
                    id: this.id + "helpButton",
                    text: 'help',
                    handler: function () {
                        window.open(_this.helpLink);
                    }
                },{
                    id: this.id + "tutorialButton",
                    text: 'tutorial',
                    handler: function () {
                        window.open(_this.tutorialLink);
                    }
                },{
                    id: this.id + "aboutButton",
                    text: 'about',
                    handler: function () {
                        Ext.create('Ext.window.Window', {
                            id: _this.id + "aboutWindow",
                            bodyStyle: 'background:#fff; color:#333;',
                            bodyPadding: 10,
                            title: 'About',
                            height: 340,
                            width: 500,
                            modal: true,
                            layout: 'fit',
                            html: _this.aboutText
                        }).show();
                    }
                },{
                    id:this.id+'btnGcsa',
                    text: 'My WebDrive',
                    iconCls: 'icon-project-manager',
                    disabled: true,
                    handler: function() {
                        _this.gcsaBrowserWidget.draw("manager");
                    }
                }]
            });

            var userbar = new Ext.create('Ext.toolbar.Toolbar', {
                id : this.id+'userbar',
                dock: 'top',
                border:true,
                cls:'bio-userbar',
                height:27,
                minHeight:27,
                maxHeight:27,
                items:[{
                    xtype:'tbtext',
                    id:this.id+'textNews',
                    text:this.news
                },'->',{
                    xtype:'tbtext',
                    id:this.id+'textUser',
                    text:''
                },{
                    id: this.id+'btnSignin',
                    text: '<span class="emph">sign in</span>',
                    handler: function (){
                        _this.loginWidget.draw();
                    }
                },{
                    id: this.id+'btnEdit',
                    text: '<span class="emph">profile</span>',
                    handler: function (){
                        _this.editUserWidget.draw();
                    }
                },{
                    id :this.id+'btnLogout',
                    text: '<span class="emph">logout</span>',
                    handler: function (){
                        _this.adapter.logout($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'));
                    }
                }]
            });

            this.panel = Ext.create('Ext.panel.Panel', {
                id:this.id+"panel",
                region: 'north',
                border:false,
                renderTo:this.targetId,
                height : this.height,
                minHeight: this.height,
                maxHeigth: this.height,
                items:[userbar,linkbar]
            });
        }
    }
};


