const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

//Connecting MongoDB using Mongoose
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log(''))
  .catch((err) => console.log(err));

const port = process.env.PORT;
app.listen(port, () => {
  console.log('Listining on port :' + port);
});

// console.log(app.get('env'));
// console.log(process.env);
