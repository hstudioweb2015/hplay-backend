import PaymentService from '../src/services/PaymentService.js';
import {connectDB} from "../src/configs/db.js";
import DBService from "../src/services/DBService.js";
import MediaService from "../src/services/MediaService.js";
beforeAll(async () => {
	await connectDB();
});
describe('Payment Service', () => {
	const mockMedias = [1, 2];
	const mockUser = { id: 1 };
	const mockReferenceId = 'test-reference-id';
	const mockTotalPrice = 2000;
	const mockDescription = 'Media1 - 10 CHF\nMedia2 - 10 CHF';

	it('should create a payment', async () => {
		// Given
		PaymentService.createPaymentInDatabase = jest.fn().mockResolvedValue(mockReferenceId);
		PaymentService.getTotalPrice = jest.fn().mockResolvedValue(mockTotalPrice);
		PaymentService.createPaymentDescription = jest.fn().mockResolvedValue(mockDescription);
		PaymentService.createPaylink = jest.fn().mockResolvedValue('https://payment.url');

		// When
		const response = await PaymentService.createPayment({ medias: mockMedias }, mockUser);

		// Then
		expect(response).toHaveProperty('url');
		expect(response.url).toBe('https://payment.url');
	});

	it('should update payment status', async () => {
		// Given
		const mockTransaction = {
			referenceId: mockReferenceId,
			status: 'confirmed'
		};
		const mockMediaIds = [1, 2];

		PaymentService.getPaymentByReferenceId = jest.fn().mockResolvedValue({
			users_id: 1,
			is_paid: false
		});
		PaymentService.updatePaymentIsPaid = jest.fn();
		MediaService.getMediasIdByReferenceId = jest.fn().mockResolvedValue(mockMediaIds);
		MediaService.addMediasToUser = jest.fn();

		// When
		const response = await PaymentService.updatePayment({ transaction: mockTransaction });

		// Then
		expect(response).toHaveProperty('status', 'success');
		expect(response).toHaveProperty('message', 'Payment is successful comfirmed');
		expect(MediaService.addMediasToUser).toHaveBeenCalledWith(mockMediaIds, 1);
	});

	it('should generate unique reference ID', async () => {
		// Given
		DBService.query = jest.fn().mockResolvedValue([{ count: 0 }]);

		// When
		const referenceId = await PaymentService.generateReferenceId();

		// Then
		expect(referenceId).toBeTruthy();
		expect(typeof referenceId).toBe('string');
		expect(referenceId.length).toBe(32);
	});

	it('should get total price of medias', async () => {
		// Given
		DBService.query = jest.fn().mockResolvedValueOnce([{ price: 1000 }])
				.mockResolvedValueOnce([{ price: 1000 }]);

		// When
		const totalPrice = await PaymentService.getTotalPrice(mockMedias);

		// Then
		expect(totalPrice).toBe(2000);
	});

	it('should create payment description', async () => {
		// Given
		DBService.query = jest.fn()
				.mockResolvedValueOnce([{ name: 'Media1', price: 1000 }])
				.mockResolvedValueOnce([{ name: 'Media2', price: 1000 }]);

		// When
		const description = await PaymentService.createPaymentDescription(mockMedias);

		// Then
		expect(description).toBe('Media1 - 10 CHF\nMedia2 - 10 CHF');
	});
});