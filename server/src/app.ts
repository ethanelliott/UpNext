import express from "express";
import bodyParser from "body-parser";
import helmet from 'helmet';
import dotenv from "dotenv";
import path from "path";
import cors from "./util/cors";

import * as apiController from "./controllers/api";

dotenv.config({path: ".env.development"});

const app = express();
app.set("port", process.env.PORT || 3000);
// app.use(bodyParser.json({limit: '512mb'}))
// app.use(bodyParser.urlencoded({limit: '512mb', extended: true}))
app.use(cors());
app.use(helmet());
app.use(bodyParser.json({limit: '512mb'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(
    express.static(path.join(__dirname, "public"), {maxAge: 31557600000})
);

// Routes
app.get("/api", apiController.getApi);
app.post('/party/new-party', apiController.newParty);
app.post('/party/auth-code', apiController.authCode);
app.post('/party/leave', apiController.leaveParty);
app.post('/party/auth-code-admin', apiController.authAdminCode);
app.get('/party/auth-callback', apiController.authCallback);
app.get('/party/test/:id', apiController.testPartyCode);

export default app;
