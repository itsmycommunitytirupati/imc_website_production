-- Use the same interest ids as the join form (INTERESTS in src/site/JoinPage.tsx), so group
-- pages and member records share one vocabulary.
UPDATE groups SET interests = '["nature","wellness"]' WHERE slug = 'nature-retreat';
UPDATE groups SET interests = '["sports","wellness"]' WHERE slug = 'sports-club';
UPDATE groups SET interests = '["cycling","nature"]' WHERE slug = 'cycling-club';
UPDATE groups SET interests = '["startups","careers"]' WHERE slug = 'startup-club';
UPDATE groups SET interests = '["art","creators"]' WHERE slug = 'art-craft';
