import Vue from 'vue'
import App from './App'
import store from './store'
import api from './api'
import util from './common/util.js'
import {
	socketUrl
} from 'config.js'

Vue.config.productionTip = false

App.mpType = 'app'

Vue.prototype.$store = store
Vue.prototype.$api = api
Vue.prototype.$util = util

const app = new Vue({
	store,
	...App
})

const markTenant = () => {
	try {
		const tenantId = uni.getStorageSync("tenant_id")
		uni.sendSocketMessage({
			data: JSON.stringify({
				action: "sendmessage",
				data: {
					command: 'SET_TENANT',
					tenantId
				}
			})
		})
		console.log('successfully mark tenant')
	} catch (e) {
		console.error(e)
	}
}

app.$mount()

uni.connectSocket({
	url: socketUrl
})
uni.onSocketOpen(function(res) {
	console.log('WebSocket connected！');
	markTenant()
});
uni.onSocketClose(function(res) {
	console.log('socket closed!')
})
