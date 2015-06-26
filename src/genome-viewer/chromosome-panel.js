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

function ChromosomePanel(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('ChromosomePanel');

    this.target;
    this.autoRender = true;
    this.cellBaseHost = 'http://bioinfo.hpc.cam.ac.uk/cellbase/webservices/rest';
    this.cellBaseVersion = 'v3';

    this.pixelBase;
    this.species = 'hsapiens';
    this.width = 600;
    this.height = 75;
    this.collapsed = false;
    this.collapsible = false;
    this.hidden = false;

    //set instantiation args, must be last
    _.extend(this, args);

    //set own region object
    this.region = new Region(this.region);


    this.lastChromosome = "";
    this.data;

    this.on(this.handlers);

    this.regionChanging = false;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

ChromosomePanel.prototype = {
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
//        this.tracksViewedRegion = this.width / Utils.getPixelBaseByZoom(this.zoom);

        if (typeof this.data !== 'undefined') {
            this.clean();
            this._drawSvg(this.data);
        }
    },

    render: function () {
        var _this = this;

        this.div = $('<div id="chromosome-panel"></div>')[0];

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
        $(this.div).addClass('unselectable');

        this.colors = {gneg: "#eeeeee", stalk: "#666666", gvar: "#CCCCCC", gpos25: "silver", gpos33: "lightgrey", gpos50: "gray", gpos66: "dimgray", gpos75: "darkgray", gpos100: "black", gpos: "gray", acen: "blue", clementina: '#ffc967'};


        this.setVisible(!this.hidden);
        this.rendered = true;
    },

    setSpecies: function (species) {
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

        CellBaseManager.get({
            host: this.cellBaseHost,
            version: this.cellBaseVersion,
            species: this.species,
            category: 'genomic',
            subCategory: 'chromosome',
            query: this.region.chromosome,
            resource: 'info',
            async: false,
            success: function (data) {
                _this.data = data.response[0].result[0].chromosomes[0];
                _this.data.cytobands.sort(function (a, b) {
                    return (a.start - b.start);
                });
                _this._drawSvg(_this.data);
            }
        });

        this.lastChromosome = this.region.chromosome;

        if (this.collapsed) {
            _this.hideContent();
        }
    },
    _drawSvg: function (chromosome) {
        // This method uses less svg elements
        var _this = this;
        var offset = 20;
        var group = SVG.addChild(_this.svg, "g", {"cursor": "pointer"});
        this.chromosomeLength = chromosome.size;
        this.pixelBase = (this.width - 40) / this.chromosomeLength;

        /**/
        /*Draw Chromosome*/
        /**/
        var backrect = SVG.addChild(group, 'rect', {
            'x': offset,
            'y': 4,
            'width': this.width - 40 + 1,
            'height': 22,
            'fill': '#555555'
        });

        var cytobandsByStain = {};
        var textDrawingOffset = offset;
        for (var i = 0; i < chromosome.cytobands.length; i++) {
            var cytoband = chromosome.cytobands[i];
            cytoband.pixelStart = cytoband.start * this.pixelBase;
            cytoband.pixelEnd = cytoband.end * this.pixelBase;
            cytoband.pixelSize = cytoband.pixelEnd - cytoband.pixelStart;

            if (typeof cytobandsByStain[cytoband.stain] == 'undefined') {
                cytobandsByStain[cytoband.stain] = [];
            }
            cytobandsByStain[cytoband.stain].push(cytoband);

            var middleX = textDrawingOffset + (cytoband.pixelSize / 2);
            var textY = 28;
            var text = SVG.addChild(group, "text", {
                "x": middleX,
                "y": textY,
                "font-size": 10,
                "transform": "rotate(90, " + middleX + ", " + textY + ")",
                "fill": "black"
            });
            text.textContent = cytoband.name;
            textDrawingOffset += cytoband.pixelSize;
        }

        for (var cytobandStain in cytobandsByStain) {
            var cytobands_d = '';
            if (cytobandStain != 'acen') {
                for (var j = 0; j < cytobandsByStain[cytobandStain].length; j++) {
                    var cytoband = cytobandsByStain[cytobandStain][j];
                    cytobands_d += 'M' + (cytoband.pixelStart + offset + 1) + ',15' + ' L' + (cytoband.pixelEnd + offset) + ',15 ';
                }
                var path = SVG.addChild(group, 'path', {
                    "d": cytobands_d,
                    "stroke": this.colors[cytobandStain],
//                "stroke": 'red',
                    "stroke-width": 20,
                    "fill": 'none'
                });
            }
        }

        if (typeof cytobandsByStain['acen'] !== 'undefined') {
            var firstStain = cytobandsByStain['acen'][0];
            var lastStain = cytobandsByStain['acen'][1];
            var backrect = SVG.addChild(group, 'rect', {
                'x': (firstStain.pixelStart + offset + 1),
                'y': 4,
                'width': (lastStain.pixelEnd + offset) - (firstStain.pixelStart + offset + 1),
                'height': 22,
                'fill': 'white'
            });
            var firstStainXStart = (firstStain.pixelStart + offset + 1);
            var firstStainXEnd = (firstStain.pixelEnd + offset);
            var lastStainXStart = (lastStain.pixelStart + offset + 1);
            var lastStainXEnd = (lastStain.pixelEnd + offset);
            var path = SVG.addChild(group, 'path', {
                'd': 'M' + firstStainXStart + ',4' + ' L' + (firstStainXEnd - 5) + ',4 ' + ' L' + firstStainXEnd + ',15 ' + ' L ' + (firstStainXEnd - 5) + ',26 ' + ' L ' + firstStainXStart + ',26 z',
                'fill': this.colors['acen']
            });
            var path = SVG.addChild(group, 'path', {
                'd': 'M' + lastStainXStart + ',15' + ' L' + (lastStainXStart + 5) + ',4 ' + ' L' + lastStainXEnd + ',4 ' + ' L ' + lastStainXEnd + ',26 ' + ' L ' + (lastStainXStart + 5) + ',26 z',
                'fill': this.colors['acen']
            });
        }


        /**/
        /* Resize elements and events*/
        /**/
        var status = '';
        var centerPosition = _this.region.center();
        var pointerPosition = (centerPosition * _this.pixelBase) + offset;
        $(this.svg).on('mousedown', function (event) {
            status = 'setRegion';
        });

        // selection box, will appear when selection is detected
        this.selBox = SVG.addChild(this.svg, "rect", {
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
        $(this.positionBox).on('mousedown', function (event) {
            status = 'movePositionBox';
        });


        this.resizeLeft = SVG.addChild(positionGroup, 'rect', {
            'x': pointerPosition - (positionBoxWidth / 2),
            'y': 2,
            'width': 7,
            'height': _this.height - 3,
            'opacity': 0.5,
            'fill': 'orangered',
            'visibility': 'hidden'
        });
        $(this.resizeLeft).on('mousedown', function (event) {
            status = 'resizePositionBoxLeft';
        });

        this.resizeRight = SVG.addChild(positionGroup, 'rect', {
            'x': positionBoxWidth - 5,
            'y': 2,
            'width': 7,
            'height': _this.height - 3,
            'opacity': 0.5,
            'fill': 'orangered',
            'visibility': 'hidden'
        });
        $(this.resizeRight).on('mousedown', function (event) {
            status = 'resizePositionBoxRight';
        });

        $(this.positionBox).off('mouseenter');
        $(this.positionBox).off('mouseleave');

        $(positionGroup).mouseenter(function (event) {
            _this._recalculateResizeControls();
            _this._showResizeControls();
        });
        $(positionGroup).mouseleave(function (event) {
            _this._hideResizeControls();
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
        var downY, downX, moveX, moveY, lastX, increment;

        $(this.svg).mousedown(function (event) {

            downX = (event.clientX - $(this).parent().offset().left); //using parent offset works well on firefox and chrome. Could be because it is a div instead of svg
            _this.selBox.setAttribute("x", downX);
            lastX = _this.positionBox.getAttribute("x");
            if (status == '') {
                status = 'setRegion'
            }
            _this._hideResizeControls();
            $(this).mousemove(function (event) {
                moveX = (event.clientX - $(this).parent().offset().left); //using parent offset works well on firefox and chrome. Could be because it is a div instead of svg
                _this._hideResizeControls();
                switch (status) {
                    case 'resizePositionBoxLeft' :
                        var inc = moveX - downX;
                        var newWidth = parseInt(_this.positionBox.getAttribute("width")) - inc;
                        if (newWidth > 0) {
                            _this.positionBox.setAttribute("x", parseInt(_this.positionBox.getAttribute("x")) + inc);
                            _this.positionBox.setAttribute("width", newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'resizePositionBoxRight' :
                        var inc = moveX - downX;
                        SVG
                        var newWidth = parseInt(_this.positionBox.getAttribute("width")) + inc;
                        if (newWidth > 0) {
                            _this.positionBox.setAttribute("width", newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'movePositionBox' :
                        var inc = moveX - downX;
                        _this.positionBox.setAttribute("x", parseInt(_this.positionBox.getAttribute("x")) + inc);
                        downX = moveX;
                        break;
                    case 'setRegion':
                    case 'selectingRegion' :
                        status = 'selectingRegion';
                        if (moveX < downX) {
                            _this.selBox.setAttribute("x", moveX);
                        }
                        _this.selBox.setAttribute("width", Math.abs(moveX - downX));
                        _this.selBox.setAttribute("height", _this.height - 3);
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
                            var pixE = x + w;
                            var bioS = (pixS - offset) / _this.pixelBase;
                            var bioE = (pixE - offset) / _this.pixelBase;

                            _this._triggerRegionChange({region: new Region({chromosome: _this.region.chromosome, start: bioS, end: bioE}), sender: _this});
                        }
                        break;
                    case 'setRegion' :
                        if (downX > offset && downX < (_this.width - offset)) {
                            var w = _this.positionBox.getAttribute("width");

                            var pixS = downX - (w / 2);
                            var pixE = downX + (w / 2);
                            var bioS = (pixS - offset) / _this.pixelBase;
                            var bioE = (pixE - offset) / _this.pixelBase;

                            _this._triggerRegionChange({region: new Region({chromosome: _this.region.chromosome, start: bioS, end: bioE}), sender: _this});
                        }
                        break;
                    case 'selectingRegion' :
                        var bioS = (downX - offset) / _this.pixelBase;
                        var bioE = (moveX - offset) / _this.pixelBase;
                        var start = Math.min(bioS, bioE);
                        var end = Math.max(bioS, bioE);

                        _this.selBox.setAttribute("width", 0);
                        _this.selBox.setAttribute("height", 0);
                        _this._triggerRegionChange({region: new Region({chromosome: _this.region.chromosome, start: start, end: end}), sender: _this});
                        break;
                }
                status = '';

            }
            downX = null;
            moveX = null;
            lastX = _this.positionBox.getAttribute("x");
        });
        $(this.svg).mouseleave(function (event) {
            $(this).off('mousemove')
            if (lastX != null) {
                _this.positionBox.setAttribute("x", lastX);
            }
            _this.selBox.setAttribute("width", 0);
            _this.selBox.setAttribute("height", 0);
            downX = null;
            moveX = null;
            lastX = null;
            overPositionBox = false;
            movingPositionBox = false;
            selectingRegion = false;
        });
    },

    _triggerRegionChange: function (event) {
        var _this = this;
        if (!this.regionChanging) {
            this.regionChanging = true;

            /**/
            this._limitRegionToChromosome(event.region);
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
        var genomicLength = region.length();
        var pixelWidth = genomicLength * this.pixelBase;
        var x = (region.start * this.pixelBase) + 20;//20 is the margin
        this.positionBox.setAttribute("x", x);
        this.positionBox.setAttribute("width", pixelWidth);
    },
    _recalculateSelectionBox: function (region) {
        var genomicLength = region.length();
        var pixelWidth = genomicLength * this.pixelBase;
        var x = (region.start * this.pixelBase) + 20;//20 is the margin
        this.selBox.setAttribute("x", x);
        this.selBox.setAttribute("width", pixelWidth);
    },
    _recalculateResizeControls: function () {
        var postionBoxX = parseInt(this.positionBox.getAttribute('x'));
        var postionBoxWidth = parseInt(this.positionBox.getAttribute('width'));
        this.resizeLeft.setAttribute('x', postionBoxX - 5);
        this.resizeRight.setAttribute('x', (postionBoxX + postionBoxWidth));
        $(this.resizeLeft).css({"cursor": "ew-resize"});
        $(this.resizeRight).css({"cursor": "ew-resize"});
    },
    _hideResizeControls: function () {
        this.resizeLeft.setAttribute('visibility', 'hidden');
        this.resizeRight.setAttribute('visibility', 'hidden');
    },
    _showResizeControls: function () {
        this.resizeLeft.setAttribute('visibility', 'visible');
        this.resizeRight.setAttribute('visibility', 'visible');
    },
    _limitRegionToChromosome: function (region) {
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > this.chromosomeLength) ? this.chromosomeLength : region.end;
    },

    updateRegionControls: function () {
        this.selBox.setAttribute("width", 0);
        this.selBox.setAttribute("height", 0);
        this._recalculatePositionBox(this.region);
        this._recalculateResizeControls();
    },

    setRegion: function (region) {//item.chromosome, item.region

        console.log('region modified chromosome')
        this.region.load(region);
        var needDraw = false;

        if (this.lastChromosome != this.region.chromosome) {
            needDraw = true;
        }
        if (needDraw) {
            this.draw();
        }

        this.updateRegionControls();
    }
}