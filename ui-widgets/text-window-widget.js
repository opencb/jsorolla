function TextWindowWidget(args){
	this.windows = new Array();
};

TextWindowWidget.prototype.draw = function(text){
//	this.windows.push( window.open(''+self.location,"Bioinformatics",config="height="+500+",width="+800+" ,font-size=8, resizable=yes, toolbar=1, menubar=1"));
//	this.windows[this.windows.length-1].document.write("<title>"+ "asdasda" +"</title>");
//	this.windows[this.windows.length-1].document.write(text);
//	this.windows[this.windows.length-1].document.close();
	
	
	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin',
	'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};


function ClienSideDownloaderWindowWidget(args){
	this.windows = new Array();
};

ClienSideDownloaderWindowWidget.prototype.draw = function(text, content){
//	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin', 'left=20,top=20,width=500,height=200');
	
	myRef = window.open('data:text/csv,' + content,'mywin', 'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};