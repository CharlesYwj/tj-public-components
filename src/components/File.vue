<template>
    <div class="file">
        <div class="file-name"><i class="fa" :class="(isExisted ? file.extension : uploadFile.extension) | fileIcon"></i>{{file._name}}</div>
        <div class="file-size">{{isExisted?file.docSize:file.size/1024>1024?(file.size/1024/1024).toFixed(2)+"MB":(file.size/1024).toFixed(2)+"KB"}}</div>
        <div :class="isExisted ? 'file-finished' : 'file-status'">
          <template v-if="isExisted">已上传</template>
          <template v-else>
            {{uploadFile.status | statusFilter}}
          </template>
        </div>
        <div v-if="!isExisted" class="file-progress">
          <div class="file-progress-wrap">
          <div class="file-progress-current" 
              :style="{width:(file._prevProgress).toFixed(3)*100+'%'}"
              :class="{'success':file._prevProgress === 1 &&  !file.error,'error':file.error}">
          </div>
          <span class="file-progress-number">{{(file._prevProgress).toFixed(3)*100+'%'}}</span>
          </div>
        </div>
        <div class="file-actions">
          <a  href="javascript:void(0);" v-if="isExisted ? file.type === 'image' : uploadFile.fileCategory === 'image' && uploadFile.status ==='success'" 
              title="预览" @click="previewImg(file)">
            <i class="fa fa-eye"></i>
          </a>
          <a v-if="isExisted" :href="docURL+'/doc/download/'+file.id">
              <i class="fa fa-download"></i>
          </a>
          <a href="javascript:void(0);" v-if="canUpload" @click="deleteFile(isExisted ? file : uploadFile)">
            <i class="fa fa-times"></i>
          </a>
          <slot name="file-actions-slot" :file="file" :uploadFile="uploadFile"></slot>
        </div>
    </div>
</template>

<script>
import {
  iconFilterMixin,
  apiDataMixin,
  typeFilterMixin
} from "../common/mixins";
export default {
  mixins: [iconFilterMixin, apiDataMixin, typeFilterMixin],
  props: {
    isExisted: {
      type: Boolean,
      default: true
    },
    file: {
      type: Object,
      require: true
    },
    docURL: {
      type: String
    },
    canUpload: {
      type: Boolean,
      default: true
    },
    uploadFile: {
      type: Object
    }
  },
  data() {
    return {
      dialogVisible: false
    };
  },
  methods: {
    previewImg(file) {
      this.dialogVisible = true;
      this.$emit("preview-image", file);
    },
    dialogClose() {},
    deleteFile(file) {
      this.$emit("delete-file", file, this.isExisted);
    }
  },
  filters: {
    statusFilter(status) {
      let fileStatusText = {
        success: "成功",
        error: "失败",
        uploading: "上传中",
        paused: "暂停",
        waiting: "等待"
      };
      return fileStatusText[status] || "";
    }
  }
};
</script>

<style>
</style>
