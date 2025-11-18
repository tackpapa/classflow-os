'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePageAccess } from '@/hooks/use-page-access'
import { PagePermissions } from '@/components/page-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Eye, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Homework, HomeworkSubmission } from '@/lib/types/database'
import { format } from 'date-fns'

// Mock data
const mockHomework: Homework[] = [
  {
    id: '1',
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
    org_id: 'org-1',
    title: '수학 문제집 1단원',
    description: '1단원 연습문제 1-50번',
    class_id: 'class-1',
    class_name: '수학 특강반',
    due_date: '2025-06-20',
    status: 'active',
    total_students: 15,
    submitted_count: 12,
  },
  {
    id: '2',
    created_at: '2025-06-05',
    updated_at: '2025-06-05',
    org_id: 'org-1',
    title: '영어 에세이 작성',
    description: '주제: My Future Dream',
    class_id: 'class-2',
    class_name: '영어 회화반',
    due_date: '2025-06-25',
    status: 'active',
    total_students: 18,
    submitted_count: 8,
  },
  {
    id: '3',
    created_at: '2025-05-20',
    updated_at: '2025-05-20',
    org_id: 'org-1',
    title: '국어 독서 감상문',
    description: '지정 도서 읽고 감상문 작성',
    class_id: 'class-3',
    class_name: '국어 독해반',
    due_date: '2025-06-10',
    status: 'completed',
    total_students: 12,
    submitted_count: 12,
  },
  {
    id: '4',
    created_at: '2025-05-15',
    updated_at: '2025-05-15',
    org_id: 'org-1',
    title: '과학 실험 보고서',
    description: '화학 실험 결과 정리',
    class_id: 'class-4',
    class_name: '과학 실험반',
    due_date: '2025-05-30',
    status: 'overdue',
    total_students: 10,
    submitted_count: 7,
  },
]

const mockSubmissions: Record<string, HomeworkSubmission[]> = {
  '1': [
    { id: 's1', homework_id: '1', student_id: 'st1', student_name: '김민준', submitted_at: '2025-06-18', status: 'submitted', score: 95, feedback: '매우 잘했습니다' },
    { id: 's2', homework_id: '1', student_id: 'st2', student_name: '이서연', submitted_at: '2025-06-19', status: 'submitted', score: 88 },
    { id: 's3', homework_id: '1', student_id: 'st3', student_name: '박준호', status: 'not_submitted' },
    { id: 's4', homework_id: '1', student_id: 'st4', student_name: '최지우', submitted_at: '2025-06-21', status: 'late', score: 85 },
    { id: 's5', homework_id: '1', student_id: 'st5', student_name: '정하은', submitted_at: '2025-06-17', status: 'submitted', score: 92 },
  ],
  '3': [
    { id: 's6', homework_id: '3', student_id: 'st1', student_name: '김민준', submitted_at: '2025-06-08', status: 'submitted', score: 90 },
    { id: 's7', homework_id: '3', student_id: 'st2', student_name: '이서연', submitted_at: '2025-06-09', status: 'submitted', score: 95 },
  ],
}

export default function HomeworkPage() {
  usePageAccess('homework')

  const { toast } = useToast()
  const [homework, setHomework] = useState<Homework[]>(mockHomework)
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null)
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const statusMap = {
    active: { label: '진행중', variant: 'default' as const },
    completed: { label: '완료', variant: 'outline' as const },
    overdue: { label: '기한초과', variant: 'destructive' as const },
  }

  const columns: ColumnDef<Homework>[] = [
    {
      accessorKey: 'title',
      header: '과제명',
    },
    {
      accessorKey: 'class_name',
      header: '반',
      cell: ({ row }) => {
        const className = row.getValue('class_name') as string
        return <Badge variant="secondary">{className}</Badge>
      },
    },
    {
      accessorKey: 'due_date',
      header: '마감일',
      cell: ({ row }) => {
        const date = row.getValue('due_date') as string
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{format(new Date(date), 'yyyy-MM-dd')}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'submitted_count',
      header: '제출 현황',
      cell: ({ row }) => {
        const submitted = row.getValue('submitted_count') as number
        const total = row.original.total_students
        const percentage = (submitted / total) * 100
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{submitted}/{total}</span>
              <span className="text-muted-foreground">{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('status') as Homework['status']
        const statusInfo = statusMap[status]
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const hw = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewSubmissions(hw)}>
                <Eye className="mr-2 h-4 w-4" />
                제출 현황 보기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleViewSubmissions = (hw: Homework) => {
    setSelectedHomework(hw)
    setIsSubmissionsDialogOpen(true)
  }

  const filteredHomework =
    activeTab === 'all'
      ? homework
      : homework.filter((hw) => hw.status === activeTab)

  const totalHomework = homework.length
  const activeHomework = homework.filter((hw) => hw.status === 'active').length
  const completedHomework = homework.filter((hw) => hw.status === 'completed').length
  const avgSubmissionRate = homework.length > 0
    ? Math.round(homework.reduce((sum, hw) => sum + (hw.submitted_count / hw.total_students * 100), 0) / homework.length)
    : 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PagePermissions pageId="homework" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">과제 관리</h1>
        <p className="text-sm md:text-base text-muted-foreground">과제 및 제출 현황을 관리하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 과제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHomework}개</div>
            <p className="text-xs text-muted-foreground">
              진행중: {activeHomework}개
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 과제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedHomework}개</div>
            <p className="text-xs text-muted-foreground">
              전체 과제의 {Math.round(completedHomework / totalHomework * 100)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 제출률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSubmissionRate}%</div>
            <p className="text-xs text-muted-foreground">전체 과제 평균</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미제출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {homework.reduce((sum, hw) => sum + (hw.total_students - hw.submitted_count), 0)}건
            </div>
            <p className="text-xs text-muted-foreground">전체 미제출 건수</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            전체 ({homework.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            진행중 ({homework.filter((hw) => hw.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            완료 ({homework.filter((hw) => hw.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            기한초과 ({homework.filter((hw) => hw.status === 'overdue').length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={filteredHomework}
                searchKey="title"
                searchPlaceholder="과제명으로 검색..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submissions Dialog */}
      <Dialog open={isSubmissionsDialogOpen} onOpenChange={setIsSubmissionsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedHomework?.title} - 제출 현황</DialogTitle>
            <DialogDescription>학생별 과제 제출 상태</DialogDescription>
          </DialogHeader>

          {selectedHomework && mockSubmissions[selectedHomework.id] && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">제출</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {mockSubmissions[selectedHomework.id].filter((s) => s.status === 'submitted').length}명
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">늦은 제출</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {mockSubmissions[selectedHomework.id].filter((s) => s.status === 'late').length}명
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">미제출</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {mockSubmissions[selectedHomework.id].filter((s) => s.status === 'not_submitted').length}명
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">학생</th>
                      <th className="p-2 text-center">상태</th>
                      <th className="p-2 text-center">제출일</th>
                      <th className="p-2 text-center">점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSubmissions[selectedHomework.id].map((submission) => (
                      <tr key={submission.id} className="border-b">
                        <td className="p-2">{submission.student_name}</td>
                        <td className="p-2 text-center">
                          {submission.status === 'submitted' && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              제출
                            </Badge>
                          )}
                          {submission.status === 'late' && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              늦은 제출
                            </Badge>
                          )}
                          {submission.status === 'not_submitted' && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              미제출
                            </Badge>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {submission.submitted_at
                            ? format(new Date(submission.submitted_at), 'yyyy-MM-dd')
                            : '-'}
                        </td>
                        <td className="p-2 text-center font-medium">
                          {submission.score ? `${submission.score}점` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmissionsDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
