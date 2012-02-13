ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;


function ExpressionGenomicAttributesWidget(targetId, widgetId, args){
	GenomicAttributesWidget.prototype.constructor.call(this, targetId, widgetId, args);
    this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), this.getKaryotypePanelId(), {"top":10, "width":1000, "height": 300, "trackWidth":15});
};


ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				console.log(items);
				var _this = this;
				this.karyotypePanel.setLoading("Connecting to Database");
				this.karyotypeWidget.unmark();
				var _this=this;
				var externalNames = [];
				
				if (items.length > 0){
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					
					
					var cellBaseDataAdapter = new CellBaseDataAdapter();
					cellBaseDataAdapter.successed.addEventListener(function(sender){		
						_this.karyotypePanel.setLoading("Retrieving data");
						for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
								_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
						}
						_this.karyotypePanel.setLoading(false);
					});
					cellBaseDataAdapter.fill("feature", "gene", externalNames.toString(), "info");
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};


