function LayoutDataset(){
	this.dataset = null;
	this.vertices = new Object();
	this.changed = new Event(this);
	this.layoutDone = new Event(this);
	this.args = new Object();
	
	//RANDOM, CIRCLE
	this.args.type = "CIRCLE";
};

LayoutDataset.prototype.loadFromJSON = function(dataset, json){
	var _this = this;
	this.vertices = new Object();
	this.dataset = dataset; //new GraphDataset();
	for ( var vertex in json) {
		this.vertices[vertex] = new NodeLayout(vertex, json[vertex].x, json[vertex].y);
		this.vertices[vertex].changed.addEventListener(function (sender, item){
			_this.changed.notify(item);
		});
	}
	this._attachDatasetEvents();
};


LayoutDataset.prototype.toJSON = function(){
	var serialize = new Object();
	for ( var vertex in this.vertices) {
		serialize[vertex] = new Object();
		serialize[vertex].x = this.vertices[vertex].x;  
		serialize[vertex].y = this.vertices[vertex].y;  
	}
	serialize.dataset = new Object();
	serialize.dataset =this.dataset.toJSON();
	return serialize;
};

LayoutDataset.prototype.dataBind = function(graphDataset){
	this.dataset = graphDataset;
	this._attachDatasetEvents();
	this._calculateLayout();
};

LayoutDataset.prototype._removeVertex = function(vertexId){
	delete this.vertices[vertexId];
};

LayoutDataset.prototype._attachDatasetEvents = function(){
	var _this = this;
	
	this.dataset.vertexDeleted.addEventListener(function (sender, item){
		_this._removeVertex(item.getId());
	});
	
	this.dataset.newVertex.addEventListener(function (sender, item){
		_this.vertices[item.getId()] = new NodeLayout(item.getId(), 0.5, 0.5);
		_this.vertices[item.getId()].changed.addEventListener(function (sender, item){
			_this.changed.notify(item);
		});
	});
};

LayoutDataset.prototype.getType = function(){
	return this.args.type;
};

LayoutDataset.prototype._calculateLayoutVertices = function(type, count){
	
	if (type == "CIRCLE"){
			var radius = 0.4;
			var centerX = 0.5;
			var centerY = 0.5;
			var verticesCoordinates = new Array();
			for(var i = 0; i < count; i++){
				x = centerX + radius * Math.sin(i * 2 * Math.PI/count);
				y = centerY + radius * Math.cos(i * 2 * Math.PI/count);
				verticesCoordinates.push({'x':x,'y':y});
			}
			return verticesCoordinates;
	}
};


LayoutDataset.prototype._calculateLayout = function(){
	var _this = this;
	if (this.getType() == "RANDOM"){
		for ( var vertex in this.dataset.getVertices()) {
			if (this.vertices[vertex] == null){
				this.vertices[vertex] = new NodeLayout(vertex, 0, 0);
			}
			this.vertices[vertex].setCoordinates(Math.random(), Math.random());
			this.vertices[vertex].changed.addEventListener(function (sender, item){
				_this.changed.notify(item);
			});
		}
	}
	
	if ( this.getType() == "CIRCLE"){
		
		var count = this.dataset._getVerticesCount();
		var verticesCoordinates = this._calculateLayoutVertices(this.getType(), count);
		
		var aux = 0;
		for ( var vertex in this.dataset.getVertices()) {
			if (this.vertices[vertex] == null){
				this.vertices[vertex] = new NodeLayout(vertex, 0, 0);
			}
			this.vertices[vertex].setCoordinates(verticesCoordinates[aux].x, verticesCoordinates[aux].y);//{"x":, "y":};
			aux++;
			this.vertices[vertex].changed.addEventListener(function (sender, item){
				_this.changed.notify(item);
			});
		}
	}
	
	
	if (this.getType() == "SQUARE"){
		
		var count = this.dataset._getVerticesCount();
		var xMin = 0.1;
		var xMax = 0.9;
		var yMin = 0.1;
		var yMax = 0.9;
		
		var rows = Math.sqrt(count);
		var step = (xMax - xMin) / rows;
		
		var verticesCoordinates = new Array();
		for(var i = 0; i < rows; i ++){
			for ( var j = 0; j < rows; j++) {
				x = i * step + xMin;
				y = j * step + yMin;
				verticesCoordinates.push({'x':x,'y':y});
			}
		}
		
		var aux = 0;
		for ( var vertex in this.dataset.getVertices()) {
			if (this.vertices[vertex] == null){
				this.vertices[vertex] = new NodeLayout(vertex, 0, 0);
			}
			this.vertices[vertex].setCoordinates(verticesCoordinates[aux].x, verticesCoordinates[aux].y);//{"x":, "y":};
			aux++;
			this.vertices[vertex].changed.addEventListener(function (sender, item){
				_this.changed.notify(item);
			});
		}
	}
	
};

LayoutDataset.prototype.getNodeById = function(id){
	return this.vertices[id];
};

LayoutDataset.prototype.getVerticesByArea = function(x1, y1, x2, y2){
	var vertices = new Array();
	for ( var vertex in this.dataset.getVertices()) {
		if ((this.vertices[vertex].x >= x1)&&(this.vertices[vertex].x <= x2)){
			if ((this.vertices[vertex].y >= y1)&&(this.vertices[vertex].y <= y2)){
				vertices.push(this.vertices[vertex]);
			}
		}
	}
	return vertices;
};




LayoutDataset.prototype.getLayout = function(type){
	
	if (type == "CIRCLE"){
		this.args.type = "CIRCLE";
		this._calculateLayout();
		return;
	}
	
	if (type == "SQUARE"){
		this.args.type = "SQUARE";
		this._calculateLayout();
		return;
	}
	
	if (type == "RANDOM"){
		this.args.type = "RANDOM";
		this._calculateLayout();
		return;
	}
	
	
	var dotText = this.dataset.toDOTID();
	var url = "http://bioinfo.cipf.es/utils/ws/rest/network/layout/"+type+".coords";
	var _this = this;
	
	 $.ajax({
         async: true,
         type: "POST",
         url: url,
         dataType: "text",
         data: {
                 dot :dotText
                 },  
         cache: false,
         success: function(data){ 
                         var response = JSON.parse(data);
//                         console.log(response);
                         for ( var vertexId in response) {
                        	 		//Se multiplica para q no se corten los vertices q estan en el borde.
                                 _this.vertices[vertexId].setCoordinates(0.05 + 0.85*response[vertexId].x,0.05 + 0.85* response[vertexId].y);
                         }
                         _this.layoutDone.notify();
                 }   
	 });
	 
//	$.ajax({
//		async: true,
//		type: "POST",
//		url: url,
//		dataType: "script",
//		data: {
//			dot :dotText
//			},
//		cache: false,
//		success: function(data){ 
//				var response = JSON.parse(data);
//				for ( var vertexId in response) {
//					_this.vertices[vertexId].setCoordinates(response[vertexId].x, response[vertexId].y);
//				}
//			}
//	});
	
};

function NodeLayout(id, x, y, args){
	this.id = id;
	this.x = x;
	this.y = y;
	this.changed = new Event(this);
};

NodeLayout.prototype.getId = function(id){
	return this.id;
};

NodeLayout.prototype.setCoordinates = function(x, y){
	this.x = x;
	this.y = y;
	this.changed.notify(this);
};

