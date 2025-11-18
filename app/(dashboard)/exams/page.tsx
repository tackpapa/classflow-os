'use client'

/**
 * 시험 관리 페이지 (Exams Management) - 강사용
 *
 * TODO: 강사 계정 필터링 구현 필요
 * - 현재: 모든 시험 데이터 표시 (개발용)
 * - 향후: 로그인한 강사 본인이 담당하는 학생의 시험만 필터링
 */

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePageAccess } from '@/hooks/use-page-access'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Eye, Edit, MoreHorizontal, TrendingUp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Exam, ExamScore } from '@/lib/types/database'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data
const mockExams: Exam[] = [
  {
    id: '1',
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
    org_id: 'org-1',
    name: '수학 중간고사',
    subject: '수학',
    class_id: 'class-1',
    class_name: '수학 특강반',
    exam_date: '2025-06-15',
    exam_time: '14:00',
    total_score: 100,
    status: 'completed',
  },
  {
    id: '2',
    created_at: '2025-06-05',
    updated_at: '2025-06-05',
    org_id: 'org-1',
    name: '영어 기말고사',
    subject: '영어',
    class_id: 'class-2',
    class_name: '영어 회화반',
    exam_date: '2025-06-25',
    exam_time: '15:00',
    total_score: 100,
    status: 'scheduled',
  },
  {
    id: '3',
    created_at: '2025-05-20',
    updated_at: '2025-05-20',
    org_id: 'org-1',
    name: '국어 모의고사',
    subject: '국어',
    class_id: 'class-3',
    class_name: '국어 독해반',
    exam_date: '2025-05-30',
    exam_time: '13:00',
    total_score: 100,
    status: 'completed',
  },
]

const mockScores: Record<string, ExamScore[]> = {
  '1': [
    { id: 's1', exam_id: '1', student_id: 'st1', student_name: '김민준', score: 95, grade: 'A' },
    { id: 's2', exam_id: '1', student_id: 'st2', student_name: '이서연', score: 88, grade: 'B' },
    { id: 's3', exam_id: '1', student_id: 'st3', student_name: '박준호', score: 92, grade: 'A' },
    { id: 's4', exam_id: '1', student_id: 'st4', student_name: '최지우', score: 78, grade: 'C' },
    { id: 's5', exam_id: '1', student_id: 'st5', student_name: '정하은', score: 85, grade: 'B' },
  ],
  '3': [
    { id: 's6', exam_id: '3', student_id: 'st1', student_name: '김민준', score: 82, grade: 'B' },
    { id: 's7', exam_id: '3', student_id: 'st2', student_name: '이서연', score: 90, grade: 'A' },
    { id: 's8', exam_id: '3', student_id: 'st3', student_name: '박준호', score: 88, grade: 'B' },
  ],
}

export default function ExamsPage() {
  usePageAccess('exams')

  const { toast } = useToast()
  const [exams, setExams] = useState<Exam[]>(mockExams)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isScoresDialogOpen, setIsScoresDialogOpen] = useState(false)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [examForm, setExamForm] = useState({
    name: '',
    subject: '',
    class_name: '',
    exam_date: '',
    exam_time: '',
    total_score: 100,
  })

  const statusMap = {
    scheduled: { label: '예정', variant: 'secondary' as const },
    completed: { label: '완료', variant: 'default' as const },
    cancelled: { label: '취소', variant: 'outline' as const },
  }

  const columns: ColumnDef<Exam>[] = [
    {
      accessorKey: 'name',
      header: '시험명',
      cell: ({ row }) => {
        const exam = row.original
        return (
          <button
            className="text-primary hover:underline font-medium"
            onClick={() => handleViewScores(exam)}
          >
            {exam.name}
          </button>
        )
      },
    },
    {
      accessorKey: 'subject',
      header: '과목',
      cell: ({ row }) => {
        const subject = row.getValue('subject') as string
        return <Badge variant="secondary">{subject}</Badge>
      },
    },
    {
      accessorKey: 'class_name',
      header: '반',
    },
    {
      accessorKey: 'exam_date',
      header: '시험일',
      cell: ({ row }) => {
        const date = row.getValue('exam_date') as string
        const time = row.original.exam_time
        return `${format(new Date(date), 'yyyy-MM-dd')} ${time}`
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('status') as Exam['status']
        const statusInfo = statusMap[status]
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const exam = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {exam.status === 'completed' && mockScores[exam.id] && (
                <>
                  <DropdownMenuItem onClick={() => handleViewScores(exam)}>
                    <Eye className="mr-2 h-4 w-4" />
                    성적 보기
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewStats(exam)}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    통계 보기
                  </DropdownMenuItem>
                </>
              )}
              {exam.status === 'completed' && !mockScores[exam.id] && (
                <DropdownMenuItem onClick={() => handleEnterScores(exam)}>
                  <Edit className="mr-2 h-4 w-4" />
                  성적 입력
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleViewScores = (exam: Exam) => {
    setSelectedExam(exam)
    setIsScoresDialogOpen(true)
  }

  const handleViewStats = (exam: Exam) => {
    setSelectedExam(exam)
    setIsStatsDialogOpen(true)
  }

  const handleEnterScores = (exam: Exam) => {
    toast({
      title: '성적 입력',
      description: '성적 입력 기능은 구현 예정입니다.',
    })
  }

  const handleCreateExam = () => {
    setExamForm({
      name: '',
      subject: '',
      class_name: '',
      exam_date: '',
      exam_time: '',
      total_score: 100,
    })
    setIsCreateDialogOpen(true)
  }

  const handleSaveExam = () => {
    if (!examForm.name || !examForm.subject || !examForm.class_name || !examForm.exam_date || !examForm.exam_time) {
      toast({
        title: '입력 오류',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      org_id: 'org-1',
      name: examForm.name,
      subject: examForm.subject,
      class_id: 'class-new',
      class_name: examForm.class_name,
      exam_date: examForm.exam_date,
      exam_time: examForm.exam_time,
      total_score: examForm.total_score,
      status: 'scheduled',
    }

    setExams([...exams, newExam])
    toast({
      title: '시험 등록 완료',
      description: `${examForm.name} 시험이 등록되었습니다.`,
    })
    setIsCreateDialogOpen(false)
  }

  const getExamStats = (examId: string) => {
    const scores = mockScores[examId] || []
    if (scores.length === 0) return null

    const scoreValues = scores.map((s) => s.score)
    const avg = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    const max = Math.max(...scoreValues)
    const min = Math.min(...scoreValues)

    // Score distribution
    const distribution = [
      { range: '90-100', count: scoreValues.filter((s) => s >= 90).length },
      { range: '80-89', count: scoreValues.filter((s) => s >= 80 && s < 90).length },
      { range: '70-79', count: scoreValues.filter((s) => s >= 70 && s < 80).length },
      { range: '60-69', count: scoreValues.filter((s) => s >= 60 && s < 70).length },
      { range: '0-59', count: scoreValues.filter((s) => s < 60).length },
    ]

    return { avg, max, min, distribution, total: scores.length }
  }

  const completedExams = exams.filter((e) => e.status === 'completed')

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">시험 관리</h1>
          <p className="text-sm md:text-base text-muted-foreground">시험 및 성적을 관리하세요</p>
        </div>
        <Button onClick={handleCreateExam} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          시험 등록
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 시험</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}개</div>
            <p className="text-xs text-muted-foreground">
              완료: {completedExams.length}개
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 성적</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedExams.length > 0
                ? Math.round(
                    completedExams.reduce((sum, exam) => {
                      const stats = getExamStats(exam.id)
                      return sum + (stats?.avg || 0)
                    }, 0) / completedExams.length
                  )
                : 0}
              점
            </div>
            <p className="text-xs text-muted-foreground">전체 시험 평균</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">응시 학생</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(mockScores).reduce((sum, scores) => sum + scores.length, 0)}
              명
            </div>
            <p className="text-xs text-muted-foreground">총 응시 인원</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={exams}
            searchKey="name"
            searchPlaceholder="시험명으로 검색..."
          />
        </CardContent>
      </Card>

      {/* Exam Creation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>시험 등록</DialogTitle>
            <DialogDescription>새로운 시험을 등록하세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">시험명 *</Label>
              <Input
                id="name"
                value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                placeholder="예: 수학 중간고사"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">과목 *</Label>
              <Input
                id="subject"
                value={examForm.subject}
                onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                placeholder="예: 수학"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_name">반 이름 *</Label>
              <Input
                id="class_name"
                value={examForm.class_name}
                onChange={(e) => setExamForm({ ...examForm, class_name: e.target.value })}
                placeholder="예: 수학 특강반"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam_date">시험일 *</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={examForm.exam_date}
                  onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam_time">시험 시간 *</Label>
                <Input
                  id="exam_time"
                  type="time"
                  value={examForm.exam_time}
                  onChange={(e) => setExamForm({ ...examForm, exam_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_score">만점</Label>
              <Input
                id="total_score"
                type="number"
                value={examForm.total_score}
                onChange={(e) => setExamForm({ ...examForm, total_score: parseInt(e.target.value) || 100 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveExam}>
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scores Dialog */}
      <Dialog open={isScoresDialogOpen} onOpenChange={setIsScoresDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedExam?.name} - 성적</DialogTitle>
            <DialogDescription>학생별 성적 목록</DialogDescription>
          </DialogHeader>

          {selectedExam && mockScores[selectedExam.id] && (
            <div className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">학생</th>
                      <th className="p-2 text-center">점수</th>
                      <th className="p-2 text-center">등급</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockScores[selectedExam.id]
                      .sort((a, b) => b.score - a.score)
                      .map((score, i) => (
                        <tr key={score.id} className="border-b">
                          <td className="p-2">
                            {i + 1}. {score.student_name}
                          </td>
                          <td className="p-2 text-center font-medium">{score.score}점</td>
                          <td className="p-2 text-center">
                            <Badge
                              variant={
                                score.grade === 'A'
                                  ? 'default'
                                  : score.grade === 'B'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {score.grade}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScoresDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedExam?.name} - 통계</DialogTitle>
            <DialogDescription>성적 분석 및 통계</DialogDescription>
          </DialogHeader>

          {selectedExam && (() => {
            const stats = getExamStats(selectedExam.id)
            return stats ? (
              <div className="space-y-6">
                {/* Stats Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">평균</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.avg.toFixed(1)}점</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">최고점</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.max}점</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">최저점</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.min}점</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">응시 인원</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}명</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>점수 분포</CardTitle>
                    <CardDescription>구간별 학생 수</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                성적 데이터가 없습니다.
              </p>
            )
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatsDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
