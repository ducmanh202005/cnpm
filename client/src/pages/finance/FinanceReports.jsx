import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function FinanceReports() {
  const { data, semesters } = useOutletContext();
  const [selectedSemesterId, setSelectedSemesterId] = useState(() => String(semesters[0]?._id || 'all'));
  const selectedAll = selectedSemesterId === 'all';

  const filteredLiabilities = (data.liabilities || []).filter((item) => {
    if (selectedAll) {
      return true;
    }
    return String(item.semester?._id) === selectedSemesterId;
  });

  const outstandingRows = filteredLiabilities.filter((item) => item.outstandingAmount > 0);
  const summary = filteredLiabilities.reduce(
    (acc, item) => {
      acc.amountDue += item.amountDue || 0;
      acc.amountPaid += item.amountPaid || 0;
      acc.outstanding += item.outstandingAmount || 0;
      return acc;
    },
    { amountDue: 0, amountPaid: 0, outstanding: 0 }
  );

  const collectionRate = summary.amountDue
    ? Math.round((summary.amountPaid / summary.amountDue) * 100)
    : 0;

  const revenueByMonth = (data.reports?.revenueByMonth || []).filter((item) =>
    selectedAll ? true : item.semesterId === selectedSemesterId
  );

  const revenueBySemester = (data.reports?.revenueBySemester || []).filter((item) =>
    selectedAll ? true : item.id === selectedSemesterId
  );

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Báo cáo tài chính</span>
          <h1>Thống kê doanh thu, công nợ và danh sách sinh viên còn nợ</h1>
          <p>Theo dõi đúng theo học kỳ để phục vụ đối soát học phí và lập báo cáo nội bộ.</p>
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>Bộ lọc học kỳ</h3>
            <p>Chọn một học kỳ cụ thể hoặc xem tổng hợp toàn hệ thống.</p>
          </div>
        </header>
        <label>
          <span>Học kỳ</span>
          <select value={selectedSemesterId} onChange={(event) => setSelectedSemesterId(event.target.value)}>
            <option value="all">Tất cả học kỳ</option>
            {semesters.map((item) => (
              <option key={item._id} value={String(item._id)}>
                {item.name} {item.academicYear}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="stats-grid">
        <StatCard eyebrow="Phải thu" title="Tổng phát sinh" value={formatCurrency(summary.amountDue)} />
        <StatCard eyebrow="Đã thu" title="Đã thanh toán" value={formatCurrency(summary.amountPaid)} />
        <StatCard eyebrow="Công nợ" title="Còn phải thu" value={formatCurrency(summary.outstanding)} />
        <StatCard eyebrow="Tỷ lệ thu" title="Thu hồi" value={`${collectionRate}%`} />
        <StatCard eyebrow="Sinh viên" title="Còn nợ" value={outstandingRows.length} />
      </div>

      <div className="content-grid content-grid--two">
        <DataTable
          title="Doanh thu theo học kỳ"
          rows={revenueBySemester}
          columns={[
            { label: 'Học kỳ', key: 'semesterName' },
            { label: 'Số biên lai', key: 'receiptCount' },
            { label: 'Doanh thu', key: 'amount', render: (row) => formatCurrency(row.amount) }
          ]}
        />

        <DataTable
          title="Doanh thu theo tháng"
          rows={revenueByMonth}
          emptyMessage="Chưa có giao dịch thành công cho bộ lọc hiện tại."
          columns={[
            { label: 'Học kỳ', key: 'semesterName' },
            { label: 'Tháng', key: 'monthLabel' },
            { label: 'Số GD', key: 'transactionCount' },
            { label: 'Tổng thu', key: 'amount', render: (row) => formatCurrency(row.amount) }
          ]}
        />
      </div>

      <DataTable
        title="Danh sách sinh viên còn nợ học phí"
        description="Danh sách phục vụ theo dõi công nợ theo học kỳ."
        rows={outstandingRows}
        searchable
        searchKeys={['student.studentCode', 'student.fullName', 'semester.name', 'status']}
        emptyMessage="Không còn sinh viên nào nợ học phí trong phạm vi đang chọn."
        columns={[
          { label: 'Mã SV', key: 'student.studentCode' },
          { label: 'Họ tên', key: 'student.fullName' },
          { label: 'Học kỳ', key: 'semester.name' },
          { label: 'Phải thu', key: 'amountDue', render: (row) => formatCurrency(row.amountDue) },
          { label: 'Đã thu', key: 'amountPaid', render: (row) => formatCurrency(row.amountPaid) },
          { label: 'Còn nợ', key: 'outstandingAmount', render: (row) => formatCurrency(row.outstandingAmount) },
          { label: 'Trạng thái', key: 'status', type: 'status' }
        ]}
      />
    </div>
  );
}
