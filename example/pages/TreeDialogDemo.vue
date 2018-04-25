<template>
<div>
  <tree-dialog 
    ref="test"
    class="list-query el-input el-input--small"
    inputClass="el-input__inner"
    :single-check="true"
    :props="props"
    :data="testData"
    :init="initData"
    @node-click="handleNodeClick"
    @check-node="checkNode"
    @cacel-check="cancelCheck"
    @set-result="setResult">
   </tree-dialog>
   <tree-dialog 
    ref="test2"
    class="list-query el-input el-input--small"
    inputClass="el-input__inner"
    :single-check="false"
    :props="props"
    :data="testData"
    :init="initData2">
   </tree-dialog>
   <button type="button" @click="clear">清空</button>
   <button type="button" @click="changeInit">changeInit</button>
   <button type="button" @click="changeInit">changeInit2</button>
</div>
</template>

<script>
import axios from "axios";
import { list2tree } from "../js/utils.js";
export default {
  data() {
    return {
      testData: [],
      initData: {
        key: "title",
        value: []
      },
      initData2: {
        key: "id",
        value: []
      },
      props: {
        label: "title",
        disabled: "disabled"
      },
      willSetResult: true
    };
  },
  mounted() {
    setTimeout(() => {
      this.testData = [
        {
          id: 1,
          title: "一级 1",
          children: [
            {
              id: 4,
              title: "二级 1-1",
              children: [
                {
                  id: 9,
                  title: "三级 1-1-1"
                },
                {
                  id: 10,
                  title: "三级 1-1-2"
                }
              ]
            }
          ]
        },
        {
          id: 2,
          title: "一级 2",
          children: [
            {
              id: 5,
              title: "二级 2-1",
              disabled: true
            },
            {
              id: 6,
              title: "二级 2-2"
            }
          ]
        },
        {
          id: 3,
          title: "一级 3",
          children: [
            {
              id: 7,
              title: "二级 3-1"
            },
            {
              id: 8,
              title: "二级 3-2"
            }
          ]
        }
      ];
    }, 400);
    // this.$refs.test.setWillOpen(false);
    // axios.post("/api/teammanagerunit/query").then(res => {
    //   this.testData = list2tree(res.data.data, "id", "unitSubjectionParentId");
    // });
    // this.changeInit();
  },
  methods: {
    setResult(result) {
      console.log(result);
    },
    clear() {
      this.$refs.test.clear();
    },
    checkNode(node) {
      if (node.id === 10) {
        this.willSetResult = false;
      }
    },
    cancelCheck(node) {
      if (node.id === 10) {
        this.willSetResult = true;
      }
    },
    changeInit() {
      // axios.post("/api/userdiscipline/queryExport").then(res => {
      //   const initValue = res.data.data.map(ele => ele.disciplineApprovalUnit);
      //   // this.initData = {
      //   //   key:"disciplineApprovalUnit",
      //   //   value:initValue
      //   // };
      // });
      this.initData.value = ["一级 2", "一级 2", "一级 2"];
    },
    handleNodeClick(node) {
      this.initData2.value = [node.id];
    }
  }
};
</script>

<style>

</style>
