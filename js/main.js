(function(window) {

function IM() {
	// user indefine
	this.loginDlg = null;	// 登录对话框
	this.mainDlg  = null;	// 主界面对话框
	this.stateButton = null;// 状态按钮
	this.selBuddyID = '';		// 已选中的好友ID
	this.chatDlg  = null;	// 聊天窗口

	// user data
	this.myself = null;		// 个人信息结构体,采用对象模式
	this.EventUtil= null;	// 事件驱动
	this.ModifyDlg = null;			// 昵称的点击弹出窗口
	this.AboutDlg  = null;			// 关于对话框
    this.delDlg    = null;          // 删除提示窗口
	this.MainTitlePane = null;		// 我的好友分组标题栏
	this.buddyTooltipDlg = null;		// 好友资料提示框.	
	this.username = "";

	// 网络接口
	this.NetIO	= null;				// mck网络接口
	this.buddyStore = null;			// 搜索框数据
	this.buddyList  = null;			// 好友列表
	this.fileDir = '//im.uubridge.cn:8028/im';			// 文件目录
	this.titleTimer = null;

   	this.addBuddy = null;
    this.pRightMenu = null;    // 右键菜单
    this.personInfo = null;
	this.historyrecord=null;
	return this;
}

IM.prototype = {
constructor: IM,

init: function() {		// init函数开始
    globle();           // 在此函数定义全局对象
	/*显示登录对话框*/
    var self=this;
	if (!this.EventUtil) {		
		this.InitEvent();
	}
	if (!this.NetIO) {
		this.NetIO = new window.NetIO(this);
	}	
		
	this.NetIO.init(true);
	document.body.onfocus = function(){
		self.cancelTitleByNewMsg();
	};
},// end of init
showLoginDialog: function(){
	var self = this;
	if (!self.loginDlg)
		self.loginDlg = new window.Login(self);
	this.loginDlg.init(self.username?self.username:(self.myself ? self.myself.id: ''));
	this.username = "";
	this.myself = null;
},// end of showLoginDialog


// InitEvent:
// 			初始化事件驱动
// 			支持跨浏览器
InitEvent: function() {
	this.EventUtil= new Object();	// 事件驱动
	//oTarget：目标；sEventType：事件名称；funName：事件触发的函数名；
	this.EventUtil.addEvent=function(oTarget,sEventType,funName){
        if (Module && Module.on)
		    Module.on(oTarget, sEventType, funName);
	};
}, // end of InitEvent


// login:
//	登录函数
// username:
//	用户昵称
// password:
//	密码
// cb:
//	如果登录失败，则回调该函数
login: function(username, password, cb){
	var self = this;
	
	if (!this.NetIO)	this.init();
	this.NetIO.login(username, password, function(result, onBack){
		if (result != 'ok') {
			return cb.call(self.loginDlg, result);
		}
		self.username = username;
		
		// 隐藏登录窗口，如果主界面存在，则显示，
		self.loginDlg._Destroy();
		self.loginDlg = null;
		self.initMainDlg();
		onBack();	// 当界面初始化后，开始和服务器通信
	});
	
},// end of login

// onEndProfile:
//	用户好友资料拉取成功
onEndProfile: function(){
	/* if (!this.BuddyStore)	this.BuddyStore = new Module.Memory();
	if (this.buddyList && this.buddyList.length > 0) {
		this.BuddyStore.setData(this.buddyList);
		this.search.set('store', this.BuddyStore);
	} */
},// end of onEndProfile
getArchiveMsg: function(fname) {
    this.NetIO.getArchiveMsg(fname);
},
onMsg: function(fname, data){
    this.historyrecord.onMsg(fname,data);
},
// initMainDlg:
//			主界面初始化函数
initMainDlg: function(){
	if (this.mainDlg) return this.mainDlg.show();

	if (!_get('IMMain')) {
        _c("div", {id:'IMMain'}, Module.window.body());
	}
	
	var self = this;
	var style = "position:absolute;top:0px;left:0px;width:254px;";
	style += "height:594px;overflow:hidden;";
	this.mainDlg = new Module.FloatingPane({
		/* title: "<img src='"+this.fileDir+"/img/skin/icons/default16.png' />&nbsp;&nbsp;Uubridge UU", */
		title: "Uubridge UU",
		resizable: true,
		style: style,
		id: "IMMain",
		maxable: true,
		resize:function(dim){
            if (!dim)   return ;
			this.inherited("resize", arguments);
			if (!_get('tab')) return ;
			//dijit.byId("tab").domNode.style.display = 'block';
			_get('tab').style.height = (this.domNode.style.height.split("px")[0] - 142) + 'px';
			if (self.MainTitlePane)
				self.MainTitlePane.set('style', 'width:100%;height:100%;overflow-y:auto;');
		},// end of resize
		close:function(){
			this.inherited("close", arguments);
			self.mainDlg = null;
			self.closeMain();
		}// end of destroyRecursive
	}, "IMMain");
	this.mainDlg.startup();
	this._HidePaneScroll(this.mainDlg);
	this.mainDlg._resizeHandle.minSize = {w:250, h:250};
	this.mainDlg.show(function(){
		// 初始化界面
		self.InitMeun();
		self.InitMainDlgContent();
		self.InitStateButton();
		self.InitBuddyTab();
        self.InitBuddyRight();
        // 使主界面不能双击选择
    //    Module['dom-attr'].set(_get('IMMain'), 'onselectstart', 'return false;');
	});
},// end of initMainDlg

// HidePaneScroll:
//	隐藏floatingpane滚动条
//	需在startup之后调用
// pane:
//	floatingPane对象
_HidePaneScroll: function (pane) {
	if (pane.containerNode)
		pane.containerNode.style.overflow = 'hidden';
	if (pane.canvas)
		pane.canvas.style.overflow = 'hidden';
},// end of _HidePaneScroll

// onUpdateProfile:
//		更新个人信息
onUpdateProfile: function(obj){
	var byId = function(id){return _get(id);};

	// 更新数据
	if (this.myself) {
		this.myself.sign = obj.sign;
		this.myself.nickname = obj.nickname;
		if (obj.ava)	this.myself.ava = obj.ava;
	} else {
		this.myself = obj;
	}

	byId('mySelfAvatar').src = this.myself.ava;
    _r('mySelfSign').set('value', this.myself.sign);
	byId('mySelfNickname').innerHTML = byId('mySelfNickname').title  = this.myself.nickname?this.myself.nickname:'编辑昵称...';
	// 初始化聊天窗口
	if (!this.chatDlg) {
		if (!(this.chatDlg = new window._Chat(this))) return ;
		this.chatDlg._init();
	}
	this.chatDlg._onUpdateProfile(this.myself);
},// end of _onUpdateProfile

InitSearchBox: function (){
	var self = this;
	
	self.buddyStore = new Module.Memory({});
	
	var sb = new Module.ComboBox({
		searchAttr: 'searchAttr',
		placeHolder: '搜索联系人...',
		title: '搜索联系人',
		style: 'width:100%;margin:2px 0 0 0;',
		queryExpr: '*${0}*',
		store: self.buddyStore,
		highlightMatch: "all",
		forceWidth: true,
		ignoreCase: true,
		autoComplete: false,
		maxHeight: -1,
		labelAttr: "label",
        labelType: "html",
		onChange: function(newValue) {
			if (newValue == '') return;
			
			for(var i = 0; i < self.buddyStore.data.length; i++){
				var nameValue = self.buddyStore.data[i].name;
				var idValue = self.buddyStore.data[i].id;
				if( newValue.indexOf(nameValue) != -1 || newValue.indexOf(idValue) != -1 )
					self.OpenChatWnd(idValue);
			}
		}
	},'mySearchBox');
	
	Module["dom-class"].add('mySearchBox',"mySearchBox");
	sb.startup();
},

// InitMainDlgContent:
//			初始化主界面需要的内容
//			在initMainDlg调用
InitMainDlgContent: function(){

	var self = this;
	var personInfo = new Module.ContentPane({
		id:'person',
		content:'person'
	});
	personInfo.startup();
	this.mainDlg.addChild(personInfo);
	
	var domhtml= "";
	domhtml+=	'<div id="mySearchBar" class="mySearchBar">';
	domhtml+=		'<div id="mySearchBox"></div>';
	domhtml+=		'<div id="mySearchButton" class="mySearchButton" title="搜索..."></div>';
	domhtml+=	'</div>';
	var search = new Module.ContentPane({
		content:domhtml
	});
	search.startup();
	this.mainDlg.addChild(search);
	var tab = new Module.ContentPane({
		id:'tab'
	});
	tab.startup();
	this.mainDlg.addChild(tab);
	this.InitSearchBox();
	/* this.search = new Module.ComboBox({
		searchAttr: 'nickname',
		placeHolder: '搜索联系人',
		tooltip: '搜索联系人',
		style: 'width:100%;height:15px;margin-top:3px;',
		onChange: function(newValue) {
			if (newValue == '') return;
			var len = self.buddyList.length;
			while(len > 0) {
				if (self.buddyList[--len].nickname == newValue)
					return self.OpenChatWnd(self.buddyList[len].id); 
			}
		}
	}, 'search_box'); */
	
	/*个人信息*/
	var person      = _c('div');
	var img 		= _c('img', {
                            _class: 'boxDisShadow',
                            title: '修改头像',
                            id: 'mySelfAvatar',
                            width: '48',
                            height: '48'
                        }, person);	// 个人头像
	var statusBtn 	= _c('div', {id: 'statusBtn'}, person);// 更改状态按钮
	var nickname 	= _c('div',{_class: 'nickname text-overflow'}, person);// 个人昵称
	var label 		= _c('label',{id:'mySelfNickname'}, nickname);
	var sign 		= _c('div',{_class:'sign text-overflow'}, person);// 个人签名
	var label_sign 	= _c('div', {id: 'mySelfSign',_class: 'text-overflow'}, sign);

	/*初始化复制CLASS，不支持IE，需改成setAttr*/
	_for([img, nickname, sign, label_sign], function(obj){
		var _class = Module["dom-attr"].get(obj, "_class");
		Module["dom-attr"].set(obj, 'class', _class);
		Module["dom-attr"].remove(obj, '_class');
	});
	personInfo.set('content', person.innerHTML);

    var se = new Module.InlineEditBox({
        noValueIndicator: '编辑个性签名...',
        style: 'line-height:24px;margin-left:10px;',
        onChange: function(val){
            if (self.myself.sign != val)
			    self.NetIO.setSign.call(self.NetIO, val);
        }
    },'mySelfSign');
    se.startup();
	/*add img shadow mouse event*/
	this.EventUtil.addEvent(_get('mySelfAvatar'), "mouseover", function(){
        Module["dom-attr"].set('mySelfAvatar', 'class', 'boxShadow');
	});
	this.EventUtil.addEvent(Module.query('#mySelfAvatar')[0], "mouseout", function(){
        Module["dom-attr"].set('mySelfAvatar', 'class', 'boxDisShadow');
	});
	this.EventUtil.addEvent(Module.query('#mySelfAvatar')[0], "click", function(){
	});
	/*end add img shadow mouse event*/
},// end of InitMainDlgContent

// InitBuddyTab:
//			初始化好友列表控件
//			在initMainDlg调用
InitBuddyTab:function(){
    this.MainTitlePane = new Module.TitlePane({
		title: "我的好友"
	});
	this.mainDlg.getChildren()[3].addChild(this.MainTitlePane);
    this.MainTitlePane.set("open", true);
},// end of InitBuddyTab

// onChangeBuddyStatus:
//	当好友改变状态时，调用该函数
onChangeBuddyStatus: function(uid, tmpStatus, blink) {
    var src = this.fileDir+'/img/skin/status/'+this.getStatusImg(blink, tmpStatus);
    if (_get('status'+uid)){
        Module["dom-attr"].set('status'+uid, 'src', src);
		Module["dom-attr"].set('status'+uid, 'status', tmpStatus);
	}	

    var child = this.MainTitlePane.getChildren();
    var arr = Module.array.filter(child, function(item){
        return item && (item.get('bdyID') == uid); 
    });
    if (arr.length > 0) {
        //if (tmpStatus == 'offline')
        //    Module["dom-construct"].place(arr[0].domNode, child[child.length-1].domNode, 'after');
        //else
            this.setItemPos(arr[0], uid);
    }
},// end of _onChangeBuddyStatus

// onDelBuddy:
//	删除好友
// bid:
//	好友ID
// cb:
//	成功删除好友回调函数，
//	作用域改为this,
//	参数为删除的好友对象
onDelBuddy: function(bid, cb) {
	var self = this;
    var arr = Module.array.filter(this.MainTitlePane.getChildren(), function(item){
        return item && (item.get('bdyID') == bid); 
    });

    _for(arr, function(obj){
		return (self.MainTitlePane.removeChild(obj) && cb && cb.call(self, obj));
    });

	for (var i = 0;i < this.buddyList.length;i++) 
		if (this.buddyList[i].id == bid)
	        return this.buddyList.splice(i, 1);
},// end of onDelBuddy

// getStatusImg:
//      获取状态图片路径
getStatusImg: function(blink, tmpStatus) {
	var img= '';	// 好友状态的图片路径
	if (blink)	
		img += 'message.gif';
	else if	(!tmpStatus)
		img += 'online.png';
	else if (tmpStatus == 'invisible')
		img += 'offline.png';
	else
		img += tmpStatus+'.png';
    return img;
},// end of getStatusImg

getStatusText: function(status) {
	var text = "";
	switch (status) {
	case "invisible":
	case "offline":
		text = "离线";
		break;
	case "chat":
		text = "空闲";
		break;
	case "away":
		text = "离开";
		break;
	case "busy":
		text = "忙碌";
		break;
	case "dnd":
		text = "勿扰";
		break;	
	case "online":
		text = "在线";
		break;
	default:
		break;
	}
	return text;
},

// onAddBuddy:
//	在界面中添加好友
// bdyObj:
//	每个好友的类
// blink:
//	提示是否闪动
onAddBuddy: function(bdyObj, blink) {
	if (!bdyObj)	return ;
	if (!this.buddyList)	this.buddyList = new Array;	
	this.buddyList.push(bdyObj);
	var self = this;

    var img = this.getStatusImg(blink, bdyObj.status);

	var fri = "";
        fri += "<div class='buddy' bdyID='"+bdyObj.id+"' id='buddy_"+bdyObj.id;
	    fri += "' onmouseover='im.ChangeBuddyListState(this, false);'";
	    fri += "onmouseout='im.ChangeBuddyListState(this, true);' ";
	    fri += " onClick='im.clkBuddy(this);' ondblclick='im.OpenChatWnd(\""+bdyObj.id+"\");'>";	// 好友DIV事件多，需要分行写
        fri += "<img id='avatar"+bdyObj.id+"' src='"+bdyObj.ava+"' height='44' width='44' />";
        fri += "<div style='margin-left:5px; float:left;'></div>";
        fri += "<div  class='nickname text-overflow'>";
        fri += "<img id='status"+bdyObj.id+"' status='"+bdyObj.status+"' src='"+this.fileDir+"/img/skin/status/"+img+"' style='margin-left: 10px;margin-top: 5px;'/>";
        fri += "<label>"+bdyObj.nickname+"</label>"
        fri += "</div>";
        fri += "<div class='text-overflow' title='"+bdyObj.sign+"'>";
        fri += "<label style='margin-left: 10px;'>"+bdyObj.sign+"</label>";
        fri += "</div></div>";

	var content = new Module.ContentPane({
		bdyID: bdyObj.id
	});
	content.set('content', fri);
	Module['dom-attr'].set(content.domNode, 'onselectstart', 'return false;');
	this.MainTitlePane.addChild(content);
	this.setItemPos(content, bdyObj.id);
    if (this.pRightMenu) {
        this.pRightMenu.bindDomNode(_get('buddy_'+bdyObj.id));
    }
	
	new Module.Tooltip({
		connectId: ["avatar"+bdyObj.id],
		position: ["before","after"],
		getContent: function(matchedNode){
			var str = "",
				item = matchedNode.parentNode,
				labelList = Module.query("label",item),
				avaSrc =  matchedNode.getAttribute("src"),
				nickname =  Module["dom-prop"].get(labelList[0],"innerHTML"),
				buzz = Module["dom-prop"].get(labelList[1],"innerHTML"),
				status = Module.dom.byId("status"+bdyObj.id).getAttribute("status"),
				state = self.getStatusText(status);
			str += "<div class='buddy_Panel'>";
			str += " <img class='buddy_Avatar' src='"+avaSrc+"'>";
			str += " <div class='buddy_Info'>";
			str += "     <div class='buddy_Nick'>"+nickname+"</div>";
			str += "	 <div class='buddy_Divide'></div>";
			str += "	 <div class='buddy_state'>"+state+"</div>";
			str += " </div>";
			str += " <div class='buddy_Service'>";
			str += "	 <div class='buddy_Divide'></div>";
			str += "     <div class='buddy_Signature'>"+buzz+"</div>";
			str += " </div>";
			str += "</div>";
			return str;
		}
	});
},// end of onAddBuddy

storeMemory: function(data){
	var template =  "";
	template += '<div class="listItem">';
	template += 	'<img src="${avatar}" class="listAvatar"/>';
	template += 	'<div class="listText">${nickname}(${uid})</div>';
	template += '</div>';
		
	var buddyData = new Object({
			id:data.uid,
			searchAttr:data.profile.nickname+"("+data.uid+")",
			name:data.profile.nickname,
			label:Module.string.substitute(template, {
					avatar: data.avatar,
					nickname: data.profile.nickname,
					uid: data.uid})
	});
	
	this.buddyStore.put(buddyData);
},

// setItemPos:
//	改变好友列表位置
// item:
//	div
// uid:
//	好友的ID
setItemPos: function(item, uid) {
	var self = this;
	var buddyList = this.MainTitlePane.getChildren();
	
	for ( var i = 0; i < buddyList.length; i++ ){
		var id = buddyList[i].get('bdyID');
		if (id == uid) continue ;
		if (self.NetIO.cmpBuddy(uid, id)>0){
			Module["dom-construct"].place(item.domNode, buddyList[i].domNode, 'before');
			return;
		}
	}
	
	Module["dom-construct"].place(item.domNode, buddyList[buddyList.length-1].domNode, 'after');
}, // end of setItemPos

// getDisplayAvatar:
// 	获取好友头像
// id:
//	好友ID
_getDisplayAvatar: function(bid) {
    return this.NetIO.getDisplayAvatar(bid);
},// end of _getDisplayAvatar

// onCmd:
//	好友发出的CMD命令
//	需要打开聊天窗口
onCmd: function(bid, msg, ts,isBmyself) {
	if ( !isBmyself && -1 != msg.indexOf("openTrade") ) {//对方发的openTrade指令
		this.OpenChatWnd(bid,true);
	}else{
		this.OpenChatWnd(bid);
	}
	
	this.showTitleByNewMsg(bid, isBmyself);
	return this.chatDlg && this.chatDlg._onCmd.apply(this.chatDlg, arguments); 
},// end of onCmd

// isOnline
// 	判断好友是否在线
_isOnline: function(bid) {
	return this.NetIO.isOnline(bid);
},// end of _isOnline

// startStream
// 	开始语音视频聊天
startStream: function(portal) {
	return  this.chatDlg && 
            this.chatDlg.chatVideo && 
            this.chatDlg.chatVideo._startStream.apply(this.chatDlg.chatVideo, arguments);
},// end of isOnline

// onAddUnreadMsg:
// 	读取未读消息
// bid:
//	好友的ID
// msg:
//	发送的消息
onAddUnreadMsg: function(bid, msg, ts, bIsMyself) {
    this.showTitleByNewMsg(bid,bIsMyself);
	return this.chatDlg && this.chatDlg._onAddUnreadMsg.apply(this.chatDlg, arguments);
},// end of onAddUnreadMsg

// showTitleByNewMsg:
// 	显示标题滚动，当有新消息来时
showTitleByNewMsg: function(bid,bIsMyself){
	this.cancelTitleByNewMsg();
    if(bIsMyself) return;

	var str = this._getDisplayName(bid)+'发来新的消息';
	var strArray = str.split('');
	var c_A = "★",c_B = "☆", showA = true;
	
	this.titleTimer = setInterval(function(){
		document.title = (showA ? c_A : c_B)+strArray.join('');
		showA = !showA;
		strArray.shift();
		if (strArray.length <= 0)
			strArray = str.split('');
	}, 500);
	var self = this;
	Module.window.body().onmousemove = function(evt){
		self.cancelTitleByNewMsg();
		Module.window.body().onmousemove = null;
	};
},// end of showTitleByNewMssplayNameg

// cancelTitleByNewMsg:
//	取消标题滚动,当读取新消息后
cancelTitleByNewMsg: function(){
	if (this.titleTimer) {
		clearInterval(this.titleTimer);
		this.titleTimer = null;
	}
	document.title = 'UU';
},// end of cancelTitleByNewMsg

// isGroup:
//	判断是否是群
isGroup: function(id) {
	return this.NetIO && this.NetIO.isGroup(id)
},// end of isGroup

// onAddUnreadiGroupMsg:
// 	读取群未读消息
// bid:
//	好友的ID
// gid:
//	群ID
// msg:
//	发送的消息
onAddUnreadGroupMsg: function(bid,gid,msg,ts,bIsMyself) {
    this.showTitleByNewMsg(gid,bIsMyself);
	return this.chatDlg && this.chatDlg._onAddUnreadGroupMsg.apply(this.chatDlg, arguments);
},// end of onAddUnreadGroupMsg

// _getDisplayName:
//	获取昵称
_getDisplayName: function(bid) {
	return this.NetIO.getDisplayName(bid);
},// end of get DisplayName

// findBuddy:
//      查找好友
findBuddy: function(bid, cb) {
    return this.NetIO && this.NetIO.findBuddy(bid, cb);
},// end of findBuddy

// newBuddy
//      好友请求
newBuddy: function() {
    if (!this.addBuddy)
        this.addBuddy = new window.addconnect(this);
    return this.addBuddy.newBuddy.apply(this.addBuddy, arguments);
},// end of newBuddy

// subscribe
//      添加好友
subscribe: function(bid, msg) {
    return bid && this.NetIO && this.NetIO.subscribe.apply(this.NetIO, arguments);            
},// end of subscribe

// InitMeun:
//			初始化主界面菜单
//			在initMainDlg调用
InitMeun: function (){

	var self = this;
	/* meun init */
	var pMenuBar = new Module.MenuBar({});

	var pSubMenu = new Module.DropDownMenu({});
	pSubMenu.addChild(new Module.MenuItem({
		label: "注销",
		onClick: function () {
			self.closeMain();
		}
	}));
	pSubMenu.addChild(new Module.MenuItem({
		label: "退出",
		onClick: function (){
			self.closeMain();
		}
	}));
	pMenuBar.addChild(new Module.PopupMenuBarItem({
		label: "文件",
		popup: pSubMenu
	}));

	var pSubMenu2 = new Module.DropDownMenu({});
	pSubMenu2.addChild(new Module.MenuItem({
		label: "添加联系人",
		iconClass: "ditorIcon dijitEditorIconCut",
		onClick: function (){
            if (!self.addBuddy)
			    self.addBuddy = new window.addconnect(self);
			self.addBuddy.initAddConnectDlg(false);
		}
	}));
	pMenuBar.addChild(new Module.PopupMenuBarItem({
		label: "编辑",
		popup: pSubMenu2
	}));

	var pSubMenu3 = new Module.DropDownMenu({});
	pSubMenu3.addChild(new Module.MenuItem({
		label: "个人资料",
		iconClass: "ditorIcon dijitEditorIconCut",
        onClick: function(){
			return;
            if (!self.personInfo)
                self.personInfo = new window.PersonInfo(self);
            self.personInfo._initPersonInfoDlg(false, self.myself.id, function(profile){
                if (profile)
                    self.NetIO.putProfile();
            });
        }
	}));
	pSubMenu3.addChild(new Module.MenuItem({
		label: "修改密码",
		iconClass: "ditorIcon dijitEditorIconCut"
	}));
	pMenuBar.addChild(new Module.PopupMenuBarItem({
		label: "工具",
		popup: pSubMenu3
	}));

	var pSubMenu4 = new Module.DropDownMenu({});
	pSubMenu4.addChild(new Module.MenuItem({
		label: "关于",
		iconClass: "ditorIcon dijitEditorIconCut",
		onClick: function(){
			(self.AboutDlg?	self.AboutDlg:
					self.AboutDlg = (new window.About())).init();
		}
	}));
	pMenuBar.addChild(new Module.PopupMenuBarItem({
		label: "帮助",
		popup: pSubMenu4
	}));
	this.mainDlg.addChild(pMenuBar);
	pMenuBar.startup();
	/* end meun init */
},// end of InitMeun

// InitBuddyRight:
//      init右键菜单
InitBuddyRight: function(){
    var self = this;
    this.pRightMenu = new Module.Menu({});
    this.pRightMenu.addChild(new Module.MenuItem({
        label: '发送即时消息',
        onClick: function(){
            var target = this.getParent().currentTarget;
            var id = Module["dom-attr"].get(target, 'bdyID');
            self.OpenChatWnd(id);
        }
    }));
    this.pRightMenu.addChild(new Module.MenuItem({
        label: '开始视频会话',
        onClick: function(){
            var target = this.getParent().currentTarget;
            var id = Module["dom-attr"].get(target, 'bdyID');
            self.OpenChatWnd(id);
            return self.chatDlg && self.chatDlg._requestVideo(id);
        }
    }));
    this.pRightMenu.addChild(new Module.MenuItem({
        label: '开始语音会话',
        onClick: function(){
            var target = this.getParent().currentTarget;
            var id = Module["dom-attr"].get(target, 'bdyID');
            self.OpenChatWnd(id);
            return self.chatDlg && self.chatDlg._requestVideo(id);
        }
    }));
    this.pRightMenu.addChild(new Module.MenuSeparator());
    this.pRightMenu.addChild(new Module.MenuItem({
        label: '消息记录',
        onClick: function(){
		 if (!self.historyrecord)
                self.historyrecord = new window.HistoryRecord(self);
				    var target = this.getParent().currentTarget;
				 var id = Module["dom-attr"].get(target, 'bdyID');
				 	
            self.historyrecord._initHistoryRecordDlg(id,self.myself.id);
		}
    }));
    this.pRightMenu.addChild(new Module.MenuItem({
        label: '查看资料',
        onClick: function(){
            if (!self.personInfo)
                self.personInfo = new window.PersonInfo(self);
            var target = this.getParent().currentTarget;
            var id = Module["dom-attr"].get(target, 'bdyID');
            self.personInfo._initPersonInfoDlg(true, id);
        }
    }));
    this.pRightMenu.addChild(new Module.MenuSeparator());
    this.pRightMenu.addChild(new Module.MenuItem({
        label: '删除好友',
        onClick: function(){
            var target = this.getParent().currentTarget;
            var id = Module["dom-attr"].get(target, 'bdyID');
            self.clkDelBuddy(id);
            //return self.NetIO && self.NetIO.delBuddy(id);
        }
    }));
    this.pRightMenu.startup();
    
    // 监听在哪个元素打开菜单
    var self = this;
    this.pRightMenu.watch("focused", function(){
        var newTarget = this.currentTarget;
        if (!newTarget)    return ;
        var id = Module["dom-attr"].get(newTarget, 'bdyID');
        var arr = this.getChildren();
        arr.splice(0, 1);
        arr.splice(3, 2);
        _for(arr, function(o){
            if (o)
                o.set('disabled', self.isGroup(id));    
        }); 
    });
},// end of InitBuddyRight

// clkDelBuddy:
//      当用户点击删除时，调用
clkDelBuddy: function(id){
    var self = this;
    if (!self.delDlg)
        self.delDlg = new window.delDlg();
            
    var delMsg = '是否删除 "${buddy}" 好友?';
    delMsg = Module.string.substitute(delMsg, {buddy: self._getDisplayName(id)});
    self.delDlg.init(delMsg, function(b, cb){
        if (b)
            self.NetIO.delBuddy(id);
        cb.apply(self.delDlg);
    });
              
},// end of clkDelBuddy

// InitStateButton:
// 			初始化个人信息区的选择当前状态按钮
//			需要从网络层来传递状态
//			在initMainDlg调用
InitStateButton: function (){
    var self = this;
    var menu = new Module.DropDownMenu({ style: "display: none;"});
    var menuItem1 = new Module.MenuItem({
        label: "<img src='"+this.fileDir+"/img/skin/status/online.png'/>&nbsp;&nbsp;我在线上",
        onClick: function(){
		    self.NetIO.setStatus('online'); 
//		    self.stateButton.set("label", "<img src='"+self.fileDir+"/img/skin/status/online.png'/>"); 
	    }
    });
    menu.addChild(menuItem1);

    var menuItem2 = new Module.MenuItem({
        label: "<img src='"+this.fileDir+"/img/skin/status/chat.png'/>&nbsp;&nbsp;空闲",
        onClick: function(){ 
		    self.NetIO.setStatus('chat'); 
//		    self.stateButton.set("label", "<img src='"+self.fileDir+"/img/skin/status/chat.png'/>"); 
	    }
    });
    menu.addChild(menuItem2);

    var menuItem3 = new Module.MenuItem({
        label: "<img src='"+this.fileDir+"/img/skin/status/away.png'/>&nbsp;&nbsp;离开",
        onClick: function(){ 
		    self.NetIO.setStatus('away'); 
//		    self.stateButton.set("label", "<img src='"+self.fileDir+"/img/skin/status/away.png'/>"); 
	    }
    });
    menu.addChild(menuItem3);

    var menuItem4 = new Module.MenuItem({
        label: "<img src='"+this.fileDir+"/img/skin/status/busy.png'/>&nbsp;&nbsp;忙碌",
        onClick: function(){ 
		    self.NetIO.setStatus('busy'); 
//		    self.stateButton.set("label", "<img src='"+self.fileDir+"/img/skin/status/busy.png'/>"); 
	    }
    });
    menu.addChild(menuItem4);

    var menuItem5 = new Module.MenuItem({
        label: "<img src='"+this.fileDir+"/img/skin/status/dnd.png'/>&nbsp;&nbsp;请勿打扰",
        onClick: function(){ 
		    self.NetIO.setStatus('dnd'); 
//		    self.stateButton.set("label", "<img src='"+self.fileDir+"/img/skin/status/dnd.png'/>"); 
	    }
    });
    menu.addChild(menuItem5);

    var menuItem6 = new Module.MenuItem({
        label: "<img src='"+this.fileDir+"/img/skin/status/invisible.png'/>&nbsp;&nbsp;隐身",
        onClick: function(){ 
		    self.NetIO.setStatus('invisible'); 
//		    self.stateButton.set("label", "<img src='"+self.fileDir+"/img/skin/status/invisible.png'/>"); 
	    }
    });
    menu.addChild(menuItem6);

    var menuItem7 = new Module.MenuItem({
        label: "<img src='"+this.fileDir+"/img/skin/status/offline.png'/>&nbsp;&nbsp;离线",
        onClick: function(){ 
//	        self.closeMain();
			self.NetIO.setStatus('offline'); 
//			self.stateButton.set("label", "<img src='"+self.fileDir+"/img/skin/status/offline.png'/>"); 
//			self.showAllOffline();
	    }
    });
    menu.addChild(menuItem7);

    this.stateButton = new Module.DropDownButton({
        label: "<img src='"+this.fileDir+"/img/skin/status/offline.png' />",
        dropDown: menu
    });// end of new DropDownButton
    _get("statusBtn").appendChild(this.stateButton.domNode);
	
},// end of new InitStateButton

// ChangeBuddyListState:
//			当鼠标在好友列表时的DIV状态
//			在mouseover和mouseout事件中调用
ChangeBuddyListState: function(obj, bIsOut){
	var self = this;
	if (obj.id == this.selBuddyID)	return obj.style.backgroundColor = '#FDEAA6';
	if (bIsOut) {
		obj.style.backgroundColor = "#ffffff";
	} else {
		obj.style.backgroundColor = "#C1E1F6";
	}
},// end of ChangeBuddyListState

// clkBuddy:
//			单击好友事件
//			先擦除之前好友DIV的背景颜色
//			记住当前选中的好友ID,使该好友的DIV处于不同的背景颜色
clkBuddy: function(obj){
	if (this.selBuddyID != '')
        if (_get(this.selBuddyID))
		    _get(this.selBuddyID).style.backgroundColor = '#ffffff';
	this.selBuddyID = obj.id;
	obj.style.backgroundColor = '#FDEAA6';
},// end of clkBuddy

// OpenChatWnd:
//			打开聊天窗口
//			在好友列表双击事件中调用
//			从其他方面传来数据，并打开聊天窗口
OpenChatWnd: function(bid,bUpdate){
	var self = this;
	if (this.chatDlg) {
		if ( this.chatDlg.isTabOpened(bid) ) {
			if ( bUpdate ) {
				this.NetIO.getTrades(bid);
			}		
			this.chatDlg.selectTabChild(bid);
		}else {
			this.chatDlg._OpenChatWnd(bid,function(){
				self.NetIO.showMsg(bid);			
				self.cancelTitleByNewMsg();
			});
		
			this.NetIO.getTrades(bid);
		}	
	}	
},// end of OpenChatWnd

// getProfile
//      获取好友资料
getProfile: function(bid) {
    return this.NetIO.getProfile(bid);
},// end of getProfile

// getAccount
//      获取好友的ID号
getAccount: function(id) {
    return this.NetIO.getCodeForHash(id);            
},// end of getAccount

// sendMsg:
// 			发送消息
// bid:
// 			对方的ID
// msg:
// 			发送的消息
_sendMsg: function() {
	this.NetIO.sendMsg.apply(this.NetIO, arguments);
},// end of _sendMsg
getArchiveList: function(uid) {
 
    return this.NetIO.getArchiveList(uid);
},
onMsgList:function(msglist){
    this.historyrecord.onMsgList(msglist);
},
showAllOffline: function(){
	var src = this.fileDir+'/img/skin/status/'+this.getStatusImg(false, 'offline');
	var buddyList = this.MainTitlePane.getChildren();
	_for(buddyList,function(item){
		var id = item.get("bdyID");
	//	console.log(id);
		Module["dom-attr"].set('status'+id, 'src', src);
	});
},

// closeMain:
//			关闭主界面
//			在主界面中，点击‘注销’和‘退出’时调用该函数
//			点击主界面关闭按钮时，也调用该函数
closeMain: function (){
    this.cancelTitleByNewMsg();
    _for(['mySearchBox', 'person', 'tab', 'login'], function(id){
        if (_r(id))
            _r(id).destroy();
    });
    _for([this.AboutDlg, this.delDlg, this.chatDlg, 
            this.addBuddy, this.personInfo,this.historyrecord
        ], function(obj){
        if (obj)
            obj._Destroy(false);     // false 只用在chatDlg中
        obj = null;
    });
	if (this.mainDlg){
		this.mainDlg.destroy();
		this.mainDlg = null;
	}
	if (this.NetIO)	
		this.NetIO.stop();
	this.NetIO = null;
	this.stateButton = null;
	this.buddyList = null;
	this.selBuddyID = '';		// 已选中的好友ID
	(this.NetIO = new window.NetIO(this)).init(false);
}// end of closeMain

};// end of prototype
window.im = new IM();
})(window);

function globle(){
    window._c = window.Module["dom-construct"].create;
    window._r = window.Module.registry.byId;
    window._for = window.Module.array.forEach;
    window._get = window.Module.dom.byId;
    
    var fp = window.Module.FloatingPane.prototype;
    fp.oldPostCreate = fp.postCreate;
    fp.postCreate = function(){
            this.oldPostCreate();
			new Module.move.constrainedMoveable(this.domNode,{
		        handle:this.focusNode,
		        constraints:function(){
                    return {l:0,t:0}; 
				},   
				within:true
			});   
    };
};
