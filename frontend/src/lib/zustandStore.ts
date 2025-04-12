import { create } from "zustand"

type State = { count: number }
type Actions = { increment: () => void }

export const useCounterStore = create<State & Actions>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))