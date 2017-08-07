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

        this.sampleTrackY = 15;
        this.sampleTrackHeight = 20;
        this.sampleTrackFontSize = 12;
        Object.assign(this, args);

        // Extend and add Backbone Events
        Object.assign(this, Backbone.Events);
        Object.assign(this, this._getDefaultConfig(), this.config);

        this.on(this.handlers);
    }

    init(svgGroup, sample) {
        // Prevent browser context menu
        console.log(this.track.main);
        $(svgGroup).contextmenu((e) => {
            console.log("right click");
            e.preventDefault();
        });

        // Get sample name array, it can be a string or an array
        if (typeof this.sampleNames === "string") {
            this.sampleNames = this.sampleNames.split(",");
        }

        // FIXME sampleNames should be renderer here but in the variant-track.js
        if (typeof this.sampleNames !== "undefined" && this.sampleNames !== null) {
            let y = this.sampleTrackY;
            for (let i = 0; i < this.sampleNames.length; i++) {
                const sampleSvg = SVG.addChild(this.track.main, "text", {
                    x: 0,
                    y,
                    stroke: "black",
                    "stroke-width": 1,
                    "font-size": this.sampleTrackFontSize,
                    cursor: "pointer",
                });
                sampleSvg.textContent = this.sampleNames[i];

                y += this.sampleTrackHeight;

                const _this = this;
                $(sampleSvg).click(function (event) {
                    // $(this).css({"strokeWidth":"3","stroke":"#ff7200"}).hide(100).show(500).css({"stroke":"#51c000"})});
                    // amarillo FCFC92
                    const label = $(this);
                    // label.css({"stroke":"#ff7200"}).hide(100).show(500).css({"stroke":"#ff7200"});

                    // POSIBILIDAD 1
                    // let rect = SVG.addChild(_this.track.main,  "rect",{
                    //    'x': 0,
                    //    'y': label[0].y.baseVal[0].value-7,
                    //    'width': _this.track.width,
                    //    'height': 8,
                    //    'stroke': '#FFFF00',
                    //    'fill': '#FCFC92'
                    // });
                    // $(rect).css({"z-index": -1});

                    // POSIBILIDAD 2
                    const yrect = label[0].y.baseVal[0].value - 7;
                    if (this.getAttribute("stroke") === "black") {
                        label.css({ stroke: "#ff7200" }).hide(100).show(500).css({ stroke: "#ff7200" });
                        this.setAttribute("stroke", "#ff7200");
                        const rect = SVG.create("rect", {
                            x: 0,
                            y: yrect,
                            width: _this.track.width,
                            height: 8,
                            stroke: "#FFFF00",
                            fill: "#F2F5A9",
                            opacity: 0.5,
                        });
                        rect.setAttribute("id", `${this.innerHTML}_rect${yrect}`);
                        _this.track.main.insertBefore(rect, this);
                    } else {
                        const rect = document.getElementById(`${this.innerHTML}_rect${yrect}`);
                        rect.parentNode.removeChild(rect);
                        this.setAttribute("stroke", "black");
                        label.css({ stroke: "black" });
                    }

                    // let divpadre = _this.track.main.parentNode;
                    // let selBox = $('<div id="' + this.id + 'selBox"></div>')[0];
                    // divpadre.append(selBox);
                    // $(selBox).css({
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
                    // });
                    // $(selBox).click(function(event){
                    //    this.parentNode.removeChild(this);
                    // });
                });
            }
        }
    }

    render(features, args) {
        // for (let i = 0; i < features.length; i++) {
        //     this._renderExtendedGenotypes(features[i], args);
        // }
        if (typeof this.sampleNames !== "undefined" && this.sampleNames !== null && this.sampleNames.length > 0) {
            this._renderExtendedGenotypes(features, args);
        } else {
            this._renderCompactVariants(features, args);
        }
    }

    _renderExtendedGenotypes(features, args) {
        console.time("Variant Extended GT Renderer");

        for (const feature of features) {
            // get feature render configuration
            // let color = _.isFunction(this.color) ? this.color(feature) : this.color;
            // let label = _.isFunction(this.label) ? this.label(feature) : this.label;
            // let height = _.isFunction(this.height) ? this.height(feature) : this.height;
            const tooltipTitle = _.isFunction(this.tooltipTitle) ? this.tooltipTitle(feature) : this.tooltipTitle;
            const tooltipText = _.isFunction(this.tooltipText) ? this.tooltipText(feature) : this.tooltipText;
            // let infoWidgetId = _.isFunction(this.infoWidgetId) ? this.infoWidgetId(feature) : this.infoWidgetId;

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            let length = (end - start) + 1;

            // check genomic length
            length = (length < 0) ? Math.abs(length) : length;
            length = (length === 0) ? 1 : length;

            // Transform to pixel position, minimum width set to 1px
            let width = length * args.pixelBase;
            width = Math.max(width, 1);

            // let svgLabelWidth = this.getLabelWidth(label, args);
            // calculate x to draw svg rect
            const x = this.getFeatureX(start, args);
            // let maxWidth = Math.max(width, 2);
            // let textHeight = 0;
            // if (args.regionSize < args.maxLabelRegionSize) {
            //     textHeight = 9;
            //     maxWidth = Math.max(width, svgLabelWidth);
            // }
            // let rowY = 0;
            // let textY = textHeight + height;
            // let rowHeight = textHeight + height + 2;

            // Color: Dark blue: 0/0, Orange: 0/1, Red: 1/1, Black: ./.
            let d00 = "";
            let dDD = "";
            let d11 = "";
            let d01 = "";
            const xs = x; // x start
            const xe = x + width; // x end
            let ys = 5; // y
            const yi = 10; // y increment
            const yi2 = this.sampleTrackHeight; // y increment

            let samplesCount = feature.studies[0].samplesData.length;
            for (const i in feature.studies[0].samplesData) {
                const svgPath = `M${xs},${ys} L${xe},${ys} L${xe},${ys + yi} L${xs},${ys + yi} z `;

                // Only one study is expected, and GT is always the first field in samplesData
                const genotype = feature.studies[0].samplesData[i]["0"];
                switch (genotype) {
                case "0|0":
                case "0/0":
                    d00 += svgPath;
                    break;
                case "0|1":
                case "0/1":
                case "1|0":
                case "1/0":
                    d01 += svgPath;
                    break;
                case "1|1":
                case "1/1":
                    d11 += svgPath;
                    break;
                case ".|.":
                case "./.":
                    dDD += svgPath;
                    break;
                }
                ys += yi2;
            }

            const featureGroup = SVG.addChild(args.svgCanvasFeatures, "g", { feature_id: feature.id });
            const dummyRect = SVG.addChild(featureGroup, "rect", {
                x: xs,
                y: 1,
                width,
                height: ys,
                fill: "transparent",
                cursor: "pointer",
            });
            if (d00 !== "") {
                const path = SVG.addChild(featureGroup, "path", {
                    d: d00,
                    fill: "blue",
                    cursor: "pointer",
                });
            }
            if (dDD !== "") {
                const path = SVG.addChild(featureGroup, "path", {
                    d: dDD,
                    fill: "black",
                    cursor: "pointer",
                });
            }
            if (d11 !== "") {
                const path = SVG.addChild(featureGroup, "path", {
                    d: d11,
                    fill: "red",
                    cursor: "pointer",
                });
            }
            if (d01 !== "") {
                const path = SVG.addChild(featureGroup, "path", {
                    d: d01,
                    fill: "orange",
                    cursor: "pointer",
                });
            }

            let lastSampleIndex = 0;
            $(featureGroup).qtip({
                //        content: {text: tooltipText + '<br>' + feature.files[lastSampleIndex], title: tooltipTitle},
                content: { text: `${tooltipText}<br>${samplesCount} samples`, title: tooltipTitle },
                //                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
                position: { target: "mouse", adjust: { x: 25, y: 15 } },
                style: { width: true, classes: `${this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
                show: { delay: 300 },
                hide: { delay: 300 },
            });

            $(featureGroup).mousemove((event) => {
                const sampleIndex = parseInt(event.offsetY / yi2);
                if (sampleIndex !== lastSampleIndex) {
                    console.log(sampleIndex);
                    samplesCount = 0;
                    let sampleName = "";
                    let found = false;
                    for (const i in feature.studies) {
                        for (const j in feature.studies[i].samplesData) { // better search it up than storing it? memory could be an issue.
                            if (sampleIndex === samplesCount) {
                                found = true;
                                sampleName = j;
                            }
                            samplesCount++;
                        }
                    }
                    $(featureGroup).qtip("option", "content.text", `${tooltipText}<br>${sampleName}`);
                }
                lastSampleIndex = sampleIndex;
            });
        }
        console.timeEnd("Variant Extended GT Renderer");
    }

    _renderCompactVariants(features, args) {
        console.time("Variant Compact Renderer");

        const _this = this;
        const svgGroup = SVG.create("g");
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];

            if ("featureType" in feature) {
                Object.assign(this, FEATURE_TYPES[feature.featureType]);
            }
            if ("featureClass" in feature) {
                Object.assign(this, FEATURE_TYPES[feature.featureClass]);
            }

            // Temporal fix for clinical
            if (args.featureType === "clinical") {
                if ("clinvarSet" in feature) {
                    Object.assign(this, FEATURE_TYPES.Clinvar);
                } else if ("mutationID" in feature) {
                    Object.assign(this, FEATURE_TYPES.Cosmic);
                } else {
                    Object.assign(this, FEATURE_TYPES.GWAS);
                }
            }

            // get feature render configuration
            const color = _.isFunction(this.color) ? this.color(feature) : this.color;
            const strokeColor = _.isFunction(this.strokeColor) ? this.color(feature) : this.strokeColor;
            const label = _.isFunction(this.label) ? this.label(feature) : this.label;
            const height = _.isFunction(this.height) ? this.height(feature) : this.height;
            const tooltipTitle = _.isFunction(this.tooltipTitle) ? this.tooltipTitle(feature) : this.tooltipTitle;
            const tooltipText = _.isFunction(this.tooltipText) ? this.tooltipText(feature) : this.tooltipText;
            const infoWidgetId = _.isFunction(this.infoWidgetId) ? this.infoWidgetId(feature) : this.infoWidgetId;

            // get feature genomic information
            const start = feature.start;
            const end = feature.end;
            let length = (end - start) + 1;

            // check genomic length
            length = (length < 0) ? Math.abs(length) : length;
            length = (length === 0) ? 1 : length;

            // transform to pixel position
            const width = length * args.pixelBase;

            //        var svgLabelWidth = this.getLabelWidth(label, args);
            const svgLabelWidth = label.length * 6.4;

            // calculate x to draw svg rect
            const x = this.getFeatureX(start, args);

            let maxWidth = Math.max(width, 2);
            let textHeight = 0;
            if (args.maxLabelRegionSize > args.regionSize) {
                textHeight = 9;
                maxWidth = Math.max(width, svgLabelWidth);
            }

            let rowY = 0;
            let textY = textHeight + height;
            const rowHeight = textHeight + height + 2;

            while (true) {
                if (!(rowY in args.renderedArea)) {
                    args.renderedArea[rowY] = new FeatureBinarySearchTree();
                }
                const foundArea = args.renderedArea[rowY].add({ start: x, end: x + maxWidth - 1 });

                if (foundArea) {
                    const featureGroup = SVG.addChild(svgGroup, "g", { feature_id: feature.id });
                    const rect = SVG.addChild(featureGroup, "rect", {
                        x,
                        y: rowY,
                        width,
                        height,
                        stroke: strokeColor,
                        "stroke-width": 1,
                        "stroke-opacity": 0.7,
                        fill: color,
                        cursor: "pointer",
                    });

                    if (args.maxLabelRegionSize > args.regionSize) {
                        const text = SVG.addChild(featureGroup, "text", {
                            i,
                            x,
                            y: textY,
                            "font-weight": 400,
                            opacity: null,
                            fill: "black",
                            cursor: "pointer",
                            class: this.fontClass,
                        });
                        text.textContent = label;
                    }

                    if ("tooltipText" in this) {
                        $(featureGroup).qtip({
                            content: { text: tooltipText, title: tooltipTitle },
                            //                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
                            position: { viewport: $(window), target: "mouse", adjust: { x: 25, y: 15 } },
                            style: { width: true, classes: `${this.toolTipfontClass} ui-tooltip ui-tooltip-shadow` },
                            show: { delay: 300 },
                            hide: { delay: 300 },
                        });
                    }

                    $(featureGroup).mouseover((event) => {
                        _this.trigger("feature:mouseover", {
                            query: feature[infoWidgetId],
                            feature,
                            featureType: feature.featureType,
                            mouseoverEvent: event,
                        });
                    });

                    $(featureGroup).click((event) => {
                        _this.trigger("feature:click", {
                            query: feature[infoWidgetId],
                            feature,
                            featureType: feature.featureType,
                            clickEvent: event,
                        });
                    });
                    break;
                }
                rowY += rowHeight;
                textY += rowHeight;
            }
        }
        args.svgCanvasFeatures.appendChild(svgGroup);
        console.timeEnd("Variant Compact Renderer");
    }

    _getDefaultConfig() {
        return {
            label(f) {
                const tokens = [];
                if (f.id) tokens.push(f.id);
                if (f.name) tokens.push(f.name);
                return tokens.join(" - ");
            },
            tooltipTitle(f) {
                const tokens = [];
                if (f.featureType) tokens.push(f.featureType);
                if (f.id) tokens.push(f.id);
                if (f.name) tokens.push(f.name);
                return tokens.join(" - ");
            },
            tooltipText(f) {
                const strand = (f.strand != null) ? f.strand : "NA";
                const region = `start-end:&nbsp;<span style="font-weight: bold">${f.start}-${f.end} (${strand})</span><br>` +
                        `length:&nbsp;<span style="font-weight: bold; color:#005fdb">${(f.end - f.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span><br>`;


                let s = "";
                for (let key in f) {
                    if (key === "start" || key === "end" || key === "id" || key === "name" || key === "length") {
                        continue;
                    }
                    if (_.isNumber(f[key]) || _.isString(f[key])) {
                        s += `${key}:&nbsp;<span style="font-weight: bold">${f[key]}</span><br>`;
                    }
                }
                return `${region} ${s}`;
            },
            color: "#8BC34A",
            strokeColor: "#555",
            infoWidgetId: "id",
            height: 10,
            histogramColor: "#58f3f0",
        };
    }
}
