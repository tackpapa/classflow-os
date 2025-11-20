// 기존 overview 페이지의 Mock 데이터 통합

// 월별 매출 데이터
export const revenueData = [
  { month: '1월', revenue: 18500000 },
  { month: '2월', revenue: 20300000 },
  { month: '3월', revenue: 22100000 },
  { month: '4월', revenue: 21800000 },
  { month: '5월', revenue: 23500000 },
  { month: '6월', revenue: 24500000 },
]

// 학생 증감 데이터
export const studentTrendData = [
  { month: '1월', students: 98 },
  { month: '2월', students: 105 },
  { month: '3월', students: 112 },
  { month: '4월', students: 108 },
  { month: '5월', students: 118 },
  { month: '6월', students: 124 },
]

// 주간 출결 데이터
export const attendanceData = [
  { date: '월', rate: 92 },
  { date: '화', rate: 95 },
  { date: '수', rate: 94 },
  { date: '목', rate: 96 },
  { date: '금', rate: 93 },
]

// 오늘 수업 데이터
export const todayClasses = [
  // 오전 수업
  { id: 1, name: '고3 수학 모의고사반', teacher: '김선생', room: 'A301', startTime: '09:00', endTime: '12:00', students: 20 },
  { id: 2, name: '중등 영어 기초반', teacher: '박선생', room: 'B201', startTime: '10:00', endTime: '12:00', students: 15 },
  { id: 3, name: '초등 수학 사고력반', teacher: '이선생', room: 'A201', startTime: '11:00', endTime: '13:00', students: 12 },

  // 오후 수업
  { id: 4, name: '고1 수학 특강반', teacher: '김선생', room: 'A301', startTime: '14:00', endTime: '16:00', students: 18 },
  { id: 5, name: '중2 과학 실험반', teacher: '최선생', room: 'C101', startTime: '14:30', endTime: '16:30', students: 14 },
  { id: 6, name: '고2 영어 회화반', teacher: '박선생', room: 'B201', startTime: '15:00', endTime: '17:00', students: 16 },
  { id: 7, name: '중3 국어 독해반', teacher: '이선생', room: 'A201', startTime: '16:00', endTime: '18:00', students: 20 },
  { id: 8, name: '고3 영어 심화반', teacher: '박선생', room: 'B202', startTime: '17:00', endTime: '19:00', students: 22 },
  { id: 9, name: '중1 수학 기초반', teacher: '김선생', room: 'A302', startTime: '17:30', endTime: '19:30', students: 13 },

  // 저녁 수업
  { id: 10, name: '고2 물리 심화반', teacher: '정선생', room: 'C202', startTime: '18:00', endTime: '20:00', students: 10 },
  { id: 11, name: '중3 화학 실험반', teacher: '최선생', room: 'C101', startTime: '18:30', endTime: '20:30', students: 11 },
  { id: 12, name: '고1 국어 문법반', teacher: '이선생', room: 'A201', startTime: '19:00', endTime: '21:00', students: 17 },
  { id: 13, name: '고3 수학 심화반', teacher: '김선생', room: 'A301', startTime: '19:30', endTime: '21:30', students: 19 },
  { id: 14, name: '중2 영어 문법반', teacher: '박선생', room: 'B201', startTime: '20:00', endTime: '22:00', students: 15 },

  // 야간 수업
  { id: 15, name: '고3 야간 자율학습', teacher: '김선생', room: 'A301', startTime: '21:00', endTime: '23:00', students: 25 },
  { id: 16, name: '재수생 특강반', teacher: '정선생', room: 'C202', startTime: '21:30', endTime: '23:30', students: 8 },
]

// 통계 카드 데이터
export const stats = {
  totalStudents: 124,
  activeStudents: 118,
  inactiveStudents: 6,
  todayConsultations: 8,
  scheduledConsultations: 5,
  completedConsultations: 3,
  attendanceRate: 94,
  monthlyRevenue: 24500000,
  revenueChange: '+8%',
}

// 최근 활동 데이터
export const recentActivities = [
  { time: '2시간 전', action: '김민준 학생이 수학 특강반에 등록했습니다' },
  { time: '5시간 전', action: '영어 회화반 수업이 완료되었습니다' },
  { time: '어제', action: '이서연 학생의 상담이 완료되었습니다' },
  { time: '2일 전', action: '새로운 국어 독해반이 개설되었습니다' },
]

// 공지사항 데이터
export const announcements = [
  { title: '여름 특강 안내', date: '2025-06-15' },
  { title: '학부모 상담 주간 운영', date: '2025-06-10' },
  { title: '시험 일정 안내', date: '2025-06-05' },
  { title: '신규 강좌 개설', date: '2025-06-01' },
]

// 현재 진행 중인 수업 필터링 함수
export function getCurrentClasses(currentTime: Date) {
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

  return todayClasses.filter((cls) => {
    return cls.startTime <= currentTimeStr && currentTimeStr < cls.endTime
  })
}

// 학년별 학생 분포 데이터
export const gradeDistribution = [
  { grade: '초등', students: 18 },
  { grade: '중1', students: 22 },
  { grade: '중2', students: 25 },
  { grade: '중3', students: 20 },
  { grade: '고1', students: 15 },
  { grade: '고2', students: 12 },
  { grade: '고3', students: 12 },
]

// 예정된 상담 데이터
export const upcomingConsultations = [
  { time: '14:00', student: '김민준', parent: '김OO', type: '입교 상담' },
  { time: '15:30', student: '이서연', parent: '이OO', type: '성적 상담' },
  { time: '16:00', student: '박지우', parent: '박OO', type: '진로 상담' },
]

// 입교 전환율 데이터
export const conversionData = [
  { month: '1월', consultations: 12, enrollments: 9 },
  { month: '2월', consultations: 15, enrollments: 11 },
  { month: '3월', consultations: 18, enrollments: 14 },
  { month: '4월', consultations: 14, enrollments: 10 },
  { month: '5월', consultations: 20, enrollments: 16 },
  { month: '6월', consultations: 16, enrollments: 13 },
]

// 반별 충원율 데이터
export const classCapacity = [
  { class: '고3 수학', current: 20, max: 25 },
  { class: '고2 영어', current: 16, max: 20 },
  { class: '중3 국어', current: 20, max: 20 },
  { class: '중2 과학', current: 14, max: 20 },
]

// 시험 데이터
export const examData = {
  pending: 5,
  completed: 12,
  avgScore: 78.5,
}

export const recentExams = [
  { subject: '수학', date: '2025-06-10', avgScore: 82, students: 45 },
  { subject: '영어', date: '2025-06-08', avgScore: 76, students: 38 },
  { subject: '과학', date: '2025-06-05', avgScore: 80, students: 32 },
]

// 과제 데이터
export const homeworkData = {
  active: 8,
  completed: 15,
  submissionRate: 87,
}

export const homeworkSubmission = [
  { class: '고3 수학', submitted: 18, total: 20 },
  { class: '중3 국어', submitted: 19, total: 20 },
  { class: '고2 영어', submitted: 14, total: 16 },
  { class: '중2 과학', submitted: 11, total: 14 },
]

// 지출 카테고리 데이터
export const expenseCategory = [
  { category: '인건비', amount: 8500000 },
  { category: '임대료', amount: 3000000 },
  { category: '교재비', amount: 1500000 },
  { category: '관리비', amount: 800000 },
  { category: '기타', amount: 500000 },
]

// 월별 지출 데이터
export const expenseTrend = [
  { month: '1월', expense: 12000000 },
  { month: '2월', expense: 13500000 },
  { month: '3월', expense: 14200000 },
  { month: '4월', expense: 13800000 },
  { month: '5월', expense: 14500000 },
  { month: '6월', expense: 14300000 },
]

// 오늘 출결 데이터
export const todayAttendance = {
  present: 110,
  late: 8,
  absent: 6,
  total: 124,
}

// 출결 경고 학생
export const attendanceAlerts = [
  { student: '김철수', status: '3일 연속 결석', class: '고3 수학' },
  { student: '이영희', status: '출결률 70%', class: '중2 영어' },
  { student: '박민수', status: '5회 지각', class: '고1 국어' },
]

// 수업일지 데이터
export const lessonLogs = {
  thisMonth: 45,
  pending: 3,
  avgRating: 4.5,
}

export const recentLessons = [
  { class: '고3 수학', date: '2025-06-15', teacher: '김선생', topic: '미적분 응용' },
  { class: '중3 영어', date: '2025-06-15', teacher: '박선생', topic: '관계대명사' },
  { class: '고2 과학', date: '2025-06-14', teacher: '최선생', topic: '화학 반응식' },
]

// 강사 데이터
export const teacherStats = {
  total: 8,
  active: 7,
  avgStudents: 18,
}

// 강의실 사용률
export const roomUsage = [
  { room: 'A301', usage: 85, classes: 6 },
  { room: 'B201', usage: 75, classes: 5 },
  { room: 'C101', usage: 60, classes: 4 },
  { room: 'A201', usage: 70, classes: 5 },
]

// 독서실 좌석 현황
export const seatStatus = {
  total: 50,
  occupied: 38,
  available: 12,
}
