DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS timeslots CASCADE;

CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE timeslots (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    field_id INT NOT NULL REFERENCES fields(id),
    booking_date DATE NOT NULL,
    slot_id INT NOT NULL REFERENCES timeslots(id),
    participants INT NOT NULL CHECK (participants > 0),
    rental_needed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'in_attesa' CHECK (status IN ('in_attesa', 'confermata', 'annullata')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(field_id, booking_date, slot_id)
);
