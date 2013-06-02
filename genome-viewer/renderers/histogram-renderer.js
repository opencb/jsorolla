/**
 * Created with IntelliJ IDEA.
 * User: fsalavert
 * Date: 5/30/13
 * Time: 4:17 PM
 * To change this template use File | Settings | File Templates.
 */

//any item with chromosome start end
HistogramRenderer.prototype = new Renderer({});

function HistogramRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    //set instantiation args
    _.extend(this, args);

};


HistogramRenderer.prototype.render = function(features, args) {
    //here we got features array
    var middle = args.width/2;
    var multiplier = 5;
//	console.log(featureList);
    var histogramHeight = 75;
    var points = '';
//debugger
    if(features.length>0) {//Force first point at histogramHeight
        var firstFeature = features[0];
        var width = (firstFeature.end-firstFeature.start)* args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-parseInt(firstFeature.start))*args.pixelBase);
        points = (x+(width/2))+','+histogramHeight+' ';
    }

    var maxValue = 0;

    for ( var i = 0, len = features.length; i < len; i++) {

        var feature = features[i];
        feature.start = parseInt(feature.start);
        feature.end = parseInt(feature.end);
        var width = (feature.end-feature.start);
        //get type settings object

        var settings = args.featureTypes[feature.featureType];
        var color = settings.histogramColor;

        width = width * args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-feature.start)*args.pixelBase);




        var height = /*histogramHeight * */ features[i].value;
        if(height == null){
            height = features[i].features_count;
        }
        height = height*multiplier;

        //
//		if(features[i].value==null){
//			console.log(features[i]);
//		}

        //TODO FOR POLYLINE Width/2 to center the point
        points += (x+(width/2))+","+(histogramHeight - height)+" ";

//		var rect = SVG.addChild(this.features,"rect",{
//			"x":x,
//			"y":histogramHeight - height,
//			"width":width,
//			"height":height,
//			"stroke": "#3B0B0B",
//			"stroke-width": 0.5,
//			"fill": color,
//			"cursor": "pointer"
//		});


        //calculate max for debug purposes
//        if(featureList[i].value>maxValue){
//            maxValue = featureList[i].value
//        }
    }
    if(features.length>0) {//force last point at histogramHeight
        var lastFeature = features[features.length-1];
        var width = (lastFeature.end-lastFeature.start)* args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-parseInt(lastFeature.start))*args.pixelBase);
        points += (x+(width/2))+','+histogramHeight+' ';

    }

//	console.log(points);
    var pol = SVG.addChild(args.svgCanvasFeatures,"polyline",{
        "points":points,
        "stroke": "#000000",
        "stroke-width": 0.2,
        "fill": color,
        "cursor": "pointer"
    });

    console.log(maxValue);

//    if(!this.axis){//Create axis values for histogram
//        this.axis = true;
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4,
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-0";
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4 - (Math.log(10)*multiplier),
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-10";
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4 - (Math.log(100)*multiplier),
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-100";
//        var text = SVG.addChild(this.histogramLegend,"text",{
//            "x":10,
//            "y":histogramHeight+4 - (Math.log(1000)*multiplier),
//            "font-size": 12,
//            "opacity":"0.9",
//            "fill":"gray",
//            "font-family": "Oxygen Mono",
//            "visibility":"visible"
//        });
//        text.textContent = "-1000";
//    }
};
