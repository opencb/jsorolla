var PUBMED_RSS;
var BIOINFO_RSS;

var FEED_OBJECT;
var NUMBER_OF_FEEDS=0;

function initFeedUrls(){
	
	// Pubmed
	PUBMED_RSS = {};
	PUBMED_RSS["babelomics"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18A2e0_HeVtQ9k4iNuwfZFSuh5Ck38BCLWW3Wrlll4hWvJ8AtH";
	PUBMED_RSS["gepas"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1JKSd2KF3MGnV8mU6zDJ5PPH9-xMKOjyzBOmIeDyef9oPjR19C";
	PUBMED_RSS["fatigo"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=14GVrEVieJsBLt8q3l7R_YRQF8Tljz7pDcLCPmsBXT7C3vcMrI";
	PUBMED_RSS["fatiscan"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18ervbTh5AP3vfhgpfpT8nuS-nlu-HGIjZU1IFPR3fJ15OKAOb";
	PUBMED_RSS["gesbap"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1Rkszs2HVZ2QHM3VV-sfTuWBxZ3syAewBayCSYb3ariok2b1DW";
	PUBMED_RSS["genecodis"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1h7Su3P88Y-s0IJD2PR7EPdYjWx0n1H8LGb-Zm150P3-TFVERh";
	PUBMED_RSS["blast2go"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1HC7gWvsJppOwqCZp0h91Mvqp-QMP15A6Y7Qg2jKNZy3Ap4gfa";
	PUBMED_RSS["snow"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1FU_ZGTY7E6tYYsWpRpUfCUmW163CN4E08cHCccdpHbJvTmgv7";
		
	// Bioinfo
	BIOINFO_RSS = {};
	BIOINFO_RSS["babelomics"] = "http://bioinfo.cipf.es/taxonomy/term/53/feed/xml";
	BIOINFO_RSS["gepas"] = "http://bioinfo.cipf.es/taxonomy/term/52/feed/xml";
	BIOINFO_RSS["fatiscan"] = "http://bioinfo.cipf.es/taxonomy/term/65/feed/xml";
	BIOINFO_RSS["snow"] = "http://bioinfo.cipf.es/taxonomy/term/50/feed/xml";
	
}

function loadFeedByTags(tags, container){	
	// de tags a urls
	var input = new StringBuffer();
	input.append("<div id ='referencesContainer' class='feed-content'>");
	input.append("	<table style='width:100%; height:100%'>");
	input.append("		<tr valign='middle'>");
	input.append("			<td align='center'>loading references...<img src='resources/images/icons/Waiting.gif' alt='' /></td>");
	input.append("		</tr>");
	input.append("	</table>");                
	input.append("</div> ");
	
	$("#" + container + "_references").append(input.toString());
	var urls = fromTags2Urls(tags);	
	// 
	FEED_OBJECT = [];
	loadUrlFeeds(urls,0,'referencesContainer');
}


function fromTags2Urls(tags){
	var tag;
	var urlContainer = [];
	if(tags.length>0){
		for(var i=0; i<tags.length; i++){
			tag = tags[i];
			if (!PUBMED_RSS)initFeedUrls();
			if (PUBMED_RSS[tag]){
				urlContainer = urlContainer.concat(PUBMED_RSS[tag]);
			}
		}
	}
	return urlContainer;
}

function loadUrlFeeds(urls,pos,container){	
	var curl = urls[pos];
	var success = function(feed){		
		// concat feed
		if(feed!=null){
			FEED_OBJECT = FEED_OBJECT.concat(feed);
		}
		// prepare next
		pos++;
	    if(pos<urls.length){
	    	loadUrlFeeds(urls,pos,container);
	    } else {
	    	renderFeeds(container);
	    }
	};
	$.jGFeed(curl,success);	
}

function renderFeeds(container){
	var input = new StringBuffer();
	var entries = [];
	var entryHash = [];
	if (FEED_OBJECT!=null && FEED_OBJECT.length>0){
		  for(var i=0; i<FEED_OBJECT.length; i++){
			  var feeds = FEED_OBJECT[i];			  
			  for(var j=0; j<feeds.entries.length; j++){
				  var entry = feeds.entries[j];
				  if(entryHash[entry.title]){
					  // NOTHING??
				  } else {
					  entryHash[entry.title] = true;
					  entries = entries.concat(feeds.entries[j]);
				  }
				  //entries = entries.concat(feeds.entries[j]);
			  }
		  }
		  // remove duplicates, etc...
			  
		  //
		  input.appendln( "<div>&nbsp;</div>");
		  input.appendln( "<div>&nbsp;</div>");
		  input.appendln( "<div>&nbsp;</div>");
		  input.append("<span class='references-title'>References</span>");
		  input.append("<ul>");
		  for(var j=0; j<entries.length; j++){
			  var entry = entries[j];
			  
			  input.append("<li>");
			
			  //Please include the following publications in your references: 
			  //input.append("		<span>" + entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span>");
			  
			  
			  input.append("<span>" + entry.author + ". </span>");
			  input.append("<span class='feed-content'><a href='" + entry.link + "'  target='_blank'> " + entry.title + "</a></span>");
			  input.append("<span>" + entry.categories + "</span>");
			
			  
			  var linksCaptures = entry.content.split("<a");
			  for (var i = 0 ; i < linksCaptures.length;i++){
				  var endOfLink = linksCaptures[i].lastIndexOf("</a>");
				  linksCaptures[i] = linksCaptures[i].substring(0, endOfLink);
			  }
			  
			  input.append("<div class='feed-link'><a class='text-show feed-link'>...see PubMed links</a>");
			  input.append("	<span class='text-hide feed-content'>");
				  for (var i = 0 ; i < linksCaptures.length;i++){
					  if (linksCaptures[i] != null && linksCaptures[i] != ""){
					  input.append("<a target='_blank'");
					  input.append(linksCaptures[i]);
					  input.append("</a>");
					  }
				  	}
			  input.append("	</spam>");
			  input.append("</div>");
			  
			  input.append("</li>");
			  input.appendln( "<div>&nbsp;</div>");
		  }		  
		  input.append("</ul>");
	
	} else {
		input.append("<div class='feed-content'>no feeds found</div");
	}
	$("#" + container).html(input.toString());
	initReadMore();
}


//function loadFeedReaderFromPubMed(){
//	var hashData = new Array();
//	hashData["babelomics"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1xMHPfv-Z-Bhf-TI-j1PQsgpj_MAo4FDJ3YF7uT1krJiKj7Y-e";
//	//fatigo j. dopazo
//	hashData["fatigo"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=14GVrEVieJsBLt8q3l7R_YRQF8Tljz7pDcLCPmsBXT7C3vcMrI";
//	
//	//Gene set analysis Medina I Dopazo J
//	hashData["fatiscan"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18ervbTh5AP3vfhgpfpT8nuS-nlu-HGIjZU1IFPR3fJ15OKAOb";
//	//gesbap Dopazo J
//	hashData["gesbap"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1Rkszs2HVZ2QHM3VV-sfTuWBxZ3syAewBayCSYb3ariok2b1DW";
//	//ordered bu pubDate 
//	hashData["genecodis"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=10mYP7P18fge0rER3CvMpe8a7xjxhumSgrTV3cWqjwSUV7EEJy";
//	//snow
//	hashData["blast2go"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1HC7gWvsJppOwqCZp0h91Mvqp-QMP15A6Y7Qg2jKNZy3Ap4gfa";
//	PUBMED_RSS = hashData;
//	
//}
//
//function loadFeedReaderFromBioinfo(){
//	var hashData = new Array();
//	hashData["babelomics"] = "http://bioinfo.cipf.es/taxonomy/term/53/feed/xml";
//	//fatigo j. dopazo
//	
//	hashData["gepas"] = "http://bioinfo.cipf.es/taxonomy/term/52/feed/xml";
//	
//	//Gene set analysis Medina I Dopazo J
//	hashData["fatiscan"] = "http://bioinfo.cipf.es/taxonomy/term/65/feed/xml";
//	
//	//snow
//	hashData["snow"] = "http://bioinfo.cipf.es/taxonomy/term/50/feed/xml";
//	BIOINFO_RSS = hashData;
//	
//}

//
//function loadFeedByTagsR(tags, idContainer,i){
//	NUMBER_OF_FEEDS = 0;
//	FEED_OBJECT = [];
////	recursiveme(0,tag,tags,idContainer,i);	 
//}
//
//function recursiveme(j,actualTag,tags,idContainer,i){
//	
// if (j < urlContainer.length){
//	
//	var urlLocal = urlContainer[j];
//	
//	$.jGFeed(urlLocal,function(feeds){
//		var urlLocalinter = urlLocal;
//	  // Check for errors
//	  if(!feeds){
//	    // there was an error
//		  NUMBER_OF_FEEDS++;
//	    return false;
//	  } 
//	
//	  if (PUBMED_RSS[actualTag] == urlLocalinter){
//	
//		  for (var h = 0; h<feeds.entries.length;h++){
//			  feeds.entries[h].rss="pubmed";
//		  }
//	  }
//	  else if (BIOINFO_RSS[actualTag]== urlLocalinter){
//		 
//		  for (var g = 0; g<feeds.entries.length;g++){
//			  feeds.entries[g].rss="bioinfo";
//		  }
//	  }  
//	  FEED_OBJECT = FEED_OBJECT.concat(feeds.entries);
//	  NUMBER_OF_FEEDS++;
//	  
//	  completeFeed(idContainer,urlContainer.length);
//	  j++;
//	 
//	  recursiveme(j, actualTag,tags, idContainer,i);
//	}, 100);
//}
// else {
//	 
//	i++;
//	 (loadFeedByTagsR(tags,idContainer,i));
// }
//}
//
//function completeFeed(idContainer, callBack_flag){
//	if (NUMBER_OF_FEEDS == callBack_flag){
//	 var tmpStr = new StringBuffer();
//	tmpStr.append("<table id = 'tb_"+idContainer+"' class='entrada'> ");
//	  for(var i=0; i<FEED_OBJECT.length; i++){
//	    var entry = FEED_OBJECT[i];
//	    var hashData = new Array();
//		  hashData[entry.title] = "true";
//		tmpStr.append("<tr><td> ");
//		
//		//title
//		//link
//		//author
//		//publish date null
//		//contentSnippet
//		//content: no merece
////		alert("link"+entry.link);
////		alert("date"+entry.publishedDate);
////		alert("date"+entry.publishedDate);
////		alert("contentSnippet"+entry.contentSnippet);
////		alert("content"+entry.content);
//		//tmpStr.append("<div class='contenido'><a href='"+entry.link+"' target='_blank'>"+ entry.title + "</a></div>");
//		if (entry.rss=="pubmed"){
//		tmpStr.append("<br/>");
//		tmpStr.append("<div class='feed-content'><a class='text-show wum-data-link'>...see PubMed references</a><span class='text-hide'>"+ entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span></div>");
//		}
//		
//		if (entry.rss=="bioinfo"){
//			tmpStr.append("<br/>");
//			tmpStr.append("<div class='feed-content'><a class='text-show wum-data-link'>...see our references</a><span class='text-hide'>"+ entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span></div>");
//			}
//		
//		//tmpStr.append("<div class='feed-content'>"+ entry.content + "</div>");
//		//var fecha = entry.publishedDate.split(" ");
//		//tmpStr.append("<div class='fecha'> " + fecha[1]+ " " +fecha[2]+" " + fecha[3]+ " "+ fecha[4]+"</div>");
//		//tmpStr.append("</td></tr> ");
//	  }
//	  tmpStr.append("</table> ");
//	  $("#"+idContainer).append(tmpStr.toString());
//	}
//	
//}