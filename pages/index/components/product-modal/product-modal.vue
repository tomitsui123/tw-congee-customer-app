<template>
	<modal :show="visible" custom padding="0" width="90%" radius="18rpx">
		<view class="header">
			<image src="/static/images/index/round_close_btn.png" @tap="$emit('cancel')"></image>
		</view>
		<scroll-view scroll-y class="content">
			<view class="wrapper">
				<view class="title">{{ productData.displayName }}</view>
				<view class="materials" v-for="(material, index) in productData.optionsList" :key="index">
					<view class="group-name">{{ material.displayName }} {{material.minSelection > 0 ? "必選": ""}}
						{{material.maxSelection > 0 ? `最多可選${material.maxSelection}個` : ""}}
					</view>
					<view class="values">
						<view class="value" :class="{selected: value.isSelected}"
							@tap="changeMaterialSelected(index, key)" v-for="(value, key) in material.choiceList"
							:key="key">
							{{ value.displayName }}
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<view class="bottom" :style="{height: !productData.is_single ? '250rpx' : '200rpx'}">
			<view class="d-flex align-items-center">
				<view class="price-and-materials">
					<view class="price">${{ productData.totalPrice }}</view>
					<view class="materials" v-show="getProductSelectedMaterials">{{ getProductSelectedMaterials }}
					</view>
				</view>
				<actions :number="productData.number" @add="add" @minus="minus"></actions>
			</view>
			<button type="primary" class="add-cart-btn" @tap="addToCart">確認</button>
		</view>
	</modal>
</template>

<script>
	import Modal from '@/components/modal/modal.vue'
	import Actions from '../actions/actions.vue'

	export default {
		name: 'ProductModal',
		components: {
			Modal,
			Actions
		},
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			product: {
				type: Object,
				default: () => {}
			}
		},
		data() {
			return {
				productData: {}
			}
		},
		watch: {
			product(val) {
				this.productData = JSON.parse(JSON.stringify(val))
				this.productData.totalPrice = this.productData.price
				this.$set(this.productData, 'number', 1)
			}
		},
		computed: {
			getProductSelectedMaterials() {
				if (!this.productData.is_single && this.productData.itemOptionList) {
					let itemOptionList = []
					this.productData.itemOptionList.forEach(({
						values
					}) => {
						values.forEach(value => {
							if (value.is_selected) {
								itemOptionList.push(value.name)
							}
						})
					})
					return itemOptionList.length ? itemOptionList.join('，') : ''
				}
				return ''
			}
		},
		methods: {
			changeMaterialSelected(index, key) {
				const {
					id: modifierGroupId
				} = this.productData.optionsList[index]
				const currentMaterial = this.productData.optionsList[index].choiceList[key]
				const currentCount = this.productData.optionsList[index].choiceList.filter(e => e.isSelected).length
				const {
					minSelection,
					maxSelection
				} = this.productData.optionsList[index]
				if (currentMaterial.isSelected) {
					this.$set(this.productData.optionsList[index].choiceList[key], "isSelected", false)
					if (this.productData.selectedOptionList) {
						this.productData.selectedOptionList = this.productData.selectedOptionList.filter(e => e
							.modifierId === this.productData.optionsList[index].choiceList[key].optionId && e
							.optionId === modifierGroupId)
					}
					this.productData.totalPrice -= currentMaterial.price
				}
				if (currentCount < maxSelection) {
					this.$set(this.productData.optionsList[index].choiceList[key], "isSelected", true)
					if (!this.productData.selectedOptionList) this.productData.selectedOptionList = []
					this.productData.selectedOptionList.push({
						optionId: this.productData.optionsList[index].choiceList[key].optionId,
						optionGroupId: modifierGroupId,
						displayName: this.productData.optionsList[index].choiceList[key].displayName,
						price: this.productData.optionsList[index].choiceList[key].price
					})
					this.productData.totalPrice += currentMaterial.price
				}
				this.productData.number = 1
				console.log(this.productData)
			},
			add() {
				this.productData.number += 1
			},
			minus() {
				if (this.productData.number == 1) {
					return
				}
				this.productData.number -= 1
			},
			addToCart() {
				const product = {
					...this.productData
				}
				this.$emit('add-to-cart', product)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.header {
		padding: 20rpx 30rpx;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: flex-end;
		z-index: 11;

		image {
			width: 60rpx;
			height: 60rpx;

			&:nth-child(1) {
				margin-right: 30rpx;
			}
		}
	}

	.swiper {
		height: 426rpx;
	}

	.content {
		display: flex;
		flex-direction: column;
		font-size: $font-size-sm;
		color: $text-color-assist;
		min-height: 1vh;
		max-height: calc(100vh - 100rpx - 426rpx - 250rpx);

		.wrapper {
			width: 100%;
			height: 100%;
			overflow: hidden;
			padding: 30rpx 30rpx 20rpx;
		}

		.title {
			font-size: $font-size-extra-lg;
			color: $text-color-base;
			font-weight: bold;
			margin-bottom: 10rpx;
		}

		.labels {
			display: flex;
			font-size: 20rpx;
			margin-bottom: 10rpx;
			overflow: hidden;
			flex-wrap: wrap;

			.label {
				max-width: 40%;
				padding: 6rpx 10rpx;
				margin-right: 10rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.materials {
			width: 80%;
			margin-bottom: 20rpx;
			font-size: 35rpx;

			.group-name {
				padding: 10rpx 0;
			}

			.values {
				display: flex;
				flex-wrap: wrap;
				overflow: hidden;

				.value {
					background-color: #f5f5f7;
					color: $font-size-base;
					padding: 10rpx 20rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					margin-right: 20rpx;
					margin-bottom: 20rpx;
					border-radius: $border-radius-lg;

					&.selected {
						background-color: $color-primary;
						color: $bg-color-white;
					}
				}
			}
		}
	}

	.bottom {
		padding: 20rpx 40rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-top: 1rpx solid rgba($color: $border-color, $alpha: 0.3);
		background-color: $bg-color-white;
		position: relative;
		z-index: 11;

		.price-and-materials {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			margin-right: 10rpx;

			.price {
				color: $color-primary;
				font-size: $font-size-extra-lg;
				font-weight: bold;
			}

			.materials {
				font-size: $font-size-sm;
				color: $text-color-assist;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
		}

		.add-cart-btn {
			margin-top: 20rpx;
			font-size: $font-size-lg;
			border-radius: $border-radius-base;
		}
	}
</style>
