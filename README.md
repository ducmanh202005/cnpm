# CreditHub PTIT

## Tai khoan demo

Sau khi chay seed bang `npm run seed`, ban co the dang nhap nhanh bang cac tai khoan sau:

### Tai khoan he thong

| Vai tro | Username | Password | Ghi chu |
| --- | --- | --- | --- |
| Admin | `admin1` | `Admin@123` | Quan tri he thong |
| Phong dao tao | `daotao1` | `Office@123` | Quan ly mon hoc, hoc phan, sinh vien, bao cao dao tao |
| Phong tai chinh | `finance1` | `Finance@123` | Quan ly hoc phi, thanh toan, bien lai, bao cao doanh thu |

### Tai khoan giang vien

| Username | Password | Ho ten |
| --- | --- | --- |
| `gv001` | `Lecturer@123` | Nguyen Dinh Quang |
| `gv002` | `Lecturer@123` | Tran Mai Huong |
| `gv003` | `Lecturer@123` | Le Van Binh |
| `gv004` | `Lecturer@123` | Tran Thu Ha |

### Tai khoan sinh vien

| Username | Password | Ho ten | Ma sinh vien |
| --- | --- | --- | --- |
| `sv001` | `Student@123` | Phan Hoai Nam | `B23DCKH080` |
| `sv094` | `Student@123` | Nguyen Minh Quan | `B23DCKH094` |
| `sv120` | `Student@123` | Le Thu Linh | `B23DCCN120` |
| `sv155` | `Student@123` | Tran Gia Hoa | `B23DCAT155` |
| `sv188` | `Student@123` | Do Khanh Trang | `B22DCCN188` |
| `sv201` | `Student@123` | Pham Duc Huy | `B24DCDL201` |

Thong tin dang nhap nay duoc seed tu `server/src/data/seedData.js` va chi dung cho demo.

## Mo ta nhanh

Ung dung MERN cho de tai "He thong quan ly dang ky tin chi va thu hoc phi".

## Kien truc

- `client/`: React + Vite, giao dien da vai tro cho Sinh vien, Phong dao tao, Phong tai chinh, Giang vien va Admin.
- `server/`: Express + MongoDB + Mongoose, JWT auth, RBAC, nghiep vu dang ky hoc phan, hoc phi va thanh toan.
- `server/src/data/seedData.js`: du lieu mau phuc vu demo.

## Tinh nang hien tai

- Dang nhap va phan quyen theo vai tro.
- Quan ly mon hoc, hoc phan, hoc ky va dot dang ky.
- Dang ky, huy dang ky hoc phan theo dot dang ky, co kiem tra trung mon, trung lich, gioi han tin chi va phu hop nganh.
- Tu dong tinh nghia vu hoc phi theo tin chi, bieu phi hoc ky va mien giam.
- Ghi nhan thanh toan, sinh bien lai dien tu, theo doi cong no.
- Bao cao dao tao va bao cao doanh thu theo hoc ky.
- Quan ly tai khoan he thong.

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

4. Chay frontend va backend:

```bash
npm run dev
```

Frontend co san giao dien demo, nhung de dung dung nghiep vu thi nen seed va chay ca backend.
