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
