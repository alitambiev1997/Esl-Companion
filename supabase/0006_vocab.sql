insert into public.vocabulary_items (level_id, word, definition, example_sentence, is_published)
select l.id, v.word, v.definition, v.example_sentence, true
from public.levels l
cross join (
  values
    -- Problems
    ('noisy', 'Making a lot of noise.', 'The street outside my window is very noisy.'),
    ('broken', 'Damaged and not working.', 'The shower in my room is broken.'),
    ('dirty', 'Not clean.', 'The towels are dirty, can you change them?'),
    ('towel', 'A piece of cloth used for drying.', 'Can I have another towel, please?'),
    ('shower', 'A place where you stand to wash your body.', 'The shower has no hot water.'),
    ('Wi-Fi', 'A system for connecting to the internet without cables.', 'Is there free Wi-Fi in the hotel?'),
    -- Services
    ('wake-up call', 'A phone call from the hotel to wake you up.', 'I need a wake-up call at 7 in the morning.'),
    ('room service', 'A hotel service that brings food to your room.', 'We ordered dinner from room service.'),
    ('extra pillow', 'An additional pillow for your bed.', 'Could you bring me an extra pillow?'),
    ('blanket', 'A warm cover for a bed.', 'I would like another blanket, please.'),
    -- Check-out
    ('bill', 'A piece of paper that shows how much you must pay.', 'Could I have the bill, please?'),
    ('receipt', 'A paper that proves you paid for something.', 'Keep the receipt in case you need to return it.'),
    ('late', 'After the expected time.', 'We checked out late on the last day.'),
    ('early', 'Before the expected time.', 'The bus arrived early in the morning.'),
    ('pay', 'To give money for something.', 'You can pay by card or cash.'),
    ('cash', 'Paper money and coins.', 'I prefer to pay with cash.'),
    ('card', 'A small plastic card used to pay.', 'Do you accept card payments?'),
    -- Directions
    ('turn left', 'To go in the left direction.', 'Turn left at the bank.'),
    ('turn right', 'To go in the right direction.', 'Turn right after the hotel.'),
    ('crosswalk', 'A marked place where people cross the street.', 'Use the crosswalk to get to the other side.'),
    ('block', 'A street section between two intersections.', 'The museum is two blocks away.'),
    ('straight', 'Continuing in one direction without turning.', 'Go straight for five minutes.'),
    ('street', 'A road in a town or city.', 'The restaurant is on Main Street.'),
    ('map', 'A drawing that shows where places are.', 'Can you show me on the map?'),
    ('lost', 'Unable to find the way.', 'We got lost in the old town.'),
    -- Restaurant
    ('menu', 'A list of food and drinks in a restaurant.', 'Can we see the menu, please?'),
    ('order', 'To ask for food or drink.', 'I would like to order a pizza.'),
    ('tip', 'Extra money you give for good service.', 'We left a tip for the waiter.'),
    ('vegetarian', 'A person who does not eat meat.', 'Do you have vegetarian dishes?'),
    ('dessert', 'Sweet food eaten after the main meal.', 'I will have ice cream for dessert.'),
    ('wine', 'An alcoholic drink made from grapes.', 'We ordered a glass of white wine.'),
    ('water', 'The clear liquid you drink.', 'A bottle of water, please.')
) as v(word, definition, example_sentence)
where l.cefr_level = 'A2';