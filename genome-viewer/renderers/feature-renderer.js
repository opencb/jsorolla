/**
 * Created with IntelliJ IDEA.
 * User: fsalavert
 * Date: 5/30/13
 * Time: 4:17 PM
 * To change this template use File | Settings | File Templates.
 */

//any item with chromosome start end
FeatureRenderer.prototype = new Renderer({});

function FeatureRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //set instantiation args
    _.extend(this, args);

};


FeatureRenderer.prototype.render = function(features, args) {
    var _this = this;
    var draw = function(feature){
        var start = feature.start;
        var end = feature.end;
        var width = (end-start)+1;

        var middle = args.width/2;

        if(width<0){//snps can be negative
            width=Math.abs(width);
        }
        if(width==0){//snps with same start - end
            width=1;
        }

        //get type settings object
        var settings = args.featureTypes[feature.featureType];
        try {
            var color = settings.getColor(feature);
        } catch (e) {
            //Uncaught TypeError: Cannot call method 'getColor' of undefined
            console.log(e)
            debugger

        }


        //transform to pixel position
        width = width * args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-start)*args.pixelBase);

        var textHeight = 9;
        if(args.zoom > args.labelZoom){
            try{
                var maxWidth = Math.max(width, settings.getLabel(feature).length*8); //XXX cuidado : text.getComputedTextLength()
            }catch(e){
                var maxWidth = 72;
            }
        }else{
            var maxWidth = Math.max(width,2);
            textHeight = 0;
        }


        var rowHeight = textHeight+10;
        var rowY = 0;
        var textY = textHeight+settings.height;

        while(true){
            if(args.renderedArea[rowY] == null){
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            var enc = args.renderedArea[rowY].add({start: x, end: x+maxWidth-1});

            if(enc){
                var featureGroup = SVG.addChild(args.svgCanvasFeatures,"g");
                var rect = SVG.addChild(featureGroup,"rect",{
                    "x":x,
                    "y":rowY,
                    "width":width,
                    "height":settings.height,
                    "stroke": "#3B0B0B",
                    "stroke-width": 0.5,
                    "fill": color,
                    "cursor": "pointer"
                });
                if(args.zoom > args.labelZoom){
                    var text = SVG.addChild(featureGroup,"text",{
                        "i":i,
                        "x":x,
                        "y":textY,
                        "font-size":10,
                        "opacity":null,
                        "fill":"black",
                        "cursor": "pointer"
                    });
                    text.textContent = settings.getLabel(feature);
                }

                $(featureGroup).qtip({
                    content: {text:settings.getTipText(feature), title:settings.getTipTitle(feature)},
                    position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
                    style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
                });

                $(featureGroup).click(function(event){
                    args.showInfoWidget({query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType, adapter:_this.trackData.adapter});
                });
                break;
            }
            rowY += rowHeight;
            textY += rowHeight;
        }
    };

    //process features
    for ( var i = 0, leni = features.length; i < leni; i++) {
        draw(features[i]);
    }
};
