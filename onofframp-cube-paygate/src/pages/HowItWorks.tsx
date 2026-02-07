import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Users,
  Award,
  Headphones,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("buying");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const buyingSteps = [
    {
      number: 1,
      title: "Create Account or Connect Wallet",
      description:
        "Sign in with wallet or social login. New users: We create a secure wallet automatically.",
      details: "Takes 30 seconds",
      icon: "🔗",
      image: "/images/step1-connect.png",
    },
    {
      number: 2,
      title: "Select Cryptocurrency",
      description: "Choose from 50+ cryptocurrencies with real-time prices.",
      details: "Compare options",
      icon: "💰",
      image: "/images/step2-select.png",
    },
    {
      number: 3,
      title: "Enter Amount",
      description: "Decide how much to spend with transparent fee breakdown.",
      details: "See exactly what you'll receive",
      icon: "💳",
      image: "/images/step3-amount.png",
    },
    {
      number: 4,
      title: "Complete Payment",
      description:
        "Pay via your CubePay virtual terminal with bank-level security.",
      details: "You control the payment environment",
      icon: "🔒",
      image: "/images/step4-payment.png",
    },
    {
      number: 5,
      title: "Receive Crypto Instantly",
      description:
        "Crypto arrives in your wallet immediately. View in your dashboard.",
      details: "Start using right away",
      icon: "✅",
      image: "/images/step5-receive.png",
    },
  ];

  const sellingSteps = [
    {
      number: 1,
      title: "Connect Your Wallet",
      description: "Sign in to access your crypto and view your balances.",
      details: "Secure connection",
      icon: "🔗",
      image: "/images/sell-step1.png",
    },
    {
      number: 2,
      title: "Select Crypto to Sell",
      description: "Choose which cryptocurrency to sell and enter amount.",
      details: "See current market value",
      icon: "💰",
      image: "/images/sell-step2.png",
    },
    {
      number: 3,
      title: "Choose Payout Method",
      description:
        "Bank account (1-3 days), debit card (instant), or CubePay virtual card (instant).",
      details: "Multiple options available",
      icon: "🏦",
      image: "/images/sell-step3.png",
    },
    {
      number: 4,
      title: "Confirm Sale",
      description: "Review details and confirm transaction.",
      details: "Double-check everything",
      icon: "✅",
      image: "/images/sell-step4.png",
    },
    {
      number: 5,
      title: "Receive Fiat",
      description: "Money arrives in your account. Track status in dashboard.",
      details: "Get notified when complete",
      icon: "💸",
      image: "/images/sell-step5.png",
    },
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: "Bank-level Encryption",
      description:
        "All data is encrypted using industry-standard AES-256 encryption",
    },
    {
      icon: Shield,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
    },
    {
      icon: Wallet,
      title: "Cold Storage",
      description: "Crypto assets are stored in secure offline wallets",
    },
    {
      icon: Award,
      title: "Regulatory Compliance",
      description:
        "Fully compliant with financial regulations and KYC/AML requirements",
    },
    {
      icon: Users,
      title: "Insurance Coverage",
      description:
        "Your funds are protected by comprehensive insurance policies",
    },
    {
      icon: Headphones,
      title: "24/7 Monitoring",
      description: "Round-the-clock security monitoring and fraud detection",
    },
  ];

  const faqs = [
    {
      question: "Is CubePay Exchange safe?",
      answer:
        "Yes, CubePay Exchange uses bank-level security measures including AES-256 encryption, cold storage for crypto assets, two-factor authentication, and comprehensive insurance coverage. We are fully compliant with financial regulations.",
    },
    {
      question: "How long does it take to buy crypto?",
      answer:
        "Crypto purchases are instant! Once your payment is confirmed through your CubePay virtual terminal, the cryptocurrency is immediately sent to your wallet. The entire process typically takes less than 5 minutes.",
    },
    {
      question: "What are the fees?",
      answer:
        "We charge a transparent 2.5% service fee plus network fees (which vary by cryptocurrency). There are no hidden fees - you'll see the exact breakdown before confirming any transaction.",
    },
    {
      question: "Can I sell crypto back to fiat?",
      answer:
        "Absolutely! You can sell your cryptocurrency back to fiat currency at any time. Choose from bank transfer (1-3 days), debit card (instant), or CubePay virtual card (instant) for receiving your funds.",
    },
    {
      question: "What if I don't have a wallet?",
      answer:
        "No problem! If you sign in with social login (Google, Twitter, etc.), we'll automatically create a secure wallet for you. You can export the private key anytime or continue using our managed wallet service.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "Currently, we accept payments through your CubePay virtual terminal, which supports all major credit and debit cards. We're working on adding direct bank transfers and other payment methods soon.",
    },
    {
      question: "Is there a minimum purchase?",
      answer:
        "Yes, the minimum purchase is $10 USD. The maximum is $10,000 per transaction, with higher limits available for verified accounts.",
    },
    {
      question: "How do I contact support?",
      answer:
        "Our support team is available 24/7 through live chat, email (support@cubepayexchange.com), or phone. You can also visit our comprehensive Help Center for instant answers to common questions.",
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const currentSteps = activeTab === "buying" ? buyingSteps : sellingSteps;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            How CubePay Exchange Works
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Your complete guide to buying and selling crypto safely and easily
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab("buying")}
              className={`px-8 py-3 rounded-md font-medium transition-colors ${
                activeTab === "buying"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              Buying Crypto (On-Ramp)
            </button>
            <button
              onClick={() => setActiveTab("selling")}
              className={`px-8 py-3 rounded-md font-medium transition-colors ${
                activeTab === "selling"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              Selling Crypto (Off-Ramp)
            </button>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              {activeTab === "buying"
                ? "How to Buy Crypto"
                : "How to Sell Crypto"}
            </h2>
            <p className="text-text-secondary">
              {activeTab === "buying"
                ? "Get started with crypto in 5 simple steps"
                : "Convert your crypto to cash in 5 easy steps"}
            </p>
          </div>

          <div className="space-y-8">
            {currentSteps.map((step, index) => (
              <Card key={step.number} className="overflow-hidden">
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {step.number}
                        </div>
                        <div className="text-3xl">{step.icon}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary mb-3">
                        {step.title}
                      </h3>
                      <p className="text-text-secondary text-lg mb-4">
                        {step.description}
                      </p>
                      <div className="flex items-center space-x-2 text-primary font-medium">
                        <CheckCircle className="w-5 h-5" />
                        <span>{step.details}</span>
                      </div>
                    </div>
                    <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">{step.icon}</div>
                        <div className="text-text-secondary">
                          Step {step.number} illustration would go here
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              How We Keep You Safe
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Your security is our top priority. We use multiple layers of
              protection to keep your funds and data safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent>
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h3 className="text-lg font-semibold text-text-primary pr-4">
                      {faq.question}
                    </h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-text-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white">
          <CardContent>
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of users who trust CubePay Exchange for their
                crypto needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/buy">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-gray-100"
                  >
                    Buy Crypto Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Sell Crypto
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Still have questions?
          </h3>
          <p className="text-text-secondary mb-6">
            Our support team is here to help 24/7
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Headphones className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline">Help Center</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
