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

import {HHTTPServer, HEndpointGroup, HRequest, HResponse} from "@element-ts/hydrogen";
import {StandardType} from "typit";
import * as Mailgun from "mailgun-js";
import Timeout = NodeJS.Timeout;
const urlEndpointGroup: HEndpointGroup = new HEndpointGroup();

let url: string = "https://ampelfeedback.xyz";
let timeout: Timeout | undefined = undefined;

const mailgun: Mailgun.Mailgun = Mailgun({apiKey: "key-965a00eb1895c469520ff6b64fdfd65e", domain: "mail.ampelfeedback.xyz"});

const timeoutHandler: () => Promise<void> = async(): Promise<void> => {

	if (timeout) clearTimeout(timeout);
	timeout = undefined;

	await mailgun.messages().send({
		from: "heartbeat@mail.ampelfeedback.xyz",
		to: [
			"elijah@ampelfeedback.com",
			"trevor@ampelfeedback.com",
			"sebastian@ampelfeedback.com"
		],
		subject: "Ampel Heartbeat Notification",
		text: "Hello Sebastian,\n\nFormative Fitness's Ampel Kiosk is down. Please check into it.\n\n - The Ampel Team"
	});

};

urlEndpointGroup.post("/", {
	handler: async(req: HRequest, res: HResponse): Promise<void> => {

		const body: {url: string} = req.getBody();
		url = body.url;
		res.send({url});

	},
	types: {
		url: StandardType.STRING
	}
});

urlEndpointGroup.get("/", async(req: HRequest, res: HResponse): Promise<void> => {

	if (timeout) clearTimeout(timeout);
	timeout = setTimeout(timeoutHandler, 3_000);

	res.send({url});

});

const rootEndpointGroup: HEndpointGroup = new HEndpointGroup();
rootEndpointGroup.attach("/url", urlEndpointGroup);

new HHTTPServer(rootEndpointGroup).start(3000);