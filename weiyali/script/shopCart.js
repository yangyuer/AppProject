

!function(window){
	var s = {
		push: function(goods){
			/*参数goods
			 *	number shopId
			 * 	string shopName
			 * 	number id 商品id
			 * 	string title 商品名称
			 * 	float price 
			 * 	string num 商品数量
			 * 	string cover 商品缩略图
			 */
			var shopCart = $api.getStorage('shopCart');
			if(shopCart){
				/*遍历商家*/
				for(var i=0;i<shopCart.length;i++){
					if(shopCart[i].shopId == goods.shopId){
						/*购物车内存在该商家, 则遍历该商家下的商品数组wares*/
						var g;
						for(var j=0;j<shopCart[i].wares.length, g=shopCart[i].wares[j];j++){
							if(g.id == goods.id){
								/*已存在该商家的商品*/
								g.num += 1;
								$api.setStorage('shopCart', shopCart);
								return;
							}
						}
						/*遍历结束后，商品数组中不存在该商品*/
						shopCart[i].wares.push(goods);
						$api.setStorage('shopCart', shopCart);
						return;
					}
				}
				/*遍历结束后，购物车内不存在该商家*/
				shopCart.push({
					shopId: goods.shopId,
					shopName: goods.shopName,
					wares: [goods]
				});
			}else{
				shopCart = new Array();
				shopCart.push({
					shopId: goods.shopId,
					shopName: goods.shopName,
					wares: [goods]
				});
			}
			$api.setStorage('shopCart', shopCart);
		},
		add: function(shopId, id){
			//商品数量加1
			this.goodsIterator(shopId, id, function(shopIndex, goodsIndex, shopCart){
				shopCart[shopIndex].wares[goodsIndex].num += 1;
			});
		},
		dec: function(shopId, id){
			//商品数量减1
			this.goodsIterator(shopId, id, function(shopIndex, goodsIndex, shopCart){
				var n = shopCart[shopIndex].wares[goodsIndex].num;
				if(n-1 > 0){
					shopCart[shopIndex].wares[goodsIndex].num -= 1;
				}
			});
		},
		changeInput: function(_this, shopId, id){
			var num = parseInt($api.val(_this));
			this.goodsIterator(shopId, id, function(shopIndex, goodsIndex, shopCart){
				var g = shopCart[shopIndex].wares[goodsIndex];
				if(isNaN(num)){
					$api.val(_this, 1);
					g.num = 1;
				}else{
					g.num = num;
				}
			});
		},
		del: function(shopId, id){
			/*flag 
			 * 用于控制视图层的后续渲染逻辑
			 * 0(默认)，只删除商品节点
			 * 1则连同店铺节点一并移除
			 */
			var flag = 0;
			this.goodsIterator(shopId, id, function(shopIndex, goodsIndex, shopCart){
				/*根据商品id，从wares数组中删除商品*/
				shopCart[shopIndex].wares.splice(goodsIndex, 1);
				if(shopCart[shopIndex].wares.length == 0){
					/*删除商品后，检测该商家下的商品数量是否为0，为0则删除该商家数据*/
					shopCart.splice(shopIndex, 1);
					flag = 1;
				}				
			});
			return flag;
		},
		isSelectGoods: function(shopId, id){
			var shopCart = $api.getStorage('shopCart'),
					s, g, 
					flag = 0;//标志是否选取了店铺下的所有商品，默认为0，否
					
			for(var i=0;i<shopCart.length, s=shopCart[i];i++){
				if(s.shopId == shopId){
					for(var j=0;j<s.wares.lenght, g=s.wares[j];j++){
						if(g.id == id){
							if(g.isSelect){
								g.isSelect = false;
								s.isSelect = false;
							}else{
								g.isSelect = true;
								var n = 0, w;
								for(var z=0;z<s.wares.length, w=s.wares[z];z++){
									if(w.isSelect){
										n += 1;
									}else{
										brak;
									}
								}
								if(n == s.wares.length){
									s.isSelect = true;
									flag = 1;
								}
							}
							$api.setStorage('shopCart', shopCart);
							this.summary();
							return flag;
						}
					}
				}
			}
		},
		isSelectShop: function(shopId){
			var shopCart = $api.getStorage('shopCart'),
					s, g;
			for(var i=0;i<shopCart.length, s=shopCart[i];i++){
				if(s.shopId == shopId){
					s.isSelect = s.isSelect?false:true;
					for(var j=0;j<s.wares.lenght, g=s.wares[j];j++){
						g.isSelect = s.isSelect?true:false;
					}
					$api.setStorage('shopCart', shopCart);
					break;
				}
			}
			this.summary();
		},
		isSelectAll: function(flag){
			/*“全选”逻辑，flag标志是否全选*/
			var shopCart = $api.getStorage('shopCart'),
					s, g;
			for(var i=0;i<shopCart.length, s=shopCart[i];i++){
				s.isSelect = flag ? true : false;
				for(var j=0;j<s.length, g=s.wares[j];j++){
					g.isSelect = flag ? true : false;
				}
			}
			$api.setStorage('shopCart', shopCart);
			this.summary();
		},
		clearAllSelect: function(){
			/*清空购物车的勾选*/
			var shopCart = $api.getStorage('shopCart'),
					s, g;
			if(shopCart){
				for(var i=0;i<shopCart.length, s=shopCart[i];i++){
					s.isSelect = false;
					for(var j=0;j<s.length, g=s.wares[j];j++){
						g.isSelect = false;
					}
				}
				$api.setStorage('shopCart', shopCart);
			}
		},
		summary: function(){
			/*数据汇总*/
			var shopCart = $api.getStorage('shopCart'),
					price = 0,
					isAll = 0,
					shopNum = 0,//已勾选的商铺数量
					type = 0,
					s, g;
			for(var i=0;i<shopCart.length, s=shopCart[i];i++){
				if(s.isSelect){
					shopNum += 1;
				}
				for(var j=0;j<s.wares.length, g=s.wares[j];j++){
					if(g.isSelect){
						price += parseFloat(g.price) * g.num;
						type += 1;
					}
				}
			}
			isAll = shopCart.length > 0 && shopCart.length == shopNum ? 1 : 0;
//			alert(isAll + ':' + price + ':' + type);
			api.execScript({
				name: api.winName,
				script: 'resetView(' + isAll + ',' + price + ',' + type + ')'
			});
		},
		goodsIterator: function(shopId, id, callback){
			/*商品迭代器
			 * 用途：根据给定的店铺shopId, 商品id遍历购物车，找到指定的商品
			 * @return
			 * 	number shopIndex 购物车数组的店铺索引
			 * 	number goodsIndex 购物车数组→指定店铺→商品数组的商品索引
			 * 	array shopCart 购物车数组引用
			 */
			var shopCart = $api.getStorage('shopCart');
			for(var i=0;i<shopCart.length;i++){
				if(shopCart[i].shopId == shopId){
					var g;
					for(var j=0;j<shopCart[i].wares.length, g=shopCart[i].wares[j];i++){
						if(g.id == id){
							callback(i, j, shopCart);
							$api.setStorage('shopCart', shopCart);
							this.summary();
							return;
						}
					}
				}
			}
		}
	};
	
	window.ShopCart = s;
}(window);
