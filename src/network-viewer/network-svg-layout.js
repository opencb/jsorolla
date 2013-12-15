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


    //set instantiation args, must be last
    _.extend(this, args);

    /** Action mode **/
    this.mode = "select"; // Valid values: select, add, delete, join


    /** *** *** **/
    this.createdVertexCount = 0;
    this.network = new Network();

    /* default vertex display */
    this.defaultVertexDisplay = {
        shape: 'circle',
        size: 35,
        color: '#cccccc',
        strokeSize: 1,
        strokeColor: '#888888',
        opacity: 1,
        labelSize: 12,
        labelColor: '#111111',
        labelPositionX: 5,
        labelPositionY: 45
    };

    /* default edge display */
    this.defaultEdgeDisplay = {
        shape: 'directed',
        size: 2,
        color: '#cccccc',
        strokeSize: 2,
        strokeColor: '#888888',
        opacity: 1,
        labelSize: 12,
        labelColor: '#111111',
        labelPositionX: 5,
        labelPositionY: 50
    };

    /* join vertex click flag */
    this.joinSourceVertex = null;

    this.selectedVertices = [];
    this.selectedVerticesHash = {};

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};


NetworkSvgLayout.prototype = {
    render: function (targetId) {
        var _this = this;
        if (targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }


        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '"></div>')[0];
        $(this.targetDiv).append(this.div);

        /** SVG init **/
        this.svg = SVG.init(this.div, {
            "id": "mainSVG",
            "width": this.width,
            "height": this.height
        });
        this.defs = SVG.addChild(this.svg, "defs", {});

        /* background */
        this.backgroundSvg = SVG.init(this.svg, {
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
        this.canvasSVG = SVG.init(this.svg, {
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

        this.temporalLinkSvg = SVG.addChild(this.canvasSVG, 'line', {
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

        this.selectRect = SVG.addChild(this.canvasSVG, "rect", {
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
            _this.mouseUp(event);
        });
        $(this.svg).bind('contextmenu.networkViewer', function (event) {
            event.preventDefault();
            switch (event.which) {
                case 3: //right click
                    _this.contextMenu(event);
                    break;
            }

        });


    },
    draw: function () {

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
                /* vertex clicked */
                if ($(targetEl).attr('network-type') === 'vertex') {

                    var vertexSvg = $(targetEl).parent().parent();
                    var isSelected = $(vertexSvg).find('circle[network-type="select-vertex"]').length > 0 ? true : false;
                    if (!isSelected) {
                        _this.selectVertexByClick(vertexSvg);
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


                    /* background clicked*/
                } else {
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
                    var vertexLayout = _this.network.getVertexLayout(vertex);
                    // first time vertex click
                    if (_this.joinSourceVertex == null) {
                        _this.joinSourceVertex = vertex;
                        $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                            moveEvent.preventDefault();
                            var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                            var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                            _this.temporalLinkSvg.setAttribute('x1', vertexLayout.x);
                            _this.temporalLinkSvg.setAttribute('y1', vertexLayout.y);
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
    mouseUp: function (event) {
        var _this = this;
        var targetEl = event.target;
        switch (this.mode) {
            case "add":
                $(_this.svg).off('mousemove.networkViewer');
                break;
            case "select":
                if ($(targetEl).attr('network-type') !== 'vertex') {
                    var x = parseFloat(_this.selectRect.getAttribute('x'));
                    var y = parseFloat(_this.selectRect.getAttribute('y'));
                    var width = parseFloat(_this.selectRect.getAttribute('width'));
                    var height = parseFloat(_this.selectRect.getAttribute('height'));

                    _this.selectVerticesByCoords(x, y, width, height);

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
        if ($(targetEl).attr('network-type') === 'vertex') {
            var vertexId = $(targetEl).parent().parent().attr('id');
            var vertex = _this.network.getVertexById(vertexId);
            _this.network.getVertexAttributes(vertex, function (attributes) {
                _this.trigger('vertex:rightClick', {
                    vertex: vertex,
                    attributes: attributes,
                    x: downX,
                    y: downY
                });
            });

        }
    },
    selectVertexByClick: function (vertexSvg) {
        this._deselectAllVertices();
        var vertexId = $(vertexSvg).attr('id');
        var vertex = this.network.getVertexById(vertexId);
        this._selectVertexSvg(vertex, vertexSvg);
        this.selectedVertices = [vertex];
        this.selectedVerticesHash[vertex.id] = vertex;
    },
    selectVerticesByCoords: function (x, y, width, height) {
        this._deselectAllVertices();
        var vertices = this.network.graph.vertices;
        this.selectedVertices = [];
        this.selectedVerticesHash = {};
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexSvg = $(this.svg).find('svg[id="' + vertex.id + '"]')[0];
                var vertexLayout = this.network.getVertexLayout(vertex);
                if (vertexLayout.x >= x && vertexLayout.x <= x + width && vertexLayout.y >= y && vertexLayout.y <= y + height) {
                    this.selectedVertices.push(vertex);
                    this.selectedVerticesHash[vertex.id] = vertex;
                    this._selectVertexSvg(vertex, vertexSvg);
                }
            }
        }
    },
    _selectVertexSvg: function (vertex, vertexSvg) {
        var vertexDisplay = this.network.getVertexDisplay(vertex);
        var vertexGroup = $(vertexSvg).children().first()[0];

        var size = vertexDisplay.size + vertexDisplay.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var r = SVG.addChild(vertexGroup, "circle", {
            r: midOffset,
            cx: midOffset,
            cy: midOffset,
            opacity: '0.5',
            fill: '#cccccc',
            'network-type': 'select-vertex'
        }, 0);
    },
    _deselectAllVertices: function () {
        this.selectedVertices = [];
        this.selectedVerticesHash = {};
        $(this.svg).find('circle[network-type="select-vertex"]').remove();
    },
    _moveSelectedVertices: function (dispX, dispY) {
        for (var i = 0, li = this.selectedVertices.length; i < li; i++) {
            var vertex = this.selectedVertices[i];
            var vertexSvg = $(this.svg).find('svg[id="' + vertex.id + '"]')[0];
            var vertexLayout = this.network.getVertexLayout(vertex);
            var vertexDisplay = this.network.getVertexDisplay(vertex);

            var currentX = parseFloat(vertexSvg.getAttribute('x'));
            var currentY = parseFloat(vertexSvg.getAttribute('y'));
            vertexSvg.setAttribute('x', currentX + dispX);
            vertexSvg.setAttribute('y', currentY + dispY);

            // Calculate center x and y and update vertexLayout
            var size = vertexDisplay.size + vertexDisplay.strokeSize;
            var size = size + (size * 0.3);
            var midOffset = size / 2;

            vertexLayout.x = currentX + dispX + midOffset;
            vertexLayout.y = currentY + dispY + midOffset;


            // Update edge position
            for (var j = 0; j < vertex.edges.length; j++) {
                var edge = vertex.edges[j];
                var sourceLayout = this.network.getVertexLayout(edge.source);
                var targetLayout = this.network.getVertexLayout(edge.target);

                var sourceIsSelected = typeof this.selectedVerticesHash[edge.source.id] !== 'undefined';
                var targeIsSelected = typeof this.selectedVerticesHash[edge.target.id] !== 'undefined';
                var linkSvg = $(this.scaleGroupSVG).find('#' + edge.id)[0];

                if (sourceIsSelected && vertex === edge.source) {
                    linkSvg.setAttribute('x1', sourceLayout.x);
                    linkSvg.setAttribute('y1', sourceLayout.y);
                }
                if (targeIsSelected && vertex === edge.target) {
                    linkSvg.setAttribute('x2', targetLayout.x);
                    linkSvg.setAttribute('y2', targetLayout.y);
                }
            }
        }
    },

    createVertex: function (x, y) {

        /* vertex graph */
        var vertex = new Vertex({
            name: this.createdVertexCount
        });

        /* vertex display */
        var vertexDisplay = {
            id: vertex.id
        }
        _.extend(vertexDisplay, this.defaultVertexDisplay);

        /* vertex layout */
        var coords = {x: x, y: y};
        var vertexLayout = {
            id: vertex.id
        };
        _.extend(vertexLayout, coords);


        //update variables
        this.createdVertexCount++;
        this.network.addVertex({
            vertexLayout: vertexLayout,
            vertexDisplay: vertexDisplay,
            vertex: vertex
        });
        this.drawVertex({
            vertexLayout: vertexLayout,
            vertexDisplay: vertexDisplay,
            vertex: vertex
        });
        this.trigger('vertex:add', {vertex: vertex, sender: this});
    },
    drawVertex: function (args) {

        var size = args.vertexDisplay.size + args.vertexDisplay.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var vertexSvg = SVG.create("svg", {
            "id": args.vertex.id,
            "cursor": "pointer",
            x: args.vertexLayout.x - midOffset,
            y: args.vertexLayout.y - midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g');
        var vertex = SVG.addChild(groupSvg, 'circle', {
            cx: midOffset,
            cy: midOffset,
            r: args.vertexDisplay.size / 2,
            stroke: args.vertexDisplay.strokeColor,
            'stroke-width': args.vertexDisplay.strokeSize,
            fill: args.vertexDisplay.color,
            'network-type': 'vertex'
        });

        var vertexText = SVG.addChild(vertexSvg, "text", {
            "x": args.vertexDisplay.labelPositionX,
            "y": args.vertexDisplay.labelPositionY + (size * 0.3),
            "font-size": args.vertexDisplay.labelSize,
            "fill": args.vertexDisplay.labelColor,
            'network-type': 'vertexLabel'
        });
        vertexText.textContent = args.vertex.name;
        this.scaleGroupSVG.appendChild(vertexSvg);
    },
    createEdge: function (vertexSource, vertexTarget) {
        /* edge graph */
        var edge = new Edge({
            source: vertexSource,
            target: vertexTarget
        });

        /* edge display */
        var edgeDisplay = {
            id: edge.id
        }
        _.extend(edgeDisplay, this.defaultEdgeDisplay);

        this.network.addEdge({
            edgeDisplay: edgeDisplay,
            edge: edge
        });
        this.drawEdge({
            edgeDisplay: edgeDisplay,
            edge: edge
        });
        this.trigger('link:add', {edge: edge, sender: this});
    },
    drawEdge: function (args) {
        var sourceLayout = this.network.getVertexLayout(args.edge.source);
        var targetLayout = this.network.getVertexLayout(args.edge.target);
        var targetDisplay = this.network.getVertexDisplay(args.edge.target);


        var offset = (targetDisplay.size / 2 + targetDisplay.strokeSize / 2);
        // if not exists this marker, add new one to defs
        var markerArrowId = "#arrow-" + args.edgeDisplay.shape + "-" + offset + '-' + args.edgeDisplay.color;
        if ($(markerArrowId).length == 0) {
            this.addArrowShape(args.edgeDisplay.shape, offset, args.edgeDisplay.color, args.edgeDisplay.size);
        }
        var linkSvg = SVG.addChild(this.scaleGroupSVG, "line", {
            "id": args.edge.id,
            "x1": sourceLayout.x,
            "y1": sourceLayout.y,
            "x2": targetLayout.x,
            "y2": targetLayout.y,
            "stroke": args.edgeDisplay.color,
            "stroke-width": args.edgeDisplay.size,
            "cursor": "pointer",
            "marker-end": "url(" + markerArrowId + ")",
            'network-type': 'edge'
        }, 0);
    },

    removeVertex: function (vertex) {
        var vertexSvg = $(this.svg).find('svg[id="' + vertex.id + '"]')[0];
        $(vertexSvg).remove();

        for (var i = 0; i < vertex.edges.length; i++) {
            var edge = vertex.edges[i];
            this.removeEdge(edge);
        }
        this.network.removeVertex(vertex);

    },
    removeEdge: function (edge) {
        var edgeSvg = $(this.scaleGroupSVG).find('#' + edge.id)[0];
        $(edgeSvg).remove();
    },
    setSelectedVerticesDisplayAttr: function (displayAttr, value) {
        for (var i = 0, li = this.selectedVertices.length; i < li; i++) {
            var vertex = this.selectedVertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexSvg = $(this.svg).find('svg[id="' + vertex.id + '"]')[0];
                var isSelected = $(vertexSvg).find('circle[network-type="select-vertex"]').length > 0 ? true : false;
                $(vertexSvg).remove();
                var vertexLayout = this.network.getVertexLayout(vertex);
                var vertexDisplay = this.network.getVertexDisplay(vertex);
                vertexDisplay[displayAttr] = value;
                this.network.setVertexDisplay(vertexDisplay);
                this.drawVertex({
                    vertexLayout: vertexLayout,
                    vertexDisplay: vertexDisplay,
                    vertex: vertex
                });

                var vertexSvg = $(this.svg).find('svg[id="' + vertex.id + '"]')[0];
                if (isSelected) {
                    this._selectVertexSvg(vertex, vertexSvg);
                }

                for (var j = 0; j < vertex.edges.length; j++) {
                    var edge = vertex.edges[j];
                    if (typeof edge !== 'undefined') {
                        var edgeSvg = $(this.scaleGroupSVG).find('#' + edge.id)[0];
                        $(edgeSvg).remove();
                        this.drawEdge({
                            edgeDisplay: this.network.getEdgeDisplay(edge),
                            edge: edge
                        });
                    }
                }
            }
        }
    },
    drawGraph: function () {
        $(this.scaleGroupSVG).empty();
        /* vertices */
        for (var i = 0; i < this.network.graph.vertices.length; i++) {
            var vertex = this.network.graph.vertices[i];
            if (typeof vertex !== 'undefined') {
                this.drawVertex({
                    vertexLayout: this.network.getVertexLayout(vertex),
                    vertexDisplay: this.network.getVertexDisplay(vertex),
                    vertex: vertex
                });
            }
        }
        /* edges */
        for (var i = 0; i < this.network.graph.edges.length; i++) {
            var edge = this.network.graph.edges[i];
            if (typeof edge !== 'undefined') {
                this.drawEdge({
                    edgeDisplay: this.network.getEdgeDisplay(edge),
                    edge: edge
                });
            }
        }
    },


    /**/
    addArrowShape: function (type, offset, color, edgeSize) {
        var scale = 1 / edgeSize;

        if (typeof color === 'undefined') {
            color = '#000000';
        }
        var id = "arrow-" + type + '-' + offset + '-' + color;
        var marker = SVG.addChild(this.defs, "marker", {
            "id": id,
            "orient": "auto",
            "style": "overflow:visible;"
        });

        switch (type) {
            case "directed":
                var arrow = SVG.addChild(marker, "polyline", {
                    "transform": "scale(" + scale + ") rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": color,
                    "stroke-width": edgeSize,
                    "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
                });
                break;
            case "odirected":
                var arrow = SVG.addChild(marker, "polyline", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
//			"points":"-14,0 -28,-6 -28,6 -14,0"
                    "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
                });
                break;
            case "inhibited":
                var arrow = SVG.addChild(marker, "rect", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "x": -offset - 6,
                    "y": -6,
                    "width": 6,
                    "height": 12
                });
                break;
            case "dot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "cx": -offset - 6,
                    "cy": 0,
                    "r": 6
                });
                break;
            case "odot":
                var arrow = SVG.addChild(marker, "circle", {
                    "transform": "scale(0.5) rotate(0) translate(0,0)",
                    "fill": color,
                    "stroke": "black",
                    "cx": -offset - 6,
                    "cy": 0,
                    "r": 6
                });
                break;
        }
    }
};

