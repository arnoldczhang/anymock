<template>
  <el-drawer
    title="编辑原始JSON"
    v-model="visible"
    size="87%"
    :close-on-press-escape="false"
    :wrapperClosable="false"
    :before-close="handleClose"
    class="tree__drawer--edit"
  >
    <article class="container">
      <section class="container__main">
        <el-tabs v-model="tab" class="container__main--inner">
          <el-tab-pane label="树型编辑" :name="TAB.tree">
            <el-tree ref="treeRef" node-key="id" class="tree" :data="treeData">
              <template #default="{ node, data }">
                <section class="tree__node">
                  <span class="tree__node--left">
                    <i class="sys-icon-drag" />
                    <label class="node__label" v-if="isNum(data.label)">
                      {{ data.label }}
                    </label>
                    <input-view
                      v-else
                      :model="data.label"
                      class="node__label--editable"
                      @confirm="(label: string) => data.label = label"
                    />
                    ：
                    <label
                      v-if="isObjectOrArray(data)"
                      class="node__value omit"
                    >
                      {{ getDataValue(data) }}
                    </label>
                    <template v-else>
                      <input
                        v-if="isBoolean(data.type)"
                        v-model="data.value"
                        type="checkbox"
                        class="switch ml8"
                      />
                      <input
                        v-else
                        :type="isNumber(data.type) ? 'number' : 'text'"
                        class="input--simple node__value"
                        spellcheck="false"
                        :placeholder="String(data.value)"
                        v-model="data.value"
                      />
                    </template>
                  </span>
                  <span class="tree__node--right">
                    <el-link
                      type="danger"
                      :underline="false"
                      class="link link--danger mr16"
                      icon="Delete"
                      @click.stop="handleDeleteNode(node)"
                    >
                      删除
                    </el-link>
                    <el-link
                      type="success"
                      :underline="false"
                      class="link link--success"
                      icon="CopyDocument"
                      @click.stop="handleCopyNode(node, data)"
                    >
                      克隆
                    </el-link>
                  </span>
                </section>
              </template>
            </el-tree>
          </el-tab-pane>
          <el-tab-pane label="纯json编辑" :name="TAB.json">
            <JsonEditor v-model="jsonstr" class="json" />
          </el-tab-pane>
        </el-tabs>
      </section>
      <footer class="container__footer">
        <el-button @click="handleClose">取消</el-button>
        <el-tooltip content="之前定义的mock规则会被覆盖掉">
          <el-button type="success" @click="handleSaveAndReplace">
            保存&替换mock
          </el-button>
        </el-tooltip>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </footer>
    </article>
  </el-drawer>
</template>
<script setup lang="ts">
import { ElMessage as Message, ElTree as Tree } from 'element-plus';
import type Node from 'element-plus/lib/components/tree/src/model/node.d';
import cloneDeep from 'lodash/cloneDeep';
import { Ref } from 'vue';

import { Json, TreeNode } from '@/types/mock.d';
import { isNum, isObj } from '@/utils';
import { transJson2Tree, transTree2Json } from '@/utils/mock';

const TAB = {
  tree: 'tree',
  json: 'json',
};

const visible = ref(false);
const json: Ref<Json> = ref({});
const jsonstr = ref('');
const tab = ref(TAB.tree);
const treeRef = ref<InstanceType<typeof Tree>>();

const emit = defineEmits<{
  (e: 'update-json', json: Json): void;
  (e: 'replace-json', json: Json): void;
}>();

const treeData = computed(() => transJson2Tree(json.value));

const isObjectOrArray = ({ type, children = [] }: TreeNode) =>
  type === 'object' || type === 'array' || children?.length;

const isBoolean = (value: unknown) => value === 'boolean';

const isNumber = (value: unknown) => value === 'number' || value === 'bigint';

const getDataValue = ({ value, children = [] }: TreeNode) => {
  const { length } = children;
  const array = length && children.every((node: TreeNode) => isNum(node.label));

  if (Array.isArray(value) || array) {
    return '[…]';
  } else if (isObj(value) || length) {
    return '{…}';
  }
  return value;
};

const getResult = () => {
  if (tab.value === TAB.tree) {
    return transTree2Json(treeData.value);
  }

  try {
    return JSON.parse(jsonstr.value);
  } catch (err: any) {
    Message.error('json格式异常');
    throw new Error(err);
  }
};

const handleDeleteNode = (node: Node) => {
  node?.remove();
};

const handleCopyNode = (node: any, data: any) => {
  treeRef.value?.insertAfter(cloneDeep(data), node);
  Message({
    type: 'success',
    message: '克隆成功',
  });
};

const handleSaveAndReplace = () => {
  emit('replace-json', getResult());
  handleClose();
};

const handleSave = () => {
  emit('update-json', getResult());
  handleClose();
};

const handleResetDialog = () => {
  json.value = {};
  jsonstr.value = '';
  tab.value = TAB.tree;
};

const handleOpen = (input: Json) => {
  json.value = input;
  jsonstr.value = JSON.stringify(input, null, 2);
  visible.value = true;
};

const handleClose = () => {
  visible.value = false;
  handleResetDialog();
};

defineExpose({ handleOpen, handleClose });
</script>
<style scoped lang="less">
.container {
  height: calc(~'100vh - 82px');
  display: flex;
  flex-direction: column;
  &__main {
    flex: 1;
    margin-bottom: 24px;
    overflow-y: auto;
    .tree__node {
      display: flex;
      justify-content: space-between;
      flex: 1;
      &--left {
        display: flex;
        flex: 1;
        align-items: center;
        .input--simple {
          flex: 1;
          &.node__label {
            flex: initial;
          }
        }
        .node__label {
          color: #000;
          font-weight: bold;
          &--editable {
            :deep(.el-icon) {
              font-size: 14px !important;
            }
            :deep(.el-input) {
              width: 120px;
            }
            :deep(.el-input),
            :deep(.el-input__inner) {
              height: 20px;
              line-height: 20px;
            }
          }
        }
        .node__value {
          color: #999;
          max-width: 640px;
        }
      }
      &--right {
        padding-right: 8px;
        .link {
          height: 20px;
          line-height: 20px;
          display: none;
          &--danger {
            color: #ff4940;
            align-items: center;
          }
          &--success {
            color: #31bf30;
            align-items: center;
          }
        }
      }
      &:hover {
        & .link {
          display: inline-flex;
        }
      }
    }
    &--inner {
      height: 100%;
      :deep(.el-tabs__content) {
        height: calc(~'100% - 80px');
        .el-tab-pane {
          height: 100%;
        }
      }
      .textarea {
        border: 1px solid var(--el-border-color-light);
        height: 99%;
        width: 99%;
      }
      .json {
        font-size: 14px;
      }
    }
  }
  &__footer {
    display: flex;
    justify-content: end;
    height: 36px;
    margin-bottom: 24px;
  }
}
</style>
<style lang="less">
.tree__drawer--edit {
  color: red;
  .el-drawer__body {
    overflow: hidden;
    #pane-tree {
      overflow: auto;
    }
  }
}
</style>
