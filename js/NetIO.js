(function(window){

function NetIO(im) {
	this.im = im;
    this.key = '';
	this.mcake = null;
	this.LoginOnBack = null;
	return this;
}

NetIO.prototype = {
constructor: NetIO,

// init:
//	NetIO初始化
init: function(bIsgetChatInfo){
    //this.key = Module.MD5((new Module.Date()).getMilliseconds().toString());  // 根据当前时间确定KEY值 
	if (bIsgetChatInfo)
		this.getChatInfo();
	this.mcake = new window.Mcake(this, this.cbFunc, null);
    this.getPortal('chat');
},// end of init
getArchiveMsg: function(fname) {
    this.mcake.getArchiveMsg(fname);
},
getChatInfo: function() {
    var info = document.getElementById('chatInfo').value;
    var kv, arr = info.split(':'), infoObj = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        kv = arr[i].split('=');
        infoObj[kv[0]] = decodeURIComponent(kv[1]);
    }
    window.chatInfo = infoObj;
}, // end of getChatInfo


login: function(username, password, onBack) {
	var self = this;
	this.LoginOnBack = onBack;
	this.mcake.login(username, password);
},// end of login

// stop
//	用户退出
stop: function(){
    if (this.im.myself)
        this.im.myself.id = this.mcake.myId(); // 保证重新登录时，显示用户名
	this.mcake.stop();
},// end of stop

//getPortal:
getPortal: function(label) {
	return this.mcake.getPortal(label);
},// end of getPortal

// findBuddy
//      查找好友
findBuddy: function(bid, cb) {
    this.findCb = cb;
    return this.mcake && this.mcake.findProfile(bid);
},// end of findBuddy

// subscribe:
//      添加好友
subscribe: function(bid, msg) {
    return this.mcake && this.mcake.subscribe(bid, msg);            
},// end of subscribe

// getDisplayName
// 	获取好友的昵称
getDisplayName: function(bid){
	return this.mcake.getDisplayName(this.getCodeForHash(bid));
},// end of getDisplayname

getArchiveList: function(bid) {
	var id = this.getCodeForHash(bid);
	if (id)
		this.mcake.getArchiveList(id);
},//

// getDisplayAvatar
// 	获取好友的昵称
getDisplayAvatar: function(bid){
    var result = this.mcake.getDisplayAvatar(this.getCodeForHash(bid));
    if (!result)
        result = "/avatar/default.png";
	return this.mcake.getDisplayAvatar(this.getCodeForHash(bid));
},// end of getDisplayname

// isOnline
// 	判断好友是否在线
isOnline: function(bid) {
	return this.mcake.isOnline(this.getCodeForHash(bid));
},// end of isOnline

// isGroup
// 	判断是否是群
isGroup: function(bid) {
	return this.mcake.isGroup(this.getCodeForHash(bid));
},// end of isOnline

// showMsg:
//	显示该ID好友的消息
// bid:
//	好友ID
showMsg: function(bid) {
	return this.mcake.showMsg(this.getCodeForHash(bid));
},// endof showMsg

getTrades: function(bid) {
	if (!this.mcake.isGroup(bid))
		return this.mcake.getTrades(this.getCodeForHash(bid));
},

// sendMsg:
// 发送消息
sendMsg: function(bid, type, msg){
	return this.mcake.sendMsg(this.getCodeForHash(bid), type, msg);
},// end of sendMsg

openTrade: function(uid, tid) {
    this.mcake.openTrade(uid, tid);
},

closeTrade: function(uid, tid) {
    this.mcake.closeTrade(uid, tid);
},

// setStatus: 
//	修改个人状态
setStatus: function(status) {
	return this.mcake.setStatus(status);
},// end of setStatus

// setNickname: 
//	修改昵称
setNickname: function(nickname) {
	return this.mcake.setNickname(nickname);
},// end of setNickname

// setSign: 
//	修改个人签名
setSign: function(sign) {
	return this.mcake.setBuzz(sign);
},// end of setSign

// cmpBuddy: 
//	好友排序函数，，
//	比较两好友前后
cmpBuddy: function(uid, id) {
	return this.mcake.cmpBuddy(this.getCodeForHash(uid), this.getCodeForHash(id));
},// end of cmpBuddy

// getProfile
//      获取好友资料
getProfile: function(bid) {
    var bId = this.getCodeForHash(bid);
    if (bId)
        if (bId == this.mcake.myId())
            return this.mcake.myProfile();
        else
            return this.mcake.buddyProfile(bId);
    return '';
},// end of getProfile

// putProfile
//      更改个人资料
putProfile: function(){
    return this.mcake && this.mcake.putProfile();            
},// end of putProfile

// sub
//      添加好友后，系统回调消息
sub: function(args) {
    //var hash = this.im.getHashCode(args.uid);
    //if (this.hash[hash]) return true;
    //this.hash[hash] = args.uid;    // 添加到hash列表中
    var avatar = this.mcake.getDisplayAvatar(args.uid);
    var pro = this.mcake.buddyProfile(args.uid);
    pro.id  = this.getHashCode(args.uid);
    pro.ava = avatar?avatar:this.im.fileDir+"/img/skin/icons/default48.png";
    pro.status = "contact";
    pro.sign = pro.buzz;
	//this.im.onAddBuddy(pro, false);
    return true;     
},// end of sub

// delBuddy
//       删除好友
delBuddy: function(bid) {
    return this.mcake && this.mcake.unsubscribe(this.getCodeForHash(bid));           
},// end of delBuddy

formatTime: function(ts) {
    var now = new Date();
    var d = new Date(ts);
    var Y = d.getFullYear();
    var M = d.getMonth();
    var D = d.getDate();
    var date = '';
    if (now.getFullYear() != Y || now.getMonth() != M || now.getDate() != D)
        date = Y + '-' + this.numTo2c(M + 1) + '-' + this.numTo2c(D) + ' ';
    return (date + this.numTo2c(d.getHours()) + ':'
            + this.numTo2c(d.getMinutes()) + ':'
            + this.numTo2c(d.getSeconds()));
},

numTo2c: function(num) {
    return num >= 10 ? num.toString() : '0' + num.toString();
},
/**
 ** 获取字符串的哈希值
 ** @param {String} str
 ** @param {Boolean} caseSensitive
 ** @return {Number} hashCode
 */
getHashCode:function(str) {
    return str;
    if (!str)   return str;
    var arr = str.split("");
    var result = "";
    var self = this;
    _for(arr, function(s){
            var r = self.getThreeCode(s.charCodeAt(0));
            if (r != '')
                result += r;
    });
    return result;
},
getThreeCode: function(num) {
    if (num<10)
        return '00'+num.toString();
    else if (num<100)
        return '0'+num.toString();
    else if (num<1000)
        return num.toString();
    return '';
},// end of getThreeCode
getCodeForHash: function(str) {
    return str;
    if (!str)   return str;
    var arr = str.split("");
    var i = 0;
    var result = "";
    while (i < arr.length) {
        var r = '';
        var ii = 0;
        while (++ii < 4)
            r += arr[i++];
        result += String.fromCharCode(new Number(r));
    }
    return result;
},// end of getCodeForHash
// cbFunc:
//	mcak调用函数
cbFunc: function(cbData, type, data) {
	console.log(type);
	console.log(data);
	var handler = cbHandlers[type];
	if (handler) {
		try {
			return handler.call(this, data);
		} catch (e) {
			console.log("cbFunc: " + e);
		}
	}
	return false;
}// end of cbFunc


};window.NetIO = NetIO;

var cbHandlers = {
portal: function(args) {
	if (args.type == 'chat') {
		Module.loadEnd();
		if (chatInfo && chatInfo.userId && (Module["dom-attr"].get(_get("chatInfo"), "webLogin") == 'true')) {
			this.im.initMainDlg();
			this.mcake.init({baseDir: args.portal.baseDir, fileDir: args.portal.fileDir, uid: chatInfo.userId, 
					session: chatInfo.session});
			this.mcake.start();
			Module["dom-attr"].set(_get("chatInfo"), "webLogin", "false");
		} else {
			this.mcake.init({baseDir: args.portal.baseDir, fileDir: args.portal.fileDir});
			this.im.showLoginDialog();
		}
	}
	else
		this.im.startStream(args.portal);		
},
login: function(args) {
	var self = this;
	this.LoginOnBack(args, function(){
		self.mcake.start();
	});
},
myProfile: function(args) {
	var tmpSelf = new Object;
	if (args.profile) {
		var profile = args.profile;
        var hash = this.getHashCode(this.mcake.myId());
		tmpSelf.id = hash;
		tmpSelf.nickname = profile.nickname;
		tmpSelf.sign = profile.buzz;
		tmpSelf.ava = args.avatar;
	}
	// 调用界面更新函数
	this.im.onUpdateProfile(tmpSelf);
	
},
myStatus: function(status) {
	if ( !this.im.stateButton ) return;
    this.im.stateButton.set("label", "<img src='//im.uubridge.cn:8028/home/felix/img/skin/status/"+status+".png'/>");
    if ('offline' == status)
        this.im.showAllOffline();
},
buddyProfile: function(args) {
	if (args.uid == this.mcake.myId())	return false;
	var buddy = new Object;
    var hash = this.getHashCode(args.uid);
	buddy.id = hash;
	buddy.nickname = this.mcake.getDisplayName(args.uid);
	buddy.sign = args.profile.buzz;
	buddy.ava = args.avatar;
	buddy.status = args.status?args.status:'contact';
	this.im.onAddBuddy(buddy, false);
	this.im.storeMemory(args);
},
endProfile: function(args) {
	this.mcake.setStatus('online');
	this.im.onEndProfile();
},
buddyStatus: function(args) {
	if (args.uid == this.mcake.myId())	return false;
    if (!args.status) args.status = "contact";
	this.im.onChangeBuddyStatus(this.getHashCode(args.uid), args.status, args.blink);
},
message: function(args) {
    args.ts = this.formatTime(args.ts);    // 格式化所有的时间
    if (args.type == 'sub') return true;

    var hash = this.getHashCode(args.uid);
    var bIsMyself = args.from == this.mcake.myId();
	if (args.type == 'cmd')
		return this.im.onCmd(hash, args.msg, args.ts,bIsMyself);
	else if (!this.mcake.isGroup(args.uid))
		return this.im.onAddUnreadMsg(hash, args.msg, args.ts, bIsMyself);
	else
		return this.im.onAddUnreadGroupMsg(this.getHashCode(args.from), hash, args.msg, args.ts, bIsMyself);
	return false;
},
open: function(args) {
	if (args) {
        var id = this.getHashCode(args);
		this.im.OpenChatWnd(id,true);		
        this.im.showTitleByNewMsg(id, false);
    }
},
logout: function(args) {
	return this.im.closeMain();
},
foundProfile: function(args) {
    if (!args.uid || !args.profile)
        return this.findCb && this.findCb(null);
    var buddy = args.profile;
    buddy.id  = args.uid;
    //console.log("buddyid:"+buddy.id);
    buddy.ava = args.avatar?args.avatar:this.im.fileDir+"/img/skin/icons/default48.png";
    return this.findCb && this.findCb(buddy);
},
newBuddy: function(args) {
    if (!args.uid)  return ;
    var uid = args.uid;
    var self = this;
    var pro = this.mcake.buddyProfile(uid);
    pro.id = uid;
    pro.msg = args.msg;
    pro.ava = this.mcake.getDisplayAvatar(uid);
    pro.cb = cb;
    function cb(isAccept, id){
        if (!id)   return ;
        if (isAccept)
            self.mcake.subscribed(id);
        else
            self.mcake.unsubscribed(id);
    }
    this.im.newBuddy(pro);
},
removeBuddy: function(args) {
    if (!args || (args == this.mcake.myId()))  return ;
    var hash = this.getHashCode(args);
    return this.im && this.im.onDelBuddy(hash, null);
},
trades: function(args) {
    return this.im && this.im.chatDlg && this.im.chatDlg.showTrades(args.trades,args.uid);
},
archiveList: function(args) {
	return this.im && this.im.onMsgList(args.msgList);
},
archiveMsg: function(args) {
    
        return this.im && this.im.onMsg(args.fname, args.data);
}
};
})(window);

