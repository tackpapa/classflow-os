// 위젯 타입 정의
export type WidgetType =
  | 'students-total'
  | 'students-status'
  | 'students-grade-distribution'
  | 'consultations-summary'
  | 'consultations-upcoming'
  | 'consultations-conversion'
  | 'classes-summary'
  | 'classes-capacity'
  | 'exams-summary'
  | 'exams-recent'
  | 'homework-summary'
  | 'homework-submission'
  | 'billing-summary'
  | 'billing-revenue-trend'
  | 'billing-expense-category'
  | 'attendance-today'
  | 'attendance-weekly'
  | 'attendance-alerts'
  | 'lessons-summary'
  | 'lessons-recent'
  | 'teachers-summary'
  | 'schedule-today'
  | 'rooms-usage'
  | 'seats-realtime'
  | 'expenses-summary'
  | 'expenses-trend'
  | 'realtime-status' // 기존 실시간 현황
  | 'recent-activities' // 기존 최근 활동
  | 'announcements' // 기존 공지사항

export interface Widget {
  id: string
  type: WidgetType
  title: string
  description: string
  category: WidgetCategory
  size: WidgetSize
  enabled: boolean
  order: number
}

export type WidgetCategory =
  | '학생관리'
  | '상담관리'
  | '수업관리'
  | '재무관리'
  | '출결관리'
  | '시설관리'
  | '실시간'
  | '기타'

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

// 위젯 크기 매핑 (Tailwind grid classes)
export const widgetSizeClasses: Record<WidgetSize, string> = {
  small: 'col-span-12 md:col-span-6 lg:col-span-3',    // 1/4
  medium: 'col-span-12 md:col-span-6 lg:col-span-6',   // 1/2
  large: 'col-span-12 md:col-span-12 lg:col-span-9',   // 3/4
  full: 'col-span-12',                                 // 전체
}
