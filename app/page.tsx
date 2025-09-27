import { MobileNav } from "@/components/MobileNav";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomSearchBar } from "@/components/BottomSearchBar";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="pt-16">
        <HomeContent />
      </main>
      
      {/* Bottom Search Bar */}
      <BottomSearchBar />
    </div>
  );
}
