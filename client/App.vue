<template>
  <div v-loading.fullscreen.lock="fullscreenLoading" id="app" class="app">
    <div v-if="!fullscreenLoading">
      <!-- base -->
      <div class="" v-html="readmeData.baseDataHTML"/>
      <!-- title -->
      <h1 class = "title" style="">generate by readme-webpack-plugin</h1>
      <!-- error -->
      <el-alert v-if="readmeData.error" :title="`Duplicate serial number detected: '${readmeData.error}'. This cause document error.`" type="error"/>
      <!-- tabs -->
      <el-tabs v-model="activeName" type="" tab-position="left" @tab-click="handleClick">
        <el-tab-pane :label="`TODO(${readmeData.blockTree.todo.length})`" name="TODO">
          <recordList :record-list="readmeData.blockTree.todo" :original="readmeData.original" @refresh="getData"/>
        </el-tab-pane>
        <el-tab-pane :label="`component(${readmeData.blockTree.component.length})`" name="component">
          <recordList :record-list="readmeData.blockTree.component" :original="readmeData.original" @refresh="getData"/>
        </el-tab-pane>
        <el-tab-pane :label="`tag(${readmeData.blockTree.tag.length})`" name="tag">
          <recordList :record-list="readmeData.blockTree.tag" :original="readmeData.original" @refresh="getData"/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { marked, hljs } from './utils/index'
const axios = require('axios')
const analyzer = require('../public/analyzer')
import MarkBlock from './components/markBlock'
import SourcePop from './components/sourcePop'
import recordList from './components/recordList'
export default {
  name: 'App',
  components: {
    MarkBlock, SourcePop, recordList
  },
  data() {
    return {
      readmeData: {
        baseDataHTML: '',
        blockTree: {
          todo: [],
          component: [],
          tag: []
        },
        error: null,
        original: {
        }
      },
      activeName: 'TODO',
      fullscreenLoading: true
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      axios.get('/readmeData')
        .then((response) => {
          const data = response.data
          this.readmeData.baseDataHTML = marked(data.baseData)
          const result = analyzer.serverAnalyzer(data.original)
          this.readmeData.blockTree = result.blockTree
          this.readmeData.error = result.error
          this.readmeData.original = data.original
          this.$nextTick(function() {
            hljs.initHighlighting()
            this.fullscreenLoading = false
          })
        })
        .catch(function(error) {
          console.log(error)
        })
    },
    handleClick(tab, event) {
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./style/_variables.scss";
.app{
  height: 100%;
}
 .title{
  background: $--color-primary;
  color:#fff;
 }
</style>
<style lang="scss">
  @import "./style/_variables.scss";
  .el-tabs__active-bar{
    background-color: $--color-primary !important;
  }
  .el-tabs__item.is-active{
    color:$--color-primary !important;
  }
  .el-tabs__item:hover{
    color:$--color-primary !important;
  }

</style>
