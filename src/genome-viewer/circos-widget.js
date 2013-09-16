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
    this.x = 250;
    this.y = 250;
    this.arcWidth = 35;

    //set instantiation args, must be last
    _.extend(this, args);

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

        this.circumferenceLength = 2 * Math.PI * this.radius;
        console.log("Circumference length: " + this.circumferenceLength);
        this.totalChromosomeSize = 0;

        this.chromosomeCirclesPosition = {};

        this.rendered = false;
        this.svg = SVG.init(this.parent, {
            "width": this.width,
            "height": this.height
        });

        this.markGroup = SVG.addChild(this.svg, "g", {"cursor": "pointer"});
        this.cytobandDashArray = {};
        this.chromosomeList = null;
        this.data2 = null;

    },
    draw: function () {
        this.fetchData();
        this.drawGeneric([
            {
                id: 'hsapiens',
                position: 8,
                size: 3
            },
            {
                id: 'mmusculus',
                size: 1
            },
            {
                id: 'cfamiliaris',
                position:0,
                size: 2
            }
        ]);
    },
    drawGeneric: function (json) {
        json.sort(function (a, b) {
            var flag = false;
            if (typeof a.position == 'undefined') {
                a.position = Number.MAX_VALUE;;
            }
            if (typeof b.position == 'undefined') {
                b.position = Number.MAX_VALUE;;
            }
            return a.position - b.position;
        });

        var component;
        var totalSize = 0;
        for (var i = 0; i < json.length; i++) {
            component = json[i];
            totalSize += component.size;
        }

        var c = 360 / totalSize;
        var angleOffset = 0;
        var component_d = [];
        for (var i = 0; i < json.length; i++) {
            component = json[i];
            component.angleSize = component.size * c;
            component.angleStart = angleOffset;
            angleOffset += component.angleSize;
            component.angleEnd = angleOffset;

            component_d.push(SVG.describeArc(this.x, this.y, this.radius, component.angleStart, component.angleEnd) + ' ');
        }

        for (var i = 0; i < component_d.length; i++) {
            var curve = SVG.addChild(this.svg, "path", {
                "d": component_d[i],
//                "stroke": 'lightblue',
                "stroke": Utils.randomColor(),
                "stroke-width": this.arcWidth,
                "fill": "none"
            });
        }

        console.log(json)

    },
    drawChromosomes2: function (chromosomes) {

//        chromosomes = [chromosomes[0]];
//        chromosomes = [chromosomes[0],chromosomes[1]];

        /* Calculate total genome size */
        var genomeSize = 0;
        var chromosome;
        for (var i = 0; i < chromosomes.length; i++) {
            chromosome = chromosomes[i];
            genomeSize += chromosome.size;
        }

        var chromosomes_d = [];
        var c = 360 / genomeSize;
        var angleOffset = 0;
        var cytobandsByStain = {};

        for (var i = 0; i < chromosomes.length; i++) {
            chromosome = chromosomes[i];
            chromosome.angleSize = chromosome.size * c;
            chromosome.angleStart = angleOffset;
            angleOffset += chromosome.angleSize;
            chromosome.angleEnd = angleOffset;

            chromosomes_d.push(SVG.describeArc(250, 250, this.radius, chromosome.angleStart, chromosome.angleEnd) + ' ');
            // sort cytobands
            chromosome.cytobands.sort(function (a, b) {
                return a.start - b.start;
            });

            var b = chromosome.angleSize / chromosome.size;

            var cytobandAngleOffset = 0;

            // loop over cytobands
            for (var j = 0; j < chromosome.cytobands.length; j++) {
                var cytoband = chromosome.cytobands[j];
                cytoband.size = cytoband.end - cytoband.start + 1;
                cytoband.angleSize = cytoband.size * b;
                cytoband.angleStart = chromosome.angleStart + cytobandAngleOffset;
                cytobandAngleOffset += cytoband.angleSize;
                cytoband.angleEnd = chromosome.angleStart + cytobandAngleOffset;

                if (typeof cytobandsByStain[cytoband.stain] == "undefined") cytobandsByStain[cytoband.stain] = [];
                cytobandsByStain[cytoband.stain].push(cytoband);

            }

            for (var cytobandStain in cytobandsByStain) {
                var cytobands_d = '';
                for (var j = 0; j < cytobandsByStain[cytobandStain].length; j++) {
                    var cytoband = cytobandsByStain[cytobandStain][j];
                    cytobands_d += SVG.describeArc(250, 250, this.radius, cytoband.angleStart, cytoband.angleEnd) + ' ';
                }
                var curve = SVG.addChild(this.svg, "path", {
                    "d": cytobands_d,
                    "stroke": this.colors[cytobandStain],
                    "stroke-width": this.arcWidth,
                    "fill": "none"
                });
            }
        }


        console.log(cytobandsByStain);


        for (var i = 0; i < chromosomes_d.length; i++) {
            var curve = SVG.addChild(this.svg, "path", {
                "d": chromosomes_d[i],
                "stroke": 'lightblue',
//                "stroke": Utils.randomColor(),
                "stroke-width": this.arcWidth + 10,
                "fill": "none"
            }, 0);
        }

    }

}

CircosWidget.prototype.fetchData = function () {
    var _this = this;
    //para decargarse los datos de la base de datos, de esta forma, copiamos todos los datos en data
    $.ajax({
        url: "http://ws-beta.bioinfo.cipf.es/cellbasebeta2/rest/v3/hsapiens/genomic/chromosome/all?of=json",
        async: false
    }).done(function (data, b, c) {
            _this.chromosomes = data.result.result[0].chromosomes;
            _this.trigger('chromosomes:loaded', {chromosomes: _this.chromosomes, sender: _this});
        });
};

CircosWidget.prototype.drawChromosomes = function (chromosomeCirclesPosition) {

    for (var chromosomePosition in chromosomeCirclesPosition) {
//        console.log(chromosomeCirclesPosition[chromosomePosition]);
//        debugger

        for (var cytoband in chromosomeCirclesPosition[chromosomePosition]) {
            console.log(chromosomeCirclesPosition[chromosomePosition][cytoband]);
            var c = SVG.addChild(this.svg, "circle", {
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


//	_this.positionBox = SVG.addChild(_this.svg,"line",{
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
////		$(this.svg).empty();
//		while (this.svg.firstChild) {
//			this.svg.removeChild(this.svg.firstChild);
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
    var circle = SVG.addChild(this.svg, "circle", {
        "cx": 500,
        "cy": 200,
        "r": 100,
        "stroke": 'black',
        "stroke-width": 10,
        "fill": "none",
        "stroke-dasharray": '40,' + lc
    });
    var circle = SVG.addChild(this.svg, "circle", {
        "cx": 500,
        "cy": 200,
        "r": 130,
        "stroke": 'orange',
        "stroke-width": 10,
        "fill": "none",
        "stroke-dasharray": '0,100,' + lc
    });
//    var circle = SVG.addChild(this.svg,"circle",{
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

//    var path = SVG.addChild(this.svg,"path",{
//        "stroke":'black',
//        "stroke-width":20,
//        "d":'M 500 100 l 0 50 l 100 0 l 0 -50 m 50 0 l 0 50 100 0 l 0 -50 z',
//        "fill":"orange"
//    });
//
//    $(path).mouseover(function(){
//        console.log(this)
//    });

//    var curve = SVG.addChild(this.svg,"path",{
//        "d":describeArc(200, 200, 100, 270, 90),
//        "stroke":'orangered',
//        "stroke-width":10,
//        "fill":"none",
//        "stroke-dasharray": "10,50,20,400"
//
//    });


    var curve = SVG.addChild(this.svg, "path", {
        "d": describeArc(500, 500, 80, 60.8, 61) + "  " + describeArc(500, 500, 85, 60, 110),
        "stroke": 'orangered',
        "stroke-width": 2,
        "fill": "none"

    });

    $(curve).mouseover(function () {
        console.log(this)
    });
};
