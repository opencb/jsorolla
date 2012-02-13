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

