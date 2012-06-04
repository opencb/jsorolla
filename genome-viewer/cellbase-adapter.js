function CellBaseAdapter(args){
	this.features = new Array();
	this.featuresByChromosome = new Array();
	this.completed = new Event();
	this.onGetData = new Event();
	this.host = null;
	
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
	}
	
	this.cellBaseManager = new CellBaseManager(this.species,{host: this.host});
	
};

CellBaseAdapter.prototype.getData = function(region){
	var _this = this;
	var query = region.chromosome+":"+region.start+"-"+region.end;
	this.cellBaseManager.success.addEventListener(function(sender,data){
		_this.onGetData.notify(data);
	});
	this.cellBaseManager.get(this.category, this.subCategory, query, this.resource);
};
