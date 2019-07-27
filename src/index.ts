/**
 *
 * Elijah Cobb
 * elijah@elijahcobb.com
 * https://elijahcobb.com
 *
 *
 * Copyright 2019 Elijah Cobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import {ECSError, ECSRequest, ECSServer} from "@elijahjcobb/server";
import {ECMDatabase, ECMQuery} from "@elijahjcobb/maria";
import {UserEndpoint} from "./endpoints/user/UserEndpoint";
import {BusinessEndpoint} from "./endpoints/business/BusinessEndpoint";
import {DeviceEndpoint} from "./endpoints/device/DeviceEndpoint";
import {Session} from "./objects/Objects";

ECMDatabase.init({
	database: "heartbeat"
});

const server: ECSServer = new ECSServer();

server.use("/user", new UserEndpoint());
server.use("/business", new BusinessEndpoint());
server.use("/device", new DeviceEndpoint());

server.setAuthorizationMiddleware(async (req: ECSRequest): Promise<ECSRequest> => {

	const bearerToken: string | undefined = req.getHeader("Authorization");
	if (!bearerToken) throw ECSError.init().show().code(401).msg("Authorization header has no value.");
	const token: string | undefined = bearerToken.split(" ")[1];
	if (!token) throw ECSError.init().show().code(401).msg("Authorization header has no bearer token.");
	const session: Session | undefined = await ECMQuery.getObjectWithId(Session, token, true);
	if (!session) throw ECSError.init().show().code(401).msg("Invalid session token.");

	req.setSession(session);

	return req;

});

server.startHTTP(80);