<template>
  <ul class="download-files-list">
      <li class="download-file" v-for="file in files" :key="file.id">
          <slot :file="file" name="download-file">
            <div class="download-file-name">
                <i class="fa" :class="file.oldName | fileExtension | fileIcon"></i>
                {{file.oldName}}
            </div>
            <div class="download-file-size">{{file.docSize}}</div>
            <div class="download-file-actions">
                <a :href="docURL+'/doc/download/'+file.id">
                    <i class="fa fa-download"></i>
                </a>
            </div>
          </slot>
      </li>
  </ul>
</template>

<script>
import axios from "axios";
import qs from "qs";
import { iconFilterMixin } from "../common/mixins";
export default {
  mixins: [iconFilterMixin],
  props: {
    docURL: {
      type: String,
      default: "http://d.test.app.pubob.ob.io"
    },
    fileIds: {
      type: [String, Array],
      required: true
    }
  },
  created() {
    this.loadList();
  },
  data() {
    return {
      files: []
    };
  },
  methods: {
    loadList() {
      const vm = this;
      axios
        .post(
          `${this.docURL}/doc/index`,
          qs.stringify({
            file_ids: Array.isArray(vm.fileIds)
              ? vm.fileIds.join(",")
              : vm.fileIds
          })
        )
        .then(res => {
          const data = res.data;
          if (data.file_info) {
            vm.files = data.file_info;
          }
        });
    }
  },
  filters: {
    extensionFilter(fileName) {
      const extension = fileName.split(".")[fileName.split(".").length - 1];
      return extension;
    }
  },
  watch: {
    fileIds(val) {
      this.loadList();
    }
  }
};
</script>

<style lang="scss">
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    font-size: 0;
    height: 1px;
    clear: both;
  }
}
.download-files-list {
  overflow: hidden;
  text-align: center;
  * {
    box-sizing: border-box;
  }
  .download-file {
    @include clearfix;
    list-style: none;
    margin: 0 -10px;
    padding: 10px;
    border-bottom: 1px solid #cdcdcd;
    &:hover {
      background: #f5f7fa;
    }
    > div[class^="download-file-"] {
      float: left;
      padding: 0 10px;
    }
    .download-file-name {
      width: 60%;
      text-align: left;
    }
    .download-file-size {
      width: 20%;
    }
    .download-file-actions {
      width: 20%;
      a {
        color: #797979;
        &:hover {
          color: #1371bb;
        }
      }
    }
  }
}
</style>
