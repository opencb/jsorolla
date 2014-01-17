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
    this.border = true;
    this.overviewScale = 0.2;

    //set instantiation args, must be last
    _.extend(this, args);

    this.toolBar;
    this.editionBar;
    this.networkSvgLayout;
    this.network = new Network();

    this.contextMenu;

    this.overviewRefreshing = false;

    this.zoom = 25;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

NetworkViewer.prototype = {
    setNetwork: function (network) {
        this.network = network;
        this.networkSvgLayout.setNetwork(network);
        this.networkSvgLayout.draw();
    },
    render: function (targetId) {
        if (targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" class="bootstrap" style="height:100%;position:relative;"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.height = $(this.targetDiv).height();
        this.width = $(this.targetDiv).width();

        this.toolbarDiv = $('<div id="nv-toolbar"></div>')[0];
        this.editionbarDiv = $('<div id="nv-editionbar"></div>')[0];
        this.centerPanelDiv = $('<div id="nv-centerpanel" style="position:relative;"></div>')[0];
        this.statusbarDiv = $('<div id="nv-statusbar"></div>')[0];

        $(this.div).append(this.toolbarDiv);
        $(this.div).append(this.editionbarDiv);
        $(this.div).append(this.centerPanelDiv);
        $(this.div).append(this.statusbarDiv);


        this.mainPanelDiv = $('<div id="nv-mainpanel" style="position:relative;right:0px;height:100%;"></div>')[0];
        $(this.centerPanelDiv).append(this.mainPanelDiv);

        if (this.sidePanel) {
            this.sidePanelDiv = $('<div id="nv-sidepanel" style="position:absolute;right:0px;height:100%;"></div>')[0];
            $(this.centerPanelDiv).append(this.sidePanelDiv);
        }


        if (this.overviewPanel) {
            this.overviewPanelDiv = $('<div id="nv-overviewpanel" style="position:absolute;bottom:10px;right:10px;width:200px;height:200px;border:1px solid lightgrey;background-color:#ffffff"></div>')[0];
            $(this.centerPanelDiv).append(this.overviewPanelDiv);

            this.cameraDiv = $('<div id="camera"></div>')[0];
            $(this.overviewPanelDiv).append(this.cameraDiv);

            this.overviewDiv = $('<div id="overview"></div>')[0];
            $(this.overviewPanelDiv).append(this.overviewDiv);

            $(this.cameraDiv).css({
                "border": "1px solid #6599FF",
                "position": "absolute",
                "top": -1,
                "left": -1,
                "z-index": 50
            });
        }

        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }


        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }

        /* Toolbar Bar */
        this.toolBar = this._createToolBar($(this.toolbarDiv).attr('id'));

        /* edition Bar */
        this.editionBar = this._createEditionBar($(this.editionbarDiv).attr('id'));

        this.networkSvgLayout = this._createNetworkSvgLayout($(this.mainPanelDiv).attr('id'));

        if (this.overviewPanel) {
            var width = this.networkSvgLayout.width * this.overviewScale * this.networkSvgLayout.scale;
            var height = this.networkSvgLayout.height * this.overviewScale * this.networkSvgLayout.scale;
            $(this.overviewPanelDiv).css({
                width: width + 2,
                height: height + 2
            });
            $(this.cameraDiv).css({
                "width": width + 2,
                "height": height + 2
            });
        }


        /* context menu*/
        this.contextMenu = this._createContextMenu();

        $(this.div).bind('wheel.networkViewer', function (e) {
            var zoom;
            if (e.originalEvent.deltaY < 0) {
                var newZoom = _this.zoom + 2;
                zoom = Math.min(100, newZoom);
            } else {
                var newZoom = _this.zoom - 2;
                zoom = Math.max(0, newZoom);
            }
            _this._setZoom(zoom);
            _this.toolBar.setZoom(zoom);

            _this.overviewRefreshing = true;
            setTimeout(function () {
                if (_this.overviewRefreshing == true) {
                    _this._refreshOverview();
                    _this.overviewRefreshing = false;
                }
            }, 500);
        });

//        this.networkSvgOverview = this._createNetworkSvgOverview($(this.overviewPanelDiv).attr('id'));


//        // networkSVG for the overview
//        if(this.overview) {
//            div = $('#'+this.getGraphCanvasId()+'_overview')[0];
//            this.networkSvgOverview = new NetworkSvg(div, this.networkData, {"width": "100%", "height": "100%", "parentNetwork": this.networkSvg, "scale": this.overviewScale});
//        }

    },
    hideOverviewPanel: function () {
        $(this.overviewPanelDiv).css({display: 'none'});
        this.overviewPanel = false;
    },
    showOverviewPanel: function () {
        $(this.overviewPanelDiv).css({display: 'block'});
        this.overviewPanel = true;
    },
    _refreshOverview: function () {
        if (this.overviewPanel) {
            console.log("refresh overview");
            var dup = $("#" + this.networkSvgLayout.id).clone();
            var height = this.networkSvgLayout.height * this.overviewScale;
            var width = this.networkSvgLayout.width * this.overviewScale;
            $(dup).css('height', height);
            $(dup).find('#mainSVG').attr('height', height);
            $(dup).find('#mainSVG').attr('width', width);
//            $(dup).find('#canvas').css({'height': height, width: width});
//            $(dup).find('#backgroundSVG').css({'height': height, width: width});
            var scaleGroupSVG = $(dup).find("#scaleGroupSVG");
            var scaleBackgroundGroupSVG = $(dup).find("#scaleBackgroundGroupSVG");


            var scale = this.overviewScale * this.networkSvgLayout.scale;
            var centerX = width / 2;
            var centerY = height / 2;
            var transX = -centerX * (this.networkSvgLayout.scale - 1);
            var transY = -centerY * (this.networkSvgLayout.scale - 1);
            if (this.networkSvgLayout.scale < 1) {
                $(scaleGroupSVG).attr("transform", "translate(" + transX + "," + transY + ") scale(" + (scale) + ")");
                $(scaleBackgroundGroupSVG).attr("transform", "translate(" + transX + "," + transY + ") scale(" + (scale) + ")");
            } else {
                $(scaleGroupSVG).attr("transform", "scale(" + (this.overviewScale) + ")");
                $(scaleBackgroundGroupSVG).attr("transform", "scale(" + (this.overviewScale) + ")");
            }

            $(dup).find('defs').remove();

            $(this.overviewDiv).empty();
            $(this.overviewDiv).append(dup);
        }
    },
    _createToolBar: function (targetId) {
        var _this = this;
        var toolBar = new ToolBar({
            targetId: targetId,
            autoRender: true,
            handlers: {
                'selectButton:click': function (event) {
                    _this.networkSvgLayout.setMode("select");
                },
                'addButton:click': function (event) {
                    _this.networkSvgLayout.setMode("add");
                },
                'linkButton:click': function (event) {
                    _this.networkSvgLayout.setMode("join");
                },
                'deleteButton:click': function (event) {
                    _this.networkSvgLayout.setMode("delete");
                },
                'collapseButton:click': function (event) {
                    console.log(event);
                    //todo
                },
                'layout:change': function (event) {
                    console.log(event);
                    _this.setLayout(event.option);
                },
                'labelSize:change': function (event) {
                    _this.network.setEdgesRendererAttribute('labelSize', event.option);
                    _this.network.setVerticesRendererAttribute('labelSize', event.option);
                },
                'select:change': function (event) {
                    console.log(event);
                    _this.select(event.option);
                },
                'backgroundButton:click': function (event) {
                    console.log(event);
                    _this.networkSvgLayout.setMode("background");
                },
                'backgroundColorField:change': function (event) {
                    console.log(event);
                    _this.networkSvgLayout.setBackgroundColor(event.value);
                },
                'importBackgroundImageField:change': function (event) {
                    _this.networkSvgLayout.addBackgroundImage(event.image);
                },
                'showOverviewButton:change': function (event) {
                    console.log(event)
                    if (event.pressed) {
                        _this.showOverviewPanel();
                    } else {
                        _this.hideOverviewPanel();
                    }
                },
                'zoom:change': function (event) {
                    console.log(event.zoom);
                    _this._setZoom(event.zoom);
                },
                'search': function (event) {
                    console.log(event);
                    //todo
                },
                'all': function (event) {
                    _this._refreshOverview();
                }
            }
        });
        return toolBar;
    },
    _createEditionBar: function (targetId) {
        var _this = this;
        var editionBar = new EditionBar({
            targetId: targetId,
            autoRender: true,
            handlers: {
                'nodeShape:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('shape', event.value);
                },
                'nodeSize:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('size', parseInt(event.value), true);
                },
                'nodeStrokeSize:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('strokeSize', parseInt(event.value), true);
                },
                'opacity:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('opacity', event.value);
                },
                'edgeShape:change': function (event) {
                    _this.networkSvgLayout.setSelectedEdgesDisplayAttr('shape', event.value);
                },
                'edgeSize:change': function (event) {
                    _this.networkSvgLayout.setSelectedEdgesDisplayAttr('size', parseInt(event.value));
                },
                'nodeColorField:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('color', event.value);
                },
                'nodeStrokeColorField:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('strokeColor', event.value);
                },
                'edgeColorField:change': function (event) {
                    _this.networkSvgLayout.setSelectedEdgesDisplayAttr('color', event.value);
                },
                'nodeNameField:change': function (event) {
                    _this.networkSvgLayout.setVertexLabel(event.value);
                },
                'edgeLabelField:change': function (event) {
                    _this.networkSvgLayout.setEdgeLabel(event.value);
                },
                'nodeLabelField:change': function (event) {
                    debugger
//                    _this.networkSvgLayout.setNodeLabel(event.value);
                },
                'change:nodeLabelSize': function (event) {
                    _this.network.setVerticesRendererAttribute('labelSize', event.option);
                },
                'change:edgeLabelSize': function (event) {
                    _this.network.setEdgesRendererAttribute('labelSize', event.option);
                },
                'all': function (event) {
                    _this._refreshOverview();
                }
            }
        });
        return editionBar;
    },

    _createNetworkSvgLayout: function (targetId) {
        var _this = this;
        var toolbarHeight = $(this.toolbarDiv).height();
        var editionbarHeight = $(this.editionbarDiv).height();
        var height = this.height - toolbarHeight - editionbarHeight;

        console.log(this.height);
        console.log(height)
        var networkSvgLayout = new NetworkSvgLayout({
            targetId: targetId,
            width: this.width,
            height: height,
            network: this.network,
            autoRender: true,
            handlers: {
                'vertex:leftClick': function (event) {
                    console.log(event);
                    _this.editionBar.setNodeColor(event.vertexConfig.renderer.color);
                    _this.editionBar.setNodeStrokeColor(event.vertexConfig.renderer.strokeColor);
                    _this.editionBar.setNodeNameField(event.vertex.name);
                    _this.editionBar.setNodeSizeField(event.vertexConfig.renderer.size);
                    _this.editionBar.setNodeStrokeSizeField(event.vertexConfig.renderer.strokeSize);

//                    _this.editionBar.showNodeToolbar();
//                    _this.editionBar.hideEdgeToolbar();
                },
                'edge:leftClick': function (event) {
                    _this.editionBar.setEdgeColor(event.edgeConfig.renderer.color);
                    _this.editionBar.setEdgeSizeField(event.edgeConfig.renderer.size);
                    _this.editionBar.setEdgeNameField(event.edge.name);

//                    _this.editionBar.showEdgeToolbar();
//                    _this.editionBar.hideNodeToolbar();
                },
                'vertex:rightClick': function (event) {
                    console.log(event);
                    _this._fillContextMenu(event);
                    $(_this.contextMenuDiv).css({
                        display: "block",
                        left: event.x,
                        top: event.y
                    });
                },
                'click:leftMouseUp': function (event) {
                    _this._refreshOverview();
                }
            }
        });


//        var v1 = networkSvgLayout.createVertex(200, 100);
//        var v2 = networkSvgLayout.createVertex(300, 320);
//        var v3 = networkSvgLayout.createVertex(500, 400);
//        var v4 = networkSvgLayout.createVertex(200, 440);
//        networkSvgLayout.createEdge(v1, v2);
//        networkSvgLayout.createEdge(v2, v3);
//        networkSvgLayout.createEdge(v2, v4);

        return networkSvgLayout;
    },
    _createContextMenu: function () {
        var _this = this;
        var html = '' +
            '<div id="nvContextMenu" class="dropdown clearfix">' +
            '    <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" style="display:block;position:static;margin-bottom:5px;">' +
            '        <li><a tabindex="-1" href="#">Action</a></li>' +
            '        <li class="divider"></li>' +
            '        <li><a tabindex="-1" href="#">Separated link</a></li>' +
            '    </ul>' +
            '</div>';

        this.contextMenuDiv = $(html)[0];
        $(this.div).append(this.contextMenuDiv);


        $(_this.contextMenuDiv).bind('click.networkViewer', function (event) {
            var targetEl = event.target;
            var text = $(targetEl).text();
        });


        $(document).bind('click.networkViewer', function () {
            $(_this.contextMenuDiv).hide();
        });

        /**************/
    },
    _fillContextMenu: function (event) {
        var _this = this;
        var attributes = event.attributes;
        var vertex = event.vertex;
        var ul = $(this.contextMenuDiv).children().first()[0];
        $(ul).empty();
        for (var i in attributes) {
            var menuEntry = $('<li role="presentation"><a>' + attributes[i] + '</a></li>')[0];
            $(ul).append(menuEntry);
        }
        var menuEntry = $('<li role="presentation"><input id="nodeColorField" type="text"></li>')[0];
        var deleteEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">Delete</a></li>')[0];
        var deleteSelectedEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">Delete selected nodes</a></li>')[0];
//        $(ul).append(menuEntry);
        $(ul).append(deleteEntry);
        $(ul).append(deleteSelectedEntry);

        $(deleteEntry).bind('click.networkViewer', function (event) {
            _this.networkSvgLayout.removeVertex(vertex);
        });

        $(deleteSelectedEntry).bind('click.networkViewer', function (event) {
            _this.networkSvgLayout.removeSelectedVertices();
        });

//        var nodeColorField = $(ul).find('#nodeColorField');
//        var pickAColorConfig = {
//            showSpectrum: true,
//            showSavedColors: true,
//            saveColorsPerElement: false,
//            fadeMenuToggle: true,
//            showAdvanced: true,
//            showBasicColors: true,
//            showHexInput: true,
//            allowBlank: true
//        }
//        $(nodeColorField).pickAColor(pickAColorConfig);
    },
    _setZoom: function (zoom) {
        this.zoom = zoom;
        this.networkSvgLayout.setZoom(zoom);
        if (this.overviewPanel) {
            var width = $(this.overviewPanelDiv).width();
            var height = $(this.overviewPanelDiv).height();
            var scale = (this.networkSvgLayout.scale < 1) ? 1 : this.networkSvgLayout.scale;
            var w = width / (scale) + 2;
            var h = height / (scale) + 2;
            var t = (width / 2) - (w / 2);
            var l = (height / 2) - (h / 2);
            $(this.cameraDiv).css({
                "left": t,
                "top": l,
                "width": w,
                "height": h
            });
        }
    },
    _createNetworkSvgOverview: function (targetId) {
        var _this = this;
        var networkSvg = new NetworkSvg({
            targetId: targetId,
            width: 1000 * 0.2,
            height: 300 * 0.2,
            networkData: this.networkData,
            autoRender: true,
            handlers: {
            }
        });
        return networkSvg;
    },
    setLayout: function (type) {
        var _this = this;
        var graph = this.networkSvgLayout.network.getGraph();
        var dot = graph.getAsDOT();
        switch (type) {
            case "Circle":
                //TODO
                var vertexCoordinates = this.calculateLayoutVertex(type, nodeList.length);
                var aux = 0;
                for (var i = 0; i < nodeList.length; i++) {
                    var x = this.networkSvg.getWidth() * (0.05 + 0.85 * vertexCoordinates[aux].x);
                    var y = this.networkSvg.getHeight() * (0.05 + 0.85 * vertexCoordinates[aux].y);
                    this.networkSvg.moveNode(nodeList[i], x, y);
                    aux++;
                }
                break;
            case "Square":
                //TODO
                var vertexCoordinates = this.calculateLayoutVertex(type, nodeList.length);
                var aux = 0;
                for (var i = 0; i < nodeList.length; i++) {
                    var x = this.networkSvg.getWidth() * (0.05 + 0.85 * vertexCoordinates[aux].x);
                    var y = this.networkSvg.getHeight() * (0.05 + 0.85 * vertexCoordinates[aux].y);
                    this.networkSvg.moveNode(nodeList[i], x, y);
                    aux++;
                }
                break;
            case "Random":
                //TODO
                for (var i = 0; i < nodeList.length; i++) {
                    var x = this.networkSvg.getWidth() * (0.05 + 0.85 * Math.random());
                    var y = this.networkSvg.getHeight() * (0.05 + 0.85 * Math.random());
                    this.networkSvg.moveNode(nodeList[i], x, y);
                }
                break;
            case "none":
                break;
            default:
                console.log(dot);
                var url = "http://bioinfo.cipf.es/utils/ws/rest/network/layout/" + type.toLowerCase() + ".coords";
//        		var url = "http://localhost:8080/opencga/rest/utils/network/layout/"+type+".coords";
                $.ajax({
                    async: false,
                    type: "POST",
                    url: url,
                    dataType: "json",
                    data: {
                        dot: dot
                    },
                    cache: false,
                    success: function (data) {
                        for (var vertexId in data) {
                            var x = _this.networkSvgLayout.getWidth() * (0.05 + 0.85 * data[vertexId].x);
                            var y = _this.networkSvgLayout.getHeight() * (0.05 + 0.85 * data[vertexId].y);
                            _this.networkSvgLayout.setVertexCoords(vertexId, x, y);
                        }
                    }
                });
                break;
        }
    },
    select: function (option) {
        switch (option) {
            case 'All Nodes' :
                this.networkSvgLayout.selectAllVertices();
                break;
            case 'All Edges' :
                this.networkSvgLayout.selectAllEdges();
                break;
            case 'Everything' :
                this.networkSvgLayout.selectAll();
                break;
            case 'Adjacent' :
                //TODO
                this.networkSvg.selectAdjacentNodes();
                break;
            case 'Neighbourhood' :
                //TODO
                this.networkSvg.selectNeighbourhood();
                break;
            case 'Connected' :
                //TODO
                this.networkSvg.selectConnectedNodes();
                break;
            default :
                console.log(option + " not yet defined");
        }
    },
    getVerticesLength: function () {
        return this.network.graph.numberOfVertices;
    },
    getSelectedVertices: function () {
        return this.networkSvgLayout.selectedVertices;
    },
    importVertexWithAttributes: function (data) {
        this.network.importVertexWithAttributes(data);
        this.networkSvgLayout.draw();
    },
    loadJSON: function (content) {
        this.network.loadJSON(content);
//        this.network.(content);
        this.networkSvgLayout.setZoom(content["zoom"]);
        this.networkSvgLayout.draw();
        this.networkSvgLayout.addBackgroundImages(content["backgroundImages"]);
        this._refreshOverview();
    },
    toJSON: function () {
        var json = this.network.toJSON();
        json["backgroundImages"] = this.networkSvgLayout.getBackGroundImages();
        json["zoom"] = this.zoom;
        return json;
    }

}