import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { studentApi } from '../../api/portalApi.js';

const getId = (item) => item?.id || item?._id || '';
const buildForm = () => ({
  studentId: '', studentCode: '', fullName: '', email: '', phone: '',
  faculty: 'Công nghệ thông tin', major: 'Công nghệ phần mềm',
  cohort: 'K23', administrativeClass: 'D23CQCN01-N',
  academicStatus: 'active', bankAccount: '', createAccount: true
});

export default function AcademicStudents() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(buildForm);

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(''); setError('');
    const { studentId, createAccount, ...payload } = form;
    payload.createAccount = createAccount;
    try {
      const requester = studentId
        ? () => studentApi.updateStudent(token, studentId, payload)
        : () => studentApi.createStudent(token, payload);
      const response = await requester();
      const msg = studentId ? 'Đã cập nhật sinh viên.' : 'Đã thêm sinh viên mới.';
      setMessage(response?.temporaryPassword ? `${msg} Mật khẩu tạm: ${response.temporaryPassword}` : msg);
      setForm(buildForm());
      await reload();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div><span className="hero-chip">Quản lý sinh viên</span><h1>Hồ sơ sinh viên và cấp phát tài khoản</h1></div>
      </section>
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header"><div><h3>{form.studentId ? 'Cập nhật sinh viên' : 'Thêm sinh viên mới'}</h3></div></header>
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label><span>Mã SV</span><input disabled={Boolean(form.studentId)} value={form.studentCode} onChange={(e) => setForm((c) => ({ ...c, studentCode: e.target.value }))} /></label>
            <label><span>Họ tên</span><input value={form.fullName} onChange={(e) => setForm((c) => ({ ...c, fullName: e.target.value }))} /></label>
            <label><span>Email</span><input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} /></label>
            <label><span>SĐT</span><input value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} /></label>
            <label><span>Khoa</span><input value={form.faculty} onChange={(e) => setForm((c) => ({ ...c, faculty: e.target.value }))} /></label>
            <label><span>Ngành</span><input value={form.major} onChange={(e) => setForm((c) => ({ ...c, major: e.target.value }))} /></label>
            <label><span>Khoá</span><input value={form.cohort} onChange={(e) => setForm((c) => ({ ...c, cohort: e.target.value }))} /></label>
            <label><span>Lớp HC</span><input value={form.administrativeClass} onChange={(e) => setForm((c) => ({ ...c, administrativeClass: e.target.value }))} /></label>
          </div>
          <label className="check-row"><input type="checkbox" checked={form.createAccount} onChange={() => setForm((c) => ({ ...c, createAccount: !c.createAccount }))} /><span>Tạo tài khoản đăng nhập</span></label>
          <button className="primary-button" type="submit">{form.studentId ? 'Cập nhật' : 'Thêm sinh viên'}</button>
        </form>
      </section>

      <DataTable title="Danh sách sinh viên" rows={data.students || []} searchable
        searchKeys={['studentCode', 'fullName', 'faculty', 'major', 'cohort', 'academicStatus']}
        columns={[
          { label: 'MSSV', key: 'studentCode' }, { label: 'Họ tên', key: 'fullName' },
          { label: 'Khoa', key: 'faculty' }, { label: 'Ngành', key: 'major' },
          { label: 'Khoá', key: 'cohort' }, { label: 'TT', key: 'academicStatus', type: 'status' },
          { label: '', key: 'actions', sortable: false, render: (row) => (
            <button className="table-button table-button--ghost" type="button" onClick={() =>
              setForm({ studentId: getId(row), studentCode: row.studentCode, fullName: row.fullName, email: row.email || '', phone: row.phone || '', faculty: row.faculty, major: row.major, cohort: row.cohort, administrativeClass: row.administrativeClass || '', academicStatus: row.academicStatus, bankAccount: row.bankAccount || '', createAccount: false })
            }>Sửa</button>
          )}
        ]}
      />
    </div>
  );
}
