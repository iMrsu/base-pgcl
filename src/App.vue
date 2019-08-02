<template>
  <div id="app">
    <loading></loading>
    <x-header :left-options="{ showBack: $store.state.headerConf.hasbackbtn }"
              v-if="this.$store.state.headerConf.isShow">
      {{ this.$store.state.headerConf.title }}
    </x-header>
    <router-view></router-view>
  </div>
</template>

<script>
import { XHeader } from 'vux'
import Loading from './components/loading'
import Init from './views/native/init.js'
export default {
  name: 'App',
  components: {
    XHeader,
    Loading
  },
  data() {
    return {}
  },
  created() {
    this.getuserData()
    var _this = this
    Init.run(_this) //程序初始化需要执行的操作(相关物理按键的事件绑定)
  },
  mounted() {
    // 在DOM加载后，执行，获得window的高度，并减去header和tabbar的高度，
    // 96是自己在开发者模式看到的，header的height为 40，上下padding为 3，
    // tabbar的height为 50
    //this.setHeight()
  },
  // 监听,当路由发生变化的时候执行
  watch: {},
  methods: {
    getuserData() {
      this.axios.get('json/userdata.json').then(response => {
        this.$store.commit('login', response.data)
      })
    }
  }
}
</script>
<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
