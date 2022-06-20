<template>
	<view class="container">
		<view class="bg-white p-30 d-flex align-items-center justify-content-between mb-20">
			<view>
				<text v-if="!orderId">外賣</text>
				<text v-else>枱號：{{tableNumber}}</text>
			</view>
		</view>
		<view class="bg-white pt-30 mb-20">
			<view class="font-size-medium font-weight-bold mb-30 pl-30">商品列表</view>
			<list-cell line-right v-for="(item, index) in cart">
				<view class="w-100 d-flex align-items-center overflow-hidden">
					<view class="w-100 align-items-center">
						<view class="w-100 d-flex align-items-center">
							<view class="d-flex align-items-center">
								<view class="flex-shrink-0">{{item.name}} (原價${{item.originalPrice}}) </view>
								<view class="flex-shrink-0 "> X {{item.number}}</view>
							</view>
						</view>
						<view class="selectedOption" v-if="item.selectedOptionList">
							{{ item.selectedOptionList.map(e => `${e.displayName} +$${e.price}`).join(' | ')}}
						</view>
						<view class="selectedOption" v-if="Object.keys(item.discount).length > 0">
							{{item.discount.description}}(${{item.discount.price}})
						</view>
					</view>
					<view v-if="Object.keys(item.discount).length > 0" class="flex-shrink-0 ml-20">
						${{item.number * (item.price + item.discount.price)}}</view>
					<view v-else class="flex-shrink-0 ml-20">${{item.number * item.price}}</view>
				</view>
			</list-cell>
			<list-cell last>
				<view class="w-100 d-flex justify-content-end align-items-center">
					<text class="font-size-sm">共{{ cartNum }}件食物，小計</text>
					<text class="font-size-lg font-weight-bold">${{ cartAmount }}</text>
				</view>
			</list-cell>
		</view>
		<view class="footer">
			<view class="mr-30">
				合計：<text class="font-size-lg font-weight-bold">${{ cartAmount }}</text>
			</view>
			<button @click="confirmOrder" v-if="orderId" type="primary">確定</button>
			<button @click="scanToOrder" v-else type="primary">外賣落單</button>
		</view>
	</view>
</template>

<script>
	import listCell from '@/components/list-cell/list-cell.vue'
	import orderService from '@/api/orders.js'

	export default {
		components: {
			listCell
		},
		data() {
			return {
				cart: uni.getStorageSync('cart'),
				orderId: '',
				tableNumber: ''
			}
		},
		onLoad() {
			const orderId = uni.getStorageSync('order_id')
			if (orderId) {
				this.orderId = orderId
			}
			const tableNumber = uni.getStorageSync('table_number')
			if (tableNumber) {
				this.tableNumber = tableNumber
			}
		},
		computed: {
			cartNum() {
				return this.cart.reduce((acc, cur) => acc + cur.number, 0)
			},
			cartAmount() {
				return this.cart.reduce((acc, cur) => {
					if (Object.keys(cur.discount).length > 0) {
					return acc + cur.number * (cur.price + cur.discount.price)	
					}
					return acc + cur.number * cur.price
				}, 0)
			},
			remark() {
				return this.$store.state.remark
			}
		},
		methods: {
			async confirmOrder() {
				uni.showLoading({
					title: '正在落單...',
					mask: true
				})
				console.log('confirm order')
				const tenantId = uni.getStorageSync('tenant_id')
				const orderId = uni.getStorageSync('order_id')
				const cart = uni.getStorageSync('cart')
				try {
					await orderService.commitOrder(orderId, tenantId, cart)
					uni.switchTab({
						url: '/pages/order/order'
					})
					uni.setStorageSync("cart", "")
				} catch (e) {
					if (e.message === '帳單已逾時') {
						setTimeout(async () => {
							uni.showToast({
								title: "帳單已逾時，請重新戴入"
							})
							uni.switchTab({
								url: "/pages/home/home"
							})
						}, 3000)
					}
					console.error(e)
					uni.hideLoading()
				}

			},
			async scanToOrder() {
				const tenantId = uni.getStorageSync('tenant_id')
				const cart = uni.getStorageSync('cart')
				uni.showLoading({
					title: '正在生成訂單',
					mask: true
				})
				const {
					data
				} = await orderService.createTakeawayOrder(tenantId, cart)
				uni.hideLoading()
				uni.setStorageSync("order_id", data.data.orderId)
				uni.setStorageSync('cart', '')
				uni.switchTab({
					url: '/pages/order/order'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: auto;
		padding-bottom: 120rpx;
	}

	.pro-img {
		width: 120rpx;
		height: 90rpx;
		flex-shrink: 0;
	}

	.coupon-label {
		background-color: $color-primary;
		color: #FFFFFF;
		font-size: 18rpx;
		line-height: 0.9rem;
		width: 0.9rem;
		height: 0.9rem;
		margin-left: 10rpx;
		text-align: center;
	}

	.wx-pay-icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
	}

	.footer {
		background-color: #FFFFFF;
		z-index: 10;
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: flex-end;
		align-items: center;

		button {
			width: 250rpx;
			text-align: center;
			padding: 0;
			height: 100%;
			line-height: 100rpx;
			border-radius: 0 !important;
			font-size: $font-size-lg;
		}
	}

	.selectedOption {
		font-size: $font-size-sm;
		color: $text-color-assist;
	}
</style>
