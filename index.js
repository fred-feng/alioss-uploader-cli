/**
 * Created by Fred(qq:24242811) on 2018/8/18.
 */
const crypto = require('crypto');
const OSS = require('ali-oss')
const fs = require('fs-extra')
const co = require('co')
const path = require('path')
const rc = require('rc')

class AliossUploader{
	constructor(options) {
		if (options.ossKey){
			options = Object.assign(options, JSON.parse(aesDecrypt(options.ossKey, 'stgame.cn')))
		}
		this.options = Object.assign({
			enableLog:true
		}, options)
		this.client = new OSS(options)
	}
	start(){
		let outputPath = path.join(__dirname, this.options.srcPath)

		let startTime = now()
		co(function* () {
			this.log('---UPLOAD START---')
			let list = browserFiles(outputPath)
			if (this.options.exclude){
				this.options.exclude = new RegExp(this.options.exclude)
				list = list.filter((vo)=>this.options.exclude.test(vo))
			}
			let prefix = this.options.prefix || ''
			for (let i = 0; i < list.length; i++) {
				const filePath = list[i];
				const key = path.join(prefix, filePath.slice(outputPath.length))
				this.log(i, key, filePath)
				yield this.client.put(key, filePath)
			}
			this.log(`---UPLOAD END (${now()-startTime}ms)---`)
		}.bind(this)).catch(function (err) {
			throw err
		});
	}

	log(...rest){
		if (this.options.enableLog){
			console.log.apply(this, rest)
		}
	}
}

function now() {
	return (new Date()).getTime()
}
function browserFiles(folder, list){
	list = list || []
	fs.readdirSync(folder).forEach(file=>{
		let filePath = path.join(folder, file)
		let stat = fs.statSync(filePath)
		if (stat.isDirectory()){
			browserFiles(filePath, list)
		}else if (file !== '.DS_Store'){
			list.push(filePath)
		}
	})
	return list
}

function aesEncrypt(data, key) {
	const cipher = crypto.createCipher('aes192', key);
	var crypted = cipher.update(data, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

function aesDecrypt(encrypted, key) {
	const decipher = crypto.createDecipher('aes192', key);
	var decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

const config = rc('alioss', {
	accessKeyId: null,
	accessKeySecret: null,
	region: null,
	bucket: null,
	prefix: '/',
	srcPath: 'dist',
	exclude: "/.*$/",
	ossKey: null,
	enableLog:true
})
let uploader = new AliossUploader(config)
uploader.start()