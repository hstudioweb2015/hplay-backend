import nodemailer from 'nodemailer';
import {mailer} from "../configs/config.js";

export default class MailerService {

	constructor() {
		this.mailer = nodemailer.createTransport({
			host: mailer.host,
			port: mailer.port,
			secure: mailer.secure,
			auth: {
				user: mailer.user,
				pass: mailer.password,
			},
		});
	}

	async sendMail(to, subject, text) {
		try {

			const mailOptions = {
				from: mailer.from + ' <' + mailer.user + '>',
				to,
				subject,
				text,
			};
			const info = await this.mailer.sendMail(mailOptions);
			console.log('Message sent: %s', info.messageId);
			return info;
		} catch (error) {
			console.error('Error sending email:', error);
			throw new Error('Failed to send email');
		}
	}
}
	