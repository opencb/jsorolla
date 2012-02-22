SIFNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function SIFNetworkFileWidget(args){
	if(args == null){
		var args={};
	};
	args.title='Import a Network SIF file';
	NetworkFileWidget.prototype.constructor.call(this, args);
};


SIFNetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText:'SIF network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var sifdataadapter = new InteractomeSIFFileDataAdapter();
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
				sifdataadapter.loadFromFile(file);
				sifdataadapter.onRead.addEventListener(function (sender, id){
					
					try{
						_this.content = sender; //para el onOK.notify event
						
						var vertices = sender.dataset.getVerticesCount();
						var edges = sender.dataset.getEdgesCount();
						
						var sif = new SIFFileDataAdapter().toSIF(sender.dataset);
						var tabularFileDataAdapter = new TabularFileDataAdapter();
						tabularFileDataAdapter.parse(sif);
						_this.gridStore.loadData(tabularFileDataAdapter.getLines());
						
						_this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>',false);
						_this.countLabel.setText('vertices:<span class="info">'+vertices+'</span> edges:<span class="info">'+edges+'</span>',false);
						
					}catch(e){
						_this.infoLabel.setText('<span class="err">File not valid </span>'+e,false);
					};
					
				}); 
		
			}
	    }
	});
	
	return this.fileUpload;
};
