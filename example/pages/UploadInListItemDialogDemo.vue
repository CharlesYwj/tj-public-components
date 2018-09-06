<template>
    <div>
        <ul>
            <li v-for="(item, index) in idsList" :key="index">
                {{index + 1}}.<a href="javascript:void(0);" @click="openDialog(item)">上传组件</a>
                <el-dialog :visible.sync="item.dialogVisible">
                    <upload @listChange="listChange" :fileIds="item.ids" :identifier="index" :isInDialog="true"></upload>
                </el-dialog>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  data() {
    return {
      idsList: [
        {
          ids: [
            "comm0000f37a1756f81d4e20bbf8287d3e6897c8",
            "comm0000f72d8c6b96484cbe9b6859f82fbf1000"
          ],
          dialogVisible: false
        },
        {
          ids: ["comm0000f72d8c6b96484cbe9b6859f82fbf1000"],
          dialogVisible: false
        },
        {
          ids: ["comm0000f37a1756f81d4e20bbf8287d3e6897c8"],
          dialogVisible: false
        },
        {
          ids: ["comm0000916c671ee9c64c6aa3e776da48e1d9f4"],
          dialogVisible: false
        }
      ]
    };
  },
  methods: {
    openDialog(item) {
      item.dialogVisible = true;
    },
    listChange(ids, files, identifier) {
      this.idsList[identifier].ids = ids;
    }
  }
};
</script>

<style>
</style>
