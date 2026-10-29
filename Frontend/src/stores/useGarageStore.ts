import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerVehicle, VehicleCompatibility } from '../lib/api/types';

interface GarageState {
  vehicles: CustomerVehicle[];
  activeVehicle: CustomerVehicle | null;
  setActiveVehicle: (vehicle: CustomerVehicle | null) => void;
  addVehicle: (vehicle: Omit<CustomerVehicle, 'id'>) => CustomerVehicle;
  removeVehicle: (id: string) => void;
  selectVehicle: (id: string) => void;
  checkFitment: (compatibilities: VehicleCompatibility[]) => 'fits' | 'does-not-fit' | 'unknown';
}

export const useGarageStore = create<GarageState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      activeVehicle: null,

      setActiveVehicle: (vehicle) => set({ activeVehicle: vehicle }),

      addVehicle: (data) => {
        const newVehicle: CustomerVehicle = {
          ...data,
          id: `veh-${Date.now()}`,
          isDefault: data.isDefault ?? false,
        };

        const updatedVehicles = data.isDefault
          ? get().vehicles.map((v) => ({ ...v, isDefault: false }))
          : [...get().vehicles];

        updatedVehicles.unshift(newVehicle);

        set({
          vehicles: updatedVehicles,
          activeVehicle: data.isDefault ? newVehicle : get().activeVehicle || newVehicle,
        });

        return newVehicle;
      },

      removeVehicle: (id: string) => {
        const remaining = get().vehicles.filter((v) => v.id !== id);
        const isActiveRemoved = get().activeVehicle?.id === id;
        set({
          vehicles: remaining,
          activeVehicle: isActiveRemoved ? remaining[0] || null : get().activeVehicle,
        });
      },

      selectVehicle: (id: string) => {
        const found = get().vehicles.find((v) => v.id === id);
        if (found) {
          set({ activeVehicle: found });
        }
      },

      checkFitment: (compatibilities: VehicleCompatibility[]) => {
        const { activeVehicle } = get();
        if (!activeVehicle) return 'unknown';
        if (!compatibilities || compatibilities.length === 0) return 'unknown';

        const match = compatibilities.some((c) => {
          const makeMatches = c.make.trim().toLowerCase() === activeVehicle.make.trim().toLowerCase();
          const modelMatches = c.model.trim().toLowerCase() === activeVehicle.model.trim().toLowerCase();
          const yearMatches = activeVehicle.year >= c.yearFrom && activeVehicle.year <= c.yearTo;
          return makeMatches && modelMatches && yearMatches;
        });

        return match ? 'fits' : 'does-not-fit';
      },
    }),
    {
      name: 'otlob_garage_storage',
    }
  )
);
