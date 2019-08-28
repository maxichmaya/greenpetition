DROP TABLE IF EXISTS registers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profile;

CREATE TABLE registers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    surname VARCHAR(200) NOT NULL,
    email VARCHAR (200) UNIQUE,
    password VARCHAR (999) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    signature TEXT,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE user_profile (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    age INT,
    city VARCHAR(200),
    url VARCHAR(200)
);
