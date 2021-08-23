import Vue from 'vue'
import './style/monokai_sublime.css'
import './style/markdown.css'
import App from './App'
import { Button, Input, Dialog, MessageBox, Message, Tabs, TabPane, Loading, Alert } from 'element-ui'

Vue.prototype.$msgbox = MessageBox
Vue.prototype.$message = Message
Vue.use(Button)
Vue.use(Input)
Vue.use(Dialog)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Loading.directive)
Vue.use(Alert)
Vue.prototype.$loading = Loading.service

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
