/*
 * Clase gestiona la insercciÃ³n, eliminaciÃ³n de los elementos en el DOM
 * 
 * Vital hacerla SIEMPRE compatible hacia atrÃ¡s
 * 
 * Last update: 28-10-2010
 * 
 */


var DOM = {};

DOM.createNewElement = function(type, nodeParent, attributes)
{
	
	var node = document.createElement(type);
	for (var i=0; i<attributes.length; i++)
	{
		node.setAttribute(attributes[i][0], attributes[i][1]);
	}
	nodeParent.appendChild(node);
	return node;
		
};

DOM.createTextNode = function(text, nodeParent)
{
	var aText = document.createTextNode(text);
	nodeParent.appendChild(aText);
	return aText;

		
};

DOM.removeChilds = function(targetID)
{
	
	var parent = document.getElementById(targetID);
	while (parent.childNodes.length>0)
	{
	      parent.removeChild(parent.childNodes[0]);

	}
};

DOM.select = function(targetID)
{
  return document.getElementById(targetID);
//  return $("#"+targetID);
};