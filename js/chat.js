var Chat = window;

(function(Chat) {

function _Chat(_mainDlg) {
	this.Menu 				= null;
	this.MenuItem 				= null;
	this.ContentPane 			= null;
	this.TabContainer 			= null;
	this.FloatingPane 			= null;
	this.isEnterSend			= true;

	this.chatVideo				= null;// 视频窗口
	this.chatTab  = null;	// 聊天窗口TAB
	this.chatDlg  = null;	// chat dialog
	
	this.shakeFlag = false;	// shake
	var idOfTipTimeout = 0;
	
	// user data
	this.myself = new Object();		// 个人信息结构体,采用对象模式
	this.HistroyDlg = null;		// 历史记录窗口
	
	this._MainDlg				= _mainDlg;
	
	this._chatBdy				= new Array;
	return this;
}

_Chat.prototype = {
constructor: _Chat,

_init: function() {		// init函数开始
	this.Menu 				= dijit.Menu;
	this.MenuItem 				= dijit.MenuItem;
	this.ContentPane 			= dijit.layout.ContentPane;
	this.TabContainer 			= dijit.layout.TabContainer;
	this.FloatingPane 			= dojox.layout.FloatingPane;
},// end of init

statusMap: {
	'new':["开始交易","未开始","交谈后,点击【开始交易】,表示开始接受卖家的服务"],
	'open':["完成交易","进行中","结束时,点击【完成交易】,对卖家的服务表示认可"],
	'close':["评 价","已成功",""]
},

// initChatDlg:
//			聊天窗口的初始化
initChatDlg: function(){
	if (this.chatDlg)
	{
		this.chatDlg.show();
		this.chatDlg.bringToTop();
		return;
	}
	// 创建聊天窗口的DIV
	if (!Module.dom.byId("IMChat")) 
	{
		var chat = Module["dom-construct"].create('div',{id:'IMChat'},document.body);
		// chat.id = 'IMChat';
		// chat.style.backgroundColor = "#C1E1F6";
		// document.body.appendChild(chat);
	}// end of if

	// 创建聊天窗口的TAB控件
	if (!Module.dom.byId("chatTab"))
	{
		var tab = Module["dom-construct"].create('div',{id:'chatTab'},'IMChat');
		// tab.id = 'chatTab';
		// document.getElementById('IMChat').appendChild(tab);
	}// end of if
	
	var self = this;
	var style = "position:absolute;top:0;left:270px;width:517px;height:484px;visibility:visible;overflow:hidden";
	this.chatDlg = new Module.FloatingPane({
		/* title: "<img src='"+this._MainDlg.fileDir+"/img/skin/icons/default16.png' />&nbsp;&nbsp;Uubridge UU", */
		title: "Uubridge UU",
		resizable: true,
		docked: true,
		style: style,
		id: "IMChat",
		maxable: true,
		resize:function(dim){
			this.inherited("resize", arguments);
			self._resizeChatDlg();
		},// end of resize_event
		close:function(){
		//	this.inherited("close", arguments);
			self._Destroy(false);
		}// end of destroyRecursive
	}, dojo.byId("IMChat"));// end of new FloatingPane
	
	this.chatDlg.domNode.className='chatTab';
	this.chatDlg.startup();
	this.chatDlg.show();
	this.chatDlg.bringToTop();
	this._MainDlg._HidePaneScroll(this.chatDlg);
	this.chatDlg._resizeHandle.minSize.w = 300;
	this.chatDlg._resizeHandle.minSize.h = 300;
},// end of initChatDlg

// _onUpdateProfile:
//		更新个人信息
_onUpdateProfile: function(obj){
	this.myself = obj;
},// end of _onUpdateProfile

// _onAddUnreadMsg:
// 	读取未读消息
_onAddUnreadMsg: function(bid, msg,date,bisMyself) {
//	if (bid == this.myself.id)	return true;
	if (this._IsOpenedChatWnd(bid,false)) {
		return 	this._onShowChatMsg(bid,null, msg,date, bisMyself);	// 如果聊天窗口已经打开，则显示该消息;
	}
	return false;
},// end of _onAddUnreadMsg

// _onAddUnreadGroupMsg:
// 	读取未读群消息
_onAddUnreadGroupMsg: function(bid,groupid, msg,date,bisMyself) {
//	if (bid == this.myself.id)	return true;
	if (this._IsOpenedChatWnd(groupid,true)) {
		return 	this._onShowChatMsg(bid,groupid, msg,date, bisMyself);	// 如果聊天窗口已经打开，则显示该消息;
	}
	return false;
},// end of _onAddUnreadGroupMsg

// OpenChatWnd:
//			打开聊天窗口
//			在好友列表双击事件中调用
//			从其他方面传来数据，并打开聊天窗口
_OpenChatWnd: function(bid, cb){
	if (bid == this.myself.id) return;
	this.initChatDlg();
	this._OpenChatTabByUserID(bid);
	this.chatDlg.show(cb);
	//this.NetIO._showMsg(bid);
},// end of OpenChatWnd

// _IsOpenedChatWnd:
//	判断该好友的聊天窗口是否已打开
_IsOpenedChatWnd: function(id,isGroup) {
	return (dijit.byId(id) && Module.dom.byId('peerEditor'+id));
},// end of _IsOpenedChatWnd

isTabOpened: function(id) {
	// 循环每个TAB控件的ID，
	// 如果有相同的，则不再添加新的contentPane
	// 并且显示该ID的CONTENTPANE
	if ( this.chatTab ) {
		for (var i = 0; i < this.chatTab.getChildren().length; ++i) {
			var tmpID = this.chatTab.getChildren()[i].id;
			if (tmpID == id) {
				return true;
			}	
		};
	}
	return false;
},

selectTabChild: function (id) {
	if ( this.chatTab ) {
		this.chatTab.selectChild(id);
		var _div = Module.dom.byId('chatTab_tablist_'+id).parentNode;
		Module["dom-attr"].set(_div,'style', '');
	}	
},

//_OpenChatTabByUserID:
//			打开聊天窗口并显示与该好友的聊天窗口
//id:
//			某个好友的ID
_OpenChatTabByUserID: function(id) {
	if (id == this.myself.id) return; 
	
	var self = this;
	var isGroup = this._MainDlg.isGroup(id);
	// 创建一个TabContainer,并赋值给this.buddyTab
	if (!this.chatTab)
	{
		this.chatTab = new this.TabContainer({
	        	style: "height: 100%; width: 100%;overflow:hidden;",
	//			tabPosition: "left-h",
	        	onClose: function(){
               		// confirm() returns true or false, so return that.
               			return true;
            		}
		}, "chatTab");// end of new TabContainer
	}	
	
	if ( this.isTabOpened(id) ) {
		this.selectTabChild(id);
		return;
	}

	this._chatBdy.push(id);


	// 创建一个面板ContentPane
	var bClosable = (this.chatTab.getChildren().length >= 1);

	var cp = new Module.ContentPane({
	id: id, 
	title: self._MainDlg._getDisplayName(id),
	closable: true,
	layoutAlign: "left",
	onClose: function(){
			var bselected = (this == self.chatTab.selectedChildWidget);
			if ( !bselected ) return true;
			
			var index = self.chatTab.getIndexOfChild(this);
			var len = self.chatTab.getChildren().length;	
			if ( len == 1 )
			{
				self._Destroy(false);
				return false;
			}
			
			if ( index < len - 1 )
			{	
				var tempId = self.chatTab.getChildren()[index+1].id;
				self.chatTab.selectChild(tempId);
			}
			else
			{
				var tempId = self.chatTab.getChildren()[index-1].id;
				self.chatTab.selectChild(tempId);
			}
		   return true;
		}// end of onClose
	});// end of new ContentPane
		
	cp.startup();
	this.chatTab.addChild(cp);
	
	var bc = new Module.BorderContainer({
		gutters:false,
		liveSplitters:false,
		id:"borderContainer"+id
	});
	cp.addChild(bc);
	
	var cp1 = new Module.ContentPane({
		region:"top",
		splitter:false,
		id:"toolContent"+id
	});
		
	var cp2 = new Module.ContentPane({
		id:"chatContent"+id,
		splitter:false,
		region:"center"
	});
	
	if ( !isGroup ) {
		var cp3 = new Module.ExpandoPane({
			id:"tradeContent"+id,	
			splitter:true,
			startExpanded: false,
			tradesEmpty: true,
			easeIn:Module.easing.backIn,
			easeOut:Module.easing.bounceOut,
			duration: 1000,
			title:"当前交易",
			region:"trailing",
			style:'width:200px;background:white;'
		});
	}
	
	var cp4 = new Module.ContentPane({
		id:"cmdContent"+id,	
		splitter:false,
		region:"bottom",
		style:'height:30px;'
	});
		
	var ct1 = "";
	ct1 += 	"<div class='toolbar' id='toolbar"+id+"'></div>";
	
	var ct2 = "";
	ct2 += 	"<div class='tipbar_hide' tipExist='false' id='tipbar"+id+"'></div>";
	ct2 += 	"<div class='peerEditor' id='peerEditor"+id+"'>";
	ct2 +=  	'<div class="chatlist clearfix">';
	ct2 +=			'<ul class="listbox" id="msgList'+id+'"></ul>';
	ct2 +=		'</div>';
	ct2 +=	"</div>";
	ct2 += 	"<div class='selfEditor' id='selfEditor"+id+"'></div>";
	
	var ct3 = "";
	ct3 += '<div class="trade_Panel" id="trade_Panel'+id+'">';
	ct3 += 	 '<div class="trade_Title" id="trade_Title'+id+'"></div>';
	ct3 += 	 '<div class="trade_Bottom" id="trade_Bottom'+id+'"></div>';
	ct3 += '</div>';	
	
	var ct4 = "";
	ct4 += 	"<div class='sendPanel' align='right' id='sendDivID"+id+"'></div>";
	
	cp1.set("content",ct1);
	cp1.startup();
	cp2.set("content",ct2);
	cp2.startup();
	if ( !isGroup ) {
		cp3.set("content",ct3);
		cp3.startup();
	}	
	cp4.set("content",ct4);
	cp4.startup();
	
	
	bc.addChild(cp1);
	bc.addChild(cp2);	
	if ( !isGroup )
		bc.addChild(cp3);	
	bc.addChild(cp4);	
		
	//显示交易数据
	if ( !isGroup )
		this.addTradeData(id);
	
	// 添加到TAB控件中
	// 并打开TAB
	this._InitChatDlgToolbar(id);
	this._initEditor(id);
	// 初始化两个按钮
	// close and send
	this._InitChatBtn(id);
	this.chatTab.startup();

	// 调用初始化聊天窗口的工具栏
	// 并选中当前的好友聊天TAB子控件
	this.chatTab.selectChild(id);

	var _div = Module.dom.byId('chatTab_tablist_'+id).parentNode;
	this._MainDlg.EventUtil.addEvent(_div, 'click', function(){
		Module["dom-attr"].set(_div,'style', '');
	});
	
	this._onShowSystemMsg(id,"<a href='http://im.uubridge.cn:8028/pub/UUSetup.exe'target='_blank'>保障服务质量,请使用友友桥桌面版!</a>","info",false,null);
},//end of _OpenChatTabByUserID

addTradeData: function (id) {
	// create a new GridContainer:
    var gridContainer = new Module.GridContainer({
        nbZones: 1,
        opacity: .5,
        hasResizableColumns: false,
        allowAutoScroll: false,
        withHandles: true,
		liveResizeColumns:false,
        dragHandleClass: 'dijitTitlePaneTitle',
        style: {width:'100%'},
        acceptTypes: ['Portlet'],
        isOffset: true
    },'trade_Panel'+id);
	Module["dom-class"].add('trade_Panel'+id,"trade_Panel");
	
	var title = [	
		{label:"reserve",name:"我的预约",content:"<div id='reserveList"+id+"' style='overflow:auto;'></div>"},
		{label:"service",name:"我的服务",content:"<div id='serviceList"+id+"' style='overflow:auto;'></div>"}
	];
	
	for (var i=0; i<title.length; i++) {
		// create a new Portlet:
		var portlet = new Module.TitlePane({
			id: title[i].label+id,
			closable: false,
			dndType: 'Portlet',
			title: title[i].name,
			content: title[i].content
		});
		
		// add the Portlet to the GridContainer:
		gridContainer.addChild(portlet);
	}
	
	// startup GridContainer:
	gridContainer.startup();
},

clearTrades: function (id) {
	var reserveList = Module.dom.byId("reserveList"+id);
	var serviceList = Module.dom.byId("serviceList"+id);	
	var buyArr = Module.query(".trade_Item",reserveList);
	var sellArr = Module.query(".trade_Item",serviceList);
	
	Module.array.forEach(buyArr,function(item){
		Module["dom-construct"].destroy(item);
	});
	
	Module.array.forEach(sellArr,function(item){
		Module["dom-construct"].destroy(item);
	});
},

addTrade: function (trade,id,isbuyer) {
	var self = this;
	var template = "";
	template += '<div class="trade_Item">';
	template += 	'<p class="trade_name">${name}</p>';
	template +=		'<p class="trade_id"><strong>编号:</strong> ${tid}</p>';
	template +=		'<p class="trade_price"><strong>价格:</strong> <strong><font color="#FF6600">${price}</font></strong>智慧豆/次</p>';
	template +=		'<p class="trade_time"><strong>时间:</strong> ${time}</p>';	
	template +=		'<div class="trade_state" status=${status}>';
	template +=			'<p class="trade_status"><strong>状态:</strong> <font color="red">${state}</font></p>';
	template +=			'<button data-dojo-type="dijit/form/Button" class="trade_btn" type="button">${statemap}</button>';
	template +=		'</div>';
	template += '</div>';
	
	var date = new Date(trade.date);
	var fmt = "yyyy-MM-dd hh:mm";
	trade.date = Module.locale.format( date, {selector:"date", datePattern:fmt } );
	var arr = this.statusMap[trade.status];
	//插入trade信息条目
	var str = Module.string.substitute(template, {
				name: trade.name,
				tid: trade.tid,
				price: trade.price,
				time: trade.date,
				status: trade.status,
				statemap: arr[0],
				state: arr[1]
			});
	var item = Module["dom-construct"].toDom(str);
	Module["dom-attr"].set(item,'bdyID',trade.tid);
	
	if ( isbuyer ){
		Module["dom-construct"].place(item, "reserveList"+id);
	}else{	
		Module["dom-construct"].destroy(Module.query(".trade_btn",item)[0]);
		Module["dom-construct"].place(item, "serviceList"+id);
	}
		
	new Module.Tooltip({
		connectId: [Module.query(".trade_name",item)[0]],
		label: trade.desc
	});
	
	var btn = Module.query(".trade_btn",item)[0];
	if ( btn ) {
		Module["dom-attr"].set(btn,"title",arr[2]);
		Module.on(btn,"click",function(evt){
			var obj = evt.srcElement ? evt.srcElement : evt.target;
			var stateDom = obj.parentNode;
			var tid = Module["dom-attr"].get(stateDom.parentNode,'bdyID');
			var status = Module["dom-attr"].get(stateDom,'status');
			
			if ( 'new' == status )
				self._MainDlg.NetIO.openTrade(id,tid);
			else if ( 'open' == status )
				self._MainDlg.NetIO.closeTrade(id,tid);
		});
	}
},

checkTrade: function (trade,id,isbuyer) {
	var reserveList = Module.dom.byId("reserveList"+id);
	var serviceList = Module.dom.byId("serviceList"+id);	
	var buyArr = Module.query(".trade_Item",reserveList);
	var sellArr = Module.query(".trade_Item",serviceList);
	var ret;
	
	if ( isbuyer ) {
		ret = Module.array.some(buyArr,function(item){
			var tid = Module["dom-attr"].get(item,"bdyID");
			if ( tid == trade.tid ) {
				return true;//trade exist
			}
		});
	}else{
		ret = Module.array.some(sellArr,function(item){
			var tid = Module["dom-attr"].get(item,"bdyID");
			if ( tid == trade.tid ) {
				return true;//trade not exist
			}
		});
	}	
	
	return ret;
},

showTrades: function (trades,id){
	var self = this;
	
	var buyLen = trades.buy.length;
	var sellLen = trades.sell.length;
	var isBlank = (buyLen+sellLen)>0 ? false: true;
	
	var cp = Module.registry.byId("tradeContent"+id);
	if ( !cp ) return;
	
	var isTradesEmpty = cp.get("tradesEmpty");

	if ( isTradesEmpty != isBlank ) {
		cp.defer(function(){
			cp.toggle();
		},0);
		cp.set("tradesEmpty",isBlank);
	}
	
	if ( isBlank ){	
		return;
	}
	
	if ( isTradesEmpty ) {//空列表无需check
		for ( var i=0; i<buyLen+sellLen ; i++ ) {
			var isbuyer = (i<buyLen);
			var data = isbuyer ? trades.buy[i] : trades.sell[i-buyLen];	
			
			this.addTrade(data,id,isbuyer);
		}
	}else{
		for ( var i=0; i<buyLen+sellLen ; i++ ) {
			var isbuyer = (i<buyLen);
			var data = isbuyer ? trades.buy[i] : trades.sell[i-buyLen];	
			//check 列表
			var ret = this.checkTrade(data,id,isbuyer);
			if ( false == ret ) {//trade not exist
				this.addTrade(data,id,isbuyer);
			}
		}
	}	
},

// _InitChatBtn:
// 			初始化聊天窗口的按钮
// id:
// 			聊天人的ID号
_InitChatBtn: function(id) {
	var self = this;
	var buttonClose = new dijit.form.Button({
    	label: "关闭", 
    	onClick: function (){
		// 删除该ID的DOJO控件
			var widget = self.chatTab.selectedChildWidget;
    		self.chatTab.removeChild(widget);
			widget.destroy();
    	
			if (0 == self.chatTab.getChildren().length)
			{// 判断TAB是否只有一个
				self._Destroy(false);
			}
    	}
   	});// end of new button
    
	var menu = new this.Menu({ style: "display: none;"});
	var menuItem1 = new this.MenuItem({
	label: "按enter键发送",
	onClick: function(){ 
			self.isEnterSend = true;
			menuItem2.set("iconClass","dijitNoIcon");
			menuItem1.set("iconClass","btnIconCheck");
		}
	});
	menu.addChild(menuItem1);

	var menuItem2 = new this.MenuItem({
	label: "按ctrl+enter键发送",
	onClick: function(){ 
			self.isEnterSend = false;
			menuItem1.set("iconClass","dijitNoIcon");
			menuItem2.set("iconClass","btnIconCheck");
		}
	});
	menu.addChild(menuItem2);		
	menuItem1.set("iconClass","btnIconCheck");	
		
    var button1 = new dijit.form.ComboButton({
//	var button1 = new dijit.form.Button({
		label: "发送",
		dropDown: menu,
		onClick: function(){
			dijit.registry.byId('selfEditor'+id).sendMsg(id);
		}
    });
	button1.placeAt(dojo.byId('sendDivID'+id));
	buttonClose.placeAt(dojo.byId('sendDivID'+id));	
		
},// end of _InitChatBtn

// _checkBeforeSend:
//
// id:			聊天人的ID
//
_checkBeforeSend:function(value)
{
	// check if value is null
	if ( value == '' || value == '<br />' ) return false;
	
	return true;
},	

// _sendMsg:
// 			发送消息
// bid:
// 			对方的ID
// msg:
// 			发送的消息
_sendMsg: function(bid, msg) {
	this._MainDlg._sendMsg(bid, 'chat', msg);
},// end of _sendMsg

// _onShowChatMsg:
//		在聊天窗口显示消息
_onShowChatMsg: function(bid, groupid, msg, date,bIsMyself) {
	
	var id = groupid ? groupid : bid;
	
	var pattern = /(<a\s+[^>]+)(>)/ig,
		fmmsg = '';
	
	// 格式化MSG，使link重新打开新链接
	if ( typeof msg == 'string'  )
	{
		fmmsg = msg.replace(pattern,"$1 target='_blank' $2");
	}	
	
	var color = bIsMyself?'#008000':'#0000ff';
	var name = this._MainDlg._getDisplayName(bIsMyself?this.myself.id:bid);
	var avatar = this._MainDlg._getDisplayAvatar(bIsMyself?this.myself.id:bid);

	var _tmp = '';
	_tmp += '<div class="chatArea">';
	_tmp += '	<img class="chatAvatar" src="' + avatar + '">';
	_tmp += '	<td style="float:left;padding-right:5px;">';
	_tmp += '		<div class="chatNick" style="color:'+color+'";>'+name+'&nbsp;&nbsp;'+date+'</div>';
	_tmp += '		<div class="chatMsg">'+fmmsg+'</div>';
	_tmp += '	</td>';
	_tmp += '</div>';
	
	
	/* var template = "";
	template +=	'<li class="msgListItem">';
	template +=		'<div class="msgAvatar">';
	template +=			'<img src="${avatar}"></img>';
	template +=		'</div>';
	template +=		'<div class="msgContent clearfix">';
	template +=			'<div class="container-top"></div>';
	template +=			'<div class="${triangle}">&nbsp</div>';	
	template +=			'<div class="container-center ${bgcolor}">';
	template +=				'<div class="title-box">';
	template +=					'<span class="msgTime">${date}</span>';
	template +=				'</div>';
	template +=				'<div class="content-box clearfix">';
	template +=					'<span class="msgChat">${msg}</span>';
	template +=	  			'</div>';
	template +=			'</div>';
	template +=			'<div class="container-bottom"></div>';	
	template +=		'</div>';
	template +=	'</li>';
	
	var str = Module.string.substitute(template, {
		triangle: bIsMyself ? "triangle-send" : "triangle-recv",
		bgcolor: bIsMyself ? "sendBgcolor": "recvBgcolor",
		date: date,
		avatar: avatar,
		msg: fmmsg
	}); */
	
//	var div = Module["dom-construct"].toDom(str);
	
	var div = Module["dom-construct"].toDom(_tmp);
		
	if (this.chatTab == null) return false;
	if (this.chatTab.selectedChildWidget.id != id) {
		dojo.byId('chatTab_tablist_'+id).parentNode.setAttribute('style', 'background-color:#FDEAA6');
	}
	var _t = dojo.byId('msgList'+id);
	var _e = Module.dom.byId("peerEditor"+id);
	
	Module["dom-construct"].place(div,_t);
	_e.scrollTop = _e.scrollHeight;
		
	if (this.chatDlg._isDocked)
	{
		var self = this;
        var dockNode = this.chatDlg._dockNode.domNode;
		dockNode.setAttribute('title',id+':\n\n'+fmmsg);

		var flicker = function()
		{
			if (!self.chatDlg._isDocked) return;
					  
			if ( dockNode.className == 'dojoxDockNodeActive' )
			{
				Module.fx.fadeIn({ node: dockNode, duration: 400, onEnd: function(){ dockNode.className = "dojoxDockNode"; }}).play();
			}
			else
			{
				Module.fx.fadeIn({ node: dockNode, duration: 400, onEnd: function(){ dockNode.className = "dojoxDockNodeActive"; }}).play();
			}
			setTimeout(flicker,800);
		};
		flicker();
	}

	return true;
},// end of _onShowChatMsg

/*
 *function: show Info message
 *param: 
 	msg: the message to show
 **/
_onShowInfoMsg: function(bid, groupid, msg, date,bIsMyself,type)
{
	var imgSrc = this._MainDlg.fileDir+"/img/skin/"+type+".png";
	var fmtmsg = '<img style="float:left;" src="'+imgSrc+'">' + msg;
	this._onShowChatMsg(bid, groupid, fmtmsg, date,bIsMyself);
},

/*
 *function: show system message
 *param: 
 	msg: the message to show
 **/	
_onShowSystemMsg: function(id,msg,type,bAutoDisapear,exHtml)
{
	var tipNode = Module.dom.byId('tipbar'+id);
	var editorNode = Module.dom.byId('peerEditor'+id);
	if ( !tipNode || !editorNode )	return false;
	var self = this;

	if ( Module["dom-attr"].get(tipNode,"tipExist") == 'false' )
	{
		Module["dom-attr"].set(tipNode,"tipExist",'true');
		tipNode.className = 'tipbar';
		this._resizePeerEditor(id);
	}
	else
	{
		return false;
	}	

	var content = '';
	var imgSrc = this._MainDlg.fileDir+"/img/skin/"+type+".png";
	var html = '<button data-dojo-type="dijit/form/Button" id="tipBtnClose'+id+'" class="tipBtnClose"></button>';

	switch(type)
	{
	case 'info': 
	case 'error':
		content += '<img class="tipIcon" src="'+imgSrc+'">';
		content += '<label class="tipText">'+msg+'</label>';
		content += exHtml ? exHtml : html;
		break;
	default:
		break;
	}
	tipNode.innerHTML = content;
	
	var btnCloseNode = dojo.byId('tipBtnClose'+id);

	if ( btnCloseNode )
	{
		btnCloseNode.onclick = function(){
			if ( Module["dom-attr"].get(tipNode,"tipExist") == 'true' )
			{
				self._onDestroyTooltipDlg(id);
			}
		}
	}

	if (bAutoDisapear)
	{
		this.idOfTipTimeout = setTimeout(function(){
			btnCloseNode.onclick();
		},3000);
	}
	return true;
},	


// _InitChatDlgToolbar:
// 				初始化聊天窗口的工具栏
// id:
// 				用户唯一标识
_InitChatDlgToolbar: function(id){
	var isGroup = this._MainDlg.isGroup(id);
	var self = this;
	// 初始化toolbar
    	var toolbar = new dijit.Toolbar({style:"height:31px;"}, 'toolbar'+id);
    	dojo.forEach(["video", "voice" , /*"file",*/ "complaint"/* ,"share" */], function(label) {
	    if (isGroup)
	    {//群bar的判断
		    if ( label != "share"  ) return;
	    }
            var button = new dijit.form.Button({
                // note: should always specify a label, for accessibility reasons.
                // Just set showLabel=false if you don't want it to be displayed normally
                label: "<img src='"+self._MainDlg.fileDir+"/img/skin/tool/"+label+".png' />",
				title: self._GetLang(label),
                showLabel: true,
		        onClick: function(){
			    self._CheckReq(label, id);
		}
            });// end of new Button
            toolbar.addChild(button);
    	});// end of forEach
    
},// end of _InitChatDlgToolbar

//初始化编辑框
_initEditor: function(id){
	var self = this;
	var isGroup = this._MainDlg.isGroup(id);
	
	dojo.forEach([/*"font",*/ "face",/* "handwrite",*/ "shake", /*"screenshot", "picture", "clear", */"history"],
		function(label) 
		{
			dojo.declare("My"+label+"Plugin",
						Module._Plugin,
						{
							buttonClass: Module.Button,
							useDefaultCommand: false,
			
							_initButton: function(){
								this.command = label;
								this.editor.commands[this.command] = self._GetLang(label); // note: should be localized
								this.iconClassPrefix = "customIcon";
								this.inherited(arguments);
								delete this.command; // kludge so setEditor doesn't make the button invisible
								this.connect(this.button, "onClick", this.clickHandle);
							},
							
							// You can also use localization here.
							getLabel: function(){
								return this.editor.commands[label];
							},
			
							destroy: function(f){
								this.inherited(arguments);
							},
			
							clickHandle: function(){
								self._CheckReq(label,id);
							}
						}
					);
				
			/* the following code registers my plugin */
			dojo.subscribe(dijit._scopeName + ".Editor.getPlugin",null,function(o)
			{
				if(o.plugin){ return; }
				if(o.args.name == "My"+label+"Plugin")
				{
						o.plugin = new (eval(o.args.name))({});
				}
			});	
		});//end of forEach
	
	// 输入框
		var nodeEnter = 'BR',
			defVal = '';
		if (Module.has('ff'))
		{
			nodeEnter = 'DIV';
			defVal = '<br>';
		}
		else if (Module.has('chrome'))
		{
			defVal = '<br>';
		}
		
		var _editor = new dijit.Editor({
		plugins: ['bold', 'italic', 'underline',{name:'dijit/_editor/plugins/EnterKeyHandling',blockNodeForEnter:nodeEnter}],
		extraPlugins:['autourllink','foreColor', 'hiliteColor', 'MyfacePlugin', (isGroup?'autourllink':'MyshakePlugin'),'MyhistoryPlugin'],
		focusOnLoad: true,
		disableSpellCheck: true,
		height: '100%',
		sendMsg: function(bid){
			var _val = this.get('value');
			var bRet = self._checkBeforeSend(_val);

			if (bRet) {
				self._sendMsg(bid, _val);
				this.defer(function(){
					this.set('value',defVal);
					this.focus();
				},50);
			}	
		},// end of sendMsg
		onKeyPress: function(evt){
			if (evt.keyCode != Module.keys.ENTER)	return ;
			
			//enter
			if (self.isEnterSend) {
				if (evt.ctrlKey) {
					this.execCommand('inserthtml', defVal);
				} else{
			//		console.log("enter send");
					this.sendMsg(id);
				}
			} else{
			//ctrl + enter
				if (evt.ctrlKey)
				{
			//		console.log("ctrl+enter send");
					this.sendMsg(id);
				}
			}
			
			// 可禁止事件再向上发送
			evt.preventDefault();	
			evt.stopPropagation();
		}// end of onkeypress
		},dojo.byId('selfEditor'+id));// end of new editor
			
		_editor.onLoadDeferred.then(function(){				
			_editor.set("value", defVal);
		});
		_editor.focus();
		_editor.addStyleSheet(self._MainDlg.fileDir+'/css/chat.css');
	
	// 使DIV自动换行
	if ( _editor.editNode  ){
		_editor.editNode.style.overflow = 'hidden';
		_editor.editNode.style.wordBreak = 'break-all';
	}
	
},

// _CheckReq:
//	工具栏的点击事件
_CheckReq: function(label, bid){
	switch(label){
	case 'video':	// 视频通话请求
		this._requestVideo(bid);
		break;
	case 'voice':	// 语音通话请求
		this._requestAudio(bid);
		break;
	case 'file':
		break;
	case 'complaint': // 投诉
		this._requestComplaint(bid);
		break;
	case 'share':
		break;
		break;
	case 'face':
		this.showFace(bid);
		break;
	case 'handwrite':
		break;
	case 'shake':
		this._requestShake(bid);
		break;
	case 'screenshot':
		break;
	case 'picture':
		break;
	case 'clear':
		break;
	case 'history':
		this.showHistory(bid);
		break;
	default:
		break;
	}
},// end of _CheckReq

// _GetLang:
// 获取标签显示tip
_GetLang: function(label)
{
	var strLang = '';
	switch(label)
	{
	case 'face':
		strLang = '表情';
		break;
	case 'handwrite':
		strLang = '手写';
		break;
	case 'shake':
		strLang = '抖动';
		break;
	case 'screenshot':
		strLang = '截屏';
		break;
	case 'picture':
		strLang = '发送图片';
		break;
	case 'clear':
		strLang = '清屏';
		break;
	case 'history':
		strLang = '历史记录';
		break;
	case "video":
		strLang = '视频';
		break;
	case "voice":
		strLang = '语音';
		break;
	case "file":
		strLang = '文件传输';
		break;
	case "complaint":
		strLang = '投诉';
		break;
	case "share":
		strLang = '分享';
		break;	
	default:
		break;
	}
	
	return strLang;
},

// _onCmd:
//	好友发出的CMD命令
//	需要打开聊天窗口
_onCmd: function(bid, msg,date,bIsMyself) {
	if (typeof msg == 'undefined'){
		//console.log('msg is undefined!'); 
		return true;
	}

//	console.log(bid+'发出CMD：'+msg);
	
//	this._OpenChatWnd(bid);

	if (msg.indexOf('Video') != -1)
	{//the msg type is video
	//	if (bIsMyself) return true;

		if ( null == this.chatVideo )
		{
			this.chatVideo = new _Video(this,this._MainDlg);
		}

		this.chatVideo._onVideo(bid, msg, date, bIsMyself);
	}	
	else if (msg.indexOf('Voice') != -1)
	{//the msg type is audio
		if ( null == this.chatVideo )
		{
			this.chatVideo = new _Video(this,this._MainDlg);
		}

		this.chatVideo._onAudio(bid, msg, date, bIsMyself);
	}
	else if (msg.indexOf('attention')!=-1 || msg.indexOf('Shake')!=-1 )
	{
		if (bIsMyself)
		{
			this._onShake(bid,"Shake_self",date);
		}
		else
		{
			this._onShake(bid,msg,date);	
		}
	}
	else if (msg.indexOf('Trade'!=-1))
	{
		this._onTrade(bid,msg,date,bIsMyself);
	}
	
	return true;	
},// end of _onCmd

// _requestVideo:
//	视频请求
_requestVideo: function(bid) {
	if ( this.myself.id == bid ) return;
	var self = this;
	
	if (!self._MainDlg._isOnline(bid))
	{
		var now = new Date();
		var date = now.getHours()+':'+now.getMinutes()+':'+now.getSeconds();
		self._onShowInfoMsg(bid,null,"您的好友不在线或隐身，因此您不能发送该请求",date,true,"info");
		self._onShowSystemMsg(bid,"您的好友不在线或隐身，因此您不能发送该请求","info",true,null);
		return;
	}

	if (null == self.chatVideo)
	{
		self.chatVideo = new _Video(self,self._MainDlg);
	}	

	var ret = Module.array.some(self.chatVideo.state,function(item){
		if ( item.id == bid ) {//视频会话请求正在进行中
			switch ( item.state ) {
			case 'V_SENDREQ': 
				self._onShowInfoMsg(bid,null,"视频会话请求正在进行中...",date,true,"info");
				break;
			case 'V_RECVREQ':
				self._onShowInfoMsg(bid,null,"对方的视频会话请求尚未处理...",date,true,"info");
				break;
			case 'A_START':	
			case 'V_START':
				self.chatVideo._VideoDlg.bringToTop();
				break;
			case 'A_SENDREQ': 
				self._onShowInfoMsg(bid,null,"语音会话请求正在进行中...",date,true,"info");
				break;
			case 'A_RECVREQ':
				self._onShowInfoMsg(bid,null,"对方的语音会话请求尚未处理...",date,true,"info");
				break; 	
			}
			return true;
		}
	});
	
	if ( ret )
		return;
			
	self._MainDlg._sendMsg(bid, 'cmd', 'requestVideo');

},// end of _requestVideo

// _requestAudio:
//	视频请求
_requestAudio: function(bid) {
	if ( this.myself.id == bid ) return;
	var self = this;
	
	if (!self._MainDlg._isOnline(bid))
	{
		var now = new Date();
		var date = now.getHours()+':'+now.getMinutes()+':'+now.getSeconds();
		self._onShowInfoMsg(bid,null,"您的好友不在线或隐身，因此您不能发送该请求",date,true,"info");
		self._onShowSystemMsg(bid,"您的好友不在线或隐身，因此您不能发送该请求","info",true,null);
		return;
	}

	if (null == self.chatVideo)
	{
		self.chatVideo = new _Video(self,self._MainDlg);
	}	

	var ret = Module.array.some(self.chatVideo.state,function(item){
		if ( item.id == bid ) {//视频会话请求正在进行中
			switch ( item.state ) {
			case 'V_SENDREQ': 
				self._onShowInfoMsg(bid,null,"视频会话请求正在进行中...",date,true,"info");
				break;
			case 'V_RECVREQ':
				self._onShowInfoMsg(bid,null,"对方的视频会话请求尚未处理...",date,true,"info");
				break;
			case 'A_START':	
			case 'V_START':
				self.chatVideo._VideoDlg.bringToTop();
				break;
			case 'A_SENDREQ': 
				self._onShowInfoMsg(bid,null,"语音会话请求正在进行中...",date,true,"info");
				break;
			case 'A_RECVREQ':
				self._onShowInfoMsg(bid,null,"对方的语音会话请求尚未处理...",date,true,"info");
				break; 	
			}
			return true;
		}
	});
	
	if ( ret )
		return;
			
	self._MainDlg._sendMsg(bid, 'cmd', 'requestVoice');

},// end of _requestAudio

_requestComplaint: function(id){
	var url = "http://www.uubridge.net";
	window.open(url,"_blank");
},

showHistory: function(id)
{
	if ( this._MainDlg )
	{
		if ( !this._MainDlg.historyrecord )
		{
			this._MainDlg.historyrecord = new window.HistoryRecord(this._MainDlg);
		}
		
		this._MainDlg.historyrecord._initHistoryRecordDlg(id,this.myself.id);
	}
},

/*
 *function: show the emotion Face
 */	
showFace: function(id)
{//todo:a pane to show emotions
	var callback = function(imgSrc) {
		console.log(imgSrc);
		var html = '<img src="//im.uubridge.cn:8028/home/felix/em/' + imgSrc
        + '" style="vertical-align:text-bottom;"/>';
		var editor = Module.registry.byId('selfEditor'+id);
		editor.execCommand('inserthtml', html);
	};

	var emotionDlg = new emotion();	
	var edInfo = Module["dom-geometry"].position("selfEditor"+id, true);
	emotionDlg.initemotion(edInfo.x,edInfo.y,id,callback);
},

/*
 *function: request others to shake
 *param:   
 	bid: others' sessionId	
 */	
_requestShake: function(bid)
{
	var now = new Date();
	var date = now.getHours()+':'+now.getMinutes()+':'+now.getSeconds();
	var self = this;
	
	if (!this._MainDlg._isOnline(bid))
	{//the other one is not online	
		this._onShake(bid,'Shake_offline',date);
	}
	else
	{
		if ( this.shakeFlag )
		{
			this._onShake(bid,'Shake_repeat',date);
			return;
		}
		
		this.shakeFlag = true;
		setTimeout(function(){
			self.shakeFlag = false;
		},10000);
		
		if ( this.myself.id == bid )
		{
			this._onShake(bid,"Shake_self",date);
		}
		else
		{
			this._MainDlg._sendMsg(bid,'cmd','attention');
		}
	}
},	

_resizeChatDlg: function(){
// 判断chatTab是否存在
// 如果不存在，则返回
if (!this.chatTab)			   return ;
if (!Module.dom.byId('chatTab')) return ;

// 循环每个chatTab
// 当改变聊天窗口大小时，同时改变显示框的大小
// 其他控件大小不变
for (var i = 0; i < this.chatTab.getChildren().length; ++i) {
	var tmpID = this.chatTab.getChildren()[i].id;
	this._resizePeerEditor(tmpID);
};

},// end of _resizeCHatDlg

_resizePeerEditor: function(id){
	var peerEditorID = 'peerEditor' + id;
	var tipNode = Module.dom.byId('tipbar'+id);
	var editorNode = Module.dom.byId(peerEditorID);
	if ( !editorNode ) return;
	var chatDlgInfo = Module["dom-geometry"].position('IMChat', true);
	var tipExist = (Module["dom-attr"].get(tipNode,"tipExist") == 'true');
	var fixedHeight = tipExist ? 232 : 212;
	var tmpHeight = (chatDlgInfo.h - fixedHeight) + 'px';
	Module["dom-style"].set(editorNode, "height", tmpHeight);
},

// _onDestroyTooltipDlg:
//	关闭提示窗口
_onDestroyTooltipDlg: function(id){
	if (dijit.byId('requestCancelID'))
		dijit.byId('requestCancelID').destroy();
	if (dijit.byId('requestAcceptID'))
		dijit.byId('requestAcceptID').destroy();
	if (dijit.byId('requestID'))
		dijit.byId('requestID').destroy();
		
	if ( 0 != this.idOfTipTimeout )
	{
		clearTimeout(this.idOfTipTimeout);
		this.idOfTipTimeout = 0;
	}

	var tipNode = Module.dom.byId("tipbar"+id);
	if ( tipNode && (Module["dom-attr"].get(tipNode,"tipExist") == 'true') )
	{
		Module["dom-attr"].set(tipNode,"tipExist",'false');
		tipNode.innerHTML = "";
		tipNode.className = "tipbar_hide";
		this._resizePeerEditor(id);
	}
},// end of _onDestroyTooltipDlg

// _onSendReqCmd:
// 	发送cmd并处理
_onSendReqCmd: function(bid,reqType){
	this._onDestroyTooltipDlg(bid);	
	this._MainDlg._sendMsg(bid, 'cmd', reqType);
},

// _closeMain:
//			关闭主界面
//			在主界面中，点击‘注销’和‘退出’时调用该函数
//			点击主界面关闭按钮时，也调用该函数
_Destroy: function (bisClose){
	var self = this;
	
	if (self.chatVideo)
	{//通知对方关闭视频
		Module.array.forEach(self.chatVideo.state,function(item){
			switch (item.state) {
			case 'V_SENDREQ':
				self._onSendReqCmd(item.id,'cancelVideo');
				break;
			case 'V_RECVREQ':
				self._onSendReqCmd(item.id,'refuseVideo');
				break;
			case 'V_START':
				self._onSendReqCmd(item.id,'stopVideo');
				break;
			case 'A_SENDREQ':
				self._onSendReqCmd(item.id,'cancelVoice');
				break;
			case 'A_RECVREQ':
				self._onSendReqCmd(item.id,'refuseVoice');
				break;
			case 'A_START':
				self._onSendReqCmd(item.id,'stopVoice');
				break;
			default :
				break;	
			}
		});
			
		self.chatVideo._close();
		self.chatVideo = null;	
	}
	
	if (self.chatDlg)
	{	
		for (var i = 0,list=self.chatTab.getChildren();i < list.length;i++)
		{
			var widget = Module.registry.byId(list[i].id);
			var border = Module.registry.byId("borderContainer"+list[i].id);
			if ( widget ) {
				self.chatTab.removeChild(widget);
				// if ( border ){
					// widget.removeChild(border);
					// Module.array.forEach(["toolbar","selfEditor"],function(label){
						// Module.registry.byId(label+list[i].id).destroy();
					// });
					// border.destroy();
				// }	
				// widget.destroy();
			}
		}	
		
		self.chatTab.destroy();
		self.chatTab = null;
		
		if ( !bisClose )
			self.chatDlg.destroy();
		self.chatDlg = null;
			
		// destroy the contentpane
		for (var i = 0;i < self._chatBdy.length;i++)
		{
			dojo.forEach(["toolbar","peerEditor","selfEditor","sendDivID","borderContainer"],function(label){
				if ( dijit.byId(label+self._chatBdy[i]) )
				{
					dijit.byId(label+self._chatBdy[i]).destroy();
					if ( label == "tradeContent" ){
						var splitter = Module.registry.byId(label+self._chatBdy[i]+"_splitter");
						if ( splitter )
							splitter.destroy();
					}
				}	
			});
			
			var widget = Module.registry.byId(self._chatBdy[i]);
			if ( widget )
				widget.destroy();
		}
	
		self._chatBdy.splice(0, self._chatBdy.length);
	}
	//this.myself = null;
},// end of _closeMain


/*
*function: shake the chat window
* 
*param: 
bid: cmd sender's sessionId
date: the date of sending cmd
*/	
_onShake: function(bid,msg,date)
{
	var bShake = true;
	if (null == this.chatDlg) return;

	switch(msg)
	{
		case 'Shake_offline':
			this._onShowInfoMsg(bid,null,"您的好友不在线或隐身，因此您不能发送该请求",date,true,"info");
			this._onShowSystemMsg(bid,"您的好友不在线或隐身，因此您不能发送该请求","info",true,null);
			bShake = false;
			break;
		case 'Shake_self':
			this._onShowInfoMsg(bid,null,"您发送了一个窗口抖动",date,true,"info");
			break;
		case 'attention':
			this._onShowInfoMsg(bid,null,"对方发送了一个窗口抖动",date,false,"info");
			break;
		case 'Shake_repeat':
			this._onShowSystemMsg(bid,"您发送窗口抖动过于频繁，请稍候再发","info",true,null);
			this._onShowInfoMsg(bid,null,"您发送窗口抖动过于频繁，请稍候再发",date,true,"info");
			bShake = false;
			break;
		default:
			break;	
	}	

	if ( bShake )
	{//shake the window
		var o = this.chatDlg.domNode;
		var f = [o.offsetLeft,o.offsetTop];
		var p = ["left","top"];
		i = 0;
		var u = setInterval(function()
		{
			var s = o.style;
			s[p[i % 2]] = f[i % 2] + ((i++) % 4 < 2 ? -2 : 2) + "px";
			if ( i > 30 )
			{
				clearInterval(u);
				s[p[0]] = f[0] + "px";
				s[p[1]] = f[1] + "px";
				i = 0;
			}
		},
		36);	
	}
},

_onTrade: function (bid,msg,date,bIsMyself){

	var arr = msg.split(':');
	switch ( arr[0] ){
	case 'openTrade':
		if (bIsMyself) {
            this._onShowInfoMsg(bid,null,'您开始了交易，编号：' + arr[1],date,true,"info");
		}else{
			this._onShowInfoMsg(bid,null,'对方开始了交易，编号：' + arr[1],date,true,"info");
		}	
		this.openTrade(bid,arr[1]);
		break;
	case 'closeTrade':
		if (bIsMyself)
			this._onShowInfoMsg(bid,null,'您结束了交易，编号：' + arr[1],date,true,"info");
		else
			this._onShowInfoMsg(bid,null,'对方结束了交易，编号：' + arr[1],date,true,"info");
		this.closeTrade(bid,arr[1]);
		break;
	default:
		break;
	}
},

openTrade: function(bid,tradeId) {
	var reserveList = Module.dom.byId("reserveList"+bid);
	var serviceList = Module.dom.byId("serviceList"+bid);
	var buyArr = Module.query(".trade_Item",reserveList);
	var sellArr = Module.query(".trade_Item",serviceList);
	var state = "open";
	var arr = this.statusMap[state];
	
	var retBuy = Module.array.some(buyArr,function(item){
		var tid = Module["dom-attr"].get(item,'bdyID');
		if ( tid == tradeId ) {
			var p = Module.query(".trade_status",item)[0];
			Module["dom-prop"].set(p,"innerHTML",'<strong>状态:</strong> <font color="red">'+arr[1]+'</font>');
			Module["dom-attr"].set(p.parentNode,"status",state);
			var domstate = Module.query(".trade_btn",item)[0];
			Module["dom-prop"].set(domstate,"innerHTML",arr[0]);
			Module["dom-attr"].set(domstate,"title",arr[2]);
			return true;
		}
	});
	
	var retSell = Module.array.some(sellArr,function(item){
		var tid = Module["dom-attr"].get(item,'bdyID');
		if ( tid == tradeId ) {
			var p = Module.query(".trade_status",item)[0];
			Module["dom-prop"].set(p,"innerHTML",'<strong>状态:</strong> <font color="red">'+arr[1]+'</font>');
			Module["dom-attr"].set(p.parentNode,"status",state);
			return true;
		}
	});
},

closeTrade: function(bid,tradeId) {
	var reserveList = Module.dom.byId("reserveList"+bid);
	var serviceList = Module.dom.byId("serviceList"+bid);	
	var buyArr = Module.query(".trade_Item",reserveList);
	var sellArr = Module.query(".trade_Item",serviceList);
	var state = "close";
	var arr = this.statusMap[state];
	
	var retBuy = Module.array.some(buyArr,function(item){
		var tid = Module["dom-attr"].get(item,'bdyID');
		if ( tid == tradeId ) {
			var p = Module.query(".trade_status",item)[0];
			Module["dom-prop"].set(p,"innerHTML",'<strong>状态:</strong> <font color="red">'+arr[1]+'</font>');
			Module["dom-attr"].set(p.parentNode,"status",state);
			var domstate = Module.query(".trade_btn",item)[0];
			Module["dom-construct"].destroy(domstate);	
//			Module["dom-construct"].destroy(item);
			return true;
		}
	});
	
	var retSell = Module.array.some(sellArr,function(item){
		var tid = Module["dom-attr"].get(item,'bdyID');
		if ( tid == tradeId ) {
			var p = Module.query(".trade_status",item)[0];
			Module["dom-prop"].set(p,"innerHTML",'<strong>状态:</strong> <font color="red">'+arr[1]+'</font>');
			Module["dom-attr"].set(p.parentNode,"status",state);
//			Module["dom-construct"].destroy(item);
			return true;
		}
	});
}

};// end of prototype
	Chat._Chat = _Chat;
})(Chat);

