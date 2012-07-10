BEDDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;

function BEDDataAdapter(dataSource, args){
	FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
	var _this = this;
	
	this.async = true;

	if (args != null){
		if(args.async != null){
			this.async = args.async;
		}
	}
	
	if(this.async){
		this.dataSource.success.addEventListener(function(sender,data){
			_this.parse(data);
			_this.onLoad.notify();
		});
		this.dataSource.fetch(this.async);
	}else{
		var data = this.dataSource.fetch(this.async);
		this.parse(data);
	}
	
	
	//stat atributes
	this.featuresCount = 0;
	this.featuresByChromosome = {};
};

BEDDataAdapter.prototype.parse = function(data){
	var _this = this;
	var dataType = "data";
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");

			var feature = {
					"label":fields[3],
					"chromosome": fields[0].replace("chr", ""), 
					"start": parseFloat(fields[1]), 
					"end": parseFloat(fields[2]), 
					"score":fields[4],
					"strand":fields[5],
					"thickStart":fields[6],
					"thickEnd":fields[7],
					"itemRgb":fields[8],
					"blockCount":fields[9],
					"blockSizes":fields[10],
					"blockStarts":fields[11],
					"featureType":	"bed"
			} ;

			this.featureCache.putFeatures(feature, dataType);
			
			if (this.featuresByChromosome[fields[0]] == null){
				this.featuresByChromosome[fields[0]] = 0;
			}
			this.featuresByChromosome[fields[0]]++;
			this.featuresCount++;
		}
	}
};
