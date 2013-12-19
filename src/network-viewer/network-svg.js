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

function NetworkSvg(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('networkSvg');

    this.countSelectedNodes = 0;
    this.countSelectedEdges = 0;
    this.bgColor = "white";
    this.scale = 1;
    this.zoom = 0;
    this.parentDiv;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;

    this.width;
    this.height;
    this.bgColor;
    this.species;
    this.parentNetwork;
    this.scale;

    this.networkData;

    //set instantiation args, must be last
    _.extend(this, args);


    /** Network Background object **/
    this.networkBackgroundSettings = new NetworkBackgroundSettings(this);

    /** Action mode **/
    this.mode = "select"; // Valid values: select, add, delete, join

    /** Draw default values **/
    this.nodeShape = "circle";
    this.nodeSize = 7;
    this.nodeColor = "#99CCFF";
    this.nodeStrokeColor = "#000000";
    this.nodeStrokeSize = 2;
    this.nodeOpacity = 1;
    this.nodeName = "node0";
    this.nodeLabel = "";
    this.edgeLabel = "";
    this.edgeType = "directed";
    this.edgeColor = "#000000";

    /** Objects Graph **/
    this.nodeSvgList = {};
    this.edgeSvgList = {};
    this.selectedNodes = {};
    this.selectedEdges = {};


    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};


NetworkSvg.prototype = {
    render: function (targetId) {
        var _this = this;
        if (targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }


        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '""></div>')[0];
        $(this.targetDiv).append(this.div);

        /** SVG init **/
        this.svg = SVG.init(this.div, {
            "id": "mainSVG",
            "width": this.width,
            "height": this.height
        });

        var mouseDown = false;
        $(this.svg).bindmousedown(function (event) {
            if (!event.target.getAttribute("shape") && !event.target.getAttribute("type") && event.originalEvent.button !== 2 && !mouseDown) {
                _this.canvasMouseDown(event);
                if (_this.mode == "select") mouseDown = true;
            }
        });
        $(this.svg).mouseup(function (event) {
            if (!event.target.getAttribute("shape") && !event.target.getAttribute("type") && event.originalEvent.button !== 2) {
                _this.canvasMouseUp(event);
                if (_this.mode == "select") mouseDown = false;
            }
        });
        $(this.svg).mouseleave(function (event) {
            if (_this.mode == "select") {
                $(_this.svg).off('mousemove');
            }
        });

        this.initSVG();

        if (this.parentNetwork) {
            this.parentNetwork.on('selection:change',function (e) {
                _this.selectNodes(e);
            });
            this.parentNetwork.on('node:move',function (e) {
                _this.moveNode(e.nodeId, e.x, e.y);
            });
            this.parentNetwork.on('change',function (e) {
                _this.refresh();
                _this.placeLabelsAndEdges();
                _this.setOverviewRectSize(_this.zoom);
            });

            this.overviewDivWidth = $(this.targetId).width();
            this.overviewDivHeight = $(this.targetId).height();
        }


    },
    draw: function () {

    }
};



NetworkSvg.prototype.refresh = function (networkData) {
    var _this = this;

    // Deselect all nodes and edges
    this.deselectAllNodes();
    this.deselectAllEdges();

    if (networkData != null) {
        this.networkData = networkData;
    }

    this.nodeSvgList = {};
    this.edgeSvgList = {};

    // Empty SVG and set background
    while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
    }

    this.initSVG();

    // loop over nodes
    for (var node in this.networkData.nodes) {
        // get config for this node type
        var typeArgs = NODE_TYPES[this.networkData.nodes[node].type];

        this.addNode({
            "id": node,
            "name": this.networkData.nodes[node].name || "",
            "shape": this.networkData.nodes[node].metainfo.shape || typeArgs.shape,
            "height": this.networkData.nodes[node].metainfo.height || typeArgs.height,
            "width": this.networkData.nodes[node].metainfo.width || typeArgs.width,
            "color": this.networkData.nodes[node].metainfo.color || typeArgs.color,
            "fillcolor": this.networkData.nodes[node].metainfo.fillcolor || typeArgs.fillcolor,
            "label": this.networkData.nodes[node].metainfo.label || this.networkData.nodes[node].name || "",
            "strokeSize": this.networkData.nodes[node].metainfo.strokeSize || typeArgs.strokeSize,
            "opacity": this.networkData.nodes[node].metainfo.opacity || typeArgs.opacity,
            "size": this.networkData.nodes[node].metainfo.size || typeArgs.size,
            "x": this.networkData.nodes[node].metainfo.x || typeArgs.x,
            "y": this.networkData.nodes[node].metainfo.y || typeArgs.y,
            "url": this.networkData.nodes[node].metainfo.URL,
            "qtipContent": this.networkData.nodes[node].metainfo.qtipContent,
            "qtipScope": this.networkData.nodes[node].metainfo.qtipScope,
            "qtipFn": this.networkData.nodes[node].metainfo.qtipFn
        });
    }

    // loop over edges
    for (var edge in this.networkData.edges) {
        this.addEdge({
            "id": edge,
            "source": this.networkData.edges[edge].source,
            "target": this.networkData.edges[edge].target,
            "type": this.networkData.edges[edge].type,
            "x1": this.networkData.edges[edge].metainfo.x1 || 0,
            "y1": this.networkData.edges[edge].metainfo.y1 || 0,
            "x2": this.networkData.edges[edge].metainfo.x2 || 0,
            "y2": this.networkData.edges[edge].metainfo.y2 || 0
        });
    }
};

NetworkSvg.prototype.addNode = function (args, fromClick) {
    var _this = this;
    var nodeId = args.id;

    if (fromClick) {
        // Add info to networkData
        nodeId = this.networkData.addNode({
            "name": args.name,
            "type": "none",
            "metainfo": args
        });

        this.trigger('change',{});
    }

    if (nodeId != -1) {
        if (args.label == "") {
            args.label = this.nodeName;
        }

        this.trigger('node:add',this.nodeName);
        this.setNodeName("node" + (nodeId + 1));

        /** SVG **/
        var nodeGroup = SVG.addChild(this.svgG, "g", {"cursor": "pointer"});

        var customShape = args.shape;
        var attrX = "cx";
        var attrY = "cy";
        if (args.shape != "circle" && args.shape != "ellipse") {
            args.shape = "rect";
            attrX = "x";
            attrY = "y";
        }

        var svgArgs = this.getSvgArgs(customShape, nodeId, args);

        var nodeSvg = SVG.addChild(nodeGroup, args.shape, svgArgs);

        var textOffset = (parseInt(nodeSvg.getAttribute("height")) + 10) || (parseInt(nodeSvg.getAttribute("r") || nodeSvg.getAttribute("ry") || 0) * 2 + 10);
        var nodeText = SVG.addChild(nodeGroup, "text", {
            "id": nodeId,
            "x": args.x,
            "y": args.y + textOffset,
            "font-size": 10,
            "class": "nodeLabel",
            "fill": "green"
        });
        nodeText.textContent = args.label;

        // attach click event
        //	$(nodeSvg).click(function(event){_this.nodeClick(event, this.id);});

        // attach move event
        $(nodeSvg).mousedown(function (event) {
            _this.nodeClick(event, this.id);
        });
        $(nodeSvg).mouseup(function (event) {
            if (_this.mode == "select" || _this.mode == "add") $(_this.svg).off('mousemove');
        });

        // disable move on right click
        $(nodeSvg).bind("contextmenu", function (event) {
            $(_this.svg).off('mousemove');
            return false;
        });


        // add to svg node list
        this.nodeSvgList[nodeId] = nodeGroup;
        this.nodeSvgList[nodeId].edgesIn = [];
        this.nodeSvgList[nodeId].edgesOut = [];

        // attach qtip on right-click
        var label = "<b>Label: </b>" + args.label + "<br><br>";
        var url = "";
        if (args.url) url = "<a href='" + args.url + "' target='_blank'>+info</a><br><br>";
        var content = "";
        if (args.qtipContent) content = args.qtipContent;
        var qtipScope = args.qtipScope;
        var qtipFn = args.qtipFn;

        $(nodeSvg).qtip({
            content: {text: label + url + content, title: {text: args.name, button: 'Close'}},
            position: {target: $(nodeSvg), viewport: $(window), effect: false},
            show: {event: 'mousedown', solo: true},
            events: {
                show: function (event, api) {
                    if (event.originalEvent.button !== 2) {
                        event.preventDefault();
                    }
                },
                render: function (event, api) {
                    $(".link").click(function () {
                        eval(qtipFn);
                        api.hide();
                    });
                }
            },
            hide: 'unfocus',
            style: { width: 150, classes: 'ui-tooltip ui-tooltip-shadow', tip: false}
        });

        /** /SVG **/
    }
    else {
        Ext.Msg.show({
            title: "Error",
            msg: "Already exists a node with this name. The name must be unique.",
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR
        });
    }
};

NetworkSvg.prototype.removeNodes = function (nodeList) {
    this.deselectAllNodes();
    for (var i = 0; i < nodeList.length; i++) {
        this.removeNode(nodeList[i]);
    }
};

NetworkSvg.prototype.removeNode = function (nodeId, onlySVG) {
    /** SVG **/
    // remove node input edges
    for (var i = 0, leni = this.nodeSvgList[nodeId].edgesIn.length; i < leni; i++) {
//		var sourceNode = this.nodeSvgList[nodeId].edgesIn[i];
//		var edgeId = sourceNode+"-"+nodeId;
        var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
        var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
        this.svgG.removeChild(this.edgeSvgList[edgeId]);
        delete this.edgeSvgList[edgeId];
        if (!onlySVG) {
            this.networkData.removeEdge(edgeId); //remove from NetworkData
        }

        // remove edge from source node
        for (var j = 0, lenj = this.nodeSvgList[sourceNode].edgesOut.length; j < lenj; j++) {
            if (this.nodeSvgList[sourceNode].edgesOut[j] == edgeId) {
                this.nodeSvgList[sourceNode].edgesOut.splice(j, 1);
                break;
            }
        }
    }

    // remove node out edges
    for (var i = 0, len = this.nodeSvgList[nodeId].edgesOut.length; i < len; i++) {
//		var targetNode = this.nodeSvgList[nodeId].edgesOut[i];
//		var edgeId = nodeId+"-"+targetNode;
        var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
        var targetNode = this.edgeSvgList[edgeId].getAttribute("target");
        this.svgG.removeChild(this.edgeSvgList[edgeId]);
        delete this.edgeSvgList[edgeId];
        if (!onlySVG) {
            this.networkData.removeEdge(edgeId); //remove from NetworkData
        }

        // remove edge from target node
        for (var j = 0, lenj = this.nodeSvgList[targetNode].edgesIn.length; j < lenj; j++) {
            if (this.nodeSvgList[targetNode].edgesIn[j] == edgeId) {
                this.nodeSvgList[targetNode].edgesIn.splice(j, 1);
                break;
            }
        }
    }

    // remove node
    this.svgG.removeChild(this.nodeSvgList[nodeId]);
    delete this.nodeSvgList[nodeId];
    /** /SVG **/

    /** Data **/
    if (!onlySVG) {
        this.networkData.removeNode(nodeId);
    }
    /** /Data **/

    this.trigger('change',{});
};

NetworkSvg.prototype.filterNodes = function (nodeList) {
    this.deselectAllNodes();

    //Delete nodes that not are in list
    for (var node in this.nodeSvgList) {
        if (!nodeList[node]) {
            this.removeNode(node, true);
        }
    }
};

NetworkSvg.prototype.placeLabelsAndEdges = function () {
    for (var nodeId in this.nodeSvgList) {
        var figure = this.nodeSvgList[nodeId].childNodes[0];
        var x = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
        var y = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));

        //place label
        var textOffsetX = parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
        var textOffsetY = parseInt(figure.getAttribute("height") || figure.getAttribute("r") || figure.getAttribute("ry") || 0) + 10;
        var label = this.nodeSvgList[nodeId].childNodes[1];
        label.setAttribute("x", x - textOffsetX);
        label.setAttribute("y", y + textOffsetY);

        //place edges
        var edgeOffsetX = parseInt(figure.getAttribute("width") || 0) / 2;
        var edgeOffsetY = parseInt(figure.getAttribute("height") || 0) / 2;

        //edges in
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesIn.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
            this.edgeSvgList[edgeId].setAttribute("x2", x + edgeOffsetX);
            this.edgeSvgList[edgeId].setAttribute("y2", y + edgeOffsetY);
        }

        //edges out
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesOut.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
            this.edgeSvgList[edgeId].setAttribute("x1", x + edgeOffsetX);
            this.edgeSvgList[edgeId].setAttribute("y1", y + edgeOffsetY);
        }
    }
};

NetworkSvg.prototype.moveNode = function (nodeId, newX, newY) {
    //move node
    var figure = this.nodeSvgList[nodeId].childNodes[0];
    if (figure.hasAttribute("x")) {
        figure.setAttribute("x", newX);
        figure.setAttribute("y", newY);
    } else {
        figure.setAttribute("cx", newX);
        figure.setAttribute("cy", newY);
    }

    //move label
    var textOffsetX = parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
    var textOffsetY = parseInt(figure.getAttribute("height") || figure.getAttribute("r") || figure.getAttribute("ry") || 0) + 10;
    var label = this.nodeSvgList[nodeId].childNodes[1];
    label.setAttribute("x", newX - textOffsetX);
    label.setAttribute("y", newY + textOffsetY);

    var edgeOffsetX = parseInt(figure.getAttribute("width") || 0) / 2;
    var edgeOffsetY = parseInt(figure.getAttribute("height") || 0) / 2;
    //move edges in
    for (var i = 0, len = this.nodeSvgList[nodeId].edgesIn.length; i < len; i++) {
        var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
        var d = this.edgeSvgList[edgeId].getAttribute("d");
        if (d != null) {
            this.edgeSvgList[edgeId].setAttribute("d", "M" + (newX + edgeOffsetX) + "," + (newY + edgeOffsetY) + " C" + (parseInt(newX + edgeOffsetX) - 20) + "," + (parseInt(newY + edgeOffsetY) - 75) + " " + (parseInt(newX + edgeOffsetX) + 20) + "," + (parseInt(newY + edgeOffsetY) - 75) + " " + (parseInt(newX + edgeOffsetX)) + "," + (newY + edgeOffsetY));
        }
        else {
            this.edgeSvgList[edgeId].setAttribute("x2", newX + edgeOffsetX);
            this.edgeSvgList[edgeId].setAttribute("y2", newY + edgeOffsetY);
        }
    }

    //move edges out
    for (var i = 0, len = this.nodeSvgList[nodeId].edgesOut.length; i < len; i++) {
        var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
        this.edgeSvgList[edgeId].setAttribute("x1", newX + edgeOffsetX);
        this.edgeSvgList[edgeId].setAttribute("y1", newY + edgeOffsetY);
    }

    this.trigger('node:move',{"nodeId": nodeId, "x": newX, "y": newY});
};

NetworkSvg.prototype.addEdgeFromClick = function (nodeId) {
    var _this = this;

    /** SVG **/
    if (this.joinSourceNode == null && nodeId != null) {
        this.joinSourceNode = nodeId;
        var figure = this.nodeSvgList[this.joinSourceNode].childNodes[0];
        this.joinSourceX = figure.getAttribute("x") || figure.getAttribute("cx");
        this.joinSourceY = figure.getAttribute("y") || figure.getAttribute("cy");

        // if is rect calculate the figure center
        if (figure.hasAttribute("x")) {
            this.joinSourceX = parseInt(this.joinSourceX) + parseInt(figure.getAttribute("width")) / 2;
            this.joinSourceY = parseInt(this.joinSourceY) + parseInt(figure.getAttribute("height")) / 2;
        }

        this.edgeSvg = SVG.addChild(this.svgG, "line", {
            "id": this.networkData.edgeId,
            "source": this.joinSourceNode,
            "type": this.edgeType,
            "x1": this.joinSourceX,
            "y1": this.joinSourceY,
            "x2": this.joinSourceX,
            "y2": this.joinSourceY,
            "stroke": "red",
            "stroke-width": "0.5",
            "cursor": "pointer"
        }, 0);

        $(this.svg).mousemove(function (event) {
            var offsetX = (event.clientX - $(_this.svg).offset().left - _this.canvasOffsetX) / _this.scale;
            var offsetY = (event.clientY - $(_this.svg).offset().top - _this.canvasOffsetY) / _this.scale;
            _this.edgeSvg.setAttribute("x2", offsetX - 1);
            _this.edgeSvg.setAttribute("y2", offsetY - 1);
        });
    } else {
        $(this.svg).off('mousemove');
        if (nodeId != null) {

            // If source and target is the same
            if (this.joinSourceNode == nodeId) {
                this.svgG.removeChild(this.edgeSvg);

                var x = this.joinSourceX;
                var y = this.joinSourceY;
                this.edgeSvg = SVG.addChild(this.svgG, "path", {
                    "id": this.networkData.edgeId,
                    "source": nodeId,
                    "target": nodeId,
                    "type": this.edgeType,
                    "d": "M" + (parseInt(x)) + "," + y + " C" + (parseInt(x) - 20) + "," + (parseInt(y) - 75) + " " + (parseInt(x) + 20) + "," + (parseInt(y) - 75) + " " + (parseInt(x)) + "," + y,
                    "fill": "transparent",
                    "stroke": "black",
                    "stroke-width": "0.5",
                    "cursor": "pointer"
                }, 0);
            }

            var joinTargetNode = nodeId;
            var figure = this.nodeSvgList[joinTargetNode].childNodes[0];
            var joinTargetX = figure.getAttribute("x") || figure.getAttribute("cx");
            var joinTargetY = figure.getAttribute("y") || figure.getAttribute("cy");

            // if is rect calculate the figure center
            if (figure.hasAttribute("x")) {
                joinTargetX = parseInt(joinTargetX) + parseInt(figure.getAttribute("width")) / 2;
                joinTargetY = parseInt(joinTargetY) + parseInt(figure.getAttribute("height")) / 2;
                var a = parseInt(figure.getAttribute("width"));
                var b = parseInt(figure.getAttribute("height"));
                var tipOffset = Math.floor(parseInt(Math.sqrt(a * a + b * b)) / 2);
            } else {
                var tipOffset = parseInt(figure.getAttribute("r")) || parseInt(figure.getAttribute("rx"));
            }

            this.edgeSvg.setAttribute("stroke", this.edgeColor);

            // if not exists this marker, add new one to defs
            var markerArrowId = "#arrow-" + this.edgeType + "-" + tipOffset;
            if ($(markerArrowId).length == 0) {
                this.addArrowShape(this.edgeType, tipOffset);
            }
            this.edgeSvg.setAttribute("marker-end", "url(" + markerArrowId + ")");

            // if not exists this marker, add new one to defs
            var edgeId = this.networkData.edgeId;
            var markerLabelId = "#edgeLabel-" + edgeId;
            if ($(markerLabelId).length == 0) {
                this.addEdgeLabel(edgeId, this.edgeLabel);
            }
            this.edgeSvg.setAttribute("marker-start", "url(" + markerLabelId + ")");
            this.edgeSvg.setAttribute("label", this.edgeLabel);

            this.edgeSvg.setAttribute("x2", joinTargetX);
            this.edgeSvg.setAttribute("y2", joinTargetY);

//			var edgeId = this.joinSourceNode+"-"+joinTargetNode;
//			this.edgeSvg.setAttribute("id", edgeId);
            this.edgeSvg.setAttribute("target", joinTargetNode);

            this.edgeSvgList[edgeId] = this.edgeSvg;
            this.nodeSvgList[this.joinSourceNode].edgesOut.push(edgeId);
            this.nodeSvgList[joinTargetNode].edgesIn.push(edgeId);

            $(this.edgeSvg).click(function (event) {
                _this.edgeClick(event, this.id);
            });

            /** Data **/
            var args = {
                "weight": 1,
                "x1": this.joinSourceX,
                "y1": this.joinSourceY,
                "x2": joinTargetX,
                "y2": joinTargetY
//					"markerArrow": "url("+markerArrowId+")",
//					"markerLabel": "url("+markerLabelId+")"
            };

            var name = this.joinSourceNode + "-" + joinTargetNode;

            this.networkData.addEdge(this.joinSourceNode, joinTargetNode, this.edgeType, name, args);
            /** /Data **/

        }
        else { //Cancel edge creation
            this.svgG.removeChild(this.edgeSvg);
        }

        // reset join
        this.joinSourceNode = null;
    }
    /** /SVG **/

    this.trigger('change',{});
};

NetworkSvg.prototype.addEdge = function (args) {
    var _this = this;

    /** SVG **/
    var tipOffset = 14;
    if (!args.target) console.log(args);
    var figure = this.nodeSvgList[args.target].childNodes[0];
    // if is rect calculate the figure center
    if (figure.hasAttribute("x")) {
        var a = parseInt(figure.getAttribute("width"));
        var b = parseInt(figure.getAttribute("height"));
        tipOffset = Math.floor(parseInt(Math.sqrt(a * a + b * b)) / 2);
    } else {
        tipOffset = parseInt(figure.getAttribute("r")) || parseInt(figure.getAttribute("rx"));
    }

    // if not exists this marker, add new one to defs
    var markerArrowId = "#arrow-" + args.type + "-" + tipOffset;
    if ($(markerArrowId).length == 0) {
        this.addArrowShape(args.type, tipOffset);
    }

    if (args.source != args.target) {
        this.edgeSvg = SVG.addChild(this.svgG, "line", {
            "id": args.id,
            "source": args.source,
            "target": args.target,
            "type": args.type,
            "x1": args.x1,
            "y1": args.y1,
            "x2": args.x2,
            "y2": args.y2,
            "stroke": "black",
            "stroke-width": "0.5",
            "cursor": "pointer",
            "marker-end": "url(" + markerArrowId + ")"
        }, 0);
    }
    else {
        var x = args.x1;
        var y = args.y1;
        this.edgeSvg = SVG.addChild(this.svgG, "path", {
            "id": args.id,
            "source": args.source,
            "target": args.target,
            "type": args.type,
            "d": "M" + (parseInt(x)) + "," + y + " C" + (parseInt(x) - 20) + "," + (parseInt(y) - 75) + " " + (parseInt(x) + 20) + "," + (parseInt(y) - 75) + " " + (parseInt(x)) + "," + y,
            "fill": "transparent",
            "stroke": "black",
            "stroke-width": "0.5",
            "cursor": "pointer",
            "marker-end": "url(" + markerArrowId + ")"
        }, 0);
    }

    $(this.edgeSvg).click(function (event) {
        _this.edgeClick(event, this.id);
    });

    this.edgeSvgList[args.id] = this.edgeSvg;
//	var sourceNode = args.id.split('-')[0];
//	var targetNode = args.id.split('-')[1];

    this.nodeSvgList[args.source].edgesOut.push(args.id);
    this.nodeSvgList[args.target].edgesIn.push(args.id);
    /** /SVG **/
};

NetworkSvg.prototype.removeEdge = function (edgeId) {
    var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
    var targetNode = this.edgeSvgList[edgeId].getAttribute("target");

    // remove from source and target
    for (var i = 0, len = this.nodeSvgList[sourceNode].edgesOut.length; i < len; i++) {
        if (this.nodeSvgList[sourceNode].edgesOut[i] == edgeId) {
            this.nodeSvgList[sourceNode].edgesOut.splice(i, 1);
            break;
        }
    }
    for (var i = 0, leni = this.nodeSvgList[targetNode].edgesIn.length; i < leni; i++) {
        if (this.nodeSvgList[targetNode].edgesIn[i] == edgeId) {
            this.nodeSvgList[targetNode].edgesIn.splice(i, 1);
            break;
        }
    }

    this.svgG.removeChild(this.edgeSvgList[edgeId]);
    delete this.edgeSvgList[edgeId];

    // remove from NetworkData
    this.networkData.removeEdge(edgeId);
};

NetworkSvg.prototype.getSvgArgs = function (shape, nodeId, args) {
    var svgArgs = {};
    switch (shape) {
        case "square":
            svgArgs = {
                "id": nodeId,
                "shape": shape,
                "nodeName": args.name,
                "nodeLabel": args.label,
                "nodeSize": args.size,
                "x": args.x,
                "y": args.y,
                "width": 4 * args.size,
                "height": 4 * args.size,
                "fill": args.fillcolor,
                "stroke": args.color,
                "stroke-width": args.strokeSize,
                "opacity": args.opacity
            };
            break;
        case "rectangle":
            svgArgs = {
                "id": nodeId,
                "shape": shape,
                "nodeName": args.name,
                "nodeLabel": args.label,
                "nodeSize": args.size,
                "x": args.x,
                "y": args.y,
                "width": 7 * args.size,
                "height": 4 * args.size,
                "fill": args.fillcolor,
                "stroke": args.color,
                "stroke-width": args.strokeSize,
                "opacity": args.opacity
            };
            break;
        case "rect":
            svgArgs = {
                "id": nodeId,
                "shape": shape,
                "nodeName": args.name,
                "nodeLabel": args.label,
                "nodeSize": args.size,
                "x": args.x,
                "y": args.y,
                "width": 4 * args.size,
                "height": 4 * args.size,
                "fill": args.fillcolor,
                "stroke": args.color,
                "stroke-width": args.strokeSize,
                "opacity": args.opacity
            };
            break;
        case "circle":
            var radius = 2 * args.size;
            svgArgs = {
                "id": nodeId,
                "shape": shape,
                "nodeName": args.name,
                "nodeLabel": args.label,
                "nodeSize": args.size,
                "cx": parseInt(args.x) + radius,
                "cy": parseInt(args.y) + radius,
                "r": radius,
                "fill": args.fillcolor,
                "stroke": args.color,
                "stroke-width": args.strokeSize,
                "opacity": args.opacity
            };
            break;
        case "ellipse":
            var radius = 2 * args.size;
            svgArgs = {
                "id": nodeId,
                "shape": shape,
                "nodeName": args.name,
                "nodeLabel": args.label,
                "nodeSize": args.size,
                "cx": parseInt(args.x) + radius,
                "cy": parseInt(args.y) + radius,
                "rx": radius,
                "ry": 1.5 * args.size,
                "fill": args.fillcolor,
                "stroke": args.color,
                "stroke-width": args.strokeSize,
                "opacity": args.opacity
            };
            break;
    }
    return svgArgs;
};

NetworkSvg.prototype.addArrowShape = function (type, offset) {
    var id = "arrow-" + type + "-" + offset;
    var marker = SVG.addChild(this.defs, "marker", {
        "id": id,
        "orient": "auto",
        "style": "overflow:visible;"
    });

    switch (type) {
        case "directed":
            var arrow = SVG.addChild(marker, "polyline", {
                "transform": "scale(2) rotate(0) translate(0,0)",
                "fill": "black",
                "stroke": "black",
                "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
            });
            break;
        case "odirected":
            var arrow = SVG.addChild(marker, "polyline", {
                "transform": "scale(2) rotate(0) translate(0,0)",
                "fill": "white",
                "stroke": "black",
//			"points":"-14,0 -28,-6 -28,6 -14,0"
                "points": "-" + offset + ",0 " + (-offset - 14) + ",-6 " + (-offset - 14) + ",6 -" + offset + ",0"
            });
            break;
        case "inhibited":
            var arrow = SVG.addChild(marker, "rect", {
                "transform": "scale(2) rotate(0) translate(0,0)",
                "fill": "black",
                "stroke": "black",
                "x": -offset - 6,
                "y": -6,
                "width": 6,
                "height": 12
            });
            break;
        case "dot":
            var arrow = SVG.addChild(marker, "circle", {
                "transform": "scale(2) rotate(0) translate(0,0)",
                "fill": "black",
                "stroke": "black",
                "cx": -offset - 6,
                "cy": 0,
                "r": 6
            });
            break;
        case "odot":
            var arrow = SVG.addChild(marker, "circle", {
                "transform": "scale(2) rotate(0) translate(0,0)",
                "fill": "white",
                "stroke": "black",
                "cx": -offset - 6,
                "cy": 0,
                "r": 6
            });
            break;
    }
};

NetworkSvg.prototype.addEdgeLabel = function (edgeId, label) {
    var id = "edgeLabel-" + edgeId;
    var marker = SVG.addChild(this.defs, "marker", {
        "id": id,
        "orient": "auto",
        "style": "overflow:visible;"
    });
    var text = SVG.addChild(marker, "text", {
//		"transform":"scale(2) rotate(0) translate(0,0)",
        "x": 60,
        "y": 16,
        "font-size": 20,
        "class": "edgeLabel",
        "fill": "green"
    });
    text.textContent = label;
};

NetworkSvg.prototype.reallocateEdgesPosition = function (nodeSvg) {
    var nodeId = nodeSvg.getAttribute("id");
    var x = parseInt(nodeSvg.getAttribute("x") || nodeSvg.getAttribute("cx"));
    var y = parseInt(nodeSvg.getAttribute("y") || nodeSvg.getAttribute("cy"));
    var edgeOffsetX = parseInt(nodeSvg.getAttribute("width") || 0) / 2;
    var edgeOffsetY = parseInt(nodeSvg.getAttribute("height") || 0) / 2;

    //move edges in
    for (var i = 0, len = this.nodeSvgList[nodeId].edgesIn.length; i < len; i++) {
        var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
        var d = this.edgeSvgList[edgeId].getAttribute("d");
        if (d != null) {
            this.edgeSvgList[edgeId].setAttribute("d", "M" + (x + edgeOffsetX) + "," + (y + edgeOffsetY) + " C" + (parseInt(x + edgeOffsetX) - 20) + "," + (parseInt(y + edgeOffsetY) - 75) + " " + (parseInt(x + edgeOffsetX) + 20) + "," + (parseInt(y + edgeOffsetY) - 75) + " " + (parseInt(x + edgeOffsetX)) + "," + (y + edgeOffsetY));
        }
        else {
            this.edgeSvgList[edgeId].setAttribute("x2", x + edgeOffsetX);
            this.edgeSvgList[edgeId].setAttribute("y2", y + edgeOffsetY);
        }
    }

    //move edges out
    for (var i = 0, len = this.nodeSvgList[nodeId].edgesOut.length; i < len; i++) {
        var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
        this.edgeSvgList[edgeId].setAttribute("x1", x + edgeOffsetX);
        this.edgeSvgList[edgeId].setAttribute("y1", y + edgeOffsetY);
    }
};

NetworkSvg.prototype.reallocateInputEdgeArrows = function (nodeSvg) {
    // change arrow markers of edges in
    if (nodeSvg.hasAttribute("x")) {
        var a = parseInt(nodeSvg.getAttribute("width"));
        var b = parseInt(nodeSvg.getAttribute("height"));
        var tipOffset = Math.floor(parseInt(Math.sqrt(a * a + b * b)) / 2);
    } else {
        var tipOffset = parseInt(nodeSvg.getAttribute("r")) || parseInt(nodeSvg.getAttribute("rx"));
    }
    for (var i = 0, len = this.nodeSvgList[nodeSvg.id].edgesIn.length; i < len; i++) {
        var oldTipOffset = parseInt(this.edgeSvgList[i].getAttribute("marker-end").substr(-3, 2));
        var edgeType = this.edgeSvgList[i].getAttribute("marker-end").split("-")[1];
        if (tipOffset != oldTipOffset) {
            // if not exists this marker, add new one to defs
            var markerId = "#arrow-" + edgeType + "-" + tipOffset;
            if ($(markerId).length == 0) {
                this.addArrowShape(edgeType, tipOffset);
            }
            this.edgeSvgList[i].setAttribute("marker-end", "url(" + markerId + ")");
        }
    }
};

NetworkSvg.prototype.collapse = function () {
    var xMin = -Infinity;
    var xMax = Infinity;
    var yMin = -Infinity;
    var yMax = Infinity;

    for (var nodeId in this.selectedNodes) {
        var figure = this.nodeSvgList[nodeId].childNodes[0];
        var nodeX = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
        ;
        var nodeY = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));

        if (xMin < nodeX) {
            xMin = nodeX;
        }
        if (xMax > nodeX) {
            xMax = nodeX;
        }
        if (yMin < nodeY) {
            yMin = nodeY;
        }
        if (yMax > nodeY) {
            yMax = nodeY;
        }
    }

    var centerX = xMin - xMax;
    var centerY = yMin - yMax;
    var radius = (xMax - xMin) / 4;

    var i = 0;
    for (var nodeId in this.selectedNodes) {
        var x = centerX + radius * Math.sin(i * 2 * Math.PI / this.countSelectedNodes);
        var y = centerY + radius * Math.cos(i * 2 * Math.PI / this.countSelectedNodes);
        this.moveNode(nodeId, x, y);
        i++;
    }
};

/** SELECTION FUNCTIONS **/
NetworkSvg.prototype.selectNode = function (nodeId) {
    if (this.selectedNodes[nodeId]) {
        this.countSelectedNodes--;
        //Restore default color and delete from object
        this.nodeSvgList[nodeId].childNodes[0].setAttribute("fill", this.selectedNodes[nodeId]);
        delete this.selectedNodes[nodeId];
    } else {
        this.countSelectedNodes++;
        //Save the color of the node
        this.selectedNodes[nodeId] = this.nodeSvgList[nodeId].childNodes[0].getAttribute("fill");

        //Change the color of the node
        this.nodeSvgList[nodeId].childNodes[0].setAttribute("fill", "red");
    }
};

NetworkSvg.prototype.selectNodes = function (nodeList) {
    this.setMode("select");
    this.deselectAllNodes();

    //Select nodes in list
    for (var i = 0, len = nodeList.length; i < len; i++) {
        this.countSelectedNodes++;
        //Save the color of the node
        this.selectedNodes[nodeList[i]] = this.nodeSvgList[nodeList[i]].childNodes[0].getAttribute("fill");

        //Change the color of the node
        this.nodeSvgList[nodeList[i]].childNodes[0].setAttribute("fill", "red");
    }

    this.trigger('svg:click',{});
};

NetworkSvg.prototype.selectAllNodes = function () {
    for (var nodeId in this.nodeSvgList) {
        if (!this.selectedNodes[nodeId]) {
            this.countSelectedNodes++;
            //Save the color of the node
            this.selectedNodes[nodeId] = this.nodeSvgList[nodeId].childNodes[0].getAttribute("fill");

            //Change the color of the node
            this.nodeSvgList[nodeId].childNodes[0].setAttribute("fill", "red");
        }
    }
};

NetworkSvg.prototype.deselectAllNodes = function () {
    var selectedNodesBck = [];
    for (var id in this.selectedNodes) {
        this.countSelectedNodes--;
        //Restore default color and delete from object
        this.nodeSvgList[id].childNodes[0].setAttribute("fill", this.selectedNodes[id]);
        delete this.selectedNodes[id];
        selectedNodesBck.push(id);
    }
    return selectedNodesBck;
};

NetworkSvg.prototype.selectAdjacentNodes = function () {
    var nodeList = [];
    var visitedNodes = {};
    for (var nodeId in this.selectedNodes) {
        nodeList.push(nodeId);
        visitedNodes[nodeId] = true;

        //loop over edges in
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesIn.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
            var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
            if (!visitedNodes[sourceNode]) {
                nodeList.push(sourceNode);
                visitedNodes[sourceNode] = true;
            }
        }

        //loop over edges out
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesOut.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
            var targetNode = this.edgeSvgList[edgeId].getAttribute("target");
            if (!visitedNodes[targetNode]) {
                nodeList.push(targetNode);
                visitedNodes[targetNode] = true;
            }
        }
    }
    this.selectNodes(nodeList);
};

NetworkSvg.prototype.selectNeighbourhood = function () {
    var nodeList = [];
    var edgeList = [];
    var visitedNodes = {};
    var visitedEdges = {};
    for (var nodeId in this.selectedNodes) {
        if (!visitedNodes[nodeId]) {
            nodeList.push(nodeId);
            visitedNodes[nodeId] = true;
        }

        //loop over edges in
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesIn.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
            var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
            if (!visitedNodes[sourceNode]) {
                nodeList.push(sourceNode);
                visitedNodes[sourceNode] = true;
            }

            if (!visitedEdges[edgeId]) {
                edgeList.push(edgeId);
                visitedEdges[edgeId] = true;
            }
        }

        //loop over edges out
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesOut.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
            var targetNode = this.edgeSvgList[edgeId].getAttribute("target");
            if (!visitedNodes[targetNode]) {
                nodeList.push(targetNode);
                visitedNodes[targetNode] = true;
            }

            if (!visitedEdges[edgeId]) {
                edgeList.push(edgeId);
                visitedEdges[edgeId] = true;
            }
        }
    }
    this.selectNodes(nodeList);
    this.selectEdges(edgeList);
};

NetworkSvg.prototype.checkNodeConnection = function (nodeId) {
    if (!this.visitedNodes[nodeId]) {
        this.nodeList.push(nodeId);
        this.visitedNodes[nodeId] = true;

        //loop over edges in
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesIn.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
            var iNode = this.edgeSvgList[edgeId].getAttribute("source");
            this.checkNodeConnection(iNode);
            if (!this.visitedEdges[edgeId]) {
                this.edgeList.push(edgeId);
                this.visitedEdges[edgeId] = true;
            }
        }

        //loop over edges out
        for (var i = 0, len = this.nodeSvgList[nodeId].edgesOut.length; i < len; i++) {
            var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
            var iNode = this.edgeSvgList[edgeId].getAttribute("target");
            this.checkNodeConnection(iNode);
            if (!this.visitedEdges[edgeId]) {
                this.edgeList.push(edgeId);
                this.visitedEdges[edgeId] = true;
            }
        }
    }
};

NetworkSvg.prototype.selectConnectedNodes = function () {
    this.nodeList = [];
    this.edgeList = [];
    this.visitedNodes = {};
    this.visitedEdges = {};
    for (var nodeId in this.selectedNodes) {
        this.checkNodeConnection(nodeId);
    }
    this.selectNodes(this.nodeList);
    this.selectEdges(this.edgeList);
};

NetworkSvg.prototype.selectEdge = function (edgeId) {
    //Select the edge
    if (this.selectedEdges[edgeId]) {
        this.countSelectedEdges--;

        //Restore default color and delete from object
        this.edgeSvgList[edgeId].setAttribute("stroke", this.selectedEdges[edgeId]);
        delete this.selectedEdges[edgeId];
    } else {
        this.countSelectedEdges++;

        //Save the color of the node
        this.selectedEdges[edgeId] = this.edgeSvgList[edgeId].getAttribute("stroke");

        //Change the color of the node
        this.edgeSvgList[edgeId].setAttribute("stroke", "red");
    }
};

NetworkSvg.prototype.selectEdges = function (edgeList) {
    this.deselectAllEdges();

    //Select nodes in list
    for (var i = 0, len = edgeList.length; i < len; i++) {
        this.countSelectedEdges++;

        //Save the color of the node
        this.selectedEdges[edgeList[i]] = this.edgeSvgList[edgeList[i]].getAttribute("stroke");

        //Change the color of the node
        this.edgeSvgList[edgeList[i]].setAttribute("stroke", "red");
    }
};

NetworkSvg.prototype.selectAllEdges = function () {
    for (var edgeId in this.edgeSvgList) {
        if (!this.selectedEdges[edgeId]) {
            this.countSelectedEdges++;

            //Save the color of the node
            this.selectedEdges[edgeId] = this.edgeSvgList[edgeId].getAttribute("stroke");

            //Change the color of the node
            this.edgeSvgList[edgeId].setAttribute("stroke", "red");
        }
    }
};

NetworkSvg.prototype.deselectAllEdges = function () {
    for (var edgeId in this.selectedEdges) {
        this.countSelectedEdges--;
        //Restore default color and delete from object
        this.edgeSvgList[edgeId].setAttribute("stroke", this.selectedEdges[edgeId]);
        delete this.selectedEdges[edgeId];
    }
};

NetworkSvg.prototype.selectAll = function () {
    this.selectAllNodes();
    this.selectAllEdges();
};

NetworkSvg.prototype.getSelectedNodes = function () {
    var arraySel = [];
    for (var nodeId in this.selectedNodes) {
        arraySel.push(nodeId);
    }
    return arraySel;
};

/** API FORMATTER **/
NetworkSvg.prototype.getWidth = function () {
    return this.width;
};

NetworkSvg.prototype.getHeight = function () {
    return this.height;
};


/** SETTING FUNCTIONS **/
NetworkSvg.prototype.setMode = function (mode) {
    this.mode = mode;

    switch (mode) {
        case "add":
            this.svg.setAttribute("cursor", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABAhJREFUWMPVlW1Mm1UUx//tU14GyHTigI7SQcvYIkEJ06mouERMli3zA35YyFA/mKwkW6RjrJolJE0UI0RiRiRRE8I2MjKzgsmUlL2Q+cI2RgTWkTBkrAFXWiqU0tJCe8956ieJM3Ey00I8H885957f/d97zgXW2wYGBurWs76Smc19fX3mdQMgIqSlpdX19vZ+tF4KIDs7G+np6Se6u7s/WRcFAECtVkOtVn/Q1dXVsOYAzAxmhkajQVZWVm1HR0fDmgLIsgwiQjgchlarhVarrW1tbf1szQGEEFheXkZOTg50Ot3RlpaWz9cM4M9rkGUZAKDT6ZCXl/d+U1NTc8wBVCoVVCoVJEmCJEno7OwMWCyWX2w2W1gIcbi+vj5mEEohBBwOB6xWa8jj8SA5ORlElERE+2pqahJMJpNCCHG8rq5uQywAFG1tbREichHRm0R0rqysbKvL5cKNGzdOmUymd9fiDdwkol0Gg+EmERlHRkZQVFQEIUSl2WzeGHMAIcRrBoNhCgCqq6u/HR8fd83MzKC4uFhJRMaYA1RVVS391SGEOD40NAS9Xg8iOlpbWxsfSwDV3x1EdM5ms306ODg4zczfNzY2hmMJoPgvixovHdOxzBXE/DYxZZDMEEwuYj4tmM6ePNA+ETOAxks15cRys2azLjM/4xlsiEtBWA7DvTiN63d74Z793UlER75+57xlNftJj16cT+3Ul24q0pTAtezExOIYnEv3IakkFGbtgp/mHnPNufcW7NOP3b7w62jUFGi4WJPLMv/0bO5L6rz0QvzgvIhgIAgRISQmJiCCCEJyCDtSC3Bt7DLG7BPTguiVrsOX7z20C1YLwDIffHzjU+qtadvxs+sKlsQygmIJxuITqHr6GLyheXgWXLjuvIoXtu2GIp7Vgungv7bhagGIuVK7OR93FkYw65uFL+iDNzC/EnfYpyBCAQT8c7jvs6MkvwSCqfKR2/CfTDBtSYxLwqTfjrAcwofPf/xA/IvydgCAsacCDu89FDy5E4JpSxQVIASEH/6wD0ISD82NsAwFIhBMiKYCDsf8pD4lIQXeJQ+MP76HgNuHr976ZuXkAKBUKKFOzcaU2w5ickRNAcF0Ztjej+ykHERECAombHoi+YEcmSNQygpoUnPQfesKBNOZaCrQLoelQ/13r6pfzH0dfZNWkEww9lQgwgAQQbxSQmnuHliHv8OCf3GamNujNogGLCPzhfu3TXq83r0LIXf8q7o3oFLGIRQOIl4ZB13adhRmPAfrrQvoH70dIJkPDZtHr0V9FB/4ck+5YGpmiTJLd7yM9NRMIAL8Nj+FnqFe+BaDTpL5yLB51BKzz2j/yd06wVQhVj4jgmB2EfNplunssPnOBP4v9gezhEi+VkBYbwAAAABJRU5ErkJggg==), auto");
            break;

        case "join":
            this.svg.setAttribute("cursor", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAm5JREFUWMPtlM1LlFEUxh9nhj50EZQg86JOMkoQlIgLIwxqIREE/gVBy3cgaNTGCYKBAbFSEiMwWii2Ehdqm0SIlBbS5JDmi32OIQnGmOBK8517nvvawo8iIkaYj808cLmXcy88P8495wD5Vjwej+TT36W1jk5PT0fzBkASpaWlkcnJyY58ZQCVlZUoKyu7Mz4+fjcvGQAAwzBgGMbtsbGxrpwDaK2htUZFRQXKy8tDQ0NDXTkFcBwHJKGUgs/ng8/nCw0MDDzIOYCIwLZtVFVVwe/3t/b19fXmDGDvGxzHAQD4/X7U1NTc7OnpeZR1AI/HA4/HA7fbDbfbjdHR0c2RkZG3lmUpEbnR2dmZNQiXiGBlZQUTExOp9fV1lJSUgGQxyattbW2Hw+FwkYi0RyKRo9kAKBocHNwmmSTZTHK4qanpZDKZRCwWexoOh6/nogZmSDaYpjlDsmVhYQF1dXUQkWvRaPRY1gFE5KJpmssAEAwGnyUSieTq6irq6+tdJFuyDhAIBLb+DIhI+9zcHKqrq0GyNRQKHcomgOfvAMlhy7Luz87OftdaP+/u7lYoqKADqPnJ5RdXHl5Ku3BdmQZQtmpMban3aU/CdB/eem1uA4CmBoUQRaiUQNkCZSukbAVlK3iPe6GU4HPiixW/N1974Db8n86fuADtaNDh/hKtIVogjkD0XozY2Ng8uxH4+ebj40RDRgA0d4z2zTUhDnfNd3f9+06JQBQlYxmgEFPfXv4z7amtnXPxkWJ4vQbWfqwh8enru8X+pcaM1UA6qg2ePqdSMiWKy4v9S6dy3gXzvR9ioviKwjOFgVRQuvoFmcKYIA1CbmkAAAAASUVORK5CYII=), auto");
            break;

        case "delete":
            this.svg.setAttribute("cursor", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA85JREFUWMPVlV1IpFUYx//ved/R+Z7WprUmddZGiZgN1rwoiCiXLIhi79o+2LK6aIyl9SOdIBCEMFrLFgKjC8WuZAO1K/Gi3KgsWVkEeQ1CSFv3dWYKJ9cdnXfnec55u1g2+sR1m1F6Ls+B5//j//zPc4D9rrm5uZ791BdSyt6ZmZnefQNgZoTD4Z7p6em398sB1NTUoLKy8q3Jycl39sUBAIhEIohEIm9OTEyc3nMAKSWklKiurkZVVVXX6Ojo6T0FUEqBmVEoFBCNRhGNRruGh4ff33MAIoJt26itrUUsFusYHBw8s2cA18eglAIAxGIx1NfXnxoYGPiw5ACGYcAwDOi6Dl3XMT4+vjU2NnZhYWGhQEQn+/r6SgYhiAiWZWFqaupqNpuFz+cDM3uZ+cnOzs7yZDKpEVF3T0+PpxQA2sjIiMPMaWY+xsxnm5ubD6XTaczOzn6STCZb9iID55n5/kQicZ6Z203TRENDA4joRG9vb6jkAET0SCKRuAgAbW1tny0tLaUzmQwaGxsFM7eXHKC1tTX/xwMi6p6fn0ddXR2YuaOrq6uspAB/PWDmswsLC6mhoaELzPxBf39/YbdN7ZZXvDccwt02d95IRgH4tffeXfxH8RdfjjtMjyried+no1/t2oEdxXV9xRHClKc64n8Tf+GlOIQwRSBwRhG9tvnUsXuKBnBdHOXlgNsNCGFS68nfIfInWuLQNFP3+1AWDsMVDB5XBXose7RZFGUETme321FqCx6P0AIBqM1NqI0NKDt/WBFDE8IUwQBcwRBs6xKuptJSEXkqzn1ORcuAfL3d7UiZ0zweXQRDkJc3wL9m4RBDDwTgCgVhX7Jgp9PSYfJXnPvCLnoI6dVWt2KZE16vbhy4BZAKUApQErZlwU5nrol/OW3f1DPcqVwff2Q7RH5aX1cgCaysAMvLgJSwU2mlqHDD4jcFAACKKKZpEJAMEAHMADM0XQhVoNh/WkQ71fYzz8ehwdQ9XoAJiESAyB0AM8pDIeiGbqaP3BcvySLaOv5cXBOaaXh9cAWDyKfWYGcyUhFp7gMVwhe5HdupNLbX1lC4kjt85w/fLxbNga2nn41rmmYaHi9cAR/y1rW0qwL5HSLflmXJKz8uwxu+FZ5wGEaZy1w9dNeOThi7mPtB4TIARyFvpZD/OSMdYn/4269tAEjde8Sfs6ycUyjoLp8PmhBwpDwIYLFoI9h4/Ikm4XJN0+ZlpYh9t333zZ/SbtXf7XakzJUFArqdzR6tWf3pXNG/z/WHHm765YEH3f92vxqtdV+sqmnC/6V+A4wb/YzHvgVzAAAAAElFTkSuQmCC), auto");
            break;

        default:
            this.svg.setAttribute("cursor", "default");
            break;
    }
};

NetworkSvg.prototype.setScale = function (zoom) {
    var scale = 1 + (zoom / 100);
    this.scale = scale;
    this.svgG.setAttribute("transform", "scale(" + this.scale + ")");
};

NetworkSvg.prototype.setOverviewRectSize = function (zoom) {
    this.zoom = zoom;
    var scales = {"0": 1, "10": 0.92, "20": 0.84, "30": 0.77, "40": 0.73, "50": 0.67, "60": 0.63, "70": 0.59, "80": 0.56, "90": 0.53, "100": 0.5};
    var scale = scales[zoom];
    this.overviewRect.setAttribute("transform", "scale(" + scale + ")");

    //move canvas if overview rect cross the window limit
    var x = parseInt(this.overviewRect.getAttribute("x"));
    if (x * scale + this.overviewDivWidth * scale > this.overviewDivWidth) {
        var newX = this.overviewDivWidth - this.overviewDivWidth * scale;
        this.overviewRect.setAttribute("x", newX / scale);
        this.parentNetwork.svgC.setAttribute("x", parseInt(-newX / this.scale / scale));
    }
    var y = parseInt(this.overviewRect.getAttribute("y"));
    if (y * scale + this.overviewDivHeight * scale > this.overviewDivHeight) {
        var newY = this.overviewDivHeight - this.overviewDivHeight * scale;
        this.overviewRect.setAttribute("y", newY / scale);
        this.parentNetwork.svgC.setAttribute("y", parseInt(-newY / this.scale / scale));
    }
};

NetworkSvg.prototype.setBackgroundColor = function (color) {
    this.bgColor = color;
    this.background.setAttribute("fill", this.bgColor);
};

NetworkSvg.prototype.setBackgroundImage = function (image) {
    this.backgroundImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', image);
};

NetworkSvg.prototype.setBackgroundImageWidth = function (width) {
    this.backgroundImage.setAttribute("width", width);
};

NetworkSvg.prototype.setBackgroundImageHeight = function (height) {
    this.backgroundImage.setAttribute("height", height);
};

NetworkSvg.prototype.setBackgroundImageX = function (x) {
    this.backgroundImage.setAttribute("x", x);
};

NetworkSvg.prototype.setBackgroundImageY = function (y) {
    this.backgroundImage.setAttribute("y", y);
};

NetworkSvg.prototype.setNodeShape = function (newShape) {
    var _this = this;
    switch (this.mode) {
        case "select":
            for (var nodeId in this.selectedNodes) {
                var nodeGroup = this.nodeSvgList[nodeId];
                var figure = nodeGroup.childNodes[0];
                var shape = figure.getAttribute("shape");
                if (shape != newShape) {

                    nodeGroup.removeChild(figure);

                    var id = figure.getAttribute("id");
                    var size = figure.getAttribute("nodeSize");
                    var label = figure.getAttribute("nodeLabel") || "";
                    var x = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
                    var y = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
                    x -= parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
                    y -= parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0);
                    var color = figure.getAttribute("fill");
                    var stroke = figure.getAttribute("stroke");
                    var strokeWidth = figure.getAttribute("stroke-width");
                    var opacity = figure.getAttribute("opacity");
                    var args = {
                        "size": size,
                        "label": label,
                        "x": x,
                        "y": y,
                        "color": color,
                        "strokeColor": stroke,
                        "strokeSize": strokeWidth,
                        "opacity": opacity
                    };
                    var svgArgs = this.getSvgArgs(newShape, id, args);
                    var realShape = newShape;
                    if (newShape != "circle" && newShape != "ellipse") realShape = "rect";
                    var nodeSvg = SVG.addChild(nodeGroup, realShape, svgArgs, 0);

                    // attach move event
                    $(nodeSvg).mousedown(function (event) {
                        _this.nodeClick(event, this.id);
                    });
                    $(nodeSvg).mouseup(function (event) {
                        if (_this.mode == "select" || _this.mode == "add") $(_this.svg).off('mousemove');
                    });

                    this.reallocateInputEdgeArrows(nodeSvg);
                }
            }
            break;
        case "add":
            this.nodeShape = newShape;
            break;
    }
};

NetworkSvg.prototype.setNodeSize = function (newSize) {
    switch (this.mode) {
        case "select":
            for (var nodeId in this.selectedNodes) {
                var figure = this.nodeSvgList[nodeId].childNodes[0];
                var size = figure.getAttribute("nodeSize");
                if (size != newSize) {
                    figure.setAttribute("nodeSize", newSize);
                    if (figure.hasAttribute("r")) {
                        var radius = 2 * newSize;
                        figure.setAttribute("r", radius);
                    } else if (figure.hasAttribute("rx")) {
                        figure.setAttribute("rx", 2 * newSize);
                        figure.setAttribute("ry", 1.5 * newSize);
                    } else {
                        if (figure.getAttribute("shape") == "square") {
                            figure.setAttribute("width", 4 * newSize);
                            figure.setAttribute("height", 4 * newSize);
                        } else {
                            figure.setAttribute("width", 7 * newSize);
                            figure.setAttribute("height", 4 * newSize);
                        }
                        this.reallocateEdgesPosition(figure);
                    }
                    this.reallocateInputEdgeArrows(figure);

                    //reallocate label
                    var x = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
                    var y = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
                    var textOffsetX = parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
                    var textOffsetY = parseInt(figure.getAttribute("height") || figure.getAttribute("r") || figure.getAttribute("ry") || 0) + 10;
                    var label = this.nodeSvgList[nodeId].childNodes[1];
                    label.setAttribute("x", x - textOffsetX);
                    label.setAttribute("y", y + textOffsetY);
                }
            }
            break;
        case "add":
            this.nodeSize = newSize;
            break;
    }
};

NetworkSvg.prototype.setNodeColor = function (newColor) {
    switch (this.mode) {
        case "select":
            for (var nodeId in this.selectedNodes) {
                var figure = this.nodeSvgList[nodeId].childNodes[0];
                this.selectedNodes[nodeId] = newColor;
                figure.setAttribute("fill", newColor);
            }
            break;
        case "add":
            this.nodeColor = newColor;
            break;
    }
};

NetworkSvg.prototype.setNodeStrokeColor = function (newColor) {
    switch (this.mode) {
        case "select":
            for (var nodeId in this.selectedNodes) {
                var figure = this.nodeSvgList[nodeId].childNodes[0];
                figure.setAttribute("stroke", newColor);
            }
            break;
        case "add":
            this.nodeStrokeColor = newColor;
            break;
    }
};

NetworkSvg.prototype.setNodeStrokeSize = function (newSize) {
    switch (this.mode) {
        case "select":
            for (var nodeId in this.selectedNodes) {
                var figure = this.nodeSvgList[nodeId].childNodes[0];
                figure.setAttribute("stroke-width", newSize);
            }
            break;
        case "add":
            this.nodeStrokeSize = newSize;
            break;
    }
};

NetworkSvg.prototype.setNodeOpacity = function (newOpacity) {
    switch (this.mode) {
        case "select":
            for (var nodeId in this.selectedNodes) {
                var figure = this.nodeSvgList[nodeId].childNodes[0];
                figure.setAttribute("opacity", newOpacity);
            }
            break;
        case "add":
            this.nodeOpacity = newOpacity;
            break;
    }
};

NetworkSvg.prototype.setNodeName = function (newName) {
    if (!this.parentNetwork) {
        switch (this.mode) {
            case "select":
                for (var nodeId in this.selectedNodes) {
                    var figure = this.nodeSvgList[nodeId].childNodes[0];
                    figure.setAttribute("nodeName", newName);
                    this.networkData.getNodeAttributes.setName(nodeId, newName);
                    $(figure).qtip('option', 'content.title.text', newName);
                }
                break;
            case "add":
                this.nodeName = newName;
                break;
        }
    }
};

NetworkSvg.prototype.setNodeLabel = function (newLabel) {
    switch (this.mode) {
        case "select":
            for (var nodeId in this.selectedNodes) {
                var figure = this.nodeSvgList[nodeId].childNodes[0];
                figure.setAttribute("nodeLabel", newLabel);
                var text = this.nodeSvgList[nodeId].childNodes[1];
                text.textContent = newLabel;

                // change qtip info
                var oldContent = $(figure).qtip('option', 'content.text');
                var oldLabel = oldContent.split("<br>")[0];
                var newContent = oldContent.replace(oldLabel, "<b>Label: </b>" + newLabel);
                $(figure).qtip('option', 'content.text', newContent);
            }
            break;
        case "add":
            this.nodeLabel = newLabel;
            break;
    }
};

NetworkSvg.prototype.setEdgeLabel = function (newLabel) {
    switch (this.mode) {
        case "select":
            for (var edgeId in this.selectedEdges) {
                var edgeSvg = this.edgeSvgList[edgeId];
                edgeSvg.setAttribute("label", newLabel);
                $("#edgeLabel-" + edgeId)[0].childNodes[0].textContent = newLabel;
            }
            break;
        case "join":
            this.edgeLabel = newLabel;
            break;
    }
};

NetworkSvg.prototype.setEdgeType = function (newType) {
    switch (this.mode) {
        case "select":
            for (var edgeId in this.selectedEdges) {
                var edgeSvg = this.edgeSvgList[edgeId];
                edgeSvg.setAttribute("type", newType);

                // if not exists this marker, add new one to defs
                var tipOffset = edgeSvg.getAttribute("marker-end").split('-')[2].slice(0, -1);
                var markerId = "#arrow-" + newType + "-" + tipOffset;
                if ($(markerId).length == 0) {
                    this.addArrowShape(newType, tipOffset);
                }
                edgeSvg.setAttribute("marker-end", "url(" + markerId + ")");
            }
            break;
        case "join":
            this.edgeType = newType;
            break;
    }
};

NetworkSvg.prototype.setEdgeColor = function (newColor) {
    switch (this.mode) {
        case "select":
            for (var edgeId in this.selectedEdges) {
                var edgeSvg = this.edgeSvgList[edgeId];

                this.selectedEdges[edgeId] = newColor;
                edgeSvg.setAttribute("fill", newColor);
            }
            break;
        case "join":
            this.edgeColor = newColor;
            break;
    }
};

NetworkSvg.prototype.setLabelSize = function (size) {
    var nodeLabels = $(".nodeLabel");
    for (var i = 0, len = nodeLabels.length; i < len; i++) {
        nodeLabels[i].setAttribute("font-size", size);
    }

    var edgeLabels = $(".edgeLabel");
    for (var i = 0, len = edgeLabels.length; i < len; i++) {
        edgeLabels[i].setAttribute("font-size", size * 2);
    }
};


/** EVENT FUNCTIONS **/
NetworkSvg.prototype.canvasMouseDown = function (event) {
    var _this = this;
    switch (this.mode) {
        case "add":
            var offsetX = (event.clientX - $(this.svg).offset().left) - this.canvasOffsetX;
            var offsetY = (event.clientY - $(this.svg).offset().top) - this.canvasOffsetY;
            this.addNode({
                "name": this.nodeName,
                "shape": this.nodeShape,
                "size": this.nodeSize,
                "fillcolor": this.nodeColor,
                "color": this.nodeStrokeColor,
                "strokeSize": this.nodeStrokeSize,
                "opacity": this.nodeOpacity,
                "label": this.nodeLabel,
                "x": offsetX / this.scale - 15,
                "y": offsetY / this.scale - 10
            }, true);
            break;

        case "select":
            var offsetX = (event.clientX - $(this.svg).offset().left);
            var offsetY = (event.clientY - $(this.svg).offset().top);
            this.selectRectDownX = offsetX;
            this.selectRectDownY = offsetY;

            this.selectRect = SVG.addChild(this.svg, "rect", {
                "x": this.selectRectDownX,
                "y": this.selectRectDownY,
                "width": 0,
                "height": 0,
                "opacity": 0.3,
                "stroke": "orangered",
                "fill": "orange"
            });

            var lastX = 0, lastY = 0;
            $(this.svg).mousemove(function (event) {
                var offsetX = (event.clientX - $(_this.svg).offset().left);//_this.scale;
                var offsetY = (event.clientY - $(_this.svg).offset().top);//_this.scale;
                var newX = (_this.selectRectDownX + offsetX);
                var newY = (_this.selectRectDownY + offsetY);
                if (newX != lastX || newY != lastY) {
                    if (offsetX < _this.selectRectDownX) {
                        _this.selectRect.setAttribute("x", offsetX);
                        _this.selectXNegative = true;
                    } else {
                        _this.selectXNegative = false;
                    }
                    if (offsetY < _this.selectRectDownY) {
                        _this.selectRect.setAttribute("y", offsetY);
                        _this.selectYNegative = true;
                    } else {
                        _this.selectYNegative = false;
                    }
                    _this.selectRect.setAttribute("width", Math.abs(offsetX - _this.selectRectDownX));
                    _this.selectRect.setAttribute("height", Math.abs(offsetY - _this.selectRectDownY));

                    lastX = newX;
                    lastY = newY;
                }
            });

//            this.trigger('svg:click',{});
            break;
    }
};

NetworkSvg.prototype.canvasMouseUp = function (event) {
    var offsetX = (event.clientX - $(this.svg).offset().left);//this.scale;
    var offsetY = (event.clientY - $(this.svg).offset().top);//this.scale;
    switch (this.mode) {
        case "select":
            $(this.svg).off('mousemove');

            // calculate nodes in selection
            var nodeList = [];
            var startSelectX = this.selectRectDownX - this.canvasOffsetX;
            var startSelectY = this.selectRectDownY - this.canvasOffsetY;
            var endSelectX = offsetX - this.canvasOffsetX;
            var endSelectY = offsetY - this.canvasOffsetY;
            if (this.selectXNegative) {
                startSelectX = endSelectX;
                endSelectX = this.selectRectDownX - this.canvasOffsetX;
            }
            if (this.selectYNegative) {
                startSelectY = endSelectY;
                endSelectY = this.selectRectDownY - this.canvasOffsetY;
            }
            for (var node in this.nodeSvgList) {
                var figure = this.nodeSvgList[node].childNodes[0];
                var nodeStartX = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
                nodeStartX -= parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
                nodeStartX *= this.scale;
                var nodeStartY = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
                nodeStartY -= parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0);
                nodeStartY *= this.scale;

                var nodeEndX = nodeStartX + (parseInt(figure.getAttribute("width")) || parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0) * 2) * this.scale;
                var nodeEndY = nodeStartY + (parseInt(figure.getAttribute("height")) || parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0) * 2) * this.scale;

                if (startSelectX <= nodeEndX && startSelectY <= nodeEndY && endSelectX >= nodeStartX && endSelectY >= nodeStartY) {
                    nodeList.push(node);
                }
            }

            var args = null;
            if (nodeList.length == 1) {
                var figure = this.nodeSvgList[nodeList[0]].childNodes[0];
                args = {
                    "shape": figure.getAttribute("shape"),
                    "size": figure.getAttribute("nodeSize"),
                    "color": figure.getAttribute("fill"),
                    "strokeWidth": figure.getAttribute("stroke-width"),
                    "strokeColor": figure.getAttribute("stroke"),
                    "opacity": figure.getAttribute("opacity"),
                    "label": figure.getAttribute("nodeLabel") || ""
                };
            }

            if (this.selectRect != undefined) this.svg.removeChild(this.selectRect);
            this.selectRect = null;
            this.selectNodes(nodeList);
            this.deselectAllEdges();
            this.trigger('svg:click',args);
            this.trigger('selection:change',this.getSelectedNodes());
            break;
        case "join":
            this.addEdgeFromClick(null);
            break;
    }
};

NetworkSvg.prototype.nodeClick = function (event, nodeId) {
    var _this = this;
    switch (this.mode) {
        case "delete":
            if (this.countSelectedNodes > 1) {
                Ext.Msg.show({
                    title: 'Delete',
                    msg: 'Confirm to delete selected nodes. Are you sure?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.QUESTION,
                    fn: function (resp) {
                        if (resp == "yes") {
                            _this.removeNodes(_this.getSelectedNodes());
                        }
                    }
                });
            }
            else {
                this.removeNode(nodeId);
            }
            break;
        case "join":
            this.addEdgeFromClick(nodeId);
            break;
//	case "select":
        default:
            var figure = this.nodeSvgList[nodeId].childNodes[0];

            if (event.ctrlKey) {
                this.selectNode(nodeId);
            } else if (this.countSelectedNodes < 2 || !this.selectedNodes[nodeId]) {
                this.deselectAllNodes();
                this.selectNode(nodeId);

                this.trigger('node:click', {
                    "id": nodeId,
                    "name": figure.getAttribute("nodeName"),
                    "shape": figure.getAttribute("shape"),
                    "size": figure.getAttribute("nodeSize"),
                    "color": this.selectedNodes[nodeId],
                    "strokeWidth": figure.getAttribute("stroke-width"),
                    "strokeColor": figure.getAttribute("stroke"),
                    "opacity": figure.getAttribute("opacity"),
                    "label": figure.getAttribute("nodeLabel") || ""
                });
            }

            if (this.selectedNodes[nodeId]) {
                var downX = event.clientX;
                var downY = event.clientY;
                var lastX = 0, lastY = 0;

                //save original node position
                var nodeOrigX = {};
                var nodeOrigY = {};
                for (var nodeId in this.selectedNodes) {
                    var nodeSvg = _this.nodeSvgList[nodeId].childNodes[0];

                    nodeOrigX[nodeId] = parseInt(nodeSvg.getAttribute("x") || nodeSvg.getAttribute("cx"));
                    nodeOrigY[nodeId] = parseInt(nodeSvg.getAttribute("y") || nodeSvg.getAttribute("cy"));
                }

//			$(this.svg).mousemove(function(event){
//				var despX = event.clientX - downX;
//				var despY = event.clientY - downY;
//				var newX = (downX + event.clientX);
//				var newY = (downY + event.clientY);
//				if(newX!=lastX || newY!=lastY){
//					for (var nodeId in _this.selectedNodes){
//						var newNodeX = nodeOrigX[nodeId] + despX;
//						var newNodeY = nodeOrigY[nodeId] + despY;
//						_this.moveNode(nodeId, newNodeX, newNodeY);
//					}
//					lastX = newX;
//					lastY = newY;
//				}
//			});

                $(this.svg).mousemove(function (event) {
                    var despX = (event.clientX - downX) / _this.scale;
                    var despY = (event.clientY - downY) / _this.scale;
                    var newX = (downX + event.clientX);
                    var newY = (downY + event.clientY);
                    if (newX != lastX || newY != lastY) {
                        for (var nodeId in _this.selectedNodes) {
                            var newNodeX = nodeOrigX[nodeId] + despX;
                            var newNodeY = nodeOrigY[nodeId] + despY;
                            _this.moveNode(nodeId, newNodeX, newNodeY);
                        }
                        lastX = newX;
                        lastY = newY;
                    }
                });
            }
            this.trigger('selection:change',this.getSelectedNodes());
            break;
    }
};

NetworkSvg.prototype.edgeClick = function (event, edgeId) {
    switch (this.mode) {
        case "delete":
            this.removeEdge(edgeId);
            break;
        case "select":
            if (event.ctrlKey) {
                this.selectEdge(edgeId);
            } else if (this.countSelectedEdges < 2 || !this.selectedEdges[edgeId]) {
                this.deselectAllEdges();
                this.selectEdge(edgeId);

                var edgeSvg = this.edgeSvgList[edgeId];
                this.trigger('edge:click',{
                    "type": edgeSvg.getAttribute("type"),
                    "label": edgeSvg.getAttribute("label") || "",
                    "color": this.selectedEdges[edgeId]
                });
            }
            break;
    }
};

NetworkSvg.prototype.getNodeMetainfo = function () {
    var nodeList = {};
    // loop over rendered nodes
    for (var node in this.nodeSvgList) {
        nodeList[node] = {};
        var figure = this.nodeSvgList[node].childNodes[0];

//		nodeList[node].name = this.nodeSvgList[node].childNodes[1].textContent;
        nodeList[node].name = figure.getAttribute("nodeName");
        nodeList[node].metainfo = {};
        nodeList[node].metainfo.shape = figure.getAttribute("shape");
        nodeList[node].metainfo.size = parseInt(figure.getAttribute("nodeSize"));
        nodeList[node].metainfo.label = figure.getAttribute("nodeLabel");
        nodeList[node].metainfo.fillcolor = figure.getAttribute("fill");
        nodeList[node].metainfo.color = figure.getAttribute("stroke");
        nodeList[node].metainfo.strokeSize = figure.getAttribute("stroke-width");
        nodeList[node].metainfo.opacity = figure.getAttribute("opacity");
        nodeList[node].metainfo.x = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
        nodeList[node].metainfo.x -= parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
        nodeList[node].metainfo.y = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
        nodeList[node].metainfo.y -= parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0);
    }

    var edgeList = {};
    // loop over rendered edges
    for (var iedge in this.edgeSvgList) {
        var figure = this.edgeSvgList[iedge];
        var id = figure.getAttribute("id");
        edgeList[id] = {};
        edgeList[id].type = figure.getAttribute("type");
        edgeList[id].x1 = parseInt(figure.getAttribute("x1"));
        edgeList[id].y1 = parseInt(figure.getAttribute("y1"));
        edgeList[id].x2 = parseInt(figure.getAttribute("x2"));
        edgeList[id].y2 = parseInt(figure.getAttribute("y2"));
//		edgeList[id].markerEnd = figure.getAttribute("marker-end");
    }

    return {
        "nodes": nodeList,
        "edges": edgeList
    };
};

//TODO (incomplete)
NetworkSvg.prototype.shadeSelectedNodes = function () {
    var xMin = Infinity;
    var xMax = -Infinity;
    var yMin = Infinity;
    var yMax = -Infinity;

    for (var nodeId in this.selectedNodes) {
        var figure = this.nodeSvgList[nodeId].childNodes[0];
        var nodeX = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
        ;
        var nodeY = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));

        if (xMin > nodeX) {
            xMin = nodeX;
        }
        if (xMax < nodeX) {
            xMax = nodeX;
        }
        if (yMin > nodeY) {
            yMin = nodeY;
        }
        if (yMax < nodeY) {
            yMax = nodeY;
        }
    }

    var rx = (xMax - xMin) / 2;
    var ry = (yMax - yMin) / 2;
    var cx = xMin + rx;
    var cy = yMin + ry;

    SVG.addChild(this.shadowContainer, "ellipse", {
        "opacity": 0.1,
        "cx": cx,
        "cy": cy,
        "rx": rx * 1.5,
        "ry": ry * 1.5
    });
};

NetworkSvg.prototype.moveOverviewRect = function (event) {
    var _this = this;

    var downX = event.clientX;
    var downY = event.clientY;
    var lastX = 0, lastY = 0;
    var origX = parseInt(this.overviewRect.getAttribute("x"));
    var origY = parseInt(this.overviewRect.getAttribute("y"));
    var scale = parseFloat(this.overviewRect.getAttribute("transform").split('(')[1].split(')')[0]);

    $(this.svg).mousemove(function (event) {
        var despX = (event.clientX - downX) / scale;
        var despY = (event.clientY - downY) / scale;
        var newX = (downX + event.clientX);
        var newY = (downY + event.clientY);
        if (newX != lastX || newY != lastY) {
            var newRectX = origX + despX;
            var newRectY = origY + despY;
            if (newRectX * scale >= 0 && newRectX * scale + _this.overviewDivWidth * scale <= _this.overviewDivWidth) {
                _this.overviewRect.setAttribute("x", newRectX);

                _this.parentNetwork.canvasOffsetX = parseInt(-newRectX / _this.scale);
                _this.parentNetwork.svgC.setAttribute("x", _this.parentNetwork.canvasOffsetX);
            }
            if (newRectY * scale >= 0 && newRectY * scale + _this.overviewDivHeight * scale <= _this.overviewDivHeight) {
                _this.overviewRect.setAttribute("y", newRectY);

                _this.parentNetwork.canvasOffsetY = parseInt(-newRectY / _this.scale);
                _this.parentNetwork.svgC.setAttribute("y", _this.parentNetwork.canvasOffsetY);
            }
            lastX = newX;
            lastY = newY;
        }
    });
};

NetworkSvg.prototype.showRenderDiv = function () {
    $(this.parentDiv).css("visibility", "visible");
};

NetworkSvg.prototype.hideRenderDiv = function () {
    $(this.parentDiv).css("visibility", "hidden");
};
