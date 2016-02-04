var express = require("express");
    app = express();

app.use((req, res) => {
    res.send("It works!");
});

app.listen(process.env.PORT || 3000);

require("./index");
