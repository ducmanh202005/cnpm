import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export default function AdminAudit() {
  const { data } = useOutletContext();
  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact"><div><span className="hero-chip">Audit log</span><h1>Nhật ký thao tác hệ thống</h1></div></section>
      <DataTable title="Audit log" rows={data.auditLogs} searchable searchKeys={['actor.displayName', 'action', 'subjectType', 'result']}
        columns={[
          { label: 'Người thực hiện', key: 'actor.displayName' },
          { label: 'Hành động', key: 'action' },
          { label: 'Đối tượng', key: 'subjectType' },
          { label: 'Kết quả', key: 'result', type: 'status' },
          { label: 'Thời gian', key: 'createdAt', render: (r) => formatDateTime(r.createdAt), sortValue: (r) => r.createdAt }
        ]} />
    </div>
  );
}
