import fs from "fs";

fs.copyFileSync("./dist/index.html", "./dist/index-heroku.html");

function readWriteSync() {
  var data = fs.readFileSync("./dist/index-heroku.html", "utf-8");

  var newValue = data.replaceAll("ton-price-lock-front/", "");

  fs.writeFileSync("./dist/index-heroku.html", newValue, "utf-8");
}

readWriteSync();
