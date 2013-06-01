/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 5/28/13
 * Time: 6:36 PM
 * To change this template use File | Settings | File Templates.
 */

SequenceTrack.prototype = new Track({});

function SequenceTrack(args) {
    args.resizable = false;
    Track.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //save default render reference;
    this.defaultRenderer = this.renderer;


    this.chunksDisplayed = {};


    //set instantiation args, must be last
    _.extend(this, args);
};

SequenceTrack.prototype.initialize = function(targetId){
    var _this = this;
    this.initializeDom(targetId);

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset*2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset*2

    this.dataAdapter.on('data:ready',function(event){
        if(event.params.histogram == true){
            _this.renderer = HistogramRender;
        }else{
            _this.renderer = _this.defaultRenderer;
        }

//        _this.setHeight(_this.height - trackSvg.getHeight());//modify height before redraw
        _this.renderer.render(event, {
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
        _this.setLoading(false);
    });
};

SequenceTrack.prototype.draw = function(){
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


//    var data = this._getFeaturesByChunks(response);

//    this.renderer.render(data, {
//        zoom:this.zoom,
//        width:this.width
//    });
};


SequenceTrack.prototype.move = function(disp){
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
                interval:this.interval,
                sender:'move'
            });
            this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
        }

        if(disp<0 && virtualEnd > this.svgCanvasRightLimit){
            debugger
            this.dataAdapter.getData({
                chromosome:_this.region.chromosome,
                start:this.svgCanvasRightLimit,
                end:parseInt(this.svgCanvasRightLimit+this.svgCanvasOffset),
                histogram:this.histogram,
                interval:this.interval,
                transcript:this.transcript,
                sender:'move'
            });
            this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit+this.svgCanvasOffset);
        }

    }

};