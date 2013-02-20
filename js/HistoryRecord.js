(function(window) {
function HistoryRecord(net) {
        this.HistoryRecordDlg = null;
	    this.net = net;
		this.allId=new Array();
		this.treetime=null;
		this.myStore=null;
		this.myModel=null;
		this.contenttime=null;
		this.contenttime2=null;
		this.selfId='';
	
		this.selDay='';
		this.msgList = {};
		 this.isGetting = false;
		this.msgFormat= '<img src="{avatar}" style="float:left;width:24px;height:24px;border:1px solid #EEEEEE;padding:2px;"/>';
        this.msgFormat+='<div style="margin:0px 0px 5px 32px;">';
        this.msgFormat+='<div style="font-size:12px;color:#{color};">{name} {time}</div>';
        this.msgFormat+='<div>{message}</div>';
        this.msgFormat+='</div>';
        this.timelist=new Array();
	     this.divcontent=null;


this.cmdMsg= {
    requestVideo: ['您发出了视频会话请求...' , '对方发出了视频会话请求...'],
    cancelVideo : ['您取消了视频会话请求。'  , '对方取消了视频会话请求。' ],
    acceptVideo : ['您接受了视频会话请求。'  , '对方接受了视频会话请求。' ],
    refuseVideo : ['您拒绝了视频会话请求。'  , '对方拒绝了视频会话请求。' ],
    stopVideo   : ['您关闭了视频会话。'      , '对方关闭了视频会话。'     ],
    requestVoice: ['您发出了语音会话请求...' , '对方发出了语音会话请求...'],
    cancelVoice : ['您取消了语音会话请求。'  , '对方取消了语音会话请求。' ],
    acceptVoice : ['您接受了语音会话请求。'  , '对方接受了语音会话请求。' ],
    refuseVoice : ['您拒绝了语音会话请求。'  , '对方拒绝了语音会话请求。' ],
    stopVoice   : ['您关闭了语音会话。'      , '对方关闭了语音会话。'     ],
    requestVcon : ['您发出了视频会议邀请...' , '对方发出了视频会议邀请...'],
    cancelVcon  : ['您取消了视频会议邀请。'  , '对方取消了视频会议邀请。' ],
    acceptVcon  : ['您接受了视频会议邀请。'  , '对方接受了视频会议邀请。' ],
    refuseVcon  : ['您拒绝了视频会议邀请。'  , '对方拒绝了视频会议邀请。' ],
    stopVcon    : ['您关闭了视频会议。'      , '对方关闭了视频会议。'     ],
    subscribe   : ['您申请成为对方的联系人：', '对方申请成为您的联系人：' ],
    subscribed  : ['您接受了联系人申请。'    , '对方接受了联系人申请。'   ],
    unsubscribed: ['您拒绝了联系人申请。'    , '对方拒绝了联系人申请。'   ],
    unsubscribe : ['您删除了联系人。'        , '对方删除了联系人。'       ],
    attention   : ['您发送了一个窗口抖动。'  , '您收到了一个窗口抖动。'   ],
	openTrade   : ['您开始了交易，编号：'    , '对方开始了交易，编号：'   ],
    closeTrade  : ['您结束了交易，编号：'    , '对方结束了交易，编号：'   ],
    unknown     : ['发出了不能识别的命令：'  , '收到了不能识别的命令：'   ]
};

}
HistoryRecord.prototype = {
constructor: HistoryRecord,
onMsgList:function(msglist){
     
    var self=this;
	//var loadingTip='<div style="text-align:center;padding:5px;">';
   //loadingTip+='<img src="http://im.uubridge.cn:8018/im/lily/img/skin/loading.gif" style="vertical-align:text-bottom;"/>';
   //loadingTip+='<span style="font-size:12px;color:#505050;">&nbsp正在加载消息记录...</span>';
   //loadingTip+='</div>';
       var monthNames= ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月",
             "九月", "十月", "十一月", "十二月"];

       var weekNames= ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五",
            "星期六"];
        this.myStore=new Module.Memory({
        data:[ 
		    { id: 'world', name:'聊天时间', type:'alltime'}
			],
		getChildren:function(object){
		  return this.query({parent:object.id});
		}
		});
		//var time1="十月份";
		//this.myStore.put({id:time1,name:time1,parent:'world'});
     var itemMonth, childrenDays;
    var ts, date, dateStr, Y = -1, M = -1, D = -1, y, m, d;

    var fname;
    while ((fname = msglist.shift())) {
        ts = fname.split('&', 1)[0];
        date = new Date(parseInt(ts));
        y = date.getFullYear();
        m = date.getMonth();
        d = date.getDate();
		
        if (Y != y || M != m || D != d) {
            if (Y != y || M != m) {
                Y = y;
                M = m;
				itemMonth=monthNames[M]+ ' ' + Y;
                 this.myStore.put({id:itemMonth,name:itemMonth,parent:'world'});
            }
            D = d;
            dateStr = Y + '/' + (M + 1) + '/' + D;
			this.timelist.push(dateStr);
			childrenDays=(D >= 10 ? D.toString() : ' ' + D.toString())+ '日 ' + weekNames[date.getDay()];
			this.myStore.put({id:itemMonth+childrenDays,name:childrenDays,parent:itemMonth,value:dateStr});
			this.msgList[dateStr] = [{fname: fname, data: ''}];
			
       }
	   else
	        this.msgList[dateStr].push({fname: fname, data: ''});
	}
	 
	this.myModel=new Module.ObjectStoreModel({
	     store:this.myStore,
		 query:{id:'world'}
	});
	
    this.treetime=new Module.Tree({
	   model:this.myModel,
	   style:"overflow:hidden;",
	   persist:true,
       focused:true,
	  
	   onClick:function(item,node,event){
	   self.selDay="";
	   var tree = event.target;

       var value =self.treetime.selectedItem;
	   if(value.parent=="world"||value.id=="world")return;
    if (value && value != self.selDay) {
        self.selDay = value.value;
        // 清屏
         self.divcontent=document.createElement('div');
	    	   self.divcontent.setAttribute("class","otherdiv2");
		self.divcontent.innerHtml="";
		  self.contenttime2.set("content",self.divcontent);
        // 获取消息
         self._getDayMsg();
           }
	   }
	});
	this.treetime.startup();

	this.contenttime.set("content",this.treetime);
	 self.selDay = self.timelist.pop();
			
		//console.log(self.selDay);
        // 清屏
        self.divcontent=document.createElement('div');
	      //self.divcontent.setAttribute("style","overflow:hidden;width:100%;");
		   self.divcontent.setAttribute("class","otherdiv2");
		self.divcontent.innerHtml="";
		  self.contenttime2.set("content",self.divcontent);
        // 获取消息
         self._getDayMsg();

},
_getDayMsg: function() {
    var self=this;
    if (this.isGetting)
        return;
  //var editor = document.getElementById('msgEditor');
    if(!self.selDay)return;
    var msgArr = this.msgList[this.selDay];
    
	   if ('string' == typeof(msgArr)) {
        // 直接加载渲染过的页面
       self.divcontent.innerHtml=msgArr;
        // 滚屏到底部
        var self = this, selDay = this.selDay;
        setTimeout(function() {
            if (selDay == self.selDay) {
               //var editor = document.getElementById('msgEditor');
               self.divcontent.scrollTop=self.divcontent.scrollHeight;
            }
        }, 0);
        return;
    }
    for (var i = 0, len = msgArr.length; i < len; i++) {
        if (!msgArr[i].data) {
            this.isGetting = true;
            this.net.getArchiveMsg(msgArr[i].fname);
            return;
        }
    }

    this._showDayMsg(msgArr);
	
},
onMsg: function(fname, data) {
    this.isGetting = false;
    var pattern = /(<a\s+[^>]+)(>)/ig,
		fmmsg = '';
	
	// 格式化MSG，使link重新打开新链接
	if ( typeof data == 'string'  )
	{
		fmmsg = data.replace(pattern,"$1 target='_blank' $2");
	}
    var d = new Date(parseInt(fname.split('&', 1)[0]));
    var dateStr = d.getFullYear() + '/' + (d.getMonth() + 1) + '/'
        + d.getDate();
    var msgArr = this.msgList[dateStr];

    for (var i = 0, len = msgArr.length; i < len; i++) {
        if (msgArr[i].fname == fname) {
            msgArr[i++].data = fmmsg;
            break;
        }
    }

    if (this.selDay == dateStr) {
        if (i < len) {
            this.isGetting = true;
            this.net.getArchiveMsg(msgArr[i].fname);
        } else
            this._showDayMsg(msgArr);
    } else
        this._getDayMsg();
},

_showDayMsg: function(msgArr,id) {
    //var editor = document.getElementById('msgEditor');
     var self=this;
    var docFrag = self.divcontent;
    var arr, ts, from, type, to;

    //doc.body.innerHTML = '';
    for (var i = 0, len = msgArr.length; i < len; i++) {
        arr = msgArr[i].fname.split('&');
        ts = arr[0], from = arr[1], type = arr[2], to = arr[3];
        this._showMsg(docFrag, from, parseInt(ts), type, msgArr[i].data);
    }
    //doc.body.appendChild(docFrag);
    this.showId = '';

    var self = this, selDay = this.selDay;
    setTimeout(function() {
        if (selDay == self.selDay) {
            //var editor = document.getElementById('msgEditor');
            // 滚屏到底部
           self.divcontent.scrollTop= self.divcontent.scrollHeight;
            // 记录渲染过的页面
            //var doc = editor.contentDocument;
            //self.msgList[selDay] = self.divcontent.innerHtml;
        }
    }, 0);
},

_showMsg: function( docFrag, userId, ts, type, msg) {
     var infoFormat="<img src='//im.uubridge.cn:8028/home/felix/img/skin/info.png' style='vertical-align:text-bottom;'/>";
       infoFormat+="<span style='font-size:12px;color:#505050;'>{info}</span>";
	   
	if ('chat' != type) {
		var arr = msg.split(':');
		var descArr = this.cmdMsg[arr[0]];
		if (descArr) {
			msg = userId == this.selfId ? descArr[0] : descArr[1];
			if (arr.length > 1)
				msg += arr.slice(1).join(':');
		} else {
			if (userId == this.selfId)
				msg = this.cmdMsg.unknown[0] + msg;
			else
				msg = this.cmdMsg.unknown[1] + msg;
		}
		msg = infoFormat.replace('{info}', msg);
    }

    if (userId != this.showId)
        this._normalShow(docFrag, userId, ts, msg);
    else
        this._combinedShow(docFrag, ts, msg);
},

_normalShow: function(docFrag, userId, ts, msg) {
   var self=this;
    var div = document.createElement('div');
   //div.setAttribute('style', 'clear:both;width:100%;');
   div.setAttribute('class','otherdiv');
    var avatar = this.net._getDisplayAvatar(userId);
    var color = userId == this.selfId ? '008000' : '0000FF';
    var name = this.net._getDisplayName(userId);
    var time = this._formatTime(ts);
    div.innerHTML = this.msgFormat.replace(/{[^}]+}/g, function(str) {
        switch (str) {
        case '{avatar}':
            return avatar;
        case '{color}':
            return color;
        case '{name}':
            return name;
        case '{time}':
            return time;
        case '{message}':
            return msg;
        default:
            return str;
        }
    });

     self.divcontent.appendChild(div);
    this.showId = userId;
},

_combinedShow: function( docFrag, ts, msg) {
    var frag = document.createDocumentFragment();

    var title = document.createElement('div');
	Module["dom-attr"].set(title,"style", 'font-size:12px;color:#8C8C8C;');
    title.innerHTML = this._formatTime(ts);
    frag.appendChild(title);

    var input = document.createElement('div');
    input.innerHTML = msg;
    frag.appendChild(input);

        docFrag.lastChild.children[1].appendChild(frag);
},

_formatTime: function(ts) {
    var now = new Date();
    var d = new Date(ts);
    var Y = d.getFullYear();
    var M = d.getMonth();
    var D = d.getDate();
    var date = '';
    if (now.getFullYear() != Y || now.getMonth() != M || now.getDate() != D)
        date = Y + '-' + this._numTo2c(M + 1) + '-' + this._numTo2c(D) + ' ';
    return (date + this._numTo2c(d.getHours()) + ':'
            + this._numTo2c(d.getMinutes()) + ':'
            + this._numTo2c(d.getSeconds()));
},

_numTo2c: function(num) {
    return num >= 10 ? num.toString() : '0' + num.toString();
},
_inittime:function(div,id){
     
           var self=this;
			var _div1 = _c('div', {
             
			id:'_content1_'+id+''
        },div);
      
	this.contenttime=new Module.ContentPane({
		   sizeMin:'20',
		   sizeShare:'20'
	},'_content1_'+id+'');
	
},
_inithistory:function(div,id){
       var self=this;
			var _div1 = _c('div', {
         
			id:'_content2_'+id+''
        },div);
     
	this.contenttime2=new Module.ContentPane({
	    
		   sizeMin:'20',
		   sizeShare:'20'
		  
	},'_content2_'+id+'');
},
_initHistoryRecordDlg:function(id,myid){
		this.selfId = myid;
		
        if (!_get('_HistoryRecordDlg_'+id+'')) {
            _c("div", {id:'_HistoryRecordDlg_'+id+''}, Module.window.body());
	    }
		var self=this;
		//this.net.getArchiveList(id);
		 if(_r('_HistoryRecordDlg_'+id+''))
		{
		 dijit.byId('_HistoryRecordDlg_'+id+'').bringToTop();
		 return;
		 }
		this.allId.push(id);

	      self.net.getArchiveList(id);
		 var str="<div dojoType='dijit.layout.SplitContainer'";
		 str+="orientation='horizontal'";
		str+="sizerWidth='7'";
		str+="activeSizing='true'";
		str+="style='border: 1px solid #bfbfbf; float: left;width: 500px; height: 400px;'>";
		str+="<div dojoType='dijit.layout.ContentPane'  id ='_addhistoryrecord_"+id+"' sizeMin='20' sizeShare='20'>";
	
		str+="</div>";
		str+="<div dojoType='dijit.layout.ContentPane' id ='_addhistoryrecord2_"+id+"' sizeMin='50' sizeShare='50'>";
		str+="</div>";
	   str+="</div>";
		var style="position:absolute;top:100px;left:340px;width:500px;height:400px;";
		this.HistoryRecordDlg = new Module.FloatingPane({
            /* title:"<img src='//im.uubridge.cn:8028/home/felix/img/skin/icons/default16.png'>"+this.net._getDisplayName(id)+"-消息记录", */
			title: this.net._getDisplayName(id)+"-消息记录",
            style: style,
            dockable: true,
			resizable: true,
			content:str,
			maxable: true,
            close: function(){
                this.inherited("close", arguments);
                self.HistoryRecordDlg = null;
            }
        }, '_HistoryRecordDlg_'+id+'');
        this.HistoryRecordDlg.startup();
        this.HistoryRecordDlg.show();
        this.HistoryRecordDlg.bringToTop();
		this.net._HidePaneScroll(this.HistoryRecordDlg);
		 var _div1 = _c('div', {
            _class: 'divtime'
        }, _get('_addhistoryrecord_'+id+''));
		var _div2 = _c('div', {
            _class: 'divhistory'
         
        }, _get('_addhistoryrecord2_'+id+''));
		 _for([_div1,_div2], function(obj){
		    var _class = Module["dom-attr"].get(obj, "_class");
		    Module["dom-attr"].set(obj, 'class', _class);
		    Module["dom-attr"].remove(obj, '_class');
	    });
		this._inittime(_div1,id);
		this._inithistory(_div2,id);
		
		self.net.getArchiveList(id);
        
},
_DestroybyId:function(id)
{
    
	 _for(['_HistoryRecordDlg_'+id+'', '_addhistoryrecord_'+id+'','_addhistoryrecord2_'+id+'',
            '_content1_'+id+'','_content2_'+id+''], function(_id){
			
        if (_r(_id))
            _r(_id).destroy();
            
    });
	     	this.treetime=null;
		this.myStore=null;
		this.myModel=null;
		this.contenttime=null;
		this.contenttime2=null;
        this.divcontent=null;
},
_Destroy:function()
{
   var self=this;
    var item;
	var i=0;
   
   while(i<this.allId.length)
   {
   item=this.allId.pop();
   self._DestroybyId(item);
   i++;
   }
 

}
}
window.HistoryRecord = HistoryRecord;
})(window);