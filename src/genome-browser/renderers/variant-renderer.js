/**
 * Stateless (or almost) object to render variants.
 *
 * If you have a svg element where you want to draw, pass it to VariantRenderer.init()
 * and later, in each VariantRenderer.render() as args.svgCanvasFeatures.
 *
 * @type {Renderer}
 */
class VariantRenderer extends Renderer {

    constructor(args) {
        super(args);
        //Extend and add Backbone Events
        Object.assign(this, Backbone.Events);

        this.fontClass = "ocb-font-roboto ocb-font-size-11";
        this.toolTipfontClass = "ocb-tooltip-font";

        if (_.isObject(args)) {
            Object.assign(this, args);
        }

        this.on(this.handlers);
    }


    init(svgGroup, sample) {
        //Prevent browser context menu

        let _this = this;
        console.log(this.track.main);
        $(svgGroup).contextmenu(function (e) {
            console.log("right click");
            e.preventDefault();
        });

        let samplesname = _.isFunction(_this.sampleNames) ? _this.sampleNames(feature) : _this.sampleNames;
        console.log("Probando el samplesnames");
        console.log(samplesname);

        let studies = Object.keys(samplesname); // is possible there are letious studies
        let y = 8;
        for (let i = 0; i < studies.length; i++) {
            let samplesinstudy = samplesname[studies[i]];
            for (let j = 0; j < samplesinstudy.length; j++) {

                let sample = SVG.addChild(this.track.main, "text", {
                    "x": 0,
                    "y": y,
                    "stroke": "black",
                    "stroke-width": 1,
                    "font-size": "8",
                    "cursor": "pointer"
                });
                y += 10;

                sample.textContent = samplesinstudy[j];
                $(sample).click(function (event) {
                    // $(this).css({"strokeWidth":"3","stroke":"#ff7200"}).hide(100).show(500).css({"stroke":"#51c000"})});
                    // amarillo FCFC92
                    let label = $(this);
                    //label.css({"stroke":"#ff7200"}).hide(100).show(500).css({"stroke":"#ff7200"});

                    //POSIBILIDAD 1
                    //let rect = SVG.addChild(_this.track.main,  "rect",{
                    //    'x': 0,
                    //    'y': label[0].y.baseVal[0].value-7,
                    //    'width': _this.track.width,
                    //    'height': 8,
                    //    'stroke': '#FFFF00',
                    //    'fill': '#FCFC92'
                    //});
                    //$(rect).css({"z-index": -1});

                    //POSIBILIDAD 2
                    let yrect = label[0].y.baseVal[0].value - 7;
                    if (this.getAttribute("stroke") === "black") {
                        label.css({"stroke": "#ff7200"}).hide(100).show(500).css({"stroke": "#ff7200"});
                        this.setAttribute("stroke", "#ff7200");
                        let rect = SVG.create("rect", {
                            "x": 0,
                            "y": yrect,
                            "width": _this.track.width,
                            "height": 8,
                            "stroke": "#FFFF00",
                            "fill": "#F2F5A9",
                            "opacity": 0.5
                        });
                        rect.setAttribute("id", this.innerHTML + "_rect" + yrect);
                        _this.track.main.insertBefore(rect, this);
                    } else {
                        let rect = document.getElementById(this.innerHTML + "_rect" + yrect);
                        rect.parentNode.removeChild(rect);
                        this.setAttribute("stroke", "black");
                        label.css({"stroke": "black"});
                    }

                    //let divpadre = _this.track.main.parentNode;
                    //let selBox = $('<div id="' + this.id + 'selBox"></div>')[0];
                    //divpadre.append(selBox);
                    //$(selBox).css({
                    //    'z-index': 0,
                    //    'position': 'absolute',
                    //    'left': 0,
                    //    'top': label[0].y.baseVal[0].value-8,
                    //    'height': 8,
                    //    'width':'100%',
                    //    'border': '2px solid #FFFF00',
                    //    'opacity': 0.5,
                    //    //'visibility': 'hidden',
                    //    'background-color': '#F2F5A9'
                    //});
                    //$(selBox).click(function(event){
                    //    this.parentNode.removeChild(this);
                    //});
                });
            }
        }

    }

    render(features, args) {

        //for (var i = 0, leni = features.length; i < leni; i++) {
        //    for (var j = 0; j < features[i].length; j++) {
        //        var feature = features[i][j];
        //        this.draw(feature, args);
        //    }
        //}

        for (let i = 0, leni = features.length; i < leni; i++) {

            let feature = features[i];
            this.draw(feature, args);

        }
    }

    draw(feature, args) {

        let _this = this;
        //get feature render configuration
        let color = _.isFunction(_this.color) ? _this.color(feature) : _this.color;
        let label = _.isFunction(_this.label) ? _this.label(feature) : _this.label;
        let height = _.isFunction(_this.height) ? _this.height(feature) : _this.height;
        let tooltipTitle = _.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(feature) : _this.tooltipTitle;
        let tooltipText = _.isFunction(_this.tooltipText) ? _this.tooltipText(feature) : _this.tooltipText;
        let infoWidgetId = _.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(feature) : _this.infoWidgetId;

        //get feature genomic information
        let start = feature.start;
        let end = feature.end;
        let length = (end - start) + 1;

        //check genomic length
        length = (length < 0) ? Math.abs(length) : length;
        length = (length === 0) ? 1 : length;

        //transform to pixel position
        let width = length * args.pixelBase;

        let svgLabelWidth = _this.getLabelWidth(label, args);
        //calculate x to draw svg rect
        let x = _this.getFeatureX(start, args);
        // debugger
        let maxWidth = Math.max(width, 2);
        let textHeight = 0;
        if (args.regionSize < args.maxLabelRegionSize) {
            textHeight = 9;
            maxWidth = Math.max(width, svgLabelWidth);
        }


        let rowY = 0;
        let textY = textHeight + height;
        let rowHeight = textHeight + height + 2;


        //        azul osucuro: 0/0
        //        negro: ./.
        //        rojo: 1/1
        //        naranja 0/1

        let d00 = "";
        let dDD = "";
        let d11 = "";
        let d01 = "";
        let xs = x;         // x start
        let xe = x + width; // x end
        let ys = 1;         // y
        let yi = 8;         // y increment
        let yi2 = 10;       // y increment

        //    debugger
        //    for (let i = 0, leni = feature.samples.length; i < leni; i++) {
        let samplesCount = 0;
        //    var indices = [];
        for (let i in feature.studies) {
            for (let j in feature.studies[i].samplesData) {
                //            indices.push(j);
                args.renderedArea[ys] = new FeatureBinarySearchTree();
                args.renderedArea[ys].add({start: xs, end: xe});
                //            var genotype = Math.round(Math.random()) + "/" + Math.round(Math.random()); // FIXME put in real values

                let genotype = feature.studies[i].samplesData[j]["0"];
                switch (genotype) {
                    case "0|0":
                    case "0/0":
                        d00 += "M" + xs + "," + ys + " L" + xe + "," + ys + " ";
                        d00 += "L" + xe + "," + (ys + yi) + " L" + xs + "," + (ys + yi) + " z ";
                        break;
                    case ".|.":
                    case "./.":
                        dDD += "M" + xs + "," + ys + " L" + xe + "," + ys + " ";
                        dDD += "L" + xe + "," + (ys + yi) + " L" + xs + "," + (ys + yi) + " z ";
                        break;
                    case "1|1":
                    case "1/1":
                        d11 += "M" + xs + "," + ys + " L" + xe + "," + ys + " ";
                        d11 += "L" + xe + "," + (ys + yi) + " L" + xs + "," + (ys + yi) + " z ";
                        break;
                    case "0|1":
                    case "0/1":
                    case "1|0":
                    case "1/0":
                        d01 += "M" + xs + "," + ys + " L" + xe + "," + ys + " ";
                        d01 += "L" + xe + "," + (ys + yi) + " L" + xs + "," + (ys + yi) + " z ";
                        break;
                }
                samplesCount++;
                ys += yi2;
            }
        }

        let featureGroup = SVG.addChild(args.svgCanvasFeatures, "g", {"feature_id": feature.id});
        let dummyRect = SVG.addChild(featureGroup, "rect", {
            "x": xs,
            "y": 1,
            "width": width,
            "height": ys,
            "fill": "transparent",
            "cursor": "pointer"
        });
        if (d00 !== "") {
            let path = SVG.addChild(featureGroup, "path", {
                "d": d00,
                "fill": "blue",
                "cursor": "pointer"
            });
        }
        if (dDD !== "") {
            let path = SVG.addChild(featureGroup, "path", {
                "d": dDD,
                "fill": "black",
                "cursor": "pointer"
            });
        }
        if (d11 !== "") {
            let path = SVG.addChild(featureGroup, "path", {
                "d": d11,
                "fill": "red",
                "cursor": "pointer"
            });
        }
        if (d01 !== "") {
            let path = SVG.addChild(featureGroup, "path", {
                "d": d01,
                "fill": "orange",
                "cursor": "pointer"
            });
        }

        //debugger
        let lastSampleIndex = 0;
        $(featureGroup).qtip({
            //        content: {text: tooltipText + '<br>' + feature.files[lastSampleIndex], title: tooltipTitle},
            content: {text: tooltipText + "<br>" + samplesCount + " samples", title: tooltipTitle},
            //                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
            position: {target: "mouse", adjust: {x: 25, y: 15}},
            style: {width: true, classes: _this.toolTipfontClass + " ui-tooltip ui-tooltip-shadow"},
            show: {delay: 300},
            hide: {delay: 300}
        });

        $(featureGroup).mousemove(function (event) {
            let sampleIndex = parseInt(event.offsetY / yi2);
            if (sampleIndex !== lastSampleIndex) {
                console.log(sampleIndex);
                samplesCount = 0;
                let sampleName = "";
                let found = false;
                for (let i in feature.studies) {
                    for (let j in feature.studies[i].samplesData) {   // better search it up than storing it? memory could be an issue.
                        if (sampleIndex === samplesCount) {
                            found = true;
                            sampleName = j;
                        }
                        samplesCount++;
                    }
                }
                $(featureGroup).qtip("option", "content.text", tooltipText + "<br>" + sampleName);
            }
            lastSampleIndex = sampleIndex;
        });
    }
}
