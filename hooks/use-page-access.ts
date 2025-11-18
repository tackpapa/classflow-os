'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { permissionManager } from '@/lib/utils/permissions'
import type { PageId, UserRole } from '@/lib/types/permissions'

export function usePageAccess(pageId: PageId) {
  const router = useRouter()

  useEffect(() => {
    // 로그인 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // 역할 확인
    const userRole = localStorage.getItem('userRole') as UserRole | null
    if (!userRole) {
      router.push('/login')
      return
    }

    // 페이지 접근 권한 확인
    const hasAccess = permissionManager.canAccessPage(pageId, userRole)
    if (!hasAccess) {
      // 접근 권한이 없으면 대시보드로 리다이렉트
      router.push('/overview')
    }
  }, [pageId, router])
}
