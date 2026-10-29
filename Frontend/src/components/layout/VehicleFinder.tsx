'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Search, X, Check, ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { getMessages } from '@/lib/i18n';
import { useGarageStore } from '@/stores/useGarageStore';
import { useUIStore } from '@/stores/useUIStore';
import { services } from '@/lib/api';

interface VehicleFinderProps {
  locale: Locale;
}

export const VehicleFinder: React.FC<VehicleFinderProps> = ({ locale }) => {
  const t = getMessages(locale);
  const router = useRouter();
  const { isVehicleFinderOpen, setVehicleFinderOpen } = useUIStore();
  const { activeVehicle, vehicles = [], addVehicle, selectVehicle } = useGarageStore();

  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [vinQuery, setVinQuery] = useState<string>('');
  const [vinError, setVinError] = useState<string | null>(null);

  useEffect(() => {
    services.vehicle.getMakes().then(setMakes);
  }, []);

  useEffect(() => {
    if (selectedMake) {
      services.vehicle.getModels(selectedMake).then((res) => {
        setModels(res);
        setSelectedModel('');
        setYears([]);
        setSelectedYear('');
      });
    } else {
      setModels([]);
      setSelectedModel('');
      setYears([]);
      setSelectedYear('');
    }
  }, [selectedMake]);

  useEffect(() => {
    if (selectedMake && selectedModel) {
      services.vehicle.getYears(selectedMake, selectedModel).then((res) => {
        setYears(res);
        setSelectedYear('');
      });
    }
  }, [selectedMake, selectedModel]);

  const handleFindParts = () => {
    if (!selectedMake || !selectedModel || !selectedYear) return;

    // Add to garage store
    addVehicle({
      userId: 'guest',
      make: selectedMake,
      model: selectedModel,
      year: parseInt(selectedYear, 10),
      isDefault: true,
    });

    setVehicleFinderOpen(false);
    router.push(
      `/${locale}/shop?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(
        selectedModel
      )}&year=${selectedYear}`
    );
  };

  const handleVinSearch = async () => {
    if (!vinQuery || vinQuery.trim().length !== 17) {
      setVinError(locale === 'ar' ? 'رقم الشاسيه يجب أن يتكون من 17 رمزاً بالضبط' : 'VIN must be exactly 17 characters');
      return;
    }

    setVinError(null);
    const decoded = await services.vehicle.resolveByVin(vinQuery.trim());
    if (decoded && decoded.make && decoded.model && decoded.year) {
      addVehicle({
        userId: 'guest',
        make: decoded.make,
        model: decoded.model,
        year: decoded.year,
        vin: vinQuery.trim(),
        isDefault: true,
      });
      setVehicleFinderOpen(false);
      router.push(
        `/${locale}/shop?make=${encodeURIComponent(decoded.make)}&model=${encodeURIComponent(
          decoded.model
        )}&year=${decoded.year}&vin=${encodeURIComponent(vinQuery.trim())}`
      );
    } else {
      setVinError(
        locale === 'ar'
          ? 'تعذر تحديد الموديل بدقة من هذا الشاسيه. يرجى اختيار السيارة يدوياً.'
          : 'Could not resolve vehicle from VIN. Please select manually.'
      );
    }
  };

  return (
    <>
      {/* Trigger Button displayed in Header */}
      <button
        onClick={() => setVehicleFinderOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted hover:bg-slate-200 dark:hover:bg-slate-800 border border-surface-border text-start transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
          <Car className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="block text-text-muted font-medium">{t.vehicleFinder.title}</span>
          <span className="font-bold text-text truncate max-w-[130px] block">
            {activeVehicle
              ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}`
              : t.vehicleFinder.selectMake}
          </span>
        </div>
      </button>

      {/* Modal Dialog */}
      {isVehicleFinderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface w-full max-w-xl rounded-2xl shadow-2xl border border-surface-border overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">{t.vehicleFinder.title}</h3>
                  <p className="text-xs text-text-muted">{t.vehicleFinder.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setVehicleFinderOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Cascading Make -> Model -> Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Make */}
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    {t.vehicleFinder.selectMake}
                  </label>
                  <select
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-lg bg-surface border border-surface-border text-text outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="">-- {t.vehicleFinder.selectMake} --</option>
                    {makes.map((mk) => (
                      <option key={mk.id} value={mk.name}>
                        {mk.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    {t.vehicleFinder.selectModel}
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!selectedMake}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-lg bg-surface border border-surface-border text-text outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <option value="">-- {t.vehicleFinder.selectModel} --</option>
                    {models.map((md) => (
                      <option key={md.id} value={md.name}>
                        {md.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    {t.vehicleFinder.selectYear}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    disabled={!selectedModel}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-lg bg-surface border border-surface-border text-text outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <option value="">-- {t.vehicleFinder.selectYear} --</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Find Parts CTA */}
              <button
                onClick={handleFindParts}
                disabled={!selectedMake || !selectedModel || !selectedYear}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-primary-foreground shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{t.vehicleFinder.findParts}</span>
                <ArrowRight className="w-4 h-4 rtl-mirror" />
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-surface-border w-full"></div>
                <span className="bg-surface px-3 text-xs text-text-muted font-medium uppercase">
                  {locale === 'ar' ? 'أو' : 'OR'}
                </span>
              </div>

              {/* VIN Search */}
              <div className="bg-surface-muted p-4 rounded-xl border border-surface-border space-y-2">
                <label className="block text-xs font-semibold text-text">
                  {t.vehicleFinder.vinSearchTitle}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vinQuery}
                    onChange={(e) => setVinQuery(e.target.value.toUpperCase())}
                    maxLength={17}
                    placeholder={t.vehicleFinder.vinPlaceholder}
                    className="flex-1 text-xs px-3 py-2.5 rounded-lg bg-surface border border-surface-border text-text uppercase font-mono tracking-wider outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleVinSearch}
                    className="px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-hover text-secondary-foreground text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.vehicleFinder.decodeVin}
                  </button>
                </div>
                {vinError && <p className="text-xs text-danger font-medium">{vinError}</p>}
              </div>

              {/* Saved Garage Vehicles */}
              {vehicles.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase mb-2">
                    {t.vehicleFinder.savedCars}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {vehicles.map((car) => {
                      const isActive = activeVehicle?.id === car.id;
                      return (
                        <button
                          key={car.id}
                          onClick={() => {
                            selectVehicle(car.id);
                            setVehicleFinderOpen(false);
                            router.push(
                              `/${locale}/shop?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(
                                car.model
                              )}&year=${car.year}`
                            );
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-surface border-surface-border text-text hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isActive && <Check className="w-3.5 h-3.5" />}
                          <span>{`${car.make} ${car.model} (${car.year})`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
