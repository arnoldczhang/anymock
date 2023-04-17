<template>
  <main class="container">
    <aside class="container__aside">
      <section class="container__aside--main">
        <nav class="aside__list">
          <el-check-tag
            v-for="(tag, oIndex) in list"
            :key="tag.id"
            class="aside__tag"
            :checked="tag.selected"
            @change="handleTagChange(tag, $event)"
          >
            <template #default>
              <article class="aside__tag--main">
                <header class="aside__tag--top omit">{{ tag.name }}</header>
                <section class="aside__tag--bottom">
                  <template
                    v-for="(param, index) in tag.params.slice(0, 1)"
                    :key="index"
                  >
                    <p v-if="param[0] && param[1]" class="aside__tag--item">
                      <el-tag type="info" round>{{ param[0] }}</el-tag>
                      <span class="mr4 ml4">=</span>
                      <el-tag type="info" round>{{ param[1] }}</el-tag>
                    </p>
                  </template>
                  <p v-if="tag.params.length > 1" class="mt8 tlr">
                    ...还有{{ tag.params.length - 1 }} 条配置
                  </p>
                </section>
                <c-icon
                  icon="Delete"
                  :size="36"
                  color="#F56C6C"
                  class="btn--delete"
                  @click.stop="handleDeleteOne(oIndex)"
                />
              </article>
            </template>
          </el-check-tag>
        </nav>
      </section>
      <footer class="container__aside--bottom">
        <el-button type="primary" @click="handleAdd">+新增配置</el-button>
        <el-button type="danger" @click="handleDeleteAll">清空配置</el-button>
      </footer>
    </aside>
    <article class="container__body">
      <el-empty v-if="!currentConfig" class="container__body--empty" />
      <template v-else>
        <header class="container__body--top">
          <input-view
            :text="currentConfig.name"
            :model="currentConfig.name"
            @confirm="handleUpdateName"
          />
          <span>
            <el-button type="primary" @click="handleAddHeaderParam">
              +新增头字段
            </el-button>
            <el-button type="success" @click="handleSave">保存</el-button>
          </span>
        </header>
        <section class="container__body--main">
          <p
            v-for="(param, index) in currentConfig.params"
            :key="index"
            class="param__box"
          >
            <el-input v-model="param[0]" placeholder="Please input">
              <template #prepend>key</template>
            </el-input>
            <span style="margin-right: 8px" />
            <el-input v-model="param[1]" placeholder="Please input">
              <template #prepend>value</template>
            </el-input>
            <el-button
              type="danger"
              :icon="Delete"
              class="param__box--delete"
              @click="handleDeleteParam(index)"
            />
          </p>
        </section>
      </template>
    </article>
  </main>
</template>
<script lang="ts" setup>
import { Ref } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { ElMessage as Message } from 'element-plus';
import { ReqHeaderList, ReqHeaderItem } from '@/types/mock';
import { genDefaultReqHeader } from '@/utils';
import useCommonStore from '@/store/common';
import { api } from '@/service';

const list: Ref<ReqHeaderList> = ref([]);
const currentConfig: Ref<ReqHeaderItem | null> = ref(null);
const store = useCommonStore();

const handleSave = async () => {
  try {
    await api.reqHeader.update(toRaw(list.value));
    store.updateReqHeader();
    Message({
      type: 'success',
      message: '保存成功',
    });
  } catch (err: any) {
    Message({
      type: 'error',
      message: `保存失败，原因：${err.message}`,
    });
  }
};

const handleAdd = async () => {
  list.value.push(genDefaultReqHeader());
  await handleSave();
};

const handleClearCurrent = () => {
  currentConfig.value = null;
};

const handleDeleteAll = async () => {
  list.value = [];
  handleClearCurrent();
  await handleSave();
};

const handleDeleteParam = async (index: number) => {
  currentConfig.value?.params.splice(index, 1);
  await handleSave();
};

const handleDeleteOne = async (index: number) => {
  const deleteOne = list.value[index];
  list.value?.splice(index, 1);
  if (deleteOne === currentConfig.value) {
    handleClearCurrent();
  }
  await handleSave();
};

const handleUpdateName = async (name: string) => {
  if (currentConfig.value === null) return;
  currentConfig.value.name = name;
  await handleSave();
};

const handleAddHeaderParam = async () => {
  currentConfig.value?.params.push([]);
  await handleSave();
};

const handleTagChange = async (tag: ReqHeaderItem, selected: boolean) => {
  if (selected) {
    list.value.forEach((current) => {
      current.selected = current === tag;
    });
    currentConfig.value = tag;
  } else {
    tag.selected = selected;
    handleClearCurrent();
  }
  await handleSave();
};

onMounted(async () => {
  list.value = await api.reqHeader.getList();
  currentConfig.value =
    list.value.find((tag: ReqHeaderItem) => tag.selected) || null;
});
</script>
<style lang="less" scoped>
.container {
  &__aside {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: 20%;
    border-right: 1px solid #ccc;
    &--main {
      box-sizing: border-box;
      height: calc(~'100vh - 48px');
      width: 100%;
      padding: 16px;
      overflow-y: auto;
    }
    .aside {
      &__list {
        display: flex;
        justify-self: center;
        flex-direction: column;
      }
      &__tag {
        margin-top: 8px;
        &--main {
          position: relative;
          padding: 8px 0;
          &:hover > .btn--delete {
            display: block;
          }
          .btn--delete {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
        &--top {
          height: 24px;
          border-bottom: 1px solid #ccc;
        }
        &--bottom {
          display: flex;
          height: 65px;
          flex-direction: column;
          padding: 4px 0;
          box-sizing: border-box;
          overflow: hidden;
        }
        &--item {
          display: flex;
          align-items: center;
          margin-top: 6px;
        }
      }
    }
    &--bottom {
      box-sizing: border-box;
      border-top: 1px solid #ccc;
      height: 48px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  &__body {
    width: 80%;
    &--top {
      display: flex;
      height: 56px;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid #ccc;
      justify-content: space-between;
    }
    &--empty {
      height: 100%;
    }
    &--main {
      .param__box {
        display: flex;
        padding: 0 16px;
        margin-top: 8px;
        &--delete {
          width: 32px;
          margin-left: 8px;
        }
      }
    }
  }
}
</style>
