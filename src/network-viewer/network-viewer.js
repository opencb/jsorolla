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
        this.centerPanelDiv = $('<div id="nv-centerpanel" style="postion:relative;"></div>')[0];
        this.statusbarDiv = $('<div id="nv-statusbar"></div>')[0];

        $(this.div).append(this.toolbarDiv);
        $(this.div).append(this.editionbarDiv);
        $(this.div).append(this.centerPanelDiv);
        $(this.div).append(this.statusbarDiv);

        this.mainPanelDiv = $('<div id="nv-mainpanel" style="postion:absolute;right:0px;height:100%;"></div>')[0];
        $(this.centerPanelDiv).append(this.mainPanelDiv);

        if (this.sidePanel) {
            this.sidePanelDiv = $('<div id="nv-sidepanel" style="postion:absolute;right:0px;height:100%;"></div>')[0];
            $(this.centerPanelDiv).append(this.sidePanelDiv);
        }

        if (this.overviewPanel) {
            this.overviewPanelDiv = $('<div id="nv-overviewpanel" style="postion:absolute;bottom:10px;right:10px;width:200px;height:200px;border:1px solid lightgrey;"></div>')[0];
            $(this.centerPanelDiv).append(this.overviewPanelDiv);
        }

        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }

        this.rendered = true;
    },
    draw: function () {
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }

        /* Toolbar Bar */
        this.toolBar = this._createToolBar($(this.toolbarDiv).attr('id'));

        /* edition Bar */
        this.editionBar = this._createEditionBar($(this.editionbarDiv).attr('id'));

        this.networkSvgLayout = this._createNetworkSvgLayout($(this.mainPanelDiv).attr('id'));


        /* context menu*/
        this.contextMenu = this._createContextMenu();


//        this.networkSvgOverview = this._createNetworkSvgOverview($(this.overviewPanelDiv).attr('id'));


//        // networkSVG for the overview
//        if(this.overview) {
//            div = $('#'+this.getGraphCanvasId()+'_overview')[0];
//            this.networkSvgOverview = new NetworkSvg(div, this.networkData, {"width": "100%", "height": "100%", "parentNetwork": this.networkSvg, "scale": this.overviewScale});
//        }

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
                    //todo
                },
                'showOverviewButton:change': function (event) {
                    console.log(event);
                    //todo
                },
                'zoom:change': function (event) {
                    console.log(event.zoom);
                    //todo
                },
                'search': function (event) {
                    console.log(event);
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
                'nodeShape:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('shape', event.value);
                },
                'nodeSize:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('size', parseInt(event.value));
                },
                'nodeStrokeSize:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('strokeSize', parseInt(event.value));
                },
                'opacity:change': function (event) {
                    _this.networkSvgLayout.setSelectedVerticesDisplayAttr('opacity', event.value);
                },
                'edgeShape:change': function (event) {
                    _this.networkSvgLayout.setSelectedEdgesDisplayAttr('shape', event.value);
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
                    _this.networkSvgLayout.setVertexName(event.value);
                },
                'edgeLabelField:change': function (event) {
                    _this.networkSvgLayout.setEdgeName(event.value);
                },
                'nodeLabelField:change': function (event) {
                    _this.networkSvgLayout.setNodeLabel(event.value);
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
                }
            }
        });
        var v1 = networkSvgLayout.createVertex(200, 100);
        var v2 = networkSvgLayout.createVertex(300, 320);
        var v3 = networkSvgLayout.createVertex(500, 400);
        var v4 = networkSvgLayout.createVertex(200, 440)
        networkSvgLayout.createEdge(v1, v2);
        networkSvgLayout.createEdge(v2, v3);
        networkSvgLayout.createEdge(v2, v4);

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
//        $(ul).append(menuEntry);
        $(ul).append(deleteEntry);

        $(deleteEntry).bind('click.networkViewer', function (event) {
            _this.networkSvgLayout.removeVertex(vertex);
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
        this.networkSvgLayout.draw();
    },
    toJSON: function () {
        return this.network.toJSON();
    }

}