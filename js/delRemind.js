(function(window){

function delDlg() {
    this.cb                = null; // 用户回调函数
	this.delDlg  			= null;			
	this.delMsg  			= null;			
	return this;
}

delDlg.prototype = {
constructor: delDlg,

// _init:
init: function(content, cb){
    this.cb = cb;
	if (this.delDlg)	return this.setContent(content);
	
	this.delDlg = new Module.Dialog({
		title: "<img src='//im.uubridge.cn:8028/home/felix/img/skin/icons/default16.png' />&nbsp;&nbsp;UuBridge UU",
        style: 'width: 390px;height: 120px'
	});
    this.delDlg.startup();
	this.delDlg.show();

	var tmpDiv1 = _c('div', {	
		_class: 'del',
		align: 'left'
	}, this.delDlg.domNode);

	var tmpDiv2 = _c('div', {	
		_class: 'delBtn',
		align: 'right'
	}, this.delDlg.domNode);
	
	var self = this;
	var btn = new Module.Button({
		label: '确定',
	    	style: 'margin-top: 5px;margin-right:20px;',
	    	onClick: function(){
            if (!self || !self.cb) return ;
            self.cb(true, function(){
                if (this.delDlg)
                    this.delDlg.hide();
            });
		}
	});
    Module["dom-construct"].place(btn.domNode, tmpDiv2); 
	btn.startup();
	var btnCel = new Module.Button({
		label: '取消',
	    	style: 'margin-top: 5px;margin-right:20px;',
	    	onClick: function(){
            if (!self || !self.cb) return ;
            self.cb(false, function(){
                if (this.delDlg)
                    this.delDlg.hide();
            });
		}
	});
    Module["dom-construct"].place(btnCel.domNode, tmpDiv2); 
	btnCel.startup();

	var imgLogo = _c('img', {
        style: 'margin-right: 20px;margin-top:3px;float:left;',
		src: '//im.uubridge.cn:8028/home/felix/img/skin/error.png'	
	}, tmpDiv1);

    this.divMsg = _c('div', {
        _class: 'text-overflow',
        style: 'font-size: 18px;',
        innerHTML: content        
    }, tmpDiv1);

	_for([tmpDiv1, tmpDiv2, this.divMsg], function(obj){
		var _class = Module["dom-attr"].get(obj, "_class");
		Module["dom-attr"].set(obj, 'class', _class);
		Module["dom-attr"].remove(obj, '_class');
	});
},// end of _init

// _setContent:
// 设置显示的内容
// 并设置回调函数
setContent: function (content){
    if (this.divMsg)
        this.divMsg.innerHTML = content;

    if (this.delDlg)
        this.delDlg.show();
}, // end of _setContent

// _Destroy:
_Destroy: function(){
	if (this.delDlg) {
		this.delDlg.destroy();
		this.delDlg = null;
	}
}// end of _Destroy
};window.delDlg = delDlg;
})(window);
