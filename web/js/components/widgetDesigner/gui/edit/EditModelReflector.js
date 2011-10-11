Ext.ns('afStudio.wd.edit');

/**
 * EditView reflector.
 * 
 * @mixin ModelReflector
 *  
 * @singleton
 * @author Nikolai Babinski
 */
afStudio.wd.edit.EditModelReflector = (function() {
	
	return {
	
		/**
		 * Changes the line of some executors. 
		 * @override
		 */
		correctExecutorLine : function(line, type, node, property) {
			if (['Field', 'Description'].indexOf(line) != -1) {
				var pt = this.getExecutorToken(node.parentNode.tag);
				line = pt + line;
			}
			
			return line;
		},
		
		/**
		 * Removes component & unmapping it from the associated model node.
		 * @param {Node} node
		 * @param {Object} cmp
		 */
		removeComponent : function(node, cmp) {
			cmp.destroy(true);
			this.unmapCmpFromModel(node);
		},
		
		//TODO labelWidth property implementation
		executeUpdateFieldsLabelWidth : function(node, cmp, p, v) {
			/*
			console.log('label width', v);
			this.labelWidth = v;
			this.form.applyToFields({labelWidth: v});
			*/
		},
		
		//buttons, responsible properties: i:fields, i:actions
		//----------------------------------------------------
		
		//submit & reset buttons
		
		/**
		 * Updates submit button's label 
		 */
		executeUpdateFieldsSubmitlabel : function(node, cmp, p, v) {
			cmp.setText(v);
		},
		/**
		 * Updates reset button's label
		 */
		executeUpdateFieldsResetlabel : function(node, cmp, p, v) {
			cmp.setText(v);
		},
		/**
		 * Submit & Reset buttons visibility state 
		 */
		executeUpdateFieldsSubmit : function(node, cmp, p, v) {
			if (v === false) {
				cmp.sub.hide();
				cmp.res.hide();
			} else {
				cmp.sub.show();
				if (this.getModelByCmp(cmp.res)[1]) {
					cmp.res.show();
				}
			}
			this.doLayout();
		},
		/**
		 * Reset button visibility
		 */
		executeUpdateFieldsResetable : function(node, cmp, p, v) {
			v ? cmp.show() : cmp.hide();
		},
		
		//general buttons
		
		/**
		 * Adds a button.
		 * @private
		 * @param {Node} node The button related node
		 * @param {Number} idx The node idx inside the parent model node
		 * @param {String} type (optional) type The button type, can be "button" | "action", defaults to "button"
		 */
		addButton : function(node, idx, type) {
			type = Ext.isDefined(type) ? type : 'button';	
			
			var fb = this.getFooterToolbar(),
				pBtn = this.getModelNodeProperties(node),
				oBtn = this.createButton(pBtn, type);
				
			idx = this.getButtonIndex(node, idx, type);
			fb.insertButton(idx, oBtn);
			this.doLayout();
		},
		
		/**
		 * @private
		 */
		removeButton : function(node, cmp) {
			this.removeComponent(node, cmp);
		},
		
		/**
		 * @private
		 */
		insertButton : function(parent, node, refNode, refCmp, type) {
			type = Ext.isDefined(type) ? type : 'button';
			
			var fb = this.getFooterToolbar(),
				pBtn = this.getModelNodeProperties(node),
				oBtn = this.createButton(pBtn, type),
				idx = fb.items.indexOf(refCmp);
			
			fb.insertButton(idx, oBtn);			
			this.doLayout();			
		},
		
		/**
		 * Sets button <u>name</u> property.
		 * @private
		 * @param {Object} btn The button whose name property being set
		 * @param {String} v The name value
		 */
		setButtonName : function(btn, v) {
			var oldValue = btn.name;
			btn.name = v;
			if (Ext.isEmpty(btn.text) || btn.text == oldValue) {
				btn.setText(v);
			}
		},
		
		/**
		 * Sets button <u>text</u> property
		 * @private
		 */
		setButtonText : function(btn, v) {
			btn.setText(v ? v : btn.name);
		},
		
		/**
		 * Adds i:fields->i:button
		 */
		executeAddButton : function(node, idx) {
			this.addButton(node, idx);
		},
		/**
		 * Removes i:fields->i:button
		 */
		executeRemoveButton : function(node, cmp) {
			this.removeButton(node, cmp);
		},
		/**
		 * Inserts i:fields->i:button
		 */
		executeInsertButton : function(parent, node, refNode, refCmp) {
			this.insertButton(parent, node, refNode, refCmp);
		},
		/**
		 * label
		 */
		executeUpdateButtonLabel : function(node, cmp, p, v) {
			this.setButtonText(cmp, v);
		},
		/**
		 * name
		 */
		executeUpdateButtonName : function(node, cmp, p, v) {
			this.setButtonName(cmp, v);
		},
		/**
		 * iconCls
		 */		
		executeUpdateButtonIconCls : function(node, cmp, p, v) {
			cmp.setIconClass(v);
		},
		/**
		 * icon
		 */		
		executeUpdateButtonIcon : function(node, cmp, p, v) {
			cmp.setIcon(v);
		},
		
		//i:action buttons
		
		executeAddAction : function(node, idx) {
			this.addButton(node, idx, 'action');
		},
		executeRemoveAction : function(node, cmp) {
			this.removeButton(node, cmp);
		},
		executeInsertAction : function(parent, node, refNode, refCmp) {
			this.insertButton(parent, node, refNode, refCmp, 'action');
		},
		/**
		 * name
		 */
		executeUpdateActionName : function(node, cmp, p, v) {
			this.setButtonName(cmp, v);
		},
		/**
		 * text
		 */
		executeUpdateActionText : function(node, cmp, p, v) {
			this.setButtonText(cmp, v);
		},
		/**
		 * iconCls
		 */		
		executeUpdateActionIconCls : function(node, cmp, p, v) {
			cmp.setIconClass(v);
		},
		/**
		 * icon
		 */		
		executeUpdateActionIcon : function(node, cmp, p, v) {
			cmp.setIcon(v);
		},
		/**
		 * tooltip
		 */
		executeUpdateActionTooltip : function(node, cmp, p, v) {
			cmp.setTooltip(v);	
		},
		
		
		//fields (i:fields->i:field)
		//----------------------------------------------------
		/**
		 * Sets field's <u>content</u> property.
		 * @private
		 */
		setFieldContent : function(node, fld, v) {
			var fv = this.getModelNodeProperty(node, 'value');
			fld.content = v;
			fld.setValue(Ext.isEmpty(v) && !Ext.isEmpty(fv) ? fv : v);  
		},
		/**
		 * Sets field's <u>value</u> property.
		 * @private
		 */
		setFieldValue : function(fld, v) {
			if (Ext.isEmpty(fld.content)) {
				fld.setValue(v);
			}
		},
		
		/**
		 * Adds field (i:fields->i:field).
		 */
		executeAddFieldsField : function(node, idx) {
			var pField = this.getModelNodeProperties(node);
			
			if (this.isGrouped()) {
				
				var refNode = this.getRefByField(node, true);
				
				if (refNode) {
					var refCmp = this.getCmpByModel(refNode),
						oField = this.createField(pField);
					refCmp.add(oField);
					refCmp.doLayout();
				} else {
					
					var defSet = this.getDefaultSet();
					
					if (defSet) {
						var oField = this.createField(pField);
						defSet.add(oField);
						this.updateDefaultSetVisibility();
						defSet.doLayout();
					} else {
						defSet = this.createDefaultFieldSet([pField]);
						var tabPanel = this.getTabbedSet();
						if (tabPanel) {
							this.insert(this.items.indexOf(tabPanel), defSet);
						} else {
							this.add(defSet);
						}
						this.doLayout();
					}
				}
				
			} else {
				var oField = this.createField(pField),
					fldIdx = this.getFieldIndex(node, idx);
				this.insert(fldIdx, oField);
				this.doLayout();
			}
		},
		//eo executeAddFieldsField

		/**
		 * Removes field (i:fields->i:field).
		 */
		executeRemoveFieldsField : function(node, cmp) {
			var defSet = this.getDefaultSet();
			
			//field is located in the default fields-set
			if (defSet && defSet.items.indexOf(cmp) != -1) {
				this.removeComponent(node, cmp);
				
				//if default fields-set is empty remove it
				if (defSet.items.getCount() == 0) {
					defSet.destroy(true);
				} else {
					this.updateDefaultSetVisibility();
				}
				
			} else {
			//if a field is not inside the default fields-set simple remove it	
				this.removeComponent(node, cmp);
			}
		},
		
		/**
		 * Inserts field.
		 */
		executeInsertFieldsField : function(parent, node, refNode, refCmp) {
			var pField = this.getModelNodeProperties(node);
			
			//widget has grouping sets 	
			if (this.isGrouped()) {
				var ref = this.getRefByField(node, true);
				
				//if the i:ref node exists, mapped to the field being inserted  
				if (ref) {
					var oField = this.createField(pField);
					refCmp = this.getCmpByModel(ref);
					refCmp.add(oField);
					refCmp.doLayout();
					
				//field will be inserted in default fields-set
				} else {
					var defSet = this.getDefaultSet();
					
					if (defSet) {
						var oField = this.createField(pField);
						
						if (!node.isSimilarNode(refNode)) {
							defSet.add(oField);
						} else {
							var fldIdx = defSet.items.indexOf(refCmp);
							if (fldIdx == -1) {
								fldIdx = this.getDefaultSetInsertFieldIndex(parent, refNode);
							}
							defSet.insert(fldIdx, oField);
						}
						this.updateDefaultSetVisibility();
						defSet.doLayout();
						
					//default fields-set is not exists and will be created	
					} else {
						defSet = this.createDefaultFieldSet([pField]);
						var tabPanel = this.getTabbedSet();
						if (tabPanel) {
							this.insert(this.items.indexOf(tabPanel), defSet);
						} else {
							this.add(defSet);
						}
						this.doLayout();
					}
				}
				
			//simple edit widget
			} else {
				var oField = this.createField(pField);
				
				if (!node.isSimilarNode(refNode)) {
					this.add(oField);
				} else {
					var fldIdx = this.items.indexOf(refCmp);
					this.insert(fldIdx, oField);
				}
				this.doLayout();
			}
		},
		//eo executeInsertFieldsField
		
		/**
		 * type
		 */
		executeUpdateFieldsFieldType : function(node, cmp, p, v) {
			if (this.isGrouped()) {
				var defSet = this.getDefaultSet();

				//field is inside the default fields-set
				if (defSet.items.indexOf(cmp) != -1) {
					defSet.remove(cmp, true);
					
					if (node.nextSibling) {
						var parent = node.parentNode,
							refNode = node.nextSibling,
							refCmp = this.getCmpByModel(node.nextSibling);
						this.executeInsertFieldsField(parent, node, refNode, refCmp);
						
					} else {
						var fldIdx = defSet.items.indexOf(cmp);
						this.executeAddFieldsField(node, fldIdx);
					}
					
				//not default fields-set	
				} else {
					var fldCt = cmp.ownerCt;
					fldCt.removeAll(true);
					this.executeAddFieldsField(node);
				}
			
			//simple(not grouped) edit widget
			} else {
				var fldIdx = this.items.indexOf(cmp);
				this.remove(cmp, true);
				this.executeAddFieldsField(node, fldIdx);
			}
		},
		/**
		 * label
		 */
		executeUpdateFieldsFieldLabel : function(node, cmp, p, v) {
			cmp.label.update(!Ext.isEmpty(v) ? (v + ':') : v);
		},
		/**
		 * content
		 */
		executeUpdateFieldsFieldContent : function(node, cmp, p, v) {
			this.setFieldContent(node, cmp, v);
		},
		/**
		 * value
		 */
		executeUpdateFieldsFieldValue : function(node, cmp, p, v) {
			this.setFieldValue(cmp, v);
		},
		/**
		 * disabled
		 */
		executeUpdateFieldsFieldDisabled : function(node, cmp, p, v) {
			v == true ? cmp.disable() : cmp.enable();
		},
		/**
		 * height
		 */
		executeUpdateFieldsFieldHeight : function(node, cmp, p, v) {
			cmp.setHeight(v);
		},
		/**
		 * width
		 */
		executeUpdateFieldsFieldWidth : function(node, cmp, p, v) {
			cmp.setWidth(v);
		},
		/**
		 * style
		 */
		executeUpdateFieldsFieldStyle : function(node, cmp, p, v) {
			var stl = cmp.el.getStyles('width', 'height');
			cmp.el.dom.removeAttribute('style', '');
			cmp.el.applyStyles(stl).applyStyles(v);
		},
		/**
		 * state
		 */
		executeUpdateFieldsFieldState : function(node, cmp, p, v) {
			switch (v) {
				case 'editable':
					cmp.enable();
					cmp.setReadOnly(false);
					break;
				case 'readonly':
					cmp.enable();
					cmp.setReadOnly(true);
					break;
				case 'disabled':
					cmp.disable();
					break;
			}
		},
		/**
		 * checked
		 */
		executeUpdateFieldsFieldChecked : function(node, cmp, p, v) {
			if (['checkbox', 'radio'].indexOf(cmp.getXType()) != -1) {
				cmp.setValue(v);
			}
		},
		/**
		 * rich
		 */
		executeUpdateFieldsFieldRich : function(node, cmp, p, v) {
			if (cmp.getXType() == 'textarea') {
				this.executeUpdateFieldsFieldType(node, cmp, p, v);
			}
		}
		
	}
})();

/**
 * Extends base mixin {@link afStudio.wd.ModelReflector} class.
 */
Ext.applyIf(afStudio.wd.edit.EditModelReflector, afStudio.wd.ModelReflector);