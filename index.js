const fs = require("fs");
const http = require("http");
const request = require("requests");
const url = require("url");

const searchFile = fs.readFileSync("search.html", "utf-8");
const homeFile = fs.readFileSync("index.html", "utf-8");
// console.log(searchFile);

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%city%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstaus%}", orgVal.weather[0].main);

  return temperature;
};

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    res.write(searchFile);
    res.end();
  }
  else if (req.method === "GET" && req.url.startsWith("/search")) {
    const queryObject = url.parse(req.url, true).query;
    const city = queryObject.city;
    const country = queryObject.country;

    request(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=a6835fc714ca7e7b0881adeb79dee4ac`
    )
      .on("data", (chunk) => {
        const objData = JSON.parse(chunk);
        const arrData = [objData];

        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join(" ");
        res.write(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("Connection lost due to errors", err);
        res.end();
      });

    // res.writeHead(200, { "Content-Type": "text/html" });
    // res.write(`<h1>Search Results</h1>`);
    // res.write(`<p>City: ${city}</p>`);
    // res.write(`<p>Country: ${country}</p>`);
    // res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(8000, "127.0.0.1");
