import { Product } from "@/types/product";
import cubeGreen1 from "@/assets/cube-green-1.png";
import cubeGreen2 from "@/assets/cube-green-2.png";
import cubePaymentGate from "@/assets/cube-payment-gate.png";
import cubeTrustBadge from "@/assets/cube-trust-badge.png";
import hoodieGrayGreen from "@/assets/hoodie-gray-green.png";
import hoodieWhiteBlue from "@/assets/hoodie-white-blue.png";
import hoodieGrayGreenFront from "@/assets/hoodie-gray-green-front.png";
import hoodieNavyBlue from "@/assets/hoodie-navy-blue.png";
import capBeigeFront from "@/assets/cap-beige-front.png";
import capBeigeBack from "@/assets/cap-beige-back.png";
import capBlackFront from "@/assets/cap-black-front.png";
import capBlackSide from "@/assets/cap-black-side.png";
import capBlackBack from "@/assets/cap-black-back.png";
import tshirtNavyBlue from "@/assets/tshirt-navy-blue.png";
import tshirtBeigeGreen from "@/assets/tshirt-beige-green.png";
import tshirtBeigeVneck from "@/assets/tshirt-beige-vneck.png";
import tshirtBeigeLongsleeve from "@/assets/tshirt-beige-longsleeve.png";
import sneakerNavyTop from "@/assets/sneaker-navy-top.png";
import sneakerNavyFront from "@/assets/sneaker-navy-front.png";
import sneakerNavyBack from "@/assets/sneaker-navy-back.png";
import sneakerNavySide from "@/assets/sneaker-navy-side.png";
import sneakerWhiteGreen from "@/assets/sneaker-white-green.png";
import sneakerWhiteGreenTop from "@/assets/sneaker-white-green-top.png";
import sneakerWhiteGreenBack from "@/assets/sneaker-white-green-back.png";
import sneakerWhiteGreenFront from "@/assets/sneaker-white-green-front.png";
import sneakerWhiteGreenSide from "@/assets/sneaker-white-green-side.png";

export const products: Product[] = [
  // HOODIES
  {
    id: "hoodie-1",
    name: "CubePay Tech Hoodie",
    slug: "cubepay-tech-hoodie",
    description:
      "Premium quality hoodie featuring embroidered AR Cube Pay logo. Perfect for crypto enthusiasts and tech innovators. 80% cotton, 20% polyester blend. Unisex fit.",
    price: 100.0,
    category: "hoodies",
    colors: [
      { name: "Navy Blue", value: "#1E3A8A" },
      { name: "Black", value: "#000000" },
      { name: "Heather Gray", value: "#9CA3AF" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      hoodieNavyBlue,
      hoodieGrayGreen,
      hoodieWhiteBlue,
      hoodieGrayGreenFront,
    ],
    featured: true,
    stock: "in-stock",
    details: {
      materials: "80% cotton, 20% polyester blend. Soft fleece interior.",
      care: "Machine wash cold. Tumble dry low. Do not iron decoration.",
      shipping:
        "Ships within 2-3 business days. Free shipping on orders over $100.",
    },
  },

  // T-SHIRTS
  {
    id: "tshirt-1",
    name: "CubePay Classic Tee",
    slug: "cubepay-classic-tee",
    description:
      "Soft, comfortable t-shirt with high-quality AR Cube Pay logo print. 100% premium cotton. Modern fit. Show your support for the payment revolution.",
    price: 50.0,
    category: "tshirts",
    colors: [
      { name: "Black", value: "#000000" },
      { name: "White", value: "#FFFFFF" },
      { name: "Navy Blue", value: "#1E3A8A" },
      { name: "Heather Gray", value: "#9CA3AF" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      tshirtNavyBlue,
      tshirtBeigeGreen,
      tshirtBeigeVneck,
      tshirtBeigeLongsleeve,
    ],
    featured: true,
    stock: "in-stock",
    details: {
      materials: "100% premium cotton. Pre-shrunk fabric.",
      care: "Machine wash cold with like colors. Tumble dry low.",
      shipping:
        "Ships within 2-3 business days. Free shipping on orders over $100.",
    },
  },

  // CAPS
  {
    id: "cap-1",
    name: "CubePay Snapback Cap",
    slug: "cubepay-snapback-cap",
    description:
      "Classic 6-panel snapback with embroidered 3D AR Cube Pay logo. Premium cotton twill. Adjustable snapback closure. Perfect for any occasion.",
    price: 35.0,
    category: "caps",
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Navy Blue", value: "#1E3A8A" },
    ],
    sizes: ["One Size"],
    images: [
      capBlackFront,
      capBlackBack,
      capBlackSide,
      capBeigeFront,
      capBeigeBack,
    ],
    featured: true,
    stock: "in-stock",
    details: {
      materials: "Premium cotton twill. Structured 6-panel design.",
      care: "Spot clean only. Do not machine wash.",
      shipping:
        "Ships within 2-3 business days. Free shipping on orders over $100.",
    },
  },

  // SNEAKERS
  {
    id: "sneaker-1",
    name: "CubePay Air Tech Sneakers",
    slug: "cubepay-air-tech-sneakers",
    description:
      "Limited edition tech-inspired sneakers featuring AR Cube Pay branding. Mesh and synthetic upper, cushioned sole, modern silhouette. For innovators who move fast.",
    price: 150.0,
    category: "sneakers",
    colors: [
      { name: "Black/Blue", value: "#1E3A8A" },
      { name: "White/Purple", value: "#A855F7" },
      { name: "Navy/Silver", value: "#334155" },
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
    images: [
      sneakerNavyTop,
      sneakerNavyFront,
      sneakerNavyBack,
      sneakerNavySide,
      sneakerWhiteGreen,
      sneakerWhiteGreenTop,
      sneakerWhiteGreenBack,
      sneakerWhiteGreenFront,
      sneakerWhiteGreenSide,
    ],
    featured: true,
    stock: "limited",
    details: {
      materials: "Mesh and synthetic upper. Rubber sole with air cushioning.",
      care: "Wipe clean with damp cloth. Air dry only.",
      shipping:
        "Ships within 3-5 business days. Free shipping on orders over $100.",
    },
  },
];

export const categories = [
  { id: "hoodies", name: "Hoodies", slug: "hoodies" },
  { id: "tshirts", name: "T-Shirts", slug: "tshirts" },
  { id: "caps", name: "Caps", slug: "caps" },
  { id: "sneakers", name: "Sneakers", slug: "sneakers" },
];
