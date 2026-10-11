<?php

namespace App\Enums;

enum EntryType: string
{
    case DEBIT = 'debit';
    case CREDIT = 'credit';
}
