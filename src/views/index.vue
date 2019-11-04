<template>
  <div>
    <transition :name="transitionName">
      <keep-alive>
        <router-view class="router-view"> </router-view>
      </keep-alive>
    </transition>
    <tabbar style="position: fixed;">
      <template v-for="(item, index) in tabs.items">
        <tabbar-item
          @on-item-click="tabClick"
          v-bind:selected="index === tabs.fromSelectIndex"
          v-bind:key="index"
        >
          <i slot="icon" :class="'iconfont icon-' + item.icons"></i>
          <span slot="label">{{ item.menuName }}</span>
        </tabbar-item>
      </template>
    </tabbar>
  </div>
</template>

<script>
import { Tabbar, TabbarItem } from 'vux'
export default {
  components: {
    Tabbar,
    TabbarItem
  },
  data() {
    return {
      timelinecolor: '#007CC4',
      tabs: {
        fromSelectIndex: 0,
        items: this.$store.state.loginInfo.userData.menuApp
      },
      transitionName: 'vux-pop-in'
    }
  },
  mounted() {},
  created() {
    let _this = this
    _this.tabs.fromSelectIndex = _this.$store.state.SelectIndex
  },
  watch: {},
  methods: {
    tabClick(index) {
      //点击当前页
      this.$store.commit('setSelectIndex', index)
      if (this.tabs.fromSelectIndex === index) {
        return
      }
      //移入还是移出
      this.transitionName =
        this.tabs.fromSelectIndex < index ? 'vux-pop-in' : 'vux-pop-out'
      this.tabs.fromSelectIndex = index
      this.$router.push(this.tabs.items[index].target)
      //首页不显示标题栏
      if (this.tabs.items[index].target !== 'home') {
        this.$store.commit('setHeaderConf', {
          hasbackbtn: false,
          title: this.tabs.items[index].menuName,
          isShow: true
        })
      } else {
        this.$store.commit('setHeaderConf', {
          hasbackbtn: false,
          title: '',
          isShow: false
        })
      }
    }
  }
}
</script>

<style lang="less">
body {
  background: rgba(250, 250, 250, 1) !important;
}
.icon {
  width: 1.7rem; /* 通过设置 font-size 来改变图标大小 */
  height: 1.7rem;
  font-size: 1.7rem;
  vertical-align: -0.5rem; /* 图标和文字相邻时，垂直对齐 */
  fill: currentColor; /* path 和 stroke 溢出 viewBox 部分在 IE 下会显示 normalize.css 中也包含这行 */
  overflow: hidden;
}
.vux-pop-out-enter,
.vux-pop-in-leave-active {
  -webkit-transform: translate(-100vw, 0);
  transform: translate(-100vw, 0);
}
.vux-pop-out-leave-active,
.vux-pop-in-enter {
  -webkit-transform: translate(100vw, 0);
  transform: translate(100vw, 0);
}
.router-view {
  width: 100%;
  position: fixed;
  width: 100%;
  height: calc(100vh - 2.9em - 3em);
  transition: all 0.3s ease-in-out;
}
.vux-header {
  height: 50px;
  width: 100%;
  background: rgba(255, 255, 255, 1) !important;
  opacity: 1;
}
.vux-header .vux-header-title {
  font-size: 22px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  line-height: 40px;
  color: rgba(56, 65, 80, 1) !important;
  opacity: 1;
}
.weui-tabbar {
  background: rgba(255, 255, 255, 1) !important;
}
.weui-tabbar a {
  text-decoration: none;
}
.weui-tabbar__item.weui-bar__item_on .weui-tabbar__icon,
.weui-tabbar__item.weui-bar__item_on .weui-tabbar__icon > i,
.weui-tabbar__item.weui-bar__item_on .weui-tabbar__label {
  color: rgba(75, 159, 223, 1) !important;
}
 
.weui-tabbar__label {
  margin: 0 !important;
  font-size: 12px !important;
}
 
</style>
