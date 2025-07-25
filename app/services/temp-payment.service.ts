import TempPayment, { TempPaymentDocument } from '../models/temp-payment.model'

/**
 * Service for handling temporary payments before user registration
 */
class TempPaymentService {
    /**
     * Create a new temporary payment record
     * @param data Payment data
     * @returns Created payment record
     */
    async createTempPayment(data: Partial<TempPaymentDocument>): Promise<TempPaymentDocument> {
        const tempPayment = new TempPayment(data)
        return await tempPayment.save()
    }

    /**
     * Find a temporary payment by checkout session ID
     * @param checkoutSessionId Stripe checkout session ID
     * @returns Temporary payment record if found
     */
    async findByCheckoutSessionId(checkoutSessionId: string): Promise<TempPaymentDocument | null> {
        return await TempPayment.findOne({ checkoutSessionId })
    }

    /**
     * Find a temporary payment by payment intent ID
     * @param paymentIntentId Stripe payment intent ID
     * @returns Temporary payment record if found
     */
    async findByPaymentIntentId(paymentIntentId: string): Promise<TempPaymentDocument | null> {
        return await TempPayment.findOne({ paymentIntentId })
    }

    /**
     * Update a temporary payment record
     * @param id Temporary payment ID
     * @param data Updated data
     * @returns Updated payment record
     */
    async updateTempPayment(id: string, data: Partial<TempPaymentDocument>): Promise<TempPaymentDocument | null> {
        return await TempPayment.findByIdAndUpdate(id, data, { new: true })
    }

    /**
     * Update a temporary payment by checkout session ID
     * @param checkoutSessionId Stripe checkout session ID
     * @param data Updated data
     * @returns Updated payment record
     */
    async updateByCheckoutSessionId(checkoutSessionId: string, data: Partial<TempPaymentDocument>): Promise<TempPaymentDocument | null> {
        return await TempPayment.findOneAndUpdate({ checkoutSessionId }, data, { new: true })
    }

    /**
     * Delete a temporary payment record
     * @param id Temporary payment ID
     * @returns Deletion result
     */
    async deleteTempPayment(id: string): Promise<any> {
        return await TempPayment.findByIdAndDelete(id)
    }
}

export default new TempPaymentService() 