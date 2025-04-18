import { writable } from "svelte/store";
import type { Activity, ActivityType } from "$lib/types/activity";
import { auth } from "./auth";

function createActivityStore() {
  const { subscribe, update } = writable<Activity[]>([]);

  return {
    subscribe,
    add: (type: ActivityType, data: Partial<Activity>) => {
      const activity: Activity = {
        id: crypto.randomUUID(),
        type,
        title: data.title || "",
        description: data.description || "",
        timestamp: new Date().toISOString(),
        metadata: data.metadata,
      };

      update((activities) => {
        const newActivities = [activity, ...activities].slice(0, 10);
        const userId = auth.getUserId();
        if (userId) {
          localStorage.setItem(
            `activities_${userId}`,
            JSON.stringify(newActivities)
          );
        }
        return newActivities;
      });
    },
    init: () => {
      const userId = auth.getUserId();
      if (userId) {
        const stored = localStorage.getItem(`activities_${userId}`);
        if (stored) {
          update(() => JSON.parse(stored));
        }
      }
    },
  };
}

export const activityStore = createActivityStore();
