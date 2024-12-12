-- Seed department data
INSERT INTO department (name) VALUES
  ('Engineering'),
  ('Finance'),
  ('HR');

-- Seed role data
INSERT INTO role (title, salary, department_id) VALUES
  ('Software Engineer', 120000, 1),
  ('Accountant', 75000, 2),
  ('HR Manager', 85000, 3);

-- Seed employee data
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, 1),
  ('Emily', 'Johnson', 3, NULL);
