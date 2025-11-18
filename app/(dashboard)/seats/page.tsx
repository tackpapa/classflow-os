'use client'

import { useState } from 'react'
import { usePageAccess } from '@/hooks/use-page-access'
import { PagePermissions } from '@/components/page-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserCheck, UserX, Settings2, Armchair } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Types
interface Seat {
  id: string
  number: number
  student_id: string | null
  student_name: string | null
  status: 'checked_in' | 'checked_out' | 'vacant'
}

// Grade options
const gradeOptions = [
  { value: '중1', label: '중1' },
  { value: '중2', label: '중2' },
  { value: '중3', label: '중3' },
  { value: '고1', label: '고1' },
  { value: '고2', label: '고2' },
  { value: '고3', label: '고3' },
  { value: '재수', label: '재수' },
]

// Mock data - Students
const mockStudents = [
  { id: 'student-1', name: '김민준', grade: '중3', school: '서울중학교' },
  { id: 'student-2', name: '이서연', grade: '고1', school: '강남고등학교' },
  { id: 'student-3', name: '박준호', grade: '중2', school: '서울중학교' },
  { id: 'student-4', name: '최지우', grade: '고2', school: '강남고등학교' },
  { id: 'student-5', name: '정하은', grade: '중3', school: '목동중학교' },
  { id: 'student-6', name: '강도윤', grade: '고3', school: '대치고등학교' },
  { id: 'student-7', name: '조시우', grade: '중1', school: '서울중학교' },
  { id: 'student-8', name: '윤서준', grade: '고1', school: '강남고등학교' },
  { id: 'student-9', name: '장서아', grade: '중2', school: '목동중학교' },
  { id: 'student-10', name: '임지호', grade: '재수', school: '강남종합학원' },
]

// Initialize seats with some mock data
const initializeSeats = (totalSeats: number): Seat[] => {
  const seats: Seat[] = []
  for (let i = 1; i <= totalSeats; i++) {
    // Assign some students to first few seats for demo
    const mockAssignments: Record<number, { student_id: string; student_name: string; status: 'checked_in' | 'checked_out' }> = {
      1: { student_id: 'student-1', student_name: '김민준', status: 'checked_in' },
      2: { student_id: 'student-2', student_name: '이서연', status: 'checked_in' },
      3: { student_id: 'student-3', student_name: '박준호', status: 'checked_out' },
      5: { student_id: 'student-5', student_name: '정하은', status: 'checked_in' },
      7: { student_id: 'student-7', student_name: '조시우', status: 'checked_out' },
    }

    const assignment = mockAssignments[i]
    seats.push({
      id: `seat-${i}`,
      number: i,
      student_id: assignment?.student_id || null,
      student_name: assignment?.student_name || null,
      status: assignment?.status || 'vacant',
    })
  }
  return seats
}

export default function SeatsPage() {
  usePageAccess('seats')

  const { toast } = useToast()
  const [totalSeats, setTotalSeats] = useState(20)
  const [seats, setSeats] = useState<Seat[]>(initializeSeats(20))
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [tempTotalSeats, setTempTotalSeats] = useState(20)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')

  // New student registration state
  const [assignmentTab, setAssignmentTab] = useState<'existing' | 'new'>('existing')
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentGrade, setNewStudentGrade] = useState('')
  const [newStudentSchool, setNewStudentSchool] = useState('')

  // Filter students by search query
  const filteredStudents = mockStudents.filter(student =>
    studentSearchQuery === '' ||
    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    `${student.grade}학년`.includes(studentSearchQuery)
  )

  // Get assigned student IDs
  const assignedStudentIds = new Set(
    seats.filter(s => s.student_id).map(s => s.student_id)
  )

  // Filter available students (not already assigned)
  const availableStudents = filteredStudents.filter(
    student => !assignedStudentIds.has(student.id) || student.id === selectedSeat?.student_id
  )

  // Statistics
  const vacantSeats = seats.filter(s => s.status === 'vacant').length
  const checkedInSeats = seats.filter(s => s.status === 'checked_in').length
  const checkedOutSeats = seats.filter(s => s.status === 'checked_out').length

  const handleConfigureTotalSeats = () => {
    if (tempTotalSeats < 1 || tempTotalSeats > 100) {
      toast({
        title: '잘못된 좌석 수',
        description: '좌석 수는 1~100개 사이여야 합니다.',
        variant: 'destructive',
      })
      return
    }

    setTotalSeats(tempTotalSeats)
    setSeats(initializeSeats(tempTotalSeats))
    setIsConfigDialogOpen(false)

    toast({
      title: '좌석 설정 완료',
      description: `총 ${tempTotalSeats}개의 좌석이 설정되었습니다.`,
    })
  }

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat)
    setSelectedStudentId(seat.student_id || '')
    setStudentSearchQuery(seat.student_name || '')
    setAssignmentTab('existing')
    setNewStudentName('')
    setNewStudentGrade('')
    setNewStudentSchool('')
    setIsAssignDialogOpen(true)
  }

  const handleAssignStudent = () => {
    if (!selectedSeat) return

    if (assignmentTab === 'existing') {
      // Existing student assignment
      const student = mockStudents.find(s => s.id === selectedStudentId)

      if (!selectedStudentId || !student) {
        toast({
          title: '학생 미선택',
          description: '배정할 학생을 선택해주세요.',
          variant: 'destructive',
        })
        return
      }

      const updatedSeats = seats.map(seat =>
        seat.id === selectedSeat.id
          ? {
              ...seat,
              student_id: selectedStudentId,
              student_name: student.name,
              status: 'checked_out' as const, // Default to checked_out when newly assigned
            }
          : seat
      )

      setSeats(updatedSeats)
      setIsAssignDialogOpen(false)

      toast({
        title: '좌석 배정 완료',
        description: `${selectedSeat.number}번 좌석에 ${student.name} 학생이 배정되었습니다.`,
      })
    } else {
      // New student registration and assignment
      if (!newStudentName.trim() || !newStudentGrade || !newStudentSchool.trim()) {
        toast({
          title: '정보 입력 필요',
          description: '학생 이름, 학년, 학교를 모두 입력해주세요.',
          variant: 'destructive',
        })
        return
      }

      // Create new student ID
      const newStudentId = `student-${Date.now()}`

      // Add to mockStudents (in real app, this would be API call)
      mockStudents.push({
        id: newStudentId,
        name: newStudentName.trim(),
        grade: newStudentGrade,
        school: newStudentSchool.trim(),
      })

      // Assign to seat
      const updatedSeats = seats.map(seat =>
        seat.id === selectedSeat.id
          ? {
              ...seat,
              student_id: newStudentId,
              student_name: newStudentName.trim(),
              status: 'checked_out' as const,
            }
          : seat
      )

      setSeats(updatedSeats)
      setIsAssignDialogOpen(false)

      toast({
        title: '학생 등록 및 배정 완료',
        description: `${newStudentName} 학생이 ${selectedSeat.number}번 좌석에 배정되었습니다.`,
      })

      // Reset form
      setNewStudentName('')
      setNewStudentGrade('')
      setNewStudentSchool('')
    }
  }

  const handleRemoveStudent = () => {
    if (!selectedSeat) return

    const updatedSeats = seats.map(seat =>
      seat.id === selectedSeat.id
        ? {
            ...seat,
            student_id: null,
            student_name: null,
            status: 'vacant' as const,
          }
        : seat
    )

    setSeats(updatedSeats)
    setIsAssignDialogOpen(false)

    toast({
      title: '좌석 배정 해제',
      description: `${selectedSeat.number}번 좌석 배정이 해제되었습니다.`,
    })
  }

  const handleToggleAttendance = (seatId: string) => {
    const updatedSeats = seats.map(seat => {
      if (seat.id === seatId && seat.student_id) {
        const newStatus: Seat['status'] = seat.status === 'checked_in' ? 'checked_out' : 'checked_in'
        return { ...seat, status: newStatus }
      }
      return seat
    })

    setSeats(updatedSeats)

    const seat = seats.find(s => s.id === seatId)
    const newStatus = seat?.status === 'checked_in' ? '퇴근' : '출근'

    toast({
      title: '출결 상태 변경',
      description: `${seat?.number}번 좌석 - ${seat?.student_name} (${newStatus})`,
    })
  }

  const getStatusBadge = (status: Seat['status']) => {
    switch (status) {
      case 'checked_in':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <UserCheck className="mr-1 h-3 w-3" />
            출근
          </Badge>
        )
      case 'checked_out':
        return (
          <Badge variant="secondary" className="bg-gray-200 hover:bg-gray-300">
            <UserX className="mr-1 h-3 w-3" />
            퇴근
          </Badge>
        )
      case 'vacant':
        return (
          <Badge variant="outline">
            미배정
          </Badge>
        )
    }
  }

  const getCardStyle = (status: Seat['status']) => {
    switch (status) {
      case 'checked_in':
        return 'border-green-300 bg-green-50/50'
      case 'checked_out':
        return 'border-gray-300 bg-gray-50/50'
      case 'vacant':
        return 'border-dashed border-gray-300 bg-muted/20'
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PagePermissions pageId="seats" />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">자리현황판</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            독서실 좌석 배정 및 출결 상태를 관리합니다
          </p>
        </div>
        <Button variant="outline" onClick={() => {
          setTempTotalSeats(totalSeats)
          setIsConfigDialogOpen(true)
        }} className="w-full sm:w-auto">
          <Settings2 className="mr-2 h-4 w-4" />
          좌석 설정
        </Button>
      </div>

      {/* Checked In Students List */}
      <Card className="border-2 border-green-200 bg-green-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">현재 출근한 학생 ({checkedInSeats}명)</CardTitle>
          </div>
          <CardDescription>
            현재 독서실에서 공부 중인 학생들입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {seats
              .filter(seat => seat.status === 'checked_in')
              .map(seat => {
                const student = mockStudents.find(s => s.id === seat.student_id)
                return (
                  <div
                    key={seat.id}
                    className="flex flex-col gap-1 p-3 bg-white border border-green-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSeatClick(seat)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-green-600">{seat.number}번</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="text-sm font-medium truncate">{seat.student_name}</div>
                    <div className="text-xs text-muted-foreground">{student?.grade}</div>
                  </div>
                )
              })}
            {checkedInSeats === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                현재 출근한 학생이 없습니다
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 좌석</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeats}개</div>
            <p className="text-xs text-muted-foreground">독서실 전체</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">출근 (공부 중)</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{checkedInSeats}명</div>
            <p className="text-xs text-muted-foreground">현재 자리에 있음</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">퇴근 (자리 비움)</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{checkedOutSeats}명</div>
            <p className="text-xs text-muted-foreground">자리 비어있음</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">미배정</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vacantSeats}개</div>
            <p className="text-xs text-muted-foreground">배정 가능 좌석</p>
          </CardContent>
        </Card>
      </div>

      {/* Seats Grid */}
      <Card>
        <CardHeader>
          <CardTitle>좌석 배치도</CardTitle>
          <CardDescription>
            좌석을 클릭하여 학생을 배정하거나 출결 상태를 변경하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {seats.map((seat) => (
              <Card
                key={seat.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  getCardStyle(seat.status)
                )}
                onClick={() => handleSeatClick(seat)}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Seat Number */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">
                      {seat.number}번
                    </div>
                    {getStatusBadge(seat.status)}
                  </div>

                  {/* Student Info */}
                  {seat.student_name ? (
                    <>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{seat.student_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {mockStudents.find(s => s.id === seat.student_id)?.grade}학년
                        </div>
                      </div>

                      {/* Toggle Button */}
                      {seat.status !== 'vacant' && (
                        <Button
                          size="sm"
                          variant={seat.status === 'checked_in' ? 'outline' : 'default'}
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleAttendance(seat.id)
                          }}
                        >
                          {seat.status === 'checked_in' ? '퇴근 처리' : '출근 처리'}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      클릭하여 배정
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configure Total Seats Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>좌석 수 설정</DialogTitle>
            <DialogDescription>
              독서실 전체 좌석 개수를 설정합니다 (1~100개)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="total-seats">좌석 개수</Label>
              <Input
                id="total-seats"
                type="number"
                min={1}
                max={100}
                value={tempTotalSeats}
                onChange={(e) => setTempTotalSeats(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ 좌석 수를 변경하면 기존 배정 정보가 초기화됩니다
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfigureTotalSeats}>
              설정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Student Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSeat?.number}번 좌석 관리</DialogTitle>
            <DialogDescription>
              {selectedSeat?.student_name
                ? `현재 배정: ${selectedSeat.student_name}`
                : '학생을 선택하거나 새로 등록하여 좌석을 배정하세요'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={assignmentTab} onValueChange={(v) => setAssignmentTab(v as 'existing' | 'new')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">기존 학생 선택</TabsTrigger>
              <TabsTrigger value="new">신규 학생 등록</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-search">학생 검색</Label>
                <Input
                  id="student-search"
                  placeholder="이름 또는 학년으로 검색..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>학생 선택</Label>
                <div className="border rounded-lg p-2 max-h-60 overflow-y-auto space-y-1">
                  {availableStudents.length > 0 ? (
                    availableStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => {
                          setSelectedStudentId(student.id)
                          setStudentSearchQuery(`${student.grade}학년 ${student.name}`)
                        }}
                        className={cn(
                          "p-2 rounded cursor-pointer hover:bg-muted transition-colors text-sm",
                          selectedStudentId === student.id && "bg-primary text-primary-foreground"
                        )}
                      >
                        {student.grade}학년 {student.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      {filteredStudents.length === 0
                        ? '검색 결과가 없습니다'
                        : '배정 가능한 학생이 없습니다 (모두 배정됨)'}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-student-name">학생 이름 *</Label>
                <Input
                  id="new-student-name"
                  placeholder="예: 홍길동"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-student-grade">학년 *</Label>
                <Select value={newStudentGrade} onValueChange={setNewStudentGrade}>
                  <SelectTrigger id="new-student-grade">
                    <SelectValue placeholder="학년을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-student-school">학교 *</Label>
                <Input
                  id="new-student-school"
                  placeholder="예: 서울중학교"
                  value={newStudentSchool}
                  onChange={(e) => setNewStudentSchool(e.target.value)}
                />
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                💡 신규 학생을 등록하고 바로 좌석에 배정합니다
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedSeat?.student_id && assignmentTab === 'existing' && (
              <Button variant="destructive" onClick={handleRemoveStudent} className="sm:mr-auto">
                배정 해제
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAssignStudent}>
              {assignmentTab === 'new'
                ? '등록 및 배정'
                : selectedSeat?.student_id ? '변경' : '배정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
