import { writable, derived } from "svelte/store";
import { auth } from "./auth";

const API_URL = "https://focbackend.emmanuelngoka.work/api/v1";

interface Material {
  id: string;
  title: string;
  courseCode: string;
  level: string;
  category: string;
  description: string;
  downloads: number;
  url: string;
  createdAt: string;
}

function createMaterialsStore() {
  const { subscribe, set, update } = writable<Material[]>([]);

  return {
    subscribe,
    fetchAll: async () => {
      try {
        const response = await fetch(`${API_URL}/materials`);
        if (!response.ok) throw new Error("Failed to fetch materials");
        const data = await response.json();
        set(data);
      } catch (error) {
        console.error("Error fetching materials:", error);
        set([]);
      }
    },
    add: (material: Material) => {
      update((items) => {
        const newItems = [material, ...items];
        localStorage.setItem("materials", JSON.stringify(newItems));
        return newItems;
      });
    },
    init: () => {
      const stored = localStorage.getItem("materials");
      if (stored) {
        set(JSON.parse(stored));
      }
    },
    incrementDownloads: (id: string) => {
      update((items) => {
        const newItems = items.map((item) =>
          item.id === id
            ? { ...item, downloads: (item.downloads || 0) + 1 }
            : item
        );
        localStorage.setItem("materials", JSON.stringify(newItems));
        return newItems;
      });
    },
  };
}

export const materials = createMaterialsStore();

// Derive categories and stats
export const categories = derived(materials, ($materials) => {
  const cats = $materials.reduce(
    (acc, material) => {
      const cat = acc.find((c) => c.name === material.category);
      if (cat) {
        cat.count++;
      } else {
        acc.push({ name: material.category, count: 1 });
      }
      return acc;
    },
    [] as { name: string; count: number }[]
  );

  const total = $materials.length;
  return cats.map((cat) => ({
    ...cat,
    percentage: (cat.count / total) * 100,
  }));
});
