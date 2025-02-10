import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        slate_sky:
          "border border-input bg-sky-500 text-primary-foreground hover:text-primary-foreground shadow-sm hover:bg-sky-500/90",
        slate_yellow:
          "border border-input bg-secondary shadow-sm hover:bg-yellow-200/90",
        slate_secondary:
          "border border-input bg-secondary text-accent-foreground hover:text-accent-foreground shadow-sm hover:bg-yellow-200/90",
        slate_green:
          "border border-input bg-green-500 text-primary-foreground hover:text-primary-foreground shadow-sm hover:bg-green-500/90",
        slate_destructive:
          "border border-input bg-secondary text-accent-foreground hover:text-primary-foreground shadow-sm hover:bg-destructive/90",
        slate_blue:
          "border border-input bg-background text-slate-800 hover:text-blue-700 shadow-sm hover:bg-background",
        slate_red:
          "border border-input bg-background text-slate-800 hover:text-red-500 shadow-sm hover:bg-background",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
