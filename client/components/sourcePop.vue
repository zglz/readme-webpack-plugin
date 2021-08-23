<template>
  <div class="checkBatchPop">
    <el-dialog ref="checkBatchPop" :visible="popVisible.sourcePop" :show-close="true" :title="path" width="900px" hight="500px" @close="close" @open="open">
      <div v-if="!isEidt" style="height:430px;overflow:auto;border: 1px solid #cccccc;padding:10px;">
        <ul class="record-list">
          <li v-for = "(token,i) in contentTokenList" :key="i" class="record-item">
            <pre v-if="token.mark" :class="{active:index===i}" class="mark">{{ token.code }}</pre>
            <pre v-else>{{ token.code }}</pre>
          </li>
        </ul>
      </div>
      <el-input v-if="isEidt" :rows="20" v-model="innerContent" type="textarea" placeholder="" style="border: 1px solid #67c23a;"/>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" icon="el-icon-edit" size="mini" @click="editHandle()"/>
        <el-button type="success" icon="el-icon-upload2" size="mini" @click="submintHandle()"/>
      </span>
    </el-dialog>
  </div>
</template>
<script>
const axios = require('axios')
const parser = require('../../public/parser')
import { genHashCode } from '.././utils/index'
export default {
  name: 'CheckBatchPop',
  components: {
  },
  props: {
    popVisible: {
      type: null,
      default() {
        return false
      }
    },
    content: {
      type: null,
      default() {
        return false
      }
    },
    path: {
      type: null,
      default() {
        return false
      }
    },
    index: {
      type: null,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      isEidt: false,
      innerContent: '',
      contentTokenList: []
    }
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    editHandle() {
      this.isEidt = true
    },
    submintHandle() {
      axios.put('/api/source', {
        path: this.path,
        source: this.innerContent
      })
        .then((response) => {
          const data = response.data
          this.$message({
            message: data.msg,
            type: 'success'
          })
          this.$emit('refresh')
          this.close()
        })
        .catch(function(error) {
          console.log(error)
        })
    },
    close() {
      this.popVisible.sourcePop = false
    },
    open() {
      this.isEidt = false
      this.innerContent = this.content
      const data = {
        path: this.path,
        hashCode: genHashCode(this.innerContent)
      }
      axios.post('/api/checkSource ', data)
        .then((response) => {
          const data = response.data
          if (data.code === 3) {
            this.innerContent = data.source
          }
          const ast = parser.parse(this.innerContent)
          this.contentTokenList = ast
        })
        .catch(function(error) {
          console.log(error)
        })
    }
  }
}
</script>
<style scoped>
  .record-list, .record-item{
    margin:0;
    padding: 0;
    list-style: none;
  }
  .mark{
    color:#5bba77;
    background: aliceblue;
  }
  .active{
    color:#fff;
    background: #5bba77;
  }
</style>

<style>
</style>

