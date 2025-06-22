import {encrypt} from "@/utils/auth";
import DaoHelper from "@/server/dao";
import Objection, {MaybeSingleQueryBuilder, PartialModelObject, QueryBuilder} from "objection";
import Order from "@/server/dao/entity/order";
import {Request, Response} from "express";
import {ResStatus} from "@/server/common/constant";
import {Result} from "@/common/result";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req: Request, res: Response) {

  const { num,from,id,boxSize,type, } = JSON.parse(req.body);
  const signData = encrypt(JSON.stringify({orderId: id, from:from}));

  const orderModel:PartialModelObject<Order>| undefined = await DaoHelper.getInstance().getOrderById(id);

  if (!orderModel){
    res.status(ResStatus.SUCCESS).json(Result.error("can not find"));
    return;
  }

  switch (req.method) {
    case "POST":
      try {
        let price;
        if(orderModel.boxSize == '1'&&orderModel.boxMode==1){
          price = process.env.ONCE_SMALL_BOX_ID;
        }else if(orderModel.boxSize=='2'&&orderModel.boxMode==1){
          price = process.env.ONCE_MEDIUM_BOX_ID;
        }else if(orderModel.boxSize=='3'&&orderModel.boxMode==1){
          price = process.env.ONCE_LARGE_BOX_ID;
        }else if(orderModel.boxSize=='1'&&orderModel.boxMode==2){
          price = process.env.LONG_SMALL_BOX_ID;
        }else if(orderModel.boxSize=='2'&&orderModel.boxMode==2){
          price = process.env.LONG_MEDIUM_BOX_ID;
        }else if(orderModel.boxSize=='3'&&orderModel.boxMode==2){
          price = process.env.LONG_LARGE_BOX_ID;
        }

        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded',
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price: price,
              quantity: orderModel.days,
            },
          ],
          mode: 'payment',
          return_url: `${req.headers.origin}/payment/result?_signData=${signData}&session_id={CHECKOUT_SESSION_ID}`,
          // return_url: `${req.headers.origin}/unlock`,
        });
        console.log('session',session);
        res.send({clientSecret: session.client_secret});
      } catch (err:any) {
        res.status(err.statusCode || 500).json(err.message);
      }
    case "GET":
      try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

        res.send({
          status: session.status,
          customer_email: session.customer_details.email
        });
      } catch (err:any) {
        res.status(err.statusCode || 500).json(err.message);
      }
    default:
      res.setHeader('Allow', req.method);
      res.status(405).end('Method Not Allowed');
  }
}
