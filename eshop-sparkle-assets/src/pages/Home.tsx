import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { categories } from '@/data/products';
import hoodieNavyBlue from '@/assets/hoodie-navy-blue.png';
import tshirtNavyBlue from '@/assets/tshirt-navy-blue.png';
import capBlackFront from '@/assets/cap-black-front.png';
import sneakerWhiteGreen from '@/assets/sneaker-white-green.png';
import lifestyleOffice from '@/assets/lifestyle-office.png';
import lifestyleOutdoor from '@/assets/lifestyle-outdoor.png';
import lifestylePark from '@/assets/lifestyle-park.png';
import lifestyleRooftop from '@/assets/lifestyle-rooftop.png';
import lifestyle1 from '@/assets/lifestyle-1.png';
import lifestyle2 from '@/assets/lifestyle-2.png';
import lifestyle3 from '@/assets/lifestyle-3.png';
import lifestyle4 from '@/assets/lifestyle-4.png';
import lifestyle5 from '@/assets/lifestyle-5.png';
import lifestyle6 from '@/assets/lifestyle-6.png';
import lifestyle7 from '@/assets/lifestyle-7.png';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Wear the Future of Payments
            </h1>
            <p className="text-xl text-muted-foreground">
              Premium AR Cube Pay merchandise for innovators and crypto enthusiasts
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/shop">
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our curated collection</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const categoryImages: Record<string, string> = {
                hoodies: hoodieNavyBlue,
                tshirts: tshirtNavyBlue,
                caps: capBlackFront,
                sneakers: sneakerWhiteGreen
              };
              
              return (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.id}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all hover:shadow-lg"
                >
                  <img
                    src={categoryImages[category.id]}
                    alt={`${category.name} category`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why CubePay Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why CubePay?</h2>
            <p className="text-muted-foreground">The future of secure payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AR Payments</h3>
              <p className="text-muted-foreground">
                Experience the future of augmented reality payment technology
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Checkout</h3>
              <p className="text-muted-foreground">
                Process payments through your own virtual terminal for enhanced security
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Own Your Terminal</h3>
              <p className="text-muted-foreground">
                Merchants can onboard you to crypto payments instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle Gallery */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The CubePay Lifestyle</h2>
            <p className="text-muted-foreground">Join the payment revolution</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyleOffice}
                alt="CubePay lifestyle - working in modern office"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyleOutdoor}
                alt="CubePay lifestyle - outdoor activities"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestylePark}
                alt="CubePay lifestyle - urban living"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyleRooftop}
                alt="CubePay lifestyle - city rooftop"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyle1}
                alt="CubePay lifestyle - urban explorer"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyle2}
                alt="CubePay lifestyle - street style"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyle3}
                alt="CubePay lifestyle - modern living"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyle4}
                alt="CubePay lifestyle - urban fashion"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyle5}
                alt="CubePay lifestyle - city adventures"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyle6}
                alt="CubePay lifestyle - contemporary style"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={lifestyle7}
                alt="CubePay lifestyle - digital nomad"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Stay Updated</h2>
            <p className="text-lg opacity-90">
              Get exclusive drops and payment tech news
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md text-foreground"
              />
              <Button size="lg" variant="secondary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
