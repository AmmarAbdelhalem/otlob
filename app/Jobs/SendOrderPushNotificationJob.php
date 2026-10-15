<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOrderPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public User $user;
    public string $title;
    public string $body;
    public array $data;

    public function __construct(User $user, string $title, string $body, array $data = [])
    {
        $this->user = $user;
        $this->title = $title;
        $this->body = $body;
        $this->data = $data;
    }

    public function handle(): void
    {
        if (empty($this->user->fcm_token)) {
            Log::info("No FCM token registered for user [{$this->user->id}]. Push notification skipped.");
            return;
        }

        Log::info("Dispatching FCM push to user [{$this->user->id}] with token [{$this->user->fcm_token}]: {$this->title} - {$this->body}");
        // Integrate with Firebase HTTP v1 client when credentials are set
    }
}
