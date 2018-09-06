<template>
  <Upload :canUpload="false" :fileIds="fileIds" :docURL="docURL">
    <template v-if="Object.keys($slots).length>0" slot="existed-file" slot-scope="scope">
      <slot name="download-file" :file="scope.file"></slot>
    </template>
    <template slot="file-actions-slot" slot-scope="scope">
      <slot name="file-actions-slot" :file="scope.file"></slot>
    </template>
  </Upload>
</template>

<script>
import Upload from "../components/Upload";
export default {
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
  components: {
    Upload
  }
};
</script>

<style lang="scss">

</style>
