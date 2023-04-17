<template>
  <el-drawer
    title="编辑原始JSON"
    v-model="visible"
    size="90%"
    :wrapperClosable="false"
    :before-close="handleClose"
    class="tree__drawer--edit"
  >
    <article class="container">
      <section class="container__main">
        <el-tabs v-model="tab" class="container__main--inner">
          <el-tab-pane label="树型编辑" :name="TAB.tree">
            <el-tree
              ref="treeRef"
              node-key="id"
              class="tree"
              :data="treeData"
              draggable
            >
              <template #default="{ node, data }">
                <section class="tree__node">
                  <span class="tree__node--left">
                    <i class="sys-icon-drag" />
                    <label class="node__label">{{ data.label }}</label>
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
                      icon="sys-icon-close"
                      @click.stop="handleDeleteNode(node)"
                    >
                      删除
                    </el-link>
                    <el-link
                      type="success"
                      :underline="false"
                      class="link link--success"
                      icon="sys-icon-copy"
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
            <textarea v-model="jsonstr" class="textarea" />
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
import { Ref } from 'vue';
import { ElTree as Tree, ElMessage as Message } from 'element-plus';
import cloneDeep from 'lodash/cloneDeep';
import type Node from 'element-plus/lib/components/tree/src/model/node.d';
import { Json, TreeNode } from '@/types/mock.d';
import { transJson2Tree, transTree2Json } from '@/utils/mock';
import { isObj, isNum } from '@/utils';

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
  const array =
    length && children.every((node: TreeNode) => isNum(node.label));

  if (Array.isArray(value) || array) {
    return '[…]';
  } else if (isObj(value) || length) {
    return '{…}';
  }
  return value;
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
        }
        .node__label {
          color: #000;
          font-weight: bold;
        }
        .node__value {
          color: #999;
          max-width: 320px;
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