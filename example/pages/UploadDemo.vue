<template>
  <div>
    <el-button @click="changeFileIds">changeFileIds</el-button>
    <el-button @click="delFiles">delFiles</el-button>
    <el-button @click="reset">resetUpload</el-button>
    <upload ref="upload" :isDrop="false" :docURL="docURL" :fileIds="fileIds"  :options="options" :types="['image/*']"
          @listChange="listChange" @click-delete-btn="clickDeleteBtn" 
          @after-delete-confirm="afterDeleteConfirm" @dialog-toggle="dialogToggle">
      <template slot="file-actions-slot" slot-scope="props">
        <a src="javascript:void(0);" @click="view(props.file)">查看</a>
      </template>
    </upload>
  </div>
</template>

<script>
export default {
  mounted() {
    setTimeout(() => {
      this.docURL = "http://d.test.app.pubob.ob.io/";
    }, 1000);
    setTimeout(() => {
      this.fileIds = ["comm0000f37a1756f81d4e20bbf8287d3e6897c8","comm0000f72d8c6b96484cbe9b6859f82fbf1000"];
    }, 3000);
  },
  data() {
    return {
      fileIds: [],
      docURL: "",
      options: {
        chunkSize: 2 * 1024
      }
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
    delFiles() {
      this.$refs.upload.postDeleteRequest([
        "comm00008a2de756dd284e959d98bfe065a50426"
      ]);
    },
    reset(){
      this.$refs.upload.resetUpload();
    },
    clickDeleteBtn(){
      console.log("sss");
    },
    afterDeleteConfirm(){
      console.log("ss");
    },
    dialogToggle(status){
      console.log(status);
    }
  }
};
</script>

<style>
</style>
