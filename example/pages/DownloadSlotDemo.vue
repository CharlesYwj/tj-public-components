<template>
  <download :fileIds="['comm00006f5f338f7972446e9f7f07191ce37e84']">
    <template slot="file-actions-slot" slot-scope="scope">
      <a href="javascript:void(0);" @click="open(scope.file)">查看</a>
    </template>
  </download>
</template>

<script>
export default {
  methods:{
    open(){
      console.log(...arguments);
    }
  }
};
</script>

<style lang="scss" scoped>
.pull-left {
  float: left;
}
@for $i from 0 through 20 {
  .percent#{$i * 5} {
    width: $i * 5%;
  }
}
</style>
