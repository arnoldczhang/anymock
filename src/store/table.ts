import { defineStore } from 'pinia';

export default defineStore('table', {
  state: () => ({
    state: 0,
  }),
  getters: {},
  actions: {
    refresh() {
      this.state = Math.random();
    },
  },
});
