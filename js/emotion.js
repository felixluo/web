(function(window){

function emotion() {
	   
    	this.allId=new Array();
		
}

emotion.prototype = {
constructor: emotion,

// _init:
initemotion: function(x,y,id,callback){
     
    var self=this;
  this.allId.push(id);
 				  var emName=['微笑'  , '撇嘴'  , '色'    , '发呆'  , '得意'  , '流泪'  ,
         '害羞'  , '闭嘴'  , '睡'    , '大哭'  , '尴尬'  , '发怒'  ,
         '调皮'  , '呲牙'  , '惊讶'  , '难过'  , '酷'    , '冷汗'  ,
         '抓狂'  , '吐'    , '偷笑'  , '可爱'  , '白眼'  , '傲慢'  ,
         '饥饿'  , '困'    , '惊恐'  , '流汗'  , '憨笑'  , '大兵'  ,
         '奋斗'  , '咒骂'  , '疑问'  , '嘘...' , '晕'    , '折磨'  ,
         '衰'    , '骷髅'  , '敲打'  , '再见'  , '擦汗'  , '抠鼻'  ,
         '鼓掌'  , '糗大了', '坏笑'  , '左哼哼', '右哼哼', '哈欠'  ,
         '鄙视'  , '委屈'  , '快哭了', '阴险'  , '亲亲'  , '吓'    ,
         '可怜'  , '菜刀'  , '西瓜'  , '啤酒'  , '篮球'  , '乒乓'  ,
         '咖啡'  , '饭'    , '猪头'  , '玫瑰'  , '凋谢'  , '示爱'  ,
         '爱心'  , '心碎'  , '蛋糕'  , '闪电'  , '炸弹'  , '刀'    ,
         '足球'  , '瓢虫'  , '便便'  , '月亮'  , '太阳'  , '礼物'  ,
         '拥抱'  , '强'    , '弱'    , '握手'  , '胜利'  , '抱拳'  ,
         '勾引'  , '拳头'  , '差劲'  , '爱你'  , 'NO'    , 'OK'    ];	
         var image2="<div class='smile' >"
		image2+="<img src='//im.uubridge.cn:8028/home/felix/img/skin/face.png'  />";
		image2+="</div>";   

		var emotiondlg=new Module.TooltipDialog({
          style:"height:175px;width:441px; ",
	      
	    content:image2,
		onClick:function(event){
		var self=this;
		
         if(event.clientX>=x&&event.clientX<=x+433)
	     var x1=event.clientX-x;
	
		 if(event.clientY<=y&&event.clientY>=y-175)
		 var y1=y-event.clientY-5;
	
		 var row = 5-(Math.floor(y1 / 29));

         var col = Math.floor(x1 / 29) ;

		 var i = row * 15 + col;
	     if(i<90&&i>=0)
		{
		 var str=''+ i + '.gif';
		 callback(str);
		 }
	     Module.popup.close(emotiondlg);
		},
		onBlur: function()
		{ 
		 Module.popup.close(emotiondlg);
		} ,
		onMouseMove: function(event)
		{
		var self=this;
		
         if(event.clientX>=x&&event.clientX<=x+433)
	     var x1=event.clientX-x;
	
		 if(event.clientY<=y&&event.clientY>=y-175)
		 var y1=y-event.clientY-5;
	
		 var row = 5-(Math.floor(y1 / 29));

         var col = Math.floor(x1 / 29) ;

		 var i = row * 15 + col;
		  var top=row * 29+4-175;
		  var left=col * 29+6;
        if(i<90&&i>=0)
		{var image="<div class='smile' >"
		image+="<img src='//im.uubridge.cn:8028/home/felix/img/skin/face.png'  />";
		image+="</div>";
		image+="<div class='image_div' >";
		image+="<img src='//im.uubridge.cn:8028/home/felix/em/"+ i + ".gif'  title='"+emName[i]+"'/>";
		//
		image+="</div>";
		
		emotiondlg.set("content",image);
		
		Module["dom-style"].set(Module.query(".image_div",emotiondlg.domNode)[0],"top",top+"px");
		Module["dom-style"].set(Module.query(".image_div",emotiondlg.domNode)[0],"left",left+"px");
		Module["dom-style"].set(Module.query(".smile",emotiondlg.domNode)[0],"top","0px");
		Module["dom-style"].set(Module.query(".smile",emotiondlg.domNode)[0],"left","0px");
		
		var testTop = Module["dom-style"].get(Module.query(".image_div",emotiondlg.domNode)[0],"top");
		var testLeft = Module["dom-style"].get(Module.query(".image_div",emotiondlg.domNode)[0],"left");		
		}
		emotiondlg.focus();
         
		},
		onMouseLeave:function(event)
		{
		Module.popup.close(emotiondlg);
		}
		
		
     });
	 emotiondlg.focus();
	 Module["dom-class"].add(emotiondlg.domNode,"emotionFrame");
     Module.popup.open({
	
	 popup: emotiondlg,
	 around:Module.dom.byId('selfEditor'+id),
	
	 orient: ["above"],
	 onClose:function(){
        Module.popup.close(emotiondlg);
	 }
	 
	 });

	 
	
},// end of _init

// _Destroy:
_Destroyid: function(id){
     _for(['_emotiondlg_'+id+''], function(_id){
			
        if (_r(_id))
            _r(_id).destroy();
            
    });
	 Module.popup.close(emotiondlg);
	 



},// end of _Destroy
_Destroy: function()
{
var self=this;
  Module.popup.close(emotiondlg);

	
}

};window.emotion = emotion;
})(window);