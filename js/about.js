(function(window){

function About(Dialog) {
	this.AboutDlg  			= null;			
	this.companyName 		= '上海世优信息科技有限公司';	
	this.companyLink 		= 'http://www.uubridge.net' ;
	this.version			= '1.2.2';
	return this;
}

About.prototype = {
constructor: About,

// _init:
init: function(){
	if (this.AboutDlg)	return this.AboutDlg.show();
	
	this.AboutDlg = new Module.Dialog({
		title: "<img src='//im.uubridge.cn:8028/home/felix/img/skin/icons/default16.png' />&nbsp;&nbsp;UuBridge UU",
        style: 'width: 390px;height: 270px'
	});
	this.AboutDlg.show();

	var tmpDiv1 = _c('div', {	// 显示上半部的DIV
		_class: 'about',
		align: 'center'
	}, this.AboutDlg.domNode);

	var tmpDiv2 = _c('div', {	// 显示确认按钮的DIV
		_class: 'aboutBtn',
		align: 'center',
		innerHTML: '<div id="aboutBtn"></div>'
	}, this.AboutDlg.domNode);
	
	var tmpDiv3 = _c('div', {	// 显示LOGO的DIV
		_class: 'aboutLogo',
		align: 'center'
	}, tmpDiv1);

	var tmpDiv3_1 = _c('div', {	// 显示LOGO的DIV(左边)
		_class: 'aboutLogoL',
		align: 'right'
	}, tmpDiv3);

	var tmpDiv3_2 = _c('div', {	// 显示LOGO的DIV(右边)
		_class: 'aboutLogoR',
		align: 'right',
		innerHTML: '<br/><label>UuBridge UU</label></br/>version '+this.version
	}, tmpDiv3);
	
	var tmpDiv4 = _c('div', {	// 显示公司地址的DIV
		_class: 'aboutAddr',
		align: 'center',
		innerHTML: '@ 2012 '+this.companyName+'<br/>'
	}, tmpDiv1);

	var self = this;
	var btn = new Module.Button({
		label: '确定',
	    	style: 'margin-top: 5px;width: 100px;',
	    	onClick: function(){
			if (self && self.AboutDlg)
				self.AboutDlg.hide();
		}
	}, 'aboutBtn');
	btn.startup();

	var imgLogo = _c('img', {	// 公司LOGO图片
		src: '//im.uubridge.cn:8028/home/felix/img/skin/icon64.png'	
	}, tmpDiv3_1);

	var a	     = _c('a', 	 {	// 公司链接地址
		href: 	   this.companyLink,
		target:	   '_blank',
		innerHTML: this.companyLink
	}, tmpDiv4);

	_for([tmpDiv1, tmpDiv2, tmpDiv3,tmpDiv3_1, tmpDiv3_2, tmpDiv4], function(obj){
		var _class = Module["dom-attr"].get(obj, "_class");
		Module["dom-attr"].set(obj, 'class', _class);
		Module["dom-attr"].remove(obj, '_class');
	});
},// end of _init

// _Destroy:
_Destroy: function(){
	if (this.AboutDlg) {
		this.AboutDlg.destroy();
		this.AboutDlg = null;
	}
}// end of _Destroy
};window.About = About;
})(window);
