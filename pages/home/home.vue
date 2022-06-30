<template>
	<view class="container">
		<template v-if="Object.keys(tenant).length > 0">
			<h1 class="header">{{tenant.shopName}}</h1>
			<h2 class="header">地址: {{tenant.address}}</h2>
			<h2 class="header">電話: {{tenant.tenantPhone}}</h2>
			<h1 v-if="tableNumber" class="header">枱號:{{tableNumber}}</h1>
		</template>
		<view v-if="Object.keys(tenant).length === 0 || tenant.isClosed">
			<h1 class="header">沒有資料</h1>
		</view>
		<view v-else class="content">
			<button class="section-1" @tap="startOrder">
				<view class="item">
					<view class="button-text">開始點單</view>
				</view>
			</button>
			<button class="section-1" @tap="sendSocket">
				<view class="item">
					<view class="button-text">test</view>
				</view>
			</button>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import tenantService from '@/api/tenant.js'
	import qrCode from 'qrcode'
	export default {
		computed: {
			...mapState(['tenant'])
		},
		async onLoad(options) {
			const isFinished = uni.getStorageSync('isFinished')
			this.isFinished = isFinished
			const tenantId = uni.getStorageSync("tenant_id")
			if (options.tenant_id || tenantId) {
				if (options.tenant_id !== tenantId) {
					uni.setStorageSync("cart", "")
				}
				const data = await tenantService.getTenant(options.tenant_id || tenantId)
				this.SET_TENANT({
					...data
				})
			}
			const orderId = uni.getStorageSync("order_id")
			this.orderId = options.order_id || orderId
			this.tableNumber = options.table_number
			if (options.order_id) {
				uni.setStorageSync('order_id', options.order_id)
			}
			if (options.tenant_id) {
				uni.setStorageSync('tenant_id', options.tenant_id)
			}
			if (options.table_number) {
				uni.setStorageSync('table_number', options.table_number)
			}
		},
		methods: {
			...mapMutations(['SET_TENANT']),
			sendSocket() {
				console.log('hihihih')
				const tenantId = uni.getStorageSync("tenant_id")
				uni.sendSocketMessage({
					data: JSON.stringify({
						action: "sendmessage",
						data: {
							tenantId,
							message: 'testing'
						}
					})
				})	
			},
			startOrder() {
				if (this.isFinished) {
					uni.setStorageSync('order_id', '')
					uni.setStorageSync('isFinished', false)
				}
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		max-height: 100%;
	}

	.header {
		text-align: center;
		padding: 10px 0px;
	}

	.container {
		// background-color: darkgrey;
		padding: 210px 0px;

	}

	.content {
		height: 100%;
		width: 100%;
		padding: 0 30rpx;
		position: relative;
	}

	.section-1 {
		position: relative;
		background-color: $bg-color-white;
		border-radius: $border-radius-lg;
		padding: 60rpx 0;
		display: flex;
		margin-bottom: 30rpx;
		box-shadow: $box-shadow;

		.item {
			flex: 1;
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;

			&:nth-child(1):after {
				content: '';
				position: absolute;
				right: 0;
				top: 0;
				bottom: 0;
				width: 2rpx;
				background-color: $border-color;
			}

			image {
				width: 100rpx;
				margin-bottom: 20rpx;
			}

			.button-text {
				font-size: 48rpx;
				margin-bottom: 10rpx;
			}
		}
	}

	.section-2 {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;

		.item {
			width: 335rpx;
			background-color: #EAEBEC;
			padding: $spacing-row-lg 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			border-radius: $border-radius-lg;

			.title {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: $font-size-lg;

				image {
					width: 60rpx;
					height: 60rpx;
					margin-right: 10rpx;
				}
			}

			.tips {
				color: $text-color-assist;
				font-size: $font-size-base;
			}
		}
	}

	.section-3 {
		margin-bottom: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: $font-size-base;
		color: $text-color-assist;
		padding: 0 10rpx;

		.my-integral {
			flex: 1;
			display: flex;
			flex-direction: column;

			.integrals {
				display: flex;
				align-items: center;
				font-size: $font-size-lg;
				color: $text-color-base;
				margin-bottom: 10rpx;

				.neutra-font {
					margin-left: 10rpx;
					font-size: 42rpx;
				}
			}
		}

		.my-code {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 0 30rpx;
			position: relative;

			image {
				width: 60rpx;
				height: 60rpx;
				margin-bottom: $spacing-col-sm;
			}

			&:before {
				content: " ";
				position: absolute;
				left: 0;
				top: 0;
				bottom: 0;
				border-left: 1rpx solid rgba($color: $border-color, $alpha: 0.6);
			}
		}
	}
</style>
