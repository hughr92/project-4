// main app object
const app = {};
app.submit = $('#submit');

// moviesDB properties
app.moviesBaseURL = 'https://api.themoviedb.org/3';
app.moviesImageURL = 'https://image.tmdb.org/t/p/';
app.moviesImageWidth = 'w780';
app.moviesAPIKey = '0f074982f0e6a999d59865dff2184e86';
app.moviePage;
app.moviesGenreIDs = {
    convo: [80, 99, 9648],
    laughs: [35, 12, 18, 10751],
    cuddles: [27, 10749, 53]
};

// cocktail properties
app.cocktailBaseURL = 'https://www.thecocktaildb.com/api/json/v1/1/';
app.cocktailCategory = {
    Alcoholic: {
        first: ['Wine', 'Gin', 'Brandy'],
        friends: ['Tequila', 'Vodka', 'Rum'],
        relationship: ['Whiskey', 'Rum']
    },
        // add literals
    Non_Alcoholic: {
        first: ['', ''],
        friends: ['Milk', ''],
        relationship: ['Coffee', 'Tea']
    }
}


// app.getMovies(userGenre, userRating);
// requesting movie info from moviesDB API
app.getMovies = (userGenre, userRating) => {
    $.ajax({
        url: `${app.moviesBaseURL}/discover/movie`,
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: app.moviesAPIKey,
            language: 'en-US',
            sort_by: 'popularity.desc',
            with_genres: userGenre, // genre id
            'vote_average.gte': userRating // rating >= userRating
        }
    }).then((res) => {
        const totalPages = res.total_pages;
        const topPopular = Math.floor(totalPages * 0.2);
        const newPageNumber = app.getRandNum(topPopular)+1;

        $.ajax({
            url: `${app.moviesBaseURL}/discover/movie`,
            method: 'GET',
            dataType: 'json',
            data: {
                api_key: app.moviesAPIKey,
                language: 'en-US',
                sort_by: 'popularity.desc',
                with_genres: userGenre, // genre id
                'vote_average.gte': userRating, // rating =< userRating
                page: newPageNumber
            }
        }).then((res) => {
            // on random page
            const movie = res.results[app.getRandNum(20)]
            console.log(movie);

            // put movie into HTML
            app.displayMovie(movie);
        })
    })
};

app.getCocktail = (search)=> {
    $.ajax({
        url: `${app.cocktailBaseURL}${search}`,
        method: 'GET',
        dataType: 'json',
        data: {
            key: '1'
        }
    }).then((res)=> {
        console.log(res);

        console.log(app.getRandNum(res.drinks.length));
        app.randomDrinkNumber = app.getRandNum(res.drinks.length);


        const newSearch = `filter.php?i=${app.drinkType}`;
        console.log(app.drinkType);


        $.ajax({
            url: `${app.cocktailBaseURL}${newSearch}`,
            method: 'GET',
            dataType: 'json',
            data: {
                key: '1'
            }
        }).then((res)=>{
            // random array for drink - get ID
            console.log(res.drinks[app.randomDrinkNumber].idDrink);
            const getDrinkById = res.drinks[app.randomDrinkNumber].idDrink;

            $.ajax({
                url: `${app.cocktailBaseURL}lookup.php?i=${getDrinkById}`,
                method: 'GET',
                dataType: 'json',
                data: {
                    key: '1'
                }
            }).then((res) => {
                // grab drink data
                console.log(res);
                console.log(res.drinks[0]);
                app.displayDrink(res.drinks[0]);

            });
        });


    })
}

app.getDrink = ()=> {
    $.ajax({
        url: `${app.cocktailBaseURL}filter.php?a=Non_Alcoholic`,
        method: 'GET',
        dataType: 'json',
        data: {
            key: '1'
        }
    }).then((res)=>{
        const randomDrinkNumber = app.getRandNum(res.drinks.length);
        console.log(randomDrinkNumber);

        const drinkId = res.drinks[randomDrinkNumber].idDrink;
        console.log(drinkId);


        $.ajax({
            url: `${app.cocktailBaseURL}lookup.php?i=${drinkId}`,
            method: 'GET',
            dataType: 'json',
            data: {
                key: '1'
            }
        }).then((res)=>{
            console.log(res);
            app.displayDrink(res.drinks[0]);
        })


    })
}

// return random number
app.getRandNum = (num) => {
    return Math.floor(Math.random() * num);
}

app.displayMovie = (movie) => {
    const title = movie.title;
    const imgUrl = movie.poster_path;
    const rating = movie.vote_average;
    const releaseDate = movie.release_date;
    const overview = movie.overview;
    $('.movies-result__container').empty();
    // overview
    // release_date
    $('.movies-result__container').append(`
        <h3 class="result-title">${title}</h3>

        <button class="button more-info more-info--movies">i</button>

        <div class="results__image-container">
        <img src="${app.moviesImageURL +app.moviesImageWidth + imgUrl}" class="movie-image">
        </div>


        <div class="additional-movie-info">
            <i class="fas fa-times"></i>
            <h3>${title}</h3>
            <p class="movie-rating">${rating}</p>
            <p class="movie-release-date">${releaseDate}</p>
            <p class="movie-overview">${overview}</p>
        </div>
    `);

    // $('.movies-result').css('background', `url(${app.moviesImageURL + app.moviesImageWidth + imgUrl})`);
    // $('.movies-result').css('background-repeat', 'no-repeat');
    // $('.movies-result').css('background-size', '100%');
}

app.cleanObject = (object) => {
    for (let propName in object) {
        if (object[propName] === "") {
            delete object[propName];
        }
    }
}

app.displayDrink = (drink) => {
    const name = drink.strDrink;
    const imgUrl = drink.strDrinkThumb;

    const ingredients = Object.keys(drink).filter(function(k) {
        return k.indexOf('strIngredient') == 0;
    }).reduce(function(newKey, k) {
        if (drink[k] != null) {
            newKey[k] = drink[k].trim();
            return newKey;
        }
    }, {});

    const measurements = Object.keys(drink).filter(function (k) {
        return k.indexOf('strMeasure') == 0;
    }).reduce(function (newKey, k) {
        if (drink[k] != null) {
            newKey[k] = drink[k].trim();
            return newKey;
        }
    }, {});

    const instructions = drink.strInstructions;

    app.cleanObject(ingredients);
    app.cleanObject(measurements);

    const measurementsList = $('<ul>').addClass('measurement-list');
    const ingredientList = $('<ul>').addClass('ingredient-list');

    for (let prop in measurements) {
        const li = $('<li>').text(measurements[prop]);
        measurementsList.append(li);
    }

    for (let prop in ingredients) {
        const li = $('<li>').text(ingredients[prop]);
        ingredientList.append(li);
    }

    $('.drinks-result__container').empty();
    $('.drinks-result__container').append(`
        <h3 class="result-title">${name}</h3>
        <button class="button more-info more-info--drinks">i</button>

        <div class="results__image-container">
            <img src="${imgUrl}" class="drink-image">
        </div>

        <div class="additional-drink-info">
            <i class="fas fa-times"></i>
            <h3>${name}</h3>
            <div class="ingredients-container">
            </div>
        </div>
    `);

    $('.ingredients-container').append(measurementsList, ingredientList);
    $('.additional-drink-info').append(`<p>${instructions}</p>`);

    // $('.drinks-result').css('background', `url(${imgUrl})`);
}

app.generateDrink = (alcoholic) => {
    if (alcoholic === 'Alcoholic') {
        app.getCocktail(`filter.php?i=${app.drinkType}`);
    } else {
        app.getDrink()
    }
}

app.events = () => {
    $('#submit').on('click', function(e) {
        e.preventDefault();
        const genreCategory = $('input[name=genre]:checked').val();
        const genreIndexMax = app.moviesGenreIDs[genreCategory].length;
        const genreIndex = app.getRandNum(genreIndexMax);

        app.userGenre = app.moviesGenreIDs[genreCategory][genreIndex];
        app.userRating = parseInt($('input[name=rating]:checked').val());
        app.getMovies(app.userGenre, app.userRating);

        //cocktail api
        app.alcoholic = $('input[name=alcohol]:checked').val();
        const drinkCategory = $('input[name=category]:checked').val();
        const drinkArray = app.cocktailCategory[app.alcoholic][drinkCategory];
        const drinkNumber = app.getRandNum(drinkArray.length);
        app.drinkType = drinkArray[drinkNumber];
        console.log(app.drinkType);

        app.generateDrink(app.alcoholic);
        // get array of drinks by type - wine/shake/etc
        $('.section--results').css('display', 'flex');
        console.log('yes');

    });

    $('.another-movie').on('click', function(e) {
        e.preventDefault();
        app.getMovies(app.userGenre, app.userRating);
    })

    $('.another-drink').on('click', function(e) {
        e.preventDefault();
        app.generateDrink(app.alcoholic);
    })

    $('#planAnother').on('click', function(e) {
        e.preventDefault();
        $(window).scrollTop(0);
        location.reload();
    })

    $('body').on('click', '.more-info--drinks', function () {
        $('.additional-drink-info').css('display', 'flex');
    });

    $('body').on('click', '.more-info--movies', function () {
        $('.additional-movie-info').css('display', 'flex');

    });

    $('body').on('click', '.fa-times', function () {
        $('.additional-drink-info').css('display', 'none');
    });

    $('body').on('click', '.fa-times', function () {
        $('.additional-movie-info').css('display', 'none');
    });

    $(".button--header").click(function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#section1").offset().top
        }, 1000);
    });

    $('input[name=category]').click(function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#section2").offset().top
        }, 1000);
    });

    $('input[name=genre]').click(function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#section3").offset().top
        }, 1000);
    });

    $('input[name=rating]').click(function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#section4").offset().top
        }, 1000);
    });

    $('input[name=alcohol]').click(function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#submit").offset().top
        }, 1000);
    });

    $("#submit").click(function () {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#section-results").offset().top
        }, 1000);
    });


};

// init function
app.init = () => {
    // app.getCocktail(`filter.php?a=Non_Alcoholic`);

    // app.getCocktail(`filter.php?i=Coffee`);
    // app.getCocktail(`lookup.php?i=12770`);
    app.events();
}

$(function() {
    console.log("ready");
    app.init();
})


