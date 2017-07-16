//Any item with chromosome start end
class FeatureRenderer extends Renderer {

    constructor(args) {
        super(args);
        //Extend and add Backbone Events
        Object.assign(this, Backbone.Events);

        this.fontClass = 'ocb-font-roboto ocb-font-size-11';
        this.toolTipfontClass = 'ocb-tooltip-font';

        if (args == null) {
            args = FEATURE_TYPES.undefined;
        }

        if (_.isObject(args)) {
            Object.assign(this, args);
        }

        this.on(this.handlers);
    }

    render(features, args) {
        let _this = this;
        let draw = function (feature, svgGroup) {

            if ('featureType' in feature) {
                Object.assign(_this, FEATURE_TYPES[feature.featureType]);
            }
            if ('featureClass' in feature) {
                Object.assign(_this, FEATURE_TYPES[feature.featureClass]);
            }

            //Temporal fix for clinical
            if (args.featureType == 'clinical') {
                if ('clinvarSet' in feature) {
                    Object.assign(_this, FEATURE_TYPES['Clinvar'])
                } else if ('mutationID' in feature) {
                    Object.assign(_this, FEATURE_TYPES['Cosmic'])
                } else {
                    Object.assign(_this, FEATURE_TYPES['GWAS'])
                }
            }

            //get feature render configuration
            let color = _.isFunction(_this.color) ? _this.color(feature) : _this.color;
            let strokeColor = _.isFunction(_this.strokeColor) ? _this.color(feature) : _this.strokeColor;
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
            length = (length == 0) ? 1 : length;

            //transform to pixel position
            let width = length * args.pixelBase;

            //        var svgLabelWidth = _this.getLabelWidth(label, args);
            let svgLabelWidth = label.length * 6.4;

            //calculate x to draw svg rect
            let x = _this.getFeatureX(start, args);

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
                    let featureGroup = SVG.addChild(svgGroup, "g", {'feature_id': feature.id});
                    let rect = SVG.addChild(featureGroup, "rect", {
                        'x': x,
                        'y': rowY,
                        'width': width,
                        'height': height,
                        'stroke': strokeColor,
                        'stroke-width': 1,
                        'stroke-opacity': 0.7,
                        'fill': color,
                        'cursor': 'pointer'
                    });
                    if (args.maxLabelRegionSize > args.regionSize) {
                        let text = SVG.addChild(featureGroup, "text", {
                            'i': i,
                            'x': x,
                            'y': textY,
                            'font-weight': 400,
                            'opacity': null,
                            'fill': 'black',
                            'cursor': 'pointer',
                            'class': _this.fontClass
                        });
                        text.textContent = label;
                    }

                    if ('tooltipText' in _this) {
                        $(featureGroup).qtip({
                            content: {text: tooltipText, title: tooltipTitle},
                            //                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
                            position: {viewport: $(window), target: "mouse", adjust: {x: 25, y: 15}},
                            style: {width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'},
                            show: {delay: 300},
                            hide: {delay: 300}
                        });
                    }

                    $(featureGroup).mouseover(function (event) {
                        _this.trigger('feature:mouseover', {
                            query: feature[infoWidgetId],
                            feature: feature,
                            featureType: feature.featureType,
                            mouseoverEvent: event
                        })
                    });

                    $(featureGroup).click(function (event) {
                        _this.trigger('feature:click', {
                            query: feature[infoWidgetId],
                            feature: feature,
                            featureType: feature.featureType,
                            clickEvent: event
                        })
                    });
                    break;
                }
                rowY += rowHeight;
                textY += rowHeight;
            }
        }

        /****/
        let timeId = "write dom " + Utils.randomString(4);
        console.time(timeId);
        console.log(features.length);
        /****/

        let svgGroup = SVG.create('g');
        for (let i = 0, leni = features.length; i < leni; i++) {
            draw(features[i], svgGroup);
        }
        args.svgCanvasFeatures.appendChild(svgGroup);

        /****/
        console.timeEnd(timeId);
        /****/
    }
}
