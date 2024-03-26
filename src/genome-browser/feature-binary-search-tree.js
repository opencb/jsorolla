/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A binary search tree implementation in JavaScript. This implementation
 * does not allow duplicate values to be inserted into the tree, ensuring
 * that there is just one instance of each value.
 * @class BinarySearchTree
 * @constructor
 */
export default class FeatureBinarySearchTree {

    constructor(args) {
        /**
         * Pointer to root node in the tree.
         * @property _root
         * @type Object
         * @private
         */
        this._root = null;
    }

    // -------------------------------------------------------------------------
    // Private members
    // -------------------------------------------------------------------------

    /*
     * Appends some data to the appropriate point in the tree. If there are no
     * nodes in the tree, the data becomes the root. If there are other nodes
     * in the tree, then the tree must be traversed to find the correct spot
     * for insertion.
     * @param {variant} value The data to add to the list.
     * @return {Void}
     * @method add
     */
    add(v) {
        // create a new item object, place data in
        var node = {
                value: v,
                left: null,
                right: null
            },

            // used to traverse the structure
            current;

        // special case: no items in the tree yet
        if (this._root === null) {
            this._root = node;
            return true;
        }
        // else
        current = this._root;

        while (true) {

            // if the new value is less than this node's value, go left
            if (node.value.end < current.value.start) {

                // if there's no left, then the new node belongs there
                if (current.left === null) {
                    current.left = node;
                    return true;
                    // break;
                }
                // else
                current = current.left;

                // if the new value is greater than this node's value, go right
            } else if (node.value.start > current.value.end) {

                // if there's no right, then the new node belongs there
                if (current.right === null) {
                    current.right = node;
                    return true;
                    // break;
                }
                // else
                current = current.right;

                // if the new value is equal to the current one, just ignore
            } else {
                return false;
                // break;
            }
        }

    }

    contains(v) {
        var node = {
                value: v,
                left: null,
                right: null
            },
            found = false,
            current = this._root;

        // make sure there's a node to search
        while (!found && current) {

            // if the value is less than the current node's, go left
            if (node.value.end < current.value.start) {
                current = current.left;

                // if the value is greater than the current node's, go right
            } else if (node.value.start > current.value.end) {
                current = current.right;

                // values are equal, found it!
            } else {
                found = true;
            }
        }

        // only proceed if the node was found
        return found;

    }

    // Looks for an element in the binary search tree if present
    get(v) {
        var node = {
                value: v,
                left: null,
                right: null
            },
            current = this._root;

        // make sure there's a node to search
        while (current) {

            // if the value is less than the current node's, go left
            if (node.value.end < current.value.start) {
                current = current.left;

                // if the value is greater than the current node's, go right
            } else if (node.value.start > current.value.end) {
                current = current.right;

                // values are equal, found it!
            } else {
                return current;
            }
        }

        // only proceed if the node was found
        return {};

    }

}
