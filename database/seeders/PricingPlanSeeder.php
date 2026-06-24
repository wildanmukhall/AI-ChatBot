<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PricingPlanSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('pricing_plans')->insert([
            [
                'name'        => 'Starter',
                'price'       => 15000,
                'image_quota' => 20,
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'name'        => 'Basic',
                'price'       => 29000,
                'image_quota' => 50,
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'name'        => 'Pro',
                'price'       => 59000,
                'image_quota' => 120,
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'name'        => 'Ultra',
                'price'       => 99000,
                'image_quota' => 250,
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
        ]);
    }
}
