/*
 * 用途：购物车数据缓存
 * 创建时间：2015-07-27
 */
!function(window){
	var c = {
		push: function(args){
		/* 
		 * 加入购物车
				参数args
					string cartName myTestCart|enterpriseTestCart
					(弃用)number id 商品id
					(弃用)number type 商品类型id
					json goods 商品数据
		*/			
			var cart = $api.getStorage(args.cartName);
			// alert($api.jsonToStr(cart));
			if(cart){
				for(var i=0;i<cart.length;i++){
					if(parseInt(cart[i].tid) == args.goods.tid && parseInt(cart[i].type)==args.goods.type){
						cart[i].num = parseInt(cart[i].num) + 1;
						$api.setStorage(args.cartName, cart);
						return;
					}
				} 
				cart.push(args.goods);
			}else{
				var cart = [];
				cart.push(args.goods);
			}
			$api.setStorage(args.cartName, cart);		
		},
		add: function(args){
			/*
			 * args
			 * 	string cartName myTestCart|enterpriseTestCart
			 * 	number id 商品id
			 *	number type 商品类型id
			 * 	number num 商品添加的数量
			 */
			var cart = $api.getStorage(args.cartName);
			for(var i=0;i<cart.length;i++){
				if(parseInt(cart[i].tid) == args.id && parseInt(cart[i].type)==args.type){
					cart[i].num = parseInt(cart[i].num) + args.num;
					break;
				}
			}
			$api.setStorage(args.cartName, cart);
			this.summary(args.cartName);
		},
		decrease: function(args, callback){
			/*
			 * args
			 * 	string cartName myTestCart|enterpriseTestCart
			 * 	number id 商品id
			 *	number typeId 商品类型id
			 *  number num 商品删除的数量
			 */
			var cart = $api.getStorage(args.cartName);
			for(var i=0;i<cart.length;i++){
				if(parseInt(cart[i].tid) == args.id && parseInt(cart[i].type)==args.type && parseInt(cart[i].num)-args.num>0){
					cart[i].num = parseInt(cart[i].num) - args.num;
					break;
				}
			}
			$api.setStorage(args.cartName, cart);
			this.summary(args.cartName);
		},
		changeInput: function(_this, cartName, id){
			var num = $api.val(_this),
					cart = $api.getStorage(cartName);
			for(var i=0;i<cart.length;i++){
				if(parseInt(cart[i].tid) == id){
					if(isNaN(parseInt(num))){
						$api.val(_this, 1);
						cart[i].num = 1;
					}else{
						cart[i].num = parseInt(num);
					}
					break;
				}
			}
			$api.setStorage(cartName, cart);
			this.summary(cartName);
		},
		delete: function(args, callback){
			/*
			 * args
			 * 	string cartName myTestCart|enterpriseTestCart
			 * 	number id 商品id
			 *	number typeId 商品类型id
			 */
			var cart = $api.getStorage(args.cartName);
			// alert($api.jsonToStr(cart));
			// alert(args.id + ':' + args.type)
			for(var i=0;i<cart.length;i++){
				if(parseInt(cart[i].tid) == args.id && parseInt(cart[i].type)==args.type){
					cart.splice(i, 1);
					$api.setStorage(args.cartName, cart);
					this.summary(args.cartName);
					if('function' === typeof callback){
						callback();
					}
					break;
				}
			}
		},
		clearCart: function(cartName, frameName){
			//清空测试车
			var cart = $api.getStorage(cartName);
			cart = [];
			$api.setStorage(cartName, cart);
			api.execScript({
				name: api.winName,
				frameName: frameName,
				script: 'clearCart()'
			});
			this.summary(cartName);
		},
		clearCartAfterBuy: function(cartName){
			//购买完成后，清除商品数据
			var cart = $api.getStorage(cartName),
					g;
			for(var i=0;i<cart.length, g=cart[i];i++) {
				if(g.isSelect){
					cart.splice(i, 1);
				}
			}
			$api.setStorage(cartName, cart);
		},
		selected: function(_this, id, cartName, type){
			// alert(id + ':' + type)
	    var _radio = $api.dom(_this, 'span');
	    /*更改缓存数据*/			
	    var cart = $api.getStorage(cartName);
	    for(var i=0;i<cart.length;i++){
	    	if(parseInt(cart[i].tid) == id && parseInt(cart[i].type)==type){
					if(_radio.className == 'ct-icon-radio_1'){
						_radio.className = 'ct-icon-radio_2';
						cart[i].isSelect = true;
					}else{
						_radio.className = 'ct-icon-radio_1';
						cart[i].isSelect = false;
					}
	    		$api.setStorage(cartName, cart);
	    		break;
	    	}
	    }	  
	    this.summary(cartName);
		},
		isSelectAll: function(_this, cartName, frameName){
			var cart = $api.getStorage(cartName),
					/*标识是否全选：1全选，0全不选*/
					flag = $api.dom(_this, '#all').className=='ct-icon-radio_1'?1:0;
			for(var i=0;i<cart.length;i++){
				cart[i].isSelect = flag==1?true:false;
			}
			$api.setStorage(cartName, cart);
			api.execScript({
				name: api.winName,
				frameName: frameName||api.frameName,
				script: 'isSelectAll(' + flag + ')'
			});
			this.summary(cartName);
		},
		clearAllSelect: function(cartName){
			// 退出购物车页面时，清空所有商品的勾选
			var cart = $api.getStorage(cartName);
			if(cart) { 
				for(var i=0;i<cart.length;i++){
					cart[i].isSelect = false;
				}	
				$api.setStorage(cartName, cart);
			}
		},
		summary: function(cartName){
			var cart = $api.getStorage(cartName),
					price = 0,
					isAll = 0,
					type = 0;
			for(var i=0;i<cart.length;i++){
				if(cart[i].isSelect){
					price += parseInt(cart[i].price) * parseInt(cart[i].num);
					type +=1;
				}
			}
			isAll = cart.length == type&& cart.length>0 ? 1 : 0;
			// alert(isAll + ':' + price + ':' + type);
			api.execScript({
				name: api.winName,
				script: "resetInfo(" + isAll + ',' + price + ',' + type + ')'
			});
		}
	};
	window.Cart = c;
}(window);

