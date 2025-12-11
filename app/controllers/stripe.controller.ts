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
import TempPaymentService from "../services/temp-payment.service"
import CommonFunctions from "../utilities/common"
import User from "../models/user.model"
import { addJobSendMailQuestionLinkCreation } from "../configurations/bullMq"
import { sendEmailVerification } from "../utils/email.util"

const stripe = new Stripe(process.env.STRIPE_API_SECRET || "", {
  apiVersion: '2022-08-01',
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
        product.default_price as string
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

const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: any = req.user?.id
    let { paymentType, planId, priceId, amount, currency, email, flow } = req.body

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

    let stripeCustomerId = null
    let user = null

    if (userId) {
      user = await UserService.findUser({ _id: userId })
      user = user?.toObject()
      stripeCustomerId = user?.stripeCustomerId
    }

    const FRONTEND_URL = process.env.NODE_ENV === 'production'
      ? 'https://client.curemigraine.org'
      : 'https://client.curemigraine.org'

    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      allow_promotion_codes: true,
      metadata: {
        userId: userId || '',
        action: paymentType === 'SUBSCRIPTION' ? "SUBSCRIPTION_MADE" : "ONE_TIME_PAYMENT",
        gateway: "STRIPE",
        product: planId,
        price: priceId,
        paymentFirst: userId ? 'false' : 'true',
        email: email || '',
        flow: flow || (userId ? 'register-first' : 'payment-first' ),
      },

      success_url: !userId
        ? `${FRONTEND_URL}/register?sessionId={CHECKOUT_SESSION_ID}&status=success&flow=payment-first`
        : `${FRONTEND_URL}/payment-success?userId=${userId}&status=success&flow=register-first`,

      cancel_url: `${FRONTEND_URL}/payment?status=cancelled`,
    }

    if (stripeCustomerId) {
      sessionOptions.customer = stripeCustomerId
    } else if (email && email.trim() !== '') {
      try {
        const customer = await stripe.customers.create({
          email: email.trim()
        })
        sessionOptions.customer = customer.id
      } catch (error) {
        console.error('Error creating customer:', error)
      }
    }

    sessionOptions.mode = paymentType === 'SUBSCRIPTION' ? 'subscription' : 'payment'

    const session = await stripe.checkout.sessions.create(sessionOptions)

    if (!userId) {
      await TempPaymentService.createTempPayment({
        checkoutSessionId: session.id,
        paymentStatus: 'pending',
        paymentType,
        amount: parseFloat(amount),
        currency,
        metadata: {
          product: planId,
          price: priceId,
          flow: flow || 'payment-first',
        },
        email: email && email.trim() !== '' ? email.trim() : undefined,
      })
    }

    return res.status(200).send({
      status: true,
      data: {
        sessionUrl: session.url
      }
    })
  } catch (error: any) {
    console.error('Checkout error:', error.message)
    return res.status(500).send({
      status: false,
      message: error.message
    })
  }
}

const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body
    const promotionCodes = await stripe.promotionCodes.list({
      code: code,
      active: true,
      limit: 1
    });

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
  } catch (error: any) {
    return res.status(400).send({
      status: false,
      message: "Invalid coupon code",
      error: error.message || error
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

const manualUpdatePaidStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send({
        status: false,
        message: 'Please provide a userId'
      });
    }

    const user = await UserService.findUser({ _id: userId });
    if (!user) {
      return res.status(404).send({
        status: false,
        message: 'User not found'
      });
    }

    await UserService.updateUser(userId, {
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

const confirmPaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).send({
        status: false,
        message: 'Missing required parameters: userId and status'
      });
    }

    if (status !== 'success') {
      return res.status(200).send({
        status: true,
        message: 'No updates made - payment was not successful',
        data: { updated: false }
      });
    }

    const user = await UserService.findUser({ _id: userId });
    if (!user) {
      return res.status(404).send({
        status: false,
        message: 'User not found'
      });
    }

    await UserService.updateUser(userId, {
      isPaid: true,
      exerciseStartDate: new Date()
    });

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

const verifyCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).send({
        status: false,
        message: 'Session ID is required'
      });
    }

    let tempPayment = await TempPaymentService.findByCheckoutSessionId(sessionId);
    let isPaymentSuccessful = false;
    let session: any = null;
    const manuallyUpdatePaymentStatus = true;

    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      isPaymentSuccessful = session.payment_status === 'paid';
    } catch (stripeError: any) {
      if (tempPayment && manuallyUpdatePaymentStatus) {
        isPaymentSuccessful = true;
      } else if (!tempPayment) {
        return res.status(404).send({
          status: false,
          message: stripeError.message
        });
      }
    }

    if (!tempPayment && isPaymentSuccessful && session) {
      try {
        tempPayment = await TempPaymentService.createTempPayment({
          checkoutSessionId: sessionId,
          paymentStatus: 'succeeded',
          paymentType: session.mode === 'subscription' ? 'SUBSCRIPTION' : 'ONE_TIME_PURCHASE',
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'usd',
          paymentIntentId: session.payment_intent as string,
          metadata: {
            ...session.metadata,
            flow: session.metadata?.flow || 'payment-first'
          },
          email: session.customer_details?.email || undefined
        });
      } catch (createError) {
        console.error(`Failed to create temporary payment record: ${createError}`);
      }
    }

    if (!tempPayment) {
      return res.status(404).send({
        status: false,
        message: 'Payment record not found'
      });
    }

    if (isPaymentSuccessful && tempPayment.paymentStatus === 'pending') {
      const updateData: any = {
        paymentStatus: 'succeeded'
      };

      if (session) {
        updateData.paymentIntentId = session.payment_intent as string;
        updateData.email = session.customer_details?.email || tempPayment.email;
      }

      await TempPaymentService.updateByCheckoutSessionId(sessionId, updateData);
      tempPayment = await TempPaymentService.findByCheckoutSessionId(sessionId) || tempPayment;
    }

    return res.status(200).send({
      status: true,
      data: {
        paymentSuccessful: isPaymentSuccessful || tempPayment?.paymentStatus === 'succeeded',
        sessionId: sessionId,
        paymentStatus: tempPayment?.paymentStatus,
        paymentType: tempPayment?.paymentType,
        amount: tempPayment?.amount,
        currency: tempPayment?.currency,
        email: tempPayment?.email,
        metadata: tempPayment?.metadata
      }
    });
  } catch (error: any) {
    return res.status(500).send({
      status: false,
      message: 'Internal server error while verifying session'
    });
  }
};

const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // eslint-disable-next-line no-case-declarations
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.paymentFirst === 'true') {
        await TempPaymentService.updateByCheckoutSessionId(session.id, {
          paymentStatus: 'succeeded',
          paymentIntentId: session.payment_intent as string,
          email: session.customer_details?.email || undefined
        });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const registerAfterPayment = async (req: Request, res: Response) => {
  let statusCode = 500;
  try {
    const { sessionId, firstName, lastName, email, password, age } = req.body;

    if (!sessionId || !firstName || !lastName || !email || !password || !age) {
      return res.status(400).send({ status: false, message: 'All fields are required' });
    }

    const user = await UserService.createUser({
      email,
      password,
      firstName,
      lastName,
      age: Number(age),
      role: "patient",
      isPaid: true,
      exerciseStartDate: new Date(),
      isVerified: false 
    });

    await TempPaymentService.updateByCheckoutSessionId(sessionId, {
      paymentStatus: 'registered',
      email
    });

    await StripeService.createFinancialRecord({
        userId: user._id,
        amount: 0, 
        status: 'succeeded',
        paymentType: 'one-time',
        stripeReference: sessionId
    });

    // Generate token with Type Assertion to fix build error
    const token = (user as any).generateJWT();

    // Send email verification
    await sendEmailVerification(user, req);

    return res.status(200).json({
      status: true,
      data: { user, token },
      message: "Registration successful! Please check your email."
    });

  } catch (error: any) {
    console.error("Error in registerAfterPayment:", error);
    return res.status(statusCode).json({
      status: false,
      message: error.message || "Registration failed"
    });
  }
};

export default {
  getAllProductsAndPlans,
  createSubscription,
  unsubscribeUser,
  chargeCard,
  upgradeSubscription,
  checkout,
  validateCoupon,
  listAvailableCoupons,
  manualUpdatePaidStatus,
  confirmPaymentSuccess,
  verifyCheckoutSession,
  handleWebhook,
  registerAfterPayment
}
