
(function () {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var empty = document.getElementById('search-empty');
    var data = window.MOVIE_SEARCH_DATA || MOVIE_SEARCH_DATA || [];

    if (!input || !results) {
        return;
    }

    function paramsQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="' + escapeHtml(movie.url) + '" class="card-link">' +
            '<div class="poster-wrap">' +
            '<img src="./' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '</div>' +
            '<div class="card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-list">' + tags + '</div>' +
            '<div class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function render(query) {
        var normalized = query.trim().toLowerCase();
        var matched = data.filter(function (movie) {
            var text = [
                movie.title,
                movie.oneLine,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return !normalized || text.indexOf(normalized) !== -1;
        }).slice(0, 120);

        results.innerHTML = matched.map(card).join('');
        if (empty) {
            empty.classList.toggle('show', matched.length === 0);
        }
    }

    var firstQuery = paramsQuery();
    input.value = firstQuery;
    render(firstQuery);

    input.addEventListener('input', function () {
        render(input.value);
    });
})();
