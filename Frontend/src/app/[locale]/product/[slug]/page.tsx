import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Locale, Product } from '@/lib/api/types';
import { services } from '@/lib/api';
import { siteConfig } from '@/config/site.config';
import { ProductDetailView } from '@/components/product/ProductDetailView';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function resolveProduct(slug: string): Promise<Product | null> {
  // Try by ID
  let product = await services.catalog.getProductById(slug);
  if (product) return product;

  // Try by SKU
  product = await services.catalog.getProductBySku(slug);
  if (product) return product;

  // Try by search query if slug contains dashes or alphanumeric
  const searchRes = await services.catalog.searchProducts({ q: slug, perPage: 1 });
  if (searchRes.data.length > 0) {
    return searchRes.data[0];
  }

  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;
  const product = await resolveProduct(slug);

  if (!product) {
    return {
      title: locale === 'ar' ? 'المنتج غير موجود' : 'Product Not Found',
    };
  }

  return {
    title: `${product.name} - ${siteConfig.brand.name}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.thumbnail || '/images/og-image.jpg'],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;

  const product = await resolveProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products
  const relatedProducts = await services.catalog.getRelatedProducts(product.id, 4);

  // Structured Data (JSON-LD) for SEO and Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images && product.images.length > 0 ? product.images : [product.thumbnail],
    description: product.description,
    sku: product.sku,
    mpn: product.oemNumber,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'OEM',
    },
    offers: {
      '@type': 'Offer',
      url: `https://otlob-parts.com/${locale}/product/${product.sku}`,
      priceCurrency: 'EGP',
      price: product.price,
      itemCondition:
        product.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
      availability:
        product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.merchant?.storeName || product.merchant?.name || siteConfig.brand.name,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.9,
      reviewCount: product.reviewCount || 48,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductDetailView
            locale={locale}
            product={product}
            relatedProducts={relatedProducts}
          />
        </div>
      </div>
    </>
  );
}
