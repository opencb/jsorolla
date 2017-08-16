/**
 * Created by agaor on 14/08/17.
 */
class ChromosomePanel {
    constructor(args) {
        Object.assign(this, Backbone.Events);

        this.id = Utils.genId('ChromosomePanel');
        this.target;
        this.autoRender = true;
        this.client;

        this.pixelBase;
        this.species = 'hsapiens'; // change to config species
        this.width = 600;
        this.height = 75;
        this.collapsed = false;
        this.collapsible = false;
        this.hidden = false;

        //set instantiation args, must be last
        Object.assign(this, args);

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
    }

    show() {
        $(this.div).css({display: 'block'});
        this.hidden = false;
    }

    hide() {
        $(this.div).css({display: 'none'});
        this.hidden = true;
    }

    setVisible(bool) {
        if (bool) {
            this.show()
        } else {
            this.hide()
        }
    }

    showContent() {
        $(this.svg).css({display: 'inline'});
        this.collapsed = false;
        $(this.collapseDiv).removeClass('active');
        $(this.collapseDiv).children().first().removeClass('fa-plus');
        $(this.collapseDiv).children().first().addClass('fa-minus');
    }

    hideContent() {
        $(this.svg).css({display: 'none'});
        this.collapsed = true;
        $(this.collapseDiv).addClass('active');
        $(this.collapseDiv).children().first().removeClass('fa-minus');
        $(this.collapseDiv).children().first().addClass('fa-plus');
    }

    setTitle(title) {
        if ('titleDiv' in this) {
            $(this.titleTextDiv).html(title);
        }
    }

    setWidth(width) {
        this.width = width;
        this.svg.setAttribute("width", width);
//        this.tracksViewedRegion = this.width / Utils.getPixelBaseByZoom(this.zoom);

        if (typeof this.data !== 'undefined') {
            this.clean();
            this._drawSvg(this.data);
        }
    }

    render() {
        let _this = this;

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
    }

    setSpecies(species) {
        this.species = species;
    }

    clean() {
        $(this.svg).empty();
    }

    draw(data) {
        let _this = this;
        this.targetDiv = ( this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.clean();

        if (UtilsNew.isUndefinedOrNull(data)) {
            this.client.get("genomic", "chromosome", this.region.chromosome, "info")
                .then(function (data) {
                    _this.data = data.response[0].result[0].chromosomes[0];
                    _this.data.cytobands.sort(function (a, b) {
                        return (a.start - b.start);
                    });
                    _this._drawSvg(_this.data);
                });

        } else{
            _this._drawSvg(_this.data);
        }

        this.lastChromosome = this.region.chromosome;

        if (this.collapsed) {
            _this.hideContent();
        }
    }

    _drawSvg(chromosome) {
        // This method uses less svg elements
        let _this = this;
        let offset = 20;
        let group = SVG.addChild(_this.svg, "g", {"cursor": "pointer"});
        this.chromosomeLength = chromosome.size;
        this.pixelBase = (this.width - 40) / this.chromosomeLength;

        /**/
        /*Draw Chromosome*/
        /**/
        let backrect = SVG.addChild(group, 'rect', {
            'x': offset,
            'y': 39,
            'width': this.width - 40 + 1,
            'height': 22,
            'fill': '#555555'
        });

        let cytobandsByStain = {};
        let textDrawingOffset = offset;
        for (let i = 0; i < chromosome.cytobands.length; i++) {
            let cytoband = chromosome.cytobands[i];
            cytoband.pixelStart = cytoband.start * this.pixelBase;
            cytoband.pixelEnd = cytoband.end * this.pixelBase;
            cytoband.pixelSize = cytoband.pixelEnd - cytoband.pixelStart;

            if (typeof cytobandsByStain[cytoband.stain] == 'undefined') {
                cytobandsByStain[cytoband.stain] = [];
            }
            cytobandsByStain[cytoband.stain].push(cytoband);

            let middleX = textDrawingOffset + (cytoband.pixelSize / 2);
            let textY =35;
            let text = SVG.addChild(group, "text", {
                "x": middleX,
                "y": textY,
                "font-size": 10,
                "transform": "rotate(-90, " + middleX + ", " + textY + ")",
                "fill": "black"
            });
            text.textContent = cytoband.name;
            textDrawingOffset += cytoband.pixelSize;
        }

        for (let cytobandStain in cytobandsByStain) {
            let cytobands_d = '';
            if (cytobandStain != 'acen') {
                for (let j = 0; j < cytobandsByStain[cytobandStain].length; j++) {
                    let cytoband = cytobandsByStain[cytobandStain][j];
                    cytobands_d += 'M' + (cytoband.pixelStart + offset + 1) + ',50' + ' L' + (cytoband.pixelEnd + offset) + ',50 ';
                }
                let path = SVG.addChild(group, 'path', {
                    "d": cytobands_d,
                    "stroke": this.colors[cytobandStain],
//                "stroke": 'red',
                    "stroke-width": 20,
                    "fill": 'none'
                });
            }
        }

        if (typeof cytobandsByStain['acen'] !== 'undefined') {
            let firstStain = cytobandsByStain['acen'][0];
            let lastStain = cytobandsByStain['acen'][1];
            let backrect = SVG.addChild(group, 'rect', {
                'x': (firstStain.pixelStart + offset + 1),
                'y': 39,
                'width': (lastStain.pixelEnd + offset) - (firstStain.pixelStart + offset + 1),
                'height': 22,
                'fill': 'white'
            });
            let firstStainXStart = (firstStain.pixelStart + offset + 1);
            let firstStainXEnd = (firstStain.pixelEnd + offset);
            let lastStainXStart = (lastStain.pixelStart + offset + 1);
            let lastStainXEnd = (lastStain.pixelEnd + offset);
            let path = SVG.addChild(group, 'path', {
                'd': 'M' + firstStainXStart + ',39' + ' L' + (firstStainXEnd - 5) + ',39 ' + ' L' + firstStainXEnd + ',50 ' + ' L ' + (firstStainXEnd - 5) + ',61 ' + ' L ' + firstStainXStart + ',61 z',
                'fill': this.colors['acen']
            });
            path = SVG.addChild(group, 'path', {
                'd': 'M' + lastStainXStart + ',50' + ' L' + (lastStainXStart + 5) + ',39 ' + ' L' + lastStainXEnd + ',39 ' + ' L ' + lastStainXEnd + ',61 ' + ' L ' + (lastStainXStart + 5) + ',61 z',
                'fill': this.colors['acen']
            });
        }


        /**/
        /* Resize elements and events*/
        /**/
        let status = '';
        let centerPosition = _this.region.center();
        let pointerPosition = (centerPosition * _this.pixelBase) + offset;
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


        let positionBoxWidth = _this.region.length() * _this.pixelBase;
        let positionGroup = SVG.addChild(group, 'g');
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
        let downY, downX, moveX, moveY, lastX, increment;

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
                let inc = moveX - downX;
                let newWidth = 0;
                switch (status) {
                    case 'resizePositionBoxLeft' :
                        newWidth = parseInt(_this.positionBox.getAttribute("width")) - inc;
                        if (newWidth > 0) {
                            _this.positionBox.setAttribute("x", parseInt(_this.positionBox.getAttribute("x")) + inc);
                            _this.positionBox.setAttribute("width", newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'resizePositionBoxRight' :
                        newWidth = parseInt(_this.positionBox.getAttribute("width")) + inc;
                        if (newWidth > 0) {
                            _this.positionBox.setAttribute("width", newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'movePositionBox' :

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
                            let w = parseInt(_this.positionBox.getAttribute("width"));
                            let x = parseInt(_this.positionBox.getAttribute("x"));

                            let pixS = x;
                            let pixE = x + w;
                            let bioS = (pixS - offset) / _this.pixelBase;
                            let bioE = (pixE - offset) / _this.pixelBase;

                            _this._triggerRegionChange({region: new Region({chromosome: _this.region.chromosome, start: bioS, end: bioE}), sender: _this});
                        }
                        break;
                    case 'setRegion' :
                        if (downX > offset && downX < (_this.width - offset)) {
                            let w = _this.positionBox.getAttribute("width");

                            let pixS = downX - (w / 2);
                            let pixE = downX + (w / 2);
                            let bioS = (pixS - offset) / _this.pixelBase;
                            let bioE = (pixE - offset) / _this.pixelBase;

                            _this._triggerRegionChange({region: new Region({chromosome: _this.region.chromosome, start: bioS, end: bioE}), sender: _this});
                        }
                        break;
                    case 'selectingRegion' :
                        let bioS = (downX - offset) / _this.pixelBase;
                        let bioE = (moveX - offset) / _this.pixelBase;
                        let start = Math.min(bioS, bioE);
                        let end = Math.max(bioS, bioE);

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
            let overPositionBox = false;
            let movingPositionBox = false;
            let selectingRegion = false;
        });
    }

    _triggerRegionChange(event) {
        let _this = this;
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
    }

    _recalculatePositionBox(region) {
        let genomicLength = region.length();
        let pixelWidth = genomicLength * this.pixelBase;
        let x = (region.start * this.pixelBase) + 20;//20 is the margin
        this.positionBox.setAttribute("x", x);
        this.positionBox.setAttribute("width", pixelWidth);
    }

    _recalculateSelectionBox(region) {
        let genomicLength = region.length();
        let pixelWidth = genomicLength * this.pixelBase;
        let x = (region.start * this.pixelBase) + 20;//20 is the margin
        this.selBox.setAttribute("x", x);
        this.selBox.setAttribute("width", pixelWidth);
    }

    _recalculateResizeControls() {
        let postionBoxX = parseInt(this.positionBox.getAttribute('x'));
        let postionBoxWidth = parseInt(this.positionBox.getAttribute('width'));
        this.resizeLeft.setAttribute('x', postionBoxX - 5);
        this.resizeRight.setAttribute('x', (postionBoxX + postionBoxWidth));
        $(this.resizeLeft).css({"cursor": "ew-resize"});
        $(this.resizeRight).css({"cursor": "ew-resize"});
    }

    _hideResizeControls() {
        this.resizeLeft.setAttribute('visibility', 'hidden');
        this.resizeRight.setAttribute('visibility', 'hidden');
    }

    _showResizeControls() {
        this.resizeLeft.setAttribute('visibility', 'visible');
        this.resizeRight.setAttribute('visibility', 'visible');
    }

    _limitRegionToChromosome(region) {
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > this.chromosomeLength) ? this.chromosomeLength : region.end;
    }

    updateRegionControls() {
        this.selBox.setAttribute("width", 0);
        this.selBox.setAttribute("height", 0);
        this._recalculatePositionBox(this.region);
        this._recalculateResizeControls();
    }

    setRegion(region) {//item.chromosome, item.region

        console.log('region modified chromosome')
        this.region.load(region);
        let needDraw = false;

        if (this.lastChromosome != this.region.chromosome) {
            needDraw = true;
        }
        if (needDraw) {
            this.draw();
        }

        this.updateRegionControls();
    }

    setCellBaseHost(host) {
        this.cellBaseHost = host;
    }
}