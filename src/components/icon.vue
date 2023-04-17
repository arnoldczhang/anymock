<template>
  <el-icon v-bind="attrs" :size="size">
    <component :is="props.icon" />
  </el-icon>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: number;
    icon: string;
  }>(),
  {
    size: 20,
    icon: '',
  }
);

const attrs = useAttrs();
</script>
