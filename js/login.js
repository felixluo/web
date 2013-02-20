(function(window){

function Login(im) {
	this.im = im;
	this.loginDlg = null;
	
	return this;
}

Login.prototype = {
constructor: Login,

// init:
init: function(username){
	var self = this;
	// 创建登录窗口所用的DIV，
	// 并指定DIV的ID = login;
    _c('div', {id: 'login'}, Module.window.body());
	
	// 格式化登录窗口的字符串
	// 指定新创建的窗口类，content属性为var content;
	var content = "";
	content += "<div align='center' style='height:220px;'><img src='"+this.im.fileDir+"/img/skin/icon64.png' /><br /><h4 id='loginTooltip'></h4>";
	content += "<label>帐号：</label><input type='text' style='width:200px;' id='username'/><br /><br />";
	content += "<label>密码：</label><input type='password'style='width:200px;' id='password'/><br /><br />";
	content += "<button data-dojo-type='dijit/form/Button' id='loginBtn'>登录</button>";
	content += "</div>";
	
	// 调用DOJO的Dialog创建函数
	// 指定窗口的title: Mooncake
	//			content: content
	//			style: width:400px;
	this.loginDlg = new Module.Dialog({
		title: "<img src='"+this.im.fileDir+"/img/skin/icons/default16.png' />&nbsp;&nbsp;Uubridge UU",
		content: content,
		style: "width:400px;height:250px;",
        hide: function(){
            // this.inherited('hide', arguments);
				self._Destroy();
            // if (_r('beginBtn')) return _r('beginBtn').set('disabled', false);;
            // if (!_get('beginBtn'))  _c('div', {id: 'beginBtn'}, Module.window.body()); 
		    // var tmpBtn = new dijit.form.Button({
		        // label: "<img src='"+self.im.fileDir+"/img/skin/icons/default16.png' />",
			    // onClick: function(){
				    // self.im.init();
                    // this.disabled = true;
			    // }
		    // }, 'beginBtn');
			window.opener=null;window.open('','_self');window.close();
        }
	}, 'login');// end of new Dialog
	this.loginDlg.show();

	_get('username').value=username;
	_get('username').focus();
	// 绑定登录按钮点击事件
	// 用户点击时，打开主界面
    _for(['loginBtn', 'username', 'password'], function(id){
        var evt = id == 'loginBtn'?'click':'keypress';
        var obj = Module.dom.byId(id);
	    this.im.EventUtil.addEvent(obj, evt, function(evt){
		    return self.onLogin(evt);
	    });// end of addEvent
    });
},// end of init

// onLogin:
//	登录函数
// evt:
//	事件类型
onLogin: function(evt){
	if (evt.type == 'keypress' && evt.keyCode != 13)	return;
	var byId = Module.dom.byId;
    Module["dom-attr"].set(byId('username'), 'readonly', true);
    Module["dom-attr"].set(byId('password'), 'readonly', true);
    if (_r('loginBtn')) _r('loginBtn').set('disabled', true);;
	this.im.login(byId('username').value, byId('password').value, function(){
		byId('loginTooltip').innerHTML = '登录失败';
		byId('loginTooltip').style.background = 'yellow';
        Module["dom-attr"].remove(byId('username'), 'readonly');
        Module["dom-attr"].remove(byId('password'), 'readonly');
        if (_r('loginBtn')) return _r('loginBtn').set('disabled', false);;
	});
},// end of onLogin

// Destroy:
_Destroy: function(){
	if (this.loginDlg) {
//		dijit.byId('loginBtn').destroy();
		this.loginDlg.destroy();
		this.loginDlg = null;
	}
}// end of _Destroy
};window.Login = Login;
})(window);
