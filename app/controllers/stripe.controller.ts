/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-trailing-spaces */
/* eslint-disable semi */
import { NextFunction, Request, Response } from "express"
import Stripe from "stripe"
import HttpException from "../exceptions/HttpException"
import HttpStatusCode from "http-status-codes"
import StripeService from "../services/stripe.service"
import UserService from "../services/user.service"
import CommonFunctions from "../utilities/common"
import User from "../models/user.model"
import { addJobSendMailQuestionLinkCreation } from "../configurations/bullMq"

const stripe = new Stripe(process.env.STRIPE_API_SECRET || "", {
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion || '2020-08-27',
  typescript: true,
  appInfo: {
    name: 'TSM Payment',
    version: '1.0.0'
  }
})

const getAllProductsAndPlans = async (req: Request, res: Response) => {
  return Promise.all(
    [
      stripe.products.list({}),
      stripe.plans.list({})
    ]
  ).then(async (stripeData) => {
    let products = stripeData[0].data
    let plans = stripeData[1].data

    plans = plans.sort((a: any, b: any) => {
      return a.amount - b.amount
    }).map(plan => {
      return { ...plan, amount: plan.amount }
    })

    for (let i = 0; i < products.length; i++) {
      let product: any = products[i]

      const filteredPlans = plans.filter(plan => {
        return plan.product === product.id
      })

      product.plans = filteredPlans

      const price = await stripe.prices.retrieve(
        product.default_price
      )

      product.price = price

      products[i] = product
    }

    return res.send(products)
  })
    .catch((error: any) => {
      return res.status(500).send({
        status: false,
        message: error.message
      })
    })
}

const createSubscription = async (req: Request, res: Response) => {
  console.log("createSubscription")
  let statusCode = 500
  const stripeToken = req.body.stripeToken
  const customerEmail = req.body.customerEmail
  const planId = req.body.planId

  try {
    let userId: any = req.user?.id

    CommonFunctions.validateRequestForEmptyValues({ stripeToken, userId, customerEmail, planId })

    const customer = await stripe.customers.create({
      source: stripeToken,
      email: customerEmail
    })

    const sub: any = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: planId
        }
      ]
    })

    let body = {
      userId,
      currency: 'usd',
      customer: sub.customer,
      planId,
      amount: sub.items.data[0].price.unit_amount,
      status: sub.status,
      subscriptionId: sub.id,
      paymentType: "recurring"
    }

    const createResponse = await StripeService.createFinancialRecord(body)
    return res.status(200).send({
      status: true,
      data: createResponse,
      message: "Financial Record Created"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const unsubscribeUser = async (req: Request, res: Response) => {
  console.log("unsubscribeUser")
  let statusCode = 500

  try {
    let userId: any = req.user?.id
    let payload = {
      userId,
      paymentType: "recurring",
      status: "active"
    }

    let activeSub: any = await StripeService.retreiveActiveSubscription(payload)

    if (!Array.isArray(activeSub) || activeSub.length === 0) {
      statusCode = 400
      throw new Error("No active subscription")
    }

    activeSub = activeSub[0]

    await stripe.subscriptions.update(activeSub.subscriptionId, { cancel_at_period_end: true })

    let body = {
      status: "canceled"
    }

    const updateResponse = await StripeService.updateUserFinancialRecord(activeSub._id, body)
    return res.status(200).send({
      status: true,
      data: updateResponse,
      message: "Subscription cancelled."
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const chargeCard = async (req: Request, res: Response) => {
  let statusCode = 500

  try {
    let userId: any = req.user?.id

    CommonFunctions.validateRequestForEmptyValues({ userId })

    const result: any = await stripe.charges.create({
      amount: req.body.amount,
      currency: 'usd',
      source: req.body.token,
    })

    let body = { userId, amount: req.body.amount, stripeReference: result.id, currency: 'usd', payment_method: result.payment_method, payment_method_details: result.payment_method_details, receipt_url: result.receipt_url, status: result.status, source: result.source, paymentType: "one-time", stripeCustomer: "" }

    const createResponse = await StripeService.createFinancialRecord(body)
    return res.status(200).send({
      status: true,
      data: createResponse,
      message: "Financial Record Created"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

const upgradeSubscription = async (req: Request, res: Response) => {
  let statusCode = 500

  const subscriptionId = req.body.subscriptionId
  const priceId = req.body.priceId
  const userId: any = req.user?.id

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const sub: any = stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }]
    })

    let body = {
      userId,
      currency: 'usd',
      customer: sub.customer,
      planId: subscriptionId,
      amount: sub.items.data[0].price.unit_amount,
      status: sub.status,
      subscriptionId: sub.id,
      paymentType: "recurring"
    }

    const createResponse = await StripeService.createFinancialRecord(body)
    return res.status(200).send({
      status: true,
      data: createResponse,
      message: "Financial Record Created"
    })
  } catch (error: any) {
    return res.status(statusCode).send({
      status: false,
      message: error.message
    })
  }
}

/**
* API to generate the payment-intent or setup-intent for payment/ subscription
* @param req Request
* @param res Response
* @param next NextFunction
* @returns JSON
*/
const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: any = req.user?.id
    let { paymentType, planId, priceId, amount, currency } = req.body
    let intent: Stripe.SetupIntent | Stripe.PaymentIntent | undefined

    // validate paymentType
    if (paymentType !== "SUBSCRIPTION" && paymentType !== "ONE_TIME_PURCHASE") {
      return next(new HttpException(HttpStatusCode.BAD_REQUEST, "paymentType has to either of this two: 'SUBSCRIPTION' or 'ONE_TIME_PURCHASE'"))
    }

    if (!planId) {
      return next(new HttpException(HttpStatusCode.BAD_REQUEST, 'Please provide the valid planId to process further'))
    }

    if (!priceId) {
      return next(new HttpException(HttpStatusCode.BAD_REQUEST, 'Please provide the valid priceId to process further'))
    }

    if (!amount) {
      return next(new HttpException(HttpStatusCode.BAD_REQUEST, 'Please provide the valid amount to process further'))
    }

    if (!currency) {
      return next(new HttpException(HttpStatusCode.BAD_REQUEST, 'Please provide the valid currency to process further'))
    }

    // get user
    let user: any = await UserService.findUser({ _id: userId })
    user = user?.toObject()

    // create stripe customer
    if (!user.stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({ email: user.email })
        await UserService.updateUser(userId, { stripeCustomerId: customer.id })
        user.stripeCustomerId = customer.id
      }
      catch (error: any) {
        console.log(error)
      }
    }

    const FRONTEND_URL = 'https://client.curemigraine.org'

    if (paymentType === 'SUBSCRIPTION') {
      const session = await stripe.checkout.sessions.create({
        customer: user?.stripeCustomerId,
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        allow_promotion_codes: true,
        metadata: {
          userId,
          action: "SUBSCRIPTION_MADE",
          gateway: "STRIPE",
          product: planId,
          price: priceId,
        },
        success_url: `${FRONTEND_URL}/payment-success?userId=${userId}&status=success`,
        cancel_url: `${FRONTEND_URL}/payment?status=cancelled`,
      });

      return res.status(200).send({
        status: true,
        data: {
          sessionUrl: session.url
        }
      });

    } else if (paymentType === 'ONE_TIME_PURCHASE') {
      const session = await stripe.checkout.sessions.create({
        customer: user?.stripeCustomerId,
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        metadata: {
          userId,
          action: "ONE_TIME_PAYMENT",
          gateway: "STRIPE",
          product: planId,
          price: priceId,
        },
        success_url: `${FRONTEND_URL}/payment-success?userId=${userId}&status=success`,
        cancel_url: `${FRONTEND_URL}/payment?status=cancelled`,
      });

      return res.status(200).send({
        status: true,
        data: {
          sessionUrl: session.url
        }
      });
    }

    throw new Error(`Sorry some errors occurred while creating payment intent`)
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body
    // First list promotion codes and find the matching one
    const promotionCodes = await stripe.promotionCodes.list({
      code: code,
      active: true,
      limit: 1
    });

    console.log('promotionCodes ==', promotionCodes)
    if (promotionCodes.data.length === 0) {
      throw new Error("Invalid coupon code");
    }

    const promoCode = promotionCodes.data[0];
    const coupon = promoCode.coupon;

    return res.status(200).send({
      status: true,
      data: {
        valid: true,
        coupon
      }
    })
  } catch (error) {
    console.log('error ==', error)
    return res.status(400).send({
      status: false,
      message: "Invalid coupon code",
      error: error
    })
  }
}

const listAvailableCoupons = async (req: Request, res: Response) => {
  try {
    const promotionCodes = await stripe.promotionCodes.list({
      active: true,
      limit: 10
    });

    const availableCoupons = promotionCodes.data.map(promo => ({
      id: promo.id,
      code: promo.code,
      name: promo.coupon.name,
      description: promo.coupon.name,
      percentOff: promo.coupon.percent_off,
      amountOff: promo.coupon.amount_off,
      currency: promo.coupon.currency,
      maxRedemptions: promo.max_redemptions,
      timesRedeemed: promo.times_redeemed
    }));

    return res.status(200).send({
      status: true,
      data: availableCoupons
    });
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    });
  }
};

/**
 * Manual endpoint to update isPaid flag (for testing only)
 * @param req Request
 * @param res Response
 * @returns JSON
 */
const manualUpdatePaidStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send({
        status: false,
        message: 'Please provide a userId'
      });
    }

    // Find user
    const user = await UserService.findUser({ _id: userId });
    if (!user) {
      return res.status(404).send({
        status: false,
        message: 'User not found'
      });
    }

    // Update user
    const updatedUser = await UserService.updateUser(userId, {
      isPaid: true,
      exerciseStartDate: new Date()
    });

    return res.status(200).send({
      status: true,
      message: 'User payment status updated successfully',
      data: {
        userId,
        isPaid: true,
        exerciseStartDate: new Date()
      }
    });
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    });
  }
};

/**
 * Handle payment confirmation when user returns from successful payment
 * @param req Request
 * @param res Response
 * @returns JSON
 */
const confirmPaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.body;

    // Validate required parameters
    if (!userId || !status) {
      return res.status(400).send({
        status: false,
        message: 'Missing required parameters: userId and status'
      });
    }

    // Only update if status is 'success'
    if (status !== 'success') {
      return res.status(200).send({
        status: true,
        message: 'No updates made - payment was not successful',
        data: { updated: false }
      });
    }

    // Find user
    const user = await UserService.findUser({ _id: userId });
    if (!user) {
      return res.status(404).send({
        status: false,
        message: 'User not found'
      });
    }

    // Update user's isPaid status and exerciseStartDate
    const updatedUser = await UserService.updateUser(userId, {
      isPaid: true,
      exerciseStartDate: new Date()
    });

    // Send email notification
    addJobSendMailQuestionLinkCreation(
      {
        userId: userId,
        email: user.email,
        userName: `${user.firstName} ${user.lastName}`
      },
      userId
    );

    return res.status(200).send({
      status: true,
      message: 'Payment confirmed successfully',
      data: {
        userId,
        isPaid: true,
        updated: true
      }
    });
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: error.message
    });
  }
};

export default { getAllProductsAndPlans, createSubscription, chargeCard, unsubscribeUser, upgradeSubscription, checkout, validateCoupon, listAvailableCoupons, manualUpdatePaidStatus, confirmPaymentSuccess }
