<template>
  <div class="timelineDemo select-search selects-home">
    <div class="search-module select-body">
      <div class="search-position">
        <label>{{ compCity }}</label>
        <span><img src="../../assets/image/position.png"/></span>
      </div>
      <span class="search-icon">
        <img src="../../assets/image/select.png" />
      </span>
      <input
        type="text"
        class="search-text"
        placeholder="搜一搜线路"
        v-model="searchVal"
        autocomplete="off"
        @blur="resetDefaultStatus"
        @keydown.esc="resetDefaultStatus"
      />
      <transition name="el-fade-in-linear" mode="out-in" v-if="isExpand">
        <div class="typeahead-filter" v-show="typeaheadData">
          <transition-group tag="ul" name="el-fade-in-linear">
            <li
              v-for="(item, index) in typeaheadData"
              :key="item.tripId"
              :class="item.active ? 'active' : ''"
              @mouseenter="setActiveClass(index)"
              @mouseleave="setActiveClass(index)"
              @click="selectChild(index, item)"
            >
              <a href="javascript:;">
                {{ item.line.lineName }}---{{ item.tripStartTime }}
              </a>
            </li>
          </transition-group>
          <p
            class="noFound"
            v-show="typeaheadData && typeaheadData.length === 0"
          >
            检索不到线路信息
          </p>
        </div>
      </transition>
    </div>
    <div>
      <flexbox>
        <flexbox-item>
          <div class="flex-demo" v-if="oilIsShow">
            <img
              slot="icon"
              src="../../assets/image/jyl.png"
              class="orderPic"
            />
            <span class="orderWord">
              节油量(第 <span class="orderNum">{{ oilData.oilOrder }}</span> 名)
            </span>
            <br />
            <span class="countWord">{{ oilData.sumOil }}L</span>
          </div>
        </flexbox-item>
        <flexbox-item>
          <div class="flex-demo" v-if="mileageIsShow">
            <img slot="icon" src="../../assets/image/lc.png" class="orderPic" />
            <span class="orderWord">
              里程(第 <span class="orderNum">{{ kiloData.order }}</span> 名)
            </span>
            <br />
            <span class="countWord">{{ kiloData.kiloCount }}km</span>
          </div>
        </flexbox-item>
      </flexbox>
    </div>
    <div class="1">
      <div :class="mileageIsShow ? 'searchBottom' : 'searchBottomTop'">
        <span>附近站点</span>
      </div>
      <!--懒加载:on-refresh下拉刷新，infinite上拉加载-->
      <Scroll
        :on-refresh="onRefresh"
        :on-infinite="onInfinite"
        :class="mileageIsShow ? '' : 'yo-scroll-top'"
      >
        <group v-for="(item, index) in dataList" :key="index">
          <cell
            :title="item.stationName"
            @click.native="lineDetail(item)"
            :value="item.distance"
          >
            <label class="distance">{{ item.distance }}</label>
            <label class="lineNames">
              <img
                src="../../assets/image/start.png"
                class="startClass"
                v-if="isHavaData"
              />
              {{ item.lineName ? item.lineName.split('-')[0] : '' }} <br />
              <img
                src="../../assets/image/finishs.png"
                class="finishClass"
                v-if="isHavaData"
              />
              {{ item.lineName ? item.lineName.split('-')[1] : '' }}</label
            ><label class="tripTime">{{ item.tripStartTime }}</label>
          </cell>
        </group>
      </Scroll>
    </div>
    <baidu-map @ready="handler"></baidu-map>
  </div>
</template>
<script>
import { Group, Cell, Flexbox, FlexboxItem } from 'vux'
import Scroll from '../../components/scroll'
export default {
  components: {
    Group,
    Cell,
    Scroll,
    Flexbox,
    FlexboxItem
    // Grid,
    // GridItem
  },
  data() {
    return {
      pageNow: 1, //当前页
      pageNumber: 20, //一页20条
      //打包时调用 101.722423152，26.5875712571是攀枝花经纬，生产环境使用
      //后面是测试地址，开发时使用        //101.735535,26.594469(攀钢汽运公司)
      lon: process.env.NODE_ENV === 'production' ? 101.722423152 : 101.724646, //电脑  获取手机
      lat: process.env.NODE_ENV === 'production' ? 26.5875712571 : 26.540671, //打包时调用
      dataList: [
        {
          stationName: '附近没有站点',
          distance: '',
          tripStartTime: '',
          lineName: ''
        }
      ],
      value: '', //搜索文本框
      compCity: '攀枝花市', //当前城市
      isExpand: false,
      dataLists: [], //从数据库中获取到的结果值
      searchVal: '', // 搜索关键字
      resultVal: '', // 保存搜索到的值
      searchList: [], //保存过滤的结果集
      currentIndex: -1, // 当前默认选中的index
      oilData: { sumOil: 0, oilOrder: 0 },
      kiloData: { kiloCount: 0, order: 0 },
      oilIsShow: false, //节油量是否显示
      mileageIsShow: false, //里程是否显示
      isHavaData: false //附近是否有趟次
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    searchVal: function(val, oldVal) {
      if (val.length === 0) {
        this.isExpand = false
      } else {
        this.isExpand = true
      }
    }
  },
  created() {
    this.getTrips() //搜索所有趟次
    // this.getCurrentTrips() //获取最近的趟次
    this.$store.commit('setHeaderConf', {
      hasbackbtn: false,
      title: '',
      isShow: false
    })
    this.getOilData() //获取节油量以及及排名
    this.getKiloData() //获取里程以及排名
    this.orderIsShow() //获取用户的权限
  },
  computed: {
    typeaheadData() {
      let temp = []
      if (this.searchVal === '') {
        return this.dataLists
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.currentIndex = -1 // 重置特殊情况下的索引
        this.dataLists.forEach(item => {
          item.active = false // 取消高亮
          if (item.hasOwnProperty('line')) {
            if (
              item.line.lineName.indexOf(
                this.searchVal.toLowerCase().trim()
              ) !== -1
            ) {
              temp.push(item)
            }
          }
        })
        return temp
      }
    }
  },
  props: {
    mapData: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  methods: {
    //下拉刷新
    onRefresh(done) {
      console.log('下拉刷新')
      this.$el.querySelector('.load-more').style.display = ''
      this.pageNow = 1 //当前页等于1
      this.getCurrentTrips()
      done() // call done
      this.getOilData() //获取节油量以及及排名
      this.getKiloData() //获取里程以及排名
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
    orderIsShow() {
      //获取用户的权限
      let _this = this
      let menuList = this.$store.state.loginInfo.userData.menuApp
      menuList.forEach(function(menu) {
        if (menu.menuName === '设置') {
          menu.menuApp.forEach(function(me1) {
            if (me1.menuName === '节油量') {
              _this.oilIsShow = true
            }
            if (me1.menuName === '里程') {
              _this.mileageIsShow = true
            }
          })
        }
      })
    },

    //搜索所有趟次
    getTrips() {
      let _this = this
      this.axios.post(this.$store.state.apiUrl + 'allTrips').then(response => {
        if ('failed' === response.data.data) {
          this.dataLists = this.dataLists
        } else {
          let StrData = this.CryptoUtils.decrypt(response.data.data)
          let obj = JSON.parse(StrData) //将json字符串转换成json对象
          if (obj.length === 0) {
            _this.dataLists = this.dataLists
          } else {
            _this.dataLists = obj
          }
        }
      })
    },
    //获取最近的趟次
    getCurrentTrips() {
      let _this = this
      let data = {
        lon: this.lon,
        lat: this.lat
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      this.axios
        .post(this.$store.state.apiUrl + 'appWelcome', params)
        .then(response => {
          if ('failed' === response.data.data) {
            _this.dataList = this.dataList
          } else {
            let StrData = this.CryptoUtils.decrypt(response.data.data)
            let obj = JSON.parse(StrData) //将json字符串转换成json对象
            if (obj.length === 0) {
              _this.dataList = this.dataList
              _this.isHavaData = false
            } else {
              _this.dataList = obj
              _this.isHavaData = true
            }
          }
        })
    },
    login() {
      this.$router.push('/login')
    },
    lineDetail(trip) {
      if (this.isHavaData) {
        if (trip.hasOwnProperty('lineName')) {
          localStorage.setItem(
            'line_tripName',
            trip.lineName ? trip.lineName : ''
          ) //线路名称
        } else {
          localStorage.setItem(
            'line_tripName',
            trip.line ? trip.line.lineName : ''
          ) //线路名称
        }
        if (typeof trip.scheduleId === 'undefined') {
          localStorage.setItem('schedule_id', trip.schedule.scheduleId) //计划id
        } else {
          localStorage.setItem('schedule_id', trip.scheduleId)
        }
        localStorage.setItem('line_tripid', trip.tripId) //趟次ID
        // localStorage.setItem('schedule_id', trip.schedule.scheduleId) //计划id
        localStorage.setItem('tripStartTime', trip.tripStartTime) //趟次发车时间
        this.$router.push('/line')
      }
    },
    //点击其他地方
    resetDefaultStatus() {
      this.currentIndex = -1
      this.typeaheadData.forEach(item => {
        this.$set(item, 'active', false)
      })
      this.isExpand = false
    },
    //选中行执行
    setActiveClass(index) {
      // 设置样式活动类
      this.typeaheadData.forEach((item, innerIndex) => {
        if (index === innerIndex) {
          this.$set(item, 'active', true)
          this.currentIndex = index // 这句话是用来修正index,,就是键盘上下键的索引,不然会跳位
        } else {
          this.$set(item, 'active', false)
        }
      })
      this.isExpand = false
    },
    selectChild(index, trip) {
      // 鼠标点击选择子项
      this.typeaheadData.forEach((item, innerIndex) => {
        if (index === innerIndex || item.active) {
          this.searchVal = item.line.lineName
          this.resultVal = item.tripId
          this.isExpand = true
        }
        this.$set(item, 'active', false)
      })
      this.$emit('selectValue', { text: this.searchVal, value: this.resultVal })
      this.resetDefaultStatus()
      this.isExpand = false
      this.isHavaData = true
      this.lineDetail(trip)
    },
    handler({ BMap, map }) {
      console.log(BMap, map)
      //获取手机当前位置信息
      let _this = this
      if (navigator.geolocation) {
        var options = {
          enableHighAccuracy: true,
          timeout: 5000, //获取位置允许最长时间
          maximumAge: 5000
        }

        navigator.geolocation.getCurrentPosition(
          function(position) {
            let latitude = position.coords.latitude //获取纬度
            let longitude = position.coords.longitude //获取经度
            let ggPoint = new BMap.Point(longitude, latitude)
            //GPS转百度 BMap.Convertor.translate
            const convertor = new BMap.Convertor()
            convertor.translate([ggPoint], 1, 5, function(resPoint) {
              if (resPoint && resPoint.points && resPoint.points.length > 0) {
                //_this.center = resPoint.points[0]
                _this.lon = resPoint.points[0].lng
                _this.lat = resPoint.points[0].lat
                _this.getCurrentTrips() //测试时获取的位置 不能显示数据  获取最近的趟次
                //获取地址信息
                var geoc = new BMap.Geocoder()
                geoc.getLocation(resPoint.points[0], function(rs) {
                  var addComp = rs.addressComponents
                  _this.compCity = addComp.city
                  console.log('所在城市:' + addComp.city)
                })
              }
            })
          },
          function(error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                _this.$vux.toast.show({
                  text: '您拒绝对获取地理位置的请求',
                  type: 'warn',
                  position: 'middle'
                })
                break
              case error.POSITION_UNAVAILABLE:
                _this.$vux.toast.show({
                  text: '位置信息是不可用的',
                  type: 'cancel',
                  position: 'middle'
                })
                break
              case error.TIMEOUT:
                _this.$vux.toast.show({
                  text: '请求您的地理位置超时',
                  type: 'cancel',
                  position: 'middle'
                })
                break
              case error.UNKNOWN_ERROR:
                _this.$vux.toast.show({
                  text: '未知错误',
                  type: 'warn',
                  position: 'middle'
                })
                break
            }
          },
          options
        )
      } else {
        _this.$vux.toast.show({
          text: '不能支持定位功能',
          type: 'warn',
          position: 'middle'
        })
      }
    },
    //获得节油量信息
    getOilData() {
      let data = {
        account: localStorage.getItem('re_username')
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      this.axios
        .post(this.$store.state.apiUrl + 'getOil', params)
        .then(response => {
          if ('failed' === response.data.data) {
            this.oilData = this.oilData
          } else {
            let StrData = this.CryptoUtils.decrypt(response.data.data)
            let obj = JSON.parse(StrData) //将json字符串转换成json对象
            if (obj.length > 0) this.oilData = obj[0]
            // this.currOilOrder = '节油量(第' + this.oilData.oilOrder + '名)'
          }
        })
    },
    //获得里程信息
    getKiloData() {
      let data = {
        account: localStorage.getItem('re_username') //获取登录时的用户名
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      this.axios
        .post(this.$store.state.apiUrl + 'getKilo', params)
        .then(response => {
          if ('failed' === response.data.data) {
            this.kiloData = this.kiloData
          } else {
            let StrData = this.CryptoUtils.decrypt(response.data.data)
            let obj = JSON.parse(StrData) //将json字符串转换成json对象
            this.kiloData = obj[0]
            // this.currOrder = '里程(第' + this.kiloData.order + '名)'
          }
        })
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
<style lang="less" scoped>
.lineNames {
  position: absolute;
  top: 2em;
  left: 1em;
  width: 70%;
  text-align: left;
  padding-top: 0.5em;
  color: #6e747e;
}

.tripTime {
  position: absolute;
  top: 3.5em;
  width: 30%;
  right: 1em;
  text-align: right;
  padding-top: 0.5em;
  color: #6e747e;
}
body {
  margin: 0 !important;
}
.timelineDemo {
  margin: 0 auto;
  position: relative;
  padding-top: 0rem;
  z-index: 1;
  &._self-show {
    display: block !important;
  }
  .yo-scroll-top {
    margin-top: -15% !important;
    bottom: -2rem; //-1
  }
  .yo-scroll {
    top: 18rem !important;
    bottom: -2.5rem !important; //-1
  }
  .icon {
    width: 1.7rem;
    height: 1.7rem;
    font-size: 1.7rem;
    vertical-align: -0.5rem;
    fill: currentColor;
    overflow: hidden;
  }
  .icon {
    position: absolute;
    top: 0.5em;
    width: 2em;
    height: 2em;
    font-size: 1.7rem;
    vertical-align: -0.5rem;
    fill: currentColor;
    padding-left: 0.5em;
  }
  .icon img {
    width: 3em;
    height: 3em;
  }
  .search-module {
    position: relative;
    .search-text {
      width: 100%;
      height: 2rem;
      padding-right: 2em;
      padding-left: 0.5em;
      border-radius: 0.7em;
      box-shadow: none;
      border: 1px solid #ccc;
      &:focus {
        border-color: #2198f2;
      }
    }
  }
  p {
    color: #666;
    font-size: 1.2rem;
    margin: 0.2rem 0rem;
    font-weight: bold;
  }
  span {
    font-size: 0.9rem;
  }
  h4 {
    color: #666;
    // font-weight: normal;
    font-weight: bold;
  }
}
.el-fade-in-linear-enter-active,
.el-fade-in-linear-leave-active,
.fade-in-linear-enter-active,
.fade-in-linear-leave-active {
  transition: opacity 0.2s linear;
}

.el-fade-in-enter,
.el-fade-in-leave-active,
.el-fade-in-linear-enter,
.el-fade-in-linear-leave,
.el-fade-in-linear-leave-active,
.fade-in-linear-enter,
.fade-in-linear-leave,
.fade-in-linear-leave-active {
  opacity: 0;
}

.select-search {
  a {
    color: #333;
    text-decoration: none;
    padding: 5px;
  }
  ul {
    list-style: none;
    padding: 6px 0;
    margin: 0;
    overflow: visible;
    li {
      display: block;
      width: 100%;
      padding: 5px;
      font-size: 14px;
      padding: 8px 10px;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #48576a;
      height: 36px;
      line-height: 1.5;
      box-sizing: border-box;
      cursor: pointer;
      &.active {
        background-color: #20a0ff;
        a {
          color: #fff;
        }
      }
    }
  }
  .select-body {
    background: url('../../assets/image/firstpages.png') no-repeat;
    background-size: 100% 100%;
    width: 100%;
    height: 170px;
    z-index: 1000;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    box-sizing: border-box;
    padding: 8px;
    > input {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #bfcbd9;
      box-sizing: border-box;
      color: #1f2d3d;
      font-size: inherit;
      height: 36px;
      line-height: 1;
      outline: 0;
      padding: 3px 10px;
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      width: 100%;
      display: inline-block;
      font-size: 15px;
      font-family: Source Han Sans CN;
      font-weight: 400;
      color: rgba(194, 203, 214, 1);
      opacity: 1;
    }
  }
}
.timelineDemo .search-module .search-text {
  width: 92%;
  height: 2.5rem;
  position: absolute;
  bottom: -1.2rem;
  padding-left: 10em !important;
  right: 1rem;
  border-radius: 2em;
}
.searchBottomTop {
  width: 100%;
  height: 40px;
  background: rgba(250, 250, 250, 1);
  opacity: 1;
  box-sizing: border-box;
  margin-top: 8%;
}
.searchBottomTop span {
  position: relative;
  top: 0px; //40
  padding-left: 20px;
  box-sizing: border-box;
  font-size: 15px;
  font-family: Source Han Sans CN;
  font-weight: 400;
  line-height: 22px;
  color: rgba(175, 184, 193, 1);
  opacity: 1;
}

.searchBottom {
  width: 100%;
  height: 40px; //70
  background: rgba(250, 250, 250, 1);
  opacity: 1;
  box-sizing: border-box;
}
.searchBottom span {
  position: relative;
  top: 0px; //40
  padding-left: 20px;
  box-sizing: border-box;
  font-size: 15px;
  font-family: Source Han Sans CN;
  font-weight: 400;
  line-height: 22px;
  color: rgba(175, 184, 193, 1);
  opacity: 1;
}
.search-icon {
  position: absolute;
  bottom: -0.9em;
  left: 9.5em;
  z-index: 10;
}
.search-icon img {
  width: 1.3em;
  height: 1.3em;
}
.search-position {
  float: right;
  position: absolute;
  top: 0.7em;
  right: 1em;
  text-align: right;
  font-size: 26px;
  font-family: Source Han Sans CN;
  font-weight: 400;
  line-height: 20px;
  color: rgba(255, 255, 255, 1);
  opacity: 1;
}
.search-position label {
  padding-right: 0.5em;
}
.search-position img {
  width: 1em;
}
.weui-cells {
  margin-top: 0 !important;
}
.vux-no-group-title {
  margin-top: 0 !important;
}
.weui-cell {
  padding: 0 1em !important;
  height: 6em;
}
.vux-cell-bd .vux-cell-primary {
  height: 100%;
  margin-top: -3rem !important;
}
.weui-cells {
  margin-top: 0 !important;
  background: white !important;
}
.weui-cell_access .weui-cell__ft {
  margin-top: -1em;
}
.typeahead-filter {
  background: rgb(250, 250, 250, 1);
  height: 15em;
  text-align: center;
  overflow: auto;
  position: absolute;
  bottom: -16.3em;
  width: 92%;
  left: 1em;
  border-bottom-right-radius: 1em;
  border-bottom-left-radius: 1em;
}
.noFound {
  font-weight: 100;
}
.startClass {
  width: 0.8em !important;
  padding-right: 0.4em;
}
.finishClass {
  width: 0.8em !important;
  padding-right: 0.4em;
}
.order {
  text-align: center !important;
  padding-left: 1em;
}
.orderPic {
  width: 1.3em !important;
  padding-left: 0.4em !important;
  margin-top: 2px;
}
.flex-demo {
  margin-top: 20px;
  text-align: center;
  color: #fff;
  border-radius: 4px;
  background-clip: padding-box;
  height: 60px;
  // line-height: 60px;
}
.orderWord {
  font-size: 18px !important;
  color: #6e747e;
}
.countWord {
  font-size: 30px !important;
  color: #1f2d3d;
  font-weight: bold;
}
.orderNum {
  color: #20a0ff;
}
.vux-label {
  font-weight: bold;
}
</style>
