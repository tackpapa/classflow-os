'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { usePageAccess } from '@/hooks/use-page-access'
import { PagePermissions } from '@/components/page-permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClassSchema, type ClassInput } from '@/lib/validations/class'
import type { Class } from '@/lib/types/database'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data for development
const mockClasses: Class[] = [
  {
    id: '1',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    org_id: 'org-1',
    name: '수학 특강반',
    subject: '수학',
    teacher_id: 'teacher-1',
    teacher_name: '김강사',
    capacity: 20,
    current_students: 15,
    schedule: [
      { day: '월', start_time: '14:00', end_time: '16:00' },
      { day: '수', start_time: '14:00', end_time: '16:00' },
    ],
    room: 'A301',
    status: 'active',
    notes: '고급 수학 과정',
  },
  {
    id: '2',
    created_at: '2025-01-02',
    updated_at: '2025-01-02',
    org_id: 'org-1',
    name: '영어 회화반',
    subject: '영어',
    teacher_id: 'teacher-2',
    teacher_name: '이강사',
    capacity: 15,
    current_students: 12,
    schedule: [
      { day: '화', start_time: '16:00', end_time: '18:00' },
      { day: '목', start_time: '16:00', end_time: '18:00' },
    ],
    room: 'B201',
    status: 'active',
  },
]

export default function ClassesPage() {
  usePageAccess('classes')

  const { toast } = useToast()
  const [classes, setClasses] = useState<Class[]>(mockClasses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ClassInput>({
    resolver: zodResolver(ClassSchema),
    defaultValues: {
      status: 'active',
    },
  })

  const columns: ColumnDef<Class>[] = [
    {
      accessorKey: 'name',
      header: '반 이름',
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
      accessorKey: 'teacher_name',
      header: '강사',
    },
    {
      accessorKey: 'current_students',
      header: '학생 수',
      cell: ({ row }) => {
        const current = row.original.current_students
        const capacity = row.original.capacity
        const percentage = (current / capacity) * 100
        return (
          <div className="flex items-center gap-2">
            <span>
              {current}/{capacity}
            </span>
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'schedule',
      header: '수업 시간',
      cell: ({ row }) => {
        const schedule = row.getValue('schedule') as Class['schedule']
        return (
          <div className="text-sm">
            {schedule.map((s, i) => (
              <div key={i}>
                {s.day} {s.start_time}-{s.end_time}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'room',
      header: '강의실',
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusMap = {
          active: { label: '운영중', variant: 'default' as const },
          inactive: { label: '운영 중단', variant: 'secondary' as const },
        }
        const statusInfo = statusMap[status as keyof typeof statusMap]
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const classData = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => alert('학생 배정 기능 (구현 예정)')}>
                <Users className="mr-2 h-4 w-4" />
                학생 배정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(classData)}>
                <Pencil className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(classData.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleOpenDialog = () => {
    setEditingClass(null)
    reset({
      status: 'active',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (classData: Class) => {
    setEditingClass(classData)
    reset({
      name: classData.name,
      subject: classData.subject,
      teacher_name: classData.teacher_name,
      capacity: classData.capacity,
      room: classData.room || '',
      status: classData.status,
      notes: classData.notes || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      setClasses(classes.filter((c) => c.id !== id))
      toast({
        title: '삭제 완료',
        description: '반 정보가 삭제되었습니다.',
      })
    }
  }

  const onSubmit = async (data: ClassInput) => {
    setIsLoading(true)
    try {
      // TODO: Supabase integration
      if (editingClass) {
        // Update existing class
        setClasses(
          classes.map((c) =>
            c.id === editingClass.id
              ? { ...c, ...data, updated_at: new Date().toISOString() }
              : c
          )
        )
        toast({
          title: '수정 완료',
          description: '반 정보가 수정되었습니다.',
        })
      } else {
        // Create new class
        const newClass: Class = {
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          org_id: 'org-1',
          teacher_id: 'teacher-new',
          current_students: 0,
          schedule: [],
          ...data,
        } as Class
        setClasses([...classes, newClass])
        toast({
          title: '생성 완료',
          description: '반이 생성되었습니다.',
        })
      }
      setIsDialogOpen(false)
      reset()
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PagePermissions pageId="classes" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">반 관리</h1>
          <p className="text-sm md:text-base text-muted-foreground">반 정보를 관리하세요</p>
        </div>
        <Button onClick={handleOpenDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          반 생성
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <DataTable
            columns={columns}
            data={classes}
            searchKey="name"
            searchPlaceholder="반 이름으로 검색..."
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? '반 정보 수정' : '반 생성'}
            </DialogTitle>
            <DialogDescription>
              반의 기본 정보를 입력해주세요
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">반 이름 *</Label>
                <Input id="name" {...register('name')} disabled={isLoading} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">과목 *</Label>
                <Input
                  id="subject"
                  {...register('subject')}
                  placeholder="예: 수학, 영어, 국어"
                  disabled={isLoading}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher_name">강사 이름 *</Label>
                <Input
                  id="teacher_name"
                  {...register('teacher_name')}
                  disabled={isLoading}
                />
                {errors.teacher_name && (
                  <p className="text-sm text-destructive">
                    {errors.teacher_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">정원 *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  {...register('capacity', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {errors.capacity && (
                  <p className="text-sm text-destructive">{errors.capacity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">강의실</Label>
                <Input
                  id="room"
                  {...register('room')}
                  placeholder="예: A301"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select
                  defaultValue="active"
                  onValueChange={(value) =>
                    setValue('status', value as 'active' | 'inactive')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">운영중</SelectItem>
                    <SelectItem value="inactive">운영 중단</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                rows={3}
                {...register('notes')}
                disabled={isLoading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? '처리중...'
                  : editingClass
                  ? '수정'
                  : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
