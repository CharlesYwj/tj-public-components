<template>
  <div>
      <input   
        :value="currentValue"
        :class="[{disabled:!selectNotExist},inputClass]" 
        :readonly="!selectNotExist"
        class="result-input"
        @click="handleClickInput" />
      <el-dialog
        :visible.sync="dialogVisible" 
        :title="dialogTitle"
        :custom-class	="dialogClass"
        :width="dialogWidth"
        :fullscreen="fullscreen"
        :append-to-body="appendToBody"
        @open="dialogOpen"
        @close="dialogClose"
        >
        <input 
          v-if="willSearch"
          class="el-input__inner pt10 pb10"
          @keyup.enter="handleEnter"
          v-model="filterText"
          autocomplete="off" 
          placeholder="输入关键字进行过滤" 
          type="text" 
          rows="2" 
          validateevent="true">
        <el-tree
            class="filter-tree"
            :data="data"
            :props="defaultProps"
            :check-strictly="checkStrictly"
            :filter-node-method="filterNode"
            :default-expand-all ="defaultExpandAll"
            :accordion = "accordion"
            :show-checkbox="showCheckbox"
            :node-key="nodeKey"
            :ref="'tree'+randomID"
            :default-checked-keys="defaultCheckedArr"
            :default-expanded-keys="defaultCheckedArr"
            @check-change="checkChange"
            @check="check"
            @node-click="hadleNodeClick"
            @node-expand="nodeExpand"
            @node-collapse="nodeCollapse">
        </el-tree>
        <template v-if="!singleCheck">
          <div>
            <span>已选择：{{selectedShow}}</span>
          </div>
          <div class="clearfix" slot="footer">
            <el-button type="primary" :disabled="!willSetResult" @click="setResult">确定</el-button>
            <el-button @click="clearSelected">清空</el-button>
          </div>
        </template>
      </el-dialog>
  </div>
</template>

<script>
function checkNodeExist(node, list, idKey) {
  const idArr = list.map(ele => ele[idKey]);
  return idArr.indexOf(node[idKey]) !== -1;
}
function arrayPushUniqueNode(node, list, idKey) {
  if (!checkNodeExist(node, list, idKey)) {
    list.push(node);
  }
}
function arrayPushAllChildren(node, list, idKey, childrenKey) {
  if (Array.isArray(node)) {
    node.forEach(ele => arrayPushNode(ele));
  } else {
    arrayPushNode(node);
  }
  function arrayPushNode(_node) {
    arrayPushUniqueNode(_node, list, idKey);
    if (_node[childrenKey] && _node[childrenKey].length > 0) {
      arrayPushAllChildren(_node[childrenKey], list, idKey, childrenKey);
    }
  }
}
export default {
  created() {
    this.initNodes();
  },
  props: {
    //compoent's props
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    willSearch: {
      type: Boolean,
      default: true
    },
    willSetResult: {
      type: Boolean,
      default: true
    },
    //tree's prop
    props: {
      default: () => {},
      type: Object
    },
    singleCheck: {
      type: Boolean,
      default: true
    },
    selectNotExist: {
      type: Boolean,
      default: false
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    accordion: {
      type: Boolean,
      default: false
    },
    nodeKey: {
      type: String,
      default: "id"
    },
    init: {
      type: Object
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    leafonly: {
      type: Boolean,
      default: false
    },
    //input's prop
    inputClass: {
      type: String,
      default: ""
    },
    //dialog's prop
    dialogTitle: {
      type: String,
      default: "请选择"
    },
    dialogClass: {
      type: String,
      default: ""
    },
    dialogWidth: {
      type: [Number, String]
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    willOpen: {
      type: Boolean,
      default: true
    },
    checkedWithLeaf: {
      type: Boolean,
      default: false
    },
    chekedWithAllLeaves: {
      type: Boolean,
      default: false
    },
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentValue: "",
      randomID: (() => {
        return Math.random()
          .toString(16)
          .slice(2);
      })(),
      filterText: "",
      selectedTempArr: [],
      selectedArr: [],
      defaultCheckedArr: [],
      dialogVisible: false,
      willOpenPrivate: true,
      initFinish: false,
      checkedKeysArr: []
    };
  },
  computed: {
    defaultProps() {
      return Object.assign(
        {},
        {
          children: "children",
          label: "label"
        },
        this.props
      );
    },
    selectedShow() {
      const _temp = [];
      const label = this.defaultProps.label;
      this.selectedTempArr.forEach(ele => {
        _temp.push(ele[label]);
      });
      return _temp.join(",");
    },
    showCheckbox() {
      return !this.singleCheck;
    }
  },
  methods: {
    initNodes() {
      if (!this.init || !this.init.value || this.init.value.length === 0) {
        return false;
      }
      const vm = this;
      const initData = Array.isArray(this.init.value)
        ? this.init.value
        : this.init.value.split(",");
      const initKey = this.init.key;
      const childrenKey = this.defaultProps.children;
      this.selectedArr = [];

      function setChecked(list, setParentChecked = false) {
        list.forEach(ele => {
          if (initData.indexOf(ele[initKey]) > -1) {
            if (!checkNodeExist(ele, vm.selectedArr, vm.nodeKey)) {
              vm.selectedArr.push(ele);
            }
          }
          if (ele[childrenKey] && ele[childrenKey].length > 0) {
            if (vm.checkStrictly) {
              ele._checkedChild = false;
            }
            ele.opened = false;
            if (setParentChecked) {
              ele.parentChecked = false;
            }
            setChecked(ele[childrenKey], true);
          }
        });
      }
      setChecked(this.data);
      this.initFinish = initData.length === 0;
      this.setValueToInput(this.selectedArr);
    },
    traverse(nodes, callback, includeNodes = true) {
      // const idKey = this.defaultProps.nodeKey;
      const childrenKey = this.defaultProps.children;
      function nodeCallback(node) {
        if (includeNodes) {
          callback(node);
        }
        if (node[childrenKey] && node[childrenKey].length > 0) {
          this.traverse(node[childrenKey], callback, includeNodes);
        }
      }
      if (Array.isArray(nodes)) {
        nodes.forEach(ele => {
          nodeCallback.call(this, ele);
        });
      } else {
        nodeCallback.call(this, nodes);
      }
    },
    hadleNodeClick(element, node, component) {
      if (this.singleCheck) {
        if (this.leafonly) {
          if (
            element[this.defaultProps.children] &&
            element[this.defaultProps.children].length > 0
          ) {
            return false;
          }
        }
        this.setValueToInput(element);
        this.$emit("change", element);
        this.dialogVisible = false;
      }
      this.$emit("node-click", ...arguments);
    },
    handleClickInput() {
      if (this.willOpen && this.willOpenPrivate) {
        this.dialogVisible = true;
      }
    },
    handleEnter() {
      if (this.selectNotExist) {
        this.currentValue = this.filterText;
        this.dialogVisible = false;
        this.filterText = "";
        this.$emit("handle-enter", this.filterText);
      }
    },
    checkChange(element, isChecked, childChecked) {
      const nodeKey = this.nodeKey;
      const childrenKey = this.defaultProps.children;
      if (isChecked) {
        if (element[childrenKey] && element[childrenKey].length > 0) {
          if (this.leafonly) {
            return false;
          }
          //当树初始化后，父子节点不严密关联但父节点可通过勾选影响子节点勾选状态时
          if (this.checkStrictly && this.checkedWithLeaf && this.initFinish) {
            const treeRef = this.$refs[`tree${this.randomID}`];
            const checkLeaf = function(node) {
              treeRef.setChecked(node, true);
              if (node[childrenKey] && node[childrenKey].length > 0) {
                node[childrenKey].forEach(ele => {
                  checkLeaf.call(this, ele);
                });
              }
            };
            checkLeaf.call(this, element);
            //treeRef.setCheckedNodes(element[this.defaultProps.children]);
          }
          if (this.chekedWithAllLeaves) {
            this.traverse(element, () => {});
          }
        }
        this.$emit("check-node", element);
        element._checkedChild = true;
        //当父节点未展开过且在父节点勾选影响子节点时
        if (
          !element.opened &&
          (!this.checkStrictly ||
            !(this.checkStrictly && !this.checkedWithLeaf) ||
            (this.checkStrictly && this.checkedWithLeaf && this.initFinish))
        ) {
          arrayPushAllChildren(
            element,
            this.selectedTempArr,
            this.nodeKey,
            this.defaultProps.children
          );
        }
        arrayPushUniqueNode(element, this.selectedTempArr, this.nodeKey);
      } else {
        const remmoveNode = function(array, node) {
          for (let i = 0, len = array.length; i < len; i++) {
            if (array[i][nodeKey] === node[nodeKey]) {
              if (i !== -1) {
                array.splice(i, 1);
                return false;
              }
            }
          }
        };
        const removeNodeDeep = function(array, node) {
          if (Array.isArray(node)) {
            node.forEach(ele => {
              removeNodeDeep.call(this, array, ele);
            });
          } else {
            remmoveNode(array, node);
            if (node[this.defaultProps.children]) {
              removeNodeDeep.call(
                this,
                array,
                node[this.defaultProps.children]
              );
            }
          }
        };
        remmoveNode(this.selectedTempArr, element);
        //当父节点未展开，且父节点取消勾选会影响子节点勾选的情况
        if (!element.opened && !this.checkStrictly) {
          removeNodeDeep.call(this, this.selectedTempArr, element);
        }
        this.$emit("cacel-check", element);
      }
      this.initFinish = true;
      this.$emit("check-change", ...arguments);
    },
    check(node, checkedInfo) {
      const nodeKey = this.nodeKey;
      const isChecked = checkedInfo.checkedKeys.indexOf(node[nodeKey]) > -1;
      const isInCheckedKeysArr =
        this.checkedKeysArr.indexOf(node[nodeKey]) > -1;
      if (isChecked) {
        if (!isInCheckedKeysArr) {
          this.checkedKeysArr.push(node[nodeKey]);
        }
      } else {
        if (isInCheckedKeysArr) {
          const index = this.checkedKeysArr.indexOf(node[nodeKey]);
          this.checkedKeysArr.splice(index, 1);
        } else {
          this.$refs[`tree${this.randomID}`].setChecked(node, true, true);
        }
      }
    },
    nodeExpand(data, node, component) {
      data.opened = true;
      this.$emit("node-expand", ...arguments);
    },
    nodeCollapse(...args) {
      this.$emit("node-collapse", ...args);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.defaultProps.label].indexOf(value) !== -1;
    },
    setValueToInput(value) {
      let result;
      let _tempArr = [];
      if (Array.isArray(value)) {
        value.forEach(ele => {
          _tempArr.push(ele[this.defaultProps.label]);
        });
        result = _tempArr.join(",");
      } else {
        result = value[this.defaultProps.label];
      }
      this.currentValue = result;
    },
    setResult() {
      this.selectedArr = [];
      this.selectedTempArr.forEach(ele => {
        this.selectedArr.push(ele);
      }, this);
      this.setValueToInput(this.selectedArr);
      this.$emit("set-result", this.selectedArr);
      this.dialogVisible = false;
    },
    clearSelected() {
      this.$refs[`tree${this.randomID}`].setCheckedNodes([]);
      this.selectedTempArr = [];
    },
    dialogOpen() {
      const vm = this;
      vm.$nextTick(() => {
        vm.$refs[`tree${vm.randomID}`].setCheckedNodes(vm.selectedArr);
      });
      this.$emit("dialog-open");
      if (!this.init || !this.init.value || this.init.value.length === 0) {
        return;
      }
      // let _initData = Array.isArray(this.init.value)
      //   ? this.init.value
      //   : this.init.value.split(",");
      // if (_initData.length > 0) {
      //   vm.selectedArr.forEach(ele => {
      //     vm.defaultCheckedArr.push(ele);
      //   });
      // }
    },
    dialogClose() {
      this.$nextTick(() => {
        this.$refs[`tree${this.randomID}`].setCheckedNodes(this.selectedArr);
      });
      this.resetSelectedTempArr();
      this.$emit("dialog-close");
    },
    setWillOpen(status) {
      this.willOpenPrivate = status;
    },
    clear() {
      this.selectedArr = [];
      this.setValueToInput(this.selectedArr);
    },
    resetSelectedTempArr() {
      this.selectedTempArr = [];
      this.selectedArr.forEach(ele => {
        this.selectedTempArr.push(ele);
      }, this);
    }
  },
  watch: {
    filterText(val) {
      this.$refs[`tree${this.randomID}`].filter(val);
    },
    selectedArr(val) {
      this.resetSelectedTempArr();
    },
    data(val) {
      this.initNodes();
    },
    init: {
      deep: true,
      handler(val, oldValue) {
        this.initNodes();
      }
    }
  }
};
</script>

<style scoped lang="scss">
.el-dialog__body {
  padding: 20px;
}
.result-input.disabled {
  cursor: not-allowed;
  color: #c0c4cc;
  background: #f5f7fa;
}
</style>
