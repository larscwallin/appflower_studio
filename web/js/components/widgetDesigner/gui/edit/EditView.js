Ext.ns('afStudio.wd.edit');


afStudio.wd.edit.EditView = Ext.extend(Ext.FormPanel, {

	/**
	 * The associated with this view controller.
	 * @cfg {afStudio.controller.BaseController} (Required) controller
	 */

	/**
	 * @cfg {Boolean} frame (defaults to true)
	 */
	frame : true,
	
	/**
	 * Initializes component
	 * @private
	 * @return {Object} The configuration object 
	 */
	_beforeInitComponent : function() {
		var me = this,
			nodes = afStudio.ModelNode;
		
		/**
		 * Model->Component associations holder.
		 * @property modelMapper
		 * @type {Object}
		 */
		this.modelMapper = {};
			
		var labelWidth = this.getModelNodeProperty(nodes.FIELDS, 'labelWidth');

		var items = this.createFormCmp();
		
		var buttons = this.createButtons();
		
		this.dumpMapper();
		
		return {
			autoScroll: true,
			labelWidth: labelWidth,
			items: items,
			buttons: buttons
		}
	},
	
	/**
	 * Template method
	 * @override
	 * @private
	 */
	initComponent : function() {
		Ext.apply(this, 
			Ext.apply(this.initialConfig, this._beforeInitComponent())
		);
		
		afStudio.wd.edit.EditView.superclass.initComponent.apply(this, arguments);
		
		//this._afterInitComponent();
	},	
	
	/**
	 * Template method
	 * @override
	 * @private
	 */
	initEvents : function() {
		afStudio.wd.edit.EditView.superclass.initEvents.call(this);
	},
	
	/**
	 * Template method
	 * @override
	 * @private
	 */
    beforeDestroy : function() {
    	this.modelMapper = null;
        afStudio.wd.edit.EditView.superclass.beforeDestroy.call(this);
    },
	
	/**
	 * Returns grid's component by a model.
	 * @public
	 * @interface
	 * @param {String|Node} node The model node or model node's id
	 * @param {String} property The model node's property
	 * @return {Ext.Component} node
	 */
	getCmpByModel : function(node, property) {
		var nId = Ext.isString(node) ? node : node.id;
		var mapping = this.modelMapper[nId] || (property ? this.modelMapper[nId + '#' + property] : false);
		if (mapping) {
			return  Ext.isFunction(mapping) ? mapping() : mapping;
		}
		
    	return null;
	},
	//eo getCmpByModel	
	
	/**
	 * Returns model node by component associated with it. If node was not found returns null/undefined.
	 * @public
	 * @interface
	 * @param {Ext.Component} cmp The grid's component associated with a model node
	 * @return {Node} model node
	 */
	getModelByCmp : function(cmp) {
		var mpr = this.getModelNodeMapper(),
			nodeId = cmp[mpr];
			
		return this.getModelNode(nodeId);
	},
	
	
	/**
	 * Maps this grid's component to a model node.
	 * @protected
	 * @param {String} node The model node ID
	 * @param {Component/Function} cmp The component being mapped to the model node or a function returning a mapped component
	 */
	mapCmpToModel : function(node, cmp) {
		this.modelMapper[node] = cmp;
	},
	
	/**
	 * Unmaps the grid's component from the model node.
	 * @protected
	 * @param {String/Node} node The model node's ID or model node
	 */
	unmapCmpFromModel : function(node) {
		node = Ext.isString(node) ? node : node.id;
		delete this.modelMapper[node];
	},
	
	/**
	 * Creates the mapper function. All passed in parameters except the first one(mapper function) are added to the mapper.
	 * @protected
	 * @param {Function} fn The function mapper
	 * @return {Funtion} mapper
	 */
	createMapper : function(fn) {
		var args = Array.prototype.slice.call(arguments, 1);
		return fn.createDelegate(this, args);
	},
	
	/**
	 * Creates fields, field-sets and tabpanel. 
	 * Returns an array of components being used as edit view items elements.
	 * @protected
	 * @return {Array} components
	 */
	createFormCmp : function() {
		var N = afStudio.ModelNode,
			cmp = [];
		
		if (this.getModelNodeByPath([N.GROUPING, N.SET])) {
		
			Ext.each(this.getPlainFieldSets(), function(s) {
				cmp.push(this.createFieldSet(s));
			}, this);
			
			var flds = this.getFieldsFromDefaultSet(),
				defSet = this.createDefaultFieldSet(flds);
			cmp.push(defSet);
			
			var tabbedSets = this.getTabbedFieldSets();
			if (!Ext.isEmpty(tabbedSets)) {
				cmp.push(this.createTabPanel(tabbedSets));
			}
			
		} else {
			//simple form without sets and tabpanel	
			Ext.each(this.getFields(), function(f) {
				cmp.push(this.createField(f));
			}, this);
		}
		
		return cmp;
	},
	
	/**
	 * Creates & registers a field component.
	 * @protected
	 * @return {Ext.form.Field} field
	 */
	createField : function(fld) {
		var mpr = this.getModelNodeMapper(),
			fldId = fld[mpr];
		
		var fn, cfg = {}, f;
		
		Ext.copyTo(cfg, fld, 'name, value, style, width, height, disabled');
		
		Ext.apply(cfg, {
			fieldLabel: fld.label,
			labelStyle: 'font-weight: bold;'
		});
		
		if (Ext.isDefined(fld.content)) {
			cfg.value = fld.content;
		}
		
		switch (fld.type) {
			case 'input':
				fn = Ext.form.TextField;
			break;
			
			case 'textarea':
				fn = fld.rich ? Ext.form.HtmlEditor : Ext.form.TextArea;
			break;
			
			case 'checkbox':
				fn = Ext.form.Checkbox;
				cfg.checked = Ext.isDefined(fld.checked) ? fld.checked : false;
			break;
			
			case 'radio':
				fn = Ext.form.Radio;
				cfg.checked = Ext.isDefined(fld.checked) ? fld.checked : false;
			break;
			
			case 'password':
				fn = Ext.form.TextField;
				cfg.inputType = 'password';
			break;
			
			case 'hidden':
				fn = Ext.form.Hidden;
			break;
			
			case 'file':
				fn = Ext.form.TextField;
				cfg.inputType = 'file';
			break;
			
			case 'combo':
				fn = Ext.form.ComboBox;
				Ext.apply(cfg, {
					store: []
				});
			break;
			
			case 'static':
				fn = Ext.form.DisplayField;
			break;
			
			case 'date':
				fn = Ext.form.DateField;
				cfg.format = fld.dateFormat ? fld.dateFormat : 'Y-m-d';
			break;
			
			default:
				fn = Ext.form.DisplayField;
				cfg.value = String.format('<b>type</b> = {0}', fld.type);
			break;
		}
		
		if (fld.state == 'readonly') {
			cfg.readOnly = true;		
		} else if (fld.state == 'disabled') {
			cfg.readOnly = true;
			cfg.submitValue = false;
		}
		
		//add model node mapping
		cfg[mpr] = fldId;
		
		f = new fn(cfg);
		
		this.mapCmpToModel(fldId, f);
		
		return f;
	},
	//eo createField
	
	/**
	 * Creates buttons.
	 * Returns an array of buttons.
	 * @protected
	 * @return {Array} buttons
	 */
	createButtons : function() {
		var mpr = this.getModelNodeMapper(),
			N = afStudio.ModelNode,
			buttons = [];
		
		this.createResetSubmitButtons(buttons);
		
		var fldsBt = this.getFieldsButtons();
		for (var l = fldsBt.length, i = l - 1; i >= 0; i--) {
			buttons.unshift(
				this.createButton(fldsBt[i])
			);
		}
		
		Ext.each(this.getActions(), function(a){
			buttons.push(this.createButton(a));
		}, this);
		
		return buttons;
	},
	
	/**
	 * Creates and adds to buttons array submit and reset buttons.  
	 * @protected
	 * @param {Array} buttons The buttons
	 */
	createResetSubmitButtons : function(buttons) {
		var mpr = this.getModelNodeMapper(),
			N = afStudio.ModelNode;

		var fls = this.getModelNodeProperties(N.FIELDS);

		var submitBt = new Ext.Button({
			text: fls.submitlabel ? fls.submitlabel : 'Submit',
			iconCls: 'icon-accept',
			hidden: Ext.isDefined(fls.submit) ? !fls.submit : false 
		});
		submitBt[mpr] = N.FIELDS + '#submit';
		this.mapCmpToModel(N.FIELDS + '#submit', submitBt);
		this.mapCmpToModel(N.FIELDS + '#submitlabel', submitBt);
		
		var resetBt = new Ext.Button({
			text: fls.resetlabel ? fls.resetlabel : 'Reset',
			iconCls: 'icon-application-form',
			hidden: Ext.isDefined(fls.resetable) ? !fls.resetable : false 
		});
		resetBt[mpr] = N.FIELDS + '#resetable';
		this.mapCmpToModel(N.FIELDS + '#resetable', resetBt);
		this.mapCmpToModel(N.FIELDS + '#resetlabel', submitBt);
		
		buttons.push(submitBt, resetBt);
	},
	
	/**
	 * Creates & registers a button.
	 * @protected
	 * @param {Object} btn The button definition object
	 * @param {String} (optional) type The button definition object type = "button" | "action", default is "button"
	 * @return {Ext.Button}
	 */
	createButton : function(btn, type) {
		var mpr = this.getModelNodeMapper(),
			N = afStudio.ModelNode,
			cfg = {}, button;
		
		type = !Ext.isDefined(type) ? 'button' : 'action';	
		
		Ext.copyTo(cfg, btn, 'name, iconCls, icon, style');
		cfg[mpr] = btn[mpr];
		
		if (type == 'button') {
			cfg.text = btn.label ? btn.label : btn.name;
	        if (btn.state && btn.state == 'disabled') {
	        	cfg.disabled = true;	
	        }
		} else {
			Ext.apply(cfg, {
				text: btn.text ? btn.text : btn.name,
				tooltip: btn.tooltip
			});
		}
		
		button = new Ext.Button(cfg);

		this.mapCmpToModel(btn[mpr], button);
		
		return button;
	},
	//eo createButton
	
	/**
	 * Creates & registers a field-set.
	 * @protected
	 * @param {Object} fldSet The field-set definition
	 * @return {Ext.form.FieldSet} field-set
	 */
	createFieldSet : function(fldSet) {
		var mpr = this.getModelNodeMapper(),
			N = afStudio.ModelNode,
			cfg = {}, 
			fieldSet;
		
		Ext.copyTo(cfg, fldSet, 'title, collapsed');
		
		Ext.apply(cfg, {
			collapsible: true,
			items: []
		});
		
		cfg[mpr] = fldSet[mpr];
		
		fieldSet = new Ext.form.FieldSet(cfg);
		
		this.mapCmpToModel(fldSet[mpr], fieldSet);
		
		var fields = this.getFieldsFromSet(fldSet[mpr]),
			fldSetFloat = fldSet['float'];
		
		var wr = this.createFieldWrapper(fldSetFloat),
			clmW = this.getColumnWidth(fields, 0);
		
		fieldSet.add(wr);
		
		Ext.each(fields, function(item, idx) {
			var ref = item.ref, 
				fld = item.field,
				f = this.createField(fld);
			
			this.wrapField(wr, f, clmW);
			
			if (idx != 0 && ref['break']) {
				wr = this.createFieldWrapper(fldSetFloat);
				clmW = this.getColumnWidth(fields, idx);
				fieldSet.add(wr);
			}
			
		}, this);

		return fieldSet;
	},
	//eo createFieldSet
	
	/**
	 * Creates the default field-set.
	 * @protected
	 * @param {Array} fields The fields definition object
	 * @return {Ext.form.FieldSet} field-set
	 */
	createDefaultFieldSet : function(fields) {
		var mpr = this.getModelNodeMapper(),
			N = afStudio.ModelNode,
			cfg = {}, 
			fieldSet;
		
		var grouping = this.getModelNodeProperties(N.GROUPING);	
			
		Ext.copyTo(cfg, grouping, 'title, collapsed');
		
		Ext.apply(cfg, {
			collapsible: true,
			items: []
		});
		
		var hidden = true, flds = [];
		Ext.each(fields, function(f) {
			if (f.type != 'hidden') {
				hidden = false;
			}
			flds.push(this.createField(f));
		}, this);
		
		cfg.hidden = hidden;
		fieldSet = new Ext.form.FieldSet(cfg);
		fieldSet.add(flds);
		
		return fieldSet;
	},
	//eo createDefaultFieldSet
	
	/**
	 * Creates tabbed field-sets.
	 * @param {Array} tabbedSets The tabbed field-set(s)
	 * @return {Ext.TabPanel} tab panel
	 */
	createTabPanel : function(tabbedSets) {
		var tabPanel = new Ext.TabPanel({
			activeTab: 0,
			height: 300,
			padding: 10,
			items: []
		});
		
		Ext.each(tabbedSets, function(fs){
			var t = {
				title: fs.tabtitle,
				items: this.createFieldSet(fs) 
			}
			tabPanel.add(t);
		}, this);
		
		return tabPanel;
	},
	
	/**
	 * Creates field(s) wrapper.
	 * @protected
	 * @param {Boolean} isFloat The float flag
	 * @return {Ext.Container}
	 */
	createFieldWrapper : function(isFloat) {
		isFloat = !Ext.isDefined(isFloat) ? false : isFloat;
		
		var cfg = {
			defaults: {
				xtype: 'container',
				layout: 'form',
				labelAlign: isFloat ? 'top' : 'left'
			},
			items: []
		};
		if (isFloat) {
			cfg.layout = 'column';
		}
		
		return new Ext.Container(cfg);
	},
	
	/**
	 * Wrappes a field and adds it into the wrapper container.
	 * @protected
	 * @param {Ext.Container} wrapper The field(s) wrapper container
	 * @param {Object} field The field being wrapped
	 * @param {Number} (optional) clmW The column width, by default is 1
	 */
	wrapField : function(wrapper, field, clmW) {
		clmW = Ext.isDefined(clmW) ? clmW : 1;

		wrapper.add(
		{
			columnWidth: clmW,
			items: field
		});		
	},

	/**
	 * Returns column width based on the count of floating fields.
	 * @protected
	 * @param {Array} items The i:grouping items
	 * @param {Number} fromIdx The first field index 
	 * @return {Number} column width
	 */
	getColumnWidth : function(items, fromIdx) {
		var count = 0,
			len = items.length;
			
		if (fromIdx < len) {
			for (var i = fromIdx; i < len; i++) {
				count++;
				if (items[i].ref['break'] == true) break;
			}
		}
		count = (count == 0) ? 1 : count; 
		
		return Ext.util.Format.round(1 / count, 2);
	},
	
	/**
	 * @private
	 */
	dumpMapper : function() {
		console.log('modelMapper', this.modelMapper);
		Ext.iterate(this.modelMapper, function(k, v, o){
			console.log(k, v);
		});
	}
	
});


//@mixin EditModelInterface
Ext.apply(afStudio.wd.edit.EditView.prototype, afStudio.wd.edit.EditModelInterface);

//@mixin ModelReflector
Ext.apply(afStudio.wd.edit.EditView.prototype, afStudio.wd.edit.ModelReflector);

/**
 * @type 'wd.editView'
 */
Ext.reg('wd.editView', afStudio.wd.edit.EditView);