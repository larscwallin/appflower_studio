//Base namespace
Ext.ns('afStudio.model');

//Widgets namespace
Ext.ns('afStudio.model.widget');

/**
 * Base <b>Model Node</b> class. All model's nodes are descendants or instances of this class.
 * Borrows methods from {@link Ext.data.Node} class, these methods marked with @borrows marker. 
 * <p>Responsible for storing/managing atomic model data. Node can be treated as a equvivalent to a view's xml tag.</p>
 * <p>Encapsulates tag's attributes inside <u>properties</u>, all inner tags(nodes) are stored in the <u>childNodes</u>.</p>
 * 
 * @class afStudio.model.Node
 * @extends Ext.util.Observable
 * @author Nikolai Babinski <niba@appflower.com>
 */
afStudio.model.Node = Ext.extend(Ext.util.Observable, {
	/**
	 * Node's value property.
	 * @constant NODE_DATA
	 * @type {String}
	 */
	NODE_DATA : 'data',
    /**
     * The token used to separate paths in node ids (defaults to '/').
     * This path separator is used if a Model (structure of model's nodes) is used without Tree controller.
     * @constant pathSeparator
     * @type {String}
     */
    pathSeparator: "/",
	
	/**
	 * @cfg {Object} (Optional) definition The node's definition object. 
	 */
	/**
	 * @cfg {String} (Required) tag The node's tag name.
	 */
	/**
	 * @cfg {String} (Optional) modelType The model type.
	 */
    /**
     * @cfg {Array} nodeTypes The allowed node types 
     */
    
	/**
	 * The node's tag name -> determines node type.
	 * @property tag 
	 * @type {String}
	 */
    /**
     * @property isRoot The root node (model) flag.
     * @type {Boolean}
     */
	/**
	 * @property leaf
	 * @type {Boolean}   
	 */
	/**
	 * (Read-only) The model node properties.
	 * @property properties
	 * @type {Ext.util.MixedCollection}
	 */	
	/**
	 * The array of node types which this node can contains.
	 * Node type can be specified as a string like {@link afStudio.ModelNode.BUTTON} -> "i:button" or
	 * as an object like {name: afStudio.ModelNode.FIELD, required: true, hasMany: false, unique: "name"}.
	 * Where:
	 * <u>
	 * 	<li><b>name</b>{String} : The node type</li>
	 * 	<li><b>required</b>{Boolean} : (Optional) Underlines that the node should contain this node type, defaults to false.</li>
	 * 	<li><b>hasMany</b>{Boolean} : (Optional) Defines that the node can contain more than one nodes 
	 * 	with type specified in name property, defaults to false.</li>
	 * 	<li><b>unique</b>{String} : (Optional) Defines node's property which should be unique across all 
	 * 	children nodes with the same type. unique property has sense only if hasMany is true.</li>
	 * </u>
	 * By default is empty, saying that a node should have no children.
	 * @property nodeTypes 
	 * @type {Array}
	 */
    nodeTypes : [],
    /**
     * Defines default node content information
     * @property _content (defaults to {name: '_content', type: 'string'})
     * @type {Object}
     */
	_content : {name: '_content', type: 'string'},
    
	/**
	 * @constructor
	 * @param {Object} config
	 */
    constructor : function(config) {
        config = config || {};

        this.leaf = config.leaf;
        
        this.tag = this.tag || config.tag;
        
        /**
         * model type required for resolving node namespace
         * it can be changed in future by refactoring
         * node's {@link #applyNodeDefinition} and {@link #createNode} methods
         */
        this.modelType = config.modelType || null;
        
        /**
         * The node id. @type String
         */
        this.id = this.id || config.id;
        if (!this.id) {
            this.id = Ext.id(null, this.tag + '-');
        }
        
        //TODO properties should be inherited in inheritance process
        this.initProperties(config.properties);
        
        this.initNodeTypes(config.nodeTypes);

        /**
         * The node's data. @type Mixed
         * Node can only containes the data or childNodes.
         */
        this[this.NODE_DATA] = this._content ? new afStudio.model.Property(this._content) : null;
        
        /**
         * All child nodes of this node. @type Array
         */
        this.childNodes = [];
        
        /**
         * The parent node for this node. @type Node
         */
        this.parentNode = null;
        
        /**
         * The first direct child node of this node, or null if this node has no child nodes. @type Node
         */
        this.firstChild = null;
        
        /**
         * The last direct child node of this node, or null if this node has no child nodes. @type Node
         */
        this.lastChild = null;
        
        /**
         * The node immediately preceding this node in the tree, or null if there is no sibling node. @type Node
         */
        this.previousSibling = null;
        
        /**
         * The node immediately following this node in the tree, or null if there is no sibling node. @type Node
         */
        this.nextSibling = null;

        this.addEvents({
            /**
             * @event beforeModelNodeAppend
             * Fires before a new child is appended, return false to cancel the append.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node to be appended
             */
            "beforeModelNodeAppend" : true,
            
            /**
             * @event modelNodeAppend
             * Fires when a new child node is appended
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The newly appended node
             * @param {Number} index The index of the newly appended node
             */
            "modelNodeAppend" : true,
            
            /**
             * @event beforeModelNodeRemove
             * Fires before a child is removed, return false to cancel the remove.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node to be removed
             */
            "beforeModelNodeRemove" : true,
            
            /**
             * @event modelNodeRemove
             * Fires when a child node is removed
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The removed node
             * @param {Number} index The removed node old index
             */
            "modelNodeRemove" : true,
            
            /**
             * @event beforeModelNodeMove
             * Fires before this node is moved to a new location in the tree. Return false to cancel the move.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} oldParent The parent of this node
             * @param {Node} newParent The new parent this node is moving to
             * @param {Number} index The index it is being moved to
             */
            "beforeModelNodeMove" : true,
            
            /**
             * @event modelNodeMove
             * Fires when this node is moved to a new location in the tree
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} oldParent The old parent of this node
             * @param {Node} newParent The new parent of this node
             * @param {Number} index The index it was moved to
             */
            "modelNodeMove" : true,

            /**
              * @event beforeModelNodeInsert
              * Fires before a new child is inserted, return false to cancel the insert.
              * @param {Tree} tree The owner tree
              * @param {Node} this This node
              * @param {Node} node The child node to be inserted
              * @param {Node} refNode The child node the node is being inserted before
              */
            "beforeModelNodeInsert" : true,
            
            /**
             * @event modelNodeInsert
             * Fires when a new child node is inserted.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node inserted
             * @param {Node} refNode The reference node, child node the node was inserted before
             * @param {Number} refIdx The reference node index before insertion
             */
            "modelNodeInsert" : true,
            
            /**
             * @event beforeModelPropertyChanged
             * Fires before a node's property is changed.
             * @param {Node} node This node
             * @param {String} property The property's ID
             * @param {Mixed} value The new property's value to be set
             * @param {Mixed} oldValue The old/previous property's value
             */
            "beforeModelPropertyChanged" : true,
            
            /**
             * @event modelPropertyChanged
             * Fires when a node's property was changed.
             * @param {Node} node This node
             * @param {String} property The property's ID which value was changed
             * @param {Mixed} value The new property's value
             * @param {Mixed} oldValue The old/previous property's value
             */
            "modelPropertyChanged" : true,
            
            /**
             * @event beforeModelNodeCreated
             * Fires before a child node is created
             * @param {Tree} The owner tree(controller)
             * @param {Node} This node
             * @param {String} The childe node identifier 
             */
            "beforeModelNodeCreated" : true,
            
            /**
             * @event modelNodeCreated
             * Fires when a child node was created
             * @param {Tree} The owner tree(controller)
             * @param {Node} This node
             * @param {Node} The created child node 
             */
            "modelNodeCreated" : true,
            
            /**
             * @event modelReconfigure
             * Fires when a node structural configuration changed
             * @param {Node} modelNode The node being reconfigured
             */
            "modelReconfigure" : true
        });
        
        this.listeners = config.listeners;
        
        afStudio.model.Node.superclass.constructor.call(this);
        
        var def = config.definition || this.defaultDefinition;
        if (def) {
	    	this.initNodeDefinition(def);
        }
        
        this.initEvents();
    },
    //eo constructor
    
    /**
     * Instantiates <u>properties</u>.
     * Template method.
     * @protected
     * @param {Object} (Optional) properties
     */
    initProperties : function(properties) {
    	var me = this,
            ps = properties || this.properties;
			   
    	this.properties = new Ext.util.MixedCollection(false, function(property) {
    		return property.name;
		});
		
		Ext.iterate(ps, function(p) {
			me.properties.add(
				new afStudio.model.Property(p)
			);
		});
    },
    
    /**
     * Instantiates <u>nodeTypes</u> property.
     * Every node should have its own nodeTypes property.
     * Template method.
     * @protected
     * @param {Array} (optional) nodeTypes
     */
    initNodeTypes : function(nodeTypes) {
    	var ns = nodeTypes || this.nodeTypes;
    	
    	if (!Ext.isArray(ns)) {
    		throw new afStudio.model.error.NodeError('nodeTypes type');
    	}
    	
		this.nodeTypes = [];
		
    	Ext.each(ns, function(n){
    		this.nodeTypes.push(n);
    	}, this);
    },
    
    /**
     * Init node's definition.
     * Template method.
     * @protected
     * @param {Mixed} definition The node definition object
     */
    initNodeDefinition : function(definition) {
		this.applyNodeDefinition(definition, true);
    },
    
    /**
	 * Applies node definition object.
	 * Sets properties and instantiates children nodes.
	 * @protected
     * @param {Mixed} definition The node definition object
     * @param {Boolean} silent If silent is true all node's events are suspended
     */
    applyNodeDefinition : function(definition, silent) {
    	var me = this;

        if (!Ext.isDefined(definition)) {
    		return;
    	}
    	
    	silent ? this.suspendEvents() : null;
     	
    	if (Ext.isObject(definition)) {
	    	//not ruin the definition object
	    	var def = Ext.apply({}, definition);
	    	
	    	if (def.attributes) {
	    		this.applyProperties(def.attributes);
		    	delete def.attributes;
	    	}
	    	
    		if (Ext.isDefined(def._content)) {
    			this.setNodeData(def._content);
    			delete def._content;
    		} else {
    			Ext.iterate(def, function(n, d) {
    				//collection of the same nodes
					if (Ext.isArray(d)) {
						Ext.iterate(d, function(nd) {
			    			me.createNode(n, nd);				
						});
					} else {
						me.createNode(n, d);	
					}
    			});
    		}
    	} else {
    		this.setNodeData(definition);
    	}
    	
    	silent ? this.resumeEvents() : null;
    },
    //eo applyNodeDefinition
    
	/**
	 * Initialises event listeners
     * Template method.
     * @protected
	 */    
    initEvents : function() {
    	var me = this;
    	
		me.on({
			modelNodeCreated: me.onModelNodeCreated,
			
			beforeModelPropertyChanged: me.onBeforeModelPropertyChanged,
			
			modelPropertyChanged: me.onModelPropertyChanged,
			
			beforeModelNodeRemove: me.onBeforeModelNodeRemove
		});
    },    
    
    /**
     * Fires event.
     * @override
     * @borrows
     * @return {Boolean}
     */
    fireEvent : function(evtName) {
        // first do standard event for this node
        if (Ext.data.Node.superclass.fireEvent.apply(this, arguments) === false) {
            return false;
        }
        // then bubble it up to the tree if the event wasn't cancelled
        var ot = this.getOwnerTree();
        if (ot) {
            if (ot.proxyNodeEvent.apply(ot, arguments) === false) {
                return false;
            }
        }
        return true;
    },

    /**
     * Returns true if this node is a leaf
     * @borrows
     * @return {Boolean}
     */
    isLeaf : function() {
        return this.leaf === true;
    },

    /**
     * Sets passed node as the {@link #firstChild} of this node.
     * @private
     * @borrows
     */
    setFirstChild : function(node) {
        this.firstChild = node;
    },

    /**
     * Sets passed node as the {@link #lastChild} of this node.
     * @private
     * @borrows
     */
    setLastChild : function(node) {
        this.lastChild = node;
    },

    /**
     * Returns true if this node is the last child of its parent
     * @borrows
     * @return {Boolean}
     */
    isLast : function() {
       return (!this.parentNode ? true : this.parentNode.lastChild == this);
    },

    /**
     * Returns true if this node is the first child of its parent
     * @borrows
     * @return {Boolean}
     */
    isFirst : function() {		    	
       return (!this.parentNode ? true : this.parentNode.firstChild == this);
    },

    /**
     * Returns true if this node is the direct child of root node
     * @public
     * @return {Boolean}
     */
    isDirectRootChild : function() {
    	var root = this.getRootNode();
    	return root == this.parentNode;
    },
    
    /**
     * Checks if the passed in node is a "similar" node to this one.
     * Nodes are "similar" if their tag {@link #tag} properties are equal, 
     * but node is not "similar" to himself i.e. references should be different.
     * @protected
     * @param {Node} node The model node being examining with this one 
     * @return {Boolean}
     */
    isSimilarNode : function(node) {
    	if (this == node) {
    		return false;
    	}
    	
    	return (this.tag == node.tag); 
    },
    
    /**
     * Checks if this node is required.
     * @return {Boolean}
     */
    isRequired : function() {
    	//root node is required
    	if (this.getDepth() == 0) {
    		return true;
    	}
    	var sd = this.getStructuralData();
    	
		return sd ? sd.required : false;
    },
    
    /**
     * Checks if the parent of this node can contain more than one node as this one.
     * @return {Boolean}
     */
    hasMany : function() {
    	var sd = this.getStructuralData();
		return sd ? sd.hasMany : false; 	
    },
    
    /**
     * Returns type data. Types are instances from {@link #nodeTypes} array.
     * @protected 
     * @param {String|Object} type
     * @return {Object} type structure
     */
    getTypeStructure : function(type) {
    	var structure = {
    		name: null,
    		required: false,
	    	hasMany: false, 
	    	unique: null
    	};

    	if (Ext.isObject(type)) {
			structure.name = type.name;
			structure.required = Ext.isBoolean(type.required) ? type.required : false;
			structure.hasMany = Ext.isBoolean(type.hasMany) ? type.hasMany : false;
			structure.unique = Ext.value(type.unique, null);
    	} else {
    		structure.name = type;
    	}
		
		return structure;
	},
    
    /**
     * Returns structural data for the node. 
     * Structural data is located in the parent node {@link #nodeTypes} property.
     * @param {Node} (Optional) parent The parent node. It is used when node isn't inside the model but his structural data is needed
     * @return {Object} structural data or null if node is the root or model's structure doesn't contain this node 
     */
    getStructuralData : function(parent) {
    	var parent = this.parentNode || parent;
    	
    	if (parent) {
			var nodeTag = this.tag,
				nt = parent.nodeTypes;
				
			var idx = Ext.each(nt, function(n){
				return !(nodeTag == (Ext.isObject(n) ? n.name : n));
			});

			var nodeType = Ext.isDefined(idx) ? nt[idx] : null;
			
			if (nodeType) {
				return this.getTypeStructure(nodeType);
			}
    	}
    	
    	return null;
    },
    
    /**
     * Returns true if the node contains child node of specified type. 
     * @param {String} tag The node tag name (node type)
     * @return {Boolean}
     */
    hasChildWithType : function(tag) {
		return this.findChildById(tag, false, true) != null ? true : false;    	
    },
    
    /**
     * Returns true if this node has one or more child nodes, else false.
     * @borrows
     * @return {Boolean}
     */
    hasChildNodes : function() {
        return !this.isLeaf() && this.childNodes.length > 0;
    },

    /**
     * Insert node(s) as the last child node of this node.
     * @public
     * @param {Node/Array} node The node or Array of nodes to append
     * @return {Node} The appended node if single append, or null if an array was passed
     */
    appendChild : function(node) {
        var multi = false;
        if (Ext.isArray(node)) {
            multi = node;
        } else if (arguments.length > 1) {
            multi = arguments;
        }
        // if passed an array or multiple args do them one by one
        if (multi) {
            for (var i = 0, len = multi.length; i < len; i++) {
                this.appendChild(multi[i]);
            }
        } else {
            if (this.fireEvent("beforeModelNodeAppend", this.ownerTree, this, node) === false) {
                return false;
            }
            var index = this.childNodes.length;
            var oldParent = node.parentNode;
            // it's a move, make sure we move it cleanly
            if (oldParent) {
                if (node.fireEvent("beforeModelNodeMove", node.getOwnerTree(), node, oldParent, this, index) === false) {
                    return false;
                }
                oldParent.removeChild(node);
            }
            index = this.childNodes.length;
            if (index === 0) {
                this.setFirstChild(node);
            }
            this.childNodes.push(node);
            node.parentNode = this;
            var ps = this.childNodes[index-1];
            if (ps) {
                node.previousSibling = ps;
                ps.nextSibling = node;
            } else {
                node.previousSibling = null;
            }
            node.nextSibling = null;
            this.setLastChild(node);
            node.setOwnerTree(this.getOwnerTree());
            this.fireEvent("modelNodeAppend", this.ownerTree, this, node, index);
            if (oldParent) {
                node.fireEvent("modelNodeMove", this.ownerTree, node, oldParent, this, index);
            }
            
            return node;
        }
    },
    //eo appendChild

    /**
     * Removes a child node from this node.
     * @param {Node} node The node to remove
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} The removed node
     */
    removeChild : function(node, destroy) {
        var index = this.childNodes.indexOf(node);
        if (index == -1) {
            return false;
        }
        if (this.fireEvent("beforeModelNodeRemove", this.ownerTree, this, node) === false) {
            return false;
        }

        // remove it from childNodes collection
        this.childNodes.splice(index, 1);

        // update siblings
        if (node.previousSibling) {
            node.previousSibling.nextSibling = node.nextSibling;
        }
        if (node.nextSibling) {
            node.nextSibling.previousSibling = node.previousSibling;
        }

        // update child refs
        if (this.firstChild == node) {
            this.setFirstChild(node.nextSibling);
        }
        if (this.lastChild == node) {
            this.setLastChild(node.previousSibling);
        }

        this.fireEvent("modelNodeRemove", this.ownerTree, this, node, index);
        
        if (destroy) {
            node.destroy(true);
        } else {
            node.clear();
        }
        
        return node;
    },
    //eo removeChild
    
	/**
	 * @private
	 */
    clear : function(destroy) {
        // clear any references from the node
        this.setOwnerTree(null, destroy);
        this.parentNode = this.previousSibling = this.nextSibling = null;
        if (destroy) {
            this.firstChild = this.lastChild = null;
        }
    },

    /**
     * Destroys the node.
     */
    destroy : function(silent) {
        /*
         * Silent is to be used in a number of cases
         * 1) When setRootNode is called.
         * 2) When destroy on the tree is called
         * 3) For destroying child nodes on a node
         */
        if (silent === true) {
            this.purgeListeners();
            this.clear(true);
            Ext.each(this.childNodes, function(n){
                n.destroy(true);
            });
            this.childNodes = null;
        } else {
            this.remove(true);
        }
    },

    /**
     * Inserts the first node before the second node in this nodes childNodes collection.
     * @param {Node} node The node to insert
     * @param {Node} refNode The node to insert before (if null the node is appended)
     * @return {Node} The inserted node
     */
    insertBefore : function(node, refNode) {
        if (!refNode) { // like standard Dom, refNode can be null for append
            return this.appendChild(node);
        }
        // nothing to do
        if (node == refNode) {
            return false;
        }

        if (this.fireEvent("beforeModelNodeInsert", this.ownerTree, this, node, refNode) === false) {
            return false;
        }
        var index = this.childNodes.indexOf(refNode);
        var oldParent = node.parentNode;
        var refIndex = index;

        // when moving internally, indexes will change after remove
        if (oldParent == this && this.childNodes.indexOf(node) < index) {
            refIndex--;
        }

        // it's a move, make sure we move it cleanly
        if (oldParent) {
            if (node.fireEvent("beforeModelNodeMove", node.getOwnerTree(), node, oldParent, this, index, refNode) === false) {
                return false;
            }
            oldParent.removeChild(node);
        }
        if (refIndex === 0) {
            this.setFirstChild(node);
        }
        this.childNodes.splice(refIndex, 0, node);
        node.parentNode = this;
        var ps = this.childNodes[refIndex-1];
        if (ps) {
            node.previousSibling = ps;
            ps.nextSibling = node;
        } else {
            node.previousSibling = null;
        }
        node.nextSibling = refNode;
        refNode.previousSibling = node;
        node.setOwnerTree(this.getOwnerTree());
        this.fireEvent("modelNodeInsert", this.ownerTree, this, node, refNode, refIndex);
        if (oldParent) {
            node.fireEvent("modelNodeMove", this.ownerTree, node, oldParent, this, refIndex, refNode);
        }
        
        return node;
    },
    //eo insertBefore

    /**
     * Removes this node from its parent
     * @borrows
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} this
     */
    remove : function(destroy) {
        if (this.parentNode) {
            this.parentNode.removeChild(this, destroy);
        }
        
        return this;
    },

    /**
     * Removes all child nodes from this node.
     * @borrows
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} this
     */
    removeAll : function(destroy) {
        var cn = this.childNodes,
            n;
        while ((n = cn[0])) {
            this.removeChild(n, destroy);
        }
        
        return this;
    },

    /**
     * Returns the child node at the specified index.
     * @borrows
     * @param {Number} index
     * @return {Node}
     */
    item : function(index) {
        return this.childNodes[index];
    },

    /**
     * Replaces one child node in this node with another.
     * @borrows
     * @param {Node} newChild The replacement node
     * @param {Node} oldChild The node to replace
     * @return {Node} The replaced node
     */
    replaceChild : function(newChild, oldChild) {
        var s = oldChild ? oldChild.nextSibling : null;
        this.removeChild(oldChild);
        this.insertBefore(newChild, s);
        
        return oldChild;
    },

    /**
     * Replaces one child node in this node with another 
     * and copying replaced node's children to new node - preserving content.
     * @param {Node} newChild The replacement node
     * @param {Node} oldChild The node to replace
     * @return {Node} The replaced node
     */
    replaceChildPreserveContent : function(newChild, oldChild) {
        var children = [].concat(oldChild.childNodes);
        this.replaceChild(newChild, oldChild);
        newChild.appendChild(children);
        
        return oldChild;
    },
    
    /**
     * Returns the index of a child node
     * @borrows
     * @param {Node} node
     * @return {Number} The index of the node or -1 if it was not found
     */
    indexOf : function(child) {
        return this.childNodes.indexOf(child);
    },

    /**
     * Returns the tree(controller) this node is in.
     * @borrows
     * @return {Tree}
     */
    getOwnerTree : function() {
        // if it doesn't have one, look for one
        if (!this.ownerTree) {
            var p = this;
            
            while (p) {
                if (p.ownerTree) {
                    this.ownerTree = p.ownerTree;
                    break;
                }
                p = p.parentNode;
            }
        }
        
        return this.ownerTree;
    },

    /**
     * Returns depth of this node (the root node has a depth of 0)
     * @borrows
     * @return {Number}
     */
    getDepth : function() {
        var depth = 0,
        		p = this;
        while (p.parentNode) {
            ++depth;
            p = p.parentNode;
        }
        
        return depth;
    },

    /**
     * Sets this node tree owner(controller)
     * @protected
     * @param {Tree} tree
     * @param {Boolean} destroy
     */
    setOwnerTree : function(tree, destroy) {
        // if it is a move, we need to update everyone
        if (tree != this.ownerTree) {
            if (this.ownerTree) {
                this.ownerTree.unregisterNode(this);
            }
            this.ownerTree = tree;
            // If we're destroying, we don't need to recurse since it will be called on each child node
            if (destroy !== true) {
                Ext.each(this.childNodes, function(n){
                    n.setOwnerTree(tree);
                });
            }
            if (tree) {
                tree.registerNode(this);
            }
        }
    },

    /**
     * Changes the id of this node.
     * @borrows
     * @param {String} id The new id for the node.
     */
    setId : function(id) {
        if (id !== this.id) {
            var t = this.ownerTree;
            if (t) {
                t.unregisterNode(this);
            }
            this.id = id;
            if (t) {
                t.registerNode(this);
            }            
            this.onIdChange(id);
        }
    },

    /**
     * ID change callback method.
     * @protected
     */
    onIdChange: Ext.emptyFn,

    /**
     * Returns the path for this node. The path can be used to expand or select this node programmatically.
     * @param {String} attr (optional) The attr to use for the path (defaults to the node's id)
     * @return {String} The path
     */
    getPath : function(attr) {
        attr = attr || "id";
        var p = this.parentNode,
        	b = [this[attr]];
        while (p) {
            b.unshift(p[attr]);
            p = p.parentNode;
        }
        var sep = this.getPathSeparator();
        
        return sep + b.join(sep);
    },

    /**
     * Returns path separator.
     * @return {String} separator
     */
    getPathSeparator : function() {
    	return this.getOwnerTree() ? this.getOwnerTree().pathSeparator : this.pathSeparator;
    },
    
    /**
     * Bubbles up the tree from this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the bubble is stopped.
     * @borrows
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    bubble : function(fn, scope, args) {
        var p = this;
        while (p) {
            if (fn.apply(scope || p, args || [p]) === false) {
                break;
            }
            p = p.parentNode;
        }
    },

    /**
     * Cascades down the tree from this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the cascade is stopped on that branch.
     * @borrows
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    cascade : function(fn, scope, args) {
        if (fn.apply(scope || this, args || [this]) !== false) {
            var cs = this.childNodes;
            for (var i = 0, len = cs.length; i < len; i++) {
                cs[i].cascade(fn, scope, args);
            }
        }
    },

    /**
     * Interates the child nodes of this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the iteration stops.
     * @borrows
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node in the iteration.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    eachChild : function(fn, scope, args) {
        var cs = this.childNodes;
        for (var i = 0, len = cs.length; i < len; i++) {
            if (fn.apply(scope || cs[i], args || [cs[i]]) === false) {
                break;
            }
        }
    },
    
    /**
     * Filters child nodes by tag name.
     * @param {String} tagName The tag name to filter by
     * @return {Array} child nodes
     */
    filterChildren : function(tagName) {
    	return this.filterChildrenBy(function(n) {
    		return n.tag == tagName; 
    	});
    },
    
    /**
     * Filters the child nodes of this node, calling the specified function with each node. 
     * If a child node should be included in filtered array the calling function should return true otherwise false.
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node in the iteration.
     * @return {Array} filtered children nodes  
     */
    filterChildrenBy : function(fn, scope) {
    	var filtered = [];
    	this.eachChild(function(node) {
    		if (fn.apply(scope || node, [node]) === true) {
                filtered.push(node);
            }
    	}, scope);
    	
    	return filtered;
    },

    /**
     * Finds the first child by tag and property value.
     * @param {String} tag The node tag name
     * @param {String} property The property name
     * @param {Mixed} value The value to search for
     * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
     * @return {Node} The found child or null if none was found
     */
    findChild : function(tag, property, value, deep) {
        return this.findChildBy(function() {
        	var p = this.getPropertyValue(property);
            return (this.tag == tag) && (p && p == value);           
        }, null, deep);
    },
    
    /**
     * Finds the first child by ID.
     * @param {String} value The ID value
     * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
     * @param {Boolean} byPattern (Optional) True to use ID pattern during searching
     * @return {Node} The found child or null if none was found
     */
    findChildById : function(value, deep, byPattern) {
        return this.findChildBy(function() {
        	return byPattern ? new RegExp("^" + value + "(?:-\\d+)?$", 'i').test(this.id) 
        					 : this.id == value;
        }, null, deep);
    },

    /**
     * Finds the first child by a custom function. The child matches if the function passed returns <code>true</code>.
     * @param {Function} fn A function which must return <code>true</code> if the passed Node is the required Node.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the Node being tested.
     * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
     * @return {Node} The found child or null if none was found
     */
    findChildBy : function(fn, scope, deep) {
        var cs = this.childNodes,
            len = cs.length,
            i = 0,
            n,
            res;
            
        for (; i < len; i++) {
            n = cs[i];
            if (fn.call(scope || n, n) === true) {
                return n;
            } else if (deep) {
                res = n.findChildBy(fn, scope, deep);
                if (res != null) {
                    return res;
                }
            }
        }
        
        return null;
    },

    /**
     * Sorts this nodes children using the supplied sort function.
     * @borrows
     * @param {Function} fn A function which, when passed two Nodes, returns -1, 0 or 1 depending upon required sort order.
     * @param {Object} scope (optional)The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     */
    sort : function(fn, scope) {
        var cs = this.childNodes;
        var len = cs.length;
        if (len > 0) {
            var sortFn = scope ? function(){return fn.apply(scope, arguments);} : fn;
            cs.sort(sortFn);
            for (var i = 0; i < len; i++) {
                var n = cs[i];
                n.previousSibling = cs[i-1];
                n.nextSibling = cs[i+1];
                if (i === 0) {
                    this.setFirstChild(n);
                }
                if (i == len-1) {
                    this.setLastChild(n);
                }
            }
        }
    },

    /**
     * Returns true if this node is an ancestor (at any point) of the passed node.
     * @borrows
     * @param {Node} node
     * @return {Boolean}
     */
    contains : function(node) {
        return node.isAncestor(this);
    },

    /**
     * Returns true if the passed node is an ancestor (at any point) of this node.
     * @borrows
     * @param {Node} node
     * @return {Boolean}
     */
    isAncestor : function(node) {
        var p = this.parentNode;
        while (p) {
            if (p == node) {
                return true;
            }
            p = p.parentNode;
        }
        
        return false;
    },
    
    /**
     * Returns node's properties.
     * @return {Ext.util.MixedCollection} properties
     */
    getProperties : function() {    	
    	return this.properties;
    },
    
    /**
     * Returns defined node's properties as a hash object key/value pair {k: v[, k1: v1[,...]]}.
     * @param {Boolean} (Optional) defVal Flag responsible for returning node's properties with "defaultValue" property defined even when "value" property is undefined 
     * @return {Object} properties hash
     */
    getPropertiesHash : function(defVal) {
    	var ps = this.getProperties(),
    		hash = {};
    	
    	ps.eachKey(function(k, p) {
    		if (!Ext.isEmpty(p.value) || (defVal && !Ext.isEmpty(p.defaultValue))) {
    			hash[k] = defVal ? (Ext.isDefined(p.value) ? p.value : p.defaultValue) : p.value;
    		}
    	});
    	
    	return hash;
    },

    /**
     * Returns a constructor which is used to create new Records from node's properties. 
     * The constructor has the same signature as {@link #Record}.
     * Reserved "model-id" property contains the node's id.
     * @return {Function} record constructor
     */
    getPropertiesRecordType : function() {
        var fields = ['model-id'].concat(this.properties.keys);
        
        return Ext.data.Record.create(fields);        
    },
    
    /**
     * Returns a record from node's properties.
     * Reserved "model-id" property contains the node's id.
     * @return {Ext.data.Record} record
     */
    getPropertiesRecord : function() {
        var recType = this.getPropertiesRecordType(),
            data = this.getPropertiesHash(true);
        
        data['model-id'] = this.id;
        
        return new recType(data, this.id);
    },
    
    getPropertiesRecordData : function() {
        var data = this.getPropertiesHash(true);
        data['model-id'] = this.id;
        
        return data;
    },
    
    /**
     * Returns property.
     * @param {String} p The property name.
     * @return {Mixed} property
     */
    getProperty : function(p) {
    	return this.properties.get(p);
    },
    
    /**
     * Returns property's value.
     * If property has no value tries to return default value.
     * @param {String} p The property name.
     * @return {Mixed} If property was found returns its value, otherwise undefined.
     */
    getPropertyValue : function(p) {
    	var property = this.getProperty(p);
    	
    	return property ? property.getValue() : undefined;
    },
    
    /**
     * Sets property's value.
     * @param {String} p The property name
     * @param {String} v The value being set to property
     * @return {Object} property which value was set or null if property is not exist.
     */
    setProperty : function(p, v) {
    	var property = this.properties.get(p);
    	
    	if (!Ext.isDefined(property)) {
    		return null;
    	}
    	
		var oldValue = property.getValue();
        
    	if (property.validate(v) && this.fireEvent("beforeModelPropertyChanged", this, p, v, oldValue)) {
    		
    		property.setValue(v);
    		
	    	this.fireEvent("modelPropertyChanged", this, p, v, oldValue);
	    	
    		if (property.reconfigure) {
    			this.reconfigure(property, p, v);
    		}
    	}
    	
    	return property;
    },

    /**
     * Returns {@link #NODE_DATA}.
     * @return {Property} node data.
     */
    getNodeData : function() {
    	return this[this.NODE_DATA];
    },

    /**
     * Returns {@link #NODE_DATA} value.
     * @return {Mixed} node value
     */
    getNodeDataValue : function() {
    	var data = this.getNodeData();
    	
    	return data ? data.getValue() : undefined;
    },
    
    /**
     * Sets node's {@link #NODE_DATA} property.
     * @param {Mixed} value The node's data value being set.
     */
    setNodeData : function(value) {
    	var nodeValueProperty = this.NODE_DATA;
    	
    	if (!this[nodeValueProperty]) {
    		return;
    	}
    	
		var oldValue = this[nodeValueProperty].getValue();
		
    	if (this.fireEvent("beforeModelPropertyChanged", this, '_content', value, oldValue)) {
    		
	    	this[nodeValueProperty].setValue(value);
	    	
	    	this.fireEvent("modelPropertyChanged", this, '_content', value, oldValue);
    	}
    },
    
    /**
     * Applies node properties.
     * @param {Object} properties The properties object
     * @param {Boolean} silent If silent is true all node's events are suspended
     */
    applyProperties : function(properties, silent) {
    	if (!Ext.isObject(properties)) {
    		throw new afStudio.model.error.PropertyError('incorrect-properties');
    	}
    	
    	silent ? this.suspendEvents() : null;
    	
    	Ext.iterate(properties, function(k, v) {
    		if (this.setProperty(k, v) === null) {
    			var p = new afStudio.model.Property({name: k, value: v});
	    		this.properties.add(p);
    		}
    	}, this);
    	
    	silent ? this.resumeEvents() : null;
    },
    
    /**
     * Returns a source properties object of this node. 
     * @return {Object} source
     */
    getPropertiesSource : function() {
    	var ps = this.getProperties(),
    		source = {};
    	
    	ps.eachKey(function(k, p) {
			source[k] = p.getPropertyHash();
    	});
    	
    	if (this.isNodeDataUsed()) {
    		var _content = this.getNodeData();
    		source['_content'] = _content.getPropertyHash();
    	}
    	
    	return source;
    },

    /**
     * Node data {@link #NODE_DATA} property is used if node has no children and {@link #_content} is defined.
     * @protected
     * @return {Boolean}
     */
    isNodeDataUsed : function() {
    	var _content = this.getNodeData();
    	
    	return Ext.isEmpty(this.nodeTypes) && _content;
    },
    
    /**
     * Returns model's root node.
     * @protected
     * @return {Node} root node or undefined
     */
    getRootNode : function() {
    	var root = this.parentNode;
        while (root && root.parentNode) {
        	root = root.parentNode;
        }
						
    	return root;
    },
    
    /**
	 * Returns model's type.
     * @protected
     * @return {String} type if specified otherwise returns null
     */
	getModelType : function() {
		return this.modelType;
	},    
    
    /**
     * Returns node constructor function by node type.
     * @protected
     * @param {String} nodeName
     * @return {Function} node class constructor or null if failed
     */
    getNodeConstructorByName : function(nodeName) {
    	var mt = this.getModelType(),
    		nCls = String(nodeName).trim(),
    		modelNs = [afStudio.model];
    		
    	if (mt) {
    		if (['layout', 'menu'].indexOf(mt) == -1) {
    			modelNs.unshift(afStudio.model.widget);
    		}
    	}
    	
    	if (/^i:(\w+)/i.test(nCls)) {
			nCls = nCls.replace(/^i:(\w+)/i, function(s, m1) {
			    return m1.ucfirst(); 
			});
    	}
    	
    	Ext.iterate(modelNs, function(ns) {
    		if (Ext.isFunction(ns[nCls])) {
    			nCls = ns[nCls];
    			return false;
    		}
    	});

    	return Ext.isFunction(nCls) ? nCls : null;
    },
    //eo getNodeConstructorByName
    
    /**
     * Creates a child node and append it.
     * @protected 
     * @param {String} node The node identifier. 
     * @param {Object} (Optional) nodeDefiniton The node definition object.
     * @return {afStudio.model.Node} The created node or null if node creation failed.
     */
    createNode : function(node, nodeDefiniton) {
    	var n = null;

    	if (Ext.isEmpty(node)) {
    		throw new afStudio.model.error.NodeError('node-undefined');
    	}
    	
    	if (this.fireEvent("beforeModelNodeCreated", this.ownerTree, this, node)) {
    		var nodeCls = this.getNodeConstructorByName(node);
    		
    		nodeCls = nodeCls ? nodeCls : afStudio.model.Node;
    		
	    	n = new nodeCls({
	    		tag: node,
	    		modelType: this.getModelType(),
	    		definition: nodeDefiniton
	    	});
	    	
	    	if (this.fireEvent("modelNodeCreated", this.ownerTree, this, n)) {
	    		n = this.appendChild(n);
	    		n.onNodeCreate();
	    	}
    	}
    	
    	return n;
    },
    //eo createNode
    
    /**
     * Create node callback, is executed when a node was created {@link #createNode} and appended.
     * This method can be used for internal settings in a node, so it should be overridden in descendants classes to provide specific functionality.
     * @abstract
     */
    onNodeCreate : function() {},
    
    /**
     * Reconfigures node's structural data.
     * @protected
     * 
     * @param {Property} property The property holding reconfigure data
     * @param {String} name The property's name
     * @param {Mixed} value The new property's value which runs reconfiguration
     */
    reconfigure : function(property, name, value) {
    	var cfg = property.reconfigure;
    	
    	if (Ext.isDefined(cfg[value])) {
			//remove all structure for the moment (will be changed)
			this.nodeTypes.length = 0;
			this.removeAll(true);
			
    		Ext.each(cfg[value], function(n){
    			this.nodeTypes.push(n);
    		}, this);
    		
    		this.fireEvent('modelReconfigure', this);
    	}
    },
    
    /**
     * Returns node text presentation in validation process.
     * @protected
     * @return {String} node 
     */
    getNodeValidationName : function() {
        return this.tag;  
    },
    
    /**
     * Validates the node and all his children.
     * Returns true if the node is valid otherwise returns errors object:
     * <u>
     * 	<li><b>node</b>: {String} The node's tag name</li>
     * 	<li><b>error</b>: {null|Array} The node's properties and structural errors</li>
     * 	<li><b>children</b>: {Array} The node's children validation result</li>
     * </u>
     * 
     * @protected
     * 
     * @return {Boolean|Object} validation result
     */
    validate : function() {
    	var ps = this.getProperties(),
    		nt = this.nodeTypes;
    	
    	var errors = {
    		node: this.getNodeValidationName(),
    		error: null,
    		children: []
    	};	
    	
    	//properties
    	var err = [];
    	
    	ps.eachKey(function(k, p) {
    		if (!p.isValid()) {
    			var o = {};
    			o[k] = p.getErrors();
    			err.push(o);
    		}
    	});
    	
    	//value
    	if (this.isNodeDataUsed()) {
	    	var value = this.getNodeData();
			if (!value.isValid()) {
				err.push({'_content' : value.getErrors()});
			}
    	}
    	
    	//structure
    	Ext.each(nt, function(it){
			var t = this.getTypeStructure(it);
			if (t.required && !this.hasChildWithType(t.name)) {
   				var o = {};
    			o[t.name] = String.format('Required {0} <u>{1}</u> node', t.hasMany ? 'at least one' : '', t.name); 				
				err.push(o);
			}
    	}, this);
    	
    	//children
		this.eachChild(function(node){
			var e = node.validate();
			if (e !== true) {
				errors.children.push(e);
			}
		});
    	
    	if (err.length > 0 || errors.children.length > 0) {
    		errors.error = Ext.value(err, null);
    		
    		return errors;
    	}
    	
    	return true;
    },
    //eo validate 
    
    //TODO validation & any additional actions should be organized as callbacks and not stands on events 
    
    /**
     * <u>modelNodeCreated</u> event listener.
     * Checks if can be added child node.
     * @protected
     * @return {Boolean}
     */
    onModelNodeCreated : function(ctr, parent, node) {
		afStudio.Logger.info('@model "modelNodeCreated"', parent, node);
		
		var nodeTag = node.tag,
			ns = node.getStructuralData(parent),
			canBeAdded = true;
			
		var message;
		
		if (ns) {
			if (parent.hasChildWithType(nodeTag)) {
				if (!ns.hasMany) {
					canBeAdded = false; 
					message = String.format("<b>{0}</b> can contain only one <u>{1}</u> child node.", parent.tag, nodeTag);
				} else if (ns.unique && parent.findChild(nodeTag, ns.unique, node.getPropertyValue(ns.unique))) {
					canBeAdded = false;
					message = String.format('<b>{0}</b> property <u>{1}</u> should be unique.', nodeTag, ns.unique);
				}
			}
		} else {
			canBeAdded = false;
			message = String.format("<b>{0}</b> cannot contain <u>{1}</u> child node.", parent.tag, nodeTag);
		}
		
		if (!canBeAdded) {
			afStudio.Msg.warning('Model', message);
		}
		
		return canBeAdded;
    },
    //eo onModelNodeCreated
    
    /**
     * To add additional validation functionality 
     * this method should be overridden. 
     * <u>beforeModelPropertyChanged</u> event listener.
     * @abstract
     * @protected
     * @return {Boolean}
     */
    onBeforeModelPropertyChanged : function(node, property, value, oldValue) {
    	return true;
    },
    
    /**
     * To add additional functionality this method should be overridden. 
     * <u>modelPropertyChanged</u> event listener. 
     * @abstract
     * @protected
     * @return {Boolean}
     */
    onModelPropertyChanged : function(node, property, value, oldValue) {
    	return true;
    },

    /**
     * To add additional functionality this method should be overridden. 
     * <u>beforeModelNodeRemove</u> event listener. 
     * @abstract
     * @protected
     * @return {Boolean}
     */
    onBeforeModelNodeRemove: function(tree, node, removeNode) {
    	return true;    	
    },
    
    /**
     * Returns node's string representation.
     * @override
     * @return {String} node
     */
    toString : function() {
    	var me = this;
		var tpl = new Ext.XTemplate(
			'[model.Node: "{tag}", ID: "{id}", {NODE_DATA}: {[this.getData()]}]',
			{
        		compiled: true,
        		disableFormats: true,
        		getData: function() {
        			return me[me.NODE_DATA] ? me[me.NODE_DATA].getValue() : null;
        		}
    		});
    	
        return tpl.apply(this);
    }
});