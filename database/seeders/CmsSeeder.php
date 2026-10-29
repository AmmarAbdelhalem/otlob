<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Category;
use App\Models\CmsPage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Initial CMS Categories
        $categories = [
            [
                'id' => (string) Str::uuid(),
                'name_ar' => 'قطع المحرك والتغذية',
                'name_en' => 'Engine & Fuel Systems',
                'slug' => 'engine-parts',
                'icon' => 'Wrench',
                'sort_order' => 1,
                'is_active' => true,
                'description' => 'بواجي، سيور، فلاتر هواء، حساسات، وطلمبات وقود',
            ],
            [
                'id' => (string) Str::uuid(),
                'name_ar' => 'منظومة الفرامل والتحكم',
                'name_en' => 'Brake Systems & ABS',
                'slug' => 'brake-systems',
                'icon' => 'Disc',
                'sort_order' => 2,
                'is_active' => true,
                'description' => 'تيل فرامل أصلي، طنابير، وزيت فرامل DOT4 معتمد',
            ],
            [
                'id' => (string) Str::uuid(),
                'name_ar' => 'نظام التعليق والمساعدين',
                'name_en' => 'Suspension & Steering',
                'slug' => 'suspension-steering',
                'icon' => 'Cpu',
                'sort_order' => 3,
                'is_active' => true,
                'description' => 'مساعدين، جلب مقصات، بارات دركسيون، وكبالن',
            ],
            [
                'id' => (string) Str::uuid(),
                'name_ar' => 'الزيوت والسوائل التخليقية',
                'name_en' => 'Oils & Fluids',
                'slug' => 'fluids-oils',
                'icon' => 'Droplet',
                'sort_order' => 4,
                'is_active' => true,
                'description' => 'زيوت محرك تخليقية 5W-30 و 5W-40 ومياه تبريد أصلية',
            ],
            [
                'id' => (string) Str::uuid(),
                'name_ar' => 'الكهرباء والإضاءة والبطاريات',
                'name_en' => 'Electrical & Lighting',
                'slug' => 'electrical-batteries',
                'icon' => 'Zap',
                'sort_order' => 5,
                'is_active' => true,
                'description' => 'بطاريات جافة، لمبات LED، دينامو ومارشات معتمدة',
            ],
            [
                'id' => (string) Str::uuid(),
                'name_ar' => 'الإطارات والجنوط وضبط الاتزان',
                'name_en' => 'Tires & Wheels',
                'slug' => 'tires-wheels',
                'icon' => 'CircleDot',
                'sort_order' => 6,
                'is_active' => true,
                'description' => 'إطارات ميشلان، بريدجستون، وبيريللي بضمان الوكيل',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 2. Initial CMS Banners / Hero Slides
        $banners = [
            [
                'id' => (string) Str::uuid(),
                'title_ar' => 'قطع غيار سيارات أصلية بضمان معتمد وشحن سريع',
                'title_en' => 'Genuine Auto Parts with Certified Warranty & Express Delivery',
                'subtitle_ar' => 'نوفر لك قطع الغيار الأصلية والمطابقة للمواصفات من كبرى الموردين المعتمدين مع إمكانية الفحص عند الاستلام',
                'subtitle_en' => 'Source OEM & certified aftermarket parts with nationwide tracking and inspection upon delivery.',
                'badge_text' => 'عرض الموسم الحصري',
                'cta_text_ar' => 'اطلب قطعتك الآن',
                'cta_text_en' => 'Order Your Part Now',
                'cta_url' => '/ar/request-part',
                'position' => 'hero',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'title_ar' => 'خصومات حصرية حتى 30% على منظومات الفرامل والمساعدين',
                'title_en' => 'Up to 30% Off on Brake Systems & Suspension Kits',
                'subtitle_ar' => 'استبدل منظومة الفرامل بأمان مع ضمان ضد عيوب الصناعة وتقسيط بدون فوائد',
                'subtitle_en' => 'Upgrade your braking safety with warranty and 0% interest installment plans.',
                'badge_text' => 'وفر حتى 30%',
                'cta_text_ar' => 'تصفح العروض',
                'cta_text_en' => 'Browse Deals',
                'cta_url' => '/ar/offers',
                'position' => 'hero',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'title_ar' => 'شحن مجاني للطلبات فوق 1,000 جنيه',
                'title_en' => 'Free Delivery on Orders Over 1,000 EGP',
                'subtitle_ar' => 'استخدم كود OTLOBFREE عند الدفع واستمتع بشحن فوري',
                'subtitle_en' => 'Use code OTLOBFREE at checkout for free express delivery',
                'badge_text' => 'كوبون ترويجي',
                'cta_text_ar' => 'تسوق الآن',
                'cta_text_en' => 'Shop Now',
                'cta_url' => '/ar/categories',
                'position' => 'promo_strip',
                'sort_order' => 1,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $b) {
            Banner::updateOrCreate(['title_ar' => $b['title_ar']], $b);
        }

        // 3. Initial Static CMS Pages
        $pages = [
            [
                'id' => (string) Str::uuid(),
                'title_ar' => 'عن منصة اطلب',
                'title_en' => 'About Otlob Parts',
                'slug' => 'about-us',
                'content_ar' => 'منصة اطلب هي المنصة الرائدة في الشرق الأوسط لربط تجار قطع غيار السيارات بالعملاء وتوفير خدمات الشحن المتكاملة وضمان الجودة.',
                'content_en' => 'Otlob Parts is the premier automotive marketplace connecting verified suppliers with motorists and workshops.',
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'title_ar' => 'سياسة الضمان والاسترجاع',
                'title_en' => 'Warranty & Return Policy',
                'slug' => 'warranty-policy',
                'content_ar' => 'نضمن لجميع عملائنا حق الفحص والاسترجاع خلال 14 يوماً مع الحفاظ على التغليف الأصلي والضمان المعتمد.',
                'content_en' => 'We offer a 14-day return and inspection guarantee on all unopened original automotive parts.',
                'is_active' => true,
            ],
        ];

        foreach ($pages as $p) {
            CmsPage::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
