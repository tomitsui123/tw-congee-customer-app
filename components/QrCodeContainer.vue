<template>
	<view>
		<img :src="content" style="width: 400rpx; height: 400rpx;" />
	</view>
</template>

<script>
	import QRCode from 'qrcode'
	export default {
		name: "QrCodeContainer",
		props: {
			orderId: String
		},
		data() {
			return {
				orderId: "",
				content: ""
			}
		},
		async mounted() {
			this.content = await QRCode.toDataURL(this.orderId)
		},
		watch: {
			async orderId(newVal, oldVal) {
				if (newVal) {
					this.content = await QRCode.toDataURL(newVal)
				}
			}
		}
	}
</script>
