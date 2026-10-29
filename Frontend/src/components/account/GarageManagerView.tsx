'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardBody,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Input,
  Button,
  Chip,
  Divider,
} from '@heroui/react';
import {
  Car,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  Search,
  ExternalLink,
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

  const [activeTab, setActiveTab] = useState<string>('picker');
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

  useEffect(() => {
    services.vehicle.getMakes().then(setMakes);
  }, []);

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
      <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-white" />
              <span>{locale === 'ar' ? 'السيارات المحفوظة في جراجك' : 'Saved Vehicles in Your Garage'}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {locale === 'ar'
                ? 'حدد سيارتك الحالية لتفعيل مؤشرات التوافق التلقائية في المتجر'
                : 'Select your active vehicle to enable 100% fitment badges across the catalog'}
            </p>
          </div>
          <Chip size="sm" variant="flat" className="bg-[#171717] text-white border border-[#262626] font-mono">
            {vehicles.length} {locale === 'ar' ? 'سيارات' : 'vehicles'}
          </Chip>
        </div>

        {vehicles.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 font-mono">
            {locale === 'ar' ? 'لا توجد سيارات مضافة حالياً. أضف سيارتك أدناه.' : 'No cars in your garage yet. Add one below.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((veh) => {
              const isActive = activeVehicle?.id === veh.id;
              return (
                <div
                  key={veh.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isActive
                      ? 'border-white bg-[#141414] shadow-sm'
                      : 'border-[#262626] bg-[#111111] hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">
                          {veh.make} {veh.model} {veh.year}
                        </h3>
                        {isActive && (
                          <Chip size="sm" color="success" variant="flat" className="font-mono text-[10px]">
                            {locale === 'ar' ? 'مفعلة للتسوق' : 'Active'}
                          </Chip>
                        )}
                      </div>
                      {veh.vin && (
                        <p className="text-[11px] text-neutral-400 font-mono">
                          VIN: {veh.vin}
                        </p>
                      )}
                    </div>

                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => removeVehicle(veh.id)}
                      className="text-neutral-500 hover:text-rose-400 w-7 h-7 min-w-7"
                      aria-label="Remove vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-xs">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => selectVehicle(veh.id)}
                        className="font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{locale === 'ar' ? 'تفعيل هذه السيارة' : 'Make Active'}</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{locale === 'ar' ? 'جاهز للتسوق المتوافق' : 'Fitment Ready'}</span>
                      </span>
                    )}

                    <Link
                      href={`/${locale}/shop?make=${encodeURIComponent(veh.make)}&model=${encodeURIComponent(veh.model)}&year=${veh.year}`}
                      className="text-neutral-300 hover:text-white underline font-semibold flex items-center gap-1 text-[11px]"
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
      </Card>

      {/* Add New Vehicle Box */}
      <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#262626] pb-3">
          <Plus className="w-5 h-5 text-white" />
          <span>{locale === 'ar' ? 'إضافة سيارة جديدة إلى الجراج' : 'Add a New Vehicle'}</span>
        </h2>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(String(key))}
          variant="solid"
          classNames={{
            tabList: 'bg-[#111111] border border-[#262626]',
            cursor: 'bg-white text-black font-bold',
            tab: 'text-neutral-400 data-[selected=true]:text-black text-xs font-semibold',
          }}
        >
          <Tab
            key="picker"
            title={locale === 'ar' ? 'اختيار الماركة والموديل' : 'By Make, Model & Year'}
          >
            <form onSubmit={handleAddFromPicker} className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <Select
                  label={locale === 'ar' ? 'الماركة' : 'Make'}
                  placeholder={locale === 'ar' ? 'اختر الماركة' : 'Select Make'}
                  selectedKeys={selectedMake ? [selectedMake] : []}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  size="sm"
                  variant="bordered"
                  classNames={{
                    trigger: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                    popoverContent: 'bg-[#0a0a0a] border border-[#262626]',
                    label: 'text-neutral-400 font-medium text-xs',
                  }}
                >
                  {makes.map((m) => (
                    <SelectItem key={m.name} textValue={m.name} className="text-white hover:bg-[#1f1f1f]">
                      {m.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label={locale === 'ar' ? 'الموديل' : 'Model'}
                  placeholder={locale === 'ar' ? 'اختر الموديل' : 'Select Model'}
                  selectedKeys={selectedModel ? [selectedModel] : []}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  isDisabled={!selectedMake}
                  size="sm"
                  variant="bordered"
                  classNames={{
                    trigger: 'border-[#262626] bg-[#111111] hover:border-neutral-600 disabled:opacity-40',
                    popoverContent: 'bg-[#0a0a0a] border border-[#262626]',
                    label: 'text-neutral-400 font-medium text-xs',
                  }}
                >
                  {models.map((m) => (
                    <SelectItem key={m.name} textValue={m.name} className="text-white hover:bg-[#1f1f1f]">
                      {m.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label={locale === 'ar' ? 'سنة الصنع' : 'Year'}
                  placeholder={locale === 'ar' ? 'السنة' : 'Year'}
                  selectedKeys={selectedYear ? [selectedYear] : []}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  isDisabled={!selectedModel}
                  size="sm"
                  variant="bordered"
                  classNames={{
                    trigger: 'border-[#262626] bg-[#111111] hover:border-neutral-600 disabled:opacity-40',
                    popoverContent: 'bg-[#0a0a0a] border border-[#262626]',
                    label: 'text-neutral-400 font-medium text-xs',
                  }}
                >
                  {years.map((y) => (
                    <SelectItem key={String(y)} textValue={String(y)} className="text-white hover:bg-[#1f1f1f] font-mono">
                      {String(y)}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  isDisabled={!selectedMake || !selectedModel || !selectedYear}
                  className="w-full bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors py-5 disabled:opacity-40 shadow-sm"
                  startContent={<Plus className="w-4 h-4" />}
                >
                  {locale === 'ar' ? 'إضافة للجراج' : 'Add to Garage'}
                </Button>
              </div>
            </form>
          </Tab>

          <Tab
            key="vin"
            title={locale === 'ar' ? 'برقم الشاسيه (VIN)' : 'By VIN Number'}
          >
            <div className="pt-4 space-y-4">
              <form onSubmit={handleDecodeVin} className="flex gap-2">
                <Input
                  size="sm"
                  variant="bordered"
                  placeholder={locale === 'ar' ? 'أدخل رقم الشاسيه (17 حرف/رقم)...' : 'Enter 17-digit VIN...'}
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value)}
                  classNames={{
                    inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                    input: 'text-xs uppercase font-mono tracking-wider',
                  }}
                />
                <Button
                  type="submit"
                  isLoading={vinLoading}
                  isDisabled={vinInput.length < 5}
                  className="bg-white text-black font-bold text-xs hover:bg-neutral-200 px-5 shadow-sm"
                  startContent={!vinLoading && <Search className="w-3.5 h-3.5" />}
                >
                  {locale === 'ar' ? 'فك التشفير' : 'Decode'}
                </Button>
              </form>

              {vinError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {locale === 'ar' ? 'تعذر فك تشفير رقم الشاسيه. يرجى التأكد من الرقم.' : 'Could not decode VIN. Please verify.'}
                </p>
              )}

              {vinResult && (
                <div className="p-4 rounded-xl border border-white/20 bg-[#141414] flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase block">
                      {locale === 'ar' ? 'تم التعرف على السيارة بنجاح' : 'Vehicle Identified'}
                    </span>
                    <p className="font-bold text-sm text-white mt-0.5">
                      {vinResult.make} {vinResult.model} ({vinResult.year})
                    </p>
                  </div>
                  <Button
                    onPress={handleAddFromVin}
                    className="bg-white text-black font-bold text-xs hover:bg-neutral-200 px-4"
                  >
                    {locale === 'ar' ? 'تأكيد وإضافة للجراج' : 'Confirm & Add'}
                  </Button>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
};
