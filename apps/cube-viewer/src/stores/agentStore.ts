import { create } from "zustand";
import type { DeployedObject } from "@cubepay/types";
import type { CubePayDatabase } from "@cubepay/database-client";

interface AgentStore {
  agents: DeployedObject[];
  loadAgents: (db: CubePayDatabase) => Promise<void>;
  subscribeToAgents: (db: CubePayDatabase) => () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  
  loadAgents: async (db: CubePayDatabase) => {
    const agents = await db.getAllAgents({ payment_enabled: true });
    set({ agents });
  },
  
  subscribeToAgents: (db: CubePayDatabase) => {
    const subscription = db.subscribeToAgents((agent) => {
      set((state) => {
        const exists = state.agents.find((a) => a.id === agent.id);
        if (exists) {
          return {
            agents: state.agents.map((a) => (a.id === agent.id ? agent : a)),
          };
        }
        return { agents: [...state.agents, agent] };
      });
    });
    
    return () => subscription.unsubscribe();
  },
}));
