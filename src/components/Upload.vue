<template>
  <uploader ref="uploader" @file-added="fileAdded" :options="optionsPlugin" :autoStart="autoStart" class="upload">
    <uploader-unsupport>不支持您当前使用的浏览器，请使用更高版本的浏览器或其他浏览器</uploader-unsupport>
    <uploader-drop class="upload-drop" v-if="isDrop && canUpload">
      <p><i class="fa fa-cloud-upload"></i></p>
      <p>将文件拖到此处</p>
    </uploader-drop>
    <div class="upload-btns" v-if="canUpload">
        <uploader-btn type="button" class="add-file" :attrs="attrs">选取文件</uploader-btn>
        <button type="button" v-if="!autoStart" class="uploader-btn start-upload" @click="upload">开始上传</button>
    </div>
    <div class="tips" v-if="isIE10Plus">IE浏览器不支持上传空文件以及名字为“.”的文件</div>
    <!-- 已上传文件列表Start -->
    <template>
      <div class="existed-file-list" v-for="file in existedFiles" :key="file.id">
        <slot :file="file" name="existed-file">
          <file :file="file" :docURL="docURL" @delete-file="deleteFile(file,true)" @preview-image="previewImg">
            <template slot="file-actions-slot" slot-scope="scope">
              <slot name="file-actions-slot" :file="file"></slot>
              <slot name="existed-file-actions-slot" :file="file"></slot>
              <slot name="uploaded-file-actions-slot" :file="file"></slot>
            </template>
          </file>
        </slot>
      </div>
    </template>
    <!-- 已上传文件列表End -->
    <uploader-list>
        <template slot-scope="scope"> 
          <uploader-file v-for="file in scope.fileList" :key="file.id" :list="true" :file="file">
              <template slot-scope="uploadFile">
                <slot :file="uploadFile" name="upload-file">
                    <file :isExisted="false" :file="uploadFile.file" :uploadFile="uploadFile" 
                      :docURL="docURL" :canUpload="canUpload" @delete-file="deleteFile(uploadFile,false)"
                       @preview-image="previewImg">
                      <template slot="file-actions-slot">
                        <slot name="file-actions-slot" :file="file"></slot>
                        <slot v-if="uploadFile.status === 'success'" name="uploaded-file-actions-slot" :uploadFile="uploadFile" :file="scope.file"></slot>
                        <slot v-if="uploadFile.status === 'waiting'" name="waiting-upload-file-actions-slot" :uploadFile="uploadFile" :file="scope.file"></slot>
                        <slot v-if="uploadFile.status === 'success'" name="existed-file-actions-slot" :file="file"></slot>
                      </template>
                    </file>
                </slot>
              </template>
          </uploader-file>
        </template>
    </uploader-list>
    <!-- 图片预览Start -->
    <el-dialog class="preview" :visible.sync="dialogVisible" :append-to-body="isInDialog" @close="dialogClose">
      <img :src="docURL + previewImageUrl" class="preview-image" />
    </el-dialog>
    <!-- 图片预览End -->
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
import File from "../components/File";
import url from "url";
/**
 * 文件列表类
 * @class
 */
class FileList {
  /**
   * @param {string} idKey 唯一标识符属性名
   */
  constructor(idKey = "_fileId") {
    this.idKey = idKey;
    this.list = [];
    this.idList = [];
  }
  /**
   * 新增（多个）文件至文件列表
   * @param {object | array} file 要新增的文件(列表)
   */
  add(file) {
    /**
     * 新增单个文件至文件列表
     * @param {object} item 要新增的文件
     */
    function addItem(item) {
      const id = item[this.idKey];
      if (!this.hasFile(item)) {
        this.list.push(item);
        this.idList.push(id);
      }
    }
    if (Array.isArray(file)) {
      file.forEach(item => addItem.call(this, item));
    } else {
      addItem.call(this, file);
    }
  }
  /**
   * 从文件列表中删除（多个）文件
   * @param {object|array} file 要删除的文件(列表)
   */
  remove(file) {
    function removeItem(item) {
      const id = item[this.idKey];
      if (this.hasFile(item)) {
        const index = this.idList.indexOf(id);
        this.list.splice(index, 1);
        this.idList.splice(index, 1);
      }
    }
    if (Array.isArray(file)) {
      file.forEach(item => removeItem.call(this, item));
    } else {
      removeItem.call(this, file);
    }
  }
  /**
   * 判断文件列表是否有该文件
   * @param {object} file 要判断的文件
   */
  hasFile(file) {
    const id = file[this.idKey];
    return this.idList.indexOf(id) > -1;
  }
  /**
   * 重置文件列表
   */
  clear() {
    this.list = [];
    this.idList = [];
  }
  getLenth() {
    return this.list.length;
  }
}

/**
 * 统计上传组件目前有多少文件已添加、已上传、待上传等数量
 * @class
 */
class UploadNumber {
  constructor() {
    //已添加文件数量（包含已上传文件）
    this.addedNum = 0;
    //待上传文件数量（点击选取文件按钮后）
    this.waitingNum = 0;
  }
  /**
   * 批量添加文件
   * @param {number} number 批量添加的文件数量
   */
  addFiles(number) {
    this.addedNum += number;
  }
  /**
   * 单一添加文件
   * @param {boolean} isWaitingFile 该文件是否未待上传文件
   */
  addFile(isWaitingFile = false) {
    this.addedNum++;
    if (isWaitingFile) {
      this.waitingNum++;
    }
  }
  /**
   * 单一移除文件
   * @param {boolean} isWaitingFile 该文件是否是待上传文件
   */
  removeFile(isWaitingFile = false) {
    this.addedNum--;
    if (isWaitingFile) {
      this.waitingNum--;
    }
  }
  /**
   * 批量上传文件
   */
  uploadFiles() {
    this.waitingNum = 0;
  }
  /**
   * 重置附件列表
   */
  clear() {
    this.addedNum = 0;
    this.waitingNum = 0;
  }
}

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
    this.loadFiles(this.fileIdsString);
  },
  mounted() {
    const uploader = this.uploader;
    const vm = this;
    uploader.on("fileSuccess", function(rootFile, file, message, chunk) {
      if (JSON.parse(message).now_id) {
        vm.$set(file, "_fileId", JSON.parse(message).now_id);
        vm.$set(file, "_fileUrl", JSON.parse(message).now_url);
        vm.uploadedFileMap.add(file);
        vm.uploadNumberMap.removeFile(true);
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
      type: [Array, String],
      default: () => []
    },
    //限定文件个数
    limitNum: {
      type: Number
    },
    //限制文件大小，单位为KB
    limitSize: {
      type: Number
    },
    //是否仅从视图删除
    willDelByView: {
      type: Boolean,
      default: false
    },
    //是否自动上传
    autoStart: {
      type: Boolean,
      default: false
    },
    //是否在弹窗中，旨在解决上传组件因在弹窗中而导致的图片预览不正常的情况
    isInDialog: {
      type: Boolean,
      default: false
    },
    //唯一标识符，解决多个upload组件下listChange事件无法获知哪个组件的问题
    identifier: {
      type: [String, Number],
      default: "Upload"
    }
  },
  data() {
    return {
      existedFileList: new FileList(),
      attrs: {
        accept: this.types
      },
      involveTypes: [], //大类，即包含*的类型
      specificTypes: [], //具体类型，即不含*的类型
      expectExtensions: [], //期望文件后缀名
      uploadedFileMap: new FileList(),
      uploadNumberMap: new UploadNumber(),
      isIE10Plus: (() => window.navigator.msPointerEnabled)(), //是否是IE10以上的浏览器
      deletedFromViewIdsCache: [], //从视图删除的id缓存集合
      previewImageUrl: "",
      dialogVisible: false
    };
  },
  computed: {
    uploader() {
      return this.$refs.uploader.uploader;
    },
    expectTypes() {
      return Array.isArray(this.types) ? this.types : [this.types];
    },
    fileIdsString() {
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
    },
    //初始化文件列表
    existedFiles() {
      return this.existedFileList.list;
    },
    addedNum() {
      return this.uploadNumberMap.addedNum;
    },
    waitingNum() {
      return this.uploadNumberMap.waitingNum;
    },
    //已上传文件id列表
    uploadedIds() {
      return this.uploadedFileMap.idList;
    },
    //已上传文件列表
    uploadedFiles() {
      return this.uploadedFileMap.list;
    } //已上传文件列表
  },
  methods: {
    upload() {
      this.uploader.upload();
    },
    /**
     * 发送删除请求删除指定id文件
     * @param ids {object} 要删除的文件的唯一标识符
     */
    postDeleteRequest(ids) {
      return new Promise((resolve, reject) => {
        axios
          .post(
            this.APIMap.get("delete"),
            qs.stringify({
              ids: Array.isArray(ids) ? ids.join(",") : ids
            })
          )
          .then(res => {
            resolve(res.data);
          })
          .catch(err => {
            reject(err);
            console.error(err);
          });
      });
    },
    //TODO: 待测试deleteFilesNotInView
    /**
     * 从服务器删除已在视图删除的文件
     */
    deleteFilesNotInView() {
      return this.postDeleteRequest(this.deletedFromViewIdsCache);
    },
    /**
     * 从simple-uploaer组件的附件列表中删除附件
     * @param {object} fileSlot  附件
     * @param {boolean} isExistedFile 该附件是否是原有附件（即非此次上传的）
     */
    deleteFile(fileSlot, isExistedFile = false) {
      const vm = this;
      const uploader = this.uploader;
      const file = isExistedFile ? fileSlot : fileSlot.file;
      /**
       * 从uploadedIds及uploadedFiles数组中删除文件id，此操作仅为视图层面的删除，不与后台、数据库交互
       * @param {string} fileId 要删除的文件id
       */
      function deleteFromUploadedList(fileId) {
        function delEleByFileIdFromArr(arr, id) {
          arr.forEach((ele, index) => {
            if (ele._fileId === id) {
              arr.splice(index, 1);
            }
          });
        }
        const vm = this;
        let uploaderFileList = vm.uploader.fileList;
        let uploaderFiles = vm.uploader.files;
        delEleByFileIdFromArr(uploaderFileList, fileId);
        delEleByFileIdFromArr(uploaderFiles, fileId);
        this.uploadedFileMap.remove(file);
      }
      /**
       * 从视图中删除附件
       * @param {object} file 要删除的文件
       * @param {boolean} isUploaded 该文件是否已经上传完成
       */
      function deleteFromView(file, isUploaded = true) {
        vm.uploadNumberMap.removeFile(isUploaded);
        deleteFromUploadedList.call(vm, file._fileId);
        if (isExistedFile) {
          this.existedFileList.remove(file);
        } else {
          uploader.removeFile(file);
        }
        vm.$message({ message: "删除成功", type: "success" });
      }
      /**
       * 发送删除请求删除指定文件
       * @param file {object} 要删除的文件
       * @return {object} Promise
       */
      function deleteFileAsync(file) {
        return new Promise((resolve, reject) => {
          vm
            .postDeleteRequest(file._fileId)
            .then(data => {
              if (data === file._fileId) {
                resolve(file);
              } else {
                this.$message({
                  type: "info",
                  message: "删除失败"
                });
                reject(data);
              }
            })
            .catch(err => {
              this.$message({
                type: "info",
                message: "删除失败"
              });
              reject(err);
              console.error(err);
            });
        });
      }
      this.$emit("click-delete-btn", this.identifier);
      this.$confirm("是否删除该附件", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          //如果是已经上传完成的文件
          if (
            isExistedFile ||
            (typeof file.isComplete === "function" && file.isComplete())
          ) {
            //如果是仅从视图删除文件模式
            if (this.willDelByView) {
              deleteFromView(file);
              this.deletedFromViewIdsCache.push(file._fileId);
              this.$emit(
                "after-delete-confirm",
                true,
                file._fileId,
                this.identifier
              );
            } else {
              deleteFileAsync(file).then(file => {
                deleteFromView(file);
                this.$emit(
                  "after-delete-confirm",
                  true,
                  file._fileId,
                  this.identifier
                );
              });
            }
          } else {
            deleteFromView(file, false);
            this.$emit(
              "after-delete-confirm",
              true,
              file._fileId,
              this.identifier
            );
          }
        })
        .catch(() =>
          this.$emit(
            "after-delete-confirm",
            false,
            file._fileId,
            this.identifier
          )
        );
    },
    pause(fileSlot) {
      fileSlot.file.pause();
    },
    /**
     * 预览simple-upload组件中的图片预览操作
     * @param file {object} 文件
     */
    previewImg(file) {
      this.previewImageUrl = file.docUrl;
      const previewImage = this.$el.querySelector(".preview-image");
      if (previewImage !== null) {
        //避免弹窗打开时图片仍然是上次预览的图片
        this.$el.querySelector(".preview-image").onload = () => {
          this.dialogVisible = true;
        };
      } else {
        this.dialogVisible = true;
      }
    },
    /**
     * 弹窗关闭时的回调函数
     */
    dialogClose() {
      this.dialogVisible = false;
    },
    /**
     * 选取文件后的回调方法
     * @param {object} file 所选取的文件
     */
    fileAdded(file) {
      const vm = this;
      /**
       * 类型判断
       * @function
       * @param {object} file 需要判断的文件
       * @return {boolean}
       */
      const validateType = file => {
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
      };
      /**
       * 文件大小判断
       * @function
       * @param {object} file 需要判断的文件
       * @return {boolean}
       */
      const validateSize = file => {
        if (
          typeof this.limitSize !== "undefined" &&
          !Number.isNaN(this.limitSize)
        ) {
          return file.size / 1024 < this.limitSize;
        } else {
          return true;
        }
      };
      const validateTypeResult = validateType(file);
      const validateSizeResult = validateSize(file);
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
      //类型、大小校验通过后
      if (this.limitNum > 0 && this.limitNum < this.addedNum + 1) {
        this.$message({
          type: "error",
          message: `最多只能上传${this.limitNum}个文件`
        });
        this.$nextTick(() => {
          this.uploader.removeFile(file);
        });
        return false;
      }
      this.uploadNumberMap.addFile(true);
    },
    /**加载文件
     * @param {string | array} ids 需要加载的文件ids数组
     * @param {boolean} willReplace 是否替换已有文件,默认为false
     */
    loadFiles(ids, willReplace = false) {
      if (ids === "") {
        this.existedFileList.clear();
        return false;
      }
      if (this.docURL.length === 0) {
        return false;
      }
      const vm = this;
      let willLoadIds = [];
      const uploadedIds = this.uploadedIds;
      const _ids = Array.isArray(ids) ? ids : ids.split(",");
      //避免重复加载已上传的文件
      _ids.forEach(id => {
        if (uploadedIds.indexOf(id) === -1) {
          willLoadIds.push(id);
        }
      });
      if (willLoadIds.length === 0) {
        return;
      }
      axios
        .post(
          this.APIMap.get("query"),
          qs.stringify({
            file_ids: willLoadIds.join(",")
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
            //validate type and validate size
            if (data.file_info.length + vm.addedNum > vm.limitNum) {
              vm.$message({
                type: "error",
                message: `最多只能上传${vm.limitNum}，当前文件个数为${data
                  .file_info.length + vm.addedNum}`
              });
            }
            data.file_info.forEach(file => {
              file._fileId = file.id;
              const extension = getExtension(file.oldName);
              file.extension = extension;
              file.type = extension2Type(extension);
              file._name = file.oldName;
            });
            if (willReplace) {
              this.uploadedFileMap.clear();
            }
            this.uploadNumberMap.addFiles(data.file_info.length);
            this.uploadedFileMap.add(data.file_info);
            this.existedFileList.add(data.file_info);
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
        uploadedNum: this.uploadedFileMap.getLenth(),
        existedNum: this.existedFileList.getLenth(),
        waitingNum: vm.waitingNum
      };
    },
    /**
     * 重置组件
     * @param delFromServer {Boolean} 是否从服务器删除已上传的附件
     */
    resetUpload(delFromServer = false) {
      if (delFromServer) {
        this.postDeleteRequest(this.uploadedIds);
      }
      this.uploader.fileList = [];
      this.uploader.files = [];
      this.$refs.uploader.fileList = [];
      this.uploadedFileMap.clear();
      this.existedFileList.clear();
      this.uploadNumberMap.clear();
    }
  },
  watch: {
    uploadedIds: function(val) {
      this.$emit("listChange", val, this.uploadedFiles, this.identifier);
    },
    fileIds(val) {
      this.loadFiles(this.fileIdsString);
    },
    docURL(value, oldVal) {
      if (typeof value === "undefined" || typeof oldVal === "undefined") {
        return false;
      }
      const uploadAPI = this.APIMap.get("upload");
      this.$refs.uploader.uploader.opts.target = uploadAPI;
      if (value.length !== 0 && oldVal.length === 0) {
        this.loadFiles(this.fileIdsString);
      }
    },
    dialogVisible(value) {
      if (value) {
        this.$emit("dialog-toggle", true, this.identifier);
        this.$emit("dialog-open", this.identifier);
      } else {
        this.$emit("dialog-toggle", false, this.identifier);
        this.$emit("dialog-close", this.identifier);
      }
    }
  },
  components: {
    File
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
  .uploader-file {
    border-bottom: none !important;
  }
  .file {
    @include clearfix;
    position: relative;
    border-bottom: 1px solid #cdcdcd;
    height: auto !important;
    line-height: normal !important;
    padding: 10px 0;
    overflow: hidden;
    &:hover {
      background: $light-blue;
    }
    > div[class^="file"] {
      float: left;
      text-align: center;
    }
    &-name {
      width: 45%;
      text-align: left !important;
      padding-left: 10px;
      > i {
        margin-right: 5px;
      }
    }
    &-size,
    &-status {
      width: 10%;
    }
    &-finished {
      width: 30%;
    }
    &-progress {
      width: 20%;
      &-wrap {
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
    &-actions {
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
