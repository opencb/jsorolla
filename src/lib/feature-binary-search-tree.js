/*
 * Binary Search Tree implementation in JavaScript
 * Copyright (c) 2009 Nicholas C. Zakas
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * A binary search tree implementation in JavaScript. This implementation
 * does not allow duplicate values to be inserted into the tree, ensuring
 * that there is just one instance of each value.
 * @class BinarySearchTree
 * @constructor
 */
function FeatureBinarySearchTree() {
    
    /**
     * Pointer to root node in the tree.
     * @property _root
     * @type Object
     * @private
     */
    this._root = null;
}

FeatureBinarySearchTree.prototype = {

    //restore constructor
    constructor: FeatureBinarySearchTree,
    
    //-------------------------------------------------------------------------
    // Private members
    //-------------------------------------------------------------------------
    
    /**
     * Appends some data to the appropriate point in the tree. If there are no
     * nodes in the tree, the data becomes the root. If there are other nodes
     * in the tree, then the tree must be traversed to find the correct spot
     * for insertion. 
     * @param {variant} value The data to add to the list.
     * @return {Void}
     * @method add
     */
    add: function (v){
        //create a new item object, place data in
        var node = { 
                value: v, 
                left: null,
                right: null 
            },
            
            //used to traverse the structure
            current;
    
        //special case: no items in the tree yet
        if (this._root === null){
            this._root = node;
            return true;
        } 
        	//else
            current = this._root;
            
            while(true){
            
                //if the new value is less than this node's value, go left
                if (node.value.end < current.value.start){
                
                    //if there's no left, then the new node belongs there
                    if (current.left === null){
                        current.left = node;
                        return true;
//                        break;
                    } 
                    	//else                  
                        current = current.left;
                    
                //if the new value is greater than this node's value, go right
                } else if (node.value.start > current.value.end){
                
                    //if there's no right, then the new node belongs there
                    if (current.right === null){
                        current.right = node;
                        return true;
//                        break;
                    } 
                    	//else
                        current = current.right;
 
                //if the new value is equal to the current one, just ignore
                } else {
                	return false;
//                    break;
                }
            }        
        
    },
    
    contains: function (v){
        var node = { 
                value: v, 
                left: null,
                right: null 
            },
    	found = false,
    	current = this._root;
          
      //make sure there's a node to search
      while(!found && current){
      
          //if the value is less than the current node's, go left
          if (node.value.end < current.value.start){
              current = current.left;
              
          //if the value is greater than the current node's, go right
          } else if (node.value.start > current.value.end){
              current = current.right;
              
          //values are equal, found it!
          } else {
              found = true;
          }
      }
      
      //only proceed if the node was found
      return found;   
        
    }
};