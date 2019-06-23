'use strict';

import { Request, Response } from "express";

export let getApi = (req: Request, res: Response) => {
    res.json({"message": "Hello"});
};

export let newParty = (req: Request, res: Response) => {
    res.json({"message": "Hello"});
};

export let authCode = (req: Request, res: Response) => {
    res.json({"message": "Hello"});
};

export let leaveParty = (req: Request, res: Response) => {
    res.json({"message": "Hello"});
};

export let authAdminCode = (req: Request, res: Response) => {
    res.json({"message": "Hello"});
};

export let authCallback = (req: Request, res: Response) => {
    res.json({"message": "Hello"});
};

export let testPartyCode = (req: Request, res: Response) => {
    res.json({"message": "Hello"});
};
