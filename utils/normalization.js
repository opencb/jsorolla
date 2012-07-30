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