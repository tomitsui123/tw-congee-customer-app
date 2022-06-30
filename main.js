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
app.$mount()

uni.connectSocket({
	url: socketUrl
})
uni.onSocketOpen(function(res) {
	const tenantId = uni.getStorageSync("tenant_id")
	console.log('WebSocket connected！', tenantId);
	try {
		uni.sendSocketMessage({
			data: JSON.stringify({
				action: "sendmessage",
				data: {
					command: 'SET_TENANT',
					tenantId
				}
			})
		})	
	} catch(e) {
		console.error(e)
	}
	
});
uni.onSocketClose(function(res) {
	console.log('socket closed!')
})
uni.onSocketMessage(function(res) {
	console.log('----------------receive socket data--------------------')
	console.log(JSON.stringify(res))
	console.log('----------------receive socket data--------------------')
	// Vue.prototype.$eventBus.$emit('getData', 1);
})