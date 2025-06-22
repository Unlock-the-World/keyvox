import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/router';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const stripePublicKey = publicRuntimeConfig.stripePublicKey;
const stripePromise = loadStripe(`${stripePublicKey}`);

export default function App() {
  const [clientSecret, setClientSecret] = useState('');
  const router = useRouter();
  const orderId = router.query.id;
  const from = router.query.from;


  useEffect(() => {
    fetch("api/checkout-session", {
      method: "POST",
      headers: {
        'authorization': localStorage.getItem('token') ?? '',
      },
      body: JSON.stringify({
        from:from,
        id:orderId,
      })
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [from,orderId]);

  return (
    <div id="checkout">
      {clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{clientSecret}}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  )
}