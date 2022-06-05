import axios from 'axios'
import {
	apiUrl
} from '@/config.js'

const getTenant = async (tenantId) => {
	uni.showLoading({
		title: '加戴中...',
		mask: true
	})
	const url = `/customer/tenant/${tenantId}`
	const {
		data
	} = await axios.get(apiUrl + url)
	uni.hideLoading()
	return data.data
}

export default {
	getTenant
}
