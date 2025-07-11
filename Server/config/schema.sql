-- Create rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    floor VARCHAR(50) NOT NULL,
    image VARCHAR(600),
    description TEXT,
    equipment TEXT
);

-- Create booking table if it doesn't exist
CREATE TABLE IF NOT EXISTS booking (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    meeting_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_purpose TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    team_category VARCHAR(100) NOT NULL,
    team_sub_category VARCHAR(100),
    room_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_booking_date ON booking(date);
CREATE INDEX IF NOT EXISTS idx_booking_room_id ON booking(room_id);
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status); 

-- Categories and Teams tables for dynamic area management
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
); 