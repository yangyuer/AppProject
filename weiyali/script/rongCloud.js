!function(window){
	var rc = {
		rcId: '',
		init: function(callback){
			var rong = api.require('rongCloud');
			rong.init(function(ret, err){
				if(ret.status == 'success'){
					// toast('融云初始化成功');
					if('function' === typeof callback){
						callback();
					}
				}else{
					api.toast({
						msg: err.code + '-' + err.msg
					});
				}
			});
		},
		setOnReceiveMessageListener: function(callback){
			/*
			设置接收消息的监听器，请在调用 init 方法之后，调用 connect 方法之前设置
			*/
			var rong = api.require('rongCloud');
			rong.setOnReceiveMessageListener(function(ret, err){
				if(ret.status == 'success'){
					callback(ret.result);
				}
			});
		},
		setConnectionStatusListener: function(){
			/*
				设置连接状态变化的监听器，请在调用 init 方法之后，调用 connect 方法之前设置
			*/
			var rong = api.require('rongCloud');
			rong.setConnectionStatusListener(function(ret, err){
				var msg;
				switch(ret.result.code){
					case -9:
						msg = '断开连接'
						break;
					case -1:
						msg = '未知错误'
						break;
					case 0:
						msg = '连接成功'
						break;
					case 1:
						msg = '网络不可用'
						break;
					case 2:
						msg = '连接中'
						break;
					case 6:
						msg = '用户账户在其他设备登录，本机会被踢掉线'
						break;
					case 7:
						msg = '用户账户在 Web 端登录'
						break;
					case -10000:
						break;
					case -10002:
						msg = '输入参数错误'
						break;
				}
				toast(msg);
			});
		},
		connect: function(callback){
			//连接融云 IM 服务器
			var memberInfo = $api.getStorage('memberInfo'),
					self = this,
					rong = api.require('rongCloud');
			rong.connect({
				token: memberInfo.rongcloud
			}, function(ret, err){
				// alert('ret' + JSON.stringify(ret) + '       err'+JSON.stringify(err));
				if(ret.status == 'success'){
					// alert('连接融云成功：'+ ret.result.userId);
					if('function' === typeof callback){
						callback();
					}
					// self.rcId = ret.result.userId;
				}else{
					api.alert({
						title: '提示信息',
						msg: err.code + '-' + err.msg
					});
				}
			});
		},
		sendTextMessage: function(args, callback){
			/*args内部数据结构
					targetId 消息接收方的id
					text 消息的文字内容
			*/
			var rong = api.require('rongCloud');
			rong.sendTextMessage({
				conversationType: 'PRIVATE',
				targetId: args.targetId.toString(),
				text: args.text,
				extra: args.extra || ''
			}, function(ret, err){
				if(ret.status == 'error'){
					alert('ret' + JSON.stringify(ret) + '     err' + JSON.stringify(err));
				}else{
					callback(ret);
				}
			});
		},
		getConversationList: function(callback){
			//获取会话列表
			var rong = api.require('rongCloud');
			rong.getConversationList(function(ret, err){
				// alert(JSON.stringify(ret))
				if(ret.status == 'success'){
					callback(ret.result);
				}
			});
		},
		removeConversation: function(targetId, callback){
			//从会话列表中移除某一会话，但是不删除会话内的消息
			var rong = api.require('rongCloud');
			rong.removeConversation({
				conversationType: 'PRIVATE',
				targetId: targetId.toString()
			}, function(ret, err){
				if(ret.status == 'success'){
					if('function' === typeof callback){
						callback();
					}
				}
			});
		},
		clearMessages: function(targetId, callback){
			//清空某一会话的所有聊天消息记录
			var rong = api.require('rongCloud');
			rong.clearMessages({
				conversationType: 'PRIVATE',
				targetId: targetId.toString()
			}, function(ret, err){
				if(ret.status == 'success'){
					if('function' === typeof callback){
						callback();
					}
				}
			});
		},
		clearConversation: function(){
			//清空所有会话及会话消息
			var rong = api.require('rongCloud');
			rong.clearConversation({
				conversationType: 'PRIVATE'
			}, function(ret, err){
				if(ret.status == 'success'){
					toast('已清空聊天记录');
				}
			});
		},
		setConversationNotificationStatus: function(targetId, flag){
			//设置某一会话的通知状态
			//flag： 0免打扰 1提醒
			var rong = api.require('rongCloud');
			rong.setConversationNotificationStatus({
				conversationType: 'PRIVATE',
				targetId: targetId,
				notificationStatus: flag ? 'NOTIFY' : 'DO_NOT_DISTURB'
			}, function(ret, err){
				if(ret.status == 'success'){
					var msg = ret.code ? '开启免打扰模式' : '开启消息提醒模式';
					toast(msg);
				}
			});
		},
		getLatestMessages: function(targetId, count, callback){
			//获取某一会话的最新消息记录
			var rong = api.require('rongCloud');
			rong.getLatestMessages({
				conversationType: 'PRIVATE',
				targetId: targetId.toString(),
				count: parseInt(count)
			}, function(ret, err){
//				 alert('ret' + JSON.stringify(ret) + '       err'+JSON.stringify(err));
				if(ret.status == 'success'){
					callback(ret.result);
				}else{
					alert(err.code + '-' + err.msg);
				}
			});
		},
		getHistoryMessages: function(args, callback){
			//获取某一会话的历史消息记录
			var rong = api.require('rongCloud');
			rong.getLatestMessages({
				conversationType: 'PRIVATE',
				targetId: args.targetId.toString(),
				oldestMessageId: parseInt(args.oldestMessageId),
				count: args.count
			}, function(ret, err){
				if(ret.status == 'success'){
					callback(ret.result);
				}
			});
		},
		getTotalUnreadCount: function(callback){
			//获取所有未读消息数
			var rong = api.require('rongCloud');
			rong.getTotalUnreadCount(function(ret, err){
				if(ret.status == 'success'){
					alert('ret' + JSON.stringify(ret) + '       err'+JSON.stringify(err));
					callback(ret.result);
				}
			});
		},
		getUnreadCount: function(targetId, callback){
			//获取来自某用户（某会话）的未读消息数
			var rong = api.require('rongCloud');
			rong.getUnreadCount({
				conversationType: 'PRIVATE',
				targetId: targetId.toString()
			}, function(ret, err){
				if(ret.status == 'success'){
					callback(ret.result);
				}
			});
		},
		getUnreadCountByConversationTypes: function(callback){
			//获取某（些）会话类型的未读消息数
			var rong = api.require('rongCloud');
			rong.getUnreadCountByConversationTypes({
				conversationTypes: ['PRIVATE']
			}, function(ret, err){
//				alert('ret' + JSON.stringify(ret) + '       err'+JSON.stringify(err));
				if(ret.status == 'success'){
					callback(ret.result);
				}else{
					toast(err.code + '-' + err.msg);
				}
			});
		},
		clearMessagesUnreadStatus: function(targetId, callback){
			//清除某一会话的消息未读状态
			var rong = api.require('rongCloud');
			rong.clearMessagesUnreadStatus({
				conversationType: 'PRIVATE',
				targetId: targetId.toString()
			}, function(ret, err){
				if(ret.status == 'success'){
					callback();
				}
			});
		},

	};
	window.RongCloud = rc;
}(window);
