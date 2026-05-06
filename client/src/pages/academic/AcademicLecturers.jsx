import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DataTable from '../../components/common/DataTable.jsx';
import { lecturerApi } from '../../api/portalApi.js';

const getId = (item) => item?.id || item?._id || '';

const buildForm = () => ({
  lecturerId: '',
  lecturerCode: '',
  fullName: '',
  email: '',
  phone: '',
  department: 'Cong nghe phan mem',
  degree: 'Thac si',
  workingStatus: 'active',
  createAccount: true
});

const buildFormFromRow = (row) => ({
  lecturerId: getId(row),
  lecturerCode: row.lecturerCode || '',
  fullName: row.fullName || '',
  email: row.email || '',
  phone: row.phone || '',
  department: row.department || '',
  degree: row.degree || '',
  workingStatus: row.workingStatus || 'active',
  createAccount: false
});

export default function AcademicLecturers() {
  const { data, reload, token } = useOutletContext();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(buildForm);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const closeForm = () => {
    setForm(buildForm());
    setIsFormVisible(false);
  };

  const openCreateForm = () => {
    setMessage('');
    setError('');
    setForm(buildForm());
    setIsFormVisible(true);
  };

  const openEditForm = (row) => {
    setMessage('');
    setError('');
    setForm(buildFormFromRow(row));
    setIsFormVisible(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    const { lecturerId, createAccount, ...payload } = form;
    payload.createAccount = createAccount;

    try {
      const requester = lecturerId
        ? () => lecturerApi.updateLecturer(token, lecturerId, payload)
        : () => lecturerApi.createLecturer(token, payload);
      const response = await requester();
      const baseMessage = lecturerId ? 'Đã cập nhật giảng viên.' : 'Đã thêm giảng viên mới.';
      setMessage(
        response?.temporaryPassword
          ? `${baseMessage} Mật khẩu tạm: ${response.temporaryPassword}`
          : baseMessage
      );
      closeForm();
      await reload();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu giảng viên.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    const lecturerId = getId(row);
    if (!lecturerId) {
      return;
    }

    const confirmed = window.confirm(
      `Xóa giảng viên ${row.fullName} (${row.lecturerCode})?\n\n` +
        'Hệ thống sẽ kiểm tra xem giảng viên còn được phân công học phần hay không trước khi xóa.'
    );

    if (!confirmed) {
      return;
    }

    setMessage('');
    setError('');
    setDeletingId(lecturerId);

    try {
      const response = await lecturerApi.deleteLecturer(token, lecturerId);
      if (form.lecturerId === lecturerId) {
        closeForm();
      }
      setMessage(response.message || 'Đã xóa giảng viên.');
      await reload();
    } catch (requestError) {
      setError(requestError.message || 'Không thể xóa giảng viên.');
    } finally {
      setDeletingId('');
    }
  };

  const isEditing = Boolean(form.lecturerId);

  return (
    <div className="page-stack">
      <section className="hero-banner hero-banner--compact">
        <div>
          <span className="hero-chip">Quản lý giảng viên</span>
          <h1>Hồ sơ giảng viên và phân công giảng dạy</h1>
        </div>
      </section>

      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <section className="panel">
        <header className="panel__header">
          <div>
            <h3>{isEditing ? 'Cập nhật giảng viên' : 'Thao tác giảng viên'}</h3>
            <p>
              {isFormVisible
                ? isEditing
                  ? 'Cập nhật thông tin giảng viên đang chọn.'
                  : 'Nhập thông tin để thêm giảng viên mới.'
                : 'Form chỉ mở khi bạn thêm mới hoặc sửa giảng viên.'}
            </p>
          </div>
          <div className="inline-actions">
            {isFormVisible ? (
              <button className="ghost-button" type="button" onClick={closeForm} disabled={submitting}>
                Đóng form
              </button>
            ) : (
              <button className="primary-button" type="button" onClick={openCreateForm}>
                Thêm giảng viên
              </button>
            )}
          </div>
        </header>

        {isFormVisible ? (
          <form className="stack-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                <span>Mã GV</span>
                <input
                  disabled={isEditing}
                  value={form.lecturerCode}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lecturerCode: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Họ tên</span>
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>SĐT</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Bộ môn</span>
                <input
                  value={form.department}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, department: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Học vị</span>
                <input
                  value={form.degree}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, degree: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Trạng thái</span>
                <select
                  value={form.workingStatus}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, workingStatus: event.target.value }))
                  }
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="on_leave">Tạm nghỉ</option>
                  <option value="study_leave">Tạm dừng học tập</option>
                  <option value="retired">Đã nghỉ hưu</option>
                </select>
              </label>
            </div>

            {!isEditing ? (
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.createAccount}
                  onChange={() =>
                    setForm((current) => ({ ...current, createAccount: !current.createAccount }))
                  }
                />
                <span>Tạo tài khoản đăng nhập</span>
              </label>
            ) : null}

            <div className="inline-actions">
              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting
                  ? isEditing
                    ? 'Đang cập nhật...'
                    : 'Đang thêm...'
                  : isEditing
                    ? 'Cập nhật giảng viên'
                    : 'Thêm giảng viên'}
              </button>
              <button className="ghost-button" type="button" onClick={closeForm} disabled={submitting}>
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="stack-form">
            <p className="auth-form__hint">
              Nhấn "Thêm giảng viên" để tạo mới, hoặc bấm "Sửa" trong bảng danh sách để cập nhật
              hồ sơ.
            </p>
          </div>
        )}
      </section>

      <DataTable
        title="Danh sách giảng viên"
        rows={data.lecturers || []}
        searchable
        searchKeys={['lecturerCode', 'fullName', 'department', 'degree', 'workingStatus']}
        columns={[
          { label: 'Mã GV', key: 'lecturerCode' },
          { label: 'Họ tên', key: 'fullName' },
          { label: 'Bộ môn', key: 'department' },
          { label: 'Học vị', key: 'degree' },
          { label: 'TT', key: 'workingStatus', type: 'status' },
          {
            label: 'Tác vụ',
            key: 'actions',
            sortable: false,
            render: (row) => {
              const lecturerId = getId(row);

              return (
                <div className="inline-actions">
                  <button
                    className="table-button"
                    type="button"
                    onClick={() => openEditForm(row)}
                    disabled={submitting || deletingId === lecturerId}
                  >
                    Sửa
                  </button>
                  <button
                    className="table-button table-button--ghost"
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={submitting || deletingId === lecturerId}
                  >
                    {deletingId === lecturerId ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              );
            }
          }
        ]}
      />
    </div>
  );
}
