# ARCHITECTURE.md - ClassFlow OS 시스템 아키텍처

> **학원/러닝센터/스터디카페 통합 운영 시스템**
> 멀티테넌트 SaaS 아키텍처

---

## 📐 시스템 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 층                              │
│  원장/운영자  │  강사/스태프  │  학부모  │  학생              │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│               프론트엔드 (Next.js 15)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Portal      │  │  Public      │      │
│  │  (운영/강사)  │  │  (학부모/학생)│  │  (상담폼)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  Deployed on: Cloudflare Pages                             │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│            BFF/API Layer (Cloudflare Workers)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Routes  │  │  Cron Jobs   │  │  Queue Jobs  │      │
│  │  (REST/tRPC) │  │  (Scheduled) │  │  (Async)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│              데이터 레이어 (Supabase)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Auth        │  │  Storage     │      │
│  │  (RLS)       │  │  (RBAC)      │  │  (Files)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐                                           │
│  │  Realtime    │  (대시보드 실시간 업데이트)                │
│  └──────────────┘                                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                외부 서비스 연동                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ OpenAI   │ │ Kakao    │ │ Google   │ │ SendGrid │       │
│  │ (GPT)    │ │ (알림톡)  │ │ Calendar │ │ (Email)  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 프론트엔드 아키텍처

### 라우트 구조 (App Router)

```
app/
├── (auth)/                          # 인증 라우트 그룹
│   ├── login/
│   │   └── page.tsx                # 로그인
│   ├── signup/
│   │   └── page.tsx                # 회원가입
│   └── layout.tsx                   # Auth 레이아웃
│
├── (dashboard)/                     # 대시보드 (운영자/강사)
│   ├── overview/
│   │   └── page.tsx                # 메인 대시보드
│   ├── students/
│   │   ├── page.tsx                # 학생 목록
│   │   ├── [id]/
│   │   │   └── page.tsx            # 학생 상세
│   │   └── new/
│   │       └── page.tsx            # 학생 등록
│   ├── classes/
│   │   ├── page.tsx                # 반 관리
│   │   └── [id]/
│   │       ├── page.tsx            # 반 상세
│   │       ├── attendance/
│   │       │   └── page.tsx        # 출결 관리
│   │       └── lessons/
│   │           └── page.tsx        # 수업일지
│   ├── consultations/
│   │   ├── page.tsx                # 상담 관리
│   │   └── [id]/
│   │       └── page.tsx            # 상담 상세
│   ├── exams/
│   │   ├── page.tsx                # 시험 관리
│   │   └── [id]/
│   │       └── page.tsx            # 시험 결과
│   ├── billing/
│   │   └── page.tsx                # 청구/정산
│   ├── settings/
│   │   ├── organization/
│   │   │   └── page.tsx            # 기관 설정
│   │   ├── branches/
│   │   │   └── page.tsx            # 지점 관리
│   │   └── automation/
│   │       └── page.tsx            # 자동화 규칙
│   └── layout.tsx                   # Dashboard 레이아웃
│
├── (portal)/                        # 포털 (학부모/학생)
│   ├── my/
│   │   ├── dashboard/
│   │   │   └── page.tsx            # 내 대시보드
│   │   ├── schedule/
│   │   │   └── page.tsx            # 내 시간표
│   │   ├── attendance/
│   │   │   └── page.tsx            # 내 출결
│   │   ├── reports/
│   │   │   └── page.tsx            # 학습 리포트
│   │   └── billing/
│   │       └── page.tsx            # 수강료 조회
│   └── layout.tsx                   # Portal 레이아웃
│
├── consultation/                    # 공개 상담 신청
│   └── new/
│       └── page.tsx                # 상담 신청 폼
│
├── api/                             # API 라우트
│   ├── students/
│   │   └── route.ts                # GET/POST /api/students
│   ├── classes/
│   │   └── route.ts
│   ├── webhooks/
│   │   ├── kakao/
│   │   │   └── route.ts            # Kakao webhook
│   │   └── stripe/
│   │       └── route.ts            # Stripe webhook (향후)
│   └── cron/
│       ├── daily-reminders/
│       │   └── route.ts            # 일일 리마인더
│       └── monthly-reports/
│           └── route.ts            # 월간 리포트
│
├── layout.tsx                       # Root 레이아웃
├── page.tsx                         # 랜딩 페이지
└── error.tsx                        # 전역 에러 핸들러
```

### 컴포넌트 구조

```
components/
├── ui/                              # shadcn/ui 기본 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   └── ...
│
├── forms/                           # 폼 컴포넌트
│   ├── ConsultationForm.tsx        # 상담 신청 폼
│   ├── StudentForm.tsx             # 학생 등록/수정 폼
│   ├── AttendanceForm.tsx          # 출결 체크 폼
│   └── LessonNoteForm.tsx          # 수업일지 폼
│
├── dashboard/                       # 대시보드 위젯
│   ├── StatsCard.tsx               # 통계 카드
│   ├── AttendanceChart.tsx         # 출결 차트
│   ├── RevenueChart.tsx            # 매출 차트
│   └── RecentActivities.tsx        # 최근 활동
│
├── tables/                          # 테이블 컴포넌트
│   ├── StudentsTable.tsx           # 학생 목록
│   ├── ClassesTable.tsx            # 반 목록
│   └── ConsultationsTable.tsx      # 상담 목록
│
├── shared/                          # 공통 컴포넌트
│   ├── Header.tsx                  # 헤더
│   ├── Sidebar.tsx                 # 사이드바
│   ├── Breadcrumb.tsx              # 브레드크럼
│   ├── LoadingSpinner.tsx          # 로딩 스피너
│   └── ErrorBoundary.tsx           # 에러 바운더리
│
└── providers/                       # Context Providers
    ├── AuthProvider.tsx            # 인증 컨텍스트
    ├── ThemeProvider.tsx           # 테마 컨텍스트
    └── ToastProvider.tsx           # 토스트 알림
```

### 상태 관리 전략

```typescript
// 1. Server State (Supabase Realtime + React Query)
import { useQuery, useMutation } from '@tanstack/react-query'

function useStudents(orgId: string) {
  return useQuery({
    queryKey: ['students', orgId],
    queryFn: () => fetchStudents(orgId),
    // Supabase Realtime으로 자동 업데이트
  })
}

// 2. Client State (Zustand - 필요시만)
import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}))

// 3. Form State (React Hook Form)
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(StudentSchema),
  defaultValues: { name: '', email: '' }
})
```

---

## ⚙️ 백엔드 아키텍처 (Cloudflare Workers)

### Workers 구조

```
workers/
├── api/                             # API Workers
│   ├── students.ts                 # Students CRUD
│   ├── classes.ts                  # Classes CRUD
│   ├── attendance.ts               # Attendance CRUD
│   └── index.ts                    # Main router
│
├── cron/                            # Scheduled Workers
│   ├── daily-reminders.ts          # 일일 리마인더 (09:00)
│   ├── attendance-list.ts          # 등원 예정 리스트 (07:00)
│   ├── monthly-reports.ts          # 월간 리포트 (매월 1일)
│   └── payroll-calculation.ts      # 급여 계산 (매월 말)
│
├── queue/                           # Queue Workers
│   ├── notification-sender.ts      # 알림 발송
│   ├── pdf-generator.ts            # PDF 생성 (리포트, 급여명세)
│   └── gpt-processor.ts            # GPT 호출 (피드백 생성)
│
└── shared/                          # 공통 유틸
    ├── supabase.ts                 # Supabase 클라이언트
    ├── auth.ts                     # 인증 미들웨어
    └── errors.ts                   # 에러 핸들링
```

### API Worker 예시 (Hono 프레임워크)

```typescript
// workers/api/students.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { createClient } from '../shared/supabase'
import { authMiddleware } from '../shared/auth'

const app = new Hono()

// 인증 미들웨어 적용
app.use('*', authMiddleware)

// GET /api/students
app.get('/', async (c) => {
  const supabase = createClient(c.env)
  const user = c.get('user')

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('org_id', user.org_id)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})

// POST /api/students
app.post('/', async (c) => {
  const supabase = createClient(c.env)
  const user = c.get('user')

  // Zod 검증
  const StudentSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    grade: z.number().int().min(1).max(12)
  })

  const body = await c.req.json()
  const validated = StudentSchema.parse(body)

  const { data, error } = await supabase
    .from('students')
    .insert({
      ...validated,
      org_id: user.org_id,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data }, 201)
})

export default app
```

### Scheduled Worker 예시

```typescript
// workers/cron/daily-reminders.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const supabase = createClient(env)

    // 1. 오늘 수업 예정인 학생 조회
    const { data: schedules } = await supabase
      .from('schedules')
      .select(`
        *,
        students (*),
        classes (*)
      `)
      .eq('date', new Date().toISOString().split('T')[0])

    // 2. 알림 발송 Queue에 추가
    for (const schedule of schedules) {
      await env.NOTIFICATION_QUEUE.send({
        type: 'class_reminder',
        recipient: schedule.students.email,
        data: {
          studentName: schedule.students.name,
          className: schedule.classes.name,
          time: schedule.start_time
        }
      })
    }

    console.log(`Sent ${schedules.length} reminders`)
  }
}
```

### Queue Worker 예시

```typescript
// workers/queue/notification-sender.ts
export default {
  async queue(batch: MessageBatch, env: Env, ctx: ExecutionContext) {
    for (const message of batch.messages) {
      const { type, recipient, data } = message.body

      switch (type) {
        case 'class_reminder':
          await sendKakaoMessage(env, {
            to: recipient,
            template: 'class_reminder',
            variables: data
          })
          break

        case 'monthly_report':
          await sendEmail(env, {
            to: recipient,
            subject: '월간 학습 리포트',
            html: renderReportEmail(data)
          })
          break
      }

      message.ack() // 처리 완료 확인
    }
  }
}
```

---

## 🗄️ 데이터베이스 스키마 (Supabase PostgreSQL)

### ERD 요약

```
organizations (기관)
  └── branches (지점)
       ├── users (사용자)
       ├── students (학생)
       ├── teachers (강사)
       ├── classes (반)
       ├── consultations (상담)
       └── automation_rules (자동화 규칙)

students
  ├── enrollments (수강)
  ├── attendance (출결)
  ├── exam_results (시험 결과)
  ├── homework_submissions (과제 제출)
  └── reports (리포트)

classes
  ├── enrollments (수강생)
  ├── schedules (시간표)
  └── lesson_notes (수업일지)
```

### 핵심 테이블 스키마

#### 1. organizations (기관)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('academy', 'learning_center', 'study_cafe', 'tutoring')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));
```

#### 2. branches (지점)

```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branches_org_id ON branches(org_id);

-- RLS 정책
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view branches of own organization"
  ON branches FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));
```

#### 3. users (사용자)

```sql
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'teacher', 'staff', 'student', 'parent');

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_role ON users(role);

-- RLS 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in own organization"
  ON users FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Owners/Managers can manage users"
  ON users FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE id = auth.uid()
        AND role IN ('owner', 'manager')
    )
  );
```

#### 4. students (학생)

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  school TEXT,
  grade INTEGER CHECK (grade >= 1 AND grade <= 12),
  phone TEXT,
  email TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_org_id ON students(org_id);
CREATE INDEX idx_students_branch_id ON students(branch_id);
CREATE INDEX idx_students_user_id ON students(user_id);

-- RLS 정책
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view assigned students"
  ON students FOR SELECT
  USING (
    -- 강사: 담당 반의 학생만
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      WHERE e.student_id = students.id
        AND c.teacher_id = auth.uid()
    )
    -- 또는 본인 자녀
    OR user_id = auth.uid()
    -- 또는 원장/매니저
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND org_id = students.org_id
        AND role IN ('owner', 'manager')
    )
  );
```

#### 5. classes (반)

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  level TEXT,
  room TEXT,
  capacity INTEGER CHECK (capacity > 0),
  price_per_month INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_org_id ON classes(org_id);
CREATE INDEX idx_classes_branch_id ON classes(branch_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);

-- RLS 정책
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view classes in own organization"
  ON classes FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM users WHERE id = auth.uid()
  ));
```

#### 6. enrollments (수강)

```sql
CREATE TYPE enrollment_status AS ENUM ('active', 'paused', 'completed', 'cancelled');

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, class_id)
);

CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
```

#### 7. schedules (시간표)

```sql
CREATE TYPE day_of_week AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(class_id, day, start_time)
);

CREATE INDEX idx_schedules_class_id ON schedules(class_id);
```

#### 8. attendance (출결)

```sql
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'excused');

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, class_id, date)
);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
```

#### 9. lesson_notes (수업일지)

```sql
CREATE TABLE lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  homework TEXT,
  student_feedback JSONB DEFAULT '[]', -- [{ student_id, feedback }]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(class_id, date)
);

CREATE INDEX idx_lesson_notes_class_id ON lesson_notes(class_id);
CREATE INDEX idx_lesson_notes_date ON lesson_notes(date);
```

#### 10. consultations (상담)

```sql
CREATE TYPE consultation_status AS ENUM ('requested', 'scheduled', 'completed', 'enrolled', 'declined');

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_grade INTEGER,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  interests TEXT[], -- 관심 과목
  goals TEXT,
  preferred_times TEXT,
  status consultation_status NOT NULL DEFAULT 'requested',
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_org_id ON consultations(org_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);
```

#### 11. exams (시험)

```sql
CREATE TYPE exam_type AS ENUM ('midterm', 'final', 'mock', 'quiz', 'other');

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type exam_type NOT NULL,
  date DATE NOT NULL,
  school TEXT,
  grade INTEGER,
  subjects JSONB NOT NULL DEFAULT '[]', -- [{ name, total_score }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exams_org_id ON exams(org_id);
CREATE INDEX idx_exams_date ON exams(date);
```

#### 12. exam_results (시험 결과)

```sql
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scores JSONB NOT NULL, -- { subject: score }
  rank INTEGER,
  percentile DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(exam_id, student_id)
);

CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);
```

#### 13. homework (과제)

```sql
CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_homework_class_id ON homework(class_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
```

#### 14. homework_submissions (과제 제출)

```sql
CREATE TYPE submission_status AS ENUM ('not_submitted', 'submitted', 'late', 'graded');

CREATE TABLE homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status submission_status NOT NULL DEFAULT 'not_submitted',
  submitted_at TIMESTAMPTZ,
  file_url TEXT,
  notes TEXT,
  grade TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(homework_id, student_id)
);

CREATE INDEX idx_homework_submissions_homework_id ON homework_submissions(homework_id);
CREATE INDEX idx_homework_submissions_student_id ON homework_submissions(student_id);
```

#### 15. reports (리포트)

```sql
CREATE TYPE report_type AS ENUM ('weekly', 'monthly', 'semester');

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type report_type NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content TEXT NOT NULL, -- GPT 생성 피드백
  generated_by TEXT DEFAULT 'gpt-4o',
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_student_id ON reports(student_id);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
```

#### 16. automation_rules (자동화 규칙)

```sql
CREATE TYPE trigger_type AS ENUM (
  'consultation_created',
  'enrollment_confirmed',
  'class_started',
  'attendance_marked',
  'exam_recorded',
  'homework_overdue',
  'invoice_created',
  'payroll_confirmed'
);

CREATE TYPE action_type AS ENUM (
  'send_notification',
  'create_calendar_event',
  'generate_report',
  'update_status'
);

CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger trigger_type NOT NULL,
  conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL, -- [{ type, config }]
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_org_id ON automation_rules(org_id);
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger);
CREATE INDEX idx_automation_rules_enabled ON automation_rules(enabled);
```

#### 17. notification_templates (알림 템플릿)

```sql
CREATE TYPE notification_channel AS ENUM ('kakao', 'sms', 'email', 'push');

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel notification_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL, -- 변수: {{student_name}}, {{class_name}} 등
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_org_id ON notification_templates(org_id);
```

#### 18. notification_logs (알림 로그)

```sql
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'retrying');

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id),
  recipient TEXT NOT NULL,
  channel notification_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_org_id ON notification_logs(org_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at);
```

---

## 🔐 인증 & 권한 체계

### Supabase Auth 통합

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts (App Router용)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### 역할 기반 권한 (RBAC)

```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  // 학생 관리
  'students:read': ['owner', 'manager', 'teacher', 'parent', 'student'],
  'students:create': ['owner', 'manager'],
  'students:update': ['owner', 'manager'],
  'students:delete': ['owner'],

  // 반 관리
  'classes:read': ['owner', 'manager', 'teacher'],
  'classes:create': ['owner', 'manager'],
  'classes:update': ['owner', 'manager', 'teacher'],
  'classes:delete': ['owner', 'manager'],

  // 출결 관리
  'attendance:read': ['owner', 'manager', 'teacher', 'parent', 'student'],
  'attendance:create': ['owner', 'manager', 'teacher'],
  'attendance:update': ['owner', 'manager', 'teacher'],

  // 성적 관리
  'exams:read': ['owner', 'manager', 'teacher', 'parent', 'student'],
  'exams:create': ['owner', 'manager', 'teacher'],

  // 청구/정산
  'billing:read': ['owner', 'manager', 'parent'],
  'billing:manage': ['owner', 'manager'],

  // 자동화 규칙
  'automation:manage': ['owner', 'manager'],
} as const

export function hasPermission(
  userRole: string,
  permission: keyof typeof PERMISSIONS
): boolean {
  return PERMISSIONS[permission]?.includes(userRole) ?? false
}
```

---

## 🔔 커뮤니케이션 & 자동화 엔진

### 자동화 플로우

```
1. 트리거 발생 (예: 상담 신청)
   ↓
2. automation_rules 테이블 조회
   ↓
3. 조건 평가 (JSONB conditions)
   ↓
4. 액션 실행
   ├─ send_notification → Queue에 추가
   ├─ create_calendar_event → Google Calendar API 호출
   └─ update_status → DB 업데이트
   ↓
5. notification_logs 기록
```

### 자동화 규칙 예시

```json
{
  "name": "상담 신청 시 자동 안내",
  "trigger": "consultation_created",
  "conditions": {
    "branch_id": "uuid-of-branch" // 특정 지점만
  },
  "actions": [
    {
      "type": "send_notification",
      "config": {
        "template_id": "consultation_received",
        "recipient_field": "parent_email",
        "channel": "kakao"
      }
    },
    {
      "type": "create_calendar_event",
      "config": {
        "calendar_id": "primary",
        "summary": "상담: {{student_name}}",
        "duration": 30
      }
    }
  ]
}
```

---

## 🚀 배포 아키텍처

### Cloudflare Pages (Frontend)

```yaml
Environment Variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_APP_URL

Build Command: npm run build
Output Directory: .next

Framework: Next.js (Experimental Edge)
```

### Cloudflare Workers (Backend)

```yaml
Workers:
  - api-worker (API 라우트)
  - cron-worker (스케줄 작업)
  - queue-worker (비동기 작업)

Environment Variables:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
  - KAKAO_API_KEY
  - GOOGLE_CALENDAR_API_KEY
  - SENDGRID_API_KEY

Bindings:
  - NOTIFICATION_QUEUE (Queue)
  - KV_CACHE (KV Namespace)
```

### Supabase (Database)

```yaml
Projects:
  - development (로컬/스테이징)
  - production

Features:
  - PostgreSQL with RLS
  - Auth (Email/Social)
  - Storage (파일 업로드)
  - Realtime (Subscriptions)
  - Edge Functions (optional)
```

---

## 📊 모니터링 & 로깅

### 프론트엔드
- **Sentry**: 에러 추적
- **Google Analytics**: 사용자 분석
- **Cloudflare Web Analytics**: 성능 모니터링

### 백엔드
- **Cloudflare Analytics**: Workers 성능
- **Supabase Logs**: DB 쿼리 로그
- **Custom Metrics**: 알림 발송률, API 응답 시간

---

## 🔄 데이터 플로우 예시

### 1. 상담 신청 → 등록 플로우

```
1. 사용자: 상담 폼 작성 → POST /api/consultations
   ↓
2. API Worker: DB에 consultation 레코드 생성
   ↓
3. Automation Rule 트리거: "consultation_created"
   ↓
4. Actions:
   a. Queue에 알림 추가 (학부모에게 접수 안내)
   b. Google Calendar에 일정 생성
   c. 내부 운영자에게 알림
   ↓
5. Queue Worker: Kakao 알림톡 발송
   ↓
6. Cron (상담 하루 전): 리마인더 발송
   ↓
7. 상담 완료: 상태 업데이트 → "completed"
   ↓
8. 등록 확정: enrollment 레코드 생성
   ↓
9. Automation Rule: "enrollment_confirmed"
   ↓
10. Actions:
    a. 온보딩 메시지 발송 (시간표, 준비물)
    b. 첫 수업 안내
```

---

**마지막 업데이트**: 2025-11-18
**버전**: 0.1.0 (초기 설계)
