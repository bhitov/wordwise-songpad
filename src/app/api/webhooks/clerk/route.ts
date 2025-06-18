/**
 * @file Clerk webhook handler for user events.
 * @see https://clerk.com/docs/integrations/webhooks
 */

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET environment variable is required');
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Get the headers
    const headerPayload = await headers();
    const svixId = headerPayload.get('svix-id');
    const svixTimestamp = headerPayload.get('svix-timestamp');
    const svixSignature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new NextResponse('Error occured -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(webhookSecret);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as any;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error occured', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      // Create user in our database
      await db.insert(users).values({
        id,
        email: email_addresses[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim() || null,
      });

      console.log(`User created: ${id}`);
    }

    return new NextResponse('', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 