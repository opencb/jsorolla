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

function NetworkSvgLayout(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('networkSvg');

    this.bgColor = "white";
    this.scale = 1;
    this.zoom = 0;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;

    this.width;
    this.height;
    this.bgColor;
    this.species;
    this.parentNetwork;
    this.scale;
    this.network;


    //set instantiation args, must be last
    _.extend(this, args);

    /** Action mode **/
    this.mode = "select"; // Valid values: select, add, delete, join


    /** *** *** **/
    this.createdVertexCount = 0;

    /* join vertex click flag */
    this.joinSourceVertex = null;

    this.selectedVertices = [];

    this.selectedEdges = [];

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};


NetworkSvgLayout.prototype = {
    setNetwork: function (network) {
        this.network = network;
    },
    getWidth: function () {
        return this.width;
    },
    getHeight: function () {
        return this.height;
    },
    render: function (targetId) {
        var _this = this;
        if (targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }


        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" style="position:relative;"></div>')[0];
        $(this.targetDiv).append(this.div);

        /** SVG init **/
        this.svg = SVG.init(this.div, {
            "id": "mainSVG",
            "width": this.width,
            "height": this.height
        });
        this.defs = SVG.addChild(this.svg, "defs", {});

        this.canvas = SVG.addChild(this.svg, "svg", {
            id: 'canvas',
            "width": this.width,
            "height": this.height
        });

        /* background */
        this.backgroundSvg = SVG.init(this.canvas, {
            "id": "backgroundSVG",
            "width": this.width,
            "height": this.height,
            "x": 0,
            "y": 0
        });

        this.backgroundImage = SVG.addChildImage(this.backgroundSvg, {
            "id": "backgroundImage",
            "x": "0",
            "y": "0",
            "width": this.width,
            "height": this.height
        });

        /* canvas svg */
        this.canvasSVG = SVG.init(this.canvas, {
            "id": "svgCanvas",
            "width": 100000,
            "height": 100000,
            "x": 0,
            "y": 0
        });

        this.scaleGroupSVG = SVG.addChild(this.canvasSVG, "g", {
            id: 'scaleGroupSVG',
            "transform": "scale(" + this.scale + ")"
        });

        this.temporalLinkSvg = SVG.addChild(this.svg, 'line', {
            'x1': 0,
            'y1': 0,
            'x2': 0,
            'y2': 0,
            'stroke': 'slategray',
            'opacity': '1',
            'stroke-width': 2,
            'cursor': 'pointer'
        }, 0);
//
        this.selectAnimate = SVG.create('animate', {
            attributeType: 'XML',
            attributeName: 'opacity',
            from: '1',
            to: '0.6',
            dur: '2s',
            repeatCount: 'indefinite'
        });

        this.selectRect = SVG.addChild(this.svg, "rect", {
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "stroke-width": "2",
            "stroke": "deepskyblue",
            "opacity": "0.5",
            "fill": "honeydew"
        });


        $(this.svg).bind('mousedown.networkViewer', function (event) {
            event.preventDefault();
            switch (event.which) {
                case 1: //left click
                    _this.leftMouseDown(event);
                    break;
            }
        });
        $(this.svg).bind('mouseup.networkViewer', function (event) {
            switch (event.which) {
                case 1: //left click
                    _this.leftMouseUp(event);
                    break;
            }
        });
        $(this.svg).bind('contextmenu.networkViewer', function (event) {
            event.preventDefault();
            switch (event.which) {
                case 3: //right click
                    _this.contextMenu(event);
                    break;
            }

        });
        $(this.svg).bind('mouseleave.networkViewer', function (event) {

        });


    },
    draw: function () {
        $(this.scaleGroupSVG).empty();
        this.network.draw(this.scaleGroupSVG);
    },
    /*  */
    setMode: function (mode) {
        this.mode = mode;
        switch (mode) {
            case "add":
//                $(this.div).addClass("cursor-test");
                this.svg.setAttribute("cursor", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABAhJREFUWMPVlW1Mm1UUx//tU14GyHTigI7SQcvYIkEJ06mouERMli3zA35YyFA/mKwkW6RjrJolJE0UI0RiRiRRE8I2MjKzgsmUlL2Q+cI2RgTWkTBkrAFXWiqU0tJCe8956ieJM3Ey00I8H885957f/d97zgXW2wYGBurWs76Smc19fX3mdQMgIqSlpdX19vZ+tF4KIDs7G+np6Se6u7s/WRcFAECtVkOtVn/Q1dXVsOYAzAxmhkajQVZWVm1HR0fDmgLIsgwiQjgchlarhVarrW1tbf1szQGEEFheXkZOTg50Ot3RlpaWz9cM4M9rkGUZAKDT6ZCXl/d+U1NTc8wBVCoVVCoVJEmCJEno7OwMWCyWX2w2W1gIcbi+vj5mEEohBBwOB6xWa8jj8SA5ORlElERE+2pqahJMJpNCCHG8rq5uQywAFG1tbREichHRm0R0rqysbKvL5cKNGzdOmUymd9fiDdwkol0Gg+EmERlHRkZQVFQEIUSl2WzeGHMAIcRrBoNhCgCqq6u/HR8fd83MzKC4uFhJRMaYA1RVVS391SGEOD40NAS9Xg8iOlpbWxsfSwDV3x1EdM5ms306ODg4zczfNzY2hmMJoPgvixovHdOxzBXE/DYxZZDMEEwuYj4tmM6ePNA+ETOAxks15cRys2azLjM/4xlsiEtBWA7DvTiN63d74Z793UlER75+57xlNftJj16cT+3Ul24q0pTAtezExOIYnEv3IakkFGbtgp/mHnPNufcW7NOP3b7w62jUFGi4WJPLMv/0bO5L6rz0QvzgvIhgIAgRISQmJiCCCEJyCDtSC3Bt7DLG7BPTguiVrsOX7z20C1YLwDIffHzjU+qtadvxs+sKlsQygmIJxuITqHr6GLyheXgWXLjuvIoXtu2GIp7Vgungv7bhagGIuVK7OR93FkYw65uFL+iDNzC/EnfYpyBCAQT8c7jvs6MkvwSCqfKR2/CfTDBtSYxLwqTfjrAcwofPf/xA/IvydgCAsacCDu89FDy5E4JpSxQVIASEH/6wD0ISD82NsAwFIhBMiKYCDsf8pD4lIQXeJQ+MP76HgNuHr976ZuXkAKBUKKFOzcaU2w5ickRNAcF0Ztjej+ykHERECAombHoi+YEcmSNQygpoUnPQfesKBNOZaCrQLoelQ/13r6pfzH0dfZNWkEww9lQgwgAQQbxSQmnuHliHv8OCf3GamNujNogGLCPzhfu3TXq83r0LIXf8q7o3oFLGIRQOIl4ZB13adhRmPAfrrQvoH70dIJkPDZtHr0V9FB/4ck+5YGpmiTJLd7yM9NRMIAL8Nj+FnqFe+BaDTpL5yLB51BKzz2j/yd06wVQhVj4jgmB2EfNplunssPnOBP4v9gezhEi+VkBYbwAAAABJRU5ErkJggg==), auto");
                break;

            case "join":
                this.svg.setAttribute("cursor", "url(data:image/png;base64,), auto");
                break;

            case "delete":
                this.svg.setAttribute("cursor", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA85JREFUWMPVlV1IpFUYx//ved/R+Z7WprUmddZGiZgN1rwoiCiXLIhi79o+2LK6aIyl9SOdIBCEMFrLFgKjC8WuZAO1K/Gi3KgsWVkEeQ1CSFv3dWYKJ9cdnXfnec55u1g2+sR1m1F6Ls+B5//j//zPc4D9rrm5uZ791BdSyt6ZmZnefQNgZoTD4Z7p6em398sB1NTUoLKy8q3Jycl39sUBAIhEIohEIm9OTEyc3nMAKSWklKiurkZVVVXX6Ojo6T0FUEqBmVEoFBCNRhGNRruGh4ff33MAIoJt26itrUUsFusYHBw8s2cA18eglAIAxGIx1NfXnxoYGPiw5ACGYcAwDOi6Dl3XMT4+vjU2NnZhYWGhQEQn+/r6SgYhiAiWZWFqaupqNpuFz+cDM3uZ+cnOzs7yZDKpEVF3T0+PpxQA2sjIiMPMaWY+xsxnm5ubD6XTaczOzn6STCZb9iID55n5/kQicZ6Z203TRENDA4joRG9vb6jkAET0SCKRuAgAbW1tny0tLaUzmQwaGxsFM7eXHKC1tTX/xwMi6p6fn0ddXR2YuaOrq6uspAB/PWDmswsLC6mhoaELzPxBf39/YbdN7ZZXvDccwt02d95IRgH4tffeXfxH8RdfjjtMjyried+no1/t2oEdxXV9xRHClKc64n8Tf+GlOIQwRSBwRhG9tvnUsXuKBnBdHOXlgNsNCGFS68nfIfInWuLQNFP3+1AWDsMVDB5XBXose7RZFGUETme321FqCx6P0AIBqM1NqI0NKDt/WBFDE8IUwQBcwRBs6xKuptJSEXkqzn1ORcuAfL3d7UiZ0zweXQRDkJc3wL9m4RBDDwTgCgVhX7Jgp9PSYfJXnPvCLnoI6dVWt2KZE16vbhy4BZAKUApQErZlwU5nrol/OW3f1DPcqVwff2Q7RH5aX1cgCaysAMvLgJSwU2mlqHDD4jcFAACKKKZpEJAMEAHMADM0XQhVoNh/WkQ71fYzz8ehwdQ9XoAJiESAyB0AM8pDIeiGbqaP3BcvySLaOv5cXBOaaXh9cAWDyKfWYGcyUhFp7gMVwhe5HdupNLbX1lC4kjt85w/fLxbNga2nn41rmmYaHi9cAR/y1rW0qwL5HSLflmXJKz8uwxu+FZ5wGEaZy1w9dNeOThi7mPtB4TIARyFvpZD/OSMdYn/4269tAEjde8Sfs6ycUyjoLp8PmhBwpDwIYLFoI9h4/Ikm4XJN0+ZlpYh9t333zZ/SbtXf7XakzJUFArqdzR6tWf3pXNG/z/WHHm765YEH3f92vxqtdV+sqmnC/6V+A4wb/YzHvgVzAAAAAElFTkSuQmCC), auto");
                break;

            default:
                this.svg.setAttribute("cursor", "default");
                break;
        }
        console.log(this.mode)
    },
    leftMouseDown: function (event) {
        var _this = this;
        var targetEl = event.target;
        var targetElNetworkType = $(targetEl).attr('network-type');
        switch (this.mode) {
            case "add":
                /* event coordinates */
                var downX = (event.clientX - $(this.svg).offset().left);
                var downY = (event.clientY - $(this.svg).offset().top);
                if ($(targetEl).attr('network-type') !== 'vertex') {
                    this.createVertex(downX, downY);
                }
                break;
            case "select":
                var downX = (event.clientX - $(_this.svg).offset().left);
                var downY = (event.clientY - $(_this.svg).offset().top);

                switch (targetElNetworkType) {
                    case 'vertex':
                        var vertexId = $(targetEl).parent().parent().attr('id');
                        var vertex = _this.network.getVertexById(vertexId);

                        var isSelected = this.network.isVertexSelected(vertex);
                        if (!isSelected) {
                            this.selectVertex(vertex);
                        }

                        var lastX = downX;
                        var lastY = downY;
                        $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                            moveEvent.preventDefault();
                            var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                            var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                            var dispX = moveX - lastX;
                            var dispY = moveY - lastY;

                            _this._moveSelectedVertices(dispX, dispY);

                            lastX = moveX;
                            lastY = moveY;
                        });
                        break;
                    case 'edge':


                        break;
                    default:
                        /* background clicked */
                        var lastX = 0, lastY = 0;
                        $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                            moveEvent.preventDefault();
                            var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                            var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                            var dispX = moveX - downX;
                            var dispY = moveY - downY;
                            var x = (dispX >= 0) ? downX : downX - Math.abs(dispX);
                            var y = (dispY >= 0) ? downY : downY - Math.abs(dispY);
                            // Update selectRect size and position
                            _this.selectRect.setAttribute('x', x);
                            _this.selectRect.setAttribute('y', y);
                            _this.selectRect.setAttribute('width', Math.abs(dispX));
                            _this.selectRect.setAttribute('height', Math.abs(dispY));
                        });
                }

                break;
            case "join":
                /* vertex clicked */
                if ($(targetEl).attr('network-type') === 'vertex') {
                    var vertexId = $(targetEl).parent().parent().attr('id');
                    var vertex = _this.network.getVertexById(vertexId);
                    var vertexConfig = _this.network.getVertexConfig(vertex);
                    // first time vertex click
                    if (_this.joinSourceVertex == null) {
                        _this.joinSourceVertex = vertex;
                        $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                            moveEvent.preventDefault();
                            var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                            var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                            _this.temporalLinkSvg.setAttribute('x1', vertexConfig.coords.x);
                            _this.temporalLinkSvg.setAttribute('y1', vertexConfig.coords.y);
                            _this.temporalLinkSvg.setAttribute('x2', moveX);
                            _this.temporalLinkSvg.setAttribute('y2', moveY);
                        });
                        // second vertex click
                    } else if (_this.joinSourceVertex !== vertex) {
                        _this.createEdge(_this.joinSourceVertex, vertex);
                        _this.joinSourceVertex = null;
                    }
                }
                break;
            case "delete":
                if ($(targetEl).attr('network-type') === 'vertex') {
                    var vertexId = $(targetEl).parent().parent().attr('id');
                    var vertex = _this.network.getVertexById(vertexId);
                    this.removeVertex(vertex);
                }
                break;
        }
    },
    leftMouseUp: function (event) {
        var _this = this;
        var targetEl = event.target;
        var targetElNetworkType = $(targetEl).attr('network-type');
        switch (this.mode) {
            case "add":
                $(_this.svg).off('mousemove.networkViewer');
                break;
            case "select":

                switch (targetElNetworkType) {
                    case 'vertex':
                        var vertexId = $(targetEl).parent().parent().attr('id');
                        var vertex = this.network.getVertexById(vertexId);
//                        this.network.getVertexAttributes(vertex, function (attributes) {
                        _this.trigger('vertex:leftClick', {
                            vertex: vertex,
                            vertexConfig: _this.network.getVertexConfig(vertex)
//                                attributes: attributes
                        });
//                        });
                        break;
                    case 'edge':
                    case 'edge-label':
                        var edgeId = $(targetEl).parent().attr('id');
                        var edge = this.network.getEdgeById(edgeId);
                        var edgeConfig = this.network.getEdgeConfig(edge);

                        var isSelected = this.network.isEdgeSelected(edge);
                        if (!isSelected) {
                            this.selectEdge(edge);
                        }

                        this.trigger('edge:leftClick', {
                            edge: edge,
                            edgeConfig: edgeConfig
                        });
                        break;
                    default:
                        var x = parseFloat(_this.selectRect.getAttribute('x'));
                        var y = parseFloat(_this.selectRect.getAttribute('y'));
                        var width = parseFloat(_this.selectRect.getAttribute('width'));
                        var height = parseFloat(_this.selectRect.getAttribute('height'));

                        _this._deselectAllEdges();
                        _this.selectVerticesByArea(x, y, width, height);

                        _this.selectRect.setAttribute('x', 0);
                        _this.selectRect.setAttribute('y', 0);
                        _this.selectRect.setAttribute('width', 0);
                        _this.selectRect.setAttribute('height', 0);
                }
                $(_this.svg).off('mousemove.networkViewer');
                break;
            case "join":
                if ($(targetEl).attr('network-type') !== 'vertex') {
                    _this.joinSourceVertex = null;
                }
                if (_this.joinSourceVertex == null) {
                    $(_this.svg).off('mousemove.networkViewer');
                    _this.temporalLinkSvg.setAttribute('x1', 0);
                    _this.temporalLinkSvg.setAttribute('y1', 0);
                    _this.temporalLinkSvg.setAttribute('x2', 0);
                    _this.temporalLinkSvg.setAttribute('y2', 0);
                }
                break;
            case "delete":
                if ($(targetEl).attr('network-type') !== 'vertex') {

                }
                break;
        }
    },
    contextMenu: function (event) {
        var _this = this;
        var targetEl = event.target;
        var targetElNetworkType = $(targetEl).attr('network-type');
        switch (this.mode) {
            case "add":
                break;
            case "select":
                break;
            case "join":
                break;
            case "delete":
                break;
        }

        var downX = (event.clientX - $(this.svg).offset().left);
        var downY = (event.clientY - $(this.svg).offset().top);
        if (targetElNetworkType === 'vertex') {
            var vertexId = $(targetEl).parent().parent().attr('id');
            var vertex = _this.network.getVertexById(vertexId);
//            _this.network.getVertexAttributes(vertex, function (attributes) {
                _this.trigger('vertex:rightClick', {
                    vertex: vertex,
//                    attributes: attributes,
                    x: downX,
                    y: downY
                });
//            });

        }
    },
    selectVerticesByIds:function(vertexIds){
        this._deselectAllVertices();
        this.selectedVertices = this.network.selectVerticesByIds(vertexIds);
    },
    selectVertex: function (vertex) {
        this._deselectAllVertices();
        this.network.selectVertex(vertex);

        this.selectedVertices = [vertex];
    },
    selectEdge: function (edge) {
        this._deselectAllEdges();
        this.network.selectEdge(edge);

        this.selectedEdges = [edge];
    },
    selectVerticesByArea: function (x, y, width, height) {
        this._deselectAllVertices();
        this.selectedVertices = this.network.selectVerticesByArea(x, y, width, height);
    },
    selectAllVertices: function () {
        this._deselectAllEdges();
        this.selectedVertices = this.network.selectAllVertices();
    },
    selectAllEdges: function () {
        this._deselectAllVertices();
        this.selectedEdges = this.network.selectAllEdges();
    },
    selectAll: function () {
        this.selectedVertices = this.network.selectAllVertices();
        this.selectedEdges = this.network.selectAllEdges();
    },
    _deselectAllVertices: function () {
        this.selectedVertices = [];
        this.network.deselectAllVertices();
    },
    _deselectAllEdges: function () {
        this.selectedEdges = [];
        this.network.deselectAllEdges();
    },
    _moveSelectedVertices: function (dispX, dispY) {
        for (var i = 0, li = this.selectedVertices.length; i < li; i++) {
            var vertex = this.selectedVertices[i];
            this.network.moveVertex(vertex, dispX, dispY);
        }
    },
    setVertexCoords: function (vertexId, x, y) {
        var vertex = this.network.getVertexById(vertexId);
        this.network.setVertexCoords(vertex, x, y);
    },

    createVertex: function (x, y) {

        /* vertex graph */
        var vertex = new Vertex({
            name: 'node'+this.createdVertexCount
        });

        /* vertex config */
        var vertexConfig = new VertexConfig({
            coords: {x: x, y: y},
            renderer: new DefaultVertexRenderer({})
//            renderer: new CircosVertexRenderer({})
        });

        //update variables
        this.createdVertexCount++;
        this.network.addVertex({
            vertex: vertex,
            vertexConfig: vertexConfig,
            target: this.scaleGroupSVG
        });

        return vertex;
    },
    createEdge: function (vertexSource, vertexTarget) {
        /* edge graph */
        var edge = new Edge({
            source: vertexSource,
            target: vertexTarget
        });

        var edgeConfig = new EdgeConfig({
            renderer: new DefaultEdgeRenderer({

            })
        });

        this.network.addEdge({
            edge: edge,
            edgeConfig: edgeConfig,
            target: this.scaleGroupSVG
        });
    },

    removeVertex: function (vertex) {
        this.network.removeVertex(vertex);
    },
    setSelectedVerticesDisplayAttr: function (displayAttr, value) {
        for (var i = 0, li = this.selectedVertices.length; i < li; i++) {
            var vertex = this.selectedVertices[i];
            if (typeof vertex !== 'undefined') {
                this.network.setVertexRendererAttribute(vertex, displayAttr, value);
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
    setVertexName: function (name) {
        if (this.selectedVertices.length == 1) {
            var vertex = this.selectedVertices[0];
            this.network.setVertexName(vertex, name);
        }
    },
    setEdgeName: function (name) {
        if (this.selectedEdges.length == 1) {
            var edge = this.selectedEdges[0];
            this.network.setEdgeName(edge, name);
        }
    },
    getSvgEl: function () {
        return  this.canvas;
    }
};

