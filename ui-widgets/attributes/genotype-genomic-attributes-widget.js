/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

GenotypeGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
GenotypeGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
GenotypeGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
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


