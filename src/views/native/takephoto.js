//
// ==========================================
// 拍照/相册选择文件 上传相关工具方法
// ==========================================
//

/**
 * 执行图片上传
 */
const excuteUpload = function(config, picPath) {
  //添加token参数
  config.params['_token'] = config.context.$store.state.loginInfo.token
  var upload = plus.uploader.createUpload(
    config.uploadUrl,
    {
      method: 'POST'
    },
    (response, status) => {
      //上传完成后的回调函数(成功和失败都会执行)
      config.successCb.call(config.context, response, status)
    }
  )
  for (let fieldName in config.params) {
    upload.addData(fieldName, config.params[fieldName])
  }
  // eslint-disable-next-line no-unused-vars
  var addResult = upload.addFile(picPath, {
    key: config.fileKey
  })
  upload.start() //开始执行上传
}

const uploadPic = function(config, picPath) {
  //文件全名
  var fileFullName = picPath.substring(
    picPath.lastIndexOf('/') + 1,
    picPath.length
  )
  //文件类型(扩展名 带.)
  var ext = fileFullName.substring(
    fileFullName.lastIndexOf('.'),
    fileFullName.length
  )
  var fileName = fileFullName.substring(0, fileFullName.lastIndexOf('.'))
  // 图片压缩
  plus.zip.compressImage(
    {
      src: picPath, //源图片的路径
      dst: `_doc/camera/${fileName}_compressed${ext}`, //目标文件的路径
      overwrite: true, //目标路径如果存在同名文件是否覆盖
      quality: 40, //压缩之后的图片质量(默认50)
      height: '720px' //压缩之后的图片高度(若未设置宽度则按照比例缩放)
    },
    event => {
      //操作成功的回调函数
      excuteUpload(config, event.target) //压缩后保存的文件路径
    },
    err => {
      //如果不幸压缩失败,则还是上传原文件
      console.error(err.message)
      excuteUpload(config, picPath)
    }
  )
}
//默认的配置
const defaultConfig = {
  uploadUrl: '',
  params: {},
  successCb: function() {},
  errorCb: function(err, operation = '操作') {
    this.$vux.toast.text(`${operation}已取消`, 'top')
  },
  context: null,
  fileKey: 'uploadFile'
}
const copyConfig = function(config) {
  var currentConfig = {}
  for (let configName in defaultConfig) {
    currentConfig[configName] = config[configName] || defaultConfig[configName]
  }
  return currentConfig
}
const NativePicHandle = {
  /**
   * 从系统相册选择照片上传
   * @param {object} config 上传的配置信息
   * 包含
   * uploadUrl-上传图片的URL地址(必选)
   * params-上传时需要携带的其他参数(可选)
   * successCb-上传成功之后执行的回调函数(可选)
   * errorCb-调用系统相册失败之后执行的回调函数(可选)
   * context-上下文对象(必选)
   * fileKey-上传文件的键名(与后台对应)
   */
  selectPic(config) {
    if (!('plus' in window)) {
      console.warn('请使用真机或模拟器进行调试!')
      return
    }
    const currentConfig = copyConfig(config)
    //从系统相册选择文件(照片或视频)
    //参数分别是 成功回调(必选),失败回调,配置参数
    plus.gallery.pick(
      filePath => {
        //filePath 选择的图片或视频文件路径
        uploadPic(currentConfig, filePath)
      },
      err => {
        currentConfig.errorCb.call(currentConfig.context, err, '图片选择')
      },
      {
        filter: 'image' /*仅选择图片文件*/
      }
    )
  },
  /**
   * 拍照后执行上传
   * @param {object} config 上传的配置信息(内容同selectPic)
   */
  takePhoto(config) {
    if (!('plus' in window)) {
      console.warn('请使用真机或模拟器进行调试!')
      return
    }
    const currentConfig = copyConfig(config)

    //获取需要操作的摄像头对象, 1表示主摄像头, 2表示辅摄像头
    const cmr = plus.camera.getCamera(1)
    //执行拍照操作, 参数分别是 成功回调(必选),失败回调,拍照参数(必选)
    cmr.captureImage(
      capturedFile => {
        //capturedFile - 保存的文件路径
        // 上传文件
        uploadPic(currentConfig, capturedFile)
      },
      err => {
        currentConfig.errorCb.call(currentConfig.context, err, '拍照')
      },
      {
        filename: '_doc/camera/',
        index: 1
      }
    )
  }
}
module.exports = NativePicHandle
