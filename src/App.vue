<template>
  <main class="container">
    <aside class="container__aside">
      <section class="container__aside--top" @click="handleOpenLoginPage">
        <el-avatar size="small" :src="avatar" />
        <label class="ml8">{{ user ? `${user}` : '未登录' }}</label>
      </section>
      <el-menu
        v-if="menuVisible"
        class="container__aside--center"
        :style="{ width: collapse ? '64px' : '199px' }"
        :default-active="pageName"
        :collapse="collapse"
        menu-trigger="click"
        @select="handleSelect"
      >
        <el-menu-item
          v-for="item in routeList"
          :index="item.name"
          :key="item.name"
        >
          <c-icon :icon="item.icon" />
          <span class="mr8">{{ item.label }}</span>
          <el-tag
            v-if="showReqHeaderTip(item)"
            round
            type="danger"
            effect="light"
          >
            生效中
          </el-tag>
        </el-menu-item>
      </el-menu>
      <section class="container__aside--bottom">
        <el-tooltip content="将当前配置复制到剪贴板">
          <el-link
            :underline="false"
            class="mr16"
            :icon="DocumentCopy"
            @click="handleCopyAllStorage"
          >
            导出
          </el-link>
        </el-tooltip>
        <el-tooltip content="同步配置">
          <el-link :underline="false" :icon="Refresh" @click="handleOpenDialog">
            导入
          </el-link>
        </el-tooltip>
      </section>
      <import-dialog
        ref="importDialogRef"
        title="同步配置"
        @import-json="handlePasteAllStorage"
      />
    </aside>
    <article class="container__content">
      <router-view />
    </article>
  </main>
</template>
<script setup lang="ts">
import { DocumentCopy, Refresh } from '@element-plus/icons-vue';
import { ElMessage as Message, ElMessageBox as MessageBox } from 'element-plus';
import { setStorage, getCurrentStorage } from '@/utils/storage';
import { copy } from '@/utils/index';
import useCommonStore from '@/store/common';
import ImportDialog from './pages/detail/components/import-dialog.vue';
import { HOME, REQ_HEADER, BLACK_LIST } from '@/const/router';
import {
  BLACKLIST_KEY,
  CURRENT_GROUP_ID_KEY,
  MOCK_GROUP_KEY,
  MOCK_INTERFACE_KEY,
  REQ_HEADER_KEY,
} from './const/storageKey';

const store = useCommonStore();
const route = useRoute();
const router = useRouter();
const pageName = ref<string>(route.name as string);
const collapse = ref(false);
const user = ref('');
const avatar = ref('');
const importDialogRef = ref<InstanceType<typeof ImportDialog>>();
const menuVisible = computed(() => route.name);

const routeList = [HOME, REQ_HEADER, BLACK_LIST];

const handleSelect = (name: string) => {
  pageName.value = name === 'detail' ? 'home' : name;
  router.push({ name });
};

const showReqHeaderTip = (route: typeof REQ_HEADER) => {
  if (route.name !== REQ_HEADER.name) return false;
  return store.hasReqHeaderProxy;
};

const handleOpenLoginPage = () => {
  alert('敬请期待');
};

const handleCopyAllStorage = () => {
  const result = copy(JSON.stringify(getCurrentStorage()));
  if (result) {
    Message({
      type: 'success',
      message: '复制成功',
    });
  } else {
    Message({
      type: 'error',
      message: '复制失败',
    });
  }
};

const handleOpenDialog = () => {
  importDialogRef.value?.handleOpen();
};

const handlePasteAllStorage = async (jsonStr: string) => {
  try {
    await MessageBox.confirm('确定同步这些配置吗？会覆盖当前本地配置', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
  } catch (err) {
    return;
  }

  try {
    const {
      [MOCK_GROUP_KEY]: mockGroup = [],
      [MOCK_INTERFACE_KEY]: table = [],
      [CURRENT_GROUP_ID_KEY]: currentGroupId = '',
      [BLACKLIST_KEY]: blacklist = [],
      [REQ_HEADER_KEY]: reqHeader = [],
    } = JSON.parse(jsonStr);

    if (Array.isArray(mockGroup)) {
      await setStorage(MOCK_GROUP_KEY, mockGroup);
    }

    if (Array.isArray(table)) {
      await setStorage(MOCK_INTERFACE_KEY, table);
    }

    if (currentGroupId) {
      await setStorage(CURRENT_GROUP_ID_KEY, currentGroupId);
    }

    if (Array.isArray(blacklist)) {
      await setStorage(BLACKLIST_KEY, blacklist);
    }

    if (Array.isArray(reqHeader)) {
      await setStorage(REQ_HEADER_KEY, reqHeader);
    }

    Message({
      type: 'success',
      message: '同步成功',
    });
    setTimeout(() => router.go(0), 1000);
  } catch (err: any) {
    Message({
      type: 'error',
      message: `同步失败，原因：${err.message}`,
    });
  }
};

const syncUserInfo = async () => {
  // TODO 登录账号
};

watch(
  () => route.path,
  () => {
    handleSelect(route.name as string);
  }
);

onMounted(() => {
  store.updateReqHeader();
});
syncUserInfo();
</script>
<style scoped lang="less">
.container {
  display: flex;
  width: 100%;
  height: 100%;
  &__aside {
    width: 200px;
    max-width: 200px;
    flex-shrink: 0;
    box-sizing: border-box;
    border-right: 1px solid #e9e9eb;
    display: flex;
    flex-direction: column;
    &--top {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 12px;
      flex-shrink: 0;
      height: 50px;
      box-sizing: border-box;
      padding: 0 16px;
    }
    &--center {
      flex: 1;
      border-right: none;
    }
    &--bottom {
      display: flex;
      justify-content: center;
    }
    .aside__link {
      display: block;
      height: 40px;
      padding: 16px 8px 0 8px;
    }
  }
  &__content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
