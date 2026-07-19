-- SquashX Rally — reference data seed (courts + communities)
-- Run this after schema.sql. These are real Duisburg locations with
-- approximate coordinates — double-check them against Google Maps
-- before relying on them for real distance calculations.

insert into courts (id, name, address, latitude, longitude) values
  ('11111111-1111-1111-1111-111111111111', 'Squash Center Duisburg-Neudorf', 'Sternbuschweg 12, 47057 Duisburg', 51.4290, 6.7710),
  ('22222222-2222-2222-2222-222222222222', 'Sportpark Duisburg-Mitte', 'Königstraße 4, 47051 Duisburg', 51.4322, 6.7661),
  ('33333333-3333-3333-3333-333333333333', 'TC Rheinhausen Racquet Club', 'Bahnhofstraße 88, 47228 Duisburg', 51.3986, 6.7062),
  ('44444444-4444-4444-4444-444444444444', 'Sportzentrum Wedau', 'Bertaallee 200, 47055 Duisburg', 51.3985, 6.7612)
on conflict (id) do nothing;

insert into court_bookable_slots (court_id, day, start_time, end_time) values
  ('11111111-1111-1111-1111-111111111111', 'Mon', '18:00', '21:00'),
  ('11111111-1111-1111-1111-111111111111', 'Wed', '06:00', '09:00'),
  ('11111111-1111-1111-1111-111111111111', 'Sat', '09:00', '14:00'),
  ('22222222-2222-2222-2222-222222222222', 'Tue', '17:00', '20:00'),
  ('22222222-2222-2222-2222-222222222222', 'Thu', '18:00', '21:00'),
  ('22222222-2222-2222-2222-222222222222', 'Sat', '10:00', '12:00'),
  ('33333333-3333-3333-3333-333333333333', 'Mon', '19:00', '22:00'),
  ('33333333-3333-3333-3333-333333333333', 'Fri', '17:00', '19:00'),
  ('33333333-3333-3333-3333-333333333333', 'Sun', '09:00', '12:00'),
  ('44444444-4444-4444-4444-444444444444', 'Wed', '08:00', '10:00'),
  ('44444444-4444-4444-4444-444444444444', 'Sat', '08:00', '11:00');

insert into communities (id, name, description, meetup_note, vibe) values
  ('55555555-5555-5555-5555-555555555555', 'Duisburg Squash Social', 'Low-key rallies and beginner-friendly meetups that rotate across Duisburg courts.', 'Tuesdays 19:00 · rotates courts', 'Casual'),
  ('66666666-6666-6666-6666-666666666666', 'Rhein-Ruhr Ladder League', 'Organized ELO ladder matches for players chasing a real regional ranking.', 'Self-scheduled · results reported weekly', 'Competitive'),
  ('77777777-7777-7777-7777-777777777777', 'Neudorf Beginners Club', 'New to squash? Learn the ropes with patient partners, no pressure at all.', 'Sundays 10:00 · Squash Center Duisburg-Neudorf', 'Casual'),
  ('88888888-8888-8888-8888-888888888888', 'Wedau Club Ladder', 'Club members'' internal ladder with both a casual track and a ranked track.', 'Thursdays 18:00 · Sportzentrum Wedau', 'Mixed')
on conflict (id) do nothing;
