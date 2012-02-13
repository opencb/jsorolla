function ExpressionMatrixDataSet(){
	DataSet.prototype.constructor.call(this);

	
	this.normalizedRows = new Object();
	this.colorRows = new Object();
	this.classesName = null;
	this._classMaxInterval = new Object();
	this._classMinInterval = new Object();
	
	/** Original not modified json **/
	this._json = null;
	
	/** Optional parameters **/
	this.groupByClass = true;
	
};

//ExpressionMatrixDataSet.prototype.loadFromJSON =    DataSet.prototype.loadFromJSON;
ExpressionMatrixDataSet.prototype.toJSON  = 	    DataSet.prototype.toJSON;

ExpressionMatrixDataSet.prototype.loadFromJSON = function(json){
	if (this.validate(json)){
		this.json = json;
		this._json = JSON.parse(JSON.stringify(json));
		this.init();
	}
};

ExpressionMatrixDataSet.prototype.getRowNameByStatisticValue = function(statisticName, lower, bigger){
	var indexes = this.getRowIndexByStatisticValue(statisticName, lower, bigger);
	var rowNames = this.getRowNames();
	
	var rowSelectedName = new Array();
	for ( var i = 0; i < indexes.length; i++) {
		rowSelectedName.push(rowNames[indexes[i]]);
	}
	return rowSelectedName;
	
};

ExpressionMatrixDataSet.prototype.getRowIndexByStatisticValue = function(statisticName, lower, bigger){
	var statisticNames = this.getStatisticNames();
	for ( var i = 0; i < statisticNames.length; i++) {
		if (statisticNames[i]==statisticName){
			var rowIndex = new Array();
			
			var statisticMatrix = this.getStatisticMatrix();
			for ( var j = 0; j < statisticMatrix.length; j++) {
				
				if ((statisticMatrix[j][i]>=lower)&&(statisticMatrix[j][i]<=bigger)){
					rowIndex.push(j);
					
				}
				
			}
			return rowIndex;
		}
	}
};


/*
ExpressionMatrixDataSet.prototype.groupByClasses = function(){
	var classesName = this.getClassesName();
	
	var hashTable = new Object();
	//Inserted in a hashmap
	for ( var i = 0; i < classesName.length; i++) {
		hashTable[classesName[i]] = classesName[i];
	}
	
	console.log(hashTable);
	console.log(classesName);
	
};
*/

ExpressionMatrixDataSet.prototype.init = function(){
	/** Global parameteres **/
	this.normalizedRows = new Object();
	this.colorRows = new Object();
	this.classesName = null;
	this._classMaxInterval = new Object();
	this._classMinInterval = new Object();
	
	/** Normalizing and getting colors **/
	this.normalizeMatrix();
};

ExpressionMatrixDataSet.prototype.validate = function(json){
	return true;
};

ExpressionMatrixDataSet.prototype.getStatisticNames = function(){
	return this.json.statisticMatrix.columnNames;
};

ExpressionMatrixDataSet.prototype.getStatisticMatrix = function(){
	return this.json.statisticMatrix.matrix;
};


ExpressionMatrixDataSet.prototype.getRowNames = function(){
	return this.json.dataMatrix.rowNames
};

ExpressionMatrixDataSet.prototype.getColumnNames = function(){
	return this.json.dataMatrix.columnNames;
};

ExpressionMatrixDataSet.prototype.getMatrix = function(){
	return this.json.dataMatrix.matrix;
};

ExpressionMatrixDataSet.prototype.getClasses = function(){
	return this.json.classNames;
};

ExpressionMatrixDataSet.prototype.getClassesName = function(){
	if (this.classesName == null){
			var classes = this.getClasses();
			var aux = new Array();
			aux.push(classes[0]);
			this._classMinInterval[0] = 0
			
			for ( var i = 1; i < classes.length; i++) {
				if (classes[i]!=aux[aux.length-1]){
					aux.push(classes[i]);
					this._classMaxInterval[aux.length-2] = i-1;
					this._classMinInterval[aux.length-1] = i;
				}
			}
			//Insertamos la ultima columna de la ultima clase
			this._classMaxInterval[aux.length - 1] = classes.length - 1;
			this.classesName = aux;
	}
	return this.classesName;
};

ExpressionMatrixDataSet.prototype.getClassIntervalByIndex = function(classNameIndex){
	if (this.classesName == null){
		this.classesName = this.getClassesName();
	}
	return [this._classMinInterval[classNameIndex ], this._classMaxInterval[classNameIndex]]; 
};

ExpressionMatrixDataSet.prototype.normalizeMatrix = function(){
	for ( var i = 0; i < this.getRowNames().length; i++) {
		this.normalizedRows[i] = this.normalizedRow(i);
		this.colorRows[i] = this.getColorRow(i);
		this.classesName = this.getClassesName();
	}
};

ExpressionMatrixDataSet.prototype.normalizedRow = function(rowIndex){
	if (this.normalizedRows[rowIndex] == null){
		this.normalizedRows[rowIndex] = Normalizer.normalizeArray(this.getMatrix()[rowIndex]);
	}
	return this.normalizedRows[rowIndex];
};

ExpressionMatrixDataSet.prototype.getNormalizedData = function(rowIndex, columnIndex){
	return this.normalizedRow([rowIndex])[columnIndex];
};

ExpressionMatrixDataSet.prototype.getColorRow = function(rowIndex){
	if (this.colorRows[rowIndex] == null){
		this.colorRows[rowIndex] = Colors.getHexStringByScoreArrayValue(this.normalizedRow(rowIndex));
	}
	return this.colorRows[rowIndex];
};

ExpressionMatrixDataSet.prototype.getColor = function(rowIndex, columnIndex){
	return this.getColorRow(rowIndex)[columnIndex];
};

ExpressionMatrixDataSet.prototype.getClassesRange = function(){
	var classes = this.getClasses();

};





