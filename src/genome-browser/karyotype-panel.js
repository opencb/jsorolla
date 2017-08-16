/**
 * Created by agaor on 14/08/17.
 */
class KaryotypePanel {

    constructor(args) {
        Object.assign(this, Backbone.Events);

        this.target;
        this.autoRender = true;
        this.id = Utils.genId('KaryotypePanel');

        this.client;

        this.pixelBase;
        this.species;
        this.width = 600;
        this.height = 75;
        this.collapsed = false;
        this.collapsible = true;
        this.hidden = false;

        //set instantiation args, must be last
        Object.assign(this, args);

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


        if (typeof this.chromosomeList !== 'undefined') {
            this.clean();
            this._drawSvg(this.chromosomeList, this.data2);
        }
    }

    render() {
        let _this = this;

        this.div = $('<div id="karyotype-panel"></div>')[0];

        if ('title' in this && this.title !== '') {

            let titleDiv = $('<div id="tl-title" class="ocb-gv-panel-title unselectable"></div>')[0];
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
    }

    setSpecies (species) {
        this.lastSpecies = this.species;
        this.species = species;
    }

    clean() {
        $(this.svg).empty();
    }

    draw () {
        let _this = this;
        this.targetDiv = ( this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.clean();

        let sortfunction = function (a, b) {
            let IsNumber = true;
            for (let i = 0; i < a.name.length && IsNumber == true; i++) {
                if (isNaN(a.name[i])) {
                    IsNumber = false;
                }
            }
            if (!IsNumber) return 1;
            return (a.name - b.name);
        };

        this.client.get("genomic", "chromosome", undefined, "search")
            .then(function (data) {
                _this.chromosomeList = data.response[0].result[0].chromosomes;
                _this.chromosomeList.sort(sortfunction);
                _this._drawSvg(_this.chromosomeList);
            });

        if (this.collapsed) {
            _this.hideContent();
        }
    }

    _drawSvg(chromosomeList) {
        let _this = this;

        let x = 20;
        let xOffset = _this.width / chromosomeList.length;
        let yMargin = 2;

        ///////////
        let biggerChr = 0;
        for (let i = 0, len = chromosomeList.length; i < len; i++) {
            let size = chromosomeList[i].size;
            if (size > biggerChr) {
                biggerChr = size;
            }
        }
        _this.pixelBase = (_this.height - 10) / biggerChr;
        _this.chrOffsetY = {};
        _this.chrOffsetX = {};

        for (let i = 0, len = chromosomeList.length; i < len; i++) { //loop over chromosomes
            let chromosome = chromosomeList[i];

            let chrSize = chromosome.size * _this.pixelBase;
            let y = yMargin + (biggerChr * _this.pixelBase) - chrSize;
            _this.chrOffsetY[chromosome.name] = y;
            let firstCentromere = true;


            let group = SVG.addChild(_this.svg, "g", {"cursor": "pointer", "chr": chromosome.name});
            $(group).click(function (event) {
                let chrClicked = this.getAttribute("chr");
                //			for ( var k=0, len=chromosomeList.length; k<len; k++) {
                //			var offsetX = (event.pageX - $(_this.svg).offset().left);
                //			if(offsetX > _this.chrOffsetX[chromosomeList[k]]) chrClicked = chromosomeList[k];
                //			}

                let offsetY = (event.pageY - $(_this.svg).offset().top);
                //			var offsetY = event.originalEvent.layerY - 3;

                let clickPosition = parseInt((offsetY - _this.chrOffsetY[chrClicked]) / _this.pixelBase);
                let region = new Region({
                    chromosome: chrClicked,
                    start: clickPosition,
                    end: clickPosition
                });
                _this._triggerRegionChange({region: region, sender: _this});
            });

            for (let j = 0, lenJ = chromosome.cytobands.length; j < lenJ; j++) { //loop over chromosome objects
                let cytoband = chromosome.cytobands[j];
                let height = _this.pixelBase * (cytoband.end - cytoband.start);
                let width = 13;

                let color = _this.colors[cytoband.stain];
                if (color == null) color = "purple";

                if (cytoband.stain == "acen") {
                    let points = "";
                    let middleX = x + width / 2;
                    let middleY = y + height / 2;
                    let endX = x + width;
                    let endY = y + height;
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
            let text = SVG.addChild(_this.svg, "text", {
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
    }

    _triggerRegionChange(event) {
        let _this = this;
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
    }

    _recalculatePositionBox(region) {
        let centerPosition = region.center();
        let pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[region.chromosome];
        this.positionBox.setAttribute("x1", this.chrOffsetX[region.chromosome] - 10);
        this.positionBox.setAttribute("x2", this.chrOffsetX[region.chromosome] + 23);
        this.positionBox.setAttribute("y1", pointerPosition);
        this.positionBox.setAttribute("y2", pointerPosition);
    }

    updateRegionControls () {
        this._recalculatePositionBox(this.region);
    }

    setRegion (region) {//item.chromosome, item.position, item.species
        this.region.load(region);
        let needDraw = false;

        if (this.lastSpecies != this.species) {
            needDraw = true;
            this.lastSpecies = this.species;
        }
        if (needDraw) {
            this.draw();
        }

        this.updateRegionControls();
    }


//    updatePositionBox: function () {
//        this.positionBox.setAttribute("x1", this.chrOffsetX[this.region.chromosome] - 10);
//        this.positionBox.setAttribute("x2", this.chrOffsetX[this.region.chromosome] + 23);
//
//        var centerPosition = Utils.centerPosition(this.region);
//        var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
//        this.positionBox.setAttribute("y1", pointerPosition);
//        this.positionBox.setAttribute("y2", pointerPosition);
//    },

    addMark (item) {//item.chromosome, item.position
        let _this = this;

        let mark = function () {
            if (_this.region.chromosome != null && _this.region.start != null) {
                if (_this.chrOffsetX[_this.region.chromosome] != null) {
                    let x1 = _this.chrOffsetX[_this.region.chromosome] - 10;
                    let x2 = _this.chrOffsetX[_this.region.chromosome];
                    let y1 = (_this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome]) - 4;
                    let y2 = _this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome];
                    let y3 = (_this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome]) + 4;
                    let points = x1 + "," + y1 + " " + x2 + "," + y2 + " " + x1 + "," + y3 + " " + x1 + "," + y1;
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
    }

    unmark () {
        $(this.markGroup).empty();
    }

    setCellBaseHost (host) {
        this.cellBaseHost = host;
    }

}

