
/*
 * app框架配置文件
 */
var config = {
		/*项目名称*/
		project: 'weiyali',
		/*本地数据库配置，用于缓存数据结构*/
		db: {
			name: 'wyl',/*数据库名称*/
			debug: true/*是否启动本地数据库调试机制，true则显示报错弹出框*/
		},
		/*异步请求配置，用于获取服务器端数据*/
		ajax: {
			baseUrl: 'http://weiyali.tuixue.com/Api',//服务器数据请求url前缀
			debug: true//是否启动本地数据库调试机制，true则显示报错弹出框
		},
		/*文件上传配置*/
		upload: {

		},
		/*pingpp支付SDK配置*/
		pingpp: {
			ctrl: '',
			fn: ''
		}
	};
 


//初始化app
function initApp(){
	api.openWin({
		name: 'init', 
		url: api.wgtRootDir + '/init.html',
		rect: {
			x: 0,
			y: 0,
			w: 'auto',
			h: 'auto'
		},
		bounces: false,
		slidBackEnabled: false,
		reload: false,
		animation: {
			type: 'fade'
		}
	});
}

function relogin(){
	$api.rmStorage('memberId');
	$api.rmStorage('token');
	$api.rmStorage('memberInfo');
	api.sendEvent({
		name: 'relogin'
	});
	if(api.winName != 'init'){
		api.closeToWin({
			name: $api.getStorage('rootWinName'),
			animation: {
				type: 'fade'
			}
		});
	}
}
//退出app
function exitApp() {
		api.addEventListener({
			name: 'keyback'
		}, function(ret, err) {
			api.toast({
				msg: '再按一次返回键退出',
				duration: 2000,
				location: 'middle'
			});

			api.addEventListener({
				name: 'keyback'
			}, function(ret, err) {
				api.closeWidget({
					silent: true
				});
			});

			setTimeout(function() {
				exitApp();
			}, 2000)
		});
	} 
function formatDateByRequire(t, flag){
	var t = new Date(parseInt(t)*1000);
	return t.getFullYear() + flag + (t.getMonth()+1) + flag + t.getDate();
}	

function toast(msg) {
		api.toast({
			msg: msg,
			duration: 2000,
			location: 'bottom'
		});
	}

function makeCall(phone){
	if(phone){
		api.call({
		    type: 'tel_prompt',
		    number: phone
		});
	}
}
/*模板拼接*/
function mt(selector, template, data){
	$api.html($api.dom(selector), doT.template($api.html($api.dom('[template='+template+']')))(data||''));
}
/*轮播框*/
		function swipeInit() {
			var slideIndexs = $api.domAll('#pointer > a'),
				slidLength = slideIndexs.length;
			new Swipe(document.getElementById('slider'), {
				speed: 400,
				auto: 3000,
				continuous: true,
				disableScroll: true,
				stopPropagation: true,
				callback: function(index, elem) {
					for (var i = 0; i < slidLength; i++) {
						if ($api.hasCls(slideIndexs[i], 'active')) {
							$api.removeCls(slideIndexs[i], 'active');
						}
					}
					try{
						$api.addCls(slideIndexs[index], 'active');
					}catch(e){
						if(index>=slidLength){
							index = 0;
							$api.addCls(slideIndexs[index], 'active')
						}else{
							alert('swipe error');
						}
					}
				},
				transitionEnd: function(index, elem) {}
			});
		}	


(function(window){
	var ajax = {
		baseUrl: '',
		method: 'post',
		timeout: 30,
		cache: true,
		report: true,
		dataType: 'text', 
		showLoading: true, 
		data: '',
		get: function(args, callback){
	/**
	* args参数 @param
	* 		ctrl: 请求接口 
	*			fn: 接口方法 
	*			cache: 是否缓存
	*			timeout: 超时设定
	*			dataType: 数据返回格式
				report: 返回请求进度
	*			data: 接口方法参数
	*		//showProgress: { 
					title: 标题 
					text: 内容
					modal: 模态 
				}
				string template 模板渲染的父节点，不传则默认"main"
				number loadType 数据加载类型
					默认0：不填该参数，不做任何操作
					1：下拉刷新
					2：上拉加载更多
				boolean hideLoading:是否隐藏"加载中..."占位代码，默认：不隐藏
				imageCache: 断网时，是否需要使用缓存图片
				showError: 请求失败后(404)，是否显示错误信息
				boolean errorCallback: 是否执行错误回调，默认false
	**/	

			var self = this;
			if(!args.hideLoading){
				var code = ''+
				'<div class="null flex-box" style="z-index: 1;">'+
					'<div class="flex-1">'+
						'加载中...'+
					'</div>'+
				'</div>';
				try{
					if(args.template){
						$api.html($api.dom('#' + args.template), code);
					}else{
						$api.html($api.dom('#main'), code);
					}
				}catch(e){

				}
			}
			if(!!args.showProgress){
				api.showProgress({
					title: (!!args.showProgress.title?args.showProgress.title:'加载中...'),
					text: (!!args.showProgress.text?args.showProgress.text:'请稍后...'),
					modal: (!!args.showProgress.modal?args.showProgress.modal:true)
				});
			}
			api.ajax({
				url: config.ajax.baseUrl + '/' + args.ctrl + '/' + args.fn,
				method: (!!args.method ? args.method : self.method),
				cache: (!!args.cache ? args.cache : self.cache),
				report: true,
				timeout: (!!args.timeout ? args.timeout : self.timeout),
				dataType: (!!args.dataType ? args.dataType : self.dataType),
				data: (!!args.data ? args.data : '')
			}, function(ret, err){
				if(args.test){
					alert('ret'+$api.jsonToStr(ret)+'     err'+$api.jsonToStr(ret));
				}
				if(ret.status && ret.status==1){
					api.hideProgress();
					/*jsonp格式处理*/
					ret.body = $api.strToJson(ret.body.slice(ret.body.indexOf('{'), -2));
					switch(ret.body.status){
						case 200:
							if(typeof callback == 'function'){
								callback(ret.body.content);
							}						
							break;
						case 404:
							if(args.showError){
								if(ret.body.msg){
									api.toast({
										msg: ret.body.msg,
										location: 'bottom',
										duration: 3000
									});
								}else{
									api.toast({
										msg: '服务器拒绝访问~',
										location: 'bottom',
										duration: 2000
									});
								}
							}					
							break; 
						case 400:
							api.hideProgress();
							var logints = $api.getStorage('logints'),
									nowts = new Date().getTime();
							/*未登录*/
							if(logints){
								if('string' === typeof logints){
									logints = parseInt(logints);
								}
								if(nowts-logints < 1000*60*60*24*30){
									api.alert({
										title: '提示信息',
										msg: '该账号已在另一设备上登录，你无法进行相关操作，请重新登录'
									}, function(ret,err){
										relogin();
									});
								}else{
									api.alert({
										title: '提示信息',
										msg: '你的账户信息已过期，请重新登陆'
									}, function(ret,err){
										relogin();
									});
								}		
							}else{
								api.alert({
									title: '提示信息',
									msg: '请先登录'
								}, function(ret, err){
									relogin();
								});
							}
							break;
					}
					if(args.loadType){
						switch(args.loadType){
							case 1:
								/*去除下拉刷新样式*/
								api.refreshHeaderLoadDone();
								break;
							case 2:
								/*scrolltobottom事件, 去除“加载中...”UI*/
								$api.remove($api.dom('.load-more'));
								break;
						}
					}					
				}else{
					if(ret.status == 2){
						/*异步请求失败时，执行错误回调*/
						if(args.errorCallback){
							var d = {};
							d.errorCallback = true;
							callback(d);
						}
						if(args.loadType){
							switch(args.loadType){
								case 1:
									/*去除下拉刷新样式*/
									api.refreshHeaderLoadDone();
									break;
								case 2:
									/*scrolltobottom事件, 去除“加载中...”UI*/
									$api.remove($api.dom('.load-more'));
									break;
							}
						}
						/*是否需要使用缓存图片*/
						if(args.imageCache||false){
							imageCache.get();
						}		
						if('none' === api.connectionType){
							api.toast({
								msg: '网络无法连接，请检查网络设备是否正常',
								location: 'bottom',
								duration: 3000
							});
							return;
						}	
						api.toast({
							msg: '网络请求超时，请稍后重试',
							location: 'bottom',
							duration: 3000
						});
					}
				}
			});	
		}
	};
	
	if(window.tool){
		window.tool.ajax = ajax;
	}else{
		window.tool = {};
		window.tool.ajax = ajax;
	}
})(window);


/*
 * 时间工具函数
 * 封装于 2015-07-07
 */
(function(window){
	var d = {};
	d.t1 = function(pts, flag){
		/*
		*参数
		* string/number pts 过去的时间戳
		* boolean flag: '我的消息'一周之外只显示：月/日
		*/	
		pts = this.formatTS(pts);
		var now = new Date(),
				nts = now.getTime(),
				pass = new Date(pts);
		/*是否在三天内：今天、昨天、前天*/
		var isT = this.isT(pts, now);
		if(isT){
			return isT;
		}
		/*是否在这一周内*/
		var isInWeek = this.isInWeek(pts, now);
		if(isInWeek){
			return isInWeek;
		}
		/*超出一周范围*/
		var moment,
				hours = pass.getHours();
		if(hours>=0 && hours<6){
			moment = '凌晨 ';
		}else if(hours>=6 && hours<12){
			moment = '上午 ';
		}else if(hours == 12){
			moment = '中午 ';
		}else if(hours>12 && hours<18){
			moment = '下午 ';
		}else{
			moment = '晚上 ';
		}		
		if(flag){
			return (pass.getMonth()+1) + '月' + pass.getDate() + '日';
		}else{
			return (pass.getMonth()+1) + '月' + pass.getDate() + '日 ' + moment + (pass.getHours()>9?pass.getHours():'0'+pass.getHours()) + ':' + (pass.getMinutes()>9?pass.getMinutes():'0'+pass.getMinutes());
		}		
	};
	d.formatTS = function(ts){
		/*若时间戳为字符串则转型*/
		if('string' === typeof st){
			ts = parseInt(ts);
		}
		/*由于PHP返回的时间戳为10位，不足13位则补充*/
		if(ts.toString().length < 13){
			ts *= 1000;
		}		
		return ts;		
	};
	/*时间格式化f系列方法*/
	d.f1 = function(t, flag){
		var t = new Date(parseInt(t)*1000);
		return t.getFullYear() + flag + (t.getMonth()+1) + flag + t.getDate();
	};
	d.isT = function(pts, now){
		/*是否在三天内：今天、昨天、前天*/
		/*pts为过去时间戳，now为现在的日期对象*/
		pts = this.formatTS(pts);
		var	nts = now.getTime(),
				pass = new Date(pts);
		if((nts-(now.getHours()+24*2)*60*60*1000-now.getMinutes()*60*1000-now.getSeconds()*1000) <= pts){
			var moment;
			/*三天内*/
			if(now.getDate() == pass.getDate()){
				/*今天*/ 
				var hours = pass.getHours();
				if(hours>=0 && hours<6){
					moment = '凌晨 ';
				}else if(hours>=6 && hours<12){
					moment = '上午 ';
				}else if(hours == 12){
					moment = '中午 ';
				}else if(hours>12 && hours<18){
					moment = '下午 ';
				}else{
					moment = '晚上 ';
				}
			}else if((nts-(now.getHours()+24)*60*60*1000-now.getMinutes()*60*1000-now.getSeconds()*1000) <= pts){
				/*昨天*/
				moment = '昨天 ';
			}else if((nts-(now.getHours()+24*2)*60*60*1000-now.getMinutes()*60*1000-now.getSeconds()*1000) <= pts){
				/*前天*/
				moment = '前天 ';
			}
			return (moment||(pass.getMonth()+1)+'月'+pass.getDate()+'日 ') + (pass.getHours()>9?pass.getHours():'0'+pass.getHours()) + ':' + (pass.getMinutes()>9?pass.getMinutes():'0'+pass.getMinutes());
		}
		return false;		
	};
	d.isInWeek = function(pts, now){
		/*是否在这一周内*/
		/*pts为过去时间戳，now为现在的日期对象*/
		var x = now.getDay(),	/*今天星期几*/
				nts = now.getTime(),
				pass = new Date(pts);
		if(x > 3){
			if(nts-(now.getHours()+24*(x==0?6:x))*60*60*1000-now.getMinutes()*60*1000-now.getSeconds()*1000 <= pts){
				var weekDay;
				switch(pass.getDay()){
					case 0:
						weekDay = '周日';
						break;
					case 1:
						weekDay = '周一';
						break;
					case 2:
						weekDay = '周二';
						break;
					case 3:
						weekDay = '周三';
						break;
					case 4:
						weekDay = '周四';
						break;
					case 5:
						weekDay = '周五';
						break;
					case 6:
						weekDay = '周六';
						break;
				}
				return weekDay + ' ' + (pass.getHours()>9?pass.getHours():'0'+pass.getHours()) + ':' + (pass.getMinutes()>9?pass.getMinutes():'0'+pass.getMinutes());
			}
		}
		return false;
	};
	
	if(!window.tool){
		window.tool = new Object;
	}
	window.tool.date = d;
})(window);



/*
 * 创建于2015-05-23
 * db模块封装了手机常用数据库sqlite的增删改查语句
 * 可实现数据的本地存储，极大的简化了数据归档问题
*/

(function(window){
	var d = {};
	/*打开本地数据库*/
	d.init = function(dbName, callback){
		var db = api.require('db');
		if(!window.config.db){
			if(config.db.debug){
				api.alert({
					title: '错误提示',
					msg: '数据库没有配置'
				});
			}
			return;
		}
		db.openDatabase({
			name: dbName,
			path: 'fs://db/'+ dbName +'.db'
		}, function(ret, err){
			if(ret.status){
				/*数据库	 打开/创建  成功*/
				if('function' === typeof callback){
					callback();
				}
			}else{
				if(config.db.debug){
					api.toast({
						msg: 'open database error',
						location: 'bottom',
						duration: 2000 
					});
				}
			}
		});
	};
	/*事务*/
	d.transaction = function(dbName, operation, callback){
		var db = api.require('db');
		db.transaction({
			name: dbName,
			operation: operation
		}, function(ret, err){
			if(ret.status){
				/*事务操作成功*/
				if('function' === typeof callback){
					callback();
				}
			}else{
				/*事务操作失败*/
				if(config.db.debug){
					var msg;
					if(err.msg){
						msg = err.msg;
					}else{
						msg = 'transaction operation error';
					}
					api.alert({
						title: '提示信息',
						msg: msg
					});		
				}
			}
		});
	};
	d.executeSql = function(dbName, sql, callback) {
		var db = api.require('db');
		db.executeSql({
			name: dbName,
			sql: sql
		}, function(ret, err) {
			// alert('executeSql:'+$api.jsonToStr(ret||err));
			if (ret.status) {
				/*执行SQL成功*/
				if('function' === typeof callback){
					callback();
				}
			} else {
				/*执行SQL失败*/
				if(config.db.debug){
					var msg;
					if(err.msg){
						msg = err.msg;
					}else{
						msg = 'execute sql error';
					}
					api.alert({
						title: '提示信息',
						msg: msg
					});
				}
			}
		});
	};
	d.selectSql = function(dbName, sql, callback){
		var db = api.require('db');
		db.selectSql({
			name: dbName,
			sql: sql
		}, function(ret, err){
			if(ret.status){
				/*查询sql成功*/
				if('function' === typeof callback){
					/*ret.data为查询结果(array)*/
					callback(ret.data);
				}
			}else{
				/*查询sql失败*/
				if(config.db.debug){
					var msg;
					if(err.msg){
						msg = err.msg;
					}else{
						msg = 'select sql error';
					}
					api.alert({
						title: '提示信息',
						msg: msg
					});
				}
			}
		});
	};
	d.createTable = function(args, callback){
		/*参数 json	args
		 * string dbName	数据库名
		 * string table	表名
		 * array field	表字段
		 */
		var self = this,
				sql = 'create table if not exists ' + args.table + '(' + args.field.join() + ')';
		this.executeSql(args.dbName, sql, function(){
			if('function' === typeof callback){
				callback();
			}
		});
	};	
	
	d.insert = function(args, callback){
		/*参数	args
		 * string dbName	数据库名
		 * string table	表名
		 * json data	待插入的数据
		 */
		var sql = 'insert into ' + args.table + ' (' + 
							(function(){
								var k = '';
								for(var key in args.data){
									k = k + key + ',';
								}
								return k.slice(0, -1);
							})() + ')' + ' values(' + 
							(function(){
								var v = '';
								for(var key in args.data){
									v = v + '"' + args.data[key] + '",';
								}
								return v.slice(0, -1);
							})() + ')';
		this.executeSql(args.dbName, sql, function(){
			if('function' === typeof callback){
				callback();
			}
		});
	};	
	d.getDataFromDB = function(args, callback){
		/* 2015-06-25 22:00 添加
			参数 json args
				string ctrl 接口控制器
				string fn 接口方法
				string dbName 数据库名
				可选 json where select条件语句，以键值对形式组织,主要是针对内容页型数据

			return ret{
				number status 数据查询状态{
					0 本地数据库不存在该表
					1 本地数据库存在表，且有数据
					2 本地数据库存在表，但无数据
				}
				data 当status状态为1时返回
			}
		*/
		var ret = {},
				self = this;
		var sql = 'select count(*) isexist from sqlite_master where type="table" and name="' + args.ctrl.toLowerCase() + '_' + args.fn.toLowerCase() + '"';
		this.selectSql(args.dbName, sql, function(data){
			if(parseInt(data[0].isexist)){
				/*表存在*/
				var sql = 'select * from ' + args.ctrl.toLowerCase() + '_' + args.fn.toLowerCase(); 
				/*判断时候有where条件语句*/
				if(args.where){
					sql = sql + (function(){
						var where = ' where';
						for(var key in args.where){
							where = where + ' ' + key + '="' + args.where[key] + '"';
						}
						return where;
					})();
				}
				self.selectSql(args.dbName, sql, function(data){
					if(data.length != 0){
						/*表存在，且有数据*/
						ret.status = 1;
						ret.data = data;
						callback(ret);
					}else{
						/*表存在，但无数据*/
						ret.status = 2;
						callback(ret);
					}
				});
			}else{
				/*不存在表*/
				ret.status = 0;
				callback(ret);
			}
		});
	};	
	d.saveData = function(args){
		/*
			2015-06-25 23:45 添加
			参数 json args
				string dbName 数据库名
				string ctrl 接口控制器
				string fn 接口方法
				number type 被缓存的数据的形式{
					0 内容页数据
					1 列表页数据
				}
				json/array data 被缓存的数据
				json/array where 用于标识每条记录的唯一性{
					json类型 一般用于内容页数据
					array类型 一般用于列表页数据
				}
		*/
		var self = this,
				table = args.ctrl.toLowerCase() + '_' + args.fn.toLowerCase();

		function pushToDB(value){
			var sql = 'select * from ' + table + ' where' + 
								(function(){
									var where = '';
									if(args.where instanceof Array){
										for(var i=0;i<args.where.length;i++){
											where += ' ' + args.where[i] + '="' + value[args.where[i]] + '" and';
										}
									}else{
										for(var key in args.where){
											where += ' ' + key + '="' + args.where[key] + '" and';
										}
									}
									return where.slice(0, -3);
								})();
			self.selectSql(args.dbName, sql, function(data){
				if(data.length == 0){
					/*该条记录不存在数据库*/
					self.insert({
						dbName: args.dbName,
						table: table,
						data: value
					});
				}
			});
		}

		this.createTable({
			dbName: args.dbName,
			table: table,
			field: self.table[table].field
		}, function(){
			if(args.type){
				args.data.forEach(function(value, index, arr){
					pushToDB(value);
				});
			}else{
				pushToDB(args.data);
			}
		});
	};	
	
	window.DB = d;
})(window);


DB.table = {
	'info_infotype':{
		field: [
			'`id` int',
			'`name` varchar(20)'
		]
	}
} 
/*
 * 创建于2015-06-07
 * imageCache用于缓存网络图片
 * 版本0.02
 */

!function(window){
	var ic = {};
	/*缓存图片*/
	ic.save = function(args){
/*
 * json参数：args
 * 	string	policy 缓存策略	默认值：default
 * 	boolean thumbnail 图片缓存成功后是否使用缩略图	默认值：true
 *
 */ 		
 		var imageDoms = $api.domAll('[img-cache]'),
 				index = 0;

 		if(imageDoms.length == 0){
 			return;
 		}
 		function s(){
 				var imgUrl = $api.attr(imageDoms[index], 'img-cache');
	 			api.imageCache({
	 				url: imgUrl,
	 				policy: args.policy||'default',
	 				thumbnail: args.thumbnail||true
	 			}, function(ret, err){
	 				if(ret.status){
	 					imageDoms[index].removeAttribute('img-cache');/*删除元素的缓存标识*/
	 					index += 1;/*切换到下一个元素*/
	 					if(index < imageDoms.length){
	 						s();
	 					}
	 				}
	 			});

 		}
 		/*图片缓存入口*/
 		s();		
	};
	
	/*拿出缓存好的图片*/
	ic.get = function() {
		/*
		 * 当断网时，使用缓存图片进行渲染
		 */
		/*ios自动获取缓存，所以不需要api.imageCache的辅助*/
		if ('ios' === api.systemType) {
			return;
		}
		var imageDoms = $api.domAll('[img-cache]'),
			index = 0;
	
		function g() {
				var imgUrl = $api.attr(imageDoms[index], 'img-cache');
				api.imageCache({
					url: imgUrl,
					policy: 'cache_only',
					thumbnail: false
				}, function(ret, err) {
					// alert($api.jsonToStr(ret||err));
					if (ret.status) {
						if ('img' === imageDoms[index].tagName.toLowerCase()) {
							imageDoms[index].src = ret.url;
							//						$api.attr(imageDoms[0], 'src', ret.url);
						} else {
							imageDoms[index].style.backgroundImage = 'url(' + ret.url + ')';
							imageDoms[index].setAttribute('data-echo-background', ret.url);
							//						$api.css(imageDoms[0], 'background-image:url(' + ret.url + ')');
						}
						index += 1;
						if (index < imageDoms.length) {
							g();
						}
					} else {
						// alert('获取本地缓存图片失败')
					}
				});
			}
		/*渲染缓存图片入口*/
		g();
	};
	
	window.imageCache = ic;
}(window);



(function(window){
	var c = {};
	c.set = function(content){
		var o = api.require('clipBoard');
		o.set({
			value: content
		}, function(ret, err){
			if(ret.status){
				api.toast({
					msg: '复制到剪切板成功',
					duration: 2000,
					location: 'bottom'
				});
			}else{
				api.alert({
					title: '提示信息',
					msg: err.msg
				});				
			}
		});
	};
	window.clipBoard = c;
})(window);

/*
 * 作用：页面滚动的底部时，加载更多信息
 * 创建于 2015-7-8 22：18
 */

!function(window){
	var c = {
		init: function(args){
			/*
			 * 参数 json args
			 * 				string ctrl
			 * 				string fn
			 * 				json values
			 * 				boolean showError
			 * 				boolean test
			 * 				number countType 
			 * 					0 默认统计模式，page/pagesize并用;
			 * 					1 时间戳模式，以时间戳为标识获取更多数据;
			 *				function count 自定义判断加载条件是否符合，针对特殊场景，可为空
			 *					return t{	
			 *						number status (0:马上终止执行下面的逻辑)
			 *						json values	异步请求所需的参数(status=1:返回values)
			 *					}
			 * 				
			 */
			api.addEventListener({
				name: 'scrolltobottom'
			}, function(ret, err){

				/*判断是否加载中*/
				var loadMoreDom = $api.dom('.load-more');
				if(loadMoreDom){
					return;
				}
				if('function' === typeof args.count){
					var t = args.count();
					if(t && t.status){
						if(!args.values){
							args.values = {};
						}
						for(var key in t.values){
							args.values[key] = t.values[key];
						}
					}else{
						return;
					}
				}else{
					if(args.countType){
						//使用时间戳统计模式
						/*获取时间戳*/
						args.values.time = $api.attr($api.dom('#main > div:last-child'), 'timestamp');
					}else{
						/*使用默认统计模式page/pagesize*/
						try{
							var listDoms = $api.domAll('#main > div');
							if(listDoms.length == 0 || listDoms.length%10 != 0){
								return;
							}else{
								args.values.page = listDoms.length/10+1;
							}
						}catch(e){
							return;
						}		
					}
				}
					
				// alert(JSON.stringify(args.values));
				/*渲染“加载更多”UI*/
				var loadMoreCode = ''+
						'<div class="load-more">'+
							'正在加载...'+
						'</div>';
				$api.append($api.dom('#main'), loadMoreCode);
				// alert($api.jsonToStr(args.values))
				tool.ajax.get({
					ctrl: args.ctrl,
					fn: args.fn,
					data: {
						values: args.values
					},
					hideLoading: true,
					showError: args.showError,
					test: args.test,
					loadType: 2 //scrolltobottom类型
				}, function(ct){
					if(ct instanceof Array && ct.length!=0){
						$api.append($api.dom('#main'), doT.template($api.html($api.dom('[template=' + (args.template || 'list') + ']')))(ct));
						api.parseTapmode();
					}else{
						api.toast({
							msg: '已经没有更多内容了',
							location: 'bottom',
							duration: 2000
						});
					}
				});
			});
		}
	};
	window.LoadMore = c;
}(window);


/*
 * 作用：页面刷新
 * 创建于 2015-7-17 21:14
 */

!function(window){
	var c = {
		init: function(args){
			/*
			 * 参数 json args
			 * 	string ctrl
			 * 	string fn 
			 * 	json values 接口参数
			 * 	boolean showError
			 * 	boolean test
			 * 	string template 模板渲染节点，默认main
			 * 	
			 */
			api.setRefreshHeaderInfo({
			    visible: true,
			    loadingImg: 'widget://res/icon-refresh.png',
			    bgColor: 'rgba(0,0,0,0)',
			    textColor: '#666',
			    textDown: '下拉刷新...',
			    textUp: '松开刷新...',
			    showTime: true
			}, function(ret, err){
				if('none' === api.connectionType){
					api.toast({
						msg: '网络无法连接，请检查网络设备是否正常',
						location: 'bottom',
						duration: 2000
					});
					api.refreshHeaderLoadDone();
					return;
				}
				tool.ajax.get({
					ctrl: args.ctrl,
					fn: args.fn,
					data: {
						values: args.values
					},
					hideLoading: true,
					showError: args.showError,
					test: args.test,
					loadType: 1 //下拉刷新类型
				}, function(ct){
					if(args.template){
						$api.html($api.dom('#' + args.template), doT.template($api.html($api.dom('[template='+args.template+']')))(ct));
					}else{
						$api.html($api.dom('#main'), doT.template($api.html($api.dom('[template=main]')))(ct));
					}
					echo.init();
					api.parseTapmode();
				});
			});			
		}
	};
	window.Refresh = c;
}(window);

/*打开机构列表*/
function openMechanismList(typeId){
	api.openWin({
		name:'MechanismList',
		url: api.wgtRootDir + '/html/window/mechanism_list.html',
		bounces: false,
		pageParam:{
			typeId: typeId
		} 
	});	 
}
/*机构详细*/
function openMechanismDetail(id){
	api.openWin({
		name:'MechanismDetail',
		url: api.wgtRootDir + '/html/window/mechanism_detail.html',
		pageParam:{
			id: id
		}
	});		
}

/*企业招标详细*/
function openTenderDetail(id){
	api.openWin({
		name:'MechanismDetail',
		url: api.wgtRootDir + '/html/window/enterprise_tender_detail.html',
		pageParam:{
			id: id
		}
	});	
}

/*企业招标评论列表*/
function openEnterpriseTenderComment(id){
	api.openWin({
		name: 'EnterpriseTenderComment',
		url: api.wgtRootDir + '/html/window/win.html',
		pageParam: {
			headerTitle: '评论列表',
			frameName: 'enterprise_tender_comment',
			frameUrl: api.wgtRootDir + '/html/home/enterprise_tender_comment.html',
			hasFrameParam: true,
			frameParam: {
				id: id
			}
		},
		bounces: false
	});	
}
/*打开我要测测试车*/
function openMyTestCart(){
	api.openWin({
		name: 'MyTestCart',
		url: api.wgtRootDir + '/html/window/win_my_test_cart.html',
		bounces: false
	});
}
// 打开企业测测试车
function openEnterpriseCart(){
	api.openWin({
		name: 'enterpriseTestCart',
		url: api.wgtRootDir + '/html/window/win_enterprise_test_cart.html',
		bounces: false
	});
}
// 用于打开广告详情
function openadverDetail(id){
	api.openWin({
		name: 'adverDetail',
		url: api.wgtRootDir + '/html/window/win.html',
		pageParam: {
			headerTitle: '威雅利',
			frameName: '_adver_detail',
			frameUrl: api.wgtRootDir + '/html/home/history_adver_detail.html',
			hasFrameParam: true,
			frameParam: {
				id: id
			}
		},
		bounces: false
	});	
}
// 打开带有星级的评价列表
function openStarCommentList(ctrl, fn, id, type){
			// 我要测单品评价 
			// 我要测套餐评价 
			// 企业测单品评价
			// 企业测套餐评价 
			// 商品详情评论 
	api.openWin({
		name: 'StarCommentList',
		url: api.wgtRootDir + '/html/window/win.html',
		pageParam: {
			headerTitle: '评价列表',
			frameName: 'star_comment_list',
			frameUrl: api.wgtRootDir + '/html/home/star_comment_list.html',
			hasFrameParam: true,
			frameParam: {
				ctrl: ctrl,
				fn: fn,
				values: {
					id: id,
					type: type||''
				}
			}
		},
		bounces: false
	});	
}
//打开我要测-支付
function openMyTestPay(oid, pay){
	api.openWin({
		name: 'MyTestPay',
		url: api.wgtRootDir + '/html/window/win.html',
		pageParam: {
			headerTitle: '选择支付方式',
			frameName: 'my_test_pay',
			frameUrl: api.wgtRootDir + '/html/component/my_test_pay_order.html',
			hasFrameParam: true,
			frameParam: {
				oid: oid,
				pay: pay
			}
		},
		bounces: false
	});	
}
//融云聊天面板
function openTalkWith(targetId){
	api.openWin({
		name: 'TalkWith',
		url: api.wgtRootDir + '/html/window/talk_with.html',
		pageParam: {
			targetId: targetId
		},
		bounces: false
	});
}