
function BiopaxManager(){
	
	this.server = "http://jtarraga:8080/biopax-ws/api/";
	this.version = "3.0/";
	this.specie = "hsap";

	//this.urlPathway = "http://jtarraga:8080/biopax-ws/api/3.0/hsap/pathway/";
	
	this.dbManager = new CellBaseManager();
	this.successed = new Event(this);
};

/** Pathways Tree **/
BiopaxManager.prototype._getPathwaysURL = function(specie){
	return this.server + this.version + this.specie + "/pathways?contentformat=jsonp&jsoncallback=?";
};

BiopaxManager.prototype.getPathways = function(specie){
	this.specie = specie;
	this.dbManager._callServer(this._getPathwaysURL(specie));
	var _this = this;
	this.dbManager.successed.addEventListener(function (evt, data){
		_this.successed.notify(data);
	});
};

/** Pathway **/
BiopaxManager.prototype._getPathwayURL = function(id){
	return this.server + this.version + this.specie +  "/pathway/"+ id + "?format=dotp";
};

BiopaxManager.prototype.getPathwayDot = function(specie, id){
	this.specie = specie;
	this.dbManager._callServer(this._getPathwayURL(id));
	var _this = this;
	this.dbManager.successed.addEventListener(function (evt, data){
		_this.successed.notify(data);
	});
};


/** datasources **/
BiopaxManager.prototype._getDatasourceURL = function(){
	return this.server + this.version + "datasources?contentformat=jsonp";
};

BiopaxManager.prototype.getDatasource = function(){
	
	this.dbManager._callServer(this._getDatasourceURL());
	var _this = this;
	this.dbManager.successed.addEventListener(function (evt, data){
		_this.successed.notify(data);
	});
};

