Ext.ns('afStudio.definition');

/**
 * View Definition.
 * Widgets <u>definition</u> data holder. Definition is an Object representing a view xml structure.
 * 
 * @class afStudio.definition.ViewDefinition
 * @extends afStudio.definition.DataDefinition
 * @author Nikolai Babinski <niba@appflower.com>
 */
afStudio.definition.ViewDefinition = Ext.extend(afStudio.definition.DataDefinition, {
	/**
	 * Definition Object. <i>Read-Only</i>
	 * @property data
	 * @type {Object}
	 */
	
	/**
	 * Returns definition's entity by model node.
	 * @override
	 * @public
	 * @param {afStudio.model.Node} node The model node
	 * @return {Mixed} entity
	 */
	getEntity : function(node) {
		var entity = this._getEntity(node);
		
		return this.out(entity);
	},
	//eo getEntity

	/**
	 * @private
	 */
	_getEntity : function(node) {
		var entObj = this.getEntityAncestor(node),
			ea = entObj.ancestor,
			ek = entObj.entityKey,
			entity;
		
		if (Ext.isArray(ea[ek])) {
			var eArray = ea[ek],
				eIdx = entObj.entityIdx;
			entity = eArray[eIdx];			
		} else {
			entity = ea[ek];
		}
	
		return entity;
	},
	
	/**
	 * Sets entity's attribute.
	 * @param {Node} node The model node 
	 * @param {String} p The property name
	 * @param {Mixed} v The property value
	 */
	setEntityAttribute : function(node, p, v) {
		var ent = this._getEntity(node);
		
		var property = node.getProperty(p);
		if (p != '_content' && Ext.isEmpty(property.defaultValue) && Ext.isEmpty(v)) {
			if (ent) {
				this.removeEntityAttribute(ent, p);
				return;
			}
		}
		
		if (!Ext.isDefined(ent)) {
			var entObj = this.getEntityAncestor(node),
				ea = entObj.ancestor,
				ek = entObj.entityKey;
			if (node.getProperties().length > 0 || node.nodeTypes.length > 0) {
				ent = ea[ek] = {}
			} else {
				ent = ea[ek] = null;
			}
		}
		
		if (p == '_content') {
			if (Ext.isObject(ent)) {
				ent._content = v;
			} else {
				var entObj = this.getEntityAncestor(node),
					ea = entObj.ancestor,
					ek = entObj.entityKey;
				ea[ek] = v;
			}
		} else {
			if (!ent.attributes) {
				ent.attributes = {};
			}
			ent.attributes[p] = v;
		}
	},
	//eo setEntity
	
	/**
	 * Removes entity's attribute
	 * @param {Object} ent The entity object
	 * @param {String} attr The attribute being deleted
	 */
	removeEntityAttribute : function(ent, attr) {
		delete ent.attributes[attr];
	},
	
	/**
	 * @override
	 * @public
	 * @param {afStudio.model.Node} parent
	 * @param {afStudio.model.Node} node
	 */
	addEntity : function(parent, node) {
		var entObj = this.getEntityAncestor(parent),
			ea = entObj.ancestor,
			ek = entObj.entityKey,
			eParent = ea[ek];
		
		var entity = this.createEntity(node);
		if (!Ext.isDefined(entity)) {
//			throw new afStudio.definition.error.DefinitionError('create-entity');
		}
		
		//parent element is not exists.
		if (!eParent) {
			eParent = ea[ek] = {};
		}
		var eTag = node.tag;
		if (eParent[eTag]) {
			if (!Ext.isArray(eParent[eTag])) {
				var pr = eParent[eTag];
				eParent[eTag] = [pr];
			}
			eParent[eTag].push(entity);
		} else {
			eParent[eTag] = entity;
		}
	},
	//eo addEntity	
	
	/**
	 * @public
	 */
	insertBeforeEntity : function(parent, node, refNode) {
		var entObj = this.getEntityAncestor(refNode),	
			ea = entObj.ancestor,
			ek = entObj.entityKey,
			eIdx = entObj.entityIdx,
			eParent = ea[ek];

		//node should be added
		if (node.tag != refNode.tag) {
			this.addEntity(parent, node);
		}
		
		var entity = this.createEntity(node);
		if (Ext.isDefined(eIdx)) {
			eParent.splice(eIdx, 0, entity);
		}
	},
	
	/**
	 * Removes entity corresponding to the model node passed in.
	 * @override
	 * @public
	 * @param {afStudio.model.Node} node The model node
	 */
	removeEntity : function(node) {
		var entObj = this.getEntityAncestor(node),
			ea = entObj.ancestor,
			ek = entObj.entityKey,
			entity;
	
		if (Ext.isArray(ea[ek])) {
			var eArray = ea[ek],
				eIdx = entObj.entityIdx;
			entity = eArray[eIdx];
			eArray.splice(eIdx, 1);
			Ext.isEmpty(eArray) ? delete ea[ek] : null;
		} else {
			entity = ea[ek];
			delete ea[ek];
		}
		
		entity = this.out(entity);
		
		this.fireEvent('entityRemove', entity);
	},
	//eo removeEntity
	
	/**
	 * @protected
	 */
	createEntity : function(node) {
		var eAttr = node.getPropertiesHash(),
			eContent = node.getNodeData() ? node.getNodeData().getValue() : null,
			entity;
	
		var attrEmpty = true;	
		for (var p in eAttr) {
			attrEmpty = false;
			break;
		};			
		
		//if node has properties or children
		if (node.getProperties().length > 0 || node.nodeTypes.length > 0) {
			entity = {};
		}
		
		if (eAttr && !attrEmpty) {
			entity = {
				attributes: {}
			};
			Ext.apply(entity.attributes, eAttr);
		}
		if (eContent != null) {
			if (Ext.isObject(entity)) {
				entity._content = eContent;
			} else {
				entity = eContent;
			}
		}
		
		return entity;
	},
	
	/**
	 * Returns entity's parent object and its reference inside the parent. 
	 * @private
	 * 
	 * @return {Object} entityObj:
	 * <ul>
	 * {
	 * 	<li><b>ancestor</b>: The entity's parent object(wrapper)</li>
	 * 	<li><b>entityKey</b>: The entity's property name inside parent object</li>
	 * 	<li><b>entityIdx</b>: (Optional) The entity's index inside an array, if <i>entityKey</i> is reference to an array</li>
	 * }
	 * </ul>
	 */
	getEntityAncestor : function(node) {
		var d = this.data,
			sep = node.getPathSeparator(),
    		path = node.getPath().split(sep);

    	//remove "/root"
    	path.splice(0, 2);

    	var i = 0,
    		len = path.length,
    		ancestor = d,
    		ent = d;
    	while (i < len && ent[path[i]]) {
    		if (i > 0) {
    			ancestor = ent;
    		}
    		ent = ent[path[i]];
    		i++;
    	}
    	
    	var result = {
    		ancestor: ancestor,
    		entityKey: path[i - 1]
    	};
    	
    	if (i < len) {
    		//remove id suffix
    		var entKey = path[i].replace(/-\d+$/, '');
    		result.ancestor  = ent;
    		result.entityKey = entKey;
    		
    		if (Ext.isArray(ent[entKey])) {
    			var entIdx = this.searchEntityIndex(ent[entKey], node);
    			if (entIdx == null) {
    				throw new Ext.Error(String.format('ViewDefinition. Entity equal to node {0} was not found.', node));
    			}
    			result.entityIdx = entIdx;
    		}
    	}
    	
    	return result;
	},
	//eo getEntityAncestor

	/**
	 * Compares entity and model node, returns true if model node represents the entity - they are equal. 
	 * @protected
	 * @param {Object} entity The entity
	 * @param {afStudio.model.Node} node The model node.
	 * @return {Boolean}
	 */
	equal : function(entity, node) {
		var np = node.getPropertiesHash(),
			nc = node.getNodeData() ? node.getNodeData().getValue() : null;

		var equal = true;
		
		if (Ext.isObject(entity)) {
			//compare attributes
			Ext.iterate(entity.attributes, function(k, v) {
				return (!(Ext.isEmpty(np[k]) || Ext.isEmpty(v)) && np[k] !== v) ? (equal = false) : true;
			});
			//compare _content
			if (equal) {
				if (Ext.isPrimitive(nc) && nc != entity._content) {
					equal = false;
				}
			}
		} else {
			equal = entity == nc;	
		}
		
		return equal;
	},
	//eo equal	
	
	/**
	 * Searching an entity corresponding to model node.
	 * Search is based on <i>attributes</i> and <i>_content</i> comparison.
	 * @private
	 * @param {Array} entArray The array of entities.
	 * @param {afStudio.model.Node} node The model node.
	 * @return {Number} entity's index inside entArray or null if entity was not found. 
	 */
	searchEntityIndex : function(entArray, node) {
		var np = node.getPropertiesHash(),
			entIdx;
			
		for (var i = 0, len = entArray.length; i < len; i++) {
			if (this.equal(entArray[i], node)) {
				entIdx = i;
				break;
			}
		}
		
		return Ext.isNumber(entIdx) ? entIdx : null;
	}
	//eo searchEntityIndex
});