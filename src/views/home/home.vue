<template>
  <div class="">
      <!--懒加载:on-refresh下拉刷新，infinite上拉加载-->
      <Scroll
        :on-refresh="onRefresh"
        :on-infinite="onInfinite"
        :class="mileageIsShow ? '' : 'yo-scroll-top'"
      >
      </Scroll>
    </div>
</template>
<script>
import Scroll from '../../components/scroll'
export default {
  components: {
    Scroll
  },
  data() {
    return {
      pageNow: 1, //当前页
      pageNumber: 20, //一页20条
      dataLists: [], //从数据库中获取到的结果值
    }
  },
  watch: {
  },
  created() {
    this.getTrips() //搜索所有趟次
    // this.getCurrentTrips() //获取最近的趟次
    this.$store.commit('setHeaderConf', {
      hasbackbtn: false,
      title: '首页',
      isShow: false
    })
    this.orderIsShow() //获取用户的权限
  },
  computed: {
   
  },
  props: {
  },
  methods: {
    //下拉刷新
    onRefresh(done) {
      console.log('下拉刷新')
      this.pageNow = 1 //当前页等于1
      done() // call done
    },
    //上滑加载
    onInfinite(done) {
      console.log('上拉加载')
      let vm = this
      vm.pageNow++ //当前页+1
      this.$el.querySelector('.load-more').style.display = 'none'
      done() // call done
    },
    orderIsShow() {
      //获取用户的权限
      let _this = this
      let menuList = this.$store.state.loginInfo.userData.menuApp
      
    }
  }
}
</script>
<style>
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
.selects-home .weui-cell p {
  margin-top: -2em !important;
}
</style>
