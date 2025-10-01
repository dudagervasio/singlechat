require('dotenv').config();

import axios from 'axios';
import express, { Request, Response } from 'express';
import { appendFileSync, readFileSync } from 'fs';
import http from "http";
import https from "https";

// INITIAL CHECKS
// const fails: string[] = [];
// if(!process.env.DGWA_SESSION_ID || process.env.DGWA_SESSION_ID.includes('unset')) fails.push('DGWA_SESSION_ID undefined');
// if(!process.env.ACCESS_TOKEN_SECRET) fails.push('ACCESS_TOKEN_SECRET undefined');
// if(fails.length > 0){
// 	console.log('ENV VARS NOT DEFINED');
// 	console.log(fails);
// }
const app = express();

let credentials : {
	key: string;
	cert: string;
} = {
	key: '',
	cert: ''
};

let forceHttp = process.env.FORCE_HTTP || 'N';

console.log({ forceHttp });

if(process.env.NODE_ENV === 'production' && forceHttp === 'N'  ){
	// Certificate
	const privateKey = readFileSync('/home/dgchat-cert.key', 'utf8');
	const certificate = readFileSync('/home/dgchat-cert.pem', 'utf8');
	credentials.key = privateKey;
	credentials.cert = certificate;
}
const cors = require('cors');
app.use( cors() );

app.get('/api', async (req: Request, res: Response) => {
	console.log('API root');
	res.status(200).send('API root');
	return;
});

app.get('/api/customers/:phoneNumber', async (req: Request, res: Response) => {
	console.log('/api/customers/:phoneNumber');
	console.log(req.params);
	let phoneNumber = req.params.phoneNumber;
	console.log({ phoneNumber })
	const params = new URLSearchParams();
	params.append("modo", "clientePorTelefone");
	params.append("telefone", phoneNumber);
	const url = `http://hidrata-indep.ddns.net:3300/soft/API.php?${params}`;
	const response = await axios.get(url);
	let customers = response.data || [];
	res.status(200).json(customers);
	return;
});




const httpServer = process.env.NODE_ENV === 'development' || forceHttp === 'S'
				? http.createServer(app)
				: https.createServer(credentials, app);
httpServer.listen(process.env.DG_SERVER_PORT, '0.0.0.0', () => {
	console.log(`listening on port ${process.env.DG_SERVER_PORT}`);
});