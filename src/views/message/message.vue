<template>
  <div>
    <Scroll :on-refresh="onRefresh" id="scroll">
    </Scroll>
    <x-button
      type="primary"
      action-type="button"
      @click.native="showCheckboxs()"
      >{{ editOrCancel }}</x-button
    >
  </div>
</template>
<script>
import { XButton, Group,} from 'vux'
import Scroll from '../../components/scroll'
//import axios from 'axios'
export default {
  components: {
    XButton,
    Group
  },
  data() {
    return {
      dataList: [],
      editOrCancel: '编辑',
      showCheck: false,
      select: [],
      isComp: false, //是手机还是电脑(默认是电脑)
      bodyWidth: 0
    }
  },
  created() {
    this.isComp = process.env.NODE_ENV === 'production' ? false : true //(false:电脑,true:手机)development
    this.$store.commit('setHeaderConf', {
      hasbackbtn: false,
      title: '消息',
      isShow: true
    })
    this.bodyWidth = document.documentElement.clientWidth / 100
  },
  mounted() {
  },
  // 监听，当路由发生变化的时候执行
  watch: {
    $route(to) {
      if (to.path === '/index/message') {
        // this.getData()
      }
    }
  },
  methods: {
    //下拉刷新
    onRefresh(done) {
      console.log('下拉刷新')
      this.$el.querySelector('.load-more').style.display = ''
      this.getData()
      done() // call done
    }, //点击“编辑”后的方法
    showCheckboxs() {

      //是否显示checkicon
      this.showCheck = !this.showCheck
      this.editOrCancel = this.editOrCancel === '编辑' ? '取消' : '编辑'
 
    },
  }
}
</script>
<style>
#scroll {
  top: 0 !important;
  height: 100%;
}
</style>

<style lang="less" scoped>
.weui-btn_primary {
  background: none !important;
  color: rgba(75, 159, 223, 1);
  width: auto !important;
  position: absolute;
  top: -3em;
  right: 3em;
  font-size: 16px;
}
.weui-btn:after {
  border: none !important;
}
.weui-btn {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
 
//编辑样式
.weui-btn_primary {
  right: 0.5em;
}
.vux-cell-primary p {
  margin-top: 0 !important;
}
</style>
