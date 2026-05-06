import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function FinanceLiabilities() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Công nợ học phí</span><h1>Danh sách công nợ sinh viên</h1></div></section>
      <DataTable title="Công nợ học phí" rows={data.liabilities} searchable searchKeys={['student.studentCode', 'student.fullName', 'semester.name', 'status']}
        columns={[
          { label: 'Sinh viên', key: 'student.studentCode', render: (r) => `${r.student.studentCode} · ${r.student.fullName}` },
          { label: 'Học kỳ', key: 'semester.name', render: (r) => `${r.semester.name} ${r.semester.academicYear}` },
          { label: 'Phải nộp', key: 'amountDue', render: (r) => formatCurrency(r.amountDue) },
          { label: 'Đã nộp', key: 'amountPaid', render: (r) => formatCurrency(r.amountPaid) },
          { label: 'Còn nợ', key: 'outstandingAmount', render: (r) => formatCurrency(r.outstandingAmount) },
          { label: 'Hạn nộp', key: 'dueDate', render: (r) => formatDate(r.dueDate), sortValue: (r) => r.dueDate },
          { label: 'TT', key: 'status', type: 'status' }
        ]} />
    </div>
  );
}
