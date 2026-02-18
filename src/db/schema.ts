import { integer, uuid, varchar, pgTable, serial, date, time, text, timestamp, pgEnum, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';


export const rolesEnum = pgEnum('role', ['admin', 'manager', 'employee']);
export const users = pgTable('users', {
    userId: uuid("user_id").primaryKey(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    phone: varchar('phone', { length: 11 }),
    username: varchar('username', { length: 50 }).unique().notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    password: varchar('password', { length: 100 }).notNull(),
    role: rolesEnum('role').notNull(),
},
    (table) => ({
        usernameIdx: uniqueIndex('users_username_idx').on(table.username),
        emailIdx: uniqueIndex('users_email_idx').on(table.email),
        roleIDIdx: index('users_role_id_idx').on(table.role, table.userId),
    })
);

export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const employees = pgTable('employees', {
    employeeId: integer('employee_id').primaryKey(),
    designation: varchar('designation', { length: 50 }),
    hireDate: date('hire_date'),
    status: statusEnum('status').default('active').notNull(),
    userId: uuid('user_id')
        .references(() => users.userId, { onDelete: 'cascade' })
        .notNull(),
    departmentId: integer('department_id')
        .references(() => departments.departmentId, { onDelete: 'set null' }),
},
    (table) => ({
        userIdx: uniqueIndex('employees_user_id_idx').on(table.userId),
        departmentIdx: index('employees_department_idx').on(table.departmentId),
        statusIdx: index('employees_status_idx').on(table.status),
    })
);


export const departments = pgTable('departments', {
    departmentId: serial('department_id').primaryKey(),
    departmentName: varchar('department_name', { length: 50 }).notNull(),
    managerId: uuid('manager_id')
        .references(() => users.userId, { onDelete: 'set null' }),
    description: text('description'),
},
    (table) => ({
        managerIdx: index('departments_manager_idx').on(table.managerId),
        nameIdx: uniqueIndex('departments_name_idx').on(table.departmentName),
    })
);


export const addresses = pgTable('addresses', {
    addressId: serial('address_id').primaryKey(),
    division: varchar('division', { length: 50 }).notNull(),
    district: varchar('district', { length: 50 }).notNull(),
    thana: varchar('thana', { length: 50 }).notNull(),
    postCode: varchar('post_code', { length: 10 }).notNull(),
    userId: uuid('user_id').references(() => users.userId, { onDelete: 'cascade' })   
},
    (table) => ({
        userIdx: index('addresses_user_idx').on(table.userId),
    })
)

export const attendanceStatusEnum = pgEnum("Attendance_status_enum", ["Present", "Leave"]);


export const attendance = pgTable('attendance', {
    attendanceId: serial('attendance_id').primaryKey(),
    employeeId: integer('employee_id')
        .references(() => employees.employeeId, { onDelete: 'cascade' })
        .notNull(),
    attendanceDate: date('attendance_date').notNull(),
    checkInTime: time('check_in_time').notNull(),
    checkOutTime: time('check_out_time'),
    status: attendanceStatusEnum('status').notNull(),
    source: varchar("source", { length: 20 }),
},
    (table) => ({
        employeeDateIdx: uniqueIndex('attendance_emp_date_idx')
            .on(table.employeeId, table.attendanceDate),
        statusIdx: index('attendance_status_idx').on(table.status),
        employeeIdx: index('attendance_employee_idx').on(table.employeeId),
        dateIdx: index('attendance_date_idx').on(table.attendanceDate)

    })
);


export const leaveTypes = pgEnum('leave_types', ['casual', 'medical', 'annual'])
export const applicationStatus = pgEnum('application_status', ['pending', 'approved', 'rejected'])

export const leaveApplications = pgTable('leave_applications', {
    leaveId: serial('leave_id').primaryKey(),
    employeeId: integer('employee_id')
        .references(() => employees.employeeId, { onDelete: 'cascade' })
        .notNull(),
    leaveType: leaveTypes('leave_type').notNull(),
    startDate: date('start_date'),
    endDate: date('end_date'),
    totalDays: integer('total_days'),
    status: applicationStatus('status').default('pending').notNull(),
    reason: text('reason'),
    appliedAt: timestamp('applied_at').defaultNow(),
    approvedBy: uuid('approved_by').references(() => users.userId),
},
    (table) => ({
        userIdx: index('leave_user_idx').on(table.employeeId),
        statusIdx: index('leave_status_idx').on(table.status),
        approverIdx: index('leave_approved_by_idx').on(table.approvedBy),

        activeLeaveIdx: index('leave_active_idx').on(table.status, table.startDate, table.endDate, table.employeeId),
        pendingLeaveIdx: index('leave_pending_user_idx').on(table.status, table.employeeId),
        getLeaveIdx: index('idx_leave_filter').on(table.leaveType, table.status, table.leaveId),
        idxEmployeeDateRange: index("idx_leave_employee_date").on(table.employeeId, table.startDate,table.endDate),
    })
);

export const payroll = pgTable('payroll', {
    payrollId: serial('payroll_id').primaryKey(),
    employeeId: integer('employee_id')
        .references(() => employees.employeeId, { onDelete: 'cascade' })
        .notNull(),
    baseSalary: integer('base_salary').notNull(),
    bonus: integer('bonus').default(0),
    deductions: integer('deductions').default(0),
    netSalary: integer('net_salary').notNull(),
    payMonth: date('pay_month').notNull(), // e.g. 2025-01-01
    paidAt: timestamp('paid_at').defaultNow(),
},
    (table) => ({
        empMonthIdx: uniqueIndex('payroll_emp_month_idx')
            .on(table.employeeId, table.payMonth),
        employeeIdx: index('payroll_employee_idx').on(table.employeeId),
    })
);

export const performanceReviews = pgTable('performance_reviews', {
    reviewId: serial('review_id').primaryKey(),
    employeeId: integer('employee_id')
        .references(() => employees.employeeId, { onDelete: 'cascade' })
        .notNull(),
    reviewerId: uuid('reviewer_id')
        .references(() => users.userId)
        .notNull(),
    reviewDate: date('review_date').notNull(),
    score: integer('score').notNull(), // e.g. 1–5
    feedback: text('feedback'),
    createdAt: timestamp('created_at').defaultNow(),
},
    (table) => ({
        empDateIdx: index('performance_emp_date_idx')
            .on(table.employeeId, table.reviewDate),
        reviewerIdx: index('performance_reviewer_idx').on(table.reviewerId),
    })
);


export const passwordResetTokens = pgTable('password_reset_tokens', {
    tokenId: serial('token_id').primaryKey(),
    token: varchar('token', { length: 50 }).notNull(),
    userId: uuid('user_id').references(() => users.userId).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isUsed: boolean('is_used').default(false).notNull()
}) 