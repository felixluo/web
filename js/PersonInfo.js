(function(window) {
function PersonInfo(net) {
        this.PersonInfoDlg = null;
		this.net = net;
	    this.myId=0;
        this.allId=new Array();
}
PersonInfo.prototype = {
constructor: PersonInfo,
_initProfile: function(div, bReq,id,obj){
        var self =this;
		var account=self.net.getAccount(id);
     	 var _divava = _c('div', {
            _class: 'divava2',
			//style:'float: left;			width: 94px;background-color: white; padding-top:20px;padding-left:20px; ',
			id:'_addShowAva_'+id+''
        }, div);
		var _divprofile = _c('div', {
            _class: 'divprofile3',
			//style:'float: right; width: 390px;background-color: white;',
            align: 'right',
			id:'_addShowProfile_'+id+''
        },div);
   /* if (!_get('_addShowAva_'+id+'')) {
        _c("div", {id:'_addShowAva_'+id+'',
		align:'center',
		style:'float: left; width: 114px;height: 91px;background-color: white;'
		}, div);
	}

	if (!_get('_addShowProfile_'+id+'')) {
        _c("div", {id:'_addShowProfile_'+id+'',align:'center',style:'float: right; width: 390px;height: 91px;background-color: white;'}, div);
	}*/

     _c("img", {
            id: 'findAva'+id+'',
           style:'padding-top:20px;padding-left:10px;'
             
    }, '_addShowAva_'+id+'');

    var _tc = new Module.TableContainer({
        cols:1, 
        spacing: '10px',
		style: 'height:91px;background-color: white;'
    }, "_addShowProfile_"+id+"");
    var _t1 = new Module.TextBox({id: 'PersonID'+id+'',label: '账号：', readOnly: true});
    var _t2 = new Module.TextBox({id: 'PersonNickname'+id+'', label: '昵称：',readOnly: bReq});
    var _t3 = new Module.TextBox({id: 'PersonBuzz'+id+'', label: '签名：',readOnly: bReq});
	      if (!obj)   return ;
      _t1.set('value', account);
	  if(obj.nickname)
      _t2.set('value', obj.nickname);
	  if(obj.buzz)
      _t3.set('value', obj.buzz);
	  
      Module['dom-attr'].set(_get('findAva'+id+''), 'src', "//im.uubridge.cn:8028/"+obj.avatar);
    _tc.addChild(_t1);
    _tc.addChild(_t2);
    _tc.addChild(_t3);
    _tc.startup();

	 
    // ie:�ı�table height:100%
  //var _table = Module.query('#_addShowProfile_'+id+'>table')[0];
	//var _table = Module.query('#_addShowProfile_'+id+'>table', dojo.byId("_addShowProfile_"+id+""));
	Module["dom-attr"].set(_tc.domNode.firstChild, 'height', '100%');
	 _for([_divava, _divprofile], function(obj){
		    var _class = Module["dom-attr"].get(obj, "_class");
		    Module["dom-attr"].set(obj, 'class', _class);
		    Module["dom-attr"].remove(obj, '_class');
	    });
},
_initProtect: function(div,bReq,id,obj){
       var dis="";
      if(bReq)
	  {
	  dis="disabled";
	  }
	  else
	  {
	  dis="";
	  }
       if (!_get('_addProtect_'+id+'')) {
        _c("div", {id:'_addProtect_'+id+'',align:'right'}, div);
	   }
	  var _tc = new Module.TableContainer({
        cols:1, 
        spacing: '2px', 
        style: 'height:22px;background-color: white;'
    }, '_addProtect_'+id+'');
	var stateStore = new Module.Memory({
        data: [
            {name:"对好友公开", id:'AL'+id+''},
            {name:"对所有人公开", id:'AK'+id+''},
			{name:"不公开", id:'As'+id+''}
        ]
    });
	var _t1=new Module.ComboBox({ 
	       id:'selectProtect'+id+'',
		   title:'资料保护：',
		   value:"对好友公开",
		   name:"protect",
		   store:stateStore,
		   disabled:dis,
		   searchAttr:"name"
	});
	//var _t1= new Module.TextBox({id: 'selectProtect'+id+'',style:'width:143px;',label: '资料保护：', readOnly: bReq});
	 if (!obj)   return ;
	 if(obj.privacy)
	 {
	  if(obj.privacy=="friends")
     _t1.set("value","对好友公开");
	 else if(obj.privacy=="public")
	   _t1.set("value","对所有人公开");
	    else if(obj.privacy=="onlyme")
	   _t1.set("value","不公开");
	 }
	
     _tc.addChild(_t1);
	 _tc.startup();
	
	//var _table = Module.query('#_addProtect_'+id+' > table')[0];
	Module["dom-attr"].set(_get('_addProtect_'+id+''), 'height', '50%');
},
_initShow: function(div,bReq,id,obj){
        var dis="";
      if(bReq)
	  {
	  dis="disabled";
	  }
	  else
	  {
	  dis="";
	  }
       if (!_get('_PersonShow_'+id+'')) {
        _c("div", {id:'_PersonShow_'+id+'',align:'center'}, div);
	   }
	  var _tc = new Module.TableContainer({
        cols:3, 
		orientation:'vert',
        spacing: '10px', 
		//"labelWidth":'143',
		customClass:'greyLNF',
        style: 'height:175px;background-color: white;text-align: left;'
       }, '_PersonShow_'+id+'');
	  var _t11 = new Module.TextBox({id: 'Name'+id+'',style:'width:143px;',label: '姓名：', readOnly: bReq});
      var stateStoreCountry = new Module.Memory({
        data: [
            {name:"中国", id:'China'+id+''},
            {name:"美国", id:'USA'+id+''},
			{name:"英国", id:'Eng'+id+''},
            {name:"日本", id:'Jan'+id+''}
        ]
       });
	   var _t12=new Module.ComboBox({ 
	       id:'selectcountry'+id+'',
		   title:'国家：',
		   name:"country",
		   style:'width:143px;',
		   disabled:dis,
		   store:stateStoreCountry,
		   searchAttr:"name"
	   });
	   //var _t12 = new Module.TextBox({id: 'selectcountry'+id+'',style:'width:143px;',label: '国家：', readOnly: bReq});
	  var _t13 = new Module.TextBox({id: 'email'+id+'',style:'width:143px;',label: '电子邮件：', readOnly: bReq});
	   var stateStoresex = new Module.Memory({
        data: [
            {name:"男", id:'NAN'+id+''},
            {name:"女", id:'LV'+id+''}
        ]
       });
	   var _t21=new Module.ComboBox({ 
	       id:'selectsex'+id+'',
		   title:'性别：',
		   name:"sex",
		   store:stateStoresex,
		   style:'width:143px;',
		     disabled:dis,
		   searchAttr:"name"
	   });
	   //var _t21=new Module.TextBox({id:'selectsex'+id+'',style:'width:143px;',label:'性别: ',readOnly:bReq});
	    var stateStoreProvince = new Module.Memory({
        data: [
            {name:"安徽", id:'anhui'+id+''},
            {name:"上海", id:'shanghai'+id+''},
			{name:"北京", id:'beijing'+id+''},
            {name:"重庆", id:'chongqing'+id+''},
			{name:"天津", id:'tianjin'+id+''},
            {name:"山东", id:'shandong'+id+''},
			{name:"河南", id:'henan'+id+''}
        ]
       });
	   var _t22=new Module.ComboBox({ 
	       id:'selectprovince'+id+'',
		   title:'省份：',
		   name:"province",
		   store:stateStoreProvince,
		   style:'width:143px;',
		    disabled:dis,
		   searchAttr:"name"
	   });
	   //var _t22=new Module.TextBox({id:'selectprovince'+id+'',style:'width:143px;',label:'省份：',readOnly:bReq});
	   var _t23 = new Module.TextBox({id: 'telephone'+id+'',   style:'width:143px;',label: '工作电话：', readOnly: bReq});
	     //var _t31=new Module.TextBox({id:'selectbirth'+id+'',style:'width:143px;',label:'生日：',readOnly:bReq});
	   var _t31=new Module.DateTextBox({
	        title:'生日：',
			style:'width:143px;',
			disabled:dis,
			id:'selectbirth'+id+''
			
	   });
	     var stateStoreCity = new Module.Memory({
        data: [
            {name:"安庆", id:'anqing'+id+''},
            {name:"上海", id:'shanghai2'+id+''},
			{name:"北京", id:'beijing2'+id+''},
            {name:"重庆", id:'chongqing2'+id+''},
			{name:"天津", id:'tianjin2'+id+''},
            {name:"济南", id:'jinan'+id+''},
			{name:"郑州", id:'zhengzhou'+id+''}
        ]
       });
	   var _t32=new Module.ComboBox({ 
	       id:'selectcity'+id+'',
		   title:'城市：',
		   name:"city",
		   store:stateStoreCity,
		   style:'width:143px;',
		     disabled:dis,
		   searchAttr:"name"
	   });
	   	     //var _t32=new Module.TextBox({id:'selectcity'+id+'',style:'width:143px;',label:'城市：',readOnly:bReq});
	   var _t33 = new Module.TextBox({id: 'cellphone'+id+'',   style:'width:143px;',label: '手机号码：', readOnly: bReq});
	    if (!obj)   return ;
		if(obj.name)
          _t11.set('value', obj.name);
		  if(obj.email)
		  _t13.set('value', obj.email);
		  if(obj.mobilePhone)
		   _t33.set('value', obj.mobilePhone);
		   if(obj.workPhone)
		  _t23.set('value', obj.workPhone);
		  if(obj.city)
		  _t32.set('value', obj.city);
		  if(obj.birthday)
		  _t31.set('value', obj.birthday);
		  if(obj.province)
		 _t22.set('value', obj.province);
		 if(obj.gender)
		_t21.set('value', obj.gender);
		if(obj.country)
		_t12.set('value', obj.country);
	    _tc.addChild(_t11);
		_tc.addChild(_t21);
	    _tc.addChild(_t31);
		_tc.addChild(_t12);
		_tc.addChild(_t22);
	    _tc.addChild(_t32);
		_tc.addChild(_t13);
		_tc.addChild(_t23);
	    _tc.addChild(_t33);
	    _tc.startup();
		
			//   var _table = Module.query('#_PersonShow_'+id+' > table')[0];
	  Module["dom-attr"].set(_tc.domNode.firstChild, 'height', '100%');
},
_initMsg:function(div,bReq,id,obj){
    var dis="";
      if(bReq)
	  {
	  dis="disabled";
	  }
	  else
	  {
	  dis="";
	  }
    if (!_get('_MyNetwork_'+id+'')) {
        _c("div", {id:'_MyNetwork_'+id+'',innerHTML: '我的网址：'}, div);
	}

	if (!_get('_network_'+id+'')) {
        _c("div", {id:'_network_'+id+'', align: 'center'}, div);
	}
     var _e = new Module.TextBox({id: 'MsgNetwork'+id+'',   style:'height:35px;width:500px;', readOnly: bReq},'_network_'+id+'');
    /*var _e = new Module.Editor({
        id: 'MsgNetwork'+id+'',
        plugins: [],
        height: '30px',
        focusOnLoad: true,
		 disabled:dis
    }, '_network_'+id+'');*/
	if (!obj)   return ;
	if(obj.description)
          _e.set('value', obj.description);
	
},
_initMsg2:function(div,bReq,id,obj){
    var dis="";
      if(bReq)
	  {
	  dis="disabled";
	  }
	  else
	  {
	  dis="";
	  }
 if (!_get('_MyExplain_'+id+'')) {
        _c("div", {id:'_MyExplain_'+id+'',innerHTML: '个人说明：'}, div);
	}

	if (!_get('_explain_'+id+'')) {
        _c("div", {id:'_explain_'+id+'', align: 'center'}, div);
	}

    var _e = new Module.Editor({
        id: 'MsgExplain'+id+'',
        plugins: [],
        height: '80px',
        focusOnLoad: true,
		 disabled:dis
    }, '_explain_'+id+'');
	if (!obj)   return ;
	if(obj.website)
          _e.set('value', obj.website);
},
_initButton:function(div,bReq,id,obj,fun){
        var self = this;
		
		  var _btn = new Module.Button({
		    label: '修改',
	    	style: 'margin-top: 5px;margin-right:20px;',
	    	onClick: function(){
                obj.nickname = dijit.byId('PersonNickname'+id+'').get('value');
				obj.buzz=dijit.byId('PersonBuzz'+id+'').get('value');
				obj.name=dijit.byId('Name'+id+'').get('value');
				obj.gender=dijit.byId('selectsex'+id+'').get('value');
				obj.birthday=dijit.byId('selectbirth'+id+'').get('value');
				obj.country=dijit.byId('selectcountry'+id+'').get('value');
				obj.province=dijit.byId('selectprovince'+id+'').get('value');
				obj.city=dijit.byId('selectcity'+id+'').get('value');
				obj.email=dijit.byId('email'+id+'').get('value');
				obj.workPhone=dijit.byId('telephone'+id+'').get('value');
				obj.mobilePhone=dijit.byId('cellphone'+id+'').get('value');
				obj.website=dijit.byId('MsgExplain'+id+'').get('value');
				obj.description=dijit.byId('MsgNetwork'+id+'').get('value');
				var privacy=dijit.byId('selectProtect'+id+'').get('value');
				if(privacy=="对好友公开")
				obj.privacy="friends";
				else if (privacy=="对所有人公开")
				obj.privacy="public";
				else if(privacy=="不公开")
				 obj.privacy="onlyme";
				if (fun)
					fun(obj);
				
				 self._DestroybyId(id);
		    }
	    }, 'ChangeOK'+id+'');
	    _btn.startup();
	    var _btnCel = new Module.Button({
		    label: '取消',
	    	style: 'margin-top: 5px;margin-right:20px;',
	    	onClick: function(){
                /*var _id = _r('findID').get('value');
                if (self.subCb && _id) self.subCb(false, _id);
                self._Destroy();*/
				 self._DestroybyId(id);
		    }
	    }, 'CancelOK'+id+'');
	    _btnCel.startup();
	
		
	  
},
//bReq tell whether it is self or other
_initPersonInfoDlg:function(bReq,id,fun){
  //if (this.PersonInfoDlg)    return this.PersonInfoDlg.show();
    if (!_get('_PersonInfoDlg_'+id+'')) {
            _c("div", {id:'_PersonInfoDlg_'+id+''}, Module.window.body());
	    }
        var self=this;
		var obj=self.net.getProfile(id);
        if(_r('_PersonInfoDlg_'+id+''))
		{
		 dijit.byId('_PersonInfoDlg_'+id+'').bringToTop();
		 return;
		 }
		if(!bReq)
		this.myId=id;
		else
		this.allId.push(id);
		
        var style="position:absolute;top:0px;left:340px;width:500px;height:550px;";
        this.PersonInfoDlg = new Module.FloatingPane({
			title: "Uubridge UU",
            style: style,
            dockable: true,
            content: '<div id="_addContent_'+id+'"></div>',
            close: function(){
                this.inherited("close", arguments);
                self.PersonInfoDlg = null;
            }
        }, '_PersonInfoDlg_'+id+'');
        this.PersonInfoDlg.startup();
        this.PersonInfoDlg.show();
        this.PersonInfoDlg.bringToTop();
        this.net._HidePaneScroll(this.PersonInfoDlg);
		 var _div1 = _c('div', {
            _class: 'divProfile2'
        }, _get('_addContent_'+id+''));
		var _div2 = _c('div', {
            _class: 'divProtect',
            align: 'right'
        }, _get('_addContent_'+id+''));
		var _div3 = _c('div', {
            _class: 'divInfo',
            align: 'left'
        }, _get('_addContent_'+id+''));
		var _div41 = _c('div', {
            _class: 'divMsg2'
        }, _get('_addContent_'+id+''));
		var _div42 = _c('div', {
            _class: 'divMsg3'
        }, _get('_addContent_'+id+''));
	    var _div5 = _c('div', {	
		    _class: '_add_btn_',
		    align: 'right',
		    innerHTML: '<div id="ChangeOK'+id+'"></div><div id="CancelOK'+id+'"></div>'
	    }, _get('_addContent_'+id+''));
		 _for([_div1, _div2, _div3, _div41,_div42,_div5], function(obj){
		    var _class = Module["dom-attr"].get(obj, "_class");
		    Module["dom-attr"].set(obj, 'class', _class);
		    Module["dom-attr"].remove(obj, '_class');
	    });
		this._initProfile(_div1, bReq,id,obj);
		this._initProtect(_div2,bReq,id,obj);
        this._initShow(_div3,bReq,id,obj);
        this._initMsg(_div41,bReq,id,obj);
		this._initMsg2(_div42,bReq,id,obj);
		if(!bReq)
        this._initButton(_div5,bReq,this.myId,obj,fun);
		else return;

	   
},
_DestroybyId:function(id)
{
    
	 _for(['_addShowAva_'+id+'', '_addShowProfile_'+id+'','PersonID'+id+'',
            'PersonNickname'+id+'','PersonBuzz'+id+'', '_addProtect_'+id+'', 
            'selectProtect'+id+'', '_PersonShow_'+id+'', 'Name'+id+'', 'selectcountry'+id+'',
			'email'+id+'','selectsex'+id+'','selectprovince'+id+'','telephone'+id+'','selectbirth'+id+'',
			'selectcity'+id+'','cellphone'+id+'','_MyNetwork_'+id+'','_network_'+id+'',
			'MsgNetwork'+id+'','_MyExplain_'+id+'','_explain_'+id+'','MsgExplain'+id+'','ChangeOK'+id+'','CancelOK'+id+'','findAva'+id+'','_PersonInfoDlg_'+id+''], function(_id){
			
        if (_r(_id))
            _r(_id).destroy();
            
    });
	
   
},

_Destroy:function()
{
   var self=this;
    var item;
	var i;
	if(this.myId!=0)
   self._DestroybyId(this.myId);
   if(this.allId.length>0){
   for(i=0;i<this.allId.length;i++)
   {
   item=this.allId.pop();
   self._DestroybyId(item);
   }
   }

}
}
window.PersonInfo = PersonInfo;
})(window);
