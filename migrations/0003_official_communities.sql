-- Match group names to IMC's official community logos (assets/logos/<slug>.webp) and add the
-- communities that have logos but were missing. Details stay is_sample = 1 until IMC confirms them.

UPDATE groups SET name = 'IMC Music Community', sort = 1 WHERE slug = 'music-club';
UPDATE groups SET name = 'IMC Sports Community', sort = 2 WHERE slug = 'sports-club';
UPDATE groups SET name = 'Nature Retreat Community', sort = 3 WHERE slug = 'nature-retreat';
UPDATE groups SET name = 'IMC Startup Community', sort = 8 WHERE slug = 'startup-club';
UPDATE groups SET sort = 11 WHERE slug = 'book-club';
UPDATE groups SET sort = 12 WHERE slug = 'dance-club';
UPDATE groups SET sort = 13 WHERE slug = 'cycling-club';
UPDATE groups SET sort = 14 WHERE slug = 'art-craft';

INSERT INTO groups (slug, name, tagline, description, interests, owner_name, owner_role, status, image, joining_note, is_sample, sort) VALUES
('culture-lifestyle', 'Culture & Lifestyle', 'Celebrating heritage, one tradition at a time.', 'Food walks, folklore, local crafts and the everyday culture of Tirupati and Rayalaseema.', '["culture","food","art"]', 'IMC core team', 'Community host', 'active', 'photo:festiveMeetup', 'Open to locals and visitors.', 1, 4),
('creators-community', 'Creators Community', 'Frame your story.', 'Photographers, reel makers, designers and writers who shoot, edit and learn together.', '["photography","creators"]', 'IMC core team', 'Community host', 'active', 'photo:outdoorSelfie', 'Phones count as cameras. Bring work to share if you like.', 1, 5),
('women-community', 'IMC Women Community', 'Create · Connect · Grow', 'A circle for women to meet, learn and back each other: wellness, careers, creativity and conversation.', '["women","wellness","careers"]', 'IMC core team', 'Community host', 'active', 'photo:womensCircle', 'Women only.', 1, 6),
('food-club', 'IMC Food Club', 'Taste the temple town.', 'Breakfast crawls, home-style cooking sessions and the best tiffin spots in town.', '["food"]', 'IMC core team', 'Community host', 'active', 'https://images.unsplash.com/photo-1694849789325-914b71ab4075?auto=format&fit=crop&w=1200&q=75', 'Come hungry; vegetarian options at every outing.', 1, 7),
('social-welfare', 'Social Welfare Community', 'People · Purpose · Change', 'Clean-up drives, food distribution, school visits and tree planting around Tirupati.', '["volunteering"]', 'IMC core team', 'Community host', 'active', 'photo:floorCircle', 'Anyone who wants to give a few hours.', 1, 9),
('parents-community', 'Parents Community', 'Growing together.', 'Play-based sessions for children and a support circle for parents to swap advice.', '["family"]', 'IMC core team', 'Community host', 'active', 'photo:meetup4', 'Parents and carers with children of any age.', 1, 10);

UPDATE events SET group_id = (SELECT id FROM groups WHERE slug = 'food-club') WHERE slug = 'ruchulu-food-walk';
UPDATE events SET group_id = (SELECT id FROM groups WHERE slug = 'culture-lifestyle') WHERE slug = 'filter-coffee-strangers';
UPDATE events SET group_id = (SELECT id FROM groups WHERE slug = 'creators-community') WHERE slug = 'swarnamukhi-sketch-walk';
