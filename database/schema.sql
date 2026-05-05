CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'organiser', 'attendee') NOT NULL,
  is_owner TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organiser_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  venue VARCHAR(160) NOT NULL,
  city VARCHAR(120) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  price_cents INT UNSIGNED NOT NULL,
  capacity INT UNSIGNED NOT NULL,
  excerpt VARCHAR(220) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('scheduled', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_organiser
    FOREIGN KEY (organiser_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS e_ticket_cards (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  card_number CHAR(16) NOT NULL UNIQUE,
  status ENUM('active', 'expired') NOT NULL DEFAULT 'active',
  issued_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_e_ticket_cards_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code CHAR(11) NOT NULL UNIQUE,
  event_id BIGINT UNSIGNED NOT NULL,
  attendee_id BIGINT UNSIGNED NOT NULL,
  e_ticket_card_id BIGINT UNSIGNED NULL,
  seats INT UNSIGNED NOT NULL,
  total_cents INT UNSIGNED NOT NULL,
  status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_event
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_bookings_attendee
    FOREIGN KEY (attendee_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_bookings_e_ticket_card
    FOREIGN KEY (e_ticket_card_id) REFERENCES e_ticket_cards (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_tickets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON sessions (token_hash);
CREATE INDEX idx_events_start ON events (starts_at);
CREATE INDEX idx_e_ticket_cards_user_status ON e_ticket_cards (user_id, status, expires_at);
CREATE INDEX idx_bookings_event_status ON bookings (event_id, status);
CREATE INDEX idx_bookings_attendee_status ON bookings (attendee_id, status);
CREATE INDEX idx_bookings_e_ticket_card ON bookings (e_ticket_card_id);
CREATE INDEX idx_tickets_status ON contact_tickets (status, created_at);
