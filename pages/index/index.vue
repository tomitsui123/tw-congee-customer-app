<template>
	<view class="container">
		<view class="header">
			<view v-if="orderId" class="notices">
				枱號：{{tableNumber}}
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
		async onLoad(options) {
			const tableNumber = uni.getStorageSync('table_number')
			const orderId = uni.getStorageSync("order_id")
			const tenantId = uni.getStorageSync("tenant_id")
			this.tableNumber = tableNumber
			this.orderId = orderId
			this.tenantId = tenantId
			let data = await menuService.getMenu(tenantId)
			data = data.map(e => {
				e.products = e.products.map(p => {
					p.is_single = p.optionsList && p.optionsList.length > 0
					return p
				})
				return e
			})
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
				const index = this.cart.findIndex(item => {
					if (!product.is_single) {
						return (item.id == product.itemId)
					} else {
						return item.id === product.itemId
					}
				})
				if (index > -1) {
					this.cart[index].number += (product.number || 1)
					return
				}
				this.cart.push({
					id: product.itemId,
					cate_id: product.categoryId,
					name: product.displayName,
					price: product.price,
					number: product.number || 1,
					is_single: product.is_single,
				})
			},
			handleMinusFromCart(product) { //从购物车减商品
				let index
				if (product.is_single) {
					index = this.cart.findIndex(item => item.id == product.itemId)
				} else {
					index = this.cart.findIndex(item => (item.id == product.itemId) && (item.materials_text == product
						.materials_text))
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
				console.log(product)
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
