import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export default function FinanceReceipts() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Biên lai</span><h1>Biên lai điện tử đã phát hành</h1></div></section>
      <DataTable title="Biên lai điện tử" rows={data.receipts || []} searchable searchKeys={['receiptNumber', 'student.studentCode', 'semester.name', 'content']}
        columns={[
          { label: 'Số BL', key: 'receiptNumber' },
          { label: 'Sinh viên', key: 'student.studentCode', render: (r) => `${r.student.studentCode} · ${r.student.fullName}` },
          { label: 'Học kỳ', key: 'semester.name', render: (r) => `${r.semester.name} ${r.semester.academicYear}` },
          { label: 'Số tiền', key: 'amount', render: (r) => formatCurrency(r.amount) },
          { label: 'Ngày PH', key: 'issuedAt', render: (r) => formatDateTime(r.issuedAt), sortValue: (r) => r.issuedAt }
        ]} />
    </div>
  );
}
