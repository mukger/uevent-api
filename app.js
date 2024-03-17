const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config.json');
const cors = require('cors');
const path = require("path");
const TokenService = require("./services/token-service");

const PORT = process.env.PORT || config.server.port;
const HOST = config.server.host

const ErrorHandler = require('./Middlewares/errorHandler');

const AuthRouter = require('./Routes/auth-router');
const EventRouter = require('./Routes/event-router');
const LocationRouter = require('./Routes/location-router');
const UserRouter = require('./Routes/user-router');
const CompanyRouter = require('./Routes/company-router');
const EventSubscriptionRouter = require('./Routes/event-subscription-router');
const CompanySubscriptionRouter = require('./Routes/company-subscription-router');
const NotificationRouter = require('./Routes/notification-router');
const TicketRouter = require('./Routes/ticket-router');
const PromocodeRouter = require('./Routes/promocode-router');
const CommentRouter = require('./Routes/comment-router');

const app = express();

var mysqlAdmin = require('node-mysql-admin');
const authMiddleware = require('./Middlewares/auth-middleware');

app.use('/myadmin', function(req, res, next) {
    if(req.query.access) {
        const userData = TokenService.validateAccessToken(req.query.access);
        if (!userData) {
            return res.status(403).send("Forbidden");
        }
        if(userData.user_role !== "admin") {
            return res.status(403).send("Forbidden");
        }
    }
    next();
  });

app.use(mysqlAdmin(app));



app.use(cors({
    origin: ['http://192.168.20.251:3000', 'http://localhost:3000'],
    credentials:true,
    methods:["GET" , "POST" , "PUT", "PATCH", "DELETE"],
    optionSuccessStatus:200
}));

app.use(express.json());
app.use(cookieParser());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', AuthRouter);
app.use('/api/event', EventRouter);
app.use('/api/location', LocationRouter);
app.use('/api/user', UserRouter);
app.use('/api/company', CompanyRouter);
app.use('/api/comment', CommentRouter);
app.use('/api/subscription/event', EventSubscriptionRouter);
app.use('/api/subscription/company', CompanySubscriptionRouter);
app.use('/api/notification', NotificationRouter);
app.use('/api/ticket', TicketRouter);
app.use('/api/promocode', PromocodeRouter);

app.use(ErrorHandler);

app.listen(PORT, () => {console.log(`Server start on https://${HOST}:${PORT}`)});