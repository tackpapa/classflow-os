'use client'

import { Widget } from '@/lib/types/widget'
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  BookOpen,
  ClipboardCheck,
  AlertCircle,
  Clock,
  Home,
  Armchair,
  FileText,
  GraduationCap,
  BarChart3,
  PieChart,
  TrendingDown,
  Activity,
  Zap,
  MessageCircle,
  FileCheck,
  ClipboardList,
  CheckSquare,
  Upload,
  LineChart as LineChartIcon,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Bell,
} from 'lucide-react'
import { WidgetWrapper } from './WidgetWrapper'
import {
  stats,
  revenueData,
  studentTrendData,
  attendanceData,
  recentActivities,
  announcements,
  gradeDistribution,
  upcomingConsultations,
  conversionData,
  classCapacity,
  examData,
  recentExams,
  homeworkData,
  homeworkSubmission,
  expenseCategory,
  expenseTrend,
  todayAttendance,
  attendanceAlerts,
  lessonLogs,
  recentLessons,
  teacherStats,
  todayClasses,
  getCurrentClasses,
  roomUsage,
  seatStatus,
} from '@/lib/data/mockData'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface WidgetRendererProps {
  widget: Widget
  onRemove: () => void
  currentTime?: Date
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function WidgetRenderer({ widget, onRemove, currentTime }: WidgetRendererProps) {
  switch (widget.type) {
    case 'realtime-status':
      const currentClasses = currentTime ? getCurrentClasses(currentTime) : []
      return (
        <WidgetWrapper
          title="실시간 현황"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{seatStatus.occupied}</div>
                <div className="text-xs text-muted-foreground">독서실 이용</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentClasses.length}</div>
                <div className="text-xs text-muted-foreground">진행 중 수업</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{todayAttendance.present}</div>
                <div className="text-xs text-muted-foreground">오늘 출석</div>
              </div>
            </div>
            {currentClasses.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium mb-2">진행 중인 수업</div>
                <div className="space-y-2">
                  {currentClasses.slice(0, 3).map((cls) => (
                    <div key={cls.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{cls.name}</div>
                      <div className="text-muted-foreground">{cls.teacher} • {cls.room}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </WidgetWrapper>
      )

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

    case 'students-grade-distribution':
      return (
        <WidgetWrapper
          title="학년별 분포"
          description="학년별 학생 수"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </WidgetWrapper>
      )

    case 'consultations-summary':
      return (
        <WidgetWrapper
          title="상담 현황"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{stats.todayConsultations}</div>
            <p className="text-xs text-muted-foreground">오늘 예정된 상담</p>
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

    case 'consultations-upcoming':
      return (
        <WidgetWrapper
          title="예정된 상담"
          description="오늘/내일 상담 일정"
          icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-3">
            {upcomingConsultations.map((consult, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div>
                  <div className="font-medium">{consult.student}</div>
                  <div className="text-xs text-muted-foreground">{consult.type} • {consult.parent}</div>
                </div>
                <div className="text-xs text-muted-foreground">{consult.time}</div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'consultations-conversion':
      return (
        <WidgetWrapper
          title="입교 전환율"
          description="상담→입교 전환 추이"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="consultations" stroke="#3b82f6" name="상담" />
              <Line type="monotone" dataKey="enrollments" stroke="#10b981" name="입교" />
            </LineChart>
          </ResponsiveContainer>
        </WidgetWrapper>
      )

    case 'classes-summary':
      return (
        <WidgetWrapper
          title="반 운영 현황"
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">운영 중인 반</p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">평균 충원율</span>
              <span className="font-medium text-green-600">82%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">평균 인원</span>
              <span className="font-medium">17.5명</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'classes-capacity':
      return (
        <WidgetWrapper
          title="반별 충원율"
          description="주요 반 충원 현황"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-3">
            {classCapacity.map((cls, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cls.class}</span>
                  <span className="text-muted-foreground">{cls.current}/{cls.max}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(cls.current / cls.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'exams-summary':
      return (
        <WidgetWrapper
          title="시험 현황"
          icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{examData.pending + examData.completed}</div>
            <p className="text-xs text-muted-foreground">총 시험 수</p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">채점 대기</span>
              <span className="font-medium text-yellow-600">{examData.pending}건</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">평균 점수</span>
              <span className="font-medium text-green-600">{examData.avgScore}점</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'exams-recent':
      return (
        <WidgetWrapper
          title="최근 시험 결과"
          description="평균 성적 및 응시 인원"
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-3">
            {recentExams.map((exam, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div>
                  <div className="font-medium">{exam.subject}</div>
                  <div className="text-xs text-muted-foreground">{exam.date} • {exam.students}명</div>
                </div>
                <div className="text-lg font-bold">{exam.avgScore}점</div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'homework-summary':
      return (
        <WidgetWrapper
          title="과제 현황"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{homeworkData.active}</div>
            <p className="text-xs text-muted-foreground">진행 중인 과제</p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">완료</span>
              <span className="font-medium text-green-600">{homeworkData.completed}건</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">평균 제출률</span>
              <span className="font-medium">{homeworkData.submissionRate}%</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'homework-submission':
      return (
        <WidgetWrapper
          title="과제 제출률"
          description="반별 제출 현황"
          icon={<Upload className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-3">
            {homeworkSubmission.map((hw, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{hw.class}</span>
                  <span className="text-muted-foreground">{hw.submitted}/{hw.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(hw.submitted / hw.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'billing-summary':
      return (
        <WidgetWrapper
          title="재무 현황"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">₩{(stats.monthlyRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-green-500" />
              {stats.revenueChange} 전월 대비
            </p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">이번 달 수익</span>
              <span className="font-medium text-green-600">₩24.5M</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'billing-revenue-trend':
      return (
        <WidgetWrapper
          title="월별 매출"
          description="최근 6개월 매출 추이"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <ResponsiveContainer width="100%" height={250}>
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

    case 'billing-expense-category':
      return (
        <WidgetWrapper
          title="지출 카테고리"
          description="항목별 지출 분포"
          icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={expenseCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {expenseCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </WidgetWrapper>
      )

    case 'attendance-today':
      return (
        <WidgetWrapper
          title="오늘 출결"
          icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{todayAttendance.present}</div>
            <p className="text-xs text-muted-foreground">출석 ({((todayAttendance.present / todayAttendance.total) * 100).toFixed(0)}%)</p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">지각</span>
              <span className="font-medium text-yellow-600">{todayAttendance.late}명</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">결석</span>
              <span className="font-medium text-red-600">{todayAttendance.absent}명</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'attendance-weekly':
      return (
        <WidgetWrapper
          title="주간 출결률"
          description="이번 주 요일별 출결 현황"
          icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <ResponsiveContainer width="100%" height={250}>
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

    case 'attendance-alerts':
      return (
        <WidgetWrapper
          title="출결 경고"
          icon={<AlertCircle className="h-4 w-4 text-red-500" />}
          description="주의가 필요한 학생"
          onRemove={onRemove}
        >
          <div className="space-y-3">
            {attendanceAlerts.map((alert, i) => (
              <div key={i} className="p-2 bg-red-50 dark:bg-red-950 rounded text-sm">
                <div className="font-medium text-red-700 dark:text-red-400">{alert.student}</div>
                <div className="text-xs text-red-600 dark:text-red-500">{alert.status}</div>
                <div className="text-xs text-muted-foreground">{alert.class}</div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'lessons-summary':
      return (
        <WidgetWrapper
          title="수업일지 현황"
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{lessonLogs.thisMonth}</div>
            <p className="text-xs text-muted-foreground">이번 달 작성</p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">미작성</span>
              <span className="font-medium text-yellow-600">{lessonLogs.pending}건</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">평균 평점</span>
              <span className="font-medium text-green-600">⭐ {lessonLogs.avgRating}</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'lessons-recent':
      return (
        <WidgetWrapper
          title="최근 수업일지"
          description="최근 작성된 수업일지"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-3">
            {recentLessons.map((lesson, i) => (
              <div key={i} className="text-sm">
                <div className="font-medium">{lesson.class}</div>
                <div className="text-xs text-muted-foreground">{lesson.topic}</div>
                <div className="text-xs text-muted-foreground">{lesson.teacher} • {lesson.date}</div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'teachers-summary':
      return (
        <WidgetWrapper
          title="강사 현황"
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">{teacherStats.total}</div>
            <p className="text-xs text-muted-foreground">전체 강사</p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">활동 중</span>
              <span className="font-medium text-green-600">{teacherStats.active}명</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">평균 담당 학생</span>
              <span className="font-medium">{teacherStats.avgStudents}명</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'schedule-today':
      return (
        <WidgetWrapper
          title="오늘 수업 일정"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="오늘 예정된 수업"
          onRemove={onRemove}
        >
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {todayClasses.slice(0, 5).map((cls) => (
              <div key={cls.id} className="text-sm p-2 bg-muted rounded">
                <div className="font-medium">{cls.name}</div>
                <div className="text-xs text-muted-foreground">
                  {cls.startTime}-{cls.endTime} • {cls.teacher} • {cls.room}
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'rooms-usage':
      return (
        <WidgetWrapper
          title="강의실 사용률"
          icon={<Home className="h-4 w-4 text-muted-foreground" />}
          description="강의실별 사용 현황"
          onRemove={onRemove}
        >
          <div className="space-y-3">
            {roomUsage.map((room, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{room.room}</span>
                  <span className="text-muted-foreground">{room.usage}% ({room.classes}개 수업)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${room.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      )

    case 'seats-realtime':
      return (
        <WidgetWrapper
          title="독서실 좌석"
          icon={<Armchair className="h-4 w-4 text-muted-foreground" />}
          description="실시간 좌석 현황"
          onRemove={onRemove}
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{seatStatus.occupied}/{seatStatus.total}</div>
              <div className="text-sm text-muted-foreground">사용 중 좌석</div>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${(seatStatus.occupied / seatStatus.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>사용 중: {seatStatus.occupied}석</span>
              <span>남은 좌석: {seatStatus.available}석</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'expenses-summary':
      return (
        <WidgetWrapper
          title="지출 현황"
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">₩14.3M</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-red-500" />
              이번 달 지출
            </p>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-muted-foreground">인건비</span>
              <span className="font-medium">₩8.5M</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">임대료</span>
              <span className="font-medium">₩3.0M</span>
            </div>
          </div>
        </WidgetWrapper>
      )

    case 'expenses-trend':
      return (
        <WidgetWrapper
          title="지출 추이"
          description="월별 지출 변화"
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={expenseTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </WidgetWrapper>
      )

    case 'recent-activities':
      return (
        <WidgetWrapper
          title="최근 활동"
          description="최근 7일간의 주요 활동"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
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
        <WidgetWrapper
          title="공지사항"
          description="중요한 공지사항"
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
          onRemove={onRemove}
        >
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
