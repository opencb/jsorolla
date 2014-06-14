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
    this.id = Utils.genId('NetworkSvgLayout');

    this.session;
    this.bgColor = "white";
    this.overviewScale = 1;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;

    this.autoRender = true;
    this.width;
    this.height;
    this.bgColor;
    this.species;
    this.parentNetwork;
    this.scale = 1;
    this.network;


    this.transformX = 0;
    this.transformY = 0;

    this.centerX = 0;
    this.centerY = 0;

    /** Action mode **/
    this.mode = "select";

    //set instantiation args, must be last
    _.extend(this, args);


    /* join vertex click flag */
    this.joinSourceVertex = null;

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};


NetworkSvgLayout.prototype = {
    getSvgEl: function () {
        return  this.svg;
    },
    render: function () {
        var _this = this;
        this.div = document.createElement('div');

        $(this.div).attr('id', this.id).css({
            position: 'relative',
            height: this.height + 'px'
        });

        /** SVG init **/
        this.svg = SVG.init(this.div, {
            "id": "svg",
            "width": this.width,
            "height": this.height
        });
        this.defs = SVG.addChild(this.svg, "defs", {});

        this.backRect = SVG.addChild(this.svg, "rect", {
            "id": "backgroundColor",
            "width": '100%',
            "height": '100%',
            "fill": 'white',
            "x": 0,
            "y": 0
        });
        this.drawArea = SVG.addChild(this.svg, "svg", {
            "id": "drawArea",
            "width": this.width,
            "height": this.height
        });


        /* Back svg */
        this.backSvg = SVG.init(this.drawArea, {
            "id": "backSvg",
            "x": 0,
            "y": 0
        });
        this.scaleBackGroup = SVG.addChild(this.backSvg, "g", {
            id: 'scaleBackGroup',
            "transform": "scale(" + this.scale + ")"
        });


        /* Front svg */
        this.frontSvg = SVG.init(this.drawArea, {
            "id": "frontSvg",
            "x": 0,
            "y": 0
        });
        this.scaleFrontGroup = SVG.addChild(this.frontSvg, "g", {
            id: 'scaleFrontGroup',
            'font-family': 'Ubuntu Mono',
            "transform": "scale(" + this.scale + ")"
        });


        this.temporalLinkSvg = SVG.addChild(this.frontSvg, 'line', {
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

        this.selectRect = SVG.addChild(this.frontSvg, "rect", {
            "x": 0,
            "y": 0,
            "width": 0,
            "height": 0,
            "stroke-width": "1.5",
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
                case 2: //middle click
                    _this.middleMouseDown(event);
                    break;
            }
        });
        $(this.svg).bind('mouseup.networkViewer', function (event) {
            switch (event.which) {
                case 1: //left click
                    _this.leftMouseUp(event);
                    break;
                case 2: //middle click
                    _this.middleMouseUp(event);
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
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (this.targetDiv === 'undefined') {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.loadSession();
    },
    setSize: function (width, height) {
        this.width = width;
        this.height = height;
        $(this.div).css({
            height: this.height + 'px'
        });
        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
        this.drawArea.setAttribute('width', width);
        this.drawArea.setAttribute('height', height);
    },
    getElementsSVG: function () {
        return this.scaleFrontGroup;
    },
    clean: function () {
        this.transformX = 0;
        this.transformY = 0;
        this.centerX = 0;
        this.centerY = 0;

        $(this.scaleFrontGroup).empty();
        $(this.scaleBackGroup).empty();
        $(this.svg).prepend(this.backRect);
    },
    getWidth: function () {
        return this.width;
    },
    getHeight: function () {
        return this.height;
    },
    setBackgroundColor: function (color) {
        this.backRect.setAttribute('fill', color);
    },
    getBackgroundColor: function () {
        return this.backRect.getAttribute('fill');
    },
    addBackgroundImage: function (image) {
        this.backgroundImage = SVG.addChildImage(this.scaleBackGroup, {
            "id": Utils.genId('bi'),
            "x": image.x,
            "y": image.y,
            "xlink:href": image.src,
            "width": image.width,
            "height": image.height,
            "network-type": "background-image"
        });
    },
    addBackgroundImages: function (images) {
        for (var i = 0, li = images.length; i < li; i++) {
            this.addBackgroundImage(images[i]);
        }
    },
    getBackGroundImages: function () {
        var images = [];
        var imagesEl = $(this.scaleBackGroup).find('image[network-type="background-image"]');
        for (var i = 0; i < imagesEl.length; i++) {
            images.push({
                src: imagesEl[i].getAttribute('href'),
                width: imagesEl[i].getAttribute('width'),
                height: imagesEl[i].getAttribute('height'),
                x: imagesEl[i].getAttribute('x'),
                y: imagesEl[i].getAttribute('y')
            });
        }
        return images;
    },
    setZoom: function (zoom) {
        this.scale = (zoom == 0) ? 0.03 : (zoom / 25);

        var centerX = this.width / 2;
        var centerY = this.height / 2;
        this.transformX = this.centerX + (-centerX * (this.scale - 1));
        this.transformY = this.centerY + (-centerY * (this.scale - 1));
        this._applyTransformAttribute();

    },
    setCenter: function (c) {
        if (typeof c !== 'undefined') {
            this.centerX = c.x | 0;
            this.centerY = c.y | 0;
            var centerX = this.width / 2;
            var centerY = this.height / 2;
            this.transformX = this.centerX + (-centerX * (this.scale - 1));
            this.transformY = this.centerY + (-centerY * (this.scale - 1));
            this._applyTransformAttribute();
        }

    },
    _applyTransformAttribute: function () {
        this.scaleFrontGroup.setAttribute("transform", "translate(" + this.transformX + "," + this.transformY + ") scale(" + this.scale + ")");
        this.scaleBackGroup.setAttribute("transform", "translate(" + this.transformX + "," + this.transformY + ") scale(" + this.scale + ")");
    },
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
            case "selectbackground":
                $(this.backSvg).parent().append(this.backSvg);
                this.svg.setAttribute("cursor", "default");
                break;
            case "select":
                $(this.frontSvg).parent().append(this.frontSvg);
                this.svg.setAttribute("cursor", "default");
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
        var downX = (event.clientX - $(this.svg).offset().left);
        var downY = (event.clientY - $(this.svg).offset().top);

        console.log(downX)
        console.log(downY)
        switch (this.mode) {
            case "add":
                /* event coordinates */
                if (targetElNetworkType !== 'vertex' && targetElNetworkType !== 'vertex-label') {
                    this.trigger('create:vertex', {x: downX, y: downY});
                }
                break;
            case "select":
                switch (targetElNetworkType) {
                    case 'vertex':
                    case 'vertex-label':
                        var vertexId = this.getVertexId(targetEl);
                        this.trigger('select:vertex', {vertexId: vertexId, addToSelection: event.ctrlKey, sender: _this});

                        var lastX = downX;
                        var lastY = downY;
                        $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                            moveEvent.preventDefault();
                            var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                            var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                            var dispX = moveX - lastX;
                            var dispY = moveY - lastY;

                            _this.trigger('move:selectedVertices', {dispX: dispX, dispY: dispY, sender: _this});

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
                if (targetElNetworkType === 'vertex' || targetElNetworkType === 'vertex-label') {
                    var vertexId = this.getVertexId(targetEl);
                    // first time vertex click
                    if (_this.joinSourceVertex == null) {
                        _this.joinSourceVertex = vertexId;
                        _this.temporalLinkSvg.setAttribute('x1', downX);
                        _this.temporalLinkSvg.setAttribute('y1', downY);
                        _this.temporalLinkSvg.setAttribute('x2', downX);
                        _this.temporalLinkSvg.setAttribute('y2', downY);
                        $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                            moveEvent.preventDefault();
                            var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                            var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                            _this.temporalLinkSvg.setAttribute('x2', moveX);
                            _this.temporalLinkSvg.setAttribute('y2', moveY);
                        });
                        // second vertex click
                    } else if (_this.joinSourceVertex !== vertexId) {
                        _this.trigger('create:edge', {sourceId: _this.joinSourceVertex, targetId: vertexId, sender: _this});
                        _this.joinSourceVertex = null;
                    }
                }
                break;
            case "delete":
                if (targetElNetworkType === 'vertex' || targetElNetworkType === 'vertex-label') {
                    var vertexId = this.getVertexId(targetEl);
                    _this.trigger('remove:vertex', {vertexId: vertexId, sender: _this});
                }
                break;
            case "selectbackground":
                if (targetElNetworkType === 'background-image') {
                    $(targetEl).parent().append(targetEl);
                    var lastX = downX;
                    var lastY = downY;
                    $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                        moveEvent.preventDefault();
                        var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                        var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                        var dispX = moveX - lastX;
                        var dispY = moveY - lastY;

                        dispX /= _this.scale;
                        dispY /= _this.scale;

                        var x = parseInt(targetEl.getAttribute('x'));
                        var y = parseInt(targetEl.getAttribute('y'));

                        x += dispX;
                        y += dispY;

                        targetEl.setAttribute('x', x);
                        targetEl.setAttribute('y', y);

                        lastX = moveX;
                        lastY = moveY;
                    });
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
                    case 'vertex-label':
                        var vertexId = this.getVertexId(targetEl);
                        this.trigger('vertex:leftClick', {vertexId: vertexId});
                        break;
                    case 'edge':
                    case 'edge-label':
                        var edgeId = this.getEdgeId(targetEl);
                        this.trigger('edge:leftClick', {edgeId: edgeId, sender: this});
                        break;
                    default:
                        var x = parseFloat(_this.selectRect.getAttribute('x'));
                        var y = parseFloat(_this.selectRect.getAttribute('y'));
                        var width = parseFloat(_this.selectRect.getAttribute('width'));
                        var height = parseFloat(_this.selectRect.getAttribute('height'));

                        _this.trigger('select:area', {x: x, y: y, width: width, height: height, sender: _this});
                }
                $(_this.svg).off('mousemove.networkViewer');
                break;
            case "selectbackground":
                $(_this.svg).off('mousemove.networkViewer');
                break;
            case "join":
                if (!(targetElNetworkType === 'vertex' || targetElNetworkType === 'vertex-label')) {
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
                if (targetElNetworkType !== 'vertex') {

                }
                break;
        }
        this.selectRect.setAttribute('x', 0);
        this.selectRect.setAttribute('y', 0);
        this.selectRect.setAttribute('width', 0);
        this.selectRect.setAttribute('height', 0);
    },
    middleMouseDown: function (event) {
        var _this = this;
        var targetEl = event.target;
        var targetElNetworkType = $(targetEl).attr('network-type');
        var downX = (event.clientX - $(this.svg).offset().left);
        var downY = (event.clientY - $(this.svg).offset().top);
        switch (this.mode) {
            case "add":
            case "join":
            case "delete":
            case "select":
            case "selectbackground":
                var lastX = downX;
                var lastY = downY;
                $(_this.svg).bind('mousemove.networkViewer', function (moveEvent) {
                    moveEvent.preventDefault();
                    var moveX = (moveEvent.clientX - $(_this.svg).offset().left);
                    var moveY = (moveEvent.clientY - $(_this.svg).offset().top);
                    var dispX = moveX - lastX;
                    var dispY = moveY - lastY;

                    _this.transformX += dispX;
                    _this.transformY += dispY;
                    _this.centerX += dispX;
                    _this.centerY += dispY;

                    _this._applyTransformAttribute();

                    lastX = moveX;
                    lastY = moveY;

                });
                break;
            default:
        }
    },
    middleMouseUp: function (event) {
        var _this = this;
        $(_this.svg).off('mousemove.networkViewer');
    },
    contextMenu: function (event) {

//        console.log('metaKey ' + event.metaKey);
//        console.log('ctrlKey ' + event.ctrlKey);
//        console.log('shiftKey ' + event.shiftKey);
//        console.log('altKey ' + event.altKey);
//        console.log(event);

        var _this = this;
        var targetEl = event.target;
        var targetElNetworkType = $(targetEl).attr('network-type');
        var downX = (event.clientX - $(this.svg).offset().left);
        var downY = (event.clientY - $(this.svg).offset().top);
        switch (this.mode) {
            case "add":
            case "join":
            case "delete":
            case "select":
                if (targetElNetworkType === 'vertex' || targetElNetworkType === 'vertex-label') {
                    var vertexId = this.getVertexId(targetEl);
                    this.trigger('rightClick:vertex', { vertexId: vertexId, x: downX, y: downY, sender: this});
                }
                break;
            case "selectbackground":
                if (targetElNetworkType === 'background-image') {
                    this.trigger('rightClick:backgroundImage', {targetEl: targetEl, x: downX, y: downY, sender: this});
                }
                break;
            default:
        }
    },
    getVertexId: function (targetEl) {
        return $(targetEl).closest('[network-type="vertex-svg"]').attr('id');
    },
    getEdgeId: function (targetEl) {
        return $(targetEl).closest('[network-type="edge-g"]').attr('id');
    },
    loadSession: function () {
        this.clean();
        if (this.session.getBackgroundImages().length > 0) {
            this.addBackgroundImages(this.session.getBackgroundImages())
        }
        this.setBackgroundColor(this.session.getBackgroundColor());
    },
    saveSession: function () {
        this.session.setBackgroundImages(this.getBackGroundImages());
        this.session.setBackgroundColor(this.getBackgroundColor());
    }
};

