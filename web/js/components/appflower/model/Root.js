/**
 * Model <u>root</u> node. This node is the container of whole model.
 * 
 * @class afStudio.model.Root
 * @extends afStudio.model.Node
 * @author Nikolai Babinski
 */
afStudio.model.Root = Ext.extend(afStudio.model.Node, {
	
	/**
	 * @cfg {Function/String} (Optional) structureTpl
	 * <u>structureTpl</u> can be a Function or a String class name of model template structure.   
	 */
	
	/**
	 * Root node ID, value = "root".
	 * Read-only.
	 * @property id
	 * @type {String}
	 */
	id : 'root',
	//TODO think a bit over about model Root node ID.
	//Maybe it can be optimized and be more flexibile, depends of Model future usage.
	
	/**
	 * Root node tag property, value = "root".
	 * @property tag
	 * @type {String}
	 */
	tag: 'root',
	
	properties : [
//      {name: "xmlns:i", type: 'internalUriType'},
//		{name: "xmlns:xsi",  type: 'internalUriType'},
//		{name: "xsi:schemaLocation",  type: 'internalUriType'},
      	{name: "type", type: 'viewType', required: true}
//TODO should be fixed after AF schema cleaning       	
//      	{name: "tabbed", type: 'boolean'}
//      	{name: "module", type: 'string'}
	],
	
	/**
	 * Model Root node constructor.
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		afStudio.model.Root.superclass.constructor.call(this, config);
		
		//set modelType property to have compatibility with base Node class
		this.modelType = this.getPropertyValue('type');
		
		this.initStructure(config.structureTpl);
		
		this.processStructure();
	},
	//eo constructor
	
	/**
	 * Initialized Model Root node {@link #strTpl}.
	 * Template method. 
	 * @protected
	 * @param {Function/String} strc The model structure
	 */
	initStructure : function(strc) {
		var mt = this.getModelType();
		
		if (strc) {
			//all structure templates should be located inside "afStudio.model.template" namespace.
			strc = Ext.isFunction(strc) ? strc : afStudio.model.template[strc];
		} else if (mt) {
			var sTpl = mt.ucfirst() + 'Template';
			strc = afStudio.model.template[sTpl];
		}
		/**
		 * Model Root node's structure template @type {Object}
		 */
		this.strTpl = Ext.isFunction(strc) ? new strc() : undefined;
	},
	//eo initStructure
	
	/**
	 * Processes node structure based on {@link #strTpl}.
	 * Template method.
	 * @protected
	 */
	processStructure : function() {
		if (!this.strTpl) {
			return;
		}
		
		this.suspendEvents();
		this.strTpl.processStructure(this);
		this.resumeEvents();
		
		//update nodeTypes
		this.nodeTypes = this.nodeTypes.concat(this.strTpl.structure);
	},
	//eo processStructure
	
	/**
	 * Retruns this root node.
	 * @override
	 * @return {Node}
	 */
	getRootNode : function() {
		return this;
	},
	
	/**
	 * Returns Model's type.
	 * @override
	 * @return {String} type if specified otherwise returns undefined
	 */
	getModelType : function() {
		return this.getPropertyValue('type');
	},
	
	/**
	 * Returns model node by its ID.
	 * @param {String} nodeId The node ID value
	 * @return {Node} The found child or null if none was found
	 */
	getModelNode : function(nodeId) {
		return this.findChildById(nodeId, true);
	},
	
	getImmediateModelNode : function(nodeId) {	
		return this.findChildById(nodeId, false, true);
	}
});