'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Locale, VehicleMake, VehicleModel } from '@/lib/api/types';
import { useGarageStore } from '@/stores/useGarageStore';
import { services } from '@/lib/api';
import { getMessages } from '@/lib/i18n';

interface GarageManagerViewProps {
  locale: Locale;
}

export const GarageManagerView: React.FC<GarageManagerViewProps> = ({ locale }) => {
  const t = getMessages(locale);
  const { vehicles, activeVehicle, addVehicle, removeVehicle, selectVehicle } = useGarageStore();

  const [activeTab, setActiveTab] = useState<'picker' | 'vin'>('picker');
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [years, setYears] = useState<number[]>([]);

  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // VIN State
  const [vinInput, setVinInput] = useState('');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinResult, setVinResult] = useState<{ make: string; model: string; year: number } | null>(null);
  const [vinError, setVinError] = useState(false);

  // Fetch makes on mount
  useEffect(() => {
    services.vehicle.getMakes().then(setMakes);
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      setSelectedModel('');
      return;
    }
    services.vehicle.getModels(selectedMake).then((res) => {
      setModels(res);
      setSelectedModel('');
    });
  }, [selectedMake]);

  // Fetch years when model changes
  useEffect(() => {
    if (!selectedMake || !selectedModel) {
      setYears([]);
      setSelectedYear('');
      return;
    }
    services.vehicle.getYears(selectedMake, selectedModel).then((res) => {
      setYears(res);
      setSelectedYear('');
    });
  }, [selectedMake, selectedModel]);

  const handleAddFromPicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMake || !selectedModel || !selectedYear) return;

    addVehicle({
      userId: 'customer-1',
      make: selectedMake,
      model: selectedModel,
      year: parseInt(selectedYear, 10),
      isDefault: vehicles.length === 0,
    });

    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
  };

  const handleDecodeVin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = vinInput.trim().toUpperCase();
    if (clean.length < 5) return;

    try {
      setVinLoading(true);
      setVinError(false);
      const res = await services.vehicle.resolveByVin(clean);
      if (res && res.make && res.model && res.year) {
        setVinResult({
          make: res.make,
          model: res.model,
          year: res.year,
        });
      } else {
        setVinError(true);
      }
    } catch {
      setVinError(true);
    } finally {
      setVinLoading(false);
    }
  };

  const handleAddFromVin = () => {
    if (!vinResult) return;
    addVehicle({
      userId: 'customer-1',
      make: vinResult.make,
      model: vinResult.model,
      year: vinResult.year,
      vin: vinInput.trim().toUpperCase(),
      isDefault: vehicles.length === 0,
    });
    setVinResult(null);
    setVinInput('');
  };

  return (
    <div className="space-y-8">
      {/* Saved Vehicles List */}
      <div className="p-6 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-main flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              <span>{locale === 'ar' ? 'السيارات المحفوظة في جراجك' : 'Saved Vehicles in Your Garage'}</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {locale === 'ar'
                ? 'حدد سيارتك الحالية لتفعيل مؤشرات التوافق التلقائية في المتجر'
                : 'Select your active vehicle to enable 100% fitment badges across the catalog'}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {vehicles.length} {locale === 'ar' ? 'سيارات' : 'vehicles'}
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            {locale === 'ar' ? 'لا توجد سيارات مضافة حالياً. أضف سيارتك أدناه.' : 'No cars in your garage yet. Add one below.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((veh) => {
              const isActive = activeVehicle?.id === veh.id;
              return (
                <div
                  key={veh.id}
                  className={`p-4 rounded-xl border-2 transition-all space-y-3 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                      : 'border-border-color bg-bg-secondary/20 hover:border-text-muted'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-text-main">
                          {veh.make} {veh.model} {veh.year}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                            {locale === 'ar' ? 'مفعلة للتسوق' : 'Active'}
                          </span>
                        )}
                      </div>
                      {veh.vin && (
                        <p className="text-[11px] text-text-muted font-mono">
                          VIN: {veh.vin}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVehicle(veh.id)}
                      className="text-text-muted hover:text-rose-500 transition-colors p-1"
                      title={locale === 'ar' ? 'حذف من الجراج' : 'Remove'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-color/60 text-xs">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => selectVehicle(veh.id)}
                        className="font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{locale === 'ar' ? 'تفعيل هذه السيارة' : 'Make Active'}</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{locale === 'ar' ? 'جاهز للتسوق المتوافق' : 'Fitment Ready'}</span>
                      </span>
                    )}

                    <Link
                      href={`/${locale}/shop?make=${encodeURIComponent(veh.make)}&model=${encodeURIComponent(veh.model)}&year=${veh.year}`}
                      className="text-primary hover:underline font-bold flex items-center gap-1 text-[11px]"
                    >
                      <span>{locale === 'ar' ? 'تسوق قطعها' : 'Shop Parts'}</span>
                      <ExternalLink className="w-3 h-3 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Vehicle Box */}
      <div className="p-6 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-5">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2 border-b border-border-color pb-3">
          <Plus className="w-5 h-5 text-primary" />
          <span>{locale === 'ar' ? 'إضافة سيارة جديدة إلى الجراج' : 'Add a New Vehicle'}</span>
        </h2>

        {/* Tab switch: Make/Model vs VIN */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('picker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'picker'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-bg-secondary text-text-muted hover:text-text-main'
            }`}
          >
            {locale === 'ar' ? 'اختيار الماركة والموديل' : 'By Make, Model & Year'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vin'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-bg-secondary text-text-muted hover:text-text-main'
            }`}
          >
            {locale === 'ar' ? 'برقم الشاسيه (VIN)' : 'By VIN Number'}
          </button>
        </div>

        {activeTab === 'picker' ? (
          <form onSubmit={handleAddFromPicker} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-text-main block">
                {locale === 'ar' ? 'الماركة' : 'Make'}
              </label>
              <select
                required
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 focus:outline-none focus:border-primary"
              >
                <option value="">{locale === 'ar' ? '-- اختر الماركة --' : '-- Select Make --'}</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-text-main block">
                {locale === 'ar' ? 'الموديل' : 'Model'}
              </label>
              <select
                required
                disabled={!selectedMake}
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 disabled:opacity-50 focus:outline-none focus:border-primary"
              >
                <option value="">{locale === 'ar' ? '-- اختر الموديل --' : '-- Select Model --'}</option>
                {models.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-text-main block">
                {locale === 'ar' ? 'سنة الصنع' : 'Year'}
              </label>
              <select
                required
                disabled={!selectedModel}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 disabled:opacity-50 focus:outline-none focus:border-primary font-mono"
              >
                <option value="">{locale === 'ar' ? '-- السنة --' : '-- Year --'}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!selectedMake || !selectedModel || !selectedYear}
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'ar' ? 'إضافة للجراج' : 'Add to Garage'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleDecodeVin} className="flex gap-2">
              <input
                type="text"
                placeholder={locale === 'ar' ? 'أدخل رقم الشاسيه (17 حرف/رقم - مثال: JTDBR32E123456789)...' : 'Enter 17-digit VIN (e.g. JTDBR32E123456789)...'}
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 font-mono uppercase text-xs focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={vinLoading || vinInput.length < 5}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{vinLoading ? (locale === 'ar' ? 'فك التشفير...' : 'Decoding...') : (locale === 'ar' ? 'فك التشفير' : 'Decode')}</span>
              </button>
            </form>

            {vinError && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {locale === 'ar' ? 'تعذر فك تشفير رقم الشاسيه. يرجى التأكد من الرقم.' : 'Could not decode VIN. Please verify.'}
              </p>
            )}

            {vinResult && (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                    {locale === 'ar' ? 'تم التعرف على السيارة بنجاح' : 'Vehicle Identified'}
                  </span>
                  <p className="font-extrabold text-sm text-emerald-950 mt-0.5">
                    {vinResult.make} {vinResult.model} ({vinResult.year})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFromVin}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  {locale === 'ar' ? 'تأكيد وإضافة للجراج' : 'Confirm & Add'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
