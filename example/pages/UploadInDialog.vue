<template>
  <div>
    <el-button @click="changeFileIds">changeFileIds</el-button>
    <el-button @click="resetFileIds">resetFileIds</el-button>
    <el-button @click="showDialog">showDialog</el-button>
    <el-dialog :visible.sync="visible">
        <upload ref="upload" :docURL="docURL" :fileIds="fileIds"  :options="options" @listChange="listChange"></upload>
    </el-dialog>
  </div>
</template>

<script>
export default {
  mounted() {
    setTimeout(() => {
      this.fileIds = ["comm0000cc541ad129914ad7881b914c97e0f6f6"];
      this.docURL = "http://d.test.app.pubob.ob.io/";
    }, 3000);
  },
  data() {
    return {
      fileIds: [],
      docURL: "",
      options: {
        chunkSize: 2 * 1024
      },
      visible: false
    };
  },
  methods: {
    listChange(ids, files) {
      console.log(ids);
    },
    changeFileIds() {
      this.$refs.upload.loadFiles(
        [
          "comm000062b48f3698454515890479d1f3bd2cb2",
          "comm0000cc541ad129914ad7881b914c97e0f6f6",
          "comm00008a2de756dd284e959d98bfe065a50426"
        ],
        true
      );
    },
    view(file) {
      console.log("file", file);
    },
    resetFileIds() {
      this.fileIds = [];
    },
    showDialog() {
      this.visible = true;
    }
  }
};
</script>

<style>
</style>
