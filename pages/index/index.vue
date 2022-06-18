<template>
	<view class="container">
		<view class="header">
			<view v-if="tableNumber" class="notices">
				枱號：{{tableNumber}}
			</view>
			<view v-else>
				外賣
			</view>

		</view>
		<view class="main">
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
										<actions :materials-btn="product.is_single"
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
		<product-modal :product="product" :visible="productModalVisible" @cancel="closeProductDetailModal"
			@add-to-cart="handleAddToCartInModal" />
		<cart-bar :cart="cart" @add="handleAddToCart" @minus="handleMinusFromCart" @clear="clearCart" @pay="pay" />
		<search :show="showSearch" :categories="categories" @hide="showSearch=false" @choose="showProductDetailModal">
		</search>
	</view>
</template>

<script>
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

	export default {
		components: {
			Actions,
			CartBar,
			ProductModal,
			cartPopup,
			Search
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
				showSearch: false
			}
		},
		computed: {
			...mapState(['orderType', 'address', 'tenant']),
			productCartNum() {
				return id => this.cart.reduce((acc, cur) => {
					if (cur.id === id) {
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
			this.$nextTick(() => this.calcSize())
		},
		methods: {
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
				console.log('133', product)
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
					price: product.totalPrice || product.originalPrice || product.price,
					number: product.number || 1,
					selectedOptionList: product.selectedOptionList
				})
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
</style>
