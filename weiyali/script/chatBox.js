

!function(window){
	var cb = {
		sourcePath: 'widget://res/chatBox/emotion', //表情源文件.
		/* 存储表情信息: JSON对象,以 表情字符 为属性名, 以 表情图片URL 为值.*/
		emotionData: '',
		talkFrame: '', //聊天记录存放区
		
		init: function(args){
			var self = this,
					chatBox = api.require('UIChatBox');
			//准备表情
			this.getImgsPaths(this.sourcePath, function(emotion){
			    self.emotionData = emotion;
			});
			
			chatBox.open({
				emotionPath: self.sourcePath,
		    styles: {
	        inputBar: {
	            borderColor: '#d9d9d9',
	            bgColor: '#f2f2f2'
	        },
	        inputBox: {
	            borderColor: '#B3B3B3',
	            bgColor: '#FFFFFF'
	        },
	        emotionBtn: {
	            normalImg: 'widget://res/chatBox/face1.png'
	        },
	        keyboardBtn: {
	            normalImg: 'widget://res/chatBox/key1.png'
	        },
	        indicator: {
	            target: 'both',
	            color: '#c4c4c4',
	            activeColor: '#9e9e9e'
	        }
		    },				
			}, function(ret){
				if(ret.eventType == 'send'){
					/* 用户输入了表情或者文字. */
					if(ret.msg){
						// var sendMsg = self.transText(ret.msg);
						api.sendEvent({
							name: 'iTalk',
							extra: {
								content: self.transText(ret.msg)
							}
						});
		//				self.chatBoxModule.resignFirstResponder();
					}					
				}
			});
			/*注册chatBox监听机制*/
			chatBox.addEventListener({
				target: 'inputBar',
				name: 'move'
			}, function(ret){
				var header = $api.dom('#header'),
						headerPos = $api.offset(header);
				api.setFrameAttr({
					name: 'talk_with',
					rect: {
						x: 0,
						y: headerPos.h,
						w: api.winWidth,
						h: api.winHeight - headerPos.h - ret.inputBarHeight - ret.panelHeight - ('ios'==api.systemType?0:8)
					}
				});		
				api.execScript({
					name: 'TalkWith',
					frameName: 'talk_with',
					script: "scrollToBottom()"
				});				
			});
		},
		/*
		 * 一个工具方法: 可以获取 所有表情图片的名称和真实url地址, 以JSON对像形式返回;
		 * 其中以"表情文本"为属性名, 以"图片真实路径"为属性值. 
		 */
		getImgsPaths: function(sourcePathOfChatBox, callback) {
			var jsonPath = sourcePathOfChatBox + ".json";
	
			api.readFile({
				path: jsonPath
			}, function(ret, err) {
				if (ret.status) {
					var emotionArray = JSON.parse(ret.data),
							emotion = {};
	
					for (var idx in emotionArray) {
						var emotionItem = emotionArray[idx];
	
						var emotionText = emotionItem["text"];
						var emotionUrl = "api.wgtRootDir/res/chatBox/emotion/" + emotionItem["name"] + ".png";
	
						emotion[emotionText] = emotionUrl;
					}
	
					/* 把 emotion对象 回调出去. */
					if ("function" === typeof(callback)) {
						callback(emotion);
					}
	
				}
			});
		},		
		transText: function(text, imgWidth, imgHeight) {
			var self = this,
					imgWidth = imgWidth || 25,
					imgHeight = imgHeight || 25;
	
			var regx = /\[(.*?)\]/gm;
			
			var textTransed = text.replace(regx, function(match) {
				var imgSrc = self.emotionData[match];
	
				if (!imgSrc) { /* 说明不对应任何表情,直接返回即可.*/
					return match;
				}
	
				var img = "<img class='expression' src='" + imgSrc + "' />";
	
				return img;
			});
	
			return textTransed;
		}
	};
	
	window.ChatBox = cb;
	
}(window);
