-- ============================================
-- JobConnect - Database Schema
-- Sistem për Menaxhimin e Rekrutimit dhe Aplikimeve Online
-- ============================================

CREATE DATABASE IF NOT EXISTS jobconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobconnect;

-- ---------------------------------------------
-- Tabela: users
-- Përdorues të sistemit (kandidatë, kompani, admin)
-- ---------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'company', 'admin') NOT NULL DEFAULT 'candidate',
    phone VARCHAR(30) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabela: companies
-- Profili i kompanisë (1-1 me users kur role='company')
-- ---------------------------------------------
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    logo_path VARCHAR(255) DEFAULT NULL,
    location VARCHAR(150) DEFAULT NULL,
    industry VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabela: candidates
-- Profili i kandidatit (1-1 me users kur role='candidate')
-- ---------------------------------------------
CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    headline VARCHAR(150) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    skills TEXT DEFAULT NULL,
    experience TEXT DEFAULT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    personal_number VARCHAR(20) DEFAULT NULL,
    cv_path VARCHAR(255) DEFAULT NULL,
    photo_path VARCHAR(255) DEFAULT NULL,
    location VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabela: job_categories
-- ---------------------------------------------
CREATE TABLE job_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabela: job_postings
-- Shpalljet e punës
-- ---------------------------------------------
CREATE TABLE job_postings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    category_id INT DEFAULT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT DEFAULT NULL,
    location VARCHAR(150) DEFAULT NULL,
    employment_type ENUM('full-time','part-time','internship','remote','contract') DEFAULT 'full-time',
    salary_min DECIMAL(10,2) DEFAULT NULL,
    salary_max DECIMAL(10,2) DEFAULT NULL,
    status ENUM('pending','approved','rejected','closed') NOT NULL DEFAULT 'pending',
    admin_note VARCHAR(255) DEFAULT NULL,
    deadline DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
    FULLTEXT KEY ft_title_desc (title, description)
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabela: applications
-- Aplikimet e kandidatëve për shpallje pune
-- ---------------------------------------------
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    cv_path VARCHAR(255) DEFAULT NULL,
    cover_letter TEXT DEFAULT NULL,
    status ENUM('pending','reviewed','accepted','rejected') NOT NULL DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (job_id, candidate_id),
    FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Tabela: auth_tokens
-- Token-at e autentifikimit (login sessions)
-- ---------------------------------------------
CREATE TABLE auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Të dhëna fillestare (opsionale)
-- ---------------------------------------------
INSERT INTO job_categories (name) VALUES
('IT & Software'), ('Marketing'), ('Financa'), ('Shëndetësi'), ('Arsim'), ('Dizajn'), ('Shitje'), ('Administratë');

-- Përdorues admin fillestar (email: admin@jobconnect.com / fjalëkalimi: admin123)
-- Ky user krijohet direkt në DB sepse formulari i regjistrimit lejon vetëm 'candidate'/'company'.
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Administratori', 'admin@jobconnect.com', '$2b$12$ueFge.gKDVEqOmdmntQTDe8c7yF8gN.66w2N.anhf8OC7ssHrXXy2', 'admin');
