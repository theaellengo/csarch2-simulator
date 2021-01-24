const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');

app.use(express.json({ extended: false }));

app.engine(
  'hbs',
  exphbs({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
    stylesDir: path.join(__dirname, '/public/css')
  })
);
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use('/', require('./routes.js'));
app.use(express.static('js'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
