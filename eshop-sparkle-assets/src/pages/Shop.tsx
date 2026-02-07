import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<string>('featured');

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (searchParam) {
      const query = searchParam.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        // Keep default order (featured)
        break;
    }

    return filtered;
  }, [selectedCategory, searchParam, priceRange, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {searchParam ? `Search: "${searchParam}"` : 'Shop All Products'}
          </h1>
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-20 space-y-6 rounded-lg border bg-card p-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="text-primary"
                    />
                    <span className="text-sm">All Products</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'hoodies'}
                      onChange={() => setSelectedCategory('hoodies')}
                      className="text-primary"
                    />
                    <span className="text-sm">Hoodies</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'tshirts'}
                      onChange={() => setSelectedCategory('tshirts')}
                      className="text-primary"
                    />
                    <span className="text-sm">T-Shirts</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'caps'}
                      onChange={() => setSelectedCategory('caps')}
                      className="text-primary"
                    />
                    <span className="text-sm">Caps</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'sneakers'}
                      onChange={() => setSelectedCategory('sneakers')}
                      className="text-primary"
                    />
                    <span className="text-sm">Sneakers</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Up to ${priceRange[1]}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 200]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort */}
            <div className="mb-6 flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-md border bg-background"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No products found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 200]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
