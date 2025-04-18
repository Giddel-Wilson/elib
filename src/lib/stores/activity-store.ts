import { writable } from "svelte/store";
import { auth } from "./auth";

export interface Activity {
  id: string;
  type: "upload" | "download" | "feedback" | "reading";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    courseCode?: string;
    level?: string;
    downloads?: number;
    status?: string;
    url?: string;
  };
}

function createActivityStore() {
  const { subscribe, set, update } = writable<Activity[]>([]);

  return {
    subscribe,
    add: (activity: Omit<Activity, "id" | "timestamp">) => {
      try {
        const userId = auth.getUserId();
        if (!userId) {
          console.warn("No user ID found, activity not saved");
          return;
        }

        update((activities) => {
          const newActivity = {
            ...activity,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          };
          const newActivities = [newActivity, ...activities.slice(0, 19)];
          localStorage.setItem(
            `activities_${userId}`,
            JSON.stringify(newActivities)
          );
          return newActivities;
        });
      } catch (error) {
        console.error("Failed to add activity:", error);
      }
    },
    init: () => {
      try {
        const userId = auth.getUserId();
        if (!userId) {
          console.warn("No user ID found, no activities loaded");
          return;
        }

        const stored = localStorage.getItem(`activities_${userId}`);
        if (stored) {
          set(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to initialize activities:", error);
        set([]);
      }
    },
  };
}

export const activityStore = createActivityStore();
