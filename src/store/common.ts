import { defineStore } from 'pinia';
import { ReqHeaderItem } from '@/types/mock';
import { api } from '@/service';

export default defineStore('common', {
  state: () => ({
    reqHeader: [],
  }),
  getters: {
    hasReqHeaderProxy: (state) =>
      state.reqHeader.some((header: ReqHeaderItem) => header.selected),
  },
  actions: {
    async updateReqHeader() {
      this.reqHeader = await api.reqHeader.getList();
    },
  },
});
