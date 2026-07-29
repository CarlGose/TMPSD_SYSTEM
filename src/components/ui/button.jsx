import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 font-bold",
        outline:
          "border border-border/80 bg-card text-foreground shadow-[3px_3px_8px_#d0dbcf,-3px_-3px_8px_#ffffff] dark:shadow-[3px_3px_8px_#111e11,-3px_-3px_8px_#253a21] hover:bg-muted/50 hover:text-foreground active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[3px_3px_8px_rgba(0,0,0,0.15)] hover:bg-secondary/90 active:translate-y-px",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-muted/40 active:bg-muted/60",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 shadow-[2px_2px_6px_rgba(0,0,0,0.1)] hover:bg-destructive/20 active:translate-y-px",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4 text-sm",
        xs: "h-7 gap-1 px-2.5 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8.5 gap-1.5 px-3 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 px-6 text-base rounded-xl",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8.5 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
