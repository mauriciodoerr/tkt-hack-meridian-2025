"use client";

import { useState } from "react";
import { Button, Input, Card, CardContent, Modal } from "../../ui";
import { CreditCard, Wallet, Zap, CheckCircle, ArrowRight } from "lucide-react";
import {
  ensurePasskeyWithPrf,
  invokeWithPasskeyWallet,
  deriveKeyFromPasskey,
  generateStellarKeypair,
} from "../../../app/lib/passkeySoroban";
import { getContractAddress } from "../../../app/utils/api-config";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendorData: {
    vendorId: string
    vendorName: string
    eventId?: number,
    eventName?: string
  } | null;
  onPayment: (amount: number, vendorId: string) => void;
}

/** ===== Usando contrato da configuração centralizada ===== */
const METHOD_NAME = "event_payment";

async function mapArgsForEventPayment(amount: number, fromAddress: string, vendorId?: string): Promise<any[]> {
  // Para event_payment: event_id, from, to, amount
  try {
    // Por enquanto, vamos usar um event_id fixo para teste
    const event_id = 1; // ID do evento de teste
    const toAddress = vendorId || "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX"; // Mock vendor
    
    console.log('🔐 Argumentos do pagamento do evento:', {
      eventId: event_id,
      from: fromAddress,
      to: toAddress,
      amount
    });
    
    return [event_id, fromAddress, toAddress, amount];
  } catch (error) {
    console.error('Erro ao gerar argumentos do contrato:', error);
    throw new Error('Falha ao preparar dados da transação');
  }
}


function parseContractError(error: any, operation: string): string {
  if (!error) return `Erro desconhecido durante ${operation}`;
  
  const errorStr = error.toString();
  console.log(`🔍 Analisando erro do contrato para ${operation}:`, errorStr);
  
  // Mapear erros comuns do Stellar/Soroban
  if (errorStr.includes('WasmVm, InvalidAction')) {
    return `Ação inválida no contrato durante ${operation}. Verifique se o evento existe e se os parâmetros estão corretos.`;
  }
  
  if (errorStr.includes('WasmVm, UnexpectedSize')) {
    return `Tamanho inesperado de dados durante ${operation}. Verifique os argumentos passados.`;
  }
  
  if (errorStr.includes('WasmVm, UnreachableCodeReached')) {
    return `Erro interno do contrato durante ${operation}. O contrato pode estar em estado inválido.`;
  }
  
  if (errorStr.includes('WalletAlreadyRegistered')) {
    return `Carteira já registrada para este evento.`;
  }
  
  if (errorStr.includes('EventNotFound')) {
    return `Evento não encontrado. Verifique se o evento foi criado.`;
  }
  
  if (errorStr.includes('InsufficientBalance')) {
    return `Saldo insuficiente para realizar ${operation}.`;
  }
  
  if (errorStr.includes('Unauthorized')) {
    return `Não autorizado para realizar ${operation}.`;
  }
  
  // Se não conseguir mapear, retorna o erro original com contexto
  return `Erro durante ${operation}: ${errorStr}`;
}


export function PaymentForm({
  isOpen,
  onClose,
  vendorData,
  onPayment,
}: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"amount" | "confirm" | "success">("amount");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [walletPub, setWalletPub] = useState<string | null>(null);

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) setStep("confirm");
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // 1) Garante passkey com PRF (não recria se já existir)
      const credentialId = await ensurePasskeyWithPrf();

      // 2) Obtém endereço da carteira
      //const keyMaterial = await deriveKeyFromPasskey(credentialId);
      //const keypair = generateStellarKeypair(keyMaterial);
      const walletAddress = localStorage.getItem('passkeyWalletPub');

      // 3) Obtém ID do contrato
      const CONTRACT_ADDRESS = getContractAddress();

      // 4) Args p/ contrato de pagamento do evento
      const value = parseFloat(amount);
      if (!value || value <= 0) throw new Error("Valor inválido.");
      //const args = await mapArgsForEventPayment(value, walletAddress, vendorData?.vendorId);

      const args = [vendorData?.eventId, walletAddress, vendorData?.vendorId, value];

      // 5) Invoca contrato de pagamento do evento
      console.log('💰 Executando pagamento do evento...');
      console.log('📋 Nota: O contrato cuida das fees, nossa carteira não paga nada');
      const res = await invokeWithPasskeyWallet({
        credentialIdBase64Url: credentialId,
        contractId: CONTRACT_ADDRESS,
        method: METHOD_NAME,
        args,
      });

      // Falha na simulação
      if (res.status === "SIMULATION_FAILED") {
        const errorMsg = parseContractError(res.diag?.error, "pagamento do evento");
        console.error("❌ Simulação do pagamento falhou:", errorMsg);
        throw new Error(errorMsg);
      }

      // OK imediato: PENDING (enviada) ou DUPLICATE (já enviada)
      const isOkNow = res.status === "PENDING" || res.status === "DUPLICATE";

      // Falhas de envio
      if (res.status === "ERROR" || res.status === "TRY_AGAIN_LATER") {
        console.error("Envio falhou:", res);
        throw new Error("Transação não aceita pelo RPC (tente novamente).");
      }

      if (!isOkNow) {
        console.warn("Status inesperado:", res.status, res);
      }

      setTxHash(res.hash ?? null);
      setWalletPub(res.publicKey ?? null);

      if (vendorData) onPayment(value, vendorData.vendorId);

      setStep("success");

      // auto-close opcional
      setTimeout(() => {
        onClose();
        setAmount("");
        setStep("amount");
        setTxHash(null);
        setWalletPub(null);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Erro ao processar pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
    return numericValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmount(e.target.value));
  };

  const getFeeAmount = () => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum * 0.05;
  };

  const getVendorAmount = () => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum * 0.95;
  };

  if (step === "success") {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Pagamento Realizado!
            </h2>
            <p className="text-gray-400">
              Sua transação foi processada com sucesso (testnet)
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 space-y-1">
            <p className="text-white font-medium">
              R$ {parseFloat(amount).toFixed(2)} enviados para{" "}
              {vendorData?.vendorName}
            </p>
            <p className="text-sm text-gray-400">
              Assinado pela wallet derivada do passkey
            </p>
            {txHash && (
              <p className="text-xs text-gray-500 break-all">
                tx hash: {txHash}
              </p>
            )}
            {walletPub && (
              <p className="text-xs text-gray-500 break-all">
                wallet (passkey): {walletPub}
              </p>
            )}
          </div>

          <Button onClick={onClose} className="w-full">
            Concluir
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === "amount" ? "Fazer Pagamento" : "Confirmar Pagamento"}
          </h2>
          <p className="text-gray-400">
            {step === "amount"
              ? "Digite o valor que deseja pagar"
              : "Revise os detalhes do pagamento"}
          </p>
        </div>

        {vendorData && (
          <Card variant="premium">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {vendorData.vendorName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {vendorData.eventName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "amount" ? (
          <form onSubmit={handleAmountSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor do Pagamento
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  R$
                </span>
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="pl-10 text-lg"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["10", "25", "50"].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(value)}
                  className="text-sm"
                >
                  R$ {value}
                </Button>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Valor do Pagamento:</span>
                <span className="text-white font-medium">
                  R$ {parseFloat(amount).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Para o Vendedor (95%):</span>
                <span className="text-green-400 font-medium">
                  R$ {getVendorAmount().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <span className="text-gray-400">Taxa da Plataforma (5%):</span>
                <span className="text-primary-400 font-medium">
                  R$ {getFeeAmount().toFixed(2)}
                </span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total:</span>
                  <span className="text-white font-bold text-lg">
                    R$ {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-green-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">
                Assinado pela wallet derivada do passkey (testnet)
              </span>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep("amount")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1"
                loading={isProcessing}
                disabled={isProcessing}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isProcessing ? "Processando..." : "Confirmar Pagamento"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
