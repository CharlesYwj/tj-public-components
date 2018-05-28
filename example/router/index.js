import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

import UploadDemo from '../pages/UploadDemo.vue';
import DownloadDemo from "../pages/DownloadDemo.vue";
import TreeDialog from "../pages/TreeDialogDemo.vue";
import DownloadSlotDemo from "../pages/DownloadSlotDemo.vue";
import UploadInDialog from "../pages/UploadInDialog.vue";

const router = new Router({
  routes: [{
      path: '/upload',
      component: UploadDemo
    },
    {
      path: '/download',
      component: DownloadDemo
    },
    {
      path: '/dialog',
      component: TreeDialog
    },
    {
      path: "/downloadSlot",
      component: DownloadSlotDemo
    }, {
      path: "/uploadInDialog",
      component: UploadInDialog
    }
  ]
});

export default router;
