
import { NextFunction, Response } from "express"
import HttpStatusCode from "http-status-codes"
import Stripe from "stripe"
import StripeService from "../services/stripe.service"
import UserService from "../services/user.service"
import config from "../configurations/config"
import HttpException from "../exceptions/HttpException"
import { addJobSendMailQuestionLinkCreation } from "../configurations/bullMq"

const stripe = new Stripe(config.stripe.API_SECRET, {
    apiVersion: config.stripe.API_VERSION as Stripe.LatestApiVersion //@ts-ignore
})

const endpointSecret = config.stripe.WEBHOOK_ENDPOINT_SECRET
/**
 * Service to handle the stripe webhook events
 * @param req
 * @param res
 * @param next
 * @returns JSON
 */
export const postWebhook = async (req: any, res: Response, next: NextFunction) => {
    try {
        console.log("INSIDE postWebhook")

        if (!stripe && !endpointSecret) {
            throw new Error("Stripe endpoint secret not found")
        }
        let event: any
        let paymentIntent: any = null
        try {

            const sig = req.headers["stripe-signature"] as string
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
            console.log('event.type', event.type.toLowerCase())
        }
        catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`)
        }
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded': {
                paymentIntent = event.data.object
                console.log('PaymentIntent was successful!', JSON.stringify(paymentIntent))
                if (paymentIntent?.metadata?.action === 'ONE_TIME_PAYMENT') {
                    await createUserFinancialRecordOnetime(paymentIntent)
                }
                if (paymentIntent?.description === 'Subscription creation') {
                    await createUserFinancialRecordRecurring(paymentIntent)
                }
                break
            }
            case 'payment_intent.created': {
                paymentIntent = event.data.object
                console.log('PaymentIntent was created!', JSON.stringify(paymentIntent))
                //if (paymentIntent && paymentIntent.invoice) await createUserFinancialRecord(paymentIntent)
                break
            }
            case 'payment_method.attached': {
                const paymentMethod = event.data.object
                console.log('PaymentMethod was attached to a Customer!', paymentMethod)
                break
            }
            case 'setup_intent.succeeded': {
                paymentIntent = event.data.object
                console.log('Setup Intent was successful!', JSON.stringify(paymentIntent))
                // create subscription
                //stripeCustomerId: string, userId: string, product: string, price: string
                await attachSubscriptionToCustomer(paymentIntent.customer, paymentIntent.metadata.userId, paymentIntent.metadata.product, paymentIntent.metadata.price)

                // create financial record with status == pending
                //await createUserFinancialRecordRecurring(paymentIntent)
                break
            }
            default:
                console.log(`Unhandled event type ${event.type}`)
        }

        // Return a response to acknowledge receipt of the event
        return res.status(HttpStatusCode.OK).send({
            status: true,
            message: "Webhook event handled"
        })
    } catch (error: any) {
        next(new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, error.message))
    }
}

const createUserFinancialRecordOnetime = async (paymentIntent: any) => {
    // get user
    let user: any = await UserService.findUser({ _id: paymentIntent?.metadata?.userId })
    user = user?.toObject()
    let userId: any = user._id ? user._id : undefined
    let currency: any = paymentIntent?.currency ? paymentIntent?.currency : undefined
    let stripeCustomer: any = paymentIntent?.customer ? paymentIntent?.customer : undefined
    let planId: any = paymentIntent?.metadata?.product ? paymentIntent?.metadata?.product : undefined
    let amount: any = paymentIntent?.amount ? paymentIntent?.amount : undefined
    let paymentType: any = paymentIntent?.metadata?.action ? paymentIntent?.metadata?.action : undefined
    let status: any = "succeeded"
    let body: any = null
    if (paymentType === "ONE_TIME_PAYMENT") {
        body = {
            'userId': userId,
            'currency': currency,
            'stripeCustomer': stripeCustomer,
            'planId': planId,
            'amount': amount,
            'status': status,
            'subscriptionId': null,
            'paymentType': "one-time"
        }
    }
    addJobSendMailQuestionLinkCreation({ userId: userId, email: user?.email, userName: `${user?.firstName}  ${user?.lastName}` }, userId)
    const _updateUserRes: any = await UserService.updateUser(userId, { isPaid: true, exerciseStartDate: new Date() })
    const _createFinancialRecordRes: any = await StripeService.createFinancialRecord(body)
}

const createUserFinancialRecordRecurring = async (paymentIntent: any) => {
    let body: any = null
    let user: any = await UserService.findUser({ stripeCustomerId: paymentIntent?.customer })
    user = user?.toObject()
    let userId: any = user._id ? user._id : undefined

    if (paymentIntent.invoice) {
        //get payment invoice
        const invoice = await stripe.invoices.retrieve(
            paymentIntent.invoice
        )

        let data: any = Array.isArray(invoice.lines.data) ? invoice.lines.data : []

        body = {
            userId: user._id,
            currency: data[0]?.plan?.currency,
            stripeCustomer: invoice.customer,
            planId: data[0]?.plan?.id,
            amount: invoice.amount_paid,
            status: "succeeded",
            subscriptionId: data[0]?.subscription,
            paymentType: data[0]?.type === "subscription" ? "recurring" : "one-time"
        }
    }
    addJobSendMailQuestionLinkCreation({ userId: userId, email: user?.email, userName: `${user?.firstName}  ${user?.lastName}` }, userId)
    const _updateUserRes: any = await UserService.updateUser(userId, { isPaid: true, exerciseStartDate: new Date() })
    const _createFinancialRecordRes: any = await StripeService.createFinancialRecord(body)
}

// /**
// * Create new subscription record on stripe for customer passed in setupIntent
// * @param paymentIntent
// * @returns Boolean
// */
// const attachSubscriptionToCustomer = async (stripeCustomerId: string, paymentIntent: { [key: string]: any }) => {
//     try {
//         let { userId, product, price } = paymentIntent['metadata']
//         const subscriptionsCreateResponse: any = await stripe.subscriptions.create({
//             'customer': stripeCustomerId,
//             'items': [
//                 {
//                     'price': price,
//                 }
//             ],
//             'metadata': {
//                 userId,
//                 'action': 'SUBSCRIPTION_MADE',
//                 product,
//                 gateway: 'STRIPE',
//             },
//             'collection_method': 'charge_automatically'
//         })

//         return subscriptionsCreateResponse
//     } catch (error: any) {
//         return false
//     }
// }

/**
 * Create new subscription record on stripe for customer passed in setupIntent
 * @param paymentIntent
 * @returns Boolean
 */
const attachSubscriptionToCustomer = async (stripeCustomerId: string, userId: string, product: string, price: string) => {
    try {

        await stripe.subscriptions.create({
            'customer': stripeCustomerId,
            'items': [
                {
                    'price': price,
                }
            ],
            'metadata': {
                userId,
                'action': 'SUBSCRIPTION_MADE',
                product,
                gateway: 'STRIPE',
            },
            'collection_method': 'charge_automatically'
        })

        return true
    } catch (error: any) {
        return false
    }
}

/**
 * Retrieve the payment method from the payment intent and attach it to the customer and update the default payment method of the customer
 * @param stripeCustomerId
 * @param paymentIntent
 * @returns boolean
 */
const _updateStripeCustomer = async (stripeCustomerId: string, paymentIntent: { [key: string]: any }) => {
    try {
        const paymentMethodUsed = await stripe.paymentMethods.retrieve(paymentIntent.payment_method) // Retrieve payment method used
        const paymentMethods = await stripe.paymentMethods.list({ type: 'card', customer: stripeCustomerId }) // Get list of payment methods of customer
        const fingerPrint = paymentMethodUsed.card?.fingerprint // Fingerprint of card used

        let exists: boolean = false
        if (paymentMethods.data.length) {
            paymentMethods.data.forEach((paymentMethod) => {
                if (paymentMethod?.card?.fingerprint === fingerPrint) {
                    exists = true
                    return true
                }
            })
        }

        if (!exists) {
            await stripe.paymentMethods.attach(paymentMethodUsed.id, {
                customer: stripeCustomerId
            })
        }

        await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                'default_payment_method': paymentMethodUsed.id
            }
        })
    } catch (error: any) {
        return false
    }
}
