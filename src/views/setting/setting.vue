<template>
  <div class="about">
    <Scroll :on-refresh="onRefresh"
            :on-infinite="onInfinite">
      <group v-for="(item, index) in menuItem.items"
             :key="index">
        <div class="personImg"
             v-if="item.menuName === '姓名'">
          <div class="personIcon">
            <img :src="imgPath"
                 @click="baseInfo()"
                 style="border-radius:50%">
          </div>
          <div class="personName">{{ userInfo.userName }}</div>
        </div>
        <cell :title="item.menuName"
              v-if="item.target"
              v-show="item.menuName !== '姓名'"
              :link="{ name: item.target }">
        </cell>
      </group>
    </Scroll>
  </div>
</template>
<script>
import { Group, Cell } from 'vux'
import Scroll from '../../components/scroll'
export default {
  components: {
    Group,
    Cell,
    Scroll
  },
  data() {
    return {
      pageNow: 1, //当前页
      pageNumber: 20, //一页20条
      userInfo: this.$store.state.loginInfo.userData,
      img: {
        msrc:
          'http://ww1.sinaimg.cn/thumbnail/663d3650gy1fplwu9ze86j20m80b40t2.jpg',
        src: 'http://ww1.sinaimg.cn/large/663d3650gy1fplwu9ze86j20m80b40t2.jpg',
        w: 800,
        h: 400
      },
      menuItem: {
        fromSelectIndex: 0,
        items: []
      },
      data: { sumOil: 0, oilOrder: 0 },
      kiloData: { kiloCount: 0, order: 0 },
      imgPath: '', //头像地址
      defImgPath: require('../../assets/image/head.png') //默认头像地址
    }
  },
  created() {
    // this.getUserInfo()
    this.$store.commit('setHeaderConf', {
      hasbackbtn: false,
      title: '设置',
      isShow: true
    })
    let _this = this
    let menuList = this.$store.state.loginInfo.userData.menuApp
    menuList.forEach(function(menu) {
      if (menu.menuName === '设置') {
        _this.menuItem.items = menu.menuApp
      }
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
    },
    /**
     * 获取当前登录人员头像
     */
    getUserInfo() {
      let data = {
        account: localStorage.getItem('re_username')
      }
      let params = this.CryptoUtils.encrypt(JSON.stringify(data))
      this.axios
        .post(this.$store.state.apiUrl + 'getUserInfo', params)
        .then(response => {
          if ('failed' === response.data.data) {
            //this.kiloData = this.kiloData
          } else {
            let StrData = this.CryptoUtils.decrypt(response.data.data)
            let obj = JSON.parse(StrData) //将json字符串转换成json对象
            if (JSON.stringify(obj) === '{}') {
              this.imgPath = '../../assets/image/head.png'
              return
            }
            //头像
            this.imgPath = obj.ua.hasOwnProperty('picFileId')
              ? this.$store.state.readPhotoUrl + obj.ua.picFileId
              : this.defImgPath
            // this.lastImgPath = obj.ua.picFileId ? obj.ua.picFileId : ''
            this.username = obj.ua.appUsers.userName
              ? obj.ua.appUsers.userName
              : ''
          }
        })
    },
    /**
     * 个人信息
     */
    baseInfo() {
      this.$router.push('/baseInfo')
    },
    /**
     * 满意度
     */
    satisfaction() {
      this.$router.push('/satisfaction')
    },
    /**
     * 关于
     */
    about() {
      this.$router.push('/about')
    }
  }
}
</script>
<style scoped></style>

<style lang="scss">
.about {
  background: rgba(250, 250, 250, 1);
}
.personImg {
  width: 100%;
  height: 200px;
  margin-bottom: 1em;
  background: rgba(255, 255, 255, 1);
}
.personIcon {
  width: 100%;
  height: 70%;
  text-align: center;
  padding-top: 1em;
}
.personIcon img {
  width: 7em;
  height: 7em;
}
.personName {
  width: 100%;
  height: 30%;
  text-align: center;
  font-family: Microsoft YaHei;
  font-weight: bold;
  line-height: 15px;
  color: rgba(56, 65, 80, 1);
  opacity: 1;
}
.weui-cells:before {
  border-top: 0 !important;
}
.yo-scroll {
  top: 0 !important;
  bottom: 35px !important;
}
.weui-cell_access {
  width: 91%;
}
.weui-cell {
  padding: 10px 15px !important;
  border-bottom: 1px solid rgba(227, 235, 239, 1);
}
</style>
