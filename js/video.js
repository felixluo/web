// constructor
function _Video(chatDlg,mainDlg){
	this._VideoDlg = null;
	this._mainDlg = mainDlg;
	this._chatDlg = chatDlg;
	this.state = [];
	return this;	
}

// prototype
_Video.prototype = {
	constructor:_Video,
	
	// _onStopVideo:
	//	好友关闭视频窗口
	_onStopVideo: function(bMyself,date,bid){
		var self = this;
		if ( bMyself )
		{
			if ( this._chatDlg )
				this._chatDlg._onShowInfoMsg(bid, null, "您关闭了视频会话", date,true,"info");
		}
		else
		{
			if ( this._chatDlg )
				this._chatDlg._onShowInfoMsg(bid, null, "对方关闭了视频会话", date,false,"info");
		}
		
		Module.array.some(this.state, function(item,index){
			if ( item.id == bid ) {
				self.state.splice(index,1);
				return true;
			}
		});
				
		this._close();
	},// end of _onStopVideo
	
	_onStopAudio: function(bMyself,date,bid){
		var self = this;
		if ( bMyself )
		{
			if ( this._chatDlg )
				this._chatDlg._onShowInfoMsg(bid, null, "您关闭了语音会话", date,true,"info");
		}
		else
		{
			if ( this._chatDlg )
				this._chatDlg._onShowInfoMsg(bid, null, "对方关闭了语音会话", date,false,"info");
		}
		
		Module.array.some(this.state, function(item,index){
			if ( item.id == bid ) {
				self.state.splice(index,1);
				return true;
			}
		});
		
		this._close();
	},
	
	//非主动关闭窗口
	_close: function()
	{
		if ( this._VideoDlg )
		{
			if ( dijit.byId('IMVideo')  )
			{
				dijit.byId('IMVideo').destroy();
			}
			this._VideoDlg = null; 
		}
	},

	// _onVideo
	//	视频处理
	_onVideo: function(bid, req, date, bMyself) 
	{
		if ( !this._chatDlg ) return;
		var self = this;

		switch(req) 
		{
		case 'cancelVideo':
		{
			if ( bMyself )
				this._chatDlg._onShowInfoMsg(bid, null, "您取消了视频会话请求", date,true,"info");
			else
				this._chatDlg._onShowInfoMsg(bid, null, "对方取消了视频会话请求", date,false,"info");
			this._chatDlg._onDestroyTooltipDlg(bid);
			
			Module.array.some(self.state, function(item,index){
				if ( item.id == bid ) {
					self.state.splice(index,1);
					return true;
				}
			});
		}	
			break;
		case 'refuseVideo':
		{
			if ( bMyself )
				this._chatDlg._onShowInfoMsg(bid, null, "您拒绝了视频会话请求", date,true,"info");
			else
				this._chatDlg._onShowInfoMsg(bid, null, "对方拒绝了视频会话请求", date,false,"info");
			this._chatDlg._onDestroyTooltipDlg(bid);
			
			Module.array.some(self.state, function(item,index){
				if ( item.id == bid ) {
					self.state.splice(index,1);
					return true;
				}
			});
		}	
			break;
		case 'acceptVideo':
		{	
			if ( this._VideoDlg ) {
				this._VideoDlg.bringToTop();
				return;
			}
			
			this._chatDlg._onDestroyTooltipDlg(bid);
			
			if ( bMyself ){
				this._chatDlg._onShowInfoMsg(bid, null, "您接受了视频会话请求",date, true,"info");
			}else{
				this._chatDlg._onShowInfoMsg(bid, null, "对方接受了视频会话请求",date, false,"info");
			}
			
			if ( !this._mainDlg._isOnline(bid) ){
				//判断对方是否在线
				this._chatDlg._onShowInfoMsg(bid, null, "对方取消了视频会话请求", date,false,"info");
				this._chatDlg._onDestroyTooltipDlg(bid);
				Module.array.some(self.state, function(item,index){
					if ( item.id == bid ) {
						self.state.splice(index,1);
						return true;
					}
				});
				return;
			}
			
			this._chatDlg._onDestroyTooltipDlg(bid);	
			this._mainDlg.NetIO.getPortal('vchat');
			
			Module.array.some(self.state, function(item,index){
				if ( item.id == bid ) {
					item.state = 'V_START';
					return true;
				}
			});
		}			
			break;
		case 'requestVideo':
		{
			this._onRequestVideo(bMyself,date,bid);
		}	
			break;
		case 'stopVideo':
		{
			this._onStopVideo(bMyself,date,bid);
		}
			break;
		default:
			break;
		}
			
	},// end of _onVideo
	
	// _onAudio
	//	语音处理
	_onAudio: function(bid, req, date, bMyself) 
	{
		if ( !this._chatDlg ) return;
		var self = this;
		
		switch(req) 
		{
		case 'cancelVoice':
		{
			if ( bMyself )
				this._chatDlg._onShowInfoMsg(bid, null, "您取消了语音会话请求", date,true,"info");
			else
				this._chatDlg._onShowInfoMsg(bid, null, "对方取消了语音会话请求", date,false,"info");
			this._chatDlg._onDestroyTooltipDlg(bid);
			
			Module.array.some(self.state, function(item,index){
				if ( item.id == bid ) {
					self.state.splice(index,1);
					return true;
				}
			});
		}	
			break;
		case 'refuseVoice':
		{
			if ( bMyself )
				this._chatDlg._onShowInfoMsg(bid, null, "您拒绝了语音会话请求", date,true,"info");
			else
				this._chatDlg._onShowInfoMsg(bid, null, "对方拒绝了语音会话请求", date,false,"info");
			this._chatDlg._onDestroyTooltipDlg(bid);
			
			Module.array.some(self.state, function(item,index){
				if ( item.id == bid ) {
					self.state.splice(index,1);
					return true;
				}
			});
		}	
			break;
		case 'acceptVoice':
		{
			if ( this._VideoDlg ) {
				this._VideoDlg.bringToTop();
				return;
			}	
			
			this._chatDlg._onDestroyTooltipDlg(bid);	
			
			if ( bMyself ){
				this._chatDlg._onShowInfoMsg(bid, null, "您接受了语音会话请求",date, true,"info");
			}else{
				this._chatDlg._onShowInfoMsg(bid, null, "对方接受了语音会话请求",date, false,"info");
			}	
			
			if ( !this._mainDlg._isOnline(bid) ){
				//判断对方是否在线
				this._chatDlg._onShowInfoMsg(bid, null, "对方取消了语音会话请求", date,false,"info");
				this._chatDlg._onDestroyTooltipDlg(bid);
				Module.array.some(self.state, function(item,index){
					if ( item.id == bid ) {
						self.state.splice(index,1);
						return true;
					}
				});
				return;
			}
			
			this._chatDlg._onDestroyTooltipDlg(bid);	
			this._mainDlg.NetIO.getPortal('vchat');
			Module.array.some(self.state, function(item,index){
				if ( item.id == bid ) {
					item.state = 'A_START';
					return true;
				}
			});
		}			
			break;
		case 'requestVoice':
		{
			this._onRequestAudio(bMyself,date,bid);
		}	
			break;
		case 'stopVoice':
		{
			this._onStopAudio(bMyself,date,bid);
		}
			break;
		default:
			break;
		}
			
	},// end of _onAudio

	// _onRequestVideo
	//	对方视频请求
	// 	可以接受视频或拒绝视频请求
	// bid:
	//	该好友的ID
	_onRequestVideo: function (bMyself,date,bid) {

		var content = '';
		var self = this;
		
		if ( bMyself )
		{
			content += '<span style="position: absolute; right: 0; top: 0;">';
			content += '<button data-dojo-type="dijit/form/Button" id="requestID" class="tipBtnCancel">取消</button>';
			content += '</span>';
			var ret = this._chatDlg._onShowSystemMsg(bid,"正在向对方请求视频会话...","info",false,content);	
			if ( !ret )
			{//当有提示未消失时（ret == false），需要进行处理
				this._chatDlg._onDestroyTooltipDlg(bid);
				this._chatDlg._onShowSystemMsg(bid,"正在向对方请求视频会话...","info",false,content);	
			}
			
			Module.on(Module.dom.byId('requestID'), 'click', function()
			{
				self._chatDlg._onSendReqCmd(bid,'cancelVideo');
			});	
			
			this._chatDlg._onShowInfoMsg(bid,null,"您发出了视频会话请求...",date,true,"info");
			
			var ret = Module.array.some(self.state,function(item,index){
					if ( item.id == bid ) {
						item.state = "V_SENDREQ";
						return true;
					}
			});	
			if ( !ret )
				this.state.push({id:bid,state:'V_SENDREQ'});
		}
		else
		{	
			content += '<span style="position: absolute; right: 0; top: 0;">';
			content += '<button data-dojo-type="dijit/form/Button" id="requestCancelID" class="tipBtnCancel"">取消</button>';
			content += '<button data-dojo-type="dijit/form/Button" id="requestAcceptID" class="tipBtnAccept">接受</button>';
			content += '</span>';
			var ret = this._chatDlg._onShowSystemMsg(bid,"对方向您请求视频会话...","info",false,content);
			if ( !ret )
			{//当有提示未消失时（ret == false），需要进行处理
				this._chatDlg._onDestroyTooltipDlg(bid);
				this._chatDlg._onShowSystemMsg(bid,"对方向您请求视频会话...","info",false,content);
			}
			
			Module.on(Module.dom.byId('requestCancelID'), 'click', function(){	
				self._chatDlg._onSendReqCmd(bid,'refuseVideo');
			});	
			
			Module.on(Module.dom.byId('requestAcceptID'), 'click', function(){
			//	self._chatDlg._onSendReqCmd(bid,'acceptVideo');
				self._mainDlg._sendMsg(bid, 'cmd', 'acceptVideo');
			});
			
			this._chatDlg._onShowInfoMsg(bid,null,"对方发出了视频会话请求...",date,false,"info");
			
			var ret = Module.array.some(self.state,function(item,index){
					if ( item.id == bid ) {
						item.state = "V_RECVREQ";
						return true;
					}
			});	
			if ( !ret )
				this.state.push({id:bid,state:'V_RECVREQ'});
		}
	},// end of _onRequestVideo
	
	
	_onRequestAudio: function (bMyself,date,bid) {

		var content = '';
		var self = this;
		
		if ( bMyself )
		{
			content += '<span style="position: absolute; right: 0; top: 0;">';
			content += '<button data-dojo-type="dijit/form/Button" id="requestID" class="tipBtnCancel">取消</button>';
			content += '</span>';
			var ret = this._chatDlg._onShowSystemMsg(bid,"正在向对方请求语音会话...","info",false,content);	
			if ( !ret )
			{//当有提示未消失时（ret == false），需要进行处理
				this._chatDlg._onDestroyTooltipDlg(bid);
				this._chatDlg._onShowSystemMsg(bid,"正在向对方请求语音会话...","info",false,content);	
			}
			
			Module.on(Module.dom.byId('requestID'), 'click', function()
			{
				self._chatDlg._onSendReqCmd(bid,'cancelVoice');
			});	
			
			this._chatDlg._onShowInfoMsg(bid,null,"您发出了语音会话请求...",date,true,"info");
			
			var ret = Module.array.some(self.state,function(item,index){
					if ( item.id == bid ) {
						item.state = "A_SENDREQ";
						return true;
					}
			});	
			if ( !ret )
				this.state.push({id:bid,state:'A_SENDREQ'});
		}
		else
		{	
			content += '<span style="position: absolute; right: 0; top: 0;">';
			content += '<button data-dojo-type="dijit/form/Button" id="requestCancelID" class="tipBtnCancel"">取消</button>';
			content += '<button data-dojo-type="dijit/form/Button" id="requestAcceptID" class="tipBtnAccept">接受</button>';
			content += '</span>';
			var ret = this._chatDlg._onShowSystemMsg(bid,"对方向您请求语音会话...","info",false,content);
			if ( !ret )
			{//当有提示未消失时（ret == false），需要进行处理
				this._chatDlg._onDestroyTooltipDlg(bid);
				this._chatDlg._onShowSystemMsg(bid,"对方向您请求语音会话...","info",false,content);
			}
			
			Module.on(Module.dom.byId('requestCancelID'), 'click', function(){	
				self._chatDlg._onSendReqCmd(bid,'refuseVoice');
			});	
			
			Module.on(Module.dom.byId('requestAcceptID'), 'click', function(){
			//	self._chatDlg._onSendReqCmd(bid,'acceptVoice');
				self._mainDlg._sendMsg(bid, 'cmd', 'acceptVoice');
			});
			
			this._chatDlg._onShowInfoMsg(bid,null,"对方发出了语音会话请求...",date,false,"info");
			
			var ret = Module.array.some(self.state,function(item,index){
					if ( item.id == bid ) {
						item.state = "A_RECVREQ";
						return true;
					}
			});	
			if ( !ret )
				this.state.push({id:bid,state:'A_RECVREQ'});
		}
	},

	// _initVideoDlg:
	//	初始化视频窗口
	_initVideoDlg: function (id,state) {
		if (this._VideoDlg)	return this._VideoDlg.show();
		
		// 创建聊天窗口的DIV
		if (!Module.dom.byId("IMVideo")) {
			var video = document.createElement('div');
			video.id = 'IMVideo';
			
			var flash = document.createElement('div');
			flash.id = 'IMFlash';
			
			video.appendChild(flash);		
			document.body.appendChild(video);
		}// end of if

		var self = this;
		var style = "position:absolute;top:76px;left:68px;width:640px;";
		style += "height:516px;visibility:visibie;overflow:hidden;";
		this._VideoDlg = new dojox.layout.FloatingPane({
			/* title: "<img src='"+this._mainDlg.fileDir+"/img/skin/icons/default16.png' />&nbsp;&nbsp;" + '与'+this._mainDlg._getDisplayName(id)+'视频通话中', */
			title: '与'+this._mainDlg._getDisplayName(id)+(state == "V_START") ? '视频通话中': '语音通话中',
			style: style,
			resizable:true,
			docked:true,
			maxable:true,
			resize:function(dim){
				this.inherited("resize", arguments);
				var flashNode = Module.dom.byId("IMFlash");
				var videoDlgInfo = Module["dom-geometry"].position('IMVideo', true);
				var tmpHeight = (videoDlgInfo.h - 43) + 'px';
				Module["dom-style"].set(flashNode, "height", tmpHeight);
			},// end of resize_event
			destroyRecursive: function(){
			
				if ( state == "V_START" ) {
					self._mainDlg._sendMsg(id, 'cmd', 'stopVideo');
				} else if ( state == "A_START" ) {
					self._mainDlg._sendMsg(id, 'cmd', 'stopVoice');
				}
		
				self._close();
			}	
		}, dojo.byId('IMVideo'));
		
		this._VideoDlg.startup();
		this._mainDlg._HidePaneScroll(this._VideoDlg);
		this._VideoDlg.show();
		this._VideoDlg.bringToTop();
		this._VideoDlg._resizeHandle.minSize.w = 231;
		this._VideoDlg._resizeHandle.minSize.h = 215;
	},// end of _initVideoDlg

	// _startStream
	//	开始视频通话
	_startStream: function (portal){	
		var videoID = '',state = '',self = this;
		Module.array.some(self.state,function(item,index){
			if ( item.state == "V_START" ) {
				videoID = item.id;
				state = 'V_START';
				return true;
			}
			
			if ( item.state == "A_START" ) {
				videoID = item.id;
				state = 'A_START';
				return true;
			}
		});
		
		if ( videoID == '' || state == '') return;
		if (!this._VideoDlg)	this._initVideoDlg(videoID,state);
		
		// start stream
	    var self = this;
		require(["dojox/embed/Flash", "dojo/aspect", "dojo/dom", "dojo/domReady!"],
			function(Flash, aspect, dom) {
			var uid = self._mainDlg.NetIO.getCodeForHash(videoID);
			function placeMovie(){
				var node = dom.byId("IMFlash"),
					movie = new Flash({
						path: "//im.uubridge.cn:8028/im/vchat.swf",
						params: {wmode: 'window'},
						vars: {path: encodeURIComponent(portal.channel),
								session: encodeURIComponent(self._mainDlg.NetIO.mcake.getSession()),
								publish: encodeURIComponent(self._mainDlg.NetIO.mcake.myId()),
								play: encodeURIComponent(uid),
								type: (state == "V_START") ? '0xF' : '0x5'},
						width: '100%',
						height: '100%'
					}, node/*"IMFlash"*/);
				return movie;
			}

			if(!Flash.available){
				dom.byId("IMFlash").innerHTML = "<strong><em>Flash is not installed on your system.</em></strong>";
			} else {
				if(Flash.initialized){
					movie = placeMovie();
				} else {
					var h = aspect.after(Flash, "onInitialize", function(){
						h.remove();
						placeMovie();
					});
				}
			}
		});
		
		this._VideoDlg.show();

	}// end of _startStream

}// end of prototype

