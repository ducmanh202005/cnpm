import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import StatCard from '../../components/common/StatCard.jsx';

export default function AcademicReports() {
  const { data } = useOutletContext();
  const reports = data.academicReportsBySemester || [];
  const [selectedSemesterId, setSelectedSemesterId] = useState(
    () => String(reports[0]?.semester?._id || '')
  );

  const selectedReport =
    reports.find((item) => String(item.semester._id) === selectedSemesterId) || reports[0] || null;

  if (!selectedReport) {
    return (
      <div className="page-stack">
        <div className="form-error">Chưa có dữ liệu báo cáo đào tạo.</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Báo cáo đào tạo</span>
          <h1>Thống kê đăng ký học phần theo từng học kỳ</h1>
          <p>Theo dõi sĩ số, tỷ lệ lấp đầy, học phần có nguy cơ bị hủy và sinh viên chưa đăng ký.</p>
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>Bộ lọc học kỳ</h3>
            <p>Chọn học kỳ để xem đúng báo cáo tổng hợp theo đặc tả nghiệp vụ.</p>
          </div>
        </header>
        <label>
          <span>Học kỳ</span>
          <select value={selectedSemesterId} onChange={(event) => setSelectedSemesterId(event.target.value)}>
            {reports.map((item) => (
              <option key={item.semester._id} value={String(item.semester._id)}>
                {item.semester.name} {item.semester.academicYear}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="stats-grid">
        <StatCard eyebrow="Học phần" title="Tổng số lớp mở" value={selectedReport.summary.totalSections} />
        <StatCard eyebrow="Đăng ký" title="Lượt đăng ký" value={selectedReport.summary.totalRegistrations} />
        <StatCard eyebrow="Lấp đầy" title="Tỷ lệ trung bình" value={`${selectedReport.summary.averageFillRate}%`} />
        <StatCard eyebrow="Cảnh báo" title="Nguy cơ bị hủy" value={selectedReport.summary.riskySectionCount} />
        <StatCard
          eyebrow="Sinh viên"
          title="Chưa đăng ký"
          value={selectedReport.summary.studentsWithoutEnrollmentCount}
        />
      </div>

      <DataTable
        title="Tình hình học phần mở"
        description="Danh sách học phần và tỷ lệ lấp đầy trong học kỳ được chọn."
        rows={selectedReport.sectionUtilization}
        searchable
        searchKeys={['sectionCode', 'courseCode', 'courseName', 'lecturerName', 'status']}
        columns={[
          { label: 'Mã HP', key: 'sectionCode' },
          { label: 'Mã môn', key: 'courseCode' },
          { label: 'Tên môn', key: 'courseName' },
          { label: 'Giảng viên', key: 'lecturerName' },
          { label: 'ĐKTT', key: 'currentEnrollment' },
          { label: 'Tối thiểu', key: 'minCapacity' },
          { label: 'Tối đa', key: 'capacity' },
          { label: 'Lấp đầy', key: 'fillRate', render: (row) => `${row.fillRate}%` },
          { label: 'Trạng thái', key: 'status', type: 'status' }
        ]}
      />

      <div className="content-grid content-grid--two">
        <DataTable
          title="Học phần có nguy cơ bị hủy"
          rows={selectedReport.riskySections}
          emptyMessage="Không có học phần nào đang ở dưới sĩ số tối thiểu."
          columns={[
            { label: 'Mã HP', key: 'sectionCode' },
            { label: 'Tên môn', key: 'courseName' },
            { label: 'Đang đăng ký', key: 'currentEnrollment' },
            { label: 'Tối thiểu', key: 'minCapacity' },
            { label: 'Lấp đầy', key: 'fillRate', render: (row) => `${row.fillRate}%` }
          ]}
        />

        <DataTable
          title="Sinh viên chưa đăng ký học phần"
          rows={selectedReport.studentsWithoutEnrollment}
          searchable
          searchKeys={['studentCode', 'fullName', 'major', 'administrativeClass']}
          emptyMessage="Tất cả sinh viên đang học đã có đăng ký trong học kỳ này."
          columns={[
            { label: 'Mã SV', key: 'studentCode' },
            { label: 'Họ tên', key: 'fullName' },
            { label: 'Ngành', key: 'major' },
            { label: 'Lớp HC', key: 'administrativeClass' }
          ]}
        />
      </div>
    </div>
  );
}
