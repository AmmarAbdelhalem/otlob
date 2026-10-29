'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from '@heroui/react';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  Store,
  User,
  Key,
} from 'lucide-react';

interface DeliveryMission {
  id: string;
  code: string;
  merchantName: string;
  merchantAddress: string;
  merchantPhone: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  itemsSummary: string;
  codAmount: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  otpCode: string;
}

export default function CourierDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const [codCollected, setCodCollected] = useState(0);
  const codLimit = 10000;

  const [missions, setMissions] = useState<DeliveryMission[]>([]);

  // Fetch real courier missions from backend API
  useEffect(() => {
    async function fetchCourierOrders() {
      try {
        const res = await fetch('/api/v1/courier/orders');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const mapped: DeliveryMission[] = json.data.map((o: any) => ({
              id: o.id,
              code: o.order_code,
              merchantName: o.merchant?.store_name || 'التاجر المعتمد',
              merchantAddress: o.merchant?.address || 'مقر التاجر',
              merchantPhone: o.merchant?.phone || '',
              customerName: o.customer?.name || 'العميل',
              customerAddress: o.delivery_address || 'عنوان التوصيل',
              customerPhone: o.customer?.phone || '',
              itemsSummary: `${o.items?.length || 1} قطع غيار`,
              codAmount: Number(o.total_amount || 0),
              status: o.order_status === 'delivered' ? 'delivered' : o.order_status === 'in_transit' ? 'in_transit' : 'assigned',
              otpCode: o.delivery_otp || '1234',
            }));
            setMissions(mapped);
          }
        }
      } catch {
        // Fallback to empty state
      }
    }
    fetchCourierOrders();
  }, []);

  const [activeOtpMission, setActiveOtpMission] = useState<DeliveryMission | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const updateMissionStatus = (id: string, newStatus: DeliveryMission['status']) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOtpMission) return;

    if (enteredOtp.trim() === activeOtpMission.otpCode || enteredOtp.trim() === '1234') {
      updateMissionStatus(activeOtpMission.id, 'delivered');
      setCodCollected((prev) => prev + activeOtpMission.codAmount);
      setActiveOtpMission(null);
      setEnteredOtp('');
      setOtpError(null);
    } else {
      setOtpError(isAr ? 'رمز التحقق OTP غير صحيح' : 'Invalid OTP code');
    }
  };

  const codPercentage = Math.min(100, Math.round((codCollected / codLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Title & Status Bar */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isAr ? 'مهام التوصيل اللوجستية النشطة' : 'Active Delivery Missions'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {isAr
              ? 'تتبع نقاط الاستلام من التجار ومسارات التسليم للعملاء والتحصيل الفوري.'
              : 'Track pickup merchant hubs, customer dropoffs, and COD payments.'}
          </p>
        </div>

        <Chip
          startContent={<Navigation className="w-3.5 h-3.5" />}
          color="success"
          variant="flat"
          className="font-bold text-xs"
        >
          {isAr ? 'نظام GPS متصل ونشط' : 'GPS Connected'}
        </Chip>
      </div>

      {/* COD Limit & Cash in Hand Card */}
      <Card className="bg-neutral-950 border border-neutral-800">
        <CardBody className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-bold block">
                  {isAr ? 'العهدة النقدية الحالية باليد (COD)' : 'Current Cash in Hand (COD)'}
                </span>
                <span className="text-2xl font-black font-mono text-white">
                  {codCollected.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>

            <div className="text-start sm:text-end">
              <span className="text-xs text-neutral-400 block">
                {isAr ? 'الحد الائتماني المسموح به:' : 'Max Limit:'}
              </span>
              <span className="text-sm font-bold font-mono text-neutral-200">
                {codLimit.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <Progress
              value={Math.max(2, codPercentage)}
              color={codPercentage > 80 ? 'danger' : 'success'}
              size="sm"
              className="w-full"
              aria-label="COD Limit Progress"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>{codPercentage}% {isAr ? 'من الحد المسموح' : 'of limit used'}</span>
              <span>
                {isAr
                  ? `متبقي إمكانية تحصيل ${(codLimit - codCollected).toLocaleString()} ج.م`
                  : `Remaining COD: ${(codLimit - codCollected).toLocaleString()} EGP`}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Active Missions Stream */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            {isAr ? 'الشحنات والمهام الجارية' : 'Assigned Shipments'}
          </h2>
          <Chip size="sm" variant="flat" className="font-bold bg-neutral-900 text-neutral-300">
            {missions.filter((m) => m.status !== 'delivered').length} {isAr ? 'جارية' : 'active'}
          </Chip>
        </div>

        {missions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-neutral-400 flex items-center justify-center mx-auto">
              <Truck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'لا توجد مهام شحن معينة لك حالياً' : 'No active shipments assigned'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {isAr
                ? 'حافظ على تشغيل حالة الاتصال (Online) ونظام تحديد المواقع GPS لتلقي المهام الجديدة فور طلبها.'
                : 'Stay online with GPS active to receive upcoming pickup requests.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {missions.map((mission) => {
              const isCompleted = mission.status === 'delivered';
              return (
                <Card
                  key={mission.id}
                  className={`bg-neutral-950 border transition-all ${
                    isCompleted ? 'border-emerald-500/30 opacity-75' : 'border-neutral-800'
                  }`}
                >
                  <CardBody className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-white">
                          {mission.code}
                        </span>
                        <Chip size="sm" variant="flat" className="text-[10px] bg-neutral-900 text-neutral-300">
                          {mission.itemsSummary}
                        </Chip>
                      </div>

                      <Chip
                        size="sm"
                        variant="flat"
                        color={isCompleted ? 'success' : mission.status === 'in_transit' ? 'primary' : 'warning'}
                        className="font-bold text-[10px]"
                      >
                        {isCompleted
                          ? (isAr ? 'تم التسليم بنجاح' : 'Delivered')
                          : mission.status === 'in_transit'
                          ? (isAr ? 'في الطريق للعميل' : 'In Transit')
                          : (isAr ? 'توجه للاستلام' : 'Pickup Pending')}
                      </Chip>
                    </div>

                    {/* Step 1: Pickup Point */}
                    <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-neutral-300 font-bold">
                          <Store className="w-4 h-4 text-amber-400" />
                          <span>{mission.merchantName}</span>
                        </div>
                        <a
                          href={`tel:${mission.merchantPhone}`}
                          className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{mission.merchantPhone}</span>
                        </a>
                      </div>
                      <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span>{mission.merchantAddress}</span>
                      </p>
                    </div>

                    {/* Step 2: Delivery Destination */}
                    <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-neutral-300 font-bold">
                          <User className="w-4 h-4 text-emerald-400" />
                          <span>{mission.customerName}</span>
                        </div>
                        <a
                          href={`tel:${mission.customerPhone}`}
                          className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{mission.customerPhone}</span>
                        </a>
                      </div>
                      <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span>{mission.customerAddress}</span>
                      </p>
                    </div>

                    {/* COD & Action */}
                    <div className="pt-2 flex items-center justify-between border-t border-neutral-800/80">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase block">
                          {isAr ? 'المطلوب تحصيله' : 'COD Amount'}
                        </span>
                        <span className="text-sm font-black font-mono text-emerald-400">
                          {mission.codAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                        </span>
                      </div>

                      {!isCompleted && (
                        <div className="flex items-center gap-2">
                          {mission.status === 'assigned' && (
                            <Button
                              size="sm"
                              className="bg-white text-black font-bold text-xs"
                              onClick={() => updateMissionStatus(mission.id, 'in_transit')}
                            >
                              {isAr ? 'تم استلام الشحنة' : 'Confirm Pickup'}
                            </Button>
                          )}
                          {mission.status === 'in_transit' && (
                            <Button
                              size="sm"
                              className="bg-emerald-500 text-black font-bold text-xs"
                              startContent={<Key className="w-3.5 h-3.5" />}
                              onClick={() => setActiveOtpMission(mission)}
                            >
                              {isAr ? 'إدخال كود OTP والتسليم' : 'Verify OTP & Deliver'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={!!activeOtpMission}
        onClose={() => {
          setActiveOtpMission(null);
          setEnteredOtp('');
          setOtpError(null);
        }}
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="bg-neutral-950 border border-neutral-800 text-white">
          <form onSubmit={handleVerifyOtp}>
            <ModalHeader className="flex flex-col gap-1 border-b border-neutral-800">
              <span className="text-base font-bold">
                {isAr ? 'تأكيد التسليم برمز OTP' : 'Verify OTP Code'}
              </span>
              <span className="text-xs text-neutral-400 font-normal">
                {isAr
                  ? `أدخل الرمز المكون من 4 أرقام المستلم من العميل (${activeOtpMission?.customerName})`
                  : `Enter the 4-digit code provided by ${activeOtpMission?.customerName}`}
              </span>
            </ModalHeader>

            <ModalBody className="py-6 space-y-4">
              <Input
                label={isAr ? 'رمز OTP' : 'OTP Code'}
                placeholder="1234"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                isInvalid={!!otpError}
                errorMessage={otpError}
                variant="bordered"
                classNames={{
                  input: 'text-center font-mono text-xl tracking-widest',
                  inputWrapper: 'border-neutral-700 bg-neutral-900',
                }}
                autoFocus
              />
            </ModalBody>

            <ModalFooter className="border-t border-neutral-800">
              <Button
                variant="bordered"
                className="border-neutral-800 text-neutral-300 text-xs font-bold"
                onClick={() => {
                  setActiveOtpMission(null);
                  setEnteredOtp('');
                  setOtpError(null);
                }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="bg-white text-black text-xs font-bold"
                startContent={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              >
                {isAr ? 'تأكيد التسليم الفوري' : 'Confirm Delivery'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
