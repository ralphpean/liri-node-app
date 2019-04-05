// Require all the dependencies and variables
require("dotenv").config();
let fs = require("fs");
let Spotify = require("node-spotify-api");
let axios = require("axios");
let moment = require("moment");
let keys = require("./keys.js");
let spotify = new Spotify(keys.spotify);
let command = process.argv[2];
let arg = process.argv;
let reference = [];
let theSong = '';
let theMovie = '';
let theBand = '';
let filename = "log.txt";
let fullCommand = [];


//Users choice to accept several words 
for (let i = 3; i < arg.length; i++) {
    reference.push(arg[i])
}
let referenceBand = reference.join("");

//Logging full command
fullCommand.push(command);
if (reference.length != 0) {
    fullCommand.push(referenceBand);
}

//logging function 
function logging(value) {
    fs.appendFile(filename, ',' + value, function (err) {
        if (err) {
            return console.log("NO ERROR")
        }
    })
}
logging(fullCommand);

//Commands: 
//concert-this  ----- spotify-this-song ------ movie-this ---- do-what-it-says

if (command === 'concert-this') {
    concert(referenceBand);
} else if (command === 'spotify-this-song') {
    spotifySong(reference);
} else if (command === 'movie-this') {
    movie(reference);
} else if (command === 'do-what-it-says') {
    doThat();
}

//concert-this function 
function concert(referenceBand) {
    let bandUrl = "https://rest.bandsintown.com/artists/" + referenceBand + "/events?app_id=codingbootcamp";
    axios.get(bandUrl).then(
        function (response) {
            console.log("  ");
            console.log("************GETTING** BAND/ARTIST***INFO: " + referenceBand + "**************");
            for (let i = 0; i < response.data.length; i++) {
                let datetime = response.data[i].datetime;
                let dateArr = datetime.split('T');

                let concertResults =
                    "----------------------------------------------------------" +
                    "\nVenue Name: " + response.data[i].venue.name +
                    "\nVenue Location: " + response.data[i].venue.city +
                    "\nDate of the Event: " + moment(dateArr[0], "YYYY-DD-MM").format('MM\DD\YYYY');
                //Changes date to new format
                console.log(concertResults);
            } console.log("    ");
            console.log("************************************************  ");
            console.log("    ");
        })
        .catch(function (error) {
            console.log("This is the error: " + error);
        });
}

//spotify this-song function

function spotifySong(reference) {
    if (reference.length === 0) {
        reference = "The Sign";
    }
    spotify
        .search({ type: "track", query: reference })
        .then(function (response) {
            console.log("  ");
            console.log("********SPOTIFY****** " + reference + "****************");
            console.log("  ");
            for (let i = 0; i < 5; i++) {
                let spotifyResults =
                    "------------------------------------------------------------------" +
                    "\nArtist: " + response.tracks.items[i].artists[0].name +
                    "\nSong Name: " + response.tracks.items[i].name +
                    "\nAlbum Name: " + response.tracks.items[i].album.name +
                    "\n Preview Link: " + response.tracks.items[i].preview_url;

                console.log(spotifyResults);
            }
            console.log("    ");
            console.log("************************************************  ");
            console.log("    ");
        })
        .catch(function (err) {
            console.log(err);
        });

}

//movie-this function 
function movie(reference) {
    if (reference.length === 0) {
        reference = "mr nobody";
    }
    axios.get('http://www.omdbapi.com/?i=tt3896198&apikey=ee87fd00' + reference + '&plot=short&apikey=trillogy').then(
        function (response) {
            let rotten = response.data.Ratings[1]
            if (rotten === undefined) { rotten = "Not Available" }
            else { rotten = response.data.Ratings[1].Value; }
            console.log("    ");
            console.log("**********MOVIE****INFO****FOR************" + response.data.Title + "******************  ");
            console.log("    ");


            let movieResults =
                "\nTitle: " + response.data.Title +
                "\nYear: " + response.data.Year +
                "\nIMDB Rating: " + response.data.Rated +
                "\nRotten Tomatoes Rating: " + rotten +
                "\n Actors: " + response.data.Actors +
                "\n " +
                "\n **************************************************** " +
                "\n ";
            console.log(movieResults);

        })
        .catch(function (error) {
            console.log("This is the error: " + error);
        });
}

//do-what-it-says function 
function doThat() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        let dataArr = data.split(',');
        console.log('');
        console.log('-----------------Content---------------------');
        console.log('');
        for (let i = 0; i < dataArr.length; i++) {
            if (dataArr[i] === "spotify-this-song") {
                theSong = dataArr[++i];
                console.log("-----------Spotify-------" + theSong + "--------");
                spotifySong(theSong);
            } else if (dataArr[i] === "movie-this") {
                theMovie = dataArr[++i];
                console.log("-----------Watch-this-movie------" + theMovie + "------");
                movie(theMovie);
            } else if (dataArr[i] === 'concert-this') {
                theBand = dataArr[++i];
                console.log('-------Check this band----' + theBand + '----------')
                concert(theBand);
            } else {
                console.log("Sorry, Command is not accepted");
            }
        }
    })

}