'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const pathNameMap: Record<string, string> = {
  dashboard: '대시보드',
  overview: '개요',
  students: '학생 관리',
  classes: '반 관리',
  consultations: '상담 관리',
  exams: '시험 관리',
  homework: '과제 관리',
  billing: '청구/정산',
  settings: '설정',
  my: '내 정보',
}

export function Breadcrumb() {
  const pathname = usePathname()

  if (!pathname) return null

  const segments = pathname.split('/').filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`
    const name = pathNameMap[segment] || segment

    return {
      name,
      path,
      isLast: index === segments.length - 1,
    }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
          {breadcrumb.isLast ? (
            <span className="font-medium text-foreground">{breadcrumb.name}</span>
          ) : (
            <Link
              href={breadcrumb.path as any}
              className="transition-colors hover:text-foreground"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
