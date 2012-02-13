KaryotypeCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
KaryotypeCellBaseDataAdapter.prototype.getVersion = CellBaseDataAdapter.prototype.getVersion;
KaryotypeCellBaseDataAdapter.prototype.getSpecies = CellBaseDataAdapter.prototype.getSpecies;
KaryotypeCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
KaryotypeCellBaseDataAdapter.prototype.getFinished = CellBaseDataAdapter.prototype.getFinished;
KaryotypeCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;


function KaryotypeCellBaseDataAdapter(species) {
//	console.log(species);
	CellBaseDataAdapter.prototype.constructor.call(this, species);
	this.species = species;
	this.category = "feature";
	this.subcategory = "karyotype";
	this.resource = "chromosome";
	
	this.chromosomeNames = null;

};

KaryotypeCellBaseDataAdapter.prototype.fill = function( callbackFunction) {
	var _this = this;
//	console.log(this.species);
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(evt, data) {
		_this.getCytobandsByChromosome(cellBaseDataAdapter.dataset.json);
	});
	cellBaseDataAdapter.fill("feature", "karyotype", "none", "chromosome");
};







KaryotypeCellBaseDataAdapter.prototype.sortfunction = function(a, b) {
	var ValidChars = "0123456789.";
	var IsNumber = true;
	var Char;

	for (i = 0; i < a.length && IsNumber == true; i++) {
		Char = a.charAt(i);
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}

	if (!IsNumber)
		return 1;
	return (a - b);
};

KaryotypeCellBaseDataAdapter.prototype.IsNumeric = function(sText) {
	var ValidChars = "0123456789.";
	var IsNumber = true;
	var Char;

	for (i = 0; i < sText.length && IsNumber == true; i++) {
		Char = sText.charAt(i);
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}
	return IsNumber;
};

KaryotypeCellBaseDataAdapter.prototype.getCytobandsByChromosome = function(chromosomeName) {
	var _this = this;
	
	var cellBaseDataAdapterChr = new CellBaseManager(this.species);
	cellBaseDataAdapterChr.successed.addEventListener(function(evt, data) {
		_this.getFinished(data);
	});
	chromosomeName.sort(this.sortfunction);
	this.chromosomeNames = chromosomeName;
	cellBaseDataAdapterChr.get("feature", "karyotype", chromosomeName.toString(), "cytoband");

};



