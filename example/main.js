import Vue from "vue";
// import Public from "../dist/public-components";
 import Public from "../src";
import App from "./App.vue";
import {
  MessageBox,
  Message,
  Dialog,
  Tree,
  Button
} from 'element-ui';
import 'font-awesome/css/font-awesome.min.css';
import router from './router';
import "babel-polyfill";
Vue.use(Public);
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$message = Message;
Vue.use(Dialog);
Vue.use(Tree);
Vue.use(Button);
/* eslint-disable no-new */
new Vue({
  router,
  render(createElement) {
    return createElement(App);
  }
}).$mount("#app");
