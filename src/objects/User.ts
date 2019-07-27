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

import { ECMObject, ECMObjectPropType } from "@elijahjcobb/maria";
import { ECGenerator } from "@elijahjcobb/encryption";
import {Session} from "./Session";
import {ECSError} from "@elijahjcobb/server";

export interface UserProps extends ECMObjectPropType {
	firstName: string;
	lastName: string;
	email: string;
	salt: Buffer;
	pepper: Buffer;
	businessId: string;
}

export class User extends ECMObject<UserProps> {

	public constructor() {

		super("User", {
			firstName: "string",
			lastName: "string",
			email: "string",
			salt: "buffer",
			pepper: "buffer",
			businessId: "string"
		});

	}

	public async generateSession(): Promise<Session> {

		if (!this.id) throw ECSError.init().code(500).msg("Tried to generate session for a user who hasn't been created.");

		const session: Session = new Session();

		session.props.userId = this.id;
		session.props.businessId = this.props.businessId;
		session.props.alive = true;

		await session.create();

		return session;

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

	public static peppersAreEqual(p1: Buffer, p2: Buffer): boolean {

		return p1.equals(p2);

	}

 }