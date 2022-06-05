import axios from 'axios'
import {
	apiUrl
} from '@/config.js'

const getMenu = async (tenantId) => {
	const url = `/customer/menu/${tenantId}`
	console.log(apiUrl + url)
	const {
		data
	} = await axios.get(apiUrl + url)
	console.log(data)
	return data.data
}

export default {
	getMenu
}
