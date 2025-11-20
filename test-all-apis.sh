#!/bin/bash

API_BASE="http://localhost:8787"
SUCCESS=0
FAIL=0

echo "================================"
echo "전체 API 엔드포인트 테스트 시작"
echo "================================"
echo ""

# Test function
test_api() {
  local method=$1
  local endpoint=$2
  local description=$3
  
  echo -n "[$method] $endpoint - $description ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "%{http_code}" -o /dev/null "$API_BASE$endpoint")
  else
    response=$(curl -s -w "%{http_code}" -o /dev/null -X "$method" "$API_BASE$endpoint" -H "Content-Type: application/json")
  fi
  
  if [ "$response" = "200" ] || [ "$response" = "401" ] || [ "$response" = "405" ]; then
    echo "✅ $response"
    ((SUCCESS++))
  else
    echo "❌ $response"
    ((FAIL++))
  fi
}

# 0. Health checks
test_api "GET" "/" "Root endpoint"
test_api "GET" "/health" "Health check"

# 1. Students
test_api "GET" "/api/students" "Get all students"
test_api "POST" "/api/students" "Create student"
test_api "GET" "/api/students/123" "Get student by ID"
test_api "PATCH" "/api/students/123" "Update student"
test_api "DELETE" "/api/students/123" "Delete student"

# 2. Classes
test_api "GET" "/api/classes" "Get all classes"
test_api "POST" "/api/classes" "Create class"
test_api "GET" "/api/classes/123" "Get class by ID"
test_api "PATCH" "/api/classes/123" "Update class"
test_api "DELETE" "/api/classes/123" "Delete class"

# 3. Teachers
test_api "GET" "/api/teachers" "Get all teachers"
test_api "POST" "/api/teachers" "Create teacher"
test_api "GET" "/api/teachers/123" "Get teacher by ID"
test_api "PUT" "/api/teachers/123" "Update teacher"
test_api "DELETE" "/api/teachers/123" "Delete teacher"

# 4. Attendance
test_api "GET" "/api/attendance" "Get attendance records"
test_api "POST" "/api/attendance" "Create attendance"
test_api "GET" "/api/attendance/123" "Get attendance by ID"
test_api "PATCH" "/api/attendance/123" "Update attendance"
test_api "DELETE" "/api/attendance/123" "Delete attendance"

# 5. Lessons
test_api "GET" "/api/lessons" "Get all lessons"
test_api "POST" "/api/lessons" "Create lesson"
test_api "GET" "/api/lessons/123" "Get lesson by ID"
test_api "PUT" "/api/lessons/123" "Update lesson"
test_api "DELETE" "/api/lessons/123" "Delete lesson"

# 6. Consultations
test_api "GET" "/api/consultations" "Get consultations"
test_api "POST" "/api/consultations" "Create consultation"
test_api "GET" "/api/consultations/123" "Get consultation by ID"
test_api "PATCH" "/api/consultations/123" "Update consultation"
test_api "DELETE" "/api/consultations/123" "Delete consultation"

# 7. Exams
test_api "GET" "/api/exams" "Get all exams"
test_api "POST" "/api/exams" "Create exam"
test_api "GET" "/api/exams/123" "Get exam by ID"
test_api "PUT" "/api/exams/123" "Update exam"
test_api "DELETE" "/api/exams/123" "Delete exam"

# 8. Homework
test_api "GET" "/api/homework" "Get all homework"
test_api "POST" "/api/homework" "Create homework"
test_api "GET" "/api/homework/123" "Get homework by ID"
test_api "PUT" "/api/homework/123" "Update homework"
test_api "DELETE" "/api/homework/123" "Delete homework"

# 9. Billing
test_api "GET" "/api/billing" "Get billing records"
test_api "POST" "/api/billing" "Create billing"
test_api "GET" "/api/billing/123" "Get billing by ID"
test_api "PUT" "/api/billing/123" "Update billing"
test_api "DELETE" "/api/billing/123" "Delete billing"

# 10. Expenses
test_api "GET" "/api/expenses" "Get all expenses"
test_api "POST" "/api/expenses" "Create expense"
test_api "GET" "/api/expenses/123" "Get expense by ID"
test_api "PUT" "/api/expenses/123" "Update expense"
test_api "DELETE" "/api/expenses/123" "Delete expense"

# 11. Rooms
test_api "GET" "/api/rooms" "Get all rooms"
test_api "POST" "/api/rooms" "Create room"
test_api "GET" "/api/rooms/123" "Get room by ID"
test_api "PUT" "/api/rooms/123" "Update room"
test_api "DELETE" "/api/rooms/123" "Delete room"

# 12. Seats
test_api "GET" "/api/seats" "Get all seats"
test_api "POST" "/api/seats" "Create seat"
test_api "GET" "/api/seats/123" "Get seat by ID"
test_api "PUT" "/api/seats/123" "Update seat"
test_api "DELETE" "/api/seats/123" "Delete seat"

# 13. Schedules
test_api "GET" "/api/schedules" "Get all schedules"
test_api "POST" "/api/schedules" "Create schedule"
test_api "GET" "/api/schedules/123" "Get schedule by ID"
test_api "PUT" "/api/schedules/123" "Update schedule"
test_api "DELETE" "/api/schedules/123" "Delete schedule"

# 14. Settings
test_api "GET" "/api/settings" "Get settings"
test_api "PUT" "/api/settings" "Update settings"

# 15. Overview
test_api "GET" "/api/overview" "Get overview stats"

# 16. Migrate
test_api "POST" "/api/migrate" "Run migration"

# 17. Test env
test_api "GET" "/api/test-env" "Test environment vars"

# 18. Auth endpoints
test_api "POST" "/api/auth/login" "Login"
test_api "POST" "/api/auth/logout" "Logout"
test_api "POST" "/api/auth/register" "Register"
test_api "GET" "/api/auth/me" "Get current user"

echo ""
echo "================================"
echo "테스트 결과"
echo "================================"
echo "✅ 성공: $SUCCESS"
echo "❌ 실패: $FAIL"
echo "📊 총계: $((SUCCESS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 모든 API 테스트 통과!"
  exit 0
else
  echo "⚠️  일부 API 테스트 실패"
  exit 1
fi
