'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePageAccess } from '@/hooks/use-page-access'
import { PagePermissions } from '@/components/page-permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, BookOpen, TrendingUp, Sparkles, Calendar, Clock } from 'lucide-react'
import type { LessonNote } from '@/lib/types/database'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock data
const mockLessons: LessonNote[] = [
  {
    id: '1',
    created_at: '2025-06-18T09:00:00',
    updated_at: '2025-06-18T11:00:00',
    org_id: 'org-1',
    lesson_date: '2025-06-18',
    lesson_time: '09:00',
    class_id: 'class-1',
    class_name: '수학 특강반',
    teacher_id: 'teacher-1',
    teacher_name: '김선생',
    subject: '수학',
    content: '미적분 기본 정리 - 극한의 개념과 연속성 학습. 함수의 극한값 계산 연습문제 풀이.',
    student_attitudes: '전반적으로 집중도가 높았으며, 질문도 활발하게 했습니다. 특히 김민준, 이서연 학생이 적극적이었습니다.',
    comprehension_level: 'high',
    homework_assigned: '교재 p.45-48 문제 풀이, 극한값 계산 연습문제 10개',
    next_lesson_plan: '함수의 미분과 도함수 개념 도입',
    parent_feedback: '오늘 수업에서 미적분의 기본 개념인 극한에 대해 학습했습니다. 학생들의 이해도가 높았으며, 특히 개념 이해를 위한 다양한 예제를 통해 실력이 향상되고 있습니다.',
  },
  {
    id: '2',
    created_at: '2025-06-18T13:00:00',
    updated_at: '2025-06-18T15:00:00',
    org_id: 'org-1',
    lesson_date: '2025-06-18',
    lesson_time: '13:00',
    class_id: 'class-2',
    class_name: '영어 회화반',
    teacher_id: 'teacher-2',
    teacher_name: '박선생',
    subject: '영어',
    content: 'Daily conversation - Ordering food at restaurant. Role-playing activities and pronunciation practice.',
    student_attitudes: '대부분의 학생들이 적극적으로 참여했으나, 몇몇 학생들은 발음에 어려움을 겪었습니다.',
    comprehension_level: 'medium',
    homework_assigned: '오늘 배운 표현으로 짧은 대화문 작성하기, 발음 연습 녹음 제출',
    next_lesson_plan: 'Telephone conversation practice',
    parent_feedback: '레스토랑에서 음식 주문하기를 주제로 실용적인 회화 연습을 진행했습니다. 학생들이 적극적으로 참여했으며, 발음 교정을 통해 실력이 향상되고 있습니다.',
  },
  {
    id: '3',
    created_at: '2025-06-17T10:00:00',
    updated_at: '2025-06-17T12:00:00',
    org_id: 'org-1',
    lesson_date: '2025-06-17',
    lesson_time: '10:00',
    class_id: 'class-3',
    class_name: '국어 독해반',
    teacher_id: 'teacher-3',
    teacher_name: '이선생',
    subject: '국어',
    content: '현대 소설 분석 - 작품의 주제 의식과 인물 간 갈등 구조 파악. 문학적 표현 기법 학습.',
    student_attitudes: '학생들이 텍스트 분석에 어려움을 겪었으나, 토론을 통해 이해도가 높아졌습니다.',
    comprehension_level: 'low',
    homework_assigned: '작품 전체 읽고 주제 의식 정리하기, 인물 관계도 작성',
    next_lesson_plan: '시 문학의 이해 - 운율과 심상',
    parent_feedback: '현대 소설 작품 분석을 통해 문학적 사고력을 키우는 시간이었습니다. 처음에는 어려워했지만, 토론을 통해 이해도가 높아졌으며, 개별 지도를 통해 실력 향상을 도모하고 있습니다.',
  },
  {
    id: '4',
    created_at: '2025-06-17T14:00:00',
    updated_at: '2025-06-17T16:00:00',
    org_id: 'org-1',
    lesson_date: '2025-06-17',
    lesson_time: '14:00',
    class_id: 'class-1',
    class_name: '수학 특강반',
    teacher_id: 'teacher-1',
    teacher_name: '김선생',
    subject: '수학',
    content: '이차함수의 그래프 - 평행이동과 대칭이동, 최댓값과 최솟값 구하기',
    student_attitudes: '학생들이 그래프 그리기 실습에 집중했으며, 개념 이해가 빨랐습니다.',
    comprehension_level: 'high',
    homework_assigned: '이차함수 그래프 그리기 연습 10문제',
    next_lesson_plan: '이차방정식과 이차함수의 관계',
  },
  {
    id: '5',
    created_at: '2025-06-16T11:00:00',
    updated_at: '2025-06-16T13:00:00',
    org_id: 'org-1',
    lesson_date: '2025-06-16',
    lesson_time: '11:00',
    class_id: 'class-2',
    class_name: '영어 회화반',
    teacher_id: 'teacher-2',
    teacher_name: '박선생',
    subject: '영어',
    content: 'Grammar focus - Present perfect tense usage and practice',
    student_attitudes: '문법 개념 이해는 좋았으나 실제 문장 만들기에서 실수가 많았습니다.',
    comprehension_level: 'medium',
    homework_assigned: 'Present perfect tense 문장 20개 작성',
    next_lesson_plan: 'Present perfect vs Simple past comparison',
  },
]

// Today's lessons (filtering for today)
const today = '2025-06-18'
const todayLessons = mockLessons.filter((lesson) => lesson.lesson_date === today)

// Mock statistics data
const monthlyProgressData = [
  { month: '1월', lessons: 18, planned: 20 },
  { month: '2월', lessons: 19, planned: 20 },
  { month: '3월', lessons: 20, planned: 20 },
  { month: '4월', lessons: 17, planned: 20 },
  { month: '5월', lessons: 19, planned: 20 },
  { month: '6월', lessons: 12, planned: 20 },
]

const comprehensionTrendData = [
  { week: '1주차', high: 65, medium: 25, low: 10 },
  { week: '2주차', high: 70, medium: 20, low: 10 },
  { week: '3주차', high: 68, medium: 22, low: 10 },
  { week: '4주차', high: 75, medium: 20, low: 5 },
]

const comprehensionMap = {
  high: { label: '상', variant: 'default' as const, color: 'text-green-600' },
  medium: { label: '중', variant: 'secondary' as const, color: 'text-yellow-600' },
  low: { label: '하', variant: 'outline' as const, color: 'text-red-600' },
}

export default function LessonsPage() {
  usePageAccess('lessons')

  const { toast } = useToast()
  const [lessons, setLessons] = useState<LessonNote[]>(mockLessons)
  const [todayLessonsList, setTodayLessonsList] = useState<LessonNote[]>(todayLessons)
  const [selectedLesson, setSelectedLesson] = useState<LessonNote | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('all')

  // Form state
  const [formData, setFormData] = useState<Partial<LessonNote>>({
    lesson_date: today,
    lesson_time: '',
    class_id: '',
    class_name: '',
    subject: '',
    content: '',
    student_attitudes: '',
    comprehension_level: 'medium',
    homework_assigned: '',
    next_lesson_plan: '',
    parent_feedback: '',
  })

  const handleCreateLesson = () => {
    setIsEditing(false)
    setFormData({
      lesson_date: today,
      lesson_time: '',
      class_id: '',
      class_name: '',
      subject: '',
      content: '',
      student_attitudes: '',
      comprehension_level: 'medium',
      homework_assigned: '',
      next_lesson_plan: '',
      parent_feedback: '',
    })
    setIsDialogOpen(true)
  }

  const handleEditLesson = (lesson: LessonNote) => {
    setIsEditing(true)
    setSelectedLesson(lesson)
    setFormData(lesson)
    setIsDialogOpen(true)
  }

  const handleGenerateFeedback = () => {
    setIsGeneratingFeedback(true)

    // Mock GPT feedback generation
    setTimeout(() => {
      const mockFeedback = `오늘 ${formData.subject} 수업에서 ${formData.content?.substring(0, 30)}... 내용을 학습했습니다. 학생들의 이해도는 ${comprehensionMap[formData.comprehension_level as keyof typeof comprehensionMap].label} 수준이며, ${formData.student_attitudes} 다음 시간에는 ${formData.next_lesson_plan}를 진행할 예정입니다.`

      setFormData((prev) => ({
        ...prev,
        parent_feedback: mockFeedback,
      }))

      setIsGeneratingFeedback(false)

      toast({
        title: 'AI 피드백 생성 완료',
        description: '부모님께 보낼 피드백이 생성되었습니다.',
      })
    }, 1500)
  }

  const handleSaveLesson = () => {
    if (!formData.class_name || !formData.content || !formData.student_attitudes) {
      toast({
        title: '필수 정보 누락',
        description: '반 이름, 학습 내용, 학생 태도는 필수입니다.',
        variant: 'destructive',
      })
      return
    }

    if (isEditing && selectedLesson) {
      // Update existing lesson
      const updatedLessons = lessons.map((lesson) =>
        lesson.id === selectedLesson.id
          ? { ...lesson, ...formData, updated_at: new Date().toISOString() }
          : lesson
      )
      setLessons(updatedLessons)
      setTodayLessonsList(updatedLessons.filter((l) => l.lesson_date === today))

      toast({
        title: '수업일지 수정 완료',
        description: '수업일지가 성공적으로 수정되었습니다.',
      })
    } else {
      // Create new lesson
      const newLesson: LessonNote = {
        ...formData as LessonNote,
        id: `lesson-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        org_id: 'org-1',
        teacher_id: 'teacher-1',
        teacher_name: '김선생',
      }

      const updatedLessons = [newLesson, ...lessons]
      setLessons(updatedLessons)
      setTodayLessonsList(updatedLessons.filter((l) => l.lesson_date === today))

      toast({
        title: '수업일지 작성 완료',
        description: '수업일지가 성공적으로 작성되었습니다.',
      })
    }

    setIsDialogOpen(false)
    setSelectedLesson(null)
  }

  // Filter lessons by class
  const filteredLessons = selectedClass === 'all'
    ? lessons
    : lessons.filter((lesson) => lesson.class_id === selectedClass)

  const filteredTodayLessons = selectedClass === 'all'
    ? todayLessonsList
    : todayLessonsList.filter((lesson) => lesson.class_id === selectedClass)

  // Columns for today's lessons
  const todayColumns: ColumnDef<LessonNote>[] = [
    {
      accessorKey: 'lesson_time',
      header: '시간',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('lesson_time')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'class_name',
      header: '반 이름',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('class_name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'subject',
      header: '과목',
    },
    {
      accessorKey: 'content',
      header: '학습 내용',
      cell: ({ row }) => {
        const content = row.getValue('content') as string
        return <span className="max-w-md truncate block">{content}</span>
      },
    },
    {
      accessorKey: 'comprehension_level',
      header: '이해도',
      cell: ({ row }) => {
        const level = row.getValue('comprehension_level') as keyof typeof comprehensionMap
        const { label, variant } = comprehensionMap[level]
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const lesson = row.original
        return (
          <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)}>
            <Edit className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  // Columns for lesson history
  const historyColumns: ColumnDef<LessonNote>[] = [
    {
      accessorKey: 'lesson_date',
      header: '날짜',
      cell: ({ row }) => {
        const date = new Date(row.getValue('lesson_date'))
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(date, 'yyyy-MM-dd (EEE)', { locale: ko })}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'lesson_time',
      header: '시간',
    },
    {
      accessorKey: 'class_name',
      header: '반 이름',
    },
    {
      accessorKey: 'subject',
      header: '과목',
    },
    {
      accessorKey: 'content',
      header: '학습 내용',
      cell: ({ row }) => {
        const content = row.getValue('content') as string
        return <span className="max-w-xs truncate block">{content}</span>
      },
    },
    {
      accessorKey: 'comprehension_level',
      header: '이해도',
      cell: ({ row }) => {
        const level = row.getValue('comprehension_level') as keyof typeof comprehensionMap
        const { label, variant } = comprehensionMap[level]
        return <Badge variant={variant}>{label}</Badge>
      },
    },
    {
      accessorKey: 'teacher_name',
      header: '강사',
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const lesson = row.original
        return (
          <Button variant="ghost" size="sm" onClick={() => handleEditLesson(lesson)}>
            <Edit className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  // Statistics
  const totalLessons = lessons.length
  const thisMonthLessons = lessons.filter(
    (lesson) => new Date(lesson.lesson_date).getMonth() === 5
  ).length
  const highComprehension = lessons.filter((l) => l.comprehension_level === 'high').length
  const avgComprehension = Math.round((highComprehension / totalLessons) * 100)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PagePermissions pageId="lessons" />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">수업일지 관리</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            수업 내용을 기록하고 학생 피드백을 관리합니다
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start w-full sm:w-auto">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="반 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 반</SelectItem>
              <SelectItem value="class-1">수학 특강반</SelectItem>
              <SelectItem value="class-2">영어 회화반</SelectItem>
              <SelectItem value="class-3">국어 독해반</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateLesson} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            수업일지 작성
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수업 수</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}회</div>
            <p className="text-xs text-muted-foreground">전체 기록된 수업</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 수업</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthLessons}회</div>
            <p className="text-xs text-muted-foreground">6월 진행 수업</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">높은 이해도</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highComprehension}회</div>
            <p className="text-xs text-muted-foreground">이해도 '상' 수업</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 이해도</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgComprehension}%</div>
            <p className="text-xs text-muted-foreground">전체 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">오늘 수업</TabsTrigger>
          <TabsTrigger value="history">수업일지 기록</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
        </TabsList>

        {/* Today's Lessons Tab */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>오늘의 수업 ({format(new Date(today), 'yyyy년 M월 d일', { locale: ko })})</CardTitle>
              <CardDescription>
                오늘 진행된 수업에 대한 수업일지를 작성하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={todayColumns} data={filteredTodayLessons} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>수업일지 기록</CardTitle>
              <CardDescription>
                과거에 작성된 모든 수업일지를 조회합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={historyColumns} data={filteredLessons} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>월별 수업 진행률</CardTitle>
                <CardDescription>계획 대비 실제 진행된 수업 수</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="planned" fill="#94a3b8" name="계획" />
                    <Bar dataKey="lessons" fill="#3b82f6" name="실제" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>주차별 이해도 트렌드</CardTitle>
                <CardDescription>학생들의 이해도 분포 변화</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comprehensionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="high" stroke="#22c55e" name="상" strokeWidth={2} />
                    <Line type="monotone" dataKey="medium" stroke="#eab308" name="중" strokeWidth={2} />
                    <Line type="monotone" dataKey="low" stroke="#ef4444" name="하" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? '수업일지 수정' : '수업일지 작성'}
            </DialogTitle>
            <DialogDescription>
              수업 내용과 학생 피드백을 입력하세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesson_date">수업 날짜</Label>
                <Input
                  id="lesson_date"
                  type="date"
                  value={formData.lesson_date}
                  onChange={(e) =>
                    setFormData({ ...formData, lesson_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson_time">수업 시간</Label>
                <Input
                  id="lesson_time"
                  type="time"
                  value={formData.lesson_time}
                  onChange={(e) =>
                    setFormData({ ...formData, lesson_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_name">반 이름</Label>
                <Input
                  id="class_name"
                  value={formData.class_name}
                  onChange={(e) =>
                    setFormData({ ...formData, class_name: e.target.value })
                  }
                  placeholder="예: 수학 특강반"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">과목</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="예: 수학"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">학습 내용 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="오늘 수업에서 다룬 내용을 상세히 입력하세요"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_attitudes">학생 태도 *</Label>
              <Textarea
                id="student_attitudes"
                value={formData.student_attitudes}
                onChange={(e) =>
                  setFormData({ ...formData, student_attitudes: e.target.value })
                }
                placeholder="학생들의 수업 참여도, 태도, 집중력 등을 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprehension_level">이해도</Label>
              <Select
                value={formData.comprehension_level}
                onValueChange={(value: 'high' | 'medium' | 'low') =>
                  setFormData({ ...formData, comprehension_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">상 - 대부분의 학생이 이해함</SelectItem>
                  <SelectItem value="medium">중 - 보통 수준의 이해도</SelectItem>
                  <SelectItem value="low">하 - 추가 설명이 필요함</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homework_assigned">과제</Label>
              <Textarea
                id="homework_assigned"
                value={formData.homework_assigned}
                onChange={(e) =>
                  setFormData({ ...formData, homework_assigned: e.target.value })
                }
                placeholder="학생들에게 부여한 과제를 입력하세요"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_lesson_plan">다음 수업 계획</Label>
              <Textarea
                id="next_lesson_plan"
                value={formData.next_lesson_plan}
                onChange={(e) =>
                  setFormData({ ...formData, next_lesson_plan: e.target.value })
                }
                placeholder="다음 수업에서 다룰 내용을 입력하세요"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="parent_feedback">부모 피드백</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFeedback}
                  disabled={isGeneratingFeedback || !formData.content}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGeneratingFeedback ? 'AI 생성 중...' : 'AI 피드백 생성'}
                </Button>
              </div>
              <Textarea
                id="parent_feedback"
                value={formData.parent_feedback}
                onChange={(e) =>
                  setFormData({ ...formData, parent_feedback: e.target.value })
                }
                placeholder="부모님께 보낼 피드백을 입력하거나 AI로 생성하세요"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                AI 버튼을 클릭하면 수업 내용을 바탕으로 부모님께 보낼 피드백 초안이 자동 생성됩니다
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveLesson}>
              {isEditing ? '수정' : '작성'} 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
