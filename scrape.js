//require image-scraper to pull images from source (requires npm install image-scraper)
//image-scraper uses cheerio.js
var Scraper = require("image-scraper");
var mysql = require("mysql");
var fs = require("fs");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "pokemon_db"
});

connection.query("SELECT * FROM pokemon WHERE id BETWEEN 1 AND 151", function (err, data) {
    scrape(data).then((data) => {
        // data.forEach((obj, i) => {
        //     connection.query("INSERT INTO images (id, url) VALUES (?, ?)", [obj.id, obj.url], (err, res) => {
        //         if (err) throw err;
        //         console.log("Saved " + obj.id);
        //         if (i >= data.length - 1) {
        //             console.log("Finished");
        //             connection.end();
        //         }
        //     });
        // });
        console.log("fin")
        connection.end();
    });

    // // console.log(data);
    // var count = 0;
    // data.forEach((pokemon) => {
    //     // console.log(pokemon);

    //     var indexedName = pokemon.name.toLowerCase().replace(/[^a-z]/g, "")

    //     if (indexedName === "nidoran") {
    //         if (pokemon.id === 29) {
    //             indexedName = "nidoranf"
    //         } else {
    //             indexedName = "nidoranm"
    //         }
    //     }

    //     var str = pokemon.id + "," +
    //         indexedName + "," +
    //         pokemon.name + "," +
    //         pokemon.type1 + "," +
    //         pokemon.type2 + "," +
    //         pokemon.total + "," +
    //         pokemon.hp + "," +
    //         pokemon.atk + "," +
    //         pokemon.def + "," +
    //         pokemon.spAtk + "," +
    //         pokemon.spDef + "," +
    //         pokemon.speed + "," +
    //         pokemon.generation + "," +
    //         pokemon.legendary + "\n";

    //     // console.log(str);

    //     fs.appendFile("Pokemon.csv", str, (err) => {
    //         if (err) throw err;
    //         console.log("count: " + count);
    //         console.log(str);
    //         count++;
    //         if (count === 151) {
    //             console.log("Finished");
    //             connection.end();
    //         }
    //     });
    // });
});

function scrape(data) {
    return new Promise((resolve, reject) => {
        // var res = resolve;
        var saved = [];
        var list = [];
        data.forEach((pokemon) => {

            // console.log(pokemon.id);
            urlId = pokemon.id.toString();
            if (urlId.length === 2) {
                urlId = "0" + urlId;
            } else if (urlId.length === 1) {
                urlId = "00" + urlId;
            }

            // console.log(urlId);
            var name = pokemon.name;

            if (name.slice(-1) === "?") {
                name = name.substring(0, name.length - 1);
            }

            name = name.replace(" ", "_");
            name = name.replace("'", "%27");

            // console.log("Name: " + name);
            var filename = urlId + name;

            var scrapeUrl = "https://bulbapedia.bulbagarden.net/wiki/File:" + filename + ".png";
            // console.log(scrapeUrl);
            var scraper = new Scraper(scrapeUrl);

            //Scrape function serches for specific image files with 600px           
            scraper.scrape(function (image) {

                // console.log("image found");
                if (saved.indexOf(image.name) === -1 && (image.name === filename || image.name.substring(0, 3) === "600")) {
                    saved.push(image.name);
                    // console.log("Saved: ", saved.length);
                    image.saveTo = "C:/Users/Tartarus/Desktop/uofa/Tools/scraper/imgs/";
                    image.save();
                    // console.log(image.name);
                    //appends image file and link address to folder 
                    var str = pokemon.id + ", " + image.address + ", https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + pokemon.id + ".png\n";
                    fs.appendFile("images.csv", str, function (err) {
                        if (err) throw err;
                        let newObj = {
                            url: image.address,
                            id: pokemon.id
                        }
                        list.push(newObj);
                        // console.log("List: " + list.length);
                        if (list.length >= 151) {
                            resolve(list);
                        }
                    });
                }
            });
        });
    });
}