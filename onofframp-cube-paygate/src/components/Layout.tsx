import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useStore } from "../store/useStore";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const initializeData = useStore((state) => state.initializeData);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
