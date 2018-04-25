<template>
  <div>
    <el-button @click="changeFileIds">changeFileIds</el-button>
    <upload ref="upload" :docURL="docURL" :fileIds="fileIds"  :options="options" @listChange="listChange">
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
      this.fileIds = ["comm0000cc541ad129914ad7881b914c97e0f6f6"];
      this.docURL = "http://d.test.app.pubob.ob.io/";
    }, 3000);
  },
  data() {
    return {
      fileIds: [],
      docURL:"",
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
          "comm0000cc541ad129914ad7881b914c97e0f6f6"
        ],
        true
      );
    },
    view(file){
      console.log("file",file);
    }
  }
};
</script>

<style>

</style>
