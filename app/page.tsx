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
import { Menu as IconoirMenu, User as IconoirUser, Xmark as IconoirX, Search } from "iconoir-react";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/Drawer";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { XMark } from "@/components/Icons/XMark";
import { BottomBar } from "@/packages/mini-apps-ui-kit/packages/mini-apps-ui-kit-react/src/components/BottomBar/BottomBar";
import { SearchField } from "@/packages/mini-apps-ui-kit/packages/mini-apps-ui-kit-react/src/components/SearchField/SearchField";
export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const router = useRouter();

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
                  <Typography className="text-gray-500">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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
      {/* <MobileHeader /> */}

      {/* Main Content */}
      {/* <main className="pt-16">
        <HomeContent />
      </main> */}

      {/* Bottom Search Bar */}
      <BottomSearchBar />

      <BottomBar direction="horizontal">
        <SearchField
          label="Name, Address or ENS"
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
