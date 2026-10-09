/**
 * SigiloPay Official Gateway Integration Service
 * 
 * Secure backend helper - NEVER expose credentials to client.
 */

export class SigiloPayService {
  getClientId() {
    return (process.env.SIGILOPAY_CLIENT_ID || process.env.SIGILOPAY_PUBLIC_KEY || '').trim();
  }

  getClientSecret() {
    return (process.env.SIGILOPAY_CLIENT_SECRET || process.env.SIGILOPAY_SECRET_KEY || '').trim();
  }

  getBaseUrl() {
    return (process.env.SIGILOPAY_API_BASE_URL || 'https://app.sigilopay.com.br/api/v1').trim().replace(/\/+$/, '');
  }

  isConfigured() {
    return Boolean(this.getClientId() && this.getClientSecret());
  }

  /**
   * Cria cobrança PIX via SigiloPay
   * @param {Object} params
   * @param {string} params.identifier - Identificador único do pedido
   * @param {number} params.amount - Valor em reais (ex: 49.90)
   * @param {Object} params.client - { name, email, phone, document }
   * @param {string} [params.callbackUrl]
   */
  async createPixPayment(params) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Credenciais da SigiloPay (SIGILOPAY_CLIENT_ID / SIGILOPAY_CLIENT_SECRET) não configuradas.',
      };
    }

    const cleanCpf = params.client.document ? String(params.client.document).replace(/\D/g, '') : '';
    const cleanPhone = params.client.phone ? String(params.client.phone).replace(/\D/g, '') : '';

    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const baseUrl = this.getBaseUrl();

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-public-key': clientId,
      'x-secret-key': clientSecret,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SigiloPayPizzaria/1.0',
    };

    try {
      let response = null;

      // 1. Se possuir documento (CPF válido com 11 dígitos), tenta /gateway/pix/receive
      if (cleanCpf && cleanCpf.length === 11) {
        const receivePayload = {
          identifier: params.identifier,
          amount: Number(params.amount.toFixed(2)),
          client: {
            name: params.client.name,
            email: params.client.email || 'contato@donatellopizza.com.br',
            phone: cleanPhone || '11999999999',
            document: cleanCpf,
          },
          ...(params.callbackUrl ? { callbackUrl: params.callbackUrl } : {}),
        };

        response = await fetch(`${baseUrl}/gateway/pix/receive`, {
          method: 'POST',
          headers,
          body: JSON.stringify(receivePayload),
          cache: 'no-store',
        }).catch(() => null);
      }

      // 2. Se não tinha CPF ou a rota receive retornou erro, tenta /gateway/pix/deposit como fallback
      if (!response || !response.ok) {
        const depositPayload = {
          identifier: params.identifier,
          amount: Number(params.amount.toFixed(2)),
          ...(params.callbackUrl ? { callbackUrl: params.callbackUrl } : {}),
        };

        response = await fetch(`${baseUrl}/gateway/pix/deposit`, {
          method: 'POST',
          headers,
          body: JSON.stringify(depositPayload),
          cache: 'no-store',
        });
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.message ||
          data.errorDescription ||
          data.error ||
          `Erro SigiloPay (HTTP ${response.status})`;
        return { success: false, error: errorMsg, raw: data };
      }

      const transactionId = data.transactionId ? String(data.transactionId) : (data.id ? String(data.id) : undefined);
      const pixNode = data.pix || data.order?.pix;
      const pixCode = pixNode?.code || pixNode?.payload || pixNode?.emv || pixNode?.qrCode || '';

      let qrCodeImage = '';
      if (pixNode?.base64 && pixNode.base64.trim() !== '') {
        qrCodeImage = pixNode.base64.startsWith('data:image')
          ? pixNode.base64
          : `data:image/png;base64,${pixNode.base64}`;
      } else if (pixNode?.image) {
        qrCodeImage = pixNode.image;
      } else if (pixNode?.imageUrl) {
        qrCodeImage = pixNode.imageUrl;
      } else if (pixNode?.qrCodeImageUrl) {
        qrCodeImage = pixNode.qrCodeImageUrl;
      } else if (pixCode) {
        // Fallback para renderização do QR Code visual a partir do código Pix Copia e Cola
        qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(pixCode)}`;
      }

      return {
        success: true,
        transactionId,
        orderId: data.order?.id,
        pixCode,
        qrCodeImage,
        status: data.status || 'PENDING',
        fee: data.fee,
        raw: data,
      };
    } catch (err) {
      return {
        success: false,
        error: `Falha na conexão com SigiloPay: ${err.message}`,
      };
    }
  }

  /**
   * Consulta o status real da transação no SigiloPay
   * @param {string} transactionId
   */
  async checkTransaction(transactionId) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Credenciais SigiloPay não configuradas.' };
    }

    try {
      const clientId = this.getClientId();
      const clientSecret = this.getClientSecret();
      const baseUrl = this.getBaseUrl();

      const url = `${baseUrl}/gateway/transactions?id=${encodeURIComponent(transactionId)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-public-key': clientId,
          'x-secret-key': clientSecret,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SigiloPayPizzaria/1.0',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Erro ao consultar transação (HTTP ${response.status})`,
        };
      }

      const data = await response.json().catch(() => null);
      const tx = data?.transaction || (Array.isArray(data?.transactions) ? data.transactions[0] : data);

      if (!tx) {
        return { success: false, error: 'Transação não encontrada.' };
      }

      const rawStatus = String(tx.status || '').toUpperCase();
      const isPaid = rawStatus === 'COMPLETED' || rawStatus === 'PAID' || rawStatus === 'APPROVED';

      return {
        success: true,
        transactionId: String(tx.id || transactionId),
        status: isPaid ? 'PAID' : (rawStatus || 'PENDING'),
        isPaid,
        amount: typeof tx.amount === 'number' ? tx.amount : Number(tx.chargeAmount || 0),
        payedAt: tx.payedAt || tx.paidAt || null,
        raw: tx,
      };
    } catch (err) {
      return {
        success: false,
        error: `Falha ao consultar transação: ${err.message}`,
      };
    }
  }

  /**
   * Valida se payload do webhook indica pagamento aprovado
   */
  isWebhookPaymentApproved(payload) {
    const event = String(payload?.event || '').toUpperCase();
    const status = String(payload?.transaction?.status || payload?.status || '').toUpperCase();

    return (
      event === 'TRANSACTION_PAID' ||
      event === 'TRANSACTION_COMPLETED' ||
      status === 'COMPLETED' ||
      status === 'PAID' ||
      status === 'APPROVED'
    );
  }
}

export const sigiloPay = new SigiloPayService();
