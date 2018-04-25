<template>
  <download :fileIds="['comm00006f5f338f7972446e9f7f07191ce37e84']">
      <template slot="download-file" slot-scope="file">
          <div class="pull-left percent60">{{file.file.oldName}}</div>
          <div class="pull-left percent20">已上传</div>
          <div class="pull-left percent20">
              <a href="javascript:void(0);">打开</a>
          </div>
      </template>
  </download>
</template>

<script>
export default {};
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
