<?php

namespace App\Enums;

enum TransactionType: string
{
    case ORDER_PAYMENT = 'order_payment';
    case COD_COLLECTION = 'cod_collection';
    case COMMISSION_DEDUCTION = 'commission_deduction';
    case DELIVERY_FEE_CREDIT = 'delivery_fee_credit';
    case REMITTANCE_SETTLEMENT = 'remittance_settlement';
    case REFUND = 'refund';
}
