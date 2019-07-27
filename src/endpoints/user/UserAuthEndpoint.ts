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

import {
	ECSError,
	ECSRequest,
	ECSRequestType,
	ECSResponse,
	ECSRoute,
	ECSRouter,
	ECSTypeValidator,
	ECSValidator
} from "@elijahjcobb/server";
import { StandardType } from "typit";
import * as Express from "express";
import {User, Session, UserProps} from "../../objects/Objects";
import { ECMQuery } from "@elijahjcobb/maria";
import { ECSQLCMD } from "@elijahjcobb/sql-cmd";


export class UserAuthEndpoint extends ECSRouter {

	public getRouter(): Express.Router {

		this.add(new ECSRoute(
			ECSRequestType.POST,
			"/sign-up",
			UserAuthEndpoint.signUp,
			new ECSValidator( new ECSTypeValidator({
				email: StandardType.STRING,
				password: StandardType.STRING
			}))
		));

		this.add(new ECSRoute(
			ECSRequestType.POST,
			"/sign-in",
			UserAuthEndpoint.signIn,
			new ECSValidator( new ECSTypeValidator({
				email: StandardType.STRING,
				password: StandardType.STRING
			}))
		));

		return this.createRouter();

	}

	private static async signUp(req: ECSRequest): Promise<ECSResponse> {

		const email: string = req.get("email");
		const password: string = req.get("password");

		const user: User = new User();
		user.props.email = email;
		user.props.salt = User.generateSalt();
		user.props.pepper = User.generatePepper(user.props.salt, password);
		await user.create();

		const session: Session = await user.generateSession();

		return new ECSResponse(session.generateToken());

	}

	private static async signIn(req: ECSRequest): Promise<ECSResponse> {

		const email: string = req.get("email");
		const password: string = req.get("password");

		const query: ECMQuery<User, UserProps> = new ECMQuery(
			User,
			ECSQLCMD
				.select()
				.where("email", "=", email)
		);
		const user: User | undefined = await query.getFirstObject(true);
		if (!user) throw ECSError.init().show().code(404).msg("Incorrect email.");
		if (!user.props.salt) throw ECSError.init().code(500).msg("User does not have a salt.");
		if (!user.props.pepper) throw ECSError.init().code(500).msg("User does not have a pepper.");
		const providedPepper: Buffer = User.generatePepper(user.props.salt, password);
		if (!User.peppersAreEqual(providedPepper, user.props.pepper)) throw ECSError.init().show().code(401).msg("Incorrect password.");

		const session: Session = await user.generateSession();

		return new ECSResponse(session.generateToken());

	}

}