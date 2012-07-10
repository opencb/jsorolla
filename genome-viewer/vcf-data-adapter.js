VCFDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;

function VCFDataAdapter(dataSource, args){
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

VCFDataAdapter.prototype.parse = function(data){
	var _this = this;
	var dataType = "data";
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			if (fields[0].substr(0,1) != "#"){
//				_this.addQualityControl(fields[5]);
				var feature = {
						"chromosome": 	fields[0],
						"position": 	parseInt(fields[1]), 
						"start": 		parseInt(fields[1]),//added
						"end": 			parseInt(fields[1]),//added
						"id":  			fields[2],
						"ref": 			fields[3], 
						"alt": 			fields[4], 
						"quality": 		fields[5], 
						"filter": 		fields[6], 
						"info": 		fields[7], 
						"format": 		fields[8], 
//						"record":		fields,
//						"label": 		fields[2] + " " +fields[3] + "/" + fields[4] + " Q:" + fields[5],
						"featureType":	"vcf"
				};
				this.featureCache.putFeatures(feature, dataType);
				
				if (this.featuresByChromosome[fields[0]] == null){
					this.featuresByChromosome[fields[0]] = 0;
				}
				this.featuresByChromosome[fields[0]]++;
				this.featuresCount++;
			}
		}
	}
};
