'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Divider,
} from '@heroui/react';
import { Car, Search, Check, ArrowRight } from 'lucide-react';
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
  const [isDecodingVin, setIsDecodingVin] = useState<boolean>(false);

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
      setVinError(
        locale === 'ar'
          ? 'رقم الشاسيه يجب أن يتكون من 17 رمزاً بالضبط'
          : 'VIN must be exactly 17 characters'
      );
      return;
    }

    setVinError(null);
    setIsDecodingVin(true);
    try {
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
    } finally {
      setIsDecodingVin(false);
    }
  };

  return (
    <>
      {/* Trigger Button displayed in Header */}
      <button
        type="button"
        onClick={() => setVehicleFinderOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0a0a0a] hover:bg-[#141414] border border-[#262626] text-start transition-all cursor-pointer group hover:border-neutral-700"
      >
        <div className="w-8 h-8 rounded-lg bg-[#171717] border border-[#262626] flex items-center justify-center text-white group-hover:border-neutral-600 transition-colors">
          <Car className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="block text-neutral-400 font-medium text-[11px] leading-tight">
            {t.vehicleFinder.title}
          </span>
          <span className="font-bold text-white truncate max-w-[130px] block font-mono text-[11px]">
            {activeVehicle
              ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}`
              : t.vehicleFinder.selectMake}
          </span>
        </div>
      </button>

      {/* Modal Dialog */}
      <Modal
        isOpen={isVehicleFinderOpen}
        onOpenChange={(open) => setVehicleFinderOpen(open)}
        size="xl"
        backdrop="blur"
        placement="center"
        classNames={{
          backdrop: 'bg-black/80 backdrop-blur-md',
          base: 'bg-[#0a0a0a] border border-[#262626] text-[#ededed] shadow-2xl rounded-2xl',
          header: 'border-b border-[#262626] p-5 bg-[#0a0a0a]',
          body: 'p-6 space-y-6',
          closeButton: 'hover:bg-[#262626] text-neutral-400 hover:text-white',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {t.vehicleFinder.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-normal mt-0.5">
                    {t.vehicleFinder.subtitle}
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                {/* Cascading Make -> Model -> Year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Make */}
                  <Select
                    label={t.vehicleFinder.selectMake}
                    placeholder={t.vehicleFinder.selectMake}
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
                    {makes.map((mk) => (
                      <SelectItem key={mk.name} textValue={mk.name} className="text-white hover:bg-[#1f1f1f]">
                        {mk.name}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Model */}
                  <Select
                    label={t.vehicleFinder.selectModel}
                    placeholder={t.vehicleFinder.selectModel}
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
                    {models.map((md) => (
                      <SelectItem key={md.name} textValue={md.name} className="text-white hover:bg-[#1f1f1f]">
                        {md.name}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Year */}
                  <Select
                    label={t.vehicleFinder.selectYear}
                    placeholder={t.vehicleFinder.selectYear}
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

                {/* Find Parts CTA */}
                <Button
                  onPress={handleFindParts}
                  isDisabled={!selectedMake || !selectedModel || !selectedYear}
                  className="w-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors py-6 disabled:opacity-40 shadow-sm"
                  endContent={<ArrowRight className="w-4 h-4 rtl-mirror" />}
                >
                  {t.vehicleFinder.findParts}
                </Button>

                <div className="relative flex items-center justify-center my-2">
                  <Divider className="bg-[#262626]" />
                  <span className="absolute bg-[#0a0a0a] px-3 text-[11px] text-neutral-500 font-mono uppercase">
                    {locale === 'ar' ? 'أو' : 'OR'}
                  </span>
                </div>

                {/* VIN Search */}
                <div className="bg-[#111111] p-4 rounded-xl border border-[#262626] space-y-3">
                  <label className="block text-xs font-semibold text-neutral-300">
                    {t.vehicleFinder.vinSearchTitle}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      size="sm"
                      variant="bordered"
                      value={vinQuery}
                      onChange={(e) => setVinQuery(e.target.value.toUpperCase())}
                      maxLength={17}
                      placeholder={t.vehicleFinder.vinPlaceholder}
                      classNames={{
                        inputWrapper: 'border-[#262626] bg-[#0a0a0a] hover:border-neutral-600',
                        input: 'text-xs uppercase font-mono tracking-wider',
                      }}
                    />
                    <Button
                      onPress={handleVinSearch}
                      isLoading={isDecodingVin}
                      variant="flat"
                      className="bg-[#171717] hover:bg-[#262626] text-white border border-[#262626] text-xs font-semibold px-4"
                    >
                      {t.vehicleFinder.decodeVin}
                    </Button>
                  </div>
                  {vinError && <p className="text-xs text-rose-400 font-medium">{vinError}</p>}
                </div>

                {/* Saved Garage Vehicles */}
                {vehicles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                      {t.vehicleFinder.savedCars}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {vehicles.map((car) => {
                        const isActive = activeVehicle?.id === car.id;
                        return (
                          <Chip
                            key={car.id}
                            variant={isActive ? 'solid' : 'bordered'}
                            color={isActive ? 'primary' : 'default'}
                            className={`cursor-pointer transition-all ${
                              isActive
                                ? 'bg-white text-black font-bold'
                                : 'border-[#262626] text-neutral-300 hover:border-neutral-500 bg-[#111111]'
                            }`}
                            onClick={() => {
                              selectVehicle(car.id);
                              setVehicleFinderOpen(false);
                              router.push(
                                `/${locale}/shop?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(
                                  car.model
                                )}&year=${car.year}`
                              );
                            }}
                            startContent={isActive ? <Check className="w-3.5 h-3.5 ms-1" /> : undefined}
                          >
                            {`${car.make} ${car.model} (${car.year})`}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
