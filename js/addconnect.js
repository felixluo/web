(function(window) {
function addconnect(net) {
	 this.net=net; 
    this.addDlg = null;
    this.subCb = null;
    this.newArr = new Array;   // 请求对列
}
addconnect.prototype = {
constructor: addconnect,
// initButton:
initButton: function(bReq){
	    var self = this;
	    var btn = new Module.Button({
            label: bReq?'接受':'添加',
	    	style: 'margin-top: 5px;margin-right:20px;',
	    	onClick: function(){
                var id = _r('findID')?_r('findID').get('value'):null;
                var msg = _r('MsgEditor')?_r('MsgEditor').get('value'):'';
                if (self.subCb) 
                    self.subCb(true, id);
                else
                    self.net.subscribe(id, msg);
                self._Destroy();
		    }
	    }, 'delOK');
	    btn.startup();
	    var btnCel = new Module.Button({
            label: bReq?'拒绝':'取消',
	    	style: 'margin-top: 5px;margin-right:20px;',
	    	onClick: function(){
                var id = _r('findID').get('value');
                if (self.subCb && id) self.subCb(false, id);
                self._Destroy();
		    }
	    }, 'delCancel');
	    btnCel.startup();
},// end of _initButton
// _initInput:
initInput: function(div, bReq){
     
    if (bReq) {
        Module["dom-style"].set(div, "height", "30px");
        return _c('div', {
                    //id: '_addReq_',
                    innerHTML: '是否同意该好友请求?'
                }, div);
    }

	if (!_get('_addInput_')) {
        _c("div", {id:'_addInput_'}, div);
	}
	if (!_get('_addInputOK_')) {
        _c("div", {id:'_addInputOK_'}, div);
	}

    var tc = new Module.TableContainer({cols:1}, '_addInput_');
    var tb = new Module.TextBox({label: '请输入用户帐号:', placeHolder: '请输入帐号'});
    tc.addChild(tb);
    tc.startup();
    
    var self = this;
	var btn = new Module.Button({
        label: '查找',
        style: 'width: 70px;',
        onClick: function(){
            var bid = tb.get('value');
            if (!self.net || !bid) return ;
            self.net.findBuddy(bid, function(obj){
                if (!obj)   return ;
                _r('findID').set('value', obj.id);
                _r('findNickname').set('value', obj.nickname);
                _r('findBuzz').set('value', obj.buzz);
                Module['dom-attr'].set(_get('findAva'), 'src', obj.ava);
            });
        }
    }, '_addInputOK_');
    btn.startup();
},// end of _initInput
// _initShow:
initShow: function(div){
	if (!_get('_addShowLabel_')) {
        _c("div", {id:'_addShowLabel_',innerHTML: '对方资料'}, div);
	}

	if (!_get('_addShowAva_')) {
        _c("div", {id:'_addShowAva_',align:'center'}, div);
	}

	if (!_get('_addShowProfile_')) {
        _c("div", {id:'_addShowProfile_',align:'center'}, div);
	}

     _c("img", {
            id: 'findAva',
            width: '48',
            height: '48',
            src: '//im.uubridge.cn:8028/home/felix/img/skin/icon64.png' 
    }, '_addShowAva_');

    var tc = new Module.TableContainer({
        cols:1, 
        spacing: '10px', 
        style: 'height:91px;background-color: white;'
    }, '_addShowProfile_');
    var t1 = new Module.TextBox({id: 'findID',label: '帐号:', readOnly: true});
    var t2 = new Module.TextBox({id: 'findNickname', label: '昵称:',readOnly: true});
    var t3 = new Module.TextBox({id: 'findBuzz', label: '签名:',readOnly: true});
    tc.addChild(t1);
    tc.addChild(t2);
    tc.addChild(t3);
    tc.startup();

    // ie:改变table height:100%
    var table = Module.query('#_addShowProfile_ > table')[0];
	Module["dom-attr"].set(table, 'height', '100%');
               
},// end of _initShow
// _initMsg
initMsg: function(div){
	if (!_get('_addMsgLabel_')) {
        _c("div", {id:'_addMsgLabel_',innerHTML: '附加消息'}, div);
	}

	if (!_get('_msg_')) {
        _c("div", {id:'_msg_', align: 'center'}, div);
	}

    var e = new Module.Editor({
        id: 'MsgEditor',
        plugins: [],
        height: '100%',
        focusOnLoad: true
    }, '_msg_');
},// end of _initMsg

//  _initAddConnectDlg              }
initAddConnectDlg:function(bReq){
        if (this.addDlg)    return this.addDlg.show();
        
        // 需要删除ID号
        _for(['_addInput_', '_addInputOK_','delOK',
            'delCancel','_addShowProfile_', '_msg_', 
            'MsgEditor', 'findID', 'findNickname', 'findBuzz'], function(id){
                if (_r(id))
                    _r(id).destroy();
        });

	    if (!_get('_addDlg_')) {
            _c("div", {id:'_addDlg_'}, Module.window.body());
	    }
        var self=this;
        var style="position:absolute;top:0px;left:340px;width:400px;height:370px;";
        this.addDlg = new Module.FloatingPane({
            /* title:"<img src='//im.uubridge.cn:8028/home/felix/img/skin/icons/default16.png'> Uubridge UU", */
			title: "Uubridge UU",
            style: style,
            dockable: true,
            content: '<div id="_addContent_"></div>',
            close: function(){
                this.inherited("close", arguments);
                self.addDlg = null;
            }
        }, '_addDlg_');
        this.addDlg.startup();
        this.addDlg.show();
        this.addDlg.bringToTop();
        this.net._HidePaneScroll(this.addDlg);

        var div1 = _c('div', {
            _class: 'divInput',
            align: 'center'
        }, _get('_addContent_'));

        var div2 = _c('div', {
            _class: 'divProfile'
        }, _get('_addContent_'));

        var div3 = _c('div', {
            _class: 'divMsg'
        }, _get('_addContent_'));

	    var div4 = _c('div', {	
		    _class: '_add_btn_',
		    align: 'right',
		    innerHTML: '<div id="delOK"></div><div id="delCancel"></div>'
	    }, _get('_addContent_'));
        
        this.initInput(div1, bReq);
        this.initShow(div2);
        this.initMsg(div3);
        this.initButton(bReq);

	    _for([div1, div2, div3, div4], function(obj){
		    var _class = Module["dom-attr"].get(obj, "_class");
		    Module["dom-attr"].set(obj, 'class', _class);
		    Module["dom-attr"].remove(obj, '_class');
	    });
},
_Destroy:function()
{
    _for(['_addInput_', '_addInputOK_','delOK',
            'delCancel','_addShowProfile_', '_msg_', 
            'MsgEditor', 'findID', 'findNickname', 'findBuzz'], function(id){
        if (_r(id))
            _r(id).destroy();
    });
    if (this.addDlg) {
        this.addDlg.destroy();
        this.addDlg = null;
    }
    this.subCb = null;

    this.initRequestAddDlg();
},
// _newBuddy:
//      有新的好友请求
newBuddy: function(obj){
   this.newArr.push(obj);
   if (!this.addDlg)
       this.initRequestAddDlg();
},// end of _newBuddy
initRequestAddDlg:function(){
        if (this.newArr.length <= 0)   return ;
        var obj = this.newArr.shift();

        this.initAddConnectDlg(true);  // 显示确认对话框

        _r('findID').set('value', obj.id);
        _r('findNickname').set('value', obj.nickname);
        _r('findBuzz').set('value', obj.buzz);
        _r('MsgEditor').set('value', obj.msg);
        _r('MsgEditor').set('disabled', true);
        Module['dom-attr'].set(_get('findAva'), 'src', obj.ava);
        this.subCb = obj.cb;
}
}
window.addconnect = addconnect;
})(window);

