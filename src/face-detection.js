require('./assets/styles/index.less');
const faceapi = require('./assets/face-api/face-api.js');
const errorMap = {
  'NotAllowedError': '摄像头已被禁用，请在当前浏览器设置中开启后重试',
  'AbortError': '硬件问题，导致无法访问摄像头',
  'NotFoundError': '未检测到可用摄像头',
  'NotReadableError': '操作系统上某个硬件、浏览器或者网页层面发生错误，导致无法访问摄像头',
  'OverConstrainedError': '未检测到可用摄像头',
  'SecurityError': '摄像头已被禁用，请在系统设置或者浏览器设置中开启后重试',
  'TypeError': '类型错误，未检测到可用摄像头'
};

class FaceDetection {
  constructor(options) {
    this.options = Object.assign({
      matchedScore: 0.9,
      mediaSize: {
        width: 540,
        height: 325
      }
    }, options);

    this.timer = null;
    this.mediaStreamTrack = null; // 摄像头媒体流

    this.videoEl = document.querySelector('#videoEl'); // 视频区域
    this.trackBoxEl = document.querySelector('#trackBox'); // 人脸框绘制区域
    this.canvasImgEl = document.querySelector('#canvasImg'); // 图片绘制区域
    this.operationEl = document.querySelector('.operation'); // 操作按钮
    this.retryBtnEl = document.querySelector('.js-retry');
    this.compareBtnEl = document.querySelector('.js-compare');

    this.init();
  }

  init() {
    this.resize();
    this.initDetection();
    this.bindEvents();
  }

  // 设置相关容器大小
  resize() {
    const tmp = [this.videoEl, this.canvasImgEl];
    for (let i = 0; i < tmp.length; i++) {
      tmp[i].width = this.options.mediaSize.width;
      tmp[i].height = this.options.mediaSize.height;
    }
    const wraperEl = document.querySelector('.wraper');
    wraperEl.style.width = `${this.options.mediaSize.width}px`;
    wraperEl.style.height = `${this.options.mediaSize.height}px`;
  }

  // 初始化人脸识别
  async initDetection() {
    // 加载模型
    faceapi.loadTinyFaceDetectorModel('./assets/face-api/models');

    const mediaOpt = {
      video: true
    };
    // 获取 WebRTC 媒体视频流
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // 最新标准API
      this.mediaStreamTrack = await navigator.mediaDevices.getUserMedia(mediaOpt)
        .catch(this.mediaErrorCallback);
    } else if (navigator.webkitGetUserMedia) {
      // webkit内核浏览器
      this.mediaStreamTrack = await navigator.webkitGetUserMedia(mediaOpt)
        .catch(this.mediaErrorCallback);
    } else if (navigator.mozGetUserMedia) {
      // Firefox浏览器
      this.mediaStreamTrack = await navigator.mozGetUserMedia(mediaOpt)
        .catch(this.mediaErrorCallback);
    } else if (navigator.getUserMedia) {
      // 旧版API
      this.mediaStreamTrack = await navigator.getUserMedia(mediaOpt)
        .catch(this.mediaErrorCallback);
    }
    this.initVideo();
  }

  // 人脸识别弹框的相关事件绑定
  bindEvents() {
    // "重新选择" 按钮
    this.retryBtnEl.onclick = () => {
      if (this.videoEl.paused || this.videoEl.ended) {
        this.hideEl(this.trackBoxEl).hideEl(this.operationEl);
        this.videoEl.play();
      }
    };
    // "开始验证" 按钮
    this.compareBtnEl.onclick = () => {
      // 获取当前视频流中的图像，并通过 canvas 绘制出来
      this.canvasImgEl.getContext('2d').drawImage(this.videoEl, 0, 0, this.canvasImgEl.width, this.canvasImgEl.height);
      // 将绘制的图像转化成 图片的 base64 编码
      let image = this.canvasImgEl.toDataURL('image/png');
      // 百度人脸识别API要求图片不需要包括头部信息，仅base64编码即可 
      image = image.replace('data:image/png;base64,', '');
    };
  }

  // 初始化视频流
  initVideo(stream) {
    this.videoEl.onplay = () => {
      this.onPlay();
    };
    this.videoEl.srcObject = this.mediaStreamTrack;
    setTimeout(() => this.onPlay(), 300);
  }

  // 获取媒体流错误处理
  mediaErrorCallback(error) {
    if (errorMap[error.name]) {
      alert(errorMap[error.name]);
    }
  }

  // 循环监听扫描视频流中的人脸特征
  async onPlay() {
    // 判断视频对象是否暂停结束
    if (this.videoEl && (this.videoEl.paused || this.videoEl.ended)) {
      this.timer = setTimeout(() => this.onPlay());
      return;
    }

    // 设置 TinyFaceDetector 模型参数：inputSize 输入视频流大小  scoreThreshold 人脸评分阈值
    const faceDetectionTask = await faceapi.detectSingleFace(this.videoEl, new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.6
    }));

    // 判断人脸扫描结果
    if (faceDetectionTask) {
      // 画布绘制人脸线框
      this.drawFaceBox(this.videoEl, this.trackBoxEl, [faceDetectionTask], faceDetectionTask.score)
      if (faceDetectionTask.score > this.options.matchedScore) {
        console.log(`检测到人脸，匹配度大于 ${this.options.matchedScore}`);
        this.showEl(this.operationEl);
        // 人脸符合要求，暂停视频流
        this.videoEl.pause();
        // TODO 调用后端接口进行身份验证
        return;
      }
    }
    this.timer = setTimeout(() => this.onPlay());
  }

  // 人脸框绘制
  drawFaceBox(dimensions, trackBox, detections, score) {
    this.showEl(trackBox);

    // 修改画布大小 
    trackBox.width = this.options.mediaSize.width;
    trackBox.height = this.options.mediaSize.height;

    const resizedDetections = detections.map(res => res.forSize(trackBox.width, trackBox.height));
   
    // 人脸框绘制参数： 人脸评分 > matchedScore，绘制绿色线框，否则，绘制红色线框。
    const faceBoxOpts = score > this.options.matchedScore ? {
      lineWidth: 2,
      textColor: 'green',
      boxColor: 'green',
      withScore: true
    } : {
      lineWidth: 2,
      textColor: 'red',
      boxColor: 'red',
      withScore: true
    };

    // 侦测到人脸后，绘制人脸线框
    faceapi.drawDetection(trackBox, resizedDetections, faceBoxOpts);
  }

  showEl(el) {
    el.style.visibility = 'visible';
    return this;
  }

  hideEl(el) {
    el.style.visibility = 'hidden';
    return this;
  }

}

module.exports = FaceDetection;