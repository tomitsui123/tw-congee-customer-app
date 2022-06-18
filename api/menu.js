import axios from 'axios'
import {
	apiUrl
} from '@/config.js'

const getMenu = async (tenantId) => {
	const url = `/customer/menu/${tenantId}`
	const {
		data
	} = await axios.get(apiUrl + url)
	return data.data
}

export default {
	getMenu
}
