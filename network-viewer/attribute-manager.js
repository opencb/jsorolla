function AttributeManager(defaultAttrs) {

	this.model = Ext.define('User', {
		extend: 'Ext.data.Model'
	});

	this.store = Ext.create('Ext.data.Store', {
		id : 'attrMngrStore',
		// autoLoad: false,
		model : this.model
	});

	//atributos del grid
	this.columnsGrid = []; 

	//los atributos en un array de strings
	this.attributes = [];

	//valores de los campos del Model
	this.fieldsModel = [];
	
	this.filters = {};

	// Add default attributes received
	for(var i=0; i<defaultAttrs.length; i++){
		this.addAttribute(defaultAttrs[i][0], defaultAttrs[i][1], defaultAttrs[i][2]);
	}
};


//-----------------------addAttribute---------------------------------------//
//Descripcion:
//Añade un nuevo atributo
//Parametros:
//attributesName: nombre del atributo
//types: tipo del atributo
//defaultValues: valores por defecto del atributo
//--------------------------------------------------------------------------//
AttributeManager.prototype.addAttribute = function(name, type, defaultValue) {
	var error = false;
	for ( var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i] == name) error = true; 
	}
	
	if(!error) {
		this.fieldsModel.push({
			"name": name,
			"type": type,
			"defaultValue": defaultValue
		});	
		
		this.attributes.push(name);	
		
		//pasamos los atributos al formato soportado por grid
		this.columnsGrid.push({
			"text": name,
			"dataIndex": name,
			"editor": {xtype: 'textfield', allowBlank: true}
		});
		
		// set model fields
		this.model.setFields(this.fieldsModel);
		
		return true;
	}
	else {
		return false;
	}
};

AttributeManager.prototype.updateAttribute = function(oldName, newName, type, defaultValue) {
	for(var i = 0; i < this.attributes.length; i++) {
		if(oldName != newName && this.attributes[i] == newName) return false;
	}
	
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i] == oldName) {
			if(oldName != newName) {
				this.attributes[i] = newName;
				this.columnsGrid[i].text = newName;
				this.columnsGrid[i].dataIndex = newName;
				this.fieldsModel[i].name = newName;
			}
			this.fieldsModel[i].type = type;
			this.fieldsModel[i].defaultValue = defaultValue;
			
			this.model.setFields(this.fieldsModel);
			
			return true;
		}
	}
	return false;
};

AttributeManager.prototype.removeAttribute = function(attribute) {
	for(var i = 0; i < this.attributes.length; i++) {
		if(this.attributes[i]==attribute) {
			this.attributes.splice(i,1);
			this.columnsGrid.splice(i,1);
			this.fieldsModel.splice(i,1);
			
			this.model.setFields(this.fieldsModel);
			
			return true;
		}
	}
	return false;
};

//-----------------------addRow-------------------------------------------//
//Descripcion:
//Añade datos al store
//Parametros:
//data: (array de array de strings) datos
//------------------------------------------------------------------------//
AttributeManager.prototype.addRow = function(data) {
//	if(data.length == this.columnsGrid.length) {

		//guardamos la informacion de data en un array de objetos
		var arr2 = new Array();
		var aux2 = new Object();

		for (var i = 0; i <  this.columnsGrid.length; i++) {
			aux2[this.attributes[i]] = data[i]; // para que la key sea el valor de una variable
		}
		arr2.push(aux2);

		//añadimos los datos al store
		this.store.loadData(arr2, true);
//	}
//	else{
//		console.log("Error introduciendo los datos");
//	}
};


//-------------------------------modifyAttributeOfRows---------------------------//
//Descripcion:
//Modifica un atributo del conjunto de filas seleccionadas, poniendole el mismo 
//valor en todas. 
//Parametros: 
//selectRows: (array de objetos) informacion de las filas seleccionadas
//attributeModify: (string) atributo que se desea modificar
//value: (string) valor nuevo de ese atributo
//-------------------------------------------------------------------------------//
AttributeManager.prototype.modifyAttributeOfRows = function(selectRows, attributeModify, value) {
	for ( var i = 0; i < selectRows.length; i++) {
		selectRows[i].data[attributeModify] = value;
	}

	this.store.loadData(selectRows, true);
};



//-----------------------removeRow----------------------------------------------//
//Descripcion:
//Borra una fila identificada a partir del valor de un campo
//Parametros:
//attribute: (string) campo en el que buscar
//value: (string) nombre del campo que buscar
//------------------------------------------------------------------------------//
AttributeManager.prototype.removeRow = function(attribute, value) {	
	//obtenemos la posicion del dato y lo borramos
	this.store.removeAt(this.store.find(attribute,  value));	
};


//-----------------------removeRows----------------------------------------------//
//Descripcion:
//Borra todas las filas que tengan el valor indicado en el atributo indicado
//Parametros:
//attribute: (string) campo en el que buscar
//value: (string) nombre del campo que buscar
//------------------------------------------------------------------------------//
AttributeManager.prototype.removeRows = function(attribute, value) {	
	//obtenemos la posicion del dato y lo borramos
	this.store.removeAt(this.store.find(attribute,  value));	

	var i = -1;

	while (this.store.find(attribute,  value) != -1){
		//cada vez busca a partir de donde se quedó la ultima vez
		i = this.store.find(attribute,  value, i+1);
		this.store.removeAt(i);	

		console.log(i);
	}
};


//-----------------------clearRow-----------------------------------------------//
//Descripcion:
//Borra todos los datos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManager.prototype.clearRow = function(){
	this.store.removeAll();
};


//-----------------------clearAttributes----------------------------------------//
//Descripcion:
//Borra todos los atributos y los datos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManager.prototype.clearAttributes = function(){
	this.model.setFields([]);
	this.grid.reconfigure(null, []); 

	//como hemos borrado los atributos, borramos los datos
	this.store.removeAll();

	//borramos la informacion de las variables de la clase
	this.attributes = [];
	this.columnsGrid = [];
};


//-----------------------getNumberOfRows----------------------------------------//
//Descripcion:
//Cuenta cuantos datos tenemos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManager.prototype.getNumberOfRows = function() {
	return this.store.count();
};


//-----------------------getDiferentRowOfAAttribute-----------------------------//
//Descripcion:
//Devuelve los diferentes datos que hay en un atributo
//Parametros:
//attribute: (string) nombre del atributo 
//------------------------------------------------------------------------------//
AttributeManager.prototype.getDiferentRowOfAAttribute = function(attribute) {
	var x = this.store.collect(attribute);
	console.log(x);
};


//-----------------------getPositionOfRow---------------------------------------//
//Descripcion:
//Devuelve la posicion de un dato identificado un atributo y su valor
//Parametros:
//attribute: (string) atributo por la que queremos buscar
//value: (string) valor del atributo por la que queremos buscar
//------------------------------------------------------------------------------//
AttributeManager.prototype.getPositionOfRow = function(attribute, value) {
	var aux = this.store.find(attribute, value);
	return(aux);
};


//-----------------------getRowByIndex------------------------------------------//
//Descripcion:
//Muestra el dato que se encuentran en el indice indicado
//Parametros:
//index:(number) index del dato del que queremos obtener informacion
//------------------------------------------------------------------------------//
AttributeManager.prototype.getRowByIndex = function(index) {
	var aux =  this.store.getAt(index);
	console.log(aux.data);
};


//-----------------------getRowRangeIndex---------------------------------------//
//Descripcion:
//Muestra los datos que se encuentran entre los dos indices que le pasamos
//Parametros:
//startIndex: (number) index por el cual empezamos
//endIndex: (number) index por el cual acabamos
//------------------------------------------------------------------------------//
AttributeManager.prototype.getRowRangeIndex = function(startIndex, endIndex) {
	var aux = this.store.getRange(startIndex, endIndex);

	for(var i = 0; i < aux.length; i++){
		console.log(aux[i].data);
	}
};


AttributeManager.prototype.addFilter = function(filterName, attribute, value) {
	if(!this.filters[filterName] && attribute!=null && value != null){
		this.filters[filterName] = {"active": false, "attribute": attribute, "value": value};
		this.enableFilter(filterName);
		return true;
	}
	return false;
};

AttributeManager.prototype.removeFilter = function(filterName) {
	if(this.filters[filterName]) {
		this.disableFilter(filterName);
		delete this.filters[filterName];
		return true;
	}
	return false;
};

AttributeManager.prototype.enableFilter = function(filterName) {
	this.filters[filterName].active = true;
	
	//this.store.filter(this.filters[filterName].attribute, this.filters[filterName].value); //para filtrar cuando este escrito el nombre entero bien
	var reg = new RegExp(""+this.filters[filterName].value);
	this.store.filter(Ext.create('Ext.util.Filter', {property: this.filters[filterName].attribute, value: reg, root: 'data'}));
};

AttributeManager.prototype.disableFilter = function(filterName) {
	this.filters[filterName].active = false;
	
	this.store.clearFilter(false);
	for (var filter in this.filters) {
		if(this.filters[filter].active) {
			//this.store.filter(this.filters[filterName].attribute, this.filters[filterName].value); //para filtrar cuando este escrito el nombre entero bien
			var reg = new RegExp(""+this.filters[filter].value);
			this.store.filter(Ext.create('Ext.util.Filter', {property: this.filters[filter].attribute, value: reg, root: 'data'}));
		}
	}
};

//-----------------------checkFilters-------------------------------------------//
//Descripcion:
//Comprueba si hay aplicado algun filtro
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManager.prototype.checkFilters = function() {
	console.log(this.store.isFiltered());
	return this.store.isFiltered();
};


//-----------------------clearFilters-------------------------------------------//
//Descripcion:
//Quita los filtros aplicados a los datos
//Parametros: (ninguno)
//------------------------------------------------------------------------------//
AttributeManager.prototype.clearFilters = function() {
	this.store.clearFilter(false);
};


//----------------------------------fromJSON-----------------------------------//
//Descripcion:
//Coge los datos de un fichero en formato JASON para añadirlos
//Parametros: 
//data: (string) datos
//-----------------------------------------------------------------------------//
AttributeManager.prototype.fromJSON = function(data) {
	this.store.loadData(JSON.parse(data), false); 
	console.log(this.store);
	//hay que pasarle los datos de los fields al model i al grid 
	//this.model.setFields(arr_1);  	
	//this.grid.reconfigure(null, this.columnsGrid); 
};


//----------------------------------toJSON-------------------------------------//
//Descripcion:
//Coge los datos y los transforma en un string para poder almacenarlos 
//en un fichero de formato JSON
//Parametros: (ninguno)
//-----------------------------------------------------------------------------//
AttributeManager.prototype.toJSON = function() {
	var end = this.store.getRange().length;
	var aux = this.store.getRange();
	var row = new Array ();

	for(var i=0; i<end ; i++){
		row[i] = aux[i].data;
	}
	row = JSON.stringify(row);

	console.log(row);
};

AttributeManager.prototype.setName = function(nodeId, newName) {
	this.store.getAt(this.store.find("Id",  nodeId)).set("Name", newName);
};

AttributeManager.prototype.getAttrNameList = function() {
	return this.attributes;
};

AttributeManager.prototype.exportToTab = function(columns, clearFilter) {
	if(clearFilter) {
		this.store.clearFilter(false);
	}
	
	var output = "#";
	var colNames = [];
	for(var i = 0; i < columns.length; i++) {
		output += columns[i].inputValue + "\t";
		colNames.push(columns[i].inputValue);
	}
	output += "\n";
	
	var lines = this.store.getRange();
	for(var j = 0; j < lines.length; j++) {
		for(var i = 0; i < colNames.length; i++) {
//			console.log(lines[j].getData()[field]);
			output += lines[j].getData()[colNames[i]] + "\t";
		}
		output += "\n";
	}
	
	if(clearFilter) {
		for (var filter in this.filters) {
			if(this.filters[filter].active) {
				//this.store.filter(this.filters[filterName].attribute, this.filters[filterName].value); //para filtrar cuando este escrito el nombre entero bien
				var reg = new RegExp(""+this.filters[filter].value);
				this.store.filter(Ext.create('Ext.util.Filter', {property: this.filters[filter].attribute, value: reg, root: 'data'}));
			}
		}
	}
	
	return output;
};
