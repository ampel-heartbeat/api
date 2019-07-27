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
	ECSRouter, ECSTypeValidator,
	ECSValidator
} from "@elijahjcobb/server";
import * as Express from "express";
import {Session, User, SessionValidator} from "../../objects/Objects";
import {StandardType} from "typit";

export class UserMeEndpoint extends ECSRouter {

	public getRouter(): Express.Router {

		this.add(new ECSRoute(
			ECSRequestType.GET,
			"/",
			UserMeEndpoint.getMe,
			new ECSValidator(undefined, SessionValidator.init().user())
		));

		this.add(new ECSRoute(
			ECSRequestType.PUT,
			"/name",
			UserMeEndpoint.updateName,
			new ECSValidator(
				new ECSTypeValidator({
					firstName: StandardType.STRING,
					lastName: StandardType.STRING
				}),
				SessionValidator.init().user()
			)
		));

		this.add(new ECSRoute(
			ECSRequestType.PUT,
			"/email",
			UserMeEndpoint.updateEmail,
			new ECSValidator(
				new ECSTypeValidator({
					email: StandardType.STRING,
					password: StandardType.STRING
				}),
				SessionValidator.init().user()
			)
		));

		this.add(new ECSRoute(
			ECSRequestType.PUT,
			"/password",
			UserMeEndpoint.updatePassword,
			new ECSValidator(
				new ECSTypeValidator({
					old: StandardType.STRING,
					new: StandardType.STRING
				}),
				SessionValidator.init().user()
			)
		));

		return this.createRouter();

	}

	private static async getMe(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const user: User = await session.getUser();

		return new ECSResponse(user.getJSON());

	}

	private static async updateName(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const user: User = await session.getUser();

		user.props.firstName = req.get("firstName");
		user.props.lastName = req.get("lastName");

		await user.updateProps("firstName", "lastName");

		return new ECSResponse(user.getJSON());

	}

	private static async updateEmail(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const user: User = await session.getUser();

		const pepperProvided: Buffer = User.generatePepper(user.props.salt as Buffer, req.get("password"));
		if (!User.peppersAreEqual(user.props.pepper as Buffer, pepperProvided)) throw ECSError.init().show().code(401).msg("Incorrect password.");

		user.props.email = req.get("email");
		await user.updateProps("email");

		return new ECSResponse(user.getJSON());

	}

	private static async updatePassword(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const user: User = await session.getUser();

		const pepperProvided: Buffer = User.generatePepper(user.props.salt as Buffer, req.get("old"));
		if (!User.peppersAreEqual(user.props.pepper as Buffer, pepperProvided)) throw ECSError.init().show().code(401).msg("Incorrect password.");

		user.props.pepper = User.generatePepper(user.props.salt as Buffer, req.get("new"));
		await user.updateProps("pepper");

		return new ECSResponse(user.getJSON());

	}

}