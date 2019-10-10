const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/connect', (req, res) => {
    res.send(`Full name is:${req.body.fname} ${req.body.lname} Timestamp: ${Date.now()}.`);
});

const port = 8040;

app.listen(port, () => {
    console.log(`Server running on port${port}`);
});

router.get('/', function(req, res, next) {
    res.render('connect.html', { title: 'Connect' });
});

module.exports = router;