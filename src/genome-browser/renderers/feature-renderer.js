
/**
 * Any object with chromosome, start and end
 */
class FeatureRenderer extends Renderer {

    constructor(args) {
        super(args);

        if (args === null) {
            args = FEATURE_TYPES.undefined;
        }

        Object.assign(this, args);

        // Extend and add Backbone Events
        Object.assign(this, Backbone.Events);
        this.on(this.handlers);
    }

    render(features, args) {
        console.time("Generic Feature Render");

        let svgGroup = SVG.create("g");
        for (let i = 0; i < features.length; i++) {
            let feature = features[i];

            if ("featureType" in feature) {
                Object.assign(this, FEATURE_TYPES[feature.featureType]);
            }
            if ("featureClass" in feature) {
                Object.assign(this, FEATURE_TYPES[feature.featureClass]);
            }

            // FIXME Temporal fix for clinical
            if (args.featureType === "clinical") {
                if ("clinvarSet" in feature) {
                    Object.assign(this, FEATURE_TYPES["Clinvar"]);
                } else if ("mutationID" in feature) {
                    Object.assign(this, FEATURE_TYPES["Cosmic"]);
                } else {
                    Object.assign(this, FEATURE_TYPES["GWAS"]);
                }
            }

            // get feature render configuration
            let color = _.isFunction(this.color) ? this.color(feature) : this.color;
            let strokeColor = _.isFunction(this.strokeColor) ? this.color(feature) : this.strokeColor;
            let label = _.isFunction(this.label) ? this.label(feature) : this.label;
            let height = _.isFunction(this.height) ? this.height(feature) : this.height;
            let tooltipTitle = _.isFunction(this.tooltipTitle) ? this.tooltipTitle(feature) : this.tooltipTitle;
            let tooltipText = _.isFunction(this.tooltipText) ? this.tooltipText(feature) : this.tooltipText;
            let infoWidgetId = _.isFunction(this.infoWidgetId) ? this.infoWidgetId(feature) : this.infoWidgetId;

            // get feature genomic information
            let start = feature.start;
            let end = feature.end;
            let length = (end - start) + 1;

            // check genomic length
            length = (length < 0) ? Math.abs(length) : length;
            length = (length === 0) ? 1 : length;

            // transform to pixel position
            let width = length * args.pixelBase;

            let svgLabelWidth = label.length * 6.4;

            //calculate x to draw svg rect
            let x = this.getFeatureX(start, args);

            let maxWidth = Math.max(width, 2);
            let textHeight = 0;
            if (args.maxLabelRegionSize > args.regionSize) {
                textHeight = 9;
                maxWidth = Math.max(width, svgLabelWidth);
            }

            let rowY = 0;
            let textY = textHeight + height;
            let rowHeight = textHeight + height + 2;

            while (true) {
                if (!(rowY in args.renderedArea)) {
                    args.renderedArea[rowY] = new FeatureBinarySearchTree();
                }

                let foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
                if (foundArea) {
                    let featureGroup = SVG.addChild(svgGroup, "g", {"feature_id": feature.id});
                    let rect = SVG.addChild(featureGroup, "rect", {
                        "x": x,
                        "y": rowY,
                        "width": width,
                        "height": height,
                        "stroke": strokeColor,
                        "stroke-width": 1,
                        "stroke-opacity": 0.7,
                        "fill": color,
                        "cursor": "pointer"
                    });

                    if (args.maxLabelRegionSize > args.regionSize) {
                        let text = SVG.addChild(featureGroup, "text", {
                            "i": i,
                            "x": x,
                            "y": textY,
                            "font-weight": 400,
                            "opacity": null,
                            "fill": "black",
                            "cursor": "pointer",
                            "class": this.fontClass
                        });
                        text.textContent = label;
                    }

                    if ("tooltipText" in this) {
                        $(featureGroup).qtip({
                            content: {text: tooltipText, title: tooltipTitle},
                            position: {viewport: $(window), target: "mouse", adjust: {x: 25, y: 15}},
                            style: {width: true, classes: this.toolTipfontClass + " ui-tooltip ui-tooltip-shadow"},
                            show: {delay: 300},
                            hide: {delay: 300}
                        });
                    }

                    $(featureGroup).mouseover(function (event) {
                        this.dispatchEvent(new CustomEvent("feature:mouseover",
                                {detail:{
                                    query: feature[infoWidgetId],
                                    feature: feature,
                                    featureType: feature.featureType,
                                    mouseoverEvent: event
                                },
                                    composed: true // for IE
                                })
                        );
                    });

                    $(featureGroup).click(function (event) {
                        this.dispatchEvent(new CustomEvent("feature:click",
                                {detail:{
                                    query: feature[infoWidgetId],
                                    feature: feature,
                                    featureType: feature.featureType,
                                    clickEvent: event
                                },
                                    composed: true //for IE
                                })
                        );
                    });
                    break;
                }
                rowY += rowHeight;
                textY += rowHeight;
            }
        }
        args.svgCanvasFeatures.appendChild(svgGroup);

        console.timeEnd("Generic Feature Render");
    }
}
