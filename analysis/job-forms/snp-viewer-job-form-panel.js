SnpViewerJobFormPanel.prototype.draw = JobFormPanel.prototype.draw;
SnpViewerJobFormPanel.prototype.render = JobFormPanel.prototype.render;
SnpViewerJobFormPanel.prototype.getTreePanel = JobFormPanel.prototype.getTreePanel;
SnpViewerJobFormPanel.prototype.checkDataTypes = JobFormPanel.prototype.checkDataTypes;


function SnpViewerJobFormPanel(args){
	if (args == null){
		args = new Object();
	}
	args.title = "SNP viewer and filter";
	JobFormPanel.prototype.constructor.call(this, args);
};


SnpViewerJobFormPanel.prototype.getForms = function (){
		
		this.options = [];
		var forms = [];
		
		/****/
		var checkBoxes = [
		    "Mutations affecting protein structure and dynamics (SNPeffect)",
		    "Mutations affecting protein cellular processing (SNPeffect)	",
		    "Mutations affecting functional sites (SNPeffect)",
		    "Pathological mutations predicted by selective constraints (dN/dS)"];
		var textFields = [
		  	"Omega values from",
		  	"to"];
		var items = [];
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		for (var i = 0; i<textFields.length;i++){
			items.push(this.createTextFields(textFields[i]));
		}
		forms.push(this.createFormPanel("Non-synonymous SNPs", items));
		
		
		/****/	
		var checkBoxes =[	
            "TRANSFAC/Match predictions	",
            "JASPAR/MatScan predictions",
			"ORegAnno"];
		var items = [];
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		forms.push(this.createFormPanel("Transcription factor binding site", items));

		/****/
		var checkBoxes =[	
            "microRNA sequences",
            "microRNA targets"];
		var items = [];
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		forms.push(this.createFormPanel("microRNA", items));		
		
		/****/
		var checkBoxes =[	
            "Search in low-flexibility promoter regions"];
		var textFields = [
		     "Minimum length of sequences in bp"];
		var items = [];
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		for (var i = 0; i<textFields.length;i++){
			items.push(this.createTextFields(textFields[i]));
		}
		forms.push(this.createFormPanel("Promoter flexibility", items));
		
		/****/
		var checkBoxes =[	
            "Search in highly-conserved regions"];
		var items = [];
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		forms.push(this.createFormPanel("Conserved regions", items));
		
		/****/
		var checkBoxes =[	
		    "Splice sites created/disrupted by SNPs (GeneID predictions)",
		    "Exonic splicing enhancer",	
		    "Exonic splicing silencer"];
		var items = [];
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		forms.push(this.createFormPanel("Structural properties", items));
		
		/****/
		var checkBoxes =[	
	    "Synonymous coding",
	    "Non-Synonymous coding",
	    "Frame-shift coding",
	    "Intronic",
	    "5' UTR",
	    "3' UTR",
	    "Upstream",	
	    "Downstream",	
	    "Intergenic",
	    "Essential splice site",	
	    "Splice site",
	    "Regulatory region",	
	    "Stop-gained",
	    "Stop-lost",
	    "Complex indel",	
	    "Within mature miRNA"];
		
		var items = [];
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		forms.push(this.createFormPanel("Consequence types", items));
		
		/****/
		var checkBoxes =[	
            "CSHL-HAPMAP: HapMap-ASW",
            "CSHL-HAPMAP: HapMap-CEU",	
            "CSHL-HAPMAP: HapMap-CHB",
            "CSHL-HAPMAP: HapMap-CHD",
            "CSHL-HAPMAP: HapMap-GIH",
            "CSHL-HAPMAP: HapMap-JPT",
            "CSHL-HAPMAP: HapMap-LWK",
            "CSHL-HAPMAP: HapMap-MEX",
            "CSHL-HAPMAP: HapMap-MKK",
            "CSHL-HAPMAP: HapMap-TSI",
            "CSHL-HAPMAP: HapMap-YRI"];
		var textFields = [
			"Filter minor allele frequency from",
			"to"];
		
		var items = [];
		for (var i = 0; i<textFields.length;i++){
			items.push(this.createTextFields(textFields[i]));
		}
		for (var i = 0; i<checkBoxes.length;i++){
			items.push(this.createCheckBox(checkBoxes[i]));
		}
		forms.push(this.createFormPanel("Allele frequency and population", items));
		return forms;
		
};

SnpViewerJobFormPanel.prototype.createCheckBox = function (name){
	var cb = Ext.create('Ext.form.field.Checkbox', {
		 boxLabel : name,
		 name : name
	});
	return cb;
};
SnpViewerJobFormPanel.prototype.createTextFields = function (name){
	var tb = Ext.create('Ext.form.field.Text', {
		fieldLabel : name,
		name : name,
		allowBlank: false
	});
	return tb;
};
SnpViewerJobFormPanel.prototype.createFormPanel = function (title,items){
	this.options.push({text: title});
	var fp = Ext.create('Ext.form.Panel', {
		id:title,
		title:title,
		border:false,
		cls:'panel-border-left',
		flex:5,
		bodyPadding:10,
		minHeight:30,
//		width:this.width-20,
		items: items
	});
	return fp;
};



SnpViewerJobFormPanel.prototype.getTreeItems = function (){
	return this.options;
};

SnpViewerJobFormPanel.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
		case "Non-synonymous SNPs": this.panel.add(Ext.getCmp("Non-synonymous SNPs").show()); break;
		case "Transcription factor binding site": this.panel.add(Ext.getCmp("Transcription factor binding site").show()); break;
		case "microRNA": this.panel.add(Ext.getCmp("microRNA").show()); break;
		case "Promoter flexibility": this.panel.add(Ext.getCmp("Promoter flexibility").show()); break;
		case "Conserved regions": this.panel.add(Ext.getCmp("Conserved regions").show()); break;
		case "Structural properties": this.panel.add(Ext.getCmp("Structural properties").show()); break;
		case "Consequence types": this.panel.add(Ext.getCmp("Consequence types").show()); break;
		case "Allele frequency and population": this.panel.add(Ext.getCmp("Allele frequency and population").show()); break;
		case "":  break;
		}
	}
};
