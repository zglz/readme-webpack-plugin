<template>
  <div>
    <ul class="record">
      <li v-for = "(group,index) in recordList" :key="index" class="record-group">
        <div class="content">
          <div class="left">
            <span class="index-group">{{ group.mark.id }}</span>
          </div>
          <div class="right">
            <div class="group-title">{{ group.mark.title }}</div>
            <div class="group-path">
              <span class="path">{{ formatPath(group.path) }}</span>
              <i class="el-icon-folder-opened icon" @click="source(group)"/>
              <i v-if="group.mark.children.length === 0" class="el-icon-delete icon" @click="del(group)"/>
            </div>
            <MarkBlock :content="group.mark.content"/>
            <ul class="record-list">
              <li v-for = "(item,index) in group.mark.children" :key="index" class="record-item">
                <div class="content">
                  <div class="left">
                    <span class="index-item">{{ item.mark.id }}</span>
                  </div>
                  <div class="right">
                    <div class="item-title">{{ item.mark.title }}</div>
                    <div class="group-path">
                      <span class="path">{{ formatPath(item.path) }}</span>
                      <i class="el-icon-folder-opened icon" @click="source(item)"/>
                      <i class="el-icon-delete icon" @click="del(item)"/>
                    </div>
                    <MarkBlock :content="item.mark.content"/>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!--
<el-button type="success" @click="source(group)" icon="el-icon-folder-opened" size="mini"></el-button>-->
        <!--
<el-button  @click="del(group)"  type="success" icon="el-icon-delete" size="mini"></el-button>
 -->

      </li>
    </ul>
    <SourcePop :pop-visible="popVisible" :content="active.content" :path="active.path" :index="active.index" @refresh="refresh"/>
  </div>
</template>

<script>
import MarkBlock from './markBlock'
import SourcePop from './sourcePop'
const analyzer = require('../../public/analyzer')
const axios = require('axios')
import { groupBy } from 'lodash'
import { genHashCode } from '.././utils/index'
export default {
  name: 'BlockList',
  components: {
    MarkBlock, SourcePop
  },
  props: {
    recordList: {
      type: null,
      default() {
        return false
      }
    },
    original: {
      type: null,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      typeColorMap: analyzer.typeColorMap,
      popVisible: {
        sourcePop: false
      },
      active: {
        content: '',
        path: '',
        index: null
      }
    }
  },
  computed: {
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    del(item) {
      this.$msgbox({
        type: 'warning',
        message: `确定进行删除操作?`,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '处理中...'
            const delMark = [
              {
                path: item.path,
                tokenIndex: item.index
              }
            ]
            item.mark.children.map((c) => {
              delMark.push({
                path: c.path,
                tokenIndex: c.index
              })
            })
            const group = groupBy(delMark, 'path')
            const data = []
            Object.keys(group).map((path) => {
              var indexs = []
              group[path].map((v) => {
                indexs.push(v.tokenIndex)
              })
              data.push({
                path,
                hashCode: genHashCode(this.original[path]),
                tokenIndexs: indexs
              })
            })
            instance.confirmButtonLoading = false
            done()
            axios.delete('/api/record', { data: data })
              .then((response) => {
                const data = response.data
                if (data.code === 3) {
                  this.$nextTick(() => {
                    this.$msgbox({
                      type: 'warning',
                      message: `源码变化，重新加载数据?`,
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                          // instance.confirmButtonLoading = true
                          // instance.confirmButtonText = '处理中...'
                          done()
                          this.$emit('refresh')
                        } else {
                          done()
                        }
                      }
                    })
                  })
                } else {
                  this.$message({
                    message: data.msg,
                    type: 'success'
                  })
                  this.$emit('refresh')
                }
              })
              .catch(function(error) {
                console.log(error)
              })
          } else {
            done()
          }
        }
      })
    },
    source(record) {
      this.active.path = record.path
      this.active.content = this.original[record.path]
      this.active.index = record.index
      this.popVisible.sourcePop = true
    },
    refresh() {
      this.$emit('refresh')
    },
    formatPath(path) {
      return path.split('\\').join(' > ')
    }
  }

}
</script>

<style lang="scss" scoped>
@import ".././style/_variables.scss";
.record, .record-group, .record-list, .record-item{
  margin:0;
  padding: 0;
	list-style: none;
}
.record{
  padding-left: 30px;
  padding-top: 10px;
}
.record-group{
  /* border: 1px solid #ccc; */
  margin-bottom: 20px;
  /* padding: 20px; */

}
.content{
  display: flex;
}
.right{
  width: 100%;
}
.group-title{
  margin-top: 9px;
}
.group-path{
    margin-top: 8px;
    color: #99a2aa;
    font-weight: bolder;
    border-bottom: 1px solid #99a2aa;
    padding-bottom: 8px;
}
.path{
  color: #ffa500;
}
.group-path > i{
  display: inline-block;
  margin-left: 15px;
  vertical-align: -2px;
}

.record-list{
  /* margin-left: 50px; */
}
.index-group{
  background: $--color-primary;
  // background: #8bc34a;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-block;
  text-align: center;
  line-height: 40px;
  color: #fff;
  margin-right: 20px;
  font-size: 20px;

}
.index-item{
    color:  $--color-primary;
    border: 1px solid  $--color-primary;
    border-radius: 50%;
    display: inline-block;
    width: 25px;
    height: 25px;
    line-height: 25px;
    font-size: 15px;
    margin-right: 20px;
    text-align: center;
}
.item-title{
  margin-top: 2px;
}
.icon{
  cursor: pointer;
}
.el-icon-folder-opened:hover{
  color: $--color-primary;;
}
.el-icon-delete:hover{
  color: red;
}
</style>
<style>

</style>

