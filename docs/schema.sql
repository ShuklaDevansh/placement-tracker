-- Placement Tracker Database Schema
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS placement_tracker;
USE placement_tracker;

-- Users table
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  company_name VARCHAR(150) NOT NULL,
  role_title VARCHAR(150) NOT NULL,
  status ENUM('Applied','OA','Interview','Offer','Rejected') NOT NULL DEFAULT 'Applied',
  applied_date DATE NOT NULL,
  source VARCHAR(100),
  salary_lpa DECIMAL(6,2),
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Status history table (audit log)
CREATE TABLE status_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id INT UNSIGNED NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Indexes for query performance
CREATE INDEX idx_user_status ON applications(user_id, status);
CREATE INDEX idx_user_date ON applications(user_id, applied_date);