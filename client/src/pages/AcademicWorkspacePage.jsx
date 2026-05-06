import { useEffect, useState } from 'react';
import DataTable from '../components/common/DataTable.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { catalogApi, lecturerApi, studentApi, workspaceApi } from '../api/portalApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatExamSchedule, formatSchedule } from '../utils/formatters.js';

const getId = (item) => item?.id || item?._id || '';

const buildStudentForm = () => ({
  studentId: '',
  studentCode: '',
  fullName: '',
  email: '',
  phone: '',
  faculty: 'Công nghệ thông tin',
  major: 'Công nghệ phần mềm',
  cohort: 'K23',
  administrativeClass: 'D23CQCN01-N',
  academicStatus: 'active',
  bankAccount: '',
  createAccount: true
});

const buildLecturerForm = () => ({
  lecturerId: '',
  lecturerCode: '',
  fullName: '',
  email: '',
  phone: '',
  department: 'Công nghệ phần mềm',
  degree: 'Thạc sĩ',
  workingStatus: 'active',
  createAccount: true
});

export default function AcademicWorkspacePage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'required',
    faculty: 'Công nghệ thông tin',
    description: ''
  });
  const [studentForm, setStudentForm] = useState(buildStudentForm);
  const [lecturerForm, setLecturerForm] = useState(buildLecturerForm);
  const [semesterForm, setSemesterForm] = useState({
    code: '',
    name: 'Học kỳ 1',
    academicYear: '2026-2027',
    startDate: '2026-09-03',
    endDate: '2027-01-15',
    registrationDeadline: '2026-08-25',
    paymentDeadline: '2026-09-20',
    status: 'planning'
  });
  const [periodForm, setPeriodForm] = useState({
    name: '',
    semester: '',
    startAt: '2026-08-15T08:00',
    endAt: '2026-08-25T23:59',
    targetAudience: 'Toàn trường',
    status: 'active'
  });
  const [sectionForm, setSectionForm] = useState({
    code: '',
    course: '',
    semester: '',
    lecturer: '',
    capacity: 40,
    minCapacity: 15,
    room: '',
    dayOfWeek: 2,
    sessionLabel: 'Sang',
    startPeriod: 1,
    periodCount: 3
  });
  const [sectionUpdateForm, setSectionUpdateForm] = useState({
    sectionId: '',
    lecturer: '',
    status: 'open',
    examDate: '',
    examRoom: '',
    examSessionLabel: 'Ca 1',
    durationMinutes: 90,
    examFormat: 'written',
    cancelReason: ''
  });

  const hydrateSectionUpdate = (sectionId, sourceData) => {
    const target = (sourceData?.sections || []).find((item) => getId(item) === sectionId);
    if (!target) {
      return;
    }

    setSectionUpdateForm({
      sectionId,
      lecturer: getId(target.lecturer),
      status: target.status || 'open',
      examDate: target.exam?.examDate ? new Date(target.exam.examDate).toISOString().slice(0, 16) : '',
      examRoom: target.exam?.room || target.room || '',
      examSessionLabel: target.exam?.sessionLabel || 'Ca 1',
      durationMinutes: target.exam?.durationMinutes || 90,
      examFormat: target.exam?.format || 'written',
      cancelReason: target.cancelReason || ''
    });
  };

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      const response = await workspaceApi.academic(token);
      const courses = response.courses || [];
      const semesters = response.semesters || [];
      const lecturers = response.lecturers || [];
      const sections = response.sections || [];

      setData(response);
      setSectionForm((current) => ({
        ...current,
        course: current.course || getId(courses[0]),
        semester: current.semester || getId(semesters[0]),
        lecturer: current.lecturer || getId(lecturers[0])
      }));
      setPeriodForm((current) => ({
        ...current,
        semester: current.semester || getId(semesters[0])
      }));

      const nextSectionId = sectionUpdateForm.sectionId || getId(sections[0]);
      if (nextSectionId) {
        hydrateSectionUpdate(nextSectionId, response);
      }
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải dữ liệu phòng đào tạo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  const handleRequest = async (requester, successMessage, resetter) => {
    setMessage('');
    setError('');
    try {
      const response = await requester();
      if (response?.temporaryPassword) {
        setMessage(`${successMessage} Mật khẩu tạm: ${response.temporaryPassword}`);
      } else {
        setMessage(successMessage);
      }
      if (resetter) {
        resetter();
      }
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError.message || 'Không thể thực hiện thao tác.');
    }
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    await handleRequest(
      () => catalogApi.createCourse(token, courseForm),
      'Đã lưu môn học.',
      () =>
        setCourseForm({
          code: '',
          name: '',
          credits: 3,
          theoryCredits: 2,
          practiceCredits: 1,
          courseType: 'required',
          faculty: 'Cong nghe thong tin',
          description: ''
        })
    );
  };

  const handleStudentSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      studentCode: studentForm.studentCode,
      fullName: studentForm.fullName,
      email: studentForm.email,
      phone: studentForm.phone,
      faculty: studentForm.faculty,
      major: studentForm.major,
      cohort: studentForm.cohort,
      administrativeClass: studentForm.administrativeClass,
      academicStatus: studentForm.academicStatus,
      bankAccount: studentForm.bankAccount,
      createAccount: studentForm.studentId ? false : studentForm.createAccount
    };

    const requester = studentForm.studentId
      ? () => studentApi.updateStudent(token, studentForm.studentId, payload)
      : () => studentApi.createStudent(token, payload);

    await handleRequest(requester, studentForm.studentId ? 'Đã cập nhật sinh viên.' : 'Đã thêm sinh viên mới.', () =>
      setStudentForm(buildStudentForm())
    );
  };

  const handleLecturerSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      lecturerCode: lecturerForm.lecturerCode,
      fullName: lecturerForm.fullName,
      email: lecturerForm.email,
      phone: lecturerForm.phone,
      department: lecturerForm.department,
      degree: lecturerForm.degree,
      workingStatus: lecturerForm.workingStatus,
      createAccount: lecturerForm.lecturerId ? false : lecturerForm.createAccount
    };

    const requester = lecturerForm.lecturerId
      ? () => lecturerApi.updateLecturer(token, lecturerForm.lecturerId, payload)
      : () => lecturerApi.createLecturer(token, payload);

    await handleRequest(
      requester,
      lecturerForm.lecturerId ? 'Đã cập nhật giảng viên.' : 'Đã thêm giảng viên mới.',
      () => setLecturerForm(buildLecturerForm())
    );
  };

  const handleSemesterSubmit = async (event) => {
    event.preventDefault();
    await handleRequest(
      () =>
        catalogApi.createSemester(token, {
          ...semesterForm,
          startDate: new Date(semesterForm.startDate).toISOString(),
          endDate: new Date(semesterForm.endDate).toISOString(),
          registrationDeadline: new Date(semesterForm.registrationDeadline).toISOString(),
          paymentDeadline: new Date(semesterForm.paymentDeadline).toISOString()
        }),
      'Đã tạo học kỳ mới.'
    );
  };

  const handlePeriodSubmit = async (event) => {
    event.preventDefault();
    await handleRequest(
      () =>
        catalogApi.createRegistrationPeriod(token, {
          ...periodForm,
          startAt: new Date(periodForm.startAt).toISOString(),
          endAt: new Date(periodForm.endAt).toISOString()
        }),
      'Đã tạo đợt đăng ký mới.',
      () =>
        setPeriodForm((current) => ({
          ...current,
          name: ''
        }))
    );
  };

  const handleSectionSubmit = async (event) => {
    event.preventDefault();
    await handleRequest(
      () =>
        catalogApi.createSection(token, {
          code: sectionForm.code,
          course: sectionForm.course,
          semester: sectionForm.semester,
          lecturer: sectionForm.lecturer || undefined,
          capacity: Number(sectionForm.capacity),
          minCapacity: Number(sectionForm.minCapacity),
          room: sectionForm.room,
          status: 'open',
          schedule: [
            {
              dayOfWeek: Number(sectionForm.dayOfWeek),
              sessionLabel: sectionForm.sessionLabel,
              startPeriod: Number(sectionForm.startPeriod),
              periodCount: Number(sectionForm.periodCount),
              room: sectionForm.room
            }
          ]
        }),
      'Đã mở học phần mới.',
      () =>
        setSectionForm((current) => ({
          ...current,
          code: '',
          room: ''
        }))
    );
  };

  const handleSectionUpdate = async (event) => {
    event.preventDefault();
    if (!sectionUpdateForm.sectionId) {
      return;
    }

    await handleRequest(
      () =>
        catalogApi.updateSection(token, sectionUpdateForm.sectionId, {
          lecturer: sectionUpdateForm.lecturer || '',
          status: sectionUpdateForm.status,
          cancelReason: sectionUpdateForm.cancelReason,
          exam: sectionUpdateForm.examDate
            ? {
                examDate: new Date(sectionUpdateForm.examDate).toISOString(),
                room: sectionUpdateForm.examRoom,
                sessionLabel: sectionUpdateForm.examSessionLabel,
                durationMinutes: Number(sectionUpdateForm.durationMinutes),
                format: sectionUpdateForm.examFormat
              }
            : null
        }),
      'Đã cập nhật học phần.'
    );
  };

  if (loading || !data) {
    return <LoadingState label="Đang tải workspace phòng đào tạo..." />;
  }

  const courses = data.courses || [];
  const semesters = data.semesters || [];
  const lecturers = data.lecturers || [];
  const sections = data.sections || [];
  const students = data.students || [];

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Phòng đào tạo</span>
          <h1>Quản lý môn học, học phần, sinh viên và lịch thi</h1>
          <p>Workspace nay gom cac thao tac cot loi cua module dao tao va dieu phọng hoc ky.</p>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard eyebrow="Học phần" title="Đang mở" value={data.spotlight.openSections} />
        <StatCard eyebrow="Học phần" title="Đầy sĩ số" value={data.spotlight.fullSections} />
        <StatCard eyebrow="Học vụ" title="Sinh viên cần xử lý" value={data.spotlight.onHoldStudents} />
        <StatCard eyebrow="Nhân sự" title="Giảng viên active" value={data.spotlight.activeLecturers} />
      </div>

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Môn học</h3>
              <p>Tạo môn học mới để đưa vào chương trình đào tạo.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleCourseSubmit}>
            <div className="form-grid">
              <label>
                <span>Mã môn</span>
                <input value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} />
              </label>
              <label>
                <span>Tên môn</span>
                <input value={courseForm.name} onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label>
                <span>Tín chỉ</span>
                <input type="number" value={courseForm.credits} onChange={(event) => setCourseForm((current) => ({ ...current, credits: event.target.value }))} />
              </label>
              <label>
                <span>Loại môn</span>
                <select value={courseForm.courseType} onChange={(event) => setCourseForm((current) => ({ ...current, courseType: event.target.value }))}>
                  <option value="required">Bắt buộc</option>
                  <option value="elective">Tự chọn</option>
                </select>
              </label>
            </div>
            <label>
              <span>Mô tả</span>
              <textarea rows="3" value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <button className="primary-button" type="submit">
              Lưu môn học
            </button>
          </form>
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Học kỳ và đợt đăng ký</h3>
              <p>Khởi tạo học kỳ mới và mở cửa đăng ký theo từng giai đoạn.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleSemesterSubmit}>
            <div className="form-grid">
              <label>
                <span>Ma hoc ky</span>
                <input value={semesterForm.code} onChange={(event) => setSemesterForm((current) => ({ ...current, code: event.target.value }))} />
              </label>
              <label>
                <span>Ten hoc ky</span>
                <input value={semesterForm.name} onChange={(event) => setSemesterForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label>
                <span>Nam hoc</span>
                <input value={semesterForm.academicYear} onChange={(event) => setSemesterForm((current) => ({ ...current, academicYear: event.target.value }))} />
              </label>
              <label>
                <span>Trang thai</span>
                <select value={semesterForm.status} onChange={(event) => setSemesterForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="planning">Planning</option>
                  <option value="registration_open">Registration open</option>
                  <option value="in_session">In session</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                <span>Bat dau</span>
                <input type="date" value={semesterForm.startDate} onChange={(event) => setSemesterForm((current) => ({ ...current, startDate: event.target.value }))} />
              </label>
              <label>
                <span>Ket thuc</span>
                <input type="date" value={semesterForm.endDate} onChange={(event) => setSemesterForm((current) => ({ ...current, endDate: event.target.value }))} />
              </label>
              <label>
                <span>Han dang ky</span>
                <input type="date" value={semesterForm.registrationDeadline} onChange={(event) => setSemesterForm((current) => ({ ...current, registrationDeadline: event.target.value }))} />
              </label>
              <label>
                <span>Han hoc phi</span>
                <input type="date" value={semesterForm.paymentDeadline} onChange={(event) => setSemesterForm((current) => ({ ...current, paymentDeadline: event.target.value }))} />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Tao hoc ky
            </button>
          </form>

          <form className="stack-form" onSubmit={handlePeriodSubmit}>
            <div className="form-grid">
              <label>
                <span>Ten dot</span>
                <input value={periodForm.name} onChange={(event) => setPeriodForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label>
                <span>Hoc ky</span>
                <select value={periodForm.semester} onChange={(event) => setPeriodForm((current) => ({ ...current, semester: event.target.value }))}>
                  {semesters.map((item) => (
                    <option key={getId(item)} value={getId(item)}>
                      {item.name} - {item.academicYear}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Bat dau</span>
                <input type="datetime-local" value={periodForm.startAt} onChange={(event) => setPeriodForm((current) => ({ ...current, startAt: event.target.value }))} />
              </label>
              <label>
                <span>Ket thuc</span>
                <input type="datetime-local" value={periodForm.endAt} onChange={(event) => setPeriodForm((current) => ({ ...current, endAt: event.target.value }))} />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Tao dot dang ky
            </button>
          </form>
        </section>
      </div>

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>{studentForm.studentId ? 'Cap nhat sinh vien' : 'Them sinh vien'}</h3>
              <p>Tao ho so sinh vien va cap phat tai khoan lien ket khi can.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleStudentSubmit}>
            <div className="form-grid">
              <label>
                <span>Ma SV</span>
                <input disabled={Boolean(studentForm.studentId)} value={studentForm.studentCode} onChange={(event) => setStudentForm((current) => ({ ...current, studentCode: event.target.value }))} />
              </label>
              <label>
                <span>Ho ten</span>
                <input value={studentForm.fullName} onChange={(event) => setStudentForm((current) => ({ ...current, fullName: event.target.value }))} />
              </label>
              <label>
                <span>Email</span>
                <input value={studentForm.email} onChange={(event) => setStudentForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                <span>Dien thoai</span>
                <input value={studentForm.phone} onChange={(event) => setStudentForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <label>
                <span>Nganh</span>
                <input value={studentForm.major} onChange={(event) => setStudentForm((current) => ({ ...current, major: event.target.value }))} />
              </label>
              <label>
                <span>Lop HC</span>
                <input value={studentForm.administrativeClass} onChange={(event) => setStudentForm((current) => ({ ...current, administrativeClass: event.target.value }))} />
              </label>
              <label>
                <span>Khoá</span>
                <input value={studentForm.cohort} onChange={(event) => setStudentForm((current) => ({ ...current, cohort: event.target.value }))} />
              </label>
              <label>
                <span>Trang thai</span>
                <select value={studentForm.academicStatus} onChange={(event) => setStudentForm((current) => ({ ...current, academicStatus: event.target.value }))}>
                  <option value="active">Active</option>
                  <option value="leave">Leave</option>
                  <option value="suspended">Suspended</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="graduated">Graduated</option>
                </select>
              </label>
            </div>
            {!studentForm.studentId ? (
              <label className="check-row">
                <input type="checkbox" checked={studentForm.createAccount} onChange={(event) => setStudentForm((current) => ({ ...current, createAccount: event.target.checked }))} />
                <span>Cap tai khoan dang nhap ngay cho sinh vien</span>
              </label>
            ) : null}
            <div className="inline-actions">
              <button className="primary-button" type="submit">
                {studentForm.studentId ? 'Cap nhat sinh vien' : 'Them sinh vien'}
              </button>
              {studentForm.studentId ? (
                <button className="ghost-button" type="button" onClick={() => setStudentForm(buildStudentForm())}>
                  Huy sua
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>{lecturerForm.lecturerId ? 'Cap nhat giang vien' : 'Them giang vien'}</h3>
              <p>Quan ly ho so giang vien va tai khoan giang day lien ket.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleLecturerSubmit}>
            <div className="form-grid">
              <label>
                <span>Ma GV</span>
                <input disabled={Boolean(lecturerForm.lecturerId)} value={lecturerForm.lecturerCode} onChange={(event) => setLecturerForm((current) => ({ ...current, lecturerCode: event.target.value }))} />
              </label>
              <label>
                <span>Ho ten</span>
                <input value={lecturerForm.fullName} onChange={(event) => setLecturerForm((current) => ({ ...current, fullName: event.target.value }))} />
              </label>
              <label>
                <span>Email</span>
                <input value={lecturerForm.email} onChange={(event) => setLecturerForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                <span>Dien thoai</span>
                <input value={lecturerForm.phone} onChange={(event) => setLecturerForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <label>
                <span>Bo mon</span>
                <input value={lecturerForm.department} onChange={(event) => setLecturerForm((current) => ({ ...current, department: event.target.value }))} />
              </label>
              <label>
                <span>Hoc vi</span>
                <input value={lecturerForm.degree} onChange={(event) => setLecturerForm((current) => ({ ...current, degree: event.target.value }))} />
              </label>
              <label>
                <span>Trang thai</span>
                <select value={lecturerForm.workingStatus} onChange={(event) => setLecturerForm((current) => ({ ...current, workingStatus: event.target.value }))}>
                  <option value="active">Active</option>
                  <option value="on_leave">On leave</option>
                  <option value="study_leave">Study leave</option>
                  <option value="retired">Retired</option>
                </select>
              </label>
            </div>
            {!lecturerForm.lecturerId ? (
              <label className="check-row">
                <input type="checkbox" checked={lecturerForm.createAccount} onChange={(event) => setLecturerForm((current) => ({ ...current, createAccount: event.target.checked }))} />
                <span>Cap tai khoan dang nhap ngay cho giang vien</span>
              </label>
            ) : null}
            <div className="inline-actions">
              <button className="primary-button" type="submit">
                {lecturerForm.lecturerId ? 'Cap nhat giang vien' : 'Them giang vien'}
              </button>
              {lecturerForm.lecturerId ? (
                <button className="ghost-button" type="button" onClick={() => setLecturerForm(buildLecturerForm())}>
                  Huy sua
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>

      <div className="content-grid content-grid--two">
        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Mo hoc phan</h3>
              <p>Khoi tao hoc phan moi cho hoc ky dang chon.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleSectionSubmit}>
            <div className="form-grid">
              <label>
                <span>Ma hoc phan</span>
                <input value={sectionForm.code} onChange={(event) => setSectionForm((current) => ({ ...current, code: event.target.value }))} />
              </label>
              <label>
                <span>Mon hoc</span>
                <select value={sectionForm.course} onChange={(event) => setSectionForm((current) => ({ ...current, course: event.target.value }))}>
                  {courses.map((item) => (
                    <option key={getId(item)} value={getId(item)}>
                      {item.code} - {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Hoc ky</span>
                <select value={sectionForm.semester} onChange={(event) => setSectionForm((current) => ({ ...current, semester: event.target.value }))}>
                  {semesters.map((item) => (
                    <option key={getId(item)} value={getId(item)}>
                      {item.name} - {item.academicYear}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Giang vien</span>
                <select value={sectionForm.lecturer} onChange={(event) => setSectionForm((current) => ({ ...current, lecturer: event.target.value }))}>
                  <option value="">Chua phan cong</option>
                  {lecturers.map((item) => (
                    <option key={getId(item)} value={getId(item)}>
                      {item.lecturerCode} - {item.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Phong hoc</span>
                <input value={sectionForm.room} onChange={(event) => setSectionForm((current) => ({ ...current, room: event.target.value }))} />
              </label>
              <label>
                <span>Thu</span>
                <input type="number" min="2" max="8" value={sectionForm.dayOfWeek} onChange={(event) => setSectionForm((current) => ({ ...current, dayOfWeek: event.target.value }))} />
              </label>
            </div>
            <button className="primary-button" type="submit">
              Mo hoc phan
            </button>
          </form>
        </section>

        <section className="panel">
          <header className="panel__header">
            <div>
              <h3>Cap nhat hoc phan</h3>
              <p>Phan cong giang vien, doi trang thai va sap lich thi.</p>
            </div>
          </header>
          <form className="stack-form" onSubmit={handleSectionUpdate}>
            <div className="form-grid">
              <label>
                <span>Hoc phan</span>
                <select
                  value={sectionUpdateForm.sectionId}
                  onChange={(event) => hydrateSectionUpdate(event.target.value, data)}
                >
                  {sections.map((item) => (
                    <option key={getId(item)} value={getId(item)}>
                      {item.code} - {item.course?.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Giang vien</span>
                <select value={sectionUpdateForm.lecturer} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, lecturer: event.target.value }))}>
                  <option value="">Chua phan cong</option>
                  {lecturers.map((item) => (
                    <option key={getId(item)} value={getId(item)}>
                      {item.lecturerCode} - {item.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Trang thai</span>
                <select value={sectionUpdateForm.status} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="pending">Pending</option>
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label>
                <span>Ngay thi</span>
                <input type="datetime-local" value={sectionUpdateForm.examDate} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, examDate: event.target.value }))} />
              </label>
              <label>
                <span>Phong thi</span>
                <input value={sectionUpdateForm.examRoom} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, examRoom: event.target.value }))} />
              </label>
              <label>
                <span>Ca thi</span>
                <input value={sectionUpdateForm.examSessionLabel} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, examSessionLabel: event.target.value }))} />
              </label>
              <label>
                <span>Thoi luong (phut)</span>
                <input type="number" min="30" value={sectionUpdateForm.durationMinutes} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, durationMinutes: event.target.value }))} />
              </label>
              <label>
                <span>Hinh thuc thi</span>
                <select value={sectionUpdateForm.examFormat} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, examFormat: event.target.value }))}>
                  <option value="written">Tu luan</option>
                  <option value="multiple_choice">Trac nghiem</option>
                  <option value="practical">Thuc hanh</option>
                  <option value="oral">Van dap</option>
                </select>
              </label>
            </div>
            <label>
              <span>Ly do dong/huy</span>
              <textarea rows="2" value={sectionUpdateForm.cancelReason} onChange={(event) => setSectionUpdateForm((current) => ({ ...current, cancelReason: event.target.value }))} />
            </label>
            <button className="primary-button" type="submit">
              Cap nhat hoc phan
            </button>
          </form>
        </section>
      </div>

      <DataTable
        title="Danh muc mon hoc"
        rows={courses}
        searchable
        searchKeys={['code', 'name', 'faculty', 'courseType']}
        columns={[
          { label: 'Ma mon', key: 'code' },
          { label: 'Ten mon', key: 'name' },
          { label: 'Tin chi', key: 'credits' },
          { label: 'Loai mon', key: 'courseType' },
          { label: 'Khoa', key: 'faculty' }
        ]}
      />

      <DataTable
        title="Danh sach hoc phan"
        rows={sections}
        searchable
        searchKeys={['code', 'course.code', 'course.name', 'lecturer.fullName', 'status']}
        columns={[
          { label: 'Ma hoc phan', key: 'code' },
          { label: 'Mon hoc', key: 'course.name', render: (row) => `${row.course?.code} - ${row.course?.name}` },
          { label: 'Giang vien', key: 'lecturer.fullName' },
          { label: 'Lich hoc', key: 'schedule', render: (row) => formatSchedule(row.schedule) },
          { label: 'Lich thi', key: 'exam.examDate', render: (row) => formatExamSchedule(row.exam), sortValue: (row) => row.exam?.examDate || '' },
          { label: 'Si so', key: 'capacity', render: (row) => `${row.currentEnrollment}/${row.capacity}` },
          { label: 'Trang thai', key: 'status', type: 'status' }
        ]}
      />

      <div className="content-grid content-grid--two">
        <DataTable
          title="Danh sach sinh vien"
          rows={students}
          searchable
          searchKeys={['studentCode', 'fullName', 'major', 'administrativeClass', 'academicStatus']}
          columns={[
            { label: 'Ma SV', key: 'studentCode' },
            { label: 'Ho ten', key: 'fullName' },
            { label: 'Nganh', key: 'major' },
            { label: 'Lop HC', key: 'administrativeClass' },
            { label: 'Trang thai', key: 'academicStatus', type: 'status' },
            {
              label: 'Tac vu',
              key: 'actions',
              sortable: false,
              render: (row) => (
                <button
                  className="table-button table-button--ghost"
                  type="button"
                  onClick={() =>
                    setStudentForm({
                      studentId: getId(row),
                      studentCode: row.studentCode,
                      fullName: row.fullName,
                      email: row.email || '',
                      phone: row.phone || '',
                      faculty: row.faculty,
                      major: row.major,
                      cohort: row.cohort,
                      administrativeClass: row.administrativeClass || '',
                      academicStatus: row.academicStatus,
                      bankAccount: row.bankAccount || '',
                      createAccount: false
                    })
                  }
                >
                  Sua
                </button>
              )
            }
          ]}
        />

        <DataTable
          title="Danh sach giang vien"
          rows={lecturers}
          searchable
          searchKeys={['lecturerCode', 'fullName', 'department', 'degree', 'workingStatus']}
          columns={[
            { label: 'Ma GV', key: 'lecturerCode' },
            { label: 'Ho ten', key: 'fullName' },
            { label: 'Bo mon', key: 'department' },
            { label: 'Hoc vi', key: 'degree' },
            { label: 'Trang thai', key: 'workingStatus', type: 'status' },
            {
              label: 'Tac vu',
              key: 'actions',
              sortable: false,
              render: (row) => (
                <button
                  className="table-button table-button--ghost"
                  type="button"
                  onClick={() =>
                    setLecturerForm({
                      lecturerId: getId(row),
                      lecturerCode: row.lecturerCode,
                      fullName: row.fullName,
                      email: row.email || '',
                      phone: row.phone || '',
                      department: row.department,
                      degree: row.degree || '',
                      workingStatus: row.workingStatus,
                      createAccount: false
                    })
                  }
                >
                  Sua
                </button>
              )
            }
          ]}
        />
      </div>

      <div className="content-grid content-grid--two">
        <DataTable
          title="Dot dang ky"
          rows={data.registrationPeriods || []}
          searchable
          searchKeys={['name', 'semester.name', 'status']}
          columns={[
            { label: 'Ten dot', key: 'name' },
            { label: 'Hoc ky', key: 'semester.name' },
            { label: 'Bat dau', key: 'startAt', render: (row) => formatDate(row.startAt), sortValue: (row) => row.startAt },
            { label: 'Ket thuc', key: 'endAt', render: (row) => formatDate(row.endAt), sortValue: (row) => row.endAt },
            { label: 'Trang thai', key: 'status', type: 'status' }
          ]}
        />

        <DataTable
          title="Tong hop dang ky"
          rows={data.registrationSummary || []}
          searchable
          searchKeys={['sectionCode', 'courseCode', 'courseName', 'lecturerName', 'status']}
          columns={[
            { label: 'Hoc phan', key: 'sectionCode' },
            { label: 'Mon hoc', key: 'courseName' },
            { label: 'Giang vien', key: 'lecturerName' },
            { label: 'Ti le lap day', key: 'fillRate', render: (row) => `${row.fillRate}%` },
            { label: 'Ngay thi', key: 'examDate', render: (row) => formatDate(row.examDate), sortValue: (row) => row.examDate || '' },
            { label: 'Trang thai', key: 'status', type: 'status' }
          ]}
        />
      </div>
    </div>
  );
}
