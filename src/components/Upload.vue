<template>
  <uploader ref="uploader" @file-added="fileAdded" :options="optionsPlugin" :autoStart="false" class="upload">
    <uploader-unsupport>不支持您当前使用的浏览器，请使用更高版本的浏览器或其他浏览器</uploader-unsupport>
    <uploader-drop class="upload-drop" v-if="isDrop && canUpload">
      <p><i class="fa fa-cloud-upload"></i></p>
      <p>将文件拖到此处</p>
    </uploader-drop>
    <div class="upload-btns" v-if="canUpload">
        <uploader-btn type="button" class="add-file" :attrs="attrs">选取文件</uploader-btn>
        <button type="button" class="uploader-btn start-upload" @click="upload">开始上传</button>
    </div>
    <div class="tips" v-if="isIE10Plus">IE浏览器不支持上传空文件以及名字为“.”的文件</div>
    <template>
      <div class="existed-file-list file" v-for="file in existedFiles" :key="file.id" :file="file">
        <slot :file="file" name="existed-file">
          <div class="file-name"><i class="fa" :class="file.oldName | fileExtension | fileIcon"></i>{{file.oldName}}</div>
          <div class="file-size">{{file.docSize}}</div>
          <div class="file-finished">
            已上传
          </div>
          <div class="file-actions">
            <a  href="javascript:void(0);" v-if="file.type === 'image'" title="预览" @click="previewImg(file)">
              <i class="fa fa-eye"></i>
            </a>
            <a :href="docURL+'/doc/download/'+file.id">
                <i class="fa fa-download"></i>
            </a>
            <a href="javascript:void(0);" v-if="canUpload" @click="del(file,true)">
              <i class="fa fa-times"></i>
            </a>
            <slot name="file-actions-slot" :file="file"></slot>
          </div>
          <el-dialog class="preview" :visible.sync="file.dialogVisible">
            <img :src="docURL + file.docUrl" class="preview-image">
          </el-dialog>
        </slot>
      </div>
    </template>
    <uploader-list>
        <template slot-scope="fileList"> 
          <uploader-file class="file" v-for="file in fileList.fileList" :key="file.id" :list="true" :file="file">
              <template slot-scope="uploadFile">
                <slot :file="uploadFile" name="upload-file">
                    <div class="file-name"><i class="fa" :class="uploadFile.extension | fileIcon"></i>{{uploadFile.file.name}}</div>
                    <div class="file-size">{{uploadFile.file.size/1024>1024?(uploadFile.file.size/1024/1024).toFixed(2)+"MB":(uploadFile.file.size/1024).toFixed(2)+"KB"}}</div>
                    <div class="file-status">{{uploadFile.status | statusFilter}}</div>
                    <div class="file-progress">
                      <div class="file-progress-wrap">
                        <div class="file-progress-current" 
                            :style="{width:(uploadFile.file._prevProgress).toFixed(3)*100+'%'}"
                            :class="{'success':uploadFile.file._prevProgress === 1 &&  !uploadFile.file.error,
                                      'error':uploadFile.file.error}"
                        >
                        </div>
                        <span class="file-progress-number">{{(uploadFile.file._prevProgress).toFixed(3)*100+'%'}}</span>
                      </div>
                    </div>
                    <div class="file-actions">
                      <a href="javascript:void(0);" title="预览" @click="previewImg(uploadFile.file)" v-if="uploadFile.fileCategory === 'image' && uploadFile.status ==='success'">
                        <i class="fa fa-eye"></i>
                      </a>
                      <a href="javascript:void(0);" @click="pause(uploadFile)" v-if="uploadFile.status!=='success'">
                        <i class="fa fa-pause"></i>
                      </a>
                      <a href="javascript:void(0);" @click="del(uploadFile)">
                        <i class="fa fa-times"></i>
                      </a>
                      <slot name="file-actions-slot" :file="uploadFile.file"></slot>
                    </div>
                    <el-dialog class="preview" :visible.sync="uploadFile.file.dialogVisible">
                      <img :src="docURL + uploadFile.file._fileUrl" class="preview-image">
                    </el-dialog>
                    <div class="hide">{{uploadFile}}</div>
                </slot>
              </template>
          </uploader-file>
        </template>
    </uploader-list>
  </uploader>
</template>

<script>
import axios from "axios";
import qs from "qs";
import {
  iconFilterMixin,
  apiDataMixin,
  typeFilterMixin
} from "../common/mixins";
import { getExtension, extension2Type } from "../common/utils";
import url from "url";
export default {
  mixins: [iconFilterMixin, apiDataMixin, typeFilterMixin],
  created() {
    const vm = this;
    //初始化期望类型数组
    if (this.types.length > 0) {
      const types = Array.isArray(this.types) ? this.types : [this.types];
      types.forEach(ele => {
        if (ele.indexOf("/") > -1) {
          if (ele.indexOf("*") > -1) {
            vm.involveTypes.push(ele);
          } else {
            vm.specificTypes.push(ele);
          }
        }
        if (ele.indexOf(".") > -1) {
          vm.expectExtensions.push(ele);
        }
      });
    }
    //当上传组件需加载已存在文件时
    if (typeof this.fileIds === "undefined" || this.fileIds.length < 0) {
      return false;
    }
    this.loadFiles(this._fileIds);
  },
  mounted() {
    const uploader = this.uploader;
    const vm = this;
    uploader.on("fileSuccess", function(rootFile, file, message, chunk) {
      if (JSON.parse(message).now_id) {
        vm.$set(file, "_fileId", JSON.parse(message).now_id);
        vm.$set(file, "_fileUrl", JSON.parse(message).now_url);
        vm.uploadedIds.push(JSON.parse(message).now_id);
        vm.uploadedFiles.push(file);
        vm.waitingNum--;
      } else {
        if (JSON.parse(message).info) {
          vm.$message({
            type: "error",
            message: `上传失败，原因为${
              JSON.parse(message).info
            }，请联系网络管理员`
          });
          console.error(file);
        }
      }
    });
  },
  props: {
    //文档服务地址
    docURL: {
      type: String,
      default: "http://d.test.app.pubob.ob.io/"
    },
    //simple-uploader.js的相关配置
    options: {
      type: Object,
      default: () => {}
    },
    //是否开启拖拽功能
    isDrop: {
      type: Boolean,
      default: true
    },
    //是否可编辑状态，即是否可上传
    canUpload: {
      type: Boolean,
      default: true
    },
    //有文件存在时的文件id
    fileIds: {
      type: [String, Array],
      default: () => []
    },
    //限定文件类型
    types: {
      type: [Array],
      default: () => []
    },
    //限定文件个数
    limitNum: {
      type: Number
    },
    //限制文件大小，单位为KB
    limitSize: {
      type: Number
    }
  },
  data() {
    return {
      uploadedIds: [], //已上传文件id列表
      uploadedFiles: [], //已上传文件列表
      existedFiles: [], //初始化文件列表
      attrs: {
        accept: this.types
      },
      involveTypes: [], //大类，即包含*的类型
      specificTypes: [], //具体类型，即不含*的类型
      expectExtensions: [], //期望文件后缀名
      //已添加的附件个数
      addedNum: (() => {
        return Array.isArray(this.fileIds) ? this.fileIds.length : 1;
      })(),
      waitingNum: 0,
      isIE10Plus: (() => window.navigator.msPointerEnabled)(),
      previewURL: ""
    };
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
  },
  computed: {
    uploader() {
      return this.$refs.uploader.uploader;
    },
    expectTypes() {
      return Array.isArray(this.types) ? this.types : [this.types];
    },
    _fileIds() {
      return Array.isArray(this.fileIds)
        ? this.fileIds.join(",")
        : this.fileIds;
    },
    APIMap() {
      const map = new Map();
      const keys = Object.keys(this.API);
      keys.forEach(key => {
        map.set(key, url.resolve(this.docURL, this.API[key]));
      });
      return map;
    },
    optionsPlugin() {
      return Object.assign({}, this.options, {
        target: this.APIMap.get("upload"),
        chunkSize: 100 * 1024 * 1024,
        testChunks: false
      });
    }
  },
  methods: {
    upload() {
      this.uploader.upload();
    },
    /**
     * 发送删除请求删除指定文件
     * @param file {object} 要删除的文件
     * @param idKey {string} 文件唯一标识符字段名
     */
    postDeleteRequest(file, idKey = "_fileId") {
      let pro = new Promise((resolve, reject) => {
        axios
          .post(
            this.APIMap.get("delete"),
            qs.stringify({
              ids: [file[idKey]].join(",")
            })
          )
          .then(res => {
            if (res.data === file[idKey]) {
              resolve(file);
            } else {
              this.$message({
                type: "info",
                message: "删除失败"
              });
            }
          })
          .catch(err => {
            this.$message({
              type: "info",
              message: "删除失败"
            });
            console.error(err);
          });
      });
      return pro;
    },
    /**
     * 从uploadedIds及uploadedFiles数组中删除文件id，此操作仅为视图层面的删除，不与后台、数据库交互
     * @param fileId {string} 要删除的文件id
     */
    delFromUploadedList(fileId) {
      const vm = this;
      vm.uploadedIds.splice(vm.uploadedIds.indexOf(fileId), 1);
      vm.uploadedFiles.forEach((element, _index) => {
        if (element._fileId === fileId) {
          vm.uploadedFiles.splice(_index, 1);
        }
      });
    },
    /**
     * 从simple-uploaer组件的附件列表中删除附件
     * @param fileSlot {object} 附件
     * @param isExistedFile {boolean} 该附件是否是原有附件（即非此次上传的）
     */
    del(fileSlot, isExistedFile = false) {
      const vm = this;
      const uploader = this.uploader;
      function delByView(file) {
        vm.addedNum--;
        if (!isExistedFile) {
          uploader.removeFile(file);
        }
        vm.$message({ message: "删除成功", type: "success" });
      }
      this.$confirm("是否删除该附件", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const file = isExistedFile ? fileSlot : fileSlot.file;
          if (
            isExistedFile ||
            (typeof file.isComplete === "function" && file.isComplete())
          ) {
            vm.postDeleteRequest(file).then(file => {
              delByView(file);
              vm.delFromUploadedList(file._fileId);
              if (isExistedFile) {
                vm.existedFiles.forEach((element, index) => {
                  if (element.id === file._fileId) {
                    vm.existedFiles.splice(index, 1);
                    vm.addedNum--;
                  }
                });
              }
            });
          } else {
            vm.waitingNum--;
            delByView(file);
          }
        })
        .catch();
    },
    pause(fileSlot) {
      fileSlot.file.pause();
    },
    /**
     * 预览simple-upload组件中的图片预览操作
     * @param file {object} 文件
     */
    previewImg(file) {
      file.dialogVisible = true;
    },
    /**
     * 选取文件后的回调方法
     * @param file {object} 所选取的文件
     */
    fileAdded(file) {
      this.$set(file, "dialogVisible", false);
      const vm = this;
      const validateTypeResult = this.validateType(file);
      const validateSizeResult = this.validateSize(file);
      file._name = file.name;
      if (!validateTypeResult) {
        this.$message({
          type: "error",
          message: `${file.name}的类型不在规定范围内`
        });
        this.$nextTick(() => {
          this.uploader.removeFile(file);
        });
        return false;
      }
      if (!validateSizeResult) {
        this.$message({
          type: "error",
          message: `${file.name}大小超出${vm.limitSize}KB`
        });
        this.$nextTick(() => {
          this.uploader.removeFile(file);
        });
        return false;
      }
      this.addedNum++;
      if (this.limitNum > 0 && this.limitNum < this.addedNum) {
        this.$message({
          type: "error",
          message: `最多只能上传${this.limitNum}个文件`
        });
        this.uploader.files.forEach(_file => {
          if (file.uniqueIdentifier === _file.uniqueIdentifier) {
          }
        });
        this.addedNum--;
        this.$nextTick(() => {
          this.uploader.removeFile(file);
        });
        return false;
      }
      this.waitingNum++;
    },
    /**
     * 类型判断
     * @param file {object} 需要判断的文件
     */
    validateType(file) {
      const fileType = file.fileType;
      const fileName = file.name;
      const extension = fileName.split(".")[fileName.split(".").length - 1];
      let _result = false;
      //具体mime类型
      if (this.specificTypes.indexOf(fileType) > -1) {
        return true;
      }
      //包含*的mime类型
      this.involveTypes.forEach(ele => {
        const _type = ele.match(/([^*]*)\*$/)[1];
        if (fileType.indexOf(_type) > -1) {
          _result = true;
          return true;
        }
      });
      //后缀名
      this.expectExtensions.forEach(ele => {
        const _extension = ele.substring(1);
        if (_extension === extension) {
          _result = true;
          return true;
        }
      });
      return this.types.length > 0 ? _result : true;
    },
    /**
     * 文件大小判断
     * @param file {object} 需要判断的文件
     */
    validateSize(file) {
      if (
        typeof this.limitSize !== "undefined" &&
        !Number.isNaN(this.limitSize)
      ) {
        return file.size / 1024 < this.limitSize;
      } else {
        return true;
      }
    },
    /** 加载文件
     * @param ids {string | array} 需要加载的文件ids数组
     * @param willReplace {boolean} 是否替换已有文件,默认为false
     */
    loadFiles(ids, willReplace = false) {
      const vm = this;
      if (ids === "") {
        return false;
      }
      axios
        .post(
          this.APIMap.get("query"),
          qs.stringify({
            file_ids: Array.isArray(ids) ? ids.join(",") : ids
          })
        )
        .then(res => {
          const data = res.data;
          if (data.file_info) {
            if (!Array.isArray(data.file_info)) {
              console.error(data.file_info);
              vm.$message({
                type: "error",
                message: data.info
              });
              return false;
            }
            //TODO:
            //validate type and validate number and validate size
            if (data.file_info.length + vm.addedNum > vm.limitNum) {
              // vm.$message({
              //   type: "error",
              //   message: `最多只能上传${vm.limitNum}，当前文件个数为${data
              //     .file_info.length + vm.addedNum}`
              // });
              // vm.$emit("errorFn", {
              //   error: "exceeded the limit",
              //   arguments: {
              //     limitNum: vm.limitNum,
              //     uploadedNum: vm.addedNum,
              //     existedNum: data.file_info.length
              //   }
              // });
            }
            const _idsArr = [];
            data.file_info.forEach(file => {
              file._fileId = file.id;
              // file._type = vm.typeFilter(file.extension);
              const extension = getExtension(file.oldName);
              file.type = extension2Type(extension);
              file._name = file.oldName;
              vm.$set(file, "dialogVisible", false);
              _idsArr.push(file._fileId);
            });
            if (willReplace) {
              vm.uploadedIds = [];
              vm.uploadedFiles = [];
            }
            vm.uploadedIds = vm.uploadedIds.concat(_idsArr);
            vm.uploadedFiles = vm.uploadedFiles.concat(data.file_info);
            this.existedFiles = data.file_info;
          } else {
            vm.$message({
              type: "error",
              message: data.info
            });
          }
        });
    },
    getFilesNum() {
      const vm = this;
      return {
        limitNum: vm.limitNum,
        uploadedNum: vm.uploadedFiles.length,
        existedNum: vm.existedFiles.length,
        waitingNum: vm.waitingNum
      };
    }
  },
  watch: {
    uploadedIds: function(val) {
      let vm = this;
      this.$emit("listChange", val, vm.uploadedFiles);
    },
    fileIds(val) {
      this.loadFiles(this._fileIds);
    },
    docURL(value) {
      const uploadAPI = this.APIMap.get("upload");
      this.$refs.uploader.uploader.opts.target = uploadAPI;
    }
  }
};
</script>
<style lang="scss">
$background-blue: #409eff;
$background-green: #67c23a;
$light-blue: #f5f7fa;
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    font-size: 0;
    height: 1px;
    clear: both;
  }
}
.upload {
  * {
    box-sizing: border-box;
  }
  .upload-drop {
    background: #fff;
    text-align: center;
    margin: 10px 0;
    i {
      font-size: 20px;
    }
  }
  .upload-btns {
    margin: 10px 0;
    .uploader-btn {
      color: #fff;
    }
    .add-file {
      background: $background-blue;
      border-color: $background-blue;
    }
    .start-upload {
      background: $background-green;
      border-color: $background-green;
    }
  }
  .file {
    @include clearfix;
    &:hover {
      background: $light-blue;
    }
    > div[class^="file"] {
      float: left;
      text-align: center;
    }
    .file-name {
      width: 45%;
      text-align: left !important;
      padding-left: 10px;
      > i {
        margin-right: 5px;
      }
    }
    .file-size,
    .file-status {
      width: 10%;
    }
    .file-finished {
      width: 30%;
    }
    .file-progress {
      width: 20%;
      .file-progress-wrap {
        position: relative;
        width: 100%;
        height: 20px;
        border-radius: 10px;
        background: #c5c5c5;
        overflow: hidden;
        .file-progress-current {
          transition: width 0.3s linear 0s;
          height: 100%;
          background: #409eff;
          &.success {
            background: #67c23a;
          }
          &.error {
            background: #f56c6c;
          }
        }
        .file-progress-number {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
          text-align: center;
          line-height: 20px;
          color: #fff;
        }
      }
    }
    .file-actions {
      width: 15%;
      a {
        font-size: 16px;
        color: #797979;
        margin-right: 5px;
        &:hover {
          color: darken($color: #797979, $amount: 30%);
        }
      }
    }
  }
}

.uploader-file,
.file {
  position: relative;
  border-bottom: 1px solid #cdcdcd;
  height: auto !important;
  line-height: normal !important;
  padding: 10px 0;
  overflow: hidden;
}
.hide {
  display: none;
}
.tips {
  font-size: 14px;
  color: #bbb;
}
.preview-image {
  width: 100%;
}
</style>
