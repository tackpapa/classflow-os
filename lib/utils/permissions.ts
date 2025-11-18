import type { PagePermissions, UserRole, PageId, UserAccount } from '@/lib/types/permissions'
import { DEFAULT_PERMISSIONS } from '@/lib/types/permissions'

const PERMISSIONS_KEY = 'page_permissions'
const ACCOUNTS_KEY = 'user_accounts'

// 페이지 권한 관리
export const permissionManager = {
  // 권한 가져오기
  getPermissions(): PagePermissions {
    if (typeof window === 'undefined') return DEFAULT_PERMISSIONS

    const stored = localStorage.getItem(PERMISSIONS_KEY)
    if (!stored) {
      this.setPermissions(DEFAULT_PERMISSIONS)
      return DEFAULT_PERMISSIONS
    }
    return JSON.parse(stored)
  },

  // 권한 저장
  setPermissions(permissions: PagePermissions): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
  },

  // 특정 페이지의 특정 역할 권한 업데이트
  updatePagePermission(pageId: PageId, role: 'staff' | 'teacher', hasAccess: boolean): void {
    const permissions = this.getPermissions()
    if (!permissions[pageId]) {
      permissions[pageId] = { staff: false, teacher: false }
    }
    permissions[pageId][role] = hasAccess
    this.setPermissions(permissions)
  },

  // 사용자가 페이지에 접근 가능한지 확인
  canAccessPage(pageId: PageId, userRole: UserRole): boolean {
    // 관리자는 모든 페이지 접근 가능
    if (userRole === 'admin') return true

    const permissions = this.getPermissions()
    const pagePermission = permissions[pageId]

    if (!pagePermission) return false

    if (userRole === 'staff') return pagePermission.staff
    if (userRole === 'teacher') return pagePermission.teacher

    return false
  },

  // 권한 초기화
  resetPermissions(): void {
    this.setPermissions(DEFAULT_PERMISSIONS)
  },
}

// 사용자 계정 관리
export const accountManager = {
  // 모든 계정 가져오기
  getAccounts(): UserAccount[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(ACCOUNTS_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  },

  // 계정 저장
  setAccounts(accounts: UserAccount[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  },

  // 계정 추가
  addAccount(account: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount {
    const accounts = this.getAccounts()
    const newAccount: UserAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    accounts.push(newAccount)
    this.setAccounts(accounts)
    return newAccount
  },

  // 계정 수정
  updateAccount(id: string, updates: Partial<UserAccount>): void {
    const accounts = this.getAccounts()
    const index = accounts.findIndex((acc) => acc.id === id)
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates }
      this.setAccounts(accounts)
    }
  },

  // 계정 삭제
  deleteAccount(id: string): void {
    const accounts = this.getAccounts()
    const filtered = accounts.filter((acc) => acc.id !== id)
    this.setAccounts(filtered)
  },

  // 계정 찾기 (로그인용)
  findAccount(username: string, password: string): UserAccount | null {
    const accounts = this.getAccounts()
    return accounts.find((acc) => acc.username === username && acc.password === password) || null
  },

  // 사용자명 중복 확인
  isUsernameTaken(username: string, excludeId?: string): boolean {
    const accounts = this.getAccounts()
    return accounts.some((acc) => acc.username === username && acc.id !== excludeId)
  },
}
