import { integer, varchar, pgTable, serial, date, time, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('role', ['admin', 'manager', 'employee']);
export const users = pgTable('users', {
    userId: varchar('user_id', { length: 50 }).primaryKey(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    phone: varchar('phone', { length: 11 }),
    username: varchar('username', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: varchar('password', { length: 100 }).notNull(),
    role: rolesEnum('role').notNull()
});

export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const employees = pgTable('employees', {
    employeeId: integer('employee_id').primaryKey(),
    designation: varchar('designation', { length: 50 }),
    hireDate: date('hire_date'),
    status: statusEnum('status').default('active').notNull(),
    userId: varchar('user_id', { length: 50 }).references(() => users.userId, { onDelete: 'cascade' }).notNull(),
    departmentId: integer('department_id').references(() => departments.departmentId, { onDelete: 'set null' })
});

export const departments = pgTable('departments', {
    departmentId: serial('department_id').primaryKey(),
    departmentName: varchar('department_name', { length: 50 }).notNull(),
    managerId: varchar('manager_id', { length: 50 }).references(() => users.userId, { onDelete: 'set null' }),
    description: text('description')
});

export const addresses = pgTable('addresses', {
    addressId: serial('address_id').primaryKey(),
    division: varchar('division', { length: 50 }).notNull(),
    district: varchar('district', { length: 50 }).notNull(),
    thana: varchar('thana', { length: 50 }).notNull(),
    postCode: varchar('post_code', { length: 10 }).notNull(),
    userId: varchar('user_id', { length: 50 }).references(() => users.userId, { onDelete: 'cascade' })
})

export const userTokens = pgTable('user_tokens', {
    token: varchar('token', { length: 50 }).primaryKey(),
    userId: varchar('user_id', { length: 50 }).references(() => users.userId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export const attendanceStatusEnum = pgEnum("Attendance_status_enum", ["Present", "Absent", "Leave"]);

// Define the Attendance Table
export const attendance = pgTable("Attendance", {
    attendanceId: serial("attendance_id").primaryKey(),
    employeeId: integer("employee_id").references(()=>employees.employeeId,{ onDelete: 'cascade' }).notNull(),
    attendanceDate: date("attendance_date").notNull(),
    checkInTime: time("check_in_time"),
    checkOutTime: time("check_out_time"),
    status: attendanceStatusEnum("status").notNull(),
});