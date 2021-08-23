<template>
  <div v-html="contentHTMl"/>
</template>

<script>
import { marked, hljs } from '../utils/index'
export default {
  name: 'MarkBlock',
  components: {

  },
  props: {
    content: {
      type: null,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      contentHTMl: ''
    }
  },
  computed: {

  },
  watch: {
    content: {
      handler(newName, oldName) {
        this.contentHTMl = marked(this.content)
        this.$nextTick(function() {
          hljs.initHighlighting()
        })
      },
      immediate: true
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>
<style scoped>
.cascader-container ul,.cascader-container li,.cascader-container p{
    margin:0;
    padding:0;
  }
.label-text span{
  color: #5F6887;
  margin-left: 6px;
  font-size: 14px;
  font-weight: 100;
}
.range{
  width:100px;
}
</style>
<style>
  .mce-container, .mce-container *, .mce-widget, .mce-widget *, .mce-reset{
    white-space: inherit !important;
  }
</style>

