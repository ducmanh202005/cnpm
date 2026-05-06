import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingState from './components/common/LoadingState.jsx';
import AppShell from './components/layout/AppShell.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { getPrimaryHome, hasAnyRole } from './utils/appConfig.js';

/* ── Lazy-loaded pages ── */
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const OverviewPage = lazy(() => import('./pages/OverviewPage.jsx'));

// Student
const StudentLayout = lazy(() => import('./pages/student/StudentLayout.jsx'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard.jsx'));
const StudentRegistration = lazy(() => import('./pages/student/StudentRegistration.jsx'));
const StudentSchedule = lazy(() => import('./pages/student/StudentSchedule.jsx'));
const StudentExams = lazy(() => import('./pages/student/StudentExams.jsx'));
const StudentTuition = lazy(() => import('./pages/student/StudentTuition.jsx'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile.jsx'));

// Academic
const AcademicLayout = lazy(() => import('./pages/academic/AcademicLayout.jsx'));
const AcademicDashboard = lazy(() => import('./pages/academic/AcademicDashboard.jsx'));
const AcademicCourses = lazy(() => import('./pages/academic/AcademicCourses.jsx'));
const AcademicSections = lazy(() => import('./pages/academic/AcademicSections.jsx'));
const AcademicStudents = lazy(() => import('./pages/academic/AcademicStudents.jsx'));
const AcademicLecturers = lazy(() => import('./pages/academic/AcademicLecturers.jsx'));
const AcademicSemesters = lazy(() => import('./pages/academic/AcademicSemesters.jsx'));

// Finance
const FinanceLayout = lazy(() => import('./pages/finance/FinanceLayout.jsx'));
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard.jsx'));
const FinanceRates = lazy(() => import('./pages/finance/FinanceRates.jsx'));
const FinanceLiabilities = lazy(() => import('./pages/finance/FinanceLiabilities.jsx'));
const FinancePayments = lazy(() => import('./pages/finance/FinancePayments.jsx'));
const FinanceReceipts = lazy(() => import('./pages/finance/FinanceReceipts.jsx'));

// Lecturer
const LecturerLayout = lazy(() => import('./pages/lecturer/LecturerLayout.jsx'));
const LecturerDashboard = lazy(() => import('./pages/lecturer/LecturerDashboard.jsx'));
const LecturerSections = lazy(() => import('./pages/lecturer/LecturerSections.jsx'));
const LecturerExams = lazy(() => import('./pages/lecturer/LecturerExams.jsx'));
const LecturerRoster = lazy(() => import('./pages/lecturer/LecturerRoster.jsx'));

// Admin
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles.jsx'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit.jsx'));

function RequireAuth({ roles, children }) {
  const { user, booting } = useAuth();

  if (booting) {
    return <LoadingState label="Đang khởi tạo phiên làm việc..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasAnyRole(user, roles)) {
    return <Navigate to={getPrimaryHome(user)} replace />;
  }

  return children;
}

function RootRedirect() {
  const { user, booting } = useAuth();

  if (booting) {
    return <LoadingState label="Đang tải..." />;
  }

  return <Navigate to={user ? getPrimaryHome(user) : '/login'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingState label="Đang tải trang..." />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="overview" element={<OverviewPage />} />

          {/* Student workspace */}
          <Route path="student" element={<RequireAuth roles={['student']}><StudentLayout /></RequireAuth>}>
            <Route index element={<StudentDashboard />} />
            <Route path="registration" element={<StudentRegistration />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="tuition" element={<StudentTuition />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Academic workspace */}
          <Route path="academic" element={<RequireAuth roles={['academic_office', 'admin']}><AcademicLayout /></RequireAuth>}>
            <Route index element={<AcademicDashboard />} />
            <Route path="courses" element={<AcademicCourses />} />
            <Route path="sections" element={<AcademicSections />} />
            <Route path="students" element={<AcademicStudents />} />
            <Route path="lecturers" element={<AcademicLecturers />} />
            <Route path="semesters" element={<AcademicSemesters />} />
          </Route>

          {/* Finance workspace */}
          <Route path="finance" element={<RequireAuth roles={['finance_office', 'admin']}><FinanceLayout /></RequireAuth>}>
            <Route index element={<FinanceDashboard />} />
            <Route path="rates" element={<FinanceRates />} />
            <Route path="liabilities" element={<FinanceLiabilities />} />
            <Route path="payments" element={<FinancePayments />} />
            <Route path="receipts" element={<FinanceReceipts />} />
          </Route>

          {/* Lecturer workspace */}
          <Route path="lecturer" element={<RequireAuth roles={['lecturer']}><LecturerLayout /></RequireAuth>}>
            <Route index element={<LecturerDashboard />} />
            <Route path="sections" element={<LecturerSections />} />
            <Route path="exams" element={<LecturerExams />} />
            <Route path="roster" element={<LecturerRoster />} />
          </Route>

          {/* Admin workspace */}
          <Route path="admin" element={<RequireAuth roles={['admin']}><AdminLayout /></RequireAuth>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
}
