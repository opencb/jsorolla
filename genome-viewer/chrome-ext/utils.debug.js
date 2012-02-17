/*

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
        this._listeners.push(listener);
    },
    notify : function (args) {
        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this._sender, args);
        }
    }
};
var Colors = new function()
{
   this.hashColor = [];
   this.getColorByScoreArrayValue = function (arrayScore)
   {
	   var array = new Array();
	   
	   for (var i = 0; i< arrayScore.length; i++)
	   {
		
		   var color = this.getColorByScoreValue(arrayScore[i])
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
();

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
};var Geometry =
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
var SHAPE=0;
var SQUARE=1;
var RECTANGLE=2;
var ROUNDEDREC=3;
var CIRCLE=4;
var TRIANGLE=5;
var PANEL=6;
var TEXT=7;
var LINE=9;

var VERTICAL =0;
var HORIZONTAL = 1;


//LIBRERIA DE GRAPHICS PARA CANVAS


function Point(x, y)
{
	this.x=x;
	this.y=y;
}
Point.prototype.getDistance = function(point) {
	
    var dx= Math.pow(this.x- point.x, 2);
	var dy= Math.pow(this.y- point.y, 2);
	return Math.sqrt(dx+dy);
};



function Shape (top, left) {
    this.top = top;
    this.left = left;
	this.color="#000000";
	this.canvas = null;
	this.visible=true;
	this.type=SHAPE;
	
	this.borderColor="#000000";
	this.borderWidth= 0 ;
   
}
Shape.prototype.toString = function() {
    return this.type+': '+this.top + ' ' + this.left;
};

Shape.prototype.setBorderColor = function(color) {
   this.borderColor=color;
};

Shape.prototype.setBorderWidth = function(size) {
	   this.borderWidth=size;
};




Shape.prototype.setColor = function(color) {
    this.color=color;
};

Shape.prototype.render = function(canvas) {
    this.canvas=canvas;
	
};

Shape.prototype.setVisible = function(visible) {
    this.visible=visible;
};




/********** Rectangulo  ****************/
function Rectangle(top, left, height,width) {
	
 	Shape.call(this, top, left);
    this.width = width;
	this.height=height; 
	this.type=RECTANGLE;
	
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;
Rectangle.prototype.render = function(canvas) {
				if (!this.visible) return;
				canvas.save();
				
					
				canvas.lineWidth   = 2;
				canvas.strokeStyle = "#000000"; 
				canvas.beginPath();  
				canvas.moveTo(this.left,this.top);  
				canvas.lineTo(this.left  + this.width ,this.top); 
				canvas.lineTo(this.left + this.width ,this.top + this.height ); 
				canvas.lineTo(this.left ,this.top + this.height ); 
				canvas.closePath();
				canvas.stroke();
				


				canvas.fillStyle = this.color;	
				//canvas.clearRect(this.left, this.top, this.width, this.height);
				
				canvas.fillRect(this.left, this.top, this.width, this.height);
				//canvas.strokeStyle = "#000000"; 
				//canvas.strokeRect(this.left, this.top, this.width, this.height);
			
				
				canvas.restore();
};

Rectangle.prototype.remove = function() {			
				this.canvas.clearRect(this.left, this.top, this.width, this.height);		
};


Rectangle.prototype.contains = function(x,y) {
				if (y>=this.left && y<=this.width+this.left)
				{
					if (x>=this.top && x<=this.height+this.top)
					{
						return true;
					}
					else
						return false;				
				}	
				else
					return false;
};



/********** RoundedRec  ****************/
function RoundedRec(left, top, width, height, radio) {
	
 	Rectangle.call(this, top, left, height, width);
    this.radio=radio;
	this.type=ROUNDEDREC;
	
}

RoundedRec.prototype = new Rectangle;
RoundedRec.prototype.constructor = RoundedRec;

RoundedRec.prototype.render = function(canvas) {
				if (!this.visible) return;
				canvas.save();
				canvas.fillStyle = this.color;	
				canvas.beginPath();  
				canvas.moveTo(this.left,this.top+this.radio);  
				canvas.lineTo(this.left,this.top+this.height-this.radio);  
				canvas.quadraticCurveTo(this.left,this.top+this.height,this.left+this.radio,this.top+this.height);  
				canvas.lineTo(this.left+this.width-this.radio,this.top+this.height);  
				canvas.quadraticCurveTo(this.left+this.width,this.top+this.height,this.left+this.width,this.top+this.height-this.radio);  
				canvas.lineTo(this.left+this.width,this.top+this.radio);  
				canvas.quadraticCurveTo(this.left+this.width,this.top,this.left+this.width-this.radio,this.top);  
				canvas.lineTo(this.left+this.radio,this.top);  
				canvas.quadraticCurveTo(this.left,this.top,this.left,this.top+this.radio);  
				canvas.fill();	
				if (this.borderWidth!=0)
				{
					canvas.strokeStyle = this.borderColor; 
					canvas.lineWidth   = this.borderWidth;
					canvas.stroke();
				}
				canvas.restore();
			
				
};






/*********   CUADRADO   ***************/
function Square(left, top, lado) {
	
 	Shape.call(this, top, left);
    this.height = lado;  
	this.width = lado;  
	this.type=SQUARE;
}

Square.prototype = new Shape;
Square.prototype.constructor = Square;

Square.prototype.remove = function() {
				this.canvas.clearRect(this.top, this.left, this.width, this.height);
};


Square.prototype.render = function(canvas) {
				Shape.prototype.render.call(this, canvas);
				if (!this.visible) return;
				canvas.save();
					
				canvas.fillStyle = this.color;	
				canvas.fillRect(this.top, this.left, this.width, this.height);
				if (this.borderWidth!=0)
				{
					canvas.strokeStyle = this.borderColor; 
					canvas.lineWidth   = this.borderWidth;
					canvas.strokeRect(this.top, this.left, this.width, this.height);
				}
				canvas.restore();				
};

Square.prototype.contains = function(x,y) {
				if (y>=this.left && y<=this.width+this.left)
				{
					if (x>=this.top && x<=this.height+this.top)
					{
						return true;
					}
					else
						return false;
					}	
				else
					return false;
};


/***********  CIRCULO  **********/
function Circle(left, top, Radio) {
 	Shape.call(this, top, left);
    this.radio = Radio; 
	this.type=CIRCLE;	
}

Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;

Circle.prototype.render = function(canvas) {
				Shape.prototype.render.call(this, canvas);
				if (!this.visible) return;
				canvas.save();
				canvas.beginPath();
				canvas.fillStyle = this.color;	
				canvas.arc(this.top+this.radio, this.left+this.radio, this.radio, 0, Math.PI*2, true);	
				
				if (this.borderWidth!=0)
				{
					canvas.strokeStyle = this.borderColor; 
					canvas.lineWidth   = this.borderWidth;
					canvas.stroke();
				}
				canvas.closePath();
				canvas.fill();
				canvas.restore();				
};


Circle.prototype.contains = function(x,y) {
				var point = new Point(x,y);
				var distancia = point.getDistance(new Point(this.top+this.radio, this.left+this.radio));
				if (distancia<=this.radio) return true;
				else return false;
};


/********** Triangulo  ****************/
function Triangle(x1, y1, x2, y2, x3,y3) {
   Shape.call(this, x1, y1);
   this.x1=x1;
   this.y1=y1;
   this.x2=x2;
   this.y2=y2;
   this.x3=x3;
   this.y3=y3;
   this.type=TRIANGLE;
	
}

Triangle.prototype = new Shape;
Triangle.prototype.constructor = Triangle;
Triangle.prototype.render = function(canvas) {
	if (!this.visible) return;
	canvas.save();
	canvas.fillStyle = this.color;	
	canvas.beginPath();  
	canvas.moveTo(this.x1,this.y1);  
	canvas.lineTo(this.x2, this.y2); 
	canvas.lineTo(this.x3, this.y3);
	canvas.closePath();
	canvas.fill();	
	if (this.borderWidth!=0)
	{
		canvas.strokeStyle = this.borderColor; 
		canvas.lineWidth   = this.borderWidth;
		canvas.stroke();
	}
	canvas.restore();
};

Triangle.prototype.toString = function() {
	return this.type;
};


Triangle.prototype.contains = function(x,y) {
				
					return false;
};





/********* Text ************/
function Text(left, top, text) {
 	Shape.call(this, top, left);
    this.text=text;
	this.type=TEXT;	
	this.orientation=HORIZONTAL;


}


function Text(top, left, text, orientation) {
 	Shape.call(this, top, left);
    this.text=text;
	this.type=TEXT;	
	this.orientation=orientation;
	

}

Text.prototype = new Shape;
Text.prototype.constructor = Text;



Text.prototype.setFont = function(font) {
	this.font=font;
};


Text.prototype.render = function(canvas) {
	
	canvas.save();
	
	canvas.fillStyle    = this.color;
	canvas.font         = this.font;
	canvas.textBaseline = 'top';
	
	
	var dim = canvas.measureText(this.text);

	if (this.orientation!=HORIZONTAL)
	{
    	canvas.rotate(-Math.PI/2);	
		canvas.translate(-this.top,this.left);
	}
	else
	{
		
		//canvas.translate(this.top,this.left);
	}
	
	canvas.fillText (this.text, 0, 0);
	canvas.restore();
};





/*********   LINE   ***************/
function Line(pointX, pointY) {
	
 	Shape.call(this, pointX.x, pointX.y);
	this.point=pointY;
	this.type=LINE;
	this.color="#FFCCFF";
}

Line.prototype = new Shape;
Line.prototype.constructor = Line;

Line.prototype.remove = function() {
				this.canvas.clearRect(this.top, this.left, 1, 1);
};


Line.prototype.render = function(canvas) {
				Shape.prototype.render.call(this, canvas);
				
				canvas.save();
					
				canvas.fillStyle = this.color;	
				
				canvas.beginPath();  
				canvas.moveTo(this.left,this.top);  
				canvas.lineTo(this.point.x, this.point.y); 
				canvas.closePath();
				canvas.stroke();
				
				canvas.restore();				
};



var SVG =
{
		svgns : 'http://www.w3.org/2000/svg',
		xlinkns : "http://www.w3.org/1999/xlink",

	createSVGCanvas: function(parentNode, attributes)
	{
		attributes.push( ['xmlns', SVG.svgns], ['xmlns:xlink', 'http://www.w3.org/1999/xlink']);
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this._setProperties(svg, attributes);
		parentNode.appendChild( svg);
		return svg;
		
	}, 
	
	createRectangle : function (x, y, width, height,  attributes){
				var rect = document.createElementNS(this.svgns, "rect");
				rect.setAttribute("x",x);		
				rect.setAttribute("y",y);	
				rect.setAttribute("width",width);		
				rect.setAttribute("height",height);	
				SVG._setProperties(rect, attributes);
				return rect;
	},
	
	drawImage64 : function (x, y, width, height, base64, svgNode, attributes) {
		var node = SVG.createImage64(x, y, width, height, base64, attributes);
		svgNode.appendChild(node);
		return node;
	},
	
	createImage64 : function (x, y, width, height, base64,  attributes)	{
				var img = document.createElementNS(this.svgns, "image");
				img.setAttribute("x",x);		
				img.setAttribute("y",y);	
				img.setAttribute("width",width);		
				img.setAttribute("height",height);	
				img.setAttribute("xlink:href",base64);	
				SVG._setProperties(img, attributes);
				return img;
	},
	
	createLine:  function (x1, y1, x2, y2, attributes){
				var line = document.createElementNS(this.svgns,"line");
				line.setAttribute("x1",x1);		
				line.setAttribute("y1",y1);	
				line.setAttribute("x2", x2);	
				line.setAttribute("y2", y2);
				SVG._setProperties(line, attributes);
				return line;
	},
	
	createClip:  function (id, nodeToClip, attributes){
				var clip = document.createElementNS(this.svgns,"clipPath");
				clip.setAttribute("id",id);
				clip.appendChild(nodeToClip);
				return clip;
	},
	
	drawClip : function (id, nodeToClip, svgNode) {
		var node = SVG.createClip(id, nodeToClip);
		svgNode.appendChild(node);
		return node;
	},

	drawRectangle : function (cx, cy, width, height, svgNode, attributes) {
		try{
			var node = SVG.createRectangle(cx, cy, width, height, attributes);
			svgNode.appendChild(node);
		}
		catch(e){
			
			console.log("-------------------- ");
			console.log("Error on drawRectangle " + e);
			console.log(attributes);
			console.log("-------------------- ");
		}
			return node;
	},
	
	createEllipse : function (x, y, rx, ry,  attributes){
				var rect = document.createElementNS(this.svgns, "ellipse");
				rect.setAttribute("cx",x);		
				rect.setAttribute("cy",y);
				rect.setAttribute("rx",rx);		
				rect.setAttribute("ry",ry);	
				SVG._setProperties(rect, attributes);
				return rect;
 	},
	
	drawEllipse : function (cx, cy, rx, ry, svgNode, attributes) {
		var node = SVG.createEllipse(cx, cy, rx, ry, attributes);
		svgNode.appendChild(node);
		return node;
	},
	
	drawImage : function (x, y, canvasSVG, attributes) {
				var image = document.createElementNS(this.svgns, "image");
				image.setAttribute("x",x);		
				image.setAttribute("y",y);		
				canvasSVG.appendChild(image);
				SVG._setProperties(image, attributes);
	},

	drawLine : function (x1, y1, x2, y2, nodeSVG, attributes) {
		try{
				var line = SVG.createLine(x1, y1, x2, y2, attributes);
				nodeSVG.appendChild(line);
		}catch(e){
			debugger
		}
				return line;
	},
	
	
	 drawPath: function (d, nodeSVG, attributes) {
        var path = SVG.createPath(d, attributes);
        nodeSVG.appendChild(path);
        return path;
	},

	 createPoligon : function (points,  attributes){
        var poligon = document.createElementNS(this.svgns, "polygon");
        poligon.setAttribute("points",points);
        SVG._setProperties(poligon, attributes);
        return poligon;
    },
    
    drawPoligon : function (points,  canvasSVG, attributes){
    	var poligon = SVG.createPoligon(points, attributes);
    	canvasSVG.appendChild(poligon);
		return poligon;
    },
	//<polygon points="20,420, 300,420 160,20" />
	
	createPath : function (d,  attributes){
         var path = document.createElementNS(this.svgns, "path");
         path.setAttribute("d",d);
         SVG._setProperties(path, attributes);
         return path;
     },

	drawCircle : function (x, y, radio, canvasSVG, attributes) {
	
				var newText = document.createElementNS(this.svgns,"circle");
				newText.setAttribute("cx",x);		
				newText.setAttribute("cy",y);	
				newText.setAttribute("r",radio);	
				
				canvasSVG.appendChild(newText);
				this._setProperties(newText, attributes);	
				return newText;
	},
	
	
	_setProperties: function(node, attributes)
	{
		if (attributes instanceof Array){
				for (var i=0; i< attributes.length; i++)
				{
					node.setAttribute(attributes[i][0], attributes[i][1]);
				}
		}
		else{
			for ( var key in attributes){
				node.setAttribute(key, attributes[key]);
			}
		}
	},

/*	drawPath: function(pointsArray, canvasSVG, attributes){
				var path = document.createElementNS(this.svgns,"polyline");
				path.setAttribute ('id', id);
				
				var d= pointsArray[0].x+ " "+ pointsArray[0].y;
				for (var i=1; i< pointsArray.length; i++)
				{
						d=d+" "+pointsArray[i].x+" "+pointsArray[i].y; 
				}
				path.setAttribute ('points', d);
				canvasSVG.appendChild(path);
	},*/

	createText : function (x, y, text, attributes) {
				var node = document.createElementNS(this.svgns,"text");
				node.setAttributeNS(null , "x",x);		
				node.setAttributeNS(null, "y",y);	
				
				var textNode = document.createTextNode(text);
				node.appendChild(textNode);
				
				this._setProperties(node, attributes);
				return node;
	},
	
	drawText : function (x, y, text, canvasSVG, attributes) {
				var text = SVG.createText(x, y, text, attributes);
				canvasSVG.appendChild(text);
				return text;
	},



	drawGroup: function(svgNode, attributes)
	{
		 var group = SVG.createGroup(attributes);
		 svgNode.appendChild(group);
		 return group;
	},
			
	createGroup: function(attributes){
				var group = document.createElementNS(this.svgns,"g");
				this._setProperties(group, attributes);	
				return group;
	}
			
};



var CanvasToSVG = {
		
	convert: function(sourceCanvas, targetSVG, x, y, id, attributes) {
		
		var img = this._convert(sourceCanvas, targetSVG, x, y, id);
		
		for (var i=0; i< attributes.length; i++)
		{
			img.setAttribute(attributes[i][0], attributes[i][1]);
		}
	},
	
	_convert: function(sourceCanvas, targetSVG, x, y, id) {
		var svgNS = "http://www.w3.org/2000/svg";
		var xlinkNS = "http://www.w3.org/1999/xlink";
		// get base64 encoded png from Canvas
		var image = sourceCanvas.toDataURL();

		// must be careful with the namespaces
		var svgimg = document.createElementNS(svgNS, "image");

		svgimg.setAttribute('id', id);
	
		//svgimg.setAttribute('class', class);
		//svgimg.setAttribute('xlink:href', image);
		svgimg.setAttributeNS(xlinkNS, 'xlink:href', image);
		

		

		svgimg.setAttribute('x', x ? x : 0);
		svgimg.setAttribute('y', y ? y : 0);
		svgimg.setAttribute('width', sourceCanvas.width);
		svgimg.setAttribute('height', sourceCanvas.height);
		//svgimg.setAttribute('cursor', 'pointer');
		svgimg.imageData = image;
	
		targetSVG.appendChild(svgimg);
		return svgimg;
	},
	
	importSVG: function(sourceSVG, targetCanvas) {
	    svg_xml = sourceSVG;//(new XMLSerializer()).serializeToString(sourceSVG);
	    var ctx = targetCanvas.getContext('2d');

	    var img = new Image();
	    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
//	    img.onload = function() {
	        ctx.drawImage(img, 0, 0);
//	    };
	}
	
};
/*
Graph.prototype.importSVG = function(sourceSVG, targetCanvas) {
	sourceSVG = this._svg;
	targetCanvas = document.createElement('canvas'); 
    // https://developer.mozilla.org/en/XMLSerializer
    svg_xml = (new XMLSerializer()).serializeToString(sourceSVG);
    var ctx = targetCanvas.getContext('2d');
    // this is just a JavaScript (HTML) image
    var img = new Image();
    // http://en.wikipedia.org/wiki/SVG#Native_support
    // https://developer.mozilla.org/en/DOM/window.btoa
    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
    img.onload = function() {
        // after this, Canvas’ origin-clean is DIRTY
        ctx.drawImage(img, 0, 0);
    }
};
*/var userUI = new function()
{
	this.clientMessages =  { info:[], warning:[], error:[]};
	
	this.getUser = function() {
		return  wc_getFullUser();
	};
	
	this.getUserInfo = function() {
		return  wc_getUserInfo();
	};
	
	this.getServerMessages  = function() {
		return wc_getMessages();
	};
	
	this.getClientMessages  = function() {
		return this.clientMessages;
	};
	
	this.addWarningMessage  = function(message) {
		this.clientMessages.warning.push(message);
	};
	
	this.addErrorMessage  = function(message) {
		this.clientMessages.error.push(message);
	};
	
	this.addInfoMessage  = function(message) {
		this.clientMessages.info.push(message);
	};
	
	this.clearAllClientMessages = function()
	{
		this.clientMessages = { info:[], warning:[], error:[]};	
	};
	
	this.getData = function()
	{
			return wc_getOwnedDataList();
	};
	
	this.getJobData = function(jobId)
	{
			var datalist = wc_getOwnedDataList();
			var dataInJob= new Array();
			
			if (datalist==null ) return dataInJob;
			
			for (var i = 0; i< datalist.length; i++)
			{
					if (datalist[i].jobId == jobId)
					{
						dataInJob.push(datalist[i]);	
					}
			}
			return dataInJob;
	};
};
      
  


function getSO(){
   	
   	var navInfo = window.navigator.appVersion.toLowerCase();
   	var so = 'Unknown';    
    if(navInfo.indexOf('win') != -1){  
    	so = 'Windows';  
    }else if(navInfo.indexOf('x11') != -1){  
		so = 'Linux';
	}else if(navInfo.indexOf('mac') != -1){  
		so = 'Macintosh'; 
	}
	return so;  
  }  


/**

BROWSER: encapsula todos los métodos que nos dan información sobre el navegador

**/
var Browser = {};

Browser.getappCodeName = function() {
	return navigator.appCodeName;
};

Browser.getappVersion = function() {
	return navigator.appVersion;
};

Browser.cookieEnabled = function() {
	return navigator.cookieEnabled;
};

Browser.getPlatform = function() {
	return navigator.platform;
};

Browser.getuserAgent = function() {
	return navigator.userAgent;
};



  function getBrowser(){
  var version ='';
  var browser='';
  	$.each($.browser, function(i, val){
		
		if (i == 'version'){
			version=val
		}
		if (val == true){
			browser = i;
		}
  	});
	return "Browser: "+ browser + " V."+ version;
  }
  
  
  function getBrowserName(){
  var version ='';
  var browser='';
  	$.each($.browser, function(i, val){
		if (val == true){
			browser = i;
		}
  	});
	return browser;
  }
  var Config = function(cookieName){
	
	// cookie name
	var cookieName = cookieName;
	
	/*
	 * COOKIE MANAGEMENT
	 */

	this.save = function (){
	    	//alert("stringify: " +  JSON.stringify(this));
		$.cookie(cookieName, JSON.stringify(this));
		//var aux = JSON.parse($.cookie(cookieName));
	};
	
	this.finalize = function (){	
		$.cookie(cookieName, null);		
		// this.prototype = null;
	};
	
	/*
	 * GETTERS AND SETTERS  
	 */
	
	this.set = function(key,value){		
		this[key] = value;
		this.save();
	};
	
	this.get = function(key){
		return this[key];
	};
	
	// init
	if($.cookie(cookieName)!=null) {	    	
		// getting old properties
		var aux = JSON.parse($.cookie(cookieName));
		// setting old properties to new object
		for (var key in aux){
		    if(key!="save" && key!="finalize" && key!="get" && key!="set"){
		    	this[key] = aux[key];
		    }
		}
	};
	
	// initial save
	this.save();

};

function getSO(){var b=window.navigator.appVersion.toLowerCase(),a="Unknown";if(b.indexOf("win")!=-1)a="Windows";else if(b.indexOf("x11")!=-1)a="Linux";else if(b.indexOf("mac")!=-1)a="Macintosh";return a}var Browser={};Browser.getappCodeName=function(){return navigator.appCodeName};Browser.getappVersion=function(){return navigator.appVersion};Browser.cookieEnabled=function(){return navigator.cookieEnabled};Browser.getPlatform=function(){return navigator.platform};Browser.getuserAgent=function(){return navigator.userAgent};
function getBrowser(){var b="",a="";$.each($.browser,function(c,d){if(c=="version")b=d;if(d==true)a=c});return"Browser: "+a+" V."+b}function getBrowserName(){var b="",a="";$.each($.browser,function(c,d){if(d==true)a=c});return a};var Config=function(b){b=b;this.save=function(){$.cookie(b,JSON.stringify(this))};this.finalize=function(){$.cookie(b,null)};this.set=function(d,g){this[d]=g;this.save()};this.get=function(d){return this[d]};if($.cookie(b)!=null){var a=JSON.parse($.cookie(b));for(var c in a)if(c!="save"&&c!="finalize"&&c!="get"&&c!="set")this[c]=a[c]}this.save()};var PUBMED_RSS,BIOINFO_RSS,FEED_OBJECT,NUMBER_OF_FEEDS=0;
function initFeedUrls(){PUBMED_RSS={};PUBMED_RSS.babelomics="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18A2e0_HeVtQ9k4iNuwfZFSuh5Ck38BCLWW3Wrlll4hWvJ8AtH";PUBMED_RSS.gepas="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1JKSd2KF3MGnV8mU6zDJ5PPH9-xMKOjyzBOmIeDyef9oPjR19C";PUBMED_RSS.fatigo="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=14GVrEVieJsBLt8q3l7R_YRQF8Tljz7pDcLCPmsBXT7C3vcMrI";PUBMED_RSS.fatiscan="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18ervbTh5AP3vfhgpfpT8nuS-nlu-HGIjZU1IFPR3fJ15OKAOb";
PUBMED_RSS.gesbap="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1Rkszs2HVZ2QHM3VV-sfTuWBxZ3syAewBayCSYb3ariok2b1DW";PUBMED_RSS.genecodis="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1h7Su3P88Y-s0IJD2PR7EPdYjWx0n1H8LGb-Zm150P3-TFVERh";PUBMED_RSS.blast2go="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1HC7gWvsJppOwqCZp0h91Mvqp-QMP15A6Y7Qg2jKNZy3Ap4gfa";PUBMED_RSS.snow="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1FU_ZGTY7E6tYYsWpRpUfCUmW163CN4E08cHCccdpHbJvTmgv7";
BIOINFO_RSS={};BIOINFO_RSS.babelomics="http://bioinfo.cipf.es/taxonomy/term/53/feed/xml";BIOINFO_RSS.gepas="http://bioinfo.cipf.es/taxonomy/term/52/feed/xml";BIOINFO_RSS.fatiscan="http://bioinfo.cipf.es/taxonomy/term/65/feed/xml";BIOINFO_RSS.snow="http://bioinfo.cipf.es/taxonomy/term/50/feed/xml"}
function loadFeedByTags(b,a){var c=new StringBuffer;c.append("<div id ='referencesContainer' class='feed-content'>");c.append("\t<table style='width:100%; height:100%'>");c.append("\t\t<tr valign='middle'>");c.append("\t\t\t<td align='center'>loading references...<img src='resources/images/icons/Waiting.gif' alt='' /></td>");c.append("\t\t</tr>");c.append("\t</table>");c.append("</div> ");$("#"+a+"_references").append(c.toString());b=fromTags2Urls(b);FEED_OBJECT=[];loadUrlFeeds(b,0,"referencesContainer")}
function fromTags2Urls(b){var a,c=[];if(b.length>0)for(var d=0;d<b.length;d++){a=b[d];PUBMED_RSS||initFeedUrls();if(PUBMED_RSS[a])c=c.concat(PUBMED_RSS[a])}return c}function loadUrlFeeds(b,a,c){$.jGFeed(b[a],function(d){if(d!=null)FEED_OBJECT=FEED_OBJECT.concat(d);a++;a<b.length?loadUrlFeeds(b,a,c):renderFeeds(c)})}
function renderFeeds(b){var a=new StringBuffer,c=[],d=[];if(FEED_OBJECT!=null&&FEED_OBJECT.length>0){for(var g=0;g<FEED_OBJECT.length;g++)for(var h=FEED_OBJECT[g],m=0;m<h.entries.length;m++){var n=h.entries[m];if(!d[n.title]){d[n.title]=true;c=c.concat(h.entries[m])}}a.appendln("<div>&nbsp;</div>");a.appendln("<div>&nbsp;</div>");a.appendln("<div>&nbsp;</div>");a.append("<span class='references-title'>References</span>");a.append("<ul>");for(m=0;m<c.length;m++){n=c[m];a.append("<li>");a.append("<span>"+
n.author+". </span>");a.append("<span class='feed-content'><a href='"+n.link+"'  target='_blank'> "+n.title+"</a></span>");a.append("<span>"+n.categories+"</span>");d=n.content.split("<a");for(g=0;g<d.length;g++){h=d[g].lastIndexOf("</a>");d[g]=d[g].substring(0,h)}a.append("<div class='feed-link'><a class='text-show feed-link'>...see PubMed links</a>");a.append("\t<span class='text-hide feed-content'>");for(g=0;g<d.length;g++)if(d[g]!=null&&d[g]!=""){a.append("<a target='_blank'");a.append(d[g]);
a.append("</a>")}a.append("\t</spam>");a.append("</div>");a.append("</li>");a.appendln("<div>&nbsp;</div>")}a.append("</ul>")}else a.append("<div class='feed-content'>no feeds found</div");$("#"+b).html(a.toString());initReadMore()};if(!this.JSON)this.JSON={};
(function(){function b(f){return f<10?"0"+f:f}function a(f){g.lastIndex=0;return g.test(f)?'"'+f.replace(g,function(i){var j=n[i];return typeof j==="string"?j:"\\u"+("0000"+i.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+f+'"'}function c(f,i){var j,l,o=h,k,e=i[f];if(e&&typeof e==="object"&&typeof e.toJSON==="function")e=e.toJSON(f);if(typeof q==="function")e=q.call(i,f,e);switch(typeof e){case "string":return a(e);case "number":return isFinite(e)?String(e):"null";case "boolean":case "null":return String(e);case "object":if(!e)return"null";
h+=m;k=[];if(Object.prototype.toString.apply(e)==="[object Array]"){l=e.length;for(f=0;f<l;f+=1)k[f]=c(f,e)||"null";i=k.length===0?"[]":h?"[\n"+h+k.join(",\n"+h)+"\n"+o+"]":"["+k.join(",")+"]";h=o;return i}if(q&&typeof q==="object"){l=q.length;for(f=0;f<l;f+=1){j=q[f];if(typeof j==="string")if(i=c(j,e))k.push(a(j)+(h?": ":":")+i)}}else for(j in e)if(Object.hasOwnProperty.call(e,j))if(i=c(j,e))k.push(a(j)+(h?": ":":")+i);i=k.length===0?"{}":h?"{\n"+h+k.join(",\n"+h)+"\n"+o+"}":"{"+k.join(",")+"}";
h=o;return i}}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+b(this.getUTCMonth()+1)+"-"+b(this.getUTCDate())+"T"+b(this.getUTCHours())+":"+b(this.getUTCMinutes())+":"+b(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var d=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
g=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,h,m,n={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},q;if(typeof JSON.stringify!=="function")JSON.stringify=function(f,i,j){var l;m=h="";if(typeof j==="number")for(l=0;l<j;l+=1)m+=" ";else if(typeof j==="string")m=j;if((q=i)&&typeof i!=="function"&&(typeof i!=="object"||typeof i.length!=="number"))throw new Error("JSON.stringify");return c("",
{"":f})};if(typeof JSON.parse!=="function")JSON.parse=function(f,i){function j(l,o){var k,e,p=l[o];if(p&&typeof p==="object")for(k in p)if(Object.hasOwnProperty.call(p,k)){e=j(p,k);if(e!==undefined)p[k]=e;else delete p[k]}return i.call(l,o,p)}d.lastIndex=0;if(d.test(f))f=f.replace(d,function(l){return"\\u"+("0000"+l.charCodeAt(0).toString(16)).slice(-4)});if(/^[\],:{}\s]*$/.test(f.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){f=eval("("+f+")");return typeof i==="function"?j({"":f},""):f}throw new SyntaxError("JSON.parse");}})();function StringBuffer(){this.buffer=[]}StringBuffer.prototype.append=function(b){this.buffer.push(b);return this};StringBuffer.prototype.appendln=function(b){this.buffer.push(b+"\n");return this};StringBuffer.prototype.toString=function(){return this.buffer.join("")};Math.sha1Hash=function(b){var a=[1518500249,1859775393,2400959708,3395469782];b+=String.fromCharCode(128);for(var c=Math.ceil((b.length/4+2)/16),d=new Array(c),g=0;g<c;g++){d[g]=new Array(16);for(var h=0;h<16;h++)d[g][h]=b.charCodeAt(g*64+h*4)<<24|b.charCodeAt(g*64+h*4+1)<<16|b.charCodeAt(g*64+h*4+2)<<8|b.charCodeAt(g*64+h*4+3)}d[c-1][14]=(b.length-1)*8/Math.pow(2,32);d[c-1][14]=Math.floor(d[c-1][14]);d[c-1][15]=(b.length-1)*8&4294967295;b=1732584193;h=4023233417;var m=2562383102,n=271733878,q=3285377520,
f=new Array(80),i,j,l,o,k;for(g=0;g<c;g++){for(var e=0;e<16;e++)f[e]=d[g][e];for(e=16;e<80;e++)f[e]=Math.ROTL(f[e-3]^f[e-8]^f[e-14]^f[e-16],1);i=b;j=h;l=m;o=n;k=q;for(e=0;e<80;e++){var p=Math.floor(e/20);p=Math.ROTL(i,5)+Math.f(p,j,l,o)+k+a[p]+f[e]&4294967295;k=o;o=l;l=Math.ROTL(j,30);j=i;i=p}b=b+i&4294967295;h=h+j&4294967295;m=m+l&4294967295;n=n+o&4294967295;q=q+k&4294967295}return b.toHexStr()+h.toHexStr()+m.toHexStr()+n.toHexStr()+q.toHexStr()};
Math.f=function(b,a,c,d){switch(b){case 0:return a&c^~a&d;case 1:return a^c^d;case 2:return a&c^a&d^c&d;case 3:return a^c^d}};Math.ROTL=function(b,a){return b<<a|b>>>32-a};Number.prototype.toHexStr=function(){for(var b="",a,c=7;c>=0;c--){a=this>>>c*4&15;b+=a.toString(16)}return b};var userUI=new (function(){this.clientMessages={info:[],warning:[],error:[]};this.getUser=function(){return wc_getFullUser()};this.getUserInfo=function(){return wc_getUserInfo()};this.getServerMessages=function(){return wc_getMessages()};this.getClientMessages=function(){return this.clientMessages};this.addWarningMessage=function(b){this.clientMessages.warning.push(b)};this.addErrorMessage=function(b){this.clientMessages.error.push(b)};this.addInfoMessage=function(b){this.clientMessages.info.push(b)};
this.clearAllClientMessages=function(){this.clientMessages={info:[],warning:[],error:[]}};this.getData=function(){return wc_getOwnedDataList()};this.getJobData=function(b){var a=wc_getOwnedDataList(),c=[];if(a==null)return c;for(var d=0;d<a.length;d++)a[d].jobId==b&&c.push(a[d]);return c}});/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
var PUBMED_RSS;
var BIOINFO_RSS;

var FEED_OBJECT;
var NUMBER_OF_FEEDS=0;

function initFeedUrls(){
	
	// Pubmed
	PUBMED_RSS = {};
	PUBMED_RSS["babelomics"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18A2e0_HeVtQ9k4iNuwfZFSuh5Ck38BCLWW3Wrlll4hWvJ8AtH";
	PUBMED_RSS["gepas"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1JKSd2KF3MGnV8mU6zDJ5PPH9-xMKOjyzBOmIeDyef9oPjR19C";
	PUBMED_RSS["fatigo"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=14GVrEVieJsBLt8q3l7R_YRQF8Tljz7pDcLCPmsBXT7C3vcMrI";
	PUBMED_RSS["fatiscan"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18ervbTh5AP3vfhgpfpT8nuS-nlu-HGIjZU1IFPR3fJ15OKAOb";
	PUBMED_RSS["gesbap"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1Rkszs2HVZ2QHM3VV-sfTuWBxZ3syAewBayCSYb3ariok2b1DW";
	PUBMED_RSS["genecodis"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1h7Su3P88Y-s0IJD2PR7EPdYjWx0n1H8LGb-Zm150P3-TFVERh";
	PUBMED_RSS["blast2go"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1HC7gWvsJppOwqCZp0h91Mvqp-QMP15A6Y7Qg2jKNZy3Ap4gfa";
	PUBMED_RSS["snow"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1FU_ZGTY7E6tYYsWpRpUfCUmW163CN4E08cHCccdpHbJvTmgv7";
		
	// Bioinfo
	BIOINFO_RSS = {};
	BIOINFO_RSS["babelomics"] = "http://bioinfo.cipf.es/taxonomy/term/53/feed/xml";
	BIOINFO_RSS["gepas"] = "http://bioinfo.cipf.es/taxonomy/term/52/feed/xml";
	BIOINFO_RSS["fatiscan"] = "http://bioinfo.cipf.es/taxonomy/term/65/feed/xml";
	BIOINFO_RSS["snow"] = "http://bioinfo.cipf.es/taxonomy/term/50/feed/xml";
	
}

function loadFeedByTags(tags, container){	
	// de tags a urls
	var input = new StringBuffer();
	input.append("<div id ='referencesContainer' class='feed-content'>");
	input.append("	<table style='width:100%; height:100%'>");
	input.append("		<tr valign='middle'>");
	input.append("			<td align='center'>loading references...<img src='resources/images/icons/Waiting.gif' alt='' /></td>");
	input.append("		</tr>");
	input.append("	</table>");                
	input.append("</div> ");
	
	$("#" + container + "_references").append(input.toString());
	var urls = fromTags2Urls(tags);	
	// 
	FEED_OBJECT = [];
	loadUrlFeeds(urls,0,'referencesContainer');
}


function fromTags2Urls(tags){
	var tag;
	var urlContainer = [];
	if(tags.length>0){
		for(var i=0; i<tags.length; i++){
			tag = tags[i];
			if (!PUBMED_RSS)initFeedUrls();
			if (PUBMED_RSS[tag]){
				urlContainer = urlContainer.concat(PUBMED_RSS[tag]);
			}
		}
	}
	return urlContainer;
}

function loadUrlFeeds(urls,pos,container){	
	var curl = urls[pos];
	var success = function(feed){		
		// concat feed
		if(feed!=null){
			FEED_OBJECT = FEED_OBJECT.concat(feed);
		}
		// prepare next
		pos++;
	    if(pos<urls.length){
	    	loadUrlFeeds(urls,pos,container);
	    } else {
	    	renderFeeds(container);
	    }
	};
	$.jGFeed(curl,success);	
}

function renderFeeds(container){
	var input = new StringBuffer();
	var entries = [];
	var entryHash = [];
	if (FEED_OBJECT!=null && FEED_OBJECT.length>0){
		  for(var i=0; i<FEED_OBJECT.length; i++){
			  var feeds = FEED_OBJECT[i];			  
			  for(var j=0; j<feeds.entries.length; j++){
				  var entry = feeds.entries[j];
				  if(entryHash[entry.title]){
					  // NOTHING??
				  } else {
					  entryHash[entry.title] = true;
					  entries = entries.concat(feeds.entries[j]);
				  }
				  //entries = entries.concat(feeds.entries[j]);
			  }
		  }
		  // remove duplicates, etc...
			  
		  //
		  input.appendln( "<div>&nbsp;</div>");
		  input.appendln( "<div>&nbsp;</div>");
		  input.appendln( "<div>&nbsp;</div>");
		  input.append("<span class='references-title'>References</span>");
		  input.append("<ul>");
		  for(var j=0; j<entries.length; j++){
			  var entry = entries[j];
			  
			  input.append("<li>");
			
			  //Please include the following publications in your references: 
			  //input.append("		<span>" + entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span>");
			  
			  
			  input.append("<span>" + entry.author + ". </span>");
			  input.append("<span class='feed-content'><a href='" + entry.link + "'  target='_blank'> " + entry.title + "</a></span>");
			  input.append("<span>" + entry.categories + "</span>");
			
			  
			  var linksCaptures = entry.content.split("<a");
			  for (var i = 0 ; i < linksCaptures.length;i++){
				  var endOfLink = linksCaptures[i].lastIndexOf("</a>");
				  linksCaptures[i] = linksCaptures[i].substring(0, endOfLink);
			  }
			  
			  input.append("<div class='feed-link'><a class='text-show feed-link'>...see PubMed links</a>");
			  input.append("	<span class='text-hide feed-content'>");
				  for (var i = 0 ; i < linksCaptures.length;i++){
					  if (linksCaptures[i] != null && linksCaptures[i] != ""){
					  input.append("<a target='_blank'");
					  input.append(linksCaptures[i]);
					  input.append("</a>");
					  }
				  	}
			  input.append("	</spam>");
			  input.append("</div>");
			  
			  input.append("</li>");
			  input.appendln( "<div>&nbsp;</div>");
		  }		  
		  input.append("</ul>");
	
	} else {
		input.append("<div class='feed-content'>no feeds found</div");
	}
	$("#" + container).html(input.toString());
	initReadMore();
}


//function loadFeedReaderFromPubMed(){
//	var hashData = new Array();
//	hashData["babelomics"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1xMHPfv-Z-Bhf-TI-j1PQsgpj_MAo4FDJ3YF7uT1krJiKj7Y-e";
//	//fatigo j. dopazo
//	hashData["fatigo"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=14GVrEVieJsBLt8q3l7R_YRQF8Tljz7pDcLCPmsBXT7C3vcMrI";
//	
//	//Gene set analysis Medina I Dopazo J
//	hashData["fatiscan"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18ervbTh5AP3vfhgpfpT8nuS-nlu-HGIjZU1IFPR3fJ15OKAOb";
//	//gesbap Dopazo J
//	hashData["gesbap"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1Rkszs2HVZ2QHM3VV-sfTuWBxZ3syAewBayCSYb3ariok2b1DW";
//	//ordered bu pubDate 
//	hashData["genecodis"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=10mYP7P18fge0rER3CvMpe8a7xjxhumSgrTV3cWqjwSUV7EEJy";
//	//snow
//	hashData["blast2go"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1HC7gWvsJppOwqCZp0h91Mvqp-QMP15A6Y7Qg2jKNZy3Ap4gfa";
//	PUBMED_RSS = hashData;
//	
//}
//
//function loadFeedReaderFromBioinfo(){
//	var hashData = new Array();
//	hashData["babelomics"] = "http://bioinfo.cipf.es/taxonomy/term/53/feed/xml";
//	//fatigo j. dopazo
//	
//	hashData["gepas"] = "http://bioinfo.cipf.es/taxonomy/term/52/feed/xml";
//	
//	//Gene set analysis Medina I Dopazo J
//	hashData["fatiscan"] = "http://bioinfo.cipf.es/taxonomy/term/65/feed/xml";
//	
//	//snow
//	hashData["snow"] = "http://bioinfo.cipf.es/taxonomy/term/50/feed/xml";
//	BIOINFO_RSS = hashData;
//	
//}

//
//function loadFeedByTagsR(tags, idContainer,i){
//	NUMBER_OF_FEEDS = 0;
//	FEED_OBJECT = [];
////	recursiveme(0,tag,tags,idContainer,i);	 
//}
//
//function recursiveme(j,actualTag,tags,idContainer,i){
//	
// if (j < urlContainer.length){
//	
//	var urlLocal = urlContainer[j];
//	
//	$.jGFeed(urlLocal,function(feeds){
//		var urlLocalinter = urlLocal;
//	  // Check for errors
//	  if(!feeds){
//	    // there was an error
//		  NUMBER_OF_FEEDS++;
//	    return false;
//	  } 
//	
//	  if (PUBMED_RSS[actualTag] == urlLocalinter){
//	
//		  for (var h = 0; h<feeds.entries.length;h++){
//			  feeds.entries[h].rss="pubmed";
//		  }
//	  }
//	  else if (BIOINFO_RSS[actualTag]== urlLocalinter){
//		 
//		  for (var g = 0; g<feeds.entries.length;g++){
//			  feeds.entries[g].rss="bioinfo";
//		  }
//	  }  
//	  FEED_OBJECT = FEED_OBJECT.concat(feeds.entries);
//	  NUMBER_OF_FEEDS++;
//	  
//	  completeFeed(idContainer,urlContainer.length);
//	  j++;
//	 
//	  recursiveme(j, actualTag,tags, idContainer,i);
//	}, 100);
//}
// else {
//	 
//	i++;
//	 (loadFeedByTagsR(tags,idContainer,i));
// }
//}
//
//function completeFeed(idContainer, callBack_flag){
//	if (NUMBER_OF_FEEDS == callBack_flag){
//	 var tmpStr = new StringBuffer();
//	tmpStr.append("<table id = 'tb_"+idContainer+"' class='entrada'> ");
//	  for(var i=0; i<FEED_OBJECT.length; i++){
//	    var entry = FEED_OBJECT[i];
//	    var hashData = new Array();
//		  hashData[entry.title] = "true";
//		tmpStr.append("<tr><td> ");
//		
//		//title
//		//link
//		//author
//		//publish date null
//		//contentSnippet
//		//content: no merece
////		alert("link"+entry.link);
////		alert("date"+entry.publishedDate);
////		alert("date"+entry.publishedDate);
////		alert("contentSnippet"+entry.contentSnippet);
////		alert("content"+entry.content);
//		//tmpStr.append("<div class='contenido'><a href='"+entry.link+"' target='_blank'>"+ entry.title + "</a></div>");
//		if (entry.rss=="pubmed"){
//		tmpStr.append("<br/>");
//		tmpStr.append("<div class='feed-content'><a class='text-show wum-data-link'>...see PubMed references</a><span class='text-hide'>"+ entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span></div>");
//		}
//		
//		if (entry.rss=="bioinfo"){
//			tmpStr.append("<br/>");
//			tmpStr.append("<div class='feed-content'><a class='text-show wum-data-link'>...see our references</a><span class='text-hide'>"+ entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span></div>");
//			}
//		
//		//tmpStr.append("<div class='feed-content'>"+ entry.content + "</div>");
//		//var fecha = entry.publishedDate.split(" ");
//		//tmpStr.append("<div class='fecha'> " + fecha[1]+ " " +fecha[2]+" " + fecha[3]+ " "+ fecha[4]+"</div>");
//		//tmpStr.append("</td></tr> ");
//	  }
//	  tmpStr.append("</table> ");
//	  $("#"+idContainer).append(tmpStr.toString());
//	}
//	
//}

 Math.sha1Hash = function(msg)
 {
     // constants [§4.2.1]
     var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];


     // PREPROCESSING 
  
     msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

     // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
     var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ‘1’ + appended length
     var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
     var M = new Array(N);
     for (var i=0; i<N; i++) {
         M[i] = new Array(16);
         for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
             M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
                       (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
         }
     }
     // add length (in bits) into final pair of 32-bit integers (big-endian) [5.1.1]
     // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
     // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
     M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
     M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

     // set initial hash value [§5.3.1]
     var H0 = 0x67452301;
     var H1 = 0xefcdab89;
     var H2 = 0x98badcfe;
     var H3 = 0x10325476;
     var H4 = 0xc3d2e1f0;

     // HASH COMPUTATION [§6.1.2]

     var W = new Array(80); var a, b, c, d, e;
     for (var i=0; i<N; i++) {

         // 1 - prepare message schedule 'W'
         for (var t=0;  t<16; t++) W[t] = M[i][t];
         for (var t=16; t<80; t++) W[t] = Math.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);

         // 2 - initialise five working variables a, b, c, d, e with previous hash value
         a = H0; b = H1; c = H2; d = H3; e = H4;

         // 3 - main loop
         for (var t=0; t<80; t++) {
             var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
             var T = (Math.ROTL(a,5) + Math.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
             e = d;
             d = c;
             c = Math.ROTL(b, 30);
             b = a;
             a = T;
         }

         // 4 - compute the new intermediate hash value
         H0 = (H0+a) & 0xffffffff;  // note 'addition modulo 2^32'
         H1 = (H1+b) & 0xffffffff; 
         H2 = (H2+c) & 0xffffffff; 
         H3 = (H3+d) & 0xffffffff; 
         H4 = (H4+e) & 0xffffffff;
     }

     return H0.toHexStr() + H1.toHexStr() + H2.toHexStr() + H3.toHexStr() + H4.toHexStr();
 }

 //
 // function 'f' [§4.1.1]
 //
 Math.f = function(s, x, y, z) 
 {
     switch (s) {
     case 0: return (x & y) ^ (~x & z);           // Ch()
     case 1: return x ^ y ^ z;                    // Parity()
     case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
     case 3: return x ^ y ^ z;                    // Parity()
     }
 }

 //
 // rotate left (circular left shift) value x by n positions [§3.2.5]
 //
 Math.ROTL = function(x, n)
 {
     return (x<<n) | (x>>>(32-n));
 }

 //
 // extend Number class with a tailored hex-string method 
 //   (note toString(16) is implementation-dependant, and 
 //   in IE returns signed numbers when used on full words)
 //
 Number.prototype.toHexStr = function()
 {
     var s="", v;
     for (var i=7; i>=0; i--) { v = (this>>>(i*4)) & 0xf; s += v.toString(16); }
     return s;
 }

 	
function SVGComponent (componentID, targetNode,  args) {

	/** Groups and layers */
	this.SVGComponentNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	/** target */
	this.targetID = targetNode.id;
	
	/** Coordenates with default Setting */
	this.bottom = 30;
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;
	this.svgHeight = this.height;
	
	
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = false;
	this.titleName = null;
	this.titleFontSize = 10;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.bottom!=null){
			this.bottom = args.bottom;		
		}
		if (args.top!=null){
			this.top = args.top;		
		}
		if (args.left!=null){
			this.left = args.left;		
		}
		if (args.right!=null){
			this.right = args.right;		
		}
		if (args.width!=null){
			this.width = args.width;		
		}
		if (args.height!=null){
			this.height = args.height;	
			this.svgHeight = args.height;		
		}
		if (args.svgHeight!=null){
			this.svgHeight = args.svgHeight;		
		}
		
		if (args.backgroundColor!=null){
			this.backgroundColor = args.backgroundColor;		
		}
		if (args.titleFontSize!=null){
			this.titleFontSize = args.titleFontSize;		
		}
		if (args.titleColor!=null){
			this.titleColor = args.titleColor;	
		}
		if (args.title!=null){
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow!=null){
			this.overflow = args.overflow;
		}
	}
	
	/** id manage */
	this.id = SVGComponenterID;	
	this.idSVGComponent = this.id + "_Features";
	this.namesID = this.id + "_Names";
	this.idMain = this.id + "_Main";
	
	/** Events */
	this.click = new Event(this);
	
};




SVGComponent.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor ) {
	var container = document.getElementById(targetID);
	if (this.overflow){
		container.setAttribute("overflow-y", "auto");
	}
	
	this._svg = SVG.createSVGCanvas(container, [["id", id], ["height", this.svgHeight], ["width", this.right]]);
	var rect = SVG.drawRectangle(this.left, 0, this.right - this.left , this.svgHeight, this._svg, [["fill", backgroundColor],[id, id + "_background"]]);
	
	return this._svg;
};



SVGComponent.prototype.mouseClick = function(event){};
SVGComponent.prototype.mouseMove = function(event){};
SVGComponent.prototype.mouseDown = function(event){};
SVGComponent.prototype.mouseUp = function(event){};


SVGComponent.prototype.init = function(){
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	this.SVGComponentNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idSVGComponent]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idLabels]]);
	
	/** SVG Events listener */
	var _this = this;
	this._svg.addEventListener("click", function(event) {_this.mouseClick(event); }, false);
    this._svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this._svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this._svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);

};

/* CONTROLLER */
function GraphController(plotGraph, targetId, width, height, id) {
  
   this._model = plotGraph;
   this.id = id;
   this.targetId = targetId;
   this.interactomeId = "";

   this._layouts = new Array();
   
   this._layoutIndex = 0;
   this._showNodeLabels = true;
   this.height = height;
   this.width = width ;

   this.graphScale = 1;
   this.nodeScale = 1;

   this.nodeIdClicked = null;//This is the variable with the clicked node
   this.edgeIdClicked = null;//This is the variable with the clicked edge
   this.actionClick = 0; // 0 = move node; 1 = source edge node; 2 = target edge node
   this.canvasClicked = false;//it says whether canvas has been clicked or not 
   this.layoutCoordenates = new Array();

    this.init();
    this.svg = this.drawStaticHTML();
	
    this._view = new GraphView(this,this.svg,  width, height, id);

    //Labels
    this._showNodeLabels = true;
    
    var _this = this;

    this._view.nodeMoving.addEventListener(function (sender, nodeID){
			_this.nodeMoving(nodeID);
    });
    
    this._view.nodeClick.addEventListener(function (sender, nodeID){
		_this.nodeClicked(nodeID);
    });
    
    this._view.edgeClick.addEventListener(function (sender, nodeID){
		_this.edgeClicked(nodeID);
    });
    this._view.canvasClick.addEventListener(function (sender){
		_this.clickOnCanvas();
    });
    
    this._view.canvasMovingEvent.addEventListener(function (sender, coordenates){
    	 _this.canvasMoving(coordenates);
    });
    //Events
     this.nodeClick = new Event();
     this.edgeClick = new Event();
    this.canvasClick = new Event();
};

GraphController.prototype = {
	
    getSelectedNodeId : function(){
		return this._view.selectedNode;
    },
    getSelectedEdgeId : function(){
		return this._view.selectedEdge;
    },
    
    deserializer : function(jsonbject){
//    	var jsonbject = JSON.parse(json);
    	this._coordenates = jsonbject.Graph.coordenates;
    	this._shape = jsonbject.Graph.shape;
    	this._color = jsonbject.Graph.color;
    	this._size = jsonbject.Graph.size;
    	this._opacity = jsonbject.Graph.opacity;
    	this._id_title = jsonbject.Graph.id_title;
    	
    	this._nodeStrokeWidth = jsonbject.Graph.nodeStrokeWidth;
    	this._colorOfEdges = jsonbject.Graph.colorOfEdges;
    	this._deletedEdges = this._deserializerBooleans(jsonbject.Graph.deletedEdges);
    	this._deletedNodes = this._deserializerBooleans(jsonbject.Graph.deletedNodes);
    	this._visible = this._deserializerBooleans(jsonbject.Graph.visible);
    	this._visibleEdges = this._deserializerBooleans(jsonbject.Graph.visibleEdges);
    	
    	//this._edgesOfNode = jsonbject.controller.edgesOfNode;
    	
    },
    _deserializerBooleans : function(jsonMap){
	var controllerMap = new Array();
	for(key in jsonMap){
		if(jsonMap[key] == "true")
			controllerMap[key] = true;
		if(jsonMap[key] == "false")
			controllerMap[key] = false;	
	}
	return controllerMap;
    },
    serializer : function(){
    	var json = new StringBuffer();
    	json.append("{");
    	json.append("\"Graph\" : { \"nodes\" : [");
	for(var i = 0; i < this._model._nodes.length; i++){

		var node = this._model._nodes[i];
		var nodeId = this._model._nodes[i].id.replace(this.interactomeId, "");
		json.append("{");
		json.append("\"id\":\""+nodeId+"\",");
		json.append("\"edgesIndexes\":[");
		for(var j = 0; j < node.edgesIndexes.length; j++){
			json.append("\""+node.edgesIndexes[j]+"\"");
			if(j != node.edgesIndexes.length-1)
				json.append(",");
		}
		json.append("]}");
		if(i != this._model._nodes.length-1)
			json.append(",");
	}
	json.append("],\"edges\":[");
	for(var i = 0; i < this._model._edges.length; i++){
		var edge = this._model._edges[i];
		var edgeId = this._model._edges[i].id.replace(this.interactomeId, "");
		json.append("{");
		json.append("\"id\":\""+edgeId+"\",");
		json.append("\"source\":\""+edge.source.replace(this.interactomeId, "")+"\",");
		json.append("\"target\":\""+edge.target.replace(this.interactomeId, "")+"\",");
		json.append("\"type\":\""+edge.type+"\"}");
		if(i != this._model._edges.length-1)
			json.append(",");
	}
	json.append("],");
    	json.append(this._serializeCoordenatesToJSON("coordenates", this._coordenates, true));
    	json.append(this._serializeHashMaptoJSON("shape", this._shape, true));
    	json.append(this._serializeHashMaptoJSON("color", this._color, true));
    	json.append(this._serializeHashMaptoJSON("size", this._size, true));
    	json.append(this._serializeHashMaptoJSON("opacity", this._opacity, true));
    	json.append(this._serializeHashMaptoJSON("visible", this._visible, true));
	json.append(this._serializeHashMaptoJSON("id_title", this._id_title, true));
    	//json.append(this._serializeHashMaptoJSON("edgesOfNode", this._edgesOfNode, true));
    	json.append(this._serializeHashMaptoJSON("nodeStrokeWidth", this._nodeStrokeWidth, true));
    	json.append(this._serializeHashMaptoJSON("colorOfEdges", this._colorOfEdges, true));
    	json.append(this._serializeHashMaptoJSON("deletedEdges", this._deletedEdges, true));
    	json.append(this._serializeHashMaptoJSON("deletedNodes", this._deletedNodes, true));
    	json.append(this._serializeHashMaptoJSON("visibleEdges", this._visibleEdges, true));
    	json.append(this._serializeHashMaptoJSON("nodeStrokeWidth", this._nodeStrokeWidth, false));
    	
    	
    	//end of controller
    	json.append("}");
    	
    	//end of json
    	json.append("}");
    	return json.toString();
    },
    _serializeCoordenatesToJSON : function(propertyTitle, hashMap, hasContinuation){
    	var json = new StringBuffer();
    	json.append("\""+propertyTitle+"\" : {");
    	var records = new Array();
    	for ( var key in hashMap) {
    		records.push("\""+key+"\" : " + "["+ hashMap[key][0] + ","+ hashMap[key][1] + "]");  
		}
    	
    	for ( var i = 0; i < records.length - 1; i ++) {
    			json.append(records[i] + ",");
		}
    	json.append(records[records.length - 1]);
    	//end of coordenates
    	if (hasContinuation){
    		json.append("},");
    	}
    	else{
    		json.append("}");
    	}
    	return json;
    },
    _serializeHashMaptoJSON : function(propertyTitle, hashMap, hasContinuation){
    	var json = new StringBuffer();
    	json.append("\""+propertyTitle+"\" : {");
    	var records = new Array();
    	for ( var key in hashMap) {
    		records.push("\""+key+"\" : " + "\""+ hashMap[key] + "\"");  
		}
    	
    	for ( var i = 0; i < records.length - 1; i ++) {
    			json.append(records[i] + ",");
		}
    	json.append(records[records.length - 1]);
    	//end of coordenates
    	if (hasContinuation){
    		json.append("},");
    	}
    	else{
    		json.append("}");
    	}
    	return json;
    },
    
    init : function(){
    	this.setLayouts(this._model.layouts[0]);
    	// Nodes stuff
	this._coordenates = new Array(this._model.getNodes().length);
	this._shape = new Array(this._model.getNodes().length);
	this._size = new Array(this._model.getNodes().length);
	this._color = new Array(this._model.getNodes().length);
	this._opacity = new Array(this._model.getNodes().length);
	this._visible = new Array(this._model.getNodes().length);
	this._nodeStrokeWidth = new Array(this._model.getNodes().length);
	this._id_title = new Array(this._model.getNodes().length);

	//this._edgesOfNode = new Array(this._model.getNodes().length);
	this._deletedNodes = new Array(this._model.getNodes().length);
	this._deletedEdges = new Array(this._model.getEdges().length);
	this._colorOfEdges = new Array(this._model.getEdges().length);
		
	    this.setDefaultVisibility();
	    this.setDefaultSize();
	    this.setDefaultShape();
	    this.setDefaultColorNode();
	    this.setDefaultOpacity();
	    this.setDefaultNodeStrokeWidth();
	    this.setDefaultIdTitle();
	    //this.setEdgesOfNode();
	    this.setDefaultDeletedNodes();
	    this.setDefaultDeletedEdges();
	    this.setDefaultColorEdges();
	  
	    // Those are the attributes for edges
	   	this._visibleEdges = new Array(this._model.getEdges().length);
	   	
	   	this.setDefaultEdgeVisibility();
	  for (var i=0; i< this._model._nodes.length; i++){  
			var nodeId = this._model._nodes[i].id;
			this.setCoordenates(nodeId ,this._model._nodes[i].cx[0]*(this.width-100)+50, this._model._nodes[i].cy[0]*(this.height-100)+50 );
	   }
				
    },
	
	drawStaticHTML : function(){
		document.getElementById(this.targetId).innerHTML = "";
		this.svg = SVG.createSVGCanvas(document.getElementById(this.targetId), [["id", this.id],["viewBox", "0 0 "+this.width+" "+this.height], ["style", "top:0px; left:0px; width:"+this.width+"px; height:"+this.height+"px; cursor:all-scroll;background-repeat:no-repeat"]]);
		SVG.drawRectangle(0, 0, this.width, this.height, this.svg, [["fill", "white"], ["id", "background"],["opacity", "0"]]); 
		SVG.drawGroup(this.svg, [["id", "labels"]]);
		SVG.drawGroup(this.svg, [["id", "edges"]]);
		SVG.drawGroup(this.svg, [["id", "canvas"]]);
		return this.svg;
		
		
	},
	
    hideNodeLabels : function(){
    	 this._showNodeLabels = false;
    	 this._view.nodeLabelShow= false;
    	 this._view.clearLabels();
    },
	
    changeLayout : function (indexLayout){ 
		this._layoutIndex = indexLayout;
		
		for (var i=0; i< this._model.getNodes().length; i++){  
			var coordenateX =  this._model.Graph.nodes[i].cx[indexLayout];
			var coordenateY =   this._model.Graph.nodes[i].cy[indexLayout];
			
			var scaledX =  parseFloat(this.layoutCoordenates[indexLayout][i][0])*(this.width-100)+50;
			var scaledY = parseFloat(this.layoutCoordenates[indexLayout][i][1])*(this.height-100)+50;
			this.setCoordenates(this._model.getNodes()[i].getId() , Math.ceil(scaledX),  Math.ceil(scaledY) );
		}
		
		this.draw();
    },
    
    setLayouts : function(layout){
		  this._layouts = layout;
		  this.layoutCoordenates = new Array(this._layouts.length);
		  for (var j=0; j<this._layouts.length; j++)
		  {
				 this.layoutCoordenates[j] = this._model.layoutCoordenates; //new Array(this.json.Graph.nodes.length);
				
		   }

    },



    setBackgroundColor : function(color){
		this._view.getBackground().setAttribute("fill", color);
    },
    
    getBackgroundColor : function(){
		return this._view.getBackground().getAttribute("fill");
    },
    
    
    nodeClicked : function(nodeId){
	    this.nodeClick.notify();
    },
    edgeClicked : function(edgeId){
	    this.edgeClick.notify();
    },
    clickOnCanvas : function(){
	    this.canvasClick.notify();
    },
    
    draw : function()
    {
			this._view.clearAll();
			/*this.drawNodes();
			this.drawEdges();
			if (this._showNodeLabels){
				//this._view.showNodeLabels();
				this._view.clearLabels();
				this._view.renderNodeLabels();*/
			this.drawNodes();
			this.drawEdges();
			if (this._showNodeLabels){
				this._view.showNodeLabels(this);
			}
			
	
    },
    
    showNodeLabels: function() 
    {
		this._showNodeLabels = true;
		this._view.showNodeLabels(this);	
    },
    
   setDefaultOpacity : function(){
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._opacity[this._model.getNodes()[i].id] = this._model.getNodes()[i].opacity;
		}
    },
    
    setDefaultSize : function(){
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._size[this._model.getNodes()[i].id] = this._model.getNodes()[i].size;
		}
    },
    
    setDefaultVisibility : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._visible[this._model.getNodes()[i].id] = true;
		}
    },
    
    setDefaultShape : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._shape[this._model.getNodes()[i].id] =  this._model.getNodes()[i].shape;
		}
    },
    
    setDefaultColorNode : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._color[this._model.getNodes()[i].id] =  this._model.getNodes()[i].color;
		}
    },
    setDefaultNodeStrokeWidth : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._nodeStrokeWidth[this._model.getNodes()[i].id] =  this._model.getNodes()[i].nodeStrokeWidth;
		}
    },
    setDefaultIdTitle : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._id_title[this._model.getNodes()[i].id] =  this._model.getNodes()[i].title;
		}
    },
    /*setEdgesOfNode : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._edgesOfNode[this._model.getNodes()[i].id] =  this._model.getNodes()[i].edgesIndexes;
		}
    },*/
    setDefaultEdgeVisibility : function()
    {
		for (var i=0; i< this._model.getEdges().length; i++){
			  this._visibleEdges[this._model.getEdges()[i].id] = true;
		}
    },
    setDefaultDeletedNodes : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._deletedNodes[this._model.getNodes()[i].id] =  false;
		}
    },
    setDefaultDeletedEdges : function()
    {
		for (var i=0; i< this._model.getEdges().length; i++){
			  this._deletedEdges[this._model.getEdges()[i].id] = false;
		}
    },
    setDefaultColorEdges : function()
    {
		for (var i=0; i< this._model.getEdges().length; i++){
			  this._colorOfEdges[this._model.getEdges()[i].id] = "black";
		}
    },
    //Cuando un nodo se mueve se deberia
    //			1.- Actualizar sus coordenadas
    //			2.- Borrar sus aristas
    //			3.- Redibujar sus aristas
    nodeMoving: function(nodeID){
			var node = this.getNode(nodeID);
			var newCoordenates = this._view.getCoordenates(nodeID);
			
			this._view.getNodeView(nodeID)._coordenates = newCoordenates;
			this._view.getNodeView(nodeID).cx = newCoordenates[0];
			this._view.getNodeView(nodeID).cy = newCoordenates[1];
			this._view.getNodeView(nodeID).clearLabel();
			this.updateCoordenates(nodeID, newCoordenates);
			
			if (this._showNodeLabels){
				this._view.getNodeView(nodeID).renderLabel();
			}
			
			if ((node=="undefined")||(node==null)) return;

			this._view.clearEdges();
			this.drawEdges();
			
    },
    
    canvasMoving: function(coordenates){
    	    	var dx = coordenates[0];
    	 	var dy =   coordenates[1];
    	 	 this.translateX(dx);
		     this.translateY(dy);
		      
    },

    updateCoordenates : function(nodeID, coordenates){
		var index = this._model.getNodeIndex(nodeID);
		this._coordenates[nodeID]= [ parseFloat(coordenates[0]), parseFloat(coordenates[1]) ];
    },
    
    
    zoomIn : function(){
    	for (var nodeID in interactomeViewerViz.controller._coordenates) {
    		this._coordenates[nodeID]= [ this._coordenates[nodeID][0]*2, this._coordenates[nodeID][1]*2 ];
    	}
		
		this.draw();
    },
    
    zoomOut : function(){
    	for (var nodeID in interactomeViewerViz.controller._coordenates) {
    		this._coordenates[nodeID]= [ this._coordenates[nodeID][0]/2, this._coordenates[nodeID][1]/2 ];
    	}
		
		this.draw();
    },
    
    
    


    setSVG : function (svg)
    {
		this._view.setSVG(svg);
    },
  

    setCoordenates : function (nodeId, posX, posY) {
    	this._coordenates[nodeId] = [posX, posY];
    },

    scale : function(value){
	   
		this.graphScale = value;
		for (var i=0; i< this._coordenates.length; i++)
		{
			  this._coordenates[i][0] = this._coordenates[i][0]*value;
			  this._coordenates[i][1] = this._coordenates[i][1]*value;
		}
		
		for (var i=0; i< this._model.getNodes().length; i++){
	
			  this._size[i] = this._size[i]*value;
		}
	
		this._view.radio= this._view.radio*value;
		this.draw();

    },
    translateX : function(value)
    {
		
		var local_nodes = this._model.getNodes();
		for (var i = 0; i< local_nodes.length; i++)
		{
		  	this._coordenates[local_nodes[i].id][0] =  parseFloat(this._coordenates[local_nodes[i].id][0]) + parseFloat(value);
		}
		
		this.draw();

    },
    translateY : function(value)
    {

		var local_nodes = this._model.getNodes();
		for (var i = 0; i< local_nodes.length; i++)
		{
		  	this._coordenates[local_nodes[i].id][1] =  parseFloat(this._coordenates[local_nodes[i].id][1]) + parseFloat(value);
		}
		
		this.draw();
		
		

    },

    drawNodes : function(){
	    this._view.drawNodes(this._model.getNodes(), this._coordenates, this);
    },
    
    
    renderEdge : function(edgeId)
    {
		
		var edge = this.getEdge(edgeId);
		if (edge != null){
		  var coordenatesSource = this.getNodeCoordenates(edge.source);
		  var coordenatesTarget = this.getNodeCoordenates(edge.target);
		  if(coordenatesSource != null && coordenatesTarget!=null){
			  var color = this._colorOfEdges[edgeId];
			  this._view.renderEdge(edge, this.getNode(edge.source), coordenatesSource, this.getNode(edge.target), coordenatesTarget, color, this );
		  }
		 }
    },

    drawEdges : function()
    {
		for (var i = 0; i< this._model.getEdges().length; i++){
			this.renderEdge(this._model.getEdges()[i].id);
		}
    },

    getEdge :function (edgeId){
		return this._model.getEdge(edgeId);
    },


    getNode :function (nodeId){
		
		return this._model.getNode(nodeId);
    },

    getNodeIndex : function (nodeId){
		
		return this._model.getNodeIndex(nodeId);
    },
    getNodeSize :function (nodeId)
    {
    	return this._size[nodeId];
    },
    getNodeShape :function (nodeId)
    {
		return this._shape[nodeId];
    },
     getNodeColor :function (nodeId)
    {
		return this._color[nodeId];
    },
    getOpacity :function (nodeId)
    {
		return this._opacity[nodeId];
    },
    getNodeCoordenates :function (nodeId)
    {
		return this._coordenates[nodeId];
    },
    getNodeStrokeWidth :function (nodeId)
    {
		return this._nodeStrokeWidth[nodeId];
    },
    getTitle :function (nodeId){
		return this._id_title[nodeId];
    },
    random : function ()
    {
		for (var i = 0; i< this._model.getNodes().length; i++)
		{  
			 this._coordenates[i] = [Math.floor(Math.random()*this.height), Math.floor(Math.random()*this.width)];
		}
		this.draw();
	
    },
    
    getModel : function()
    {
		return this._model;
	},
    
    addNode : function(id, title, posX, posY, color, visibility, opacity, size, shape, nodeStrokeWidth ){
		var coorX = new Array();
		var coorY = new Array();
		coorX.push(posX);
		coorY.push(posY);
		var coorXY = new Array();
		coorXY.push(posX);
		coorXY.push(posY);
		
		var node = new PlotNode( id, title, coorX, coorY, new Array(),{"color":color, "size":size, "opacity":opacity, "shape":shape, "nodeStrokeWidth":nodeStrokeWidth});			
		
		var nodes = this._model.getNodes();
		var nodesId = this._model.getNodesId();
		nodesId[id] = nodes.length;
		nodes.push(node);
		this._coordenates[id] = coorXY;
		this._color[id] = color;
		this._visible[id] = visibility;
		this._opacity[id] = opacity;
		this._size[id] = size;
		this._shape[id] = shape;
		this._nodeStrokeWidth[id] = nodeStrokeWidth;
		this._deletedNodes[id] = false;
		this._id_title[id] = title;
		
		this.draw();
		return node;
	},
	
	addEdge : function(edgeName, sourceID, targetID){
		var source_node = this.getNode(sourceID);
		var target_node = this.getNode(targetID);
		var edges = this.getModel().getEdges();
		var edgesId = this.getModel().getEdgesId();
		//var edgeName = "e-"+source_node.id+"-"+target_node.id;
		
		var edgePlot = new PlotEdge( edgeName,  source_node.id,  target_node.id, { "visibility":true});
		var i = this.getModel().getEdges().length;
		edgesId[edgeName]= i;
		edges.push(edgePlot);
		this.getModel().setEdges(edges);
		this.getModel().setEdgesId(edgesId);
		
		this._visibleEdges[edgeName] = true; 
		this._deletedEdges[edgeName] = false;
		this._colorOfEdges[edgeName] = "black";
	
		//add edgesIndexes to nodes		
    	 	source_node.edgesIndexes.push(edgeName);
		target_node.edgesIndexes.push(edgeName);
		
		this.draw();
	}
};
// JavaScript Document

function randomLayout() {
	
	this.sifFieldsString = new Array();
	
	this.nodes = new Array();
	this.edges = new Array();
	this.nodesId = new Object();
	this.edgesId = new Object();
	//this.layoutCoordenates = new Array();
	
	
	this.loadSIF = function(sifString){
		var lineBreak = sifString.split("\n");	
		for (var i = 0; i < lineBreak.length; i++){
			
			if (lineBreak[i].length>0){
					var trimmed = lineBreak[i].replace(/^\s*|\s*$/g,"");
					var field =trimmed.replace(/\s/g,'**%**').split("**%**");
					if (field.length>0){
						this.sifFieldsString.push( field);
					}
			}
		}
		this.init();
	};
	
	this.addEdge = function(nodeIndex, edge){
		this.nodes[nodeIndex].edgesIndexes.push(edge);
	};

	this._calculateCoordenates= function(index,id, args){
		var cx = new Array();
		var cy = new Array();
		cx.push(Math.random());
		cy.push(Math.random());
		return new PlotNode(id, id, cx, cy, new Array());
	};
	
	
	this.init = function(){
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var id =this.sifFieldsString[i][0];
			
			var  node = this._calculateCoordenates(i,id);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
		}
		
		//adding edges to nodes field from 1 to last one
		for (var nodeIndex = 0; nodeIndex < this.sifFieldsString.length; nodeIndex++){
			for (var j = 2; j < this.sifFieldsString[nodeIndex].length; j++){
					var from =this.sifFieldsString[nodeIndex][0];
					var to =this.sifFieldsString[nodeIndex][j];
					var edgeid = "edge_" + from + "_" + to;
					this.addEdge(nodeIndex, edgeid);	
					this.edges.push(new PlotEdge(edgeid, from, to));
					this.edgesId[edgeid] = this.edges.length-1;
			}		
		}
	};
	
	this.toObject = function(){
		return new PlotGraph(this.nodes, this.nodesId, this.edges, this.edgesId , ["random"]);
	};
	
}



function twoLayout() {
	randomLayout.prototype.constructor.call(this);
	this.classesType = new Array();
	this.classes = new Object();
	this.classesIndex = new Object();


	this._calculateCoordenates = function(index, id, args){
	
		
			if (this.classesType.length == 2)
			{
				var cx = new Array();
				var cy = new Array();
				cx.push(Math.random());
				if (this.classes[id] == this.classesType[0]){
					cy.push(0.2);
				}
				else{
					cy.push(0.8);
				}
			}
			

			return new PlotNode(id, id, cx, cy, new Array());
	};
	
	
	
	this.loadSIF = function(sifString){
	
	     var lineBreak = sifString.split("\n");	
		for (var i = 0; i < lineBreak.length; i++){
			
			if (lineBreak[i].length>0){
					var trimmed = lineBreak[i].replace(/^\s*|\s*$/g,"");
					var field =trimmed.replace(/\s/g,'**%**').split("**%**");
					if (field.length>0){
						var className = field[field.length-1]; 
						this.addClass(className);
						this.classes[field[0]] = className;
						this.classesIndex[className].push(field[0]);
					
						var fieldFiltered = field.slice(0, field.length-2);
						this.sifFieldsString.push(fieldFiltered);
						
						
						
					}
			}
		}
		this.init();
		
	};


	this.addClass = function(className){
		for (var i = 0; i < this.classesType.length; i++){
			if (this.classesType[i] == className){
				return;	
			}
		}
		this.classesType.push(className);
		this.classesIndex[className] = new Array();
	};
};

twoLayout.prototype = new randomLayout();
twoLayout.prototype.constructor=randomLayout;
twoLayout.prototype.parent = randomLayout.prototype;



function RankedTwoLayout() {
	twoLayout.prototype.constructor.call(this);
	
	//El node level es la clase del nodo, es decir, n� edges de entrada + n� edges de salida
	this.nodeLevel = new Object();
	this.maxLevelPerClass = new Object();
	this.nodeLevelSorter = new Array();
	
	this.nodesProcessedPerClasse = new Object();

	this.addClass = function(className){
		for (var i = 0; i < this.classesType.length; i++){
			if (this.classesType[i] == className){
				return;	
			}
		}
		this.classesType.push(className);
		this.classesIndex[className] = new Array();
		this.maxLevelPerClass[className] = 0;
		this.nodesProcessedPerClasse[className] = 0;
	};
	
	
	this._calculateCoordenates = function(index, id, justCreateNode){
			if (this.classesType.length == 2){
				var cx = new Array();
				var cy = new Array();
				
				
				
				if (!justCreateNode)
				{
					var className = this.classes[id];
					var maxClass = this.maxLevelPerClass[className];
					var nodeLevel = this.nodeLevel[id];
					
					 
					
					var step = (1/this.classesIndex[className].length);
					
					//var value = nodeLevel/maxClass; 
					cx.push(this.nodesProcessedPerClasse[className]*step);
					
					this.nodesProcessedPerClasse[className]++;
					
				
					if (this.classes[id] == this.classesType[0]){
						//cy.push(0.2 + (this.nodesProcessedPerClasse[className]*0.3)/(maxClass*10));
						cy.push(0.1);
					}
					else{
						cy.push(0.9);
					}
				}
			}
			return new PlotNode(id, id, cx, cy, new Array());
	};
	
	this.loadSIF = function(sifString){
	
	     var lineBreak = sifString.split("\n");	
		for (var i = 0; i < lineBreak.length; i++){
			
			if (lineBreak[i].length>0){
					var trimmed = lineBreak[i].replace(/^\s*|\s*$/g,"");
					var field =trimmed.replace(/\s/g,'**%**').split("**%**");
					if (field.length>0){
						var className = field[field.length-1]; 
						this.addClass(className);
						this.classes[field[0]] = className;
						this.classesIndex[className].push(field[0]);
						var fieldFiltered = field.slice(0, field.length-2);
						this.sifFieldsString.push(fieldFiltered);	
					}
			}
		}
		this.init();
	};
	
	this.init = function(){
		
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var id =this.sifFieldsString[i][0];
			var  node = this._calculateCoordenates(i,id, true);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
			this.nodeLevel[id] = 0;
		}
		
		//adding edges to nodes field from 1 to last one
		for (var nodeIndex = 0; nodeIndex < this.sifFieldsString.length; nodeIndex++){
			for (var j = 2; j < this.sifFieldsString[nodeIndex].length; j++){
					var from =this.sifFieldsString[nodeIndex][0];
					var to =this.sifFieldsString[nodeIndex][j];
					var edgeid = "edge_" + from + "_" + to;
					this.addEdge(nodeIndex, edgeid);	
					this.edges.push(new PlotEdge(edgeid, from, to));
					this.edgesId[edgeid] = this.edges.length-1;
					
					
					//solo rankean si proceden de diferentes clases
					if (this.classes[from]!=this.classes[to])
					{
						this.nodeLevel[from]++;//; = level ++; //this.nodeLevel[from] ++; 
						this.nodeLevel[to]++;// = this.nodeLevel[to] ++; 
						
						var classFrom = this.classes[from];
						var classTo = this.classes[to];
						
						if (this.maxLevelPerClass[classFrom]<this.nodeLevel[from]){
							this.maxLevelPerClass[classFrom] =this.nodeLevel[from];
						}
						
						if (this.maxLevelPerClass[classTo]<this.nodeLevel[to]){
							this.maxLevelPerClass[classTo] =this.nodeLevel[to];
						}	
					}
			}		
		}
		
		//A�adimos y ordenamos los nodos segun mayor node level
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var nodeId =this.sifFieldsString[i][0];
			this.nodeLevelSorter.push([this.nodeLevel[nodeId], nodeId]);
		}
		this.nodeLevelSorter.sort();
		
		this.nodes = new Array();
		for (var i = 0; i < this.nodeLevelSorter.length; i++){
			var id =this.nodeLevelSorter[i][1];
			var  node = this._calculateCoordenates(i,id, false);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
		}
		
		
		
	};




};

RankedTwoLayout.prototype = new twoLayout();
RankedTwoLayout.prototype.constructor=twoLayout;
RankedTwoLayout.prototype.parent = twoLayout.prototype;






/*** HIVE PLOT ***/

function HivePlot(args) {
	
	RankedTwoLayout.prototype.constructor.call(this);
	
	
	this.edgeType = "line";
	this.classColor = null;
	console.log(args);
	if (args!= null)
	{
		if (args.edgeType != null){
			this.edgeType = args.edgeType;
		}
		
		if (args.classColor != null){
			this.classColor = args.classColor;
		}
	}
	
	
	this.addClass = function(className){
		for (var i = 0; i < this.classesType.length; i++){
			if (this.classesType[i] == className){
				return;	
			}
		}
		this.classesType.push(className);
		this.classesIndex[className] = new Array();
		this.maxLevelPerClass[className] = 0;
		this.nodesProcessedPerClasse[className] = 0;
	};
	
	this._calculateCoordenates = function(index, id, justCreateNode){
		
				var cx = new Array();
				var cy = new Array();
				
		
		
				var className = this.classes[id];
				if (!justCreateNode)
				{
					
					var maxClass = this.maxLevelPerClass[className];
					var nodeLevel = this.nodeLevel[id];	
					var step = (1/this.classesIndex[className].length);
					this.nodesProcessedPerClasse[className]++;
					
				
					//VERTICAL
					if (this.classes[id] == this.classesType[0]){
						cx.push(0.5);
						var y = (0.6/this.classesIndex[className].length)*(this.classesIndex[className].length - this.nodesProcessedPerClasse[className]);
						cy.push(y);
					}
					
					//RIGHT
					if (this.classes[id] == this.classesType[1]){
						cx.push(0.5 + (0.5/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className]);
						var y = 0.6 + (0.4/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className];
						cy.push(y);
					}
					
					//LEFT
					if (this.classes[id] == this.classesType[2]){
						cx.push(0.5 - (0.5/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className]);
						var y = 0.6 + (0.4/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className];
						cy.push(y);
					}
				}
			
			return new PlotNode(id, id, cx, cy, new Array(), {"color":this.classColor[className]});
	};
	
	this.getEdgeLocation = function(classSource, classTarget)
	{
	
			if (classSource == this.classesType[0] ){
					if (classTarget == this.classesType[1]){
						return "AreaB";
					}
					if (classTarget == this.classesType[2]){
						return "AreaA";
					}
			}
			
			if (classSource == this.classesType[1] ){
					if (classTarget == this.classesType[0]){
						return "AreaB";
					}
					if (classTarget == this.classesType[2]){
						return "AreaC";
					}
			}
			
			if (classSource == this.classesType[2] ){
					if (classTarget == this.classesType[0]){
						return "AreaA";
					}
					if (classTarget == this.classesType[1]){
						return "AreaC";
					}
			}
		
		
	};
	
	this.init = function(){
		
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var id =this.sifFieldsString[i][0];
			var  node = this._calculateCoordenates(i,id, true);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
			this.nodeLevel[id] = 0;
		}
		
		//adding edges to nodes field from 1 to last one
		for (var nodeIndex = 0; nodeIndex < this.sifFieldsString.length; nodeIndex++){
			for (var j = 2; j < this.sifFieldsString[nodeIndex].length; j++){
					var from =this.sifFieldsString[nodeIndex][0];
					var to =this.sifFieldsString[nodeIndex][j];
					var edgeid = "edge_" + from + "_" + to;
					this.addEdge(nodeIndex, edgeid);	
					
					
					var classFrom = this.classes[from];
					var classTo = this.classes[to];
					
				
					this.edges.push(new PlotEdge(edgeid, from, to, {"type":this.edgeType, "area":this.getEdgeLocation(classFrom, classTo), "classesNumber":3, "opacity":0.5}));
					this.edgesId[edgeid] = this.edges.length-1;
					
					
					//solo rankean si proceden de diferentes clases
					if (this.classes[from]!=this.classes[to])
					{
						this.nodeLevel[from]++;//; = level ++; //this.nodeLevel[from] ++; 
						this.nodeLevel[to]++;// = this.nodeLevel[to] ++; 
						
						
						
						if (this.maxLevelPerClass[classFrom]<this.nodeLevel[from]){
							this.maxLevelPerClass[classFrom] =this.nodeLevel[from];
						}
						
						if (this.maxLevelPerClass[classTo]<this.nodeLevel[to]){
							this.maxLevelPerClass[classTo] =this.nodeLevel[to];
						}	
						
					}
					else{
						this.edges.pop();
					}
			}		
		}
		
		//A�adimos y ordenamos los nodos segun mayor node level
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var nodeId =this.sifFieldsString[i][0];
			this.nodeLevelSorter.push([this.nodeLevel[nodeId], nodeId]);
		}
		this.nodeLevelSorter.reverse().sort();
		
		
		this.nodes = new Array();
		for (var i = 0; i < this.nodeLevelSorter.length; i++){
			var id =this.nodeLevelSorter[i][1];
			var  node = this._calculateCoordenates(i,id, false);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
		}
		
		
		
	};
};

HivePlot.prototype = new RankedTwoLayout();
HivePlot.prototype.constructor=RankedTwoLayout;
HivePlot.prototype.parent = RankedTwoLayout.prototype;











function PlotGraph(nodes, nodesId, edges, edgesId, layouts){

	this._nodes = nodes;
	this._edges = edges;
	this.nodesId = nodesId;
	this.edgesId = edgesId;
	this.layouts = layouts;
	
	this.getNodes = function(){
		return this._nodes;
	};
	this.getNodesId = function(){
		return this.nodesId;
	};
	this.setNodes = function(nodes){
		this._nodes = nodes;
	};
	this.getNode = function(nodeId){
		return this._nodes[this.nodesId[nodeId]];
	};
	this.getNodeIndex = function(nodeId){
		return this.nodesId[nodeId];
	};
	this.getEdges = function(){
		return this._edges;
	};
	this.getEdgesId = function(){
		return this.edgesId;
	};
	this.getEdge = function(edgeId){
		return this._edges[this.edgesId[edgeId]];
	};
	this.setEdges = function(edges){
		this._edges = edges;
	};
	this.setEdgesId = function(edgesId){
		this.edgesId = edgesId;
	};
	this.getEdgesFromNode = function(nodeId){
		var edges = new Array();
		for (var i = 0; i< this._nodes[this.nodesId[nodeId]].edgesIndexes.length; i++){
			var edgeIndex =this._nodes[this.nodesId[nodeId]].edgesIndexes[i];
			edges.push(this.getEdge(edgeIndex));
		}
		return edges;
	};
}

/*
	args:
			type: line, bezier
*/
function PlotEdge(id, from, to, args){
	
		this.id = id;
		this.source = from;
		this.target = to;
		
		this.type = "line";
		this.area = null;
		this.classesNumber = null;
		this.color = "black";
		this.opacity =  1;
	
		if (args!= null){
			if (args.type != null){
				this.type = args.type;
			}
			if (args.area != null){
				this.area = args.area;
			}
			if (args.area != null){
				this.classesNumber = args.classesNumber;
			}
			if (args.color != null){
				this.color = args.color;
			}
			if (args.opacity != null){
				this.opacity = args.opacity;
			}
			if (args.visibility != null){
				this.visibility = args.visibility;
			}
		}
		
		this.getSource = function(){
			return this.source;	
		};
		this.getTarget = function(){
			return this.target;	
		};
		this.getId = function(){
			return this.id;	
		};
}

function PlotNode(id, title, cxArray, cyArray, edgesIndexes, args){
			this.id = id;
			this.title = title;
			this.cx = cxArray;
			this.cy = cyArray;
			this.edgesIndexes = edgesIndexes;
	
			this.color = "black";
			this.size = 3;
			this.opacity = 1;
			this.shape = "ci";
			
			if (args!= null){
				if (args.color != null){
					this.color = args.color;
				}
				if (args.size != null){
					this.size = args.size;
				}
				if (args.opacity != null){
					this.opacity= args.opacity;
				}
				if (args.shape != null){
					this.shape= args.shape;
				}
				if (args.nodeStrokeWidth != null){
					this.nodeStrokeWidth= args.nodeStrokeWidth;
				}
			}
}





function randomSIF(nodesNumber, classesCount)
{
	var sif = "";
	var sifLinear = "";
	var sif3 = "";
	
	for (var i = 0; i< nodesNumber; i++)
	{
		sif = sif +"node_"+ i + " type_" + i+ " ";
		sifLinear = sifLinear +"node_"+ i + " type_" + i+ " ";
		sif3 = sif3 +"node_"+ i + " type_" + i+ " ";
		var edgesNumber = Math.ceil(Math.random()*(nodesNumber/100));
		
		if (i%10==0){
				for (var j = 0; j< edgesNumber*10; j++){
					var line =  "node_" + Math.ceil(Math.random()*(nodesNumber-1)) +" "; 
					sif = sif + line;
					sifLinear = sifLinear + line;
					sif3 = sif3 + line;
				}
			
		}
		else{
			for (var j = 0; j< edgesNumber; j++){
				var line =  "node_" + Math.ceil(Math.random()*(nodesNumber-1)) +" "; 
				sif = sif + line;
				sifLinear = sifLinear + line;
				sif3 = sif3 + line;
			}
		}
		
		
		if (i%2==0)
		{
			sifLinear = sifLinear + "class "+ "class" +"1";
			sif3 = sif3 + "class "+ "class" + "1";
		}
		else
		{
			sifLinear = sifLinear + "class "+ "class" + Math.ceil(Math.random()* classesCount);
			sif3 = sif3 + "class "+ "class" + Math.ceil(Math.random()* 3);
		}
		
		sifLinear = sifLinear +"\n";
		sif3 = sif3 +"\n";
		sif = sif +"\n";
	}
	return [sif, sifLinear, sif3];
	
}
function GraphViewNode(graphView, node, coordenates, size, color, shape, opacity, noseStrokeWidth) {
	
   this.node = node;
   this._graphView = graphView;
   	this.cx = Math.ceil(coordenates[0]);
   	this.cy = Math.ceil(coordenates[1]);
   	
   
   this.r = size;

   this.color = "black";
   if (color!=null){
	   	this.color = color;   
   }
   this.size= size;
   this.shape = "ci";
   
   if (shape!=null){
		this.shape=shape;   
   }

   this.opacity = opacity;
   this.svgNode = null;
   this.svgLabel = null;

   this.noseStrokeWidth = "1";
   if (noseStrokeWidth!=null){
	   	this.noseStrokeWidth = noseStrokeWidth;   
  }
   this.over = new Event(this);
   this.mouseout = new Event(this);
   this.mousedown = new Event(this);
   this.mouseup = new Event(this);
   this.click = new Event(this);
   this.dblclick = new Event(this);
   this.moving = new Event(this);


     //Attributes for dragging and grop
    this.TrueCoords = null;
    this.GrabPoint = null;

    this.targetElement = null;
   
};

GraphViewNode.prototype = {

    getRadio: function(){
		return this._graphView._controller.getNodeSize(this.node.getId());
    },
    
    render : function (svg){
			this.svg = svg;
			if (this.shape == 'sq'){
	            var lado = this.r*2;
	            var posX = this.cx - this.r;
	            var posY = this.cy - this.r;
	            var attributes = [['id', this.node.id], ['class', 'NODE'],['fill', this.color],['z-index','10'], ['opacity', this.opacity], ['x', posX], ['y', posY], ['width', lado], ['height', lado], ['stroke', 'black' ], ['stroke-width',  this.noseStrokeWidth]];
	            this.svgNode = SVG.drawRectangle(posX, posY, lado, lado, this.getCanvas(), attributes);
	        }
	        
	        if (this.shape == 'ci'){
	            var attributes = [['id', this.node.id], ['class', 'NODE'],['fill', this.color],['z-index','10'], ['opacity', this.opacity],  ['stroke', 'black' ], ['stroke-width',  this.noseStrokeWidth]];
	            this.svgNode = SVG.drawCircle(this.cx, this.cy, this.r, this.getCanvas(), attributes);
	            //SVG.drawCircle(this.cx, this.cy, this.r, this.getCanvas(), attributes);
	            
	        }
	        this.attachEvents(document.getElementById(this.node.id));
	       
    },
    
    renderLabel : function (){
    	var x = this.cx-this.r;
    	var y = 0;
    	
    	if (this.shape == 'ci'){
    		y = parseFloat(this.cy)+parseFloat(this.r)+10;
		}
    	if (this.shape == 'sq'){
    		y = parseFloat(this.cy)+parseFloat(this.r)+17;
        }

    	this.svgLabel = SVG.drawText(x, y, this.node.title,  this.getLabelCanvas(), [['opacity', this.opacity],["id", "label_" + this.node.id],["font-size", "10"],["class", "label"]]);
    	return this.svgLabel;
    	
    	//drawText(x, y, this.node.id,  this.getLabelCanvas(), [["id", "label_" + this.node.id],["font-size", "10"],["class", "label"],["pointers", "none"],['opacity', this.opacity]]);
        
			
    },
    
    clearLabel : function ( ){

    	if (this.svgLabel!=null){
    		this._graphView.clearLabel("label_" + this.node.id);
    		
    	}
    	
    },
    
    init : function(){
		this.TrueCoords = this.svg.createSVGPoint();
		this.GrabPoint = this.svg.createSVGPoint();
    },
    
    getCanvas : function(){
	for (j=0; j<this.svg.childNodes.length; j++){
		if (this.svg.childNodes[j].id == "canvas"){
			  return ( this.svg.childNodes[j]);
		}	
	}
    },
    
    getLabelCanvas : function(){
	for (j=0; j<this.svg.childNodes.length; j++){
		if (this.svg.childNodes[j].id == "labels"){
			  return ( this.svg.childNodes[j]);
		}	
	}
    },
    
    attachEvents : function(object){
	var _this = this;
	object.onclick = (function (evt) {
		_this._graphView.selectedNodeEvent(evt.target.id);
	});
	
	object.ondblclick = (function (evt){
		_this._graphView.selectedNode = evt.target.id;
		_this._graphView._controller.nodeDblClicked(evt.target.id);    
	});
	
	/*object.onmouseover = (function (evt) {
	      document.getElementById( evt.target.id).setAttribute("stroke", "white");
	      document.getElementById( evt.target.id).setAttribute("cursor", "pointer");
	});*/
    }
};



function GraphView(controller, svg, width, height) {
   // this._model = model;
    this._controller = controller;
    this.svg = svg;
 
   this.svgs = new Array();
   this.svgs.push(svg);
   this.canvas = new Array();
   this.getCanvas();


    this.width = width;
    this.height = height;
 

    this.graphViewNodes = new Object();
    var _this = this;

    this.svgNodeLabel = new Object();
    
    //Nodes moving
    this.nodeIDMoving = null; //me guardo el node que esta siendo arrastrado en este momento
    this.nodeMoving = new Event();
    
    this.selectedNode  = null;
    this.selectedEdge  = null;
   // this.nodeLabelShow = controller._showNodeLabels;
  //  this.nodeLabelShow = false;
   
    //Canvas moving
    this.canvasMoving = false;
    this.canvasClicked = true;
    
    this.translate = new Event();
    this.canvasMovingEvent = new Event();
    this.nodeClick = new Event();
    this.edgeClick = new Event();
    this.canvasClick = new Event();

    //this.svg.addEventListener("mouseclick", function(event) { _this.mouseclick(event, _this); }, false);
    this.svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this.svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this.svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);
    this.attachEvents(document.getElementById(this.svg.id));
    
};
 



GraphView.prototype = {

	//EVENTS node click from graphViewNode
	selectedNodeEvent : function(id){
		this.selectedNode = id;
		//this._controller.nodeClicked(id);
		this.nodeClick.notify(id);
		//this.cleanColorEdge();
		this.canvasClicked = false;
		this._controller.draw();
	},
	selectedEdgeEvent : function(id){
		this.selectedEdge = id;
		//this._controller.edgeClicked(id);
		this.edgeClick.notify(id);
		//this.cleanStrokeNode();
		this.canvasClicked = false;
		//this._controller.draw();
	},
	canvasClickedEvent : function(){
		if(this.canvasClicked == true){
			//this.cleanStrokeNode();
			//this.cleanColorEdge();
			this._controller.draw();
			this._controller.nodeIdClicked = null;
			this._controller.edgeIdClicked = null;
			this._controller.actionClick = 0;
			this.canvasClick.notify();
		}
		
	},
	attachEvents : function(object){
		
    	var _this = this;
    	object.onclick = (function (evt) {
    		_this.canvasClickedEvent(evt.target.id);
    	});
    },
	getSelectedNode: function()
	{
		return this.selectedNode;
		
	},
	getSelectedEdge: function()
	{
		return this.selectedEdge;
		
	},
    showNodeLabels : function (controller){
		
		this.renderNodeLabels(controller); 
	//	this.nodeLabelShow = true;
    },
    clearNodeLabels : function (){
//		this.nodeLabelShow = false;
		this.clearLabels();
	 
    },
    
    renderNodeLabels : function(controller){
    	 for (nodeid in this.graphViewNodes){
    		 var nodeView =this.graphViewNodes[nodeid];
			 for (var j=0; j< this.svgs.length; j++){
				 	var coordenates = controller._coordenates[nodeid];
				 	var nodeSvgLabel =  this.graphViewNodes[nodeid].renderLabel( );
			        this.svgNodeLabel[this.graphViewNodes[nodeid].node.id] = nodeSvgLabel;
			 }
    	 }
    },
    
    
    mouseDown : function (evt){
	      //En caso hago click sobre el canvas
	      this.canvasGrabPoint = this.svg.createSVGPoint();
	      this.TrueCoords = this.GetTrueCoords(evt, this.svg);
	      this.canvasGrabPoint.x = this.TrueCoords.x;
	      this.canvasGrabPoint.y = this.TrueCoords.y;
	      this.canvasMoving = true;
	      if (evt.target.getAttribute("class") == "NODE"){
		      this.TrueCoords = this.GetTrueCoords(evt, this.svg);
		      this.GrabPoint = this.svg.createSVGPoint();
		      this.targetElement = evt.target;
		      this.DragTarget  = this.targetElement;
		      this.DragTarget.parentNode.appendChild( this.DragTarget );
		      var transMatrix = this.DragTarget.getCTM();
		     
		      this.GrabPoint.x = this.TrueCoords.x - Number(transMatrix.e);
		      this.GrabPoint.y = this.TrueCoords.y - Number(transMatrix.f);
		      this.canvasMoving = false;
		     // this.cleanColorEdge();
	      }
	      else if(evt.target.getAttribute("class") != "NODE" && evt.target.getAttribute("class") != "EDGE")
	    	  this.canvasClicked = true;
    },

    mouseUp : function (evt){
		  this.canvasMoving = false;
		  if ( this.DragTarget ){
   /* mouseUp : function (evt)
    {
    	  this.nodeLabelShow = this._controller._showNodeLabels;
		  this.canvasMoving = false;
		  if ( this.DragTarget ){
			  
			//  if(this._controller._showNodeLabels){
		      if (this.nodeLabelShow){
					this.clearNodeLabels();
					this.showNodeLabels();
		      }*/
		      var targetElement = evt.target;
		      this.DragTarget.setAttributeNS(null, 'pointer-events', 'all');
		      this.DragTarget = null;
		  }
    },

    mouseMove : function (evt)
    {
		this.TrueCoords = this.GetTrueCoords(evt, this.svg);
		//this.nodeLabelShow = this._controller._showNodeLabels;
 
		if (this.canvasMoving)
		{
		      var point = this.GetTrueCoords(evt, this.svg);
		     
		      var dx =parseFloat(point.x) - parseFloat(this.canvasGrabPoint.x) ;
		      var dy =parseFloat(point.y) - parseFloat(this.canvasGrabPoint.y) ;
	
		      this.canvasGrabPoint.x  = point.x;
		      this.canvasGrabPoint.y  = point.y;
		  
	 	     
		      
			  this.canvasMovingEvent.notify([dx, dy]);
		      
		      
		      
		      //if(this._controller._showNodeLabels){
//		      if (this.nodeLabelShow){
//					this.clearNodeLabels();
//					this.showNodeLabels();
//		      }
		      return;
		}

		if (this.DragTarget)
	        {
			
			
			  var x =   this.DragTarget.getAttribute("cx");
			  var y =   this.DragTarget.getAttribute("cy");
	  		  this.DragTarget.setAttribute('cx', this.TrueCoords.x);
			  this.DragTarget.setAttribute('cy', this.TrueCoords.y);
			  this.DragTarget.setAttribute('x', this.TrueCoords.x);
			  this.DragTarget.setAttribute('y', this.TrueCoords.y);
			  this.nodeIDMoving = this.DragTarget.id;
			  this.nodeMoving.notify( this.DragTarget.id);
	         }
	},
	mouseclick : function(evt) {
    },
    getBackground : function()
    {
	      for (j=0; j<this.svg.childNodes.length; j++)
	      {
		     if (this.svg.childNodes[j].id == "background")
		     {
			        return this.svg.childNodes[j];
		     }	
	      }
    },
    /**
	Dentro de cada elemento svg existe un grupo <g> con id = canvas en el cual insertaremos los objetos
	Esta funcion recorre todo el vector svgs buscando esos canvas y los inserta en this.canvas
    **/
    getCanvas : function()
    {
		this.canvas = new Array();
		for (var i=0; i < this.svgs.length; i++)
		{
		      for (j=0; j<this.svgs[i].childNodes.length; j++)
		      {
			     if (this.svgs[i].childNodes[j].id == "canvas")
			     {
				        this.canvas.push( this.svgs[i].childNodes[j]);
			     }	
		      }
		}
    },
    
    getCanvasEdge : function()
    {
	    for (j=0; j<this.svg.childNodes.length; j++)
	    {
		    
		     if (this.svg.childNodes[j].id == "edges")
		     {
			      return this.svg.childNodes[j];
		     }	
	      }
    },
    
    getCanvasLabels : function(){
	    for (j=0; j<this.svg.childNodes.length; j++){
		     if (this.svg.childNodes[j].id == "labels")
		     {
			      return this.svg.childNodes[j];
		     }	
	      }
    },
    
    
    clearLabels: function(){
    	  var canvas = this.getCanvasLabels();
	      while (canvas.childNodes.length>0) {  
	    	  canvas.removeChild(canvas.childNodes[0]);
	      }
    },
    
    clearEdges: function(){
    	  var canvas = this.getCanvasEdge();
	      while (canvas.childNodes.length>0)
	      {  
	    	  canvas.removeChild(canvas.childNodes[0]);
	      }
    },

    drawNodes : function(nodes, coordenates, controller){
	  this.graphViewNodes = new Object();
	  for (var i=0; i< nodes.length; i++){
		  
		var id = nodes[i].id;
		var size = controller.getNodeSize(id);
		var color = controller.getNodeColor(id);
		var shape = controller.getNodeShape(id);
		var opacity = controller.getOpacity(id);
		var title = controller.getTitle(id);
		nodes[i].title = title;
		//var opacity = this._controller.getOpacity(id);
		var nodeStrokeWidth = controller.getNodeStrokeWidth(id);
		//console.log(id+" deletedNodes: "+controller._deletedNodes[id]);
		if(controller._deletedNodes[id] == false){
			//console.log(id+" _visible: "+controller._visible[id]);
			if (controller._visible[id] == true){
				var nodeView = new GraphViewNode(this, nodes[i], coordenates[id], size, color, shape, opacity, nodeStrokeWidth);
			}
			else{
				var nodeView = new GraphViewNode(this, nodes[i], coordenates[id], size, color, shape, 0, nodeStrokeWidth);
			}
			this.graphViewNodes[id] = (nodeView);	
		}
		

	  }
	  this.renderAllNodes();
	 
    },
    
    
    clearAll : function (id)
    {
		for (var i=0; i < this.canvas.length; i++){
		    while (this.canvas[i].childNodes.length>0){
		    	this.canvas[i].removeChild(this.canvas[i].childNodes[0]);
		    }
		}
		this.clearEdges();
		this.clearLabels();

    },
    
    clearCanvasElement : function (id){
		for (var i=0; i < this.canvas.length; i++){
		      for (j=0; j<this.canvas[i].childNodes.length; j++)
		      {	  
			     if (this.canvas[i].childNodes[j].id == id)
			     {
				        this.canvas[i].removeChild( this.canvas[i].childNodes[j]);
			     }	
		      }
		}
    },

    getElementByIdOnCanvas : function(id)
    {
	      for (j=0; j<this.canvas[0].childNodes.length; j++){	  
		     if (this.canvas[0].childNodes[j].id == id){
			       return this.canvas[0].childNodes[j];		
		     }	
	      }
	      return null;
    },

    getNodeView: function (id){
    	return this.graphViewNodes[id];
    },
    
    
    getCoordenates : function(nodeID) {
			var element = this.getElementByIdOnCanvas(nodeID);
			var cx, cy;
			cx = (element.getAttribute("cx"));
			cy = (element.getAttribute("cy"));
			return [cx, cy];
	
    },  

    clearEdge : function(edgeId)
    {
		var canvas = this.getCanvasEdge();
		for (var i=0; i< canvas.childNodes.length; i++){
		      if (canvas.childNodes[i].id == edgeId){
			    canvas.removeChild(canvas.childNodes[i]);
		      }
		}
    },
    
    clearLabel : function(labelId){
			var canvas = this.getCanvasLabels();
			for (var i=0; i< canvas.childNodes.length; i++){
			      if (canvas.childNodes[i].id == labelId){
				    canvas.removeChild(canvas.childNodes[i]);
			      }
			}
    },

    setSVG : function (svg){
		this.svgs.push(svg);
		this.getCanvas();
    },


    renderAllNodeOnNoMainCanvas : function (node, coordenates) {
	  var _this = this;
	  for (var i=0; i< this.graphViewNodes.length; i++)
	  {
		 var nodeView =this.graphViewNodes[i];
		 for (var j=1; j< this.svgs.length; j++){
			this.graphViewNodes[i].render(this.svgs[j]);
		 }
	  }
    },
    
    renderAllNodes : function (node, coordenates){
    for (id in this.graphViewNodes){
    		this.graphViewNodes[id].render(this.svg);
    	}
    },

    renderEdge : function (edge, node1, coordenates1, node2, coordenates2, color, controller) {
      var nodeView1 = new GraphViewNode(this, node1, coordenates1, this.radio);
	  var nodeView2 = new GraphViewNode(this, node2, coordenates2, this.radio);
	  var edgeView = new EdgeViewNode(this,edge, nodeView1, nodeView2,color);
	  if(controller._deletedEdges[edgeView.edge.id] == false)
		  if(controller._visibleEdges[edgeView.edge.id] == true)
			  for (var i=0; i< this.svgs.length; i++){
				edgeView.render(this.svgs[i]);
			  }
    },


   GetTrueCoords : function (evt, SVGRoot){
		var TrueCoords = this.svg.createSVGPoint();
		TrueCoords.x = this.getMouseCoords(evt, SVGRoot).x;//evt.clientX ;
		TrueCoords.y = this.getMouseCoords(evt, SVGRoot).y;
		return TrueCoords;
    },

     //hopefully return the mouse coordinates inside parent element
     getMouseCoords : function(e, parent) {
		var x, y;
		muna = parent;
		if (document.getBoxObjectFor) {
			// sorry for the deprecated use here, but see below
			var boxy = document.getBoxObjectFor(parent);
			x = e.pageX - boxy.x;
			y = e.pageY - boxy.y;
		} 
		else if (parent.getBoundingClientRect) {
			// NOTE: buggy for FF 3.5: https://bugzilla.mozilla.org/show_bug.cgi?id=479058
			/* I have also noticed that the returned coordinates may change unpredictably
			after the DOM is modified by adding some children to the SVG element */
			var lefttop = parent.getBoundingClientRect();
			//console.log(parent.id + " " + lefttop.left + " " + lefttop.top);
			x = e.clientX - Math.floor(lefttop.left);
			y = e.clientY - Math.floor(lefttop.top);
		} else {
			x = e.pageX - (parent.offsetLeft || 0);
			y = e.pageY - (parent.offsetTop || 0);
		}
	
		return { x: x, y: y };
	}




};

function EdgeViewNode(graphView, edge, nodeViewSource, nodeViewTarget, strokeColor) {
   this.edge = edge;
   this.nodeViewSource = nodeViewSource;
   this.nodeViewTarget = nodeViewTarget;
   this._graphView = graphView;
   this.strokeColor = strokeColor;
   this.click = new Event(this);
};

EdgeViewNode.prototype = {
    render : function (svg){
	      this.svg= svg;
	      var x1 = Math.ceil( this.nodeViewSource.cx);
	      var y1 =  Math.ceil(this.nodeViewSource.cy);
	      var x2 =  Math.ceil(this.nodeViewTarget.cx);
	      var y2 =  Math.ceil(this.nodeViewTarget.cy);
	    
	      
	    if (this.nodeViewSource.node.id == this.nodeViewTarget.node.id){   
	        
	        var nodeSize = this.nodeViewSource.node.size;
	        var  x11 = x1 -(nodeSize/2);
	        var y11 = y1 -(nodeSize/2);
	        
	        var  x12 = x1 + (nodeSize/2);
	        var y12 = y1 -(nodeSize/2);
	        
	        var curvePointX = (x12 - x11)/2 + x11;
	        var curvePointY = y1 - (nodeSize*2);
	        
	        var d = "M" + x11 + "," + y11 + " T" + curvePointX + "," +curvePointY + " " +  x12+ "," + y12 ;
	    	var attributes = [['x1', x1],['x2', x2], ['y1', y1], ['y2', y2],["fill", "none"],["stroke-width", "2"],['id', this.edge.getId()], ['stroke', this.strokeColor], ['opacity',0.5], ['class', 'EDGE']];
	        //var attributes = [['id', this.edge.getId()], ['stroke', 'black'],["fill", "none"],['opacity', this.edge.opacity], ['class', 'EDGE']];
			SVG.drawPath(d, this.getCanvas(), attributes);
			this.attachEvents(document.getElementById(this.edge.id));
			
	    }
	    else{
				if (this.edge.type == "line"){
					//var attributes = [['x1', x1],['x2', x2], ['y1', y1], ['y2', y2],["stroke-width", "2"],['id', this.edge.getId()],['fill',this.strokeColor ], ['stroke', this.strokeColor], ['opacity',0.5], ['class', 'EDGE']];
					var attributes = [['x1', x1],['x2', x2], ['y1', y1], ['y2', y2],["stroke-width", "2"],['id', this.edge.getId()],['fill',this.strokeColor ], ['stroke', this.strokeColor], ['opacity',0.5], ['class', 'EDGE']];
					drawLine(attributes , this.getCanvas()); 
					this.attachEvents(document.getElementById(this.edge.id));
				}
				
				if (this.edge.type == "bezier"){
					
					if (this.edge.classesNumber== 3){
						var attributes = [['id', this.edge.getId()], ['stroke', 'black'],["fill", "none"],['opacity', this.edge.opacity], ['class', 'EDGE']];
						var minX = 0;Math.min(x1, x2);
						var minY = 0;Math.min(y1, y2);
						
						if (this.edge.area=="AreaA"){
								minX = Math.min(x1, x2) ;
								minY = Math.min(y1, y2);
						}
						
						if (this.edge.area=="AreaB"){
								 minX = Math.max(x1, x2);
								minY = Math.min(y1, y2);
						}
						
						if (this.edge.area=="AreaC"){
								 minX =(x2-x1)/2+ x1;
								minY =  Math.max(y1, y2);
						}
						
						var d = "M" + x1 + "," + y1 + " Q" + minX + "," +minY + " " +  x2+ "," + y2 ;
						SVG.drawPath(d, this.getCanvas(), attributes);
						this.attachEvents(document.getElementById(this.edge.id));
					}
				}
	    }
		
		
    },


    getCanvas : function(){
		for (j=0; j<this.svg.childNodes.length; j++){
			if (this.svg.childNodes[j].id == "edges"){
				  return ( this.svg.childNodes[j]);
			}	
		}
    },
    attachEvents : function(object){
    	var _this = this;
    	object.onclick = (function (evt) {
    		_this._graphView.selectedEdgeEvent(evt.target.id);
    	});
    }
};



function ellipse(args){
	var required = ["center", "xRadius", "yRadius", "steps"];

	args.begin=0;
	

	var arcLength=(Math.PI * 2) / (args.steps);
	var angle = new Array();
	
	
	for(var i=0; i<args.steps; i++)	angle[i] = (arcLength * i) + args.begin;
	
	
	var pointArray = new Array();
	for(var j=0; j<args.steps; j++){
		var point=new Array();
		var x = args.xRadius * Math.cos(angle[j]);
		var y = args.yRadius * Math.sin(angle[j]);

		  
		var out = {x:Math.round(parseInt(x) + parseInt(args.center.x)), y:Math.round( parseInt(y) +  parseInt(args.center.y)), idx:j};
		pointArray[j] = out;
	}
	return pointArray;
};






//Math

function calculateDistanceBetweenTwoPoints(x1, y1, x2, y2)
{
	var pow1 = Math.pow((x2 - x1), 2);
	var pow2 =  Math.pow((y2 - y1), 2);
	return  Math.sqrt(pow1 + pow2);
}

function calculateAngleBetweenTwoPoints(x1, y1, x2, y2){
     	return Math.atan2((y2-y1),(x2-x1))*180/Math.PI;
}



function drawLine(attributes , svg) {
	var line = document.createElementNS("http://www.w3.org/2000/svg","line");
	setProperties(line, attributes);
	svg.appendChild(line);	
	return line;
}
/*
function drawText  (x, y, text, canvasSVG, attributes) {
			
	var newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
	newText.setAttributeNS(null, "x",x);		
	newText.setAttributeNS(null, "y",y);	

	var textNode = document.createTextNode(text);
	newText.appendChild(textNode);
	
	canvasSVG.appendChild(newText);

	for (var i=0; i< attributes.length; i++)
	{
		newText.setAttributeNS(null, attributes[i][0], attributes[i][1]);
	}
}
*/

function drawRect(attributes , svg){
	  var rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
	  setProperties(rect, attributes);
	  svg.appendChild(rect);	
	  return rect;
}

function drawCircle(attributes , svg){
	  var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
	  setProperties(circle, attributes);
	  svg.appendChild(circle);	
	  return circle;
}

function setProperties (element, attributes) {
	for (var i=0; i< attributes.length; i++){
		element.setAttribute(attributes[i][0], attributes[i][1]);
	}
}


/*
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