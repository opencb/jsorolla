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

var Compbio = {
	formatNumber : function(position){
		return position.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	},
	getPixelBaseByZoom : function (zoom){
		//zoom [0-100] intervals of 5
		zoom = Math.max(0,zoom);
		zoom = Math.min(100,zoom);
		return 10/(Math.pow(2,(20-(zoom/5))));
	},
	getZoomByPixelBase : function (pixelBase){
		//pixelBase [10 - 0];
		pixelBase = Math.max(0,pixelBase);
		pixelBase = Math.min(10,pixelBase);
		return 100-((Math.log(10/pixelBase)/(Math.log(2)))*5);
	},
	getPixelBaseByRegion : function (width, region){
		return width/region.length();
	},
	calculatePixelBaseAndZoomByRegion : function (args){
		var regionLength = this.regionLength(args.region);
		var pixelBase = args.width/regionLength;
		var baseWidth = parseInt(args.width/10);//10 is the max pixelbase at max zoom 100
		
		if(regionLength < baseWidth){//region is too small, start and end must be recalculated for the max allowed zoom
			pixelBase = this.getPixelBaseByZoom(args.zoom);
			var centerPosition = this.centerPosition(args.region);
			var aux = Math.ceil((baseWidth/2)-1);
			args.region.start = Math.floor(centerPosition-aux);
			args.region.end = Math.floor(centerPosition+aux);
			
			//modify the start and end
		}
		return {pixelBase:pixelBase,zoom:this.getZoomByPixelBase(pixelBase)}
	},
	isString : function (s) {
		return typeof(s) === 'string' || s instanceof String;
	},
	test : function(){
		return this;
	}
};
