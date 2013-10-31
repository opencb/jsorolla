/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

StringDataAdapter.prototype.getNetworkData = NetworkDataAdapter.prototype.getNetworkData;

function StringDataAdapter(dataSource, args){
	NetworkDataAdapter.prototype.constructor.call(this, dataSource, args);
};

StringDataAdapter.prototype.parse = function(data){
	var _this = this;
	
	var lines = data.split("\n");
	
	//Add edge attributes
	this.networkData.addEdgeAttribute("neighborhood", "float", 0.0);
	this.networkData.addEdgeAttribute("fusion", "float", 0.0);
	this.networkData.addEdgeAttribute("cooccurence", "float", 0.0);
	this.networkData.addEdgeAttribute("homology", "float", 0.0);
	this.networkData.addEdgeAttribute("coexpression", "float", 0.0);
	this.networkData.addEdgeAttribute("experimental", "float", 0.0);
	this.networkData.addEdgeAttribute("knowledge", "float", 0.0);
	this.networkData.addEdgeAttribute("textmining", "float", 0.0);
	this.networkData.addEdgeAttribute("combined_score", "float", 0.0);
	
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			if (fields[0].substr(0,1) != "#"){
				var source = fields[0];
				if(this.addedNodes[source] == null){
					sourceId = this.networkData.addNode({
						"name": source,
						"metainfo":{
							"label": source,
							"externalID": fields[4]
						}
					});
					this.addedNodes[source] = sourceId;
				}
				
				var target = fields[1];
				if(this.addedNodes[target] == null){
					targetId = this.networkData.addNode({
						"name": target,
						"metainfo":{
							"label": target,
							"externalID": fields[5]
						}
					});
					this.addedNodes[target] = targetId;
				}
				
				var edgeId = this.networkData.addEdge(this.addedNodes[source], this.addedNodes[target], "directed", source+"-"+target, EDGE_TYPES["directed"]);
				
				var attrList = ["neighborhood","fusion","cooccurence","homology","coexpression","experimental","knowledge","textmining","combined_score"];
				var attrValueList = [fields[6],fields[7],fields[8],fields[9],fields[10],fields[11],fields[12],fields[13],fields[14]];
				this.networkData.setEdgeAttributeValues(edgeId, attrList, attrValueList);
			}
		}
	}
};
