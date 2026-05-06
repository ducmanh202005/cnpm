# CreditHub PTIT

Ung dung MERN mau cho de tai "He thong quan ly dang ky tin chi va thu hoc phi".

## Kien truc

- `client/`: React + Vite, giao dien da vai tro cho Sinh vien, Phong dao tao, Phong tai chinh, Giang vien va Admin.
- `server/`: Express + MongoDB + Mongoose, JWT auth, RBAC, nghiep vu dang ky hoc phan, hoc phi va thanh toan.
- `seed`: du lieu mau de demo nhanh.

## Tinh nang da co

- Dang nhap va phan quyen theo vai tro.
- Quan ly mon hoc, hoc phan, hoc ky va dot dang ky.
- Dang ky, huy dang ky hoc phan co kiem tra tien quyet, gioi han tin chi va xung dot lich.
- Tu dong tinh nghia vu hoc phi theo tin chi, bieu phi va mien giam.
- Ghi nhan thanh toan, sinh bien lai dien tu, theo doi cong no.
- Dashboard bao cao tong quan va workspace rieng theo vai tro.
- Audit log cho cac thao tac nhay cam.

## Cau hinh nhanh

1. Tao file `server/.env` tu `server/.env.example`.
2. Cai dependency:

```bash
npm install
npm install --workspace server
npm install --workspace client
```

3. Seed du lieu mau:

```bash
npm run seed
```

4. Chay ca frontend va backend:

```bash
npm run dev
```

## Tai khoan demo

- `admin1 / Admin@123`
- `daotao1 / Office@123`
- `finance1 / Finance@123`
- `gv001 / Lecturer@123`
- `sv001 / Student@123`

Frontend co san demo fallback, nen ban van xem duoc giao dien ngay ca khi backend chua chay.
"# cnpm" 
