CREATE USER 'dummy_user'@'%' IDENTIFIED WITH mysql_native_password BY 'dummy_password';
CREATE DATABASE popcorn;
GRANT ALL PRIVILEGES ON popcorn.* TO 'dummy_user'@'%';
