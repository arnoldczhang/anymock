import { defineStore } from 'pinia';

import { api } from '@/service';
import { ReqHeaderItem } from '@/types/mock';

const hasSelected = (header: ReqHeaderItem) => header.selected;

export default defineStore('common', {
  state: () => ({
    reqHeader: [],
    resHeader: [],
    globalError: '',
  }),
  getters: {
    hasReqHeaderProxy: (state) => state.reqHeader.some(hasSelected),
    hasResHeaderProxy: (state) => state.resHeader.some(hasSelected),
  },
  actions: {
    async updateReqHeader() {
      this.reqHeader = await api.reqHeader.getList();
    },
    async updateResHeader() {
      this.resHeader = await api.resHeader.getList();
    },
    clearGlobalError() {
      this.globalError = '';
    },
    updateGlobalError(error: string) {
      this.globalError = error;
    },
  },
});
