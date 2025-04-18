import { writable, derived } from 'svelte/store';
import { auth } from './auth';

interface DashboardData {
    materials: {
        id: string;
        title: string;
        courseCode: string;
        level: string;
        downloads: number;
        createdAt: string;
        category: string;
    }[];
    stats: {
        totalMaterials: number;
        totalDownloads: number;
        uploads: number;
        activeThisMonth: number;
    };
    categories: {
        name: string;
        count: number;
        percentage: number;
    }[];
}

function createDashboardStore() {
    const { subscribe, set, update } = writable<DashboardData>({
        materials: [],
        stats: {
            totalMaterials: 0,
            totalDownloads: 0,
            uploads: 0,
            activeThisMonth: 0
        },
        categories: []
    });

    return {
        subscribe,
        init: () => {
            const userId = auth.getUserId();
            if (!userId) return;

            const data = localStorage.getItem(`dashboard_${userId}`);
            if (data) {
                set(JSON.parse(data));
            }
        },
        addMaterial: (material: any) => {
            update(state => {
                const newState = {
                    ...state,
                    materials: [material, ...state.materials].slice(0, 10),
                    stats: {
                        ...state.stats,
                        totalMaterials: state.stats.totalMaterials + 1,
                        uploads: state.stats.uploads + 1
                    }
                };
                
                // Update categories
                const categoryIndex = newState.categories.findIndex(c => c.name === material.category);
                if (categoryIndex > -1) {
                    newState.categories[categoryIndex].count++;
                } else {
                    newState.categories.push({ name: material.category, count: 1, percentage: 0 });
                }
                
                // Recalculate percentages
                newState.categories.forEach(cat => {
                    cat.percentage = (cat.count / newState.stats.totalMaterials) * 100;
                });

                // Persist data
                const userId = auth.getUserId();
                if (userId) {
                    localStorage.setItem(`dashboard_${userId}`, JSON.stringify(newState));
                }

                return newState;
            });
        },
        incrementDownloads: (materialId: string) => {
            update(state => {
                const newState = {
                    ...state,
                    stats: {
                        ...state.stats,
                        totalDownloads: state.stats.totalDownloads + 1
                    },
                    materials: state.materials.map(m => 
                        m.id === materialId 
                            ? { ...m, downloads: (m.downloads || 0) + 1 }
                            : m
                    )
                };

                const userId = auth.getUserId();
                if (userId) {
                    localStorage.setItem(`dashboard_${userId}`, JSON.stringify(newState));
                }

                return newState;
            });
        }
    };
}

export const dashboardStore = createDashboardStore();
