(function(window){

function webIM(){
	this.modules = [
		"dojo/ready",
		"dojo/_base/unload",
		"dojo/dom",
		"dijit/Dialog", 
        "dojo/_base/array",
        "dojo/dom-construct",
		"dojo/dom-class",
		"dojo/dom-prop",
		"dojo/_base/window",
        "dojo/dom-attr",
		"dojox/layout/FloatingPane", 
		"dijit/registry", 
		"dojo/on", 
		"dijit/form/Button",
        "dojo/dom-style",
		"dojo/json", 
		"dojo/string", 
        "dojo/query",	
		"dojo/_base/config", 
		"dijit/layout/BorderContainer", 
		"dijit/layout/AccordionContainer", 
		"dijit/layout/AccordionPane", 
		"dijit/MenuBar", 
		"dijit/PopupMenuBarItem", 
		"dijit/Menu", 
		"dijit/MenuItem", 
		"dijit/MenuSeparator", 
		"dijit/DropDownMenu",
		"dijit/form/DropDownButton", 
		"dijit/layout/ContentPane", 
		"dijit/TitlePane", 
		"dijit/layout/TabContainer",
		"dojox/layout/TableContainer",
		"dojox/layout/ExpandoPane",
		"dojo/fx/easing",
		"dojox/fx/text",
		"dijit/Toolbar",
		"dijit/form/ToggleButton",
		"dijit/form/TextBox",
		"dijit/form/Textarea",
		"dijit/TooltipDialog",
		"dijit/popup",
		"dijit/form/ComboBox",
		"dijit/form/ComboButton",
		"dojo/store/Memory",
		"dojo/dnd/move",
		"dijit/Editor",
		"dojo/_base/declare",
		"dijit/_editor/_Plugin",
		"dojo/_base/fx",
		"dojo/has",
		"dojo/sniff",
		"dojox/editor/plugins/AutoUrlLink",
		"dijit/_editor/plugins/EnterKeyHandling",
        "dojox/encoding/digests/MD5",
        "dojox/encoding/crypto/SimpleAES",
        "dojox/date/buddhist/Date",
		"dojo/dom-geometry",
        "dijit/InlineEditBox",
		"dijit/form/DateTextBox",
		"dijit/_editor/plugins/FontChoice",
		"dijit/_editor/plugins/TextColor",
		"dojox/widget/MonthAndYearlyCalendar",
		"dijit/Tree",
		"dijit/tree/ObjectStoreModel",
		"dijit/layout/SplitContainer",
		"dojo/keys",
		"dojo/mouse",
		"dojox/grid/DataGrid",
		"dojo/date/stamp",
		"dojo/date/locale",
		"dojo/_base/lang",
		"dojo/data/ItemFileWriteStore",
		"dojox/layout/GridContainer",
		"dijit/Tooltip",
		"dojo/parser"
	];
	
	return this;
}

webIM.prototype = {
	constructor: webIM,
	
	init: function(){
		var self = this;
		require(self.modules, function(){
                var len = arguments.length;
                for(var i=0;i<len;i++) {
                    var mName = self.modules[i];   // 模块名称，字符串中最后一位字符 
                    var tmp = mName.split("/").pop();
					self[tmp] = arguments[i];
                }
				
				self.ready(function(){			
					try { 
						im.init(); 
					}catch (e){
						console.log("im init: " + e );
					}
				});
				
				self.unload.addOnWindowUnload(function(){
					im.closeMain();
				});
			});
	},
	
	loadBegin: function() {
		var self = this;
		//显示等待UI
		var loader = self.dom.byId("loader");
		if ( loader ) {
			self.domattr.set('loader','style','display:block;');
		}	
	},

	loadEnd: function() {
		var self = this;
		//加载完毕，显示界面
		var loader = self.dom.byId("loader");
		if ( loader ) {
			setTimeout(function(){
				self.fx.fadeOut({ node: loader, duration: 500, onEnd: function(){ loader.style.display = "none"; }}).play();
			}, 500);
		}	
	}
};

window.Module = new webIM;
window.Module.init();

})(window);
