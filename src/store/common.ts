import { defineStore } from 'pinia';
import { ReqHeaderItem } from '@/types/mock';
import { api } from '@/service';

const hasSelected = (header: ReqHeaderItem) => header.selected;

export default defineStore('common', {
  state: () => ({
    reqHeader: [],
    resHeader: [],
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
  },
});
