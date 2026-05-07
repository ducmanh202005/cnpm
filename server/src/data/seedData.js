export const seedDepartments = [
  {
    code: 'CNTT',
    name: 'Cong nghe thong tin',
    office: 'A1-201',
    headName: 'Nguyen Dinh Quang'
  },
  {
    code: 'ATTT',
    name: 'An toan thong tin',
    office: 'A2-302',
    headName: 'Le Van Binh'
  },
  {
    code: 'KHDL',
    name: 'Khoa hoc du lieu',
    office: 'A3-208',
    headName: 'Tran Thu Ha'
  }
];

export const seedMajors = [
  {
    code: 'CNPM',
    name: 'Cong nghe phan mem',
    departmentCode: 'CNTT'
  },
  {
    code: 'HTTT',
    name: 'He thong thong tin',
    departmentCode: 'CNTT'
  },
  {
    code: 'ATTT',
    name: 'An toan thong tin',
    departmentCode: 'ATTT'
  },
  {
    code: 'KHDL',
    name: 'Khoa hoc du lieu',
    departmentCode: 'KHDL'
  }
];

export const seedCohorts = [
  {
    code: 'K22',
    name: 'Khoa 22',
    intakeYear: 2022,
    expectedGraduationYear: 2026
  },
  {
    code: 'K23',
    name: 'Khoa 23',
    intakeYear: 2023,
    expectedGraduationYear: 2027
  },
  {
    code: 'K24',
    name: 'Khoa 24',
    intakeYear: 2024,
    expectedGraduationYear: 2028
  }
];

export const seedAdministrativeClasses = [
  {
    code: 'D22CQCN01-N',
    name: 'D22CQCN01-N',
    size: 48,
    majorCode: 'CNPM',
    cohortCode: 'K22'
  },
  {
    code: 'D23CQCN01-N',
    name: 'D23CQCN01-N',
    size: 50,
    majorCode: 'CNPM',
    cohortCode: 'K23'
  },
  {
    code: 'D23CQHT01-N',
    name: 'D23CQHT01-N',
    size: 46,
    majorCode: 'HTTT',
    cohortCode: 'K23'
  },
  {
    code: 'D23CQAT01-N',
    name: 'D23CQAT01-N',
    size: 44,
    majorCode: 'ATTT',
    cohortCode: 'K23'
  },
  {
    code: 'D24CQDL01-N',
    name: 'D24CQDL01-N',
    size: 42,
    majorCode: 'KHDL',
    cohortCode: 'K24'
  }
];

export const seedPolicies = [
  {
    code: 'CS25',
    name: 'Ho tro sinh vien chat luong cao',
    discountRate: 25,
    description: 'Mien giam 25 phan tram hoc phi cho mot so doi tuong dac thu.'
  },
  {
    code: 'CS10',
    name: 'Ho tro doi tuong uu tien',
    discountRate: 10,
    description: 'Mien giam 10 phan tram hoc phi cho sinh vien thuoc dien uu tien.'
  },
  {
    code: 'NONE',
    name: 'Khong mien giam',
    discountRate: 0,
    description: 'Khong co chinh sach mien giam hoc phi.'
  }
];

export const seedRooms = [
  { code: 'H5-201', name: 'H5-201', roomType: 'classroom', capacity: 60 },
  { code: 'H5-202', name: 'H5-202', roomType: 'classroom', capacity: 55 },
  { code: 'H5-401', name: 'H5-401', roomType: 'exam', capacity: 80 },
  { code: 'A3-305', name: 'A3-305', roomType: 'classroom', capacity: 55 },
  { code: 'A3-101', name: 'A3-101', roomType: 'exam', capacity: 70 },
  { code: 'G2-102', name: 'G2-102', roomType: 'classroom', capacity: 45 },
  { code: 'H6-101', name: 'H6-101', roomType: 'classroom', capacity: 40 },
  { code: 'H6-203', name: 'H6-203', roomType: 'classroom', capacity: 45 },
  { code: 'B2-204', name: 'B2-204', roomType: 'classroom', capacity: 35 },
  { code: 'B2-501', name: 'B2-501', roomType: 'classroom', capacity: 30 }
];

export const seedSemesters = [
  {
    code: '2025-2026-HK1',
    name: 'Hoc ky 1',
    academicYear: '2025-2026',
    startDate: new Date('2025-09-03T00:00:00.000Z'),
    endDate: new Date('2026-01-15T00:00:00.000Z'),
    registrationDeadline: new Date('2025-08-25T23:59:59.000Z'),
    paymentDeadline: new Date('2025-09-20T23:59:59.000Z'),
    status: 'closed'
  },
  {
    code: '2025-2026-HK2',
    name: 'Hoc ky 2',
    academicYear: '2025-2026',
    startDate: new Date('2026-02-03T00:00:00.000Z'),
    endDate: new Date('2026-06-30T00:00:00.000Z'),
    registrationDeadline: new Date('2026-05-30T23:59:59.000Z'),
    paymentDeadline: new Date('2026-06-15T23:59:59.000Z'),
    status: 'registration_open'
  },
  {
    code: '2026-2027-HK1',
    name: 'Hoc ky 1',
    academicYear: '2026-2027',
    startDate: new Date('2026-09-03T00:00:00.000Z'),
    endDate: new Date('2027-01-15T00:00:00.000Z'),
    registrationDeadline: new Date('2026-08-25T23:59:59.000Z'),
    paymentDeadline: new Date('2026-09-20T23:59:59.000Z'),
    status: 'planning'
  }
];

export const seedRegistrationPeriods = [
  {
    periodCode: 'DOT-HK1-2025',
    name: 'Dot dang ky chinh HK1 2025-2026',
    semesterCode: '2025-2026-HK1',
    startAt: new Date('2025-08-10T00:00:00.000Z'),
    endAt: new Date('2025-08-25T23:59:59.000Z'),
    targetAudience: 'Toan truong',
    status: 'closed'
  },
  {
    periodCode: 'DOT-HK2-2025',
    name: 'Dot dang ky chinh HK2 2025-2026',
    semesterCode: '2025-2026-HK2',
    startAt: new Date('2026-04-20T00:00:00.000Z'),
    endAt: new Date('2026-05-30T23:59:59.000Z'),
    targetAudience: 'Toan truong',
    status: 'active'
  },
  {
    periodCode: 'DOT-HK2-2025-BS',
    name: 'Dot dang ky bo sung HK2 2025-2026',
    semesterCode: '2025-2026-HK2',
    startAt: new Date('2026-06-01T00:00:00.000Z'),
    endAt: new Date('2026-06-03T23:59:59.000Z'),
    targetAudience: 'Sinh vien chua du tin chi',
    status: 'draft'
  }
];

export const seedLecturers = [
  {
    lecturerCode: 'GV001',
    fullName: 'Nguyen Dinh Quang',
    dateOfBirth: new Date('1988-03-12T00:00:00.000Z'),
    gender: 'male',
    citizenId: '011988000001',
    email: 'quang.nd@ptit.edu.vn',
    phone: '0988000001',
    address: 'Ha Noi',
    department: 'Cong nghe thong tin',
    degree: 'Thac si',
    departmentCode: 'CNTT',
    workingStatus: 'active'
  },
  {
    lecturerCode: 'GV002',
    fullName: 'Tran Mai Huong',
    dateOfBirth: new Date('1985-08-21T00:00:00.000Z'),
    gender: 'female',
    citizenId: '011985000002',
    email: 'huong.tm@ptit.edu.vn',
    phone: '0988000002',
    address: 'Ha Noi',
    department: 'Cong nghe thong tin',
    degree: 'Tien si',
    departmentCode: 'CNTT',
    workingStatus: 'active'
  },
  {
    lecturerCode: 'GV003',
    fullName: 'Le Van Binh',
    dateOfBirth: new Date('1984-01-17T00:00:00.000Z'),
    gender: 'male',
    citizenId: '011984000003',
    email: 'binh.lv@ptit.edu.vn',
    phone: '0988000003',
    address: 'Ha Noi',
    department: 'An toan thong tin',
    degree: 'Tien si',
    departmentCode: 'ATTT',
    workingStatus: 'active'
  },
  {
    lecturerCode: 'GV004',
    fullName: 'Tran Thu Ha',
    dateOfBirth: new Date('1987-11-03T00:00:00.000Z'),
    gender: 'female',
    citizenId: '011987000004',
    email: 'ha.tt@ptit.edu.vn',
    phone: '0988000004',
    address: 'Ha Noi',
    department: 'Khoa hoc du lieu',
    degree: 'Thac si',
    departmentCode: 'KHDL',
    workingStatus: 'active'
  }
];

export const seedCourses = [
  {
    code: 'INT1306',
    name: 'Nhap mon lap trinh',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'required',
    eligibleMajorCodes: ['CNPM', 'HTTT', 'ATTT', 'KHDL'],
    faculty: 'Cong nghe thong tin',
    description: 'Mon co so cho sinh vien nam nhat.',
    departmentCode: 'CNTT'
  },
  {
    code: 'SE201',
    name: 'Cong nghe phan mem',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'required',
    eligibleMajorCodes: ['CNPM', 'HTTT'],
    faculty: 'Cong nghe thong tin',
    description: 'Mo hinh va quy trinh phat trien phan mem.',
    departmentCode: 'CNTT'
  },
  {
    code: 'DB202',
    name: 'Co so du lieu',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'required',
    eligibleMajorCodes: ['CNPM', 'HTTT', 'KHDL'],
    faculty: 'Cong nghe thong tin',
    description: 'Mo hinh du lieu va SQL.',
    departmentCode: 'CNTT'
  },
  {
    code: 'WEB210',
    name: 'Phat trien ung dung web',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'required',
    eligibleMajorCodes: ['CNPM', 'HTTT'],
    faculty: 'Cong nghe thong tin',
    description: 'Nen tang phat trien web full stack.',
    departmentCode: 'CNTT'
  },
  {
    code: 'UX301',
    name: 'Tuong tac nguoi may',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'elective',
    eligibleMajorCodes: ['CNPM', 'HTTT'],
    faculty: 'Cong nghe thong tin',
    description: 'Nguyen ly thiet ke trai nghiem nguoi dung.',
    departmentCode: 'CNTT'
  },
  {
    code: 'NET205',
    name: 'Mang may tinh',
    credits: 3,
    theoryCredits: 3,
    practiceCredits: 0,
    courseType: 'elective',
    eligibleMajorCodes: ['CNPM', 'HTTT'],
    faculty: 'Cong nghe thong tin',
    description: 'Nen tang mang va giao thuc.',
    departmentCode: 'CNTT'
  },
  {
    code: 'SEC220',
    name: 'An toan he thong',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'required',
    eligibleMajorCodes: ['ATTT'],
    faculty: 'An toan thong tin',
    description: 'Nhap mon bao mat he thong va ung dung.',
    departmentCode: 'ATTT'
  },
  {
    code: 'API312',
    name: 'Lap trinh API',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'elective',
    eligibleMajorCodes: ['CNPM', 'HTTT'],
    faculty: 'Cong nghe thong tin',
    description: 'Xay dung va tich hop API backend.',
    departmentCode: 'CNTT'
  },
  {
    code: 'SE320',
    name: 'Kiem thu phan mem',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'elective',
    eligibleMajorCodes: ['CNPM'],
    faculty: 'Cong nghe thong tin',
    description: 'Nguyen ly va ky thuat kiem thu phan mem.',
    departmentCode: 'CNTT'
  },
  {
    code: 'PM330',
    name: 'Quan ly du an phan mem',
    credits: 4,
    theoryCredits: 3,
    practiceCredits: 1,
    courseType: 'required',
    eligibleMajorCodes: ['CNPM'],
    faculty: 'Cong nghe thong tin',
    description: 'Quan ly tien do, nhan su va rui ro du an.',
    departmentCode: 'CNTT'
  },
  {
    code: 'TEST340',
    name: 'Tu dong hoa kiem thu',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'elective',
    eligibleMajorCodes: ['CNPM'],
    faculty: 'Cong nghe thong tin',
    description: 'Thuc hanh kiem thu tu dong.',
    departmentCode: 'CNTT'
  },
  {
    code: 'ML205',
    name: 'Co so hoc may',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'elective',
    eligibleMajorCodes: ['KHDL'],
    faculty: 'Khoa hoc du lieu',
    description: 'Nhap mon hoc may va ung dung.',
    departmentCode: 'KHDL'
  }
];

export const seedStudents = [
  {
    studentCode: 'B23DCKH080',
    fullName: 'Phan Hoai Nam',
    dateOfBirth: new Date('2005-07-01T00:00:00.000Z'),
    gender: 'male',
    citizenId: '001205001001',
    email: 'nam.ph@ptit.edu.vn',
    phone: '0911111111',
    address: 'Ha Noi',
    faculty: 'Cong nghe thong tin',
    major: 'Cong nghe phan mem',
    cohort: 'K23',
    administrativeClass: 'D23CQCN01-N',
    academicStatus: 'active',
    programType: 'standard',
    bankAccount: '1500206224197',
    departmentCode: 'CNTT',
    majorCode: 'CNPM',
    studyMajors: [
      { code: 'CNPM', name: 'Cong nghe phan mem' },
      { code: 'HTTT', name: 'He thong thong tin' }
    ],
    cohortCode: 'K23',
    classCode: 'D23CQCN01-N',
    programCode: 'CTDT-CNPM-K23',
    policy: {
      code: 'CS10',
      name: 'Ho tro doi tuong uu tien',
      discountRate: 10
    },
    creditLimits: {
      minCredits: 12,
      maxCredits: 18
    },
    courseHistory: [
      {
        courseCode: 'INT1306',
        grade: 'A',
        passed: true,
        attemptedAt: new Date('2025-06-02T00:00:00.000Z')
      }
    ]
  },
  {
    studentCode: 'B23DCKH094',
    fullName: 'Nguyen Minh Quan',
    dateOfBirth: new Date('2005-11-15T00:00:00.000Z'),
    gender: 'male',
    citizenId: '001205001002',
    email: 'quan.nm@ptit.edu.vn',
    phone: '0922222222',
    address: 'Hai Duong',
    faculty: 'Cong nghe thong tin',
    major: 'He thong thong tin',
    cohort: 'K23',
    administrativeClass: 'D23CQHT01-N',
    academicStatus: 'active',
    programType: 'standard',
    bankAccount: '1500206224198',
    departmentCode: 'CNTT',
    majorCode: 'HTTT',
    cohortCode: 'K23',
    classCode: 'D23CQHT01-N',
    programCode: 'CTDT-HTTT-K23',
    policy: {
      code: 'NONE',
      name: 'Khong mien giam',
      discountRate: 0
    },
    creditLimits: {
      minCredits: 12,
      maxCredits: 24
    },
    courseHistory: [
      {
        courseCode: 'INT1306',
        grade: 'B+',
        passed: true,
        attemptedAt: new Date('2025-06-02T00:00:00.000Z')
      }
    ]
  },
  {
    studentCode: 'B23DCCN120',
    fullName: 'Le Thu Linh',
    dateOfBirth: new Date('2005-03-19T00:00:00.000Z'),
    gender: 'female',
    citizenId: '001205001003',
    email: 'linh.lt@ptit.edu.vn',
    phone: '0933333333',
    address: 'Bac Ninh',
    faculty: 'Cong nghe thong tin',
    major: 'Cong nghe phan mem',
    cohort: 'K23',
    administrativeClass: 'D23CQCN01-N',
    academicStatus: 'active',
    programType: 'high_quality',
    bankAccount: '1500206224201',
    departmentCode: 'CNTT',
    majorCode: 'CNPM',
    cohortCode: 'K23',
    classCode: 'D23CQCN01-N',
    programCode: 'CTDT-CNPM-K23-CLC',
    policy: {
      code: 'CS25',
      name: 'Ho tro sinh vien chat luong cao',
      discountRate: 25
    },
    creditLimits: {
      minCredits: 12,
      maxCredits: 24
    },
    courseHistory: [
      {
        courseCode: 'INT1306',
        grade: 'A',
        passed: true,
        attemptedAt: new Date('2025-06-02T00:00:00.000Z')
      },
      {
        courseCode: 'SE201',
        grade: 'A',
        passed: true,
        attemptedAt: new Date('2025-12-28T00:00:00.000Z')
      },
      {
        courseCode: 'DB202',
        grade: 'A',
        passed: true,
        attemptedAt: new Date('2025-12-28T00:00:00.000Z')
      },
      {
        courseCode: 'WEB210',
        grade: 'B+',
        passed: true,
        attemptedAt: new Date('2025-12-28T00:00:00.000Z')
      }
    ]
  },
  {
    studentCode: 'B23DCAT155',
    fullName: 'Tran Gia Hoa',
    dateOfBirth: new Date('2005-10-05T00:00:00.000Z'),
    gender: 'female',
    citizenId: '001205001004',
    email: 'hoa.tg@ptit.edu.vn',
    phone: '0944444444',
    address: 'Thai Binh',
    faculty: 'An toan thong tin',
    major: 'An toan thong tin',
    cohort: 'K23',
    administrativeClass: 'D23CQAT01-N',
    academicStatus: 'active',
    programType: 'standard',
    bankAccount: '1500206224202',
    departmentCode: 'ATTT',
    majorCode: 'ATTT',
    cohortCode: 'K23',
    classCode: 'D23CQAT01-N',
    policy: {
      code: 'NONE',
      name: 'Khong mien giam',
      discountRate: 0
    },
    creditLimits: {
      minCredits: 12,
      maxCredits: 21
    },
    courseHistory: [
      {
        courseCode: 'INT1306',
        grade: 'B',
        passed: true,
        attemptedAt: new Date('2025-06-02T00:00:00.000Z')
      }
    ]
  },
  {
    studentCode: 'B22DCCN188',
    fullName: 'Do Khanh Trang',
    dateOfBirth: new Date('2004-04-09T00:00:00.000Z'),
    gender: 'female',
    citizenId: '001204001005',
    email: 'trang.dk@ptit.edu.vn',
    phone: '0955555555',
    address: 'Nam Dinh',
    faculty: 'Cong nghe thong tin',
    major: 'Cong nghe phan mem',
    cohort: 'K22',
    administrativeClass: 'D22CQCN01-N',
    academicStatus: 'leave',
    programType: 'standard',
    bankAccount: '1500206224203',
    departmentCode: 'CNTT',
    majorCode: 'CNPM',
    cohortCode: 'K22',
    classCode: 'D22CQCN01-N',
    policy: {
      code: 'CS10',
      name: 'Ho tro doi tuong uu tien',
      discountRate: 10
    },
    creditLimits: {
      minCredits: 9,
      maxCredits: 18
    },
    courseHistory: [
      {
        courseCode: 'INT1306',
        grade: 'B+',
        passed: true,
        attemptedAt: new Date('2024-06-02T00:00:00.000Z')
      },
      {
        courseCode: 'SE201',
        grade: 'B',
        passed: true,
        attemptedAt: new Date('2024-12-28T00:00:00.000Z')
      }
    ]
  },
  {
    studentCode: 'B24DCDL201',
    fullName: 'Pham Duc Huy',
    dateOfBirth: new Date('2006-02-14T00:00:00.000Z'),
    gender: 'male',
    citizenId: '001206001006',
    email: 'huy.pd@ptit.edu.vn',
    phone: '0966666666',
    address: 'Ninh Binh',
    faculty: 'Khoa hoc du lieu',
    major: 'Khoa hoc du lieu',
    cohort: 'K24',
    administrativeClass: 'D24CQDL01-N',
    academicStatus: 'active',
    programType: 'standard',
    bankAccount: '1500206224204',
    departmentCode: 'KHDL',
    majorCode: 'KHDL',
    cohortCode: 'K24',
    classCode: 'D24CQDL01-N',
    policy: {
      code: 'NONE',
      name: 'Khong mien giam',
      discountRate: 0
    },
    creditLimits: {
      minCredits: 12,
      maxCredits: 20
    },
    courseHistory: []
  }
];

export const seedSections = [
  {
    code: 'SE201-01',
    courseCode: 'SE201',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV001',
    capacity: 45,
    minCapacity: 15,
    status: 'open',
    room: 'H5-201',
    schedule: [
      { dayOfWeek: 3, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'H5-201' },
      { dayOfWeek: 5, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'H5-201' }
    ],
    exam: {
      examDate: new Date('2026-06-25T01:30:00.000Z'),
      room: 'H5-401',
      sessionLabel: 'CA1',
      durationMinutes: 90,
      format: 'written',
      notes: 'Thi tap trung tai co so Ha Dong'
    }
  },
  {
    code: 'SE201-02',
    courseCode: 'SE201',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV002',
    capacity: 40,
    minCapacity: 15,
    status: 'open',
    room: 'H5-202',
    schedule: [
      { dayOfWeek: 2, sessionLabel: 'TOI', startPeriod: 10, periodCount: 3, room: 'H5-202' },
      { dayOfWeek: 4, sessionLabel: 'TOI', startPeriod: 10, periodCount: 3, room: 'H5-202' }
    ]
  },
  {
    code: 'DB202-01',
    courseCode: 'DB202',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV002',
    capacity: 50,
    minCapacity: 20,
    status: 'open',
    room: 'A3-305',
    schedule: [
      { dayOfWeek: 4, sessionLabel: 'CHIEU', startPeriod: 4, periodCount: 3, room: 'A3-305' },
      { dayOfWeek: 6, sessionLabel: 'CHIEU', startPeriod: 4, periodCount: 3, room: 'A3-305' }
    ],
    exam: {
      examDate: new Date('2026-06-27T06:30:00.000Z'),
      room: 'A3-101',
      sessionLabel: 'CA3',
      durationMinutes: 60,
      format: 'multiple_choice'
    }
  },
  {
    code: 'WEB210-01',
    courseCode: 'WEB210',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV001',
    capacity: 40,
    minCapacity: 15,
    status: 'open',
    room: 'G2-102',
    schedule: [
      { dayOfWeek: 2, sessionLabel: 'CHIEU', startPeriod: 7, periodCount: 3, room: 'G2-102' },
      { dayOfWeek: 4, sessionLabel: 'CHIEU', startPeriod: 7, periodCount: 3, room: 'G2-102' }
    ]
  },
  {
    code: 'UX301-01',
    courseCode: 'UX301',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV003',
    capacity: 35,
    minCapacity: 12,
    status: 'open',
    room: 'H6-101',
    schedule: [
      { dayOfWeek: 3, sessionLabel: 'CHIEU', startPeriod: 7, periodCount: 3, room: 'H6-101' },
      { dayOfWeek: 6, sessionLabel: 'SANG', startPeriod: 7, periodCount: 3, room: 'H6-101' }
    ]
  },
  {
    code: 'NET205-01',
    courseCode: 'NET205',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV004',
    capacity: 30,
    minCapacity: 10,
    status: 'open',
    room: 'B2-204',
    schedule: [
      { dayOfWeek: 2, sessionLabel: 'TOI', startPeriod: 10, periodCount: 3, room: 'B2-204' },
      { dayOfWeek: 5, sessionLabel: 'TOI', startPeriod: 10, periodCount: 3, room: 'B2-204' }
    ]
  },
  {
    code: 'API312-01',
    courseCode: 'API312',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV002',
    capacity: 30,
    minCapacity: 12,
    status: 'open',
    room: 'H6-203',
    schedule: [
      { dayOfWeek: 3, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'H6-203' },
      { dayOfWeek: 5, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'H6-203' }
    ]
  },
  {
    code: 'SE320-01',
    courseCode: 'SE320',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV001',
    capacity: 25,
    minCapacity: 12,
    status: 'open',
    room: 'B2-501',
    schedule: [
      { dayOfWeek: 2, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'B2-501' },
      { dayOfWeek: 4, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'B2-501' }
    ]
  },
  {
    code: 'PM330-01',
    courseCode: 'PM330',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV003',
    capacity: 25,
    minCapacity: 10,
    status: 'open',
    room: 'H5-201',
    schedule: [
      { dayOfWeek: 6, sessionLabel: 'SANG', startPeriod: 1, periodCount: 4, room: 'H5-201' }
    ]
  },
  {
    code: 'SEC220-01',
    courseCode: 'SEC220',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV003',
    capacity: 2,
    minCapacity: 2,
    status: 'full',
    room: 'A3-101',
    schedule: [
      { dayOfWeek: 7, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'A3-101' }
    ]
  },
  {
    code: 'TEST340-01',
    courseCode: 'TEST340',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV001',
    capacity: 20,
    minCapacity: 8,
    status: 'open',
    room: 'H5-202',
    schedule: [
      { dayOfWeek: 7, sessionLabel: 'CHIEU', startPeriod: 4, periodCount: 3, room: 'H5-202' }
    ]
  },
  {
    code: 'ML205-01',
    courseCode: 'ML205',
    semesterCode: '2026-2027-HK1',
    lecturerCode: 'GV004',
    capacity: 35,
    minCapacity: 12,
    status: 'pending',
    room: 'A3-305',
    schedule: [
      { dayOfWeek: 3, sessionLabel: 'CHIEU', startPeriod: 4, periodCount: 3, room: 'A3-305' },
      { dayOfWeek: 5, sessionLabel: 'CHIEU', startPeriod: 4, periodCount: 3, room: 'A3-305' }
    ]
  }
];

export const seedEnrollments = [
  {
    studentCode: 'B23DCKH080',
    sectionCode: 'SE201-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCKH080',
    sectionCode: 'DB202-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCKH080',
    sectionCode: 'WEB210-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCKH080',
    sectionCode: 'UX301-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCKH080',
    sectionCode: 'NET205-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCKH094',
    sectionCode: 'SEC220-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCKH094',
    sectionCode: 'TEST340-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCCN120',
    sectionCode: 'SEC220-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCCN120',
    sectionCode: 'PM330-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B23DCCN120',
    sectionCode: 'API312-01',
    semesterCode: '2025-2026-HK2',
    status: 'pending'
  },
  {
    studentCode: 'B23DCAT155',
    sectionCode: 'SE201-02',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  },
  {
    studentCode: 'B22DCCN188',
    sectionCode: 'NET205-01',
    semesterCode: '2025-2026-HK2',
    status: 'cancelled'
  },
  {
    studentCode: 'B24DCDL201',
    sectionCode: 'ML205-01',
    semesterCode: '2026-2027-HK1',
    status: 'rejected'
  }
];

export const seedTuitionRates = [
  {
    rateCode: 'BP-2025-HK1-STD',
    name: 'Bieu phi he chuan HK1 2025-2026',
    academicYear: '2025-2026',
    semesterCode: '2025-2026-HK1',
    programType: 'standard',
    pricePerCredit: 760000,
    effectiveFrom: new Date('2025-08-01T00:00:00.000Z'),
    notes: 'Ap dung cho he dao tao chuan.'
  },
  {
    rateCode: 'BP-2025-HK1-HQ',
    name: 'Bieu phi chat luong cao HK1 2025-2026',
    academicYear: '2025-2026',
    semesterCode: '2025-2026-HK1',
    programType: 'high_quality',
    pricePerCredit: 960000,
    effectiveFrom: new Date('2025-08-01T00:00:00.000Z'),
    notes: 'Ap dung cho he chat luong cao.'
  },
  {
    rateCode: 'BP-2025-HK2-STD',
    name: 'Bieu phi he chuan HK2 2025-2026',
    academicYear: '2025-2026',
    semesterCode: '2025-2026-HK2',
    programType: 'standard',
    pricePerCredit: 780000,
    effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    notes: 'Ap dung cho he dao tao chuan.'
  },
  {
    rateCode: 'BP-2025-HK2-HQ',
    name: 'Bieu phi chat luong cao HK2 2025-2026',
    academicYear: '2025-2026',
    semesterCode: '2025-2026-HK2',
    programType: 'high_quality',
    pricePerCredit: 980000,
    effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    notes: 'Ap dung cho he chat luong cao.'
  },
  {
    rateCode: 'BP-2026-HK1-STD',
    name: 'Bieu phi he chuan HK1 2026-2027',
    academicYear: '2026-2027',
    semesterCode: '2026-2027-HK1',
    programType: 'standard',
    pricePerCredit: 820000,
    effectiveFrom: new Date('2026-08-01T00:00:00.000Z'),
    notes: 'Ap dung cho he dao tao chuan.'
  },
  {
    rateCode: 'BP-2026-HK1-HQ',
    name: 'Bieu phi chat luong cao HK1 2026-2027',
    academicYear: '2026-2027',
    semesterCode: '2026-2027-HK1',
    programType: 'high_quality',
    pricePerCredit: 1050000,
    effectiveFrom: new Date('2026-08-01T00:00:00.000Z'),
    notes: 'Ap dung cho he chat luong cao.'
  }
];

export const seedPayments = [
  {
    studentCode: 'B23DCKH080',
    semesterCode: '2025-2026-HK2',
    amount: 3000000,
    method: 'bank_transfer',
    status: 'success',
    gatewayMessage: 'Seed partial payment via bank transfer'
  },
  {
    studentCode: 'B23DCKH080',
    semesterCode: '2025-2026-HK2',
    amount: 2000000,
    method: 'momo',
    status: 'success',
    gatewayMessage: 'Seed partial payment via momo'
  },
  {
    studentCode: 'B23DCKH094',
    semesterCode: '2025-2026-HK2',
    amount: 4680000,
    method: 'vnpay',
    status: 'success',
    gatewayMessage: 'Seed full payment via VNPay'
  },
  {
    studentCode: 'B23DCCN120',
    semesterCode: '2025-2026-HK2',
    amount: 2000000,
    method: 'cash',
    status: 'success',
    gatewayMessage: 'Seed partial cash payment'
  },
  {
    studentCode: 'B23DCAT155',
    semesterCode: '2025-2026-HK2',
    amount: 1000000,
    method: 'vnpay',
    status: 'failed',
    gatewayMessage: 'Seed failed payment'
  }
];

export const seedUsers = [
  {
    username: 'admin1',
    password: 'Admin@123',
    displayName: 'He thong quan tri',
    email: 'admin@ptit.edu.vn',
    roles: ['admin'],
    linkedModel: 'Staff',
    staffUnit: 'Van phong so'
  },
  {
    username: 'daotao1',
    password: 'Office@123',
    displayName: 'Phong Dao tao',
    email: 'daotao@ptit.edu.vn',
    roles: ['academic_office'],
    linkedModel: 'Staff',
    staffUnit: 'Phong Dao tao'
  },
  {
    username: 'finance1',
    password: 'Finance@123',
    displayName: 'Phong Tai chinh',
    email: 'finance@ptit.edu.vn',
    roles: ['finance_office'],
    linkedModel: 'Staff',
    staffUnit: 'Phong Tai chinh'
  },
  {
    username: 'gv001',
    password: 'Lecturer@123',
    displayName: 'Nguyen Dinh Quang',
    email: 'quang.nd@ptit.edu.vn',
    roles: ['lecturer'],
    linkedModel: 'Lecturer',
    linkedCode: 'GV001'
  },
  {
    username: 'gv002',
    password: 'Lecturer@123',
    displayName: 'Tran Mai Huong',
    email: 'huong.tm@ptit.edu.vn',
    roles: ['lecturer'],
    linkedModel: 'Lecturer',
    linkedCode: 'GV002'
  },
  {
    username: 'gv003',
    password: 'Lecturer@123',
    displayName: 'Le Van Binh',
    email: 'binh.lv@ptit.edu.vn',
    roles: ['lecturer'],
    linkedModel: 'Lecturer',
    linkedCode: 'GV003'
  },
  {
    username: 'gv004',
    password: 'Lecturer@123',
    displayName: 'Tran Thu Ha',
    email: 'ha.tt@ptit.edu.vn',
    roles: ['lecturer'],
    linkedModel: 'Lecturer',
    linkedCode: 'GV004'
  },
  {
    username: 'sv001',
    password: 'Student@123',
    displayName: 'Phan Hoai Nam',
    email: 'nam.ph@ptit.edu.vn',
    roles: ['student'],
    linkedModel: 'Student',
    linkedCode: 'B23DCKH080'
  },
  {
    username: 'sv094',
    password: 'Student@123',
    displayName: 'Nguyen Minh Quan',
    email: 'quan.nm@ptit.edu.vn',
    roles: ['student'],
    linkedModel: 'Student',
    linkedCode: 'B23DCKH094'
  },
  {
    username: 'sv120',
    password: 'Student@123',
    displayName: 'Le Thu Linh',
    email: 'linh.lt@ptit.edu.vn',
    roles: ['student'],
    linkedModel: 'Student',
    linkedCode: 'B23DCCN120'
  },
  {
    username: 'sv155',
    password: 'Student@123',
    displayName: 'Tran Gia Hoa',
    email: 'hoa.tg@ptit.edu.vn',
    roles: ['student'],
    linkedModel: 'Student',
    linkedCode: 'B23DCAT155'
  },
  {
    username: 'sv188',
    password: 'Student@123',
    displayName: 'Do Khanh Trang',
    email: 'trang.dk@ptit.edu.vn',
    roles: ['student'],
    linkedModel: 'Student',
    linkedCode: 'B22DCCN188'
  },
  {
    username: 'sv201',
    password: 'Student@123',
    displayName: 'Pham Duc Huy',
    email: 'huy.pd@ptit.edu.vn',
    roles: ['student'],
    linkedModel: 'Student',
    linkedCode: 'B24DCDL201'
  }
];
