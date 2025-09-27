"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { BottomBarProps } from "../BottomBar";
import { BottomBar } from "../BottomBar";
import { Button } from "../Button";
import { XMark } from "../Icons/XMark";
import { Typography } from "../Typography";
import { TopBar } from "../TopBar/TopBar";
import type {
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerHeaderProps,
  DrawerProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from "./types";
import { DrawerContext, useDrawer } from "./use-drawer";

/**
 * A drawer component that slides up from the bottom of the screen
 * @param props DrawerProps
 */
const Drawer = ({
  dismissible = true,
  height = "full",
  modal = true,
  repositionInputs = false,
  ...props
}: DrawerProps) => (
  <DrawerContext.Provider value={{ dismissible, height }}>
    <DrawerPrimitive.Root
      shouldScaleBackground={false}
      dismissible={dismissible}
      modal={modal}
      direction="bottom"
      handleOnly
      repositionInputs={repositionInputs}
      {...props}
    />
  </DrawerContext.Provider>
);
Drawer.displayName = "Drawer";

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Trigger>,
  DrawerTriggerProps
>((props, ref) => <DrawerPrimitive.Trigger ref={ref} {...props} />);

DrawerTrigger.displayName = DrawerPrimitive.Trigger.displayName;

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.PropsWithChildren<DrawerCloseProps>
>((props, ref) => <DrawerPrimitive.Close ref={ref} {...props} />);
DrawerClose.displayName = DrawerPrimitive.Close.displayName;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>((props, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className="fixed inset-0 z-50 bg-gray-900/40" {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

/**
 * The content container of the drawer
 */
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>((props, ref) => {
  const { height } = useDrawer();
  const extraClassName = (props as any).className as string | undefined;
  return (
    <DrawerPrimitive.Portal>
      <DrawerOverlay />

      <DrawerPrimitive.Content
        ref={ref}
        {...props}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-gray-0 outline-none flex flex-col",
          height === "full" ? "top-0 rounded-none" : "h-auto rounded-t-[1.75rem]",
          extraClassName,
        )}
      />
    </DrawerPrimitive.Portal>
  );
});
DrawerContent.displayName = "DrawerContent";

/**
 * The header section of the drawer
 */
const DrawerHeader = ({ icon, children, ...props }: DrawerHeaderProps) => {
  const { dismissible } = useDrawer();

  return (
    <div className="mb-2 w-full" {...props}>
      <TopBar
        title={children}
        startAdornment={icon}
        endAdornment={
          dismissible ? (
            <DrawerClose asChild>
              <Button variant="tertiary" size="icon">
                <XMark />
              </Button>
            </DrawerClose>
          ) : undefined
        }
      />
    </div>
  );
};
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = (props: BottomBarProps) => <BottomBar {...props} />;
DrawerFooter.displayName = "DrawerFooter";

/**
 * The title component of the drawer
 */
const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  DrawerTitleProps
>((props, ref) => {
  const { children, startAdornment, endAdornment, ...rest } = props as any;
  return (
    <DrawerPrimitive.Title ref={ref} {...(rest as any)} asChild>
      <TopBar title={children} startAdornment={startAdornment} endAdornment={endAdornment} />
    </DrawerPrimitive.Title>
  );
});
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

/**
 * The description component of the drawer
 */
const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  DrawerDescriptionProps
>((props, ref) => (
  <DrawerPrimitive.Description ref={ref} className="text-gray-500" {...props} asChild>
    <Typography variant="body" level={2}>
      {props.children}
    </Typography>
  </DrawerPrimitive.Description>
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle };
