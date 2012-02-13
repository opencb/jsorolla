GenotypeGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
GenotypeGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
GenotypeGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
GenotypeGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
GenotypeGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
GenotypeGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
GenotypeGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;
GenotypeGenomicAttributesWidget.prototype.fill = GenomicAttributesWidget.prototype.fill;
GenotypeGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;

function GenotypeGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Genotype";
	args.tags = ["genotype"];
	args.featureType = 'snp';
	args.listWidgetArgs = {title:'Filter',action:'filter', gridFields:["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};


