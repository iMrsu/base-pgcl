<template>
  <div>
    <Scroll :on-refresh="onRefresh" id="scroll">
      <group v-for="(item, index) in dataList" v-bind:key="index">
        <check-icon :value.sync="select[index]" v-if="showCheck"></check-icon>
        <div :class="item.icons">
          <i :class="' iconfont icon-' + item.icons"></i>
        </div>
        <cell
          :title="item.menuName"
          :link="{
            name: item.target,
            params: {
              name: item.menuName
            }
          }"
          @click.native="updateReadState(item.menuName)"
        >
          <div class="news">{{ item.newsTitle }}</div>
          <div class="badge-value">
            <badge :text="item.count" v-if="item.count > 0"></badge>
          </div>
          <div class="newsTime">{{ item.newsTime }}</div>
        </cell>
      </group>
    </Scroll>
    <x-button
      type="primary"
      action-type="button"
      @click.native="showCheckboxs()"
      >{{ editOrCancel }}</x-button
    >
    <tabbar v-if="showCheck">
      <tabbar-item @click.native="alreadyRead()">
        <i
          slot="icon"
          :class="'iconfont icon-shanchu'"
          style="color:#50A2E0"
        ></i>
        <span slot="label">全部已读</span>
      </tabbar-item>
    </tabbar>
  </div>
</template>
<script>
import { XButton, Badge, Group, Cell, CheckIcon, Tabbar, TabbarItem } from 'vux'
import Scroll from '../../components/scroll'
//import axios from 'axios'
export default {
  components: {
    XButton,
    Badge,
    Group,
    Cell,
    CheckIcon,
    Tabbar,
    TabbarItem,
    Scroll
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
    // this.getData()
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
    getData() {
      let data = {
        account: localStorage.getItem('re_username')
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      this.axios
        .post(this.$store.state.apiUrl + 'unReadNews', params)
        .then(response => {
          let obj = []
          if ('failed' !== response.data.data) {
            //如果该用户有消息
            let StrData = this.CryptoUtils.decrypt(response.data.data)
            obj = JSON.parse(StrData) //将json字符串转换成json对象
          }

          let menuList = this.$store.state.loginInfo.userData.menuApp
          let menuitem = []
          menuList.forEach(function(menu) {
            if (menu.menuName === '消息') {
              menuitem = menu.menuApp
            }
          })
          let datas = []
          let _this = this
          menuitem.forEach(function(item) {
            //删除给菜单增加的属性
            delete item.count
            delete item.newsTitle
            delete item.newsTime
            obj.forEach(function(item2) {
              if (item.menuName === item2.newsType) {
                _this.$set(item, 'newsTitle', item2.newsTitle)
                _this.$set(item, 'count', item2.count)
                _this.$set(item, 'newsTime', item2.newsTime)
              }
            })
            datas.push(item)
          })
          this.dataList = datas
        })
    },
    //更新某类消息的阅读状态
    updateReadState(type) {
      let data = {
        account: localStorage.getItem('re_username'),
        type: type
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      this.axios
        .post(this.$store.state.apiUrl + 'changeReadState', params)
        .then(response => {
          if ('false' === response.data) {
            this.$vux.toast.show({
              text: '操作失败',
              type: 'success',
              position: 'middle',
              onHide() {}
            })
          }
        })
    },
    //点击“编辑”后的方法
    showCheckboxs() {
      //修改cell样式，空出地方显示checkicon

      //是否显示checkicon
      this.showCheck = !this.showCheck
      this.editOrCancel = this.editOrCancel === '编辑' ? '取消' : '编辑'
      //所有checkicon不选中
      this.select = []
      let _this = this
      this.dataList.forEach(function() {
        _this.select.push(false)
      })
    },
    //标为已读
    alreadyRead() {
      let _this = this
      this.$vux.confirm.show({
        content: '确认标为已读吗?',
        onConfirm() {
          _this.select.forEach(function(item, index) {
            if (item === true) {
              let type = _this.dataList[index].menuName
              _this.updateReadState(type)
            }
          })
          _this.getData()
          _this.showCheck = false
          _this.editOrCancel = '编辑'
        }
      })
    },
    warningList() {
      this.$router.push('/warningList')
    },
    warningMes1() {
      this.$router.push('/warningMes')
    },
    warningMes2() {
      this.$router.push('/warningMes')
    },
    //下拉刷新
    onRefresh(done) {
      console.log('下拉刷新')
      this.$el.querySelector('.load-more').style.display = ''
      this.getData()
      done() // call done
    }
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
body {
  background: white !important;
}
.router-view > div {
  border-bottom: 1px solid rgba(227, 235, 239, 1);
}
.router-view {
  height: calc(100vh - 3.7em - 3em) !important;
}
.vux-no-group-title {
  height: 4em !important;
}
.badge-value {
  display: inline-block !important;
  position: absolute;
  top: 1em; //0.8
  right: 1em;
}
.vertical-middle {
  vertical-align: middle;
}
//消息列表标题样式
.vux-cell-bd .vux-cell-primary {
  height: 16vw;
  width: 11vw;
  label {
    margin-left: 15%;
  }
}
.vux-cell-primary p {
  padding: 0;
  margin: 0 auto;
  width: 70vw;
}
.weui-cell__ft {
  width: 50 bodyWidth;
  height: 25%;
  top: -3%;
  .news {
    top: 5vw; //5
    margin-left: 2.4em;
  }
}
// .newsTime {
//   position: absolute;
//   right: 1em;
//   top: -0.7vw;
//   width: 6em;
// }
// 预警样式
.warning {
  color: white;
  position: absolute;
  width: 2.8em;
  height: 2.8em;
  margin-left: 1.5em; //2
  //margin-top: 0.5em;
  border-radius: 40px;
  text-align: center;
  background: #f19029;
  top: 1.6em;
}
// 调度样式
.dispatch {
  color: white;
  position: absolute;
  width: 2.8em;
  height: 2.8em;
  margin-left: 1.5em;
  background: #10bd51;
  border-radius: 40px;
  text-align: center;
  top: 1.6em;
}
// 通知样式
.tongzhi {
  color: white;
  position: absolute;
  width: 2.8em;
  height: 2.8em;
  margin-left: 1.5em;
  border-radius: 40px;
  text-align: center;
  background: #f15a4a;
  top: 1.6em;
}
// 路况样式
.lukuang {
  color: white;
  position: absolute;
  width: 2.8em;
  height: 2.8em;
  margin-left: 1.5em;
  border-radius: 40px;
  text-align: center;
  background: #1f94fb;
  top: 1.6em;
}
// 天气样式
.tianqi {
  color: white;
  position: absolute;
  width: 2.8em;
  height: 2.8em;
  margin-left: 1.5em;
  border-radius: 40px;
  text-align: center;
  background: #febb26;
  top: 1.6em;
}
.weui-cell_access {
  float: right;
  position: relative;
  width: 72% !important;
  right: 1em;
  height: 5em;
}
.weui-cell_access .weui-cell__ft:after {
  display: none !important;
}
.iconfont {
  font-size: 33px;
}
.weui-cells:after {
  border-bottom: 1px solid rgba(227, 235, 239, 1) !important;
}
// .newsComp {
//   position: absolute;
//   left: -15em !important ; //-1980%
//   top: 1em;
//   // margin-left: -15em !important;
// }
.news {
  position: absolute;
  left: -15.2em !important; //-15  -2204% -16.7
  top: 1em;
  // margin-left: -15em !important;
}
// .vux-cell-bd vux-cell-primary .vux-label {
//   margin-top: -1em;
// }

.newsTime {
  position: absolute;
  right: 1em;
  top: -0.7em;
  width: 6em;
}
.vux-cell-primary {
  line-height: 0em !important;
}

.weui-cells {
  border-bottom: 1px solid rgba(227, 235, 239, 1) !important;
  background: rgba(250, 250, 250, 1) !important;
  height: 4em !important;
}
.weui-cell {
  border-bottom: none !important ;
  padding: 0 !important;
}
.weui-cell_access .weui-cell__ft:after {
  display: none !important;
}
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
//checkicon样式
.vux-check-icon {
  display: inline-flex;
  float: left;
  margin-top: 2.6em;
}
.weui-btn[data-v-8a3fc7a4] {
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
