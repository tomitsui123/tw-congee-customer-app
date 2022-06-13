import axios from 'axios'
import {
	apiUrl
} from '@/config.js'

const getOrder = async (orderId, tenantId) => {
	try {
		const url = `/customer/order/${orderId}/tenant/${tenantId}`
		uni.showLoading({
			title: '加戴中...',
			mask: true
		})
		const data = await axios.get(apiUrl + url)
		uni.hideLoading()
		return data.data.data
	} catch (e) {
		uni.showToast({
			title: e.response.data.err,
			icon: 'error'
		})
		throw "expired"
	}
	uni.hideLoading()
}

const commitOrder = async (orderId, tenantId, cart) => {
	const url = `/customer/order/${orderId}/tenant/${tenantId}`
	uni.showLoading({
		title: '加戴中...',
		mask: true
	})
	uni.hideLoading()
}
export default {
	getOrder,
	commitOrder
}
