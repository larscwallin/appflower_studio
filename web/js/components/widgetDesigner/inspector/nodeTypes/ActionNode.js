/**
 * This node represents <b>i:action</b> node in edit type widget
 * 
 * @class afStudio.wi.ActionNode
 * @extends afStudio.wi.ContainerNode
 */
afStudio.wi.ActionNode = Ext.extend(afStudio.wi.ContainerNode, {
	
	/**
	 * ActionNode constructor.
	 * @constructor
	 */
    constructor : function() {
        afStudio.wi.ActionNode.superclass.constructor.apply(this, arguments);
        
        this.addBehavior(new afStudio.wi.WithNamePropertyAsLabelBehavior);
    }//eo constructor
    
    /**
     * template method
     * @override
     * @return {Object} this node configuration object
     */
    ,getNodeConfig : function() {
        return {
            'text': 'new action'
        };
    }//eo getNodeConfig
    
    /**
     * template method
     * @override
     */
    ,createProperties : function() {
       var properties = [
           new afStudio.wi.PropertyTypeString({id: 'name', label: 'Name'}).setRequired().create(),
           new afStudio.wi.PropertyTypeString({id: 'url', label: 'Url'}).setRequired().create(),
           new afStudio.wi.PropertyTypeString({id: 'iconCls', label: 'Icon CSS class'}).create(),
           new afStudio.wi.PropertyTypeString({id: 'icon', label: 'Icon URL'}).create(),
           new afStudio.wi.PropertyTypeBoolean({id: 'forceSelection', label: 'Force selection'}).create(),
           new afStudio.wi.PropertyTypeBoolean({id: 'post', label: 'Post'}).create(),
           new afStudio.wi.PropertyTypeString({id: 'tooltip', label: 'Tooltip'}).create(),
           new afStudio.wi.PropertyTypeString({id: 'confirmMsg', label: 'Confirm message'}).create(),
           new afStudio.wi.PropertyTypeString({id: 'condition', label: 'Condition'}).create()
       ];

       this.addProperties(properties);
    }//eo createProperties
});