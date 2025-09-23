CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ENUM type for group member roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
    CREATE TYPE member_role AS ENUM ('member','admin');
  END IF;
END $$;

-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

-- ===========================
-- GROUPS
-- ===========================
CREATE TABLE groups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id  UUID NOT NULL REFERENCES users(id),
  name           TEXT NOT NULL,
  CONSTRAINT uq_groups_name_per_owner UNIQUE (owner_user_id, name)
);

CREATE INDEX idx_groups_owner ON groups(owner_user_id);

-- ===========================
-- GROUP MEMBERSHIPS
-- ===========================
CREATE TABLE group_memberships (
  group_id     UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  role         member_role NOT NULL DEFAULT 'member',
  is_approved  BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_gm_user            ON group_memberships(user_id);
CREATE INDEX idx_gm_group_approved  ON group_memberships(group_id, is_approved);

-- ===========================
-- MOVIES
-- ===========================
CREATE TABLE movies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  release_year INTEGER,
  CONSTRAINT uq_movie_title_year UNIQUE (title, release_year)
);

CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_year  ON movies(release_year);

-- ===========================
-- REVIEWS
-- ===========================
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id    UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_review_movie_user UNIQUE (movie_id, user_id)
);

CREATE INDEX idx_reviews_movie ON reviews(movie_id);
CREATE INDEX idx_reviews_user  ON reviews(user_id);

-- ===========================
-- USER FAVORITES
-- ===========================
CREATE TABLE user_favorite_list (
  user_id   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL DEFAULT 'Omat suosikit',
  share_url TEXT UNIQUE
);

CREATE TABLE user_favorite_movies (
  user_id  UUID NOT NULL REFERENCES user_favorite_list(user_id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id)                  ON DELETE CASCADE,
  PRIMARY KEY (user_id, movie_id)
);

CREATE INDEX idx_fav_movies_movie ON user_favorite_movies(movie_id);

-- ===========================
-- GROUP PINNED MOVIES
-- ===========================
CREATE TABLE group_pinned_movies (
  group_id         UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  movie_id         UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  added_by_user_id UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  PRIMARY KEY (group_id, movie_id)
);

CREATE INDEX idx_gpm_added_by ON group_pinned_movies(added_by_user_id);

-- ===========================
-- GROUP FINNKINO ITEMS
-- ===========================
CREATE TABLE group_finnkino_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  display_text     TEXT NOT NULL,   -- Example: "2025-03-14 19:00 | Helsinki Tennispalatsi | Dune"
  added_by_user_id UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE
);

CREATE INDEX idx_gfi_group    ON group_finnkino_items(group_id);
CREATE INDEX idx_gfi_added_by ON group_finnkino_items(added_by_user_id);