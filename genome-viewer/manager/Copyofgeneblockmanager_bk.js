
function GeneBlockManager () {
	this.data = new Object();
	this.data.queues = new Array();
	this.data.queues[0] = new Array();
	this.data.transcriptQueueCount = new Object();
	
	this.data.transcriptQueue = new Array();
	
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};


GeneBlockManager.prototype.init = function(dataset){
	this.data.features = dataset;
	var features = this.data.features;
	for (var i = 0; i < features.length;  i++){
		var queueToDraw = this._searchSpace(features[i], this.data.queues);
		/** Insertamos en la cola para marcar el espacio reservado */
		this.data.queues[queueToDraw].push(features[i]);
		
		if (this.data.transcriptQueue[queueToDraw] == null){
			this.data.transcriptQueue.push(new Array());
		}

		this.data.TranscriptQueuesTest = new Array();
		for ( var j = 0; j < features[i].transcript.length; j++) {
			
			var featureAux = {"start": features[i].transcript[j].exon[0].start, "end":features[i].transcript[j].exon[features[i].transcript[j].exon.length -1 ].end};
			var queueTranscriptToDraw = this._searchSpace(featureAux, this.data.TranscriptQueuesTest);
			this.data.TranscriptQueuesTest[queueTranscriptToDraw].push(featureAux);
			
			if (this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw] == null){
				this.data.transcriptQueue[queueToDraw].push(new Array());
			}
			this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw].push(features[i].transcript[j]);
		}
		
	}
	return this.data.queues[queueToDraw].length;
};





/** True si dos bloques se solapan */
GeneBlockManager.prototype._overlapBlocks = function(block1, block2){
	if ((block1.start <= block2.end) && (block1.end >= block2.start)){
		return true;
	}
	return false;
};

/** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
GeneBlockManager.prototype._searchSpace = function(block1, queues){
//	var candidates = new Array();
	
	for (var i = 0; i < queues.length; i++ ){
//		console.log("Checking queueu " + i);
		var overlapping = new Array();
		for (var j = 0; j < queues[i].length; j++ ){
			var block2 = queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
//			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
//		console.log(overlapping);
		/** no se solapa con ningun elemento de la cola i entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
//			console.log("inserto en: " + i);
//			console.log(overlapping);
//			candidates.push(i);
			return i;
		}
	}
	
	/*for ( var i = 0; i < candidates.length; i++) {
		var maxDistance = Number.MIN_VALUE;
		var farCandidate = 0;
		var distances = new Array();
		debugger
		if (candidates.length >1){
			var distance = Number.MIN_VALUE;
			
			for ( var j = 0; j < queues[candidates[i]].length; j++) {
				if (queues[candidates[i]][j].end < block1.start){
					distance = block1.start - queues[candidates[i]][j].end;
				}
				else{
					distance = queues[candidates[i]][j].start -  block1.end;
				}
				distances.push(distance);
				if (distance > maxDistance){
					maxDistance = distance;
					farCandidate = j;
				}
			}
		}
		console.log(candidates);
		console.log("far distances: " + distances);
		console.log("far distance: " + maxDistance);
		console.log("candidate: " + farCandidate);
		return candidates[farCandidate];
	}
	*/
	
	/** no me cabe en ninguna capa entonces creo una nueva */
	queues.push(new Array());
//	console.log("Neuva en: " + queues.length);
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return queues.length - 1;
};