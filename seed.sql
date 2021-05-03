DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books (
    
    id SERIAL PRIMARY KEY,
    url VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),   
    description TEXT

);

-- INSERT INTO books (title, author, url, description)
-- VALUES('hello','Ahmed Zatar', 'http://books.google.com/books/content?id=-otKEYNwP3oC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api','Add a little dog wisdom to your day ! This inspiring sketchbook is perfect for notes, as a journal, brainstorming, dog training class notes, or just doodling on those relaxing days with your dog . Makes an extraordinary gift for your favorite dog trainer . Each page has a dog wisdom life quote on the top of the page, with a paw print design on the bottom .Perfect size at 6"x9" to toss in your backpack, dog training bag, and take along on trips')