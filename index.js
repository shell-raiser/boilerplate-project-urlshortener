require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
const mySecret = process.env['MONGO_URI']
console.log(mySecret);
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }))


let URLSchema = new mongoose.Schema({
    url: {
        type: String,
    }
})

let URL = mongoose.model('URL', URLSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
    res.json({ greeting: 'hello API' });
});

function isValidURL(str) {
    var regex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if (!regex.test(str)) {
        return false;
    } else {
        return true;
    }
}

app.post('/api/shorturl', function(req, res) {
    let new_url = req.body.url;

    if (isValidURL(new_url)) {
        let doc = new URL({
            url: req.body.url,
        })
        doc.save((err, data) => {
            if (err) return console.error(err);
            res.json({
                original_url: data.url,
                short_url: data.id
            })
        });
    } else {
        res.json({ error: 'invalid url' })
    }

})

app.get('/api/shorturl/:ref', function(req, res) {
    URL.findById({ _id: req.params.ref }, (err, data) => {
        if (err) return console.log(err)
        else {
            res.redirect(data.url)
        }
    });
});

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});
