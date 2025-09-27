"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileNav } from "@/components/MobileNav";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomSearchBar } from "@/components/BottomSearchBar";
import { Magnifier } from "@/components/Icons/Magnifier";
import { HomeContent } from "@/components/HomeContent";
import { TopBar } from "@/components/TopBar";
import { ClockRotateRight, Coins, CreditCard, Flash, FlashSolid, Gift, HomeAlt, Menu as IconoirMenu, User as IconoirUser, Xmark as IconoirX, Page, Search } from "iconoir-react";
import { WorldAppLogo } from "@/components/Icons/WorldAppLogo";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/Drawer";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { XMark } from "@/components/Icons/XMark";
import { BottomBar } from "@/packages/mini-apps-ui-kit/packages/mini-apps-ui-kit-react/src/components/BottomBar/BottomBar";
import { SearchField } from "@/packages/mini-apps-ui-kit/packages/mini-apps-ui-kit-react/src/components/SearchField/SearchField";
import { ListItem } from "@/packages/mini-apps-ui-kit/packages/mini-apps-ui-kit-react/src/components/ListItem/ListItem";
import { Chip } from "@/packages/mini-apps-ui-kit/packages/mini-apps-ui-kit-react/src/components/Chip/Chip";
import { SignIn } from "@/components/SignIn";
import { useCredits } from "@/components/CreditProvider";
import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        title="Facticity.AI"
        endAdornment={
          <Drawer direction="right" height="full">
            <DrawerTrigger asChild>
              <button aria-label="Menu" onClick={() => setNavOpen(true)}>
                <IconoirMenu />
              </button>
            </DrawerTrigger>

            <DrawerContent>
              <div className="p-6">
                <DrawerTitle
                  endAdornment={
                    <DrawerClose asChild>
                      <Button variant="tertiary" size="icon" aria-label="Close">
                        <IconoirX />
                      </Button>
                    </DrawerClose>
                  }
                >
                  Settings
                </DrawerTitle>

                <div className="my-8">
                  <Typography className="text-gray-500 space-y-4">
                    <ListItem
                      label="New Check"
                      description="Fact-check claims and URLs"
                      startAdornment={<Magnifier />}
                      onClick={() => router.push("/check")}
                    />
                    <ListItem
                      label="View History"
                      description="View your past fact-checks"
                      startAdornment={<ClockRotateRight />}
                      onClick={() => router.push("/history")}
                    />
                    <ListItem
                      label="Writer"
                      description="AI-powered research assistant"
                      startAdornment={<Page />}
                      endAdornment={<Chip className="bg-gray-200" label="New"/>}
                      onClick={() => router.push("/writer")}
                    />
                    <ListItem
                      label="Referrals & Rewards"
                      description="Share Facticity.AI with your friends and earn rewards!"
                      startAdornment={<Gift />}
                      onClick={() => router.push("/referrals")}
                    />
                    <ListItem
                      label="Billing"
                      description="Manage your subscription and billing"
                      startAdornment={<CreditCard />}
                      endAdornment={<Chip icon={<FlashSolid />} label="Upgrade Plan" variant="warning" />}
                      onClick={() => router.push("/billing")}
                    />

                    {/* Need States for different signed in statuses */}
                    {/* Sign in row: whole row is clickable (sign in when not authed, open profile when authed) */}
                    <ListItem
                      label="Sign In"
                      description="Sign In with World ID"
                      startAdornment={<WorldAppLogo />}
                      endAdornment={<SignIn />}
                      onClick={() => {
                        if (isAuthenticated) {
                          router.push("/profile");
                        } else {
                          signIn("worldcoin");
                        }
                      }}
                    />

                    {/* Signed in*/}
                    <ListItem
                      label="Johnny Appleseed"
                      description="worldid: 0x1234...abcd"
                      startAdornment={<WorldAppLogo />}
                      endAdornment={<Chip icon={<Coins />} label="9999" variant="important" />}
                      onClick={() => router.push("/profile")}
                    />
                  </Typography>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        }
      />

      {/* Mobile Navigation */}
      {/* <MobileNav isOpen={navOpen} setIsOpen={setNavOpen} /> */}

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      {/* <main className="pt-16">
        <HomeContent />
      </main> */}

      {/* Bottom Search Bar */}
      <BottomSearchBar />

      <BottomBar direction="horizontal">
        <SearchField
          label="Type a claim or paste a link..."
          onChange={function Xs() { }}
          showPasteButton
          pasteButtonLabel=""
          onSearch={(value: string) => {
            // navigate to a search route (adjust as needed)
            if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
          }}
        />
      </BottomBar>

    </div>
  );
}
