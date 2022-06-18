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
	const url = `${apiUrl}/customer/order/${orderId}/tenant/${tenantId}`
	uni.showLoading({
		title: '加戴中...',
		mask: true
	})
	try {
		const data = await axios.put(url, {
			cart
		})
	} catch (e) {
		console.log('e', e)
		setTimeout(async () => {
			uni.setStorageSync("order_id", "")
			uni.setStorageSync("table_number", "")
			uni.showToast({
				title: "帳單已逾時，請重新戴入"
			})
			uni.switchTab({
				url: "/pages/home/home"
			})
		}, 3000)
	}
	uni.hideLoading()
}

const createTakeawayOrder = async (tenantId, cart) => {
	let url = `${apiUrl}/customer/order/tenant/${tenantId}`
	const resp = await axios.post(url, {
		cart,
	})
	return resp
}
export default {
	getOrder,
	commitOrder,
	createTakeawayOrder
}
