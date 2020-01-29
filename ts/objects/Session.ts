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

import {SiObject, SiQuery} from "@element-ts/silicon";
import {User, UserProps} from "./User";
import {Device, DeviceProps} from "./Device";

export interface SessionProps {
	userId: string;
	deviceId: string;
}

export class Session extends SiObject<SessionProps> {

	public constructor() {

		super("session");

	}

	public async getUser(): Promise<User> {

		const userId: string | undefined = this.props.userId;
		if (!userId) throw ECSError.init().show().code(400).msg("Referencing does not have a valid session id the session you are. Sign in again, you must.");
		const user: User | undefined = await SiQuery.getObjectForId<User, UserProps>(User, userId);
		if (!user) throw ECSError.init().show().code(400).msg("The droids you are looking for these are not. Does not exist the user you are. Try again you must. Yrsssss.");

		return user;

	}

	public async getDevice(): Promise<Device> {

		const deviceId: string | undefined = this.props.deviceId;
		if (!deviceId) throw ECSError.init().show().code(400).msg("Referencing does not have a valid session id the session you are. Sign in again, you must.");
		const device: Device | undefined = await SiQuery.getObjectForId<Device, DeviceProps>(Device, deviceId);
		if (!device) throw ECSError.init().show().code(400).msg("The droids you are looking for these are not. Does not exist the device you are. Try again you must. Yrsssss.");

		return device;

	}

}