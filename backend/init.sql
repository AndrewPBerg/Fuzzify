CREATE DATABASE IF NOT EXISTS dnstwist_db;
USE dnstwist_db;

-- Update root password
ALTER USER 'root'@'%' IDENTIFIED BY 'root';
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';

-- Create user with proper permissions
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON dnstwist_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;