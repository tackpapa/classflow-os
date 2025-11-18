'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Crown, GraduationCap, UserCog, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { accountManager } from '@/lib/utils/permissions'

const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

type LoginFormData = z.infer<typeof loginSchema>

type UserRole = 'director' | 'teacher' | 'staff' | null

// 역할별 기본 계정 정보 (테스트용)
const defaultRoleAccounts = {
  director: { username: 'admin', password: '1234', label: '원장', role: 'admin', name: '원장' },
  teacher: { username: 'teacher', password: '1234', label: '강사', role: 'teacher', name: '김강사' },
  staff: { username: 'staff', password: '1234', label: '직원', role: 'staff', name: '이직원' },
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // 역할 선택 핸들러
  const handleRoleSelect = (role: UserRole) => {
    if (selectedRole === role) {
      // 같은 역할을 다시 클릭하면 접기
      setSelectedRole(null)
      reset()
    } else {
      // 다른 역할 선택
      setSelectedRole(role)
      reset()
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    if (!selectedRole) {
      toast({
        title: '역할을 선택해주세요',
        description: '로그인할 역할을 먼저 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      // 선택된 역할의 기본 계정 정보
      const defaultAccount = defaultRoleAccounts[selectedRole]

      // 먼저 기본 계정 확인
      if (data.username === defaultAccount.username && data.password === defaultAccount.password) {
        // 기본 관리자 계정 로그인
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', defaultAccount.role)
        localStorage.setItem('userName', defaultAccount.name)

        toast({
          title: '로그인 성공',
          description: `${defaultAccount.label}으로 로그인되었습니다.`,
        })

        router.push('/overview')
        router.refresh()
        return
      }

      // accountManager에 등록된 계정 확인 (설정에서 추가한 계정)
      const account = accountManager.findAccount(data.username, data.password)
      if (account) {
        // 역할이 선택한 역할과 일치하는지 확인
        const roleMatch =
          (selectedRole === 'teacher' && account.role === 'teacher') ||
          (selectedRole === 'staff' && account.role === 'staff') ||
          (selectedRole === 'director' && account.role === 'admin')

        if (roleMatch) {
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('userRole', account.role)
          localStorage.setItem('userName', account.name)

          const roleLabel = selectedRole === 'director' ? '원장' : selectedRole === 'teacher' ? '강사' : '직원'
          toast({
            title: '로그인 성공',
            description: `${roleLabel}으로 로그인되었습니다.`,
          })

          router.push('/overview')
          router.refresh()
          return
        } else {
          toast({
            title: '로그인 실패',
            description: '선택한 역할과 계정 정보가 일치하지 않습니다.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
      }

      // 잘못된 인증 정보
      toast({
        title: '로그인 실패',
        description: '아이디 또는 비밀번호가 올바르지 않습니다.',
        variant: 'destructive',
      })
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

  // 역할별 아이콘 및 정보
  const roleInfo = {
    director: {
      icon: Crown,
      label: '원장 로그인',
      description: '원장님 전용 관리 시스템',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverBg: 'hover:bg-yellow-100',
    },
    teacher: {
      icon: GraduationCap,
      label: '강사 로그인',
      description: '강사님 전용 수업 관리',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-100',
    },
    staff: {
      icon: UserCog,
      label: '직원 로그인',
      description: '직원 전용 업무 관리',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-100',
    },
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <span className="text-2xl font-bold text-primary-foreground">C</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          역할을 선택하여 ClassFlow OS에 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 역할 선택 버튼들 */}
        {(Object.keys(roleInfo) as Array<keyof typeof roleInfo>).map((role) => {
          const info = roleInfo[role]
          const Icon = info.icon
          const isSelected = selectedRole === role
          const accountInfo = defaultRoleAccounts[role]

          return (
            <div key={role} className="space-y-2">
              {/* 역할 선택 버튼 */}
              <button
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                  isSelected
                    ? `${info.borderColor} ${info.bgColor}`
                    : 'border-muted bg-muted/20 hover:border-muted-foreground/30',
                  info.hoverBg
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      isSelected ? info.bgColor : 'bg-muted'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isSelected ? info.color : 'text-muted-foreground')} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{info.label}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform',
                    isSelected && 'rotate-180'
                  )}
                />
              </button>

              {/* 로그인 폼 (선택된 역할만 표시) */}
              {isSelected && (
                <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">아이디</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder={accountInfo.username}
                        {...register('username')}
                        disabled={isLoading}
                        autoFocus
                      />
                      {errors.username && (
                        <p className="text-sm text-destructive">{errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        disabled={isLoading}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                      )}
                    </div>
                    {/* 테스트용 계정 정보 표시 */}
                    <div className="p-3 bg-muted/50 rounded-md border border-muted">
                      <p className="text-xs text-muted-foreground text-center">
                        기본 계정: <span className="font-mono font-semibold">{accountInfo.username}</span> / <span className="font-mono font-semibold">{accountInfo.password}</span>
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        또는 설정에서 추가한 계정으로 로그인하세요
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {info.label.replace(' 로그인', '')}으로 로그인
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            회원가입
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
