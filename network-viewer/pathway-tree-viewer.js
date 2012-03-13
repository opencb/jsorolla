function PathwayTreeViewer(species){
	this.data = null;
	this.species = "hsap";
	if (species != null) {
		this.species = species;
	}
	
	this.title = "Loading data";
	
	this.width = 500;
	this.height = 400;
	
	this.selectedPathways = new Array();
	this.dataset = null;
	this.formatter = null;
	this.layout = null;
	
	//Data with the pathway tree
	this.treeData = new Array();
	this.test = null;
	this.testPathways = new Array();
	
	this.rendered = new Event();
	this.selected = new Event();
}

PathwayTreeViewer.prototype.getSpecies = function(){
	return this.testPathways;
};

PathwayTreeViewer.prototype.setSpecies = function(specie){
	 this.species = specie;
	 this.treeData = new Array();
};


PathwayTreeViewer.prototype.getPathways = function(id){
	return this.testPathways;
};

PathwayTreeViewer.prototype.getDot = function(id){
	var manager = new BiopaxManager();
	manager.getPathwayDot(this.species, id);
	console.log(id);
	var _this = this;
	manager.successed.addEventListener(function (evt, data){
		var adapter = new BiopaxDotFileDataAdapter();
		adapter.parseFromJSON(data);
	
		_this.dataset = adapter.getDataset();
		_this.formatter = adapter.getFormatter();
		_this.layout = adapter.getLayout();
		
		_this.selected.notify();
	});
	
	/*var manager = new CellBaseManager();
	manager._callServer(this.getPathwayURL(id));
	
	var _this = this;
	manager.successed.addEventListener(function (evt, data){
		var adapter = new BiopaxDotFileDataAdapter();
		adapter.parseFromJSON(data);
		
		_this.dataset = adapter.getDataset();
		_this.formatter = adapter.getFormatter();
		_this.layout = adapter.getLayout();
		
		_this.selected.notify();
	});*/
};


PathwayTreeViewer.prototype.computeNode = function(node){
	var item = new Object();
	item.text = node.name;
	item.leaf = true;
	item.id = node.id;
	
//	if (node.type == "pathway"){
//		this.testPathways.push(node.id);
//	}

	if ((node.components == null) || (node.components.length == 0)){
		//item.checked = false;
		return item;
	}
	else{
		item.children = new Array();
		item.leaf = false;
		item.checked = false;
		for ( var i = 0; i < node.components.length; i++) {
			item.children.push(this.computeNode(node.components[i]));
		}
		return item;
	}
};

PathwayTreeViewer.prototype.render = function(){
	
	if (this.treeData.length == 0){
		this.getData();
	}
	else{
		this.treeData = new Array();
	
		for ( var i = 0; i < this.data.pathways.length; i++) {
			this.treeData.push(this.computeNode(this.data.pathways[i]));
		}
		this.draw(this.treeData);
		this.rendered.notify();
	}
};


PathwayTreeViewer.prototype.getData = function(){
	var manager = new BiopaxManager();
	manager.getPathways(this.species);
	this.testPathways = new Array();
	var _this = this;
	manager.successed.addEventListener(function (evt, data){
		_this.treeData = new Array();
		_this.data = data;
		for ( var i = 0; i < _this.data.pathways.length; i++) {
			_this.treeData.push(_this.computeNode(_this.data.pathways[i]));
			_this.testPathways.push(_this.data.pathways[i].id);
		}
		_this.draw(_this.treeData);
		_this.rendered.notify();
	});
	
	/*var manager = new CellBaseManager();
	manager._callServer(this.url);
	
	var _this = this;
	manager.successed.addEventListener(function (evt, data){
		_this.treeData = new Array();
		_this.data = data;
		for ( var i = 0; i < _this.data.pathways.length; i++) {
			_this.treeData.push(_this.computeNode(_this.data.pathways[i]));
		}
		_this.draw(_this.treeData);
		_this.rendered.notify();
	});*/
};

PathwayTreeViewer.prototype.draw = function(json){
	var store = Ext.create('Ext.data.TreeStore', {
		root: {
        expanded: true, 
        text:"",
        user:"",
        status:"", 
        children: json
    },
	    sorters: [{
	        property: 'leaf',
	        direction: 'ASC'
	    }, {
	        property: 'text',
	        direction: 'ASC'
	    }]
	});
	 var _this =this;
	var tree = Ext.create('Ext.tree.Panel', {
	    store: store,
	    border:false,
	    rootVisible: false,
	    useArrows: true,
	    width: this.width,
	    height: this.height,
	    dockedItems: [{
	        xtype: 'toolbar',
	        items: {
	            text: 'Draw checked pathways',
	            handler: function(){
	                var records = tree.getView().getChecked(),
	                    names = [];
	               
	                Ext.Array.each(records, function(rec){
	                    names.push(rec.get('id'));
	                    _this.selectedPathways.push(rec.get('id'));
	                });
	                
	            	_this.getDot(_this.selectedPathways[_this.selectedPathways.length-1]);
	            }
	        }
	    }]
	});
	
	this.window = Ext.create('Ext.ux.Window', {
	    title: 'Pathway Explorer (' + _this.species + ")",
	    closable: true,
	    width: this.width,
	    height: this.height,
	    layout: 'fit',
	    items: tree
	});
	this.window.show();
};
