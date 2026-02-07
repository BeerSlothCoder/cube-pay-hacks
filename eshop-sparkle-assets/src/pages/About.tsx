import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About CubePay Merch</h1>
            <p className="text-xl text-muted-foreground">
              Premium merchandise for the payment revolution
            </p>
          </div>

          <div className="prose prose-lg mx-auto">
            <p>
              Welcome to CubePay Merch, your destination for high-quality branded merchandise
              celebrating the future of augmented reality payments.
            </p>

            <h2>Our Mission</h2>
            <p>
              We're on a mission to make crypto payments accessible to everyone through innovative
              AR technology and seamless cross-platform payment solutions.
            </p>

            <h2>Why CubePay?</h2>
            <p>
              CubePay Payment Gate enables users to process payments through their own virtual
              terminals, providing enhanced security and privacy. Merchants can onboard users to
              crypto payments instantly, and users can onboard merchants to accept various payment
              methods.
            </p>

            <h2>Our Products</h2>
            <p>
              Every piece in our collection is designed with quality and style in mind, featuring
              the iconic AR Cube Pay logo. From hoodies and t-shirts to caps and sneakers, wear
              your support for the payment revolution.
            </p>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/shop">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
