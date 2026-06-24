import { create } from 'zustand';
import { profileApi } from '../api/profileApi';

const useQuotaStore = create((set, get) => ({
  remaining: null,
  used: null,
  isLoading: false,
  lastFetched: null,

  fetchQuota: async (force = false) => {
    const state = get();
    // Don't re-fetch if we fetched within the last 10 seconds (unless forced)
    if (!force && state.lastFetched && Date.now() - state.lastFetched < 10000) {
      return;
    }
    
    set({ isLoading: true });
    try {
      const res = await profileApi.getStats();
      const data = res.data.data;
      set({
        remaining: data.remaining_quota ?? 0,
        used: data.total_used_quota ?? 0,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch quota:', error);
      set({ isLoading: false });
    }
  },

  decrementQuota: () => {
    set((state) => ({
      remaining: Math.max(0, (state.remaining ?? 0) - 1),
      used: (state.used ?? 0) + 1,
    }));
  },

  refreshQuota: () => {
    get().fetchQuota(true);
  },
}));

export default useQuotaStore;
