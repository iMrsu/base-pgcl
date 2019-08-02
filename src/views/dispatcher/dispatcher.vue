<template>
  <div>
    <sticky :check-sticky-support="false">
      <div class="btnTab">
        <!-- 前一天 后一天 -->
        <button-tab>
          <button-tab-item @click.native="getYesterday()">
            {{ yesterday }}
          </button-tab-item>
          <button-tab-item
            @click.native="showPopup = true"
            type="primary"
            selected
            plain
          >
            {{ dateTimeFormat }}
          </button-tab-item>
          <button-tab-item @click.native="getTemorrow()">
            {{ temorrow }}
          </button-tab-item>
        </button-tab>
      </div>
    </sticky>
    <!-- 时间组件 -->
    <div v-transfer-dom>
      <popup v-model="showPopup">
        <datetime-view v-model="dateTime" @on-change="rePost()"></datetime-view>
      </popup>
    </div>

    <div>
      <Scroll :on-refresh="onRefresh" :on-infinite="onInfinite">
        <group
          label-margin-right="2em"
          label-align="center"
          v-for="(item, index) in dataList"
          :key="index"
          style="text-align:center"
        >
          <cell
            is-link
            style="magin:0px;color:rgba(56,65,80,1);text-align:left"
            :border-intent="false"
            :title="item.tripStartTime"
            :arrow-direction="showlist[index] ? 'down' : 'right'"
            @click.native="trClick(index)"
            id="timeStyle"
          >
            <!-- @click.native="showContent003 = !showContent003" -->
            <label
              class="linesName"
              style="text-align:left;color:rgba(110,116,126,1);overflow:hidden;width:13em;height:100%;"
            >
              <!-- <label style="text-align:left;color:rgba(110,116,126,1);overflow:hidden;width:13em;height:100%;"> -->
              <img src="../../assets/image/start.png" class="startClass" />
              {{ item.line.lineName.split('-')[0] }}<br />
              <!-- <img src="../../assets/image/tou.png"
                   class="tou" /> -->
              <img src="../../assets/image/finishs.png" class="finishClass" />
              {{ item.line.lineName.split('-')[1] }}
            </label>
            <!-- 发班状态 -->
            <label
              class="imgLine"
              v-if="item.schedule.status == 'shift_status_off'"
            >
              <img src="../../assets/image/noClass.png" />
              <!--未发班-->
            </label>
            <label
              class="imgLine"
              v-if="item.schedule.status == 'shift_status_on'"
              ><img src="../../assets/image/class.png" />
              <!--已发班-->
            </label>
            <label
              class="imgLine"
              v-if="item.schedule.status == 'shift_status_done'"
              ><img src="../../assets/image/finish.png" />
              <!--已完成-->
            </label>
            <label
              class="imgLine"
              v-if="item.schedule.status == 'shift_status_scrap'"
              ><img src="../../assets/image/obsolete.png" />
              <!--已作废-->
            </label>
          </cell>
          <template v-if="showlist[index]">
            <cell-box
              :border-intent="false"
              class="sub-item"
              :class="showlist[index] ? 'isShow' : ''"
            >
              <cell
                :class="showlist[index] ? 'animate' : ''"
                primary="content"
                :title="t1"
                :value="Stations[index]"
              >
              </cell>
              <label
                style="float:left;margin-right: 2em;padding:0 15px !important"
              >
                注意事项：
                <span style="font-size:16px;color:#C0C0C0">
                  {{ item.schedule.remark }}
                </span>
              </label>
              <x-button
                v-if="item.status == 'shift_status_on'"
                type="primary"
                action-type="button"
                @click.native="changeStatus(item)"
                >完成任务</x-button
              >
            </cell-box>
          </template>
        </group>
      </Scroll>
    </div>
  </div>
</template>

<script>
import Scroll from '../../components/scroll'
import {
  ButtonTab,
  ButtonTabItem,
  Group,
  Cell,
  CellBox,
  Popup,
  TransferDom,
  DatetimeView,
  dateFormat,
  Sticky,
  XButton
} from 'vux'
//import axios from 'axios'
export default {
  components: {
    ButtonTab,
    ButtonTabItem,
    Group,
    Cell,
    CellBox,
    Popup,
    DatetimeView,
    Sticky,
    Scroll,
    XButton
  },
  directives: {
    TransferDom
  },
  data() {
    return {
      pageNow: 1, //当前页
      pageNumber: 20, //一页20条
      t1: '途经站点:',
      t2: '注意事项:',
      Stations: [],
      dataList: [],
      showlist: [],
      throughStationdataList: [],
      yesterday: '前一天',
      temorrow: '后一天',
      showContent003: false,
      showPopup: false, //展示时间控件
      dateTime: '', //页面展示
      staInofr: {
        title: '',
        station: ''
      }
    }
  },
  created() {
    this.dateTime = dateFormat(new Date(), 'YYYY-MM-DD')
    this.getData()
  },
  mounted() {},
  computed: {
    // 计算属性的 getter
    dateTimeFormat: function() {
      // `this` 指向 vm 实例
      // eslint-disable-next-line no-useless-escape
      var date = new Date(this.dateTime.replace(/\-/g, '/'))
      return dateFormat(date, 'YYYY-MM-DD EEE')
    }
  },
  methods: {
    //下拉刷新
    onRefresh(done) {
      console.log('下拉刷新')
      this.$el.querySelector('.load-more').style.display = ''
      this.pageNow = 1 //当前页等于1
      // this.getData()
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
    },
    /**
     * 获取调度信息
     */
    getData() {
      let data = {
        driverName: localStorage.getItem('re_username'),
        date: this.dateTime
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      // let params = JSON.stringify(data)
      this.axios
        .post(this.$store.state.apiUrl + 'DriverTrips', params)
        .then(response => {
          if ('failed' === response.data.data) {
            this.dataList = this.dataList
          } else {
            let StrData = this.CryptoUtils.decrypt(response.data.data)
            let obj = JSON.parse(StrData) //将json字符串转换成json对象
            this.dataList = obj
            console.log(this.dataList)
            // 下拉显示与隐藏
            this.showlist = [] //清空控制下拉显示与隐藏的数组
            for (var i = 0; i < obj.length; i++) {
              this.showlist.push(false)
              let stations = ''
              for (let j = 0; j < obj[i].station.length; j++) {
                stations += obj[i].station[j].name
                if (j < obj[i].station.length - 1) {
                  stations += '-'
                }
              }
              this.Stations.push(stations)
            }
          }
        })
    },
    changeStatus(item) {
      let data = {
        scheduleId: item.schedule.scheduleId
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      this.axios
        .post(this.$store.state.apiUrl + 'updateSchedule', params)
        .then(response => {
          if ('false' === response.data) {
            this.$vux.toast.show({
              text: '操作失败',
              type: 'success',
              position: 'middle',
              onHide() {}
            })
          } else {
            this.$vux.toast.show({
              text: '操作成功',
              type: 'success',
              position: 'middle',
              onHide() {}
            })
            this.getData()
          }
        })
    },

    /**
     * cell行点击事件函数
     * @argument index 数据行的索引(从0开始)
     */
    trClick(index) {
      this.showlist.splice(index, 1, !this.showlist[index])
    },
    /**
     * 前一天
     */
    getYesterday() {
      // eslint-disable-next-line no-useless-escape
      var date = new Date(this.dateTime.replace(/\-/g, '/'))
      var preDate = new Date(date.getTime() - 24 * 60 * 60 * 1000)
      this.dateTime = dateFormat(preDate, 'YYYY-MM-DD')
      this.getData()
    },
    /**
     * 后一天
     */
    getTemorrow() {
      // eslint-disable-next-line no-useless-escape
      var date = new Date(this.dateTime.replace(/\-/g, '/'))
      var preDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      this.dateTime = dateFormat(preDate, 'YYYY-MM-DD')

      this.getData()
    },
    /**
     * 把站点用逗号连接
     */
    stitchStations(st) {
      st.forEach(function(s) {
        sStations.push(s.name)
        sStations.push(',')
      })
    },
    /**
     * 通过时间控件修改时间时触发事件
     */
    rePost() {
      this.getData()
    }
  },
  //监听，当路由发生变化的时候执行
  watch: {
    $route(to) {
      if (to.path === '/index/dispatcher') {
        this.getData()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.router-view {
  background: rgba(250, 250, 250, 1);
  opacity: 1;
}
.btnTab {
  width: 95%;
  height: 2.8em;
  background: rgba(255, 255, 255, 1);
  opacity: 1;
}
.index-view {
  width: 100%;
}
.animate {
  max-height: 9999px;
  transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
  transition-delay: 0s;
  background: rgba(250, 250, 250, 1);
}
.isShow {
  display: block;
  background: rgba(250, 250, 250, 1);
}
.vux-label {
  color: rgba(56, 65, 80, 1) !important;
}
.btnTab {
  width: 100% !important;
}
.vux-button-group > a.vux-button-group-current {
  font-family: Source Han Sans CN;
  font-weight: 400;
  color: rgba(75, 159, 223, 1) !important;
  background: none !important;
  opacity: 1;
  text-decoration: none;
}
.vux-button-group > a {
  text-decoration: none;
}
.vux-button-group > a.vux-button-tab-item-first {
  color: rgba(56, 65, 80, 1);
}
.vux-button-group > a.vux-button-tab-item-last {
  color: rgba(56, 65, 80, 1);
}
.vux-button-group > a.vux-button-tab-item-last:after {
  border: none !important;
}
.vux-button-group > a.vux-button-tab-item-first:after {
  border: none !important;
}
.vux-button-group > a.vux-button-tab-item-middle:after {
  border: 2px solid rgba(75, 159, 223, 1) !important;
  opacity: 1;
  border-radius: 38px;
}
.yo-scroll {
  top: 46px !important; //55  0401
  bottom: 10px !important; //--  0401
}
img {
  width: 2em;
  padding-top: 0.4em;
  height: 1em;
}
.weui-cell_access .weui-cell__ft {
  margin-top: 0 !important;
}
.linesName {
  box-sizing: border-box;
  position: absolute;
  left: -14em;
  text-overflow: ellipsis;
  display: block;
  white-space: nowrap;
  height: 4em !important;
  margin-top: -0.8rem;
  font-size: 17px; //覆盖cell样式 #timeStyle
  font-weight: 400; //覆盖cell样式 #timeStyle
  margin-left: 25px;
}
.imgLine {
  width: 2em;
  height: 1em;
}
.startClass {
  width: 0.8em !important;
  padding-right: 0.4em;
}
.finishClass {
  width: 0.8em !important;
  padding-right: 0.4em;
}
.vux-cell-primary {
  text-align: center;
  width: 10%;
}
.weui-cell {
  padding: 0 15px !important;
  // height: 4em; //4
}
.tou {
  padding-bottom: 0.4em;
}
.weui-cell_access .weui-cell__ft {
  width: 70%;
}
#timeStyle {
  font-weight: bold;
  font-size: 23px;
}
</style>
