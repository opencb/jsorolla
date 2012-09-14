DOTNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function DOTNetworkFileWidget(args){
	if(args == null) {
		var args={};
	}
	else {
		this.networkData = args.networkData;
	}
	args.title='Import a Network DOT file';
	NetworkFileWidget.prototype.constructor.call(this, args);
};


DOTNetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText: 'DOT network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
				var dotDataAdapter = new DOTDataAdapter(new FileDataSource(file), {"networkData":_this.networkData});
				dotDataAdapter.onLoad.addEventListener(function(sender,data){
					_this.content = dotDataAdapter.getNetworkData(); //para el onOK.notify event
				});
			}
		}
	});
	
	return this.fileUpload;
};
