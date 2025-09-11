import { Summary } from "../../types/summary/summary";

export const summaryStorageUtils = {
    getStorageKey: (baseKey: string, userId: string, studyMaterialId: string) => 
        `${baseKey}_${userId}_${studyMaterialId}`,

    async cacheSummary(studyMaterialId: string, userId: string, summary: Summary, version: string): Promise<void> {
        try {
            const cacheData = { summary, version, cachedAt: new Date().toISOString() };
            const key = this.getStorageKey('cached_summary', userId, studyMaterialId);
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Failed to cache summary:', error);
        }
    },

    async getCachedSummary(studyMaterialId: string, userId: string): Promise<{ summary: Summary; version: string } | null> {
        try {
            const key = this.getStorageKey('cached_summary', userId, studyMaterialId);
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            return { summary: cacheData.summary, version: cacheData.version || 'unknown' };
        } catch (error) {
            return null;
        }
    },
};