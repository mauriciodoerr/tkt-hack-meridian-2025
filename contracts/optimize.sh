#!/bin/bash

# Script de otimização do WASM para Soroban
echo "🔧 Compilando contrato com otimizações..."

# Build em release mode
cargo build --target wasm32-unknown-unknown --release

echo "📦 Tamanho original do WASM:"
ls -lh target/wasm32-unknown-unknown/release/payment_with_fee.wasm

echo "🚀 Otimizando com wasm-opt..."

# Otimizar com wasm-opt (múltiplas passadas para máxima otimização)
wasm-opt -Oz --enable-bulk-memory \
    target/wasm32-unknown-unknown/release/payment_with_fee.wasm \
    -o target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm

echo "✨ Tamanho após otimização:"
ls -lh target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm

echo "📊 Comparação de tamanhos:"
echo "Original:   $(stat -f%z target/wasm32-unknown-unknown/release/payment_with_fee.wasm) bytes"
echo "Otimizado:  $(stat -f%z target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm) bytes"

# Calcular redução percentual
original_size=$(stat -f%z target/wasm32-unknown-unknown/release/payment_with_fee.wasm)
optimized_size=$(stat -f%z target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm)
reduction=$(echo "scale=2; ($original_size - $optimized_size) * 100 / $original_size" | bc)

echo "🎯 Redução: ${reduction}%"

echo "✅ WASM otimizado salvo em: target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm"