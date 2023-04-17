<template>
  <el-dialog
    v-model="visible"
    :title="editMode ? '编辑字段' : '新增字段'"
    destroy-on-close
  >
    <article class="dialog__body">
      <el-form ref="formRef" :model="model" :rules="rules" label-width="100px">
        <!-- <el-form-item
          v-if="editMode"
          prop="key"
          label="key："
        >{{model.id}}</el-form-item> -->
        <el-form-item
          v-if="model.label !== null"
          prop="label"
          class="is-required"
          label="字段名："
        >
          <el-input class="w320" :disabled="arrayItem" v-model="model.label" />
          <el-tooltip
            placement="top"
            content="比如数组是[1,2,3] 或 ['a', 'b', 'c'] 或 [[], ['a'], ['b', 'c']]"
          >
            <el-checkbox class="ml8" v-model="arrayItem">
              非对象数组元素
            </el-checkbox>
          </el-tooltip>
        </el-form-item>
        <el-form-item prop="type" label="类型：">
          <el-select v-model="model.type" @change="handleTypeChange">
            <el-option
              v-for="option in typeSelection"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="notObj" prop="value" label="默认值：">
          <el-input
            v-if="string || nullVal"
            class="w320"
            v-model="model.value"
          />
          <el-input-number
            v-if="number"
            class="w320"
            v-model="model.value"
            :controls="false"
          />
          <el-switch v-if="boolean" v-model="model.value" />
        </el-form-item>
        <el-form-item
          v-if="array && model.length"
          prop="length"
          label="数组长度："
        >
          <el-input-number v-model="model.length" :min="0" />
        </el-form-item>
        <el-form-item
          v-if="array"
          prop="lengthMock"
          label="长度mock："
          class="form__item--lengthmock"
        >
          <el-select v-model="tempLengthMock[0]">
            <el-option
              v-for="item in mockLengthSelection"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-slider
            v-if="tempLengthMock[0]"
            v-model="tempLengthMock[1]"
            class="slider--lengthmock"
            range
            :marks="marks"
            :max="100"
          />
        </el-form-item>
        <el-form-item v-if="notObj" prop="mock" label="mock：">
          <el-select v-model="tempMock">
            <el-option
              v-for="item in mockSelection"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-popover
            v-if="showExample"
            placement="right"
            title=""
            width="auto"
            trigger="hover"
          >
            <dl>
              <dt v-for="(exp, idx) in examples" :key="exp" class="example">
                {{ `示例${idx + 1}：` }}{{ exp }}
              </dt>
            </dl>
            <template #reference>
              <el-link type="primary" class="ml8" :underline="false">
                查看示例
              </el-link>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item v-if="randomOne" prop="assignedValue" label="指定值：">
          <el-select
            multiple
            filterable
            allow-create
            placeholder="请输入指定值"
            class="w320"
            v-model="tempMockRest"
          />
        </el-form-item>
        <el-form-item v-else-if="custom" prop="表达式" label="表达式：">
          <el-autocomplete
            v-model="tempMockCustom"
            :fetch-suggestions="handleSearchExistMocks"
            placeholder="请输入表达式"
            class="w320"
          >
            <template #default="{ item }">
              <span class="option--mock">
                <label class="option--mock__label">{{ item.label }}</label>
                <label class="option--mock__desc">{{ item.description }}</label>
              </span>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item v-else-if="field" prop="字段" label="字段：">
          <el-input
            v-model="tempMockCustom"
            placeholder="请输入字段，比如：col、../col、../../arr[0]、../obj.ids[$index]"
            class="w320"
          />
        </el-form-item>
      </el-form>
    </article>
    <template #footer>
      <footer class="dialog__footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="editMode" type="danger" @click="handleDelete">
          删除
        </el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </footer>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { Ref } from 'vue';
import * as Mock from 'mockjs';
import { ElMessageBox as MessageBox, ElForm as Form } from 'element-plus';
import cloneDeep from 'lodash/cloneDeep';
import type Node from 'element-plus/lib/components/tree/src/model/node.d';
import { genAllData, genTreeData, genArrayDefaultData } from '@/utils/index';
import { TreeData } from '@/types/mock';
import {
  mockKey,
  mockSelection,
  mockLengthSelection,
  mockFnSelection,
  typeSelection,
} from '@/const/selection';

const uniqValidator = (rule: any, value: string, callback: Function) => {
  if (!arrayItem.value && !value) {
    callback('请输入字段名');
  } else if (existLabels.value.includes(value)) {
    callback('字段名重复');
  } else {
    callback();
  }
};

const visible = ref(false);
const editMode = ref(false);
const arrayItem = ref(false);
const model = ref(genTreeData());
const formRef = ref<InstanceType<typeof Form>>();
const parentNode = ref<InstanceType<typeof Node>>();
// 完整mock或mock方法
const tempMock = ref('');
// 自定义mock、指定字段
const tempMockCustom = ref('');
// 长度mock
const tempLengthMock = ref<[string, [number, number]]>(['', [0, 0]]);
const marks = ref({ 0: '0', 50: '50', 90: '90' });
// 随机指定mock值
const tempMockRest: Ref<Array<string | number>> = ref([]);
const rules = ref({
  label: [{ validator: uniqValidator, trigger: 'blur' }],
});

// 随机mock指定值
const randomOne = computed(
  () => notObj.value && mockKey.randomOne === tempMock.value
);
// 自定义mock
const custom = computed(
  () => notObj.value && mockKey.custom === tempMock.value
);
// 指定字段
const field = computed(() => notObj.value && mockKey.field === tempMock.value);
// 判断基础类型
const notObj = computed(() => !array.value && !object.value);
// 数据类型判断 - start
const array = computed(() => model.value.type === 'array');
const object = computed(() => model.value.type === 'object');
const number = computed(() => model.value.type === 'number');
const string = computed(() => model.value.type === 'string');
const nullVal = computed(
  () => model.value.type === 'null' || model.value.type === 'undefined'
);
const boolean = computed(() => model.value.type === 'boolean');
// 数据类型判断 - end
const existLabels = computed(() => {
  let data = parentNode?.value?.data || [];
  if (!Array.isArray(data)) {
    data = data.children;
  }
  return data
    .filter(({ id }: TreeData) => model.value.id !== id)
    .map(({ label }: TreeData) => label);
});
// 是否展示示例按钮
const showExample = computed(() =>
  [
    mockKey.string510,
    mockKey.ctitle510,
    mockKey.integer10100,
    mockKey.guid,
    mockKey.custom,
  ].includes(tempMock.value)
);
// 示例内容
const examples = computed(() =>
  [1, 2, 3]
    .map(() => Mock.mock(custom.value ? tempMockCustom.value : tempMock.value))
    .filter((v) => v)
);

watch(
  () => tempMock.value,
  (val) => {
    // 自定义mock、指定字段、随机指定值不需要清空mock字段
    if (![mockKey.custom, mockKey.field, mockKey.randomOne].includes(val)) {
      tempMockCustom.value = '';
      tempMockRest.value = [];
    }
  }
);

watch(
  () => model.value,
  ({ mock, lengthMock, length }) => {
    // 长度mock
    if (lengthMock) {
      tempLengthMock.value = lengthMock;
    } else {
      tempLengthMock.value = ['', [0, length || 0]];
    }

    if (!notObj.value) return;

    // 绑定mock变量
    if (Array.isArray(mock)) {
      tempMock.value = mock[0] as string;
      // 自定义mock、指定字段
      if ([mockKey.custom, mockKey.field].includes(tempMock.value)) {
        tempMockCustom.value = mock[1] as string;
        // 随机指定值
      } else {
        tempMockRest.value = mock.slice(1);
      }
    } else if (mock) {
      tempMock.value = mock;
      tempMockRest.value = [];
    }
  }
);

const emit = defineEmits<{
  (e: 'add', data: TreeData): void;
  (e: 'update', data: TreeData): void;
  (e: 'delete'): void;
}>();

const updateValueInModel = () => {
  if (arrayItem.value) {
    model.value.label = null;
  }

  if (array.value && !model.value?.children?.length) {
    model.value.children = [];
    model.value.children.push(genArrayDefaultData());
  }

  model.value.lengthMock = tempLengthMock.value as any;
};

const updateMockInModel = () => {
  switch (true) {
    // 随机指定值
    case !!randomOne.value:
      model.value.mock = [tempMock.value, ...tempMockRest.value];
      break;
    // 自定义
    case !!custom.value:
    // 指定字段
    // eslint-disable-next-line no-fallthrough
    case !!field.value:
      model.value.mock = [tempMock.value, tempMockCustom.value];
      break;
    // 基本数据类型
    case !!notObj.value:
      model.value.mock = tempMock.value;
      break;
    // 对象or数组类型
    default:
      model.value.mock = undefined;
      break;
  }
};

const handleTypeChange = (type: string) => {
  const genFn = genAllData[type];
  if (typeof genFn === 'function') {
    const newData = genFn(model.value);
    const { id, ...otherNewData } = newData;
    model.value = {
      ...model.value,
      ...(editMode.value ? otherNewData : newData),
    };
  }
};

const handleOpen = (parent: Node, data?: TreeData) => {
  editMode.value = typeof data !== 'undefined';
  model.value = cloneDeep(data || genTreeData());
  parentNode.value = parent;
  visible.value = true;
  formRef.value?.clearValidate();
};

const handleReset = () => {
  arrayItem.value = false;
};

const handleClose = () => {
  visible.value = false;
  handleReset();
};

const handleDelete = () => {
  MessageBox.confirm('确定删除当前字段吗？', '警告', {
    type: 'error',
  }).then(() => {
    emit('delete');
    handleClose();
  });
};

const handleConfirm = () => {
  formRef.value?.validate((passed) => {
    if (!passed) return;
    updateValueInModel();
    updateMockInModel();
    if (editMode.value) {
      emit('update', model.value);
    } else {
      emit('add', model.value);
    }
    handleClose();
  });
};

const handleSearchExistMocks = (search = '', callback: Function) => {
  const result = mockFnSelection.filter(
    ({ value }) => value.indexOf(search) > -1
  );
  const defaultResult = [
    { value: search, label: search, description: '自创的' },
  ];
  callback(result.length ? result : defaultResult);
};

defineExpose({ handleOpen, handleClose });
</script>
<style scoped lang="less">
.option--mock {
  display: flex;
  justify-content: space-between;
  width: 100%;
  &__desc {
    color: #999;
  }
}
.example:not(:last-child) {
  margin-bottom: 4px;
}

.form__item--lengthmock {
  :deep(.el-form-item__content) {
    flex-direction: column;
    align-items: baseline;
  }
}
.slider--lengthmock {
  width: 100%;
}
</style>
