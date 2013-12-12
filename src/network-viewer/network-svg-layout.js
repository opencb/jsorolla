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

    this.countSelectedNodes = 0;
    this.countSelectedEdges = 0;
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
    this.createdNodesCount = 0;
    this.network = new Network();

    /* default vertex display */
    this.defaultVertexDisplay = {
        shape: 'circle',
        size: 40,
        color: 'orange',
        strokeSize: 2,
        strokeColor: 'black',
        opacity: 1,
        labelSize: 12,
        labelColor: 'slateGray',
        labelPositionX: 5,
        labelPositionY: 50
    };

    /* join vertex click flag */
    this.joinSourceVertex = null;

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


        this.mouseDownFlag = false;
        $(this.svg).bind('mousedown.networkViewer', function (event) {
            event.preventDefault();
            _this.mouseDownFlag = true;
            _this.mouseDown(event);
        });
        $(this.svg).bind('mouseup.networkViewer', function (event) {
            $(_this.svg).off('mousemove');
        });
//        $(this.svg).bind('mouseup.networkViewer', function (event) {
////            console.log(event.target);
////            if (!event.target.getAttribute("shape") && !event.target.getAttribute("type") && event.originalEvent.button !== 2) {
////                _this.canvasMouseUp(event);
////                if (_this.mode == "select") mouseDown = false;
////            }
//        });
//
//        $(this.svg).bind('mouseleave.networkViewer', function (event) {
//            if (_this.mode == "select") {
//                $(_this.svg).off('mousemove');
//            }
//        });


        if (this.parentNetwork) {
            this.parentNetwork.on('selection:change', function (e) {
                _this.selectNodes(e);
            });
            this.parentNetwork.on('node:move', function (e) {
                _this.moveNode(e.nodeId, e.x, e.y);
            });
            this.parentNetwork.on('change', function (e) {
                _this.refresh();
                _this.placeLabelsAndEdges();
                _this.setOverviewRectSize(_this.zoom);
            });

            this.overviewDivWidth = $(this.targetId).width();
            this.overviewDivHeight = $(this.targetId).height();


            SVG.addChild(this.svg, "rect", {
                "width": "100%",
                "height": "100%",
                "opacity": "0"
            });

            this.overviewRect = SVG.addChild(this.svg, "rect", {
                "width": "100%",
                "height": "100%",
                "fill": "blue",
                "fill-opacity": "0.1",
                "cursor": "pointer",
                "stroke": "red",
                "stroke-width": "4",
                "stroke-opacity": "0.6",
                "transform": "scale(1)",
                "x": -this.parentNetwork.canvasOffsetX * this.scale,
                "y": -this.parentNetwork.canvasOffsetY * this.scale
            });

            $(this.overviewRect).mousedown(function (event) {
                $(_this.svg).off('mousedown');
                _this.moveOverviewRect(event);
            });

            $(this.overviewRect).mouseup(function (event) {
                $(_this.svg).off('mouseup');
                $(_this.svg).off('mousemove');
            });
        }


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
    },
    mouseDown: function (event) {
        var _this = this;
        var targetEl = event.target;
        switch (this.mode) {
            case "add":
                if ($(targetEl).attr('network-type') !== 'vertex') {
                    this.createNode(event);
                }
                break;
            case "select":
                var downX = (event.clientX - $(_this.svg).offset().left);
                var downY = (event.clientY - $(_this.svg).offset().top);
                /* vertex clicked */
                if ($(targetEl).attr('network-type') === 'vertex') {
                    var vertexId = $(targetEl).parent().attr('id');
                    var vertexSvg = $(targetEl).parent()[0];
                    var vertexDisplay = _this.network.networkConfig.displayVertices[vertexId];
                    var vertexLayout = _this.network.networkConfig.layout[vertexId];
                    $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                        moveEvent.preventDefault();
                        var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                        var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                        var dispX = moveX - downX;
                        var dispY = moveY - downY;
                        var currentX = parseFloat(vertexSvg.getAttribute('x'));
                        var currentY = parseFloat(vertexSvg.getAttribute('y'));
                        vertexSvg.setAttribute('x', currentX + dispX);
                        vertexSvg.setAttribute('y', currentY + dispY);

                        // Calculate center x and y and update vertexLayout
                        var midOffset = (vertexDisplay.size + vertexDisplay.strokeSize) / 2;
                        vertexLayout.x = currentX + dispX + midOffset;
                        vertexLayout.y = currentY + dispY + midOffset;

                        downX = moveX;
                        downY = moveY;
                    });
                }
                break;
            case "join":
                var downX = (event.clientX - $(_this.svg).offset().left);
                var downY = (event.clientY - $(_this.svg).offset().top);
                /* vertex clicked */
                if ($(targetEl).attr('network-type') === 'vertex') {
                    var vertexId = $(targetEl).parent().attr('id');
                    var vertexSvg = $(targetEl).parent()[0];
                    var vertex = _this.network.getVertexById(vertexId);
                    // first time node click
                    if(_this.joinSourceVertex == null){
                        _this.joinSourceVertex = vertex;
                    }else{
                       _this.createEdge(_this.joinSourceVertex,vertex);
                        _this.joinSourceVertex = null;
                    }
                }
                break;
        }
    },
    createNode: function (event) {
        var nodeName = this.createdNodesCount;

        /* event coordinates */
        var offsetX = (event.clientX - $(this.svg).offset().left);
        var offsetY = (event.clientY - $(this.svg).offset().top);

        /* vertex graph */
        var vertex = new Vertex({
            name: this.createdNodesCount
        });

        /* vertex display */
        var vertexDisplay = {
            id: vertex.id
        }
        _.extend(vertexDisplay, this.defaultVertexDisplay);

        /* vertex layout */
//        var midOffset = (vertexDisplay.size + vertexDisplay.strokeSize) / 2;
//        var coords = {x: offsetX - midOffset, y: offsetY - midOffset};
        var coords = {x: offsetX, y: offsetY};
        var vertexLayout = {
            id: vertex.id
        };
        _.extend(vertexLayout, coords);


        //update variables
        this.createdNodesCount++;
        this.network.addVertex({
            vertexLayout: vertexLayout,
            vertexDisplay: vertexDisplay,
            vertex: vertex
        });
        this.drawNode({
            vertexLayout: vertexLayout,
            vertexDisplay: vertexDisplay,
            vertex: vertex
        });
        this.trigger('node:add', {vertex: vertex, sender: this});
    },
    drawNode: function (args) {

        var midOffset = (args.vertexDisplay.size + args.vertexDisplay.strokeSize) / 2;

        var nodeSvg = SVG.addChild(this.scaleGroupSVG, "svg", {
            "id": args.vertex.id,
            "cursor": "pointer",
            x: args.vertexLayout.x - midOffset,
            y: args.vertexLayout.y - midOffset
        });
        var node = SVG.addChild(nodeSvg, 'circle', {
            cx: midOffset,
            cy: midOffset,
            r: args.vertexDisplay.size / 2,
            stroke: args.vertexDisplay.strokeColor,
            'stroke-width': args.vertexDisplay.strokeSize,
            fill: args.vertexDisplay.color,
            'network-type': 'vertex'
        });

        var nodeText = SVG.addChild(nodeSvg, "text", {
            "x": args.vertexDisplay.labelPositionX,
            "y": args.vertexDisplay.labelPositionY,
            "font-size": args.vertexDisplay.labelSize,
            "fill": args.vertexDisplay.labelColor,
            'network-type': 'vertexLabel'
        });
        nodeText.textContent = args.vertex.name;
    },
    createEdge: function (vertexSource, vertexTarget) {
        //todo
    },
    drawGraph: function () {
        $(this.scaleGroupSVG).empty();

        /* nodes */
        for (var i = 0; i < this.network.graph.vertices.length; i++) {
            var vertex = this.network.graph.vertices[i];
            this.drawNode({
                vertexLayout: this.network.getVertexLayout(vertex),
                vertexDisplay: this.network.getVertexDisplay(vertex),
                vertex: vertex
            });
        }
    }
};

