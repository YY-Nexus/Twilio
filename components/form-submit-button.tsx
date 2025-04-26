"use client"

import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface FormSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isSubmitting?: boolean
  loadingText?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function FormSubmitButton({
  children,
  isSubmitting = false,
  loadingText = "提交中...",
  className,
  variant = "default",
  ...props
}: FormSubmitButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  const animationClass = !prefersReducedMotion && isSubmitting ? "form-submit-animation" : ""

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={isSubmitting}
      className={cn("ripple", animationClass, className)}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
