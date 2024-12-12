import express from 'express';
import inquirer from 'inquirer';
import { connectToDb, pool } from './db/connection';

// Initialize the server (if you want to extend with an API later)
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Main menu logic
const mainMenu = async () => {
  try {
    // Test database connection
    await connectToDb();

    // Start the CLI
    console.log('Welcome to the Employee Tracker!');
    await displayMenu();
  } catch (error) {
    console.error('Error initializing the application:', error);
    process.exit(1);
  }
};

// Display main menu options
const displayMenu = async () => {
  const { action } = await inquirer.prompt([
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
      await viewDepartments();
      break;
    case 'View all roles':
      await viewRoles();
      break;
    case 'View all employees':
      await viewEmployees();
      break;
    case 'Add a department':
      await addDepartment();
      break;
    case 'Add a role':
      await addRole();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      console.log('Goodbye!');
      process.exit(0);
  }

  // Loop back to menu after performing an action
  await displayMenu();
};

// View all departments
const viewDepartments = async () => {
  const result = await pool.query('SELECT * FROM department;');
  console.table(result.rows);
};

// View all roles
const viewRoles = async () => {
  const result = await pool.query(`
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id;
  `);
  console.table(result.rows);
};

// View all employees
const viewEmployees = async () => {
  const result = await pool.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title AS role,
           department.name AS department, role.salary,
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id;
  `);
  console.table(result.rows);
};

// Add a department
const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the new department:',
    },
  ]);

  await pool.query('INSERT INTO department (name) VALUES ($1);', [name]);
  console.log(`Added department: ${name}`);
};

// Add a role
const addRole = async () => {
  const departments = await pool.query('SELECT * FROM department;');
  const departmentChoices = departments.rows.map((dept: any) => ({
    name: dept.name,
    value: dept.id,
  }));

  const answers = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter the role title:' },
    { type: 'input', name: 'salary', message: 'Enter the role salary:' },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department:',
      choices: departmentChoices,
    },
  ]);

  await pool.query(
    'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3);',
    [answers.title, answers.salary, answers.department_id]
  );
  console.log(`Added role: ${answers.title}`);
};

// Add an employee
const addEmployee = async () => {
  const roles = await pool.query('SELECT * FROM role;');
  const roleChoices = roles.rows.map((role: any) => ({
    name: role.title,
    value: role.id,
  }));

  const employees = await pool.query('SELECT * FROM employee;');
  const managerChoices = employees.rows.map((emp: any) => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));
  managerChoices.unshift({ name: 'None', value: null });

  const answers = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: 'Enter first name:' },
    { type: 'input', name: 'last_name', message: 'Enter last name:' },
    { type: 'list', name: 'role_id', message: 'Select a role:', choices: roleChoices },
    { type: 'list', name: 'manager_id', message: 'Select a manager:', choices: managerChoices },
  ]);

  await pool.query(
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4);',
    [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]
  );
  console.log(`Added employee: ${answers.first_name} ${answers.last_name}`);
};

// Update an employee's role
const updateEmployeeRole = async () => {
  const employees = await pool.query('SELECT * FROM employee;');
  const employeeChoices = employees.rows.map((emp: any) => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const roles = await pool.query('SELECT * FROM role;');
  const roleChoices = roles.rows.map((role: any) => ({
    name: role.title,
    value: role.id,
  }));

  const answers = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Select an employee:', choices: employeeChoices },
    { type: 'list', name: 'role_id', message: 'Select a new role:', choices: roleChoices },
  ]);

  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2;', [
    answers.role_id,
    answers.employee_id,
  ]);
  console.log('Updated employee role.');
};

// Start the application
mainMenu();
