import { defineStore } from 'pinia';
import type { Log } from '@/types/mock.d';

export default defineStore('log', {
  state: (): { logs: Log[] } => ({
    logs: [],
  }),
  getters: {},
  actions: {
    clear() {
      this.logs = [];
    },
    add(log: Log) {
      this.logs.push(log);
    },
  },
});
