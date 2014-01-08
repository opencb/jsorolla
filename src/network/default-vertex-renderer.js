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

function DefaultVertexRenderer(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    //defaults
    this.shape = 'circle';
    this.size = 20;
    this.color = '#cccccc';
    this.strokeSize = 1;
    this.strokeColor = '#888888';
    this.opacity = 1;
    this.labelSize = 12;
    this.labelColor = '#111111';
//    this.labelPositionX = 5;
//    this.labelPositionY = 45;

    this.el;
    this.targetEl;
    this.vertex;
    this.selected = false;
    //set instantiation args, must be last
    _.extend(this, args);

}

DefaultVertexRenderer.prototype = {
    get: function (attr) {
        return this[attr];
    },
    set: function (attr, value) {
        this[attr] = value;
        this.update();
    },
    render: function (args) {
        this.targetEl = args.target;
        this.vertex = args.vertex;
        this.coords = args.coords;
        this._render();
    },
    remove: function () {
        $(this.el).remove();
    },
    update: function () {
        this.remove();
        this._render();
    },
    select: function () {
        if (!this.selected) {
            this._renderSelect();
        }
    },
    deselect: function () {
        if (this.selected) {
            this._removeSelect();
        }
    },
    move: function (dispX, dispY) {
        var currentX = parseFloat(this.el.getAttribute('x'));
        var currentY = parseFloat(this.el.getAttribute('y'));
        this.el.setAttribute('x', currentX + dispX);
        this.el.setAttribute('y', currentY + dispY);
    },
    setLabelContent: function (text) {
        var vertexLabel = $(this.el).find('text[network-type="vertex-label"]')[0];
        vertexLabel.textContent = text;
    },
    getSize: function () {
        return this.size + this.strokeSize;
    },
    /* Private */
    _render: function () {
        switch (this.shape) {
            case "circle":
                this._drawCircleShape();
                break;
            case "ellipse":
                this._drawEllipseShape();
                break;
            case "square":
                this._drawSquareShape();
                break;
            case "rectangle":
                this._drawRectangleShape();
                break;
        }
        if (this.selected) {
            this._renderSelect();
        }
    },
    _renderSelect: function () {
        switch (this.shape) {
            case "circle":
                this._drawSelectCircleShape();
                break;
            case "ellipse":
                this._drawSelectEllipseShape();
                break;
            case "square":
                this._drawSelectSquareShape();
                break;
            case "rectangle":
                this._drawSelectRectangleShape();
                break;
        }
        this.selected = true;
    },
    _removeSelect: function () {
        $(this.el).find('[network-type="select-vertex"]').remove();
        this.selected = false;
    },

    _drawCircleShape: function () {

        var size = this.size + this.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - midOffset,
            y: this.coords.y - midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var circle = SVG.addChild(groupSvg, 'circle', {
            cx: midOffset,
            cy: midOffset,
            r: this.size / 2,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        var vertexText = SVG.addChild(vertexSvg, "text", {
            "x": 5,
            "y": this.labelSize + size,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'vertex-label'
        });
        vertexText.textContent = this.vertex.name;
        this.el = vertexSvg;
        this.targetEl.appendChild(vertexSvg);
    },
    _drawEllipseShape: function () {

        var size = this.size + this.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var s1 = (this.size * 0.3);

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - midOffset,
            y: this.coords.y - midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var ellipse = SVG.addChild(groupSvg, 'ellipse', {
            cx: midOffset,
            cy: midOffset,
            rx: this.size / 1.7,
            ry: this.size / 2.5,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        var vertexText = SVG.addChild(vertexSvg, "text", {
            "x": 5,
            "y": this.labelSize + size,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'vertex-label'
        });
        vertexText.textContent = this.vertex.name;
        this.el = vertexSvg;
        this.targetEl.appendChild(vertexSvg);
    },
    _drawSquareShape: function () {

        var size = this.size + this.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - midOffset,
            y: this.coords.y - midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var rect = SVG.addChild(groupSvg, 'rect', {
            x: midOffset - this.size / 2,
            y: midOffset - this.size / 2,
            width: this.size,
            height: this.size,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        var vertexText = SVG.addChild(vertexSvg, "text", {
            "x": 5,
            "y": this.labelSize + size,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'vertex-label'
        });
        vertexText.textContent = this.vertex.name;
        this.el = vertexSvg;
        this.targetEl.appendChild(vertexSvg);
    },
    _drawRectangleShape: function () {

        var size = this.size + this.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var s1 = (this.size * 0.3);
        var s2 = s1 / 2;

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - midOffset,
            y: this.coords.y - midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var rect = SVG.addChild(groupSvg, 'rect', {
            x: midOffset - this.size / 2 - s2,
            y: midOffset - this.size / 2 + s2,
            width: this.size + s1,
            height: this.size - s1,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        var vertexText = SVG.addChild(vertexSvg, "text", {
            "x": 5,
            "y": this.labelSize + size,
            "font-size": this.labelSize,
            "fill": this.labelColor,
            'network-type': 'vertex-label'
        });
        vertexText.textContent = this.vertex.name;
        this.el = vertexSvg;
        this.targetEl.appendChild(vertexSvg);
    },
    _drawSelectCircleShape: function () {
        var size = this.getSize();
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var r = SVG.addChild(this.el, "circle", {
            r: midOffset,
            cx: midOffset,
            cy: midOffset,
            opacity: '0.5',
            fill: '#cccccc',
            'network-type': 'select-vertex'
        }, 0);
    },
    _drawSelectEllipseShape: function () {
        //TODO
        this._drawSelectCircleShape();
    },
    _drawSelectSquareShape: function () {
        //TODO
        this._drawSelectCircleShape();
    },
    _drawSelectRectangleShape: function () {
        //TODO
        this._drawSelectCircleShape();
    },
    toJSON: function () {
        return {
            shape: this.shape,
            size: this.size,
            color: this.color,
            strokeSize: this.strokeSize,
            strokeColor: this.strokeColor,
            opacity: this.opacity,
            labelSize: this.labelSize,
            labelColor: this.labelColor
        };
    }
}