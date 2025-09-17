DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS account;

CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO task (description) VALUES
('Complete the project documentation'),
('Review the code changes'),
('Prepare for the team meeting'),
('Update the project timeline'),
('Test the new features'),
('Fix the reported bugs'),
('Deploy the application to production'),
('Conduct a code review with peers');
