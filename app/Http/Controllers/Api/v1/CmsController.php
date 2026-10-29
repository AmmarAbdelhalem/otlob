<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CmsController extends Controller
{
    /**
     * Get active promotional banners ordered by sort order.
     */
    public function getBanners(): JsonResponse
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return $this->successResponse($banners);
    }

    /**
     * Get active top-level catalog categories with their subcategories.
     */
    public function getCategories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return $this->successResponse($categories);
    }

    /**
     * Retrieve a published CMS page by unique slug.
     */
    public function getPageBySlug(string $slug): JsonResponse
    {
        $page = CmsPage::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $page) {
            return $this->errorResponse('Page not found.', Response::HTTP_NOT_FOUND);
        }

        return $this->successResponse($page);
    }
}

