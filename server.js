import express from 'express';
import connectToDB from './connect.js';
import requestLogger from './middlewares/requestLogger.js';
import routes from './routes/main.js';
// import getUserFromAuthToken from './middlewares/getUserFromAuthToken.js';
import path from 'path'; // Import path module to resolve the directory

let app;


connectToDB().then(function (connectMessage) {
    console.log(connectMessage);
    app = express();

    app.use(express.static(path.join(process.cwd(), 'public')));

    // Middleware to parse incoming JSON data
    app.use(express.json());

    // Middleware to extract user from auth token
    // app.use(getUserFromAuthToken);

    // Set up routes
    app.use('/api',routes);

    app.use(requestLogger);

    const port = process.env.PORT || 4000;
    app.listen(port, function () {
        console.log("Server running on PORT", port);
    });
}).catch(function (err) {
    console.error(err);
});

export default app;