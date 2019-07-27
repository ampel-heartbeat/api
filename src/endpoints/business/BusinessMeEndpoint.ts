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
import * as Express from "express";
import {Business, Session, SessionValidator, User} from "../../objects/Objects";
import {StandardType} from "typit";

export class BusinessMeEndpoint extends ECSRouter {

	public getRouter(): Express.Router {

		this.add(new ECSRoute(
			ECSRequestType.GET,
			"/",
			BusinessMeEndpoint.get,
			new ECSValidator(
				undefined,
				SessionValidator.init().business()
			)
		));

		this.add(new ECSRoute(
			ECSRequestType.PUT,
			"/name",
			BusinessMeEndpoint.updateName,
			new ECSValidator(
				new ECSTypeValidator({
					name: StandardType.STRING
				}),
				SessionValidator.init().business()
			)
		));

		return this.createRouter();
	}

	private static async get(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const business: Business = await session.getBusiness();

		return new ECSResponse(business.getJSON());

	}

	private static async updateName(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const business: Business = await session.getBusiness();

		business.props.name = req.get("name");
		await business.updateProps("name");

		return new ECSResponse(business.getJSON());

	}

}