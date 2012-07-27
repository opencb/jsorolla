//js-commons-lib/genome-viewer
(function(){
	
	var f = [
	         //file
	         "/bioinfo-js/js-commons-lib/genome-viewer/ui-widgets/file/file-widget.js",
	         //ui-widgets
	         "/bioinfo-js/js-commons-lib/genome-viewer/ui-widgets/legend-panel.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/ui-widgets/legend-widget.js",
	         //url
	         "/bioinfo-js/js-commons-lib/genome-viewer/ui-widgets/url/url-widget.js",
	         
	         //root
	         "/bioinfo-js/js-commons-lib/genome-viewer/gv-config.json",
	         "/bioinfo-js/js-commons-lib/genome-viewer/feature-binary-search-tree.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/rawdeflate.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/genome-viewer.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/track-svg.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/track-svg-layout.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/track-data.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/feature-cache.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/chromosome-widget.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/circular-chromosome-widget.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/karyotype-widget.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/cellbase-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/tabular-data-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/das-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/cellbase-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/vcf-file-widget.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/gff-file-widget.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/gtf-file-widget.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/bed-file-widget.js",

	         "/bioinfo-js/js-commons-lib/genome-viewer/feature-data-adapter.js",

	         "/bioinfo-js/js-commons-lib/genome-viewer/vcf-data-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/gff2-data-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/gff3-data-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/gtf-data-adapter.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/bed-data-adapter.js",

	         "/bioinfo-js/js-commons-lib/genome-viewer/data-source.js",

	         "/bioinfo-js/js-commons-lib/genome-viewer/file-data-source.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/string-data-source.js",
	         "/bioinfo-js/js-commons-lib/genome-viewer/url-data-source.js"


	];

	for ( var i = 0; i < f.length; i++) {
		var s = document.createElement("script");
		s.setAttribute("type","text/javascript");
		s.setAttribute("src",f[i]);
		document.head.appendChild(s);
	}
	
})(this);
