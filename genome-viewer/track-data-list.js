function TrackDataList(args) {
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	
	this.trackList =  new Array();
	
	if (args != null){
		if (args.chromosome != null) {
			this.chromosome = args.chromosome;
		}
		if (args.position != null) {//middle browser window
			this.position = args.position;
		}
		if (args.species != null) {
			this.species = args.species;
		}
	}
	
	this.onAddTrack = new Event();
};


TrackDataList.prototype.addTrack = function(item){
	var i = this.trackList.push(item);
	this.onAddTrack.notify(i-1);
};











