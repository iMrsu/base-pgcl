import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const port = 8080
// const host = '192.168.2.186' //测试

const host = 'localhost' //攀钢

const apiUrl = `http://${host}:${port}/app/`
export default new Vuex.Store({
  state: {
    // 公共变量
    loading: false,
    readPhotoUrl: apiUrl + 'showPicture?image=',
    SelectIndex: 0, //选择的第几个选项卡
    apiUrl,
    loginInfo: {
      userData: null,
      token: null
    },
    //页头配置
    headerConf: {
      hasbackbtn: false, //显示返回按钮
      title: null,
      isShow: false //显示header
    }
  },
  mutations: {
    /*
     * 选项卡重新赋值
     */
    setSelectIndex: (state, num) => {
      state.SelectIndex = num
    },
    /*
     * loading的显示/隐藏
     */
    setLoading: (state, status) => {
      state.loading = status
    },
    /*
     * 修改header的信息
     */
    setHeaderConf: (state, headerConf) => {
      Object.assign(state.headerConf, headerConf)
    },
    /*
     * 登陆
     */
    login: (state, userData) => {
      localStorage.setItem('userId', userData.uuid) //登陆用户ID
      localStorage.setItem('userMsg', JSON.stringify(userData)) //登陆用户其他信息
      state.loginInfo.token = userData.token
      state.loginInfo.userData = userData
      state.SelectIndex = 0
    },
    /*
     * 注销
     */
    logout: state => {
      localStorage.removeItem('userId')
      localStorage.removeItem('userMsg')
      state.loginInfo.token = null
      state.loginInfo.userData = null
    }
  },
  actions: {}
})
