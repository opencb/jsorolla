function NetworkMetaDataViewer(args){
	this.species = "hsa";
	
	
	/** URL **/ 
	this.servletURL = "http://bioinfo.cipf.es/commons/ws/rest/utils/file/save";
	this.servletPNGURL = "http://bioinfo.cipf.es/commons/ws/rest/io/svg/topng";
	this.width = 1000;
	this.height = 1000;
	
	if(args!=null){
		if(args.width != null)
			this.width = args.width;
		if(args.height != null)
			this.height = args.height;
	}
	
	/** Network **/
	this.metaNetwork = new MetaNetwork();
	
	/** Visualization network objects **/
	this.formatter = this.getNewFormatter();
	this.layout = new LayoutDataset();
	
	
	/** Attributes **/
	this.setAttributesDataset(new AttributesDataset());
};

NetworkMetaDataViewer.prototype.getAttributesDataset = function(){
	return this.attributesDataset;
};

NetworkMetaDataViewer.prototype.setAttributesDataset = function(attributesDataset){
	this.attributesDataset = attributesDataset;
};

NetworkMetaDataViewer.prototype.getNewFormatter = function(){
	this.formatter = new NetworkDataSetFormatter({
		"defaultFormat": {"type":"LineEdgeNetworkFormatter","opacity":1, "fill":"#000000", "radius":"5", "strokeWidth":"1", "stroke":"#000000", "size":"2", "title":{"fontSize":10, "fill":"#000000"}},
		"selected": {"opacity":0.9, "fill":"#FF0000", "radius":"5", "stroke":"#000000",  "size":"2"},
		"over": {"opacity":1, "fill":"#DF0101", "radius":"5", "stroke":"#000000",   "size":"2", "strokeWidth":"1"}
	}, 
	{
		"defaultFormat": {  "opacity":0.8,"stroke":"#000000", "strokeWidth":"1", "strokeOpacity":0.5, "title":{"fontSize":6, "fontColor":"#000000"}},
		"selected": {"stroke":"#DF0101", "fill":"#FF0000"},
		"over": { "stroke":"#DF0101","strokeOpacity":1, "strokeWidth":"4"}
	},
	{ "labeled":false, "height":this.height,"width":this.width,"right":this.width,"backgroundColor":"#FFFFFF", "balanceNodes":false, "nodesMaxSize":4, "nodesMinSize":2});		

	return this.formatter;
};

NetworkMetaDataViewer.prototype.setDataset = function(dataset){
	this.getMetaNetwork().setDataset(dataset);
//	this.attributesDataset.setDataset(this.getDataset());
	
};

NetworkMetaDataViewer.prototype.getDataset = function(){
	return this.getMetaNetwork().getDataset();
};

NetworkMetaDataViewer.prototype.setFormatter = function(formatter){
	this.formatter = formatter;
};

NetworkMetaDataViewer.prototype.getFormatter = function(){
	return this.formatter;
};

NetworkMetaDataViewer.prototype.setLayout = function(layout){
	this.layout = layout;
};

NetworkMetaDataViewer.prototype.getLayout = function(){
	return this.layout;
};

NetworkMetaDataViewer.prototype.getMetaNetwork = function(){
	return this.metaNetwork;
};


NetworkMetaDataViewer.prototype.getSpecies = function(){
	return this.getMetaNetwork().getSpecies();
};

NetworkMetaDataViewer.prototype.setSpecies = function(specie){
	this.getMetaNetwork().setSpecies(specie);
};

NetworkMetaDataViewer.prototype.loadJSON = function(content){
	var json = JSON.parse(content);
//	var dataset_json =  (json.dataset);
//	var formatter_json =  (json.formatter);
//	var layout =  (json.layout);
	
//	var layout =  (json.formatter.layout); //for last version jsons
	this.setDataset(new GraphDataset(this.species));
	this.getDataset().loadFromJSON(json.dataset);

	this.setFormatter(new NetworkDataSetFormatter());
	this.getFormatter().loadFromJSON(this.getDataset(), json.formatter);
	
	this.setLayout(new LayoutDataset());
	this.getLayout().loadFromJSON(this.getDataset(),json.layout);
//	this.getLayout().loadFromJSON(this.getDataset(),json.formatter.layout); //for last version jsons
};

NetworkMetaDataViewer.prototype.loadSif = function(sifdataadapter){
	this.formatter = new NetworkDataSetFormatter({
		"defaultFormat": {"type":"LineEdgeNetworkFormatter","opacity":1, "fill":"#000000", "radius":"5", "strokeWidth":"1", "stroke":"#000000", "size":"4", "title":{"fontSize":10, "fill":"#000000"}},
		"selected": {"opacity":0.9, "fill":"#FF0000", "radius":"5", "stroke":"#000000",  "size":"4"},
		"over": {"opacity":1, "fill":"#FF0000", "radius":"5", "stroke":"#FFFFFF",   "size":"4", "strokeWidth":"1"}
	}, 
	{
		"defaultFormat": {  "opacity":1,"stroke":"#000000", "strokeWidth":"2", "strokeOpacity":0.5, "title":{"fontSize":6, "fontColor":"#000000"}},
		"selected": {"stroke":"#000000", "fill":"#FF0000"},
		"over": { "stroke":"#000000","strokeOpacity":1, "strokeWidth":"4"}
	},
	{ "labeled":true, "height":this.height,"width":this.width,"right":this.width,"backgroundColor":"#FFFFFF", "balanceNodes":false, "nodesMaxSize":4, "nodesMinSize":2});		

	this.setDataset(sifdataadapter.dataset);
	this.getFormatter().dataBind(sifdataadapter.dataset);
	this.setLayout(new LayoutDataset());
	this.getLayout().dataBind(sifdataadapter.dataset);
};
