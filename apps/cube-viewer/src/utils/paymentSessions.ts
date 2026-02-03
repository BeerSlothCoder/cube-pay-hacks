import { createCubePayDatabase } from '@cubepay/database-client';

export interface PaymentSessionData {
  agent_id: string;
  payer_wallet: string;
  recipient_wallet: string;
  amount: number;
  token: string;
  chain_id: number;
  transaction_hash: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  payment_face: string;
  error_message?: string;
}

/**
 * Create a new payment session in the database
 */
export async function createPaymentSession(data: PaymentSessionData): Promise<string | null> {
  try {
    const db = createCubePayDatabase(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    const result = await db.paymentSessions.create({
      agent_id: data.agent_id,
      payer_wallet: data.payer_wallet,
      recipient_wallet: data.recipient_wallet,
      amount: data.amount,
      token: data.token,
      chain_id: data.chain_id,
      transaction_hash: data.transaction_hash,
      status: data.status,
      payment_face: data.payment_face,
      error_message: data.error_message,
      created_at: new Date().toISOString(),
    });

    return result?.id || null;
  } catch (error) {
    console.error('Failed to create payment session:', error);
    return null;
  }
}

/**
 * Update payment session status
 */
export async function updatePaymentSession(
  sessionId: string,
  updates: {
    status?: 'pending' | 'processing' | 'confirmed' | 'failed';
    transaction_hash?: string;
    error_message?: string;
    block_number?: number;
  }
): Promise<boolean> {
  try {
    const db = createCubePayDatabase(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    await db.paymentSessions.update(sessionId, {
      ...updates,
      updated_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Failed to update payment session:', error);
    return false;
  }
}

/**
 * Get payment sessions for an agent
 */
export async function getAgentPaymentSessions(
  agentId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const db = createCubePayDatabase(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    const sessions = await db.paymentSessions.list({
      filters: { agent_id: agentId },
      limit,
      orderBy: 'created_at',
      order: 'desc',
    });

    return sessions || [];
  } catch (error) {
    console.error('Failed to get payment sessions:', error);
    return [];
  }
}

/**
 * Get payment session by transaction hash
 */
export async function getPaymentSessionByTxHash(
  transactionHash: string
): Promise<any | null> {
  try {
    const db = createCubePayDatabase(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    const sessions = await db.paymentSessions.list({
      filters: { transaction_hash: transactionHash },
      limit: 1,
    });

    return sessions?.[0] || null;
  } catch (error) {
    console.error('Failed to get payment session:', error);
    return null;
  }
}
