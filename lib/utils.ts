import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS 클래스 병합 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜 포맷팅
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'long') {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return d.toLocaleDateString('ko-KR')
}

/**
 * 시간 포맷팅
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

/**
 * 숫자 포맷팅 (천단위 콤마)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}

/**
 * 금액 포맷팅
 */
export function formatCurrency(amount: number): string {
  return `${formatNumber(amount)}원`
}
