"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inquirer_1 = __importDefault(require("inquirer"));
const connection_1 = require("./db/connection");
// Initialize the server (if you want to extend with an API later)
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Main menu logic
const mainMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test database connection
        yield (0, connection_1.connectToDb)();
        // Start the CLI
        console.log('Welcome to the Employee Tracker!');
        yield displayMenu();
    }
    catch (error) {
        console.error('Error initializing the application:', error);
        process.exit(1);
    }
});
// Display main menu options
const displayMenu = () => __awaiter(void 0, void 0, void 0, function* () {
    const { action } = yield inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit',
            ],
        },
    ]);
    switch (action) {
        case 'View all departments':
            yield viewDepartments();
            break;
        case 'View all roles':
            yield viewRoles();
            break;
        case 'View all employees':
            yield viewEmployees();
            break;
        case 'Add a department':
            yield addDepartment();
            break;
        case 'Add a role':
            yield addRole();
            break;
        case 'Add an employee':
            yield addEmployee();
            break;
        case 'Update an employee role':
            yield updateEmployeeRole();
            break;
        case 'Exit':
            console.log('Goodbye!');
            process.exit(0);
    }
    // Loop back to menu after performing an action
    yield displayMenu();
});
// View all departments
const viewDepartments = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield connection_1.pool.query('SELECT * FROM department;');
    console.table(result.rows);
});
// View all roles
const viewRoles = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield connection_1.pool.query(`
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id;
  `);
    console.table(result.rows);
});
// View all employees
const viewEmployees = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield connection_1.pool.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title AS role,
           department.name AS department, role.salary,
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id;
  `);
    console.table(result.rows);
});
// Add a department
const addDepartment = () => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = yield inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the name of the new department:',
        },
    ]);
    yield connection_1.pool.query('INSERT INTO department (name) VALUES ($1);', [name]);
    console.log(`Added department: ${name}`);
});
// Add a role
const addRole = () => __awaiter(void 0, void 0, void 0, function* () {
    const departments = yield connection_1.pool.query('SELECT * FROM department;');
    const departmentChoices = departments.rows.map((dept) => ({
        name: dept.name,
        value: dept.id,
    }));
    const answers = yield inquirer_1.default.prompt([
        { type: 'input', name: 'title', message: 'Enter the role title:' },
        { type: 'input', name: 'salary', message: 'Enter the role salary:' },
        {
            type: 'list',
            name: 'department_id',
            message: 'Select the department:',
            choices: departmentChoices,
        },
    ]);
    yield connection_1.pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);', [answers.title, answers.salary, answers.department_id]);
    console.log(`Added role: ${answers.title}`);
});
// Add an employee
const addEmployee = () => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield connection_1.pool.query('SELECT * FROM role;');
    const roleChoices = roles.rows.map((role) => ({
        name: role.title,
        value: role.id,
    }));
    const employees = yield connection_1.pool.query('SELECT * FROM employee;');
    const managerChoices = employees.rows.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
    }));
    managerChoices.unshift({ name: 'None', value: null });
    const answers = yield inquirer_1.default.prompt([
        { type: 'input', name: 'first_name', message: 'Enter first name:' },
        { type: 'input', name: 'last_name', message: 'Enter last name:' },
        { type: 'list', name: 'role_id', message: 'Select a role:', choices: roleChoices },
        { type: 'list', name: 'manager_id', message: 'Select a manager:', choices: managerChoices },
    ]);
    yield connection_1.pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4);', [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
    console.log(`Added employee: ${answers.first_name} ${answers.last_name}`);
});
// Update an employee's role
const updateEmployeeRole = () => __awaiter(void 0, void 0, void 0, function* () {
    const employees = yield connection_1.pool.query('SELECT * FROM employee;');
    const employeeChoices = employees.rows.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
    }));
    const roles = yield connection_1.pool.query('SELECT * FROM role;');
    const roleChoices = roles.rows.map((role) => ({
        name: role.title,
        value: role.id,
    }));
    const answers = yield inquirer_1.default.prompt([
        { type: 'list', name: 'employee_id', message: 'Select an employee:', choices: employeeChoices },
        { type: 'list', name: 'role_id', message: 'Select a new role:', choices: roleChoices },
    ]);
    yield connection_1.pool.query('UPDATE employee SET role_id = $1 WHERE id = $2;', [
        answers.role_id,
        answers.employee_id,
    ]);
    console.log('Updated employee role.');
});
// Start the application
mainMenu();
