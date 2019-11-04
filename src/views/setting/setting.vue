<template>
  <div class="about">
    <Scroll :on-refresh="onRefresh"
            :on-infinite="onInfinite">
    </Scroll>
  </div>
</template>
<script>
import { Group } from 'vux'
import Scroll from '../../components/scroll'
export default {
  components: {
    Group,
    Scroll
  },
  data() {
    return {
      pageNow: 1, //当前页
      pageNumber: 20, //一页20条
      userInfo: this.$store.state.loginInfo.userData,
    }
  },
  created() {
    // this.getUserInfo()
    this.$store.commit('setHeaderConf', {
      hasbackbtn: false,
      title: '设置',
      isShow: true
    })
   
  },
  methods: {
    //下拉刷新
    onRefresh(done) {
      console.log('下拉刷新')
      this.$el.querySelector('.load-more').style.display = ''
      this.pageNow = 1 //当前页等于1
      this.getUserInfo()
      done() // call done
    },
    //上滑加载
    onInfinite(done) {
      console.log('上拉加载')
      let vm = this
      vm.pageNow++ //当前页+1
      // console.log(vm.pageNow)
      this.$el.querySelector('.load-more').style.display = 'none'
      done() // call done
    }
  }
}
</script>
<style scoped></style>
