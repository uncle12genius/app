document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    fetchMovieDetails(1); // Fetch details for the first movie

    // Event delegation for buying tickets
    document.getElementById('movie-details').addEventListener('click', (event) => {
        if (event.target.id === 'buy-ticket-btn' && !event.target.classList.contains('sold-out')) {
            buyTicket(event.target.dataset.movieId);
        }
    });
});

function fetchMovies() {
    fetch('http://localhost:3000/films')
        .then(response => response.json())
        .then(movies => {
            const filmList = document.getElementById('films');
            filmList.innerHTML = '';
            movies.forEach(movie => {
                const li = document.createElement('li');
                li.classList.add('film-item');
                li.innerHTML = `
                    <img src="${movie.poster}" alt="${movie.title}">
                    <span>${movie.title}</span>
                `;
                if (movie.tickets_sold >= movie.capacity) {
                    li.classList.add('sold-out');
                }
                li.addEventListener('click', () => fetchMovieDetails(movie.id));
                filmList.appendChild(li);
            });
        });
}

function fetchMovieDetails(id) {
    fetch(`http://localhost:3000/films/${id}`)
        .then(response => response.json())
        .then(movie => {
            const details = document.getElementById('movie-details');
            const availableTickets = movie.capacity - movie.tickets_sold;
            details.innerHTML = `
                <h2>${movie.title}</h2>
                <img src="${movie.poster}" alt="${movie.title}">
                <p>Runtime: ${movie.runtime} mins</p>
                <p>Showtime: ${movie.showtime}</p>
                <p>Available Tickets: ${availableTickets}</p>
                <button id="buy-ticket-btn" data-movie-id="${movie.id}" class="${availableTickets === 0 ? 'sold-out' : ''}">
                    ${availableTickets === 0 ? 'Sold Out' : 'Buy Ticket'}
                </button>
            `;
        });
}

function buyTicket(movieId) {
    fetch(`http://localhost:3000/films/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            if (movie.tickets_sold < movie.capacity) {
                movie.tickets_sold += 1;
                fetch(`http://localhost:3000/films/${movieId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tickets_sold: movie.tickets_sold })
                })
                .then(() => {
                    // Update the displayed available tickets
                    fetchMovieDetails(movieId);
                    // Optionally re-fetch the movies to update the sold-out status in the menu
                    fetchMovies();
                });
            } else {
                alert('Movie is sold out!');
            }
        });
}
