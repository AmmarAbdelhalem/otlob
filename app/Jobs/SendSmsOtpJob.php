<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSmsOtpJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $phone;
    public string $otp;
    public string $orderCode;

    public function __construct(string $phone, string $otp, string $orderCode)
    {
        $this->phone = $phone;
        $this->otp = $otp;
        $this->orderCode = $orderCode;
    }

    public function handle(): void
    {
        Log::info("Sending SMS OTP [{$this->otp}] for Order [{$this->orderCode}] to phone [{$this->phone}]");
        // Integration hook for SMS gateway (Twilio, VictoryLink, Unifonic, etc.)
    }
}
