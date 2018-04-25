import Uploader from "vue-simple-uploader";
import Upload from "./components/Upload.vue";
import Download from "./components/Download.vue";
import TreeDialog from "./components/TreeDialog.vue";

function install(Vue) {
  if (install.installed) {
    return;
  }
  Vue.use(Uploader);
  Vue.component("Upload", Upload);
  Vue.component("Download", Download);
  Vue.component("TreeDialog", TreeDialog);
}

export default {
  install
};
