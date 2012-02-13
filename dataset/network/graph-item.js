function GraphItem(id, name, args){
	this.id = id;
	this.name = name;
	this.type = "NONE";
	
	this.args = new Object();
	
	
	if (args!=null){
		this.args = args;
		if (args.type !=null){
			this.type = args.type;
		}
	}
	
	//Events
	this.nameChanged = new Event(this);
	this.deleted = new Event(this);
}

GraphItem.prototype.getName = function(){
	return this.name;
};

GraphItem.prototype.getId = function(){
	return this.id;
};

GraphItem.prototype.setName = function(name){
	var oldName = this.getName();
	this.name = name;
	this.nameChanged.notify({"item": this, "previousName" : oldName});
};




