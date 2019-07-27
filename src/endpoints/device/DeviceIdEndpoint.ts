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
import {Business, Device, Session, SessionValidator} from "../../objects/Objects";
import {StandardType} from "typit";
import {ECMQuery} from "@elijahjcobb/maria";

export class DeviceIdEndpoint extends ECSRouter {

	public getRouter(): Express.Router {

		this.add(new ECSRoute(
			ECSRequestType.GET,
			"/",
			DeviceIdEndpoint.get,
			new ECSValidator(
				undefined,
				SessionValidator.init().business()
			)
		));

		this.add(new ECSRoute(
			ECSRequestType.PUT,
			"/url",
			DeviceIdEndpoint.updateUrl,
			new ECSValidator(
				new ECSTypeValidator({
					url: StandardType.STRING
				}),
				SessionValidator.init().business()
			)
		));

		this.add(new ECSRoute(
			ECSRequestType.PUT,
			"/name",
			DeviceIdEndpoint.updateName,
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

		const deviceId: string = req.getParameters().get("deviceId") as string;
		const device: Device | undefined = await ECMQuery.getObjectWithId(Device, deviceId, true);
		if (!device) throw ECSError.init().show().code(404).msg("A device does not exist for this id.");
		if (device.props.businessId !== business.id) throw ECSError.init().show().code(401).msg("You do not manage this device.");

		return new ECSResponse(device.getJSON());

	}

	private static async updateName(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const business: Business = await session.getBusiness();

		const deviceId: string = req.getParameters().get("deviceId") as string;
		const device: Device | undefined = await ECMQuery.getObjectWithId(Device, deviceId, true);
		if (!device) throw ECSError.init().show().code(404).msg("A device does not exist for this id.");
		if (device.props.businessId !== business.id) throw ECSError.init().show().code(401).msg("You do not manage this device.");

		device.props.name = req.get("name");
		await device.updateProps("name");

		return new ECSResponse(device.getJSON());

	}

	private static async updateUrl(req: ECSRequest): Promise<ECSResponse> {

		const session: Session = req.getSession();
		const business: Business = await session.getBusiness();

		const deviceId: string = req.getParameters().get("deviceId") as string;
		const device: Device | undefined = await ECMQuery.getObjectWithId(Device, deviceId, true);
		if (!device) throw ECSError.init().show().code(404).msg("A device does not exist for this id.");
		if (device.props.businessId !== business.id) throw ECSError.init().show().code(401).msg("You do not manage this device.");

		device.props.url = req.get("url");
		await device.updateProps("url");

		return new ECSResponse(device.getJSON());

	}

}