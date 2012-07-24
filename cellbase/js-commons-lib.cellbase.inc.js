//js-commons-lib/cellbase
console.log("js-commons-lib/cellbase included.");
include([
         //ui-widgets
         ["/bioinfo-js/js-commons-lib/cellbase/ui-widgets/info-widget.js",function(){
        	 include([
        	          ["/bioinfo-js/js-commons-lib/cellbase/ui-widgets/gene-info-widget.js",function(){
        	        	  include("/bioinfo-js/js-commons-lib/cellbase/ui-widgets/transcript-info-widget.js");
        	          }],
        	          "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/protein-info-widget.js",
        	          "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/snp-info-widget.js",
        	          "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/vcf-variant-info-widget.js"
        	          ]);
         }],
         //ws-manager
         "/bioinfo-js/js-commons-lib/cellbase/cellbase-manager.js"
         ]);


	