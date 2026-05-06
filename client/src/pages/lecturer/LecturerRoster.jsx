import { useOutletContext } from 'react-router-dom';

export default function LecturerRoster() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Danh sách lớp</span><h1>Roster sinh viên theo học phần</h1></div></section>
      <section className="panel">
        <header className="panel__header"><div><h3>Danh sách lớp học phần</h3><p>Roster gồm kèm số ghế thi nếu đã xếp lịch.</p></div></header>
        <div className="roster-grid">
          {data.rosters.map((roster) => (
            <article key={roster.sectionId} className="roster-card">
              <h4>{roster.sectionCode}</h4><p>{roster.courseName}</p>
              <ul>
                {roster.students.map((s) => (
                  <li key={s.id || s._id}><strong>{s.studentCode}</strong><span>{s.fullName}{s.seatNumber ? ` · SBD ${s.seatNumber}` : ''}</span></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
