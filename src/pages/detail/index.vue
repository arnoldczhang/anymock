<template>
  <main class="container">
    <el-page-header @back="goBack" title="返回接口列表" class="back-header">
      <template #content>
        <input-view
          label=""
          :text="`${mockItem.name || '--'}`"
          class="card__title--left"
          :model="mockItem.name"
          @confirm="(val: string) => handleUpdateMockName(mockItem, val)"
        />
      </template>
      <template #extra>
        <span class="card__title--right flex-center">
          <el-button
            type="success"
            size="small"
            @click="handleOpenImportCaseDialog"
          >
            导入案例
          </el-button>
          <el-button type="primary" size="small" @click="handleSave">
            保存
          </el-button>
          <el-tooltip content="不做任何mock处理，仅返回原始数据">
            <el-checkbox
              class="ml8"
              v-model="mockItem.onlyProxy"
              @change="handleSave"
            >
              透传原始json
            </el-checkbox>
          </el-tooltip>
          <el-switch
            class="ml8"
            v-model="mockItem.status"
            @change="handleStatusChange"
          />
        </span>
      </template>
    </el-page-header>
    <article class="mock__item">
      <el-card
        :class="{
          card: true,
          hidden: !mockItem.status,
        }"
        v-for="(tag, index) in mockItem.tags"
        :key="tag.id"
      >
        <template #header>
          <header class="card__header">
            <input-view
              :label="`案例${index + 1}：`"
              :text="`案例${index + 1}：${tag.name || '--'}`"
              class="card__title--left"
              :model="tag.name"
              @confirm="(val: string) => handleUpdateTagName(tag, val)"
            />
            <span class="card__title--right">
              <el-button link size="small" @click="handleLog(index)">
                打印样例
              </el-button>
              <el-button
                class="ml8"
                size="small"
                @click="handleOpenJSONEditDrawer(index)"
              >
                编辑原始json
              </el-button>
              <el-button
                class="ml8"
                size="small"
                @click="handleOpenImportDialog(index)"
              >
                导入原始json
              </el-button>
              <el-button
                class="ml8"
                size="small"
                @click="handleShareCase(index)"
              >
                导出案例
              </el-button>
              <el-button
                class="ml8"
                size="small"
                @click="handleCopyCase(index)"
              >
                拷贝案例
              </el-button>
              <el-button
                :disabled="mockItem.tags.length <= 1"
                class="ml8"
                type="danger"
                size="small"
                @click="handleDeleteCase(index)"
              >
                删除
              </el-button>
              <el-switch
                v-model="tag.status"
                class="ml8"
                @change="(status: string | number | boolean) => handleTagStatusChange(tag, status)"
              />
            </span>
          </header>
        </template>
        <section>
          <el-tree ref="treeRef" :data="tag.data" node-key="id">
            <template #default="{ node, data }">
              <section class="tree__node">
                <span class="tree__node--left">
                  <label class="node__label">
                    {{ node.label == null ? '0' : node.label }}
                  </label>
                  ：
                  <label class="node__value omit">
                    {{ parseNodeValue(data) }}
                  </label>
                  <!-- 高亮值的mock -->
                  <template v-if="data.mock">
                    <c-icon
                      icon="DArrowRight"
                      :size="12"
                      color="#409EFF"
                      class="ml4 mr4"
                    />
                    <label class="danger">{{ getMockText(data.mock) }}</label>
                  </template>
                  <!-- 高亮长度的mock -->
                  <template v-else-if="data.lengthMock && data.lengthMock[0]">
                    <c-icon
                      icon="DArrowRight"
                      :size="12"
                      color="#409EFF"
                      class="ml4 mr4"
                    />
                    <label class="danger">
                      {{ getLengthMockText(data.lengthMock[1]) }}
                    </label>
                  </template>
                </span>
                <span class="tree__node--right">
                  <el-link
                    type="success"
                    :underline="false"
                    class="link--hover"
                    @click.stop="handleInsertAfterNode(data, node, index)"
                  >
                    同级新增
                  </el-link>
                  <el-link
                    type="primary"
                    :underline="false"
                    class="link--hover ml8"
                    @click.stop="handleEditNode(data, node)"
                  >
                    编辑
                  </el-link>
                </span>
              </section>
            </template>
          </el-tree>
        </section>
      </el-card>
      <import-dialog
        ref="importCaseDialogRef"
        title="导入案例"
        @import-json="handleImportCase"
      />
      <import-dialog ref="importDialogRef" @import-json="handleTransformJson" />
      <tree-edit-drawer
        ref="treeEditDrawerRef"
        @replace-json="handleSaveAndUpdateOriginJson"
        @update-json="handleSaveOriginJson"
      />
      <add-dialog
        ref="addDialogRef"
        @delete="handleDeleteNode"
        @update="handleUpdateNode"
        @add="handleAddNode"
      />
    </article>
  </main>
</template>
<script setup lang="ts">
import { ElMessage as Message, ElTree as Tree } from 'element-plus';
import type Node from 'element-plus/lib/components/tree/src/model/node.d';
import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuid } from 'uuid';

import { STATUS } from '@/const';
import EVENT from '@/const/event';
import { useTabActiveListener } from '@/hooks/useTabActiveListener';
import { Json, MockItem, Tag, TreeData } from '@/types/mock.d';
import {
  copy,
  genCaseName,
  genCaseNameCn,
  genTreeData,
  isObj,
  transfromJson2TreeData,
  validateTag,
} from '@/utils/index';
import { tab } from '@/utils/message';
import {
  getLengthMockText,
  getMockText,
  parseOriginData,
  parseResponse,
} from '@/utils/mock';

import AddDialog from './components/add-dialog.vue';
import ImportDialog from './components/import-dialog.vue';
import TreeEditDrawer from './components/tree-edit-drawer.vue';
import { useMockItemData } from './useMockItemData';

const route = useRoute();
const router = useRouter();
const tagIndex = ref(0);
const currentData = ref(genTreeData());
const currentNode = ref<InstanceType<typeof Node>>();
const importDialogRef = ref<InstanceType<typeof ImportDialog>>();
const importCaseDialogRef = ref<InstanceType<typeof ImportDialog>>();
const addDialogRef = ref<InstanceType<typeof AddDialog>>();
const treeEditDrawerRef = ref<InstanceType<typeof TreeEditDrawer>>();
const treeRef = ref<InstanceType<typeof Tree>[]>();
const { mockItem, getMockItem, handleSave } = useMockItemData();

const currentTag = computed(() => mockItem.value.tags[tagIndex.value]);

/**
 * 总代理状态控制
 *
 * - 关闭代理，所有案例置disabled
 * - 打开代理，保证至少一个案例是enabled
 *
 * @param status
 */
const handleStatusChange = async (status: string | number | boolean) => {
  if (!mockItem.value.tags.length) return;
  mockItem.value.tags.forEach((tag: Tag) => {
    tag.status = STATUS.disable;
  });

  if (status) {
    mockItem.value.tags[0].status = STATUS.enable;
  }
  await handleSave();
};

/**
 * 单个案例的状态切换
 * @param current
 * @param status
 */
const handleTagStatusChange = async (
  current: Tag,
  status: string | number | boolean
) => {
  if (status) {
    mockItem.value.tags.forEach((tag: Tag) => {
      if (current === tag) return;
      tag.status = STATUS.disable;
    });
  }
  mockItem.value.status = mockItem.value.tags.some(
    ({ status }) => status === STATUS.enable
  );
  await handleSave();
};

/**
 * json 转 mock 结构
 * @param jsonStr
 */
const handleTransformJson = async (jsonStr: string) => {
  try {
    const json = JSON.parse(jsonStr);
    const treeData = transfromJson2TreeData(json);
    currentTag.value.originData = json;
    currentTag.value.data = treeData;
    await handleSave();
  } catch (err) {
    Message({
      type: 'error',
      message: 'JSON.parse失败，请检查输入',
    });
  }
};

/**
 * 导入一个外部案例
 *
 * @param jsonStr
 */
const handleImportCase = async (jsonStr: string) => {
  try {
    const tag = JSON.parse(jsonStr);
    await validateTag(tag, mockItem.value.tags);
    mockItem.value.tags.push(tag);
    await handleSave();
  } catch (err: any) {
    Message({
      type: 'error',
      message: `复制失败，原因：${err.message}`,
    });
  }
};

const handleOpenImportCaseDialog = () => {
  importCaseDialogRef.value?.handleOpen();
};

const handleOpenImportDialog = (index: number) => {
  tagIndex.value = index;
  importDialogRef.value?.handleOpen();
};

/**
 * 生成一个新案例
 *
 * @param index
 */
const genNewTag = (index: number) => {
  const newTag = cloneDeep(mockItem.value.tags[index]);
  newTag.id = uuid();
  newTag.name = genCaseName();
  newTag.nameCn = genCaseNameCn();
  newTag.status = STATUS.disable;
  return newTag;
};

/**
 *
 * @param index
 */
const handleShareCase = (index: number) => {
  const result = copy(JSON.stringify(genNewTag(index)));
  if (result) {
    Message({
      type: 'success',
      message: '已复制到剪贴板',
    });
  } else {
    Message({
      type: 'error',
      message: '复制失败',
    });
  }
};

/**
 * 新增（拷）一个案例
 * @param index
 */
const handleCopyCase = async (index: number) => {
  const newTag = genNewTag(index);
  mockItem.value.tags.splice(index + 1, 0, newTag);
  await handleSave();
};

/**
 * 删案例
 * @param index
 */
const handleDeleteCase = async (index: number) => {
  mockItem.value.tags.splice(index, 1);
  await handleSave();
};

const handleEditNode = (data: TreeData, node: Node, edit = true) => {
  currentData.value = data;
  currentNode.value = node;
  addDialogRef.value?.handleOpen(node.parent, edit ? data : undefined);
};

const handleInsertAfterNode = (data: TreeData, node: Node, index: number) => {
  tagIndex.value = index;
  handleEditNode(data, node, false);
};

/**
 * 更新案例名
 * @param tag
 * @param val
 */
const handleUpdateTagName = async (tag: Tag, val: string) => {
  tag.name = val;
  await handleSave();
};

/**
 * 新增同级字段
 * @param data
 */
const handleAddNode = async (data: TreeData) => {
  if (
    typeof treeRef.value === 'undefined' ||
    typeof currentNode.value === 'undefined'
  )
    return;
  treeRef.value[tagIndex.value]?.insertAfter(data, currentNode.value);
  await handleSave();
};

/**
 * 改接口名
 * @param item
 * @param val
 */
const handleUpdateMockName = async (item: MockItem, val: string) => {
  item.name = val;
  await handleSave();
};

/**
 * 更新各级 mock 数据
 * @param data
 */
const handleUpdateNode = async (data: TreeData) => {
  Object.keys(data).forEach((key) => {
    currentData.value[key as keyof TreeData] = data[key as keyof TreeData];
  });
  await handleSave();
};

/**
 * 删字段
 */
const handleDeleteNode = async () => {
  currentNode.value?.remove();
  await handleSave();
  Message({
    type: 'success',
    message: '删除成功',
  });
};

/**
 * 输出当前案例的模拟数据
 *
 * - 用于调试
 *
 * @param index
 */
const handleLog = (index: number) => {
  let result;
  try {
    result = parseResponse(mockItem.value.tags[index].data, mockItem.value);
    Message.success('打印成功');
  } catch ({ message, stack }) {
    result = { message, stack };
    Message.error('样例生成失败，请查看原因');
  } finally {
    tab.send({ type: EVENT.log, data: result });
  }
};

/**
 * 打开原始json编辑抽屉
 * @param index
 */
const handleOpenJSONEditDrawer = (index: number) => {
  tagIndex.value = index;
  const { data, originData } = currentTag.value;
  const originJson = parseOriginData(data, originData);
  treeEditDrawerRef.value?.handleOpen(originJson);
};

/**
 * 仅更新原始json，不改变已有mock
 */
const handleSaveOriginJson = async (json: Json) => {
  currentTag.value.originData = json;
  await handleSave();
};

/**
 * 更新原始json，并改变已有mock
 */
const handleSaveAndUpdateOriginJson = async (json: Json) => {
  // 更新 mock 结构
  const treeData = transfromJson2TreeData(json);
  currentTag.value.data = treeData;
  // 更新原始JSON
  await handleSaveOriginJson(json);
};

/**
 * 自定义树的子节点描述文案
 * @param data
 */
const parseNodeValue = (data: any) => {
  const { value, length } = data;
  if (Array.isArray(value)) {
    return `[]，length=${length}`;
  } else if (isObj(value)) {
    return {};
  }
  return String(value);
};

const goBack = () => {
  return router.push({ name: 'home' });
};

/**
 * 取当前编辑的接口
 */
const init = async () => {
  try {
    const id = String(route.params.id || '');
    await getMockItem(id);
  } catch (error) {
    goBack();
  }
};

onMounted(init);
useTabActiveListener(init);
</script>
<style scoped lang="less">
.container {
  &:extend(.border-box);
  flex-direction: column;
}
.back-header {
  padding: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid @border;
  :deep(.card__title--left) {
    max-width: 300px;
  }
}
.mock__item {
  width: 100%;
  overflow-y: auto;
  height: calc(100vh - 94px);
  box-sizing: border-box;
  padding: 16px;

  .card {
    margin-bottom: 16px;
    transition: filter 0.3s linear;
    &.hidden {
      // filter: blur(5px);
    }
    &:last-of-type {
      margin-bottom: 0;
    }
    &__header {
      display: flex;
      justify-content: space-between;
    }
    &__title {
      display: flex;
      height: 38px;
      align-items: center;
      &--left {
        display: inline-block;
        flex-shrink: 0;
        font-size: 14px;
        max-width: 300px;
      }
    }
  }

  .tree__node {
    display: flex;
    justify-content: space-between;
    flex: 1;
    .link--hover {
      display: none;
    }
    &:hover {
      & .link--hover {
        display: inline-block;
      }
    }
    &--left {
      display: flex;
      align-items: center;
      .sys-icon-double-arrow-right {
        color: #79bbff;
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
    }
  }
}
</style>
