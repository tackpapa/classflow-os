'use client'

import { Widget } from '@/lib/types/widget'
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { WidgetWrapper } from './WidgetWrapper'
import { stats, revenueData, attendanceData, recentActivities, announcements } from '@/lib/data/mockData'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowUp } from 'lucide-react'

interface WidgetRendererProps {
  widget: Widget
  onRemove: () => void
  currentTime?: Date
}

export function WidgetRenderer({ widget, onRemove, currentTime }: WidgetRendererProps) {
  switch (widget.type) {
    case 'students-total':
      return (
        <WidgetWrapper
          title="전체 학생"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              +12% 전월 대비
            </p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">재학생</span>
              <span className="font-medium text-green-600">{stats.activeStudents}명</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">휴학생</span>
              <span className="font-medium text-yellow-600">{stats.inactiveStudents}명</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'consultations-summary':
      return (
        <WidgetWrapper
          title="오늘 상담"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{stats.todayConsultations}</div>
            <p className="text-xs text-muted-foreground">예정된 상담</p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">예정</span>
              <span className="font-medium text-blue-600">{stats.scheduledConsultations}건</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">완료</span>
              <span className="font-medium text-green-600">{stats.completedConsultations}건</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'billing-summary':
      return (
        <WidgetWrapper
          title="월 매출"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">₩{(stats.monthlyRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              {stats.revenueChange}
            </p>
          </div>
        </WidgetWrapper>
      )

    case 'billing-revenue-trend':
      return (
        <WidgetWrapper title="월별 매출" description="최근 6개월 매출 추이" onRemove={onRemove}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </WidgetWrapper>
      )

    case 'attendance-weekly':
      return (
        <WidgetWrapper title="주간 출결률" description="이번 주 요일별 출결 현황" onRemove={onRemove}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[85, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </WidgetWrapper>
      )

    case 'recent-activities':
      return (
        <WidgetWrapper title="최근 활동" description="최근 7일간의 주요 활동" onRemove={onRemove}>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="text-muted-foreground text-xs">{activity.time}</p>
                  <p>{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'announcements':
      return (
        <WidgetWrapper title="공지사항" description="중요한 공지사항" onRemove={onRemove}>
          <div className="space-y-4">
            {announcements.map((notice, i) => (
              <div key={i} className="flex justify-between items-start">
                <p className="text-sm font-medium">{notice.title}</p>
                <p className="text-xs text-muted-foreground">{notice.date}</p>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    default:
      return (
        <WidgetWrapper title={widget.title} description={widget.description} onRemove={onRemove}>
          <div className="text-sm text-muted-foreground">위젯을 준비 중입니다...</div>
        </WidgetWrapper>
      )
  }
}
