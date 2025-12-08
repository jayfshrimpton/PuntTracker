import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "default", asChild = false, isLoading = false, children, disabled, ...props }, ref) => {


        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95"

        const variants = {
            primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:from-blue-500 hover:to-purple-500 border-0",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
            outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
            link: "text-primary underline-offset-4 hover:underline",
        }

        const sizes = {
            default: "h-11 px-6 py-2",
            sm: "h-9 rounded-lg px-4",
            lg: "h-14 rounded-2xl px-10 text-base",
            icon: "h-11 w-11",
        }

        const variantStyles = variants[variant]
        const sizeStyles = sizes[size]

        if (asChild) {
            return (
                <Slot
                    className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Slot>
            )
        }

        return (
            <button
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
