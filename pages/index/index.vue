<template>
	<view class="container">
		<view class="header">
			<view class="notices">
				<text v-if="tableNumber">
					枱號：{{tableNumber}}
				</text>
				<text v-else>
					外賣
				</text>
			</view>
			<scroll-view class="category-container" scroll-y scroll-with-animation>
				<view @click="goToItemList(category)" class="category-item" v-for="(category, index) in categories"
					:key="index" :id="`products-${category.id}`">
					{{category.name}}
				</view>
			</scroll-view>
		</view>
		<!-- <view class="main">
			<scroll-view class="menu-bar" scroll-y scroll-with-animation>
				<view class="wrapper">
					<view class="menu-item" @tap="handleMenuSelected(category.id)"
						:class="{active: currentCategoryId == category.id}" v-for="(category, index) in categories"
						:key="index">
						<view class="title">{{ category.name }}</view>
					</view>
				</view>
			</scroll-view>
			<scroll-view class="product-section" scroll-y scroll-with-animation :scroll-top="productsScrollTop"
				@scroll="productsScroll">
				<view class="wrapper">
					<view class="products-list" v-for="(category, index) in categories" :key="index"
						:id="`products-${category.id}`">
						<view class="category-name">{{ category.name }}</view>
						<view class="products">
							<view class="product" v-for="(product, key) in category.products" :key="key"
								@tap="showProductDetailModal(product)">
								<view class="content">
									<view class="name">{{ product.displayName }}</view>
									<view class="description">{{ product.description }}</view>
									<view class="price">
										<view>${{ product.price }}</view>
										<actions :materials-btn="product.optionsList && product.optionsList.length > 0"
											@materials="showProductDetailModal(product)"
											:number="productCartNum(product.itemId)" @add="handleAddToCart(product)"
											@minus="handleMinusFromCart(product)" />
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		 -->
		<view>
			<uni-popup style="height: 100%;" ref="popup" background-color="#fff" @change="change">
				<view>hiasdfasdfasdf</view>
				<view class="popup-content popup-height">
					<scroll-view class="product-section" scroll-y scroll-with-animation :scroll-top="productsScrollTop">
						<view class="products">
							<view class="product" v-for="(product, key) in selectedCategory.products" :key="key"
								@tap="showProductDetailModal(product)">
								<view class="content">
									<view class="name">{{ product.displayName }}</view>
									<view class="description">{{ product.description }}</view>
									<view class="price">
										<view>${{ product.price }}</view>
										<actions :materials-btn="product.optionsList && product.optionsList.length > 0"
											@materials="showProductDetailModal(product)"
											:number="productCartNum(product.itemId)" @add="handleAddToCart(product)"
											@minus="handleMinusFromCart(product)" />
									</view>
								</view>
							</view>
						</view>

					</scroll-view>
				</view>
			</uni-popup>
		</view>
		<product-modal :product="product" :visible="productModalVisible" @cancel="closeProductDetailModal"
			@add-to-cart="handleAddToCartInModal" />
		<cart-bar :cart="cart" @add="handleAddToCart" @minus="handleMinusFromCart" @clear="clearCart" @pay="pay" />
		<search :show="showSearch" :categories="categories" @hide="showSearch=false" @choose="showProductDetailModal">
		</search>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import md5 from 'md5'
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import Actions from './components/actions/actions.vue'
	import CartBar from './components/cartbar/cartbar.vue'
	import ProductModal from './components/product-modal/product-modal.vue'
	import cartPopup from './components/cart-popup/cart-popup.vue'
	import Search from './components/search/search.vue'

	import menuService from '@/api/menu.js'
	import {
		checkLogic
	} from '@/common/util'

	export default {
		components: {
			Actions,
			CartBar,
			ProductModal,
			cartPopup,
			Search,
			uniPopup
		},
		data() {
			return {
				categories: [],
				cart: [],
				product: {},
				currentCategoryId: 0,
				productModalVisible: false,
				cartPopupShow: false,
				productsScrollTop: 0,
				showSearch: false,
				selectedCategory: {}
			}
		},
		computed: {
			...mapState(['orderType', 'address', 'tenant']),
			productCartNum() {
				return itemId => this.cart.reduce((acc, cur) => {
					if (cur.itemId === itemId) {
						return acc += cur.number
					}
					return acc
				}, 0)
			}
		},
		onShow() {
			const isFinished = uni.getStorageSync("isFinished")
			if (isFinished) {
				setTimeout(() => {
					uni.showToast({
						title: '帳單已逾時',
						mask: true
					})
					uni.switchTab({
						url: '/pages/order/order'
					})
				}, 1000)
			}
			const cart = uni.getStorageSync("cart")
			this.cart = []
			if (cart) {
				this.cart = cart
			}
			uni.connectSocket({
				url: socketUrl
			})
		},
		async onLoad(options) {
			const tableNumber = uni.getStorageSync('table_number')
			const orderId = uni.getStorageSync("order_id")
			const tenantId = uni.getStorageSync("tenant_id")
			const cart = uni.getStorageSync("cart")

			this.tableNumber = tableNumber
			this.orderId = orderId
			this.tenantId = tenantId
			this.cart = []
			if (cart) {
				this.cart = cart
			}
			let data = await menuService.getMenu(tenantId)
			this.categories = data
			this.currentCategoryId = this.categories.length && this.categories[0].id
			// this.$nextTick(() => this.calcSize())
		},
		methods: {
			goToItemList(category) {
				this.type = "right"
				this.$refs.popup.open("right")
				this.selectedCategory = category
				console.log('here', category)
			},
			...mapMutations(['SET_ORDER_TYPE']),
			switchOrderType() {
				if (this.orderType === 'takein') {
					uni.navigateTo({
						url: '/pages/addresses/addresses'
					})
				} else {
					this.SET_ORDER_TYPE('takein')
				}
			},
			handleAddToCart(product) {
				product.discount = product.condition.reduce((acc, cur) => {
					if (!product.selectedOptionList || product.selectedOptionList.length === 0) return acc
					const selectedOptionList = product.selectedOptionList.map(e1 => e1.optionGroupId)
					const {
						condition
					} = cur
					if (checkLogic(selectedOptionList, condition)) {
						if (Object.keys(acc).length === 0) {
							return {
								description: cur.description,
								price: cur.price,
								id: cur.id
							}
						}
						if (Object.keys(acc).length > 0 && acc.price < cur.price) {
							return {
								description: cur.description,
								price: cur.price,
								id: cur.id
							}
						}
					}
					return acc
				}, {})
				console.log(product)
				const index = this.cart.findIndex(item => {
					let itemCode = ''
					if (item.selectedOptionList) {
						itemCode = md5(item.selectedOptionList)
					}
					let productCode = ''
					if (product.selectedOptionList) {
						productCode = md5(product.selectedOptionList)
					}
					return (item.itemId === product.itemId) && itemCode === productCode
				})
				if (index > -1) {
					this.cart[index].number += (product.number || 1)
					return
				}
				this.cart.push({
					itemId: product.itemId,
					cate_id: product.categoryId || product.cate_id,
					name: product.displayName || product.name,
					originalPrice: product.price,
					price: (product.totalPrice || product.originalPrice || product.price),
					number: product.number || 1,
					selectedOptionList: product.selectedOptionList,
					discount: product.discount,
					condition: product.condition
				})
				uni.setStorageSync("cart", this.cart)
			},
			handleMinusFromCart(product) {
				let index = this.cart.findIndex(item => item.id == product.id)
				if (index < 0) {
					return
				}
				this.cart[index].number -= 1
				if (this.cart[index].number <= 0) {
					this.cart.splice(index, 1)
				}
			},
			showProductDetailModal(product) {
				if ('optionsList' in product) {
					this.product = product
					this.productModalVisible = true
				} else {
					this.handleAddToCart(product)
				}
			},
			handleAddToCartInModal(product) {
				this.handleAddToCart(product)
				this.closeProductDetailModal()
			},
			closeProductDetailModal() {
				this.productModalVisible = false
				this.product = {}
			},
			openCartDetailsPopup() {
				this.$refs['cartPopup'].open()
			},
			clearCart() {
				this.cart = []
			},
			handleMenuSelected(id) {
				this.productsScrollTop = this.categories.find(item => item.id == id).top
				this.$nextTick(() => this.currentCategoryId = id)
			},
			productsScroll({
				detail
			}) {
				const {
					scrollTop
				} = detail
				let tabs = this.categories.filter(item => item.top <= scrollTop).reverse()
				if (tabs.length > 0) {
					this.currentCategoryId = tabs[0].id
				}
			},
			calcSize() {
				let h = 0
				let view = uni.createSelectorQuery().select('#ads')
				view.fields({
					size: true
				}, data => {
					if (!data) return
					h += Math.floor(data.height)
				}).exec()
				this.categories.forEach(item => {
					let view = uni.createSelectorQuery().select(`#products-${item.id}`)
					view.fields({
						size: true
					}, data => {
						item.top = h
						h += Math.floor(data.height)
						item.bottom = h
					}).exec()
				})
			},
			pay() {
				uni.setStorageSync('cart', this.cart)
				uni.navigateTo({
					url: '/pages/pay/pay'
				})
			}
		}
	}
</script>

<style lang="scss">
	@import './index.scss';

	@mixin flex {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	@mixin height {
		/* #ifndef APP-NVUE */
		height: 100%;
		/* #endif */
		/* #ifdef APP-NVUE */
		flex: 1;
		/* #endif */
	}

	.box {
		@include flex;
	}

	.button {
		@include flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		height: 35px;
		margin: 0 5px;
		border-radius: 5px;
	}

	.example-body {
		background-color: #fff;
		padding: 10px 0;
	}

	.button-text {
		color: #fff;
		font-size: 12px;
	}

	.popup-content {
		@include flex;
		align-items: center;
		justify-content: center;
		padding: 15px;
		height: 100%;
		background-color: #fff;

		.products {
			display: flex;
			flex-direction: column;
			margin-bottom: 10px;
			width: 100%;

			.product {
				display: flex;
				align-items: center;
				margin-bottom: 20px;
				width: 100%;

				.content {
					flex: 1;
					flex-direction: column;
					display: flex;
					overflow: hidden;
					width: 100%;
					padding: 5px;
					border-bottom: 1px solid #eef2f5;

					.name {
						font-size: 14px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						margin-bottom: 4px;
					}

					.description {
						margin-bottom: 10px;
						display: -webkit-box;
						overflow: hidden;
						color: #999;
						font-size: 12px;
					}

					.price {
						font-size: 18px;
						color: 13px;
						font-weight: bold;
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
				}
			}
		}
	}

	.popup-height {
		@include height;
	}

	.text {
		font-size: 12px;
		color: #333;
	}

	.popup-success {
		color: #fff;
		background-color: #e1f3d8;
	}

	.popup-warn {
		color: #fff;
		background-color: #faecd8;
	}

	.popup-error {
		color: #fff;
		background-color: #fde2e2;
	}

	.popup-info {
		color: #fff;
		background-color: #f2f6fc;
	}

	.success-text {
		color: #09bb07;
	}

	.warn-text {
		color: #e6a23c;
	}

	.error-text {
		color: #f56c6c;
	}

	.info-text {
		color: #909399;
	}

	.dialog,
	.share {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
	}

	.dialog-box {
		padding: 10px;
	}

	.dialog .button,
	.share .button {
		/* #ifndef APP-NVUE */
		width: 100%;
		/* #endif */
		margin: 0;
		margin-top: 10px;
		padding: 3px 0;
		flex: 1;
	}

	.dialog-text {
		font-size: 14px;
		color: #333;
	}
</style>
