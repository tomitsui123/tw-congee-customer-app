<template>
	<scroll-view scroll-y style="height: 100%;">
		<view v-if="!order" />
		<view v-else class="container">
			<view class="content-container">
				<view style="text-align: center;">
					<h1>訂單({{order.statusText}})</h1>
				</view>
			</view>
			<view class="content-container">
				<h3 v-if="order.tableNumber">詳情（堂食 {{order.tableNumber}}桌）</h3>
				<h3 v-else>詳情（外賣）</h3>
				<view class="product-wrapper">
					<div class="product-item" v-for="item in order.details">
						<div class="product-info">
							<div class="row-header">
								<uni-text>{{item.displayName}}</uni-text>
								<uni-text class="price"><span>${{item.afterPrice}}</span></uni-text>
							</div>
							<div class="row-header">
								<div class="product-option">
									{{item.selectedOptionList.map(e => e.displayName).join(" | ")}}
								</div>
								<uni-text class="product-count"><span>x{{item.number}}</span></uni-text>
							</div>
						</div>
					</div>
				</view>
				<div class="price-container">
					<div class="row-header">
						<uni-text class="title"><span>訂單金額</span></uni-text>
						<uni-text class="price"><span>${{order.total}}</span></uni-text>
					</div>
					<div class="row-header">
						<uni-text class="title"><span>折扣</span></uni-text>
						<uni-text class="price"><span>$-{{order.discount || 0}}</span></uni-text>
					</div>
					<div class="row-header">
						<uni-text class="title"><span>實付金額</span></uni-text>
						<uni-text class="price">${{order.total - (order.discount || 0)}}</uni-text>
					</div>
				</div>
			</view>
			<view class="content-container" style="text-align: center;">
				<qr-code-container :orderId="order.orderId" />
			</view>
		</view>

	</scroll-view>
</template>

<script>
	import QrCodeContainer from '@/components/QrCodeContainer.vue'
	import orderService from '@/api/orders.js'
	export default {
		components: {
			QrCodeContainer
		},
		data() {
			return {
				tabIndex: 0,
				orderMenuIndex: 0,
				order: {},
				storeOrders: [],
				imgSrc: ""
			}
		},
		computed: {
			batchInvoiceVisible() {
				return (!this.orderMenuIndex && this.orders.length) || (this.orderMenuIndex && this.storeOrders.length)
			}
		},
		async onShow() {
			const orderId = uni.getStorageSync("order_id")
			const tenantId = uni.getStorageSync("tenant_id")
			if (!orderId) {
				setTimeout(async () => {
					uni.showToast({
						title: "帳單已逾時，請重新戴入"
					})
					uni.switchTab({
						url: "/pages/home/home"
					})
				}, 3000)
			}
			try {
				const data = await orderService.getOrder(orderId, tenantId)
				this.order = {
					...data
				}
			} catch (e) {
				console.error(e)
				if (e === 'expired') {
					uni.setStorageSync("order_id", "")
				}
				setTimeout(() => {
					uni.switchTab({
						url: "/pages/home/home"
					})
				}, 2000)
			}
		},
		methods: {
			async switchTab(index) {
				if (this.tabIndex === index) return
				this.tabIndex = index
				if (this.tabIndex) {
					await this.getOrders()
				}
			},
			handleSwiperItemChange() {
				return true
			},
			async switchMenuTab(index) {
				if (this.orderMenuIndex === index) return
				this.orderMenuIndex = index
				await this.getOrders()
			},
			async getOrders() {
				if (!this.orderMenuIndex) {
					this.orders = await this.$api('orders')
				} else {
					this.storeOrders = await this.$api('storeOrders')
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.price-container {
		display: flex;
		flex-direction: column;
		margin-top: 10px;

	}

	.row-header {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		.price {
			font-size: 40rpx;
			font-weight: bold;
		}
	}

	.product-wrapper {
		margin-top: 50rpx;
	}

	.product-item {
		display: flex;
		flex-direction: row;
		height: 1.6rem;
		margin: 0.213333rem 0;
		height: 100%;

		.product-info {
			display: -webkit-flex;
			display: -ms-flexbox;
			display: flex;
			flex-direction: column;
			margin-left: 0.266667rem;
			align-items: center;
			flex-grow: 1;

			.product-count {
				font-size: 40rpx;
			}

			.product-right {
				display: -webkit-flex;
				display: -ms-flexbox;
				display: flex;
				-webkit-flex-direction: column;
				-ms-flex-direction: column;
				flex-direction: column;
			}

			.item-center {
				display: -webkit-flex;
				display: -ms-flexbox;
				display: flex;
				-webkit-flex-direction: column;
				-ms-flex-direction: column;
				flex-direction: column;
				-webkit-flex-grow: 1;
				-ms-flex-positive: 1;
				flex-grow: 1;
				-webkit-justify-content: center;
				-ms-flex-pack: center;
				justify-content: center;
			}

			.row-1 {
				display: -webkit-flex;
				display: -ms-flexbox;
				display: flex;
				-webkit-flex-direction: row;
				-ms-flex-direction: row;
				flex-direction: row;
				-webkit-align-items: flex-end;
				-ms-flex-align: end;
				align-items: flex-end;
			}

			.product-option {
				font-size: 25rpx;
				font-weight: 400;
				color: #999;
				line-height: 25rpx;
			}
		}
	}

	.content-container {
		background-color: white;
		border-radius: 10px;
		padding: 15px;
		margin: 10px;
	}

	page {
		background-color: #f6f6f6;
	}

	.navbar {
		height: calc(44px + var(--status-bar-height));
		/* #ifdef H5 */
		height: 44px;
		/* #endif */
		display: flex;
		background-color: #FFFFFF;
	}

	.talk-btn {
		height: 32px;
		margin-left: 10px;
		margin-top: 26px;
		/* #ifdef H5 */
		margin-top: 6px;
		/* #endif */
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: $font-size-sm !important;
		padding: 0 20rpx;
		border-radius: 50rem !important;

		image {
			width: 40rpx;
			height: 40rpx;
			margin-right: $spacing-row-sm;
		}
	}

	.tabbar {
		height: 100rpx;
		background-color: $bg-color-white;
		display: flex;
		align-items: center;
		justify-content: space-around;

		.item {
			height: 100%;
			font-size: $font-size-lg;
			color: $text-color-assist;
			font-weight: 400 !important;
			display: flex;
			align-items: center;

			&.active {
				color: $text-color-base;
				border-bottom: 4rpx solid $text-color-base;
			}
		}
	}

	.swiper {
		width: 100%;
		height: calc(100vh - 44px - var(--status-bar-height) - 110rpx);
		/* #ifdef H5 */
		height: calc(100vh - 44px - var(--status-bar-height) - 110rpx - 100rpx);
		/* #endif */
	}

	.no-order-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		image {
			width: 300rpx;
			height: 300rpx;
			margin-bottom: 50rpx;
		}

		.tips {
			color: $text-color-assist;
			display: flex;
			flex-direction: column;
			align-items: center;
			line-height: 1.2rem !important;
			margin-bottom: 70rpx;
		}

		button {
			width: 50%;
		}
	}

	.history-order {
		width: 100%;
		height: 100%;
		position: relative;

		.menu {
			padding: 18rpx 30rpx;
			display: flex;
			align-items: center;
			font-size: $font-size-base;
			color: $text-color-grey;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 10;

			.item {
				padding: 14rpx 30rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				image {
					width: 40rpx;
					height: 40rpx;
					margin-right: 10rpx;
				}

				&.active {
					color: $color-primary;
					background-color: $bg-color-white;
				}
			}
		}

		.history-order-swiper {
			width: 100%;
			height: 100%;
		}
	}

	.store-order-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: $font-size-base;
		color: $text-color-assist;
		line-height: 1.3rem !important;

		image {
			width: 400rpx;
			height: 333rpx;
			margin-bottom: 40rpx;
		}
	}

	.orders-scroll {
		width: 100%;
		height: 100%;
		padding-top: 104rpx;
	}

	.order-list {
		display: flex;
		width: 100%;
		flex-direction: column;

		.order {
			background-color: $bg-color-white;
			padding: 30rpx 40rpx;
			margin-bottom: 18rpx;

			.header {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.status {
					font-size: $font-size-base;
					color: $text-color-grey;
					display: flex;
					align-items: center;

					image {
						width: 30rpx;
						height: 30rpx;
						margin-left: $spacing-row-sm;
					}
				}
			}

			.images {
				display: flex;
				padding: 30rpx 0;

				image {
					flex-shrink: 0;
					width: 150rpx;
					height: 112.5rpx;
				}
			}

			.info {
				display: flex;
				align-items: center;
				margin-bottom: 30rpx;

				.left {
					flex: 1;
					display: flex;
					flex-direction: column;
					font-size: $font-size-base;
					color: $text-color-grey;
				}

				.right {
					font-size: $font-size-lg;
					color: $text-color-base;
				}
			}

			.action {
				display: flex;
				justify-content: flex-end;
				align-items: center;

				button {
					margin-left: 30rpx;
					font-size: $font-size-sm;
				}
			}
		}
	}
</style>
