<template>
  <section class="text__overflow">
    <el-tooltip
      class="text__overflow--tooltip"
      v-bind="attrs"
      :disabled="disabled || tooltipHidden"
      :content="content"
      popper-class="text__overflow--max-width"
    >
      <p class="text__overflow__text">
        <span
          ref="textRef"
          class="text__overflow__text--inner"
          @mouseover="handleMouseOver"
        >
          {{ content || '-' }}
        </span>
        <slot />
      </p>
    </el-tooltip>
  </section>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    content: string;
    disabled?: boolean;
  }>(),
  {
    content: '',
    disabled: false,
  }
);

const attrs = useAttrs();
const tooltipHidden = ref(true);
const textRef = ref<HTMLElement>();

const handleMouseOver = () => {
  if (typeof textRef.value === 'undefined') return;
  const contentWidth = textRef.value?.offsetWidth || 0;
  const parentWidth = textRef.value.parentElement?.offsetWidth || 0;
  tooltipHidden.value = contentWidth <= parentWidth;
};
</script>
<style lang="less" scoped>
.text__overflow {
  flex: 1;
  &:extend(.omit);
  &__text {
    flex: 1;
    &:extend(.omit);
    &--inner {
      cursor: pointer;
    }
  }
}
</style>
<style lang="less">
.text__overflow--max-width {
  max-width: 300px;
}
</style>
