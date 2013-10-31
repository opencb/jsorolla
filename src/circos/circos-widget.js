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

function CircosWidget(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("CircosWidget");


    //set default args
    this.radius = 200;
    this.arcWidth = 70;


    //set instantiation args, must be last
    _.extend(this, args);

    this.x = this.width / 2;
    this.y = this.arcWidth - this.radius + 350;

    //events attachments
    this.on(this.handlers);

    this.parent = this.targetId;

    this.colors = {gneg: "white", stalk: "#666666", gvar: "#CCCCCC", gpos25: "silver", gpos33: "lightgrey", gpos50: "gray", gpos66: "dimgray", gpos75: "darkgray", gpos100: "black", gpos: "gray", acen: "blue"};

    if (this.autoRender) {
        this.render();
    }
};

CircosWidget.prototype = {
    render: function () {
        var _this = this;

        this.circumferenceLength = 2 * Math.PI * this.radius;
        console.log("Circumference length: " + this.circumferenceLength);
        this.totalChromosomeSize = 0;

        this.chromosomeCirclesPosition = {};

        this.rendered = false;
        this.svg = SVG.init(this.parent, {
            "width": this.width,
            "height": this.height
        });

        this.minus = SVG.addChild(this.svg, 'circle', {
            "cx": this.x - 20,
            "cy": this.arcWidth * 7,
            "r": 10,
            fill: 'red'
        });

        this.plus = SVG.addChild(this.svg, 'circle', {
            "cx": this.x + 20,
            "cy": this.arcWidth * 7,
            "r": 10,
            fill: 'blue'
        });
        this.g = SVG.addChild(this.svg, 'g');

        var downX, moveX, lastDegree = 0, degree;
        $(this.g).mousedown(function (event) {
            downX = event.clientX;
            $(this).mousemove(function (event) {
                var newX = (downX - event.clientX)
                degree = (newX * 0.2) + lastDegree;
                _this.g.setAttribute('transform', 'rotate(' + degree + ' ' + _this.x + ' ' + _this.y + ')')
            });
        });
        $(this.svg).mouseup(function (event) {
            $(_this.g).off('mousemove');
            downX = null;
            moveX = null;
            lastDegree = degree;
        });

        $(this.minus).click(function () {
            if (_this.radius - 100 > 0) {
                _this.radius -= 100;
                console.log(_this.radius)
                _this.y = _this.arcWidth - _this.radius + 200;
                _this.draw();
            }
        });
        $(this.plus).click(function () {
            _this.radius += 100;
            console.log(_this.radius)
            _this.y = _this.arcWidth - _this.radius + 200;
            _this.draw();
        });

        this.cytobandDashArray = {};
        this.chromosomeList = null;
        this.data2 = null;

    },
    draw: function () {
        var _this = this;
        this.clean();

        this.fetchData();

        //Species
        this.components = [
            {
                id: 'hsapiens',
                position: 0,
                size: 3,
                separation: 1,
                //Chromosomes
                segments: [
                    {
                        id: '5',
                        size: 180915260,
                        separation: 1
                    },
                    {
                        id: '19',
                        size: 59128983,
                        separation: 1
                    }
                ]
            },
            {
                id: 'mmusculus',
                position: 1,
                size: 1,
                separation: 1,
                segments: []
            },
            {
                id: 'cfamiliaris',
                position: 2,
                size: 2,
                separation: 1,
                segments: []
            }
        ];
        this.componentData = {};


        //Paint species
        this.drawComponents(this.components);

        //Paint only chromosomes found in species
        this.drawCytobandTrack(this.chromosomes);

        //Paint features in a chromosome
        var features = [
            {
                id: 'uno',
                component: 'hsapiens',
                segment: '5',
                start: 62072704,
                end: 72073090
            },
            {
                id: 'dos',
                component: 'hsapiens',
                segment: '19',
                start: 0,
                end: 12072704
            }

        ];


        this.drawFeatureTrack(features);
    },
    clean: function () {
        $(this.g).empty();
    },
    _calculateTotalSize: function (items) {
        var totalSize = 0;
        for (var i = 0; i < items.length; i++) {
            totalSize += items[i].size;
        }
        return totalSize;
    },
    _sortFunction: function (a, b) {
        var flag = false;
        if (typeof a.position == 'undefined') {
            a.position = Number.MAX_VALUE;
        }
        if (typeof b.position == 'undefined') {
            b.position = Number.MAX_VALUE;
        }
        return a.position - b.position;
    },
    drawComponents: function (json) {
        json.sort(this._sortFunction);

        var totalSize = this._calculateTotalSize(json);
        var c = 360 / totalSize;
        var angleOffset = 0;
        var component_d = [];
        var segment_d = [];
        var component;
        for (var i = 0; i < json.length; i++) {
            component = json[i];
            component.separation = component.separation || 0;
            component.angleSize = (component.size * c) - component.separation * 2;
            component.angleStart = angleOffset + component.separation;
            angleOffset += component.angleSize;
            component.angleEnd = angleOffset - component.separation;
            angleOffset += component.separation * 2;

            component_d.push(SVG.describeArc(this.x, this.y, this.radius, component.angleStart, component.angleEnd) + ' ');

            this.componentData[component.id] = component;
            this.componentData[component.id]['segmentData'] = {};

            //check segments
            if (typeof component.segments != 'undefined') {
                component.segments.sort(this._sortFunction);
                var totalSegmentsSize = this._calculateTotalSize(component.segments);
                var segmentAngleOffset = 0;
                var c_s = component.angleSize / totalSegmentsSize;
                var segment;
                for (var j = 0; j < component.segments.length; j++) {
                    segment = component.segments[j];
                    segment.separation = segment.separation || 0;
                    segment.angleSize = segment.size * c_s - segment.separation * 2;

                    segment.angleStart = component.angleStart + segmentAngleOffset + segment.separation;
                    segmentAngleOffset += segment.angleSize;
//                    segment.angleEnd = component.angleStart + segmentAngleOffset - segment.separation;
                    segment.angleEnd = segment.angleStart + segment.angleSize;// + segment.separation;
                    segmentAngleOffset += segment.separation;

                    segment_d.push(SVG.describeArc(this.x, this.y, this.radius, segment.angleStart, segment.angleEnd) + ' ');

                    this.componentData[component.id]['segmentData'][segment.id] = segment;
                }
            }

        }

        for (var i = 0; i < component_d.length; i++) {
            var curve = SVG.addChild(this.g, "path", {
                "d": component_d[i],
//                "stroke": 'lightblue',
//                "stroke": Utils.randomColor(),
                "stroke": 'lightblue',
                "stroke-width": this.arcWidth,
                "fill": "none"
            });
        }
        for (var i = 0; i < segment_d.length; i++) {
            var curve = SVG.addChild(this.g, "path", {
                "d": segment_d[i],
//                "stroke": 'lightblue',
//                "stroke": Utils.randomColor(),
                "stroke": 'slategray',
                "stroke-width": this.arcWidth - 20,
                "fill": "none"
            });
        }

        console.log(json)

    },
    drawFeatureTrack: function (features) {
        console.log(features)
        var feature;
        var segmentId;
        var segment;
        var componentId;
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            segmentId = feature.segment;
            componentId = feature.component;
            segment = this.componentData[componentId]['segmentData'][segmentId];
            if (segment) {
                var c = segment.angleSize / segment.size;
                feature.angleStart = feature.start * c + segment.angleStart;
                feature.angleEnd = feature.end * c + segment.angleStart;

                var curve = SVG.addChild(this.g, "path", {
                    "d": SVG.describeArc(this.x, this.y, this.radius + this.arcWidth, feature.angleStart, feature.angleEnd),
//                "stroke": 'lightblue',
                    "paco": feature.start,
                    "stroke": Utils.randomColor(),
                    "stroke-width": 10,
                    "fill": "none"
                });
                $(curve).click(function () {
                    console.log($(this).attr("paco"))
                });
            }
        }

    },
    drawCytobandTrack: function (chromosomes) {
        console.log(chromosomes);
        var species = 'hsapiens';

        var segment;
        var chromosome;
        var cytobands;
        var angleOffset = 0;
        var cytobandsByStain = {};
        for (var i = 0; i < chromosomes.length; i++) {
            chromosome = chromosomes[i];
            segment = this.componentData[species]['segmentData'][chromosome.name];
            if (segment) {
                angleOffset = segment.angleStart;
                console.log(segment.angleSize);
                cytobands = chromosome.cytobands;
                var c = segment.angleSize / segment.size;

                // loop over cytobands
                for (var j = 0; j < cytobands.length; j++) {
                    var cytoband = cytobands[j];

                    cytoband.angleStart = (cytoband.start * c) + angleOffset;
                    cytoband.angleEnd = (cytoband.end * c) + angleOffset;

                    if (typeof cytobandsByStain[cytoband.stain] == "undefined") cytobandsByStain[cytoband.stain] = [];
                    cytobandsByStain[cytoband.stain].push(cytoband);

                }

                for (var cytobandStain in cytobandsByStain) {
                    var cytobands_d = '';
                    for (var j = 0; j < cytobandsByStain[cytobandStain].length; j++) {
                        var cytoband = cytobandsByStain[cytobandStain][j];
                        cytobands_d += SVG.describeArc(this.x, this.y, this.radius, cytoband.angleStart, cytoband.angleEnd) + ' ';
                    }
                    var curve = SVG.addChild(this.g, "path", {
                        "d": cytobands_d,
                        "stroke": this.colors[cytobandStain],
                        "stroke-width": this.arcWidth - 40,
                        "fill": "none"
                    });
                }

                angleOffset += segment.angleSize;
            }
        }


//
//
//        /**/
//        /**/
//
//
//
////        chromosomes = [chromosomes[0]];
////        chromosomes = [chromosomes[0],chromosomes[1]];
//
//        /* Calculate total genome size */
//
//        chromosomes = [chromosomes[0]]
//
//        var genomeSize = 0;
//        var chromosome;
//        for (var i = 0; i < chromosomes.length; i++) {
//            chromosome = chromosomes[i];
//            genomeSize += chromosome.size;
//        }
//
//        var chromosomes_d = [];
//        var c = 180 / genomeSize;
//        var angleOffset = 0;
//        var cytobandsByStain = {};
//
//
//
//        for (var i = 0; i < chromosomes.length; i++) {
//            chromosome = chromosomes[i];
//            chromosome.angleSize = chromosome.size * c;
//            chromosome.angleStart = angleOffset;
//            angleOffset += chromosome.angleSize;
//            chromosome.angleEnd = angleOffset;
//
//            chromosomes_d.push(SVG.describeArc(900, 350, this.radius, chromosome.angleStart, chromosome.angleEnd) + ' ');
//
//            // sort cytobands
//            chromosome.cytobands.sort(function (a, b) {
//                return a.start - b.start;
//            });
//
//            console.log(chromosome.cytobands);
//
//            var b = chromosome.angleSize / chromosome.size;
//
//            var cytobandAngleOffset = 0;
//
//            // loop over cytobands
//            for (var j = 0; j < chromosome.cytobands.length; j++) {
//                var cytoband = chromosome.cytobands[j];
//                cytoband.size = cytoband.end - cytoband.start + 1;
//                cytoband.angleSize = cytoband.size * b;
//                cytoband.angleStart = chromosome.angleStart + cytobandAngleOffset;
//                cytobandAngleOffset += cytoband.angleSize;
//                cytoband.angleEnd = chromosome.angleStart + cytobandAngleOffset;
//
//                if (typeof cytobandsByStain[cytoband.stain] == "undefined") cytobandsByStain[cytoband.stain] = [];
//                cytobandsByStain[cytoband.stain].push(cytoband);
//
//            }
//
//            for (var cytobandStain in cytobandsByStain) {
//                var cytobands_d = '';
//                for (var j = 0; j < cytobandsByStain[cytobandStain].length; j++) {
//                    var cytoband = cytobandsByStain[cytobandStain][j];
//                    cytobands_d += SVG.describeArc(900, 350, this.radius, cytoband.angleStart, cytoband.angleEnd) + ' ';
//                }
//                var curve = SVG.addChild(this.g, "path", {
//                    "d": cytobands_d,
//                    "stroke": this.colors[cytobandStain],
//                    "stroke-width": this.arcWidth,
//                    "fill": "none"
//                });
//            }
//        }
//
//
//        console.log(cytobandsByStain);
//
//
//        for (var i = 0; i < chromosomes_d.length; i++) {
//            var curve = SVG.addChild(this.g, "path", {
//                "d": chromosomes_d[i],
//                "stroke": 'lightblue',
////                "stroke": Utils.randomColor(),
//                "stroke-width": this.arcWidth + 10,
//                "fill": "none"
//            }, 0);
//        }
//
    }

}

CircosWidget.prototype.fetchData = function () {
    var _this = this;
    //para decargarse los datos de la base de datos, de esta forma, copiamos todos los datos en data
    $.ajax({
        url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/genomic/chromosome/all?of=json",
        async: false
    }).done(function (data, b, c) {
            _this.chromosomes = data.response.result.chromosomes;
            _this.trigger('chromosomes:loaded', {chromosomes: _this.chromosomes, sender: _this});
        });
};

CircosWidget.prototype.drawChromosomes = function (chromosomeCirclesPosition) {

    for (var chromosomePosition in chromosomeCirclesPosition) {
//        console.log(chromosomeCirclesPosition[chromosomePosition]);
//        debugger

        for (var cytoband in chromosomeCirclesPosition[chromosomePosition]) {
            console.log(chromosomeCirclesPosition[chromosomePosition][cytoband]);
            var c = SVG.addChild(this.g, "circle", {
                "cx": 350,
                "cy": 350,
                "r": this.radius,
                "stroke": this.colors[cytoband],
                "stroke-width": 35,
                "fill": "none",
                "stroke-dasharray": chromosomeCirclesPosition[chromosomePosition][cytoband]
            });
//            $(c).mouseover(function(){
//                console.log(this)
//            })
        }
    }

};

CircosWidget.prototype.calculateChromosomeCoords = function (chromosomes) {
    this.totalChromosomeSize = 0;
    // we first must calculate the total size of the chromosomes
    for (var i = 0; i < chromosomes.length; i++) {
        this.totalChromosomeSize += chromosomes[i].size;
        break;
    }

    // now we already have the totalChromsomeSize and the circumferenceLength
    this.pixelBase = this.circumferenceLength / this.totalChromosomeSize;
    var accumulated = 0;
    var _stain;
//    var prevCytobandStain = "";
    var prevCytoband = {};
    var currentCytobandStain = "";
    var currentCytobandStart = "";
    var currentCytobandEnd = "";

    for (var i = 0; i < chromosomes.length; i++) {
        accumulated = 0
        if (typeof this.chromosomeCirclesPosition[chromosomes[i].name] == "undefined") {
            this.chromosomeCirclesPosition[chromosomes[i].name] = {};
        }

        // sort cytobands
        chromosomes[i].cytobands.sort(function (a, b) {
            return a.start - b.start;
        });

        prevCytoband = {};
        for (var j = 0; j < chromosomes[i].cytobands.length; j++) {
            currentCytobandStain = chromosomes[i].cytobands[j].stain;
            currentCytobandStart = chromosomes[i].cytobands[j].start;
            currentCytobandEnd = chromosomes[i].cytobands[j].end;

            if (typeof this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain] == "undefined") {
                this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain] = [];
                console.log("1: " + currentCytobandStain);

                if (currentCytobandStart != 1) {
                    this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain].push(0);
                    console.log("1.1");
                    this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain].push((currentCytobandStart - 1) * this.pixelBase);

                    this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain].push((currentCytobandEnd - currentCytobandStart + 1) * this.pixelBase);
                    accumulated += (currentCytobandEnd - currentCytobandStart + 1) * this.pixelBase;
                } else {
                    console.log("1.2");
                    this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain].push((currentCytobandEnd - currentCytobandStart + 1) * this.pixelBase);
                    accumulated += (currentCytobandEnd - currentCytobandStart + 1) * this.pixelBase;

                }
                _stain = currentCytobandStain;
            } else {
                console.log("2");
                this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain].push((currentCytobandStart - prevCytoband[currentCytobandStain].end + 1) * this.pixelBase);

                this.chromosomeCirclesPosition[chromosomes[i].name][currentCytobandStain].push((currentCytobandEnd - currentCytobandStart + 1) * this.pixelBase);
                accumulated += (currentCytobandEnd - currentCytobandStart + 1) * this.pixelBase;

                _stain = currentCytobandStain;
            }

//            prevCytobandStain = currentCytobandStain;
            prevCytoband[currentCytobandStain] = chromosomes[i].cytobands[j];
        }

        for (var cyto in prevCytoband) {
            console.log(cyto);
            if (chromosomes[i].end != prevCytoband[cyto].end) {
                this.chromosomeCirclesPosition[chromosomes[i].name][cyto].push((chromosomes[i].end - prevCytoband[cyto].end) * this.pixelBase);
            }
        }


        this.chromosomeCirclesPosition[chromosomes[i].name][_stain].push(this.circumferenceLength - accumulated);
        console.log("accum: " + accumulated);
        break;
    }

    console.log(this.chromosomeCirclesPosition);
};

CircosWidget.prototype.drawCirco = function () {
    var _this = this;

    this.fetchData();

//    this.calculateChromosomeCoords(this.chromosomes);

    this.drawChromosomes2(this.chromosomes);

//    this._drawSvg(this.chromosomes);

//	var sortfunction = function(a, b) {
//		var IsNumber = true;
//		for (var i = 0; i < a.length && IsNumber == true; i++) {
//			if (isNaN(a[i])) {
//				IsNumber = false;
//			}
//		}
//		if (!IsNumber) return 1;
//		return (a - b);
//	};

//    http://ws-beta.bioinfo.cipf.es/cellbasebeta2/rest/v3/hsapiens/genomic/chromosome/all?of=json
//	var cellBaseManager = new CellBaseManager(this.species);
// 	cellBaseManager.success.addEventListener(function(sender,data){
// 		_this.chromosomeList = data.result;
// 		_this.chromosomeList.sort(sortfunction);
// 		var cellBaseManager2 = new CellBaseManager(_this.species);
// 		cellBaseManager2.success.addEventListener(function(sender,data2){
// 			_this.data2 = data2;
// 			_this._drawSvg(_this.chromosomeList,data2);
// 		});
// 		cellBaseManager2.get("genomic", "region", _this.chromosomeList.toString(),"cytoband");
// 	});
// 	cellBaseManager.get("feature", "karyotype", "none", "chromosome");

};

CircosWidget.prototype._drawSvg = function (chromosomeList, data2) {
    var _this = this;

    var x = 20;
    var xOffset = _this.width / chromosomeList.length;
    var yMargin = 2;

    ///////////
    var biggerChr = 0;
    var totalLenght = 0;
    for (var i = 0, len = chromosomeList.length; i < len; i++) {
        var size = 1;//data2.result[i][data2.result[i].length-1].end;
        if (size > biggerChr) biggerChr = size;
        totalLenght += size;
    }
    _this.pixelBase = (_this.circumferenceLength ) / totalLenght;
    _this.chrOffsetY = {};
    _this.chrOffsetX = {};

    console.log("Circle lenght: " + _this.circumferenceLength);
    console.log("Pixelbase: " + _this.pixelBase);

    this.stainGenomicPositions = {};
    this.stainsByChr = {};

    var chrSizeTotal = 0;
    for (var i = 0, len = chromosomeList.length; i < len; i++) { //loop over chromosomes
        var chr = data2.result[i][0].chromosome;
        chrSize = data2.result[i][data2.result[i].length - 1].end * _this.pixelBase - 2;
        chrSizeTotal += chrSize;
        console.log(chrSize);

//		var y = yMargin + (biggerChr * _this.pixelBase) - chrSize;
//		_this.chrOffsetY[chr] = y;


        for (var j = 0, lenJ = data2.result[i].length; j < lenJ; j++) { //loop over chromosome objects
            var cytobandWidth = _this.pixelBase * (data2.result[i][j].end - data2.result[i][j].start);
            var width = 13;

            var stain = data2.result[i][j].stain;
            var color = _this.colors[stain];
            if (color == null) color = "purple";

            if (this.stainsByChr[chr] == undefined) this.stainsByChr[chr] = [];

            if (this.cytobandDashArray[stain] == undefined) this.cytobandDashArray[stain] = [];
            this.cytobandDashArray[stain].push(cytobandWidth);

            if (this.stainGenomicPositions[stain] == undefined) this.stainGenomicPositions[stain] = [];
            var cytobandObj = {
                'stain': stain,
//                'chr': data2.result[i][j].chromosome,
                'start': data2.result[i][j].start,
                'end': data2.result[i][j].end
            };
            this.stainGenomicPositions[stain].push(cytobandObj);

//            y += cytobandWidth;
        }


        _this.chrOffsetX[chr] = x;
        x += xOffset;
    }

    console.log(chrSizeTotal);

//    console.log(this.stainGenomicPositions);

    for (var stain in this.stainGenomicPositions) {
        console.log(stain);
        console.log(this.stainGenomicPositions[stain]);

        if (stain == 'gvar') //TODO borrar
            for (var i = 0; i < this.stainGenomicPositions[stain].length; i++) {
                console.log(this.stainGenomicPositions[stain][i]);

            }
    }


//	_this.positionBox = SVG.addChild(_this.g,"line",{
//		"x1":_this.chrOffsetX[_this.region.chromosome]-10,
//		"y1":pointerPosition + _this.chrOffsetY[_this.region.chromosome],
//		"x2":_this.chrOffsetX[_this.region.chromosome]+23,
//		"y2":pointerPosition + _this.chrOffsetY[_this.region.chromosome],
//		"stroke":"orangered",
//		"stroke-width":2,
//		"opacity":0.5
//	});

    _this.rendered = true;
    _this.afterRender.notify();
};


//CircosWidget.prototype.setRegion = function(item){//item.chromosome, item.position, item.species
//	var needDraw = false;
//	if(item.species!=null){
//		this.species = item.species;
//		needDraw = true;
//	}
//	if(item.species==null){
//		this.positionBox.setAttribute("x1",this.chrOffsetX[this.region.chromosome]-10);
//		this.positionBox.setAttribute("x2",this.chrOffsetX[this.region.chromosome]+23);
//	}
//
//	var centerPosition = this.region.center();
//	if(!isNaN(centerPosition)){
//		if(item.species==null){
//			var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
//			this.positionBox.setAttribute("y1", pointerPosition);
//			this.positionBox.setAttribute("y2", pointerPosition);
//		}
//	}
//	if(needDraw){
////		$(this.g).empty();
//		while (this.g.firstChild) {
//			this.g.removeChild(this.g.firstChild);
//		}
//		this.drawKaryotype();
//	}
//};


//CircosWidget.prototype.updatePositionBox = function(){
//	this.positionBox.setAttribute("x1",this.chrOffsetX[this.region.chromosome]-10);
//	this.positionBox.setAttribute("x2",this.chrOffsetX[this.region.chromosome]+23);
//
//	var centerPosition = Compbio.centerPosition(this.region);
//	var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
//	this.positionBox.setAttribute("y1",pointerPosition);
//	this.positionBox.setAttribute("y2",pointerPosition);
//};

//CircosWidget.prototype.addMark = function(item){//item.chromosome, item.position
//	var _this = this;
//
//	var mark = function (){
//
//		if(item.chromosome!=null && item.start!=null){
//			if(_this.chrOffsetX[item.chromosome]!= null){
//				var x1 = _this.chrOffsetX[item.chromosome]-10;
//				var x2 = _this.chrOffsetX[item.chromosome];
//				var y1 = (item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome]) - 4;
//				var y2 = item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome];
//				var y3 = (item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome]) + 4;
//				var points = x1+","+y1+" "+x2+","+y2+" "+x1+","+y3+" "+x1+","+y1;
//				SVG.addChild(_this.markGroup,"polyline",{
//					"points":points,
//					"stroke":"black",
//					"opacity":0.8,
//					"fill":"#33FF33"
//				});
//			}
//		}
//	};
//
//	if(this.rendered){
//		mark();
//	}else{
//		this.afterRender.addEventListener(function(sender,data){
//			mark();
//		});
//	}
//};
//
//CircosWidget.prototype.unmark = function(){
////	$(this.markGroup).empty();
//	while (this.markGroup.firstChild) {
//		this.markGroup.removeChild(this.markGroup.firstChild);
//	}
//};


CircosWidget.prototype.test = function () {


//    var polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
//        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
//
//        return {
//            x: centerX + (radius * Math.cos(angleInRadians)),
//            y: centerY + (radius * Math.sin(angleInRadians))
//        };
//    }
//
//    var describeArc = function (x, y, radius, startAngle, endAngle) {
//
//        var start = polarToCartesian(x, y, radius, endAngle);
//        var end = polarToCartesian(x, y, radius, startAngle);
//
//        var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
//
//        var d = [
//            "M", start.x, start.y,
//            "A", radius, radius, 0, arcSweep, 0, end.x, end.y
//        ].join(" ");
//
//        return d;
//    }

    var lc = 2 * Math.PI * 100;
    var circle = SVG.addChild(this.g, "circle", {
        "cx": 500,
        "cy": 200,
        "r": 100,
        "stroke": 'black',
        "stroke-width": 10,
        "fill": "none",
        "stroke-dasharray": '40,' + lc
    });
    var circle = SVG.addChild(this.g, "circle", {
        "cx": 500,
        "cy": 200,
        "r": 130,
        "stroke": 'orange',
        "stroke-width": 10,
        "fill": "none",
        "stroke-dasharray": '0,100,' + lc
    });
//    var circle = SVG.addChild(this.g,"circle",{
//        "cx":400,
//        "cy":400,
//        "r":80,
//        "stroke":'black',
//        "stroke-width":10,
//        "fill":"none",
//        "stroke-dasharray": "10,50,20,400"
//    });
    $(circle).mouseover(function () {
        console.log(lc);
        console.log(this)
    });

//    var path = SVG.addChild(this.g,"path",{
//        "stroke":'black',
//        "stroke-width":20,
//        "d":'M 500 100 l 0 50 l 100 0 l 0 -50 m 50 0 l 0 50 100 0 l 0 -50 z',
//        "fill":"orange"
//    });
//
//    $(path).mouseover(function(){
//        console.log(this)
//    });

//    var curve = SVG.addChild(this.g,"path",{
//        "d":describeArc(200, 200, 100, 270, 90),
//        "stroke":'orangered',
//        "stroke-width":10,
//        "fill":"none",
//        "stroke-dasharray": "10,50,20,400"
//
//    });


    var curve = SVG.addChild(this.g, "path", {
        "d": describeArc(500, 500, 80, 60.8, 61) + "  " + describeArc(500, 500, 85, 60, 110),
        "stroke": 'orangered',
        "stroke-width": 2,
        "fill": "none"

    });

    $(curve).mouseover(function () {
        console.log(this)
    });
};
