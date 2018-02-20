network-browser widget README
=============================

Metabolic Graphs Visualization Networks

Projet status
-------------

Early development. Only for internal use.

Maintainers:
pablo.marin@mgviz.org
jose.juanes@mgviz.org
im411@cam.ac.uk

Overview
--------

blah blah <to_do>

Code Structure
--------------

The mgvizNet code is organized in three main areas
* network-browser.js
* network-manager.js
* Renderers/

**network-browser.js** 

It is the core. 

It creates a bridge between  the network-manager and the specific renderers. It passes the data transformed by the manager to the different drawing ports and capture the events raised in the drawing port and process them. 

It also provides a public API that allows the user to customize the graph.

**network-manager.js** 

Given a network data provided by the network-browser, it deals with data management and provides a set of methods for selecting, grouping, filtering and deleting nodes and relations for passing information to network-browser. Any data information from the manager needed by the renderer needs to be provided through the network-browser.

**renderers** 

Folder containing the specific renderers for the different HTML5 drawing elements (svg, canvas)

Activity diagram:
------------------

When a click is done in the drawing canvas an event is raised. This event is captured by the *network-browser*. Depending on the selection mode (lets assume path_selection_mode on) the *network-browser* calls the appropriate method on *network-manager*, (getPathByID() in this case. The *network-manager* process the data and returns a list of node ids. The *network-browser* iterate over each id and calls the getNodeByID() method of the *network-manager*. The *network-browser* receives each node, and for each one, it sends the data to the *renderer* and get it drawn.

~~~
Renderer                       browser                   manager       
.---------.           ------------------------   -----------------------
| /*-O <--|--(id) ----------> getPathByID(id) --> process getPathByID(id)
| *   |   | event                                                 |
|     *   |              process each id    <----------(id_list)--/
|         |                |
|     *\  |                \-> getNodeByID(id)--> process getNodeByID(id)  
|      |  |                                                       |
|      *  |       .-------   process node   <----------(node)-----/                                                                  
'---------'       |
                  |
.---------.       |  (dragging full path effect)
|         |       |
|         |       |
|   /x-O  |<------'
|   x   | |
|     *\x | 
|      |  |
|      *  |
'---------' 
~~~


Milestone 1
----------------

* Representing graphs data with different shapes given tags
* define minimum viable data structure
* implement basic behaviours
  * Select and move one node
  * Select and move one path
  * Implement Force layout
  * Allow combining and changing behaviours 
  * Write a test app

Milestone 2
-----------

* Behaviours
  * Register double click
  * transient behaviours when a node is clicked (shake, pulse..) to attract attention
    * add more action:
    * freeze a node
    * Highlight selected nodes (e.g.:change color of all the nodes in a path when they are being moved)
    * Show tooltip
* Graphs
  * implement basic shapes by label and play with real biological pathways
  * define how to grow  a path from a node
  * define how to navigate the graph (limits, display filters.....)

Widget testing
--------------
1- Navigate to the main parent folder (where package.json is located) and run: 
 
    $ npm install

2 - Open the file ./src/network-browser/test/network-browser.html on a new browser window.
