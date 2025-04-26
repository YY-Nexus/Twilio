import type { ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  href: string
  className?: string
  children: ReactNode
}

export function AnimatedCard({ href, className, children }: AnimatedCardProps) {
  return (
    <Link href={href} className="block">
      <div className={cn("card-on-bg p-6 rounded-lg ripple h-full", className)}>{children}</div>
    </Link>
  )
}

interface AnimatedCardTitleProps {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function AnimatedCardTitle({ icon, children, className }: AnimatedCardTitleProps) {
  return (
    <h2 className={cn("text-xl font-semibold mb-2 text-blue-600 flex items-center card-title-hover", className)}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </h2>
  )
}

interface AnimatedCardContentProps {
  children: ReactNode
  className?: string
}

export function AnimatedCardContent({ children, className }: AnimatedCardContentProps) {
  return <p className={cn("text-gray-700 card-content-hover", className)}>{children}</p>
}

interface AnimatedCardActionProps {
  children: ReactNode
  className?: string
}

export function AnimatedCardAction({ children, className }: AnimatedCardActionProps) {
  return (
    <div className={cn("mt-4", className)}>
      <span className="text-blue-600 font-medium card-button-hover inline-flex items-center">{children}</span>
    </div>
  )
}
