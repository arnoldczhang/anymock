import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';

import type { Log } from '@/types/mock.d';
import type { LogState } from '@/types/store.d';

export default defineStore('log', {
  state: (): LogState => ({
    logs: [],
    // 仅用于重置recorder状态
    state: 0,
  }),
  getters: {},
  actions: {
    clear() {
      this.logs = [];
    },
    add(log: Log) {
      log.id = uuid();
      this.logs.push(log);
    },
    refresh() {
      this.state = Math.random();
    },
  },
});
