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

function HeaderWidget(args) {

    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("HeaderWidget");

    this.target;
    this.autoRender = true;
    this.userData;

    this.appname = "My new App";
    this.description = '';
    this.suiteId = -1;
    this.checkTimeInterval = 5000;
    this.version = '';
    this.allowLogin = true;
    this.allowJobs = true;
    this.width;
    this.height = 60;
    this.chunkedUpload = false;
    this.enableTextModeUW = true; // Enable Text Mode in the Upload Widget

    this.applicationMenuEl;

    this.homeLink = ".";
    this.helpLink = ".";
    this.tutorialLink = ".";
    this.aboutHTML = ".";


    //set instantiation args, must be last
    _.extend(this, args);

    this.els = {};

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

HeaderWidget.prototype = {
    render: function () {
        var _this = this;

        var appLi = '';
        if (this.applicationMenuEl) {
//            appLi = '<li id="appMenu" class="menu"> &#9776; </li>';
            appLi = '<li id="appMenu" class="menu">&nbsp;<i class="fa fa-chevron-right"></i>&nbsp; <span class="">Menu</span></li>';
        }
        var jobsLi = '';
        if (this.allowJobs) {
            jobsLi = '<li id="jobs" class="right hidden"><i class="fa fa-tasks"></i> &nbsp;jobs</li>';
        }

        var navgationHtml = '' +
            '   <ul class="ocb-header">' +
            appLi +
            '       <li class="title"> &nbsp; ' + this.appname +
            '       </li>' +
            '       <li id="description" class="description">' + this.description +
            '       </li>' +
            '       <li id="support" class="right"> &nbsp; <i class="fa fa-support"></i>&nbsp;' +
            '       </li>' +
            '       <li id="signin" class="right"><i class="fa fa-sign-in"></i> &nbsp;sign in' +
            '       </li>' +
            appLi +
            '       <li id="profile" class="right hidden"><i class="fa fa-user"></i> &nbsp;profile' +
            '       </li>' +
            '       <li id="upload" class="right hidden"><i class="fa fa-cloud-upload"></i> &nbsp;upload & manage' +
            '       </li>' +
            //'       <li id="projects" class="right hidden"><i class="fa fa-folder"></i> &nbsp;projects' +
            //'       </li>' +
            '       <li id="logout" class="right hidden"><i class="fa fa-sign-out"></i> &nbsp;logout' +
            '       </li>' +
            '       <li id="user" class="right hidden text">' +
            '       </li>' +
            '   </ul>'
        ' ';

        var menuHtml = '' +
            '   <ul class="ocb-help-menu unselectable">' +
            '       <li id="homeHelp" class="right"><i class="fa fa-home"></i> &nbsp;home' +
            '       </li>' +
            '       <li id="documentation" class="right"><i class="fa fa-book"></i> &nbsp;documentation' +
            '       </li>' +
            '       <li id="tutorial" class="right"><i class="fa fa-list-alt"></i> &nbsp;tutorial' +
            '       </li>' +
            '       <li id="about" class="right"><i class="fa fa-info"></i> &nbsp; about' +
            '       </li>' +
            '   </ul>'
        '';


        this.div = $('<div class="ocb-header-widget unselectable">' + navgationHtml + '</div>')[0];
        $(this.div).css({
            height: this.height + 'px',
            position: 'relative'
        });

        this.supportMenuEl = $(menuHtml)[0];
        $(this.div).append(this.supportMenuEl);
//        $(this.supportMenuEl).mouseleave(function(){
//            $(_this.supportMenuEl).removeClass('ocb-help-menu-shown');
//        });

        if (this.applicationMenuEl) {
            $(this.div).append(this.applicationMenuEl);
//            $(this.applicationMenuDiv).mouseleave(function(){
//                $(_this.applicationMenuDiv).removeClass('ocb-app-menu-shown');
//            });

        }

        var els = $(this.div).find('ul').children();
        for (var i = 0; i < els.length; i++) {
            var elid = els[i].getAttribute('id');
            if (elid) {
                this.els[elid] = els[i];
            }
        }

        $(this.div).mouseleave(function () {
            _this.toogleSupportMenu(false);
        });
        $(this.div).click(function (e) {
            if (e.target === _this.els.support || e.target.parentNode === _this.els.support) {
                _this.toogleSupportMenu();
            } else {
                _this.toogleSupportMenu(false);
            }
        });

        $(this.els.appMenu).click(function () {
            _this.toogleAppMenu();
        });

        $(this.els.homeHelp).click(function () {
            window.location.href = _this.homeLink;
        });
        $(this.els.documentation).click(function () {
            window.open(_this.helpLink);
        });
        $(this.els.tutorial).click(function () {
            window.open(_this.tutorialLink);
        });
        $(this.els.about).click(function () {
            _this.trigger('about:click', {sender: _this});

//            Ext.create('Ext.window.Window', {
//                id: _this.id + "aboutWindow",
//                bodyStyle: 'background:#fff; color:#333;',
//                bodyPadding: 10,
//                title: 'About',
//                height: 340,
//                width: 500,
//                modal: true,
//                layout: 'fit',
//                html: _this.aboutText
//            }).show();
        });


        /* Element handlers */
        //TODO check !this.allowLogin,
        $(this.els.signin).click(function () {
            _this.loginWidget.show();
        });
        $(this.els.logout).click(function () {
            OpencgaManager.users.logout({
                id: Cookies('bioinfo_user'),
                query: {
                    sid: Cookies('bioinfo_sid')
                },
                request: {
                    success: _this.logoutSuccess,
                    error: _this.logoutSuccess
                }
            });

            //Delete all cookies
            Cookies.expire('bioinfo_sid');
            Cookies.expire('bioinfo_user');
            _this.sessionFinished();
            _this.trigger('logout', {sender: this});

        });
        $(this.els.profile).click(function () {
            _this.profileWidget.show();
        });
        $(this.els.upload).click(function () {
            _this.opencgaBrowserWidget.show({mode: "manager"});
        });
        $(this.els.jobs).click(function () {
            _this.trigger('jobs:click', {sender: _this});
//            $(_this.els.jobs).toggleClass('active');
        });
        $(this.els.projects).click(function () {
            _this.trigger('projects:click', {sender: _this});
//            $(_this.els.jobs).toggleClass('active');
        });
        /****************************************/
        this.logoutSuccess = function (response) {
            if (response.response[0].errorMsg === '' || response.response[0].errorMsg == null) {
                console.log(response);
            }
        };

        this.getUserInfoSuccess = function (response) {
            if ((response.response[0].errorMsg === '' || response.response[0].errorMsg == null) && response.response[0].result.length > 0) {
                _this.setUserData(response.response[0].result[0]);
                _this.trigger('user:change', {sender: this, response: response.response[0].result[0]});
                console.log("userData has been modified since last call");
            }
        };
        /****************************************/

        /* Login Widget */
        this.loginWidget = this._createLoginWidget();

        /* Profile Widget */
        this.profileWidget = this._createProfileWidget();

        /* Opencga Browser Widget */
        this.opencgaBrowserWidget = this._createOpencgaBrowserWidget();

        this.projectBrowser = this._createProjectBrowser();

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }

        this.targetDiv.appendChild(this.div);

        this.loginWidget.draw();
        this.profileWidget.draw();
        this.opencgaBrowserWidget.draw();

        if (Cookies('bioinfo_sid') != null) {
            this.sessionInitiated();
        } else {
            this.sessionFinished();
        }

    },
    getHeight: function () {
        return this.height;
    },
    toogleAppMenu: function (value) {
        if (this.applicationMenuEl) {
            if (value === true) {
                $(this.applicationMenuEl).addClass('ocb-app-menu-shown');
                $(this.els.appMenu).children('i').removeClass('fa-chevron-right');
                $(this.els.appMenu).children('i').addClass('fa-chevron-left');
            } else if (value === false) {
                $(this.applicationMenuEl).removeClass('ocb-app-menu-shown');
                $(this.els.appMenu).children('i').addClass('fa-chevron-right');
                $(this.els.appMenu).children('i').removeClass('fa-chevron-left');
            } else {
                $(this.applicationMenuEl).toggleClass('ocb-app-menu-shown');
                $(this.els.appMenu).children('i').toggleClass('fa-chevron-right');
                $(this.els.appMenu).children('i').toggleClass('fa-chevron-left');
            }

        }
    },
    toogleSupportMenu: function (value) {
        if (this.supportMenuEl) {
            if (value === true) {
                $(this.supportMenuEl).addClass('ocb-help-menu-shown');
            } else if (value === false) {
                $(this.supportMenuEl).removeClass('ocb-help-menu-shown');
            } else {
                $(this.supportMenuEl).toggleClass('ocb-help-menu-shown');
            }

        }
    },
    _createLoginWidget: function () {
        var _this = this;
        var loginWidget = new LoginWidget({
            suiteId: this.suiteId,
            autoRender: true,
            handlers: {
                'session:initiated': function () {
                    _this.sessionInitiated();
                    _this.trigger('login', {sender: this});
                }
            }
        });
        return loginWidget;
    },
    _createProfileWidget: function () {
        var profileWidget = new ProfileWidget({
            autoRender: true
        });
        return profileWidget;
    },
    _createOpencgaBrowserWidget: function () {
        var _this = this;
        var opencgaBrowserWidget = new OpencgaBrowserWidget({
            suiteId: this.suiteId,
            chunkedUpload: this.chunkedUpload,
            enableTextModeUW: this.enableTextModeUW,
            autoRender: true,
            handlers: {
                'need:refresh': function () {
                    _this.getUserInfo();
                }
            }
        });
        return opencgaBrowserWidget;
    },
    _createProjectBrowser: function () {
        var projectBrowser = document.createElement('jso-project-browser');
        return projectBrowser;
    },


//    _createPanel: function (targetId) {
//        var _this = this;
//        switch (this.suiteId) {
//            case 11://Renato
//                this.homeLink = "http://renato.bioinfo.cipf.es";
//                this.helpLink = "http://bioinfo.cipf.es/docs/renato/";
//                this.tutorialLink = "http://bioinfo.cipf.es/docs/renato/tutorial";
//                this.aboutText = '';
//                break;
//            case 6://Variant
//                this.homeLink = "http://variant.bioinfo.cipf.es";
//                this.helpLink = "http://docs.bioinfo.cipf.es/projects/variant";
//                this.tutorialLink = "http://docs.bioinfo.cipf.es/projects/variant/wiki/Tutorial";
//                this.aboutText = '';
//                break;
//            case 9://GenomeMaps
//                this.homeLink = "http://www.genomemaps.org";
//                this.helpLink = "http://wiki.opencb.org/projects/visualization/doku.php?id=genome-maps:overview";
//                this.tutorialLink = "http://wiki.opencb.org/projects/visualization/doku.php?id=genome-maps:tutorial";
//                this.aboutText = 'Genome Maps is built with open and free technologies like HTML5 and SVG inline, ' +
//                    'so no plug-in is needed in modern internet browsers. We’ve focused on providing the ' +
//                    'best user experience possible with a modern drag navigation and many features included.<br><br>' +
//                    'Genome Maps project has been developed in the <b>Computational Biology Unit</b> led by <b>Ignacio Medina</b>, at <b>Computational Genomic' +
//                    ' Institute</b> led by <b>Joaquin Dopazo</b> at CIPF. Two people from my lab deserve special mention for their fantastic job done: ' +
//                    '<br><b>Franscisco Salavert</b> and <b>Alejandro de Maria</b>.<br><br>' +
//                    'Genome Maps has been designed to be easily be embedded in any project with a couple of lines of code,' +
//                    ' and it has been implemented as a plugin framework to extend the standard features.<br><br>' +
//                    'Supported browsers include: Google Chrome 14+, Apple Safari 5+, Opera 12+ and Mozilla Firefox 14+ ' +
//                    '(works slower than in the other browsers). Internet Explorer 10 is under RC and seems to work properly.<br><br>' +
//                    'For more information or suggestions about Genome Maps please contact <br><b>Ignacio Medina</b>:  <span class="info">imedina@cipf.es</span>'
//                break;
//            case 10://CellBrowser
//                this.homeLink = "http://www.cellbrowser.org";
//                this.helpLink = "http://docs.bioinfo.cipf.es/projects/cellbrowser";
//                this.tutorialLink = "http://docs.bioinfo.cipf.es/projects/cellbrowser/wiki/Tutorial";
//                this.aboutText = '';
//                break;
//            case 12://UNTBgen
//                this.homeLink = "http://bioinfo.cipf.es/apps/untbgen";
//                this.helpLink = "http://bioinfo.cipf.es/ecolopy/";
//                this.tutorialLink = "http://bioinfo.cipf.es/ecolopy/";
//                this.aboutText = '';
//                break;
//            case 22://Pathiways
//                this.homeLink = "http://pathiways.bioinfo.cipf.es";
//                this.helpLink = "http://bioinfo.cipf.es/pathiways";
//                this.tutorialLink = "http://bioinfo.cipf.es/pathiways/tutorial";
//                this.aboutText = 'PATHiWAYS is built with open and free technologies like HTML5 and SVG inline, ' +
//                    'so no plug-in is needed in modern internet browsers<br><br>' +
//                    'PATHiWAYS project has been developed in the <b>Computational Biology Unit</b>, at <b>Computational Medicine' +
//                    ' Institute</b> at CIPF in Valencia, Spain.<br><br>' +
//                    'For more information please visit our web page  <span class="info"><a target="_blank" href="http://bioinfo.cipf.es">bioinfo.cipf.es</a></span>';
//                break;
//            case 85: //BierApp
//                this.homeLink = "http://bioinfo.cipf.es/apps/bierapp/";
//                this.helpLink = "https://github.com/babelomics/bierapp/wiki";
//                this.tutorialLink = "https://github.com/babelomics/bierapp/wiki/Tutorial";
//                this.aboutText = 'BiERApp is an interactive tool that allows finding genes affected by deleterious variants that segregate along family pedigrees, case-controls or sporadic samples. BiERApp has built with open and free technologies like HTML5 and Javascript.<br><br>' +
//                    'BierApp project is a joint development of the <b>BiER</b> and the <b>Computational Biology Unit</b>, in the <b>Computational Genomics Department</b> at CIPF in Valencia, Spain.<br><br>' + 'For more information please visit our web page  <span class="info"><a target="_blank" href="http://bioinfo.cipf.es">bioinfo.cipf.es</a></span> <br><br>' +
//                    '<img width="25%" src="http://bioinfo.cipf.es/bierwiki/lib/tpl/arctic/images/logobier.jpg">'
//                ;
//                break;
//
//            case 86: // TEAM
//                this.homeLink = "http://bioinfo.cipf.es/apps/team/";
//                this.helpLink = "https://github.com/babelomics/team/wiki";
//                this.tutorialLink = "https://github.com/babelomics/team/wiki/Tutorial";
//                this.aboutText = 'TEAM (Targeted Enrichment Analysis and Management) is an open web-based tool for the design and management of panels of genes for targeted enrichment and massive sequencing for diagnostic applications. <br> TEAM has been built with open and free technologies like HTML5 and Javascript.<br><br>' +
//                    'TEAM project is a joint development of the <b>BiER</b> and the <b>Computational Biology Unit</b>, in the <b>Computational Genomics Department</b> at CIPF in Valencia, Spain.<br><br>' + 'For more information please visit our web page  <span class="info"><a target="_blank" href="http://bioinfo.cipf.es">bioinfo.cipf.es</a></span> <br><br>' +
//                    '<img width="25%" src="http://bioinfo.cipf.es/bierwiki/lib/tpl/arctic/images/logobier.jpg">'
//                ;
//                break;
//
//            default:
//                this.homeLink = "http://docs.bioinfo.cipf.es";
//                this.helpLink = "http://docs.bioinfo.cipf.es";
//                this.tutorialLink = "http://docs.bioinfo.cipf.es";
//                this.aboutText = '';
//        }
//
//        if (typeof HEADER_HOME_LINK !== 'undefined') {
//            this.homeLink = HEADER_HOME_LINK;
//        }
//        if (typeof HEADER_HELP_LINK !== 'undefined') {
//            this.helpLink = HEADER_HELP_LINK;
//        }
//        if (typeof HEADER_TUTORIAL_LINK !== 'undefined') {
//            this.tutorialLink = HEADER_TUTORIAL_LINK;
//        }
//        if (typeof HEADER_ABOUT_HTML !== 'undefined') {
//            this.aboutText = HEADER_ABOUT_HTML;
//        }
//
//        var linkbar = new Ext.create('Ext.toolbar.Toolbar', {
//            id: this.id + 'linkbar',
//            dock: 'top',
//            cls: 'bio-linkbar',
//            height: 40,
//            minHeight: 40,
//            maxHeight: 40,
//            items: [
//                {
//                    xtype: 'tbtext',
//                    id: this.id + "speciesTextItem",
//                    text: ''
//                },
//                {
//                    xtype: 'tbtext',
//                    id: this.id + "assemblyTextItem",
//                    text: ''
//                },
//                '->',
////                {
////                    id: this.id + "homeButton",
////                    text: 'home',
////                    handler: function () {
////                        window.location.href = _this.homeLink;
////                    }
////                },
////                {
////                    id: this.id + "helpButton",
////                    text: 'documentation',
////                    handler: function () {
////                        window.open(_this.helpLink);
////                    }
////                },
////                {
////                    id: this.id + "tutorialButton",
////                    text: 'tutorial',
////                    handler: function () {
////                        window.open(_this.tutorialLink);
////                    }
////                },
////                {
////                    id: this.id + "aboutButton",
////                    text: 'about',
////                    handler: function () {
////                        Ext.create('Ext.window.Window', {
////                            id: _this.id + "aboutWindow",
////                            bodyStyle: 'background:#fff; color:#333;',
////                            bodyPadding: 10,
////                            title: 'About',
////                            height: 340,
////                            width: 500,
////                            modal: true,
////                            layout: 'fit',
////                            html: _this.aboutText
////                        }).show();
////                    }
////                }
//            ]
//        });
//
//        var userbar = new Ext.create('Ext.toolbar.Toolbar', {
//            id: this.id + 'userbar',
//            dock: 'top',
//            border: false,
////                cls:'bio-userbar',
//            cls: 'gm-login-bar',
//            height: 27,
//            minHeight: 27,
//            maxHeight: 27,
//            layout: 'hbox',
//            items: [
//                {
//                    xtype: 'tbtext',
//                    id: this.id + 'textNews',
//                    text: this.news
//                },
//                '->',
//                {
//                    xtype: 'tbtext',
//                    id: this.id + 'textUser',
//                    text: ''
//                },
////                    {
////                        id: this.id + 'btnOpencga',
////                        text: '<span class="emph">Upload & Manage</span>',
////                        iconCls: 'icon-project-manager',
////                        handler: function () {
////                            _this.opencgaBrowserWidget.show({mode: "manager"});
////                        }
////                    },
////                {
////                    id: this.id + 'btnSignin',
////                    disabled: !this.allowLogin,
////                    text: '<span class="emph">sign in</span>',
////                    handler: function () {
////                        _this.loginWidget.show();
////                    }
////                },
////                    {
////                        id: this.id + 'btnEdit',
////                        text: '<span class="emph">profile</span>',
////                        handler: function () {
////                            _this.profileWidget.show();
////                        }
////                    },
////                {
////                    id: this.id + 'btnLogout',
////                    text: '<span class="emph">logout</span>',
////                    handler: function () {
////                        OpencgaManager.logout({
////                            userId: $.cookie('bioinfo_user'),
////                            sessionId: $.cookie('bioinfo_sid'),
////                            success: _this.logoutSuccess,
////                            error: _this.logoutSuccess
////                        });
////                    }
////                }
//            ]
//        });
//
//        var panel = Ext.create('Ext.panel.Panel', {
//            id: this.id + "panel",
//            region: 'north',
//            border: false,
//            renderTo: targetId,
//            height: this.height,
//            minHeight: this.height,
//            maxHeigth: this.height,
//            width: this.width,
//            layout: 'hbox',
//            items: [
//                {
//                    xtype: 'container',
////                    flex:1,
//                    items: [
//                        {
//                            id: this.id + "appTextItem",
//                            xtype: 'tbtext',
//                            margin: '25 0 0 20',
//                            //		        	html: '<span class="appName">Vitis vinifera&nbsp; '+this.args.appname +'</span> <span class="appDesc">'+this.args.description+'</span>&nbsp;&nbsp;&nbsp;&nbsp;<span><img height="30" src="http://www.demeter.es/imagenes/l_demeter.gif"></span>',
//                            text: '<span class="appName">' + this.appname + '</span> ' +
//                                '<span id="' + this.id + 'description" class="appDesc">' + this.description + '</span>' +
//                                '<span id="' + this.id + 'version" class="appVersion"></span>' +
//                                '',
//                            padding: '0 0 0 10',
//                            listeners: {
//                                afterrender: function () {
//                                    $("#" + _this.id + "appTextItem").qtip({
//                                        content: '<span class="info">' + _this.version + '</span>',
//                                        position: {my: "bottom center", at: "top center", adjust: { y: 12, x: -25 }}
//
//                                    });
//                                }
//                            }
//                        }
//                    ]
//                },
//                {
//                    xtype: 'container',
//                    flex: 2,
//                    layout: {type: 'vbox', align: 'right'},
//                    items: [userbar, linkbar]
//                }
//            ]
//        });
//        return panel;
//    },

    setUserData: function (data) {
        this.userData = data;
        this.opencgaBrowserWidget.setUserData(data);
        console.log(data)
        this.projectBrowser.projectList = data.projects;
    },
    getUserInfo: function () {
        var lastActivity = null;
        if (this.userData != null) {
            lastActivity = this.userData.lastActivity;
        }
        var user = Cookies('bioinfo_user');
        if (!user) {
            console.log('cookie: bioinfo_user, is not set, session will be finished...');
            this.sessionFinished();
        } else {
            OpencgaManager.users.read({
                id: user,
                query: {
                    sid: Cookies('bioinfo_sid'),
                    lastActivity: lastActivity
                },
                request: {
                    success: this.getUserInfoSuccess,
                    error: this.logoutSuccess
                }
            });
        }

    },
    _getUserText: function () {
        var nameToShow = Cookies('bioinfo_user');
        if (nameToShow.indexOf('anonymous_') != -1) {
            nameToShow = 'anonymous';
        }
        return '<span style="color:darkred">' + nameToShow + '</span>'
    },
    sessionInitiated: function () {
        var _this = this;
        this.els.user.innerHTML = this._getUserText();
//        /**HIDE**/
        this.loginWidget.hide();
        $(this.els.signin).addClass('hidden');
//        /**SHOW**/
        $(this.els.logout).removeClass('hidden');
        $(this.els.profile).removeClass('hidden');
        $(this.els.upload).removeClass('hidden');
        $(this.els.projects).removeClass('hidden');
        $(this.els.user).removeClass('hidden');
        $(this.els.jobs).removeClass('hidden');


        /**START OPENCGA CHECK**/
        if (!this.userInfoInterval) {
            this.getUserInfo();//first call
            this.userInfoInterval = setInterval(function () {
                _this.getUserInfo();
            }, this.checkTimeInterval);
        }
    },
    sessionFinished: function () {
//        /**HIDE**/
        $(this.els.logout).addClass('hidden');
        $(this.els.profile).addClass('hidden');
        $(this.els.upload).addClass('hidden');
        $(this.els.projects).addClass('hidden');
        $(this.els.user).addClass('hidden');
        $(this.els.jobs).addClass('hidden');
//        /**SHOW**/
        $(this.els.signin).removeClass('hidden');
        $(this.els.user).html('');
        $(this.els.user).removeClass('hidden');
//        /**CLEAR OPENCGA**/
        clearInterval(this.userInfoInterval);
        delete this.userInfoInterval;

        this.profileWidget.hide();
        this.opencgaBrowserWidget.hide();
        this.opencgaBrowserWidget.removeUserData();
    },
    setDescription: function (text) {
        $(this.els.description).html(text);
    },
    setWidth: function (width) {
        this.width = width;
    }

};


