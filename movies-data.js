/* =========================================================
   CineVault – data layer
   ---------------------------------------------------------
   `MovieAPI` is the ONLY thing script.js talks to. To switch to a
   real API (e.g. TMDB), re-implement getAll() / getById() so they
   fetch() and return objects in the same shape as MOVIES below.
   Image paths are TMDB paths; the UI falls back to a generated
   placeholder if any image fails to load.
   ========================================================= */

const IMG_BASE = 'https://image.tmdb.org/t/p/';

const MOVIES = [
  { id: 1, title: 'The Shawshank Redemption', tagline: 'Fear can hold you prisoner. Hope can set you free.', date: '1994-09-23', rating: 8.7, runtime: 142, genres: ['Drama'], director: 'Frank Darabont', writers: ['Frank Darabont', 'Stephen King'], cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'], overview: 'Framed for the murder of his wife and her lover, banker Andy Dufresne begins a new life at Shawshank prison, where he forms a deep friendship with fellow inmate Red and quietly plots his escape.', trailer: 'https://www.youtube.com/watch?v=6hB3S9bIaco', language: 'English', country: 'United States', budget: 25000000, boxOffice: 28341469, companies: ['Castle Rock Entertainment'], poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', backdrop: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', popularity: 88 },
  { id: 2, title: 'The Godfather', tagline: "An offer you can't refuse.", date: '1972-03-14', rating: 8.7, runtime: 175, genres: ['Crime', 'Drama'], director: 'Francis Ford Coppola', writers: ['Mario Puzo', 'Francis Ford Coppola'], cast: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Diane Keaton'], overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son, Michael, who is drawn into the family business.', trailer: 'https://www.youtube.com/watch?v=UaVTIH8mujA', language: 'English', country: 'United States', budget: 6000000, boxOffice: 250342198, companies: ['Paramount Pictures', 'Alfran Productions'], poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', backdrop: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', popularity: 90 },
  { id: 3, title: 'The Dark Knight', tagline: 'Why so serious?', date: '2008-07-18', rating: 9.0, runtime: 152, genres: ['Action', 'Crime', 'Drama'], director: 'Christopher Nolan', writers: ['Jonathan Nolan', 'Christopher Nolan'], cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'], overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Gordon and DA Harvey Dent, he sets out to dismantle the remaining criminal organizations — until a chaos-loving Joker emerges.', trailer: 'https://www.youtube.com/watch?v=EXeTwQWrcwY', language: 'English', country: 'United States', budget: 185000000, boxOffice: 1006234167, companies: ['Warner Bros. Pictures', 'Legendary Pictures', 'DC Comics'], poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg', popularity: 97 },
  { id: 4, title: 'Pulp Fiction', tagline: "You won't know the facts until you've seen the fiction.", date: '1994-09-10', rating: 8.9, runtime: 154, genres: ['Crime', 'Thriller'], director: 'Quentin Tarantino', writers: ['Quentin Tarantino', 'Roger Avary'], cast: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman', 'Bruce Willis'], overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', trailer: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY', language: 'English', country: 'United States', budget: 8000000, boxOffice: 213928762, companies: ['Miramax', 'A Band Apart', 'Jersey Films'], poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', backdrop: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg', popularity: 86 },
  { id: 5, title: 'Inception', tagline: 'Your mind is the scene of the crime.', date: '2010-07-16', rating: 8.8, runtime: 148, genres: ['Action', 'Sci-Fi', 'Thriller'], director: 'Christopher Nolan', writers: ['Christopher Nolan'], cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'], overview: 'Dom Cobb is a thief who steals secrets from within the subconscious during the dream state. He is offered a chance at redemption: plant an idea in a target’s mind — an act called inception.', trailer: 'https://www.youtube.com/watch?v=YoHD9XEInc0', language: 'English', country: 'United States', budget: 160000000, boxOffice: 836836967, companies: ['Warner Bros. Pictures', 'Legendary Pictures', 'Syncopy'], poster: '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', backdrop: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', popularity: 96 },
  { id: 6, title: 'Fight Club', tagline: 'Mischief. Mayhem. Soap.', date: '1999-10-15', rating: 8.8, runtime: 139, genres: ['Drama', 'Thriller'], director: 'David Fincher', writers: ['Jim Uhls', 'Chuck Palahniuk'], cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter', 'Meat Loaf'], overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something far more dangerous.', trailer: 'https://www.youtube.com/watch?v=qtRKdVHc-cE', language: 'English', country: 'United States', budget: 63000000, boxOffice: 100853753, companies: ['20th Century Fox', 'Regency Enterprises', 'Fox 2000 Pictures'], poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', backdrop: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg', popularity: 89 },
  { id: 7, title: 'Interstellar', tagline: 'Mankind was born on Earth. It was never meant to die here.', date: '2014-11-07', rating: 8.7, runtime: 169, genres: ['Adventure', 'Drama', 'Sci-Fi'], director: 'Christopher Nolan', writers: ['Jonathan Nolan', 'Christopher Nolan'], cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'], overview: 'With Earth’s future uncertain, a team of explorers travels through a wormhole near Saturn in search of a new home for humanity.', trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E', language: 'English', country: 'United States', budget: 165000000, boxOffice: 701729206, companies: ['Paramount Pictures', 'Legendary Pictures', 'Syncopy'], poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg', popularity: 95 },
  { id: 8, title: 'Forrest Gump', tagline: 'Life is like a box of chocolates.', date: '1994-07-06', rating: 8.8, runtime: 142, genres: ['Comedy', 'Drama', 'Romance'], director: 'Robert Zemeckis', writers: ['Eric Roth', 'Winston Groom'], cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise', 'Sally Field'], overview: 'The presidencies of Kennedy and Johnson, Vietnam, Watergate and more unfold through the eyes of an Alabama man with a low IQ and a big heart.', trailer: 'https://www.youtube.com/watch?v=bLvqoHBptjg', language: 'English', country: 'United States', budget: 55000000, boxOffice: 678226465, companies: ['Paramount Pictures', 'The Steve Tisch Company'], poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', backdrop: '/qdIMHd4sEfJSckfVJfKQvisL02a.jpg', popularity: 87 },
  { id: 9, title: 'The Matrix', tagline: 'Welcome to the Real World.', date: '1999-03-31', rating: 8.7, runtime: 136, genres: ['Action', 'Sci-Fi'], director: 'Lana & Lilly Wachowski', writers: ['Lana Wachowski', 'Lilly Wachowski'], cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'], overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', trailer: 'https://www.youtube.com/watch?v=vKQi3bBA1y8', language: 'English', country: 'United States', budget: 63000000, boxOffice: 467222728, companies: ['Warner Bros. Pictures', 'Village Roadshow Pictures', 'Silver Pictures'], poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', backdrop: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg', popularity: 92 },
  { id: 10, title: 'Parasite', tagline: 'Act like you own the place.', date: '2019-05-30', rating: 8.5, runtime: 133, genres: ['Comedy', 'Drama', 'Thriller'], director: 'Bong Joon-ho', writers: ['Bong Joon-ho', 'Han Jin-won'], cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'], overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', trailer: 'https://www.youtube.com/watch?v=5xH0HfJHsaY', language: 'Korean', country: 'South Korea', budget: 11400000, boxOffice: 262000000, companies: ['Barunson E&A'], poster: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop: '/TU9NIjwzjoKPwQHoHkFp3JmdZXp.jpg', popularity: 91 },
  { id: 11, title: 'Gladiator', tagline: 'What we do in life echoes in eternity.', date: '2000-05-05', rating: 8.5, runtime: 155, genres: ['Action', 'Adventure', 'Drama'], director: 'Ridley Scott', writers: ['David Franzoni', 'John Logan', 'William Nicholson'], cast: ['Russell Crowe', 'Joaquin Phoenix', 'Connie Nielsen', 'Oliver Reed'], overview: 'A betrayed Roman general is forced into slavery and rises through the gladiatorial arena to avenge the murder of his family and the emperor.', trailer: 'https://www.youtube.com/watch?v=owK1qxDselE', language: 'English', country: 'United States', budget: 103000000, boxOffice: 460583960, companies: ['DreamWorks Pictures', 'Universal Pictures', 'Scott Free Productions'], poster: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', backdrop: '/Ar7QuJ7sRuPxZfuhx0IpBpCHjgq.jpg', popularity: 88 },
  { id: 12, title: 'Avengers: Endgame', tagline: 'Avenge the fallen.', date: '2019-04-26', rating: 8.4, runtime: 181, genres: ['Action', 'Adventure', 'Sci-Fi'], director: 'Anthony & Joe Russo', writers: ['Christopher Markus', 'Stephen McFeely'], cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Scarlett Johansson'], overview: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos’s actions and restore balance to the universe.', trailer: 'https://www.youtube.com/watch?v=TcMBFSGVi1c', language: 'English', country: 'United States', budget: 356000000, boxOffice: 2799439100, companies: ['Marvel Studios', 'Walt Disney Pictures'], poster: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg', backdrop: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', popularity: 99 },
  { id: 13, title: 'Spirited Away', tagline: 'The tunnel led Chihiro to a mysterious town…', date: '2001-07-20', rating: 8.6, runtime: 125, genres: ['Animation', 'Adventure', 'Fantasy'], director: 'Hayao Miyazaki', writers: ['Hayao Miyazaki'], cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naito'], overview: 'A sullen ten-year-old wanders into a world ruled by gods, witches and spirits, where humans are changed into beasts — and must work to free herself and her parents.', trailer: 'https://www.youtube.com/watch?v=ByXuk9QqQkk', language: 'Japanese', country: 'Japan', budget: 19000000, boxOffice: 395580000, companies: ['Studio Ghibli', 'Toho'], poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', backdrop: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg', popularity: 90 },
  { id: 14, title: 'Joker', tagline: 'Put on a happy face.', date: '2019-10-04', rating: 8.4, runtime: 122, genres: ['Crime', 'Drama', 'Thriller'], director: 'Todd Phillips', writers: ['Todd Phillips', 'Scott Silver'], cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz', 'Frances Conroy'], overview: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He begins a slow descent into madness and becomes the criminal mastermind known as the Joker.', trailer: 'https://www.youtube.com/watch?v=zAGVQLHvwOY', language: 'English', country: 'United States', budget: 55000000, boxOffice: 1074458282, companies: ['Warner Bros. Pictures', 'DC Films', 'Village Roadshow'], poster: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', backdrop: '', popularity: 93 },
  { id: 15, title: 'Whiplash', tagline: 'The road to greatness can take you through hell.', date: '2014-10-10', rating: 8.5, runtime: 106, genres: ['Drama', 'Music'], director: 'Damien Chazelle', writers: ['Damien Chazelle'], cast: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser', 'Melissa Benoist'], overview: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student’s potential.', trailer: 'https://www.youtube.com/watch?v=7d_jQycdQGo', language: 'English', country: 'United States', budget: 3300000, boxOffice: 49000000, companies: ['Bold Films', 'Blumhouse Productions'], poster: '/7fn624j5lj3xTme2SgiLCeuedmO.jpg', backdrop: '', popularity: 80 },
  { id: 16, title: 'Spider-Man: Into the Spider-Verse', tagline: 'More than one wears the mask.', date: '2018-12-14', rating: 8.4, runtime: 117, genres: ['Animation', 'Action', 'Adventure'], director: 'Bob Persichetti, Peter Ramsey, Rodney Rothman', writers: ['Phil Lord', 'Rodney Rothman'], cast: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld', 'Mahershala Ali'], overview: 'Teen Miles Morales becomes Spider-Man of his reality, crossing paths with five counterparts from other dimensions to stop a threat to all realities.', trailer: 'https://www.youtube.com/watch?v=g4Hbz2jLxvQ', language: 'English', country: 'United States', budget: 90000000, boxOffice: 384298736, companies: ['Sony Pictures Animation', 'Marvel Entertainment'], poster: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg', backdrop: '', popularity: 89 },
  { id: 17, title: 'Dune', tagline: 'Beyond fear, destiny awaits.', date: '2021-10-22', rating: 8.0, runtime: 155, genres: ['Adventure', 'Drama', 'Sci-Fi'], director: 'Denis Villeneuve', writers: ['Jon Spaihts', 'Denis Villeneuve', 'Eric Roth'], cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac', 'Zendaya'], overview: 'Paul Atreides, a brilliant young man born into a great destiny, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.', trailer: 'https://www.youtube.com/watch?v=n9xhJrPXop4', language: 'English', country: 'United States', budget: 165000000, boxOffice: 407000000, companies: ['Legendary Pictures', 'Warner Bros. Pictures'], poster: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', backdrop: '', popularity: 94 },
  { id: 18, title: 'Oppenheimer', tagline: 'The world forever changes.', date: '2023-07-21', rating: 8.3, runtime: 180, genres: ['Biography', 'Drama', 'History'], director: 'Christopher Nolan', writers: ['Christopher Nolan', 'Kai Bird', 'Martin Sherwin'], cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.', 'Matt Damon'], overview: 'The story of J. Robert Oppenheimer’s role in developing the atomic bomb during World War II, and the moral cost that followed.', trailer: 'https://www.youtube.com/watch?v=uYPbbksJxIg', language: 'English', country: 'United States', budget: 100000000, boxOffice: 975000000, companies: ['Universal Pictures', 'Syncopy', 'Atlas Entertainment'], poster: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: '', popularity: 98 },
  { id: 19, title: 'Goodfellas', tagline: 'Three decades of life in the mafia.', date: '1990-09-21', rating: 8.7, runtime: 145, genres: ['Biography', 'Crime', 'Drama'], director: 'Martin Scorsese', writers: ['Nicholas Pileggi', 'Martin Scorsese'], cast: ['Ray Liotta', 'Robert De Niro', 'Joe Pesci', 'Lorraine Bracco'], overview: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen and his partners Jimmy Conway and Tommy DeVito.', trailer: 'https://www.youtube.com/watch?v=qo5jJpHtI1Y', language: 'English', country: 'United States', budget: 25000000, boxOffice: 47000000, companies: ['Warner Bros. Pictures', 'Irwin Winkler Productions'], poster: '/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', backdrop: '', popularity: 78 },
  { id: 20, title: 'Se7en', tagline: 'Seven deadly sins. Seven ways to die.', date: '1995-09-22', rating: 8.6, runtime: 127, genres: ['Crime', 'Mystery', 'Thriller'], director: 'David Fincher', writers: ['Andrew Kevin Walker'], cast: ['Brad Pitt', 'Morgan Freeman', 'Gwyneth Paltrow', 'Kevin Spacey'], overview: 'Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.', trailer: 'https://www.youtube.com/watch?v=znmZoVkCjpI', language: 'English', country: 'United States', budget: 33000000, boxOffice: 327311859, companies: ['New Line Cinema', 'Cecchi Gori Pictures'], poster: '/191nKfP0ehp3uIvWqgPbFmI4lv9.jpg', backdrop: '', popularity: 82 },
  { id: 21, title: 'The Silence of the Lambs', tagline: 'To enter the mind of a killer she must challenge the mind of a madman.', date: '1991-02-14', rating: 8.6, runtime: 118, genres: ['Crime', 'Drama', 'Thriller'], director: 'Jonathan Demme', writers: ['Ted Tally', 'Thomas Harris'], cast: ['Jodie Foster', 'Anthony Hopkins', 'Scott Glenn', 'Ted Levine'], overview: 'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.', trailer: 'https://www.youtube.com/watch?v=W6Mm8Sbe__o', language: 'English', country: 'United States', budget: 19000000, boxOffice: 272742922, companies: ['Orion Pictures', 'Strong Heart/Demme Production'], poster: '/uS9m8OBk1dGD1OxmbHrbTVVAvO0.jpg', backdrop: '', popularity: 80 },
  { id: 22, title: 'The Lion King', tagline: 'Life’s greatest adventure.', date: '1994-06-24', rating: 8.5, runtime: 88, genres: ['Animation', 'Adventure', 'Drama'], director: 'Roger Allers, Rob Minkoff', writers: ['Irene Mecchi', 'Jonathan Roberts', 'Linda Woolverton'], cast: ['Matthew Broderick', 'Jeremy Irons', 'James Earl Jones', 'Whoopi Goldberg'], overview: 'Lion prince Simba flees his kingdom after the murder of his father, only to learn the true meaning of responsibility and bravery.', trailer: 'https://www.youtube.com/watch?v=4sj1MT05lAA', language: 'English', country: 'United States', budget: 45000000, boxOffice: 968483777, companies: ['Walt Disney Pictures', 'Walt Disney Feature Animation'], poster: '/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg', backdrop: '', popularity: 85 },
  { id: 23, title: 'Schindler’s List', tagline: 'Whoever saves one life, saves the world entire.', date: '1993-12-15', rating: 9.0, runtime: 195, genres: ['Biography', 'Drama', 'History'], director: 'Steven Spielberg', writers: ['Steven Zaillian', 'Thomas Keneally'], cast: ['Liam Neeson', 'Ben Kingsley', 'Ralph Fiennes', 'Caroline Goodall'], overview: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce and risks everything to save them.', trailer: 'https://www.youtube.com/watch?v=gG22XNhtnoY', language: 'English', country: 'United States', budget: 22000000, boxOffice: 322161245, companies: ['Universal Pictures', 'Amblin Entertainment'], poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', backdrop: '', popularity: 76 },
  { id: 24, title: 'Mad Max: Fury Road', tagline: 'What a lovely day.', date: '2015-05-15', rating: 8.1, runtime: 120, genres: ['Action', 'Adventure', 'Sci-Fi'], director: 'George Miller', writers: ['George Miller', 'Brendan McCarthy', 'Nick Lathouris'], cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult', 'Hugh Keays-Byrne'], overview: 'In a post-apocalyptic wasteland, Max teams up with Furiosa to flee a cult tyrant and his army in a high-octane chase across the desert.', trailer: 'https://www.youtube.com/watch?v=hEJnMQG9ev8', language: 'English', country: 'Australia', budget: 150000000, boxOffice: 380000000, companies: ['Warner Bros. Pictures', 'Village Roadshow', 'Kennedy Miller Mitchell'], poster: '/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', backdrop: '', popularity: 84 },
  { id: 25, title: 'Everything Everywhere All at Once', tagline: 'The universe is so much bigger than you realize.', date: '2022-03-25', rating: 7.8, runtime: 139, genres: ['Action', 'Comedy', 'Sci-Fi'], director: 'Daniel Kwan, Daniel Scheinert', writers: ['Daniel Kwan', 'Daniel Scheinert'], cast: ['Michelle Yeoh', 'Stephanie Hsu', 'Ke Huy Quan', 'Jamie Lee Curtis'], overview: 'An aging Chinese immigrant is swept up in an insane adventure in which she alone can save the world by exploring other universes connecting with the lives she could have led.', trailer: 'https://www.youtube.com/watch?v=wxN1T1uxQ2g', language: 'English', country: 'United States', budget: 25000000, boxOffice: 143000000, companies: ['A24', 'AGBO', 'Ley Line Entertainment'], poster: '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', backdrop: '', popularity: 88 },
  { id: 26, title: 'Blade Runner 2049', tagline: 'The key to the future is finally unearthed.', date: '2017-10-06', rating: 8.0, runtime: 164, genres: ['Drama', 'Mystery', 'Sci-Fi'], director: 'Denis Villeneuve', writers: ['Hampton Fancher', 'Michael Green'], cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Jared Leto'], overview: 'Young Blade Runner K’s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who’s been missing for thirty years.', trailer: 'https://www.youtube.com/watch?v=gCcx85zbxz4', language: 'English', country: 'United States', budget: 150000000, boxOffice: 267000000, companies: ['Warner Bros. Pictures', 'Alcon Entertainment', 'Columbia Pictures'], poster: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', backdrop: '', popularity: 79 },
  { id: 27, title: 'La La Land', tagline: 'Here’s to the fools who dream.', date: '2016-12-09', rating: 8.0, runtime: 128, genres: ['Comedy', 'Drama', 'Music', 'Romance'], director: 'Damien Chazelle', writers: ['Damien Chazelle'], cast: ['Ryan Gosling', 'Emma Stone', 'John Legend', 'Rosemarie DeWitt'], overview: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.', trailer: 'https://www.youtube.com/watch?v=0pdqf4P9MB8', language: 'English', country: 'United States', budget: 30000000, boxOffice: 448000000, companies: ['Summit Entertainment', 'Black Label Media'], poster: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', backdrop: '', popularity: 83 },
  { id: 28, title: 'Top Gun: Maverick', tagline: 'Feel the need… the need for speed.', date: '2022-05-27', rating: 8.2, runtime: 130, genres: ['Action', 'Drama'], director: 'Joseph Kosinski', writers: ['Ehren Kruger', 'Eric Warren Singer', 'Christopher McQuarrie'], cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly', 'Jon Hamm'], overview: 'After more than thirty years of service, Maverick is back, training a detachment of graduates for a specialized mission the likes of which no living pilot has ever seen.', trailer: 'https://www.youtube.com/watch?v=qSqVVswa420', language: 'English', country: 'United States', budget: 170000000, boxOffice: 1496000000, companies: ['Paramount Pictures', 'Skydance', 'Jerry Bruckheimer Films'], poster: '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', backdrop: '', popularity: 94 },
  { id: 29, title: 'The Prestige', tagline: 'Are you watching closely?', date: '2006-10-20', rating: 8.5, runtime: 130, genres: ['Drama', 'Mystery', 'Sci-Fi'], director: 'Christopher Nolan', writers: ['Christopher Nolan', 'Jonathan Nolan'], cast: ['Christian Bale', 'Hugh Jackman', 'Scarlett Johansson', 'Michael Caine'], overview: 'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.', trailer: 'https://www.youtube.com/watch?v=o4gHCmTQDVI', language: 'English', country: 'United States', budget: 40000000, boxOffice: 109676311, companies: ['Touchstone Pictures', 'Warner Bros. Pictures', 'Syncopy'], poster: '/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg', backdrop: '', popularity: 81 },
  { id: 30, title: 'Coco', tagline: 'The celebration of a lifetime.', date: '2017-11-22', rating: 8.4, runtime: 105, genres: ['Animation', 'Adventure', 'Family', 'Music'], director: 'Lee Unkrich, Adrian Molina', writers: ['Adrian Molina', 'Matthew Aldrich'], cast: ['Anthony Gonzalez', 'Gael García Bernal', 'Benjamin Bratt', 'Alanna Ubach'], overview: 'Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather, a legendary singer, and uncovers his family’s history.', trailer: 'https://www.youtube.com/watch?v=Rvr68u6k5sI', language: 'English', country: 'United States', budget: 175000000, boxOffice: 807817000, companies: ['Pixar Animation Studios', 'Walt Disney Pictures'], poster: '/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg', backdrop: '', popularity: 86 }
];


/* ------------- Replaceable API layer -------------
   Paste a free TMDB API key (v3 "API Key") below to load ~500+ real
   movies from themoviedb.org instead of the 30 built-in ones.
   Get one at https://www.themoviedb.org/settings/api (free account).
   Leave empty to use the local dataset above.
   NOTE: a TMDB v3 key in a static site is visible to visitors – fine for
   a portfolio project, but don't reuse a key that matters. */
const TMDB_API_KEY = '';

const TMDB = {
  base: 'https://api.themoviedb.org/3',
  genres: { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western' },
  langName(code) { try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code; } catch { return code; } },

  async get(path, params = '') {
    const res = await fetch(`${this.base}${path}?api_key=${TMDB_API_KEY}&language=en-US${params}`);
    if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
    return res.json();
  },

  /** list item -> app movie shape (details fields filled in later) */
  fromList(r) {
    return {
      id: r.id, title: r.title, tagline: '', date: r.release_date || '1900-01-01',
      rating: Math.round((r.vote_average || 0) * 10) / 10, runtime: 0,
      genres: (r.genre_ids || []).map(g => this.genres[g]).filter(Boolean),
      director: '', writers: [], cast: [], overview: r.overview || 'No overview available.',
      trailer: '', language: this.langName(r.original_language), country: '', budget: 0, boxOffice: 0,
      companies: [], poster: r.poster_path || '', backdrop: r.backdrop_path || '', popularity: r.popularity || 0,
      _votes: r.vote_count || 0
    };
  },

  fromDetails(d) {
    const crew = d.credits?.crew || [];
    const dirs = crew.filter(c => c.job === 'Director').map(c => c.name);
    const writers = [...new Set(crew.filter(c => ['Screenplay', 'Writer', 'Story'].includes(c.job)).map(c => c.name))];
    const vids = d.videos?.results || [];
    const t = vids.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) || vids.find(v => v.site === 'YouTube' && v.type === 'Trailer') || vids.find(v => v.site === 'YouTube');
    return {
      ...this.fromList({ ...d, genre_ids: (d.genres || []).map(g => g.id) }),
      tagline: d.tagline || '', runtime: d.runtime || 0,
      director: dirs.join(', ') || 'Unknown', writers: writers.slice(0, 4),
      cast: (d.credits?.cast || []).slice(0, 8).map(c => c.name),
      trailer: t ? `https://www.youtube.com/watch?v=${t.key}` : '',
      language: (d.spoken_languages?.[0]?.english_name) || this.langName(d.original_language),
      country: (d.production_countries || []).map(c => c.name).join(', ') || 'N/A',
      budget: d.budget || 0, boxOffice: d.revenue || 0,
      companies: (d.production_companies || []).map(c => c.name)
    };
  },

  languages: [['en', 'English'], ['hi', 'Hindi'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ml', 'Malayalam'], ['kn', 'Kannada'], ['ko', 'Korean'], ['ja', 'Japanese'], ['zh', 'Chinese'], ['fr', 'French'], ['es', 'Spanish'], ['de', 'German'], ['it', 'Italian'], ['pt', 'Portuguese'], ['ru', 'Russian'], ['tr', 'Turkish'], ['th', 'Thai'], ['sv', 'Swedish']],

  _page(r, extra = {}) {
    return {
      results: (r.results || []).filter(x => x.poster_path && x.release_date).map(x => this.fromList(x)),
      totalPages: Math.min(r.total_pages || 1, 500), total: r.total_results || 0, ...extra
    };
  },

  /** Server-side filtering over the ENTIRE TMDB catalogue. f: {genre(name), year, minRating, language(code), sort} */
  async discover(f = {}, page = 1) {
    const today = new Date().toISOString().slice(0, 10);
    const gid = Object.keys(this.genres).find(k => this.genres[k] === f.genre);
    const sorts = {
      popularity: '&sort_by=popularity.desc',
      rating: '&sort_by=vote_average.desc&vote_count.gte=300',
      newest: `&sort_by=primary_release_date.desc&primary_release_date.lte=${today}&vote_count.gte=15`
    };
    let p = `&page=${page}&include_adult=false` + (sorts[f.sort] || sorts.popularity);
    if (gid) p += `&with_genres=${gid}`;
    if (f.year) p += `&primary_release_year=${f.year}`;
    if (Number(f.minRating) > 0) p += `&vote_average.gte=${f.minRating}&vote_count.gte=100`;
    if (f.language) p += `&with_original_language=${f.language}`;
    return this._page(await this.get('/discover/movie', p));
  },

  /** Title search + actor/director search (via people's known-for) + year/genre keywords. */
  async search(q, page = 1) {
    q = q.trim();
    if (/^(19|20)\d\d$/.test(q)) return this.discover({ year: q, sort: 'popularity' }, page);
    const g = Object.values(this.genres).find(n => n.toLowerCase() === q.toLowerCase());
    if (g) return this.discover({ genre: g, sort: 'popularity' }, page);
    const enc = `&query=${encodeURIComponent(q)}&include_adult=false&page=${page}`;
    const [movies, people] = await Promise.all([
      this.get('/search/movie', enc),
      page === 1 ? this.get('/search/person', `&query=${encodeURIComponent(q)}`) : Promise.resolve({ results: [] })
    ]);
    const out = this._page(movies);
    const known = (people.results || []).slice(0, 3).flatMap(p => p.known_for || []).filter(k => k.media_type === 'movie');
    const seen = new Set(out.results.map(m => m.id));
    const extra = this._page({ results: known }).results.filter(m => !seen.has(m.id));
    out.results = [...extra, ...out.results];   // matching people's films first
    out.total += extra.length;
    return out;
  },

  async list() {
    const cached = sessionStorage.getItem('cinevault:tmdb-list');
    if (cached) { try { return JSON.parse(cached); } catch { /* refetch */ } }
    const pages = (endpoint, n, extra = '') => Array.from({ length: n }, (_, i) => this.get(endpoint, `&page=${i + 1}${extra}`));
    const results = await Promise.all([
      ...pages('/movie/popular', 12),
      ...pages('/movie/top_rated', 12),
      ...pages('/movie/now_playing', 4)
    ]);
    const seen = new Map();
    results.flatMap(r => r.results).forEach(r => { if (r.poster_path && r.release_date && !seen.has(r.id)) seen.set(r.id, this.fromList(r)); });
    const out = [...seen.values()];
    try { sessionStorage.setItem('cinevault:tmdb-list', JSON.stringify(out)); } catch { /* quota */ }
    return out;
  }
};

const MovieAPI = {
  /** true when using the live TMDB data source */
  live: !!TMDB_API_KEY,

  /** Simulated network latency so loading states are visible (local mode). */
  _delay(ms = 450) { return new Promise(r => setTimeout(r, ms)); },

  /** Return every movie. */
  async getAll() {
    if (this.live) {
      try { return await TMDB.list(); }
      catch (e) { console.warn('TMDB failed, using local data:', e); this.live = false; }
    }
    await this._delay();
    return MOVIES.map(m => ({ ...m }));
  },

  /** Return one movie by id (or null). */
  async getById(id) {
    if (this.live) {
      try { return TMDB.fromDetails(await TMDB.get(`/movie/${Number(id)}`, '&append_to_response=credits,videos')); }
      catch (e) { if (/404/.test(e.message)) return null; throw e; }
    }
    await this._delay(300);
    const m = MOVIES.find(x => x.id === Number(id));
    return m ? { ...m } : null;
  },

  /** Build an image URL. size: w342 | w500 | w780 | w1280 | original */
  image(path, size = 'w500') {
    return path ? IMG_BASE + size + path : '';
  }
};
