function formatTime(time) {
	if (typeof time !== 'number' || time < 0) {
		return time
	}

	var hour = parseInt(time / 3600)
	time = time % 3600
	var minute = parseInt(time / 60)
	time = time % 60
	var second = time

	return ([hour, minute, second]).map(function(n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}).join(':')
}

function formatDateTime(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
	if (!date) {
		return ''
	}
	if (typeof(date) === 'number') {
		date = new Date(date * 1000)
	}
	var o = {
		"M+": date.getMonth() + 1, //月份
		"d+": date.getDate(), //日
		"h+": date.getHours(), //小时
		"m+": date.getMinutes(), //分
		"s+": date.getSeconds(), //秒
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度
		"S": date.getMilliseconds() //毫秒
	}
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
	return fmt
}

function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude)
		latitude = parseFloat(latitude)
	}

	longitude = longitude.toFixed(2)
	latitude = latitude.toFixed(2)

	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	}
}

var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDate()) + '-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};

const hexToRgba = (hex, opacity) => { //16进制颜色转rgba
	return "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt(
		"0x" + hex.slice(5, 7)) + "," + opacity + ")"
}

function checkLogic(selectedItemList, logicObject) {
	let isFulfill
	const logicObjectList = Object.keys(logicObject)
	for (let i = 0; i < logicObjectList.length; i++) {
		const targetArray = logicObject[logicObjectList[i]]
		for (let j = 0; j < targetArray.length; j++) {
			const isString = typeof targetArray[j] === 'string'
			if (isString) {
				if (logicObjectList[i] === 'or') {
					const idx = selectedItemList.findIndex(e => targetArray.includes(e))
					if (idx > -1) {
						selectedItemList.splice(idx, 1)
						isFulfill = true
						break
					} else {
						isFulfill = false
					}
				} else {
					let t = [...targetArray]
					for (let k = 0; k < selectedItemList.length; k++) {
						const selectedItem = selectedItemList[k]
						const idx = t.findIndex(e => e === selectedItem)
						if (idx > -1) {
							t.splice(idx, 1)
						}
						isFulfill = t.length === 0
					}
				}
			} else {
				if (typeof isFulfill === 'boolean' && isFulfill === false) {
					if (logicObjectList[i] === 'and') {
						const temp = checkLogic(selectedItemList, targetArray[j])
						isFulfill = isFulfill && temp
					} else {
						const temp = checkLogic(selectedItemList, targetArray[j])
						isFulfill = isFulfill || temp
					}
				} else {
					isFulfill = checkLogic(selectedItemList, targetArray[i])
				}
			}
		}
	}
	return isFulfill
}

module.exports = {
	formatTime,
	formatDateTime,
	formatLocation,
	dateUtils,
	hexToRgba,
	checkLogic
}
