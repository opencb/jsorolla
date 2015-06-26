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

function KaryotypePanel(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events

    _.extend(this, Backbone.Events);

    this.target;
    this.autoRender = true;
    this.id = Utils.genId('KaryotypePanel');

    this.cellBaseHost = 'http://bioinfo.hpc.cam.ac.uk/cellbase/webservices/rest';
    this.cellBaseVersion = 'v3';

    this.pixelBase;
    this.species;
    this.width = 600;
    this.height = 75;
    this.collapsed = false;
    this.collapsible = true;
    this.hidden = false;


//set instantiation args, must be last
    _.extend(this, args);

    //set own region object
    this.region = new Region(this.region);

    this.lastSpecies = this.species;

    this.chromosomeList;
    this.data2;

    this.on(this.handlers);

    this.regionChanging = false;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

KaryotypePanel.prototype = {
    show: function () {
        $(this.div).css({display: 'block'});
        this.hidden = false;
    },
    hide: function () {
        $(this.div).css({display: 'none'});
        this.hidden = true;
    },
    setVisible: function (bool) {
        if (bool) {
            this.show()
        } else {
            this.hide()
        }
    },
    showContent: function () {
        $(this.svg).css({display: 'inline'});
        this.collapsed = false;
        $(this.collapseDiv).removeClass('active');
        $(this.collapseDiv).children().first().removeClass('fa-plus');
        $(this.collapseDiv).children().first().addClass('fa-minus');
    },
    hideContent: function () {
        $(this.svg).css({display: 'none'});
        this.collapsed = true;
        $(this.collapseDiv).addClass('active');
        $(this.collapseDiv).children().first().removeClass('fa-minus');
        $(this.collapseDiv).children().first().addClass('fa-plus');
    },
    setTitle: function (title) {
        if ('titleDiv' in this) {
            $(this.titleTextDiv).html(title);
        }
    },
    setWidth: function (width) {
        this.width = width;
        this.svg.setAttribute("width", width);


        if (typeof this.chromosomeList !== 'undefined') {
            this.clean();
            this._drawSvg(this.chromosomeList, this.data2);
        }
    },

    render: function () {
        var _this = this;

        this.div = $('<div id="karyotype-panel"></div>')[0];

        if ('title' in this && this.title !== '') {

            var titleDiv = $('<div id="tl-title" class="ocb-gv-panel-title unselectable"></div>')[0];
            $(this.div).append(titleDiv);

            if (this.collapsible == true) {
                this.collapseDiv = $('<div class="ocb-gv-panel-collapse-control"><span class="fa fa-minus"></span></div>');
                $(titleDiv).dblclick(function () {
                    if (_this.collapsed) {
                        _this.showContent();
                    } else {
                        _this.hideContent();
                    }
                });
                $(this.collapseDiv).click(function () {
                    if (_this.collapsed) {
                        _this.showContent();
                    } else {
                        _this.hideContent();
                    }
                });
                $(titleDiv).append(this.collapseDiv);
            }

            this.titleTextDiv = $('<div class="ocb-gv-panel-text">' + this.title + '</div>');
            $(titleDiv).append(this.titleTextDiv);
        }

        this.svg = SVG.init(this.div, {
            "width": this.width,
            "height": this.height
        });
        this.markGroup = SVG.addChild(this.svg, "g", {"cursor": "pointer"});
        $(this.div).addClass('unselectable');

        this.colors = {gneg: "white", stalk: "#666666", gvar: "#CCCCCC", gpos25: "silver", gpos33: "lightgrey", gpos50: "gray", gpos66: "dimgray", gpos75: "darkgray", gpos100: "black", gpos: "gray", acen: "blue"};


        this.setVisible(!this.hidden);

        this.rendered = true;
    },

    setSpecies: function (species) {
        this.lastSpecies = this.species;
        this.species = species;
    },
    clean: function () {
        $(this.svg).empty();
    },
    draw: function () {
        var _this = this;
        this.targetDiv = ( this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.clean();

        var sortfunction = function (a, b) {
            var IsNumber = true;
            for (var i = 0; i < a.name.length && IsNumber == true; i++) {
                if (isNaN(a.name[i])) {
                    IsNumber = false;
                }
            }
            if (!IsNumber) return 1;
            return (a.name - b.name);
        };

        CellBaseManager.get({
            host: this.cellBaseHost,
            version: this.cellBaseVersion,
            species: this.species,
            category: 'genomic',
            subCategory: 'chromosome',
            resource: 'all',
            async: false,
            success: function (data) {
                _this.chromosomeList = data.response[0].result[0].chromosomes;
                _this.chromosomeList.sort(sortfunction);
                _this._drawSvg(_this.chromosomeList);
            }
        });

        if (this.collapsed) {
            _this.hideContent();
        }
    },

    _drawSvg: function (chromosomeList) {
        var _this = this;

        var x = 20;
        var xOffset = _this.width / chromosomeList.length;
        var yMargin = 2;

        ///////////
        var biggerChr = 0;
        for (var i = 0, len = chromosomeList.length; i < len; i++) {
            var size = chromosomeList[i].size;
            if (size > biggerChr) {
                biggerChr = size;
            }
        }
        _this.pixelBase = (_this.height - 10) / biggerChr;
        _this.chrOffsetY = {};
        _this.chrOffsetX = {};

        for (var i = 0, len = chromosomeList.length; i < len; i++) { //loop over chromosomes
            var chromosome = chromosomeList[i];

            var chrSize = chromosome.size * _this.pixelBase;
            var y = yMargin + (biggerChr * _this.pixelBase) - chrSize;
            _this.chrOffsetY[chromosome.name] = y;
            var firstCentromere = true;


            var group = SVG.addChild(_this.svg, "g", {"cursor": "pointer", "chr": chromosome.name});
            $(group).click(function (event) {
                var chrClicked = this.getAttribute("chr");
                //			for ( var k=0, len=chromosomeList.length; k<len; k++) {
                //			var offsetX = (event.pageX - $(_this.svg).offset().left);
                //			if(offsetX > _this.chrOffsetX[chromosomeList[k]]) chrClicked = chromosomeList[k];
                //			}

                var offsetY = (event.pageY - $(_this.svg).offset().top);
                //			var offsetY = event.originalEvent.layerY - 3;

                var clickPosition = parseInt((offsetY - _this.chrOffsetY[chrClicked]) / _this.pixelBase);
                var region = new Region({
                    chromosome: chrClicked,
                    start: clickPosition,
                    end: clickPosition
                });
                _this._triggerRegionChange({region: region, sender: _this});
            });

            for (var j = 0, lenJ = chromosome.cytobands.length; j < lenJ; j++) { //loop over chromosome objects
                var cytoband = chromosome.cytobands[j];
                var height = _this.pixelBase * (cytoband.end - cytoband.start);
                var width = 13;

                var color = _this.colors[cytoband.stain];
                if (color == null) color = "purple";

                if (cytoband.stain == "acen") {
                    var points = "";
                    var middleX = x + width / 2;
                    var middleY = y + height / 2;
                    var endX = x + width;
                    var endY = y + height;
                    if (firstCentromere) {
                        points = x + "," + y + " " + endX + "," + y + " " + endX + "," + middleY + " " + middleX + "," + endY + " " + x + "," + middleY;
                        firstCentromere = false;
                    } else {
                        points = x + "," + endY + " " + x + "," + middleY + " " + middleX + "," + y + " " + endX + "," + middleY + " " + endX + "," + endY;
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
                        "stroke": "grey",
                        "opacity": 0.8,
                        "fill": color
                    });
                }

                y += height;
            }
            var text = SVG.addChild(_this.svg, "text", {
                "x": x + 1,
                "y": _this.height,
                "font-size": 9,
                "fill": "black"
            });
            text.textContent = chromosome.name;

            _this.chrOffsetX[chromosome.name] = x;
            x += xOffset;
        }


        this.positionBox = SVG.addChild(this.svg, "line", {
            "x1": 0,
            "y1": 0,
            "x2": 0,
            "y2": 0,
            "stroke": "orangered",
            "stroke-width": 2,
            "opacity": 0.5
        });
        this._recalculatePositionBox(this.region);


        this.rendered = true;
        this.trigger('after:render', {sender: this});
    },


    _triggerRegionChange: function (event) {
        var _this = this;
        if (!this.regionChanging) {
            this.regionChanging = true;
            /**/
            this.trigger('region:change', event);
            /**/
            setTimeout(function () {
                _this.regionChanging = false;
            }, 700);
        } else {
            this.updateRegionControls();
        }
    },
    _recalculatePositionBox: function (region) {
        var centerPosition = region.center();
        var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[region.chromosome];
        this.positionBox.setAttribute("x1", this.chrOffsetX[region.chromosome] - 10);
        this.positionBox.setAttribute("x2", this.chrOffsetX[region.chromosome] + 23);
        this.positionBox.setAttribute("y1", pointerPosition);
        this.positionBox.setAttribute("y2", pointerPosition);
    },
    updateRegionControls: function () {
        this._recalculatePositionBox(this.region);
    },

    setRegion: function (region) {//item.chromosome, item.position, item.species
        this.region.load(region);
        var needDraw = false;

        if (this.lastSpecies != this.species) {
            needDraw = true;
            this.lastSpecies = this.species;
        }
        if (needDraw) {
            this.draw();
        }

        this.updateRegionControls();
    },


//    updatePositionBox: function () {
//        this.positionBox.setAttribute("x1", this.chrOffsetX[this.region.chromosome] - 10);
//        this.positionBox.setAttribute("x2", this.chrOffsetX[this.region.chromosome] + 23);
//
//        var centerPosition = Utils.centerPosition(this.region);
//        var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
//        this.positionBox.setAttribute("y1", pointerPosition);
//        this.positionBox.setAttribute("y2", pointerPosition);
//    },

    addMark: function (item) {//item.chromosome, item.position
        var _this = this;

        var mark = function () {
            if (_this.region.chromosome != null && _this.region.start != null) {
                if (_this.chrOffsetX[_this.region.chromosome] != null) {
                    var x1 = _this.chrOffsetX[_this.region.chromosome] - 10;
                    var x2 = _this.chrOffsetX[_this.region.chromosome];
                    var y1 = (_this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome]) - 4;
                    var y2 = _this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome];
                    var y3 = (_this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome]) + 4;
                    var points = x1 + "," + y1 + " " + x2 + "," + y2 + " " + x1 + "," + y3 + " " + x1 + "," + y1;
                    SVG.addChild(_this.markGroup, "polyline", {
                        "points": points,
                        "stroke": "black",
                        "opacity": 0.8,
                        "fill": "#33FF33"
                    });
                }
            }
        };

        if (this.rendered) {
            mark();
        } else {
            _this.on('after:render', function (e) {
                mark();
            });
        }
    },

    unmark: function () {
        $(this.markGroup).empty();
    }
}
