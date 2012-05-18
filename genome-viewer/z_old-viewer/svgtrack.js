// JavaScript Document
function SvgTrack(trackerID, targetNode,  args) {
	this.args = args;

	/** Groups and layers */
	this.trackNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	this.internalId = Math.round(Math.random()*10000000); // internal id for this class
	
	/** target */
    if(targetNode != null){
            this.targetID = targetNode.id;
    }

	
    
	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 400;
	this.height = 50;
	this.originalTop = this.top;
	this.originalHeight = this.height;
	
	/** Max height para los tracks que aunmentan el height dinamicamente cargando las features **/
	this.maxHeight = this.height;
	
	/** real start and end */
	if (args != null){
		this.start = args.start;
		this.end = args.end;
	}
	else{
		this.start = 0;
	}

	/** pixelPerposition **/
	this.pixelRatio = 5; /** it means 1 position it is represented using 5 pixels **/
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = null;
	this.titleName = null;
	this.titleFontSize = 10;
	this.titleWidth = 50;
	this.titleHeight = 12;
	this.floating = false;
	this.repeatLabel = null; /** es un float que indica cada cuantos pixeles se va a repetir la label sobre el track **/
	
	this.isAvalaible = true; /** Si el track no puede mostrarse a cierta resolucion isAvalaible pasa a ser falso y dibujariamos solamnente el titulo**/
	this.isNotAvalaibleMessage = "This level of zoom isn't appropiate for this track";
	
	
	this.labelFontSize = null;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.top!=null){
			this.top = args.top;	
			this.originalTop = this.top;
		}
	}
	
	/** id manage */
	this.id = trackerID;	
	this.idTrack = this.id + "_Features";
	this.idNames = this.id + "_Names";
	this.idMain = this.id + "_Main";
	this.idBackground = this.id + "_background";
	this.idTitleGroup = this.id + "_title_group";
	/** Events */
	this.click = new Event(this);
	
};
