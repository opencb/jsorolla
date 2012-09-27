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

function CircularChromosomeWidget(parent, args) {
	//variables globales, podremos utilizarlas en todo el metodo
	var _this = this; 

	//por si es nulo el valor que le pasamos, ponemos aqui unos valores por defecto
	//si hemos pasado los valores, se sobreescribiran
	this.coord_x = 400;
	this.coord_y = 250;	
	this.radius = 200;
	this.stroke_width = 20;
	
		if(args != null){
			if(args.coord_x != null){
				this.coord_x = args.coord_x;
				}
			if(args.coord_y != null){
				this.coord_y = args.coord_y;
				}
			if(args.radius != null){
				this.radius = args.radius;
				}
			if(args.stroke_width != null){
				this.stroke_width = args.stroke_width;
				}
		}
	
	//longitud del circulo
	this.circleLength = 2*Math.PI*this.radius;
	
	//variables que le daremos valor al cargar los datos
	this.d = null; //tendra todos los datos de la base de datos
	this.chroLength = null; //numero de elementos de la base de datos
	this.pixelRatio = null; //numero de elementos de la base de datos en cada pixel
	this.angle_click = null; //angulo del punto en el que vamos a clickar
	
	//coordenadas de la linea que indica donde hemos clickado
	this.x_point = null;;
	this.y_point = null;;
	this.x_point2 = null;;
	this.y_point2 = null;;

	//separacion de lo que marca donde hemos clikado con el circulo principal
	this.sep = 27;

	//angulo en el cual se ira separando la zona que indica donde hemos clickado
	this.angle_lines = Math.PI/6; //por defecto, ponemos 2 grados en radianes
	
	this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
	this.mySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");//Crea un elemento con el URI del espacio y el nombre de calificado.
	console.log(this.mySvg);
//	this.mySvg.setAttribute("version", "1.2"); // Añade una nueva aracteristica poniendo el nombre del atributo seleccionado y el valor
//	this.mySvg.setAttribute("baseProfile", "tiny");
	this.mySvg.setAttribute("width", "1000");
	this.mySvg.setAttribute("height", "600");
	parent.appendChild(this.mySvg); // Añade un nuevo nodo despues despues del ultimo nodo hijo
	    
	        
    //para decargarse los datos de la base de datos, de esta forma, copiamos todos los datos en data
    $.ajax({
	url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/region/13/cytoband?of=json"
    }).done(function(data,b,c) {

  
    	_this.d = JSON.parse(data);
    	_this.chroLength = _this.d[0][_this.d[0].length-1].end; //numero de elementos
    	_this.pixelRatio  = _this.chroLength/ _this.circleLength;  //elementos en cada pixel
     
        $(_this.mySvg).click(function (event){ //event tiene una serie de parametros con informacion dle evento
    	 
 		var dist_max_x, dist_max_y; // contendra la distancia del borde del circulo por fuera
     	var dist_min_x, dist_min_y; //contendra la distancia del borde del circulo por dentro
     	var dist_max, dist_min; //la distancia maxima y minima del centro del circulo al borde por fuera y por dentro
     	var dist_click; //tendra la distancia desde donde clickamos al centro del circulo
     	
     	//el borde se encuentra la mitad fuera del circulo y la otra mitad dentro
     	//obtenenos las coordenadas de un punto en los bordes del borde del circulo
     	//como por referencia vamos a calcular la distancia del punto que se encuentra en el grado 180, la x es la misma
     	dist_max_x = _this.coord_x;
     	dist_max_y = _this.radius + _this.coord_y + (_this.stroke_width/2);

     	dist_min_x = _this.coord_x; 
     	dist_min_y = _this.radius + _this.coord_y - (_this.stroke_width/2);        	
     	
     	//calculamos las distancias del borde maxima y minima, como es un circulo, en cualquier punto sera la misma
     	dist_max = Math.sqrt(Math.pow((dist_max_x-_this.coord_x),2)+ (Math.pow((dist_max_y-_this.coord_y),2)));
     	dist_min = Math.sqrt(Math.pow((dist_min_x-_this.coord_x),2)+ (Math.pow((dist_min_y-_this.coord_y),2)));

     	//calculamos la distancia del punto donde clickamos al centro
     	//la posicion de la y esta desplazada 100 píxeles a la izquierda, por eso sumamos 100
     	dist_click =  Math.sqrt(Math.pow((event.clientX-_this.coord_x),2)+ Math.pow((event.clientY-_this.coord_y),2));
   	
     	var bb = false; //variable que hara que si nos encontremos dentro del circulo, mire en que elemento exacto
     	
	     	//si el punto donde hemos clickado se encuentra dentro del borde del circulo
	     	if (dist_click >= dist_min && dist_click <= dist_max)
	     		bb = true;

	     	if(bb)
	     	{
		        //ahora vamos a distinguir entre zonas del borde mediante el angulo 
		        _this.angle_click = 0; //tendra el angulo donde se encuentra el punto donde hemos clickado
		
		        	//segun donde se $(this.mySvg).click(function (event){ //event tiene una serie de parametros con informacion dle evento
		        	if(event.clientX > _this.coord_x &&  event.clientY < _this.coord_y)
		        		_this.angle_click = Math.atan((event.clientX - _this.coord_x)/(_this.coord_y - event.clientY));
		        	else if(event.clientX > _this.coord_x &&  event.clientY > _this.coord_y)
		        		_this.angle_click = (Math.PI/2) + Math.atan((event.clientY -_this.coord_y)/(event.clientX - _this.coord_x));
		        	else if(event.clientX < _this.coord_x &&  event.clientY > _this.coord_y)
		        		_this.angle_click = Math.PI + Math.atan((_this.coord_x - event.clientX)/(event.clientY - _this.coord_y));
		        	else if(event.clientX < _this.coord_x &&  event.clientY < _this.coord_y)	
		        		_this.angle_click = (3*Math.PI/2) + Math.atan((_this.coord_y - event.clientY)/(_this.coord_x - event.clientX));
		
		        var rad_360_grados = 2*Math.PI;//360 * Math.PI / 180;  //calculamos 360 grados en radianes
		        var pix_of_click; //el numero del pixel donde hemos pulsado
		            
		        //en rad_360_grados tenemos circleLength píxeles, con una regla de tres obtenemos cuantos pixeles tenemos en otro angulo en radianes
		        pix_of_click = (_this.angle_click * _this.circleLength) / rad_360_grados; 
		        var elem_pixel; //obtenmos el elemento que tenemos en ese pixel
		        elem_pixel = pix_of_click * _this.pixelRatio;
		        	
		        var ii = 0;
		        var b = true;
		        	
		        	//miramos en la base de datos cual es el objeto que contiene ese pixel
		        	while(ii < _this.d[0].length && b)  //para todos los datos que tenemos
		        		{
		        		  if (_this.d[0][ii].start <= elem_pixel &&  _this.d[0][ii].end >= elem_pixel)
		        			  	b = false;
		        	    ii++;
		        		}
		        	
		        //en i-1 tenemos el elemento donde hemos clickado
		        console.log(parseInt(elem_pixel));
		        	
		        //aqui damos las coordenadas a la recta para indicarle donde hemos clickado
		        _this.x_point = (_this.radius+_this.sep) * Math.cos(_this.angle_click)+ _this.coord_x;
		        _this.y_point = (_this.radius+_this.sep) * Math.sin(_this.angle_click)+ _this.coord_y;
		        _this.x_point2 = (_this.radius-_this.sep) * Math.cos(_this.angle_click)+ _this.coord_x;
		        _this.y_point2 = (_this.radius-_this.sep) * Math.sin(_this.angle_click)+ _this.coord_y;
		        	
		    	obj.setAttribute("x1", _this.x_point);
		    	obj.setAttribute("y1", _this.y_point);
		    	obj.setAttribute("x2", _this.x_point2);
		    	obj.setAttribute("y2", _this.y_point2);  
	
		    	//circulo que rodea donde hemos clickado
		    	var circle1 = [];   		
		    		
		    		//en el caso en el que el circulo se pinten en dos partes al situarse entre el principio y el final donde la funcion empieza a pintar
		    		if(_this.angle_click - _this.angle_lines < 0) //clickar despues del angulo cero
		    			{
		    			circle1.push((_this.angle_click + _this.angle_lines)* _this.circleLength / rad_360_grados); 
		    			circle1.push((rad_360_grados - (2*_this.angle_lines))*  _this.circleLength  / rad_360_grados); 
		    			circle1.push(((_this.angle_lines - _this.angle_click) *  _this.circleLength  / rad_360_grados)+2);
		    			}	
		    		else if(_this.angle_click + _this.angle_lines > rad_360_grados) //clickar antes del angulo 0
		    			{
		    				    			
		    			circle1.push((_this.angle_lines-(rad_360_grados-_this.angle_click))*  _this.circleLength  / rad_360_grados); 
		    			circle1.push((rad_360_grados - (2*_this.angle_lines))*  _this.circleLength  / rad_360_grados); 
		    			circle1.push(((_this.angle_lines + (rad_360_grados - _this.angle_click)) *  _this.circleLength  / rad_360_grados)+2);
		    			}
		    		else //caso normal
		    			{	
		    			circle1.push(0); 
			    		circle1.push(((_this.angle_click - _this.angle_lines) *  _this.circleLength ) / rad_360_grados); //pixels hasta la seleccion
			    		circle1.push(((_this.angle_lines * 2) *  _this.circleLength ) / rad_360_grados);  //pixels de la seleccion
			    		circle1.push((((rad_360_grados -(_this.angle_click - _this.angle_lines) + (_this.angle_lines * 2))) *  _this.circleLength ) / rad_360_grados);  //pixels de lo que sobra del circulo		
		    			}	
		    	c11.setAttribute ("cx", _this.coord_x);
		    	c11.setAttribute ("cy", _this.coord_y);
		    	c11.setAttribute ("r", _this.radius);
		    	c11.setAttribute("stroke-dasharray",circle1.toString());
	  		}
    });


//    //creamos un indicador y lo situamos inicialmente en un punto
	var obj = document.createElementNS("http://www.w3.org/2000/svg", "line");
    obj.setAttribute("stroke", "red");
    obj.setAttribute("stroke-width", 1);
    obj.setAttribute("transform","rotate(-90,"+ _this.coord_x+","+_this.coord_y+")"); //lo rotamos para que empiece por arriba y lo desplazamos para verlo en la pantalla  
    _this.mySvg.appendChild (obj);
    
    
//    var obj = SVG.addChild(_this.mySvg, "line", {
//    	"stroke": "red",
//    	"stroke-width": 1,
//    	"transform":"rotate(-90,"+ _this.coord_x+","+_this.coord_y+")",
//    });
    
    
    
    //llamamos a la funcion aqui y no en el index para que os datos esten bien dargados antes de dibujar
    _this.drawChromosome();

    
    //circulo que rodea la seleccion
    var c11 = document.createElementNS ("http://www.w3.org/2000/svg", "circle");

    c11.setAttribute("fill", "transparent");
    c11.setAttribute("stroke", "orange");
    c11.setAttribute("opacity", "0.2");
    c11.setAttribute("stroke-width", 55);
    c11.setAttribute("transform","rotate(-90,"+ _this.coord_x+","+_this.coord_y+")"); //lo rotamos para que empiece por arriba y lo desplazamos para verlo en la pantalla

    _this.mySvg.appendChild (c11);
    

    
  });
};

CircularChromosomeWidget.prototype.drawChromosome = function(){
	var _this = this; //global
	_this.chroLength = _this.d[0][_this.d[0].length-1].end; //numero de elementos
	var dashArray = []; //contendra los numeros que le pasaremos a la funcion dasharray para que pite el circulo por partes
	var aux = 0; // numero de elementos que tiene cada grupo
	var colores = []; //array que contendra los diferentes colores e indicara los diferentes circulos a pintar
	var b = true;
	
	//damos valores al array colors mirando todos los colores diferentes que tenemos
	colores.push(_this.d[0][0].stain); //almacenamos el primero
	 
		 for(var j = 1; j<= _this.d[0].length-1; j++) //0 a 35
		 {
		     for(var w=0; w <= colores.length-1; w++)
		     {
		       if(colores[w] == _this.d[0][j].stain)  //si se encuentra ya en el vector, lo indicamos
		         b = false;
		     } 
		     if(b) //si ese color no esta en el array, se almacena
		      colores.push(_this.d[0][j].stain);
	
	     b = true;
		 }

    var indice=null; //esta variable se guardara el indice del anterior elementos que era del mismo color para calcular el hueco
	var bb = true; //variable que indicara cuando hay que dibujar el primero

	//llenamos el vector desharray
	for(var w = 0; w<colores.length;w++)   //los almacenamos por colores
	{
	   for(var i = 0; i< _this.d[0].length; i++)  //para todos los datos que tenemos
	   {  
	      
	      if(_this.d[0][i].stain == colores[w]) //miramos que sea del mismo color
	      {
		    if(bb)// en este sitio solo entramos la primera vez que vamos a pintar cada color
	  	    {  
		      //hay que diferenciar cuando se empieza pintando y cuando se empieza dejandolo en blanco en el primero de los datos
		      if(i==0 && _this.d[0][i].start==1)
		      {
			      //calculamos el numero de pixeles para pintar
				  aux = _this.d[0][i].end - _this.d[0][i].start;

				  aux = aux / _this.pixelRatio;
				  dashArray.push(aux);
		      }
		      else
		      {
				  dashArray.push(0); //cuando primero hay un blanco, ponemos 0 para que no pinte nada
				  //como ya tenemos el elemento, calculamos el espacio y el siguente a colorear
				  aux = _this.d[0][i].start - 1; // calculamos el espacio que hay desde ese elemento al inicio
				  aux = aux / _this.pixelRatio;

				  dashArray.push(aux); 
				  //calculamos el espacio a pintar
			          aux = _this.d[0][i].end - _this.d[0][i].start;
				  aux = aux / _this.pixelRatio;
				  dashArray.push(aux);	
		      }
		    indice = i; //nos guardamos la posicion del anterior elemento con el mismo color para calcular el hueco con el siguiente
		    bb= false; 
		  }
		 else
		   {  
		   //espacio transparente mirando el espacio que hay con el anterior
		    aux = _this.d[0][i].start - _this.d[0][indice].end;    //i-1 no es el anterior, sino otro
		    aux = aux / _this.pixelRatio;
		    
		    if( _this.colors[colores[w]]=="blue")
		      dashArray.push(2); // si es azul aunque este todo junto lo separamos un poco
		    else
		       dashArray.push(aux); 
		   
		    //espacio pintado
		    aux = _this.d[0][i].end -_this. d[0][i].start;
		    aux = aux / _this.pixelRatio;
		    dashArray.push(aux);			  
		    indice = i; //nos almacenamos el siguente elemento oara calcular el hueco al siguiente
		    }
	     }
	    }
	//cuando termina hay que indicarle que almacene el blanco (transparente) hasta el final
	aux = _this.chroLength - _this.d[0][indice].end;
	aux = aux / _this.pixelRatio;
	dashArray=dashArray +","+ aux;
	DrawCircles(dashArray, w, colores);
	dashArray = [];  //vaciamos para volver a llenar esta variable con los numeros de otro color
	bb = true;
	}	    

	function DrawCircles(dashArray, w, colores)
	{	
      var c1 = document.createElementNS ("http://www.w3.org/2000/svg", "circle");
      c1.setAttribute ("cx", _this.coord_x);
      c1.setAttribute ("cy", _this.coord_y);
      c1.setAttribute ("r", _this.radius);
      c1.setAttribute("fill", "transparent");
      c1.setAttribute("stroke", _this.colors[colores[w]]);
      c1.setAttribute("stroke-width", _this.stroke_width);
      //lo rotamos para que empiece por arriba y lo desplazamos para verlo en la pantalla
      c1.setAttribute("transform","rotate(-90,"+ _this.coord_x+","+_this.coord_y+")"); 
      c1.setAttribute("stroke-dasharray",dashArray.toString());
      _this.mySvg.appendChild (c1);
	}
};
