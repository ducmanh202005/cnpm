import { useOutletContext } from 'react-router-dom';

export default function StudentProfile() {
  const { data } = useOutletContext();
  const p = data.profile;
  const rows = [
    ['Mã sinh viên', p.studentCode],
    ['Họ và tên', p.fullName],
    ['Email', p.email || '--'],
    ['Số điện thoại', p.phone || '--'],
    ['Khoa', p.faculty],
    ['Ngành', p.major],
    ['Khoá', p.cohort],
    ['Lớp hành chính', p.administrativeClass],
    ['Trạng thái', p.academicStatus],
    ['Chính sách miễn giảm', `${p.policy?.discountRate || 0}%`],
    ['Tài khoản ngân hàng', p.bankAccount || '--']
  ];

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Thông tin cá nhân</span>
          <h1>{p.fullName}</h1>
          <p>{p.studentCode} · {p.major} · {p.administrativeClass}</p>
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <div><h3>Hồ sơ sinh viên</h3><p>Thông tin cá nhân được quản lý bởi phòng đào tạo.</p></div>
        </header>
        <div className="detail-card">
          {rows.map(([label, value]) => (
            <div key={label} className="detail-card__row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
