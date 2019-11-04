import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
// import home from '@/views/home/home'
//路由组件懒加载并分块打包(Webpack > 2.4提供的一种特定的注释语法)
//将所有页面组件一次性加载是一个很浪费资源和考验用户耐心的做法，尤其在移动端。
//webpack 提供了code splitting，实现当切换到特定路由时才加载代码。
// this generates a separate chunk (about.[hash].js) for this route
/* webpackChunkName: "home" */
// eslint-disable-next-line no-unused-vars
const Home = () => import('./views/home/home')
const Index = () => import('./views/index.vue')
/*"Message" */
const Message = () => import('./views/message/message')
/* "Setting" */
const Setting = () => import('./views/setting/setting')
Vue.use(Router)
const router = new Router({
  // export default new Router({
  mode: process.env.NODE_ENV === 'production' ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: Index,
      children: [
        //子路由
        {
          path: '/',
          name: 'home',
          component: Index
        },
        {
          path: 'message',
          name: 'message',
          component: Message
        },
        {
          path: 'setting',
          name: 'setting',
          component: Setting
        }
      ]
    }
  ]
})
//全局路由导航前置守卫
// router.beforeEach(function(to, from, next) {
//   //显示加载提示框
//   const nextRoute = ['home', 'dispatcher', 'message', 'setting']
//   store.commit('setLoading', true)
//   //没有登录去请求菜单要强制进入欢迎页
//   if (nextRoute.indexOf(to.name) >= 0) {
//     store.state.loginInfo.userData ? next() : next('/'),
//       store.commit('setLoading', false)
//   } else {
//     next()
//   }
// })
//全局路由导航后置守卫
// eslint-disable-next-line no-unused-vars
router.afterEach(function(to) {
  //隐藏加载提示框
  store.commit('setLoading', false)
})
export default router
