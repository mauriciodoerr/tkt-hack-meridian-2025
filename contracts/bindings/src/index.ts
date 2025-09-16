import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export const ContractError = {
  1: {message:"FeeRateExceeds10Percent"},
  2: {message:"AmountMustBePositive"},
  3: {message:"ContractNotInitialized"},
  4: {message:"InsufficientBalanceFromSender"},
  5: {message:"InsufficientAllowance"},
  6: {message:"EventNotFound"},
  7: {message:"EventNotActive"},
  8: {message:"NotEventOrganizer"},
  9: {message:"EventNameTooLong"},
  10: {message:"EventAlreadyExists"},
  11: {message:"AlreadyInitialized"},
  12: {message:"EventStillActive"},
  13: {message:"WalletNotRegistered"},
  14: {message:"WalletAlreadyRegistered"},
  15: {message:"OrganizerCannotRegister"}
}


export interface Event {
  created_at: u64;
  fee_rate: u32;
  id: u64;
  is_active: boolean;
  name: string;
  organizer: string;
  total_volume: i128;
}




export interface ContractConfig {
  admin: string;
  default_fee_rate: u32;
  next_event_id: u64;
  token_address: string;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Inicializa o contrato com taxa padrão, admin e token
   */
  initialize: ({admin, default_fee_rate, token_address}: {admin: string, default_fee_rate: u32, token_address: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Consulta configuração do contrato (apenas admin)
   */
  get_config: ({admin}: {admin: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<ContractConfig>>>

  /**
   * Construct and simulate a update_default_fee_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Atualiza taxa padrão (apenas admin)
   */
  update_default_fee_rate: ({admin, new_fee_rate}: {admin: string, new_fee_rate: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cria um novo evento/festival
   */
  create_event: ({organizer, name, fee_rate}: {organizer: string, name: string, fee_rate: Option<u32>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a create_event_with_allowance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cria um evento e autoriza automaticamente o contrato a gastar tokens do organizador para taxas
   */
  create_event_with_allowance: ({organizer, name, fee_rate, max_allowance}: {organizer: string, name: string, fee_rate: Option<u32>, max_allowance: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a set_event_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Ativa ou desativa um evento (apenas organizador)
   */
  set_event_status: ({event_id, is_active}: {event_id: u64, is_active: boolean}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Consulta informações de um evento
   */
  get_event: ({event_id}: {event_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Event>>>

  /**
   * Construct and simulate a get_event_by_name transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Consulta evento por nome
   */
  get_event_by_name: ({name}: {name: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Event>>>

  /**
   * Construct and simulate a list_events transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Lista todos os eventos (limitado para evitar problemas de gas)
   */
  list_events: ({limit}: {limit: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Array<Event>>>>

  /**
   * Construct and simulate a get_event_fees transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Consulta taxas acumuladas de um evento
   */
  get_event_fees: ({event_id}: {event_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_fee_authorization transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Consulta o allowance do fee_payer para o contrato
   */
  get_fee_authorization: ({fee_payer}: {fee_payer: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a register_wallet_for_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Registra uma carteira para participar de um evento
   */
  register_wallet_for_event: ({event_id, wallet}: {event_id: u64, wallet: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a unregister_wallet_from_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Remove registro de uma carteira de um evento
   */
  unregister_wallet_from_event: ({event_id, wallet}: {event_id: u64, wallet: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a is_wallet_registered transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Verifica se uma carteira está registrada para um evento
   */
  is_wallet_registered: ({event_id, wallet}: {event_id: u64, wallet: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a event_payment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Realiza pagamento para um evento específico usando fundos da carteira
   */
  event_payment: ({event_id, from, to, amount}: {event_id: u64, from: string, to: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a payment_with_third_party_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Realiza pagamento geral (sem evento específico) - mantém compatibilidade
   */
  payment_with_third_party_fee: ({from, to, fee_payer, amount}: {from: string, to: string, fee_payer: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a payment_with_auth_fee_payer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Realiza pagamento com fee_payer pré-autorizado (sem assinatura)
   */
  payment_with_auth_fee_payer: ({from, to, fee_payer, amount}: {from: string, to: string, fee_payer: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a authorize_fee_payments transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Autoriza o contrato a usar tokens do usuário para pagar fees
   * Nota: Esta função chama approve() no contrato de token
   */
  authorize_fee_payments: ({fee_payer, max_fee_amount}: {fee_payer: string, max_fee_amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a revoke_fee_authorization transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Remove autorização para pagamento automático de fees
   */
  revoke_fee_authorization: ({fee_payer}: {fee_payer: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a increase_event_allowance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Permite ao organizador aumentar o allowance para cobrir mais taxas do evento
   */
  increase_event_allowance: ({event_id, additional_allowance}: {event_id: u64, additional_allowance: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a withdraw_event_fees transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Permite ao organizador sacar taxas acumuladas (apenas se evento estiver inativo)
   */
  withdraw_event_fees: ({event_id}: {event_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<i128>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAADUNvbnRyYWN0RXJyb3IAAAAAAAAPAAAAAAAAABdGZWVSYXRlRXhjZWVkczEwUGVyY2VudAAAAAABAAAAAAAAABRBbW91bnRNdXN0QmVQb3NpdGl2ZQAAAAIAAAAAAAAAFkNvbnRyYWN0Tm90SW5pdGlhbGl6ZWQAAAAAAAMAAAAAAAAAHUluc3VmZmljaWVudEJhbGFuY2VGcm9tU2VuZGVyAAAAAAAABAAAAAAAAAAVSW5zdWZmaWNpZW50QWxsb3dhbmNlAAAAAAAABQAAAAAAAAANRXZlbnROb3RGb3VuZAAAAAAAAAYAAAAAAAAADkV2ZW50Tm90QWN0aXZlAAAAAAAHAAAAAAAAABFOb3RFdmVudE9yZ2FuaXplcgAAAAAAAAgAAAAAAAAAEEV2ZW50TmFtZVRvb0xvbmcAAAAJAAAAAAAAABJFdmVudEFscmVhZHlFeGlzdHMAAAAAAAoAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAACwAAAAAAAAAQRXZlbnRTdGlsbEFjdGl2ZQAAAAwAAAAAAAAAE1dhbGxldE5vdFJlZ2lzdGVyZWQAAAAADQAAAAAAAAAXV2FsbGV0QWxyZWFkeVJlZ2lzdGVyZWQAAAAADgAAAAAAAAAXT3JnYW5pemVyQ2Fubm90UmVnaXN0ZXIAAAAADw==",
        "AAAAAQAAAAAAAAAAAAAABUV2ZW50AAAAAAAABwAAAAAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAAIZmVlX3JhdGUAAAAEAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAAEbmFtZQAAABAAAAAAAAAACW9yZ2FuaXplcgAAAAAAABMAAAAAAAAADHRvdGFsX3ZvbHVtZQAAAAs=",
        "AAAABQAAAAAAAAAAAAAADEV2ZW50Q3JlYXRlZAAAAAEAAAANZXZlbnRfY3JlYXRlZAAAAAAAAAQAAAAAAAAACGV2ZW50X2lkAAAABgAAAAAAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAAAAAAJb3JnYW5pemVyAAAAAAAAEwAAAAAAAAAAAAAACGZlZV9yYXRlAAAABAAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAADFBheW1lbnRFdmVudAAAAAEAAAANcGF5bWVudF9ldmVudAAAAAAAAAcAAAAAAAAACGV2ZW50X2lkAAAABgAAAAAAAAAAAAAABGZyb20AAAATAAAAAAAAAAAAAAACdG8AAAAAABMAAAAAAAAAAAAAAAlmZWVfcGF5ZXIAAAAAAAATAAAAAAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAAAAAAKZmVlX2Ftb3VudAAAAAAACwAAAAAAAAAAAAAACGZlZV9yYXRlAAAABAAAAAAAAAAC",
        "AAAAAQAAAAAAAAAAAAAADkNvbnRyYWN0Q29uZmlnAAAAAAAEAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAEGRlZmF1bHRfZmVlX3JhdGUAAAAEAAAAAAAAAA1uZXh0X2V2ZW50X2lkAAAAAAAABgAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABM=",
        "AAAAAAAAADVJbmljaWFsaXphIG8gY29udHJhdG8gY29tIHRheGEgcGFkcsOjbywgYWRtaW4gZSB0b2tlbgAAAAAAAAppbml0aWFsaXplAAAAAAADAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAEGRlZmF1bHRfZmVlX3JhdGUAAAAEAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAADJDb25zdWx0YSBjb25maWd1cmHDp8OjbyBkbyBjb250cmF0byAoYXBlbmFzIGFkbWluKQAAAAAACmdldF9jb25maWcAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAEAAAPpAAAH0AAAAA5Db250cmFjdENvbmZpZwAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAACRBdHVhbGl6YSB0YXhhIHBhZHLDo28gKGFwZW5hcyBhZG1pbikAAAAXdXBkYXRlX2RlZmF1bHRfZmVlX3JhdGUAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAxuZXdfZmVlX3JhdGUAAAAEAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAABxDcmlhIHVtIG5vdm8gZXZlbnRvL2Zlc3RpdmFsAAAADGNyZWF0ZV9ldmVudAAAAAMAAAAAAAAACW9yZ2FuaXplcgAAAAAAABMAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAhmZWVfcmF0ZQAAA+gAAAAEAAAAAQAAA+kAAAAGAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAF5DcmlhIHVtIGV2ZW50byBlIGF1dG9yaXphIGF1dG9tYXRpY2FtZW50ZSBvIGNvbnRyYXRvIGEgZ2FzdGFyIHRva2VucyBkbyBvcmdhbml6YWRvciBwYXJhIHRheGFzAAAAAAAbY3JlYXRlX2V2ZW50X3dpdGhfYWxsb3dhbmNlAAAAAAQAAAAAAAAACW9yZ2FuaXplcgAAAAAAABMAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAhmZWVfcmF0ZQAAA+gAAAAEAAAAAAAAAA1tYXhfYWxsb3dhbmNlAAAAAAAACwAAAAEAAAPpAAAABgAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAADBBdGl2YSBvdSBkZXNhdGl2YSB1bSBldmVudG8gKGFwZW5hcyBvcmdhbml6YWRvcikAAAAQc2V0X2V2ZW50X3N0YXR1cwAAAAIAAAAAAAAACGV2ZW50X2lkAAAABgAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAACNDb25zdWx0YSBpbmZvcm1hw6fDtWVzIGRlIHVtIGV2ZW50bwAAAAAJZ2V0X2V2ZW50AAAAAAAAAQAAAAAAAAAIZXZlbnRfaWQAAAAGAAAAAQAAA+kAAAfQAAAABUV2ZW50AAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAABhDb25zdWx0YSBldmVudG8gcG9yIG5vbWUAAAARZ2V0X2V2ZW50X2J5X25hbWUAAAAAAAABAAAAAAAAAARuYW1lAAAAEAAAAAEAAAPpAAAH0AAAAAVFdmVudAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAD5MaXN0YSB0b2RvcyBvcyBldmVudG9zIChsaW1pdGFkbyBwYXJhIGV2aXRhciBwcm9ibGVtYXMgZGUgZ2FzKQAAAAAAC2xpc3RfZXZlbnRzAAAAAAEAAAAAAAAABWxpbWl0AAAAAAAABAAAAAEAAAPpAAAD6gAAB9AAAAAFRXZlbnQAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAACZDb25zdWx0YSB0YXhhcyBhY3VtdWxhZGFzIGRlIHVtIGV2ZW50bwAAAAAADmdldF9ldmVudF9mZWVzAAAAAAABAAAAAAAAAAhldmVudF9pZAAAAAYAAAABAAAACw==",
        "AAAAAAAAADFDb25zdWx0YSBvIGFsbG93YW5jZSBkbyBmZWVfcGF5ZXIgcGFyYSBvIGNvbnRyYXRvAAAAAAAAFWdldF9mZWVfYXV0aG9yaXphdGlvbgAAAAAAAAEAAAAAAAAACWZlZV9wYXllcgAAAAAAABMAAAABAAAACw==",
        "AAAAAAAAADJSZWdpc3RyYSB1bWEgY2FydGVpcmEgcGFyYSBwYXJ0aWNpcGFyIGRlIHVtIGV2ZW50bwAAAAAAGXJlZ2lzdGVyX3dhbGxldF9mb3JfZXZlbnQAAAAAAAACAAAAAAAAAAhldmVudF9pZAAAAAYAAAAAAAAABndhbGxldAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAACxSZW1vdmUgcmVnaXN0cm8gZGUgdW1hIGNhcnRlaXJhIGRlIHVtIGV2ZW50bwAAABx1bnJlZ2lzdGVyX3dhbGxldF9mcm9tX2V2ZW50AAAAAgAAAAAAAAAIZXZlbnRfaWQAAAAGAAAAAAAAAAZ3YWxsZXQAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAADhWZXJpZmljYSBzZSB1bWEgY2FydGVpcmEgZXN0w6EgcmVnaXN0cmFkYSBwYXJhIHVtIGV2ZW50bwAAABRpc193YWxsZXRfcmVnaXN0ZXJlZAAAAAIAAAAAAAAACGV2ZW50X2lkAAAABgAAAAAAAAAGd2FsbGV0AAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAEZSZWFsaXphIHBhZ2FtZW50byBwYXJhIHVtIGV2ZW50byBlc3BlY8OtZmljbyB1c2FuZG8gZnVuZG9zIGRhIGNhcnRlaXJhAAAAAAANZXZlbnRfcGF5bWVudAAAAAAAAAQAAAAAAAAACGV2ZW50X2lkAAAABgAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAAEpSZWFsaXphIHBhZ2FtZW50byBnZXJhbCAoc2VtIGV2ZW50byBlc3BlY8OtZmljbykgLSBtYW50w6ltIGNvbXBhdGliaWxpZGFkZQAAAAAAHHBheW1lbnRfd2l0aF90aGlyZF9wYXJ0eV9mZWUAAAAEAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACdG8AAAAAABMAAAAAAAAACWZlZV9wYXllcgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAEBSZWFsaXphIHBhZ2FtZW50byBjb20gZmVlX3BheWVyIHByw6ktYXV0b3JpemFkbyAoc2VtIGFzc2luYXR1cmEpAAAAG3BheW1lbnRfd2l0aF9hdXRoX2ZlZV9wYXllcgAAAAAEAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACdG8AAAAAABMAAAAAAAAACWZlZV9wYXllcgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
        "AAAAAAAAAHZBdXRvcml6YSBvIGNvbnRyYXRvIGEgdXNhciB0b2tlbnMgZG8gdXN1w6FyaW8gcGFyYSBwYWdhciBmZWVzCk5vdGE6IEVzdGEgZnVuw6fDo28gY2hhbWEgYXBwcm92ZSgpIG5vIGNvbnRyYXRvIGRlIHRva2VuAAAAAAAWYXV0aG9yaXplX2ZlZV9wYXltZW50cwAAAAAAAgAAAAAAAAAJZmVlX3BheWVyAAAAAAAAEwAAAAAAAAAObWF4X2ZlZV9hbW91bnQAAAAAAAsAAAABAAAD6QAAA+0AAAAAAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
        "AAAAAAAAADdSZW1vdmUgYXV0b3JpemHDp8OjbyBwYXJhIHBhZ2FtZW50byBhdXRvbcOhdGljbyBkZSBmZWVzAAAAABhyZXZva2VfZmVlX2F1dGhvcml6YXRpb24AAAABAAAAAAAAAAlmZWVfcGF5ZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAExQZXJtaXRlIGFvIG9yZ2FuaXphZG9yIGF1bWVudGFyIG8gYWxsb3dhbmNlIHBhcmEgY29icmlyIG1haXMgdGF4YXMgZG8gZXZlbnRvAAAAGGluY3JlYXNlX2V2ZW50X2FsbG93YW5jZQAAAAIAAAAAAAAACGV2ZW50X2lkAAAABgAAAAAAAAAUYWRkaXRpb25hbF9hbGxvd2FuY2UAAAALAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
        "AAAAAAAAAFBQZXJtaXRlIGFvIG9yZ2FuaXphZG9yIHNhY2FyIHRheGFzIGFjdW11bGFkYXMgKGFwZW5hcyBzZSBldmVudG8gZXN0aXZlciBpbmF0aXZvKQAAABN3aXRoZHJhd19ldmVudF9mZWVzAAAAAAEAAAAAAAAACGV2ZW50X2lkAAAABgAAAAEAAAPpAAAACwAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        get_config: this.txFromJSON<Result<ContractConfig>>,
        update_default_fee_rate: this.txFromJSON<Result<void>>,
        create_event: this.txFromJSON<Result<u64>>,
        create_event_with_allowance: this.txFromJSON<Result<u64>>,
        set_event_status: this.txFromJSON<Result<void>>,
        get_event: this.txFromJSON<Result<Event>>,
        get_event_by_name: this.txFromJSON<Result<Event>>,
        list_events: this.txFromJSON<Result<Array<Event>>>,
        get_event_fees: this.txFromJSON<i128>,
        get_fee_authorization: this.txFromJSON<i128>,
        register_wallet_for_event: this.txFromJSON<Result<void>>,
        unregister_wallet_from_event: this.txFromJSON<Result<void>>,
        is_wallet_registered: this.txFromJSON<boolean>,
        event_payment: this.txFromJSON<Result<void>>,
        payment_with_third_party_fee: this.txFromJSON<Result<void>>,
        payment_with_auth_fee_payer: this.txFromJSON<Result<void>>,
        authorize_fee_payments: this.txFromJSON<Result<void>>,
        revoke_fee_authorization: this.txFromJSON<null>,
        increase_event_allowance: this.txFromJSON<Result<void>>,
        withdraw_event_fees: this.txFromJSON<Result<i128>>
  }
}