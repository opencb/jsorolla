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

function ChartWidget(args) {
	var this_ = this;
	this.id = "ChartWidget_" + Math.round(Math.random() * 10000000);

	this.title = null;
	this.width = 750;
	this.height = 300;

	if (args != null) {
		if (args.title != null) {
			this.title = args.title;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}
};

ChartWidget.prototype.getStore = function() {
	return this.store;
};

ChartWidget.prototype.getChart = function(fields) {
	
	Ext.define('ChromosomeChart', {
	    extend: 'Ext.data.Model',
	    fields: fields
	});
	
	this.store = Ext.create('Ext.data.Store', {
		 model: 'ChromosomeChart',
		 autoLoad : false
	});
	
	var dibujo = Ext.create('Ext.chart.Chart', {
		animate : true,
		shadow : true,
		store : this.store,
		width : this.width,
		height : this.height,
		axes : [{
					position : 'left',
					fields : [fields[0]],
					title : fields[0],
					grid:true,
					type : 'Numeric',
	                minimum: 0 //si no se pone, peta
				}, {
					title : fields[1],
					type : 'category',
					position : 'bottom',
					fields : [fields[1]],
//					width : 10,
					label : {
						rotate : {
							degrees : 270
						}
					}
				}],
		series : [{
					type : 'column',
					axis: 'left',
					gutter: 10,
					yField : fields[0],
					xField : fields[1],
	                style: {
	                    fill: '#38B8BF'
	                }
				}]
	});
	return dibujo;
};