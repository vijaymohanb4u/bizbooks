import Link from 'next/link'
import { ReactNode } from 'react'

interface LinkComponentProps {
  href: string
  title: string
  description: string
  icon?: ReactNode
}

export function LinkComponent({ href, title, description, icon }: LinkComponentProps) {
  return (
    <Link 
      href={href}
      className="relative group rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        {icon && <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500">{icon}</div>}
        <div>
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-500">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
