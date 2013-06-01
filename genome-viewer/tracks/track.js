/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 5/28/13
 * Time: 6:36 PM
 * To change this template use File | Settings | File Templates.
 */

function Track(args) {

//    this.width = 200;
//    this.height = 200;

    this.pixelBase;

    this.svgCanvasWidth = 500000;//mesa
    this.pixelPosition = this.svgCanvasWidth / 2;
    this.svgCanvasOffset;
    this.svgCanvasFeatures;
    this.status = undefined;
    this.histogram;
    this.histogramLogarithm;
    this.histogramMax;
    this.interval;
    this.zoom;

    this.svgCanvasLeftLimit;
    this.svgCanvasRightLimit;

    this.labelZoom = -1;
//    this.callstart;
//    this.callEnd;
//    this.virtualStart;
//    this.vitualEnd;


    //svg attributes
    this.invalidZoomText;

    this.renderedArea = {};//used for renders to store binary trees

    _.extend(this, args);
};

Track.prototype = {

    get: function (attr) {
        return this[attr];
    },

    set: function (attr, value) {
        this[attr] = value;
    },

    setLoading: function (bool) {
        if (bool) {
            //this.titleGroup.setAttribute("transform","translate(40)");
            this.svgLoading.setAttribute("visibility", "visible");
            this.status = "rendering";
        } else {
            //this.titleGroup.setAttribute("transform","translate(0)");
            this.svgLoading.setAttribute("visibility", "hidden");
            this.status = "ready";
        }
    },

    updateHistogramParams: function () {
        if (this.zoom <= this.histogramZoom) {
            this.histogram = true;
            this.histogramLogarithm = true;
            this.histogramMax = 500;
            this.interval = parseInt(5 / _this.pixelBase);//server interval limit 512
        } else {
            this.histogram = undefined;
            this.histogramLogarithm = undefined;
            this.histogramMax = undefined;
        }
    },

    cleanSvg : function(filters){//clean
        console.time("-----------------------------------------empty");
        //$(this.features).empty();
//		this.features.textContent = "";
        while (this.svgCanvasFeatures.firstChild) {
            this.svgCanvasFeatures.removeChild(this.svgCanvasFeatures.firstChild);
        }
        console.timeEnd("-----------------------------------------empty");
        //deprecated, diplayed object is now in trackSvg class
        //this.adapter.featureCache.chunksDisplayed = {};
        this.chunksDisplayed = {};
        this.renderedArea = {};
    },
//    updateCallRegion : function (){
//        //needed call variables
//        callStart = parseInt(_this.region.start - _this.halfVirtualBase*2);
//        callEnd = parseInt(_this.region.end + _this.halfVirtualBase*2);
//        virtualStart = parseInt(_this.region.start - _this.halfVirtualBase*2);//for now
//        vitualEnd = parseInt(_this.region.end + _this.halfVirtualBase*2);//for now
//
//        trackSvg.pixelBase = _this.pixelBase;
//    },

    initializeDom: function (targetId) {

        var _this = this;
        var div = $('<div id="' + this.id + '-div"></div>')[0];
        var svgdiv = $('<div id="' + this.id + '-svgdiv"></div>')[0];

        $(targetId).addClass("x-unselectable");
        $(targetId).append(div);
        $(div).append(svgdiv);
        $(svgdiv).css({'z-index': 3, 'height': 100, 'overflow-y': 'scroll'});
        var main = SVG.addChild(svgdiv, "svg", {
//		"style":"border:1px solid #e0e0e0;",
            "id": this.id,
            "class": "trackSvg",
            "x": 0,
            "y": 0,
            "width": this.width,
            "height": this.height
        });

        var resizediv = $('<div id="' + this.id + '-resizediv"></div>')[0];
        $(resizediv).css({'background-color': 'lightgray', 'height': 5});

        $(resizediv).mousedown(function (event) {
            $('html').addClass("x-unselectable");
            event.stopPropagation();
            var downY = event.clientY;
            $('body').mousemove(function (event) {
                var despY = (event.clientY - downY);
                var actualHeight = $(svgdiv).outerHeight();
                $(svgdiv).css({height: actualHeight + despY});
                downY = event.clientY;
            });
        });
        $('body').mouseup(function (event) {
            $('html').removeClass("x-unselectable");
            $(this).off('mousemove');
        });

        $(resizediv).mouseenter(function (event) {
            $(this).css({"cursor": "s-resize"});
        });
        $(resizediv).mouseleave(function (event) {
            $(this).css({"cursor": "default"});
        });

        $(div).append(resizediv);

        var titleGroup = SVG.addChild(main, "g", {
            "class": "trackTitle"
            //visibility:this.titleVisibility
        });


        var text = this.title;
        var textWidth = 15 + text.length * 6;
        var titlebar = SVG.addChild(titleGroup, "rect", {
            "x": 0,
            "y": 0,
            //"width":textWidth,
            "width": this.width,
            //"height":22,
            "height": this.height,
            //"stroke":"lightgray",
            //"stroke":"deepSkyBlue",
            //"stroke-width":"1",
            "opacity": "0.6",
            //"fill":"honeydew"
            "fill": "transparent"
        });
        var titleText = SVG.addChild(titleGroup, "text", {
            "x": 4,
            "y": 14,
            "font-size": 12,
            "opacity": "0.4",
            "fill": "black"
//		"transform":"rotate(-90 50,50)"
        });
        titleText.textContent = text;

        this.svgCanvasFeatures = SVG.addChild(titleGroup, "svg", {
            "class": "features",
            "x": -this.pixelPosition,
            "width": this.svgCanvasWidth,
            "height": this.height
        });


        this.fnTitleMouseEnter = function () {
//		over.setAttribute("opacity","0.1");
            //titlebar.setAttribute("width",74+textWidth);
            titlebar.setAttribute("opacity", "0.1");
            titlebar.setAttribute("fill", "greenyellow");
            titleText.setAttribute("opacity", "1.0");
            //upRect.setAttribute("visibility","visible");
            //downRect.setAttribute("visibility","visible");
            //if(_this.closable == true){ hideRect.setAttribute("visibility","visible"); }
//		settingsRect.setAttribute("visibility","visible");//TODO not implemented yet, hidden for now...
        };
        this.fnTitleMouseLeave = function () {
////	over.setAttribute("opacity","0.0");
            //titlebar.setAttribute("width",textWidth);
            titlebar.setAttribute("opacity", "0.6");
            titlebar.setAttribute("fill", "transparent");
            titleText.setAttribute("opacity", "0.4");
            //upRect.setAttribute("visibility","hidden");
            //downRect.setAttribute("visibility","hidden");
            //hideRect.setAttribute("visibility","hidden");
            //settingsRect.setAttribute("visibility","hidden");
        };

        $(titleGroup).off("mouseenter");
        $(titleGroup).off("mouseleave");
        $(titleGroup).mouseenter(this.fnTitleMouseEnter);
        $(titleGroup).mouseleave(this.fnTitleMouseLeave);


        this.invalidZoomText = SVG.addChild(titleGroup, "text", {
            "x": 154,
            "y": 24,
            "font-size": 10,
            "opacity": "0.6",
            "fill": "black",
            "visibility": "hidden"
        });
        this.invalidZoomText.textContent = "This level of zoom isn't appropiate for this track";


        var loadingImg = '<?xml version="1.0" encoding="utf-8"?>' +
            '<svg version="1.1" width="22px" height="22px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<defs>' +
            '<g id="pair">' +
            '<ellipse cx="7" cy="0" rx="4" ry="1.7" style="fill:#ccc; fill-opacity:0.5;"/>' +
            '<ellipse cx="-7" cy="0" rx="4" ry="1.7" style="fill:#aaa; fill-opacity:1.0;"/>' +
            '</g>' +
            '</defs>' +
            '<g transform="translate(11,11)">' +
            '<g>' +
            '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.5s" repeatDur="indefinite"/>' +
            '<use xlink:href="#pair"/>' +
            '<use xlink:href="#pair" transform="rotate(45)"/>' +
            '<use xlink:href="#pair" transform="rotate(90)"/>' +
            '<use xlink:href="#pair" transform="rotate(135)"/>' +
            '</g>' +
            '</g>' +
            '</svg>';

        this.svgLoading = SVG.addChildImage(main, {
            "xlink:href": "data:image/svg+xml," + encodeURIComponent(loadingImg),
            "x": 10,
            "y": 0,
            "width": 22,
            "height": 22,
            "visibility": "hidden"
        });


        this.main = main;
        this.titleGroup = titleGroup;
        this.titlebar = titlebar;
        this.titleText = titleText;
        //this.upRect = upRect;
        //this.downRect = downRect;
        //this.hideRect = hideRect;
        //this.settingsRect = settingsRect;

        this.rendered = true;
        this.status = "ready";

    },

    draw: function () {

    }
};