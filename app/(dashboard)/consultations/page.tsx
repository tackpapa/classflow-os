'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePageAccess } from '@/hooks/use-page-access'
import { PagePermissions } from '@/components/page-permissions'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Eye, MoreHorizontal, Phone, Mail } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Consultation } from '@/lib/types/database'
import { format } from 'date-fns'

// Mock data
const mockConsultations: Consultation[] = [
  {
    id: '1',
    created_at: '2025-06-15T10:00:00',
    updated_at: '2025-06-15T10:00:00',
    org_id: 'org-1',
    student_name: '김철수',
    student_grade: 10,
    parent_name: '김학부모',
    parent_phone: '010-1234-5678',
    parent_email: 'parent@example.com',
    goals: '수학 성적 향상',
    preferred_times: '평일 오후 2-4시',
    scheduled_date: '2025-06-20T14:00:00',
    status: 'scheduled',
    notes: '수학 기초가 부족함',
  },
  {
    id: '2',
    created_at: '2025-06-16T09:00:00',
    updated_at: '2025-06-16T09:00:00',
    org_id: 'org-1',
    student_name: '이영희',
    student_grade: 11,
    parent_name: '이학부모',
    parent_phone: '010-2345-6789',
    parent_email: 'parent2@example.com',
    goals: '영어 회화 실력 향상',
    preferred_times: '주말 오전',
    status: 'new',
  },
  {
    id: '3',
    created_at: '2025-06-10T11:00:00',
    updated_at: '2025-06-10T11:00:00',
    org_id: 'org-1',
    student_name: '박민준',
    student_grade: 9,
    parent_name: '박학부모',
    parent_phone: '010-3456-7890',
    goals: '전반적인 학습 관리',
    scheduled_date: '2025-06-12T15:00:00',
    status: 'completed',
    result: '수학, 영어 수강 추천. 주 3회 수업 등록 완료',
  },
]

export default function ConsultationsPage() {
  usePageAccess('consultations')

  const { toast } = useToast()
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const statusMap = {
    new: { label: '신규', variant: 'default' as const },
    scheduled: { label: '예정', variant: 'secondary' as const },
    completed: { label: '완료', variant: 'outline' as const },
    cancelled: { label: '취소', variant: 'destructive' as const },
  }

  const columns: ColumnDef<Consultation>[] = [
    {
      accessorKey: 'student_name',
      header: '학생 이름',
    },
    {
      accessorKey: 'student_grade',
      header: '학년',
      cell: ({ row }) => {
        const grade = row.getValue('student_grade') as number
        return grade ? `${grade}학년` : '-'
      },
    },
    {
      accessorKey: 'parent_name',
      header: '학부모',
    },
    {
      accessorKey: 'parent_phone',
      header: '연락처',
      cell: ({ row }) => {
        const phone = row.getValue('parent_phone') as string
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{phone}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'scheduled_date',
      header: '상담 일시',
      cell: ({ row }) => {
        const date = row.getValue('scheduled_date') as string
        return date ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{format(new Date(date), 'yyyy-MM-dd HH:mm')}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">미정</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('status') as Consultation['status']
        const statusInfo = statusMap[status]
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const consultation = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetail(consultation)}>
                <Eye className="mr-2 h-4 w-4" />
                상세 보기
              </DropdownMenuItem>
              {consultation.status === 'new' && (
                <DropdownMenuItem onClick={() => handleChangeStatus(consultation.id, 'scheduled')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  일정 예약
                </DropdownMenuItem>
              )}
              {consultation.status === 'scheduled' && (
                <DropdownMenuItem onClick={() => handleChangeStatus(consultation.id, 'completed')}>
                  완료 처리
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleViewDetail = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setIsDetailDialogOpen(true)
  }

  const handleChangeStatus = (id: string, newStatus: Consultation['status']) => {
    setConsultations(
      consultations.map((c) =>
        c.id === id ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c
      )
    )
    toast({
      title: '상태 변경 완료',
      description: `상담 상태가 ${statusMap[newStatus].label}(으)로 변경되었습니다.`,
    })
  }

  const handleSaveResult = () => {
    if (!selectedConsultation) return

    setConsultations(
      consultations.map((c) =>
        c.id === selectedConsultation.id ? selectedConsultation : c
      )
    )
    toast({
      title: '저장 완료',
      description: '상담 내용이 저장되었습니다.',
    })
    setIsDetailDialogOpen(false)
  }

  const filteredConsultations =
    activeTab === 'all'
      ? consultations
      : consultations.filter((c) => c.status === activeTab)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PagePermissions pageId="consultations" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">상담 관리</h1>
        <p className="text-sm md:text-base text-muted-foreground">상담 요청을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            전체 ({consultations.length})
          </TabsTrigger>
          <TabsTrigger value="new">
            신규 ({consultations.filter((c) => c.status === 'new').length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            예정 ({consultations.filter((c) => c.status === 'scheduled').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            완료 ({consultations.filter((c) => c.status === 'completed').length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={filteredConsultations}
                searchKey="student_name"
                searchPlaceholder="학생 이름으로 검색..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>상담 상세</DialogTitle>
            <DialogDescription>상담 정보를 확인하고 관리하세요</DialogDescription>
          </DialogHeader>

          {selectedConsultation && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>학생 이름</Label>
                  <Input value={selectedConsultation.student_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>학년</Label>
                  <Input
                    value={selectedConsultation.student_grade ? `${selectedConsultation.student_grade}학년` : '미입력'}
                    disabled
                  />
                </div>
              </div>

              {/* Parent Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>학부모 이름</Label>
                  <Input value={selectedConsultation.parent_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>연락처</Label>
                  <div className="flex items-center gap-2">
                    <Input value={selectedConsultation.parent_phone} disabled />
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {selectedConsultation.parent_email && (
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <div className="flex items-center gap-2">
                    <Input value={selectedConsultation.parent_email} disabled />
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Goals */}
              {selectedConsultation.goals && (
                <div className="space-y-2">
                  <Label>학습 목표</Label>
                  <Textarea value={selectedConsultation.goals} disabled rows={2} />
                </div>
              )}

              {/* Preferred Times */}
              {selectedConsultation.preferred_times && (
                <div className="space-y-2">
                  <Label>희망 상담 시간</Label>
                  <Input value={selectedConsultation.preferred_times} disabled />
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label>상담 상태</Label>
                <Select
                  value={selectedConsultation.status}
                  onValueChange={(value) =>
                    setSelectedConsultation({
                      ...selectedConsultation,
                      status: value as Consultation['status'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">신규</SelectItem>
                    <SelectItem value="scheduled">예정</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Date */}
              {selectedConsultation.status !== 'new' && (
                <div className="space-y-2">
                  <Label>상담 일시</Label>
                  <Input
                    type="datetime-local"
                    value={
                      selectedConsultation.scheduled_date
                        ? format(new Date(selectedConsultation.scheduled_date), "yyyy-MM-dd'T'HH:mm")
                        : ''
                    }
                    onChange={(e) =>
                      setSelectedConsultation({
                        ...selectedConsultation,
                        scheduled_date: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>메모</Label>
                <Textarea
                  value={selectedConsultation.notes || ''}
                  onChange={(e) =>
                    setSelectedConsultation({
                      ...selectedConsultation,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="상담 관련 메모를 입력하세요"
                />
              </div>

              {/* Result (for completed) */}
              {selectedConsultation.status === 'completed' && (
                <div className="space-y-2">
                  <Label>상담 결과</Label>
                  <Textarea
                    value={selectedConsultation.result || ''}
                    onChange={(e) =>
                      setSelectedConsultation({
                        ...selectedConsultation,
                        result: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="상담 결과를 입력하세요"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              닫기
            </Button>
            <Button onClick={handleSaveResult}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
