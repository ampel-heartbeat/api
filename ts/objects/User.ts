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
import {ECGenerator} from "@elijahjcobb/encryption";
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

		if (!this.getId()) throw new Error("You must be a registered user to start a session.");

		const session: Session = new Session();

		session.props.userId = this.getId();
		if (deviceId) session.props.deviceId = deviceId;

		await session.create();

		return session;

	}

	public async createDevice(name: string): Promise<Device> {

		const device: Device = new Device();

		device.props.name = name;
		if (this.getId() == undefined) throw new Error("You must be a registered user to create a device.");
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
		const emailPasswordErrorMessage: string = "Your email or password is incorrect.";
		if (user === undefined) throw new Error(emailPasswordErrorMessage);
		if (user.props.salt === undefined) throw new Error("Your salt is undefined.");
		if (user.props.pepper === undefined) throw new Error("Your password is undefined.");
		const providedPepper: Buffer = this.generatePepper(user.props.salt, password);
		if (!providedPepper.equals(user.props.pepper)) throw new Error(emailPasswordErrorMessage);

		return user;

	}

 }