'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  ClipboardList,
  FileText,
  CreditCard,
  Settings,
  Calendar,
  CheckSquare,
  UserCheck,
  CalendarDays,
  DoorOpen,
  Grid3x3,
  Armchair,
} from 'lucide-react'

const navigation = [
  {
    name: '대시보드',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    name: '전체 스케줄',
    href: '/all-schedules',
    icon: Grid3x3,
  },
  {
    name: '학생 관리',
    href: '/students',
    icon: Users,
  },
  {
    name: '반 관리',
    href: '/classes',
    icon: BookOpen,
  },
  {
    name: '출결 관리',
    href: '/attendance',
    icon: CheckSquare,
  },
  {
    name: '수업일지',
    href: '/lessons',
    icon: Calendar,
  },
  {
    name: '강사 관리',
    href: '/teachers',
    icon: UserCheck,
  },
  {
    name: '시간표',
    href: '/schedule',
    icon: CalendarDays,
  },
  {
    name: '스케줄관리',
    href: '/rooms',
    icon: DoorOpen,
  },
  {
    name: '자리현황판',
    href: '/seats',
    icon: Armchair,
  },
  {
    name: '상담 관리',
    href: '/consultations',
    icon: MessageSquare,
  },
  {
    name: '시험 관리',
    href: '/exams',
    icon: ClipboardList,
  },
  {
    name: '과제 관리',
    href: '/homework',
    icon: FileText,
  },
  {
    name: '청구/정산',
    href: '/billing',
    icon: CreditCard,
  },
  {
    name: '설정',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/10">
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
