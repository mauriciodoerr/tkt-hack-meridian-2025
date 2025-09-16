"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { Navbar } from "../../components/layout/Navbar";
import { QRScanner } from "../../components/features/payments/QRScanner";
import { PaymentForm } from "../../components/features/payments/PaymentForm";
import { TokenPurchaseForm } from "../../components/features/payments/TokenPurchaseForm";
import { P2PTransferForm } from "../../components/features/payments/P2PTransferForm";
import { InviteFriendGeneralModal } from "../../components/features/payments/InviteFriendGeneralModal";
import {
  QrCode,
  CreditCard,
  History,
  Wallet,
  Send,
  UserPlus,
} from "lucide-react";
import { apiClientInstance } from "../utils/api-client-factory";
import { Payment, User } from "../types";
import Image from "next/image";

export default function PaymentsPage() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showTokenPurchase, setShowTokenPurchase] = useState(false);
  const [showP2PTransfer, setShowP2PTransfer] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [vendorData, setVendorData] = useState<{
    vendorId: string;
    vendorName: string;
    eventId?: number;
    eventName?: string;
  } | null>(null);
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileResponse, transactionsResponse, balanceResponse] =
        await Promise.all([
          apiClientInstance.getProfile(),
          apiClientInstance.getTransactions(),
          apiClientInstance.getBalance(),
        ]);

      if (profileResponse.success) {
        setUser(profileResponse.data);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data);
      }

      if (balanceResponse.success && profileResponse.success) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                balance: balanceResponse.data.balance,
                tktBalance: balanceResponse.data.tktBalance,
              }
            : null
        );

        console.log(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      setVendorData({
        vendorId: parsedData.vendorId,
        vendorName: parsedData.vendorName,
        eventId: parsedData.eventId,
        eventName: parsedData.eventName,
      });
      setShowQRScanner(false);
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Invalid QR code data:", error);
    }
  };

  const handlePayment = async (amount: number, description: string) => {
    try {
      const fromAddress = localStorage.getItem("passkeyWalletPub");
      const response = await apiClientInstance.transferP2P(
        fromAddress || "",
        vendorData?.vendorId || "",
        amount
      );

      if (response.success) {
        // Refresh data
        await loadData();
        setShowPaymentForm(false);
        setVendorData(null);
        console.log("Payment successful:", response.data);
      } else {
        console.error("Payment failed:", response.error);
      }
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  // const handleTokenPurchase = async (amount: number) => {
  //   try {
  //     const response = await apiClientInstance.buyTokens(amount)

  //     if (response.success) {
  //       // Refresh data
  //       await loadData()
  //       setShowTokenPurchase(false)
  //       console.log('Token purchase successful:', response.data)
  //     } else {
  //       console.error('Token purchase failed:', response.error)
  //     }
  //   } catch (err) {
  //     console.error('Token purchase error:', err)
  //   }
  // }

  // const handleP2PTransfer = async (recipientId: string, amount: number, description: string) => {
  //   try {
  //     const response = await apiClientInstance.transferP2P(recipientId, amount)

  //     if (response.success) {
  //       // Refresh data
  //       await loadData()
  //       setShowP2PTransfer(false)
  //       console.log('P2P transfer successful:', response.data)
  //     } else {
  //       console.error('P2P transfer failed:', response.error)
  //     }
  //   } catch (err) {
  //     console.error('P2P transfer error:', err)
  //   }
  // }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <CreditCard className="w-4 h-4" />;
      case "transfer":
        return <Send className="w-4 h-4" />;
      case "event_payment":
        return <Wallet className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "text-red-400";
      case "transfer":
        return "text-blue-400";
      case "event_payment":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Error Loading Payments
            </h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={loadData}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Centralized Content - Only what's in the red box */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
              <p className="text-gray-400">
                Manage your payments and TKT transactions
              </p>
            </div>

            {/* XLM Balance Card */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Saldo XLM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-3xl font-bold text-white mb-2">
                  {user?.tktBalance?.toLocaleString("pt-BR") || "95,489"}
                  <Image
                    src="/logo-stellar.png"
                    alt="Stellar logo"
                    width={24}
                    height={24}
                  />
                </div>
                <p className="text-gray-400 text-sm">Tokens para eventos</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setShowQRScanner(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white h-20 flex flex-col items-center justify-center"
              >
                <QrCode className="w-6 h-6 mb-2" />
                <span className="text-sm">Escanear QR</span>
              </Button>

              <Button
                onClick={() => setShowInviteModal(true)}
                variant="outline"
                className="border-dark-700 text-gray-300 hover:bg-dark-800 h-20 flex flex-col items-center justify-center"
              >
                <UserPlus className="w-6 h-6 mb-2" />
                <span className="text-sm">Convidar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-dark-800 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <History className="w-5 h-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full bg-dark-600 ${getTransactionColor(
                          transaction.type
                        )}`}
                      >
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">
                          {transaction.description}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaction.timestamp).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          transaction.type === "purchase"
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {transaction.type === "purchase" ? "-" : "+"}R${" "}
                        {transaction.amount.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {transaction.tktAmount} TKT
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
        />

        <PaymentForm
          isOpen={showPaymentForm}
          onClose={() => {
            setShowPaymentForm(false);
            setVendorData(null);
          }}
          vendorData={vendorData}
          onPayment={handlePayment}
        />
        {/*

        <TokenPurchaseForm
          isOpen={showTokenPurchase}
          onClose={() => setShowTokenPurchase(false)}
          onPurchase={handleTokenPurchase}
        />

        {/* <P2PTransferForm
          isOpen={showP2PTransfer}
          onClose={() => setShowP2PTransfer(false)}
          onTransfer={handleP2PTransfer}
        /> */}

        <InviteFriendGeneralModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      </div>
    </div>
  );
}
