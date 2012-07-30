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



