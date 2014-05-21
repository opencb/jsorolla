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
    this.session;

    //set instantiation args, must be last
    _.extend(this, args);

    this.toolBar;
    this.editionBar;
    this.networkSvgLayout;

    this.contextMenu;

    this.selectedVertices = [];
    this.selectedEdges = [];
    this.createdVertexCount = 0;

    this.overviewRefreshing = false;

    this.zoom = 25;

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

NetworkViewer.prototype = {
    render: function (targetId) {
        var _this = this;
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


        this.mainPanelDiv = $('<div id="nv-mainpanel" style="position:relative;height:100%;"></div>')[0];
        $(this.centerPanelDiv).append(this.mainPanelDiv);

        if (this.sidePanel) {
            this.sidePanelDiv = $('<div id="nv-sidepanel" style="position:absolute;right:0px;height:100%;"></div>')[0];
            $(this.centerPanelDiv).append(this.sidePanelDiv);
        }


//        this.alertDiv = $('<div id="nv-alert" style="position:absolute;"></div>')[0];
//        $(this.alertDiv).css({
//            left:this.width/2,
//            top:this.height/3
//        });
//        var a = '<div class="alert alert-warning hidden">' +
//            '<h4>A CellMaps session was found in your browser, want to reload it?</h4>' +
//            '<p>' +
//            '<button type="button" class="btn btn-info">Load session</button> ' +
//            '<button type="button" class="btn btn-danger">Start over</button>' +
//            '</p>' +
//            '</div>';
//        $(this.alertDiv).append(a);
//        $(this.centerPanelDiv).append(this.alertDiv);

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
    resize: function () {
        this.height = $(this.targetDiv).height();
        this.width = $(this.targetDiv).width();

        var toolbarHeight = $(this.toolbarDiv).height();
        var editionbarHeight = $(this.editionbarDiv).height();
        var height = this.height - toolbarHeight - editionbarHeight;
        this.networkSvgLayout.setSize(this.width, height);
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }

        this.network = new Network({
            handlers: {
                'add:vertex add:edge remove:vertex remove:vertices load:json import:attributes clean se??': function () {
                    _this._updateStatusInfo();
                },
                'change:vertexAttributes': function (e) {
                    _this.editionBar.setVertexAttributesMenu(e.sender);
                    _this.toolBar.setVertexAttributes(e.sender);
                    _this.trigger('change:vertexAttributes', e);
                },
                'change:edgeAttributes': function (e) {
                    _this.editionBar.setEdgeAttributesMenu(e.sender);
                    _this.trigger('change:edgeAttributes', e);
                }
            }
        });

        /* Toolbar Bar */
        this.toolBar = this._createToolBar($(this.toolbarDiv).attr('id'));

        /* edition Bar */
        this.editionBar = this._createEditionBar($(this.editionbarDiv).attr('id'));

        this.networkSvgLayout = this._createNetworkSvgLayout($(this.mainPanelDiv).attr('id'));

        this._createStatusBar($(this.statusbarDiv).attr('id'));

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


        if (typeof this.session !== 'undefined') {
            this.loadJSON(this.session);
        }
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
                'click:selectButton': function (event) {
                    _this.networkSvgLayout.setMode("select");
                },
                'click:backgroundButton': function (event) {
                    _this.networkSvgLayout.setMode("selectbackground");
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
                    _this.setLayout(event.option, event);
                },
                'labelSize:change': function (event) {
                    _this.network.setEdgesRendererAttribute('labelSize', event.option);
                    _this.network.setVerticesRendererAttribute('labelSize', event.option);
                },
                'select:change': function (event) {
                    console.log(event);
                    _this.select(event.option);
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
                'change:rotate': function (event) {
                    _this.rotateNetwork(event.angle);
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
                'vertexShape:change': function (event) {
                    _this.setSelectedVerticesDisplayAttr('shape', event.value);
                },
                'vertexSize:change': function (event) {
                    _this.setSelectedVerticesDisplayAttr('size', parseInt(event.value), true);
                },
                'vertexStrokeSize:change': function (event) {
                    _this.setSelectedVerticesDisplayAttr('strokeSize', parseInt(event.value), true);
                },
                'opacity:change': function (event) {
                    _this.setSelectedVerticesDisplayAttr('opacity', event.value);
                },
                'edgeShape:change': function (event) {
                    _this.setSelectedEdgesDisplayAttr('shape', event.value);
                },
                'edgeSize:change': function (event) {
                    _this.setSelectedEdgesDisplayAttr('size', parseInt(event.value));
                },
                'vertexColorField:change': function (event) {
                    _this.setSelectedVerticesDisplayAttr('color', event.value);
                },
                'vertexStrokeColorField:change': function (event) {
                    _this.setSelectedVerticesDisplayAttr('strokeColor', event.value);
                },
                'edgeColorField:change': function (event) {
                    _this.setSelectedEdgesDisplayAttr('color', event.value);
                },
                'vertexNameField:change': function (event) {
                    _this.setVertexLabel(event.value);
                },
                'edgeNameField:change': function (event) {
                    _this.setEdgeLabel(event.value);
                },
                'change:vertexLabelSize': function (event) {
                    _this.network.setVerticesRendererAttribute('labelSize', event.option);
                },
                'change:edgeLabelSize': function (event) {
                    _this.network.setEdgesRendererAttribute('labelSize', event.option);
                },
                'search:vertex': function (event) {
                    _this.selectVerticesByAttribute(event.attributeName, event.attributeValue);
                },
                'search:edge': function (event) {
                    _this.selectEdgesByAttribute(event.attributeName, event.attributeValue);
                },
                'all': function (event) {
                    _this._refreshOverview();
                }
            }
        });
        return editionBar;
    },
    _createStatusBar: function (targetId) {
        var _this = this;
        var div = $('<div></div>')[0];
        $(div).css({
            padding: '5px',
            fontSize: '14px'
        });
        $('#' + targetId).append(div);

        this.numVertices = $('<span></span>')[0];
        this.numEdges = $('<span></span>')[0];
        this.numSelectedVertices = $('<span></span>')[0];
        this.numSelectedEdges = $('<span></span>')[0];
        this.loadingMessage = $('<span></span>')[0];

        $(this.numSelectedVertices).css({
            fontWeight: 'bold',
            color: '#428bca'
        });
        $(this.numSelectedEdges).css({
            fontWeight: 'bold',
            color: '#428bca'
        });
        $(this.numVertices).css({
            fontWeight: 'bold'
        });
        $(this.numEdges).css({
            fontWeight: 'bold'
        });
        $(this.loadingMessage).css({
            marginLeft: '20px'
        });

        var infoVertices = $('<span>Total nodes: </span>')[0];
        var infoEdges = $('<span>Total edges: </span>')[0];
        var infoSelVertices = $('<span>Selected nodes: </span>')[0];
        var infoSelEdges = $('<span>Selected edges: </span>')[0];
        $(infoVertices).css({
            color: 'dimgray'
        });
        $([infoEdges, infoSelVertices, infoSelEdges]).css({
            color: 'dimgray',
            marginLeft: '10px'
        });

        this.on('select:vertices', function (e) {
            $(_this.numSelectedVertices).html(e.vertices.length);
        });
        this.on('select:edges', function (e) {
            $(_this.numSelectedEdges).html(e.edges.length);
        });

        $(div).append(infoVertices);
        $(div).append(this.numVertices);
        $(div).append(infoEdges);
        $(div).append(this.numEdges);
        $(div).append(infoSelVertices);
        $(div).append(this.numSelectedVertices);
        $(div).append(infoSelEdges);
        $(div).append(this.numSelectedEdges);
        $(div).append(this.loadingMessage);
    },
    setLoading: function (msg) {
        $(this.loadingMessage).text(msg);
    },
    _updateStatusInfo: function () {
        console.log("_updateStatusInfo")
        $(this.numVertices).html(this.getVerticesLength());
        $(this.numEdges).html(this.getEdgesLength());
    },

    _createNetworkSvgLayout: function (targetId) {
        var _this = this;

        var toolbarHeight = $(this.toolbarDiv).height();
        var editionbarHeight = $(this.editionbarDiv).height();

        var bTopWidth = parseInt($(this.div).css('borderTopWidth'));
        var bBottomWidth = parseInt($(this.div).css('borderBottomWidth'));

        var height = this.height - toolbarHeight - editionbarHeight - bTopWidth - bBottomWidth;
        var width = $(this.mainPanelDiv).width();

        console.log(this.height);
        console.log(height)
        var networkSvgLayout = new NetworkSvgLayout({
            targetId: targetId,
            width: width,
            height: height,
            autoRender: true,
            handlers: {
                'select:vertex': function (e) {
                    var vertex = _this.network.getVertexById(e.vertexId);
                    var isSelected = _this.network.isVertexSelected(vertex);
                    if (!isSelected) {
                        _this.selectVertex(vertex, e.addToSelection);
                    }
                },
                'create:vertex': function (e) {
                    _this.createVertex(e.x, e.y);

                },
                'remove:vertex': function (e) {
                    var vertex = _this.network.getVertexById(e.vertexId);
                    _this.removeVertex(vertex);
                },
                'move:selectedVertices': function (e) {
                    _this._moveSelectedVertices(e.dispX, e.dispY);
                },
                'select:area': function (e) {
                    _this.selectByArea(e.x, e.y, e.width, e.height);
                },
                'create:edge': function (e) {
                    var source = _this.network.getVertexById(e.sourceId);
                    var target = _this.network.getVertexById(e.targetId);
                    _this.createEdge(source, target);
                },

                'vertex:leftClick': function (e) {
                    var vertex = _this.network.getVertexById(e.vertexId);
                    var vertexConfig = _this.network.getVertexConfig(vertex);
                    console.log(e);
                    _this.editionBar.setVertexColor(vertexConfig.renderer.color);
                    _this.editionBar.setVertexStrokeColor(vertexConfig.renderer.strokeColor);
                    _this.editionBar.setVertexNameField(vertexConfig.renderer.labelText);
                    _this.editionBar.setVertexSizeField(vertexConfig.renderer.size);
                    _this.editionBar.setVertexStrokeSizeField(vertexConfig.renderer.strokeSize);

//                    _this.editionBar.showVertexToolbar();
//                    _this.editionBar.hideEdgeToolbar();
                    _this.trigger('change', {sender: _this});
                },
                'edge:leftClick': function (e) {
                    var edge = _this.network.getEdgeById(e.edgeId);
                    var edgeConfig = _this.network.getEdgeConfig(edge);

                    var isSelected = _this.network.isEdgeSelected(edge);
                    if (!isSelected) {
                        _this.selectEdge(edge);
                    }

                    _this.editionBar.setEdgeColor(edgeConfig.renderer.color);
                    _this.editionBar.setEdgeSizeField(edgeConfig.renderer.size);
                    _this.editionBar.setEdgeNameField(edgeConfig.renderer.labelText);

//                    _this.editionBar.showEdgeToolbar();
//                    _this.editionBar.hideVertexToolbar();
                },
                'rightClick:vertex': function (e) {
                    console.log(e);
                    _this._fillVertexContextMenu(e);
                    $(_this.contextMenuDiv).css({
                        display: "block",
                        left: e.x,
                        top: e.y + 90
                    });
                },
                'rightClick:backgroundImage': function (e) {
                    console.log(e);
                    _this._fillBackImageContextMenu(e);
                    $(_this.contextMenuDiv).css({
                        display: "block",
                        left: e.x,
                        top: e.y + 90
                    });
                }
            }
        });
        return networkSvgLayout;
    },
    getLayoutWidth: function () {
        return this.networkSvgLayout.getWidth();
    },
    getLayoutHeight: function () {
        return this.networkSvgLayout.getHeight();
    },
    selectAll: function () {
        this.selectedVertices = this.network.selectAllVertices();
        this.selectedEdges = this.network.selectAllEdges();
        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        this.trigger('select:edges', {edges: this.selectedEdges, sender: this});
        console.log('selectAll');
    },
    _deselectAllVertices: function () {
        this.selectedVertices = [];
        this.network.deselectAllVertices();
    },
    _deselectAllEdges: function () {
        this.selectedEdges = [];
        this.network.deselectAllEdges();
    },
    selectAllVertices: function () {
        this._deselectAllEdges();
        this.selectedVertices = this.network.selectAllVertices();
        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        console.log('selectAllVertices');
    },
    selectAllEdges: function () {
        this._deselectAllVertices();
        this.selectedEdges = this.network.selectAllEdges();
        this.trigger('select:edges', {edges: this.selectedEdges, sender: this});
    },
    selectVertex: function (vertex, addToSelection) {
        if (addToSelection) {
            this.selectedVertices.push(vertex);
        } else {
            this._deselectAllVertices();
            this.selectedVertices = [vertex];

        }
        this.network.selectVertex(vertex);

        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        console.log('selectVertex');
    },
    selectVerticesNeighbour: function () {
        this.selectedVertices = this.network.selectVerticesNeighbour(this.selectedVertices);

        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        console.log('selectVertexNeighbour');
    },
    selectEdgesNeighbour: function () {
        this.selectedEdges = this.network.selectEdgesNeighbour(this.selectedVertices);

        this.trigger('select:edges', {edges: this.selectedEdges, sender: this});
        console.log('selectEdgesNeighbour');
    },
    selectVerticesInvert: function () {
        this.selectedVertices = this.network.selectVerticesInvert();

        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        console.log('selectVertexNeighbour');
    },
    selectEdge: function (edge) {
        this._deselectAllEdges();
        this.network.selectEdge(edge);

        this.selectedEdges = [edge];
        this.trigger('select:edges', {edges: this.selectedEdges, sender: this});
    },
    _moveSelectedVertices: function (dispX, dispY) {
        this.scale = this.networkSvgLayout.scale; //TODO
        dispX /= this.scale;
        dispY /= this.scale;
        for (var i = 0, li = this.selectedVertices.length; i < li; i++) {
            var vertex = this.selectedVertices[i];
            this.network.moveVertex(vertex, dispX, dispY);
        }
    },
    selectByArea: function (x, y, width, height) {
        this.scale = this.networkSvgLayout.scale;//TODO
        var centerX = this.networkSvgLayout.width / 2;
        var centerY = this.networkSvgLayout.height / 2;
        var transX = this.networkSvgLayout.centerX + (-centerX * (this.scale - 1));
        var transY = this.networkSvgLayout.centerY + (-centerY * (this.scale - 1));
        x -= transX;
        y -= transY;

        x /= this.scale;
        y /= this.scale;
        width /= this.scale;
        height /= this.scale;

        this._deselectAllVertices();
        this._deselectAllEdges();
        var selection = this.network.selectByArea(x, y, width, height);
        this.selectedVertices = selection.vertices;
        this.selectedEdges = selection.edges;
        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        this.trigger('select:edges', {edges: this.selectedEdges, sender: this});
        console.log('selectVerticesByArea');
    },
    selectVerticesByIds: function (vertexIds) {
        this._deselectAllVertices();
        this.selectedVertices = this.network.selectVerticesByIds(vertexIds);
        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        console.log('selectVerticesByIds');
    },
    selectVerticesByAttribute: function (attributeName, attributeValue) {
        this._deselectAllVertices();
        this.selectedVertices = this.network.selectVerticesByAttribute(attributeName, attributeValue);
        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        console.log('selectVerticesByAttribute');
    },
    selectEdgesByAttribute: function (attributeName, attributeValue) {
        this._deselectAllEdges();
        this.selectedVertices = this.network.selectEdgesByAttribute(attributeName, attributeValue);
        this.trigger('select:vertices', {vertices: this.selectedVertices, sender: this});
        console.log('selectEdgesByAttribute');
    },
    setVertexCoords: function (vertexId, x, y) {
        var vertex = this.network.getVertexById(vertexId);
        this.network.setVertexCoords(vertex, x, y);
    },
    removeVertex: function (vertex) {
        this.network.removeVertex(vertex);
        this._deselectAllVertices();
    },
    removeSelectedVertices: function () {
        var vertices = this.selectedVertices;
        this._deselectAllVertices();
        this.network.removeVertices(vertices);
    },
    setSelectedVerticesDisplayAttr: function (displayAttr, value, updateEdges) {
        for (var i = 0, li = this.selectedVertices.length; i < li; i++) {
            var vertex = this.selectedVertices[i];
            if (typeof vertex !== 'undefined') {
                this.network.setVertexRendererAttribute(vertex, displayAttr, value, updateEdges);
            }
        }
    },
    setSelectedEdgesDisplayAttr: function (displayAttr, value) {
        for (var i = 0, li = this.selectedEdges.length; i < li; i++) {
            var edge = this.selectedEdges[i];
            if (typeof edge !== 'undefined') {
                this.network.setEdgeRendererAttribute(edge, displayAttr, value);
            }
        }
    },
    setVertexLabel: function (label) {
        if (this.selectedVertices.length == 1) {
            var vertex = this.selectedVertices[0];
            this.network.setVertexLabel(vertex, label);
        }
    },
    setEdgeLabel: function (label) {
        if (this.selectedEdges.length == 1) {
            var edge = this.selectedEdges[0];
            this.network.setEdgeLabel(edge, label);
        }
    },
    createVertex: function (x, y) {
        this.scale = this.networkSvgLayout.scale;//TODO
        var centerX = this.networkSvgLayout.width / 2;
        var centerY = this.networkSvgLayout.height / 2;
        var transX = this.networkSvgLayout.centerX + (-centerX * (this.scale - 1));
        var transY = this.networkSvgLayout.centerY + (-centerY * (this.scale - 1));
        x -= transX;
        y -= transY;
        x /= this.scale;
        y /= this.scale;

        console.log(this.scale);
        /* vertex graph */
        var vertex = new Vertex({
            id: 'n' + '_' + Utils.randomString(7)
        });

        /* vertex config */
        var vertexConfig = new VertexConfig({
            coords: {x: x, y: y}
        });

        //update variables
        this.createdVertexCount++;
        this.network.addVertex({
            vertex: vertex,
            vertexConfig: vertexConfig,
            target: this.networkSvgLayout.getElementsSVG()
        });
        this.trigger('change', {sender: this});
        return vertex;
    },
    createEdge: function (vertexSource, vertexTarget) {
        var relation = 'i';
        /* edge graph */
        var edge = new Edge({
            id: vertexSource.id + '_' + relation + '_' + vertexTarget.id,
            relation: relation,
            source: vertexSource,
            target: vertexTarget
        });

        var edgeConfig = new EdgeConfig({});

        this.network.addEdge({
            edge: edge,
            edgeConfig: edgeConfig,
            target: this.networkSvgLayout.getElementsSVG()
        });
        this.trigger('change', {sender: this});
        return edge;
    },
    removeBackGroundImage: function (imageEl) {
        $(imageEl).remove();
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
    _fillVertexContextMenu: function (event) {
        var _this = this;
        var attributes = event.attributes;
        var vertex = this.network.getVertexById(event.vertexId);
        var ul = $(this.contextMenuDiv).children().first()[0];
        $(ul).empty();
        for (var i in attributes) {
            var menuEntry = $('<li role="presentation"><a>' + attributes[i] + '</a></li>')[0];
            $(ul).append(menuEntry);
        }
        var menuEntry = $('<li role="presentation"><input id="nodeColorField" type="text"></li>')[0];
        var deleteEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">Delete</a></li>')[0];
        var deleteSelectedEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">Delete selected nodes</a></li>')[0];
        var selectDirectNeighbours = $('<li role="presentation"><a tabindex="-1" role="menuitem">First neighbour nodes</a></li>')[0];
        var selectAdjacentEdges = $('<li role="presentation"><a tabindex="-1" role="menuitem">Adjacent edges</a></li>')[0];
//        $(ul).append(menuEntry);
        $(ul).append(deleteEntry);
        $(ul).append(deleteSelectedEntry);
        $(ul).append('<li role="presentation" class="divider"></li>');
        $(ul).append(selectDirectNeighbours);
        $(ul).append(selectAdjacentEdges);

        $(deleteEntry).bind('click.networkViewer', function (event) {
            _this.removeVertex(vertex);
        });
        $(deleteSelectedEntry).bind('click.networkViewer', function (event) {
            _this.removeSelectedVertices();
        });
        $(selectDirectNeighbours).bind('click.networkViewer', function (event) {
            _this.selectVertex(vertex);
            _this.selectVerticesNeighbour();
        });
        $(selectAdjacentEdges).bind('click.networkViewer', function (event) {
            _this.selectVertex(vertex);
            _this.selectEdgesNeighbour();
        });
    },
    _fillBackImageContextMenu: function (event) {
        var _this = this;
        var targetEl = event.targetEl;
        var ul = $(this.contextMenuDiv).children().first()[0];
        $(ul).empty();
        var deleteEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">Delete</a></li>')[0];
        $(ul).append(deleteEntry);

        $(deleteEntry).bind('click.networkViewer', function (event) {
            _this.removeBackGroundImage(targetEl);
        });
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
    rotateNetwork: function (angle) {
        var intPattern = /^-?\d+$/;
        if (typeof angle !== 'undefined' && intPattern.test(angle)) {
            var centerX = this.networkSvgLayout.width / 2;
            var centerY = this.networkSvgLayout.height / 2;
            var vertices = this.network.graph.vertices;

            var rotationInRadians = angle * Math.PI / 180.0;

            for (var i = 0, l = vertices.length; i < l; i++) {
                var vertex = vertices[i];
                if (typeof vertex !== 'undefined') {
                    var vCoords = this.network.getVertexCoords(vertex);

                    //Detect angle and radius using width/2 and height/2 as center
                    var deltaX = vCoords.x - centerX;
                    var deltaY = vCoords.y - centerY;
                    var radius = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                    var delta = deltaY / deltaX;
                    var angleRad = (isNaN(delta)) ? 0 : Math.atan(delta) + rotationInRadians;
                    //Fix Quadrant
                    angleRad = (vCoords.x < centerX) ? angleRad += Math.PI : angleRad;

                    var x = centerX + (radius * Math.cos(angleRad));
                    var y = centerY + (radius * Math.sin(angleRad));
                    //
                    this.setVertexCoords(vertex.id, x, y);
                }
            }
        }
    },
    setLayout: function (type, e) {
        var _this = this;
        var graph = this.network.getGraph();
        var dot = graph.getAsDOT();
        switch (type) {
            case "Circle":
                if (typeof e.attributeName !== 'undefined') {
                    GraphLayout.circle(this.network, this.getLayoutWidth(), this.getLayoutHeight(), this.network.getVerticesOrdered(e.attributeName));
                } else {
                    GraphLayout.circle(this.network, this.getLayoutWidth(), this.getLayoutHeight());
                }
                break;
            case "Random":
                GraphLayout.random2d(this.network, this.getLayoutWidth(), this.getLayoutHeight());
                break;
            case "none":
                break;
            case "Force directed":
                GraphLayout.force({
                    network: this.network,
                    width: this.getLayoutWidth(),
                    height: this.getLayoutHeight(),
                    end: function (verticesArray) {
                        for (var i = 0, l = verticesArray.length; i < l; i++) {
                            var v = verticesArray[i];
                            _this.setVertexCoords(v.id, v.x, v.y);
                        }
                    }
                });
                break;
            case "Force directed (simulation)":
                GraphLayout.force({
                    network: this.network,
                    width: this.getLayoutWidth(),
                    height: this.getLayoutHeight(),
                    simulation: true,
                    end: function (verticesArray) {
                        for (var i = 0, l = verticesArray.length; i < l; i++) {
                            var v = verticesArray[i];
                            _this.setVertexCoords(v.id, v.x, v.y);
                        }
                    }
                });
                break;
            default:
                console.log(dot);
                var url = "http://bioinfo.cipf.es/utils/ws/rest/network/layout/" + type.toLowerCase() + ".coords";
//        		var url = "http://localhost:8080/opencga/rest/utils/network/layout/"+type+".coords";
//                var url = "http://ws-beta.bioinfo.cipf.es/opencga-staging/rest/utils/network/layout/" + type.toLowerCase() + ".coords";
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
                        console.log('Layout back')
                        for (var vertexId in data) {
                            var x = _this.getLayoutWidth() * (0.05 + 0.85 * data[vertexId].x);
                            var y = _this.getLayoutHeight() * (0.05 + 0.85 * data[vertexId].y);
                            _this.setVertexCoords(vertexId, x, y);
                        }
                    },
                    error: function (data) {
                        debugger
                    },

                });
                break;
        }
    },
    select: function (option) {
        switch (option) {
            case 'All nodes' :
                this.selectAllVertices();
                break;
            case 'All edges' :
                this.selectAllEdges();
                break;
            case 'Everything' :
                this.selectAll();
                break;
            case 'First neighbour nodes' :
                this.selectVerticesNeighbour();
                break;
            case 'Invert node selection' :
                this.selectVerticesInvert();
                break;
            case 'Adjacent edges' :
                this.selectEdgesNeighbour();
                break;
            default :
                console.log(option + " not yet defined");
        }
    },
    getVerticesLength: function () {
        return this.network.getVerticesLength();
    },
    getEdgesLength: function () {
        return this.network.getEdgesLength();
    },
    getVertices: function () {
        return this.network.getVertices();
    },
    getEdges: function () {
        return this.network.getEdges();
    },
    getSelectedVertices: function () {
        return this.selectedVertices;
    },
    getSelectedEdges: function () {
        return this.selectedEdges;
    },
    importVertexWithAttributes: function (data) {
        this.network.importVertexWithAttributes(data);
        this.networkSvgLayout.clean();
        this.network.draw(this.networkSvgLayout.getElementsSVG());
    },
    importEdgesWithAttributes: function (data) {
        this.network.importEdgesWithAttributes(data);
        this.networkSvgLayout.clean();
        this.network.draw(this.networkSvgLayout.getElementsSVG());
    },
    clean: function () {
        this.network.clean();
        this.networkSvgLayout.clean();
        this.trigger('change', {sender: this});
    },
    drawNetwork: function () {
        this.network.draw(this.networkSvgLayout.getElementsSVG());
        this.trigger('change', {sender: this});
    },
    refreshNetwork: function () {
        this.networkSvgLayout.clean();
        this.network.draw(this.networkSvgLayout.getElementsSVG());
    },
    loadJSON: function (content) {
        try {
            this.networkSvgLayout.clean();
            this.network.loadJSON(content);
            this.networkSvgLayout.setZoom(content["zoom"]);
            this.toolBar.setZoom(content["zoom"]);
            this.network.draw(this.networkSvgLayout.getElementsSVG());
            this.networkSvgLayout.addBackgroundImages(content["backgroundImages"]);
            this.networkSvgLayout.setCenter(content["center"]);
            this._refreshOverview();
        } catch (e) {
            this.clean();
            console.log('Error loading JSON');
        }
    },
    toJSON: function () {
        var json = this.network.toJSON();
        json["backgroundImages"] = this.networkSvgLayout.getBackGroundImages();
        json["center"] = {x: this.networkSvgLayout.centerX, y: this.networkSvgLayout.centerY};
        json["zoom"] = this.zoom;
        return json;
    },
    getAsSIF: function (separator) {
        return this.network.getAsSIF(separator);
    },
    getAsSIFCustomRelation: function (separator, relationColumn) {
        return this.network.getAsSIFCustomRelation(separator, relationColumn);
    },
    setGraph: function (graph) {
        this.networkSvgLayout.clean();

        this.network.setGraph(graph);
        this.network.draw(this.networkSvgLayout.getElementsSVG());
        this.trigger('change', {sender: this});
    }

}