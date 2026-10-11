<?php

namespace App\Enums;

enum RemittanceMethod: string
{
    case FAWRY = 'fawry';
    case INSTAPAY = 'instapay';
    case BANK_TRANSFER = 'bank_transfer';
    case BRANCH_CASH = 'branch_cash';
}
