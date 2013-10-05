/*
 * Copyright (c) 2012-2013 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012-2013 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012-2013 Ignacio Medina (ICM-CIPF)
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

function NetworkViewer(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('networkviewer');



    //set default args
    this.targetId;
    this.autoRender = false;
    this.sidePanel = false;
    this.overviewPanel = false;
    this.height;
    this.width;
    this.overviewScale = 0.2;

    //set instantiation args, must be last
    _.extend(this, args);


    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

NetworkViewer.prototype = {

    render: function (targetId) {
        if (targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" style="width:90%;border:1px solid lightgrey"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.toolbarDiv = $('<div id="toolbar"></div>')[0];
        this.editionbarDiv = $('<div id="editionbar"></div>')[0];
        this.centerPanelDiv = $('<div id="centerpanel" style="postion:relative;"></div>')[0];
        this.statusbarDiv = $('<div id="statusbar"></div>')[0];

        $(this.div).append(this.toolbarDiv);
        $(this.div).append(this.editionbarDiv);
        $(this.div).append(this.centerPanelDiv);
        $(this.div).append(this.statusbarDiv);

        this.mainPanelDiv = $('<div id="mainpanel" style="postion:absolute;right:0px;height:100%;"></div>')[0];
        $(this.centerPanelDiv).append(this.mainPanelDiv);

        if (this.sidePanel) {
            this.sidePanelDiv = $('<div id="sidepanel" style="postion:absolute;right:0px;height:100%;"></div>')[0];
            $(this.centerPanelDiv).append(this.sidePanelDiv);
        }

        if (this.overviewPanel) {
            this.overviewPanelDiv = $('<div id="overviewpanel" style="postion:absolute;bottom:10px;right:10px;width:200px;height:200px;border:1px solid lightgrey;"></div>')[0];
            $(this.centerPanelDiv).append(this.overviewPanelDiv);
        }

        this.rendered = true;
    },
    draw: function () {
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }

        this.networkData = new NetworkData();

        /* Toolbar Bar */
        this.toolBar = this._createToolBar($(this.toolbarDiv).attr('id'));

        /* edition Bar */
        this.editionBar = this._createEditionBar($(this.editionbarDiv).attr('id'));


        this.networkSvg = this._createNetworkSvg($(this.mainPanelDiv).attr('id'));

//        this.networkSvgOverview = this._createNetworkSvgOverview($(this.overviewPanelDiv).attr('id'));


//        // networkSVG for the overview
//        if(this.overview) {
//            div = $('#'+this.getGraphCanvasId()+'_overview')[0];
//            this.networkSvgOverview = new NetworkSvg(div, this.networkData, {"width": "100%", "height": "100%", "parentNetwork": this.networkSvg, "scale": this.overviewScale});
//        }

    },

    _createToolBar: function (targetId) {
        var toolBar = new ToolBar({
            targetId: targetId,
            autoRender: true,
            handlers: {
                'layout:change': function (event) {
                    console.log(event.option);
                    //todo
                },
                'labelSize:change': function (event) {
                    console.log(event.option);
                    //todo
                },
                'labelSize:change': function (event) {
                    console.log(event.option);
                    //todo
                },
                'backgroundButton:click': function (event) {
                    console.log(event);
                    //todo
                },
                'overviewButton:change': function (event) {
                    console.log(event);
                    //todo
                },
                'zoom:change': function (event) {
                    console.log(event.zoom);
                    //todo
                },
                'search:change': function (event) {
                    console.log(event.value);
                    //todo
                }
            }
        });
        return toolbar;
    },
    _createEditionBar: function (targetId) {
        var _this = this;
        var editionBar = new EditionBar({
            targetId: targetId,
            autoRender: true,
            handlers: {
                'select': function (event) {
                    _this.networkSvg.setMode("select");
                },
                'add': function (event) {
                    _this.networkSvg.setMode("add");
                },
                'join': function (event) {
                    _this.networkSvg.setMode("join");
                },
                'delete': function (event) {
                    _this.networkSvg.setMode("delete");
                },
                'nameField:change': function (value) {
                    _this.networkSvg.setNodeName(value);
                }

            }
        });
        return editionBar;
    },

    _createNetworkSvg: function (targetId) {
        var _this = this;
        var networkSvg = new NetworkSvg({
            targetId: targetId,
            width: 1000,
            height: 300,
            networkData: this.networkData,
            autoRender:true,
            handlers: {
                'node:click':function(e){
                    if (_this.networkSvg.countSelectedNodes == 1) {
                        _this.editionBar.showNodeButtons();
                        _this.editionBar.hideEdgeButtons();
                        _this.editionBar.setNodeButtons(e);
                    } else {
                        _this.editionBar.showNodeButtons();
                        _this.editionBar.unsetNodeButtons();
                    }
                },
                'edge:click':function(e){
                    if (_this.networkSvg.countSelectedEdges == 1) {
                        _this.editionBar.showEdgeButtons();
                        _this.editionBar.hideNodeButtons();
                        _this.editionBar.setEdgeButtons(e);
                    } else {
                        _this.editionBar.showEdgeButtons();
                        _this.editionBar.unsetEdgeButtons();
                    }
                },
                'svg:click':function(e){
                    if (_this.networkSvg.countSelectedNodes == 1) {
                        _this.editionBar.showNodeButtons();
                        _this.editionBar.hideEdgeButtons();
                        _this.editionBar.setNodeButtons(e);
                    } else if (_this.networkSvg.countSelectedNodes > 1) {
                        _this.editionBar.showNodeButtons();
                        _this.editionBar.unsetNodeButtons();
                    } else {
                        _this.editionBar.hideNodeButtons();
                        _this.editionBar.hideEdgeButtons();
                    }
                },
                'selection:change':function(e){
                    console.log(e);
                },
                'node:add':function(e){
                    _this.editionBar.textBoxName.setValue(e);
                },
                'node:move':function(e){
                    console.log(e);
                },
                'change':function(e){
                    console.log(e);
                }
            }
        });
        return networkSvg;
    },
    _createNetworkSvgOverview: function (targetId) {
        var _this = this;
        var networkSvg = new NetworkSvg({
            targetId: targetId,
            width: 1000*0.2,
            height: 300*0.2,
            networkData: this.networkData,
            autoRender:true,
            handlers: {
            }
        });
        return networkSvg;
    }
}