-- Gallery and team, managed from the admin. Seeded with IMC's existing photos (assets/photos,
-- referenced as "photo:<key>") and team portraits (assets/team, "team:<slug>"). New uploads are
-- stored in the MEDIA KV namespace and referenced as "media:<key>".

CREATE TABLE gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  group_id INTEGER REFERENCES groups(id),
  taken_on TEXT NOT NULL DEFAULT '',
  consent_confirmed INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX gallery_public ON gallery (published, consent_confirmed, sort);

CREATE TABLE team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'core' CHECK (kind IN ('core', 'captain', 'host', 'volunteer')),
  group_id INTEGER REFERENCES groups(id),
  photo TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- IMC confirmed consent for its existing event photos (26 Oct 2026).
INSERT INTO gallery (image, caption, alt, group_id, consent_confirmed, sort) VALUES
('photo:hilltop', 'Summit selfies on a weekend trek', 'IMC members on a hilltop near Tirupati', (SELECT id FROM groups WHERE slug='nature-retreat'), 1, 1),
('photo:classicalDance', 'Classical dance evening', 'A classical dance performance at an IMC meetup', (SELECT id FROM groups WHERE slug='dance-club'), 1, 2),
('photo:badminton', 'Badminton night', 'Members playing badminton', (SELECT id FROM groups WHERE slug='sports-club'), 1, 3),
('photo:artTable', 'Art table, paint everywhere', 'Members painting together at a long table', (SELECT id FROM groups WHERE slug='art-craft'), 1, 4),
('photo:waterfall', 'Morning at the falls', 'Group photo at a waterfall', (SELECT id FROM groups WHERE slug='nature-retreat'), 1, 5),
('photo:floorCircle', 'Floor circle conversations', 'Members sitting in a circle on the floor', NULL, 1, 6),
('photo:womensCircle', 'Women''s circle meetup', 'Women at an IMC circle meetup', (SELECT id FROM groups WHERE slug='women-community'), 1, 7),
('photo:beachVolleyball', 'Beach volleyball day', 'Members playing beach volleyball', (SELECT id FROM groups WHERE slug='sports-club'), 1, 8),
('photo:danceStudio', 'Dance studio session', 'Dance practice in a studio', (SELECT id FROM groups WHERE slug='dance-club'), 1, 9),
('photo:hillsTrek', 'On the trail', 'Trekkers walking through the hills', (SELECT id FROM groups WHERE slug='nature-retreat'), 1, 10),
('photo:carrom', 'Carrom corner', 'Friends playing carrom', NULL, 1, 11),
('photo:meetup', 'Monthly meetup', 'A room full of IMC members at a meetup', NULL, 1, 12),
('photo:bikeRide', 'Sunrise ride', 'Cyclists on an early morning ride', (SELECT id FROM groups WHERE slug='cycling-club'), 1, 13),
('photo:craftCircle', 'Craft circle', 'Members making crafts together', (SELECT id FROM groups WHERE slug='art-craft'), 1, 14),
('photo:danceCrowd', 'Dance night', 'A crowd dancing at an IMC event', (SELECT id FROM groups WHERE slug='dance-club'), 1, 15),
('photo:outdoorSelfie', 'Group selfie outdoors', 'A big group selfie outdoors', NULL, 1, 16),
('photo:bookTable', 'Book club table', 'Books and readers around a table', (SELECT id FROM groups WHERE slug='book-club'), 1, 17),
('photo:nightTurf', 'Turf under the lights', 'A night game on a turf', (SELECT id FROM groups WHERE slug='sports-club'), 1, 18),
('photo:festiveMeetup', 'Festive meetup', 'Members at a festive gathering', (SELECT id FROM groups WHERE slug='culture-lifestyle'), 1, 19),
('photo:boardGames', 'Board games night', 'Friends playing board games', NULL, 1, 20),
('photo:nightCricket', 'Night cricket', 'Box cricket at night', (SELECT id FROM groups WHERE slug='sports-club'), 1, 21),
('photo:houseFront', 'Partner venue', 'The front of a partner venue', NULL, 1, 22),
('photo:roundTable', 'Founders round table', 'A round-table discussion', (SELECT id FROM groups WHERE slug='startup-club'), 1, 23),
('photo:meetup2', 'Meetup moments', 'Members chatting at a meetup', NULL, 1, 24),
('photo:meetup3', 'New faces, first meetup', 'Members at a meetup', NULL, 1, 25),
('photo:tableTalk', 'Table talk', 'Conversations around a table', NULL, 1, 26),
('photo:meetup4', 'Weekend meetup', 'Members at a weekend meetup', NULL, 1, 27),
('photo:meetup5', 'Community evening', 'Members at a community evening', NULL, 1, 28),
('photo:danceCrowd2', 'Dance floor', 'Members dancing', (SELECT id FROM groups WHERE slug='dance-club'), 1, 29),
('photo:danceCrowd3', 'Group photo after the dance', 'A large group photo', (SELECT id FROM groups WHERE slug='dance-club'), 1, 30),
('photo:bookClub', 'Book club meetup', 'Book club members', (SELECT id FROM groups WHERE slug='book-club'), 1, 31);

INSERT INTO team (name, role, kind, group_id, photo, sort) VALUES
('Likhith. KN', 'Founder · Strategy & Growth', 'core', NULL, 'team:likhith', 1),
('Haasya Vanteru', 'Head of Events & Operations', 'core', NULL, 'team:haasya', 2),
('Kalyan. TN', 'Core Team', 'core', NULL, 'team:kalyan', 3),
('Khushi', 'Core Team', 'core', NULL, 'team:khushi', 4),
('Anudeep', 'Event Design Executive', 'core', NULL, 'team:anudeep', 5),
('Sohail', 'Organising Team', 'core', NULL, 'team:sohail', 6),
('Uday', 'Captain · Cricket Club', 'captain', (SELECT id FROM groups WHERE slug='sports-club'), 'team:uday', 10),
('Ganesh', 'Captain · Badminton Club', 'captain', (SELECT id FROM groups WHERE slug='sports-club'), 'team:ganesh', 11),
('Neeyati', 'Captain · Music Community', 'captain', (SELECT id FROM groups WHERE slug='music-club'), 'team:neeyati', 12),
('Rohitha Reddy', 'Captain · Book Club', 'captain', (SELECT id FROM groups WHERE slug='book-club'), 'team:rohitha', 13),
('Harshith', 'Captain · Cue Club', 'captain', NULL, 'team:harshith', 14),
('Lakshmi Nithesh', 'Captain · Volleyball Club', 'captain', (SELECT id FROM groups WHERE slug='sports-club'), 'team:nithesh', 15),
('Tharun Reddy', 'Captain · Nature Retreat', 'captain', (SELECT id FROM groups WHERE slug='nature-retreat'), 'team:tharun', 16),
('Guru', 'Captain · Board Games Club', 'captain', NULL, 'team:guru', 17),
('Ajay Varma', 'Captain · Dance Club', 'captain', (SELECT id FROM groups WHERE slug='dance-club'), 'team:ajay', 18),
('Saketh', 'Captain · Pickleball', 'captain', (SELECT id FROM groups WHERE slug='sports-club'), 'team:saketh', 19),
('Ravee', 'Captain · Cycling Club', 'captain', (SELECT id FROM groups WHERE slug='cycling-club'), 'team:ravee', 20),
('Aravind. JV', 'Host · Mic.tirupati', 'host', NULL, 'team:aravind', 30),
('Nikhila', 'Content Writer · Mic.tirupati', 'host', NULL, 'team:nikhila', 31);
