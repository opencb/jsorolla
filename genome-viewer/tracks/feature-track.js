/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 5/28/13
 * Time: 6:36 PM
 * To change this template use File | Settings | File Templates.
 */

FeatureTrack.prototype = new Track({});

function FeatureTrack(args) {
    Track.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //save default render reference;
    this.defaultRenderer = this.renderer;
    this.histogramRenderer = new HistogramRenderer();


    this.chunksDisplayed = {};


    //set instantiation args, must be last
    _.extend(this, args);
};

FeatureTrack.prototype.initialize = function(targetId){
    var _this = this;
    this.initializeDom(targetId);

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset*2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset*2

    this.dataAdapter.on('data:ready',function(event){
        if(event.params.histogram == true){
            _this.renderer = _this.histogramRenderer;
        }else{
            _this.renderer = _this.defaultRenderer;
        }

//        _this.setHeight(_this.height - trackSvg.getHeight());//modify height before redraw
        var features = _this._getFeaturesByChunks(event);
        _this.renderer.render(features, {
            svgCanvasFeatures : _this.svgCanvasFeatures,
            featureTypes:_this.featureTypes,
            renderedArea:_this.renderedArea,
            pixelBase : _this.pixelBase,
            position : _this.region.center(),
            width : _this.width,
            zoom : _this.zoom,
            labelZoom : _this.labelZoom,
            pixelPosition : _this.pixelPosition

        });
        _this.updateHeight();
        _this.setLoading(false);
    });

    this.renderer.on('feature:click',function(event){
        _this.showInfoWidget(event);
    });
};

FeatureTrack.prototype.draw = function(){
    var _this = this;

    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset*2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset*2

    this.updateHistogramParams();
    this.cleanSvg();
//    setCallRegion();

    if( this.zoom >= this.visibleRange.start && this.zoom <= this.visibleRange.end ){
        this.setLoading(true);
        var data = this.dataAdapter.getData({
            chromosome:this.region.chromosome,
            start:this.region.start-this.svgCanvasOffset*2,
            end:this.region.end+this.svgCanvasOffset*2,
            histogram:this.histogram,
            histogramLogarithm:this.histogramLogarithm,
            histogramMax:this.histogramMax,
            interval:this.interval
        });

        this.invalidZoomText.setAttribute("visibility", "hidden");
    }else{
        this.invalidZoomText.setAttribute("visibility", "visible");
    }

};


FeatureTrack.prototype.move = function(disp){
    var _this = this;
//    trackSvg.position = _this.region.center();
    _this.region.center();
    var pixelDisplacement = disp*_this.pixelBase;
    this.pixelPosition-=pixelDisplacement;

    //parseFloat important
    var move =  parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
    this.svgCanvasFeatures.setAttribute("x",move);

    var virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
    var virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);
    // check if track is visible in this zoom
    if(this.zoom >= this.visibleRange.start && this.zoom <= this.visibleRange.end){

        if(disp>0 && virtualStart < this.svgCanvasLeftLimit){
            this.dataAdapter.getData({
                chromosome:_this.region.chromosome,
                start:parseInt(this.svgCanvasLeftLimit-this.svgCanvasOffset),
                end:this.svgCanvasLeftLimit,
                histogram:this.histogram,
                interval:this.interval
            });
            this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
        }

        if(disp<0 && virtualEnd > this.svgCanvasRightLimit){
            this.dataAdapter.getData({
                chromosome:_this.region.chromosome,
                start:this.svgCanvasRightLimit,
                end:parseInt(this.svgCanvasRightLimit+this.svgCanvasOffset),
                histogram:this.histogram,
                interval:this.interval,
                transcript:this.transcript
            });
            this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit+this.svgCanvasOffset);
        }

    }

};

FeatureTrack.prototype._getFeaturesByChunks = function(response, filters){
    //Returns an array avoiding already drawn features in this.chunksDisplayed
    var chunks = response.items;
    var dataType = response.params.dataType;
    var chromosome = response.params.chromosome;
    var features = [];


    var feature, displayed, featureFirstChunk, featureLastChunk, features = [];
    for ( var i = 0, leni = chunks.length; i < leni; i++) {
        if(this.chunksDisplayed[chunks[i].key+dataType]!=true){//check if any chunk is already displayed and skip it

            for ( var j = 0, lenj = chunks[i][dataType].length; j < lenj; j++) {
                feature = chunks[i][dataType][j];

                //check if any feature has been already displayed by another chunk
                displayed = false;
                featureFirstChunk = this.dataAdapter.featureCache._getChunk(feature.start);
                featureLastChunk = this.dataAdapter.featureCache._getChunk(feature.end);
                for(var f=featureFirstChunk; f<=featureLastChunk; f++){
                    var fkey = chromosome+":"+f;
                    if(this.chunksDisplayed[fkey+dataType]==true){
                        displayed = true;
                        break;
                    }
                }
                if(!displayed){
                    //apply filter
                    // if(filters != null) {
                    //		var pass = true;
                    // 		for(filter in filters) {
                    // 			pass = pass && filters[filter](feature);
                    //			if(pass == false) {
                    //				break;
                    //			}
                    // 		}
                    //		if(pass) features.push(feature);
                    // } else {
                    features.push(feature);
                }
            }
            this.chunksDisplayed[chunks[i].key+dataType]=true;
        }
    }
    return features;


    //we only get those features in the region AND check if chunk has been already displayed
    //if(feature.end > region.start && feature.start < region.end){

    //}
};