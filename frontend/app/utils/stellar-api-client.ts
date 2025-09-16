/**
 * Stellar API Client
 * Unified client combining Horizon and Contract bindings
 * Following the pattern from the original api-client.ts
 */

import { horizonClient } from "./horizon-client";
import {
  API_CONFIG,
  getContractAddress,
  getNetworkPassphrase,
  buildRpcUrl,
} from "./api-config";
import {
  StellarApiResponse,
  PaginatedStellarResponse,
  Event,
  User,
  Payment,
  EventFilters,
  CreateEventForm,
  LoginForm,
  RegisterForm,
  AuthUser,
  Goal,
  ChartsData,
  DashboardStats,
  DEXPool,
  SwapQuote,
  Notification,
} from "../types";

// Import contract bindings
import { Client as ContractClient } from "../../../contracts/bindings/src";

// Unified Stellar API Client class
class StellarAPIClient {
  private useHorizon: boolean;
  private useContract: boolean;
  private contractClient: ContractClient;

  constructor() {
    this.useHorizon = true;
    this.useContract = true;

    // Initialize contract client with network configuration
    this.contractClient = new ContractClient({
      rpcUrl: buildRpcUrl(),
      networkPassphrase: getNetworkPassphrase(),
      contractId: getContractAddress(),
    });

    console.log("🌟 StellarAPIClient initialized:", {
      useHorizon: this.useHorizon,
      useContract: this.useContract,
      contractAddress: getContractAddress(),
      network: API_CONFIG.STELLAR.NETWORK.PASSphrase.includes("Test")
        ? "testnet"
        : "mainnet",
    });
  }

  // Authentication methods (using Horizon for account data)
  async login(credentials: LoginForm): Promise<StellarApiResponse<AuthUser>> {
    try {
      // For now, we'll use the account address as the "login"
      // In a real implementation, you'd verify signatures or use other auth methods
      const accountResponse = await horizonClient.getAccount(credentials.email); // Using email as account address

      if (!accountResponse.success) {
        return {
          success: false,
          data: null as any,
          error: "Account not found",
        };
      }

      const userProfile = await horizonClient.getUserProfile(credentials.email);

      if (!userProfile.success) {
        return {
          success: false,
          data: null as any,
          error: "Failed to get user profile",
        };
      }

      const authUser: AuthUser = {
        ...userProfile.data,
        token: "stellar-auth-token", // In real implementation, this would be a JWT or similar
        refreshToken: "stellar-refresh-token",
      };

      return {
        success: true,
        data: authUser,
        message: "Login successful",
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  async register(
    userData: RegisterForm
  ): Promise<StellarApiResponse<AuthUser>> {
    // In Stellar, account creation is done through Horizon
    // This would typically involve creating a new account with initial funding
    try {
      const newUser: AuthUser = {
        id: userData.email, // Using email as account address
        name: userData.name,
        email: userData.email,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        token: "stellar-auth-token",
        refreshToken: "stellar-refresh-token",
      };

      return {
        success: true,
        data: newUser,
        message: "Registration successful",
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }

  async logout(): Promise<StellarApiResponse<null>> {
    // In Stellar, logout is typically handled client-side
    return {
      success: true,
      data: null,
      message: "Logout successful",
    };
  }

  async refreshToken(): Promise<
    StellarApiResponse<{ token: string; refreshToken: string }>
  > {
    // In Stellar, token refresh would depend on your auth implementation
    return {
      success: true,
      data: {
        token: "new-stellar-auth-token",
        refreshToken: "new-stellar-refresh-token",
      },
      message: "Token refreshed",
    };
  }

  async getProfile(accountAddress?: string): Promise<StellarApiResponse<User>> {
    // Se não foi fornecido accountAddress, tenta obter do localStorage
    if (!accountAddress) {
      const storedPubKey = localStorage.getItem("passkeyWalletPub");
      if (storedPubKey) {
        accountAddress = storedPubKey;
      } else {
        return {
          success: false,
          data: null as any,
          error: "No account address provided and no stored wallet found",
        };
      }
    }

    try {
      const result = await horizonClient.getUserProfile(accountAddress);

      // If failed due to connection error, return mock data to not break UI
      if (!result.success && result.error?.includes("Failed after")) {
        console.warn(
          "⚠️ Horizon API unavailable, using mock data for profile"
        );
        return {
          success: true,
          data: {
            id: accountAddress,
            name: "EventCoin User",
            email: "",
            avatar: undefined,
            balance: 0,
            tktBalance: 0,
            joinedAt: new Date().toISOString(),
            isVerified: true,
          },
          message: "Mock data due to connection failure",
        };
      }

      return result;
    } catch (error) {
      console.error("Unexpected error getting profile:", error);
      return {
        success: false,
        data: null as any,
        error: "Unexpected error getting user profile",
      };
    }
  }

  // Events methods (using Contract bindings)
  async getEvents(
    page: number = 1,
    limit: number = 10,
    filters?: EventFilters
  ): Promise<StellarApiResponse<PaginatedStellarResponse<Event>>> {
    try {
      console.log('🔍 Getting events from contract...', { page, limit, filters });
      
      // Call contract method to list events
      const tx = await this.contractClient.list_events({ 
        limit: Math.min(limit * 3, 50) // Get more to filter, max 50 as per contract
      });
      
      const result = await tx.simulate();

      if (!result.result) {
        console.log('❌ No events found in contract result');
        return {
          success: false,
          data: {
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          },
          error: "Failed to get events from contract",
        };
      }

      console.log('✅ Contract returned events:', result.result);
      console.log('🔍 Result type:', typeof result.result);
      console.log('🔍 Result constructor:', result.result?.constructor?.name);

      // Handle different result types from the contract
      let contractEvents: any[] = [];
      
      // The result.result is a Result<Event[], ErrorMessage> type
      // We need to extract the actual data from the Result wrapper
      const actualResult = result.result as any;
      
      console.log('🔍 Actual result structure:', actualResult);
      console.log('🔍 Result keys:', Object.keys(actualResult || {}));
      
      if (Array.isArray(actualResult)) {
        contractEvents = actualResult;
        console.log('✅ Result is direct array');
      } else if (actualResult && typeof actualResult === 'object') {
        // Check if it's a Soroban Vec or similar structure
        if (typeof actualResult.toArray === 'function') {
          contractEvents = actualResult.toArray();
          console.log('✅ Result has toArray method');
        } else if (actualResult.length !== undefined) {
          // Convert array-like object to array
          contractEvents = Array.from(actualResult);
          console.log('✅ Result is array-like');
        } else if (actualResult.ok !== undefined) {
          // Handle Result<T, E> type - extract the ok value
          contractEvents = actualResult.ok || [];
          console.log('✅ Result has ok property:', actualResult.ok);
        } else if (actualResult.value !== undefined) {
          // Alternative Result structure
          contractEvents = Array.isArray(actualResult.value) ? actualResult.value : [actualResult.value];
          console.log('✅ Result has value property:', actualResult.value);
        } else if (actualResult.data !== undefined) {
          // Another possible Result structure
          contractEvents = Array.isArray(actualResult.data) ? actualResult.data : [actualResult.data];
          console.log('✅ Result has data property:', actualResult.data);
        } else {
          // Single event object
          contractEvents = [actualResult];
          console.log('✅ Treating as single event object');
        }
      } else {
        console.log('❌ Unexpected result format:', actualResult);
        contractEvents = [];
      }

      console.log('📋 Contract events array:', contractEvents);

      let events = contractEvents.map(
        (contractEvent: any) => {
          console.log('🔄 Transforming contract event:', contractEvent);
          return this.transformContractEventToEvent(contractEvent);
        }
      );

      console.log('📋 Transformed events:', events);

      // Apply filters
      if (filters) {
        if (filters.search) {
          events = events.filter(
            (event: Event) =>
              event.title
                .toLowerCase()
                .includes(filters.search!.toLowerCase()) ||
              event.description
                .toLowerCase()
                .includes(filters.search!.toLowerCase())
          );
        }

        if (filters.status) {
          events = events.filter(
            (event: Event) => event.status === filters.status
          );
        }

        if (filters.category) {
          events = events.filter(
            (event: Event) => event.category === filters.category
          );
        }
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEvents = events.slice(startIndex, endIndex);

      console.log('📄 Paginated events:', paginatedEvents);

      return {
        success: true,
        data: {
          data: paginatedEvents,
          pagination: {
            page,
            limit,
            total: events.length,
            totalPages: Math.ceil(events.length / limit),
          },
        },
        message: "Success",
      };
    } catch (error) {
      console.error('❌ Error getting events:', error);
      return {
        success: false,
        data: {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        },
        error: error instanceof Error ? error.message : "Failed to get events",
      };
    }
  }

  async getEventById(id: string): Promise<StellarApiResponse<Event>> {
    try {
      const eventId = BigInt(id);
      const tx = await this.contractClient.get_event({ event_id: eventId });
      const result = await tx.simulate();

      if (!result.result) {
        return {
          success: false,
          data: null as any,
          error: "Event not found",
        };
      }

      const event = this.transformContractEventToEvent(result.result as any);
      return {
        success: true,
        data: event,
        message: "Success",
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : "Failed to get event",
      };
    }
  }

  async createEvent(
    eventData: CreateEventForm
  ): Promise<StellarApiResponse<Event>> {
    try {
      console.log('🎉 Creating event with data:', eventData);
      
      // Get the organizer's address from localStorage (passkey wallet)
      const organizerAddress = localStorage.getItem('passkeyWalletPub');
      
      if (!organizerAddress) {
        return {
          success: false,
          data: null as any,
          error: "User not authenticated. Please login with passkey.",
        };
      }

      console.log('👤 Organizer address:', organizerAddress);

      // Create event using contract bindings
      const tx = await this.contractClient.create_event({
        organizer: organizerAddress,
        name: eventData.title,
        fee_rate: undefined, // Use default fee rate from contract
      });

      console.log('📝 Event creation transaction prepared');

      const result = await tx.simulate();

      if (!result.result) {
        console.log('❌ Event creation simulation failed');
        return {
          success: false,
          data: null as any,
          error: "Failed to create event",
        };
      }

      console.log('✅ Event created with ID:', result.result);

      // Get the created event details
      const eventId = result.result.toString();
      return this.getEventById(eventId);
    } catch (error) {
      console.error('❌ Error creating event:', error);
      return {
        success: false,
        data: null as any,
        error:
          error instanceof Error ? error.message : "Failed to create event",
      };
    }
  }

  async updateEvent(
    id: string,
    eventData: Partial<CreateEventForm>
  ): Promise<StellarApiResponse<Event>> {
    // TODO: Implement when contract supports event updates
    return {
      success: false,
      data: null as any,
      error: "Event updates not yet implemented in contract",
    };
  }

  async deleteEvent(id: string): Promise<StellarApiResponse<null>> {
    // TODO: Implement when contract supports event deletion
    return {
      success: false,
      data: null,
      error: "Event deletion not yet implemented in contract",
    };
  }

  async joinEvent(
    id: string,
    userAddress: string
  ): Promise<StellarApiResponse<{ success: boolean; message: string }>> {
    try {
      const eventId = BigInt(id);
      const tx = await this.contractClient.register_wallet_for_event({
        event_id: eventId,
        wallet: userAddress,
      });

      const result = await tx.simulate();

      if (result.result) {
        return {
          success: true,
          data: { success: true, message: "Successfully joined event" },
          message: "Success",
        };
      }

      return {
        success: false,
        data: { success: false, message: "Failed to join event" },
        error: "Failed to join event",
      };
    } catch (error) {
      return {
        success: false,
        data: {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to join event",
        },
        error: error instanceof Error ? error.message : "Failed to join event",
      };
    }
  }

  async leaveEvent(
    id: string,
    userAddress: string
  ): Promise<StellarApiResponse<{ success: boolean; message: string }>> {
    try {
      const eventId = BigInt(id);
      const tx = await this.contractClient.unregister_wallet_from_event({
        event_id: eventId,
        wallet: userAddress,
      });

      const result = await tx.simulate();

      if (result.result) {
        return {
          success: true,
          data: { success: true, message: "Successfully left event" },
          message: "Success",
        };
      }

      return {
        success: false,
        data: { success: false, message: "Failed to leave event" },
        error: "Failed to leave event",
      };
    } catch (error) {
      return {
        success: false,
        data: {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to leave event",
        },
        error: error instanceof Error ? error.message : "Failed to leave event",
      };
    }
  }

  async registerForEvent(
    id: string,
    ticketBatchId: string,
    userAddress: string
  ): Promise<StellarApiResponse<{ success: boolean; message: string }>> {
    // For now, this is the same as joining an event
    return this.joinEvent(id, userAddress);
  }

  async approveEventRegistration(
    id: string,
    userId: string
  ): Promise<StellarApiResponse<{ success: boolean; message: string }>> {
    // TODO: Implement when contract supports approval system
    return {
      success: false,
      data: { success: false, message: "Event approval not yet implemented" },
      error: "Event approval not yet implemented in contract",
    };
  }

  // Users methods (using Horizon)
  async updateProfile(
    userData: Partial<User>
  ): Promise<StellarApiResponse<User>> {
    // TODO: Implement profile updates (would require setting account data)
    return {
      success: false,
      data: null as any,
      error: "Profile updates not yet implemented",
    };
  }

  async getUserEvents(
    userAddress: string
  ): Promise<StellarApiResponse<Event[]>> {
    // TODO: Implement when we can track user's event participation
    return {
      success: true,
      data: [],
      message: "User events not yet implemented",
    };
  }

  // Notifications methods (placeholder)
  async getNotifications(
    userAddress?: string
  ): Promise<StellarApiResponse<Notification[]>> {
    // Se não foi fornecido userAddress, tenta obter do localStorage
    if (!userAddress) {
      const storedPubKey = localStorage.getItem("passkeyWalletPub");
      if (storedPubKey) {
        userAddress = storedPubKey;
      } else {
        return {
          success: false,
          data: [],
          error: "No user address provided and no stored wallet found",
        };
      }
    }

    // TODO: Implement notification system
    return {
      success: true,
      data: [],
      message: "Notifications not yet implemented",
    };
  }

  async markNotificationAsRead(
    id: string
  ): Promise<StellarApiResponse<{ success: boolean }>> {
    // TODO: Implement notification system
    return {
      success: true,
      data: { success: true },
      message: "Notification marked as read",
    };
  }

  async markAllNotificationsAsRead(
    userAddress: string
  ): Promise<StellarApiResponse<{ success: boolean }>> {
    // TODO: Implement notification system
    return {
      success: true,
      data: { success: true },
      message: "All notifications marked as read",
    };
  }

  // Payments methods (using Horizon + Contract)
  async getBalance(
    userAddress?: string
  ): Promise<StellarApiResponse<{ balance: number; tktBalance: number }>> {
    // Se não foi fornecido userAddress, tenta obter do localStorage
    if (!userAddress) {
      const storedPubKey = localStorage.getItem("passkeyWalletPub");
      if (storedPubKey) {
        userAddress = storedPubKey;
      } else {
        return {
          success: false,
          data: { balance: 0, tktBalance: 0 },
          error: "No user address provided and no stored wallet found",
        };
      }
    }

    try {
      const response = await horizonClient.getUserProfile(userAddress);

      if (response.success) {
        return {
          success: true,
          data: {
            balance: response.data.balance,
            tktBalance: response.data.tktBalance,
          },
          message: "Success",
        };
      }

      // If failed due to connection error, return balance 0
      if (response.error?.includes("Failed after")) {
        console.warn("⚠️ Horizon API unavailable, returning balance 0");
        return {
          success: true,
          data: { balance: 0, tktBalance: 0 },
          message: "Balance 0 due to connection failure",
        };
      }

      return response;
    } catch (error) {
      console.error("Unexpected error getting balance:", error);
      return {
        success: false,
        data: { balance: 0, tktBalance: 0 },
        error: "Unexpected error getting account balance",
      };
    }
  }

  async getTransactions(
    userAddress?: string
  ): Promise<StellarApiResponse<Payment[]>> {
    // Se não foi fornecido userAddress, tenta obter do localStorage
    if (!userAddress) {
      const storedPubKey = localStorage.getItem("passkeyWalletPub");
      if (storedPubKey) {
        userAddress = storedPubKey;
      } else {
        return {
          success: false,
          data: [],
          error: "No user address provided and no stored wallet found",
        };
      }
    }

    const response = await horizonClient.getUserTransactions(userAddress);

    if (response.success) {
      return {
        success: true,
        data: response.data.data,
        message: "Success",
      };
    }

    return {
      success: false,
      data: [],
      error: response.error,
    };
  }

  async transferP2P(
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<StellarApiResponse<{ success: boolean; transactionId: string }>> {
    // This would require building and submitting a Stellar transaction
    // For now, return a placeholder
    return {
      success: true,
      data: {
        success: true,
        transactionId: `tx_${Date.now()}`,
      },
      message: "Transfer initiated",
    };
  }

  async buyTokens(
    userAddress: string,
    amount: number
  ): Promise<StellarApiResponse<{ success: boolean; transactionId: string }>> {
    // This would require building and submitting a Stellar transaction
    return {
      success: true,
      data: {
        success: true,
        transactionId: `tx_${Date.now()}`,
      },
      message: "Token purchase initiated",
    };
  }

  // DEX methods (placeholder)
  async getPools(): Promise<StellarApiResponse<DEXPool[]>> {
    // TODO: Implement when contract supports DEX
    return {
      success: true,
      data: [],
      message: "DEX pools not yet implemented in contract",
    };
  }

  async createPool(
    tokenA: string,
    tokenB: string,
    amountA: number,
    amountB: number
  ): Promise<StellarApiResponse<{ success: boolean; poolId: string }>> {
    // TODO: Implement when contract supports DEX
    return {
      success: false,
      data: { success: false, poolId: "" },
      error: "DEX pools not yet implemented in contract",
    };
  }

  async addLiquidity(
    poolId: string,
    amountA: number,
    amountB: number
  ): Promise<StellarApiResponse<{ success: boolean; transactionId: string }>> {
    // TODO: Implement when contract supports DEX
    return {
      success: false,
      data: { success: false, transactionId: "" },
      error: "DEX liquidity not yet implemented in contract",
    };
  }

  async removeLiquidity(
    poolId: string,
    amount: number
  ): Promise<StellarApiResponse<{ success: boolean; transactionId: string }>> {
    // TODO: Implement when contract supports DEX
    return {
      success: false,
      data: { success: false, transactionId: "" },
      error: "DEX liquidity not yet implemented in contract",
    };
  }

  async swap(
    tokenA: string,
    tokenB: string,
    amount: number
  ): Promise<
    StellarApiResponse<{
      success: boolean;
      transactionId: string;
      outputAmount: number;
    }>
  > {
    // TODO: Implement when contract supports DEX
    return {
      success: false,
      data: { success: false, transactionId: "", outputAmount: 0 },
      error: "DEX swaps not yet implemented in contract",
    };
  }

  async getSwapQuote(
    tokenA: string,
    tokenB: string,
    amount: number
  ): Promise<StellarApiResponse<SwapQuote>> {
    // TODO: Implement when contract supports DEX
    return {
      success: true,
      data: {
        inputAmount: amount,
        outputAmount: amount * 0.95,
        priceImpact: 0.5,
        fee: amount * 0.003,
        route: [tokenA, tokenB],
      },
      message: "Swap quotes not yet implemented in contract",
    };
  }

  // Analytics methods (placeholder)
  async getDashboardStats(): Promise<StellarApiResponse<DashboardStats>> {
    // TODO: Implement when contract supports analytics
    return {
      success: true,
      data: {
        totalEvents: 0,
        totalUsers: 0,
        totalRevenue: 0,
        activeEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        userStats: {
          totalParticipants: 0,
          newUsersThisMonth: 0,
          activeUsers: 0,
          averageEventsPerUser: 0,
        },
        eventStats: {
          totalEvents: 0,
          averageRating: 0,
          totalParticipants: 0,
          averagePrice: 0,
        },
        paymentStats: {
          totalVolume: 0,
          totalTransactions: 0,
          averageTransaction: 0,
          tktInCirculation: 0,
        },
      },
      message: "Dashboard stats not yet implemented in contract",
    };
  }

  async getEventStats(): Promise<StellarApiResponse<any>> {
    // TODO: Implement when contract supports analytics
    return {
      success: true,
      data: {},
      message: "Event stats not yet implemented",
    };
  }

  async getUserStats(): Promise<StellarApiResponse<any>> {
    // TODO: Implement when contract supports analytics
    return {
      success: true,
      data: {},
      message: "User stats not yet implemented",
    };
  }

  async getPaymentStats(): Promise<StellarApiResponse<any>> {
    // TODO: Implement when contract supports analytics
    return {
      success: true,
      data: {},
      message: "Payment stats not yet implemented",
    };
  }

  // Goals methods (placeholder)
  async getGoals(userAddress?: string): Promise<StellarApiResponse<Goal[]>> {
    // Se não foi fornecido userAddress, tenta obter do localStorage
    if (!userAddress) {
      const storedPubKey = localStorage.getItem("passkeyWalletPub");
      if (storedPubKey) {
        userAddress = storedPubKey;
      } else {
        return {
          success: false,
          data: [],
          error: "No user address provided and no stored wallet found",
        };
      }
    }

    // TODO: Implement when contract supports goals
    return {
      success: true,
      data: [],
      message: "Goals not yet implemented in contract",
    };
  }

  async createGoal(goalData: Partial<Goal>): Promise<StellarApiResponse<Goal>> {
    // TODO: Implement when contract supports goals
    return {
      success: false,
      data: null as any,
      error: "Goals not yet implemented in contract",
    };
  }

  async updateGoal(
    id: string,
    goalData: Partial<Goal>
  ): Promise<StellarApiResponse<Goal>> {
    // TODO: Implement when contract supports goals
    return {
      success: false,
      data: null as any,
      error: "Goals not yet implemented in contract",
    };
  }

  async deleteGoal(id: string): Promise<StellarApiResponse<null>> {
    // TODO: Implement when contract supports goals
    return {
      success: false,
      data: null,
      error: "Goals not yet implemented in contract",
    };
  }

  // Charts methods (placeholder)
  async getChartsData(
    userAddress?: string
  ): Promise<StellarApiResponse<ChartsData>> {
    // Se não foi fornecido userAddress, tenta obter do localStorage
    if (!userAddress) {
      const storedPubKey = localStorage.getItem("passkeyWalletPub");
      if (storedPubKey) {
        userAddress = storedPubKey;
      } else {
        return {
          success: false,
          data: null as any,
          error: "No user address provided and no stored wallet found",
        };
      }
    }
    // TODO: Implement when contract supports analytics
    return {
      success: true,
      data: {
        balanceHistory: [],
        spendingByCategory: [],
        eventsOverTime: [],
        revenueOverTime: [],
      },
      message: "Charts data not yet implemented in contract",
    };
  }

  // Helper methods for data transformation
  private transformContractEventToEvent(contractEvent: any): Event {
    console.log('🔄 Transforming contract event:', contractEvent);
    console.log('🔍 Contract event properties:', Object.keys(contractEvent || {}));
    
    // Handle undefined or null contractEvent
    if (!contractEvent) {
      console.log('❌ Contract event is null or undefined');
      throw new Error('Contract event is null or undefined');
    }

    // Safely extract properties with fallbacks based on actual contract structure
    const id = contractEvent.id !== undefined ? contractEvent.id.toString() : 'unknown';
    const name = contractEvent.name || contractEvent.title || 'Unnamed Event';
    const organizer = contractEvent.organizer || 'Unknown Organizer';
    const created_at = contractEvent.created_at || contractEvent.createdAt || Date.now() / 1000;
    const is_active = contractEvent.is_active !== undefined ? contractEvent.is_active : 
                     contractEvent.isActive !== undefined ? contractEvent.isActive : true;
    const fee_rate = contractEvent.fee_rate || contractEvent.feeRate || 0;
    const total_volume = contractEvent.total_volume || contractEvent.totalVolume || '0';

    console.log('📋 Extracted properties:', { 
      id, 
      name, 
      organizer, 
      created_at, 
      is_active, 
      fee_rate, 
      total_volume 
    });

    // Convert total_volume from stroops to XLM (1 XLM = 10,000,000 stroops)
    const volumeInXLM = Number(total_volume) / 10000000;
    const feeInXLM = (Number(total_volume) * fee_rate) / 100000000000; // fee_rate is in basis points

    return {
      id,
      title: name,
      description: `Event created by ${organizer}. Fee rate: ${(fee_rate / 100).toFixed(2)}%`,
      date: new Date(Number(created_at) * 1000)
        .toISOString()
        .split("T")[0],
      time: "19:00",
      location: "TBD",
      attendees: 0, // This would need to be tracked separately
      maxAttendees: 100, // Default value
      price: 0, // Default value
      status: is_active ? "active" : "cancelled",
      rating: 0,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop",
      organizer,
      category: "General",
      requiresApproval: false,
      createdAt: new Date(Number(created_at) * 1000).toISOString(),
      updatedAt: new Date(Number(created_at) * 1000).toISOString(),
      // Additional contract-specific fields
      feeRate: fee_rate,
      totalVolume: volumeInXLM,
      totalVolumeStroops: total_volume,
    };
  }
}

// Export singleton instance
export const stellarApiClient = new StellarAPIClient();

// Export individual methods for easier testing
export const {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  registerForEvent,
  approveEventRegistration,
  updateProfile,
  getUserEvents,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getBalance,
  getTransactions,
  transferP2P,
  buyTokens,
  getPools,
  createPool,
  addLiquidity,
  removeLiquidity,
  swap,
  getSwapQuote,
  getDashboardStats,
  getEventStats,
  getUserStats,
  getPaymentStats,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getChartsData,
} = stellarApiClient;
