import { create } from "zustand";

export type OrgState = {
  id: string;
};

export type OrgActions = {
  setOrg: (org: OrgState) => void;
  getOrg: () => OrgState;
  unsetOrg: () => void;
};

export type OrgStore = OrgState & OrgActions;

export const defaultOrgState: OrgState = {
  id: "123",
};

export const useOrgStore = (initState: OrgState = defaultOrgState) => {
  return create<OrgStore>()((set, get) => ({
    ...initState,
    setOrg: (state: OrgState) => set(state),
    getOrg: () => get(),
    unsetOrg: () => set({ id: "" }),
  }));
};
