export const seedDepartments = [
  {
    code: 'CNTT',
    name: 'Cong nghe thong tin',
    office: 'A1-201',
    headName: 'Nguyen Dinh Quang'
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
  }
];

export const seedCohorts = [
  {
    code: 'K23',
    name: 'Khoa 23',
    intakeYear: 2023,
    expectedGraduationYear: 2027
  }
];

export const seedPrograms = [
  {
    code: 'CTDT-CNPM-K23',
    majorCode: 'CNPM',
    cohortCode: 'K23',
    name: 'Chuong trinh dao tao Cong nghe phan mem K23',
    totalCredits: 150,
    programType: 'standard',
    description: 'Chuong trinh dao tao he chuan cho nganh Cong nghe phan mem.'
  },
  {
    code: 'CTDT-HTTT-K23',
    majorCode: 'HTTT',
    cohortCode: 'K23',
    name: 'Chuong trinh dao tao He thong thong tin K23',
    totalCredits: 148,
    programType: 'standard',
    description: 'Chuong trinh dao tao he chuan cho nganh He thong thong tin.'
  }
];

export const seedAdministrativeClasses = [
  {
    code: 'D23CQCN01-N',
    name: 'D23CQCN01-N',
    size: 48,
    majorCode: 'CNPM',
    cohortCode: 'K23'
  },
  {
    code: 'D23CQHT01-N',
    name: 'D23CQHT01-N',
    size: 45,
    majorCode: 'HTTT',
    cohortCode: 'K23'
  }
];

export const seedPolicies = [
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
  { code: 'H5-401', name: 'H5-401', roomType: 'exam', capacity: 80 },
  { code: 'A3-305', name: 'A3-305', roomType: 'classroom', capacity: 55 },
  { code: 'A3-101', name: 'A3-101', roomType: 'exam', capacity: 70 },
  { code: 'G2-102', name: 'G2-102', roomType: 'classroom', capacity: 45 },
  { code: 'H6-101', name: 'H6-101', roomType: 'classroom', capacity: 40 }
];

export const seedTimeSlots = [
  { code: 'SANG', name: 'Sang', startTime: '07:00', endTime: '11:20' },
  { code: 'CHIEU', name: 'Chieu', startTime: '13:00', endTime: '17:20' },
  { code: 'CA1', name: 'Ca 1', startTime: '07:00', endTime: '08:30' },
  { code: 'CA2', name: 'Ca 2', startTime: '09:00', endTime: '10:30' },
  { code: 'CA3', name: 'Ca 3', startTime: '13:30', endTime: '15:00' },
  { code: 'CA4', name: 'Ca 4', startTime: '15:30', endTime: '17:00' }
];

export const seedSemesters = [
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
    periodCode: 'DOT-HK2-2025',
    name: 'Dot dang ky chinh',
    semesterCode: '2025-2026-HK2',
    startAt: new Date('2026-04-20T00:00:00.000Z'),
    endAt: new Date('2026-05-30T23:59:59.000Z'),
    targetAudience: 'Toan truong',
    status: 'active'
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
    departmentCode: 'CNTT'
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
    departmentCode: 'CNTT'
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
    faculty: 'Cong nghe thong tin',
    description: 'Mo hinh va quy trinh phat trien phan mem.',
    departmentCode: 'CNTT',
    rules: {
      prerequisites: ['INT1306'],
      previousCourses: [],
      corequisites: []
    }
  },
  {
    code: 'DB202',
    name: 'Co so du lieu',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'required',
    faculty: 'Cong nghe thong tin',
    description: 'Mo hinh du lieu va SQL.',
    departmentCode: 'CNTT',
    rules: {
      prerequisites: ['INT1306'],
      previousCourses: [],
      corequisites: []
    }
  },
  {
    code: 'NET205',
    name: 'Mang may tinh',
    credits: 3,
    theoryCredits: 3,
    practiceCredits: 0,
    courseType: 'elective',
    faculty: 'Cong nghe thong tin',
    description: 'Nen tang mang va giao thuc.',
    departmentCode: 'CNTT',
    rules: {
      prerequisites: [],
      previousCourses: [],
      corequisites: []
    }
  },
  {
    code: 'SE320',
    name: 'Kiem thu phan mem',
    credits: 3,
    theoryCredits: 2,
    practiceCredits: 1,
    courseType: 'elective',
    faculty: 'Cong nghe thong tin',
    description: 'Nguyen ly va ky thuat kiem thu.',
    departmentCode: 'CNTT',
    rules: {
      prerequisites: ['SE201'],
      previousCourses: ['DB202'],
      corequisites: []
    }
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
    cohortCode: 'K23',
    classCode: 'D23CQCN01-N',
    programCode: 'CTDT-CNPM-K23',
    policy: {
      code: 'CS10',
      name: 'Ho tro doi tuong uu tien',
      discountRate: 10
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
    courseHistory: [
      {
        courseCode: 'INT1306',
        grade: 'B+',
        passed: true,
        attemptedAt: new Date('2025-06-02T00:00:00.000Z')
      }
    ]
  }
];

export const seedSections = [
  {
    code: 'SE201-01',
    courseCode: 'SE201',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV001',
    capacity: 40,
    minCapacity: 15,
    currentEnrollment: 1,
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
    code: 'DB202-01',
    courseCode: 'DB202',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV002',
    capacity: 45,
    minCapacity: 20,
    currentEnrollment: 0,
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
    code: 'NET205-01',
    courseCode: 'NET205',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV002',
    capacity: 35,
    minCapacity: 15,
    currentEnrollment: 0,
    status: 'open',
    room: 'G2-102',
    schedule: [
      { dayOfWeek: 3, sessionLabel: 'CHIEU', startPeriod: 7, periodCount: 3, room: 'G2-102' },
      { dayOfWeek: 5, sessionLabel: 'CHIEU', startPeriod: 7, periodCount: 3, room: 'G2-102' }
    ]
  },
  {
    code: 'SE320-01',
    courseCode: 'SE320',
    semesterCode: '2025-2026-HK2',
    lecturerCode: 'GV001',
    capacity: 30,
    minCapacity: 12,
    currentEnrollment: 0,
    status: 'open',
    room: 'H6-101',
    schedule: [
      { dayOfWeek: 2, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'H6-101' },
      { dayOfWeek: 4, sessionLabel: 'SANG', startPeriod: 1, periodCount: 3, room: 'H6-101' }
    ]
  }
];

export const seedEnrollments = [
  {
    studentCode: 'B23DCKH080',
    sectionCode: 'SE201-01',
    semesterCode: '2025-2026-HK2',
    status: 'approved'
  }
];

export const seedTuitionRates = [
  {
    rateCode: 'BP-2025-HK2',
    name: 'Bieu phi chuan HK2 2025-2026',
    academicYear: '2025-2026',
    semesterCode: '2025-2026-HK2',
    programType: 'standard',
    pricePerCredit: 780000,
    effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    notes: 'Ap dung cho he dao tao chuan.'
  }
];

export const seedUsers = [
  {
    username: 'admin1',
    password: 'Admin@123',
    displayName: 'He thong quan tri',
    email: 'admin@ptit.edu.vn',
    roles: ['admin'],
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
    roles: ['lecturer']
  },
  {
    username: 'sv001',
    password: 'Student@123',
    displayName: 'Phan Hoai Nam',
    email: 'nam.ph@ptit.edu.vn',
    roles: ['student']
  }
];
