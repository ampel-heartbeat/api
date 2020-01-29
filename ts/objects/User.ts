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
import { ECGenerator } from "@elijahjcobb/encryption";
import {Session} from "./Session";
import {Device} from "./Device";

export interface UserProps {
	firstName: string;
	lastName: string;
	email: string;
	salt: Buffer;
	pepper: Buffer;
}

export class User extends SiObject<UserProps> {

	public constructor() {

		super("user");

	}

	public async generateSession(deviceId?: string | undefined): Promise<Session> {

		if (!this.getId()) throw ECSError.init().code(500).msg("New your account is. In order to start a session, be saved your account must. Worry not, an internal server error this is.");

		const session: Session = new Session();

		session.props.userId = this.getId();
		if (deviceId) session.props.deviceId = deviceId;

		await session.create();

		return session;

	}

	public async createDevice(name: string): Promise<Device> {

		const device: Device = new Device();

		device.props.name = name;
		if (this.getId() == undefined) throw ECSError.init().code(500).msg("Hrrmmm. New your account is. In order to create a new device, be created your account must.");
		device.props.userId = this.getId();

		await device.create();

		return device;

	}

	public static generateSalt(): Buffer {

		return ECGenerator.randomBytes(32);

	}

	public static generatePepper(salt: Buffer, password: string): Buffer {

		const passwordData: Buffer = Buffer.from(password, "utf8");
		let pepper: Buffer = Buffer.concat([salt, passwordData]);
		for (let i: number = 0; i < 10000; i++) pepper = Buffer.concat([pepper, passwordData]);

		return pepper;

	}

	public static async login(email: string, password: string): Promise<User> {

		const query: SiQuery<User, UserProps> = new SiQuery<User, UserProps>(User, {email});

		const user: User | undefined = await query.getFirst();
		if (user === undefined) throw ECSError.init().code(404).msg("The droids you are looking for these are not. Use a correct email and password to sign in you must. Please try again. Yes, hrrrm.");
		if (user.props.salt === undefined) throw ECSError.init().code(500).msg("Created incorrectly your account was, have a salt/pepper saved you do not.");
		if (user.props.pepper === undefined) throw ECSError.init().code(500).msg("Created incorrectly your account was, have a salt/pepper saved you do not.");
		const providedPepper: Buffer = this.generatePepper(user.props.salt, password);
		if (!providedPepper.equals(user.props.pepper)) throw ECSError.init().code(404).msg("The droids you are looking for these are not. Use a correct email and password to sign in you must. Please try again. Yes, hrrrm.");

		return user;

	}

 }