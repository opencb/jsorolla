/*! Genome Viewer - v0.1.2 - 2013-06-20
* http://https://github.com/opencb-bigdata-viz/js-common-libs/
* Copyright (c) 2013  Licensed GPLv2 */
//****   EVENT INTERFACE ****//
/*var Event = function (sender) {
    this._sender = sender;
    this._listeners = [];
};*/

function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

 
Event.prototype = {
    addEventListener : function (listener) {
        return this._listeners.push(listener)-1; //return index of array
    },
    removeEventListener : function (index) {
    	this._listeners.splice(index,1);
    },
    /** Puesto por ralonso para el naranjoma, cambiar en el futuro **/
    attach : function (listener) {
        this._listeners.push(listener);
    },

    notify : function (args) {
        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this._sender, args);
        }
    }
};

//Element.prototype.addChildSVG = function(elementName, attributes, index){
//	var el = document.createElementNS('http://www.w3.org/2000/svg', elementName);
//	for ( var key in attributes){
//		el.setAttribute(key, attributes[key]);
//	}
//	
//	// insert child at requested index, or as last child if index is too high or no index is specified
//    if ( null == index ) {
//      this.appendChild( el );
//    }
//    else {
//      var targetIndex = index + 1;
//      if ( 0 == index ) {
//        targetIndex = 0;
//      }
//      var targetEl = this.childNodes[ targetIndex ];
//      if ( targetEl ) {
//        this.insertBefore( el, targetEl ); 
//      }
//      else {
//        this.appendChild( el );
//      }
//    }
//    return el;
//};
//Element.prototype.initSVG = function(attributes){
//	return this.addChildSVG("svg", attributes);
//};

var SVG = {
	
	create : function (elementName, attributes){
		var el = document.createElementNS('http://www.w3.org/2000/svg', elementName);
		for ( var key in attributes){
			el.setAttribute(key, attributes[key]);
		}
		return el;
	},

	addChild : function (parent, elementName, attributes, index){
		var el = document.createElementNS('http://www.w3.org/2000/svg', elementName);
		for ( var key in attributes){
			el.setAttribute(key, attributes[key]);
		}
		return this._insert(parent, el, index);
	},
	
	addChildImage : function (parent, attributes, index){
		var el = document.createElementNS('http://www.w3.org/2000/svg', "image");
		for ( var key in attributes){
			if(key == "xlink:href"){
				el.setAttributeNS('http://www.w3.org/1999/xlink','href',attributes[key]);
			}
			el.setAttribute(key, attributes[key]);
		}
		return this._insert(parent, el, index);
	},
	
	_insert : function (parent, el, index){
		// insert child at requested index, or as last child if index is too high or no index is specified
	    if ( null == index ) {
	    	parent.appendChild( el );
	    }
	    else {
	      var targetIndex = index + 1;
	      if ( 0 == index ) {
	        targetIndex = 0;
	      }
	      var targetEl = parent.childNodes[ targetIndex ];
	      if ( targetEl ) {
	    	  parent.insertBefore( el, targetEl ); 
	      }
	      else {
	    	  parent.appendChild( el );
	      }
	    }
	    return el;
	},

	init : function (parent, attributes){
		return this.addChild(parent, "svg", attributes);
	}
};

//createSVG = function(elementName, attributes){
//	var el = document.createElementNS('http://www.w3.org/2000/svg', elementName);
//	for ( var key in attributes){
//		el.setAttribute(key, attributes[key]);
//	}
//	return el;
//};



//var SVG =
//{
//		svgns : 'http://www.w3.org/2000/svg',
//		xlinkns : "http://www.w3.org/1999/xlink",
//
////	createSVGCanvas: function(parentNode, attributes)
////	{
//////		attributes['xmlns'] = SVG.svgns;
//////		attributes['xmlns:xlink'] = SVG.xlinkns;
//////		attributes.push( ['xmlns', SVG.svgns], ['xmlns:xlink', 'http://www.w3.org/1999/xlink']);
////		var svg = document.createElementNS(SVG.svgns, "svg");
////		
////		for ( var key in attributes){
////			svg.setAttribute(key, attributes[key]);
////		}
////		
////		parentNode.appendChild(svg);
////		return svg;
////	}, 
//	
//	//Shape types : rect, circle, ellipse, line, polyline, polygon , path
//	createElement : function (svgNode, shapeName, attributes) {
//		try{
//			if(attributes.width < 0){
//				console.log("BIOINFO Warn: on SVG.createRectangle: width is negative, will be set to 0");
//				attributes.width=0;
//			}
//			if(attributes.height < 0){
//				console.log("BIOINFO Warn: on SVG.createRectangle: height is negative, will be set to 0");
//				attributes.height=0;
//			}
//			
//			var shape = document.createElementNS('http://www.w3.org/2000/svg', shapeName);
//			for ( var key in attributes){
//				shape.setAttribute(key, attributes[key]);
//			}
//			svgNode.appendChild(shape);
//		}
//		catch(e){
//			console.log("-------------------- ");
//			console.log("Error on drawRectangle " + e);
//			console.log(attributes);
//			console.log("-------------------- ");
//		}
//		return shape;
//	}
//};
//
//
//
//var CanvasToSVG = {
//		
//	convert: function(sourceCanvas, targetSVG, x, y, id, attributes) {
//		
//		var img = this._convert(sourceCanvas, targetSVG, x, y, id);
//		
//		for (var i=0; i< attributes.length; i++)
//		{
//			img.setAttribute(attributes[i][0], attributes[i][1]);
//		}
//	},
//	
//	_convert: function(sourceCanvas, targetSVG, x, y, id) {
//		var svgNS = "http://www.w3.org/2000/svg";
//		var xlinkNS = "http://www.w3.org/1999/xlink";
//		// get base64 encoded png from Canvas
//		var image = sourceCanvas.toDataURL();
//
//		// must be careful with the namespaces
//		var svgimg = document.createElementNS(svgNS, "image");
//
//		svgimg.setAttribute('id', id);
//	
//		//svgimg.setAttribute('class', class);
//		//svgimg.setAttribute('xlink:href', image);
//		svgimg.setAttributeNS(xlinkNS, 'xlink:href', image);
//		
//
//		svgimg.setAttribute('x', x ? x : 0);
//		svgimg.setAttribute('y', y ? y : 0);
//		svgimg.setAttribute('width', sourceCanvas.width);
//		svgimg.setAttribute('height', sourceCanvas.height);
//		//svgimg.setAttribute('cursor', 'pointer');
//		svgimg.imageData = image;
//	
//		targetSVG.appendChild(svgimg);
//		return svgimg;
//	},
//	
//	importSVG: function(sourceSVG, targetCanvas) {
//	    svg_xml = sourceSVG;//(new XMLSerializer()).serializeToString(sourceSVG);
//	    var ctx = targetCanvas.getContext('2d');
//
//	    var img = new Image();
//	    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
////	    img.onload = function() {
//	        ctx.drawImage(img, 0, 0);
////	    };
//	}
//	
//};

var Utils = {
    //properties
    characters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",

    //Methods
    formatNumber: function (position) {
        return position.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    },
    formatText: function (text, spaceChar) {
        text = text.replace(new RegExp(spaceChar, "gi"), " ");
        text = text.charAt(0).toUpperCase() + text.slice(1);
        return text;
    },
    getPixelBaseByZoom: function (zoom) {
        //zoom [0-100] intervals of 5
        zoom = Math.max(0, zoom);
        zoom = Math.min(100, zoom);
        return 10 / (Math.pow(2, (20 - (zoom / 5))));
    },
    getZoomByPixelBase: function (pixelBase) {
        //pixelBase [10 - 0];
        pixelBase = Math.max(0, pixelBase);
        pixelBase = Math.min(10, pixelBase);
        return 100 - ((Math.log(10 / pixelBase) / (Math.log(2))) * 5);
    },
    getPixelBaseByRegion: function (width, region) {
        return width / region.length();
    },
    calculatePixelBaseAndZoomByRegion: function (args) {
        var regionLength = this.regionLength(args.region);
        var pixelBase = args.width / regionLength;
        var baseWidth = parseInt(args.width / 10);//10 is the max pixelbase at max zoom 100

        if (regionLength < baseWidth) {//region is too small, start and end must be recalculated for the max allowed zoom
            pixelBase = this.getPixelBaseByZoom(args.zoom);
            var centerPosition = this.centerPosition(args.region);
            var aux = Math.ceil((baseWidth / 2) - 1);
            args.region.start = Math.floor(centerPosition - aux);
            args.region.end = Math.floor(centerPosition + aux);

            //modify the start and end
        }
        return {pixelBase: pixelBase, zoom: this.getZoomByPixelBase(pixelBase)}
    },
    setMinRegion: function (region, width) {
        var regionLength = region.length();
        var minimumWindowBaseLength = parseInt(width / this.getPixelBaseByZoom(100));//for zoom 100
        if (regionLength < minimumWindowBaseLength) {
            //the zoom will be 100, region must be recalculated
            var centerPosition = region.center();
            var aux = Math.ceil((minimumWindowBaseLength / 2) - 1);
            region.start = Math.floor(centerPosition - aux);
            region.end = Math.floor(centerPosition + aux);
        }
    },
    isString: function (s) {
        return typeof(s) === 'string' || s instanceof String;
    },
    isFunction: function (s) {
        return typeof(s) === 'function' || s instanceof Function;
    },
    parseDate: function (strDate) {
        return strDate.substring(0, 4) + " " + strDate.substring(4, 6) + " " + strDate.substring(6, 8) + ", " + strDate.substring(8, 10) + ":" + strDate.substring(10, 12) + ":" + strDate.substring(12, 14);
    },
    genId: function (prefix) {
        prefix = prefix || '';
        prefix = prefix.length == 0 ? prefix : prefix + '-';
        return prefix + this.randomString();
    },
    randomString: function (length) {
        length = length || 10;
        var str = "";
        for (var i = 0; i < length; i++) {
            str += this.characters.charAt(this.getRandomInt(0, this.characters.length - 1));
        }
        return str;
    },
    getRandomInt: function (min, max) {
        // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
        // Using Math.round() will give you a non-uniform distribution!
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    endsWithIgnoreCase: function (str, test) {
        var regex = new RegExp('^.*\\.(' + test + ')$', 'i');
        return regex.test(str);
    },
    endsWith: function (str, test) {
        var regex = new RegExp('^.*\\.(' + test + ')$');
        return regex.test(str);
    },
    randomColor: function () {
        var color = "";
        for (var i = 0; i < 6; i++) {
            color += ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)]);
        }
        return "#" + color;
    },
    getSpeciesFromAvailable: function (availableSpecies, speciesCode) {
        for (var i = 0; i < availableSpecies.items.length; i++) {
            var phylos = availableSpecies.items[i].items;
            for (var j = 0; j < phylos.length; j++) {
                var species = phylos[j];
                if (this.getSpeciesCode(species.text) == speciesCode) {
                    return species;
                }
            }
        }
    },
    getSpeciesCode: function (speciesName) {
        var pair = speciesName.split(" ");
        return (pair[0].charAt(0) + pair[1]).toLowerCase();
    },
    test: function () {
        return this;
    },
    cancelFullscreen: function () {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    },
    launchFullScreen: function (element) {
        if (element.requestFullScreen) {
            element.requestFullScreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        }
    }

};


Utils.images = {
    add: "data:image/gif;base64,R0lGODlhEAAQAIcAAD2GNUKNNkOPOESMO0WNPEmPP0iNQUmPQlOVTFWWTVCZQVeeRV6cVmGeWGSgVWSgV2aiWGejW2WrVWirU2uqWGqsW2yqWm61WG+1WG+1WXS3W3S3XHC4WXK5W3O6XHG+X3asZ3iuaHe8YHi0ZH+yany6ZH28Zn2+Z3m9bn25an25a3+5bUD/QHDBY3nBZHrGa3zDa37BaX7Hb4K1boO1boa3cYi4d4y7doq5eYm+eI2+e5O/f4HMdYbJeobJfIXNeYrCeY/CfYnIf4rPfZW/gozLgY7MhI7Sg5LFgJXAgpfHhZfMhZPNiJjLhpjMh5jMipvBl5vBmJTTipbTiZXUipbUi5fVi5nRi53YkqTOlKbPlqbQlqDZlaDZlqXbm6rUnavUnKbIoKfJoa/fpa/fprPZpbTZpbTaprLbqLPdqbXbqLfaqrTdqrXfrLbdrLjVr7jdr7vcr7rWsbfgr77itr3ktsTcuMXducXowMvmw87pydTrz9fu0tzx2ODy3P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAACwALAAAAAAQABAAAAi/AFkIHEiwoME7SWrMwCHH4MAdWfLs0QNnRQiHN+L4qeOlyxg8QCAU3LGmDxYmRqpQOTJHRYSBdpTw4SJFyJ8/P2DIaLNAjEAibsgU8YHiZgURHq4gaSCQBh0rPW5K/cMhxpcCAkmkGcJj6k0OJ8AMEGjjyZQXLSR85dBhiY4EAt9MYOPig4ivFzacEQBlIIgUaJByyIBBQxkLBwo6GKHGiYkSTcxQAODwgYIgW7TkCGDAocAwDAoQQBDFs2mCAQEAOw==",
    del: "data:image/gif;base64,R0lGODlhEAAQAIcAAED/QLpSNL9TOr5WOb5cQL9cQMFNM8RQNMBVPcBZP8xSPNBPPttWS9ddUcJnTMRkTMdrVM1gUc5iVMxmVclrVs1oWNZgVNZuZNtpZdxraN5ratxuadRxZd14c955dOZWTOZYTOZZTulZTelbT+ZWUOZaUuddWepcUOxfVOBlXO5mUuljW+pmXO5qXvBkVvNzXeNrYeNuY+FvcOJwZuJ7deR4ceJ5eeN4eeJ/feN/fOl7cOh6del/ePJ3Y/N5Y+qDfe6Efe+Gfu6KdfaCaPaEbPCFcPCDe/CMd/GOeviGcPiMdvCRf/eRfveTfvmSfvqTf/iUf9ymltynl+6Mge2Tju6Sj/SOgfqah/qdi/GclvGdluGpnvSgnvSinvWjn/qjkfupnPqrneGroOqwrOuzr/Ono/WmoferofarovWsofWvpfKtqvivpPS0qvi2qPm5r/q6rvC1tfC2tvjDvvzHuvnLxPnTzPzUzf3b1P3c2P///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAAAAALAAAAAAQABAAAAi6AAEIHEiwoEE5ODRk8EDG4EAbVObYqdNmxgWHMtbkgfMFCxg6OiQUvFEGz5UlSKA4UeImRoWBcX7cwdJECJGbRHywWSBGYA41YY6gGEq0hxUeFARuePOkiJ6nUEW00IJAIIYzSYZAjcoiywCBHaYweSGirNkRRmg8EDiGARoXKsyKAFHCy4EoAznASIPihIgQH0h0sVCgYIQUZoKsMAGES4MADico2FGlSg0DBBwK3AIhgQAHUjSLJhgQADs=",
    enable: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKfSURBVDjLpZPrS1NhHMf9O3bOdmwDCWREIYKEUHsVJBI7mg3FvCxL09290jZj2EyLMnJexkgpLbPUanNOberU5taUMnHZUULMvelCtWF0sW/n7MVMEiN64AsPD8/n83uucQDi/id/DBT4Dolypw/qsz0pTMbj/WHpiDgsdSUyUmeiPt2+V7SrIM+bSss8ySGdR4abQQv6lrui6VxsRonrGCS9VEjSQ9E7CtiqdOZ4UuTqnBHO1X7YXl6Daa4yGq7vWO1D40wVDtj4kWQbn94myPGkCDPdSesczE2sCZShwl8CzcwZ6NiUs6n2nYX99T1cnKqA2EKui6+TwphA5k4yqMayopU5mANV3lNQTBdCMVUA9VQh3GuDMHiVcLCS3J4jSLhCGmKCjBEx0xlshjXYhApfMZRP5CyYD+UkG08+xt+4wLVQZA1tzxthm2tEfD3JxARH7QkbD1ZuozaggdZbxK5kAIsf5qGaKMTY2lAU/rH5HW3PLsEwUYy+YCcERmIjJpDcpzb6l7th9KtQ69fi09ePUej9l7cx2DJbD7UrG3r3afQHOyCo+V3QQzE35pvQvnAZukk5zL5qRL59jsKbPzdheXoBZc4saFhBS6AO7V4zqCpiawuptwQG+UAa7Ct3UT0hh9p9EnXT5Vh6t4C22QaUDh6HwnECOmcO7K+6kW49DKqS2DrEZCtfuI+9GrNHg4fMHVSO5kE7nAPVkAxKBxcOzsajpS4Yh4ohUPPWKTUh3PaQEptIOr6BiJjcZXCwktaAGfrRIpwblqOV3YKdhfXOIvBLeREWpnd8ynsaSJoyESFphwTtfjN6X1jRO2+FxWtCWksqBApeiFIR9K6fiTpPiigDoadqCEag5YUFKl6Yrciw0VOlhOivv/Ff8wtn0KzlebrUYwAAAABJRU5ErkJggg==",
    warning: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIsSURBVDjLpVNLSJQBEP7+h6uu62vLVAJDW1KQTMrINQ1vPQzq1GOpa9EppGOHLh0kCEKL7JBEhVCHihAsESyJiE4FWShGRmauu7KYiv6Pma+DGoFrBQ7MzGFmPr5vmDFIYj1mr1WYfrHPovA9VVOqbC7e/1rS9ZlrAVDYHig5WB0oPtBI0TNrUiC5yhP9jeF4X8NPcWfopoY48XT39PjjXeF0vWkZqOjd7LJYrmGasHPCCJbHwhS9/F8M4s8baid764Xi0Ilfp5voorpJfn2wwx/r3l77TwZUvR+qajXVn8PnvocYfXYH6k2ioOaCpaIdf11ivDcayyiMVudsOYqFb60gARJYHG9DbqQFmSVNjaO3K2NpAeK90ZCqtgcrjkP9aUCXp0moetDFEeRXnYCKXhm+uTW0CkBFu4JlxzZkFlbASz4CQGQVBFeEwZm8geyiMuRVntzsL3oXV+YMkvjRsydC1U+lhwZsWXgHb+oWVAEzIwvzyVlk5igsi7DymmHlHsFQR50rjl+981Jy1Fw6Gu0ObTtnU+cgs28AKgDiy+Awpj5OACBAhZ/qh2HOo6i+NeA73jUAML4/qWux8mt6NjW1w599CS9xb0mSEqQBEDAtwqALUmBaG5FV3oYPnTHMjAwetlWksyByaukxQg2wQ9FlccaK/OXA3/uAEUDp3rNIDQ1ctSk6kHh1/jRFoaL4M4snEMeD73gQx4M4PsT1IZ5AfYH68tZY7zv/ApRMY9mnuVMvAAAAAElFTkSuQmCC",
    edit: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB80lEQVR42o2T30tTURzArb8ioiAI6kHoZeF7CGE/IISCUDNCqAeL3rIWPfSwByskYUEJIhSChBhJFAiNqMVYPqRuc4tcW3NLt3C7u3d3d3c/+nS+0GRK0134cC6c8/ncc+7ltgFt6jqgcCg6duGQYq84deoBR6lU0iqVSq1arfI/1Dxut3u0Htke6BC5UChgmuYm+XyeXC5HOp1GIsnQNJHJi3x/7WJh/CSLT9r7Rd4jAVlgWRa2bSOjYBgGmqaRyWQwkq9Y8wyhLb0BI0VuaRrfo671xoDIwmakWCyi6zrr36bILt/HXp1l7cNDioEZqnEvgYmr1paAOgYy1u/l3NrqHNngPWpFL8XodTa+3CD8YoCvz/o078i5o1sC29FT78kG7lCzfJgrl7ESvejLThLPuxk8fbhP3KaBVFCdeX7on9yP9bOHfPAu0bEzmKkg4jQNpEKzhOduqW1/xIoNUEpcQlM7WXl6Cj39Q9Y0D4Q/TRJ662Tx3WOS/guYsV42Fm4THe/G/B2T97Jz4OVwJ+hxImPn8Tj381k91TfShfErIvLuAde1Y9g+N7Z/FL/rBDODR8gmgpTL5To7B3o69zF8pR3Pg7PMT90kn47LJ22kaeCPghapidP4Lxy3bduUiVZktdaQH7AxcFAiUm0Rhzji/gUhbp0s2Zf2xwAAAABJRU5ErkJggg==",
    info: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJ1SURBVHjafJJdSJNhFMd/z3QzLWdZrnQmSA2DPqRCK4KuhIq66kLoAy/qoqCguqqL6JsgLwoKKhCMSIy6CDKKRFZZYYQRVhJl02nWmG5uc19u7/vuPV0lW7QOnIsHnt+P8z/Pg4gw26aZ0263uzEUCn2IxWJjXq/3JqBETLIZ8gkePLhfKyKy/Z5HHJf7xe0Jic/n65mejizPK0inUiSTKUSE0dHRhxf6JoSDb4Rjr4QDz0REJBgMtmczFrJKKYVSCjCYnPR/W1FuAwQSGjbHXAA0LRXKZnIm0NJpgAKvd/hSOBz2iIj0eiPS2vtDYsmUPH/uPg9YshklIrOyCb+/eUG5ve3au5C99W2AqGbgKivk8R4X1lSkv2pJZaNmmBQVWWeZnAiGoa+3KovdyBjsW2kn/SvK4Jcgtaf7cDqrGkQMUDkBcgXVS2tOHjp8dG2jOXT1yo5lYOpgFTB0wKTAOqdQMlqOoDD7EE8kREwGXr/oWTg4HjxONAklBayuKSUeT/hFTxrwnwlAMa8I1qyrP3H95RiQgUiC/RsWM+wZ6jIME0M38wtSM0mmojM4nc6mzr5xKDQgnWb/pmoedT29EU3pTMUS+QVKKerq6kqnI3EVHwmAplO8qBh7WTFnzpz9bOg6FovlfxGEixfOrfT6YxCOQ1rDUaIAG4EJ38+PAwNb/95Bzj8ITAZwLHbMT0yHw3N33YVwEnQDqss41VzPkaalX6Iz+m6Xy/Xp34JAAICR7187nLWuvbe6h9C0DA2uRTTVV9J++87OlpaWJxUVFf9+xj+1cfOWls6OO93Nq1zblMVm9flG3pcvXNPm90+E/777ewB+UIqdqtYXHAAAAABJRU5ErkJggg==",
    bucket: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90BCg4hBcbCoOMAAABsSURBVDjLY2RgYFBjYGCIZCAPLGeBam4g0wAGJgYKARMDA8NZCvSfZYQy6sk0oJEFiUNqODRQLQxGDYCAb2To/YZswEsyDHiJbMAHMgz4gO6F5aTkQpgXYElZkoGBgZeEbL2cgYHhMwMDw3MA93ARk+mSg4gAAAAASUVORK5CYII=",
    dir: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALEgHS3X78AAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAKNJREFUeNrEk7sNwkAQBefQ5m6BTiAAQssZiMh0QFUIMrAEpKYD8ynAJeD4nXQEkJHgu4CXv9GsdteFEEjJgMQ4gPli+aWx227cLwAD8FK8QZ4XTyCL6B6qal+YlzLgCpSn87HpbTCdzAKwAkpg1Bdgn/nbmDLQmby6hC3W5qUGGEcCGpNUJwBq09tgHdO+Pe61eamNvIMLgEkaxuoDuL9/42sAM20/EZafbV8AAAAASUVORK5CYII=",
    r: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90CDRIvNbHTpbwAAADjSURBVDjLpZFBbsIwEEUfVRZYahcVK3qKXoauMFK5C91nkyUB+xC5BqeAA7SKq1B5ugl2EiC04UkjayzN17NnROTRWvvJFbTWL8CBHqbGWOlSlqVkWSbGWAGm3aGHZiMiAByPP6FOd1rP2W7NvhvSCvDe10E+VJPFQpPnm1ZIcsmgPgJVVZGmaejX63y/XL4/AV/JJYPTCeDcN7PZWyuwKAqA8wARqSsGKDVGqXGjV8H07AnRQPq21TK8+YSBAQMN4hb6Df7wB/5eA+4zmEyehxk451itPrhFksSxUeP+lf+z+wXwdayJk/mqtgAAAABJRU5ErkJggg==",
    box: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wMHAwRAVvTmTAAAAK/SURBVDjLpZM9bFxFGEXPNzPvZ+39sb2xHceREjDQBwlDCqqIiiotokAghYKEjvSkQkKJkEiB0lOkoAHaBAokFCQKUATIIOLIMbHWrHfX+7zvvZk3MzQODUgU3PJK5+g2F/5n5N/Kb66/1NNK3hAxr4HcFqVuvfju18V/Cu58sPmMVnJZ4K32Qr+t8za+KnCz4kCUuiGibm5euTv5h+CL958/nxj1XivVF+e6C9TVhPmFdbROgEhwNU1d4m09UaJuInLjhct3DgDUh5ee7j14PLxulLvYP/0seadPkub88Wib0eB3bDkmxgbRoFPpxeCuKvjsyQIzOyqImT7/y8Mh++NveW7jLFmrx6m1NlWxz6PHA7otQ7tloAmYJE9isOeeCJRtIrULLLUTjsqG7+//xs72z7jZgCTNONlVJKEiuobW0jqSaoiet19dFQATJcc2FSFEciNoLYwOHcPDASvdjM5cQntxlbR9gqacoFSK84VsnOrkH11Zdmp0FFXjobSeCFgXSDS0Eo11ge7yGXSaU092UUlCaEpC8FK4tDcu4rzZ2a/S+bWI94HSAgFigDQD24Cvp4gIOp0juBJvC2L07B1Uc/Mtg9k7sHMbywZrA3lLECV4AtaCpAp79CcmzXHlhOBrAJrGyNbOVBY7qTO1C9r5EKyPSttAiJEs01SuQStFkrdp6gKd5AzHjixVxCDxp+1paZRUxoc4Kp36bndYbS53U5WlCq0CMYIPMY7GI0mNpiqmGK0oK4jIveGkPgRqfTBt3A8Pqtvrq52HtglnGh9XIaKUkCQ6nj6RyWBsmdXCtFI/bu2Fq5c+3roGzIAgWokCDNACOhfOLb781Ip+vd+RC2dXWibROkxKvvp1z376yZe7d4HpMdz8/YVjiQYyoA30Ti6la2++0n/n83vTW/e3ix1gcgzXgPchBoC/AFu/UBF5InryAAAAAElFTkSuQmCC",
    bluebox: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wMHAwTE5pcivoAAALsSURBVDjLXZPPaxxlGMc/77wz+3N2k822tWsTIrQFe/BWEKxKCV5UohdFhJ60p6rgUfpP6C0K4kHx0ENEkV7aElHwUikhFVosRGoTm83+3pnZnXfed2beHtItIQ98+Z6+H57nga8AsNYKDkYcEofcHvKZEEJYcSTszPzqL3fmf3+w/+a51tytby9d6D0N5UecGeBZ8MPv/jh9fy/6dKzMpVPHmvWdbl/XCvKn5Wbl6+ufrNwGssMgYa2VgFj58sZr7VB/LqX3zlKrydJzTTzXxdqcx90hO+0Bk2l8Z74i1z6+cOba5VfOqGeAb3579M/NR53T40xwrDGHFALPEUjn4LoMi0ktwWTKXqCIqAVrbyycvHj2hHYBR+bO8Q/Ov0imEzZ2xrRDRalQwC9LLBalUgaJQy+tU6gvIBJbv3j2RA4IFxDdICFa9ulMCrz/UgOs5kEwpeh57I4Nt/dzsmLOYlEThgFjUePp33IHoD9SJAbuTVyudRweixJvnVtg3/i00wpLPiwQ0hkO6YYKawWj0UjONqAfKHwDkxTqqeW/RHA3hO2+Zqk05e5wTD9KmOqMKDEUqoLNzU0PyF2AQaBoaIhiw0h6TIwgUDCODb5NiWJNlKREyhAozXwOW1tbFSmlcAHbD2KaytCdGgyWglfEs4LeNKeaa4axYRgpwlgTTTXVDDqdTslaewAYh4kNlKUbZsTGonOwCYwm1vq5Ft1AMYgU08SQR5o0gziOcRxHuoCNtdl6uPHX6/Vmi3Yyh9I5IoEgMdkgT9x+qJhEGrdQo77cJMuy+4DJskwLa60DOCtf3HhZpfZKtVx+L3x+sfCv8CFxTINd72HfodQ4aQp5fP24/v/Hd4Nf/5RSJmma6lkXZn1wPvvq5qndsbhS9esf/Zy/UEtzxnURfn8+/fuHV7m353mecV1XSym1lDI72kaxvr5e3N7eruyP0tpG/e3LK/rW2mLNUb7vm3K5nFarVdNqtbJer2dXV1fzJ6cDpboAZRAGAAAAAElFTkSuQmCC",
    refresh: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAK8AAACvABQqw0mAAAAAd0SU1FB90CFA8bKScXIjIAAAJ1SURBVDjLlVJdSJNRGH7es+/7NlduWFLTKAskwjJqZYiBglJhLKguqou6EFkFIkLQH9IPBFI3BsouzMJupGYRajcqmeBFhWBU5oUgpZikrSnzZ9v3nW/ndKEbziXUAwfOOe/7Puc9z/MCq1DwMmB1NX/rzfCNnsc/gK08lPgnnT8Cs33BULg0HI4YKdkHX9DqKwKArXXv1bTMTFcoyruC89E8MxaDw659t6rKhIUwRBLdP2t2v/5bBwQA+5pH8ibnIj3BucgWIQRASw8RERTGYFUtsGmWYUXKmqmr7t4UAnal54GQ8lq8MBlyOU0CEnA67MiwqfvHbhZ+Smgg6o9eV2L8Nhk6wI2lZeggrpvE+TTjxgxxQ4IbmJsJYSa00JQiotnguacJ8zIZOmDosAnzTpowt8tGj0s0ejZqprnDKmPHSNebjHDkUPatt4cTTbZ+LsmO79XK52dZxTNp9/ovAEDnaM62lo8HHrd9SVfiOelVryrSq9vrEx0s8sW2tuEzDgDgT875bcIsjy6owwAwHhjnYT5bGTL29PiHyuwAMO873aL/Ct5PiPjwXe5vq7KJW2hdJxENMFInGCkhIblLj80WRoyxGxZmh1XJGlSIlV8s6A8kuVDXn+MF6JHC7GBkBSNlOSRgiihMsQhAgJGGNNU1atc2HPG6O8YSBABwt2/nGyFlGSCSB4UIBMuyoQKMFNiUjIApRH5t8YfpFOOrO/JrhZBVUiJLxq2ipIkY8Z36uivpC6txqb3YbhqhIingFlLmxmLSKyXAGAaYqh13aFjfcHJwfE2ClSitK9psc85PMVC3M999orX4Kcf/wuPb27VW7A+O2QVVA1M1CQAAAABJRU5ErkJggg==",
    newitem: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAtxJREFUeNqM0llIVHEUBvDv3vlfZ8ac6zZtWpmamtliUUHRDlFJWlEYLdBLtG/QBlFJQUTSU089RZRlG4EvkS9NlqkpldHyYLk1OurcOzp30vHO/y6nBwsSIvzgvBw+fpyHA8MwwDmHbdsjQwSbCACkYDBYp6pqU3Fxcfyf/Z+eYRjQOQf+Bnw+30IiIsMwhizL4n3lV6mn7BzZtm1yzn8SETU0NKz+J2ARobe3t85/+SI1506j9hOHqTEO9FYEtR/ZTx/n5FDH6eOkquoni2g00NjUtEzTtBYioneLCulVHKg2yUkNmelUn5VOtUlueu0SqDE/m4iIIpFI64fm5vU65xAMIlicR9rOn/UEKytgmQbYuARAEDAqRLCiQxBFhtTNWzDzxk1LcjgkFhuKIhLR2qJKcN5Al/q7reF/cXUHoA0MtA9Gh4klJIxz6ro+PZiVC0uOw1jimJEDWZbTDhw8lCi0+/3PtUeV696ePIPUnIwxAf3fOjG/7AK8e/e9ZH2K0uWdPRdivANm3NguED1OJBYWQunvDwgAXIqifO54+CC7/tSxMQELL11B/r6D3cnJybniQDis25Ikfn1wD2GdQLIMISkF5JFhudwgjwySkyCkpILkRER0wpf7d2FJkqSoapQRRPCYjoLDR+EY70VXbS2YxCC4nAARbAAQBJBlwTIMZJRsQN7W7eA6t9O8XkE0jRhWLV2y+Gdm9q0dT6rMhLw8dPn7EAoEMBSLIcpjCPUEEPD3gU1Kw+6qZ6TPKrizq3TbAjUUIkFRVYAIkkfG99bWp4P1b7Z0vq5BXtFGPN6zE6Zuo7SiAh01PkycV4jJRRt96VOmrOHhMESHiBEAgMkNlGwqmXC78mG1DXtQdruTgx/eF5g6x9Tly1pCmtYjMSnxatnFTeXXyn8wxiCMAgxz5EmcTjCXCynxblf1C9910eFwrl254nh/dDhqcQ5zeBgAwBiDIAr4NQAWJarVjshqqgAAAABJRU5ErkJggg=="
};

Utils.genBamVariants = function (seq, size, x, y) {
    var length = seq.length;
    var s = size / 6;
    //if(x==null){x=0;}
    //if(y==null){y=0;}
    var d = "";
    for (var i = 0; i < length; i++) {
        switch (seq.charAt(i)) {
            case "A" :
                d += "M" + ((2.5 * s) + x) + "," + (y) +
                    "l-" + (2.5 * s) + "," + (6 * s) +
                    "l" + s + ",0" +
                    "l" + (0.875 * s) + ",-" + (2 * s) +
                    "l" + (2.250 * s) + ",0" +
                    "l" + (0.875 * s) + "," + (2 * s) +
                    "l" + s + ",0" +
                    "l-" + (2.5 * s) + ",-" + (6 * s) +
                    "l-" + (0.5 * s) + ",0" +
                    "l0," + s +
                    "l" + (0.75 * s) + "," + (2 * s) +
                    "l-" + (1.5 * s) + ",0" +
                    "l" + (0.75 * s) + ",-" + (2 * s) +
                    "l0,-" + s +
                    " ";
                break;
            case "T" :
                d += "M" + ((0.5 * s) + x) + "," + (y) +
                    "l0," + s +
                    "l" + (2 * s) + ",0" +
                    "l0," + (5 * s) +
                    "l" + s + ",0" +
                    "l0,-" + (5 * s) +
                    "l" + (2 * s) + ",0" +
                    "l0,-" + s +
                    " ";
                break;
            case "C" :
                d += "M" + ((5 * s) + x) + "," + ((0 * s) + y) +
                    "l-" + (2 * s) + ",0" +
                    "l-" + (2 * s) + "," + (2 * s) +
                    "l0," + (2 * s) +
                    "l" + (2 * s) + "," + (2 * s) +
                    "l" + (2 * s) + ",0" +
                    "l0,-" + s +
                    "l-" + (1.5 * s) + ",0" +
                    "l-" + (1.5 * s) + ",-" + (1.5 * s) +
                    "l0,-" + (1 * s) +
                    "l" + (1.5 * s) + ",-" + (1.5 * s) +
                    "l" + (1.5 * s) + ",0" +
                    " ";
                break;
            case "G" :
                d += "M" + ((5 * s) + x) + "," + ((0 * s) + y) +
                    "l-" + (2 * s) + ",0" +
                    "l-" + (2 * s) + "," + (2 * s) +
                    "l0," + (2 * s) +
                    "l" + (2 * s) + "," + (2 * s) +
                    "l" + (2 * s) + ",0" +
                    "l0,-" + (3 * s) +
                    "l-" + (1 * s) + ",0" +
                    "l0," + (2 * s) +
                    "l-" + (0.5 * s) + ",0" +
                    "l-" + (1.5 * s) + ",-" + (1.5 * s) +
                    "l0,-" + (1 * s) +
                    "l" + (1.5 * s) + ",-" + (1.5 * s) +
                    "l" + (1.5 * s) + ",0" +
                    " ";
                break;
            case "N" :
                d += "M" + ((0.5 * s) + x) + "," + ((0 * s) + y) +
                    "l0," + (6 * s) +
                    "l" + s + ",0" +
                    "l0,-" + (4.5 * s) +
                    "l" + (3 * s) + "," + (4.5 * s) +
                    "l" + s + ",0" +
                    "l0,-" + (6 * s) +
                    "l-" + s + ",0" +
                    "l0," + (4.5 * s) +
                    "l-" + (3 * s) + ",-" + (4.5 * s) +
                    " ";
                break;
            case "d" :
                d += "M" + ((0 * s) + x) + "," + ((2.5 * s) + y) +
                    "l" + (6 * s) + ",0" +
                    "l0," + (s) +
                    "l-" + (6 * s) + ",0" +
                    "l0,-" + (s) +
                    " ";
                break;
            default:
                d += "M0,0";
                break;
        }
        x += size;
    }
    return d;
};

GV_CELLBASE_HOST = "http://ws.bioinfo.cipf.es/cellbase/rest";

CELLBASE_HOST = "http://ws-beta.bioinfo.cipf.es/cellbasebeta/rest";
CELLBASE_VERSION = "v3";

FEATURE_CONFIG = {
	gene:{
		filters:[{
			name:"biotype",
			text:"Biotype",
			values:["3prime_overlapping_ncrna", "ambiguous_orf", "antisense", "disrupted_domain", "IG_C_gene", "IG_D_gene", "IG_J_gene", "IG_V_gene", "lincRNA", "miRNA", "misc_RNA", "Mt_rRNA", "Mt_tRNA", "ncrna_host", "nonsense_mediated_decay", "non_coding", "non_stop_decay", "polymorphic_pseudogene", "processed_pseudogene", "processed_transcript", "protein_coding", "pseudogene", "retained_intron", "retrotransposed", "rRNA", "sense_intronic", "sense_overlapping", "snoRNA", "snRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"],
			selection:"multi"
		}]
		//options:[
		//]
	},
	snp:{
		filters:[{
			name:"consequence_type",
			text:"Consequence Type",
			values:["2KB_upstream_variant", "5KB_upstream_variant", "500B_downstream_variant", "5KB_downstream_variant", "3_prime_UTR_variant", "5_prime_UTR_variant", "coding_sequence_variant", "complex_change_in_transcript", "frameshift_variant", "incomplete_terminal_codon_variant", "inframe_codon_gain", "inframe_codon_loss", "initiator_codon_change", "non_synonymous_codon", "intergenic_variant", "intron_variant", "mature_miRNA_variant", "nc_transcript_variant", "splice_acceptor_variant", "splice_donor_variant", "splice_region_variant", "stop_gained", "stop_lost", "stop_retained_variant", "synonymous_codon"],
			selection:"multi"
		}]
		//options:[
		//]
	},
	bam:{
		//filters:[{
				//name:"view",
				//text:"View",
				//values:["view_as_pairs","show_soft-clipped_bases"],
				//selection:"multi"
			//}
		//],
		options:[{
				text:"View as pairs",
				name:"view_as_pairs",
				type:"checkbox",
				fetch:true,
				checked : false
			},{
				text:"Show Soft-clipping",
				name:"show_softclipping",
				type:"checkbox",
				fetch:true,
				checked : false
			},{
				text:"Insert size interval",
				name:"insert_size_interval",
				type:"doublenumberfield",
				fetch:false,
				minValue : 0,
				maxValue : 0
			}
		]
	}
	
};
FEATURE_OPTIONS = {
	gene:[{
		name:"biotype",
		text:"Biotype",
		values:["3prime_overlapping_ncrna", "ambiguous_orf", "antisense", "disrupted_domain", "IG_C_gene", "IG_D_gene", "IG_J_gene", "IG_V_gene", "lincRNA", "miRNA", "misc_RNA", "Mt_rRNA", "Mt_tRNA", "ncrna_host", "nonsense_mediated_decay", "non_coding", "non_stop_decay", "polymorphic_pseudogene", "processed_pseudogene", "processed_transcript", "protein_coding", "pseudogene", "retained_intron", "retrotransposed", "rRNA", "sense_intronic", "sense_overlapping", "snoRNA", "snRNA", "transcribed_processed_pseudogene", "transcribed_unprocessed_pseudogene", "unitary_pseudogene", "unprocessed_pseudogene"],
		selection:"multi"
	}],
	snp:[{
		name:"consequence_type",
		text:"Consequence Type",
		values:["2KB_upstream_variant", "5KB_upstream_variant", "500B_downstream_variant", "5KB_downstream_variant", "3_prime_UTR_variant", "5_prime_UTR_variant", "coding_sequence_variant", "complex_change_in_transcript", "frameshift_variant", "incomplete_terminal_codon_variant", "inframe_codon_gain", "inframe_codon_loss", "initiator_codon_change", "non_synonymous_codon", "intergenic_variant", "intron_variant", "mature_miRNA_variant", "nc_transcript_variant", "splice_acceptor_variant", "splice_donor_variant", "splice_region_variant", "stop_gained", "stop_lost", "stop_retained_variant", "synonymous_codon"],
		selection:"multi"
	}],
	bam:[{
		name:"view",
		text:"View",
		values:["view_as_pairs","show_soft-clipped_bases"],
		selection:"multi"
	}]
};

GENE_BIOTYPE_COLORS = {
		"3prime_overlapping_ncrna":"Orange",
		"ambiguous_orf":"SlateBlue",
		"antisense":"SteelBlue",
		"disrupted_domain":"YellowGreen",
		"IG_C_gene":"#FF7F50",
		"IG_D_gene":"#FF7F50",
		"IG_J_gene":"#FF7F50",
		"IG_V_gene":"#FF7F50",
		"lincRNA":"#8b668b",
		"miRNA":"#8b668b",
		"misc_RNA":"#8b668b",
		"Mt_rRNA":"#8b668b",
		"Mt_tRNA":"#8b668b",
		"ncrna_host":"Fuchsia",
		"nonsense_mediated_decay":"seagreen",
		"non_coding":"orangered",
		"non_stop_decay":"aqua",
		"polymorphic_pseudogene":"#666666",
		"processed_pseudogene":"#666666",
		"processed_transcript":"#0000ff",
		"protein_coding":"#a00000",
		"pseudogene":"#666666",
		"retained_intron":"goldenrod",
		"retrotransposed":"lightsalmon",
		"rRNA":"indianred",
		"sense_intronic":"#20B2AA",
		"sense_overlapping":"#20B2AA",  
		"snoRNA":"#8b668b",
		"snRNA":"#8b668b",
		"transcribed_processed_pseudogene":"#666666",
		"transcribed_unprocessed_pseudogene":"#666666",
		"unitary_pseudogene":"#666666",
		"unprocessed_pseudogene":"#666666",
		"":"orangered",
		"other":"#000000"
};



SNP_BIOTYPE_COLORS = {
	"2KB_upstream_variant":"#a2b5cd",
	"5KB_upstream_variant":"#a2b5cd",
	"500B_downstream_variant":"#a2b5cd",
	"5KB_downstream_variant":"#a2b5cd",
	"3_prime_UTR_variant":"#7ac5cd",
	"5_prime_UTR_variant":"#7ac5cd",
	"coding_sequence_variant":"#458b00",
	"complex_change_in_transcript":"#00fa9a",
	"frameshift_variant":"#ff69b4",
	"incomplete_terminal_codon_variant":"#ff00ff",
	"inframe_codon_gain":"#ffd700",
	"inframe_codon_loss":"#ffd700",
	"initiator_codon_change":"#ffd700",
	"non_synonymous_codon":"#ffd700",
	"intergenic_variant":"#636363",
	"intron_variant":"#02599c",
	"mature_miRNA_variant":"#458b00",
	"nc_transcript_variant":"#32cd32",
	"splice_acceptor_variant":"#ff7f50",
	"splice_donor_variant":"#ff7f50",
	"splice_region_variant":"#ff7f50",
	"stop_gained":"#ff0000",
	"stop_lost":"#ff0000",
	"stop_retained_variant":"#76ee00",
	"synonymous_codon":"#76ee00",
	"other":"#000000"
};


SEQUENCE_COLORS = {A:"#009900", C:"#0000FF", G:"#857A00", T:"#aa0000", N:"#555555"};

SAM_FLAGS = [["read paired", 0x1],
             ["read mapped in proper pair", 0x2],
             ["read unmapped", 0x4],
             ["mate unmapped", 0x8],
             ["read reverse strand", 0x10],
             ["mate reverse strand", 0x20],
             ["first in pair", 0x40],
             ["second in pair", 0x80],
             ["not primary alignment", 0x100],
             ["read fails platform/vendor quality checks", 0x200],
             ["read is PCR or optical duplicate", 0x400]];


FEATURE_TYPES = {
	
	//methods
	formatTitle : function (str){
		var s = str.replace(/_/gi, " ");
		s = s.charAt(0).toUpperCase() + s.slice(1);
		return s;
	},
	getTipCommons : function(f){
		var strand = (f.strand != null) ? f.strand : "NA";
		return 'start-end:&nbsp;<span class="emph">'+f.start+'-'+f.end+'</span><br>'+
		'strand:&nbsp;<span class="emph">'+strand+'</span><br>'+
		'length:&nbsp;<span class="info">'+(f.end-f.start+1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+'</span><br>';
	},
		
	//items
	sequence:{
		color: SEQUENCE_COLORS
	},
	undefined:{
		getLabel: function(f){
			var str = "";
			str+= f.chromosome + ":" + f.start + "-" + f.end;
			return str;
		},
		getTipTitle: function(f){
			return " ";
		},
		getTipText: function(f){
			return " ";
		},
		getColor: function(f){
			return "grey";
		},
//		infoWidgetId: "id",
		height:10
//		histogramColor:"lightblue"
	},
	gene:{
		getLabel: function(f){
            var name = (f.name != null) ? f.name : f.id;
			var str = "";
			str+= (f.strand < 0 || f.strand == '-') ? "<" : "";
			str+= " "+name+" ";
			str+= (f.strand > 0 || f.strand == '+') ? ">" : "";
            if(f.biotype != null && f.biotype != ''){
			    str+= " ["+f.biotype+"]";
            }
			return str;
		},
		getTipTitle: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return FEATURE_TYPES.formatTitle(f.featureType) +
			' - <span class="ok">'+name+'</span>';
		},
		getTipText: function(f){
			var color = GENE_BIOTYPE_COLORS[f.biotype];
			return	'id:&nbsp;<span class="ssel">'+f.id+'</span><br>'+
			'biotype:&nbsp;<span class="emph" style="color:'+color+';">'+f.biotype+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f)+
			'source:&nbsp;<span class="ssel">'+f.source+'</span><br><br>'+
            'description:&nbsp;<span class="emph">'+f.description+'</span><br>';
		},
		getColor: function(f){
			return GENE_BIOTYPE_COLORS[f.biotype];
		},
		infoWidgetId: "id",
		height:4,
		histogramColor:"lightblue"
	},
//	geneorange:{
//		getLabel: function(f){
//			var str = "";
//			str+= (f.strand < 0) ? "<" : "";
//			str+= " "+f.name+" ";
//			str+= (f.strand > 0) ? ">" : "";
//			str+= " ["+f.biotype+"]";
//			return str;
//		},
//		getTipTitle: function(f){
//			return FEATURE_TYPES.formatTitle(f.featureType) +
//			' - <span class="ok">'+f.name+'</span>';
//		},
//		getTipText: function(f){
//			var color = GENE_BIOTYPE_COLORS[f.biotype];
//			return	'Ensembl&nbsp;ID:&nbsp;<span class="ssel">'+f.id+'</span><br>'+
//			'biotype:&nbsp;<span class="emph" style="color:'+color+';">'+f.biotype+'</span><br>'+
//			'description:&nbsp;<span class="emph">'+f.description+'</span><br>'+
//			FEATURE_TYPES.getTipCommons(f)+
//			'source:&nbsp;<span class="ssel">'+f.source+'</span><br>';
//		},
//		getColor: function(f){
//			return GENE_BIOTYPE_COLORS[f.biotype];
//		},
//		infoWidgetId: "id",
//		height:4,
//		histogramColor:"lightblue"
//	},
	transcript:{
		getLabel: function(f){
            var name = (f.name != null) ? f.name : f.id;
			var str = "";
			str+= (f.strand < 0) ? "<" : "";
			str+= " "+name+" ";
			str+= (f.strand > 0) ? ">" : "";
            if(f.biotype != null && f.biotype != ''){
                str+= " ["+f.biotype+"]";
            }
			return str;
		},
		getTipTitle: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return FEATURE_TYPES.formatTitle(f.featureType) +
			' - <span class="ok">'+name+'</span>';
		},
		getTipText: function(f){
			var color = GENE_BIOTYPE_COLORS[f.biotype];
			return	'id:&nbsp;<span class="ssel">'+f.id+'</span><br>'+
			'biotype:&nbsp;<span class="emph" style="color:'+color+';">'+f.biotype+'</span><br>'+
			'description:&nbsp;<span class="emph">'+f.description+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return GENE_BIOTYPE_COLORS[f.biotype];
		},
		infoWidgetId: "id",
		height:1,
		histogramColor:"lightblue"
	},
	exon:{//not yet
		getLabel: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return name;
		},
		getTipTitle: function(f){
            var name = (f.name != null) ? f.name : f.id;
            if (name == null){name = ''}
			return FEATURE_TYPES.formatTitle(f.featureType)+' - <span class="ok">'+name+'</span>';
		},
		getTipText: function(e,t){
            var ename = (e.name != null) ? e.name : e.id;
            var tname = (t.name != null) ? t.name : t.id;
			var color = GENE_BIOTYPE_COLORS[t.biotype];
			return	'transcript name:&nbsp;<span class="ssel">'+t.name+'</span><br>'+
			'transcript Ensembl&nbsp;ID:&nbsp;<span class="ssel">'+t.id+'</span><br>'+
			'transcript biotype:&nbsp;<span class="emph" style="color:'+color+';">'+t.biotype+'</span><br>'+
			'transcript description:&nbsp;<span class="emph">'+t.description+'</span><br>'+
			'transcript start-end:&nbsp;<span class="emph">'+t.start+'-'+t.end+'</span><br>'+
			'exon start-end:&nbsp;<span class="emph">'+e.start+'-'+e.end+'</span><br>'+
			'strand:&nbsp;<span class="emph">'+t.strand+'</span><br>'+
			'length:&nbsp;<span class="info">'+(e.end-e.start+1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+'</span><br>';
		},
		getColor: function(f){
			return "black";
		},
		infoWidgetId: "id",
		height:5,
		histogramColor:"lightblue"
	},
	snp:{
		getLabel: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return name;
		},
		getTipTitle: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return f.featureType.toUpperCase() +
			' - <span class="ok">'+name+'</span>';
		},
		getTipText: function(f){
			var color = SNP_BIOTYPE_COLORS[f.displaySoConsequence];
			return 'alleles:&nbsp;<span class="ssel">'+f.alleleString+'</span><br>'+
//			'ancestral allele:&nbsp;<span class="ssel">'+f.ancestralAllele+'</span><br>'+
//			'SO consequence:&nbsp;<span class="emph" style="color:'+color+';">'+f.displaySoConsequence+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f)+
			'source:&nbsp;<span class="ssel">'+f.source+'</span><br>';
			
		},
		getColor: function(f){
//			return SNP_BIOTYPE_COLORS[f.displaySoConsequence];
			return 'lightblue';
		},
		infoWidgetId: "id",
		height:8,
		histogramColor:"orange"
	},
	cpg_island:{
		getLabel: function(f){
			return f.name;
		},
		getTipTitle: function(f){
			return 'CpG island - <span class="ok">'+f.name+'</span>';
		},
		getTipText: function(f){
			return 'CpG number:&nbsp;<span class="ssel">'+f.cpgNum+'</span><br>'+
			'CpG precentage:&nbsp;<span class="ssel">'+f.perCpG+'</span><br>'+
			'CG number:&nbsp;<span class="ssel">'+f.gcNum+'</span><br>'+
			'CG percentage:&nbsp;<span class="ssel">'+f.perGc+'</span><br>'+
			'observed-expected ratio:&nbsp;<span class="ssel">'+f.observedExpectedRatio+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "Aquamarine";
		},
		infoWidgetId: "name",
		height:8,
		histogramColor:"Aquamarine"
	},
	mutation:{
		getLabel: function(f){
			return f.mutationCds;
		},
		getTipTitle: function(f){
			return FEATURE_TYPES.formatTitle(f.featureType)+' - <span class="ok">'+f.mutationCds+'</span>';
		},
		getTipText: function(f){
			return 'mutation CDS:&nbsp;<span class="ssel">'+f.mutationCds+'</span><br>'+
			'mutation Aa:&nbsp;<span class="ssel">'+f.mutationAa+'</span><br>'+
			'mutation description:&nbsp;<span class="ssel">'+f.mutationDescription+'</span><br>'+
			'primary histology:&nbsp;<span class="ssel">'+f.primaryHistology+'</span><br>'+
			'primary site:&nbsp;<span class="ssel">'+f.primarySite+'</span><br>'+
			'site subtype:&nbsp;<span class="ssel">'+f.siteSubtype+'</span><br>'+
			'gene name:&nbsp;<span class="ssel">'+f.geneName+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f)+
			'source:&nbsp;<span class="ssel">'+f.source+'</span><br>';
		},
		getColor: function(f){
			return "Chartreuse";
		},
		infoWidgetId: "mutationCds",
		height:8,
		histogramColor:"Chartreuse"
	},
    icgc_mutation:{
        getLabel: function(f){
            return f.id;
        },
        getTipTitle: function(f){
            return 'ICGC mutation'+' - <span class="ok">'+f.id+'</span>';
        },
        getTipText: function(f) {
            var consequences = '';
            for(var i = 0; i< f.consequences.length; i++) {
                consequences += '&nbsp;'+f.consequences[i]+'<br>';
            }
            return 'mutation:&nbsp;<span class="ssel">'+f.mutation+'</span><br>'+
                'reference allele:&nbsp;<span class="ssel">'+f.refGenAllele+'</span><br>'+
                'mutation type:&nbsp;<span class="ssel">'+f.mutationType+'</span><br>'+
                'project info:&nbsp;<span class="ssel">'+f.projectInfo[0]+'</span><br>'+
                'consequences:<br>&nbsp;<span class="ssel">'+consequences+'</span><br>'+
                'source:&nbsp;<span class="ssel">ICGC</span><br>' +
                'start-end:&nbsp;<span class="emph">'+f.start+'-'+f.end+'</span><br>';
        },
        getColor: function(f){
            return "Chartreuse";
        },
        infoWidgetId: "mutationCds",
        height:8,
        histogramColor:"Chartreuse"
    },
	structural_variation:{
		getLabel: function(f){
			return f.displayId;
		},
		getTipTitle: function(f){
			return FEATURE_TYPES.formatTitle(f.featureType)+' - <span class="ok">'+f.displayId+'</span>';
		},
		getTipText: function(f){
			return 'display ID:&nbsp;<span class="ssel">'+f.displayId+'</span><br>'+
			'SO term:&nbsp;<span class="ssel">'+f.soTerm+'</span><br>'+
			'study description:&nbsp;<span class="emph">'+f.studyDescription+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f)+
			'source:&nbsp;<span class="ssel">'+f.source+'</span><br>';
		},
		getColor: function(f){
			return "indigo";
		},
		infoWidgetId: "name",
		height:8,
		histogramColor:"indigo"
	},
	tfbs:{
		getLabel: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return name;
		},
		getTipTitle: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return 'TFBS - <span class="ok">'+name+'</span>';
		},
		getTipText: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return 'TF name:&nbsp;<span class="ssel">'+name+'</span><br>'+
//			'relative start:&nbsp;<span class="ssel">'+f.relativeStart+'</span><br>'+
//			'relative end:&nbsp;<span class="ssel">'+f.relativeEnd+'</span><br>'+
//			'target gene name:&nbsp;<span class="ssel">'+f.targetGeneName+'</span><br>'+
			'score:&nbsp;<span class="ssel">'+f.score+'</span><br>'+
//			'sequence:&nbsp;<span class="ssel">'+f.sequence+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f)+
			'source:&nbsp;<span class="ssel">'+f.source+'</span><br>';
		},
		getColor: function(f){
			return "blue";
		},
		infoWidgetId: "name",
		height:8,
		histogramColor:"blue"
	},
	mirna_target:{
		getLabel: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return name;
		},
		getTipTitle: function(f){
            var name = (f.name != null) ? f.name : f.id;
			return 'miRNA target - <span class="ok">'+name+'</span>';
		},
		getTipText: function(f){
			return ''+
//            'gene target name:&nbsp;<span class="ssel">'+f.geneTargetName+'</span><br>'+
//			'experimental method:&nbsp;<span class="ssel">'+f.experimentalMethod+'</span><br>'+
			'score:&nbsp;<span class="ssel">'+f.score+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f)+
			'source:&nbsp;<span class="ssel">'+f.source+'</span><br>';
		},
		getColor: function(f){
			return "#8b668b";
		},
		infoWidgetId: "name",
		height:8,
		histogramColor:"#8b668b"
	},
	conserved_region:{
		getLabel: function(f){
			return f.conservedRegionId;
		},
		getTipTitle: function(f){
			return FEATURE_TYPES.formatTitle(f.featureType)+' - <span class="ok">'+f.conservedRegionId+'</span>';
		},
		getTipText: function(f){
			return 'method:&nbsp;<span class="ssel">'+f.method+'</span><br>'+
			'data range primate:&nbsp;<span class="ssel">'+f.dataRangePrimate+'</span><br>'+
			'lower limit primate:&nbsp;<span class="ssel">'+f.lowerLimitPrimate+'</span><br>'+
			'sumData primate:&nbsp;<span class="ssel">'+f.sumDataPrimate+'</span><br>'+
			'sumSquare primate:&nbsp;<span class="ssel">'+f.sumSquarePrimate+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "DodgerBlue";
		},
		infoWidgetId: "name",
		height:8,
		histogramColor:"DodgerBlue"
	},
	file:{
		getLabel: function(f){
			var str = "";
			str+= f.label;
			return str;
		},
		getTipTitle: function(f){
			return FEATURE_TYPES.formatTitle(f.featureType);
		},
		getTipText: function(f){
			return FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "black";
		},
		height:8,
		histogramColor:"orange"
	},
	vcf:{
		getLabel: function(f){
                return f.id;
				try {
						var fields = f.sampleData.split("\t");
					} catch (e) {
					//Uncaught TypeError: Cannot call method 'split' of undefined 
						console.log(e)
						debugger
						
					}
			
			if(fields.length>10 || fields.length==9)
				return f.id+" "+f.ref+"/"+f.alt+"";
			else{
				var gt = fields[9].split(":")[0];
				if(gt.indexOf(".")!= -1 || gt.indexOf("-")!= -1)
					return gt;
				var label = "";
				var alt = f.alt.split(",");
				if(gt.charAt(0)=='0')
					label = f.ref;
				else{
					var pos = gt.charAt(0)-1
					label = alt[pos] 
				}				
				label+=gt.charAt(1)
				if(gt.charAt(2)=='0')
					label += f.ref;
				else{
					var pos = gt.charAt(2)-1
					label += alt[pos] 
				}
		
				return label;
			}
		},
		getTipTitle: function(f){
			return 'VCF variant - <span class="ok">'+f.id+'</span>';
		},
		getTipText: function(f){
			return 'alleles (ref/alt):&nbsp;<span class="emph">'+f.reference+"/"+f.alternate+'</span><br>'+
			'quality:&nbsp;<span class="emph">'+f.quality+'</span><br>'+
			'filter:&nbsp;<span class="emph">'+f.filter+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "black";
		},
		infoWidgetId: "id",
		height:8,
		histogramColor:"gray"
	},
	gff2:{
		getLabel: function(f){
			var str = "";
			str+= f.label;
			return str;
		},
		getTipTitle: function(f){
			return f.featureType.toUpperCase() +
			' - <span class="ok">'+f.label+'</span>';
		},
		getTipText: function(f){
			return 'score:&nbsp;<span class="emph">'+f.score+'</span><br>'+
			'frame:&nbsp;<span class="emph">'+f.frame+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "black";
		},
		height:8,
		histogramColor:"gray"
	},
	gff3:{
		getLabel: function(f){
			var str = "";
			str+= f.label;
			return str;
		},
		getTipTitle: function(f){
			return f.featureType.toUpperCase() +
			' - <span class="ok">'+f.label+'</span>';
		},
		getTipText: function(f){
			return 'score:&nbsp;<span class="emph">'+f.score+'</span><br>'+
			'frame:&nbsp;<span class="emph">'+f.frame+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "black";
		},
		height:8,
		histogramColor:"gray"
	},
	gtf:{
		getLabel: function(f){
			var str = "";
			str+= f.label;
			return str;
		},
		getTipTitle: function(f){
			return f.featureType.toUpperCase() +
			' - <span class="ok">'+f.label+'</span>';
		},
		getTipText: function(f){
			return 'score:&nbsp;<span class="emph">'+f.score+'</span><br>'+
			'frame:&nbsp;<span class="emph">'+f.frame+'</span><br>'+
			FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "black";
		},
		height:8,
		histogramColor:"gray"
	},
	bed:{
		getLabel: function(f){
			var str = "";
			str+= f.label;
			return str;
		},
		getTipTitle: function(f){
			return FEATURE_TYPES.formatTitle(f.featureType);
		},
		getTipText: function(f){
			return FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			//XXX convert RGB to Hex
	        var rgbColor = new Array();
	        rgbColor = f.itemRgb.split(",");
	        var hex = function (x) {
	        	var hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
	            return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
	        };
	        var hexColor = hex(rgbColor[0])+ hex(rgbColor[1]) + hex(rgbColor[2]);
			return "#"+hexColor;
		},
		height:8,
		histogramColor:"orange"
	},
	bam:{
		explainFlags : function(flags) {
			var summary = '<div style="background:#FFEF93;font-weight:bold;margin:0 15px 0 0;">flags : <span class="ssel">'+flags+'</span></div>';
			for(var i = 0; i < SAM_FLAGS.length; i++) {
				if(SAM_FLAGS[i][1] & flags) {
					summary  += SAM_FLAGS[i][0] + "<br>";
				} 
			}
			return summary;
		},
		getLabel: function(f){
			return  "bam  "+f.chromosome+":"+f.start+"-"+f.end;
		},
		getTipTitle: function(f){
			return FEATURE_TYPES.formatTitle(f.featureType)+' - <span class="ok">'+f.name+'</span>';
		},
		getTipText: function(f){
			f.strand = FEATURE_TYPES.bam.getStrand(f);
			var one =  'cigar:&nbsp;<span class="ssel">'+f.cigar+'</span><br>'+
				'insert size:&nbsp;<span class="ssel">'+f.inferredInsertSize+'</span><br>'+
				FEATURE_TYPES.getTipCommons(f)+'<br>'+
				this.explainFlags(f.flags);
			
			var three = '<div style="background:#FFEF93;font-weight:bold;">attributes</div>';
			delete f.attributes["BQ"];//for now because is too long
			for (var key in f.attributes) {
				three += key+":"+f.attributes[key]+"<br>";
			}
			var style = "background:#FFEF93;font-weight:bold;";
			return '<div style="float:left">'+one+'</div>'+
					'<div style="float:right">'+three+'</div>';
		},
		getColor: function(f, chr){
			if(f.mateReferenceName != chr){return "lightgreen";}
			return (parseInt(f.flags)&(0x10)) == 0 ? "DarkGray" : "LightGray";/**/
		},
		getStrokeColor: function(f){
			if(this.getMateUnmappedFlag(f)){return "tomato"}
			return "whitesmoke";
		},
		getStrand: function(f){
			return (parseInt(f.flags)&(0x10)) == 0 ? "Forward" : "Reverse";
		},
		getReadPairedFlag: function(f){
			return (parseInt(f.flags)&(0x1)) == 0 ? false : true;
		},
		getFirstOfPairFlag: function(f){
			return (parseInt(f.flags)&(0x40)) == 0 ? false : true;
		},
		getMateUnmappedFlag: function(f){
			return (parseInt(f.flags)&(0x8)) == 0 ? false : true;
		},
		height:8,
		histogramColor:"grey"
	},
	das:{
		getLabel: function(f){
			var str = "";
			str+= f.id;
			return str;
		},
		getTipTitle: function(f){
			return FEATURE_TYPES.formatTitle(f.featureType);
		},
		getTipText: function(f){
			return FEATURE_TYPES.getTipCommons(f);
		},
		getColor: function(f){
			return "black";
		},
		height:8,
		histogramColor:"orange"
	}
};


function InfoWidget(targetId, species, args){
	this.id = "InfoWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.species=species;
	
	this.title = null;
	this.featureId = null;
	this.width = 800;
	this.height = 460;
	
	this.feature = null;
	this.query = null;
	this.adapter = null;
	
	
	if (targetId!= null){
		this.targetId = targetId;       
	}
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	switch (species){
	case "hsapiens":
		this.ensemblSpecie = "Homo_sapiens"; 
		this.reactomeSpecie = "48887"; 
		this.wikipathwaysSpecie = "Homo+sapiens"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	case "mmusculus":
		this.ensemblSpecies = "Mus_musculus"; 
		this.reactomeSpecies = "48892";
		this.wikipathwaysSpecie = "Mus+musculus"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	case "drerio":
		this.ensemblSpecie = "Danio_rerio"; 
		this.reactomeSpecie = "68323"; 
		this.wikipathwaysSpecie = "Danio+rerio"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	}
	
	this.notFoundPanel = Ext.create('Ext.panel.Panel',{
		id:this.id+"notFoundPanel",
		cls:'panel-border-left',
		border:false,
		flex:3,
		bodyPadding:'40',
		html:'No results found'
	});
	
};

InfoWidget.prototype.draw = function (args){
	console.log(args);
//	this.featureId = feature.id;
	this.query = args.query;
	this.feature = args.feature;
	this.adapter = args.adapter;
//	if(feature.getName()==null){
//		console.log("getName not defined");
////		var feature = new Object();
////		feature.getName = function(){return feature;};
//	}	
	
//	console.log(feature.getName());
//	this.feature.getName = function(){return "a";};
	
	this.panel=Ext.getCmp(this.title +" "+ this.query);
	if (this.panel == null){
		//the order is important
		this.render();
		this.panel.show();
		this.getData();
	}else{
		this.panel.show();
	}
};

InfoWidget.prototype.render = function (){
		/**MAIN PANEL**/
		this.panel = Ext.create('Ext.ux.Window', {
		    title: this.title +" "+ this.query,
		    id : this.title +" "+ this.query,
//		    resizable: false,
		    minimizable :true,
			constrain:true,
		    closable:true,
		    height:this.height,
		    width:this.width,
//		    modal:true,
//			layout: {type: 'table',columns: 2},
		    layout: { type: 'hbox',align: 'stretch'},
		    items: [this.getTreePanel()],
		    buttonAlign:'right',
//		    buttons:[],
		    listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.hide();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	        }
		});
};

InfoWidget.prototype.getTreePanel = function (){
		var dataTypes = this.getdataTypes();
	   	this.checkDataTypes(dataTypes);
	        
		var treeStore = Ext.create('Ext.data.TreeStore', {
		    root: {
		        expanded: true,
		        text: "Options",
		        children: dataTypes
		    }
		});
		
		var treePan = Ext.create('Ext.tree.Panel', {
		    title: 'Detailed information',
		    bodyPadding:10,
		    flex:1,
		   	border:false,
		    store: treeStore,
		    useArrows: true,
		    rootVisible: false,
		    listeners : {
			    	scope: this,
			    	itemclick : function (este,record){
			    		this.optionClick(record.data);
		    		}
			}
		});
		return treePan;
};



InfoWidget.prototype.doGrid = function (columns,fields,modelName,groupField){
		var groupFeature = Ext.create('Ext.grid.feature.Grouping',{
			groupHeaderTpl: '{[values.name]} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
			startCollapsed: true
	    });
		var filters = [];
		for(var i=0; i<fields.length; i++){
			filters.push({type:'string', dataIndex:fields[i]});
		}
		var filters = {
				ftype: 'filters',
				local: true, // defaults to false (remote filtering)
				filters: filters
		};
	    Ext.define(modelName, {
		    extend: 'Ext.data.Model',
	    	fields:fields
		});
	   	var store = Ext.create('Ext.data.Store', {
			groupField: groupField,
			model:modelName
	    });
		var grid = Ext.create('Ext.grid.Panel', {
			id: this.id+modelName,
	        store: store,
	        title : modelName,
	        border:false,
	        cls:'panel-border-left',
			flex:3,        
	        features: [groupFeature,filters],
	        viewConfig: {
//	            stripeRows: true,
	            enableTextSelection: true
	        },
	        columns: columns,
	        bbar  : ['->', {
	            text:'Clear Grouping',
	            handler : function(){
	                groupFeature.disable();
	            }
	        }]
	    });
    return grid;
};


InfoWidget.prototype.checkDataTypes = function (dataTypes){
	for (var i = 0; i<dataTypes.length; i++){
		if(dataTypes[i]["children"]!=null){
			dataTypes[i]["iconCls"] ='icon-box';
			dataTypes[i]["expanded"] =true;
			this.checkDataTypes(dataTypes[i]["children"]);
		}else{
			dataTypes[i]["iconCls"] ='icon-blue-box';
			dataTypes[i]["leaf"]=true;
		}
	}
};

InfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return [];
};
InfoWidget.prototype.optionClick = function (){
	//Abstract method
};
InfoWidget.prototype.getData = function (){
	//Abstract method
};

InfoWidget.prototype.getGeneTemplate = function (){
	return  new Ext.XTemplate(
		    '<div style="font-family:Oxygen"><span class="panel-border-bottom"><span class="ssel s130">{name}</span> &nbsp; <span class="emph s120"> {id} </span></span>',
			' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Location/View?g={id}">Ensembl</a>',
			' &nbsp; <a target="_blank" href="http://wikipathways.org//index.php?query={externalName}&species='+this.wikipathwaysSpecie+'&title=Special%3ASearchPathways&doSearch=1">Wikipathways</a>',
			'</div><br>',
		    '<div><span class="w75 infokey s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" infokey s90">Strand: </span> {strand}</div>',
		    '<div><span class="w75 infokey s90">Biotype: </span> {biotype}</div>',
		    '<div><span class="w75 infokey s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></div>',
		    '<div><span class="w75 infokey s90">Source: </span> <span class="s110">{source}</span></div>',
//		    '<div><span class="w75 infokey s90">External DB: </span> {externalDb}</div>',
		    '<div><span class="w75 infokey s90">Status: </span> {status}</div>' // +  '<br>'+str
	);
};
InfoWidget.prototype.getTranscriptTemplate = function (){
	return new Ext.XTemplate(
		    '<div style="font-family:Oxygen"><span class="panel-border-bottom"><span class="ssel s130">{name}</span> &nbsp; <span class="emph s120"> {id} </span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Transcript/Transcript?t={id}">Ensembl</a>',
		    ' &nbsp; <a target="_blank" href="http://wikipathways.org//index.php?query={externalName}&species='+this.wikipathwaysSpecie+'&title=Special%3ASearchPathways&doSearch=1">Wikipathways</a>',
		    '</div><br>',
		    '<div><span class="w100 infokey s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" infokey s90">Strand: </span> {strand}</div>',
		    '<div><span class="w100 infokey s90">Biotype: </span> {biotype}</div>',
		    '<div><span class="w100 infokey s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></div>',
		    '',
		    '<div><span class="w100 infokey s90">CDS &nbsp; (start-end): </span> {genomicCodingStart}-{genomicCodingEnd} <span style="margin-left:50px" class="w100 infokey s90">CDNA (start-end): </span> {cdnaCodingStart}-{cdnaCodingEnd}</div>',
		    '<div><span class="w100 infokey s90">External DB: </span> {externalDb}</div>',
		    '<div><span class="w100 infokey s90">Status: </span> {status}</div><br>'// +  '<br>'+str
		);
};
InfoWidget.prototype.getSnpTemplate = function (){

//
//    alleleString: "C/T"
//    alternate: "T"
//    assembly: ""
//    chromosome: "13"
//    end: 32889669
//    featureAlias: "featureAlias"
//    featureId: "featureId"
//    id: "rs55880202"
//    populationFrequencies: null
//    reference: "C"
//    samples: Array[0]
//    source: ""
//    species: ""
//    start: 32889669
//    strand: "1"
//    transcriptVariations: Array[6]
//    type: "SNV"
//    validationStatus: "freq,1000Genome"
//    variantFreq: "variantFreq"
//    version: ""
//    xrefs: Array[0]

	return new Ext.XTemplate(
		    '<div style="font-family:Oxygen"><span class="panel-border-bottom"><span class="ssel s130">{id}</span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Variation/Summary?v={id}">Ensembl</a>',
		    '</div><br>',
		    '<div><span class="w140 infokey s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" infokey s90">Strand: </span> {strand}</div>',
		    '<div><span class="w140 infokey s90">Source: </span> <span class="s110">{source}</span></div>',
		    '<div><span class="w140 infokey s90">Type: </span> <span class="s110">{type}</span></div>',
		    '<div><span class="w140 infokey s90">Map weight: </span> {mapWeight}</div>',
		    '<div><span class="w140 infokey s90">Allele string: </span> {alleleString}</div>',
		    '<div><span class="w140 infokey s90">Ancestral allele: </span> {ancestralAllele}</div>',
		    '<div><span class="w140 infokey s90">Display SO consequence type: </span> {displayConsequenceType}</div>',
		    '<div><span class="w140 infokey s90">SO consequence types: </span> {consequenceTypes}</div>'
//		    '<div><span class="w140 infokey s90">Xrefs: </span> {xrefs}</div>'
//		    '<div><span class="w140 infokey s90">Sequence: </span> {sequence}</div>' // +  '<br>'+str
		);
};

InfoWidget.prototype.getExonTemplate = function (){
	return new Ext.XTemplate(
			'<span style="font-family:Oxygen" ><span class="panel-border-bottom"><span class="ssel s110">{id}</span></span></span>',
			'<span><span style="margin-left:30px" class="infokey s90"> Location: </span> <span class="">{chromosome}:{start}-{end} </span></span>',
			'<span><span style="margin-left:30px" class="infokey s90"> Strand: </span> {strand}</span>'
		);
};

InfoWidget.prototype.getProteinTemplate = function (){
	return new Ext.XTemplate(
			 '<div style="font-family:Oxygen"><span class="panel-border-bottom"><span class="ssel s130">{name}</span> &nbsp; <span class="emph s120"> {primaryAccession} </span></span></div>',
			 '<br>',
			 '<div><span class="w100 infokey s90">Full name: </span> <span class="">{fullName}</span></div>',
			 '<div><span class="w100 infokey s90">Gene name: </span> <span class="">{geneName}</span></div>',
			 '<div><span class="w100 infokey s90">Organism: </span> <span class="">{organism}</span></div>'
		);
};


InfoWidget.prototype.getVCFVariantTemplate = function (){
	return new Ext.XTemplate(
			'<div style="font-family:Oxygen"><span><span class="panel-border-bottom"><span class="ssel s130">{chromosome}:{start}-{alt}</span> &nbsp; <span class="emph s120"> {label} </span></span></span></div><br>',
			'<div><span class="w75 infokey s90">Alt: </span> {alt}</div>',
			'<div><span class="w75 infokey s90">Ref: </span> {ref}</div>',
			'<div><span class="w75 infokey s90">Quality: </span> {quality}</div>',
			'<div><span class="w75 infokey s90">Format: </span> {format}</div>',
			'<div><span class="w75 infokey s90">Samples: </span> {samples}</div>',
			'<div><span class="w75 infokey s90">Info: <br></span> {info}</div>'
		);
};

InfoWidget.prototype.getPWMTemplate = function (){
	return new Ext.XTemplate(
			 '<div style="font-family:Oxygen"><span class="panel-border-bottom"><span class="ssel s130">{accession}</span> &nbsp; <span class="emph s120"> {tfName} </span></span></div>',
			 '<br>',
			 '<div><span class="w100 infokey s90">Type: </span> <span class="">{source}</span></div>',
			 '<div><span class="w100 infokey s90">Source: </span> <span class="">{type}</span></div>',
			 '<div><span class="w100 infokey s90">Description: </span> <span class="">{description}</span></div>',
			 '<div><span class="w100 infokey s90">Length: </span> <span class="">{length}</span></div>',
			 '<div><span class="w100 infokey s90">Frequencies: </span> <span class="">{[this.parseFrequencies(values.frequencies)]}</span></div>',
			 {
				 parseFrequencies: function(values){
					 return '<div>'+values.replace(/,/gi, '<br>')+"</div>";
				 }
			 }
		);
};

InfoWidget.prototype.getProteinXrefTemplate = function (){
	return new Ext.XTemplate(
			'<div style="font-family:Oxygen"><span class="w75 emph s100">{[values.source.toUpperCase()]}</span> &nbsp; <span class="emph w125 s100"> {[this.generateLink(values)]} <span class="info">&raquo;</span> </span></div>',
			{
				generateLink: function(values){
					if(values.source!=null){
						switch(values.source.toUpperCase()){
						case "GO": 	return 		'<a TARGET="_blank" href="http://amigo.geneontology.org/cgi-bin/amigo/term_details?term='+values.name+'">'+values.name+'</a>'; break;
						case "REACTOME": return '<a TARGET="_blank" href="http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID='+values.name+'">'+values.name+'</a>'; break;
						case "KEGG": return 	'<a TARGET="_blank" href="http://www.genome.jp/dbget-bin/www_bget?'+values.name+'">'+values.name+'</a>'; break;
						case "INTACT": return 	'<a TARGET="_blank" href="http://www.ebi.ac.uk/intact/pages/interactions/interactions.xhtml?query='+values.name+'">'+values.name+'</a>'; break;
						case "MINT": return 	'<a TARGET="_blank" href="http://mint.bio.uniroma2.it/mint/search/search.do?queryType=protein&interactorAc='+values.name+'">'+values.name+'</a>'; break;
						case "DIP": return 		'<a TARGET="_blank" href="http://dip.doe-mbi.ucla.edu/dip/Browse.cgi?ID='+values.name+'">'+values.name+'</a>'; break;
						case "STRING": return 	'<a TARGET="_blank" href="http://string-db.org/newstring_cgi/show_network_section.pl?identifier=P51587">'+values.name+'</a>'; break;
						case "MIM": return 		'<a TARGET="_blank" href="http://www.omim.org/entry/'+values.name+'">'+values.name+'</a>'; break;
						case "PHARMGKB": return '<a TARGET="_blank" href="http://www.pharmgkb.org/do/serve?objId='+values.name+'&objCls=Gene">'+values.name+'</a>'; break;
						case "ORPHANET": return '<a TARGET="_blank" href="http://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=EN&Expert='+values.name+'">'+values.name+'</a>'; break;
						}
					}
					else{
						return "";
					}
				}
			}
		);
};

InfoWidget.prototype.getSnpTranscriptTemplate = function (){
//    alleleString: "C/T"
//    cdnEnd: 0
//    cdnaStart: 0
//    cdsEnd: 0
//    cdsStart: 0
//    codonAlleleString: ""
//    consequenceTypes: Array[1]
//    distanceToTranscript: 188
//    hgvsGenomic: "13:g.32889669C>T"
//    hgvsProtein: ""
//    hgvsTranscript: ""
//    peptideAlleleString: ""
//    polyphenPrediction: ""
//    polyphenScore: 0
//    siftPrediction: ""
//    siftScore: 0
//    somatic: "0"
//    transcriptId: "ENST00000533490"
//    translationEnd: 0
//    translationStart: 0

	return new Ext.XTemplate(
		    '<div style="font-family:Oxygen"><span class="panel-border-bottom"><span class="ssel s130">{[this.getStableId(values)]}</span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Transcript/Transcript?t={[this.getStableId(values)]}">Ensembl</a>',
		    '</div><br>',
		    '<div><span class="w140 infokey s90">CDS &nbsp; (start : end): </span> {cdsStart} : {cdsEnd} <span style="margin-left:50px" class="w100 infokey s90">cDNA (start : end): </span> {cdnaStart} : {cdnaEnd}</div>',
		    '<div><span class="w140 infokey s90">Translation (start : end): </span> {translationStart} : {translationEnd}</div>',
		    '<div><span class="w140 infokey s90">Peptide allele: </span> {peptideAlleleString}</div>',
//		    '<div><span class="w140 infokey s90">Alt. peptide allele: </span> {alternativePeptideAlleleString}</div>',
			'<div><span class="w140 infokey s90">Codon: </span> {codonAlleleString}</div>',
//			'<div><span class="w140 infokey s90">Reference codon: </span> {referenceCodon}</div>',
			'<div><span class="w140 infokey s90">Polyphen prediction: </span> {polyphenPrediction}',
			'<span style="margin-left:50px" class="w140 infokey s90">Polyphen score: </span> {polyphenScore}</div>',
			'<div><span class="w140 infokey s90">Sift prediction: </span> {siftPrediction}',
			'<span style="margin-left:50px" class="w140 infokey s90">Sift score: </span> {siftScore}</div>',
            '<div><span class="w140 infokey s90">SO consequence types: </span> {consequenceTypes}</div><br>',
		    {
		    	getStableId: function(values){
		    		if(values.transcriptId!=""){
		    			return values.transcriptId;
		    		}
		    		return "Intergenic SNP";
		    	}
		    }
		);
};


InfoWidget.prototype.getConsequenceTypeTemplate = function (){
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{transcriptId}</span> &nbsp; </span></div><br>',
		    '<div><span class="w140 infokey s90">SO consequence types: </span> {consequenceTypes}</div><br>'
//		    '<div><span class="w100 infokey s90">SO term: </span> {consequenceType.soTerm}</div>',
//		    '<div><span class="w100 infokey s90">Feature So term: </span> {consequenceType.featureSoTerm}</div>',
//		    '<div><span class="w100 infokey s90">NCBI term: </span> {consequenceType.ncbiTerm}</div>',
//		    '<div><span class="w100 infokey s90">Rank: </span> {consequenceType.rank}</div><br>'
		);
};


InfoWidget.prototype.getPhenotypeTemplate = function (){
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{phenotypeDescription}</span> &nbsp; <span class="emph s120"> {source} </span></span></div><br>',
			'<div><span class="w150 infokey s90">PValue: </span>{PValue}</div>',
			'<div><span class="w150 infokey s90">Assoc. gene name: </span>{associatedGeneName}</div>',
			'<div><span class="w150 infokey s90">Assoc. variant risk allele: </span>{associatedVariantRiskAllele}</div>',
			'<div><span class="w150 infokey s90">Phenotype description: </span>{phenotypeDescription}</div>',
			'<div><span class="w150 infokey s90">Phenotype name: </span>{phenotypeName}</div>',
			'<div><span class="w150 infokey s90">Risk allele freq in controls: </span>{riskAlleleFrequencyInControls}</div>',
			'<div><span class="w150 infokey s90">Source: </span>{source}</div>',
			'<div><span class="w150 infokey s90">Study name: </span>{studyName}</div>',
			'<div><span class="w150 infokey s90">Study type: </span>{studyType}</div>',
			'<div><span class="w150 infokey s90">Study URL: </span>{studyUrl}</div>',
			'<div><span class="w150 infokey s90">Study description: </span>{studyDescription}</div>'
		);
};

InfoWidget.prototype.getPopulationTemplate = function (){
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{population}</span> &nbsp; <span class="emph s120"> {source} </span></span></div><br>',
		    '<div><span class="w140 infokey s90">Ref allele:  </span>{refAllele} ({refAlleleFrequency})</div>',
		    '<div><span class="w140 infokey s90">Other allele:  </span>{otherAllele} ({otherAlleleFrequency})</div>',
		    '<div><span class="w140 infokey s90">Ref allele homozygote:  </span>{refAlleleHomozygote} ({refAlleleHomozygoteFrequency})</div>',
		    '<div><span class="w140 infokey s90">Allele heterozygote:  </span>{alleleHeterozygote} ({alleleHeterozygoteFrequency})</div>',
			 '<div><span class="w140 infokey s90">Other allele homozygote:  </span>{otherAlleleHomozygote} ({otherAlleleHeterozygoteFrequency})</div>',
//			 'TODO cuidado <div><span class="w140 infokey s90">other allele heterozygote Frequency:  </span>{otherAlleleHeterozygoteFrequency}</div>',
			 '<div><span class="w140 infokey s90">Source:  </span>{source}</div>',
			 '<div><span class="w140 infokey s90">Population:  </span>{population}</div>'
		);
};

//not used
InfoWidget.prototype.getVariantEffectTemplate = function (){
		
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{consequenceTypeObo}</span> &nbsp; <span class="emph s120"> {featureBiotype} </span></span></div><br>'
		);
};

GeneInfoWidget.prototype.draw = InfoWidget.prototype.draw;
GeneInfoWidget.prototype.render = InfoWidget.prototype.render;
GeneInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
GeneInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
GeneInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
GeneInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
GeneInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;

function GeneInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Gene Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

GeneInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Transcripts"},
                    { text: "Xrefs"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "Reactome"},
	                { text: "Interpro"}
	            ] },
	            { text: "Regulatory", children: [
	                { text: "TFBS"}
//	                { text: "miRNA targets"}
	            ]},
	            { text:"Protein", children: [
	                { text: "Features"},//protein profile
	                { text: "3D structure"}
	            ]}	     
	        ];
};

GeneInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getGenePanel(this.data).show()); break;
			case "Transcripts": this.panel.add(this.getTranscriptPanel(this.data.transcripts).show());  break;
			case "Xrefs": this.panel.add(this.getXrefGrid(this.data.transcripts, 'Xref', 'transcript').show());  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.transcripts, 'GO', 'transcript').show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.transcripts, 'Interpro', 'transcript').show());  break;
			case "Reactome": this.panel.add(this.getXrefGrid(this.data.transcripts, 'Reactome', 'transcript').show());  break;
			case "TFBS": this.panel.add(this.getTfbsGrid(this.data.transcripts).show());  break;
			case "miRNA targets": this.panel.add(this.getMirnaTargetGrid(this.data.mirnaTargets).show());  break;
			case "Features": this.panel.add(this.getProteinFeaturesGrid(this.data.proteinFeatures).show());  break;
			case "3D structure": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

GeneInfoWidget.prototype.getGenePanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.genePanel==null){
    	var tpl = this.getGeneTemplate();
    	
		this.genePanel = Ext.create('Ext.panel.Panel',{
			title:"Gene information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});
    }
    return this.genePanel;
};


GeneInfoWidget.prototype.getTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(transcriptPanel);
    	}
		this.transcriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.transcriptGrid;
};


GeneInfoWidget.prototype.getXrefGrid = function(transcripts, dbname, groupField){
    var data = [];
    for(var i = 0; i<transcripts.length; i++){
        for(var j = 0; j<transcripts[i].xrefs.length; j++){
            var xref = transcripts[i].xrefs[j];
            if(dbname == 'Xref'){
                var shortName  = xref.dbNameShort.toLowerCase();
                if(shortName != 'go' && shortName != 'interpro' && shortName != 'reactome'){
                    xref.transcript = transcripts[i].id;
                    data.push(xref);
                }
            }else{
                if(xref.dbNameShort.toLowerCase() == dbname.toLowerCase()){
                    xref.transcript = transcripts[i].id;
                    data.push(xref);
                }
            }
        }
    }
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this[dbname+"Grid"]==null){
    	var groupField = groupField;
    	var modelName = dbname;
    	var fields = ['description','id', 'dbName', 'transcript'];
    	var columns = [
    	               {header : 'Display Id',dataIndex: 'id',flex:1},
    	               {header : 'DB name',dataIndex: 'dbName',flex:1},
    	               {header : 'Description',dataIndex: 'description',flex:3}
    	               ];
    	this[dbname+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
    	this[dbname+"Grid"].store.loadData(data);
    }
    return this[dbname+"Grid"];
};

//GeneInfoWidget.prototype.getGoGrid = function(){
//    var _this = this;
//    if(this.goGrid==null){
//    	var groupField = 'namespace';
//    	var modelName = 'GO';
//	    var fields = ['id','name','description','level','directNumberOfGenes','namespace','parents','propagatedNumberOfGenes','score'];
//		var columns = [ {header : 'Database id',dataIndex: 'id',flex:2},
//						{header : 'Name',dataIndex: 'name',flex:1},
//						{header : 'Description',dataIndex: 'description',flex:2},
//		                {
//		                	xtype: 'actioncolumn',
//		                	header : '+info',
//		                    flex:1,
//		                    items: [{
//		                        iconCls: 'icon-blue-box',  // Use a URL in the icon config
//		                        tooltip: '+info',    
//		                        handler: function(grid, rowIndex, colIndex) {
//		                            var rec = _this.goStore.getAt(rowIndex);
//		                            Ext.Msg.alert(rec.get('name'), rec.get('description'));
//		                        }
//		                    }]
//		                 },
//		                {header : 'Direct genes',dataIndex: 'directNumberOfGenes',flex:2},
//						{header : 'Level',dataIndex: 'level',flex:1},
//						{header : 'Namespace',dataIndex: 'namespace',flex:2},
//						{header : 'Propagated genes',dataIndex: 'propagatedNumberOfGenes',flex:2.5}
//		             ];
//		this.goGrid = this.doGrid(columns,fields,modelName,groupField);
//		
//    }
//    return this.goGrid;
//};


GeneInfoWidget.prototype.getTfbsGrid = function(data){
    if(data.length<=0){
		return this.notFoundPanel;
	}
    var groupField = '';
    //check data are transcripts or tfbss

    if(data[0].id != null){
        var data2 = [];
        groupField = 'transcriptId';
        for(var i = 0; i<data.length; i++){
            transcript = data[i];
            if(transcript.tfbs != null){
                for(var j = 0; j<transcript.tfbs.length; j++){
                    transcript.tfbs[j].transcriptId = transcript.id;
                }
                data2 = data2.concat(transcript.tfbs);
            }
        }
        data = data2;
    }

    if(this.tfbsGrid==null){
    	var groupField = groupField;
    	var modelName = "TFBS";
	    var fields = ["chromosome","start","end","strand","tfName","relativeStart","relativeEnd","targetGeneName","score","sequence","transcriptId"];
		var columns = [
		                {header : 'Name',dataIndex: 'tfName',flex:1},
		            	{header : 'Location: chr:start-end (strand)', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end} ({strand})',flex:2.5},
		            	{header : 'Relative (start-end)',xtype:'templatecolumn',tpl:'{relativeStart}-{relativeEnd}',flex:1.5},
						{header : 'Target gene',dataIndex: 'targetGeneName',flex:1},
						{header : 'Score',dataIndex: 'score',flex:1},
						{header : 'Sequence',dataIndex: 'sequence',flex:1}
		             ];
		this.tfbsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.tfbsGrid.store.loadData(data);
    }
    return this.tfbsGrid;
};

GeneInfoWidget.prototype.getMirnaTargetGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.mirnaTargetGrid==null){
    	var groupField = "";
    	var modelName = "miRNA targets";
	    var fields = ["chromosome","start","end","strand","mirbaseId","score","experimentalMethod","source"];
		var columns = [
		                {header : 'Id',dataIndex: 'mirbaseId',flex:1},
		            	{header : 'Location: chr:start-end (strand)', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end} ({strand})',flex:2},
						{header : 'Score',dataIndex: 'score',flex:1},
						{header : 'Exp. Method',dataIndex: 'experimentalMethod',flex:1},
						{header : 'source',dataIndex: 'source',flex:1}
		             ];
		this.mirnaTargetGrid = this.doGrid(columns,fields,modelName,groupField);
		this.mirnaTargetGrid.store.loadData(data);
    }
    return this.mirnaTargetGrid;
};

GeneInfoWidget.prototype.getProteinFeaturesGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.proteinFeaturesGrid==null){
    	var groupField = '';
    	var modelName = "Protein features";
	    var fields = ["identifier","start","end","original","type","description"];
		var columns = [
		                {header : 'Identifier',dataIndex: 'identifier',flex:1},
		               	{header : 'Location: (start-end)', xtype:'templatecolumn', tpl:'{start}-{end}',flex:1.2},
		               	{header : 'Original',dataIndex: 'original',flex:1},
						{header : 'Type',dataIndex: 'type',flex:1},
						{header : 'Description',dataIndex: 'description',flex:1.5}
		             ];
		this.proteinFeaturesGrid = this.doGrid(columns,fields,modelName,groupField);
		this.proteinFeaturesGrid.store.loadData(data);
    }
    return this.proteinFeaturesGrid;
};


GeneInfoWidget.prototype.getProteinFeaturesGrid = function(data){
    debugger
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.proteinFeaturesGrid==null){
    	var groupField = '';
    	var modelName = 'Protein features';
	    var fields = ["identifier","start","end","original","type","description"];
		var columns = [
		                {header : 'Identifier',dataIndex: 'identifier',flex:1},
		               	{header : 'Location: (start-end)', xtype:'templatecolumn', tpl:'{start}-{end}',flex:1.2},
		               	{header : 'Original',dataIndex: 'original',flex:1},
						{header : 'Type',dataIndex: 'type',flex:1},
						{header : 'Description',dataIndex: 'description',flex:1.5}
		             ];
		this.proteinFeaturesGrid = this.doGrid(columns,fields,modelName,groupField);
		this.proteinFeaturesGrid.store.loadData(data);
    }
    return this.proteinFeaturesGrid;
};

GeneInfoWidget.prototype.get3Dprotein = function(data){
	var _this=this;
    if(this.p3dProtein==null){
    	//ws
//    	
      	this.p3dProtein = Ext.create('Ext.tab.Panel',{
      		title:"3D Protein Viewer",
      		border:false,
      		cls:'panel-border-left',
      		flex:3,
//    		bodyPadding:5,
      		autoScroll:true
//      		items:items
      	});
    	
    	var pdbs = [];

    	$.ajax({
//    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb',
    		  url:new CellBaseManager().host+'/v3/'+_this.species+'/feature/id/'+this.query+'/xref?dbname=pdb&of=json',
//    		  data: data,
//    		  dataType: dataType,
    		  async:false,
    		  success: function(data){
    			if(data!=""){
//      	    		console.log(data.trim());
      	    		pdbs = data[0];
//      	    		console.log(pdbs);
      	    		
      	    		for ( var i = 0; i < pdbs.length; i++) {
      	    			var pdb_name=pdbs[i].id;
      	    			var pan = Ext.create('Ext.panel.Panel',{
      	    				title:pdb_name,
      	    				bodyCls:'background-black',
      	    				html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_'+pdb_name+'" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
      	    				listeners:{
      	    					afterrender:function(este){
      	    						// JavaScript Document
      	    						var pdb_name=este.title;
      	    						
      	    				    	ChemDoodle.default_backgroundColor = '#000000';
      	    				    	
      	    				    	var pdb = new ChemDoodle.TransformCanvas3D('pdb_canvas_'+pdb_name, 300, 300);
      	    				    	if(!pdb.gl){
      	    				    	  pdb.emptyMessage = 'Your browser does not support WebGL';
      	    				    	  pdb.displayMessage();
      	    				    	}else{
      	    					    	pdb.specs.set3DRepresentation('Ball and Stick');
      	    					    	pdb.specs.proteins_ribbonCartoonize = true;
      	    					    	pdb.handle = null;
      	    					    	pdb.timeout = 15;
      	    					    	pdb.startAnimation = ChemDoodle._AnimatorCanvas.prototype.startAnimation;
      	    					    	pdb.stopAnimation = ChemDoodle._AnimatorCanvas.prototype.stopAnimation;
      	    					    	pdb.isRunning = ChemDoodle._AnimatorCanvas.prototype.isRunning;
      	    					    	pdb.dblclick = ChemDoodle.RotatorCanvas.prototype.dblclick;
      	    					    	pdb.nextFrame = function(delta){
      	    					    		var matrix = [];
      	    					    		mat4.identity(matrix);
      	    					    		var change = delta/1000;
      	    					    	        var increment = Math.PI/15;
      	    					    		mat4.rotate(matrix, increment*change, [ 1, 0, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 1, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 0, 1 ]);
      	    					    		mat4.multiply(this.rotationMatrix, matrix);
      	    					    	};
      	    					    	
//      	    					    	http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb
//      	    				    	var mol = ChemDoodle.readPDB('HEADER    PLANT SEED PROTEIN                      30-APR-81   1CRN                                                                       \nDBREF  1CRN A    1    46  UNP    P01542   CRAM_CRAAB       1     46             \nSEQRES   1 A   46  THR THR CYS CYS PRO SER ILE VAL ALA ARG SER ASN PHE          \nSEQRES   2 A   46  ASN VAL CYS ARG LEU PRO GLY THR PRO GLU ALA ILE CYS          \nSEQRES   3 A   46  ALA THR TYR THR GLY CYS ILE ILE ILE PRO GLY ALA THR          \nSEQRES   4 A   46  CYS PRO GLY ASP TYR ALA ASN                                  \nHELIX    1  H1 ILE A    7  PRO A   19  13/10 CONFORMATION RES 17,19       13    \nHELIX    2  H2 GLU A   23  THR A   30  1DISTORTED 3/10 AT RES 30           8    \nSHEET    1  S1 2 THR A   1  CYS A   4  0                                        \nSHEET    2  S1 2 CYS A  32  ILE A  35 -1                                        \nSSBOND   1 CYS A    3    CYS A   40                          1555   1555  2.00  \nSSBOND   2 CYS A    4    CYS A   32                          1555   1555  2.04  \nSSBOND   3 CYS A   16    CYS A   26                          1555   1555  2.05  \nCRYST1   40.960   18.650   22.520  90.00  90.77  90.00 P 1 21 1      2          \nORIGX1      1.000000  0.000000  0.000000        0.00000                         \nORIGX2      0.000000  1.000000  0.000000        0.00000                         \nORIGX3      0.000000  0.000000  1.000000        0.00000                         \nSCALE1      0.024414  0.000000 -0.000328        0.00000                         \nSCALE2      0.000000  0.053619  0.000000        0.00000                         \nSCALE3      0.000000  0.000000  0.044409        0.00000                         \nATOM      1  N   THR A   1      17.047  14.099   3.625  1.00 13.79           N  \nATOM      2  CA  THR A   1      16.967  12.784   4.338  1.00 10.80           C  \nATOM      3  C   THR A   1      15.685  12.755   5.133  1.00  9.19           C  \nATOM      4  O   THR A   1      15.268  13.825   5.594  1.00  9.85           O  \nATOM      5  CB  THR A   1      18.170  12.703   5.337  1.00 13.02           C  \nATOM      6  OG1 THR A   1      19.334  12.829   4.463  1.00 15.06           O  \nATOM      7  CG2 THR A   1      18.150  11.546   6.304  1.00 14.23           C  \nATOM      8  N   THR A   2      15.115  11.555   5.265  1.00  7.81           N  \nATOM      9  CA  THR A   2      13.856  11.469   6.066  1.00  8.31           C  \nATOM     10  C   THR A   2      14.164  10.785   7.379  1.00  5.80           C  \nATOM     11  O   THR A   2      14.993   9.862   7.443  1.00  6.94           O  \nATOM     12  CB  THR A   2      12.732  10.711   5.261  1.00 10.32           C  \nATOM     13  OG1 THR A   2      13.308   9.439   4.926  1.00 12.81           O  \nATOM     14  CG2 THR A   2      12.484  11.442   3.895  1.00 11.90           C  \nATOM     15  N   CYS A   3      13.488  11.241   8.417  1.00  5.24           N  \nATOM     16  CA  CYS A   3      13.660  10.707   9.787  1.00  5.39           C  \nATOM     17  C   CYS A   3      12.269  10.431  10.323  1.00  4.45           C  \nATOM     18  O   CYS A   3      11.393  11.308  10.185  1.00  6.54           O  \nATOM     19  CB  CYS A   3      14.368  11.748  10.691  1.00  5.99           C  \nATOM     20  SG  CYS A   3      15.885  12.426  10.016  1.00  7.01           S  \nATOM     21  N   CYS A   4      12.019   9.272  10.928  1.00  3.90           N  \nATOM     22  CA  CYS A   4      10.646   8.991  11.408  1.00  4.24           C  \nATOM     23  C   CYS A   4      10.654   8.793  12.919  1.00  3.72           C  \nATOM     24  O   CYS A   4      11.659   8.296  13.491  1.00  5.30           O  \nATOM     25  CB  CYS A   4      10.057   7.752  10.682  1.00  4.41           C  \nATOM     26  SG  CYS A   4       9.837   8.018   8.904  1.00  4.72           S  \nATOM     27  N   PRO A   5       9.561   9.108  13.563  1.00  3.96           N  \nATOM     28  CA  PRO A   5       9.448   9.034  15.012  1.00  4.25           C  \nATOM     29  C   PRO A   5       9.288   7.670  15.606  1.00  4.96           C  \nATOM     30  O   PRO A   5       9.490   7.519  16.819  1.00  7.44           O  \nATOM     31  CB  PRO A   5       8.230   9.957  15.345  1.00  5.11           C  \nATOM     32  CG  PRO A   5       7.338   9.786  14.114  1.00  5.24           C  \nATOM     33  CD  PRO A   5       8.366   9.804  12.958  1.00  5.20           C  \nATOM     34  N   SER A   6       8.875   6.686  14.796  1.00  4.83           N  \nATOM     35  CA  SER A   6       8.673   5.314  15.279  1.00  4.45           C  \nATOM     36  C   SER A   6       8.753   4.376  14.083  1.00  4.99           C  \nATOM     37  O   SER A   6       8.726   4.858  12.923  1.00  4.61           O  \nATOM     38  CB  SER A   6       7.340   5.121  15.996  1.00  5.05           C  \nATOM     39  OG  SER A   6       6.274   5.220  15.031  1.00  6.39           O  \nATOM     40  N   ILE A   7       8.881   3.075  14.358  1.00  4.94           N  \nATOM     41  CA  ILE A   7       8.912   2.083  13.258  1.00  6.33           C  \nATOM     42  C   ILE A   7       7.581   2.090  12.506  1.00  5.32           C  \nATOM     43  O   ILE A   7       7.670   2.031  11.245  1.00  6.85           O  \nATOM     44  CB  ILE A   7       9.207   0.677  13.924  1.00  8.43           C  \nATOM     45  CG1 ILE A   7      10.714   0.702  14.312  1.00  9.78           C  \nATOM     46  CG2 ILE A   7       8.811  -0.477  12.969  1.00 11.70           C  \nATOM     47  CD1 ILE A   7      11.185  -0.516  15.142  1.00  9.92           C  \nATOM     48  N   VAL A   8       6.458   2.162  13.159  1.00  5.02           N  \nATOM     49  CA  VAL A   8       5.145   2.209  12.453  1.00  6.93           C  \nATOM     50  C   VAL A   8       5.115   3.379  11.461  1.00  5.39           C  \nATOM     51  O   VAL A   8       4.664   3.268  10.343  1.00  6.30           O  \nATOM     52  CB  VAL A   8       3.995   2.354  13.478  1.00  9.64           C  \nATOM     53  CG1 VAL A   8       2.716   2.891  12.869  1.00 13.85           C  \nATOM     54  CG2 VAL A   8       3.758   1.032  14.208  1.00 11.97           C  \nATOM     55  N   ALA A   9       5.606   4.546  11.941  1.00  3.73           N  \nATOM     56  CA  ALA A   9       5.598   5.767  11.082  1.00  3.56           C  \nATOM     57  C   ALA A   9       6.441   5.527   9.850  1.00  4.13           C  \nATOM     58  O   ALA A   9       6.052   5.933   8.744  1.00  4.36           O  \nATOM     59  CB  ALA A   9       6.022   6.977  11.891  1.00  4.80           C  \nATOM     60  N   ARG A  10       7.647   4.909  10.005  1.00  3.73           N  \nATOM     61  CA  ARG A  10       8.496   4.609   8.837  1.00  3.38           C  \nATOM     62  C   ARG A  10       7.798   3.609   7.876  1.00  3.47           C  \nATOM     63  O   ARG A  10       7.878   3.778   6.651  1.00  4.67           O  \nATOM     64  CB  ARG A  10       9.847   4.020   9.305  1.00  3.95           C  \nATOM     65  CG  ARG A  10      10.752   3.607   8.149  1.00  4.55           C  \nATOM     66  CD  ARG A  10      11.226   4.699   7.244  1.00  5.89           C  \nATOM     67  NE  ARG A  10      12.143   5.571   8.035  1.00  6.20           N  \nATOM     68  CZ  ARG A  10      12.758   6.609   7.443  1.00  7.52           C  \nATOM     69  NH1 ARG A  10      12.539   6.932   6.158  1.00 10.68           N  \nATOM     70  NH2 ARG A  10      13.601   7.322   8.202  1.00  9.48           N  \nATOM     71  N   SER A  11       7.186   2.582   8.445  1.00  5.19           N  \nATOM     72  CA  SER A  11       6.500   1.584   7.565  1.00  4.60           C  \nATOM     73  C   SER A  11       5.382   2.313   6.773  1.00  4.84           C  \nATOM     74  O   SER A  11       5.213   2.016   5.557  1.00  5.84           O  \nATOM     75  CB  SER A  11       5.908   0.462   8.400  1.00  5.91           C  \nATOM     76  OG  SER A  11       6.990  -0.272   9.012  1.00  8.38           O  \nATOM     77  N   ASN A  12       4.648   3.182   7.446  1.00  3.54           N  \nATOM     78  CA  ASN A  12       3.545   3.935   6.751  1.00  4.57           C  \nATOM     79  C   ASN A  12       4.107   4.851   5.691  1.00  4.14           C  \nATOM     80  O   ASN A  12       3.536   5.001   4.617  1.00  5.52           O  \nATOM     81  CB  ASN A  12       2.663   4.677   7.748  1.00  6.42           C  \nATOM     82  CG  ASN A  12       1.802   3.735   8.610  1.00  8.25           C  \nATOM     83  OD1 ASN A  12       1.567   2.613   8.165  1.00 12.72           O  \nATOM     84  ND2 ASN A  12       1.394   4.252   9.767  1.00  9.92           N  \nATOM     85  N   PHE A  13       5.259   5.498   6.005  1.00  3.43           N  \nATOM     86  CA  PHE A  13       5.929   6.358   5.055  1.00  3.49           C  \nATOM     87  C   PHE A  13       6.304   5.578   3.799  1.00  3.40           C  \nATOM     88  O   PHE A  13       6.136   6.072   2.653  1.00  4.07           O  \nATOM     89  CB  PHE A  13       7.183   6.994   5.754  1.00  5.48           C  \nATOM     90  CG  PHE A  13       7.884   8.006   4.883  1.00  5.57           C  \nATOM     91  CD1 PHE A  13       8.906   7.586   4.027  1.00  6.99           C  \nATOM     92  CD2 PHE A  13       7.532   9.373   4.983  1.00  6.52           C  \nATOM     93  CE1 PHE A  13       9.560   8.539   3.194  1.00  8.20           C  \nATOM     94  CE2 PHE A  13       8.176  10.281   4.145  1.00  6.34           C  \nATOM     95  CZ  PHE A  13       9.141   9.845   3.292  1.00  6.84           C  \nATOM     96  N   ASN A  14       6.900   4.390   3.989  1.00  3.64           N  \nATOM     97  CA  ASN A  14       7.331   3.607   2.791  1.00  4.31           C  \nATOM     98  C   ASN A  14       6.116   3.210   1.915  1.00  3.98           C  \nATOM     99  O   ASN A  14       6.240   3.144   0.684  1.00  6.22           O  \nATOM    100  CB  ASN A  14       8.145   2.404   3.240  1.00  5.81           C  \nATOM    101  CG  ASN A  14       9.555   2.856   3.730  1.00  6.82           C  \nATOM    102  OD1 ASN A  14      10.013   3.895   3.323  1.00  9.43           O  \nATOM    103  ND2 ASN A  14      10.120   1.956   4.539  1.00  8.21           N  \nATOM    104  N   VAL A  15       4.993   2.927   2.571  1.00  3.76           N  \nATOM    105  CA  VAL A  15       3.782   2.599   1.742  1.00  3.98           C  \nATOM    106  C   VAL A  15       3.296   3.871   1.004  1.00  3.80           C  \nATOM    107  O   VAL A  15       2.947   3.817  -0.189  1.00  4.85           O  \nATOM    108  CB  VAL A  15       2.698   1.953   2.608  1.00  4.71           C  \nATOM    109  CG1 VAL A  15       1.384   1.826   1.806  1.00  6.67           C  \nATOM    110  CG2 VAL A  15       3.174   0.533   3.005  1.00  6.26           C  \nATOM    111  N   CYS A  16       3.321   4.987   1.720  1.00  3.79           N  \nATOM    112  CA  CYS A  16       2.890   6.285   1.126  1.00  3.54           C  \nATOM    113  C   CYS A  16       3.687   6.597  -0.111  1.00  3.48           C  \nATOM    114  O   CYS A  16       3.200   7.147  -1.103  1.00  4.63           O  \nATOM    115  CB  CYS A  16       3.039   7.369   2.240  1.00  4.58           C  \nATOM    116  SG  CYS A  16       2.559   9.014   1.649  1.00  5.66           S  \nATOM    117  N   ARG A  17       4.997   6.227  -0.100  1.00  3.99           N  \nATOM    118  CA  ARG A  17       5.895   6.489  -1.213  1.00  3.83           C  \nATOM    119  C   ARG A  17       5.738   5.560  -2.409  1.00  3.79           C  \nATOM    120  O   ARG A  17       6.228   5.901  -3.507  1.00  5.39           O  \nATOM    121  CB  ARG A  17       7.370   6.507  -0.731  1.00  4.11           C  \nATOM    122  CG  ARG A  17       7.717   7.687   0.206  1.00  4.69           C  \nATOM    123  CD  ARG A  17       7.949   8.947  -0.615  1.00  5.10           C  \nATOM    124  NE  ARG A  17       9.212   8.856  -1.337  1.00  4.71           N  \nATOM    125  CZ  ARG A  17       9.537   9.533  -2.431  1.00  5.28           C  \nATOM    126  NH1 ARG A  17       8.659  10.350  -3.032  1.00  6.67           N  \nATOM    127  NH2 ARG A  17      10.793   9.491  -2.899  1.00  6.41           N  \nATOM    128  N   LEU A  18       5.051   4.411  -2.204  1.00  4.70           N  \nATOM    129  CA  LEU A  18       4.933   3.431  -3.326  1.00  5.46           C  \nATOM    130  C   LEU A  18       4.397   4.014  -4.620  1.00  5.13           C  \nATOM    131  O   LEU A  18       4.988   3.755  -5.687  1.00  5.55           O  \nATOM    132  CB  LEU A  18       4.196   2.184  -2.863  1.00  6.47           C  \nATOM    133  CG  LEU A  18       4.960   1.178  -1.991  1.00  7.43           C  \nATOM    134  CD1 LEU A  18       3.907   0.097  -1.634  1.00  8.70           C  \nATOM    135  CD2 LEU A  18       6.129   0.606  -2.768  1.00  9.39           C  \nATOM    136  N   PRO A  19       3.329   4.795  -4.543  1.00  4.28           N  \nATOM    137  CA  PRO A  19       2.792   5.376  -5.797  1.00  5.38           C  \nATOM    138  C   PRO A  19       3.573   6.540  -6.322  1.00  6.30           C  \nATOM    139  O   PRO A  19       3.260   7.045  -7.422  1.00  9.62           O  \nATOM    140  CB  PRO A  19       1.358   5.766  -5.472  1.00  5.87           C  \nATOM    141  CG  PRO A  19       1.223   5.694  -3.993  1.00  6.47           C  \nATOM    142  CD  PRO A  19       2.421   4.941  -3.408  1.00  6.45           C  \nATOM    143  N   GLY A  20       4.565   7.047  -5.559  1.00  4.94           N  \nATOM    144  CA  GLY A  20       5.366   8.191  -6.018  1.00  5.39           C  \nATOM    145  C   GLY A  20       5.007   9.481  -5.280  1.00  5.03           C  \nATOM    146  O   GLY A  20       5.535  10.510  -5.730  1.00  7.34           O  \nATOM    147  N   THR A  21       4.181   9.438  -4.262  1.00  4.10           N  \nATOM    148  CA  THR A  21       3.767  10.609  -3.513  1.00  3.94           C  \nATOM    149  C   THR A  21       5.017  11.397  -3.042  1.00  3.96           C  \nATOM    150  O   THR A  21       5.947  10.757  -2.523  1.00  5.82           O  \nATOM    151  CB  THR A  21       2.992  10.188  -2.225  1.00  4.13           C  \nATOM    152  OG1 THR A  21       2.051   9.144  -2.623  1.00  5.45           O  \nATOM    153  CG2 THR A  21       2.260  11.349  -1.551  1.00  5.41           C  \nATOM    154  N   PRO A  22       4.971  12.703  -3.176  1.00  5.04           N  \nATOM    155  CA  PRO A  22       6.143  13.513  -2.696  1.00  4.69           C  \nATOM    156  C   PRO A  22       6.400  13.233  -1.225  1.00  4.19           C  \nATOM    157  O   PRO A  22       5.485  13.061  -0.382  1.00  4.47           O  \nATOM    158  CB  PRO A  22       5.703  14.969  -2.920  1.00  7.12           C  \nATOM    159  CG  PRO A  22       4.676  14.893  -3.996  1.00  7.03           C  \nATOM    160  CD  PRO A  22       3.964  13.567  -3.811  1.00  4.90           C  \nATOM    161  N   GLU A  23       7.728  13.297  -0.921  1.00  5.16           N  \nATOM    162  CA  GLU A  23       8.114  13.103   0.500  1.00  5.31           C  \nATOM    163  C   GLU A  23       7.427  14.073   1.410  1.00  4.11           C  \nATOM    164  O   GLU A  23       7.036  13.682   2.540  1.00  5.11           O  \nATOM    165  CB  GLU A  23       9.648  13.285   0.660  1.00  6.16           C  \nATOM    166  CG  GLU A  23      10.440  12.093   0.063  1.00  7.48           C  \nATOM    167  CD  GLU A  23      11.941  12.170   0.391  1.00  9.40           C  \nATOM    168  OE1 GLU A  23      12.416  13.225   0.681  1.00 10.40           O  \nATOM    169  OE2 GLU A  23      12.539  11.070   0.292  1.00 13.32           O  \nATOM    170  N   ALA A  24       7.212  15.334   0.966  1.00  4.56           N  \nATOM    171  CA  ALA A  24       6.614  16.317   1.913  1.00  4.49           C  \nATOM    172  C   ALA A  24       5.212  15.936   2.350  1.00  4.10           C  \nATOM    173  O   ALA A  24       4.782  16.166   3.495  1.00  5.64           O  \nATOM    174  CB  ALA A  24       6.605  17.695   1.246  1.00  5.80           C  \nATOM    175  N   ILE A  25       4.445  15.318   1.405  1.00  4.37           N  \nATOM    176  CA  ILE A  25       3.074  14.894   1.756  1.00  5.44           C  \nATOM    177  C   ILE A  25       3.085  13.643   2.645  1.00  4.32           C  \nATOM    178  O   ILE A  25       2.315  13.523   3.578  1.00  4.72           O  \nATOM    179  CB  ILE A  25       2.204  14.637   0.462  1.00  6.42           C  \nATOM    180  CG1 ILE A  25       1.815  16.048  -0.129  1.00  7.50           C  \nATOM    181  CG2 ILE A  25       0.903  13.864   0.811  1.00  7.65           C  \nATOM    182  CD1 ILE A  25       0.756  16.761   0.757  1.00  7.80           C  \nATOM    183  N   CYS A  26       4.032  12.764   2.313  1.00  3.92           N  \nATOM    184  CA  CYS A  26       4.180  11.549   3.187  1.00  4.37           C  \nATOM    185  C   CYS A  26       4.632  11.944   4.596  1.00  3.95           C  \nATOM    186  O   CYS A  26       4.227  11.252   5.547  1.00  4.74           O  \nATOM    187  CB  CYS A  26       5.038  10.518   2.539  1.00  4.63           C  \nATOM    188  SG  CYS A  26       4.349   9.794   1.022  1.00  5.61           S  \nATOM    189  N   ALA A  27       5.408  13.012   4.694  1.00  3.89           N  \nATOM    190  CA  ALA A  27       5.879  13.502   6.026  1.00  4.43           C  \nATOM    191  C   ALA A  27       4.696  13.908   6.882  1.00  4.26           C  \nATOM    192  O   ALA A  27       4.528  13.422   8.025  1.00  5.44           O  \nATOM    193  CB  ALA A  27       6.880  14.615   5.830  1.00  5.36           C  \nATOM    194  N   THR A  28       3.827  14.802   6.358  1.00  4.53           N  \nATOM    195  CA  THR A  28       2.691  15.221   7.194  1.00  5.08           C  \nATOM    196  C   THR A  28       1.672  14.132   7.434  1.00  4.62           C  \nATOM    197  O   THR A  28       0.947  14.112   8.468  1.00  7.80           O  \nATOM    198  CB  THR A  28       1.986  16.520   6.614  1.00  6.03           C  \nATOM    199  OG1 THR A  28       1.664  16.221   5.230  1.00  7.19           O  \nATOM    200  CG2 THR A  28       2.914  17.739   6.700  1.00  7.34           C  \nATOM    201  N   TYR A  29       1.621  13.190   6.511  1.00  5.01           N  \nATOM    202  CA  TYR A  29       0.715  12.045   6.657  1.00  6.60           C  \nATOM    203  C   TYR A  29       1.125  11.125   7.815  1.00  4.92           C  \nATOM    204  O   TYR A  29       0.286  10.632   8.545  1.00  7.13           O  \nATOM    205  CB  TYR A  29       0.755  11.229   5.322  1.00  9.66           C  \nATOM    206  CG  TYR A  29      -0.203  10.044   5.354  1.00 11.56           C  \nATOM    207  CD1 TYR A  29      -1.547  10.337   5.645  1.00 12.85           C  \nATOM    208  CD2 TYR A  29       0.193   8.750   5.100  1.00 14.44           C  \nATOM    209  CE1 TYR A  29      -2.496   9.329   5.673  1.00 16.61           C  \nATOM    210  CE2 TYR A  29      -0.801   7.705   5.156  1.00 17.11           C  \nATOM    211  CZ  TYR A  29      -2.079   8.031   5.430  1.00 19.99           C  \nATOM    212  OH  TYR A  29      -3.097   7.057   5.458  1.00 28.98           O  \nATOM    213  N   THR A  30       2.470  10.984   7.995  1.00  5.31           N  \nATOM    214  CA  THR A  30       2.986   9.994   8.950  1.00  5.70           C  \nATOM    215  C   THR A  30       3.609  10.505  10.230  1.00  6.28           C  \nATOM    216  O   THR A  30       3.766   9.715  11.186  1.00  8.77           O  \nATOM    217  CB  THR A  30       4.076   9.103   8.225  1.00  6.55           C  \nATOM    218  OG1 THR A  30       5.125  10.027   7.824  1.00  6.57           O  \nATOM    219  CG2 THR A  30       3.493   8.324   7.035  1.00  7.29           C  \nATOM    220  N   GLY A  31       3.984  11.764  10.241  1.00  4.99           N  \nATOM    221  CA  GLY A  31       4.769  12.336  11.360  1.00  5.50           C  \nATOM    222  C   GLY A  31       6.255  12.243  11.106  1.00  4.19           C  \nATOM    223  O   GLY A  31       7.037  12.750  11.954  1.00  6.12           O  \nATOM    224  N   CYS A  32       6.710  11.631   9.992  1.00  4.30           N  \nATOM    225  CA  CYS A  32       8.140  11.694   9.635  1.00  4.89           C  \nATOM    226  C   CYS A  32       8.500  13.141   9.206  1.00  5.50           C  \nATOM    227  O   CYS A  32       7.581  13.949   8.944  1.00  5.82           O  \nATOM    228  CB  CYS A  32       8.504  10.686   8.530  1.00  4.66           C  \nATOM    229  SG  CYS A  32       8.048   8.987   8.881  1.00  5.33           S  \nATOM    230  N   ILE A  33       9.793  13.410   9.173  1.00  6.02           N  \nATOM    231  CA  ILE A  33      10.280  14.760   8.823  1.00  5.24           C  \nATOM    232  C   ILE A  33      11.346  14.658   7.743  1.00  5.16           C  \nATOM    233  O   ILE A  33      11.971  13.583   7.552  1.00  7.19           O  \nATOM    234  CB  ILE A  33      10.790  15.535  10.085  1.00  5.49           C  \nATOM    235  CG1 ILE A  33      12.059  14.803  10.671  1.00  6.85           C  \nATOM    236  CG2 ILE A  33       9.684  15.686  11.138  1.00  6.45           C  \nATOM    237  CD1 ILE A  33      12.733  15.676  11.781  1.00  8.94           C  \nATOM    238  N   ILE A  34      11.490  15.773   7.038  1.00  5.52           N  \nATOM    239  CA  ILE A  34      12.552  15.877   6.036  1.00  6.82           C  \nATOM    240  C   ILE A  34      13.590  16.917   6.560  1.00  6.92           C  \nATOM    241  O   ILE A  34      13.168  18.006   6.945  1.00  9.22           O  \nATOM    242  CB  ILE A  34      11.987  16.360   4.681  1.00  8.11           C  \nATOM    243  CG1 ILE A  34      10.914  15.338   4.163  1.00  9.59           C  \nATOM    244  CG2 ILE A  34      13.131  16.517   3.629  1.00  9.73           C  \nATOM    245  CD1 ILE A  34      10.151  16.024   2.938  1.00 13.41           C  \nATOM    246  N   ILE A  35      14.856  16.493   6.536  1.00  7.06           N  \nATOM    247  CA  ILE A  35      15.930  17.454   6.941  1.00  7.52           C  \nATOM    248  C   ILE A  35      16.913  17.550   5.819  1.00  6.63           C  \nATOM    249  O   ILE A  35      17.097  16.660   4.970  1.00  7.90           O  \nATOM    250  CB  ILE A  35      16.622  16.995   8.285  1.00  8.07           C  \nATOM    251  CG1 ILE A  35      17.360  15.651   8.067  1.00  9.41           C  \nATOM    252  CG2 ILE A  35      15.592  16.974   9.434  1.00  9.46           C  \nATOM    253  CD1 ILE A  35      18.298  15.206   9.219  1.00  9.85           C  \nATOM    254  N   PRO A  36      17.664  18.669   5.806  1.00  8.07           N  \nATOM    255  CA  PRO A  36      18.635  18.861   4.738  1.00  8.78           C  \nATOM    256  C   PRO A  36      19.925  18.042   4.949  1.00  8.31           C  \nATOM    257  O   PRO A  36      20.593  17.742   3.945  1.00  9.09           O  \nATOM    258  CB  PRO A  36      18.945  20.364   4.783  1.00  9.67           C  \nATOM    259  CG  PRO A  36      18.238  20.937   5.908  1.00 10.15           C  \nATOM    260  CD  PRO A  36      17.371  19.900   6.596  1.00  9.53           C  \nATOM    261  N   GLY A  37      20.172  17.730   6.217  1.00  8.48           N  \nATOM    262  CA  GLY A  37      21.452  16.969   6.513  1.00  9.20           C  \nATOM    263  C   GLY A  37      21.143  15.478   6.427  1.00 10.41           C  \nATOM    264  O   GLY A  37      20.138  15.023   5.878  1.00 12.06           O  \nATOM    265  N   ALA A  38      22.055  14.701   7.032  1.00  9.24           N  \nATOM    266  CA  ALA A  38      22.019  13.242   7.020  1.00  9.24           C  \nATOM    267  C   ALA A  38      21.944  12.628   8.396  1.00  9.60           C  \nATOM    268  O   ALA A  38      21.869  11.387   8.435  1.00 13.65           O  \nATOM    269  CB  ALA A  38      23.246  12.697   6.275  1.00 10.43           C  \nATOM    270  N   THR A  39      21.894  13.435   9.436  1.00  8.70           N  \nATOM    271  CA  THR A  39      21.936  12.911  10.809  1.00  9.46           C  \nATOM    272  C   THR A  39      20.615  13.191  11.521  1.00  8.32           C  \nATOM    273  O   THR A  39      20.357  14.317  11.948  1.00  9.89           O  \nATOM    274  CB  THR A  39      23.131  13.601  11.593  1.00 10.72           C  \nATOM    275  OG1 THR A  39      24.284  13.401  10.709  1.00 11.66           O  \nATOM    276  CG2 THR A  39      23.340  12.935  12.962  1.00 11.81           C  \nATOM    277  N   CYS A  40      19.827  12.110  11.642  1.00  7.64           N  \nATOM    278  CA  CYS A  40      18.504  12.312  12.298  1.00  8.05           C  \nATOM    279  C   CYS A  40      18.684  12.451  13.784  1.00  7.63           C  \nATOM    280  O   CYS A  40      19.533  11.718  14.362  1.00  9.64           O  \nATOM    281  CB  CYS A  40      17.582  11.117  11.996  1.00  7.80           C  \nATOM    282  SG  CYS A  40      17.199  10.929  10.237  1.00  7.30           S  \nATOM    283  N   PRO A  41      17.880  13.266  14.426  1.00  8.00           N  \nATOM    284  CA  PRO A  41      17.924  13.421  15.877  1.00  8.96           C  \nATOM    285  C   PRO A  41      17.392  12.206  16.594  1.00  9.06           C  \nATOM    286  O   PRO A  41      16.652  11.368  16.033  1.00  8.82           O  \nATOM    287  CB  PRO A  41      17.076  14.658  16.145  1.00 10.39           C  \nATOM    288  CG  PRO A  41      16.098  14.689  14.997  1.00 10.99           C  \nATOM    289  CD  PRO A  41      16.859  14.150  13.779  1.00 10.49           C  \nATOM    290  N   GLY A  42      17.728  12.124  17.884  1.00  7.55           N  \nATOM    291  CA  GLY A  42      17.334  10.956  18.691  1.00  8.00           C  \nATOM    292  C   GLY A  42      15.875  10.688  18.871  1.00  7.22           C  \nATOM    293  O   GLY A  42      15.434   9.550  19.166  1.00  8.41           O  \nATOM    294  N   ASP A  43      15.036  11.747  18.715  1.00  5.54           N  \nATOM    295  CA  ASP A  43      13.564  11.573  18.836  1.00  5.85           C  \nATOM    296  C   ASP A  43      12.936  11.227  17.470  1.00  5.87           C  \nATOM    297  O   ASP A  43      11.720  11.040  17.428  1.00  7.29           O  \nATOM    298  CB  ASP A  43      12.933  12.737  19.580  1.00  6.72           C  \nATOM    299  CG  ASP A  43      13.140  14.094  18.958  1.00  8.59           C  \nATOM    300  OD1 ASP A  43      14.109  14.303  18.212  1.00  9.59           O  \nATOM    301  OD2 ASP A  43      12.267  14.963  19.265  1.00 11.45           O  \nATOM    302  N   TYR A  44      13.725  11.174  16.425  1.00  5.22           N  \nATOM    303  CA  TYR A  44      13.257  10.745  15.081  1.00  5.56           C  \nATOM    304  C   TYR A  44      14.275   9.687  14.612  1.00  4.61           C  \nATOM    305  O   TYR A  44      14.930   9.862  13.568  1.00  6.04           O  \nATOM    306  CB  TYR A  44      13.200  11.914  14.071  1.00  5.41           C  \nATOM    307  CG  TYR A  44      12.000  12.819  14.399  1.00  5.34           C  \nATOM    308  CD1 TYR A  44      12.119  13.853  15.332  1.00  6.59           C  \nATOM    309  CD2 TYR A  44      10.775  12.617  13.762  1.00  5.94           C  \nATOM    310  CE1 TYR A  44      11.045  14.675  15.610  1.00  5.97           C  \nATOM    311  CE2 TYR A  44       9.676  13.433  14.048  1.00  5.17           C  \nATOM    312  CZ  TYR A  44       9.802  14.456  14.996  1.00  5.96           C  \nATOM    313  OH  TYR A  44       8.740  15.265  15.269  1.00  8.60           O  \nATOM    314  N   ALA A  45      14.342   8.640  15.422  1.00  4.76           N  \nATOM    315  CA  ALA A  45      15.445   7.667  15.246  1.00  5.89           C  \nATOM    316  C   ALA A  45      15.171   6.533  14.280  1.00  6.67           C  \nATOM    317  O   ALA A  45      16.093   5.705  14.039  1.00  7.56           O  \nATOM    318  CB  ALA A  45      15.680   7.099  16.682  1.00  6.82           C  \nATOM    319  N   ASN A  46      13.966   6.502  13.739  1.00  5.80           N  \nATOM    320  CA  ASN A  46      13.512   5.395  12.878  1.00  6.15           C  \nATOM    321  C   ASN A  46      13.311   5.853  11.455  1.00  6.61           C  \nATOM    322  O   ASN A  46      13.733   6.929  11.026  1.00  7.18           O  \nATOM    323  CB  ASN A  46      12.266   4.769  13.501  1.00  7.27           C  \nATOM    324  CG  ASN A  46      12.538   4.304  14.922  1.00  7.98           C  \nATOM    325  OD1 ASN A  46      11.982   4.849  15.886  1.00 11.00           O  \nATOM    326  ND2 ASN A  46      13.407   3.298  15.015  1.00 10.32           N  \nATOM    327  OXT ASN A  46      12.703   4.973  10.746  1.00  7.86           O  \nTER     328      ASN A  46                                                      \nCONECT   20  282                                                                \nCONECT   26  229                                                                \nCONECT  116  188                                                                \nCONECT  188  116                                                                \nCONECT  229   26                                                                \nCONECT  282   20                                                                \nMASTER      227    0    0    2    2    1    0    6  327    1    6    4          \nEND                                                                             \n', 1);
      						    		$.get('http://www.rcsb.org/pdb/files/'+pdb_name+'.pdb', function(data) {			
      						    			var mol = ChemDoodle.readPDB(data);
      						    			pdb.loadMolecule(mol);
      						    			pdb.startAnimation();
      						    		});
      	    				    	}
      	    					}
      	    				}
      	    			});
      	    			
      	    			_this.p3dProtein.add(pan);
      	    		}
    			}
    			else{
    				_this.p3dProtein.setTitle('No proteins found');
    			}


  	    	}
    	});
    	
//    	$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb', 
    	
    	
    	
    	
//    	http://www.rcsb.org/pdb/files/1A17.pdb
    	
//    	http://www.rcsb.org/pdb/files/AAAA.pdb
    	
//		var pan = Ext.create('Ext.panel.Panel',{
//			title:"3D Protein Viewer",
//	        border:false,
//	        cls:'panel-border-left',
//			flex:3,
//			bodyPadding:5,
//			autoScroll:true,
//			html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_prueba" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
//
//		});

    }
    return this.p3dProtein;

};




GeneInfoWidget.prototype.getEnsembleId = function (){

};


GeneInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		_this.dataReceived(data.result);//TODO
	});
	cellBaseManager.get("feature","gene", this.query, "fullinfo");
};
GeneInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0][0];
	console.log(this.data);
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};

GeneOrangeInfoWidget.prototype.draw = InfoWidget.prototype.draw;
GeneOrangeInfoWidget.prototype.render = InfoWidget.prototype.render;
GeneOrangeInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
GeneOrangeInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
GeneOrangeInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
GeneOrangeInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
GeneOrangeInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;

function GeneOrangeInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Gene Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

GeneOrangeInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Transcripts"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "KEGG"},
	                { text: "Interpro"}
	            ] }
	        ];
};

GeneOrangeInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getGenePanel(this.data).show()); break;
			case "Transcripts": this.panel.add(this.getTranscriptPanel(this.data.transcripts).show());  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.go, "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.interpro, "Interpro").show());  break;
			case "KEGG": this.panel.add(this.getXrefGrid(this.data.kegg, "KEGG").show());  break;
		}
	}
};

GeneOrangeInfoWidget.prototype.getGenePanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.genePanel==null){
    	var tpl = this.getGeneTemplate();
    	
		this.genePanel = Ext.create('Ext.panel.Panel',{
			title:"Gene information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});
    }
    return this.genePanel;
};


GeneOrangeInfoWidget.prototype.getTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(transcriptPanel);
    	}
		this.transcriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.transcriptGrid;
};


GeneOrangeInfoWidget.prototype.getXrefGrid = function(data, dbname){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this[dbname+"Grid"]==null){
    	var groupField = '';
    	var modelName = dbname;
    	var fields = ['description','displayId'];
    	var columns = [
    	               {header : 'Display Id',dataIndex: 'displayId',flex:1},
    	               {header : 'Description',dataIndex: 'description',flex:3}
    	               ];
    	this[dbname+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
    	this[dbname+"Grid"].store.loadData(data);
    }
    return this[dbname+"Grid"];
};

//GeneOrangeInfoWidget.prototype.getGoGrid = function(){
//    var _this = this;
//    if(this.goGrid==null){
//    	var groupField = 'namespace';
//    	var modelName = 'GO';
//	    var fields = ['id','name','description','level','directNumberOfGenes','namespace','parents','propagatedNumberOfGenes','score'];
//		var columns = [ {header : 'Database id',dataIndex: 'id',flex:2},
//						{header : 'Name',dataIndex: 'name',flex:1},
//						{header : 'Description',dataIndex: 'description',flex:2},
//		                {
//		                	xtype: 'actioncolumn',
//		                	header : '+info',
//		                    flex:1,
//		                    items: [{
//		                        iconCls: 'icon-blue-box',  // Use a URL in the icon config
//		                        tooltip: '+info',    
//		                        handler: function(grid, rowIndex, colIndex) {
//		                            var rec = _this.goStore.getAt(rowIndex);
//		                            Ext.Msg.alert(rec.get('name'), rec.get('description'));
//		                        }
//		                    }]
//		                 },
//		                {header : 'Direct genes',dataIndex: 'directNumberOfGenes',flex:2},
//						{header : 'Level',dataIndex: 'level',flex:1},
//						{header : 'Namespace',dataIndex: 'namespace',flex:2},
//						{header : 'Propagated genes',dataIndex: 'propagatedNumberOfGenes',flex:2.5}
//		             ];
//		this.goGrid = this.doGrid(columns,fields,modelName,groupField);
//		
//    }
//    return this.goGrid;
//};


GeneOrangeInfoWidget.prototype.getTfbsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.tfbsGrid==null){
    	var groupField = "";
    	var modelName = "TFBS";
	    var fields = ["chromosome","start","end","strand","tfName","relativeStart","relativeEnd","targetGeneName","score","sequence"];
		var columns = [
		                {header : 'Name',dataIndex: 'tfName',flex:1},
		            	{header : 'Location: chr:start-end (strand)', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end} ({strand})',flex:2.5},
		            	{header : 'Relative (start-end)',xtype:'templatecolumn',tpl:'{relativeStart}-{relativeEnd}',flex:1.5},
						{header : 'Target gene',dataIndex: 'targetGeneName',flex:1},
						{header : 'Score',dataIndex: 'score',flex:1},
						{header : 'Sequence',dataIndex: 'sequence',flex:1}
		             ];
		this.tfbsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.tfbsGrid.store.loadData(data);
    }
    return this.tfbsGrid;
};

GeneOrangeInfoWidget.prototype.getMirnaTargetGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.mirnaTargetGrid==null){
    	var groupField = "";
    	var modelName = "miRNA targets";
	    var fields = ["chromosome","start","end","strand","mirbaseId","score","experimentalMethod","source"];
		var columns = [
		                {header : 'Id',dataIndex: 'mirbaseId',flex:1},
		            	{header : 'Location: chr:start-end (strand)', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end} ({strand})',flex:2},
						{header : 'Score',dataIndex: 'score',flex:1},
						{header : 'Exp. Method',dataIndex: 'experimentalMethod',flex:1},
						{header : 'source',dataIndex: 'source',flex:1}
		             ];
		this.mirnaTargetGrid = this.doGrid(columns,fields,modelName,groupField);
		this.mirnaTargetGrid.store.loadData(data);
    }
    return this.mirnaTargetGrid;
};

GeneOrangeInfoWidget.prototype.getProteinFeaturesGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.proteinFeaturesGrid==null){
    	var groupField = '';
    	var modelName = "Protein features";
	    var fields = ["identifier","start","end","original","type","description"];
		var columns = [
		                {header : 'Identifier',dataIndex: 'identifier',flex:1},
		               	{header : 'Location: (start-end)', xtype:'templatecolumn', tpl:'{start}-{end}',flex:1.2},
		               	{header : 'Original',dataIndex: 'original',flex:1},
						{header : 'Type',dataIndex: 'type',flex:1},
						{header : 'Description',dataIndex: 'description',flex:1.5}
		             ];
		this.proteinFeaturesGrid = this.doGrid(columns,fields,modelName,groupField);
		this.proteinFeaturesGrid.store.loadData(data);
    }
    return this.proteinFeaturesGrid;
};


GeneOrangeInfoWidget.prototype.getProteinFeaturesGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.proteinFeaturesGrid==null){
    	var groupField = '';
    	var modelName = 'Protein features';
	    var fields = ["identifier","start","end","original","type","description"];
		var columns = [
		                {header : 'Identifier',dataIndex: 'identifier',flex:1},
		               	{header : 'Location: (start-end)', xtype:'templatecolumn', tpl:'{start}-{end}',flex:1.2},
		               	{header : 'Original',dataIndex: 'original',flex:1},
						{header : 'Type',dataIndex: 'type',flex:1},
						{header : 'Description',dataIndex: 'description',flex:1.5}
		             ];
		this.proteinFeaturesGrid = this.doGrid(columns,fields,modelName,groupField);
		this.proteinFeaturesGrid.store.loadData(data);
    }
    return this.proteinFeaturesGrid;
};

GeneOrangeInfoWidget.prototype.get3Dprotein = function(data){
	var _this=this;
    if(this.p3dProtein==null){
    	//ws
//    	
      	this.p3dProtein = Ext.create('Ext.tab.Panel',{
      		title:"3D Protein Viewer",
      		border:false,
      		cls:'panel-border-left',
      		flex:3,
//    		bodyPadding:5,
      		autoScroll:true
//      		items:items
      	});
    	
//		$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+_this.feature.feature.stableId+'/xref?dbname=pdb', function(data){
    
    	var pdbs = [];
    	$.ajax({
//    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb',
    		  url: 'http://ws.bioinfo.cipf.es/cellbase/rest/v1/hsa/feature/id/'+this.query+'/xref?dbname=pdb',
//    		  data: data,
//    		  dataType: dataType,
    		  async:false,
    		  success: function(data){
    			if(data!=""){
//      	    		console.log(data.trim());
      	    		pdbs = data.trim().split("\n");
//      	    		console.log(pdbs);
      	    		
      	    		for ( var i = 0; i < pdbs.length; i++) {
      	    			var pdb_name=pdbs[i].trim();
      	    			var pan = Ext.create('Ext.panel.Panel',{
      	    				title:pdb_name,
      	    				bodyCls:'background-black',
      	    				html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_'+pdb_name+'" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
      	    				listeners:{
      	    					afterrender:function(este){
      	    						// JavaScript Document
      	    						var pdb_name=este.title;
      	    						
      	    				    	ChemDoodle.default_backgroundColor = '#000000';
      	    				    	
      	    				    	var pdb = new ChemDoodle.TransformCanvas3D('pdb_canvas_'+pdb_name, 300, 300);
      	    				    	if(!pdb.gl){
      	    				    	  pdb.emptyMessage = 'Your browser does not support WebGL';
      	    				    	  pdb.displayMessage();
      	    				    	}else{
      	    					    	pdb.specs.set3DRepresentation('Ball and Stick');
      	    					    	pdb.specs.proteins_ribbonCartoonize = true;
      	    					    	pdb.handle = null;
      	    					    	pdb.timeout = 15;
      	    					    	pdb.startAnimation = ChemDoodle._AnimatorCanvas.prototype.startAnimation;
      	    					    	pdb.stopAnimation = ChemDoodle._AnimatorCanvas.prototype.stopAnimation;
      	    					    	pdb.isRunning = ChemDoodle._AnimatorCanvas.prototype.isRunning;
      	    					    	pdb.dblclick = ChemDoodle.RotatorCanvas.prototype.dblclick;
      	    					    	pdb.nextFrame = function(delta){
      	    					    		var matrix = [];
      	    					    		mat4.identity(matrix);
      	    					    		var change = delta/1000;
      	    					    	        var increment = Math.PI/15;
      	    					    		mat4.rotate(matrix, increment*change, [ 1, 0, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 1, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 0, 1 ]);
      	    					    		mat4.multiply(this.rotationMatrix, matrix);
      	    					    	};
      	    					    	
//      	    					    	http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb
//      	    				    	var mol = ChemDoodle.readPDB('HEADER    PLANT SEED PROTEIN                      30-APR-81   1CRN                                                                       \nDBREF  1CRN A    1    46  UNP    P01542   CRAM_CRAAB       1     46             \nSEQRES   1 A   46  THR THR CYS CYS PRO SER ILE VAL ALA ARG SER ASN PHE          \nSEQRES   2 A   46  ASN VAL CYS ARG LEU PRO GLY THR PRO GLU ALA ILE CYS          \nSEQRES   3 A   46  ALA THR TYR THR GLY CYS ILE ILE ILE PRO GLY ALA THR          \nSEQRES   4 A   46  CYS PRO GLY ASP TYR ALA ASN                                  \nHELIX    1  H1 ILE A    7  PRO A   19  13/10 CONFORMATION RES 17,19       13    \nHELIX    2  H2 GLU A   23  THR A   30  1DISTORTED 3/10 AT RES 30           8    \nSHEET    1  S1 2 THR A   1  CYS A   4  0                                        \nSHEET    2  S1 2 CYS A  32  ILE A  35 -1                                        \nSSBOND   1 CYS A    3    CYS A   40                          1555   1555  2.00  \nSSBOND   2 CYS A    4    CYS A   32                          1555   1555  2.04  \nSSBOND   3 CYS A   16    CYS A   26                          1555   1555  2.05  \nCRYST1   40.960   18.650   22.520  90.00  90.77  90.00 P 1 21 1      2          \nORIGX1      1.000000  0.000000  0.000000        0.00000                         \nORIGX2      0.000000  1.000000  0.000000        0.00000                         \nORIGX3      0.000000  0.000000  1.000000        0.00000                         \nSCALE1      0.024414  0.000000 -0.000328        0.00000                         \nSCALE2      0.000000  0.053619  0.000000        0.00000                         \nSCALE3      0.000000  0.000000  0.044409        0.00000                         \nATOM      1  N   THR A   1      17.047  14.099   3.625  1.00 13.79           N  \nATOM      2  CA  THR A   1      16.967  12.784   4.338  1.00 10.80           C  \nATOM      3  C   THR A   1      15.685  12.755   5.133  1.00  9.19           C  \nATOM      4  O   THR A   1      15.268  13.825   5.594  1.00  9.85           O  \nATOM      5  CB  THR A   1      18.170  12.703   5.337  1.00 13.02           C  \nATOM      6  OG1 THR A   1      19.334  12.829   4.463  1.00 15.06           O  \nATOM      7  CG2 THR A   1      18.150  11.546   6.304  1.00 14.23           C  \nATOM      8  N   THR A   2      15.115  11.555   5.265  1.00  7.81           N  \nATOM      9  CA  THR A   2      13.856  11.469   6.066  1.00  8.31           C  \nATOM     10  C   THR A   2      14.164  10.785   7.379  1.00  5.80           C  \nATOM     11  O   THR A   2      14.993   9.862   7.443  1.00  6.94           O  \nATOM     12  CB  THR A   2      12.732  10.711   5.261  1.00 10.32           C  \nATOM     13  OG1 THR A   2      13.308   9.439   4.926  1.00 12.81           O  \nATOM     14  CG2 THR A   2      12.484  11.442   3.895  1.00 11.90           C  \nATOM     15  N   CYS A   3      13.488  11.241   8.417  1.00  5.24           N  \nATOM     16  CA  CYS A   3      13.660  10.707   9.787  1.00  5.39           C  \nATOM     17  C   CYS A   3      12.269  10.431  10.323  1.00  4.45           C  \nATOM     18  O   CYS A   3      11.393  11.308  10.185  1.00  6.54           O  \nATOM     19  CB  CYS A   3      14.368  11.748  10.691  1.00  5.99           C  \nATOM     20  SG  CYS A   3      15.885  12.426  10.016  1.00  7.01           S  \nATOM     21  N   CYS A   4      12.019   9.272  10.928  1.00  3.90           N  \nATOM     22  CA  CYS A   4      10.646   8.991  11.408  1.00  4.24           C  \nATOM     23  C   CYS A   4      10.654   8.793  12.919  1.00  3.72           C  \nATOM     24  O   CYS A   4      11.659   8.296  13.491  1.00  5.30           O  \nATOM     25  CB  CYS A   4      10.057   7.752  10.682  1.00  4.41           C  \nATOM     26  SG  CYS A   4       9.837   8.018   8.904  1.00  4.72           S  \nATOM     27  N   PRO A   5       9.561   9.108  13.563  1.00  3.96           N  \nATOM     28  CA  PRO A   5       9.448   9.034  15.012  1.00  4.25           C  \nATOM     29  C   PRO A   5       9.288   7.670  15.606  1.00  4.96           C  \nATOM     30  O   PRO A   5       9.490   7.519  16.819  1.00  7.44           O  \nATOM     31  CB  PRO A   5       8.230   9.957  15.345  1.00  5.11           C  \nATOM     32  CG  PRO A   5       7.338   9.786  14.114  1.00  5.24           C  \nATOM     33  CD  PRO A   5       8.366   9.804  12.958  1.00  5.20           C  \nATOM     34  N   SER A   6       8.875   6.686  14.796  1.00  4.83           N  \nATOM     35  CA  SER A   6       8.673   5.314  15.279  1.00  4.45           C  \nATOM     36  C   SER A   6       8.753   4.376  14.083  1.00  4.99           C  \nATOM     37  O   SER A   6       8.726   4.858  12.923  1.00  4.61           O  \nATOM     38  CB  SER A   6       7.340   5.121  15.996  1.00  5.05           C  \nATOM     39  OG  SER A   6       6.274   5.220  15.031  1.00  6.39           O  \nATOM     40  N   ILE A   7       8.881   3.075  14.358  1.00  4.94           N  \nATOM     41  CA  ILE A   7       8.912   2.083  13.258  1.00  6.33           C  \nATOM     42  C   ILE A   7       7.581   2.090  12.506  1.00  5.32           C  \nATOM     43  O   ILE A   7       7.670   2.031  11.245  1.00  6.85           O  \nATOM     44  CB  ILE A   7       9.207   0.677  13.924  1.00  8.43           C  \nATOM     45  CG1 ILE A   7      10.714   0.702  14.312  1.00  9.78           C  \nATOM     46  CG2 ILE A   7       8.811  -0.477  12.969  1.00 11.70           C  \nATOM     47  CD1 ILE A   7      11.185  -0.516  15.142  1.00  9.92           C  \nATOM     48  N   VAL A   8       6.458   2.162  13.159  1.00  5.02           N  \nATOM     49  CA  VAL A   8       5.145   2.209  12.453  1.00  6.93           C  \nATOM     50  C   VAL A   8       5.115   3.379  11.461  1.00  5.39           C  \nATOM     51  O   VAL A   8       4.664   3.268  10.343  1.00  6.30           O  \nATOM     52  CB  VAL A   8       3.995   2.354  13.478  1.00  9.64           C  \nATOM     53  CG1 VAL A   8       2.716   2.891  12.869  1.00 13.85           C  \nATOM     54  CG2 VAL A   8       3.758   1.032  14.208  1.00 11.97           C  \nATOM     55  N   ALA A   9       5.606   4.546  11.941  1.00  3.73           N  \nATOM     56  CA  ALA A   9       5.598   5.767  11.082  1.00  3.56           C  \nATOM     57  C   ALA A   9       6.441   5.527   9.850  1.00  4.13           C  \nATOM     58  O   ALA A   9       6.052   5.933   8.744  1.00  4.36           O  \nATOM     59  CB  ALA A   9       6.022   6.977  11.891  1.00  4.80           C  \nATOM     60  N   ARG A  10       7.647   4.909  10.005  1.00  3.73           N  \nATOM     61  CA  ARG A  10       8.496   4.609   8.837  1.00  3.38           C  \nATOM     62  C   ARG A  10       7.798   3.609   7.876  1.00  3.47           C  \nATOM     63  O   ARG A  10       7.878   3.778   6.651  1.00  4.67           O  \nATOM     64  CB  ARG A  10       9.847   4.020   9.305  1.00  3.95           C  \nATOM     65  CG  ARG A  10      10.752   3.607   8.149  1.00  4.55           C  \nATOM     66  CD  ARG A  10      11.226   4.699   7.244  1.00  5.89           C  \nATOM     67  NE  ARG A  10      12.143   5.571   8.035  1.00  6.20           N  \nATOM     68  CZ  ARG A  10      12.758   6.609   7.443  1.00  7.52           C  \nATOM     69  NH1 ARG A  10      12.539   6.932   6.158  1.00 10.68           N  \nATOM     70  NH2 ARG A  10      13.601   7.322   8.202  1.00  9.48           N  \nATOM     71  N   SER A  11       7.186   2.582   8.445  1.00  5.19           N  \nATOM     72  CA  SER A  11       6.500   1.584   7.565  1.00  4.60           C  \nATOM     73  C   SER A  11       5.382   2.313   6.773  1.00  4.84           C  \nATOM     74  O   SER A  11       5.213   2.016   5.557  1.00  5.84           O  \nATOM     75  CB  SER A  11       5.908   0.462   8.400  1.00  5.91           C  \nATOM     76  OG  SER A  11       6.990  -0.272   9.012  1.00  8.38           O  \nATOM     77  N   ASN A  12       4.648   3.182   7.446  1.00  3.54           N  \nATOM     78  CA  ASN A  12       3.545   3.935   6.751  1.00  4.57           C  \nATOM     79  C   ASN A  12       4.107   4.851   5.691  1.00  4.14           C  \nATOM     80  O   ASN A  12       3.536   5.001   4.617  1.00  5.52           O  \nATOM     81  CB  ASN A  12       2.663   4.677   7.748  1.00  6.42           C  \nATOM     82  CG  ASN A  12       1.802   3.735   8.610  1.00  8.25           C  \nATOM     83  OD1 ASN A  12       1.567   2.613   8.165  1.00 12.72           O  \nATOM     84  ND2 ASN A  12       1.394   4.252   9.767  1.00  9.92           N  \nATOM     85  N   PHE A  13       5.259   5.498   6.005  1.00  3.43           N  \nATOM     86  CA  PHE A  13       5.929   6.358   5.055  1.00  3.49           C  \nATOM     87  C   PHE A  13       6.304   5.578   3.799  1.00  3.40           C  \nATOM     88  O   PHE A  13       6.136   6.072   2.653  1.00  4.07           O  \nATOM     89  CB  PHE A  13       7.183   6.994   5.754  1.00  5.48           C  \nATOM     90  CG  PHE A  13       7.884   8.006   4.883  1.00  5.57           C  \nATOM     91  CD1 PHE A  13       8.906   7.586   4.027  1.00  6.99           C  \nATOM     92  CD2 PHE A  13       7.532   9.373   4.983  1.00  6.52           C  \nATOM     93  CE1 PHE A  13       9.560   8.539   3.194  1.00  8.20           C  \nATOM     94  CE2 PHE A  13       8.176  10.281   4.145  1.00  6.34           C  \nATOM     95  CZ  PHE A  13       9.141   9.845   3.292  1.00  6.84           C  \nATOM     96  N   ASN A  14       6.900   4.390   3.989  1.00  3.64           N  \nATOM     97  CA  ASN A  14       7.331   3.607   2.791  1.00  4.31           C  \nATOM     98  C   ASN A  14       6.116   3.210   1.915  1.00  3.98           C  \nATOM     99  O   ASN A  14       6.240   3.144   0.684  1.00  6.22           O  \nATOM    100  CB  ASN A  14       8.145   2.404   3.240  1.00  5.81           C  \nATOM    101  CG  ASN A  14       9.555   2.856   3.730  1.00  6.82           C  \nATOM    102  OD1 ASN A  14      10.013   3.895   3.323  1.00  9.43           O  \nATOM    103  ND2 ASN A  14      10.120   1.956   4.539  1.00  8.21           N  \nATOM    104  N   VAL A  15       4.993   2.927   2.571  1.00  3.76           N  \nATOM    105  CA  VAL A  15       3.782   2.599   1.742  1.00  3.98           C  \nATOM    106  C   VAL A  15       3.296   3.871   1.004  1.00  3.80           C  \nATOM    107  O   VAL A  15       2.947   3.817  -0.189  1.00  4.85           O  \nATOM    108  CB  VAL A  15       2.698   1.953   2.608  1.00  4.71           C  \nATOM    109  CG1 VAL A  15       1.384   1.826   1.806  1.00  6.67           C  \nATOM    110  CG2 VAL A  15       3.174   0.533   3.005  1.00  6.26           C  \nATOM    111  N   CYS A  16       3.321   4.987   1.720  1.00  3.79           N  \nATOM    112  CA  CYS A  16       2.890   6.285   1.126  1.00  3.54           C  \nATOM    113  C   CYS A  16       3.687   6.597  -0.111  1.00  3.48           C  \nATOM    114  O   CYS A  16       3.200   7.147  -1.103  1.00  4.63           O  \nATOM    115  CB  CYS A  16       3.039   7.369   2.240  1.00  4.58           C  \nATOM    116  SG  CYS A  16       2.559   9.014   1.649  1.00  5.66           S  \nATOM    117  N   ARG A  17       4.997   6.227  -0.100  1.00  3.99           N  \nATOM    118  CA  ARG A  17       5.895   6.489  -1.213  1.00  3.83           C  \nATOM    119  C   ARG A  17       5.738   5.560  -2.409  1.00  3.79           C  \nATOM    120  O   ARG A  17       6.228   5.901  -3.507  1.00  5.39           O  \nATOM    121  CB  ARG A  17       7.370   6.507  -0.731  1.00  4.11           C  \nATOM    122  CG  ARG A  17       7.717   7.687   0.206  1.00  4.69           C  \nATOM    123  CD  ARG A  17       7.949   8.947  -0.615  1.00  5.10           C  \nATOM    124  NE  ARG A  17       9.212   8.856  -1.337  1.00  4.71           N  \nATOM    125  CZ  ARG A  17       9.537   9.533  -2.431  1.00  5.28           C  \nATOM    126  NH1 ARG A  17       8.659  10.350  -3.032  1.00  6.67           N  \nATOM    127  NH2 ARG A  17      10.793   9.491  -2.899  1.00  6.41           N  \nATOM    128  N   LEU A  18       5.051   4.411  -2.204  1.00  4.70           N  \nATOM    129  CA  LEU A  18       4.933   3.431  -3.326  1.00  5.46           C  \nATOM    130  C   LEU A  18       4.397   4.014  -4.620  1.00  5.13           C  \nATOM    131  O   LEU A  18       4.988   3.755  -5.687  1.00  5.55           O  \nATOM    132  CB  LEU A  18       4.196   2.184  -2.863  1.00  6.47           C  \nATOM    133  CG  LEU A  18       4.960   1.178  -1.991  1.00  7.43           C  \nATOM    134  CD1 LEU A  18       3.907   0.097  -1.634  1.00  8.70           C  \nATOM    135  CD2 LEU A  18       6.129   0.606  -2.768  1.00  9.39           C  \nATOM    136  N   PRO A  19       3.329   4.795  -4.543  1.00  4.28           N  \nATOM    137  CA  PRO A  19       2.792   5.376  -5.797  1.00  5.38           C  \nATOM    138  C   PRO A  19       3.573   6.540  -6.322  1.00  6.30           C  \nATOM    139  O   PRO A  19       3.260   7.045  -7.422  1.00  9.62           O  \nATOM    140  CB  PRO A  19       1.358   5.766  -5.472  1.00  5.87           C  \nATOM    141  CG  PRO A  19       1.223   5.694  -3.993  1.00  6.47           C  \nATOM    142  CD  PRO A  19       2.421   4.941  -3.408  1.00  6.45           C  \nATOM    143  N   GLY A  20       4.565   7.047  -5.559  1.00  4.94           N  \nATOM    144  CA  GLY A  20       5.366   8.191  -6.018  1.00  5.39           C  \nATOM    145  C   GLY A  20       5.007   9.481  -5.280  1.00  5.03           C  \nATOM    146  O   GLY A  20       5.535  10.510  -5.730  1.00  7.34           O  \nATOM    147  N   THR A  21       4.181   9.438  -4.262  1.00  4.10           N  \nATOM    148  CA  THR A  21       3.767  10.609  -3.513  1.00  3.94           C  \nATOM    149  C   THR A  21       5.017  11.397  -3.042  1.00  3.96           C  \nATOM    150  O   THR A  21       5.947  10.757  -2.523  1.00  5.82           O  \nATOM    151  CB  THR A  21       2.992  10.188  -2.225  1.00  4.13           C  \nATOM    152  OG1 THR A  21       2.051   9.144  -2.623  1.00  5.45           O  \nATOM    153  CG2 THR A  21       2.260  11.349  -1.551  1.00  5.41           C  \nATOM    154  N   PRO A  22       4.971  12.703  -3.176  1.00  5.04           N  \nATOM    155  CA  PRO A  22       6.143  13.513  -2.696  1.00  4.69           C  \nATOM    156  C   PRO A  22       6.400  13.233  -1.225  1.00  4.19           C  \nATOM    157  O   PRO A  22       5.485  13.061  -0.382  1.00  4.47           O  \nATOM    158  CB  PRO A  22       5.703  14.969  -2.920  1.00  7.12           C  \nATOM    159  CG  PRO A  22       4.676  14.893  -3.996  1.00  7.03           C  \nATOM    160  CD  PRO A  22       3.964  13.567  -3.811  1.00  4.90           C  \nATOM    161  N   GLU A  23       7.728  13.297  -0.921  1.00  5.16           N  \nATOM    162  CA  GLU A  23       8.114  13.103   0.500  1.00  5.31           C  \nATOM    163  C   GLU A  23       7.427  14.073   1.410  1.00  4.11           C  \nATOM    164  O   GLU A  23       7.036  13.682   2.540  1.00  5.11           O  \nATOM    165  CB  GLU A  23       9.648  13.285   0.660  1.00  6.16           C  \nATOM    166  CG  GLU A  23      10.440  12.093   0.063  1.00  7.48           C  \nATOM    167  CD  GLU A  23      11.941  12.170   0.391  1.00  9.40           C  \nATOM    168  OE1 GLU A  23      12.416  13.225   0.681  1.00 10.40           O  \nATOM    169  OE2 GLU A  23      12.539  11.070   0.292  1.00 13.32           O  \nATOM    170  N   ALA A  24       7.212  15.334   0.966  1.00  4.56           N  \nATOM    171  CA  ALA A  24       6.614  16.317   1.913  1.00  4.49           C  \nATOM    172  C   ALA A  24       5.212  15.936   2.350  1.00  4.10           C  \nATOM    173  O   ALA A  24       4.782  16.166   3.495  1.00  5.64           O  \nATOM    174  CB  ALA A  24       6.605  17.695   1.246  1.00  5.80           C  \nATOM    175  N   ILE A  25       4.445  15.318   1.405  1.00  4.37           N  \nATOM    176  CA  ILE A  25       3.074  14.894   1.756  1.00  5.44           C  \nATOM    177  C   ILE A  25       3.085  13.643   2.645  1.00  4.32           C  \nATOM    178  O   ILE A  25       2.315  13.523   3.578  1.00  4.72           O  \nATOM    179  CB  ILE A  25       2.204  14.637   0.462  1.00  6.42           C  \nATOM    180  CG1 ILE A  25       1.815  16.048  -0.129  1.00  7.50           C  \nATOM    181  CG2 ILE A  25       0.903  13.864   0.811  1.00  7.65           C  \nATOM    182  CD1 ILE A  25       0.756  16.761   0.757  1.00  7.80           C  \nATOM    183  N   CYS A  26       4.032  12.764   2.313  1.00  3.92           N  \nATOM    184  CA  CYS A  26       4.180  11.549   3.187  1.00  4.37           C  \nATOM    185  C   CYS A  26       4.632  11.944   4.596  1.00  3.95           C  \nATOM    186  O   CYS A  26       4.227  11.252   5.547  1.00  4.74           O  \nATOM    187  CB  CYS A  26       5.038  10.518   2.539  1.00  4.63           C  \nATOM    188  SG  CYS A  26       4.349   9.794   1.022  1.00  5.61           S  \nATOM    189  N   ALA A  27       5.408  13.012   4.694  1.00  3.89           N  \nATOM    190  CA  ALA A  27       5.879  13.502   6.026  1.00  4.43           C  \nATOM    191  C   ALA A  27       4.696  13.908   6.882  1.00  4.26           C  \nATOM    192  O   ALA A  27       4.528  13.422   8.025  1.00  5.44           O  \nATOM    193  CB  ALA A  27       6.880  14.615   5.830  1.00  5.36           C  \nATOM    194  N   THR A  28       3.827  14.802   6.358  1.00  4.53           N  \nATOM    195  CA  THR A  28       2.691  15.221   7.194  1.00  5.08           C  \nATOM    196  C   THR A  28       1.672  14.132   7.434  1.00  4.62           C  \nATOM    197  O   THR A  28       0.947  14.112   8.468  1.00  7.80           O  \nATOM    198  CB  THR A  28       1.986  16.520   6.614  1.00  6.03           C  \nATOM    199  OG1 THR A  28       1.664  16.221   5.230  1.00  7.19           O  \nATOM    200  CG2 THR A  28       2.914  17.739   6.700  1.00  7.34           C  \nATOM    201  N   TYR A  29       1.621  13.190   6.511  1.00  5.01           N  \nATOM    202  CA  TYR A  29       0.715  12.045   6.657  1.00  6.60           C  \nATOM    203  C   TYR A  29       1.125  11.125   7.815  1.00  4.92           C  \nATOM    204  O   TYR A  29       0.286  10.632   8.545  1.00  7.13           O  \nATOM    205  CB  TYR A  29       0.755  11.229   5.322  1.00  9.66           C  \nATOM    206  CG  TYR A  29      -0.203  10.044   5.354  1.00 11.56           C  \nATOM    207  CD1 TYR A  29      -1.547  10.337   5.645  1.00 12.85           C  \nATOM    208  CD2 TYR A  29       0.193   8.750   5.100  1.00 14.44           C  \nATOM    209  CE1 TYR A  29      -2.496   9.329   5.673  1.00 16.61           C  \nATOM    210  CE2 TYR A  29      -0.801   7.705   5.156  1.00 17.11           C  \nATOM    211  CZ  TYR A  29      -2.079   8.031   5.430  1.00 19.99           C  \nATOM    212  OH  TYR A  29      -3.097   7.057   5.458  1.00 28.98           O  \nATOM    213  N   THR A  30       2.470  10.984   7.995  1.00  5.31           N  \nATOM    214  CA  THR A  30       2.986   9.994   8.950  1.00  5.70           C  \nATOM    215  C   THR A  30       3.609  10.505  10.230  1.00  6.28           C  \nATOM    216  O   THR A  30       3.766   9.715  11.186  1.00  8.77           O  \nATOM    217  CB  THR A  30       4.076   9.103   8.225  1.00  6.55           C  \nATOM    218  OG1 THR A  30       5.125  10.027   7.824  1.00  6.57           O  \nATOM    219  CG2 THR A  30       3.493   8.324   7.035  1.00  7.29           C  \nATOM    220  N   GLY A  31       3.984  11.764  10.241  1.00  4.99           N  \nATOM    221  CA  GLY A  31       4.769  12.336  11.360  1.00  5.50           C  \nATOM    222  C   GLY A  31       6.255  12.243  11.106  1.00  4.19           C  \nATOM    223  O   GLY A  31       7.037  12.750  11.954  1.00  6.12           O  \nATOM    224  N   CYS A  32       6.710  11.631   9.992  1.00  4.30           N  \nATOM    225  CA  CYS A  32       8.140  11.694   9.635  1.00  4.89           C  \nATOM    226  C   CYS A  32       8.500  13.141   9.206  1.00  5.50           C  \nATOM    227  O   CYS A  32       7.581  13.949   8.944  1.00  5.82           O  \nATOM    228  CB  CYS A  32       8.504  10.686   8.530  1.00  4.66           C  \nATOM    229  SG  CYS A  32       8.048   8.987   8.881  1.00  5.33           S  \nATOM    230  N   ILE A  33       9.793  13.410   9.173  1.00  6.02           N  \nATOM    231  CA  ILE A  33      10.280  14.760   8.823  1.00  5.24           C  \nATOM    232  C   ILE A  33      11.346  14.658   7.743  1.00  5.16           C  \nATOM    233  O   ILE A  33      11.971  13.583   7.552  1.00  7.19           O  \nATOM    234  CB  ILE A  33      10.790  15.535  10.085  1.00  5.49           C  \nATOM    235  CG1 ILE A  33      12.059  14.803  10.671  1.00  6.85           C  \nATOM    236  CG2 ILE A  33       9.684  15.686  11.138  1.00  6.45           C  \nATOM    237  CD1 ILE A  33      12.733  15.676  11.781  1.00  8.94           C  \nATOM    238  N   ILE A  34      11.490  15.773   7.038  1.00  5.52           N  \nATOM    239  CA  ILE A  34      12.552  15.877   6.036  1.00  6.82           C  \nATOM    240  C   ILE A  34      13.590  16.917   6.560  1.00  6.92           C  \nATOM    241  O   ILE A  34      13.168  18.006   6.945  1.00  9.22           O  \nATOM    242  CB  ILE A  34      11.987  16.360   4.681  1.00  8.11           C  \nATOM    243  CG1 ILE A  34      10.914  15.338   4.163  1.00  9.59           C  \nATOM    244  CG2 ILE A  34      13.131  16.517   3.629  1.00  9.73           C  \nATOM    245  CD1 ILE A  34      10.151  16.024   2.938  1.00 13.41           C  \nATOM    246  N   ILE A  35      14.856  16.493   6.536  1.00  7.06           N  \nATOM    247  CA  ILE A  35      15.930  17.454   6.941  1.00  7.52           C  \nATOM    248  C   ILE A  35      16.913  17.550   5.819  1.00  6.63           C  \nATOM    249  O   ILE A  35      17.097  16.660   4.970  1.00  7.90           O  \nATOM    250  CB  ILE A  35      16.622  16.995   8.285  1.00  8.07           C  \nATOM    251  CG1 ILE A  35      17.360  15.651   8.067  1.00  9.41           C  \nATOM    252  CG2 ILE A  35      15.592  16.974   9.434  1.00  9.46           C  \nATOM    253  CD1 ILE A  35      18.298  15.206   9.219  1.00  9.85           C  \nATOM    254  N   PRO A  36      17.664  18.669   5.806  1.00  8.07           N  \nATOM    255  CA  PRO A  36      18.635  18.861   4.738  1.00  8.78           C  \nATOM    256  C   PRO A  36      19.925  18.042   4.949  1.00  8.31           C  \nATOM    257  O   PRO A  36      20.593  17.742   3.945  1.00  9.09           O  \nATOM    258  CB  PRO A  36      18.945  20.364   4.783  1.00  9.67           C  \nATOM    259  CG  PRO A  36      18.238  20.937   5.908  1.00 10.15           C  \nATOM    260  CD  PRO A  36      17.371  19.900   6.596  1.00  9.53           C  \nATOM    261  N   GLY A  37      20.172  17.730   6.217  1.00  8.48           N  \nATOM    262  CA  GLY A  37      21.452  16.969   6.513  1.00  9.20           C  \nATOM    263  C   GLY A  37      21.143  15.478   6.427  1.00 10.41           C  \nATOM    264  O   GLY A  37      20.138  15.023   5.878  1.00 12.06           O  \nATOM    265  N   ALA A  38      22.055  14.701   7.032  1.00  9.24           N  \nATOM    266  CA  ALA A  38      22.019  13.242   7.020  1.00  9.24           C  \nATOM    267  C   ALA A  38      21.944  12.628   8.396  1.00  9.60           C  \nATOM    268  O   ALA A  38      21.869  11.387   8.435  1.00 13.65           O  \nATOM    269  CB  ALA A  38      23.246  12.697   6.275  1.00 10.43           C  \nATOM    270  N   THR A  39      21.894  13.435   9.436  1.00  8.70           N  \nATOM    271  CA  THR A  39      21.936  12.911  10.809  1.00  9.46           C  \nATOM    272  C   THR A  39      20.615  13.191  11.521  1.00  8.32           C  \nATOM    273  O   THR A  39      20.357  14.317  11.948  1.00  9.89           O  \nATOM    274  CB  THR A  39      23.131  13.601  11.593  1.00 10.72           C  \nATOM    275  OG1 THR A  39      24.284  13.401  10.709  1.00 11.66           O  \nATOM    276  CG2 THR A  39      23.340  12.935  12.962  1.00 11.81           C  \nATOM    277  N   CYS A  40      19.827  12.110  11.642  1.00  7.64           N  \nATOM    278  CA  CYS A  40      18.504  12.312  12.298  1.00  8.05           C  \nATOM    279  C   CYS A  40      18.684  12.451  13.784  1.00  7.63           C  \nATOM    280  O   CYS A  40      19.533  11.718  14.362  1.00  9.64           O  \nATOM    281  CB  CYS A  40      17.582  11.117  11.996  1.00  7.80           C  \nATOM    282  SG  CYS A  40      17.199  10.929  10.237  1.00  7.30           S  \nATOM    283  N   PRO A  41      17.880  13.266  14.426  1.00  8.00           N  \nATOM    284  CA  PRO A  41      17.924  13.421  15.877  1.00  8.96           C  \nATOM    285  C   PRO A  41      17.392  12.206  16.594  1.00  9.06           C  \nATOM    286  O   PRO A  41      16.652  11.368  16.033  1.00  8.82           O  \nATOM    287  CB  PRO A  41      17.076  14.658  16.145  1.00 10.39           C  \nATOM    288  CG  PRO A  41      16.098  14.689  14.997  1.00 10.99           C  \nATOM    289  CD  PRO A  41      16.859  14.150  13.779  1.00 10.49           C  \nATOM    290  N   GLY A  42      17.728  12.124  17.884  1.00  7.55           N  \nATOM    291  CA  GLY A  42      17.334  10.956  18.691  1.00  8.00           C  \nATOM    292  C   GLY A  42      15.875  10.688  18.871  1.00  7.22           C  \nATOM    293  O   GLY A  42      15.434   9.550  19.166  1.00  8.41           O  \nATOM    294  N   ASP A  43      15.036  11.747  18.715  1.00  5.54           N  \nATOM    295  CA  ASP A  43      13.564  11.573  18.836  1.00  5.85           C  \nATOM    296  C   ASP A  43      12.936  11.227  17.470  1.00  5.87           C  \nATOM    297  O   ASP A  43      11.720  11.040  17.428  1.00  7.29           O  \nATOM    298  CB  ASP A  43      12.933  12.737  19.580  1.00  6.72           C  \nATOM    299  CG  ASP A  43      13.140  14.094  18.958  1.00  8.59           C  \nATOM    300  OD1 ASP A  43      14.109  14.303  18.212  1.00  9.59           O  \nATOM    301  OD2 ASP A  43      12.267  14.963  19.265  1.00 11.45           O  \nATOM    302  N   TYR A  44      13.725  11.174  16.425  1.00  5.22           N  \nATOM    303  CA  TYR A  44      13.257  10.745  15.081  1.00  5.56           C  \nATOM    304  C   TYR A  44      14.275   9.687  14.612  1.00  4.61           C  \nATOM    305  O   TYR A  44      14.930   9.862  13.568  1.00  6.04           O  \nATOM    306  CB  TYR A  44      13.200  11.914  14.071  1.00  5.41           C  \nATOM    307  CG  TYR A  44      12.000  12.819  14.399  1.00  5.34           C  \nATOM    308  CD1 TYR A  44      12.119  13.853  15.332  1.00  6.59           C  \nATOM    309  CD2 TYR A  44      10.775  12.617  13.762  1.00  5.94           C  \nATOM    310  CE1 TYR A  44      11.045  14.675  15.610  1.00  5.97           C  \nATOM    311  CE2 TYR A  44       9.676  13.433  14.048  1.00  5.17           C  \nATOM    312  CZ  TYR A  44       9.802  14.456  14.996  1.00  5.96           C  \nATOM    313  OH  TYR A  44       8.740  15.265  15.269  1.00  8.60           O  \nATOM    314  N   ALA A  45      14.342   8.640  15.422  1.00  4.76           N  \nATOM    315  CA  ALA A  45      15.445   7.667  15.246  1.00  5.89           C  \nATOM    316  C   ALA A  45      15.171   6.533  14.280  1.00  6.67           C  \nATOM    317  O   ALA A  45      16.093   5.705  14.039  1.00  7.56           O  \nATOM    318  CB  ALA A  45      15.680   7.099  16.682  1.00  6.82           C  \nATOM    319  N   ASN A  46      13.966   6.502  13.739  1.00  5.80           N  \nATOM    320  CA  ASN A  46      13.512   5.395  12.878  1.00  6.15           C  \nATOM    321  C   ASN A  46      13.311   5.853  11.455  1.00  6.61           C  \nATOM    322  O   ASN A  46      13.733   6.929  11.026  1.00  7.18           O  \nATOM    323  CB  ASN A  46      12.266   4.769  13.501  1.00  7.27           C  \nATOM    324  CG  ASN A  46      12.538   4.304  14.922  1.00  7.98           C  \nATOM    325  OD1 ASN A  46      11.982   4.849  15.886  1.00 11.00           O  \nATOM    326  ND2 ASN A  46      13.407   3.298  15.015  1.00 10.32           N  \nATOM    327  OXT ASN A  46      12.703   4.973  10.746  1.00  7.86           O  \nTER     328      ASN A  46                                                      \nCONECT   20  282                                                                \nCONECT   26  229                                                                \nCONECT  116  188                                                                \nCONECT  188  116                                                                \nCONECT  229   26                                                                \nCONECT  282   20                                                                \nMASTER      227    0    0    2    2    1    0    6  327    1    6    4          \nEND                                                                             \n', 1);
      						    		$.get('http://www.rcsb.org/pdb/files/'+pdb_name+'.pdb', function(data) {			
      						    			var mol = ChemDoodle.readPDB(data);
      						    			pdb.loadMolecule(mol);
      						    			pdb.startAnimation();
      						    		});
      	    				    	}
      	    					}
      	    				}
      	    			});
      	    			
      	    			_this.p3dProtein.add(pan);
      	    		}
    			}
    			else{
    				_this.p3dProtein.setTitle('No proteins found');
    			}


  	    	}
    	});
    	
//    	$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb', 
    	
    	
    	
    	
//    	http://www.rcsb.org/pdb/files/1A17.pdb
    	
//    	http://www.rcsb.org/pdb/files/AAAA.pdb
    	
//		var pan = Ext.create('Ext.panel.Panel',{
//			title:"3D Protein Viewer",
//	        border:false,
//	        cls:'panel-border-left',
//			flex:3,
//			bodyPadding:5,
//			autoScroll:true,
//			html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_prueba" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
//
//		});

    }
    return this.p3dProtein;

};




GeneOrangeInfoWidget.prototype.getEnsembleId = function (){

};


GeneOrangeInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		_this.dataReceived(JSON.parse(data.result));//TODO
	});
	cellBaseManager.get("feature","gene", this.query, "fullinfo");
};
GeneOrangeInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0][0];
	console.log(this.data);
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
MirnaInfoWidget.prototype.draw = InfoWidget.prototype.draw;
MirnaInfoWidget.prototype.render = InfoWidget.prototype.render;
MirnaInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
MirnaInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
MirnaInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
MirnaInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
MirnaInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;


function MirnaInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "miRNA Information";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

MirnaInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Information", children: [
	                { text: "miRNA"},
	                { text: "Transcript"}, 
	                { text: "Gene"} 
	            ] },
	            { text: "Regulatory", children: [
  	                { text: "Target Genes"}
  	            ] },
  	            { text: "Disease", children: [
  	              { text: "Related Diseases"}
  	            ] }
	        ];
};
MirnaInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "miRNA":  this.panel.add(this.getMirnaPanel(this.data.mirna).show()); break;
			case "Transcript": this.panel.add(this.getTranscriptPanel(this.data.transcripts).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.genes).show()); break;
			case "Target Genes": this.panel.add(this.getTargetGenesGrid(this.data.targetGenes).show()); break;
			case "Related Diseases": this.panel.add(this.getMirnaDiseasesGrid(this.data.mirnaDiseases).show()); break;
		}
	}
};

MirnaInfoWidget.prototype.getMirnaPanel = function(data){
	if(data.mirnaMature.length<=0 && data.mirnaGenes.length<=0){
		return this.notFoundPanel;
	}
    if(this.mirnaPanel==null){
    	
    	
    	var tplMature = this.getMirnaMatureTemplate();
    	var tplGene = this.getMirnaGeneTemplate();

    	var panels = [];
    	for ( var i = 0; i < data.mirnaMature.length; i++) {
			var maturePan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data.mirnaMature[i],
				tpl:tplMature
			});
			panels.push(maturePan);
    	}
    	
    	for ( var i = 0; i < data.mirnaGenes.length; i++) {
			var genePan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data.mirnaGenes[i],
				tpl:tplGene
			});
			panels.push(genePan);
    	}
		this.mirnaPanel = Ext.create('Ext.panel.Panel',{
			title:"miRNA",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.mirnaPanel;
};


MirnaInfoWidget.prototype.getTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(transcriptPanel);
    	}
		this.transcriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.transcriptGrid;
};

MirnaInfoWidget.prototype.getGenePanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.genePanel==null){
    	
    	var tpl = this.getGeneTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var genePan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(genePan);
    	}
		this.genePanel = Ext.create('Ext.panel.Panel',{
			title:"Genes ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.genePanel;
};

MirnaInfoWidget.prototype.getTargetGenesGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.targetGenesGrid==null){
//    	console.log(data);
    	var groupField = '';
    	var modelName = "targetGenes";
    	var fields = ['externalName','stableId','biotype','chromosome','start','end','strand','description'];
    	var columns = [
    	               {header : 'Name',dataIndex: 'externalName',flex:1},
    	               {header : 'Stable Id',dataIndex: 'stableId',flex:2},
    	               {header : 'Biotype',dataIndex: 'biotype',flex:1.5},
    	               {header : 'Chr',dataIndex: 'chromosome',flex:0.5},
    	               {header : 'Start',dataIndex: 'start',flex:1},
    	               {header : 'End',dataIndex: 'end',flex:1},
    	               {header : 'Strand',dataIndex: 'strand',flex:0.5},
    	               {header : 'Description',dataIndex: 'description',flex:1}
    	               ];
    	this.targetGenesGrid = this.doGrid(columns,fields,modelName,groupField);
    	this.targetGenesGrid.store.loadData(data);
    }
    return this.targetGenesGrid;
};

MirnaInfoWidget.prototype.getMirnaDiseasesGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.mirnaDiseasesGrid==null){
//    	console.log(data);
    		var groupField = '';
    		var modelName = "mirnaDiseases";
    		var fields = ['mirnaDiseaseId','mirnaGene','mirbaseId','diseaseName','pubmedId','description'];
    		var columns = [
    		               {header : 'Name',dataIndex: 'mirbaseId',flex:1.5},
    		               {header : 'Disease',dataIndex: 'diseaseName',flex:1.5},
    		               {header : 'PubMed id',dataIndex: 'pubmedId',flex:1},
    		               {header : 'Description',dataIndex: 'description',flex:3}
    		               ];
    		this.mirnaDiseasesGrid = this.doGrid(columns,fields,modelName,groupField);
    		this.mirnaDiseasesGrid.store.loadData(data);
    }
    return this.mirnaDiseasesGrid;
};


MirnaInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(cellBaseDataAdapter.toJSON());
	});
	cellBaseDataAdapter.fill("regulatory","mirna_mature", this.feature.getName(), "fullinfo");
	console.log(this.feature.getName());
};
MirnaInfoWidget.prototype.dataReceived = function (data){
	var parseData = JSON.parse(data);
	this.data=parseData[0];
	console.log(this.data);
	this.optionClick({"text":"miRNA","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};

MirnaInfoWidget.prototype.getMirnaMatureTemplate = function (){
	return new Ext.XTemplate(
			 '<p><span class="panel-border-bottom"><span class="ssel s130">miRNA mature</span> &nbsp; <span class="emph s120"> {mirbaseId} </span></span></p>',
			 '<br>',
			 '<p><span class="w140 dis s90">miRBase Accession: </span> <span class="">{mirbaseAcc}</span></p>',
			 '<span class="w140 dis s90">Sequence: </span> <span class="">{sequence}</span>'
		);
};

MirnaInfoWidget.prototype.getMirnaGeneTemplate = function (){
	return new Ext.XTemplate(
			 '<p><span class="panel-border-bottom"><span class="ssel s130">miRNA gene</span> &nbsp; <span class="emph s120"> {mirbaseId} </span></span></p>',
			 '<br>',
			 '<p><span class="w140 dis s90">miRBase Accession: </span> <span class="">{mirbaseAcc}</span></p>',
			 '<span class="w140 dis s90">Sequence: </span> <span class="">{sequence}</span>',
			 '<p><span class="w140 dis s90">Status: </span> <span class="">{status}</span></p>'
		);
};



ProteinInfoWidget.prototype.draw = InfoWidget.prototype.draw;
ProteinInfoWidget.prototype.render = InfoWidget.prototype.render;
ProteinInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
ProteinInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
ProteinInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;

function ProteinInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Protein Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

ProteinInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Sumary", children: [
	                { text: "Long"},
	                { text: "Seq"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "Reactome"},
	                { text: "Interpro"}
	            ] },
	            { text: "Interactions"},
	            { text: "Variations"}
	           
	        ];
};
ProteinInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "":  break;
			case "":  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "Reactome": break;
			case "Interpro": break;
			case "": break;
			case "": break;
			case "": break;
		}
	}
};
SnpInfoWidget.prototype.draw = InfoWidget.prototype.draw;
SnpInfoWidget.prototype.render = InfoWidget.prototype.render;
SnpInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
SnpInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
SnpInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
SnpInfoWidget.prototype.getSnpTemplate = InfoWidget.prototype.getSnpTemplate;
SnpInfoWidget.prototype.getSnpTranscriptTemplate = InfoWidget.prototype.getSnpTranscriptTemplate;
SnpInfoWidget.prototype.getConsequenceTypeTemplate = InfoWidget.prototype.getConsequenceTypeTemplate;
SnpInfoWidget.prototype.getPhenotypeTemplate = InfoWidget.prototype.getPhenotypeTemplate;
SnpInfoWidget.prototype.getPopulationTemplate = InfoWidget.prototype.getPopulationTemplate;

function SnpInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "SNP Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

SnpInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Transcripts"}
	            ] },
	            { text: "Consequence type"},
	            { text: "Annotated phenotype"}
//	            { text: "Population frequency"}
	           
	        ];
};
SnpInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Transcripts": this.panel.add(this.getSnpTranscriptPanel(this.data.transcriptVariations).show()); break;
			case "Consequence type": this.panel.add(this.getConsequenceTypePanel(this.data.transcriptVariations).show()); break;
			case "Annotated phenotype": this.panel.add(this.getPhenotypePanel(this.data.phenotype).show()); break;
//			case "Population frequency": this.panel.add(this.getPopulationPanel(this.data.population).show()); break;
		}
	}
};

SnpInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.infoPanel==null){
    	var tpl = this.getSnpTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};


SnpInfoWidget.prototype.getSnpTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.snpTranscriptGrid==null){
    	var tpl = this.getSnpTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var snpTranscriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(snpTranscriptPanel);
    	}
		this.snpTranscriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.snpTranscriptGrid;
};

SnpInfoWidget.prototype.getConsequenceTypePanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.consequencePanel==null){
    	var tpl = this.getConsequenceTypeTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var consPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(consPanel);
    	}
		this.consequencePanel = Ext.create('Ext.panel.Panel',{
			title:"Consequence type ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.consequencePanel;
};


SnpInfoWidget.prototype.getPhenotypePanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.phenotypePanel==null){
    	var tpl = this.getPhenotypeTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
		this.phenotypePanel = Ext.create('Ext.panel.Panel',{
			title:"Phenotype ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.phenotypePanel;
};



SnpInfoWidget.prototype.getPopulationPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.populationPanel==null){
    	var tpl = this.getPopulationTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
		this.populationPanel = Ext.create('Ext.panel.Panel',{
			title:"Population ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.populationPanel;
};


SnpInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function (sender,data){
        _this.dataReceived(data.result);//TODO
	});
	cellBaseManager.get("feature","snp", this.query, "info");
};
SnpInfoWidget.prototype.dataReceived = function (data){
//	var mappedSnps = data[0];
//	for ( var i = 0; i < mappedSnps.length; i++) {
//		if (mappedSnps[i].chromosome == this.feature.chromosome && mappedSnps[i].start == this.feature.start && mappedSnps[i].end == this.feature.end ){
//			this.data=mappedSnps[i];
//			console.log(mappedSnps[i]);
//		}
//	}
    this.data=data[0][0];
    console.log(this.data);
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};

TFInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TFInfoWidget.prototype.render = InfoWidget.prototype.render;
TFInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TFInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TFInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TFInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TFInfoWidget.prototype.getProteinTemplate =InfoWidget.prototype.getProteinTemplate;
TFInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TFInfoWidget.prototype.getPWMTemplate = InfoWidget.prototype.getPWMTemplate;
TFInfoWidget.prototype.getProteinXrefTemplate = InfoWidget.prototype.getProteinXrefTemplate;

function TFInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcription Factor Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TFInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Information", children: [
	                { text: "Protein"},
	                { text: "Transcript"}, 
	                { text: "Gene"} 
	            ] },
	            { text: "Regulatory", children: [
  	                { text: "PWM"},//position weight matrix (PWM)
  	                { text: "Target Genes"}
  	            ] },
  	            { text: "Protein Features", children: [
  	              { text: "Protein profile"},//position weight matrix (PWM)
  	              { text: "Mutation sites"},
  	              { text: "Pathways"},
  	              { text: "Protein interactions"},
  	              { text: "Related Diseases"}
  	            ] }
	        ];
};
TFInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Protein":  this.panel.add(this.getProteinPanel(this.data.proteins).show()); break;
			case "Transcript": this.panel.add(this.getTranscriptPanel(this.data.transcripts).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.gene).show()); break;
			case "PWM": this.panel.add(this.getPWMPanel(this.data.pwm).show()); break;
			case "Target Genes": this.panel.add(this.getTargetGenesGrid(this.data.targetGenes).show()); break;
			case "Protein profile": this.panel.add(this.getProteinFeatureGrid(this.data.protein_feature, "Protein profile").show());  break;
			case "Mutation sites": this.panel.add(this.getProteinFeatureGrid(this.data.protein_feature, "Mutation sites").show());  break;
			case "Pathways": this.panel.add(this.getProteinXrefPanel(this.data.protein_xref, "Pathway").show()); break;
			case "Protein interactions": this.panel.add(this.getProteinXrefPanel(this.data.protein_xref, "Interaction").show()); break;
			case "Related Diseases": this.panel.add(this.getProteinXrefPanel(this.data.protein_xref, "Disease").show()); break;
		}
	}
};

TFInfoWidget.prototype.getProteinPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.proteinPanel==null){

    	var tpl = this.getProteinTemplate();

		this.proteinPanel = Ext.create('Ext.panel.Panel',{
			title:"Protein",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data[0],
			tpl:tpl
		});

    }
    return this.proteinPanel;
};


TFInfoWidget.prototype.getTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(transcriptPanel);
    	}
		this.transcriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.transcriptGrid;
};

TFInfoWidget.prototype.getGenePanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.genePanel==null){
    	
    	var tpl = this.getGeneTemplate();
    	
		this.genePanel = Ext.create('Ext.panel.Panel',{
			title:"Gene information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.genePanel;
};

TFInfoWidget.prototype.getPWMPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.pwmPanel==null){
    	var tpl = this.getPWMTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pwmPan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pwmPan);
    	}
		this.pwmPanel = Ext.create('Ext.panel.Panel',{
			title:"PWM ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.pwmPanel;
};

TFInfoWidget.prototype.getTargetGenesGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.targetGenesGrid==null){
//    	console.log(data);
    	
    	var groupField = '';
    	var modelName = "targetGenes";
    	var fields = ['externalName','stableId','biotype','chromosome','start','end','strand','description'];
    	var columns = [
    	               {header : 'Name',dataIndex: 'externalName',flex:1},
    	               {header : 'Stable Id',dataIndex: 'stableId',flex:2},
    	               {header : 'Biotype',dataIndex: 'biotype',flex:1.5},
    	               {header : 'Chr',dataIndex: 'chromosome',flex:0.5},
    	               {header : 'Start',dataIndex: 'start',flex:1},
    	               {header : 'End',dataIndex: 'end',flex:1},
    	               {header : 'Strand',dataIndex: 'strand',flex:0.5},
    	               {header : 'Description',dataIndex: 'description',flex:1}
    	               ];
    	this.targetGenesGrid = this.doGrid(columns,fields,modelName,groupField);
    	this.targetGenesGrid.store.loadData(data);
    }
    return this.targetGenesGrid;
};


TFInfoWidget.prototype.getProteinFeatureGrid = function(data, type){
//	console.log(data.length)
    if(this[type+"Grid"]==null){
//    	console.log(data);
    	
    	//Filtering Mutagenesis
		var notMutaData = new Array();
		var mutaData = new Array();
		for ( var i = 0; i < data.length; i++) {
			if(data[i].type=="mutagenesis site"){
				mutaData.push(data[i]);
			}else{
				notMutaData.push(data[i]);
			}
		}    	
		
    	if(type!=null){
    		if(type=="Protein profile"){
    			var data = notMutaData;
    		}
    		if(type=="Mutation sites"){
    			var data = mutaData;
    		}
    	}
    	if(data.length<=0){
    		return this.notFoundPanel;
    	}
    	
    	var groupField = '';
    	var modelName = type;
    	var fields = ['type','start','end','original','variation','description'];
    	var columns = [
    	               {header : 'Type',dataIndex: 'type',flex:1.5},
    	               {header : 'Start',dataIndex: 'start',flex:0.5},
    	               {header : 'End',dataIndex: 'end',flex:0.5},
    	               {header : 'Original',dataIndex: 'original',flex:0.7},
    	               {header : 'Variation',dataIndex: 'variation',flex:0.7},
    	               {header : 'Description',dataIndex: 'description',flex:3}
    	               ];
    	this[type+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
    	this[type+"Grid"].store.loadData(data);
    }
    return this[type+"Grid"];
};

TFInfoWidget.prototype.getProteinXrefPanel = function(data, type){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this[type+"panel"]==null){
    	var tpl = this.getProteinXrefTemplate();
    	
    	//Filtering Xref
		var pathwayData = new Array();
		var interacData = new Array();
		var diseaseData = new Array();
		
		for ( var i = 0; i < data.length; i++) {
			var src = data[i].source;
			if(src=="Go" || src=="Reactome" || src=="KEGG"){
				pathwayData.push(data[i]);
			}
			if(src=="IntAct" || src=="MINT" || src=="DIP" || src=="String"){
				interacData.push(data[i]);
			}
			if(src=="MIN" || src=="PharmGKB" || src=="Orphanet"){
				diseaseData.push(data[i]);
			}
		}
		
    	if(type!=null){
    		switch(type){
    		case "Pathway":data = pathwayData;break;
    		case "Interaction":data = interacData;break;
    		case "Disease":data = diseaseData;break;
    		}
    	}
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
    	this[type+"panel"] = Ext.create('Ext.panel.Panel',{
			title:type+" ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this[type+"panel"];
};


TFInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(cellBaseDataAdapter.toJSON());
	});
	cellBaseDataAdapter.fill("regulatory","tf", this.feature.getName(), "fullinfo");
	console.log(this.feature.getName());
};
TFInfoWidget.prototype.dataReceived = function (data){
	var parseData = JSON.parse(data);
	this.data=parseData[0];
	console.log(this.data);
	this.optionClick({"text":"Protein","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};

TranscriptInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TranscriptInfoWidget.prototype.render = InfoWidget.prototype.render;
TranscriptInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TranscriptInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TranscriptInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TranscriptInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TranscriptInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TranscriptInfoWidget.prototype.getExonTemplate = InfoWidget.prototype.getExonTemplate;
//shared with gene
TranscriptInfoWidget.prototype.get3Dprotein = GeneInfoWidget.prototype.get3Dprotein;
TranscriptInfoWidget.prototype.getGenePanel = GeneInfoWidget.prototype.getGenePanel;
TranscriptInfoWidget.prototype.getXrefGrid = GeneInfoWidget.prototype.getXrefGrid;
TranscriptInfoWidget.prototype.getTfbsGrid = GeneInfoWidget.prototype.getTfbsGrid;
TranscriptInfoWidget.prototype.getMirnaTargetGrid = GeneInfoWidget.prototype.getMirnaTargetGrid;
TranscriptInfoWidget.prototype.getProteinFeaturesGrid = GeneInfoWidget.prototype.getProteinFeaturesGrid;

function TranscriptInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcript";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TranscriptInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                 { text: "Information"},
	                 { text: "Gene"},
	                 { text: "Exons"},
	                 { text: "Xrefs"}
	            ] },
	            { text: "Functional information", children: [
	                  { text: "GO"},
	                  { text: "Reactome"},
	                  { text: "Interpro"}
	            ] },
	            { text: "Variation", children: [
	                  { text: "SNPs"},
	                  { text: "Mutations"}
	            ] },
	            { text: "Regulatory", children: [
	                  { text: "TFBS"},
	                  { text: "miRNA targets"}                   
	            ]},
	            { text:"Protein", children: [
	                  { text: "Features"},//protein profile
	                  { text: "3D structure"}
	            ]}	            
	        ];
};
TranscriptInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.gene).show());  break;
			case "Exons": this.panel.add(this.getExonsGrid(this.data.exons).show());  break;
			case "Xrefs": this.panel.add(this.getXrefGrid([this.data], "Xref", 'dbName').show());  break;
			case "GO": this.panel.add(this.getXrefGrid([this.data], "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid([this.data], "Interpro").show());  break;
			case "Reactome": this.panel.add(this.getXrefGrid([this.data], "Reactome").show());  break;
			case "SNPs": this.panel.add(this.getSnpsGrid(this.data.snps).show());  break;
			case "Mutations": this.panel.add(this.getMutationsGrid(this.data.mutations).show());  break;
			case "TFBS": this.panel.add(this.getTfbsGrid(this.data.tfbs).show());  break;
			case "miRNA targets": this.panel.add(this.getMirnaTargetGrid(this.data.mirnaTargets).show());  break;
			case "Features": this.panel.add(this.getProteinFeaturesGrid(this.data.proteinFeatures).show());  break;
			case "3D structure": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

TranscriptInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
	if(this.infoPanel==null){
		
    	var tpl = this.getTranscriptTemplate();
    	
		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			autoScroll:true,
			data:data,//para el template
			tpl:tpl
		});
	}
	return this.infoPanel;
};


TranscriptInfoWidget.prototype.getExonsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.exonsGrid==null){

    	var tpl = this.getExonTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var exonPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(exonPanel);
    	}
		this.exonsGrid = Ext.create('Ext.panel.Panel',{
			title:"Exons ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.exonsGrid;
};



//TODO hay muchos y tarda
TranscriptInfoWidget.prototype.getSnpsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.snpsGrid==null){
    	var groupField = '';
    	var modelName = 'SNPs';
	    var fields = ['chromosome','start','end','name',"strand","alleleString","displaySoConsequence"];
		var columns = [
		               	{header : 'Name',dataIndex: 'name',flex:2},
		               	{header : 'Location: chr:start-end (strand)', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end} ({strand})',flex:2},
						{header : 'Alleles',dataIndex: 'alleleString',flex:0.7},
						{header : 'Most severe SO term',dataIndex: 'displaySoConsequence',flex:2}
		             ];
		this.snpsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.snpsGrid.store.loadData(data);
    }
    return this.snpsGrid;
};

TranscriptInfoWidget.prototype.getMutationsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.mutationsGrid==null){
    	var groupField = '';
    	var modelName = 'Mutations';
	    var fields = ["chromosome","start","end","mutationAa","mutationCds","primaryHistology","source"];
		var columns = [
		                {header : 'Mutation AA',dataIndex: 'mutationAa',flex:1},
		               	{header : 'Mutation CDS',dataIndex: 'mutationCds',flex:1.5},
		               	{header : 'Location: chr:start-end', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end}',flex:1.7},
						{header : 'Primary histology',dataIndex: 'primaryHistology',flex:1},
						{header : 'Source',dataIndex: 'source',flex:1}
		             ];
		this.mutationsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.mutationsGrid.store.loadData(data);
    }
    return this.mutationsGrid;
};


TranscriptInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		_this.dataReceived(data.result);//TODO
	});
	cellBaseManager.get("feature","transcript", this.query, "fullinfo");
};
TranscriptInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0][0];
	console.log(this.data);
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};




TranscriptOrangeInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TranscriptOrangeInfoWidget.prototype.render = InfoWidget.prototype.render;
TranscriptOrangeInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TranscriptOrangeInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TranscriptOrangeInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TranscriptOrangeInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TranscriptOrangeInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TranscriptOrangeInfoWidget.prototype.getExonTemplate = InfoWidget.prototype.getExonTemplate;
//shared with gene
//TranscriptOrangeInfoWidget.prototype.get3Dprotein = GeneInfoWidget.prototype.get3Dprotein;
TranscriptOrangeInfoWidget.prototype.getGenePanel = GeneOrangeInfoWidget.prototype.getGenePanel;
TranscriptOrangeInfoWidget.prototype.getXrefGrid = GeneOrangeInfoWidget.prototype.getXrefGrid;
//TranscriptOrangeInfoWidget.prototype.getTfbsGrid = GeneOrangeInfoWidget.prototype.getTfbsGrid;
//TranscriptOrangeInfoWidget.prototype.getMirnaTargetGrid = GeneOrangeInfoWidget.prototype.getMirnaTargetGrid;
//TranscriptOrangeInfoWidget.prototype.getProteinFeaturesGrid = GeneInfoWidget.prototype.getProteinFeaturesGrid;

function TranscriptOrangeInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcript";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TranscriptOrangeInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                 { text: "Information"},
	                 { text: "Gene"},
	                 { text: "Exons"}
	            ] },
	            { text: "Functional information", children: [
	                  { text: "GO"},
	                  { text: "KEGG"},
	                  { text: "Interpro"}
	            ] }	            
	        ];
};
TranscriptOrangeInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.gene).show());  break;
			case "Exons": this.panel.add(this.getExonsGrid(this.data.exons).show());  break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.go, "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.interpro, "Interpro").show());  break;
			case "KEGG": this.panel.add(this.getXrefGrid(this.data.kegg, "KEGG").show());  break;
//			case "SNPs": this.panel.add(this.getSnpsGrid(this.data.snps).show());  break;
//			case "Mutations": this.panel.add(this.getMutationsGrid(this.data.mutations).show());  break;
//			case "TFBS": this.panel.add(this.getTfbsGrid(this.data.tfbs).show());  break;
//			case "miRNA targets": this.panel.add(this.getMirnaTargetGrid(this.data.mirnaTargets).show());  break;
//			case "Features": this.panel.add(this.getProteinFeaturesGrid(this.data.proteinFeatures).show());  break;
//			case "3D structure": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

TranscriptOrangeInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
	if(this.infoPanel==null){
		
    	var tpl = this.getTranscriptTemplate();
    	
		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			autoScroll:true,
			data:data,//para el template
			tpl:tpl
		});
	}
	return this.infoPanel;
};


TranscriptOrangeInfoWidget.prototype.getExonsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.exonsGrid==null){

    	var tpl = this.getExonTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var exonPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(exonPanel);
    	}
		this.exonsGrid = Ext.create('Ext.panel.Panel',{
			title:"Exons ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.exonsGrid;
};



//TODO hay muchos y tarda
TranscriptOrangeInfoWidget.prototype.getSnpsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.snpsGrid==null){
    	var groupField = '';
    	var modelName = 'SNPs';
	    var fields = ['chromosome','start','end','name',"strand","alleleString","displaySoConsequence"];
		var columns = [
		               	{header : 'Name',dataIndex: 'name',flex:2},
		               	{header : 'Location: chr:start-end (strand)', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end} ({strand})',flex:2},
						{header : 'Alleles',dataIndex: 'alleleString',flex:0.7},
						{header : 'Most severe SO term',dataIndex: 'displaySoConsequence',flex:2}
		             ];
		this.snpsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.snpsGrid.store.loadData(data);
    }
    return this.snpsGrid;
};

TranscriptOrangeInfoWidget.prototype.getMutationsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.mutationsGrid==null){
    	var groupField = '';
    	var modelName = 'Mutations';
	    var fields = ["chromosome","start","end","mutationAa","mutationCds","primaryHistology","source"];
		var columns = [
		                {header : 'Mutation AA',dataIndex: 'mutationAa',flex:1},
		               	{header : 'Mutation CDS',dataIndex: 'mutationCds',flex:1.5},
		               	{header : 'Location: chr:start-end', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end}',flex:1.7},
						{header : 'Primary histology',dataIndex: 'primaryHistology',flex:1},
						{header : 'Source',dataIndex: 'source',flex:1}
		             ];
		this.mutationsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.mutationsGrid.store.loadData(data);
    }
    return this.mutationsGrid;
};


TranscriptOrangeInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		_this.dataReceived(JSON.parse(data.result));//TODO
	});
	cellBaseManager.get("feature","transcript", this.query, "fullinfo");
};
TranscriptOrangeInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0];
	console.log(this.data);
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};




VCFVariantInfoWidget.prototype.draw = InfoWidget.prototype.draw;
VCFVariantInfoWidget.prototype.render = InfoWidget.prototype.render;
VCFVariantInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
VCFVariantInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
VCFVariantInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
VCFVariantInfoWidget.prototype.getVCFVariantTemplate = InfoWidget.prototype.getVCFVariantTemplate;
VCFVariantInfoWidget.prototype.getVariantEffectTemplate = InfoWidget.prototype.getVariantEffectTemplate;

function VCFVariantInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF variant Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

VCFVariantInfoWidget.prototype.getdataTypes = function (){
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Variant effect"},
	                { text: "Header"},
	                { text: "Samples"}
	            ] }
	        ];
};
VCFVariantInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data.feature).show()); break;
			case "Variant effect":this.panel.add(this.getEffectPanel(this.data.consequenceType).show()); break;
			case "Header":this.panel.add(this.getHeaderPanel(this.data.header).show()); break;
			case "Samples":this.panel.add(this.getSamplesGrid(this.data.feature.sampleData,this.data.samples,this.data.feature.format).show()); break;
			case "Population": break;
		}
	}
};

VCFVariantInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.infoPanel==null){

    	var tpl = this.getVCFVariantTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

VCFVariantInfoWidget.prototype.getEffectPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
	for ( var i = 0; i < data.length; i++) {
		data[i].consequence = data[i].consequenceType+" - "+data[i].consequenceTypeObo;
		if(data[i].featureName == ""){data[i].featureName="-";}
		if(data[i].geneId == ""){data[i].geneId="-";}
		if(data[i].transcriptId == ""){data[i].transcriptId="-";}
		if(data[i].featureBiotype == ""){data[i].featureBiotype="-";}
		if(data[i].aaPosition == ""){data[i].aaPosition="-";}
		if(data[i].aminoacidChange == ""){data[i].aminoacidChange="-";}

	}
	
    if(this.effectGrid==null){
    	var groupField = 'consequence';
    	var modelName = "effectGridModel";
    	var fields = ['featureName','geneId','transcriptId','featureBiotype','aaPosition','aminoacidChange','consequence'];
    	var columns = [
    	               {header : 'Feature',dataIndex: 'featureName',flex:1},
    	               {header : 'Gene Id',dataIndex: 'geneId',flex:1.5},
    	               {header : 'Transcript Id',dataIndex: 'transcriptId',flex:1.5},
    	               {header : 'Feat.Biotype',dataIndex: 'featureBiotype',flex:1},
    	               {header : 'aa Position',dataIndex: 'aaPosition',flex:1},
    	               {header : 'aa Change',dataIndex: 'aminoacidChange',flex:1}
    	               ];
    	this.effectGrid = this.doGrid(columns,fields,modelName,groupField);
    	this.effectGrid.store.loadData(data);
    }
    return this.effectGrid;
	
//    if(this.effectPanel==null){
//    	var tpl = this.getVariantEffectTemplate();
//    	//sort by consequenceTypeObo
//    	data.sort(function(a,b){
//    		if(a.consequenceTypeObo == b.consequenceTypeObo){return 0;}
//    		return (a.consequenceTypeObo < b.consequenceTypeObo) ? -1 : 1;
//    	});
//    	
//    	
//    	var panels = [];
//    	for ( var i = 0; i < data.length; i++) {
//			var transcriptPanel = Ext.create('Ext.container.Container',{
//				padding:5,
//				data:data[i],
//				tpl:tpl
//			});
//			panels.push(transcriptPanel);
//    	}
//		this.effectPanel = Ext.create('Ext.panel.Panel',{
//			title:"Effects ("+i+")",
//			border:false,
//			cls:'panel-border-left',
//			flex:3,    
//			bodyPadding:5,
//			autoScroll:true,
//			items:panels
//		});
//    }
//    return this.effectPanel;
};

VCFVariantInfoWidget.prototype.getHeaderPanel = function(data){
	if(data==""){
		return this.notFoundPanel;
	}
    if(this.headerPanel==null){

		this.headerPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			html:data
		});

    }
    return this.headerPanel;
};

VCFVariantInfoWidget.prototype.getSamplesGrid = function(samplesData,samples,format){
	var sData = samplesData.split("\t").slice(9);
	if(sData.length<=0){
		return this.notFoundPanel;
	}
	var data = new Array(samples.length);
	for ( var i = 0, li = data.length; i < li; i++) {
		data[i] = {id:samples[i],info:sData[i]};
	}
	
    if(this.samplesGrid==null){
    	var groupField = '';
    	var modelName = 'VCF samples';
	    var fields = ["id","info"];
		var columns = [
		                {header : 'Identifier',dataIndex: 'id',flex:1},
		                {header : format,dataIndex: 'info',flex:5}
		             ];
		this.samplesGrid = this.doGrid(columns,fields,modelName,groupField);
		this.samplesGrid.store.loadData(data);
    }
    return this.samplesGrid;
};

VCFVariantInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		_this.dataReceived(data.result);
	});
	var query = this.feature.chromosome+":"+this.feature.start+":"+this.feature.ref+":"+this.feature.alt;
	cellBaseManager.get("genomic","variant", query, "consequence_type");
};

VCFVariantInfoWidget.prototype.dataReceived = function (data){
	this.data = new Object();
	this.data["header"] = this.adapter.header;
	this.data["samples"] = this.adapter.samples;
	this.data["feature"] = this.feature;
	this.data["consequenceType"] = data;
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};

function CellBaseManager(species, args) {
//	console.log(species);
	
	this.host = CELLBASE_HOST;
	this.version = CELLBASE_VERSION;

	this.species = species;
	
	this.category = null;
	this.subcategory = null;

	// commons query params
	this.contentformat = "json";
	this.fileformat = "";
	this.outputcompress = false;
	this.dataType = "script";

	this.query = null;
	this.originalQuery = "";
	this.resource = "";

	this.params = {};
	
	this.async = true;
	
	//Queue of queries
	this.maxQuery = 30;
	this.numberQueries = 0;
	this.results = new Array();
	this.resultsCount = new Array();
	this.batching = false;
	
	
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.async != null){
			this.async = args.async;
		}
	}
	
	
	
	//Events
	this.completed = new Event();
	this.success = new Event();
	this.batchSuccessed = new Event();
	this.error = new Event();

	this.setVersion = function(version){
		this.version = version;
	},
	
	this.setSpecies = function(specie){
		this.species = specie;
	},
	
	this.getVersion = function(){
		return this.version;
	},
	
	this.getSpecies = function(){
		return this.species;
	},
	
	
	
	/** Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation. 
	 * Note that synchronous requests may temporarily lock the browser, disabling any actions while the request is active. **/
	this.setAsync = function(async){
		this.async = async;
	};

	this.getUrl = function() {
		if (this.query != null) {
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/" + this.query+ "/" + this.resource; // + "?contentformat=" + this.contentformat;
		} else {
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/"+ this.resource; // + "?contentformat=" +;
		}

	};

	this.get = function(category, subcategory, query, resource, params, callbackFunction) {
		if(params!=null){
			this.params = params;
		}
//		if(query instanceof Array){
//				this.originalQuery = query;
//				this.batching = true;
//				this.results= new Array();
//				return this.getMultiple(category, subcategory, query, resource);
//		}else{
//				query = new String(query);
//				query = query.replace(/\s/g, "");
//				var querySplitted = query.split(",");
//				this.originalQuery = querySplitted;
//				if (this.maxQuery <querySplitted.length){
//					this.batching = true;
//					this.getMultiple(category, subcategory, querySplitted, resource, callbackFunction);
//				}
//				else{
//					this.batching = false;
//					return this.getSingle(category, subcategory, query, resource, callbackFunction);
//				}
//		}

        if(query != null){
            var querys;
            if(query instanceof Array){
                querys = query;
            }else{
                querys = query.split(',');
            }
            this.originalQuery = querys;
            if(querys.length > 1){
                this.batching = true;
                this.results= new Array();
                return this.getMultiple(category, subcategory, querys, resource);
            }else{
                if (this.maxQuery < querys.length){
                    this.batching = true;
                    this.getMultiple(category, subcategory, querys, resource, callbackFunction);
                } else{
                    this.batching = false;
                    return this.getSingle(category, subcategory, querys[0], resource, callbackFunction);
                }
            }
        }else{
            return this.getSingle(category, subcategory, query, resource, callbackFunction);
        }

	},
//	this.getAllSpecies = function() {
//		
//		//Este código todavía no funciona xq el this._callServer(url) cellBase no tiene una respuesta preparada para this._callServer(url)
//		//es decir, no devuelve jsonp, cuando este todo implementado ya merecerá la pena hacerlo bien
//		var url = this.host + "/" + this.version + "/species";
//		this._callServer(url);
//	},
	this._joinToResults = function(response){
		this.resultsCount.push(true);
		this.results[response.id] = response.data;
		if (this.numberQueries == this.resultsCount.length){
			var result = [];
			
			for (var i = 0; i< this.results.length; i++){
				for (var j = 0; j< this.results[i].length; j++){
					result.push(this.results[i][j]);
				}
			}
			this.success.notify({
				"result": result, 
				"category":  this.category, 
				"subcategory": this.subcategory, 
				"query": this.originalQuery, 
				"resource":this.resource, 
				"params":this.params, 
				"error": ''
			});
		}
	},
	
	this.getSingle = function(category, subcategory, query, resource, batchID, callbackFunction) {
		this.category = category;
		this.subcategory = subcategory;
		this.query = query;
		this.resource = resource;
		var url = this.getUrl();
		return this._callServer(url, batchID, callbackFunction);
	},
	
	this.getMultiple = function(category, subcategory, queryArray, resource, callbackFunction) {
		var pieces = new Array();
		//Primero dividimos el queryArray en trocitos tratables
		if (queryArray.length > this.maxQuery){
			for (var i = 0; i < queryArray.length; i=i+this.maxQuery){
				pieces.push(queryArray.slice(i, i+(this.maxQuery)));
			}
		}else{
			pieces.push(queryArray);
		}
		
		this.numberQueries = pieces.length;
		var _this = this;
		
		this.batchSuccessed.addEventListener(function (evt, response){
			_this._joinToResults(response);
		});	
		
		for (var i = 0; i < pieces.length; i++){
		//	this.get(category, subcategory, pieces[i].toString(), resource);
			this.results.push(new Array());
			this.getSingle(category, subcategory, pieces[i].toString(), resource, i);
		}
	},


	this._callServer = function(url, batchID, callbackFunction) {
		var _this = this;
		this.params["of"] = this.contentformat;
//			jQuery.support.cors = true;
			url = url + this.getQuery(this.params,url);
			console.log(url);
			if(this.async == true){
				$.ajax({
					type : "GET",
					url : url,
                    dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
					async : this.async,
					success : function(data, textStatus, jqXHR) {
//							if(data==""){console.log("data is empty");data="[]";}
//							var jsonResponse = JSON.parse(data);
							var jsonResponse = data;

							if (_this.batching){
								_this.batchSuccessed.notify({data:jsonResponse, id:batchID});
							}else{
								//TODO no siempre el resource coincide con el featureType, ejemplo: mirna es el featureType del resource mirna_targets
								_this.success.notify({
									"result": jsonResponse, 
									"category":  _this.category, 
									"subcategory": _this.subcategory, 
									"query": _this.originalQuery, 
									"resource":_this.resource, 
									"params":_this.params, 
									"error": ''
								});
							}
						
					},
					complete : function() {
						_this.completed.notify();
						
					},
					error : function(jqXHR, textStatus, errorThrown) {
						console.log("CellBaseManager: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
						_this.error.notify();
						
					}
				});
			}else{
				var response = null;
				$.ajax({
					type : "GET",
					url : url,
                    dataType: 'json',
					async : this.async,
					success : function(data, textStatus, jqXHR) {
//							if(data==""){console.log("data is empty");data="[]";}
							var jsonResponse = data;
							response =  {
									"result": jsonResponse,
									"category":  _this.category,
									"subcategory": _this.subcategory,
									"query": _this.originalQuery,
									"resource":_this.resource,
									"params":_this.params,
									"error": ''
							}
					},
					error : function(jqXHR, textStatus, errorThrown) {
					}
				});
				return response;
			}
	};
}

CellBaseManager.prototype.getQuery = function(paramsWS,url){
	var chr = "?";
	if(url.indexOf("?")!=-1){
		chr = "&";
	}
	var query = "";
	for ( var key in paramsWS) {
		if(paramsWS[key]!=null)
			query+=key+"="+paramsWS[key].toString()+"&";
	}
	if(query!="")
		query = chr+query.substring(0, query.length-1);
	return query;
};

function CellBaseAdapter(args){

    _.extend(this, Backbone.Events);

    this.host = null;
	this.gzip = true;


	this.params={};
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.category != null){
			this.category = args.category;
		}
		if(args.subCategory != null){
			this.subCategory = args.subCategory;
		}
		if(args.resource != null){
			this.resource = args.resource;
		}
		if(args.featureCache != null){
			var argsFeatureCache = args.featureCache;
		}
		if(args.params != null){
			this.params = args.params;
		}
		if(args.filters != null){
			this.filters = args.filters;
		}
		if(args.options != null){
			this.options = args.options;
		}
		if(args.featureConfig != null){
			if(args.featureConfig.filters != null){
				this.filtersConfig = args.featureConfig.filters;
			}
			if(args.featureConfig.options != null){
				this.optionsConfig = args.featureConfig.options;
				for(var i = 0; i < this.optionsConfig.length; i++){
					if(this.optionsConfig[i].checked == true){
						this.options[this.optionsConfig[i].name] = true;
						this.params[this.optionsConfig[i].name] = true;
					}				
				}
			}
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
}

CellBaseAdapter.prototype.clearData = function(){
	this.featureCache.clear();
};

CellBaseAdapter.prototype.setFilters = function(filters){
	this.clearData();
	this.filters = filters;
	for(filter in filters){
		var value = filters[filter].toString();
		delete this.params[filter];
		if(value != ""){
			this.params[filter] = value;
		}
	}
};
CellBaseAdapter.prototype.setOption = function(opt, value){
	if(opt.fetch){
		this.clearData();
	}
	this.options[opt.name] = value;
	for(option in this.options){
		if(this.options[opt.name] != null){
			this.params[opt.name] = this.options[opt.name];
		}else{
			delete this.params[opt.name];
		}
	}
};


CellBaseAdapter.prototype.getData = function(args){
	var rnd = String.fromCharCode(65+Math.round(Math.random()*10));
	var _this = this;
	//region check
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	this.params["chromosome"] = args.chromosome;
	this.params["resource"] = this.resource;
	
	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	
	var dataType = "data";
	if(args.transcript){
		dataType = "withTranscripts";
	}
	if(args.histogram){
		dataType = "histogram"+args.interval;
	}

	this.params["dataType"] = dataType;
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);
	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][dataType] == null) {
			chunks.push(i);
		}else{
			var item = this.featureCache.getFeatureChunk(key);
			itemList.push(item);
		}
	}
	
	//CellBase data process
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
	cellBaseManager.success.addEventListener(function(sender,data){
		var dataType = "data";
		if(data.params.transcript){
			dataType = "withTranscripts";
		}
		if(data.params.histogram){
			dataType = "histogram"+data.params.interval;
		}

		//XXX quitar cuando este arreglado el ws
		if(data.params.histogram == true){
			data.result = [data.result];
		}

        var featureType = data.resource;
		//XXX
		
		var queryList = [];
		for(var i = 0; i < data.query.length; i++) {
			var splitDots = data.query[i].split(":");
			var splitDash = splitDots[1].split("-");
			queryList.push({chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]});
		}
		
		for(var i = 0; i < data.result.length; i++) {
			
			//Check if is a single object
			if(data.result[i].constructor != Array){
				data.result[i] = [data.result[i]];
			}

			if(data.params.histogram != true && featureType == "gene" && data.params.transcript==true){
				for ( var j = 0, lenj = data.result[i].length; j < lenj; j++) {
					for (var t = 0, lent = data.result[i][j].transcripts.length; t < lent; t++){
						data.result[i][j].transcripts[t].featureType = "transcript";
						//loop over exons
						for (var e = 0, lene = data.result[i][j].transcripts[t].exons.length; e < lene; e++){
							data.result[i][j].transcripts[t].exons[e].featureType = "exon";
						}
					}
				}
			}

            if(featureType == "regulatory"){
                featureType = data.params.type;
                if(featureType == 'TF_binding_site_motif'){
                    featureType = 'tfbs';
                }
            }

			console.time(_this.resource+" save "+rnd);
			_this.featureCache.putFeaturesByRegion(data.result[i], queryList[i], featureType, dataType);
			var items = _this.featureCache.getFeatureChunksByRegion(queryList[i]);
			console.timeEnd(_this.resource+" save "+rnd);
			if(items != null){
				itemList = itemList.concat(items);
			}
		}
		if(itemList.length > 0){
			_this.trigger('data:ready',{items:itemList, params:_this.params, cached:false, sender:_this});
		}
		console.timeEnd(_this.resource+" get and save "+rnd);
	});

	var querys = [];
	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){
//		console.log(chunks);
		
		for ( var i = 0; i < chunks.length; i++) {
			
			if(updateStart){
				var chunkStart = parseInt(chunks[i] * this.featureCache.chunkSize);
				updateStart = false;
			}
			if(updateEnd){
				var chunkEnd = parseInt((chunks[i] * this.featureCache.chunkSize) + this.featureCache.chunkSize-1);
				updateEnd = false;
			}
			
			if(chunks[i+1]!=null){
				if(chunks[i]+1==chunks[i+1]){
					updateEnd =true;
				}else{
					var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
					querys.push(query);
					updateStart = true;
					updateEnd = true;
				}
			}else{
				var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
				querys.push(query);
				updateStart = true;
				updateEnd = true;
			}
		}
//		console.log(querys);
		console.time(_this.resource+" get and save "+rnd);
		cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
	}else{
		if(itemList.length > 0){
            _this.trigger('data:ready',{items:itemList, params:this.params, sender:this});
		}
	}
};

function SequenceAdapter(args){

    _.extend(this, Backbone.Events);

	this.host = null;
	this.gzip = true;
	
	this.params={};
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.category != null){
			this.category = args.category;
		}
		if(args.subCategory != null){
			this.subCategory = args.subCategory;
		}
		if(args.resource != null){
			this.resource = args.resource;
		}
		if(args.featureCache != null){
			var argsFeatureCache = args.featureCache;
		}
		if(args.params != null){
			this.params = args.params;
		}
	}
	this.onGetData = new Event();
	this.sequence = {};
	this.phastCons = {};
	this.phylop = {};
	this.start = {};
	this.end = {};
}

SequenceAdapter.prototype.clearData = function(){
	this.sequence = {};
	this.start = {};
	this.end = {};
};

SequenceAdapter.prototype.getData = function(args){
	var _this = this;
	this.sender = args.sender;
	var chromosome = args.chromosome;

	if(args.start<1){
		args.start=1;
	}
    if(args.end<1){
        args.end=1;
    }
	if(args.end>300000000){
		args.end=300000000;
	}

	//clean when the new position is too far from current
	if(args.start<this.start[chromosome]-5000 || args.end > this.end[chromosome]+5000){
		this.clearData();
	}
	
	//region check
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	this.params["chromosome"] = args.chromosome;
	this.params["resource"] = this.resource;

	

	//console.log("--------------------------------------------------------------------"+this.start[chromosome]+" "+this.end[chromosome]);
	//console.log("--------------------------------------------------------------------"+args.start+" "+args.end);

	var queryString = this._getSequenceQuery(args);

	if(queryString != ""){
		var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
//
		cellBaseManager.success.addEventListener(function(sender,data){
			_this._processSequenceQuery(data,true);
		});
	
		cellBaseManager.get(this.category, this.subCategory, queryString, this.resource, this.params);
	}else{
		if(this.sender != "move"){
			this.onGetData.notify({
                items:{
                    sequence:this.sequence[chromosome],
                    phastCons:this.phastCons[chromosome],
                    phylop:this.phylop[chromosome],
                    start:this.start[chromosome],
                    end:this.end[chromosome]
                },
                params:this.params
            });
            this.trigger('data:ready',{
                items:{
                    sequence:this.sequence[chromosome],
                    phastCons:this.phastCons[chromosome],
                    phylop:this.phylop[chromosome],
                    start:this.start[chromosome],
                    end:this.end[chromosome]
                },
                params:this.params,
                sender:this
            });
		}
	}
	
};

SequenceAdapter.prototype._getSequenceQuery = function(args){
	var _this = this;
	var chromosome = args.chromosome;
	
	var s,e, query, querys = [];
	if(_this.start[chromosome]==null && _this.end[chromosome]==null){
			//args.start -= 100;
			//args.end += 100;
			_this.start[chromosome] = args.start;
			_this.end[chromosome] = args.end;
			s = args.start;
			e = args.end;
			query = chromosome+":"+s+"-"+e;
			querys.push(query);
	}else{
		if(args.start <= _this.start[chromosome]){
			s = args.start;
			e = _this.start[chromosome]-1;
            e = (e<1) ? args.end=1 : e ;
			_this.start[chromosome] = s;
			query = args.chromosome+":"+s+"-"+e;
			querys.push(query);
		}
		if(args.end >= _this.end[chromosome]){
			e = args.end;
			s = _this.end[chromosome]+1;
			_this.end[chromosome] = e;
			query = args.chromosome+":"+s+"-"+e;
			querys.push(query);
		}
	}
	
	//console.log("--------------------------------------------------------------------"+s+" "+e);
	//console.log("--------------------------------------------------------------------"+this.start[args.chromosome]+" "+this.end[args.chromosome]);
	
	return querys.toString();
};

SequenceAdapter.prototype._processSequenceQuery = function(data, throwNotify){
	var _this = this;
	var seqResponse = data.result;
	var params = data.params;
	var chromosome = data.params.chromosome;

	for(var i = 0; i < seqResponse.length; i++){
		var splitDots = data.query[i].split(":");
		var splitDash = splitDots[1].split("-");
		var queryStart = parseInt(splitDash[0]);
		var queryEnd = parseInt(splitDash[1]);
		
		if(this.sequence[chromosome] == null){
			this.sequence[chromosome] = seqResponse[i].sequence;
//			this.phastCons[chromosome] = seqResponse[i].phastCons;
//			this.phylop[chromosome] = seqResponse[i].phylop;
		}else{
			if(queryStart == this.start[chromosome]){
				this.sequence[chromosome] = seqResponse[i].sequence + this.sequence[chromosome];
//				this.phastCons[chromosome] = seqResponse[i].phastCons.concat(this.phastCons[chromosome]);
//				this.phylop[chromosome] = seqResponse[i].phylop.concat(this.phylop[chromosome]);
			}else{
				this.sequence[chromosome] = this.sequence[chromosome] + seqResponse[i].sequence;
//				this.phastCons[chromosome] = this.phastCons[chromosome].concat(seqResponse[i].phastCons);
//				this.phylop[chromosome] = this.phylop[chromosome].concat(seqResponse[i].phylop);
			}
		}

		if(this.sender == "move" && throwNotify == true){
			this.onGetData.notify({
                items:{
                    sequence:seqResponse[i].sequence,
                    phastCons:seqResponse[i].phastCons,
                    phylop:seqResponse[i].phylop,
                    start:queryStart,
                    end:queryEnd
                },
                params:params
            });
            this.trigger('data:ready',{
                items:{
                    sequence:seqResponse[i].sequence,
                    phastCons:seqResponse[i].phastCons,
                    phylop:seqResponse[i].phylop,
                    start:queryStart,
                    end:queryEnd
                },
                params:params,
                sender:this
            });
		}
	}
	//if not onMove the svg was cleared so all sequence is sent to redraw
	if(this.sender != "move" && throwNotify == true){
		this.onGetData.notify({
            items:{
                sequence:this.sequence[chromosome],
                phastCons:this.phastCons[chromosome],
                phylop:this.phylop[chromosome],
                start:this.start[chromosome],
                end:this.end[chromosome]
            },
            params:params
        });
        this.trigger('data:ready',{
            items:{
                sequence:this.sequence[chromosome],
                phastCons:this.phastCons[chromosome],
                phylop:this.phylop[chromosome],
                start:this.start[chromosome],
                end:this.end[chromosome]
            },
            params:params,
            sender:this
        });
	}
};

// DEPRECATED Used by bam to get the mutations
//SequenceAdapter.prototype.getDiffString = function(args){
	//var _this=this;
	//var queryString = this._getSequenceQuery(args);
	//var chromosome = args.chromosome;
	//
	//if(queryString != ""){
		//var cellBaseManager = new CellBaseManager(this.species,{host: this.host, async:false});
		//var data = cellBaseManager.get(this.category, this.subCategory, queryString, this.resource, this.params);
		//_this._processSequenceQuery(data);
	//}
		///*now the needed sequence is on the cache*/
		//
	//var referenceSubStr = this.sequence[chromosome].substr(args.start-this.start[chromosome],args.read.length);
//
	//resultStr = "";
	//for(var i = 0; i < args.read.length; i++){
		//if(args.read.charAt(i) == referenceSubStr.charAt(i)){
			//resultStr+=" ";
		//}else{
			//resultStr+=args.read.charAt(i);
		//}
	//}
	//return resultStr;
//};

//Used by bam to get the mutations
SequenceAdapter.prototype.getNucleotidByPosition = function(args){
	var _this=this;
    if(args.start > 0 && args.end>0){
        var queryString = this._getSequenceQuery(args);

        var chromosome = args.chromosome;

        if(queryString != ""){
            var cellBaseManager = new CellBaseManager(this.species,{host: this.host, async:false});
            var data = cellBaseManager.get(this.category, this.subCategory, queryString, this.resource, this.params);
            _this._processSequenceQuery(data);
        }
        if(this.sequence[chromosome] != null){
            var referenceSubStr = this.sequence[chromosome].substr((args.start-this.start[chromosome]),1);
            return referenceSubStr;
        }else{
            console.log("SequenceRender: this.sequence[chromosome] is undefined");
            return "";
        }
    }
};

function Region(args) {

    this.chromosome = null;
    this.start = null;
    this.end = null;

    if (typeof args != 'undefined') {
        this.chromosome = args.chromosome || this.chromosome;
        this.start = args.start || this.start;
        this.end = args.end || this.end;

        if (args.str != null) {
            this.parse(args.str);
        }
    }
}

Region.prototype = {
    load : function (obj) {
        this.chromosome = obj.chromosome || this.chromosome;
        this.start = obj.start || this.start;
        this.end = obj.end || this.end;
    },

    parse: function (str) {
        var splitDots = str.split(":");
        if (splitDots.length == 2) {
            var splitDash = splitDots[1].split("-");
            this.chromosome = splitDots[0];
            this.start = parseInt(splitDash[0]);
            if (splitDash.length == 2) {
                this.end = parseInt(splitDash[1]);
            } else {
                this.end = this.start;
            }
        }
    },

    center : function () {
        return this.start + Math.floor((this.length()) / 2);
    },

    length : function () {
        return this.end - this.start + 1;
    },

    toString : function (formated) {
        var str;
        if (formated == true) {
            str = this.chromosome + ":" + Utils.formatNumber(this.start) + "-" + Utils.formatNumber(this.end);
        } else {
            str = this.chromosome + ":" + this.start + "-" + this.end;
        }
        return str;
    }
};



/**
 * A binary search tree implementation in JavaScript. This implementation
 * does not allow duplicate values to be inserted into the tree, ensuring
 * that there is just one instance of each value.
 * @class BinarySearchTree
 * @constructor
 */
function FeatureBinarySearchTree() {
    
    /**
     * Pointer to root node in the tree.
     * @property _root
     * @type Object
     * @private
     */
    this._root = null;
}

FeatureBinarySearchTree.prototype = {

    //restore constructor
    constructor: FeatureBinarySearchTree,
    
    //-------------------------------------------------------------------------
    // Private members
    //-------------------------------------------------------------------------
    
    /**
     * Appends some data to the appropriate point in the tree. If there are no
     * nodes in the tree, the data becomes the root. If there are other nodes
     * in the tree, then the tree must be traversed to find the correct spot
     * for insertion. 
     * @param {variant} value The data to add to the list.
     * @return {Void}
     * @method add
     */
    add: function (v){
        //create a new item object, place data in
        var node = { 
                value: v, 
                left: null,
                right: null 
            },
            
            //used to traverse the structure
            current;
    
        //special case: no items in the tree yet
        if (this._root === null){
            this._root = node;
            return true;
        } 
        	//else
            current = this._root;
            
            while(true){
            
                //if the new value is less than this node's value, go left
                if (node.value.end < current.value.start){
                
                    //if there's no left, then the new node belongs there
                    if (current.left === null){
                        current.left = node;
                        return true;
//                        break;
                    } 
                    	//else                  
                        current = current.left;
                    
                //if the new value is greater than this node's value, go right
                } else if (node.value.start > current.value.end){
                
                    //if there's no right, then the new node belongs there
                    if (current.right === null){
                        current.right = node;
                        return true;
//                        break;
                    } 
                    	//else
                        current = current.right;
 
                //if the new value is equal to the current one, just ignore
                } else {
                	return false;
//                    break;
                }
            }        
        
    },
    
    contains: function (v){
        var node = { 
                value: v, 
                left: null,
                right: null 
            },
    	found = false,
    	current = this._root;
          
      //make sure there's a node to search
      while(!found && current){
      
          //if the value is less than the current node's, go left
          if (node.value.end < current.value.start){
              current = current.left;
              
          //if the value is greater than the current node's, go right
          } else if (node.value.start > current.value.end){
              current = current.right;
              
          //values are equal, found it!
          } else {
              found = true;
          }
      }
      
      //only proceed if the node was found
      return found;   
        
    }
};
function FeatureCache(args) {
	this.args = args;
	this.id = Math.round(Math.random() * 10000000); // internal id for this class

	this.chunkSize = 50000;
	this.gzip = true;
	this.maxSize = 10*1024*1024;
	this.size = 0;
	
	if (args != null){
		if(args.chunkSize != null){
			this.chunkSize = args.chunkSize;
		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	
	this.cache = {};
	this.chunksDisplayed = {};
	
	this.maxFeaturesInterval = 0;
	
	//XXX
	this.gzip = false;
};

FeatureCache.prototype._getChunk = function(position){
	return Math.floor(position/this.chunkSize);
};

FeatureCache.prototype.getChunkRegion = function(region){
	start = this._getChunk(region.start) * this.chunkSize;
	end = (this._getChunk(region.end) * this.chunkSize) + this.chunkSize-1;
	return {start:start,end:end};
};

FeatureCache.prototype.getFirstFeature = function(){
	var feature;
	if(this.gzip) {
		feature = JSON.parse(RawDeflate.inflate(this.cache[Object.keys(this.cache)[0]].data[0]));
	}else{
		feature = this.cache[Object.keys(this.cache)[0]].data[0];
	}
	return feature;
};


//new 
FeatureCache.prototype.getFeatureChunk = function(key){
	if(this.cache[key] != null) {
		return this.cache[key];
	}
	return null;
};
//new
FeatureCache.prototype.getFeatureChunksByRegion = function(region){
	var firstRegionChunk, lastRegionChunk,  chunks = [], key;
	firstRegionChunk = this._getChunk(region.start);
	lastRegionChunk = this._getChunk(region.end);
	for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
		key = region.chromosome+":"+i;
		// check if this key exists in cache (features from files)
		if(this.cache[key] != null ){
			chunks.push(this.cache[key]);
		}
		
	}
	//if(chunks.length == 0){
		//return null;
	//}
	return chunks;
};


FeatureCache.prototype.putFeaturesByRegion = function(featureDataList, region, featureType, dataType){
	var key, firstRegionChunk, lastRegionChunk, firstChunk, lastChunk, feature, gzipFeature;

	
	//initialize region
	firstRegionChunk = this._getChunk(region.start);
	lastRegionChunk = this._getChunk(region.end);
	for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key]==null){
			this.cache[key] = {};
			this.cache[key].key = key;
		}
		if(this.cache[key][dataType]==null){
			this.cache[key][dataType] = [];
		}
	}
	
	//Check if is a single object
	if(featureDataList.constructor != Array){
		featureDataList = [featureDataList];
	}
	
	//loop over features and set on corresponding chunks
	for(var index = 0, len = featureDataList.length; index<len; index++) {
		feature = featureDataList[index];
		feature.featureType = featureType;
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		
		if(this.gzip) {
			gzipFeature = RawDeflate.deflate(JSON.stringify(feature));
		}else{
			gzipFeature = feature;
		}
		
		for(var i=firstChunk; i<=lastChunk; i++) {
			if(i >= firstRegionChunk && i<= lastRegionChunk){//only if is inside the called region
				key = region.chromosome+":"+i;
				this.cache[key][dataType].push(gzipFeature);
			}
		}
	}
};


//used by BED, GFF, VCF
FeatureCache.prototype.putFeatures = function(featureDataList, dataType){
	var feature, key, firstChunk, lastChunk;

	//Check if is a single object
	if(featureDataList.constructor != Array){
		featureDataList = [featureDataList];
	}

	for(var index = 0, len = featureDataList.length; index<len; index++) {
		feature = featureDataList[index];
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = feature.chromosome+":"+i;
			if(this.cache[key]==null){
				this.cache[key] = [];
				this.cache[key].key = key;
			}
			if(this.cache[key][dataType]==null){
				this.cache[key][dataType] = [];
			}
			if(this.gzip) {
				this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key][dataType].push(feature);
			}

		}
	}
};



FeatureCache.prototype.putChunk = function(key, item){
	this.cache[key] = item;
};

FeatureCache.prototype.getChunk = function(key){
	return this.cache[key];
};

FeatureCache.prototype.putCustom = function(f){
	f(this);
};

FeatureCache.prototype.getCustom = function(f){
	f(this);
};



FeatureCache.prototype.remove = function(region){
	var firstChunk = this._getChunk(region.start);
	var lastChunk = this._getChunk(region.end);
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = region.chromosome+":"+i;
		this.cache[key] = null;
	}
};

FeatureCache.prototype.clear = function(){
		this.size = 0;		
		this.cache = {};
};


//END



//THOSE METHODS ARE NOT USED



/*
FeatureCache.prototype.getFeaturesByChunk = function(key, dataType){
	var features =  [];
	var feature, firstChunk, lastChunk;
	
	if(this.cache[key] != null && this.cache[key][dataType] != null) {
		for ( var i = 0, len = this.cache[key][dataType].length; i < len; i++) {
			if(this.gzip) {
				feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][i]));
			}else{
				feature = this.cache[key][dataType][i];
			}
			
			//check if any feature chunk has been already displayed 
			var displayed = false;
			firstChunk = this._getChunk(feature.start);
			lastChunk = this._getChunk(feature.end);
			for(var f=firstChunk; f<=lastChunk; f++){
				var fkey = feature.chromosome+":"+f;
				if(this.chunksDisplayed[fkey+dataType]==true){
					displayed = true;
					break;
				}
			}
			
			if(!displayed){
				features.push(feature);
				returnNull = false;
			}
		}
		this.chunksDisplayed[key+dataType]=true;
		return features;
	}
	
	return null;
};


FeatureCache.prototype.getFeaturesByRegion = function(region, dataType){
	var firstRegionChunk, lastRegionChunk, firstChunk, lastChunk, features = [], feature, key, returnNull = true, displayed;
	firstRegionChunk = this._getChunk(region.start);
	lastRegionChunk = this._getChunk(region.end);
	for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
		key = region.chromosome+":"+i;
		 //check if this key exists in cache (features from files)
		if(this.cache[key] != null && this.cache[key][dataType] != null){
			for ( var j = 0, len = this.cache[key][dataType].length; j < len; j++) {
				if(this.gzip) {
					try {
						feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][j]));
					} catch (e) {
						//feature es "" 
						console.log(e)
						debugger
						
					}
					
				}else{
					feature = this.cache[key][dataType][j];
				}
				// we only get those features in the region AND check if chunk has been already displayed
				if(feature.end > region.start && feature.start < region.end){

			//		 check displayCheck argument 
					if(region.displayedCheck != false){
				//		check if any feature chunk has been already displayed 
						displayed = false;
						firstChunk = this._getChunk(feature.start);
						lastChunk = this._getChunk(feature.end);
						for(var f=firstChunk; f<=lastChunk; f++){
							var fkey = region.chromosome+":"+f;
							if(this.chunksDisplayed[fkey+dataType]==true){
								displayed = true;
								break;
							}
						}
						
						if(!displayed){
							features.push(feature);
							returnNull = false;
						}
					}else{
						features.push(feature);
						returnNull = false;
					}

					
				}
			}
		}
		 //check displayCheck argument 
		if(region.displayedCheck != false){
			this.chunksDisplayed[key+dataType]=true;//mark chunk as displayed
		}
	}
	if(returnNull){
		return null;
	}else{
		return features;
	}
};
*/




/*

FeatureCache.prototype.putChunk = function(featureDataList, chunkRegion, dataType){
	var feature, key, chunk;
	chunk = this._getChunk(chunkRegion.start);
	key = chunkRegion.chromosome+":"+chunk;

	if(this.cache[key]==null){
		this.cache[key] = [];
	}
	if(this.cache[key][dataType]==null){
		this.cache[key][dataType] = [];
	}

	if(featureDataList.constructor == Object){
		if(this.gzip) {
			this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(featureDataList)));
		}else{
			this.cache[key][dataType].push(featureDataList);
		}
	}else{
		for(var index = 0, len = featureDataList.length; index<len; index++) {
			feature = featureDataList[index];
			if(this.gzip) {
				this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key][dataType].push(feature);
			}
		}
	}
	
};

*/


//NOT USED dev not tested
//FeatureCache.prototype.histogram = function(region, interval){
//
	//var intervals = (region.end-region.start+1)/interval;
	//var intervalList = [];
	//
	//for ( var i = 0; i < intervals; i++) {
		//var featuresInterval = 0;
		//
		//var intervalStart = i*interval;//deberia empezar en 1...
		//var intervalEnd = ((i+1)*interval)-1;
		//
		//var firstChunk = this._getChunk(intervalStart+region.start);
		//var lastChunk = this._getChunk(intervalEnd+region.start);
		//
		//console.log(this.cache);
		//for(var j=firstChunk; j<=lastChunk; j++){
			//var key = region.chromosome+":"+j;
			//console.log(key);
			//console.log(this.cache[key]);
			//for ( var k = 0, len = this.cache[key].length; k < len; k++) {
				//if(this.gzip) {
					//feature = JSON.parse(RawDeflate.inflate(this.cache[key][k]));
				//}else{
					//feature = this.cache[key][k];
				//}
				//if(feature.start > intervalStart && feature.start < intervalEnd);
				//featuresInterval++;
			//}
			//
		//}
		//intervalList[i]=featuresInterval;
		//
		//if(this.maxFeaturesInterval<featuresInterval){
			//this.maxFeaturesInterval = featuresInterval;
		//}
	//}
	//
	//for ( var inter in  intervalList) {
		//intervalList[inter]=intervalList[inter]/this.maxFeaturesInterval;
	//}
//};

function NavigationBar(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("NavigationBar");

    this.species = 'Homo sapiens';
    this.increment = 3;
    this.zoom;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);


    this.availableSpecies = [
        {
            "text": "Mus musculus", "assembly": "GRCm38.p1",
            "region": {"chromosome": "1", "start": 18422009, "end": 18422009},
            "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "X", "Y", "MT"],
            "url": "ftp://ftp.ensembl.org/pub/release-71/"
        },
        {
            "text": "Homo sapiens", "assembly": "GRCh37.p10",
            "region": {"chromosome": "13", "start": 32889599, "end": 32889739},
            "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"],
            "url": "ftp://ftp.ensembl.org/pub/release-71/"
        }
    ];

//    if (typeof args != 'undefined') {
//        this.species = args.species || this.species;
//        if (args.region != null) {
//            this.region.load(args.region);
//        }
//    }

    this.currentChromosomeList = [];

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

NavigationBar.prototype = {

    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        var navgationHtml =
                '<div id="species" class="btn-group">' +
                    '<span class="btn dropdown-toggle  btn-mini" data-toggle="dropdown" href="#"> Species <span class="caret"></span></span>' +
                    '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" id="speciesMenu"></ul>' +
                '</div>' +
                '<div id="chromosomes" class="btn-group">' +
                    '<span class="btn dropdown-toggle  btn-mini" data-toggle="dropdown" > Chromosomes <span class="caret"></span></span>' +
                    '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" id="chromsomeMenu"></ul>' +
                '</div>' +
                '<div id="karyotype" class="btn-group" data-toggle="buttons-checkbox">' +
                    '<span id="karyotypeButton" class="btn btn-mini">Karyotype</span>' +
                '</div>' +
                '<div id="chromosome" class="btn-group" data-toggle="buttons-checkbox">' +
                    '<span id="chromosomeButton" class="btn btn-mini">Chromosome</span>' +
                '</div>' +
                '<div id="region" class="btn-group" data-toggle="buttons-checkbox">' +
                    '<span id="regionButton" class="btn btn-mini">Region</span>' +
                '</div>' +

                '<div id="zoomOut" class="btn-group">' +
                    '<span id="zoomOutButton" class="btn btn-mini"><i class="icon-zoom-out"></i></span>' +
                '</div>' +
                '<div  style="display:inline-block;margin:0px 11px 0px 11px;position:relative;top:2px;font-size:10px">' +
                    '<div id="slider" style="width:120px;"></div>' +
                '</div>' +
                '<div id="zoomIn" class="btn-group">' +
                    '<span id="zoomInButton" class="btn btn-mini"><i class="icon-zoom-in"></i></span>' +
                '</div>' +

                '<div id="location" class="btn-group">' +
                    '<div class="input-append" style="margin:0px">' +
                    '<input class="span2" placeholder="Enter region..." id="regionField" style="height:12px;font-size:12px" type="text">' +
                    '<span class="btn btn-mini" id="goButton">Go!</span>' +
                    '</div>' +
                '</div>' +
                '<div id="movement" class="btn-group">' +
                    '<span id="moveFurtherLeftButton" class="btn btn-mini"><i class="icon-backward"></i></span>' +
                    '<span id="moveLeftButton" class="btn btn-mini"><i class="icon-chevron-left"></i></span>' +
                    '<span id="moveRightButton" class="btn btn-mini"><i class="icon-chevron-right"></i></span>' +
                    '<span id="moveFurtherRightButton" class="btn btn-mini"><i class="icon-forward"></i></span>' +
                '</div>' +
                '<div id="fullScreen" class="btn-group" data-toggle="buttons-checkbox">' +
                    '<span id="fullScreenButton" class="btn btn-mini"><i class="icon-fullscreen"></i></span>' +
                '</div>' +
                '<div id="search" class="btn-group pull-right">' +
                    '<div class="input-append" style="margin:0px">' +
                    '<input id="searchField" class="span2" placeholder="gene, snp..." id="searchField" style="height:12px;font-size:12px;width:80px" type="text">' +
                    '<span class="btn btn-mini" id="searchButton">Search</span>' +
                '</div>' +
                '';


        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="navigation-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);


        this.speciesMenu = $(this.div).find('#speciesMenu');
        this._setSpeciesMenu();
        this.chromsomeMenu = $(this.div).find('#chromsomeMenu');
        this._setChromosomeMenu();


        this.karyotypeButton = $(this.div).find('#karyotypeButton');
        this.chromosomeButton = $(this.div).find('#chromosomeButton');
        this.regionButton = $(this.div).find('#regionButton');
        this.zoomSlider = $(this.div).find( "#slider" );
        this.goButton = $(this.div).find('#goButton');
        this.searchButton = $(this.div).find('#searchButton');
        this.regionField = $(this.div).find('#regionField')[0];
        this.searchField = $(this.div).find('#searchField');
        this.zoomInButton = $(this.div).find('#zoomInButton');
        this.zoomOutButton = $(this.div).find('#zoomOutButton');

        this.moveFurtherLeftButton = $(this.div).find('#moveFurtherLeftButton');
        this.moveFurtherRightButton = $(this.div).find('#moveFurtherRightButton');
        this.moveLeftButton = $(this.div).find('#moveLeftButton');
        this.moveRightButton = $(this.div).find('#moveRightButton');

        this.fullScreenButton = $(this.div).find('#fullScreenButton');

        $(this.karyotypeButton).click(function () {
            var pressed = ($(this).hasClass('active')) ? false : true;
            _this.trigger('karyotype-button:change', {selected: pressed, sender: _this});
        });
        $(this.chromosomeButton).click(function () {
            var pressed = ($(this).hasClass('active')) ? false : true;
            _this.trigger('chromosome-button:change', {selected: pressed, sender: _this});
        });
        $(this.regionButton).click(function () {
            var pressed = ($(this).hasClass('active')) ? false : true;
            _this.trigger('region-button:change', {selected: pressed, sender: _this});
        });

        $(this.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });


        $(this.zoomSlider).slider({
            range: "min",
            value: this.zoom,
            min: 0,
            max: 100,
            step:Number.MIN_VALUE,
            stop: function( event, ui ) {
                _this._handleZoomSlider(ui.value);
            }
        });

        $(this.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });

        $(this.regionField).bind('keypress', function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13) { //Enter keycode
                _this._goRegion($(this).val());
            }
        });
        $(this.goButton).click(function () {
            _this._goRegion($(_this.regionField).val());

        });


        $(this.moveFurtherLeftButton).click(function () {
            _this._handleMoveRegion(10);
        });

        $(this.moveFurtherRightButton).click(function () {
            _this._handleMoveRegion(-10);
        });

        $(this.moveLeftButton).click(function () {
            _this._handleMoveRegion(1);
        });

        $(this.moveRightButton).click(function () {
            _this._handleMoveRegion(-1);
        });

        $(this.fullScreenButton).click(function () {
            var pressed = ($(this).hasClass('active')) ? false : true;
            var elem = $(_this.targetDiv).parent()[0];
            if(pressed){
                Utils.launchFullScreen(elem);
            }else{
                Utils.cancelFullscreen();//no need to pass the dom object;
            }
        });


        $(this.searchButton).click(function () {
            _this._goFeature();
        });


        $(this.searchField).typeahead({
            source:function(query, process){
                process(_this._quickSearch(query));
            },
            minLength:3,
            items:50
        });

        $(this.searchField).bind('keypress', function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13) { //Enter keycode
                _this._goFeature();
            }
        });

        //by default all buttons are pressed
        $(this.karyotypeButton).button('toggle');
        $(this.chromosomeButton).button('toggle');
        $(this.regionButton).button('toggle');

        $(this.regionField).val(this.region.toString());

        this.rendered = true;
    },

    _setChromosomeMenu: function () {
        //find species object
        var list = [];
        for (var species in this.availableSpecies) {
            if (Utils.getSpeciesCode(this.availableSpecies[species].text) === this.species) {
                list = this.availableSpecies[species].chromosomes;
                break;
            }
        }
        this.currentChromosomeList = list;
        //add bootstrap elements to the menu
        for (var i in list) {
            var menuEntry = $('<li><a tabindex="-1">' + list[i] + '</a></li>')[0];
            $(this.chromsomeMenu).append(menuEntry);
            $(menuEntry).click(function () {
                console.log($(this).text());
            });
        }
    },

    _setSpeciesMenu: function () {
        //find species object
        var list = [];
        for (var species in this.availableSpecies) {
            var menuEntry = $('<li><a tabindex="-1">' + this.availableSpecies[species].text + '</a></li>')[0];
            $(this.speciesMenu).append(menuEntry);
            $(menuEntry).click(function () {
                console.log($(this).text());
//                this.trigger('species:change', {species: data, sender: this});
            });
        }
    },

    _goRegion: function (value) {
        var reg = new Region({str: value});
        // Validate chromosome and position
        if (isNaN(reg.start) || reg.start < 0) {
            $(this.regionField).popover('destroy');
            $(this.regionField).popover({
                content:'Bad region format',
                placement:'bottom',
                trigger:'hover'
            });
        } else if (_.indexOf(this.currentChromosomeList, reg.chromosome) == -1 ) {
            $(this.regionField).popover('destroy');
            $(this.regionField).popover({
                content:'Chromosome not found in this species',
                placement:'bottom',
                trigger:'hover'
            });
        } else {
            $(this.regionField).popover('destroy');
            this.region.load(reg);
            this._recalculateZoom();
            this.trigger('region:change', {region: this.region, sender: this});
        }
    },

    _quickSearch: function(query){
        var results = [];
        $.ajax({
//                        url:new CellBaseManager().host+"/latest/"+_this.species+"/feature/id/"+this.getValue()+"/starts_with?of=json",
            url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/feature/id/" + query + "/starts_with?of=json",
            async:false,
            dataType: 'json',
            success: function (data, textStatus, jqXHR) {
                for(var i in data[0]){
                    results.push(data[0][i].displayId);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
        return results;
    },

    _goFeature : function(featureName){
        if (featureName != null) {
            if (featureName.slice(0, "rs".length) == "rs" || featureName.slice(0, "AFFY_".length) == "AFFY_" || featureName.slice(0, "SNP_".length) == "SNP_" || featureName.slice(0, "VAR_".length) == "VAR_" || featureName.slice(0, "CRTAP_".length) == "CRTAP_" || featureName.slice(0, "FKBP10_".length) == "FKBP10_" || featureName.slice(0, "LEPRE1_".length) == "LEPRE1_" || featureName.slice(0, "PPIB_".length) == "PPIB_") {
                this.openSNPListWidget(featureName);
            } else {
                this.openGeneListWidget(featureName);
            }
        }
    },

    _handleZoomOutButton : function(){
        this._handleZoomSlider(Math.max(0,this.zoom-1));
        $(this.zoomSlider).slider( "value",  this.zoom);
    },
    _handleZoomSlider : function(value){
        this.zoom = value;
        this.region.load(this._calculateRegionByZoom());
        $(this.regionField).val(this.region.toString());
        this.trigger('region:change', {region: this.region, sender: this});
    },
    _handleZoomInButton : function(){
        this._handleZoomSlider(Math.min(100,this.zoom+1));
        $(this.zoomSlider).slider( "value",  this.zoom);
    },

    _handleMoveRegion:function(positions){
        var pixelBase = (this.width-this.svgCanvasWidthOffset) / this.region.length();
        var disp = Math.round((positions*10) / pixelBase);
        this.region.start -= disp;
        this.region.end -= disp;
        $(this.regionField).val(this.region.toString());
        this.trigger('region:move', {region: this.region, disp: disp, sender: this});
    },

    setVisible:function(obj){
        for(key in obj){
            var query = $(this.div).find('#'+key);
            if(obj[key]){
                query.css({display:'inline-block'})
            }else{
                query.css({display:'none'})
            }
        }
    },

    setRegion: function (region) {
        this.region.load(region);
        $(this.regionField).val(this.region.toString());
        this._recalculateZoom();
    },

    setWidth: function (width) {
        this.width = width;
        this._recalculateZoom();
    },

    _recalculateZoom: function () {
        this.zoom = this._calculateZoomByRegion();
        $(this.zoomSlider).slider( "value",  this.zoom);
    },

    draw: function () {
        if (!this.rendered) {
            console.info(this.id + ' is not rendered yet');
            return;
        }
        this.on('species:change', function (event) {
            console.log(event.species);
            Ext.getCmp(this.id + "speciesMenuButton").setText(event.species);
//        this.speciesMenu.setText(event.species);
        });

        // Visual components creation, all theses components will be
        // added to the navigation bar below.

//        this.speciesMenu = this._createSpeciesMenu();
//        this.chromosomeMenu = this._createChromosomeMenu();
//        this.karyotypeButton = this._createKaryotypeButton();
//        this.chromosomeButton = this._createChromosomeButton();
//        this.regionButton = this._createRegionButton();
//
//        // ...
//        this.searchComboBox = this._createSearchComboBox();
//        this.fullscreenButton = this._createFullScreenButton();
//
//        var navToolbar = Ext.create('Ext.toolbar.Toolbar', {
//            id: this.id+"navToolbar",
//            renderTo: $(this.div).attr('id'),
//            cls:'nav',
//            region:"north",
//            width:'100%',
//            border: false,
//            height: 35,
////		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
//            items : [
//                {
//                    id: this.id+"speciesMenuButton",
//                    text : 'Species',
//                    menu: this.speciesMenu
//                },
//                {
//                    id: this.id + "chromosomeMenuButton",
//                    text : 'Chromosome',
//                    menu: this.chromosomeMenu
//                },
//                '-',
//                this.karyotypeButton,
//                this.chromosomeButton,
//                this.regionButton,
//                '-',
////		         {
////		        	 id:this.id+"left1posButton",
////		        	 text : '<',
////		        	 margin : '0 0 0 15',
////		        	 handler : function() {
////		        		 _this._handleNavigationBar('<');
////		        	 }
////		         },
//                {
//                    id:this.id+"zoomOutButton",
//                    tooltip:'Zoom out',
//                    iconCls:'icon-zoom-out',
//                    margin : '0 0 0 10',
//                    listeners : {
//                        click:{
//                            fn :function() {
//                                var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
//                                Ext.getCmp(_this.id+'zoomSlider').setValue(current-_this.increment);
//                            }
////		        			 buffer : 300
//                        }
//                    }
//                },
//                this._getZoomSlider(),
//                {
//                    id:this.id+"zoomInButton",
//                    margin:'0 5 0 0',
//                    tooltip:'Zoom in',
//                    iconCls:'icon-zoom-in',
//                    listeners : {
//                        click:{
//                            fn :function() {
//                                var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
//                                Ext.getCmp(_this.id+'zoomSlider').setValue(current+_this.increment);
//                            }
////		        			 buffer : 300
//                        }
//                    }
//                },'-',
////		         {
////		        	 id:this.id+"right1posButton",
////		        	 text : '>',
////		        	 handler : function() {
////		        		 _this._handleNavigationBar('>');
////		        	 }
////		         },
//                {
//                    id:this.id+'positionLabel',
//                    xtype : 'label',
//                    text : 'Position:',
//                    margins : '0 0 0 10'
//                },{
//                    id : this.id+'tbCoordinate',
//                    xtype : 'textfield',
//                    width : 165,
//                    value : this.region.toString(),
//                    listeners:{
//                        specialkey: function(field, e){
//                            if (e.getKey() == e.ENTER) {
//                                _this._handleNavigationBar('Go');
//                            }
//                        }
//                    }
//                },
//                {
//                    id : this.id+'GoButton',
//                    text : 'Go',
//                    handler : function() {
//                        _this._handleNavigationBar('Go');
//                    }
//                },'->',
////		         {
////		        	 id : this.id+'searchLabel',
////		        	 xtype : 'label',
////		        	 text : 'Quick search:',
////		        	 margins : '0 0 0 10'
////		         },
//                this.searchComboBox,
////		         {
////		        	 id : this.id+'quickSearch',
////		        	 xtype : 'textfield',
////		        	 emptyText:'gene, protein, transcript',
////		        	 name : 'field1',
////		        	 listeners:{
////		        		 specialkey: function(field, e){
////		        			 if (e.getKey() == e.ENTER) {
////		        				 _this._handleNavigationBar('GoToGene');
////		        			 }
////		        		 },
////		        		 change: function(){
////		        			 	var str = this.getValue();
////		        			 	if(str.length > 3){
////		        			 		console.log(this.getValue());
////		        			 	}
////					     }
////		        	 }
////		         },
//                {
//                    id : this.id+'GoToGeneButton',
//                    iconCls:'icon-find',
//                    handler : function() {
//                        _this._handleNavigationBar('GoToGene');
//                    }
//                },
//                this.fullscreenButton
//            ]
//        });
//
//        //    return navToolbar;
//        this.setSpeciesMenu({}, this.availableSpecies);
    },

//    _createSpeciesMenu: function () {
//        //items must be added by using  setSpeciesMenu()
//        var speciesMenu = Ext.create('Ext.menu.Menu', {
//            id: this.id + "speciesMenu",
//            margin: '0 0 10 0',
//            floating: true,
//            plain: true,
//            items: []
//        });
//
//        return speciesMenu;
//    },
//
//    getSpeciesMenu: function () {
//        return this.speciesMenu;
//    },

//    //Sets the species buttons in the menu
//    setSpeciesMenu: function (speciesObj, popular) {
//        var _this = this;
//
//        var menu = this.getSpeciesMenu();
//        //Auto generate menu items depending of AVAILABLE_SPECIES config
//        menu.hide();//Hide the menu panel before remove
//        menu.removeAll(); // Remove the old species
//
//        var popularSpecies = [];
//
//        var items;
//        if (typeof popular != 'undefined') {
//            popular.sort(function (a, b) {
//                return a.text.localeCompare(b.text);
//            });
//            items = popular;
//        }
//
//        if (typeof speciesObj.items != 'undefined') {
//            items.push('-');
//            for (var i = 0; i < speciesObj.items.length; i++) {
//                var phylo = speciesObj.items[i];
//                var phyloSpecies = phylo.items;
//                phylo.menu = {items: phyloSpecies};
//                for (var j = 0; j < phyloSpecies.length; j++) {
//                    var species = phyloSpecies[j];
//                    var text = species.text + ' (' + species.assembly + ')';
////            species.id = this.id+text;
//                    species.name = species.text;
//                    species.species = Utils.getSpeciesCode(species.text);
//                    species.text = text;
//                    species.speciesObj = species;
//                    species.iconCls = '';
////            species.icon = 'http://static.ensembl.org/i/species/48/Danio_rerio.png';
//                    species.handler = function (me) {
//                        _this.selectSpecies(me.speciesObj.text);
//                    };
//
//                    if (popular.indexOf(species.name) != -1) {
//                        items.push(species);
//                    }
//                }
//            }
//        }
//
//        menu.add(items);
//    },

//    //Sets the new specie and fires an event
//    selectSpecies: function (data) {
////        this.region.load(data.region);
//        data["sender"] = "setSpecies";
////        this.onRegionChange.notify(data);
//        this.trigger('species:change', {species: data, sender: this});
//    },


//    _createChromosomeMenu: function () {
//        var _this = this;
//        var chrStore = Ext.create('Ext.data.Store', {
//            id: this.id + "chrStore",
//            fields: ["name"],
//            autoLoad: false
//        });
//        /*Chromolendar*/
//        var chrView = Ext.create('Ext.view.View', {
//            id: this.id + "chrView",
//            width: 125,
//            style: 'background-color:#fff',
//            store: chrStore,
//            selModel: {
//                mode: 'SINGLE',
//                listeners: {
//                    selectionchange: function (este, selNodes) {
//                        if (selNodes.length > 0) {
//                            _this.region.chromosome = selNodes[0].data.name;
//                            _this.onRegionChange.notify({sender: "_getChromosomeMenu"});
//// 					_this.setChromosome(selNodes[0].data.name);
//                        }
//                        chromosomeMenu.hide();
//                    }
//                }
//            },
//            cls: 'list',
//            trackOver: true,
//            overItemCls: 'list-item-hover',
//            itemSelector: '.chromosome-item',
//            tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
////	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
//        });
//        /*END chromolendar*/
//
//        var chromosomeMenu = Ext.create('Ext.menu.Menu', {
//            id: this.id + "chromosomeMenu",
//            almacen: chrStore,
//            plain: true,
//            items: [/*{xtype:'textfield', width:125},*/chrView]
////        items:[ //TODO alternative
////            {
////                xtype: 'buttongroup',
////                id:this.id+'chrButtonGroup',
//////                title: 'User options',
////                columns: 5,
////                defaults: {
////                    xtype: 'button',
//////                    scale: 'large',
////                    iconAlign: 'left',
////                    handler:function(){}
////                },
//////                items : [chrView]
//////                items: []
////            }
////        ]
//        });
//        var chromosomeData = [];
//        for (var i = 0; i < this.availableSpecies[1].chromosomes.length; i++) {
//            chromosomeData.push({'name': this.availableSpecies[1].chromosomes[i]});
//        }
//        chrStore.loadData(chromosomeData);
////        this.setChromosomes(this.availableSpecies[1].chromosomes);
//        return chromosomeMenu;
//    },

//    getChromosomeMenu: function () {
//        return this.chromosomeMenu;
//    },
//
//    setChromosomes: function (chromosomes) {
//        var _this = this;
//        var chrStore = Ext.getStore(this.id + "chrStore");
//        var chrView = Ext.getCmp(this.id + "chrView");
//
//        var chromosomeData = [];
//        for (var i = 0; i < chromosomes.length; i++) {
//            chromosomeData.push({'name': chromosomes[i]});
//        }
//        chrStore.loadData(chromosomeData);
//
////	var chrButtonGroup = Ext.getCmp(this.id+"chrButtonGroup");
////        var cellBaseManager = new CellBaseManager(this.species);
////        cellBaseManager.success.addEventListener(function(sender,data){
////            var chromosomeData = [];
////            var chrItems = [];
////            var sortfunction = function(a, b) {
////                var IsNumber = true;
////                for (var i = 0; i < a.length && IsNumber == true; i++) {
////                    if (isNaN(a[i])) {
////                        IsNumber = false;
////                    }
////                }
////                if (!IsNumber) return 1;
////                return (a - b);
////            };
////            data.result.sort(sortfunction);
////            for (var i = 0; i < data.result.length; i++) {
////                chromosomeData.push({'name':data.result[i]});
//////            chrItems.push({text:data.result[i],iconAlign: 'left'});
////            }
////            chrStore.loadData(chromosomeData);
//////        chrButtonGroup.removeAll();
//////        chrButtonGroup.add(chrItems);
//////		chrView.getSelectionModel().select(chrStore.find("name",_this.chromosome));
////        });
////        cellBaseManager.get('feature', 'chromosome', null, 'list');
//    },


//    _createKaryotypeButton: function () {
//        var _this = this;
//        var karyotypeButton = Ext.create('Ext.Button', {
//            id: this.id + "karyotypeButton",
//            text: 'Karyotype',
//            enableToggle: true,
//            pressed: true,
//            toggleHandler: function () {
//                _this.trigger('karyotype-button:change', {selected: this.pressed, sender: _this});
//            }
//        });
//        return karyotypeButton;
//    },
//
//    _createChromosomeButton: function () {
//        var _this = this;
//        var chromosomeButton = Ext.create('Ext.Button', {
//            id: this.id + "ChromosomeButton",
//            text: 'Chromosome',
//            enableToggle: true,
//            pressed: true,
////            overCls: 'custom-button-over',
////            pressedCls: 'custom-button-pressed',
//            toggleHandler: function () {
//                _this.trigger('chromosome-button:change', {selected: this.pressed, sender: _this});
//            }
//        });
//        return chromosomeButton;
//    },
//
//    getKaryotypeButton: function (presses) {
//        return this.karyotypeButton;
//    },
//
//    setKaryotypeToogleButton: function () {
////        this.karyotypeButton.set
//        this.trigger('karyotype-button:change', {selected: this.karyotypeButton.pressed, sender: _this});
//    },
//
//    _createRegionButton: function () {
//        var _this = this;
//        var regionButton = Ext.create('Ext.Button', {
//            id: this.id + "RegionButton",
//            text: 'Region',
//            enableToggle: true,
//            pressed: true,
//            toggleHandler: function () {
//                _this.trigger('region-button:change', {selected: this.pressed, sender: _this});
//            }
//
//        });
//        return regionButton;
//    },

//    _getZoomSlider: function () {
//        var _this = this;
//        if (this._zoomSlider == null) {
//            this._zoomSlider = Ext.create('Ext.slider.Single', {
//                id: this.id + 'zoomSlider',
//                width: 170,
//                maxValue: 100,
//                minValue: 0,
//                value: this.zoom,
//                useTips: true,
//                increment: 1,
//                tipText: function (thumb) {
//                    return Ext.String.format('<b>{0}%</b>', thumb.value);
//                },
//                listeners: {
//                    'change': {
//                        fn: function (slider, newValue) {
//                            _this.zoom = newValue;
//                            _this.region.load(_this._calculateRegionByZoom());
//                            Ext.getCmp(_this.id + 'tbCoordinate').setValue(_this.region.toString());
//                            _this.trigger('region:change', {region: _this.region, sender: _this});
//                        },
//                        buffer: 500
//                    }
//                }
//            });
//        }
//        return this._zoomSlider;
//    },
    _calculateRegionByZoom: function () {
        var zoomBaseLength = (this.width - this.svgCanvasWidthOffset) / Utils.getPixelBaseByZoom(this.zoom);
        var centerPosition = this.region.center();
        var aux = Math.ceil((zoomBaseLength / 2) - 1);
        var start = Math.floor(centerPosition - aux);
        var end = Math.floor(centerPosition + aux);
        return {start: start, end: end};
    },
    _calculateZoomByRegion: function () {
        return Utils.getZoomByPixelBase((this.width - this.svgCanvasWidthOffset) / this.region.length());
    },

//    _createSearchComboBox: function () {
//        var _this = this;
//
//        var searchResults = Ext.create('Ext.data.Store', {
//            fields: ["xrefId", "displayId", "description"]
//        });
//
//        var searchCombo = Ext.create('Ext.form.field.ComboBox', {
//            id: this.id + '-quick-search',
//            displayField: 'displayId',
//            valueField: 'displayId',
//            emptyText: 'gene, snp, ...',
//            hideTrigger: true,
//            fieldLabel: 'Search:',
//            labelWidth: 40,
//            width: 150,
//            store: searchResults,
//            queryMode: 'local',
//            typeAhead: false,
//            autoSelect: false,
//            queryDelay: 500,
//            listeners: {
//                change: function () {
//                    var value = this.getValue();
//                    var min = 2;
//                    if (value && value.substring(0, 3).toUpperCase() == "ENS") {
//                        min = 10;
//                    }
//                    if (value && value.length > min) {
//                        $.ajax({
////                        url:new CellBaseManager().host+"/latest/"+_this.species+"/feature/id/"+this.getValue()+"/starts_with?of=json",
//                            url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/feature/id/" + this.getValue() + "/starts_with?of=json",
//                            success: function (data, textStatus, jqXHR) {
//                                var d = JSON.parse(data);
//                                searchResults.loadData(d[0]);
//                                console.log(searchResults)
//                            },
//                            error: function (jqXHR, textStatus, errorThrown) {
//                                console.log(textStatus);
//                            }
//                        });
//                    }
//                },
//                select: function (field, e) {
//                    _this._handleNavigationBar('GoToGene');
//                }
////			,specialkey: function(field, e){
////				if (e.getKey() == e.ENTER) {
////					_this._handleNavigationBar('GoToGene');
////				}
////			}
//            },
//            tpl: Ext.create('Ext.XTemplate',
//                '<tpl for=".">',
//                '<div class="x-boundlist-item">{displayId} ({displayId})</div>',
//                '</tpl>'
//            )
//        });
//        return searchCombo;
//    },
//
//    _createFullScreenButton: function () {
//        var _this = this;
//        var regionButton = Ext.create('Ext.Button', {
//            id: this.id + "FullScreenButton",
//            text: 'F11',
//            cls: 'x-btn-text-icon',
//            enableToggle: false,
//            toggleHandler: function () {
//                var elem = document.getElementById("genome-viewer");
//                req = elem.requestFullScreen || elem.webkitRequestFullScreen || elem.mozRequestFullScreen;
//                req.call(elem);
////                if (elem.requestFullscreen) {
////                    elem.requestFullscreen();
////                } else if (elem.mozRequestFullScreen) {
////                    elem.mozRequestFullScreen();
////                } else if (elem.webkitRequestFullscreen) {
////                    elem.webkitRequestFullscreen();
////                }
//            }
//
//        });
//        return regionButton;
//    },

    _handleNavigationBar: function (action, args) {
////	var _this = this;
//        if (action == 'OptionMenuClick') {
//            this.genomeWidget.showTranscripts = Ext.getCmp("showTranscriptCB").checked;
//            this.genomeWidgetProperties.setShowTranscripts(Ext.getCmp("showTranscriptCB").checked);
//            this.refreshMasterGenomeViewer();
//        }
////        if (action == 'ZOOM'){
////            this.setZoom(args);
////            this.onRegionChange.notify({sender:"zoom"});
////        }
        if (action == 'GoToGene') {
            var geneName = Ext.getCmp(this.id + 'quickSearch').getValue();
            if (geneName != null) {
                if (geneName.slice(0, "rs".length) == "rs" || geneName.slice(0, "AFFY_".length) == "AFFY_" || geneName.slice(0, "SNP_".length) == "SNP_" || geneName.slice(0, "VAR_".length) == "VAR_" || geneName.slice(0, "CRTAP_".length) == "CRTAP_" || geneName.slice(0, "FKBP10_".length) == "FKBP10_" || geneName.slice(0, "LEPRE1_".length) == "LEPRE1_" || geneName.slice(0, "PPIB_".length) == "PPIB_") {
                    this.openSNPListWidget(geneName);
                } else {
                    this.openGeneListWidget(geneName);
                }
            }
        }
//        if (action == '+'){
////  	var zoom = this.genomeWidgetProperties.getZoom();
//            var zoom = this.zoom;
//            if (zoom < 100){
//                this.setZoom(zoom + this.increment);
//            }
//        }
//        if (action == '-'){
////    	 var zoom = this.genomeWidgetProperties.getZoom();
//            var zoom = this.zoom;
//            if (zoom >= 5){
//                this.setZoom(zoom - this.increment);
//            }
//        }

//        if (action == 'Go') {
//            var value = Ext.getCmp(this.id + 'tbCoordinate').getValue();
//
//            var reg = new Region({str: value});
//
//            // Validate chromosome and position
//            if (isNaN(reg.start) || reg.start < 0) {
//                Ext.getCmp(this.id + 'tbCoordinate').markInvalid("Position must be a positive number");
//            }
//            else if (Ext.getCmp(this.id + "chromosomeMenu").almacen.find("name", reg.chromosome) == -1) {
//                Ext.getCmp(this.id + 'tbCoordinate').markInvalid("Invalid chromosome");
//            }
//            else {
//                this.region.load(reg);
////            this.onRegionChange.notify({sender:"GoButton"});
//                this._recalculateZoom();
//
//                this.trigger('region:change', {region: this.region, sender: this});
//            }
//
//        }
    },
    setSpeciesVisible: function (bool) {
        if (bool) {
            Ext.getCmp(this.id + "speciesMenuButton").show();
        } else {
            Ext.getCmp(this.id + "speciesMenuButton").hide();
        }
    },
    setChromosomeMenuVisible: function (bool) {
        if (bool) {
            Ext.getCmp(this.id + "chromosomeMenuButton").show();
        } else {
            Ext.getCmp(this.id + "chromosomeMenuButton").hide();
        }
    },
    setKaryotypePanelButtonVisible: function (bool) {
        this.karyotypeButton.setVisible(bool);
    },
    setChromosomePanelButtonVisible: function (bool) {
        this.chromosomeButton.setVisible(bool);
    },
    setRegionOverviewPanelButtonVisible: function (bool) {
        this.regionButton.setVisible(bool);
    },
    setRegionTextBoxVisible: function (bool) {
        if (bool) {
            Ext.getCmp(this.id + "positionLabel").show();
            Ext.getCmp(this + "tbCoordinate").show();
            Ext.getCmp(this.id + "GoButton").show();
        } else {
            Ext.getCmp(this.id + "positionLabel").hide();
            Ext.getCmp(this.id + "tbCoordinate").hide();
            Ext.getCmp(this.id + "GoButton").hide();
        }
    },
    setSearchVisible: function (bool) {
        if (bool) {
            this.searchComboBox.show();
            Ext.getCmp(this.id + "GoToGeneButton").show();
        } else {
            this.searchComboBox.hide();
            Ext.getCmp(this.id + "GoToGeneButton").hide();
        }
    },
    setFullScreenButtonVisible: function (bool) {
        this.fullscreenButton.setVisible(bool);
    }

}
function ChromosomePanel(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('ChromosomePanel');

    this.pixelBase;
    this.species = 'hsapiens';
    this.width = 600;
    this.height = 75;

    //set instantiation args, must be last
    _.extend(this, args);

    //set own region object
    this.region = new Region(this.region);


    this.lastChromosome = "";
    this.data;


    if('handlers' in this){
        for(eventName in this.handlers){
            this.on(eventName,this.handlers[eventName]);
        }
    }

    this.rendered=false;
    if(this.autoRender){
        this.render();
    }
};

ChromosomePanel.prototype = {
    show: function () {
        $(this.div).css({display: 'block'});
    },
    hide: function () {
        $(this.div).css({display: 'none'});
    },
    setVisible: function (bool) {
        if(bool) {
            $(this.div).css({display: 'block'});
        }else {
            $(this.div).css({display: 'none'});
        }
    },
    setTitle: function (title) {
        if('titleDiv' in this){
            $(this.titleDiv).html(title);
        }
    },
    setWidth: function (width) {
        this.width = width;
        this.svg.setAttribute("width", width);
        this.tracksViewedRegion = this.width / Utils.getPixelBaseByZoom(this.zoom);
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
        this._drawSvg(this.data);
    },

    render : function(targetId){
        this.targetId = (targetId) ? targetId : this.targetId;
        if($('#' + this.targetId).length < 1){
            console.log('targetId not found in DOM');
            return;
        }
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="chromosome-panel"></div>')[0];
        $(this.targetDiv).append(this.div);

        if ('title' in this && this.title !== '') {
            this.titleDiv = $('<div id="tl-title" class="gv-panel-title unselectable">' + this.title + '</div>')[0];
            $(this.div).append(this.titleDiv);
        }

        this.svg = SVG.init(this.div, {
            "width": this.width,
            "height": this.height
        });
        $(this.div).addClass('unselectable');

        this.colors = {gneg: "white", stalk: "#666666", gvar: "#CCCCCC", gpos25: "silver", gpos33: "lightgrey", gpos50: "gray", gpos66: "dimgray", gpos75: "darkgray", gpos100: "black", gpos: "gray", acen: "blue", clementina: '#ffc967'};
        this.rendered = true;
    },

    draw: function () {
        if(!this.rendered){
            console.info(this.id+' is not rendered yet');
            return;
        }
        var _this = this;

        var sortfunction = function (a, b) {
            return (a.start - b.start);
        };

        console.log('In chromosome-widget: ' + this.region)
        var cellBaseManager = new CellBaseManager(this.species);
        cellBaseManager.success.addEventListener(function (sender, data) {
            _this.data = data.result[0];
            _this.data.cytobands.sort(sortfunction);
            _this._drawSvg(_this.data);
        });
        cellBaseManager.get("feature", "chromosome", this.region.chromosome, "info");
        this.lastChromosome = this.region.chromosome;
    },

    _drawSvg: function (chromosome) {
        var _this = this;
        this.chromosomeLength = chromosome.size;
        _this.pixelBase = (_this.width - 40) / this.chromosomeLength;
        var x = 20;
        var y = 10;
        var firstCentromere = true;

        var offset = 20;
        var centerPosition = _this.region.center();


        /* status string */
        var status = '';

        var pointerPosition = (centerPosition * _this.pixelBase) + offset;

        var group = SVG.addChild(_this.svg, "g", {"cursor": "pointer"});

        //draw chromosome cytobands
        for (var i = 0; i < chromosome.cytobands.length; i++) {
            var cytoband = chromosome.cytobands[i];
            var width = _this.pixelBase * (cytoband.end - cytoband.start);
            var height = 18;
            var color = _this.colors[cytoband.stain];
            if (color == null) color = "purple";
            var middleX = x + width / 2;
            var endY = y + height;

            if (cytoband.stain == "acen") {
                var points = "";
                var middleY = y + height / 2;
                var endX = x + width;
                if (firstCentromere) {
                    points = x + "," + y + " " + middleX + "," + y + " " + endX + "," + middleY + " " + middleX + "," + endY + " " + x + "," + endY;
                    firstCentromere = false;
                } else {
                    points = x + "," + middleY + " " + middleX + "," + y + " " + endX + "," + y + " " + endX + "," + endY + " " + middleX + "," + endY;
                }
                SVG.addChild(group, "polyline", {
                    "points": points,
                    "stroke": "black",
                    "opacity": 0.8,
                    "fill": color
                });
            } else {
                SVG.addChild(group, "rect", {
                    "x": x,
                    "y": y,
                    "width": width,
                    "height": height,
                    "stroke": "black",
                    "opacity": 0.8,
                    "fill": color
                });
            }

            var textY = endY + 2;
            var text = SVG.addChild(group, "text", {
                "x": middleX,
                "y": textY,
                "font-size": 10,
                "transform": "rotate(90, " + middleX + ", " + textY + ")",
                "fill": "black"
            });
            text.textContent = cytoband.name;

            x = x + width;
        }

        $(this.svg).on('mousedown',function (event) {
            status = 'setRegion';
        });

        // selection box, will appear when selection is detected
        var selBox = SVG.addChild(this.svg, "rect", {
            "x": 0,
            "y": 2,
            "stroke-width": "2",
            "stroke": "deepskyblue",
            "opacity": "0.5",
            "fill": "honeydew"
        });


        var positionBoxWidth = _this.region.length() * _this.pixelBase;
        var positionGroup = SVG.addChild(group, 'g');
        this.positionBox = SVG.addChild(positionGroup, 'rect', {
            'x': pointerPosition - (positionBoxWidth / 2),
            'y': 2,
            'width': positionBoxWidth,
            'height': _this.height - 3,
            'stroke': 'orangered',
            'stroke-width': 2,
            'opacity': 0.5,
            'fill': 'navajowhite',
            'cursor': 'move'
        });
        $(this.positionBox).on('mousedown',function (event) {
            status = 'movePositionBox';
        });


        var resizeLeft = SVG.addChild(positionGroup, 'rect', {
            'x': pointerPosition - (positionBoxWidth / 2),
            'y': 2,
            'width': 5,
            'height': _this.height - 3,
            'opacity': 0.5,
            'fill': 'orangered',
            'visibility': 'hidden'
        });
        $(resizeLeft).on('mousedown',function (event) {
            status = 'resizePositionBoxLeft';
        });

        var resizeRight = SVG.addChild(positionGroup, 'rect', {
            'x': positionBoxWidth-5,
            'y': 2,
            'width': 5,
            'height': _this.height - 3,
            'opacity': 0.5,
            'fill': 'orangered',
            'visibility': 'hidden'
        });
        $(resizeRight).on('mousedown',function (event) {
            status = 'resizePositionBoxRight';
        });

        $(this.positionBox).off('mouseenter');
        $(this.positionBox).off('mouseleave');
//        $(this.positionBox).mouseenter(function (event) {
//            if (selectingRegion == false) {
//                overPositionBox = true;
//            }
//        });
//        $(this.positionBox).mouseleave(function (event) {
//            overPositionBox = false;
//        });

        var recalculateResizeControls = function () {
            var postionBoxX = parseInt(_this.positionBox.getAttribute('x'));
            var postionBoxWidth = parseInt(_this.positionBox.getAttribute('width'));
            resizeLeft.setAttribute('x', postionBoxX-5);
            resizeRight.setAttribute('x', (postionBoxX+postionBoxWidth));
            $(resizeLeft).css({"cursor": "ew-resize"});
            $(resizeRight).css({"cursor": "ew-resize"});
        };

        var hideResizeControls = function () {
            resizeLeft.setAttribute('visibility', 'hidden');
            resizeRight.setAttribute('visibility', 'hidden');
        };

        var showResizeControls = function () {
            resizeLeft.setAttribute('visibility', 'visible');
            resizeRight.setAttribute('visibility', 'visible');
        };

        $(positionGroup).mouseenter(function(event){
            recalculateResizeControls();
            showResizeControls();
        });
        $(positionGroup).mouseleave(function(event){
            hideResizeControls();
        });



        /*Remove event listeners*/
        $(this.svg).off('contextmenu');
        $(this.svg).off('mousedown');
        $(this.svg).off('mouseup');
        $(this.svg).off('mousemove');
        $(this.svg).off('mouseleave');

        //Prevent browser context menu
        $(this.svg).contextmenu(function (e) {
            e.preventDefault();
        });
//        var overPositionBox = false;
//        var movingPositionBox = false;
//        var selectingRegion = false;
        var downY, downX, moveX, moveY, lastX, increment;

        $(this.svg).mousedown(function (event) {
            downX = (event.pageX - $(_this.svg).offset().left);
            selBox.setAttribute("x", downX);
            lastX = _this.positionBox.getAttribute("x");
            if(status == ''){
                status = 'setRegion'
            }
            hideResizeControls();
            $(this).mousemove(function (event) {
                moveX = (event.pageX - $(_this.svg).offset().left);
                hideResizeControls();
                switch (status) {
                    case 'resizePositionBoxLeft' :
                        var inc = moveX-downX;
                        var newWidth = parseInt(_this.positionBox.getAttribute("width")) - inc;
                        if(newWidth > 0){
                            _this.positionBox.setAttribute("x", parseInt(_this.positionBox.getAttribute("x"))+inc);
                            _this.positionBox.setAttribute("width",newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'resizePositionBoxRight' :
                        var inc = moveX-downX;
                        var newWidth = parseInt(_this.positionBox.getAttribute("width")) + inc;
                        if(newWidth > 0){
                            _this.positionBox.setAttribute("width",newWidth);
                        }
                        downX = moveX;
                        break;
                    case 'movePositionBox' :
                        var inc = moveX-downX;
//                        var w = _this.positionBox.getAttribute("width");
//                        _this.positionBox.setAttribute("x", moveX - (w / 2));
                        _this.positionBox.setAttribute("x", parseInt(_this.positionBox.getAttribute("x"))+inc);
                        downX = moveX;
                        break;
                    case 'setRegion':
                    case 'selectingRegion' :
                        status = 'selectingRegion';
                        if (moveX < downX) {
                            selBox.setAttribute("x", moveX);
                        }
                        selBox.setAttribute("width", Math.abs(moveX - downX));
                        selBox.setAttribute("height", _this.height - 3);
                        break;
                }

            });
        });


        $(this.svg).mouseup(function (event) {
            $(this).off('mousemove');
            if (downX != null) {

                switch (status) {
                    case 'resizePositionBoxLeft' :
                    case 'resizePositionBoxRight' :
                    case 'movePositionBox' :
                        if (moveX != null) {
                        var w = parseInt(_this.positionBox.getAttribute("width"));
                        var x = parseInt(_this.positionBox.getAttribute("x"));
                        var pixS = x;
                        var pixE = x+w;
                        var bioS = (pixS - offset) / _this.pixelBase;
                        var bioE = (pixE - offset) / _this.pixelBase;
                        _this.region.start = Math.round(bioS);
                        _this.region.end = Math.round(bioE);
                        recalculateResizeControls();
                        showResizeControls();
                        _this.trigger('region:change', {region: _this.region, sender: _this});
                        recalculateResizeControls();
                        showResizeControls();
                        }
                        break;
                    case 'setRegion' :
                        var w = _this.positionBox.getAttribute("width");
                        var pixS = downX - (w / 2);
                        var pixE = downX + (w / 2);
                        var bioS = (pixS - offset) / _this.pixelBase;
                        var bioE = (pixE - offset) / _this.pixelBase;
                        _this.region.start = Math.round(bioS);
                        _this.region.end = Math.round(bioE);

                        _this.positionBox.setAttribute("x", downX - (w / 2));
                        _this.trigger('region:change', {region: _this.region, sender: _this});
                        break;
                    case 'selectingRegion' :
                        var bioS = (downX - offset) / _this.pixelBase;
                        var bioE = (moveX - offset) / _this.pixelBase;
                        _this.region.start = parseInt(Math.min(bioS, bioE));
                        _this.region.end = parseInt(Math.max(bioS, bioE));

                        var w = Math.abs(downX - moveX);
                        _this.positionBox.setAttribute("width", w);
                        _this.positionBox.setAttribute("x", Math.abs((downX + moveX) / 2) - (w / 2));
                        _this.trigger('region:change', {region: _this.region, sender: _this});
                        break;
                }
                status = '';

            }
            selBox.setAttribute("width", 0);
            selBox.setAttribute("height", 0);
            downX = null;
            moveX = null;
            lastX = _this.positionBox.getAttribute("x");
        });
        $(this.svg).mouseleave(function (event) {
            $(this).off('mousemove')
            if (lastX != null) {
                _this.positionBox.setAttribute("x", lastX);
            }
            selBox.setAttribute("width", 0);
            selBox.setAttribute("height", 0);
            downX = null;
            moveX = null;
            lastX = null;
            overPositionBox = false;
            movingPositionBox = false;
            selectingRegion = false;
        });




    },

    setRegion: function (region) {//item.chromosome, item.region
        this.region.load(region);
        var needDraw = false;
//        if (item.species != null) {
//            this.species = item.species;
//            needDraw = true;
//        }
//        if(this.region.chromosome == region.chromosome) {
//            return;
//        }

        if (this.lastChromosome != this.region.chromosome) {
            needDraw = true;
        }


        //recalculate positionBox
        var genomicLength = this.region.length();
        var pixelWidth = genomicLength * this.pixelBase;
        var x = (this.region.start * this.pixelBase) + 20;//20 is the margin
        this.positionBox.setAttribute("x", x);
        this.positionBox.setAttribute("width", pixelWidth);

        if (needDraw) {
//		$(this.svg).empty();
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.firstChild);
            }
            this.draw();
        }
    }



//ChromosomeWidget.prototype.setZoom = function(zoom){
    //this.zoom=zoom;
    //this.tracksViewedRegion = this.width/Utils.getPixelBaseByZoom(this.zoom);
    //var width = this.tracksViewedRegion*this.pixelBase;
    //this.positionBox.setAttribute("width",width);
//
    //var centerPosition = Utils.centerPosition(this.region);
    //var pointerPosition = centerPosition*this.pixelBase+20;
    //this.positionBox.setAttribute("x",pointerPosition-(width/2));
//};
}
function KaryotypePanel(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.id = Utils.genId('KaryotypePanel');

    this.pixelBase;
    this.species = 'hsapiens';
    this.width = 600;
    this.height = 75;

    //set instantiation args, must be last
    _.extend(this, args);

    //set own region object
    this.region = new Region(this.region);

    this.lastSpecies = this.species;

    this.afterRender = new Event();

    this.chromosomeList;
    this.data2;

    if('handlers' in this){
        for(eventName in this.handlers){
            this.on(eventName,this.handlers[eventName]);
        }
    }

    this.rendered=false;
    if(this.autoRender){
        this.render();
    }
};

KaryotypePanel.prototype = {
    show: function () {
        $(this.div).css({display: 'block'});
    },

    hide: function () {
        $(this.div).css({display: 'none'});
    },
    setVisible: function (bool) {
        if(bool) {
            $(this.div).css({display: 'block'});
        }else {
            $(this.div).css({display: 'none'});
        }
    },
    setTitle: function (title) {
        if('titleDiv' in this){
            $(this.titleDiv).html(title);
        }
    },
    setWidth: function(width){
        this.width=width;
        this.svg.setAttribute("width",width);
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
        this._drawSvg(this.chromosomeList,this.data2);
    },

    render : function(targetId){
        this.targetId = (targetId) ? targetId : this.targetId;
        if($('#' + this.targetId).length < 1){
            console.log('targetId not found in DOM');
            return;
        }
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="karyotype-panel"></div>')[0];
        $(this.targetDiv).append(this.div);

        if ('title' in this && this.title !== '') {
            this.titleDiv = $('<div id="tl-title" class="gv-panel-title unselectable">' + this.title + '</div>')[0];
            $(this.div).append(this.titleDiv);
        }

        this.svg = SVG.init(this.div,{
            "width":this.width,
            "height":this.height
        });
        this.markGroup = SVG.addChild(this.svg,"g",{"cursor":"pointer"});
        $(this.div).addClass('unselectable');

        this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};

        this.rendered = true;
    },

    draw: function(){
        if(!this.rendered){
            console.info(this.id+' is not rendered yet');
            return;
        }
        var _this = this;

        var sortfunction = function(a, b) {
            var IsNumber = true;
            for (var i = 0; i < a.name.length && IsNumber == true; i++) {
                if (isNaN(a.name[i])) {
                    IsNumber = false;
                }
            }
            if (!IsNumber) return 1;
            return (a.name - b.name);
        };

        var cellBaseManager = new CellBaseManager(this.species);
        cellBaseManager.success.addEventListener(function(sender,data){
            _this.chromosomeList = data.result;
            _this.chromosomeList.sort(sortfunction);
            _this._drawSvg(_this.chromosomeList);
        });
        cellBaseManager.get('feature', 'chromosome', null , 'all');
    },

    drawKaryotype: function(){
        var _this = this;

        var sortfunction = function(a, b) {
            var IsNumber = true;
            for (var i = 0; i < a.name.length && IsNumber == true; i++) {
                if (isNaN(a.name[i])) {
                    IsNumber = false;
                }
            }
            if (!IsNumber) return 1;
            return (a.name - b.name);
        };

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

        var cellBaseManager = new CellBaseManager(this.species);
        cellBaseManager.success.addEventListener(function(sender,data){
            _this.chromosomeList = data.result;
            _this.chromosomeList.sort(sortfunction);
            _this._drawSvg(_this.chromosomeList);
        });
        cellBaseManager.get('feature', 'chromosome', null , 'all');



    },
    _drawSvg: function(chromosomeList){
        var _this = this;

        var x = 20;
        var xOffset = _this.width/chromosomeList.length;
        var yMargin = 2;

        ///////////
        var biggerChr = 0;
        for(var i=0, len=chromosomeList.length; i<len; i++){
            var size = chromosomeList[i].size;
            if(size > biggerChr){
                biggerChr = size;
            }
        }
        _this.pixelBase = (_this.height - 10) / biggerChr;
        _this.chrOffsetY = {};
        _this.chrOffsetX = {};

        for(var i=0, len=chromosomeList.length; i<len; i++){ //loop over chromosomes
            var chromosome = chromosomeList[i];
//		var chr = chromosome.name;
            var chrSize = chromosome.size * _this.pixelBase;
            var y = yMargin + (biggerChr * _this.pixelBase) - chrSize;
            _this.chrOffsetY[chromosome.name] = y;
            var firstCentromere = true;

            var centerPosition = _this.region.center();
            var pointerPosition = (centerPosition * _this.pixelBase);

            var group = SVG.addChild(_this.svg,"g",{"cursor":"pointer","chr":chromosome.name});
            $(group).click(function(event){
                var chrClicked = this.getAttribute("chr");
//			for ( var k=0, len=chromosomeList.length; k<len; k++) {
//			var offsetX = (event.pageX - $(_this.svg).offset().left);
//			if(offsetX > _this.chrOffsetX[chromosomeList[k]]) chrClicked = chromosomeList[k];
//			}

                var offsetY = (event.pageY - $(_this.svg).offset().top);
//			var offsetY = event.originalEvent.layerY - 3;

                _this.positionBox.setAttribute("x1",_this.chrOffsetX[chrClicked]-10);
                _this.positionBox.setAttribute("x2",_this.chrOffsetX[chrClicked]+23);
                _this.positionBox.setAttribute("y1",offsetY);
                _this.positionBox.setAttribute("y2",offsetY);

                var clickPosition = parseInt((offsetY - _this.chrOffsetY[chrClicked])/_this.pixelBase);
                _this.region.chromosome = chrClicked;
                _this.region.start = clickPosition;
                _this.region.end = clickPosition;

                _this.trigger('region:change', {region: _this.region, sender: _this});
            });

            for ( var j=0, lenJ=chromosome.cytobands.length; j<lenJ; j++){ //loop over chromosome objects
                var cytoband = chromosome.cytobands[j];
                var height = _this.pixelBase * (cytoband.end - cytoband.start);
                var width = 13;

                var color = _this.colors[cytoband.stain];
                if(color == null) color = "purple";

                if(cytoband.stain == "acen"){
                    var points = "";
                    var middleX = x+width/2;
                    var middleY = y+height/2;
                    var endX = x+width;
                    var endY = y+height;
                    if(firstCentromere){
                        points = x+","+y+" "+endX+","+y+" "+endX+","+middleY+" "+middleX+","+endY+" "+x+","+middleY;
                        firstCentromere = false;
                    }else{
                        points = x+","+endY+" "+x+","+middleY+" "+middleX+","+y+" "+endX+","+middleY+" "+endX+","+endY;
                    }
                    SVG.addChild(group,"polyline",{
                        "points":points,
                        "stroke":"black",
                        "opacity":0.8,
                        "fill":color
                    });
                }else{
                    SVG.addChild(group,"rect",{
                        "x":x,
                        "y":y,
                        "width":width,
                        "height":height,
                        "stroke":"grey",
                        "opacity":0.8,
                        "fill":color
                    });
                }

                y += height;
            }
            var text = SVG.addChild(_this.svg,"text",{
                "x":x+1,
                "y":_this.height,
                "font-size":9,
                "fill":"black"
            });
            text.textContent = chromosome.name;

            _this.chrOffsetX[chromosome.name] = x;
            x += xOffset;
        }
        _this.positionBox = SVG.addChild(_this.svg,"line",{
            "x1":_this.chrOffsetX[_this.region.chromosome]-10,
            "y1":pointerPosition + _this.chrOffsetY[_this.region.chromosome],
            "x2":_this.chrOffsetX[_this.region.chromosome]+23,
            "y2":pointerPosition + _this.chrOffsetY[_this.region.chromosome],
            "stroke":"orangered",
            "stroke-width":2,
            "opacity":0.5
        });

        _this.rendered=true;
        _this.afterRender.notify();
    },


    setRegion: function(region){//item.chromosome, item.position, item.species
        this.region.load(region);
        var needDraw = false;
//        if(item.species!=null){
//            this.species = item.species;
//            needDraw = true;
//        }
//        if(item.species==null){
//            this.positionBox.setAttribute("x1",this.chrOffsetX[this.region.chromosome]-10);
//            this.positionBox.setAttribute("x2",this.chrOffsetX[this.region.chromosome]+23);
//        }

        if (this.lastSpecies != this.species) {
            needDraw = true;
            this.lastSpecies = species;
        }

        //recalculate positionBox
        var centerPosition = this.region.center();
        var x = (this.region.start * this.pixelBase) + 20;//20 is the margin
        var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
        this.positionBox.setAttribute("y1", pointerPosition);
        this.positionBox.setAttribute("y2", pointerPosition);

//        if(!isNaN(centerPosition)){
//            if(item.species==null){
//                var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
//                this.positionBox.setAttribute("y1", pointerPosition);
//                this.positionBox.setAttribute("y2", pointerPosition);
//            }
//        }
        if(needDraw){
//		$(this.svg).empty();
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.firstChild);
            }
            this.drawKaryotype();
        }
    },


    updatePositionBox: function(){
        this.positionBox.setAttribute("x1",this.chrOffsetX[this.region.chromosome]-10);
        this.positionBox.setAttribute("x2",this.chrOffsetX[this.region.chromosome]+23);

        var centerPosition = Utils.centerPosition(this.region);
        var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
        this.positionBox.setAttribute("y1",pointerPosition);
        this.positionBox.setAttribute("y2",pointerPosition);
    },

    addMark: function(item){//item.chromosome, item.position
        var _this = this;

        var mark = function (){
            if(_this.region.chromosome!=null && _this.region.start!=null){
                if(_this.chrOffsetX[_this.region.chromosome]!= null){
                    var x1 = _this.chrOffsetX[_this.region.chromosome]-10;
                    var x2 = _this.chrOffsetX[_this.region.chromosome];
                    var y1 = (_this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome]) - 4;
                    var y2 = _this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome];
                    var y3 = (_this.region.start * _this.pixelBase + _this.chrOffsetY[_this.region.chromosome]) + 4;
                    var points = x1+","+y1+" "+x2+","+y2+" "+x1+","+y3+" "+x1+","+y1;
                    SVG.addChild(_this.markGroup,"polyline",{
                        "points":points,
                        "stroke":"black",
                        "opacity":0.8,
                        "fill":"#33FF33"
                    });
                }
            }
        };

        if(this.rendered){
            mark();
        }else{
            this.afterRender.addEventListener(function(sender,data){
                mark();
            });
        }
    },

    unmark: function(){
//	$(this.markGroup).empty();
        while (this.markGroup.firstChild) {
            this.markGroup.removeChild(this.markGroup.firstChild);
        }
    }
}

function TrackListPanel(args) {//parent is a DOM div element
    var _this = this;

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("TrackListPanel");

    this.trackSvgList = [];
    this.swapHash = {};
    this.zoomOffset = 0;//for region overview panel, that will keep zoom higher, 0 by default

    this.parentLayout;
    this.mousePosition;
    this.windowSize;

    this.zoomMultiplier = 1;

    this.fontFamily = 'Source Sans Pro';

    this.height = 0;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);
    this.width -= 18;


    //this region is used to do not modify original region, and will be used by trackSvg
    this.visualRegion = new Region(this.region);

    /********/
    this._setPixelBaseAndZoom();
    /********/

        //Deprecated - SVG structure and events initialization
    this.onWindowSize = new Event();
    this.onMousePosition = new Event();

    if('handlers' in this){
        for(eventName in this.handlers){
            this.on(eventName,this.handlers[eventName]);
        }
    }

    this.rendered = false;
    if(this.autoRender){
        this.render();
    }

};

TrackListPanel.prototype = {

    render:function(targetId){
        this.targetId = (targetId) ? targetId : this.targetId;
        if($('#' + this.targetId).length < 1){
            console.log('targetId not found in DOM');
            return;
        }
        var _this = this;

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="tracklist-panel"></div>')[0];
        $(this.targetDiv).append(this.div);

        if ('title' in this && this.title !== '') {
            var titleDiv = $('<div id="tl-title" class="gv-panel-title unselectable">' + this.title + '</div>')[0];
            $(this.div).append(titleDiv);
        }

        var tlHeaderDiv = $('<div id="tl-header"></div>')[0];

        var panelDiv = $('<div id="tl-panel"></div>')[0];
        $(panelDiv).css({position: 'relative', width:'100%'});


        this.tlTracksDiv = $('<div id="tl-tracks"></div>')[0];
        $(this.tlTracksDiv).css({ position: 'relative', 'z-index': 3});


        $(this.div).append(tlHeaderDiv);
        $(this.div).append(panelDiv);

        $(panelDiv).append(this.tlTracksDiv);


        //Main SVG and his events
        this.svgTop = SVG.init(tlHeaderDiv, {
            "width": this.width,
            "height": 25
        });

        var mid = this.width / 2;

        this.positionText = SVG.addChild(this.svgTop, "text", {
            "x": mid - 30,
            "y": 24,
            "font-size": 12,
            'font-family':_this.fontFamily,
            "fill": "green"
        });
        this.nucleotidText = SVG.addChild(this.svgTop, "text", {
            "x": mid + 35,
            "y": 24,
//        "font-family": "Ubuntu Mono",
            'font-family':_this.fontFamily,
            "font-size": 13
        });
        this.firstPositionText = SVG.addChild(this.svgTop, "text", {
            "x": 0,
            "y": 24,
            "font-size": 12,
            'font-family':_this.fontFamily,
            "fill": "green"
        });
        this.lastPositionText = SVG.addChild(this.svgTop, "text", {
            "x": this.width - 70,
            "y": 24,
            "font-size": 12,
            'font-family':_this.fontFamily,
            "fill": "green"
        });
        this.viewNtsArrow = SVG.addChild(this.svgTop, "rect", {
            "x": 2,
            "y": 6,
            "width": this.width - 4,
            "height": 2,
            "opacity": "0.5",
            "fill": "black"
        });
        this.viewNtsArrowLeft = SVG.addChild(this.svgTop, "polyline", {
            "points": "0,1 2,1 2,13 0,13",
            "opacity": "0.5",
            "fill": "black"
        });
        this.viewNtsArrowRight = SVG.addChild(this.svgTop, "polyline", {
            "points": this.width + ",1 " + (this.width - 2) + ",1 " + (this.width - 2) + ",13 " + this.width + ",13",
            "opacity": "0.5",
            "fill": "black"
        });
        this.windowSize = "Window size: " + this.region.length() + " nts";
        this.viewNtsTextBack = SVG.addChild(this.svgTop, "rect", {
            "x": mid - 40,
            "y": 0,
            "width": this.windowSize.length * 6,
            "height": 13,
            "fill": "white"
        });
        this.viewNtsText = SVG.addChild(this.svgTop, "text", {
            "x": mid - 30,
            "y": 11,
            "font-size": 12,
            'font-family':_this.fontFamily,
            "fill": "black"
        });
        this.viewNtsText.textContent = this.windowSize;
        this._setTextPosition();


        this.centerLine = $('<div id="' + this.id + 'centerLine"></div>')[0];
        $(panelDiv).append(this.centerLine);
        $(this.centerLine).css({
            'z-index': 2,
            'position': 'absolute',
            'left': mid,
            'top': 0,
            'width': this.pixelBase,
            'height': '100%',
            'opacity': 0.5,
            'border': '1px solid orangered',
            'background-color': 'orange'
        });


        this.mouseLine = $('<div id="' + this.id + 'mouseLine"></div>')[0];
        $(panelDiv).append(this.mouseLine);
        $(this.mouseLine).css({
            'z-index': 1,
            'position': 'absolute',
            'left': -20,
            'top': 0,
            'width': this.pixelBase,
            'height': '100%',
            'border': '1px solid lightgray',
            'opacity': 0.7,
            'visibility': 'hidden',
            'background-color': 'gainsboro'
        });

        //allow selection in trackSvgLayoutOverview


        var selBox = $('<div id="' + this.id + 'selBox"></div>')[0];
        $(panelDiv).append(selBox);
        $(selBox).css({
            'z-index': 0,
            'position': 'absolute',
            'left': 0,
            'top': 0,
            'height': '100%',
            'border': '2px solid deepskyblue',
            'opacity': 0.5,
            'visibility': 'hidden',
            'background-color': 'honeydew'
        });

//	if(this.parentLayout==null){

        $(this.div).mousemove(function (event) {
            var centerPosition = _this.region.center();
            var mid = _this.width / 2;
            var mouseLineOffset = _this.pixelBase / 2;
            var offsetX = (event.clientX - $(_this.tlTracksDiv).offset().left);
            var cX = offsetX - mouseLineOffset;
            var rcX = (cX / _this.pixelBase) | 0;
            var pos = (rcX * _this.pixelBase) + mid % _this.pixelBase;
            $(_this.mouseLine).css({'left': pos});
//
            var posOffset = (mid / _this.pixelBase) | 0;
            _this.mousePosition = centerPosition + rcX - posOffset;
            _this.trigger('mousePosition:change',{mousePos: _this.mousePosition, baseHtml: _this.getMousePosition(_this.mousePosition)});
        });


        var downX, moveX;
        $(this.tlTracksDiv).mousedown(function (event) {
            $('html').addClass('unselectable');
//                            $('.qtip').qtip('hide').qtip('disable'); // Hide AND disable all tooltips
            $(_this.mouseLine).css({'visibility': 'hidden'});
            switch (event.which) {
                case 1: //Left mouse button pressed
                    $(this).css({"cursor": "move"});
                    downX = event.clientX;
                    var lastX = 0;
                    $(this).mousemove(function (event) {
                        var newX = (downX - event.clientX) / _this.pixelBase | 0;//truncate always towards zero
                        if (newX != lastX) {
                            var disp = lastX - newX;
                            var centerPosition = _this.region.center();
                            var p = centerPosition - disp;
                            if (p > 0) {//avoid 0 and negative positions
                                _this.region.start -= disp;
                                _this.region.end -= disp;
                                _this._setTextPosition();
                                //						_this.onMove.notify(disp);
                                _this.trigger('region:move', {region: _this.region, disp: disp, sender: _this});
                                _this.trigger('trackRegion:move', {region: _this.region, disp: disp, sender: _this});
                                lastX = newX;
                                _this.setNucleotidPosition(p);
                            }
                        }
                    });

                    break;
                case 2: //Middle mouse button pressed
                    $(selBox).css({'visibility': 'visible'});
                    $(selBox).css({'width': 0});
                    downX = (event.pageX - $(_this.tlTracksDiv).offset().left);
                    $(selBox).css({"left": downX});
                    $(this).mousemove(function (event) {
                        moveX = (event.pageX - $(_this.tlTracksDiv).offset().left);
                        if (moveX < downX) {
                            $(selBox).css({"left": moveX});
                        }
                        $(selBox).css({"width": Math.abs(moveX - downX)});
                    });


                    break;
                case 3: //Right mouse button pressed
                    break;
                default: // other button?
            }


        });

        $(this.tlTracksDiv).mouseup(function (event) {
            $('html').removeClass("unselectable");
            $(this).css({"cursor": "default"});
            $(_this.mouseLine).css({'visibility': 'visible'});
            $(this).off('mousemove');
            switch (event.which) {
                case 1: //Left mouse button pressed

                    break;
                case 2: //Middle mouse button pressed
                    $(selBox).css({'visibility': 'hidden'});
                    $(this).off('mousemove');
                    if (downX != null && moveX != null) {
                        var ss = downX / _this.pixelBase;
                        var ee = moveX / _this.pixelBase;
                        ss += _this.visualRegion.start;
                        ee += _this.visualRegion.start;
                        _this.region.start = parseInt(Math.min(ss, ee));
                        _this.region.end = parseInt(Math.max(ss, ee));
                        _this.trigger('region:change', {region: _this.region, sender: _this});
                        _this.onRegionSelect.notify();
                        moveX = null;
                    } else if(downX != null && moveX == null){
                        var mouseRegion = new Region({chromosome:_this.region.chromosome,start:_this.mousePosition, end:_this.mousePosition})
                        _this.trigger('region:change', {region: mouseRegion, sender: _this});
                    }
                    break;
                case 3: //Right mouse button pressed
                    break;
                default: // other button?
            }

        });

        $(this.tlTracksDiv).mouseleave(function (event) {
            $(this).css({"cursor": "default"});
            $(_this.mouseLine).css({'visibility': 'hidden'});
            $(this).off('mousemove');
            $("body").off('keydown');

            $(selBox).css({'visibility': 'hidden'});
            downX = null;
            moveX = null;
        });

        $(this.tlTracksDiv).mouseenter(function (e) {
//            $('.qtip').qtip('enable'); // To enable them again ;)
            $(_this.mouseLine).css({'visibility': 'visible'});
            $("body").off('keydown');
            enableKeys();
        });

        var enableKeys = function () {
            //keys
            $("body").keydown(function (e) {
                var disp = 0;
                switch (e.keyCode) {
                    case 37://left arrow
                        if (e.ctrlKey) {
                            disp = Math.round(100 / _this.pixelBase);
                        } else {
                            disp = Math.round(10 / _this.pixelBase);
                        }
                        break;
                    case 39://right arrow
                        if (e.ctrlKey) {
                            disp = Math.round(-100 / _this.pixelBase)
                        } else {
                            disp = Math.round(-10 / _this.pixelBase);
                        }
                        break;
                    case 109://minus key
                        if (e.shiftKey) {
                            console.log("zoom out");
                        }
                        break;
                    case 107://plus key
                        if (e.shiftKey) {
                            console.log("zoom in");
                        }
                        break;
                }
                if (disp != 0) {
                    _this.region.start -= disp;
                    _this.region.end -= disp;
                    _this._setTextPosition();
//					_this.onMove.notify(disp);
                    _this.trigger('region:move', {region: _this.region, disp: disp, sender: _this});
                    _this.trigger('trackRegion:move', {region: _this.region, disp: disp, sender: _this});
                }
            });
        };

        this.rendered = true;
    },

    show: function () {
        $(this.div).css({display: 'block'});
    },

    hide: function () {
        $(this.div).css({display: 'none'});
    },
    setVisible: function (bool) {
        if(bool) {
            $(this.div).css({display: 'block'});
        }else {
            $(this.div).css({display: 'none'});
        }
    },
    setTitle: function (title) {
        if('titleDiv' in this){
            $(this.titleDiv).html(title);
        }
    },

    setHeight: function (height) {
//        this.height=Math.max(height,60);
//        $(this.tlTracksDiv).css('height',height);
//        //this.grid.setAttribute("height",height);
//        //this.grid2.setAttribute("height",height);
//        $(this.centerLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
//        $(this.mouseLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
    },

    setWidth: function (width) {
        console.log(width);
        this.width = width - 18;
        var mid = this.width / 2;
        this._setPixelBaseAndZoom();

        $(this.centerLine).css({'left': mid, 'width': this.pixelBase});
        $(this.mouseLine).css({'width': this.pixelBase});

        this.svgTop.setAttribute('width', this.width);
        this.positionText.setAttribute("x", mid - 30);
        this.nucleotidText.setAttribute("x", mid + 35);
        this.lastPositionText.setAttribute("x", this.width - 70);
        this.viewNtsArrow.setAttribute("width", this.width - 4);
        this.viewNtsArrowRight.setAttribute("points", this.width + ",1 " + (this.width - 2) + ",1 " + (this.width - 2) + ",13 " + this.width + ",13");
        this.viewNtsText.setAttribute("x", mid - 30);
        this.viewNtsTextBack.setAttribute("x", mid - 40);
        this.trigger('trackWidth:change', {width: this.width, sender: this})

        this._setTextPosition();
    },

    setZoom: function (zoom) {
//        this.zoom = zoom;
    },

    highlight : function(event){
        this.trigger('trackFeature:highlight', event)
    },


    moveRegion: function (event) {
        this.region.load(event.region);
        this.visualRegion.load(event.region);
        this._setTextPosition();
        this.trigger('trackRegion:move', event);
    },

    setRegion: function (region) {//item.chromosome, item.position, item.species
        var _this = this;
        this.region.load(region);
        this.visualRegion.load(region);
        this._setPixelBaseAndZoom();
        //get pixelbase by Region


        $(this.centerLine).css({'width': this.pixelBase});
        $(this.mouseLine).css({'width': this.pixelBase});

        this.viewNtsText.textContent = "Window size: " + this.region.length() + " nts";
        this.windowSize = this.viewNtsText.textContent;
        this._setTextPosition();
        this.onWindowSize.notify({windowSize: this.viewNtsText.textContent});

//        if (region.species != null) {
//            //check species and modify CellBaseAdapter, clean cache
//            for (i in this.trackSvgList) {
//                if (this.trackSvgList[i].trackData.adapter instanceof CellBaseAdapter ||
//                    this.trackSvgList[i].trackData.adapter instanceof SequenceAdapter
//                    ) {
//                    this.trackSvgList[i].trackData.adapter.species = region.species;
//                    //this.trackSvgList[i].trackData.adapter.featureCache.clear();
//
//                    this.trackSvgList[i].trackData.adapter.clearData();
//                }
//            }
//        }
        this.trigger('trackRegion:change', {region: this.region, sender: this})

        this.nucleotidText.textContent = "";//remove base char, will be drawn later if needed


        /************ Loading ************/
        var checkAllTrackStatus = function (status) {
            for (i in _this.trackSvgList) {
                if (_this.trackSvgList[i].status != status) return false;
            }
            return true;
        };
        var checkStatus = function () {
            if (checkAllTrackStatus('ready')) {
                _this.trigger('tracks:ready',{sender:_this});
            } else {
                setTimeout(checkStatus, 100);
            }
        };
        setTimeout(checkStatus, 10);
        /***************************/
//        this.onRegionChange.notify();

        //this.minRegionRect.setAttribute("width",this.minRectWidth);
        //this.minRegionRect.setAttribute("x",(this.width/2)-(this.minRectWidth/2)+6);
    },

    addTrack: function (track) {
        if(!this.rendered){
            console.info(this.id+' is not rendered yet');
            return;
        }
        var _this = this;
        var i = this.trackSvgList.push(track);
        this.swapHash[track.id] = {index: i - 1, visible: true};

        track.set('pixelBase', this.pixelBase);
        track.set('zoom', this.zoom);
        track.set('region', this.region);
        track.set('width', this.width);

        // Track must be initialized after we have created
        // de DIV element in order to create the elements in the DOM
        track.render(this.tlTracksDiv);

        // Once tack has been initialize we can call draw() function
        track.draw();


        this.on('trackRegion:change', function (event) {
            track.set('pixelBase', _this.pixelBase);
            track.set('zoom', _this.zoom);
            track.set('region', event.region);
            track.draw();
        });

        this.on('trackRegion:move', function (event) {
            track.set('region', event.region);
            track.set('pixelBase', _this.pixelBase);
            track.set('zoom', _this.zoom);
            track.move(event.disp);
        });

        this.on('trackWidth:change', function (event) {
            track.setWidth(event.width);
        });

        this.on('trackFeature:highlight', function (event) {
            var attrName = event.attrName || 'feature_id';
            if ('attrValue' in event) {
                event.attrValue = ($.isArray(event.attrValue)) ? event.attrValue : [event.attrValue];
                for (var key in event.attrValue) {
                    var queryStr = attrName + '~=' + event.attrValue[key];
                    var group = $(track.svgdiv).find('g[' + queryStr + ']')
                    $(group).each(function () {
                        var animation = $(this).find('animate');
                        if(animation.length == 0) {
                            animation = SVG.addChild(this, 'animate', {
                                'attributeName': 'opacity',
                                'attributeType': 'XML',
                                'begin': 'indefinite',
                                'from': '0.0',
                                'to': '1',
                                'begin': '0s',
                                'dur': '0.5s',
                                'repeatCount': '5'
                            });
                        }else {
                            animation = animation[0];
                        }
                        var y = $(group).find('rect').attr("y");
                        $(track.svgdiv).scrollTop(y);
                        animation.beginElement();
                    });
                }
            }
        });
    },

    removeTrack: function (trackId) {
        // first hide the track
        this._hideTrack(trackId);

        var i = this.swapHash[trackId].index;

        // delete listeners
        this.onRegionChange.removeEventListener(this.trackSvgList[i].onRegionChangeIdx);
        this.off('trackRegion:move', this.trackSvgList[i].move);
//        this.onMove.removeEventListener(this.trackSvgList[i].onMoveIdx);

        // delete data
        var track = this.trackSvgList.splice(i, 1)[0];

        delete this.swapHash[trackId];
        //uddate swapHash with correct index after splice
        for (var i = 0; i < this.trackSvgList.length; i++) {
            this.swapHash[this.trackSvgList[i].id].index = i;
        }
        return track;
    },

    restoreTrack: function (trackSvg, index) {
        var _this = this;

        trackSvg.region = this.region;
        trackSvg.zoom = this.zoom;
        trackSvg.pixelBase = this.pixelBase;
        trackSvg.width = this.width;

        var i = this.trackSvgList.push(trackSvg);
        this.swapHash[trackSvg.id] = {index: i - 1, visible: true};
        trackSvg.setY(this.height);
        trackSvg.draw();
        this.setHeight(this.height + trackSvg.getHeight());

        trackSvg.onRegionChangeIdx = this.onRegionChange.addEventListener(trackSvg.regionChange);
        trackSvg.onMoveIdx = this.onMove.addEventListener(trackSvg.move);

        trackSvg.regionChange();

        if (index != null) {
            this.setTrackIndex(trackSvg.id, index);
        }
    },

    _redraw: function () {
        var _this = this;
        var trackSvg = null;
        var lastY = 0;
        for (var i = 0; i < this.trackSvgList.length; i++) {
            trackSvg = this.trackSvgList[i];
            if (this.swapHash[trackSvg.id].visible) {
                trackSvg.main.setAttribute("y", lastY);
                lastY += trackSvg.getHeight();
            }
        }
    },

    //This routine is called when track order is modified
    _reallocateAbove: function (trackId) {
        var i = this.swapHash[trackId].index;
        console.log(i + " wants to move up");
        if (i > 0) {
            var aboveTrack = this.trackSvgList[i - 1];
            var underTrack = this.trackSvgList[i];

            var y = parseInt(aboveTrack.main.getAttribute("y"));
            var h = parseInt(underTrack.main.getAttribute("height"));
            aboveTrack.main.setAttribute("y", y + h);
            underTrack.main.setAttribute("y", y);

            this.trackSvgList[i] = aboveTrack;
            this.trackSvgList[i - 1] = underTrack;
            this.swapHash[aboveTrack.id].index = i;
            this.swapHash[underTrack.id].index = i - 1;
        } else {
            console.log("is at top");
        }
    },

    //This routine is called when track order is modified
    _reallocateUnder: function (trackId) {
        var i = this.swapHash[trackId].index;
        console.log(i + " wants to move down");
        if (i + 1 < this.trackSvgList.length) {
            var aboveTrack = this.trackSvgList[i];
            var underTrack = this.trackSvgList[i + 1];

            var y = parseInt(aboveTrack.main.getAttribute("y"));
            var h = parseInt(underTrack.main.getAttribute("height"));
            aboveTrack.main.setAttribute("y", y + h);
            underTrack.main.setAttribute("y", y);

            this.trackSvgList[i] = underTrack;
            this.trackSvgList[i + 1] = aboveTrack;
            this.swapHash[underTrack.id].index = i;
            this.swapHash[aboveTrack.id].index = i + 1;

        } else {
            console.log("is at bottom");
        }
    },

    setTrackIndex: function (trackId, newIndex) {
        var oldIndex = this.swapHash[trackId].index;

        //remove track from old index
        var track = this.trackSvgList.splice(oldIndex, 1)[0]

        //add track at new Index
        this.trackSvgList.splice(newIndex, 0, track);

        //uddate swapHash with correct index after slice
        for (var i = 0; i < this.trackSvgList.length; i++) {
            this.swapHash[this.trackSvgList[i].id].index = i;
        }
        //update svg coordinates
        this._redraw();
    },

    scrollToTrack: function (trackId) {
        var swapTrack = this.swapHash[trackId];
        if (swapTrack != null) {
            var i = swapTrack.index;
            var track = this.trackSvgList[i];
            $(this.svg).parent().parent().scrollTop(track.main.getAttribute("y"));
        }
    },


    _hideTrack: function (trackMainId) {
        this.swapHash[trackMainId].visible = false;
        var i = this.swapHash[trackMainId].index;
        var track = this.trackSvgList[i];
        this.svg.removeChild(track.main);

        this.setHeight(this.height - track.getHeight());

        this._redraw();
    },

    _showTrack: function (trackMainId) {
        this.swapHash[trackMainId].visible = true;
        var i = this.swapHash[trackMainId].index;
        var track = this.trackSvgList[i];
        this.svg.appendChild(track.main);

        this.setHeight(this.height + track.getHeight());

        this._redraw();
    },

    _setPixelBaseAndZoom: function () {
        this.pixelBase = this.width / this.region.length();
        this.pixelBase = this.pixelBase / this.zoomMultiplier;
        // At maximum zoom a bp is 10px, for each zoom level (5% of zoom)
        // pixels are divided by two.
//        return Math.max(this.pixelBase, (10/Math.pow(2,20)));
        this.pixelBase = Math.max(this.pixelBase, (10 / Math.pow(2, 20)));

        this.halfVirtualBase = (this.width * 3 / 2) / this.pixelBase;
        this.zoom = Utils.getZoomByPixelBase(this.pixelBase);
    },

    _setTextPosition: function () {
        var centerPosition = this.region.center();
        var baseLength = parseInt(this.width / this.pixelBase);//for zoom 100
        var aux = Math.ceil((baseLength / 2) - 1);
        this.visualRegion.start = Math.floor(centerPosition - aux);
        this.visualRegion.end = Math.floor(centerPosition + aux);

        this.positionText.textContent = Utils.formatNumber(centerPosition);
        this.firstPositionText.textContent = Utils.formatNumber(this.visualRegion.start);
        this.lastPositionText.textContent = Utils.formatNumber(this.visualRegion.end);

        this.viewNtsText.textContent = "Window size: " + this.visualRegion.length() + " nts";
        this.viewNtsTextBack.setAttribute("width", this.viewNtsText.textContent.length * 6);
        this.windowSize = this.viewNtsText.textContent;
    },

    getTrackSvgById: function (trackId) {
        if (this.swapHash[trackId] != null) {
            var position = this.swapHash[trackId].index;
            return this.trackSvgList[position];
        }
        return null;
    },

    getMousePosition: function (position) {
        var base = '';
        var colorStyle = '';
        if (position > 0) {
            base = this.getSequenceNucleotid(position);
            colorStyle = 'color:' + SEQUENCE_COLORS[base];
        }
//        this.mouseLine.setAttribute('stroke',SEQUENCE_COLORS[base]);
//        this.mouseLine.setAttribute('fill',SEQUENCE_COLORS[base]);
        return '<span style="font-family: this.fontFamily; font-size:14px;' + colorStyle + '">' + base + '</span>';
    },

    getSequenceNucleotid: function (position) {
        var seqTrack = this.getTrackSvgById(1);
        if (seqTrack != null && this.zoom >= seqTrack.visibleRange.start - this.zoomOffset && this.zoom <= seqTrack.visibleRange.end) {
            return seqTrack.dataAdapter.getNucleotidByPosition({start: position, end: position, chromosome: this.region.chromosome})
        }
        return '';
    },

    setNucleotidPosition: function (position) {
        var base = this.getSequenceNucleotid(position);
        this.nucleotidText.setAttribute("fill", SEQUENCE_COLORS[base]);
        this.nucleotidText.textContent = base;
    }
};
function StatusBar(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("StatusBar");

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);

    this.rendered=false;
    if(this.autoRender){
        this.render();
    }
};

StatusBar.prototype = {
    render: function (targetId) {
        this.targetId = (targetId) ? targetId : this.targetId;
        if($('#' + this.targetId).length < 1){
            console.log('targetId not found in DOM');
            return;
        }
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" class="status" align="right"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.mousePositionDiv = $('<div id="' + this.id + 'position" style="display: inline">&nbsp;</div>')[0];
        $(this.mousePositionDiv).css({
            'margin-left': '5px',
            'margin-right': '5px',
            'font-size':'12px'
        });

        this.versionDiv = $('<div id="' + this.id + 'version" style="display: inline">' + this.version + '</div>')[0];
        $(this.versionDiv).css({
            'margin-left': '5px',
            'margin-right': '5px'
        });


        $(this.div).append(this.mousePositionDiv);
        $(this.div).append(this.versionDiv);

        this.rendered = true;
    },
    setRegion: function (event) {
        $(this.mousePositionDiv).html(Utils.formatNumber(event.region.center()));
    },
    setMousePosition: function (event) {
        $(this.mousePositionDiv).html(event.baseHtml+' '+Utils.formatNumber(event.mousePos));
    }

}
function Track(args) {
    this.width = 200;
    this.height = 200;

    this.labelZoom = -1;
    this.resizable = true;
    this.targetId;
    this.id;
    this.title;
    this.histogramZoom;
    this.transcriptZoom;
    this.height = 100;
    this.visibleRange = {start:0,end:100},
    this.fontFamily = 'Source Sans Pro';

    _.extend(this, args);

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


    this.invalidZoomText;

    this.renderedArea = {};//used for renders to store binary trees

    if('handlers' in this){
        for(eventName in this.handlers){
            this.on(eventName,this.handlers[eventName]);
        }
    }

    this.rendered = false;
    if(this.autoRender){
        this.render();
    }
};

Track.prototype = {

    get: function (attr) {
        return this[attr];
    },

    set: function (attr, value) {
        this[attr] = value;
    },

    setWidth : function(width){
        this.width=width;
        this.main.setAttribute("width",width);
    },
    updateHeight : function(){
        if(!this.histogram){
            var height = Object.keys(this.renderedArea).length * 20;//this must be passed by config, 20 for test
        }else{
            var height = this.height;
        }
        this.main.setAttribute("height",height);
        this.svgCanvasFeatures.setAttribute("height",height);
        this.titlebar.setAttribute("height",height);
    },

    setLoading: function (bool) {
        if (bool) {
            this.svgLoading.setAttribute("visibility", "visible");
            this.status = "rendering";
        } else {
            this.svgLoading.setAttribute("visibility", "hidden");
            this.status = "ready";
        }
    },

    updateHistogramParams: function () {
        if (this.zoom <= this.histogramZoom) {
            this.histogram = true;
            this.histogramLogarithm = true;
            this.histogramMax = 500;
            this.interval = parseInt(5 / this.pixelBase);//server interval limit 512
        } else {
            this.histogram = undefined;
            this.histogramLogarithm = undefined;
            this.histogramMax = undefined;
        }
    },

    cleanSvg : function(filters){//clean
//        console.time("-----------------------------------------empty");
        while (this.svgCanvasFeatures.firstChild) {
            this.svgCanvasFeatures.removeChild(this.svgCanvasFeatures.firstChild);
        }
//        console.timeEnd("-----------------------------------------empty");
        this.chunksDisplayed = {};
        this.renderedArea = {};
    },

    initializeDom: function (targetId) {

        var _this = this;
        var div = $('<div id="' + this.id + '-div"></div>')[0];
        var svgdiv = $('<div id="' + this.id + '-svgdiv"></div>')[0];

        $(targetId).addClass("unselectable");
        $(targetId).append(div);
        $(div).append(svgdiv);

        $(svgdiv).css({
            'z-index': 3,
            'height':this.height,
            'overflow-y': (this.resizable) ? 'scroll' : 'hidden',
            'overflow-x': 'hidden'
        });

        var main = SVG.addChild(svgdiv, "svg", {
            "id": this.id,
            "class": "trackSvg",
            "x": 0,
            "y": 0,
            "width": this.width,
            "height": this.height
        });

        if(this.resizable){
            var resizediv = $('<div id="' + this.id + '-resizediv"></div>')[0];
            $(resizediv).css({'background-color': 'lightgray', 'height': 3, opacity:0.3});

            $(resizediv).mousedown(function (event) {
                $('html').addClass('unselectable');
                event.stopPropagation();
                var downY = event.clientY;
                $('html').mousemove(function (event) {
                    var despY = (event.clientY - downY);
                    var actualHeight = $(svgdiv).outerHeight();
                    $(svgdiv).css({height: actualHeight + despY});
                    downY = event.clientY;
                });
            });
            $('html').mouseup(function (event) {
                $('html').removeClass("unselectable");
                $('html').off('mousemove');
            });



            $(resizediv).mouseenter(function (event) {
                $(this).css({"cursor": "ns-resize"});
                $(this).css({"opacity": 1});
            });
            $(resizediv).mouseleave(function (event) {
                $(this).css({"cursor": "default"});
                $(this).css({"opacity": 0.3});
            });

            $(div).append(resizediv);
        }

        var titleGroup = SVG.addChild(main, "g", {
            "class": "trackTitle"
            //visibility:this.titleVisibility
        });


        var text = this.title;
        var textWidth = 15 + text.length * 6;
        var titlebar = SVG.addChild(titleGroup, "rect", {
            "x": 0,
            "y": 0,
            "width": this.width,
            "height": this.height,
            "opacity": "0.6",
            "fill": "transparent"
        });
        var titleText = SVG.addChild(titleGroup, "text", {
            "x": 4,
            "y": 14,
            "font-size": 14,
            'font-family':_this.fontFamily,
            "opacity": "0.4",
            "fill": "black"
        });
        titleText.textContent = text;

        this.svgCanvasFeatures = SVG.addChild(titleGroup, "svg", {
            "class": "features",
            "x": -this.pixelPosition,
            "width": this.svgCanvasWidth,
            "height": this.height
        });


        this.fnTitleMouseEnter = function () {
            titlebar.setAttribute("opacity", "0.1");
            titlebar.setAttribute("fill", "greenyellow");
            titleText.setAttribute("opacity", "1.0");
        };
        this.fnTitleMouseLeave = function () {
            titlebar.setAttribute("opacity", "0.6");
            titlebar.setAttribute("fill", "transparent");
            titleText.setAttribute("opacity", "0.4");
        };

        $(titleGroup).off("mouseenter");
        $(titleGroup).off("mouseleave");
        $(titleGroup).mouseenter(this.fnTitleMouseEnter);
        $(titleGroup).mouseleave(this.fnTitleMouseLeave);


        this.invalidZoomText = SVG.addChild(titleGroup, "text", {
            "x": 154,
            "y": 18,
            "font-size": 12,
            'font-family':_this.fontFamily,
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

        this.div = div;
        this.svgdiv = svgdiv;

        this.main = main;
        this.titleGroup = titleGroup;
        this.titlebar = titlebar;
        this.titleText = titleText;


        this.rendered = true;
        this.status = "ready";

    },

//    showInfoWidget: function (args) {
//        if (this.dataAdapter.species == "orange") {
//            //data.resource+="orange";
//            if (args.featureType.indexOf("gene") != -1)
//                args.featureType = "geneorange";
//            if (args.featureType.indexOf("transcript") != -1)
//                args.featureType = "transcriptorange";
//        }
//        switch (args.featureType) {
//            case "gene":
//                new GeneInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "geneorange":
//                new GeneOrangeInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "transcriptorange":
//                new TranscriptOrangeInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "transcript":
//                new TranscriptInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "snp" :
//                new SnpInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            case "vcf" :
//                new VCFVariantInfoWidget(null, this.dataAdapter.species).draw(args);
//                break;
//            default:
//                break;
//        }
//    },

    draw: function () {

    }
};
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

FeatureTrack.prototype.render = function(targetId){
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

};

FeatureTrack.prototype.draw = function(){
    var _this = this;

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
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
                histogramLogarithm:this.histogramLogarithm,
                histogramMax:this.histogramMax,
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
                histogramLogarithm:this.histogramLogarithm,
                histogramMax:this.histogramMax,
                interval:this.interval
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
};
GeneTrack.prototype = new Track({});

function GeneTrack(args) {
    Track.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //save default render reference;
    this.defaultRenderer = this.renderer;
    this.histogramRenderer = new HistogramRenderer();


    this.chunksDisplayed = {};


    //set instantiation args, must be last
    _.extend(this, args);

    this.transcript = true;

};

GeneTrack.prototype.render = function (targetId) {
    var _this = this;
    this.initializeDom(targetId);

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2

    this.dataAdapter.on('data:ready', function (event) {
        if (event.params.histogram == true) {
            _this.renderer = _this.histogramRenderer;
        } else {
            _this.renderer = _this.defaultRenderer;
        }
//        _this.setHeight(_this.height - trackSvg.getHeight());//modify height before redraw
        var features = _this._getFeaturesByChunks(event);
        _this.renderer.render(features, {
            svgCanvasFeatures: _this.svgCanvasFeatures,
            featureTypes: _this.featureTypes,
            renderedArea: _this.renderedArea,
            pixelBase: _this.pixelBase,
            position: _this.region.center(),
            width: _this.width,
            zoom: _this.zoom,
            labelZoom: _this.labelZoom,
            pixelPosition: _this.pixelPosition

        });
        _this.updateHeight();
        _this.setLoading(false);
    });

    this.renderer.on('feature:click', function (event) {
        _this.showInfoWidget(event);
    });
};

GeneTrack.prototype.updateTranscriptParams = function () {
    if (this.transcriptZoom <= this.zoom) {
        this.transcript = true;
    } else {
        this.transcript = false;
    }
};

GeneTrack.prototype.draw = function () {
    var _this = this;

    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
    this.svgCanvasLeftLimit = this.region.start - this.svgCanvasOffset * 2;
    this.svgCanvasRightLimit = this.region.start + this.svgCanvasOffset * 2

    this.updateTranscriptParams();
    this.updateHistogramParams();
    this.cleanSvg();
//    setCallRegion();

    if (this.zoom >= this.visibleRange.start && this.zoom <= this.visibleRange.end) {
        this.setLoading(true);
        var data = this.dataAdapter.getData({
            chromosome: this.region.chromosome,
            start: this.region.start - this.svgCanvasOffset * 2,
            end: this.region.end + this.svgCanvasOffset * 2,
            transcript: this.transcript,
            histogram: this.histogram,
            histogramLogarithm: this.histogramLogarithm,
            histogramMax: this.histogramMax,
            interval: this.interval
        });

        this.invalidZoomText.setAttribute("visibility", "hidden");
    } else {
        this.invalidZoomText.setAttribute("visibility", "visible");
    }

};


GeneTrack.prototype.move = function (disp) {
    var _this = this;
//    trackSvg.position = _this.region.center();
    _this.region.center();
    var pixelDisplacement = disp * _this.pixelBase;
    this.pixelPosition -= pixelDisplacement;

    //parseFloat important
    var move = parseFloat(this.svgCanvasFeatures.getAttribute("x")) + pixelDisplacement;
    this.svgCanvasFeatures.setAttribute("x", move);

    var virtualStart = parseInt(this.region.start - this.svgCanvasOffset);
    var virtualEnd = parseInt(this.region.end + this.svgCanvasOffset);
    // check if track is visible in this zoom

//    console.log(virtualStart+'  ----  '+virtualEnd)
//    console.log(this.svgCanvasLeftLimit+'  ----  '+this.svgCanvasRightLimit)
//    console.log(this.svgCanvasOffset)

    if (this.zoom >= this.visibleRange.start && this.zoom <= this.visibleRange.end) {

        if (disp > 0 && virtualStart < this.svgCanvasLeftLimit) {
            console.log('left')
            this.dataAdapter.getData({
                chromosome: _this.region.chromosome,
                start: parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset),
                end: this.svgCanvasLeftLimit,
                transcript: this.transcript,
                histogram: this.histogram,
                histogramLogarithm: this.histogramLogarithm,
                histogramMax: this.histogramMax,
                interval: this.interval
            });
            this.svgCanvasLeftLimit = parseInt(this.svgCanvasLeftLimit - this.svgCanvasOffset);
        }

        if (disp < 0 && virtualEnd > this.svgCanvasRightLimit) {
            console.log('right')
            this.dataAdapter.getData({
                chromosome: _this.region.chromosome,
                start: this.svgCanvasRightLimit,
                end: parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset),
                transcript: this.transcript,
                histogram: this.histogram,
                histogramLogarithm: this.histogramLogarithm,
                histogramMax: this.histogramMax,
                interval: this.interval
            });
            this.svgCanvasRightLimit = parseInt(this.svgCanvasRightLimit + this.svgCanvasOffset);
        }

    }

};

GeneTrack.prototype._getFeaturesByChunks = function (response, filters) {
    //Returns an array avoiding already drawn features in this.chunksDisplayed
    var chunks = response.items;
    var dataType = response.params.dataType;
    var chromosome = response.params.chromosome;
    var features = [];


    var feature, displayed, featureFirstChunk, featureLastChunk, features = [];
    for (var i = 0, leni = chunks.length; i < leni; i++) {
        if (this.chunksDisplayed[chunks[i].key + dataType] != true) {//check if any chunk is already displayed and skip it

            for (var j = 0, lenj = chunks[i][dataType].length; j < lenj; j++) {
                feature = chunks[i][dataType][j];

                //check if any feature has been already displayed by another chunk
                displayed = false;
                featureFirstChunk = this.dataAdapter.featureCache._getChunk(feature.start);
                featureLastChunk = this.dataAdapter.featureCache._getChunk(feature.end);
                for (var f = featureFirstChunk; f <= featureLastChunk; f++) {
                    var fkey = chromosome + ":" + f;
                    if (this.chunksDisplayed[fkey + dataType] == true) {
                        displayed = true;
                        break;
                    }
                }
                if (!displayed) {
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
            this.chunksDisplayed[chunks[i].key + dataType] = true;
        }
    }
    return features;
};

GeneTrack.prototype.showInfoWidget = function (args) {
    switch (args.featureType) {
        case "gene":
            new GeneInfoWidget(null, this.dataAdapter.species).draw(args);
            break;
        case "transcript":
            new TranscriptInfoWidget(null, this.dataAdapter.species).draw(args);
            break;
        default:
            break;
    }
};

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

SequenceTrack.prototype.render = function(targetId){
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
    this.svgCanvasOffset = (this.width * 3 / 2) / this.pixelBase;
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


SequenceTrack.prototype.move = function(disp){
    var _this = this;
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
//Parent class for all renderers
function Renderer(args) {

};

Renderer.prototype = {

    render: function (items) {

    },

    getFeatureX: function (feature, args) {//returns svg feature x value from feature genomic position
        var middle = args.width / 2;
        var x = args.pixelPosition + middle - ((args.position - feature.start) * args.pixelBase);
        return x;
    }
};
//any item with chromosome start end
FeatureRenderer.prototype = new Renderer({});

function FeatureRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //set instantiation args
    _.extend(this, args);

    if('handlers' in this){
        for(eventName in this.handlers){
            this.on(eventName,this.handlers[eventName]);
        }
    }

    this.fontFamily = 'Source Sans Pro';
};


FeatureRenderer.prototype.render = function (features, args) {
    var _this = this;
    var draw = function (feature) {
        //get feature render configuration
        var color = Utils.isFunction(_this.color) ? _this.color(feature) : _this.color;
        var label = Utils.isFunction(_this.label) ? _this.label(feature) : _this.label;
        var height = Utils.isFunction(_this.height) ? _this.height(feature) : _this.height;
        var tooltipTitle = Utils.isFunction(_this.tooltipTitle) ? _this.tooltipTitle(feature) : _this.tooltipTitle;
        var tooltipText = Utils.isFunction(_this.tooltipText) ? _this.tooltipText(feature) : _this.tooltipText;
        var infoWidgetId = Utils.isFunction(_this.infoWidgetId) ? _this.infoWidgetId(feature) : _this.infoWidgetId;

        //get feature genomic information
        var start = feature.start;
        var end = feature.end;
        var length = (end - start) + 1;

        //check genomic length
        length = (length < 0) ? Math.abs(length) : length;
        length = (length == 0) ? 1 : length;

        //transform to pixel position
        var width = length * args.pixelBase;

        //calculate x to draw svg rect
        var x = _this.getFeatureX(feature, args);

        var maxWidth = Math.max(width, 2);
        var textHeight = 0;
        if (args.zoom > args.labelZoom) {
            textHeight = 9;
            maxWidth = Math.max(width, label.length * 8);
        }

        var rowY = 0;
        var textY = textHeight + height;
        var rowHeight = textHeight + height + 2;

        while (true) {
            if (!(rowY in args.renderedArea)) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            var foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});

            if (foundArea) {
                var featureGroup = SVG.addChild(args.svgCanvasFeatures, "g", {'feature_id': feature.id});
                var rect = SVG.addChild(featureGroup, "rect", {
                    'x': x,
                    'y': rowY,
                    'width': width,
                    'height': height,
                    'stroke': '#3B0B0B',
                    'stroke-width': 1,
                    'stroke-opacity': 0.7,
                    'fill': color,
                    'cursor': 'pointer'
                });
                if (args.zoom > args.labelZoom) {
                    var text = SVG.addChild(featureGroup, "text", {
                        'i': i,
                        'x': x,
                        'y': textY,
                        'font-size': 12,
                        'font-family': _this.fontFamily,
                        'font-weight': 400,
                        'opacity': null,
                        'fill': 'black',
                        'cursor': 'pointer'
                    });
                    text.textContent = label;
                }

                if('tooltipText' in _this ){
                    $(featureGroup).qtip({
                        content: {text: tooltipText, title: tooltipTitle},
                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
                        style: { width: true,  classes: 'ui-tooltip ui-tooltip-shadow'}
                    });
                }

                $(featureGroup).mouseover(function (event) {
                    _this.trigger('feature:mouseover', {query: feature[infoWidgetId], feature: feature, featureType: feature.featureType})
                });

                $(featureGroup).click(function (event) {
                    _this.trigger('feature:click', {query: feature[infoWidgetId], feature: feature, featureType: feature.featureType})
                });
                break;
            }
            rowY += rowHeight;
            textY += rowHeight;
        }
    };

    //process features
    for (var i = 0, leni = features.length; i < leni; i++) {
        draw(features[i]);
    }
};

//any item with chromosome start end
GeneRenderer.prototype = new Renderer({});

function GeneRenderer(args) {
    Renderer.call(this, args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //set instantiation args
    _.extend(this, args);

    if ('at' in this) {
        for (eventName in this.at) {
            this.on(eventName, this.at[eventName]);
        }
    }

    this.fontFamily = 'Source Sans Pro';
};


GeneRenderer.prototype.render = function (features, args) {
    var _this = this;
    var draw = function (feature) {
        //get feature render configuration
        var settings = _this.featureConfig[feature.featureType];
        var color = settings.getColor(feature);

        //get feature genomic information
        var start = feature.start;
        var end = feature.end;
        var length = (end - start) + 1;

        //transform to pixel position
        var width = length * args.pixelBase;

        //calculate x to draw svg rect
        var x = _this.getFeatureX(feature, args);

        var maxWidth = Math.max(width, 2);
        var textHeight = 0;
        if (args.zoom > args.labelZoom) {
            textHeight = 9;
            maxWidth = Math.max(width, settings.getLabel(feature).length * 8);
        }

        var rowY = 0;
        var textY = textHeight + settings.height + 1;
        var rowHeight = textHeight + settings.height + 5;

        while (true) {
            if (!(rowY in args.renderedArea)) {
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }

            var foundArea;//if true, i can paint

            //check if gene transcripts can be painted
            var checkRowY = rowY;
            if (feature.transcripts != null) {
                for (var i = 0, leni = feature.transcripts.length + 1; i < leni; i++) {
                    if (!(checkRowY in args.renderedArea)) {
                        args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                    }
                    foundArea = !args.renderedArea[checkRowY].contains({start: x, end: x + maxWidth - 1});
                    if (foundArea == false) {
                        break;
                    }
                    checkRowY += rowHeight;
                }
            } else {
                foundArea = args.renderedArea[rowY].add({start: x, end: x + maxWidth - 1});
            }

            if (foundArea) {//paint genes
                var rect = SVG.addChild(args.svgCanvasFeatures, 'rect', {
                    'x': x,
                    'y': rowY,
                    'width': width,
                    'height': settings.height,
                    'stroke': '#3B0B0B',
                    'stroke-width': 0.5,
                    'fill': color,
                    'cursor': 'pointer',
                    'feature_id': feature.id
                });

                var text = SVG.addChild(args.svgCanvasFeatures, 'text', {
                    'i': i,
                    'x': x,
                    'y': textY,
                    'font-size': 12,
                    'font-family': _this.fontFamily,
                    'fill': 'black',
                    'cursor': 'pointer'
                });
                text.textContent = settings.getLabel(feature);

                $([rect, text]).qtip({
                    content: {text: settings.getTipText(feature), title: settings.getTipTitle(feature)},
                    position: {target: "mouse", adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                    style: { width: true, classes: 'ui-tooltip ui-tooltip-shadow'}
                });

                $([rect, text]).click(function (event) {
                    var settings = _this.featureConfig[feature.featureType];
                    _this.trigger('feature:click', {query: feature[settings.infoWidgetId], feature: feature, featureType: feature.featureType});
                });


                //paint transcripts
                var checkRowY = rowY + rowHeight;
                var checkTextY = textY + rowHeight;
                if (feature.transcripts != null) {
                    for (var i = 0, leni = feature.transcripts.length; i < leni; i++) { /*Loop over transcripts*/
                        if (!(checkRowY in args.renderedArea)) {
                            args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                        }
                        var transcript = feature.transcripts[i];
                        var transcriptX = _this.getFeatureX(transcript, args);
                        var transcriptWidth = (transcript.end - transcript.start + 1) * ( args.pixelBase);

                        //get type settings object
                        var settings = _this.featureConfig[transcript.featureType];
                        var color = settings.getColor(transcript);

                        //se resta el trozo del final del gen hasta el principio del transcrito y se le suma el texto del transcrito
                        var maxWidth = Math.max(width, width - ((feature.end - transcript.start) * ( args.pixelBase)) + settings.getLabel(transcript).length * 7);


                        //add to the tree the transcripts size
                        args.renderedArea[checkRowY].add({start: x, end: x + maxWidth - 1});


                        var transcriptGroup = SVG.addChild(args.svgCanvasFeatures, 'g', {
                            "widgetId": transcript[settings.infoWidgetId]
                        });


                        var rect = SVG.addChild(transcriptGroup, 'rect', {//this rect its like a line
                            'x': transcriptX,
                            'y': checkRowY + 1,
                            'width': transcriptWidth,
                            'height': settings.height,
                            'fill': 'gray',
                            'cursor': 'pointer',
                            'feature_id': transcript.id
                        });
                        var text = SVG.addChild(transcriptGroup, 'text', {
                            'x': transcriptX,
                            'y': checkTextY,
                            'font-size': 12,
                            'font-family': _this.fontFamily,
                            'opacity': null,
                            'fill': 'black',
                            'cursor': 'pointer'
                        });
                        text.textContent = settings.getLabel(transcript);


                        $(transcriptGroup).qtip({
                            content: {text: settings.getTipText(transcript), title: settings.getTipTitle(transcript)},
                            position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                            style: { width: true, classes: 'ui-tooltip ui-tooltip-shadow'}
                        });
                        $(transcriptGroup).click(function (event) {
                            var query = this.getAttribute("widgetId");
                            _this.trigger('feature:click', {query: query, feature: transcript, featureType: transcript.featureType});
                        });

                        //paint exons
                        for (var e = 0, lene = feature.transcripts[i].exons.length; e < lene; e++) {/* loop over exons*/
                            var exon = feature.transcripts[i].exons[e];
                            var exonSettings = _this.featureConfig[exon.featureType];
                            var exonStart = parseInt(exon.start);
                            var exonEnd = parseInt(exon.end);
                            var middle = args.width / 2;

                            var exonX = args.pixelPosition + middle - ((args.position - exonStart) * args.pixelBase);
                            var exonWidth = (exonEnd - exonStart + 1) * ( args.pixelBase);

                            var exonGroup = SVG.addChild(args.svgCanvasFeatures, "g");

                            $(exonGroup).qtip({
                                content: {text: exonSettings.getTipText(exon, transcript), title: exonSettings.getTipTitle(exon)},
                                position: {target: 'mouse', adjust: {x: 15, y: 0}, viewport: $(window), effect: false},
                                style: { width: true, classes: 'ui-tooltip ui-tooltip-shadow'}
                            });

                            var eRect = SVG.addChild(exonGroup, "rect", {//paint exons in white without coding region
                                "i": i,
                                "x": exonX,
                                "y": checkRowY - 1,
                                "width": exonWidth,
                                "height": exonSettings.height,
                                "stroke": "gray",
                                "stroke-width": 1,
                                "fill": "white",
                                "cursor": "pointer"
                            });
                            //XXX now paint coding region
                            var codingStart = 0;
                            var codingEnd = 0;
                            // 5'-UTR
                            if (transcript.genomicCodingStart > exonStart && transcript.genomicCodingStart < exonEnd) {
                                codingStart = parseInt(transcript.genomicCodingStart);
                                codingEnd = exonEnd;
                            } else {
                                // 3'-UTR
                                if (transcript.genomicCodingEnd > exonStart && transcript.genomicCodingEnd < exonEnd) {
                                    codingStart = exonStart;
                                    codingEnd = parseInt(transcript.genomicCodingEnd);
                                } else
                                // all exon is transcribed
                                if (transcript.genomicCodingStart < exonStart && transcript.genomicCodingEnd > exonEnd) {
                                    codingStart = exonStart;
                                    codingEnd = exonEnd;
                                }
//									else{
//										if(exonEnd < transcript.genomicCodingStart){
//
//									}
                            }
                            var coding = codingEnd - codingStart;
                            var codingX = args.pixelPosition + middle - ((args.position - codingStart) * args.pixelBase);
                            var codingWidth = (coding + 1) * ( args.pixelBase);

                            if (coding > 0) {
                                var cRect = SVG.addChild(exonGroup, "rect", {
                                    "i": i,
                                    "x": codingX,
                                    "y": checkRowY - 1,
                                    "width": codingWidth,
                                    "height": exonSettings.height,
                                    "stroke": color,
                                    "stroke-width": 1,
                                    "fill": color,
                                    "cursor": "pointer"
                                });
                                //XXX draw phase only at zoom 100, where this.pixelBase=10
                                for (var p = 0, lenp = 3 - exon.phase; p < lenp && Math.round(args.pixelBase) == 10 && exon.phase != -1; p++) {//==10 for max zoom only
                                    SVG.addChild(exonGroup, "rect", {
                                        "i": i,
                                        "x": codingX + (p * 10),
                                        "y": checkRowY - 1,
                                        "width": args.pixelBase,
                                        "height": exonSettings.height,
                                        "stroke": color,
                                        "stroke-width": 1,
                                        "fill": 'white',
                                        "cursor": "pointer"
                                    });
                                }
                            }


                        }

                        checkRowY += rowHeight;
                        checkTextY += rowHeight;
                    }
                }// if transcrips != null
                break;
            }
            rowY += rowHeight;
            textY += rowHeight;
        }
    };

    //process features
    for (var i = 0, leni = features.length; i < leni; i++) {
        draw(features[i]);
    }
};

GeneRenderer.prototype.featureConfig = {
    gene: {
        getLabel: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            var str = "";
            str += (f.strand < 0 || f.strand == '-') ? "<" : "";
            str += " " + name + " ";
            str += (f.strand > 0 || f.strand == '+') ? ">" : "";
            if (f.biotype != null && f.biotype != '') {
                str += " [" + f.biotype + "]";
            }
            return str;
        },
        getTipTitle: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            return FEATURE_TYPES.formatTitle(f.featureType) +
                ' - <span class="ok">' + name + '</span>';
        },
        getTipText: function (f) {
            var color = GENE_BIOTYPE_COLORS[f.biotype];
            return    'id:&nbsp;<span class="ssel">' + f.id + '</span><br>' +
                'biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + f.biotype + '</span><br>' +
                FEATURE_TYPES.getTipCommons(f) +
                'source:&nbsp;<span class="ssel">' + f.source + '</span><br><br>' +
                'description:&nbsp;<span class="emph">' + f.description + '</span><br>';
        },
        getColor: function (f) {
            return GENE_BIOTYPE_COLORS[f.biotype];
        },
        infoWidgetId: "id",
        height: 4,
        histogramColor: "lightblue"
    },
    transcript: {
        getLabel: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            var str = "";
            str += (f.strand < 0) ? "<" : "";
            str += " " + name + " ";
            str += (f.strand > 0) ? ">" : "";
            if (f.biotype != null && f.biotype != '') {
                str += " [" + f.biotype + "]";
            }
            return str;
        },
        getTipTitle: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            return FEATURE_TYPES.formatTitle(f.featureType) +
                ' - <span class="ok">' + name + '</span>';
        },
        getTipText: function (f) {
            var color = GENE_BIOTYPE_COLORS[f.biotype];
            return    'id:&nbsp;<span class="ssel">' + f.id + '</span><br>' +
                'biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + f.biotype + '</span><br>' +
                'description:&nbsp;<span class="emph">' + f.description + '</span><br>' +
                FEATURE_TYPES.getTipCommons(f);
        },
        getColor: function (f) {
            return GENE_BIOTYPE_COLORS[f.biotype];
        },
        infoWidgetId: "id",
        height: 1,
        histogramColor: "lightblue"
    },
    exon: {
        getLabel: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            return name;
        },
        getTipTitle: function (f) {
            var name = (f.name != null) ? f.name : f.id;
            if (name == null) {
                name = ''
            }
            return FEATURE_TYPES.formatTitle(f.featureType) + ' - <span class="ok">' + name + '</span>';
        },
        getTipText: function (e, t) {
            var ename = (e.name != null) ? e.name : e.id;
            var tname = (t.name != null) ? t.name : t.id;
            var color = GENE_BIOTYPE_COLORS[t.biotype];
            return    'transcript name:&nbsp;<span class="ssel">' + t.name + '</span><br>' +
                'transcript Ensembl&nbsp;ID:&nbsp;<span class="ssel">' + t.id + '</span><br>' +
                'transcript biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + t.biotype + '</span><br>' +
                'transcript description:&nbsp;<span class="emph">' + t.description + '</span><br>' +
                'transcript start-end:&nbsp;<span class="emph">' + t.start + '-' + t.end + '</span><br>' +
                'exon start-end:&nbsp;<span class="emph">' + e.start + '-' + e.end + '</span><br>' +
                'strand:&nbsp;<span class="emph">' + t.strand + '</span><br>' +
                'length:&nbsp;<span class="info">' + (e.end - e.start + 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</span><br>';
        },
        getColor: function (f) {
            return "black";
        },
        infoWidgetId: "id",
        height: 5,
        histogramColor: "lightblue"
    },
};
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
    var middle = args.width/2;
    var multiplier = 5;
    var histogramHeight = 75;
    var points = '';

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

        points += (x+(width/2))+","+(histogramHeight - height)+" ";

    }
    if(features.length>0) {//force last point at histogramHeight
        var lastFeature = features[features.length-1];
        var width = (lastFeature.end-lastFeature.start)* args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-parseInt(lastFeature.start))*args.pixelBase);
        points += (x+(width/2))+','+histogramHeight+' ';

    }

    var pol = SVG.addChild(args.svgCanvasFeatures,"polyline",{
        "points":points,
        "stroke": "#000000",
        "stroke-width": 0.2,
        "fill": color,
        "cursor": "pointer"
    });


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

SequenceRenderer.prototype = new Renderer({});

function SequenceRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
    //set instantiation args
    _.extend(this, args);

};


SequenceRenderer.prototype.render = function(features, args) {

    console.time("Sequence render "+features.items.sequence.length);
    var chromeFontSize = "16";
    if(this.zoom == 95){
        chromeFontSize = "10";
    }

    var middle = args.width/2;

    var start = features.items.start;
    var seqStart = features.items.start;
    var seqString = features.items.sequence;

    for ( var i = 0; i < seqString.length; i++) {
        var x = args.pixelPosition+middle-((args.position-start)*args.pixelBase);
        start++;

        var text = SVG.addChild(args.svgCanvasFeatures,"text",{
            "x":x+1,
            "y":12,
            "font-size":chromeFontSize,
            "font-family": "Ubuntu Mono",
            "fill":SEQUENCE_COLORS[seqString.charAt(i)]
        });
        text.textContent = seqString.charAt(i);
        $(text).qtip({
            content:seqString.charAt(i)+" "+(seqStart+i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")/*+'<br>'+phastCons[i]+'<br>'+phylop[i]*/,
            position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
            style: { width:true, classes: 'qtip-light qtip-shadow'}
        });
    }

    console.timeEnd("Sequence render "+features.items.sequence.length);
//    this.trackSvgLayout.setNucleotidPosition(this.position);

};

function GenomeViewer(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("GenomeViewer");

    //set default args
    this.version = 'Genome Viewer v1';
    this.targetId;
    this.resizable = true;
    this.sidePanel = true;//enable or disable sidePanel at construction
    this.trackPanelScrollWidth = 18;
    this.species = "hsapiens";
    this.speciesName = "Homo sapiens";
    this.zoom = 100;

    //set instantiation args, must be last
    _.extend(this, args);

    this.width;
    this.height;
    this.sidePanelWidth = (this.sidePanel) ? 25 : 0;

    console.log(this.targetId);
    console.log(this.id);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

GenomeViewer.prototype = {

    render: function (targetId) {
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }
        console.log("Initializing GenomeViewer structure.");
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="genome-viewer" style="border:1px solid lightgray"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.setWidth($(this.div).width());

        this._recalculateZoom();

        Utils.setMinRegion(this.region, this.getSVGCanvasWidth());


        $(this.div).append('<div id="gv-navigation-panel"></div>');
        $(this.div).append('<div id="gv-center-panel" style="position:relative"></div>');

        $('#gv-center-panel').append('<div id="gv-sidebar-panel" style="position:absolute; z-index:50;right:0px;height:100%;"></div>');
        $('#gv-center-panel').append('<div id="gv-main-panel" style="z-index:1"></div>');

        if (this.sidePanel == true) {
            $('#gv-sidebar-panel').append('<div id="gv-sidebar-title-h" style="position:relative;width:250px;height:100%;display:none;">' +
                '<div class="gv-panel-title" style="border-left:1px solid darkgray;position:relative;height:24px;">configuration</div>' +
                '<div class="" style="position:relative;height:100%;background:gray"></div>' +
                '</div>');
            $('#gv-sidebar-title-h').click(function () {
                $('#gv-sidebar-title-v').show();
                $('#gv-sidebar-title-h').hide();
            });
            $('#gv-sidebar-panel').append('<div id="gv-sidebar-title-v" class="gv-panel-title-v" style="position:relative;width:25px;height:100%;"><div class="rotate-90">Configuration</div></div>');
            $('#gv-sidebar-title-v').click(function () {
                $('#gv-sidebar-title-v').hide();
                $('#gv-sidebar-title-h').show();
            });
        }

        $('#gv-main-panel').append('<div id="gv-karyotype-panel"></div>');
        $('#gv-main-panel').append('<div id="gv-chromosome-panel"></div>');
        $('#gv-main-panel').append('<div id="gv-region-panel"></div>');
        $('#gv-main-panel').append('<div id="gv-tracks-panel"></div>');


        $('#genome-viewer').append('<div id="gv-statusbar-panel"></div>');

        this.rendered = true;
    },
    setWidth: function (width) {
        this.width = width;
        this._recalculateZoom();
        this.trigger('width:change', {width: this.width, sender: this});
//        this.region.load(this._calculateRegionByWidth());
//        this.trigger('region:change', {region: this.region, sender: this});
    },
    getSVGCanvasWidth: function () {
        return $(this.div).width() - this.trackPanelScrollWidth - this.sidePanelWidth;
    },
    _setRegion: function (region) {
        //update internal parameters
        this.region.load(region);
        this._recalculateZoom();
    },
    setRegion: function (region) {
        this.region.load(region);
        Utils.setMinRegion(this.region, this.getSVGCanvasWidth());
        this.trigger('region:change', {region: this.region, sender: this});
    },
    move: function (disp) {
//        var pixelBase = (this.width-this.svgCanvasWidthOffset) / this.region.length();
//        var disp = Math.round((disp*10) / pixelBase);
        this.region.start += disp;
        this.region.end += disp;
        this.trigger('region:move', {region: this.region, disp: -disp, sender: this});
    },

    _recalculateZoom: function () {
        this.zoom = this._calculateZoomByRegion();
    },
    _calculateRegionByWidth: function () {
        var zoomBaseLength = parseInt(this.getSVGCanvasWidth() / Utils.getPixelBaseByZoom(this.zoom));
        var regionCenter = this.region.center();
        var regionHalf = Math.ceil((zoomBaseLength / 2) - 1);
        return {
            start: Math.floor(regionCenter - regionHalf),
            end: Math.floor(regionCenter + regionHalf)
        }
    },
    _calculateZoomByRegion: function () {
        return Utils.getZoomByPixelBase((this.getSVGCanvasWidth() / this.region.length()));
    },

    mark: function (args) {
        var attrName = args.attrName || 'feature_id';
        var cssClass = args.class || 'feature-emph';
        if ('attrValues' in args) {
            args.attrValues = ($.isArray(args.attrValues)) ? args.attrValues : [args.attrValues];
            for (var key in args.attrValues) {
                $('rect[' + attrName + '~=' + args.attrValues[key] + ']').attr('class', cssClass);
            }

        }
    },
    unmark: function (args) {
        var attrName = args.attrName || 'feature_id';
        if ('attrValues' in args) {
            args.attrValues = ($.isArray(args.attrValues)) ? args.attrValues : [args.attrValues];
            for (var key in args.attrValues) {
                $('rect[' + attrName + '~=' + args.attrValues[key] + ']').attr('class', '');
            }

        }
    },

    highlight: function (args) {
        this.trigger('feature:highlight',args);
    },

    draw: function () {
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }
        var _this = this;

        // Resize
        $(window).smartresize(function (event) {
            if (_this.resizable == true) {
                _this.setWidth($(_this.div).width());
            }
        });

        /* Navigation Bar */
        this.navigationBar = this._createNavigationBar('gv-navigation-panel');

        /*karyotype Panel*/
        this.karyotypePanel = this._drawKaryotypePanel('gv-karyotype-panel');

        /* Chromosome Panel */
        this.chromosomePanel = this._drawChromosomePanel('gv-chromosome-panel');

        /* Region Panel, is a TrackListPanel Class */
        this.regionOverviewPanel = this._createRegionOverviewPanel('gv-region-panel');

        /*TrackList Panel*/
        this.trackListPanel = this._createTrackListPanel('gv-tracks-panel');

        /*Status Bar*/
        this.statusBar = this._createStatusBar('gv-statusbar-panel');


        this.on('region:change region:move', function (event) {
            if (event.sender != _this) {
                _this._setRegion(event.region);
            }
        });
    },

    /**/
    /*Components*/
    /**/

    _createNavigationBar: function (targetId) {
        var _this = this;
        var navigationBar = new NavigationBar({
            targetId: targetId,
            species: this.species,
            region: this.region,
            width: this.width,
            svgCanvasWidthOffset : this.trackPanelScrollWidth + this.sidePanelWidth,
            zoom: this.zoom,
            autoRender: true,
            handlers: {
                'region:change': function (event) {
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth())
                    _this.trigger('region:change', event);
                },
                'karyotype-button:change': function (event) {
                    if (event.selected) {
                        _this.karyotypePanel.show();
                    } else {
                        _this.karyotypePanel.hide();
                    }
                },
                'chromosome-button:change': function (event) {
                    if (event.selected) {
                        _this.chromosomePanel.show();
                    } else {
                        _this.chromosomePanel.hide();
                    }
                },
                'region-button:change': function (event) {
                    if (event.selected) {
                        _this.regionOverviewPanel.show();
                    } else {
                        _this.regionOverviewPanel.hide();
                    }
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
                }
            }
        });

        this.on('region:change region:move', function (event) {
            if (event.sender != navigationBar) {
                _this.navigationBar.setRegion(event.region);
            }
        });
        this.on('width:change', function (event) {
            _this.navigationBar.setWidth(event.width);
        });

        navigationBar.draw();

        return navigationBar;
    },

    _drawKaryotypePanel: function (targetId) {
        var _this = this;
        this.karyotypePanel = new KaryotypePanel({
            targetId: targetId,
            width: this.width - this.sidePanelWidth,
            height: 125,
            species: this.species,
            title: 'Karyotype',
            region: this.region,
            autoRender: true,
            handlers: {
                'region:change': function (event) {
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth());
                    _this.trigger('region:change', event);
                }
            }
        });

        this.on('region:change region:move', function (event) {
            if (event.sender != _this.karyotypePanel) {
                _this.karyotypePanel.setRegion(event.region);
            }
        });

        this.on('width:change', function (event) {
            _this.karyotypePanel.setWidth(event.width - _this.sidePanelWidth);
        });

        this.karyotypePanel.draw();

        return this.karyotypePanel;
    },

    _drawChromosomePanel: function (targetId) {
        var _this = this;


        this.chromosomePanel = new ChromosomePanel({
            targetId: targetId,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            height: 65,
            species: this.species,
            title: 'Chromosome',
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    _this.trigger('region:change', event);
                }
            }
        });

        this.on('region:change region:move', function (event) {
            if (event.sender != _this.chromosomePanel) {
                _this.chromosomePanel.setRegion(event.region);
            }
        });

        this.on('width:change', function (event) {
            _this.chromosomePanel.setWidth(event.width - _this.sidePanelWidth);
        });

        this.chromosomePanel.draw();

        return this.chromosomePanel;
    },

    _createRegionOverviewPanel: function (targetId) {
        var _this = this;
        var trackListPanel = new TrackListPanel({
            targetId: targetId,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            zoom: this.zoom,
            zoomMultiplier: 8,
            title: 'Region overview',
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    event.sender = {};
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth())
                    _this.trigger('region:change', event);
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
                }
            }
        });

        this.on('region:change', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });

        this.on('region:move', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });

        this.on('width:change', function (event) {
            trackListPanel.setWidth(event.width - _this.sidePanelWidth);
        });

        var gene = new FeatureTrack({
            targetId: null,
            id: 2,
            title: 'Gene',
            histogramZoom: 10,
            labelZoom: 20,
            height: 100,
            visibleRange: {start: 0, end: 100},
            titleVisibility: 'hidden',
            featureTypes: FEATURE_TYPES,

            renderer: new FeatureRenderer({
                label: function (f) {
                    var name = (f.name != null) ? f.name : f.id;
                    var str = "";
                    str += (f.strand < 0 || f.strand == '-') ? "<" : "";
                    str += " " + name + " ";
                    str += (f.strand > 0 || f.strand == '+') ? ">" : "";
                    if (f.biotype != null && f.biotype != '') {
                        str += " [" + f.biotype + "]";
                    }
                    return str;
                },
                tooltipTitle: function (f) {
                    var name = (f.name != null) ? f.name : f.id;
                    return FEATURE_TYPES.formatTitle(f.featureType) +
                        ' - <span class="ok">' + name + '</span>';
                },
                tooltipText: function (f) {
                    var color = GENE_BIOTYPE_COLORS[f.biotype];
                    return    'id:&nbsp;<span class="ssel">' + f.id + '</span><br>' +
                        'biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + f.biotype + '</span><br>' +
                        FEATURE_TYPES.getTipCommons(f) +
                        'source:&nbsp;<span class="ssel">' + f.source + '</span><br><br>' +
                        'description:&nbsp;<span class="emph">' + f.description + '</span><br>';
                },
                color: function (f) {
                    return GENE_BIOTYPE_COLORS[f.biotype];
                },
                infoWidgetId: "id",
                height: 4,
                histogramColor: "lightblue",
                handlers: {
                    'feature:click': function (event) {
                        new GeneInfoWidget(null, _this.species).draw(event);
                    }
                }
            }),

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "gene",
                species: this.species,
                featureCache: {
                    gzip: true,
                    chunkSize: 50000
                }
            })
        });
        trackListPanel.addTrack(gene);

        return  trackListPanel;
    },

    _createTrackListPanel: function (targetId) {
        var _this = this;
        var trackListPanel = new TrackListPanel({
            targetId: targetId,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            zoom: this.zoom,
            title: 'Detailed information',
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    event.sender = {};
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth());
                    _this.trigger('region:change', event);
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
                }
            }
        });

        this.on('feature:highlight', function (event) {
            trackListPanel.highlight(event);
        });

        this.on('region:change', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });

        this.on('region:move', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });
        this.on('width:change', function (event) {
            trackListPanel.setWidth(event.width - _this.sidePanelWidth);
        });

        return  trackListPanel;
    },

    _createStatusBar: function (targetId) {
        var _this = this;
        var statusBar = new StatusBar({
            targetId: targetId,
            autoRender: true,
            region: this.region,
            width: this.width,
            version: this.version
        });

        this.trackListPanel.on('mousePosition:change', function (event) {
            statusBar.setMousePosition(event);
        });

        return  statusBar;
    },

    setSpeciesVisible: function (bool) {
        this.navigationBar.setSpeciesVisible(bool);
    },

    setChromosomesVisible: function (bool) {
        this.navigationBar.setChromosomeMenuVisible(bool);
    },

    setKaryotypePanelVisible: function (bool) {
        this.karyotypePanel.setVisible(bool);
        this.navigationBar.setVisible({'karyotype': bool});
    },

    setChromosomePanelVisible: function (bool) {
        this.chromosomePanel.setVisible(bool);
        this.navigationBar.setVisible({'chromosome': bool});
    },

    setRegionOverviewPanelVisible: function (bool) {
        this.regionOverviewPanel.setVisible(bool);
        this.navigationBar.setVisible({'region': bool});
    },
    setRegionTextBoxVisible: function (bool) {
        this.navigationBar.setRegionTextBoxVisible(bool);
    },
    setSearchVisible: function (bool) {
        this.navigationBar.setSearchVisible(bool);
    },
    setFullScreenVisible: function (bool) {
        this.navigationBar.setFullScreenButtonVisible(bool);
    }
};


GenomeViewer.prototype.addTrack = function (trackData, args) {
    this.trackListPanel.addTrack(trackData, args);
};

GenomeViewer.prototype.getTrackSvgById = function (trackId) {
    return this.trackListPanel.getTrackSvgById(trackId);
};

GenomeViewer.prototype.removeTrack = function (trackId) {
    return this.trackListPanel.removeTrack(trackId);
};

GenomeViewer.prototype.restoreTrack = function (trackSvg, index) {
    return this.trackListPanel.restoreTrack(trackSvg, index);
};

GenomeViewer.prototype.setTrackIndex = function (trackId, newIndex) {
    return this.trackListPanel.setTrackIndex(trackId, newIndex);
};

GenomeViewer.prototype.scrollToTrack = function (trackId) {
    return this.trackListPanel.scrollToTrack(trackId);
};

GenomeViewer.prototype.showTrack = function (trackId) {
    this.trackListPanel._showTrack(trackId);
};

GenomeViewer.prototype.hideTrack = function (trackId) {
    this.trackListPanel._hideTrack(trackId);
};

GenomeViewer.prototype.checkRenderedTrack = function (trackId) {
    if (this.trackListPanel.swapHash[trackId]) {
        return true;
    }
    return false;
};


//XXX BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function () {
    var geneLegendPanel = new LegendPanel({title: 'Gene legend'});
    var snpLegendPanel = new LegendPanel({title: 'SNP legend'});

//	var scaleLabel = Ext.create('Ext.draw.Component', {
//		id:this.id+"scaleLabel",
//        width: 100,
//        height: 20,
//        items:[
//            {type: 'text',text: 'Scale number',fill: '#000000',x: 10,y: 9,width: 5, height: 20},
//            {type: 'rect',fill: '#000000',x: 0,y: 0,width: 2, height: 20},
//			{type: 'rect',fill: '#000000',x: 2,y: 12, width: 100,height: 3},
//			{type: 'rect',fill: '#000000',x: 101,y: 0, width: 2,height: 20}
//		]
//	});
//	scale.surface.items.items[0].setAttributes({text:'num'},true);

    var versionLabel = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "versionLabel",
        text: ''
    });

    var mouseLabel = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "mouseLabel",
        width: 110,
        text: '<span class="ssel">Position: -</span>'
    });
    var mouseNucleotidLabel = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "mouseNucleotidLabel",
        width: 10,
        text: '-'
    });
    var windowSize = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "windowSize",
        width: 150,
        text: '<span class="emph">Window size: -</span>'
    });

    var taskbar = Ext.create('Ext.toolbar.Toolbar', {
        id: this.id + 'uxTaskbar',
        winMgr: new Ext.ZIndexManager(),
        enableOverflow: true,
        cls: 'bio-hiddenbar',
        height: 28,
        flex: 1
    });

    var legendBar = Ext.create('Ext.toolbar.Toolbar', {
        id: this.id + 'legendBar',
        cls: 'bio-hiddenbar',
        width: 610,
        height: 28,
        items: [/*scaleLabel, */
            '-', mouseLabel, mouseNucleotidLabel, windowSize,
            geneLegendPanel.getButton(GENE_BIOTYPE_COLORS),
            snpLegendPanel.getButton(SNP_BIOTYPE_COLORS),
            '->', versionLabel]
    });

    var bottomBar = Ext.create('Ext.container.Container', {
        id: this.id + 'bottomBar',
        layout: 'hbox',
        region: "south",
        cls: "bio-botbar unselectable",
        height: 30,
        border: true,
        items: [taskbar, legendBar]
    });
    return bottomBar;
};
//BOTTOM BAR


GenomeViewer.prototype.openListWidget = function (args) {
    var _this = this;

    console.log(args.query)

    var cellBaseManager = new CellBaseManager(this.species);
    cellBaseManager.success.addEventListener(function (evt, data) {
        if (data.result[0].length > 1) {
            var genomicListWidget = new GenomicListWidget(_this.species, {title: args.title, gridFields: args.gridField, viewer: _this});
            genomicListWidget.draw(data);

            genomicListWidget.onSelected.addEventListener(function (evt, feature) {
//			console.log(feature);
                if (feature != null && feature.chromosome != null) {
                    if (_this.chromosome != feature.chromosome || _this.position != feature.start) {
                        _this.onRegionChange.notify({sender: "", chromosome: feature.chromosome, position: feature.start});
                    }
                }
            });

            genomicListWidget.onTrackAddAction.addEventListener(function (evt, event) {
                var track = new TrackData(event.fileName, {
                    adapter: event.adapter
                });
                _this.trackSvgLayout.addTrack(track, {
                    id: event.fileName,
                    featuresRender: "MultiFeatureRender",
//					histogramZoom:80,
                    height: 150,
                    visibleRange: {start: 0, end: 100},
                    featureTypes: FEATURE_TYPES
                });
            });
        } else {
            var feature = data.result[0][0];
            if (feature != null) {
                _this.region.load(feature);
                _this.onRegionChange.notify({sender: ""});
            } else {
                Ext.example.msg('Feature <span class="ssel">' + args.query + '</span> not found', "");
            }
        }
    });
    cellBaseManager.get(args.category, args.subcategory, args.query, args.resource, args.params);
};
GenomeViewer.prototype.openGeneListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "id",
        query: name.toString(),
        resource: "gene",
        title: "Gene List"
    });
};

GenomeViewer.prototype.openTranscriptListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "transcript",
        query: name.toString(),
        resource: "info",
        title: "Transcript List",
        gridField: ["externalName", "stableId", "biotype", "chromosome", "start", "end", "strand", "description"]
    });
};

GenomeViewer.prototype.openExonListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "exon",
        query: name.toString(),
        resource: "info",
        title: "Exon List",
        gridField: ["stableId", "chromosome", "start", "end", "strand"]
    });
};

GenomeViewer.prototype.openSNPListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "id",
        query: name.toString(),
        resource: "snp",
        title: "SNP List",
        gridField: ["name", "variantAlleles", "ancestralAllele", "mapWeight", "position", "sequence", "chromosome", "start", "end"]
    });
};

GenomeViewer.prototype.openGOListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "id",
        query: name.toString(),
        resource: "gene",
        title: "Gene List by GO"
    });
};
