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

function ChromosomePanel(targetId, args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('ChromosomePanel');

    this.pixelBase;
    this.species = 'hsapiens';
    this.width = 600;
    this.height = 75;

    //set instantiation args, must be last
    _.extend(this, args);

    //set own region object
    this.region = new Region(this.region);


    this.lastChromosome = "";


//    this.onClick = new Event();

    this.targetDiv = $('#' + targetId)[0];

    if ('title' in this && this.title !== '') {
        this.titleDiv = $('<div id="tl-title" class="gv-panel-title x-unselectable">' + this.title + '</div>')[0];
        $(this.targetDiv).append(this.titleDiv);
    }

    this.svg = SVG.init(this.targetDiv, {
        "width": this.width,
        "height": this.height
    });
    $(this.targetDiv).addClass('x-unselectable');

    this.colors = {gneg: "white", stalk: "#666666", gvar: "#CCCCCC", gpos25: "silver", gpos33: "lightgrey", gpos50: "gray", gpos66: "dimgray", gpos75: "darkgray", gpos100: "black", gpos: "gray", acen: "blue", clementina: '#ffc967'};

    this.data = null;
};

ChromosomePanel.prototype = {
    show: function () {
        $(this.targetDiv).css({display: 'block'});
    },

    hide: function () {
        $(this.targetDiv).css({display: 'none'});
    },
    setVisible: function (bool) {
        if(bool) {
            $(this.targetDiv).css({display: 'block'});
        }else {
            $(this.targetDiv).css({display: 'none'});
        }
    },
    setTitle: function (title) {
        if('titleDiv' in this){
            $(this.titleDiv).html(title);
        }
    },
    setWidth: function (width) {
        this.width = width;
        this.svg.setAttribute("width", width);
        this.tracksViewedRegion = this.width / Utils.getPixelBaseByZoom(this.zoom);
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
        this._drawSvg(this.data);
    },

    draw: function () {
        var _this = this;

        var sortfunction = function (a, b) {
            return (a.start - b.start);
        };

        console.log('In chromosome-widget: ' + this.region)
        var cellBaseManager = new CellBaseManager(this.species);
        cellBaseManager.success.addEventListener(function (sender, data) {
            _this.data = data.result[0];
            _this.data.cytobands.sort(sortfunction);
            _this._drawSvg(_this.data);
        });
        cellBaseManager.get("feature", "chromosome", this.region.chromosome, "info");
        this.lastChromosome = this.region.chromosome;
    },

    drawChromosome: function () {
        var _this = this;

        var sortfunction = function (a, b) {
            return (a.start - b.start);
        };

        console.log('In chromosome-widget: ' + this.region)
        var cellBaseManager = new CellBaseManager(this.species);
        cellBaseManager.success.addEventListener(function (sender, data) {
            _this.data = data.result[0];
            _this.data.cytobands.sort(sortfunction);
            _this._drawSvg(_this.data);
        });
        cellBaseManager.get("feature", "chromosome", this.region.chromosome, "info");
        this.lastChromosome = this.region.chromosome;
    },

    _drawSvg: function (chromosome) {
        var _this = this;
        this.chromosomeLength = chromosome.size;
        _this.pixelBase = (_this.width - 40) / this.chromosomeLength;
        var x = 20;
        var y = 10;
        var firstCentromere = true;

        var offset = 20;
        var centerPosition = _this.region.center();


        /* status string */
        var status = '';

        var pointerPosition = (centerPosition * _this.pixelBase) + offset;

        var group = SVG.addChild(_this.svg, "g", {"cursor": "pointer"});

        //draw chromosome cytobands
        for (var i = 0; i < chromosome.cytobands.length; i++) {
            var cytoband = chromosome.cytobands[i];
            var width = _this.pixelBase * (cytoband.end - cytoband.start);
            var height = 18;
            var color = _this.colors[cytoband.stain];
            if (color == null) color = "purple";
            var middleX = x + width / 2;
            var endY = y + height;

            if (cytoband.stain == "acen") {
                var points = "";
                var middleY = y + height / 2;
                var endX = x + width;
                if (firstCentromere) {
                    points = x + "," + y + " " + middleX + "," + y + " " + endX + "," + middleY + " " + middleX + "," + endY + " " + x + "," + endY;
                    firstCentromere = false;
                } else {
                    points = x + "," + middleY + " " + middleX + "," + y + " " + endX + "," + y + " " + endX + "," + endY + " " + middleX + "," + endY;
                }
                SVG.addChild(group, "polyline", {
                    "points": points,
                    "stroke": "black",
                    "opacity": 0.8,
                    "fill": color
                });
            } else {
                SVG.addChild(group, "rect", {
                    "x": x,
                    "y": y,
                    "width": width,
                    "height": height,
                    "stroke": "black",
                    "opacity": 0.8,
                    "fill": color
                });
            }

            var textY = endY + 2;
            var text = SVG.addChild(group, "text", {
                "x": middleX,
                "y": textY,
                "font-size": 10,
                "transform": "rotate(90, " + middleX + ", " + textY + ")",
                "fill": "black"
            });
            text.textContent = cytoband.name;

            x = x + width;
        }

        $(this.svg).on('mousedown',function (event) {
            status = 'setRegion';
        });

        // selection box, will appear when selection is detected
        var selBox = SVG.addChild(this.svg, "rect", {
            "x": 0,
            "y": 2,
            "stroke-width": "2",
            "stroke": "deepskyblue",
            "opacity": "0.5",
            "fill": "honeydew"
        });


        var positionBoxWidth = _this.region.length() * _this.pixelBase;
        var positionGroup = SVG.addChild(group, 'g');
        this.positionBox = SVG.addChild(positionGroup, 'rect', {
            'x': pointerPosition - (positionBoxWidth / 2),
            'y': 2,
            'width': positionBoxWidth,
            'height': _this.height - 3,
            'stroke': 'orangered',
            'stroke-width': 2,
            'opacity': 0.5,
            'fill': 'navajowhite',
            'cursor': 'move'
        });
        $(this.positionBox).on('mousedown',function (event) {
            status = 'movePositionBox';
        });


        var resizeLeft = SVG.addChild(positionGroup, 'rect', {
            'x': pointerPosition - (positionBoxWidth / 2),
            'y': 2,
            'width': 5,
            'height': _this.height - 3,
            'opacity': 0.5,
            'fill': 'orangered',
            'visibility': 'hidden'
        });
        $(resizeLeft).on('mousedown',function (event) {
            status = 'resizePositionBoxLeft';
        });

        var resizeRight = SVG.addChild(positionGroup, 'rect', {
            'x': positionBoxWidth-5,
            'y': 2,
            'width': 5,
            'height': _this.height - 3,
            'opacity': 0.5,
            'fill': 'orangered',
            'visibility': 'hidden'
        });
        $(resizeRight).on('mousedown',function (event) {
            status = 'resizePositionBoxRight';
        });

        $(this.positionBox).off('mouseenter');
        $(this.positionBox).off('mouseleave');
//        $(this.positionBox).mouseenter(function (event) {
//            if (selectingRegion == false) {
//                overPositionBox = true;
//            }
//        });
//        $(this.positionBox).mouseleave(function (event) {
//            overPositionBox = false;
//        });

        var recalculateResizeControls = function () {
            var postionBoxX = parseInt(_this.positionBox.getAttribute('x'));
            var postionBoxWidth = parseInt(_this.positionBox.getAttribute('width'));
            resizeLeft.setAttribute('x', postionBoxX-5);
            resizeRight.setAttribute('x', (postionBoxX+postionBoxWidth));
            $(resizeLeft).css({"cursor": "ew-resize"});
            $(resizeRight).css({"cursor": "ew-resize"});
        };

        var hideResizeControls = function () {
            resizeLeft.setAttribute('visibility', 'hidden');
            resizeRight.setAttribute('visibility', 'hidden');
        };

        var showResizeControls = function () {
            resizeLeft.setAttribute('visibility', 'visible');
            resizeRight.setAttribute('visibility', 'visible');
        };

        $(positionGroup).mouseenter(function(event){
            recalculateResizeControls();
            showResizeControls();
        });
        $(positionGroup).mouseleave(function(event){
            hideResizeControls();
        });



        /*Remove event listeners*/
        $(this.svg).off('contextmenu');
        $(this.svg).off('mousedown');
        $(this.svg).off('mouseup');
        $(this.svg).off('mousemove');
        $(this.svg).off('mouseleave');

        //Prevent browser context menu
        $(this.svg).contextmenu(function (e) {
            e.preventDefault();
        });
//        var overPositionBox = false;
//        var movingPositionBox = false;
//        var selectingRegion = false;
        var downY, downX, moveX, moveY, lastX, increment;

        $(this.svg).mousedown(function (event) {
            downX = (event.pageX - $(_this.svg).offset().left);
            selBox.setAttribute("x", downX);
            lastX = _this.positionBox.getAttribute("x");
            if(status == ''){
                status = 'setRegion'
            }
            hideResizeControls();
            $(this).mousemove(function (event) {
                moveX = (event.pageX - $(_this.svg).offset().left);
                hideResizeControls();
                switch (status) {
                    case 'resizePositionBoxLeft' :
                        var inc = moveX-downX;
                        var newWidth = parseInt(_this.positionBox.getAttribute("width")) - inc;
                        if(newWidth > 0){
                            _this.positionBox.setAttribute("x", parseInt(_this.positionBox.getAttribute("x"))+inc);
                            _this.positionBox.setAttribute("width",newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'resizePositionBoxRight' :
                        var inc = moveX-downX;
                        var newWidth = parseInt(_this.positionBox.getAttribute("width")) + inc;
                        if(newWidth > 0){
                            _this.positionBox.setAttribute("width",newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'movePositionBox' :
                        var inc = moveX-downX;
//                        var w = _this.positionBox.getAttribute("width");
//                        _this.positionBox.setAttribute("x", moveX - (w / 2));
                        _this.positionBox.setAttribute("x", parseInt(_this.positionBox.getAttribute("x"))+inc);
                        downX = moveX;
                        break;
                    case 'setRegion':
                    case 'selectingRegion' :
                        status = 'selectingRegion';
                        if (moveX < downX) {
                            selBox.setAttribute("x", moveX);
                        }
                        selBox.setAttribute("width", Math.abs(moveX - downX));
                        selBox.setAttribute("height", _this.height - 3);
                        break;
                }

            });
        });


        $(this.svg).mouseup(function (event) {
            $(this).off('mousemove');
            if (downX != null) {

                switch (status) {
                    case 'resizePositionBoxLeft' :
                    case 'resizePositionBoxRight' :
                    case 'movePositionBox' :
                        if (moveX != null) {
                        var w = parseInt(_this.positionBox.getAttribute("width"));
                        var x = parseInt(_this.positionBox.getAttribute("x"));
                        var pixS = x;
                        var pixE = x+w;
                        var bioS = (pixS - offset) / _this.pixelBase;
                        var bioE = (pixE - offset) / _this.pixelBase;
                        _this.region.start = Math.round(bioS);
                        _this.region.end = Math.round(bioE);
                        recalculateResizeControls();
                        showResizeControls();
                        _this.trigger('region:change', {region: _this.region, sender: _this});
                        recalculateResizeControls();
                        showResizeControls();
                        }
                        break;
                    case 'setRegion' :
                        var w = _this.positionBox.getAttribute("width");
                        var pixS = downX - (w / 2);
                        var pixE = downX + (w / 2);
                        var bioS = (pixS - offset) / _this.pixelBase;
                        var bioE = (pixE - offset) / _this.pixelBase;
                        _this.region.start = Math.round(bioS);
                        _this.region.end = Math.round(bioE);

                        _this.positionBox.setAttribute("x", downX - (w / 2));
                        _this.trigger('region:change', {region: _this.region, sender: _this});
                        break;
                    case 'selectingRegion' :
                        var bioS = (downX - offset) / _this.pixelBase;
                        var bioE = (moveX - offset) / _this.pixelBase;
                        _this.region.start = parseInt(Math.min(bioS, bioE));
                        _this.region.end = parseInt(Math.max(bioS, bioE));

                        var w = Math.abs(downX - moveX);
                        _this.positionBox.setAttribute("width", w);
                        _this.positionBox.setAttribute("x", Math.abs((downX + moveX) / 2) - (w / 2));
                        _this.trigger('region:change', {region: _this.region, sender: _this});
                        break;
                }
                status = '';

            }
            selBox.setAttribute("width", 0);
            selBox.setAttribute("height", 0);
            downX = null;
            moveX = null;
            lastX = _this.positionBox.getAttribute("x");
        });
        $(this.svg).mouseleave(function (event) {
            $(this).off('mousemove')
            if (lastX != null) {
                _this.positionBox.setAttribute("x", lastX);
            }
            selBox.setAttribute("width", 0);
            selBox.setAttribute("height", 0);
            downX = null;
            moveX = null;
            lastX = null;
            overPositionBox = false;
            movingPositionBox = false;
            selectingRegion = false;
        });




    },

    setRegion: function (region) {//item.chromosome, item.region
        this.region.load(region);
        var needDraw = false;
//        if (item.species != null) {
//            this.species = item.species;
//            needDraw = true;
//        }
//        if(this.region.chromosome == region.chromosome) {
//            return;
//        }

        if (this.lastChromosome != this.region.chromosome) {
            needDraw = true;
        }


        //recalculate positionBox
        var genomicLength = this.region.length();
        var pixelWidth = genomicLength * this.pixelBase;
        var x = (this.region.start * this.pixelBase) + 20;//20 is the margin
        this.positionBox.setAttribute("x", x);
        this.positionBox.setAttribute("width", pixelWidth);

        if (needDraw) {
//		$(this.svg).empty();
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.firstChild);
            }
            this.drawChromosome();
        }
    }



//ChromosomeWidget.prototype.setZoom = function(zoom){
    //this.zoom=zoom;
    //this.tracksViewedRegion = this.width/Utils.getPixelBaseByZoom(this.zoom);
    //var width = this.tracksViewedRegion*this.pixelBase;
    //this.positionBox.setAttribute("width",width);
//
    //var centerPosition = Utils.centerPosition(this.region);
    //var pointerPosition = centerPosition*this.pixelBase+20;
    //this.positionBox.setAttribute("x",pointerPosition-(width/2));
//};
}