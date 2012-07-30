
//****   EVENT INTERFACE ****//
/*var Event = function (sender) {
    this._sender = sender;
    this._listeners = [];
};*/

function Event(sender) {
    this._sender = sender;
    this._listeners = [];
};

 
Event.prototype = {
    addEventListener : function (listener) {
        return this._listeners.push(listener)-1; //return index of array
    },
    removeEventListener : function (index) {
    	this._listeners.splice(index,1);
    },
    notify : function (args) {
        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this._sender, args);
        }
    }
};/*
 * Clase gestiona la insercciÃ³n, eliminaciÃ³n de los elementos en el DOM
 * 
 * Vital hacerla SIEMPRE compatible hacia atrÃ¡s
 * 
 * Last update: 28-10-2010
 * 
 */


var DOM = {};

DOM.createNewElement = function(type, nodeParent, attributes)
{
	var node = document.createElement(type);
	for (var i=0; i<attributes.length; i++)
	{
		node.setAttribute(attributes[i][0], attributes[i][1]);
	}
	nodeParent.appendChild(node);
	return node;
		
};

DOM.createTextNode = function(text, nodeParent)
{
	var aText = document.createTextNode(text);
	nodeParent.appendChild(aText);
	return aText;

		
};

DOM.removeChilds = function(targetID)
{
	
	var parent = document.getElementById(targetID);
	while (parent.childNodes.length>0)
	{
	      parent.removeChild(parent.childNodes[0]);

	}
};

DOM.select = function(targetID)
{
  return document.getElementById(targetID);
//  return $("#"+targetID);
};
var Colors = new function()
{
   this.hashColor = [];
   this.getColorByScoreArrayValue = function (arrayScore)
   {
	   var array = new Array();
	   
	   for (var i = 0; i< arrayScore.length; i++)
	   {
		
		   var color = this.getColorByScoreValue(arrayScore[i]);
		   array.push( color);
		
	   }
	   return array;  
   };
   
   this.getHexStringByScoreArrayValue = function (arrayScore)
   {
	   var arrayColor = this.getColorByScoreArrayValue(arrayScore); 
	   var arrayHex = new Array();
	   for (var i = 0; i< arrayColor.length; i++)
	   {
		   arrayHex.push( arrayColor[i].HexString());
	   }
	   return arrayHex;   
   };
  
   this.getColorByScoreValue = function (score)
   {

		var truncate = score.toString().substr(0,4);
		if (this.hashColor[truncate]!=null)
		{
			return this.hashColor[truncate];
		}


		if(isNaN(score)) {
			return Colors.ColorFromRGB(0,0,0);
		}
		var value;
	
		var from, to;
		if(score < 0.5) {
			from = Colors.ColorFromRGB(0,0,255);
			to = Colors.ColorFromRGB(255,255,255);
			value = (score * 2);
		} else {
			from = Colors.ColorFromRGB(255,255,255);
			to = Colors.ColorFromRGB(255,0,0);			
			value = (score * 2) - 1;
		}

		var x = value;
		var y = 1.0 - value;
		var color = Colors.ColorFromRGB(y * from.Red() + x * to.Red(), y * from.Green() + x * to.Green(), y * from.Blue() + x * to.Blue());

		this.hashColor[truncate] = color;

		return color;
	};
	
  this.ColorFromHSV = function(hue, sat, val)
  {
    var color = new Color();
    color.SetHSV(hue,sat,val);
    return color;
  };

  this.ColorFromRGB = function(r, g, b)
  {
    var color = new Color();
    color.SetRGB(r,g,b);
    return color;
  };

  this.ColorFromHex = function(hexStr)
  {
    var color = new Color();
    color.SetHexString(hexStr);
    return color;
  };

  function Color() {
    //Stored as values between 0 and 1
    var red = 0;
    var green = 0;
    var blue = 0;
    
    //Stored as values between 0 and 360
    var hue = 0;
    
    //Strored as values between 0 and 1
    var saturation = 0;
    var value = 0;
     
    this.SetRGB = function(r, g, b)
    {
      red = r/255.0;
      green = g/255.0;
      blue = b/255.0;
      calculateHSV();
    };
    
    this.Red = function() { return Math.round(red*255); };
    
    this.Green = function() { return Math.round(green*255); };
    
    this.Blue = function() { return Math.round(blue*255); };
    
    this.SetHSV = function(h, s, v)
    {
      hue = h;
      saturation = s;
      value = v;
      calculateRGB();
    };
      
    this.Hue = function()
    { return hue; };
      
    this.Saturation = function()
    { return saturation; };
      
    this.Value = function()
    { return value; };
     
    this.SetHexString = function(hexString)
    {
      if(hexString == null || typeof(hexString) != "string")
      {
        this.SetRGB(0,0,0);
        return;
      }
       
      if (hexString.substr(0, 1) == '#')
        hexString = hexString.substr(1);
        
      if(hexString.length != 6)
      {
        this.SetRGB(0,0,0);
        return;
      }
          
      var r = parseInt(hexString.substr(0, 2), 16);
      var g = parseInt(hexString.substr(2, 2), 16);
      var b = parseInt(hexString.substr(4, 2), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b))
      {
        this.SetRGB(0,0,0);
        return;
      }
        
      this.SetRGB(r,g,b);  
    };
      
    this.HexString = function()
    {
    
      var rStr = this.Red().toString(16);
      if (rStr.length == 1)
        rStr = '0' + rStr;
      var gStr = this.Green().toString(16);
      if (gStr.length == 1)
        gStr = '0' + gStr;
      var bStr = this.Blue().toString(16);
      if (bStr.length == 1)
        bStr = '0' + bStr;
      return ('#' + rStr + gStr + bStr).toUpperCase();
    };
    
    this.Complement = function()
    {
      var newHue = (hue >= 180) ? hue - 180 : hue + 180;
      var newVal = (value * (saturation - 1) + 1);
      var newSat = (value*saturation) / newVal;
      var newColor = new Color();
      newColor.SetHSV(newHue, newSat, newVal);
      return newColor; 
    } ;
    
    function calculateHSV()
    {
      var max = Math.max(Math.max(red, green), blue);
      var min = Math.min(Math.min(red, green), blue);
      
      value = max;
      
      saturation = 0;
      if(max != 0)
        saturation = 1 - min/max;
        
      hue = 0;
      if(min == max)
        return;
      
      var delta = (max - min);
      if (red == max)
        hue = (green - blue) / delta;
      else if (green == max)
        hue = 2 + ((blue - red) / delta);
      else
        hue = 4 + ((red - green) / delta);
      hue = hue * 60;
      if(hue < 0)
        hue += 360;
    }
    
    function calculateRGB()
    {
      red = value;
      green = value;
      blue = value;
      
      if(value == 0 || saturation == 0)
        return;
      
      var tHue = (hue / 60);
      var i = Math.floor(tHue);
      var f = tHue - i;
      var p = value * (1 - saturation);
      var q = value * (1 - saturation * f);
      var t = value * (1 - saturation * (1 - f));
      switch(i)
      {
        case 0:
          red = value; green = t;       blue = p;
          break;
        case 1:
          red = q; green = value; blue = p;
          break;
        case 2:
          red = p; green = value; blue = t;
          break;
        case 3:
          red = p; green = q; blue = value;
          break;
        case 4:
          red = t; green = p;   blue = value;
          break;
        default:
          red = value; green = p;       blue = q;
          break;
      }
    }
  }
}
();/*

Normalizacion de datos para dibujar colores
Issues:
		No sé como debería llamarse esta libreria
		No sé si ya existe una funciçon en javascript que lo haga


*/


var Normalizer = new function()
{
   this.normalizeArray = function (arrayData)
   {
	   
	   return this.standardizeArray(this.normal(arrayData));
	   
//	  var result = this._getMaxAndMin(arrayData);
//	  var min =result[0];
//	  var max = result[1];
//	
//
//	  //los hacemos todos positivos
//	  for (var i = 0; i< arrayData.length; i++)
//	  {
//		 arrayData[i]= Math.abs(min) + parseFloat(arrayData[i]);
//	  }
//	 
//	  var result = this._getMaxAndMin(arrayData);
//	  var min =result[0];
//	  var max = result[1];
//	  
//	  
//	  var resultArray = new Array();
//	  for (var i = 0; i< arrayData.length; i++)
//	  {
//		  resultArray.push(arrayData[i]*1/max);
//	  }
//	  return resultArray;
   };
   
   this.normal = function(arrayData){
		var mean = this._getMean(arrayData);
		var deviation = this._getStdDeviation(arrayData);
		var result = this._getMaxAndMin(arrayData);
		var min = result[0];
		var max = result[1];
		
		var resultArray = new Array();
	    for (var i = 0; i< arrayData.length; i++) {
	    	if (deviation!=0){
	    		resultArray.push((arrayData[i]-mean)/deviation);
	    	}else{
	    		resultArray.push(arrayData[i]);
	    	}
	    }
	    return resultArray;
   };

   this.standardizeArray = function(arrayData)
   {
		var result = this._getMaxAndMin(arrayData);
		var min = result[0];
		var max = result[1];
		
		var offset = ( min <= 0 ) ? Math.abs(min) : (-1 * min);
		var resultArray = new Array();
	    for (var i = 0; i< arrayData.length; i++) {
	    	if(max + offset!=0){
	    		resultArray.push((arrayData[i] + offset) / (max + offset));
	    	}else{
	    		resultArray.push(arrayData[i]+offset);
	    	}
	    }
	    return resultArray;
   };


   this._getMean = function(arrayData) {
		var sum = 0;
		for (var i = 0; i< arrayData.length; i++) {
			sum = sum + parseFloat(arrayData[i]);
		}
		return sum/arrayData.length;
	};
	
   this._getStdDeviation = function(arrayData) {
	   var mean = this._getMean(arrayData);
	   var acum = 0.0;
	   for(var i=0; i<arrayData.length; i++) {
		   acum += Math.pow(parseFloat(arrayData[i]) - mean, 2);
	   }
	   return Math.sqrt(acum/arrayData.length);
   };

   this._getMaxAndMin = function(arrayData){
	   var min = Number.MAX_VALUE;
	   var max = Number.MIN_VALUE;
	   
	   for (var i = 0; i< arrayData.length; i++){
		   if (arrayData[i] < min) min =  parseFloat(arrayData[i]);
		   
		   if (arrayData[i] > max) max =  parseFloat(arrayData[i]);
	   }
	   
	   return [min, max];
   };
};

/*
 * String buffer
 */
// Constructor
function StringBuffer() {
	this.buffer = [];
};
// append
StringBuffer.prototype.append = function(string){
	this.buffer.push(string);
	return this;
};
// appendln
StringBuffer.prototype.appendln = function(string){
	this.buffer.push(string + "\n");
	return this;
};
// toString
StringBuffer.prototype.toString = function() {
	return this.buffer.join("");
};//Element.prototype.addChildSVG = function(elementName, attributes, index){
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
var Geometry =
{
		
	/** From tow points obtains the angles formed with the cartesian side **/
	getAngleBetweenTwoPoints : function(x1, y1, x2, y2){
		//var m = (y1 - y2)/ (x1 - x2);
		return Math.atan2(y2-y1, x2-x1);
	},
	
	getAdjacentSideOfRectangleRight : function(angle, hypotenuse){
		return Math.abs(Math.cos(angle)*hypotenuse);
	},
	
	getOppositeSideOfRectangleRight : function(angle, hypotenuse){
		return Math.abs(Math.sin(angle)*hypotenuse);
	},
	
	toDegree: function(radian){
		return radian*180/Math.PI;
		
	}
	
	
};
